import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const dx = [2, 1, -1, -2, -2, -1, 1, 2];
const dy = [1, 2, 2, 1, -1, -2, -2, -1];

const KnightsTour = () => {
  const [n, setN] = useState(5);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customN) => {
    let size = customN !== undefined ? customN : n;
    if (size < 3 || size > 6) {
      alert("Please select a board size between 3 and 6 (larger sizes can be extremely slow).");
      return;
    }
    setN(size);

    const newHistory = [];
    const board = Array(size)
      .fill(0)
      .map(() => Array(size).fill(-1));
    let solved = false;

    const push = (obj) => {
      newHistory.push({
        ...obj,
        id: newHistory.length,
        board: board.map((r) => [...r]),
        solved,
      });
    };

    const isSafe = (x, y) =>
      x >= 0 && y >= 0 && x < size && y < size && board[x][y] === -1;

    const backtrack = (x, y, movei) => {
      push({
        type: "visit",
        x,
        y,
        movei,
        note: `Move ${movei}: Knight at (${x}, ${y})`,
        line: 1,
      });

      if (movei === size * size) {
        solved = true;
        push({
          type: "solution",
          x,
          y,
          movei,
          note: `✅ Completed Knight's Tour!`,
          line: 2,
        });
        return true;
      }

      for (let k = 0; k < 8; k++) {
        const nextX = x + dx[k];
        const nextY = y + dy[k];
        if (isSafe(nextX, nextY)) {
          board[nextX][nextY] = movei;
          push({
            type: "trying",
            x: nextX,
            y: nextY,
            movei,
            note: `Trying move ${movei} → (${nextX}, ${nextY})`,
            line: 9,
          });

          if (backtrack(nextX, nextY, movei + 1)) return true;

          // Backtrack
          board[nextX][nextY] = -1;
          push({
            type: "backtrack",
            x: nextX,
            y: nextY,
            movei,
            note: `Backtrack from (${nextX}, ${nextY})`,
            line: 12,
          });
        }
      }

      return false;
    };

    board[0][0] = 0;
    push({
      type: "start",
      x: 0,
      y: 0,
      movei: 0,
      note: `Start Knight's Tour on ${size}×${size} board.`,
      line: 19,
    });
    backtrack(0, 0, 1);
    
    push({
      type: "end",
      note: solved ? `Finished. Knight's Tour completed successfully!` : `Finished. No complete tour found.`,
      line: 23,
    });

    load(newHistory);
  }, [n, load]);

  const {
    line,
    x,
    y,
    movei,
    board = [],
    solved = false
  } = currentState;

  const codeContent = {
    1: `bool solveKTUtil(int x, int y, int movei, vector<vector<int>>& board, int dx[], int dy[], int N) {`,
    2: `    if (movei == N * N) return true;`,
    3: ``,
    4: `    for (int k = 0; k < 8; k++) {`,
    5: `        int next_x = x + dx[k];`,
    6: `        int next_y = y + dy[k];`,
    7: `        if (isSafe(next_x, next_y, N, board)) {`,
    8: `            board[next_x][next_y] = movei;`,
    9: `            if (solveKTUtil(next_x, next_y, movei + 1, board, dx, dy, N))`,
    10: `                return true;`,
    11: `            else`,
    12: `                board[next_x][next_y] = -1; // backtracking`,
    13: `        }`,
    14: `    }`,
    15: `    return false;`,
    16: `}`,
    17: ``,
    18: `bool solveKT(int N) {`,
    19: `    vector<vector<int>> board(N, vector<int>(N, -1));`,
    20: `    board[0][0] = 0;`,
    21: `    int dx[8] = { 2, 1, -1, -2, -2, -1, 1, 2 };`,
    22: `    int dy[8] = { 1, 2, 2, 1, -1, -2, -2, -1 };`,
    23: `    return solveKTUtil(0, 0, 1, board, dx, dy, N);`,
    24: `}`
  };

  const inputSection = (
    <>
      <input
        type="number"
        min={3}
        max={6}
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
        disabled={isLoaded}
        className="w-32 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
        placeholder="Board size"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={() => handleLoad(5)}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Default (5x5)
          </button>
        </>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Move Number
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {movei !== undefined ? movei : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Knight Position
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {x !== undefined && y !== undefined ? `(${x}, ${y})` : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Status
        </h4>
        <div className="text-xl font-mono text-emerald-300 pt-1">
          {solved ? "Completed" : "Exploring"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(8^(N²))</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(N²)</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Knight's Tour"
      description="Find a sequence of moves for a knight on an N×N board such that the knight visits every square exactly once."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.note || "Enter board size to begin."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        <div className="flex flex-col gap-1 bg-gray-950 p-4 rounded-xl border border-gray-800">
          {board.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1">
              {row.map((cell, cIdx) => {
                const active = x === rIdx && y === cIdx;
                return (
                  <div
                    key={cIdx}
                    className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-300 text-sm font-mono
                    ${
                      active
                        ? "bg-blue-500/40 border-blue-400 font-bold scale-105 shadow-lg shadow-blue-500/20 text-white"
                        : cell !== -1
                        ? "bg-gray-700/60 border-gray-600 text-gray-200"
                        : "bg-gray-800/20 border-gray-800 text-gray-500"
                    }`}
                  >
                    {cell !== -1 ? cell : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default KnightsTour;
