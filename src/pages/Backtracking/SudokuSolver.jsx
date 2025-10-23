import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Puzzle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Cpu,
  Calculator,
  Grid,
  Hash,
} from "lucide-react";

// --- Default Puzzles ---
const puzzles = {
  easy: "53..7....,6..195...,.98....6.,8...6...3,4..8.3..1,7...2...6,.6....28.,...419..5,....8..79",
  medium: "..9748...,7........,.2.1.9...,..7...24.,.64.1.59.,.98...3..,...8.3.2.,........6,...2759..",
  hard: "8........,..36.....,.7..9.2..,.5...7...,....457..,...1...3.,..1....68,..85...1.,.9....4..",
};

// --- Main Visualizer Component ---
const SudokuSolver = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [editableGrid, setEditableGrid] = useState(() => puzzles.medium.split(',').map(row => row.split('').map(char => (char === '.' ? 0 : parseInt(char, 10)))));
  const [initialBoard, setInitialBoard] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // Faster default for Sudoku
  const [isSolved, setIsSolved] = useState(false);

  // --- Algorithm Logic ---

  const generateSudokuHistory = useCallback((initialGrid) => {
    const newHistory = [];
    let stepCount = 0;
    let solutionFound = false;

    const addState = (props) => {
      newHistory.push({
        board: props.board.map(row => [...row]),
        row: props.row,
        col: props.col,
        num: props.num,
        explanation: props.explanation || "",
        step: stepCount++,
        ...props,
      });
    };

    const isValid = (board, row, col, num) => {
      // Check row
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      // Check column
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
      // Check 3x3 subgrid
      const startRow = row - (row % 3);
      const startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    const solve = (board) => {
      addState({ board, explanation: "Searching for the next empty cell...", line: 2 });
      let emptyCell = null;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (board[i][j] === 0) {
            emptyCell = { row: i, col: j };
            break;
          }
        }
        if (emptyCell) break;
      }

      if (!emptyCell) {
        addState({ board, explanation: "✓ No empty cells left. Puzzle solved!", line: 3, isSolved: true });
        solutionFound = true;
        return true;
      }

      const { row, col } = emptyCell;
      addState({ board, row, col, explanation: `Found empty cell at (${row}, ${col}).`, line: 4 });

      for (let num = 1; num <= 9; num++) {
        addState({ board, row, col, num, explanation: `Trying number ${num} at (${row}, ${col})...`, line: 5, isTrying: true });

        if (isValid(board, row, col, num)) {
          addState({ board, row, col, num, explanation: `Number ${num} is valid. Placing it.`, line: 6, isValid: true });
          board[row][col] = num;

          if (solve(board)) {
            return true;
          }

          addState({ board, row, col, num, explanation: `Backtracking from (${row}, ${col}). Resetting cell.`, line: 8, isBacktracking: true });
          board[row][col] = 0;
        } else {
          addState({ board, row, col, num, explanation: `Number ${num} is not valid (conflict).`, line: 5, isConflict: true });
        }
      }

      addState({ board, row, col, explanation: `No valid number found for (${row}, ${col}). Backtracking...`, line: 9 });
      return false;
    };

    const grid = initialGrid.map(row => [...row]);
    addState({ board: grid, explanation: "Starting Sudoku solver...", line: 1 });
    solve(grid);

    if (!solutionFound) {
      addState({ board: grid, explanation: "✗ Could not solve the puzzle. No solution exists.", line: 10, isUnsolvable: true });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsSolved(solutionFound);
  }, []);

  // --- UI Handlers ---

  const loadBoard = () => {
    setInitialBoard(editableGrid.map(row => [...row]));
    setIsLoaded(true);
    generateSudokuHistory(editableGrid);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsSolved(false);
    setIsPlaying(false);
  };

  const handlePreset = (level) => {
    const newGrid = puzzles[level].split(',').map(row =>
      row.split('').map(char => (char === '.' ? 0 : parseInt(char, 10)))
    );
    setEditableGrid(newGrid);
    reset();
  };

  const handleSpeedChange = (e) => setSpeed(Number(e.target.value));
  const playAnimation = () => setIsPlaying(true);
  const pauseAnimation = () => setIsPlaying(false);
  const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

  const handleGridInputChange = (e, r, c) => {
    const value = e.target.value;
    if (/^[1-9]$/.test(value) || value === "") {
      const newGrid = editableGrid.map(row => [...row]);
      newGrid[r][c] = value === "" ? 0 : parseInt(value, 10);
      setEditableGrid(newGrid);
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(stepForward, speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  // --- Render Logic ---

  const state = history[currentStep] || {};
  const { board = initialBoard, row, col, num, line, explanation, isTrying, isConflict, isBacktracking, isValid: numIsValid, isSolved: stepIsSolved, isUnsolvable } = state;

  const getCellClass = (r, c) => {
    let classes = "transition-all duration-300 transform ";
    if (initialBoard[r]?.[c] !== 0) {
      classes += "text-cyan-300 font-bold ";
    } else {
      classes += "text-gray-300 ";
    }

    if (r === row && c === col) {
      classes += "scale-110 z-10 shadow-2xl ";
      if (isTrying) classes += "bg-purple-500/40 border-purple-400";
      else if (isConflict) classes += "bg-red-500/40 border-red-400";
      else if (isBacktracking) classes += "bg-orange-500/40 border-orange-400";
      else if (numIsValid) classes += "bg-green-500/40 border-green-400";
      else classes += "bg-blue-500/30 border-blue-400";
    } else {
      classes += "bg-gray-800/60 border-gray-700";
    }
    return classes;
  };

  const sudokuCode = [
    { line: 1, content: "function solveSudoku(board) {" },
    { line: 2, content: "  find next empty cell (row, col);" },
    { line: 3, content: "  if (!empty) return true; // Solved" },
    { line: 4, content: "" },
    { line: 5, content: "  for (num from 1 to 9) {" },
    { line: 6, content: "    if (isValid(board, row, col, num)) {" },
    { line: 7, content: "      board[row][col] = num;" },
    { line: 8, content: "      if (solveSudoku(board)) return true;" },
    { line: 9, content: "      board[row][col] = 0; // Backtrack" },
    { line: 10, content: "    }" },
    { line: 11, content: "  }" },
    { line: 12, content: "  return false; // Trigger backtrack" },
    { line: 13, content: "}" },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto focus:outline-none">
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Puzzle size={28} />
          Sudoku Solver
          <span className="text-lg bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
            LeetCode #37
          </span>
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualize solving a 9x9 Sudoku puzzle using backtracking.
        </p>
      </header>

      {/* Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {!isLoaded ? (
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            <div className="flex-grow flex flex-col items-center">
              <div className="grid grid-cols-9 gap-1 bg-gray-900/50 p-1 rounded-md shadow-inner">
                {Array.from({ length: 81 }).map((_, i) => {
                  const r = Math.floor(i / 9);
                  const c = i % 9;
                  const value = editableGrid[r]?.[c];
                  const borderRight = (c === 2 || c === 5) ? "border-r-2 border-gray-600" : "";
                  const borderBottom = (r === 2 || r === 5) ? "border-b-2 border-gray-600" : "";
                  return (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={value !== 0 ? value : ""}
                      onChange={(e) => handleGridInputChange(e, r, c)}
                      className={`w-10 h-10 text-center text-xl font-mono rounded-sm bg-gray-800 text-cyan-300 border border-gray-700 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${borderRight} ${borderBottom}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => handlePreset('easy')} className="px-3 py-2 bg-green-600/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-600/40 transition text-sm">Easy</button>
                <button onClick={() => handlePreset('medium')} className="px-3 py-2 bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 rounded-lg hover:bg-yellow-600/40 transition text-sm">Medium</button>
                <button onClick={() => handlePreset('hard')} className="px-3 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/40 transition text-sm">Hard</button>
              </div>
              <button onClick={() => loadBoard()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg w-full">
                Solve Puzzle
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50"><SkipBack size={20} /></button>
              {!isPlaying ? (
                <button onClick={playAnimation} disabled={currentStep >= history.length - 1} className="bg-green-500 hover:bg-green-600 p-3 rounded-lg disabled:opacity-50"><Play size={20} /></button>
              ) : (
                <button onClick={pauseAnimation} className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg"><Pause size={20} /></button>
              )}
              <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50"><SkipForward size={20} /></button>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-gray-400 text-sm">Speed:</label>
              <select value={speed} onChange={handleSpeedChange} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
                <option value={2000}>Slow</option>
                <option value={1200}>Medium</option>
                <option value={700}>Fast</option>
                <option value={10}>Instant</option>
              </select>
              <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                {currentStep + 1}/{history.length}
              </div>
            </div>
            <button onClick={reset} className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
              <RotateCcw size={16} /> Reset
            </button>
          </>
        )}
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sudoku Board and Status */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl flex flex-col items-center justify-center">
            <h3 className="font-bold text-xl text-gray-300 mb-6 flex items-center gap-2">
              <Grid size={20} /> Sudoku Board
            </h3>
            <div className="grid grid-cols-9 gap-1 bg-gray-900/50 p-2 rounded-lg shadow-inner">
              {Array.from({ length: 81 }).map((_, i) => {
                const r = Math.floor(i / 9);
                const c = i % 9;
                const value = board[r]?.[c];
                const borderRight = (c === 2 || c === 5) ? "border-r-2 border-gray-600" : "";
                const borderBottom = (r === 2 || r === 5) ? "border-b-2 border-gray-600" : "";
                return (
                  <div
                    key={i}
                    className={`w-12 h-12 flex items-center justify-center text-2xl font-mono rounded-md border ${borderRight} ${borderBottom} ${getCellClass(r, c)}`}
                  >
                    {value !== 0 ? value : ""}
                  </div>
                );
              })}
            </div>
            
            {/* Status Panel */}
            <div className={`mt-6 w-full text-center p-4 rounded-lg border transition-all duration-500 ${
              stepIsSolved ? "bg-green-500/20 border-green-500/50 text-green-300" :
              isUnsolvable ? "bg-red-500/20 border-red-500/50 text-red-300" :
              "bg-gray-700/20 border-gray-700/50 text-gray-300"
            }`}>
              <h4 className="font-bold text-lg flex items-center justify-center gap-2">
                {stepIsSolved ? <CheckCircle/> : isUnsolvable ? <XCircle/> : <Zap/>}
                Status
              </h4>
              <p className="text-lg">{explanation || "Select a puzzle and click Solve."}</p>
            </div>
          </div>

          {/* Code and Complexity */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
                <Code size={20} /> Backtracking Code
              </h3>
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {sudokuCode.map(({ line: lineNum, content }) => (
                    <div key={lineNum} className={`block rounded-md transition-all duration-300 ${line === lineNum ? "bg-blue-500/20 border-l-4 border-blue-500" : ""}`}>
                      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">{lineNum}</span>
                      <span className={line === lineNum ? "text-blue-300 font-semibold" : "text-gray-300"}>{content}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
                <Clock size={20} /> Complexity Analysis
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2 mb-2"><Zap size={16} /> Time Complexity</h4>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(9^(N*N))</strong>
                    <p className="text-gray-400">In the worst case, we try to fill N*N empty cells with 9 possibilities each. However, constraints prune the search space significantly, making the practical performance much better.</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2 mb-2"><Cpu size={16} /> Space Complexity</h4>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(N*N)</strong>
                    <p className="text-gray-400">The space is dominated by the board itself (O(N*N)) and the recursion stack depth, which is at most N*N (for 81 empty cells).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-400 text-lg mb-4">
            Select a difficulty and click "Solve Puzzle" to begin.
          </div>
          <div className="text-gray-500 text-sm max-w-2xl mx-auto">
            <p>The visualizer will step through the backtracking algorithm, showing how it tries numbers, handles conflicts, and backtracks to find the solution.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuSolver;
