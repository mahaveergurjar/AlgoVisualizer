import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_DIR = '/home/mahaveer/Clone/Strivers-A2Z-DSA-Sheet';
const OUTPUT_FILE = path.join(__dirname, '../src/progress.json');

// Helper to recursively list files
function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Directory ${dir} does not exist.`);
    return fileList;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.git' || file === 'node_modules') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else if (file.endsWith('.cpp')) {
      fileList.push({
        path: filePath,
        name: file,
        size: stat.size,
        mtime: stat.mtime,
        birthtime: stat.birthtime,
      });
    }
  }
  return fileList;
}

// Reconstruct dates from Git commits
function getGitCommitDates() {
  const fileToDates = {};
  try {
    console.log('Querying git log for accurate commit dates...');
    const logOutput = execSync(
      'git log --name-only --pretty="format:COMMIT:%aI" --no-merges',
      { cwd: SHEET_DIR, maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' }
    );
    
    const lines = logOutput.split('\n');
    let currentCommitDate = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('COMMIT:')) {
        currentCommitDate = new Date(trimmed.substring(7));
      } else if (currentCommitDate) {
        // It's a file path
        const normalized = trimmed.replace(/\\/g, '/');
        if (!fileToDates[normalized]) {
          fileToDates[normalized] = [];
        }
        fileToDates[normalized].push(currentCommitDate);
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve Git history. Using file stats instead.', error.message);
  }
  return fileToDates;
}

function computeStreak(dates) {
  if (dates.length === 0) return { current: 0, max: 0, history: [] };

  // Format dates as YYYY-MM-DD and remove duplicates
  const formattedDates = [...new Set(dates.map(d => d.toISOString().split('T')[0]))];
  formattedDates.sort(); // Oldest to newest

  let maxStreak = 0;
  let currentStreak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let tempStreak = 0;
  for (let i = 0; i < formattedDates.length; i++) {
    const currentDateStr = formattedDates[i];
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(formattedDates[i - 1]);
      const currDate = new Date(currentDateStr);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        tempStreak = 1;
      }
    }
  }
  if (tempStreak > maxStreak) maxStreak = tempStreak;

  // Calculate current streak
  const hasCodedToday = formattedDates.includes(todayStr);
  const hasCodedYesterday = formattedDates.includes(yesterdayStr);

  if (hasCodedToday || hasCodedYesterday) {
    currentStreak = 1;
    for (let i = formattedDates.length - 1; i > 0; i--) {
      const curr = new Date(formattedDates[i]);
      const prev = new Date(formattedDates[i - 1]);
      const diffTime = Math.abs(curr - prev);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
  } else {
    currentStreak = 0;
  }

  return {
    current: currentStreak,
    max: Math.max(maxStreak, currentStreak),
    history: formattedDates,
  };
}

function cleanProblemName(filename) {
  // e.g. "01.Largest_element_in_array.cpp" -> "Largest Element In Array"
  let cleanName = filename.replace(/\.cpp$/, '');
  // Remove starting numbers and dots
  cleanName = cleanName.replace(/^\d+\./, '');
  // Replace underscores and hyphens with spaces
  cleanName = cleanName.replace(/[_-]/g, ' ');
  // Title case
  return cleanName
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function scan() {
  console.log(`Scanning Strivers sheet at: ${SHEET_DIR}`);
  const cppFiles = getFilesRecursively(SHEET_DIR);
  const gitDates = getGitCommitDates();
  console.log(`Found ${cppFiles.length} C++ files.`);

  const categoryStats = {};
  const solvedProblems = [];
  const dates = [];

  cppFiles.forEach(file => {
    const relative = path.relative(SHEET_DIR, file.path);
    const normalizedRelative = relative.replace(/\\/g, '/');
    const parts = relative.split(path.sep);
    
    const rawCategory = parts[0];
    const categoryName = rawCategory.replace(/^\d+\.\s*/, '');

    // Get earliest commit date for when this file was added
    let solvedAt = file.mtime; // default fallback
    const commits = gitDates[normalizedRelative];
    if (commits && commits.length > 0) {
      // The earliest date in commits is when it was introduced
      solvedAt = new Date(Math.min(...commits.map(d => d.getTime())));
    }
    
    dates.push(solvedAt);
    const problemName = cleanProblemName(file.name);
    
    solvedProblems.push({
      name: problemName,
      filename: file.name,
      category: categoryName,
      rawCategory,
      path: normalizedRelative,
      solvedAt,
      sizeBytes: file.size,
    });

    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = {
        total: 0,
        rawCategory,
      };
    }
    categoryStats[categoryName].total++;
  });

  const streak = computeStreak(dates);
  const totalSolved = solvedProblems.length;
  
  // XP calculation: 100 XP per solved problem + 50 XP per day active in streak
  const xpFromSolved = totalSolved * 100;
  const xpFromStreak = streak.current * 50;
  const totalXP = xpFromSolved + xpFromStreak;
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const xpForNextLevel = 500;
  const xpProgress = totalXP % 500;

  // Sort solved problems by date (newest first)
  solvedProblems.sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));

  const progressData = {
    lastUpdated: new Date().toISOString(),
    totalSolved,
    xp: totalXP,
    level: currentLevel,
    xpProgress,
    xpForNextLevel,
    streak,
    categoryStats,
    solvedProblems: solvedProblems, // Keep all solved problems for comprehensive UI rendering
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(progressData, null, 2));
  console.log(`Progress successfully written to ${OUTPUT_FILE}`);
}

scan();
