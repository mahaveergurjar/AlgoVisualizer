import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Search,
  Map,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Cpu,
  Calculator,
  Grid,
  Type,
} from "lucide-react";

// Main Visualizer Component
const WordSearchVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [boardInput, setBoardInput] = useState("ABCE,SFCS,ADEE");
  const [wordInput, setWordInput] = useState("SEE");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [found, setFound] = useState(false);

  const generateWordSearchHistory = useCallback((board, word) => {
    const newHistory = [];
    const rows = board.length;
    const cols = board[0].length;
    let stepCount = 0;
    let result = false;

    const addState = (props) => {
      newHistory.push({
        board: board.map(row => [...row]),
        visited: props.visited ? props.visited.map(row => [...row]) : Array(rows).fill().map(() => Array(cols).fill(false)),
        currentPath: [...(props.currentPath || [])],
        currentWord: props.currentWord || "",
        row: props.row,
        col: props.col,
        index: props.index || 0,
        explanation: props.explanation || "",
        step: stepCount++,
        found: props.found || false,
        ...props,
      });
    };

    const backtrack = (row, col, index, visited, path) => {
      // Base case: word found
      if (index === word.length) {
        result = true;
        addState({
          row,
          col,
          index,
          visited,
          currentPath: path,
          currentWord: word,
          explanation: `✓ Found the word "${word}"! Path: ${path.map(p => `(${p[0]},${p[1]})`).join(' → ')}`,
          found: true,
          line: 3,
        });
        return true;
      }

      // Check boundaries and visited
      if (row < 0 || row >= rows || col < 0 || col >= cols || visited[row][col]) {
        return false;
      }

      // Check character match
      if (board[row][col] !== word[index]) {
        addState({
          row,
          col,
          index,
          visited,
          currentPath: path,
          currentWord: word.substring(0, index),
          explanation: `Character mismatch: board[${row}][${col}] = '${board[row][col]}' ≠ '${word[index]}' (position ${index})`,
          line: 4,
          mismatch: true,
        });
        return false;
      }

      // Mark current cell and add to path
      visited[row][col] = true;
      const newPath = [...path, [row, col]];
      const newWord = word.substring(0, index + 1);

      addState({
        row,
        col,
        index,
        visited,
        currentPath: newPath,
        currentWord: newWord,
        explanation: `Match found: '${board[row][col]}' = '${word[index]}'. Exploring neighbors... Current: "${newWord}"`,
        line: 5,
        match: true,
      });

      // Explore neighbors (up, right, down, left)
      const directions = [
        [-1, 0, '↑'], // up
        [0, 1, '→'],  // right
        [1, 0, '↓'],  // down
        [0, -1, '←']  // left
      ];

      for (const [dr, dc, symbol] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        addState({
          row,
          col,
          index,
          visited,
          currentPath: newPath,
          currentWord: newWord,
          explanation: `Trying direction ${symbol} to (${newRow}, ${newCol})`,
          line: 6,
          exploring: [newRow, newCol],
        });

        if (backtrack(newRow, newCol, index + 1, visited, newPath)) {
          return true;
        }

        addState({
          row,
          col,
          index,
          visited,
          currentPath: newPath,
          currentWord: newWord,
          explanation: `Backtracking from (${newRow}, ${newCol}) - no valid path found`,
          line: 7,
          backtracking: true,
        });
      }

      // Backtrack: unmark current cell
      visited[row][col] = false;
      addState({
        row,
        col,
        index,
        visited,
        currentPath: path,
        currentWord: word.substring(0, index),
        explanation: `All directions exhausted from (${row}, ${col}). Backtracking...`,
        line: 8,
        backtracking: true,
      });

      return false;
    };

    // Initial state
    addState({
      explanation: `Starting word search for "${word}" in ${rows}×${cols} board`,
      line: 1,
    });

    // Try starting from every cell
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        addState({
          row: i,
          col: j,
          explanation: `Trying starting position (${i}, ${j}) - '${board[i][j]}'`,
          line: 2,
          starting: true,
        });

        const visited = Array(rows).fill().map(() => Array(cols).fill(false));
        if (backtrack(i, j, 0, visited, [])) {
          break;
        }

        if (result) break;
      }
      if (result) break;
    }

    if (!result) {
      addState({
        explanation: `✗ Word "${word}" not found in the board`,
        line: 9,
        finished: true,
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setFound(result);
  }, []);

  const loadBoard = () => {
    // Parse board input
    const rows = boardInput.split(',').map(row => row.trim().toUpperCase());
    if (rows.length === 0 || rows.some(row => row.length !== rows[0].length)) {
      alert("Invalid board. Please ensure all rows have the same length.");
      return;
    }

    const word = wordInput.trim().toUpperCase();
    if (!word) {
      alert("Please enter a word to search.");
      return;
    }

    // Limit board size for better visualization
    if (rows.length > 6 || rows[0].length > 6) {
      alert("For optimal visualization, please use boards up to 6x6.");
      return;
    }

    const board = rows.map(row => row.split(''));
    setIsLoaded(true);
    generateWordSearchHistory(board, word);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setFound(false);
    setIsPlaying(false);
  };

  const generateRandomBoard = () => {
    const rows = Math.floor(Math.random() * 3) + 3; // 3-5 rows
    const cols = Math.floor(Math.random() * 3) + 3; // 3-5 columns
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    const board = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => 
        letters[Math.floor(Math.random() * letters.length)]
      )
    );
    
    setBoardInput(board.map(row => row.join('')).join(','));
    
    // Generate a simple word that might exist
    const simpleWords = ['CAT', 'DOG', 'SEE', 'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU'];
    setWordInput(simpleWords[Math.floor(Math.random() * simpleWords.length)]);
    reset();
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadBoard();
    }
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Auto-play
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  const state = history[currentStep] || {};
  const { 
    board = [], 
    visited = [], 
    currentPath = [], 
    currentWord = "", 
    row, 
    col, 
    index = 0,
    explanation,
    line,
    found: stepFound,
    finished,
    mismatch,
    match,
    exploring,
    backtracking,
    starting
  } = state;

  const CodeLine = ({ lineNum, content, highlight }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-blue-500/20 border-l-4 border-blue-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={line === lineNum ? "text-blue-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const wordSearchCode = [
    { line: 1, content: "function exist(board, word) {" },
    { line: 2, content: "  for (let i = 0; i < rows; i++) {" },
    { line: 3, content: "    for (let j = 0; j < cols; j++) {" },
    { line: 4, content: "      if (backtrack(i, j, 0)) return true;" },
    { line: 5, content: "    }" },
    { line: 6, content: "  }" },
    { line: 7, content: "  return false;" },
    { line: 8, content: "}" },
    { line: 9, content: "" },
    { line: 10, content: "function backtrack(row, col, index) {" },
    { line: 11, content: "  if (index === word.length) return true;" },
    { line: 12, content: "  if (invalid(row, col) || visited[row][col]) return false;" },
    { line: 13, content: "  if (board[row][col] !== word[index]) return false;" },
    { line: 14, content: "" },
    { line: 15, content: "  visited[row][col] = true;" },
    { line: 16, content: "  const directions = [[-1,0],[0,1],[1,0],[0,-1]];" },
    { line: 17, content: "  for (let [dr, dc] of directions) {" },
    { line: 18, content: "    if (backtrack(row+dr, col+dc, index+1)) return true;" },
    { line: 19, content: "  }" },
    { line: 20, content: "  visited[row][col] = false;" },
    { line: 21, content: "  return false;" },
    { line: 22, content: "}" },
  ];

  const getCellColor = (r, c) => {
    if (currentPath.some(([pr, pc]) => pr === r && pc === c)) {
      return "bg-green-500/40 border-green-400 text-white";
    }
    if (visited[r]?.[c]) {
      return "bg-yellow-500/30 border-yellow-400 text-yellow-300";
    }
    if (r === row && c === col) {
      if (mismatch) return "bg-red-500/40 border-red-400 text-white";
      if (match) return "bg-blue-500/40 border-blue-400 text-white";
      return "bg-purple-500/40 border-purple-400 text-white";
    }
    if (exploring && exploring[0] === r && exploring[1] === c) {
      return "bg-cyan-500/30 border-cyan-400 text-cyan-300";
    }
    return "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50";
  };

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Search size={28} />
          Word Search Visualizer
          <span className="text-lg bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
            LeetCode #79
          </span>
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find if a word exists in a 2D grid using backtracking
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="board-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Board:
            </label>
            <input
              id="board-input"
              type="text"
              value={boardInput}
              onChange={(e) => setBoardInput(e.target.value)}
              onKeyDown={handleEnterKey}
              disabled={isLoaded}
              placeholder="e.g., ABCE,SFCS,ADEE"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="word-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Word:
            </label>
            <input
              id="word-input"
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyDown={handleEnterKey}
              disabled={isLoaded}
              placeholder="e.g., SEE"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadBoard}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Load & Search
              </button>
              <button
                onClick={generateRandomBoard}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Random Board
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  <SkipBack size={20} />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-green-500 hover:bg-green-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg transition-all duration-300"
                  >
                    <Pause size={20} />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Speed:</label>
                  <select
                    value={speed}
                    onChange={handleSpeedChange}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value={1500}>Slow</option>
                    <option value={1000}>Medium</option>
                    <option value={500}>Fast</option>
                    <option value={250}>Very Fast</option>
                  </select>
                </div>

                <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                  {currentStep + 1}/{history.length}
                </div>
              </div>
            </>
          )}
          
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Backtracking Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {wordSearchCode.map((line) => (
                    <CodeLine 
                      key={line.line} 
                      lineNum={line.line} 
                      content={line.content}
                    />
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Board Visualization */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Grid size={20} />
                Word Search Board
                {board.length > 0 && (
                  <span className="text-sm text-gray-400 ml-2">
                    ({board.length}×{board[0].length})
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Board Grid with Fixed Coordinate System */}
                <div className="relative">
                  {/* Column headers */}
                  <div className="flex gap-2 mb-2 justify-center">
                    <div className="w-6"></div> {/* Spacer for row headers */}
                    {board[0]?.map((_, c) => (
                      <div key={c} className="w-14 text-center text-xs text-gray-500 font-mono">
                        {c}
                      </div>
                    ))}
                  </div>
                  
                  {/* Board rows with row headers */}
                  <div className="flex flex-col gap-2">
                    {board.map((row, r) => (
                      <div key={r} className="flex gap-2 items-center">
                        {/* Row header */}
                        <div className="w-6 text-center text-xs text-gray-500 font-mono">
                          {r}
                        </div>
                        {/* Board cells */}
                        {row.map((cell, c) => (
                          <div
                            key={c}
                            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(r, c)} ${
                              currentPath.some(([pr, pc]) => pr === r && pc === c) ? 'scale-110 shadow-lg' : ''
                            }`}
                          >
                            {cell}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Word Progress */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 w-full max-w-md">
                  <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <Type size={16} />
                    Word Progress
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg">
                      <span className="text-green-400">{currentWord}</span>
                      <span className="text-gray-500">
                        {wordInput.substring(currentWord.length)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {currentWord.length}/{wordInput.length}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/25"
                      style={{ width: `${(currentWord.length / wordInput.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Path Visualization */}
                {currentPath.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-700/50 w-full">
                    <h4 className="text-sm text-blue-400 mb-2 flex items-center gap-2">
                      <Map size={16} />
                      Current Path
                    </h4>
                    <div className="font-mono text-sm text-blue-300">
                      {currentPath.map(([r, c], idx) => (
                        <span key={idx}>
                          ({r},{c}){idx < currentPath.length - 1 ? ' → ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Position: <span className="font-mono font-bold text-yellow-400">
                      {row != null && col != null ? `(${row}, ${col})` : "N/A"}
                    </span>
                  </p>
                  <p>
                    Character Index: <span className="font-mono font-bold text-yellow-400">{index}</span>
                  </p>
                  <p>
                    Path Length: <span className="font-mono font-bold text-yellow-400">{currentPath.length}</span>
                  </p>
                  <p>
                    Status: <span className={`font-mono font-bold ${
                      stepFound ? "text-green-400" : 
                      mismatch ? "text-red-400" : 
                      match ? "text-blue-400" :
                      backtracking ? "text-orange-400" :
                      "text-gray-400"
                    }`}>
                      {stepFound ? "Found!" : 
                       mismatch ? "Mismatch" : 
                       match ? "Exploring" :
                       backtracking ? "Backtracking" :
                       starting ? "Starting" :
                       "Searching"}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Step Explanation
                </h3>
                <div className="text-gray-300 text-sm h-20 overflow-y-auto scrollbar-thin">
                  {explanation || "Starting word search..."}
                </div>
              </div>
            </div>

            {/* Result Panel */}
            <div className={`backdrop-blur-sm p-6 rounded-xl shadow-xl border transition-all duration-500 ${
              found ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700/50" :
              finished ? "bg-gradient-to-br from-red-900/40 to-pink-900/40 border-red-700/50" :
              "bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-700/50"
            }`}>
              <h3 className="font-bold text-xl text-center mb-3 flex items-center justify-center gap-2">
                {found ? <CheckCircle className="w-6 h-6 text-green-400" /> : 
                 finished ? <span className="text-red-400">✗</span> : 
                 <Search className="w-6 h-6 text-blue-400" />}
                Search Result
              </h3>
              <div className={`font-mono text-2xl text-center font-bold ${
                found ? "text-green-400" : 
                finished ? "text-red-400" : 
                "text-blue-400"
              }`}>
                {found ? `Word "${wordInput}" FOUND!` : 
                 finished ? `Word "${wordInput}" NOT FOUND` : 
                 "Searching..."}
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(M × N × 4^L)</strong>
                    <p className="text-gray-400 text-sm">
                      Where M × N is the board size and L is the word length.
                      For each cell, we explore up to 4 directions at each step, up to L steps deep.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Worst Case</strong>
                    <p className="text-gray-400 text-sm">
                      When the word doesn't exist or is the last path explored.
                      The algorithm may need to check all possible paths from every starting position.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(L)</strong>
                    <p className="text-gray-400 text-sm">
                      The recursion depth is proportional to the word length L.
                      We use O(L) space for the recursion stack and current path.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Optimization</strong>
                    <p className="text-gray-400 text-sm">
                      The visited array is modified in-place and backtracked.
                      No additional O(M×N) space is needed beyond the input board.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-lg mb-4">
            Enter a board and word to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Board Format: ABC,DEF,GHI</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Max Size: 6×6</span>
            </div>
            <p>
              <strong>Example:</strong> Board: "ABCE,SFCS,ADEE", Word: "SEE" → Returns true
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchVisualizer;