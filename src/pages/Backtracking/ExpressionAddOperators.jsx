import React, { useState, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const Node = ({ text, status }) => {
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

const ExpressionAddOperators = () => {
  const [num, setNum] = useState("123");
  const [target, setTarget] = useState(6);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState, currentStep, history } = visualizer;

  const handleLoad = useCallback((customNum, customTarget) => {
    let digits = customNum !== undefined ? customNum : num;
    let goal = customTarget !== undefined ? customTarget : target;

    if (!digits) {
      alert("Invalid input");
      return;
    }
    setNum(digits);
    setTarget(goal);

    const newHistory = [];
    const solutionsFound = new Set();

    const push = (obj) => {
      newHistory.push({
        ...obj,
        id: newHistory.length,
        solutions: Array.from(solutionsFound),
      });
    };

    const backtrack = (pos, prevOperand, currOperand, val, expression) => {
      push({
        type: "visit",
        expr: expression,
        value: val,
        index: pos,
        note: `Visiting index ${pos}`,
        line: 1,
      });

      if (pos === digits.length) {
        if (val === goal && currOperand === 0) {
          const sol = expression.slice(1);
          if (!solutionsFound.has(sol)) {
            solutionsFound.add(sol);
            push({
              type: "solution",
              expr: sol,
              value: val,
              index: pos,
              note: `Found solution ${sol}`,
              line: 3,
            });
          }
        } else {
          push({
            type: "dead",
            expr: expression,
            value: val,
            index: pos,
            note: `Dead end (value ${val})`,
            line: 4,
          });
        }
        return;
      }

      const currDigit = digits[pos];
      const currVal = Number(currDigit);

      // Extend current operand (avoid leading zero)
      if (currOperand > 0 || currDigit !== "0") {
        push({
          type: "extend",
          expr: expression,
          value: val,
          index: pos,
          note: `Extend operand with ${currDigit}`,
          line: 8,
        });
        backtrack(
          pos + 1,
          prevOperand,
          currOperand * 10 + currVal,
          val,
          expression
        );
      }

      // Try addition
      push({
        type: "trying",
        expr: `${expression}+${currVal}`,
        value: val + currVal,
        index: pos + 1,
        note: `Try +${currVal}`,
        line: 13,
      });
      backtrack(pos + 1, currVal, 0, val + currVal, `${expression}+${currVal}`);

      // Try subtraction
      push({
        type: "trying",
        expr: `${expression}-${currVal}`,
        value: val - currVal,
        index: pos + 1,
        note: `Try -${currVal}`,
        line: 14,
      });
      backtrack(pos + 1, -currVal, 0, val - currVal, `${expression}-${currVal}`);

      // Try multiplication (careful with precedence)
      push({
        type: "trying",
        expr: `${expression}*${currVal}`,
        value: val - prevOperand + prevOperand * currVal,
        index: pos + 1,
        note: `Try *${currVal}`,
        line: 15,
      });
      backtrack(
        pos + 1,
        prevOperand * currVal,
        0,
        val - prevOperand + prevOperand * currVal,
        `${expression}*${currVal}`
      );

      push({
        type: "backtrack",
        expr: expression,
        value: val,
        index: pos,
        note: `Backtrack from index ${pos}`,
        line: 17,
      });
    };

    push({
      type: "start",
      expr: "",
      value: 0,
      index: 0,
      note: `Start exploring digits "${digits}" to reach ${goal}`,
      line: 1,
    });
    backtrack(0, 0, 0, 0, "");
    push({
      type: "end",
      expr: "",
      value: 0,
      index: digits.length,
      note: `Finished exploration`,
      line: 18,
    });

    load(newHistory);
  }, [num, target, load]);

  const {
    line,
    index,
    value,
    type,
    expr,
    solutions = []
  } = currentState;

  const currentStatus =
    type === "solution"
      ? "solution"
      : type === "trying" || type === "extend"
      ? "trying"
      : type === "backtrack" || type === "dead"
      ? "backtrack"
      : "normal";

  const codeContent = {
    1: `void backtrack(vector<string>& rst, string path, string num, int target, int pos, long eval, long multed) {`,
    2: `    if (pos == num.length()) {`,
    3: `        if (eval == target) rst.push_back(path);`,
    4: `        return;`,
    5: `    }`,
    6: `    for (int i = pos; i < num.length(); ++i) {`,
    7: `        if (i != pos && num[pos] == '0') break;`,
    8: `        string cur = num.substr(pos, i - pos + 1);`,
    9: `        long curVal = stol(cur);`,
    10: `        if (pos == 0) {`,
    11: `            backtrack(rst, path + cur, num, target, i + 1, curVal, curVal);`,
    12: `        } else {`,
    13: `            backtrack(rst, path + "+" + cur, num, target, i + 1, eval + curVal, curVal);`,
    14: `            backtrack(rst, path + "-" + cur, num, target, i + 1, eval - curVal, -curVal);`,
    15: `            backtrack(rst, path + "*" + cur, num, target, i + 1, eval - multed + multed * curVal, multed * curVal);`,
    16: `        }`,
    17: `    }`,
    18: `}`
  };

  const inputSection = (
    <>
      <input
        value={num}
        onChange={(e) => setNum(e.target.value.replace(/[^\d]/g, ""))}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-fuchsia-400 shadow-sm"
        placeholder="digits (e.g. 123)"
      />
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        disabled={isLoaded}
        className="w-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-fuchsia-400 shadow-sm"
        placeholder="target"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-fuchsia-500/20 hover:bg-fuchsia-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={() => handleLoad("123", 6)}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Default
          </button>
        </>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-fuchsia-300 select-none">
          Index
        </h4>
        <div className="text-3xl font-mono text-fuchsia-300">
          {index !== undefined ? index : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Current Value
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {value !== undefined ? value : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Solutions
        </h4>
        <div className="text-3xl font-mono text-emerald-300">
          {solutions.length}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-purple-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(4^N)</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(N)</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Expression Add Operators"
      description="Find all possibilities to add operators +, -, and * to digits to reach a target value using backtracking recursion."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.note || "Enter digits and target to begin."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Step Viewer
          </h3>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {currentState && currentState.note && (
                <motion.div
                  key={currentState.id || "empty"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Node
                    text={`${currentState.note || ""} ${
                      expr ? ` — expr: ${expr.replace(/^\+/, "")}` : ""
                    }`}
                    status={currentStatus}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Recursion Path (Recent Steps)
          </h3>
          <div className="w-full max-h-64 overflow-auto p-2 space-y-2">
            {history
              .slice(Math.max(0, currentStep - 6), currentStep + 1)
              .map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between gap-3 border-b border-gray-800 pb-1"
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

        <div className="md:col-span-2 bg-gray-900/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-200">
            Solutions Found ({solutions.length})
          </h3>
          {solutions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {solutions.map((s, i) => (
                <motion.div
                  key={s + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 rounded-md bg-green-800/30 border border-green-700 text-center text-sm font-mono"
                >
                  {s}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No solution found yet.</div>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default ExpressionAddOperators;
