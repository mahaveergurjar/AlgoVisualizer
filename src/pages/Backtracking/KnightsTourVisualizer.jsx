import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/*
  KnightsTourVisualizer.jsx
  - Interactive recursion visualizer for Knight's Tour problem.
  - Shows step-by-step exploration of knight moves on an N×N board.
*/

const Node = ({ text, status }) => {
  const bg =
    status === "solution"
      ? "bg-green-600/30 border-green-500"
      : status === "trying"
      ? "bg-blue-600/30 border-blue-500"
      : status === "backtrack"
      ? "bg-red-600/30 border-red-500"
      : "bg-gray-800/40 border-gray-700";

  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`p-3 rounded-lg border ${bg} text-sm font-mono text-gray-100`}
    >
      {text}
    </motion.div>
  );
};

const KnightsTourVisualizer = ({ navigate }) => {
  const [n, setN] = useState(5);
  const [frames, setFrames] = useState([]);
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [solution, setSolution] = useState([]);
  const timerRef = useRef(null);

  const dx = [2, 1, -1, -2, -2, -1, 1, 2];
  const dy = [1, 2, 2, 1, -1, -2, -2, -1];

  const buildFrames = (size) => {
    const localFrames = [];
    const board = Array(size)
      .fill(0)
      .map(() => Array(size).fill(-1));
    let solved = false;

    const push = (obj) =>
      localFrames.push({ ...obj, id: localFrames.length });

    const isSafe = (x, y) =>
      x >= 0 && y >= 0 && x < size && y < size && board[x][y] === -1;

    const backtrack = (x, y, movei) => {
      push({
        type: "visit",
        x,
        y,
        movei,
        note: `Move ${movei}: Knight at (${x}, ${y})`,
      });

      if (movei === size * size) {
        push({
          type: "solution",
          x,
          y,
          movei,
          note: `✅ Completed Knight's Tour!`,
        });
        solved = true;
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
    });
    backtrack(0, 0, 1);
    push({
      type: "end",
      note: `Finished exploration.`,
    });

    setFrames(localFrames);
    setSolution(solved ? board.map((r) => [...r]) : []);
    setPlayIndex(0);
  };

  // autoplay frames
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      if (playIndex < frames.length - 1) {
        timerRef.current = setTimeout(() => setPlayIndex((p) => p + 1), 600);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, playIndex, frames.length]);

  const handleStart = () => {
    setIsPlaying(false);
    setFrames([]);
    setSolution([]);
    setPlayIndex(0);
    setTimeout(() => {
      buildFrames(n);
      setIsPlaying(true);
    }, 100);
  };

  const current = frames[playIndex] || {};

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("home")}
            className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:bg-gray-800"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h2 className="text-2xl font-bold text-blue-300">Knight’s Tour</h2>
        </div>
        <div className="text-sm text-gray-400">Backtracking • Tier 3 (Hard)</div>
      </div>

      {/* Inputs */}
      <div className="flex gap-3 mb-6 items-center">
        <input
          type="number"
          min={4}
          max={8}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 w-32"
          placeholder="Board size"
        />
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Start
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
            disabled={frames.length === 0}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => {
              setPlayIndex(0);
              setIsPlaying(false);
            }}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Viewer */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">Step Viewer</h3>
          <AnimatePresence initial={false}>
            {current && (
              <motion.div
                key={current.id || "none"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Node
                  text={current.note}
                  status={
                    current.type === "solution"
                      ? "solution"
                      : current.type === "trying"
                      ? "trying"
                      : current.type === "backtrack"
                      ? "backtrack"
                      : "normal"
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-4 text-sm text-gray-400">
            <div>Move: {current.movei ?? "-"}</div>
            <div>Position: ({current.x ?? "-"}, {current.y ?? "-"})</div>
            <div>
              Frame: {playIndex + 1}/{frames.length}
            </div>
          </div>
        </div>

        {/* Recursion Path */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">Recursion Path</h3>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: n }).map((_, i) =>
              Array.from({ length: n }).map((_, j) => {
                const visited = frames
                  .slice(0, playIndex)
                  .find((f) => f.x === i && f.y === j);
                const active =
                  current.x === i && current.y === j && current.type !== "backtrack";
                return (
                  <motion.div
                    key={`${i}-${j}`}
                    layout
                    className={`w-8 h-8 rounded-md flex items-center justify-center border text-xs font-mono
                    ${
                      active
                        ? "bg-blue-600/60 border-blue-400"
                        : visited
                        ? "bg-gray-700/50 border-gray-600"
                        : "bg-gray-900/50 border-gray-700"
                    }`}
                  >
                    {visited ? visited.movei % 10 : ""}
                  </motion.div>
                );
              })
            )}
          </div>
          <div className="mt-3 text-xs text-gray-400">(Knight positions visualized)</div>
        </div>

        {/* Solutions */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">Result</h3>
          {solution.length > 0 ? (
            <div className="text-green-400 text-sm">
              ✅ Knight’s Tour completed successfully!
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No complete tour found yet.</div>
          )}
          <div className="mt-6 text-sm text-gray-400">
            <div>
              <strong>Board Size:</strong> {n}×{n}
            </div>
            <div>
              <strong>Total Frames:</strong> {frames.length}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400 flex items-center gap-3">
        <Zap />{" "}
        <span>
          Visualizes DFS-based Knight’s Tour recursion with live step and backtrack
          updates.
        </span>
      </div>
    </div>
  );
};

export default KnightsTourVisualizer;
