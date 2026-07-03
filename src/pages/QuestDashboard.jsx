import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Trophy,
  Zap,
  Flame,
  Award,
  Calendar,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Activity,
  Code2,
  AlertCircle,
  Clock
} from "lucide-react";
import progressData from "../progress.json";

// Strivers A2Z sheet total problem count for each section
const STRIVERS_TOTALS = {
  "Arrays": 40,
  "Binary Search": 32,
  "Strings": 15,
  "Linked List": 30,
  "Recursion": 22,
  "Bit Manipulation": 18,
  "Stack and Queues": 28,
  "Sliding Window": 12,
  "Heaps": 18,
  "Greedy Approach": 14,
  "Binary Trees": 38,
  "Binary Search Trees": 16,
  "Graphs": 45,
  "Dynamic Programming": 55,
  "Tries": 7,
  "Strings (Hard)": 6
};

// Quiz Database
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the worst-case time complexity of searching in a Hash Table?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct: 2,
    explanation: "While average search time is O(1), the worst-case is O(N) when all keys hash to the same bucket (severe collision/chaining)."
  },
  {
    id: 2,
    question: "Which data structure is typically used to implement Breadth-First Search (BFS) on a graph?",
    options: ["Stack", "Queue", "Priority Queue", "Min-Heap"],
    correct: 1,
    explanation: "BFS explores neighbors level-by-level, which follows First-In-First-Out (FIFO) logic, implemented using a Queue."
  },
  {
    id: 3,
    question: "What is the space complexity of an in-place iterative Binary Search?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct: 0,
    explanation: "Iterative binary search only uses a few pointers (low, high, mid) and does not call functions recursively, resulting in O(1) auxiliary space."
  },
  {
    id: 4,
    question: "Which algorithm design technique does Floyd-Warshall's All-Pairs Shortest Path use?",
    options: ["Greedy Approach", "Divide and Conquer", "Dynamic Programming", "Backtracking"],
    correct: 2,
    explanation: "Floyd-Warshall builds shortest paths incrementally using subproblems, storing results in a 2D matrix (Dynamic Programming)."
  },
  {
    id: 5,
    question: "What is the minimum number of queues required to implement a Stack?",
    options: ["1", "2", "3", "None (Stacks cannot be implemented with queues)"],
    correct: 1,
    explanation: "You need 2 queues to implement a stack (either by making push operation costly or pop operation costly)."
  }
];

export default function QuestDashboard({ navigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Local state for quizzes
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(() => {
    return parseInt(localStorage.getItem("dsa_quiz_score") || "0", 10);
  });
  const [completedQuizzes, setCompletedQuizzes] = useState(() => {
    return JSON.parse(localStorage.getItem("dsa_completed_quizzes") || "[]");
  });

  // Calculate dynamic stats
  const { totalSolved, xp, level, xpProgress, xpForNextLevel, streak, categoryStats, solvedProblems } = progressData;

  // 1. Generate Achievements dynamically
  const achievements = useMemo(() => {
    const list = [
      {
        id: "first_solve",
        title: "Initiate Knight",
        description: "Solve your first DSA problem",
        unlocked: totalSolved >= 1,
        icon: Zap,
        color: "text-amber-400 bg-amber-400/10 border-amber-400/30"
      },
      {
        id: "solve_100",
        title: "DSA Gladiator",
        description: "Solve 100+ C++ problems in Strivers sheet",
        unlocked: totalSolved >= 100,
        icon: Trophy,
        color: "text-blue-400 bg-blue-400/10 border-blue-400/30"
      },
      {
        id: "solve_300",
        title: "Sheet Conqueror",
        description: "Solve 300+ C++ problems in Strivers sheet",
        unlocked: totalSolved >= 300,
        icon: Award,
        color: "text-purple-400 bg-purple-400/10 border-purple-400/30"
      },
      {
        id: "bs_expert",
        title: "Binary Scout",
        description: "Solve 20+ Binary Search problems",
        unlocked: (categoryStats["Binary Search"]?.total || 0) >= 20,
        icon: Code2,
        color: "text-teal-400 bg-teal-400/10 border-teal-400/30"
      },
      {
        id: "dp_master",
        title: "DP Architect",
        description: "Solve 35+ Dynamic Programming problems",
        unlocked: (categoryStats["Dynamic Programming"]?.total || 0) >= 35,
        icon: Activity,
        color: "text-pink-400 bg-pink-400/10 border-pink-400/30"
      },
      {
        id: "graph_lord",
        title: "Graph Commander",
        description: "Solve 30+ Graph problems",
        unlocked: (categoryStats["Graphs"]?.total || 0) >= 30,
        icon: TrendingUp,
        color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30"
      },
      {
        id: "streak_5",
        title: "Consistent Builder",
        description: "Achieve a maximum streak of 5+ days",
        unlocked: streak.max >= 5,
        icon: Flame,
        color: "text-orange-400 bg-orange-400/10 border-orange-400/30"
      },
      {
        id: "level_50",
        title: "Ascended Scholar",
        description: "Reach Level 50",
        unlocked: level >= 50,
        icon: Trophy,
        color: "text-rose-400 bg-rose-400/10 border-rose-400/30"
      }
    ];
    return list;
  }, [totalSolved, categoryStats, streak.max, level]);

  // 2. Generate Heatmap Grid data (last 20 weeks)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Get start date (20 weeks ago, aligned to start of week)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 140); 
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay); // Align to Sunday

    // Reconstruct dates map for quick lookup
    const datesMap = {};
    solvedProblems.forEach(p => {
      const dateStr = new Date(p.solvedAt).toISOString().split('T')[0];
      datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;
    });

    const tempDate = new Date(startDate);
    while (tempDate <= today) {
      const dateStr = tempDate.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        count: datesMap[dateStr] || 0,
        dayName: tempDate.toLocaleDateString('en-US', { weekday: 'short' }),
        monthName: tempDate.toLocaleDateString('en-US', { month: 'short' })
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return data;
  }, [solvedProblems]);

  // Handler for Quizzes
  const handleAnswerSubmit = (optionIdx) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    
    const question = QUIZ_QUESTIONS[currentQuizIndex];
    if (optionIdx === question.correct) {
      // Add XP & score
      setQuizScore(prev => {
        const newScore = prev + 50;
        localStorage.setItem("dsa_quiz_score", newScore);
        return newScore;
      });
      // Save completed state
      const updatedCompletions = [...completedQuizzes, question.id];
      setCompletedQuizzes(updatedCompletions);
      localStorage.setItem("dsa_completed_quizzes", JSON.stringify(updatedCompletions));
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  const currentQuiz = QUIZ_QUESTIONS[currentQuizIndex];
  const isQuizCompletedBefore = completedQuizzes.includes(currentQuiz.id);

  // Group heatmap into columns of 7 days (Sunday - Saturday)
  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  }, [heatmapData]);

  // Months label calculation
  const heatmapMonthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = "";
    heatmapWeeks.forEach((week, weekIdx) => {
      const firstDay = week[0];
      if (firstDay && firstDay.monthName !== lastMonth) {
        labels.push({ name: firstDay.monthName, index: weekIdx });
        lastMonth = firstDay.monthName;
      }
    });
    return labels;
  }, [heatmapWeeks]);

  return (
    <div className="container mx-auto p-4 sm:p-8 animate-fade-in-up max-w-7xl relative z-10">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("home")}
            className="p-2 rounded-full hover:bg-gray-950 border border-gray-800 transition text-gray-400 hover:text-white"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              DSA Odyssey Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Your real-time Strivers DSA sheet progression companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs text-gray-400">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Last Synced: {new Date(progressData.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </header>

      {/* CORE STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* LEVEL CARD */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gray-900/90 border border-violet-500/20 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-violet-500/40 transition duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Current Level</p>
              <h2 className="text-5xl font-black text-white mt-1">Lvl {level}</h2>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-2xl border border-violet-500/30">
              <Trophy className="h-6 w-6 text-violet-400" />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{xp.toLocaleString()} XP Total</span>
              <span>{xpProgress} / {xpForNextLevel} XP to Lvl {level + 1}</span>
            </div>
            <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(xpProgress / xpForNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* PROGRESS CARD */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gray-900/90 border border-pink-500/20 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-pink-500/40 transition duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-8 -mt-8" />

          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total Solved</p>
              <h2 className="text-5xl font-black text-white mt-1">{totalSolved}</h2>
            </div>
            <div className="p-3 bg-pink-500/20 rounded-2xl border border-pink-500/30">
              <CheckCircle className="h-6 w-6 text-pink-400" />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Sheet Progress</span>
              <span>{Math.round((totalSolved / 390) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (totalSolved / 390) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* STREAK CARD */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gray-900/90 border border-orange-500/20 backdrop-blur-xl shadow-2xl flex flex-col justify-between group hover:border-orange-500/40 transition duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-8 -mt-8" />

          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Daily Streak</p>
              <h2 className="text-5xl font-black text-white mt-1">{streak.current} <span className="text-sm font-bold text-orange-400">days</span></h2>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-2xl border border-orange-500/30">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-400">
            {streak.current > 0 ? (
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <Flame className="w-4 h-4" /> Keep it going! Solve a C++ file today.
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-400/80" /> Max streak reached: {streak.max} days. Start coding today!
              </span>
            )}
          </div>
        </div>

      </div>

      {/* TABS MENU */}
      <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === "overview" ? "text-violet-400 font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Overview & Heatmap
          {activeTab === "overview" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === "progress" ? "text-violet-400 font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Topic Roadmaps ({Object.keys(categoryStats).length})
          {activeTab === "progress" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === "quiz" ? "text-violet-400 font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Concept Arena (+{quizScore} XP)
          {activeTab === "quiz" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`pb-3 font-semibold text-sm transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === "achievements" ? "text-violet-400 font-bold" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Unlocked Badges ({achievements.filter(a => a.unlocked).length})
          {activeTab === "achievements" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          
          {/* CONTRIB HEATMAP */}
          <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              DSA Solves Timeline (Last 20 Weeks)
            </h3>
            
            <div className="overflow-x-auto py-2">
              <div className="min-w-[700px] flex flex-col">
                {/* Month headers */}
                <div className="flex text-[10px] text-gray-500 mb-2 pl-8 h-4 relative">
                  {heatmapMonthLabels.map((m, i) => (
                    <div 
                      key={i} 
                      className="absolute" 
                      style={{ left: `${(m.index * 13) + 32}px` }}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  {/* Day labels */}
                  <div className="flex flex-col text-[10px] text-gray-500 justify-between pr-2 h-[94px] w-6 leading-none pt-1">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                  </div>

                  {/* Heatmap cells */}
                  <div className="grid grid-flow-col auto-cols-[11px] gap-[2px] h-[94px]">
                    {heatmapWeeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="grid grid-rows-7 gap-[2px]">
                        {week.map((day, dayIdx) => {
                          let color = "bg-gray-950 border border-gray-900/50";
                          if (day.count > 0) {
                            if (day.count === 1) color = "bg-violet-900/70 border border-violet-800/20";
                            else if (day.count <= 3) color = "bg-violet-700/80 border border-violet-600/30";
                            else if (day.count <= 6) color = "bg-violet-500 border border-violet-400/40";
                            else color = "bg-pink-500 border border-pink-400/50 shadow-md shadow-pink-500/20";
                          }
                          return (
                            <div
                              key={dayIdx}
                              className={`w-[11px] h-[11px] rounded-[2px] transition-colors duration-300 group/cell relative ${color}`}
                            >
                              {/* Cell Tooltip */}
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:flex flex-col items-center z-50">
                                <div className="bg-gray-950 border border-gray-800 text-[10px] text-gray-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                                  <strong className="text-white">{day.count} solved</strong> on {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="w-2 h-2 bg-gray-950 border-r border-b border-gray-800 transform rotate-45 -mt-1" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex justify-between items-center text-xs text-gray-500 mt-4 border-t border-gray-800/50 pt-4">
              <span>Color intensity reflects daily C++ solution count</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-gray-950 border border-gray-800" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-violet-900/70" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-violet-700/80" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-violet-500" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-pink-500" />
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MOTIVATIONAL BOX */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent border border-violet-500/15 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Consistency Strategy
                </h4>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                  You've already solved a massive <strong className="text-white">{totalSolved} problems</strong>! That shows you have incredible capability. The reason it feels boring is that terminal outputs don't give immediate closure or gamified rewards.
                </p>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  Try committing just <strong>1 simple C++ problem</strong> every day. Watch this heatmap light up and watch your Level rise! Pick a topic you enjoy, like Binary Search or Linked Lists, and work on it.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("progress")}
                className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-600/30 transition flex justify-center items-center gap-1 cursor-pointer"
              >
                Explore Topics Roadmaps <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* RECENT SOLVES LIST */}
            <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-xl flex flex-col">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-400" />
                Recent Quest Successes
              </h3>
              
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 flex-1">
                {solvedProblems.slice(0, 5).map((problem, i) => (
                  <div 
                    key={i} 
                    className="flex justify-between items-center p-3 rounded-xl bg-gray-950/60 border border-gray-900 hover:border-gray-800 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-200 truncate">{problem.name}</p>
                      <span className="text-xs text-gray-500 font-mono">{problem.category}</span>
                    </div>
                    <div className="text-right whitespace-nowrap pl-4">
                      <span className="text-[10px] text-gray-500 block">
                        {new Date(problem.solvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        +100 XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "progress" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(STRIVERS_TOTALS).map(category => {
            const solved = categoryStats[category]?.total || 0;
            const total = STRIVERS_TOTALS[category];
            const pct = Math.min(100, Math.round((solved / total) * 100));
            
            // Choose colors based on completion
            let barColor = "from-blue-500 to-indigo-500";
            let textColor = "text-blue-400";
            let bgGlow = "hover:border-blue-500/30";
            
            if (pct >= 100) {
              barColor = "from-emerald-500 to-teal-500";
              textColor = "text-emerald-400";
              bgGlow = "hover:border-emerald-500/30";
            } else if (pct >= 50) {
              barColor = "from-purple-500 to-pink-500";
              textColor = "text-purple-400";
              bgGlow = "hover:border-purple-500/30";
            } else if (pct > 0) {
              barColor = "from-orange-500 to-amber-500";
              textColor = "text-orange-400";
              bgGlow = "hover:border-orange-500/30";
            }

            return (
              <div 
                key={category} 
                className={`relative overflow-hidden p-6 rounded-3xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-xl transition duration-300 hover:scale-[1.02] ${bgGlow}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-gray-200 truncate">{category}</h4>
                    <span className="text-xs text-gray-500 font-mono">Strivers Section</span>
                  </div>
                  <span className={`text-2xl font-black ${textColor}`}>{pct}%</span>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{solved} / {total} Solved</span>
                </div>

                <div className="w-full bg-gray-950 h-3 rounded-full overflow-hidden border border-gray-900 mb-4">
                  <div 
                    className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Direct Visualizer link mapping if available */}
                {["Arrays", "Binary Search", "Sorting", "Searching", "Graphs", "LinkedList", "Stack", "Queue", "Recursion", "Dynamic Programming"].includes(category) ? (
                  <button
                    onClick={() => {
                      // Map categories cleanly to visualizer routes
                      const routeMap = {
                        "Arrays": "Arrays",
                        "Binary Search": "BinarySearch",
                        "Sorting": "Sorting",
                        "Searching": "Searching",
                        "Graphs": "Graphs",
                        "Linked List": "LinkedList",
                        "Stack and Queues": "Stack",
                        "Recursion": "Recursion",
                        "Dynamic Programming": "DynamicProgramming"
                      };
                      navigate(routeMap[category] || "home");
                    }}
                    className="w-full py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 hover:text-white transition flex justify-center items-center gap-1 cursor-pointer"
                  >
                    View Visualizers <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="w-full py-2 bg-gray-950/20 border border-dashed border-gray-900 text-center rounded-xl text-[10px] text-gray-600">
                    No visualizers for this theory section
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-xl">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-violet-400" />
              DSA Concept Arena
            </h3>
            <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs font-bold text-violet-400">
              Quiz Points: +{quizScore} XP
            </div>
          </div>

          {/* QUESTION BOX */}
          <div className="mb-6">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
              Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <h4 className="text-lg font-semibold text-gray-200 mt-1 leading-relaxed">
              {currentQuiz.question}
            </h4>
          </div>

          {/* OPTIONS */}
          <div className="space-y-3 mb-6">
            {currentQuiz.options.map((option, idx) => {
              let optionStyle = "bg-gray-950/60 border-gray-900 hover:border-gray-700 text-gray-300";
              
              if (isAnswered) {
                if (idx === currentQuiz.correct) {
                  optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
                } else if (selectedOption === idx) {
                  optionStyle = "bg-rose-500/10 border-rose-500 text-rose-400";
                } else {
                  optionStyle = "bg-gray-950/20 border-gray-950 text-gray-600 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSubmit(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-2xl border transition font-medium text-sm flex justify-between items-center cursor-pointer ${optionStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && idx === currentQuiz.correct && (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* EXPLANATION / NEXT ACTION */}
          {isAnswered && (
            <div className="mt-6 border-t border-gray-800 pt-6 animate-fade-in-up">
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 mb-6">
                <h5 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">Explanation</h5>
                <p className="text-gray-400 text-sm leading-relaxed">{currentQuiz.explanation}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  {selectedOption === currentQuiz.correct ? (
                    <span className="text-emerald-400 font-bold text-sm">
                      Correct! {isQuizCompletedBefore ? "" : "+50 XP Earned!"}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-sm">Incorrect answer. Try again!</span>
                  )}
                </div>
                
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Next Question
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((a) => {
            const Icon = a.icon;
            
            return (
              <div 
                key={a.id}
                className={`p-6 rounded-3xl border transition duration-300 flex flex-col items-center text-center relative ${
                  a.unlocked 
                    ? "bg-gray-900/60 border-gray-800 hover:border-gray-700" 
                    : "bg-gray-950/20 border-dashed border-gray-900 opacity-40 select-none"
                }`}
              >
                <div className={`p-4 rounded-full border mb-4 ${
                  a.unlocked 
                    ? a.color 
                    : "text-gray-700 bg-gray-950 border-gray-900"
                }`}>
                  <Icon className="w-8 h-8" />
                </div>

                <h4 className="text-base font-bold text-gray-200 mb-1">{a.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>

                {a.unlocked && (
                  <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
                    UNLOCKED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
