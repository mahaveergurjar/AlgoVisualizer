import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const puzzles = {
  easy: "53..7....,6..195...,.98....6.,8...6...3,4..8.3..1,7...2...6,.6....28.,...419..5,....8..79",
  medium: "..9748...,7........,.2.1.9...,..7...24.,.64.1.59.,.98...3..,...8.3.2.,........6,...2759..",
  hard: "8........,..36.....,.7..9.2..,.5...7...,....457..,...1...3.,..1....68,..85...1.,.9....4..",
};

const SudokuSolver = () => {
  const [editableGrid, setEditableGrid] = useState(() =>
    puzzles.medium.split(',').map(row => row.split('').map(char => (char === '.' ? 0 : parseInt(char, 10))))
  );
  const [initialBoard, setInitialBoard] = useState([]);

  const visualizer = useVisualizer({ defaultSpeed: 1450 }); // Sudoku is fast, high default speed
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customGrid) => {
    const gridToSolve = customGrid || editableGrid;
    setInitialBoard(gridToSolve.map(row => [...row]));

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
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
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
      addState({ board, explanation: "Searching for the next empty cell...", line: 11 });
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
        addState({ board, explanation: "✓ No empty cells left. Puzzle solved!", line: 25, isSolved: true });
        solutionFound = true;
        return true;
      }

      const { row, col } = emptyCell;
      addState({ board, row, col, explanation: `Found empty cell at (${row}, ${col}).`, line: 13 });

      for (let num = 1; num <= 9; num++) {
        addState({ board, row, col, num, explanation: `Trying number ${num} at (${row}, ${col})...`, line: 14, isTrying: true });

        if (isValid(board, row, col, num)) {
          addState({ board, row, col, num, explanation: `Number ${num} is valid. Placing it.`, line: 16, isValid: true });
          board[row][col] = num;

          if (solve(board)) {
            return true;
          }

          addState({ board, row, col, num, explanation: `Backtracking from (${row}, ${col}). Resetting cell.`, line: 18, isBacktracking: true });
          board[row][col] = 0;
        } else {
          addState({ board, row, col, num, explanation: `Number ${num} is not valid (conflict).`, line: 15, isConflict: true });
        }
      }

      addState({ board, row, col, explanation: `No valid number found for (${row}, ${col}). Backtracking...`, line: 21 });
      return false;
    };

    const grid = gridToSolve.map(row => [...row]);
    addState({ board: grid, explanation: "Starting Sudoku solver...", line: 10 });
    solve(grid);

    if (!solutionFound) {
      addState({ board: grid, explanation: "✗ Could not solve the puzzle. No solution exists.", line: 26, isUnsolvable: true });
    }

    load(newHistory);
  }, [editableGrid, load]);

  const handlePreset = (level) => {
    const newGrid = puzzles[level].split(',').map(row =>
      row.split('').map(char => (char === '.' ? 0 : parseInt(char, 10)))
    );
    setEditableGrid(newGrid);
    visualizer.reset();
  };

  const handleGridInputChange = (e, r, c) => {
    const value = e.target.value;
    if (/^[1-9]$/.test(value) || value === "") {
      const newGrid = editableGrid.map(row => [...row]);
      newGrid[r][c] = value === "" ? 0 : parseInt(value, 10);
      setEditableGrid(newGrid);
    }
  };

  const {
    line,
    board = initialBoard,
    row,
    col,
    isTrying,
    isConflict,
    isBacktracking,
    isValid: numIsValid,
    isSolved: stepIsSolved,
    isUnsolvable
  } = currentState;

  const getCellClass = (r, c) => {
    let classes = "transition-all duration-200 transform ";
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

  const codeContent = {
    1: `bool isValid(vector<vector<char>>& board, int row, int col, char c) {`,
    2: `    for (int i = 0; i < 9; i++) {`,
    3: `        if (board[i][col] == c) return false;`,
    4: `        if (board[row][i] == c) return false;`,
    5: `        if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false;`,
    6: `    }`,
    7: `    return true;`,
    8: `}`,
    9: ``,
    10: `bool solveSudoku(vector<vector<char>>& board) {`,
    11: `    for (int i = 0; i < 9; i++) {`,
    12: `        for (int j = 0; j < 9; j++) {`,
    13: `            if (board[i][j] == '.') {`,
    14: `                for (char c = '1'; c <= '9'; c++) {`,
    15: `                    if (isValid(board, i, j, c)) {`,
    16: `                        board[i][j] = c;`,
    17: `                        if (solveSudoku(board)) return true;`,
    18: `                        board[i][j] = '.'; // Backtrack`,
    19: `                    }`,
    20: `                }`,
    21: `                return false;`,
    22: `            }`,
    23: `        }`,
    24: `    }`,
    25: `    return true;`,
    26: `}`
  };

  const inputSection = (
    <div className="flex flex-col md:flex-row gap-4 items-center w-full">
      {!isLoaded ? (
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
          <div className="flex-grow flex flex-col items-center">
            <div className="grid grid-cols-9 gap-1 bg-gray-900/50 p-1 rounded-md shadow-inner border border-gray-800">
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
              <button onClick={() => handlePreset('easy')} className="px-3 py-2 bg-green-600/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-600/40 transition text-sm cursor-pointer">Easy</button>
              <button onClick={() => handlePreset('medium')} className="px-3 py-2 bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 rounded-lg hover:bg-yellow-600/40 transition text-sm cursor-pointer">Medium</button>
              <button onClick={() => handlePreset('hard')} className="px-3 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/40 transition text-sm cursor-pointer">Hard</button>
            </div>
            <button onClick={() => handleLoad()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg w-full cursor-pointer">
              Solve Puzzle
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Current Cell
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {row !== undefined && col !== undefined ? `(${row}, ${col})` : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Status
        </h4>
        <div className="text-xl font-mono text-cyan-300 pt-1">
          {stepIsSolved ? "Solved" : isUnsolvable ? "No Solution" : "Solving..."}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Complexity
        </h4>
        <div className="text-sm text-emerald-300 font-mono pt-1">
          O(9^(N*N))
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(9^(N*N))</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(N*N)</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Sudoku Solver"
      description="Solve a Sudoku puzzle using backtracking to fill in empty cells with valid digits 1-9."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Select a preset and click Solve Puzzle."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="flex flex-col items-center justify-center py-4">
        <div className="grid grid-cols-9 gap-1 bg-gray-950 p-2 rounded-lg border border-gray-800">
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
      </div>
    </VisualizerLayout>
  );
};

export default SudokuSolver;
