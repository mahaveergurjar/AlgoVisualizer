import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Zap } from "lucide-react";
import { AnimatePresence } from "framer-motion";

/*
  ExpressionAddOperators.jsx
  - Interactive recursion visualizer for LeetCode #282
  - Shows step-by-step exploration + simple tree-like stacking of frames
*/

const Node = ({ text, status }) => {
  // status: 'normal' | 'trying' | 'backtrack' | 'solution'
  const bg =
    status === "solution"
      ? "bg-green-600/30 border-green-500"
      : status === "trying"
      ? "bg-fuchsia-600/20 border-fuchsia-500"
      : status === "backtrack"
      ? "bg-red-600/20 border-red-500"
      : "bg-gray-800/40 border-gray-700";

  return (
    <motion.div
      layout
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`p-3 rounded-lg border ${bg} text-sm font-mono text-gray-100`}
    >
      {text}
    </motion.div>
  );
};

const ExpressionAddOperators = ({ navigate }) => {
  const [num, setNum] = useState("123");
  const [target, setTarget] = useState(6);
  const [frames, setFrames] = useState([]); // each frame is {type, expr, value, index}
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const timerRef = useRef(null);

  // Build detailed frames with statuses for visualization
  const buildFrames = (digits, goal) => {
    const localFrames = [];
    const solutionsFound = new Set();

    const push = (obj) => localFrames.push({ ...obj, id: localFrames.length });

    const backtrack = (index, prevOperand, currOperand, value, expr) => {
      // show that we are at this node
      push({
        type: "visit",
        expr,
        value,
        index,
        note: `Visiting index ${index}`,
      });

      if (index === digits.length) {
        if (value === goal && currOperand === 0) {
          const sol = expr.slice(1);
          if (!solutionsFound.has(sol)) {
            solutionsFound.add(sol);
            push({
              type: "solution",
              expr: sol,
              value,
              index,
              note: `Found solution ${sol}`,
            });
          }
        } else {
          push({
            type: "dead",
            expr,
            value,
            index,
            note: `Dead end (value ${value})`,
          });
        }
        return;
      }

      const currDigit = digits[index];
      const currVal = Number(currDigit);

      // Extend current operand (avoid leading zero)
      if (currOperand > 0 || currDigit !== "0") {
        push({
          type: "extend",
          expr,
          value,
          index,
          note: `Extend operand with ${currDigit}`,
        });
        backtrack(
          index + 1,
          prevOperand,
          currOperand * 10 + currVal,
          value,
          expr
        );
      }

      // Try addition
      push({
        type: "trying",
        expr: `${expr}+${currVal}`,
        value: value + currVal,
        index: index + 1,
        note: `Try +${currVal}`,
      });
      backtrack(index + 1, currVal, 0, value + currVal, `${expr}+${currVal}`);

      // Try subtraction
      push({
        type: "trying",
        expr: `${expr}-${currVal}`,
        value: value - currVal,
        index: index + 1,
        note: `Try -${currVal}`,
      });
      backtrack(index + 1, -currVal, 0, value - currVal, `${expr}-${currVal}`);

      // Try multiplication (careful with precedence)
      push({
        type: "trying",
        expr: `${expr}*${currVal}`,
        value: value - prevOperand + prevOperand * currVal,
        index: index + 1,
        note: `Try *${currVal}`,
      });
      backtrack(
        index + 1,
        prevOperand * currVal,
        0,
        value - prevOperand + prevOperand * currVal,
        `${expr}*${currVal}`
      );

      push({
        type: "backtrack",
        expr,
        value,
        index,
        note: `Backtrack from index ${index}`,
      });
    };

    push({
      type: "start",
      expr: "",
      value: 0,
      index: 0,
      note: `Start exploring digits "${digits}" to reach ${goal}`,
    });
    backtrack(0, 0, 0, 0, "");
    push({
      type: "end",
      expr: "",
      value: 0,
      index: digits.length,
      note: `Finished exploration`,
    });

    setFrames(localFrames);
    setSolutions(Array.from(solutionsFound));
    setPlayIndex(0);
  };

  // Play loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      if (playIndex < frames.length - 1) {
        timerRef.current = setTimeout(() => setPlayIndex((p) => p + 1), 700);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, playIndex, frames.length]);

  const handleStart = () => {
    setIsPlaying(false);
    setFrames([]);
    setSolutions([]);
    setPlayIndex(0);
    // small debounce to allow UI to reset
    setTimeout(() => {
      buildFrames(num, target);
      setIsPlaying(true);
    }, 80);
  };

  const current = frames[playIndex] || {};

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-fuchsia-900 via-purple-900 to-black text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("home")}
            className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:bg-gray-800"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h2 className="text-2xl font-bold text-fuchsia-300">
            Expression Add Operators
          </h2>
        </div>
        <div className="text-sm text-gray-400">
          LeetCode #282 • Tier 3 (Hard)
        </div>
      </div>

      {/* Inputs */}
      <div className="flex gap-3 mb-6 items-center">
        <input
          value={num}
          onChange={(e) => setNum(e.target.value.replace(/[^\d]/g, ""))}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 w-44"
          placeholder="digits (e.g. 123)"
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 w-28"
          placeholder="target"
        />
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg"
        >
          Start
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying((p) => !p);
            }}
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

      {/* Visualization container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stack of recent frames / step detail */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Step Viewer
          </h3>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {current && (
                <motion.div
                  key={current.id || "empty"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Node
                    text={`${current.note || ""} ${
                      current.expr
                        ? ` — expr: ${current.expr.replace(/^\+/, "")}`
                        : ""
                    }`}
                    status={
                      current.type === "solution"
                        ? "solution"
                        : current.type === "trying" || current.type === "extend"
                        ? "trying"
                        : current.type === "backtrack" ||
                          current.type === "dead"
                        ? "backtrack"
                        : "normal"
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <div>Index: {current.index ?? "-"}</div>
            <div>Value: {current.value ?? "-"}</div>
            <div>
              Frame: {playIndex + 1}/{frames.length || 0}
            </div>
          </div>
        </div>

        {/* Center: "Recursion Path" visual stack */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Recursion Path
          </h3>

          <div className="w-full flex flex-col items-center gap-3">
            {/* Show a small vertical breadcrumb showing last few visited exprs */}
            <div className="w-full max-h-64 overflow-auto p-2 space-y-2">
              {frames
                .slice(Math.max(0, playIndex - 6), playIndex + 1)
                .map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">{f.note}</div>
                      <div className="text-sm font-mono text-gray-200">
                        {f.expr ? f.expr.replace(/^\+/, "") : "(start)"}
                      </div>
                    </div>
                    <div className="text-sm font-mono text-gray-300">
                      {f.value ?? "-"}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            (recent steps shown — play to auto-advance)
          </div>
        </div>

        {/* Right: Solutions & Summary */}
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Solutions
          </h3>
          {solutions.length > 0 ? (
            <div className="space-y-2">
              {solutions.map((s, i) => (
                <motion.div
                  key={s + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 rounded-md bg-green-800/30 border border-green-700 text-sm font-mono"
                >
                  {s}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No solution found yet.</div>
          )}

          <div className="mt-6 text-sm text-gray-400">
            <div>
              <strong>Digits:</strong> {num}
            </div>
            <div>
              <strong>Target:</strong> {target}
            </div>
            <div>
              <strong>Frames:</strong> {frames.length}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                setFrames([]);
                setSolutions([]);
                setPlayIndex(0);
                setIsPlaying(false);
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="mt-6 text-sm text-gray-400 flex items-center gap-3">
        <Zap />{" "}
        <span>
          Visualization uses a depth-first recursion walk; frames record visits,
          tries, backtracks, and found solutions.
        </span>
      </div>
    </div>
  );
};

export default ExpressionAddOperators;
