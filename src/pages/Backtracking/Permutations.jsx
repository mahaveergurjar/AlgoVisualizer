import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const Permutations = () => {
  const [arrayInput, setArrayInput] = useState("1,2,3");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customArrInput) => {
    const rawInput = customArrInput !== undefined ? customArrInput : arrayInput;
    const localArray = rawInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (localArray.length === 0) {
      alert("Please enter at least one number.");
      return;
    }

    const validNumbers = localArray.slice(0, 5).map(num => {
      const numValue = parseInt(num);
      return isNaN(numValue) ? 1 : Math.min(Math.abs(numValue), 99);
    });

    setArrayInput(validNumbers.join(","));

    const newHistory = [];
    const result = [];
    const n = validNumbers.length;
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        nums: [...validNumbers],
        currentPath: [...(props.currentPath || [])],
        used: [...(props.used || Array(n).fill(false))],
        depth: props.depth || 0,
        explanation: props.explanation || "",
        currentResults: [...result],
        step: stepCount++,
        ...props,
      });
    };

    const backtrack = (path, used, depth) => {
      addState({
        currentPath: [...path],
        used: [...used],
        depth,
        explanation: `Entering backtrack at depth ${depth}. Current path: [${path.join(', ') || 'empty'}]`,
        line: 1,
        focus: [depth],
      });

      if (path.length === n) {
        result.push([...path]);
        addState({
          currentPath: [...path],
          used: [...used],
          depth,
          explanation: `✓ Found a complete permutation: [${path.join(', ')}]`,
          currentResults: [...result],
          line: 3,
          foundResult: true,
          highlight: path.map((_, idx) => idx),
        });
        return;
      }

      for (let i = 0; i < n; i++) {
        if (!used[i]) {
          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Trying number ${validNumbers[i]} at position ${depth}. Marking it as used.`,
            currentIndex: i,
            line: 7,
            comparing: [i],
            focus: [depth],
          });

          used[i] = true;
          path.push(validNumbers[i]);

          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Added ${validNumbers[i]} to path. Now exploring deeper...`,
            currentIndex: i,
            line: 9,
            comparing: [i],
            focus: [depth],
          });

          backtrack(path, used, depth + 1);

          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Backtracking: Removing ${path[path.length - 1]} from path and marking as unused.`,
            currentIndex: i,
            line: 11,
            comparing: [i],
            focus: [depth],
          });

          path.pop();
          used[i] = false;
          
          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Continuing to next number at depth ${depth}.`,
            line: 12,
            focus: [depth],
          });
        } else {
          addState({
            currentPath: [...path],
            used: [...used],
            depth,
            explanation: `Number ${validNumbers[i]} is already used, skipping.`,
            currentIndex: i,
            line: 7,
            comparing: [i],
            skipped: true,
            focus: [depth],
          });
        }
      }

      addState({
        currentPath: [...path],
        used: [...used],
        depth,
        explanation: `Finished exploring all possibilities at depth ${depth}. Returning to previous level.`,
        line: 13,
        focus: [depth],
      });
    };

    addState({
      explanation: "Starting permutation generation using backtracking...",
      line: 1,
    });

    backtrack([], Array(n).fill(false), 0);

    addState({
      explanation: `✓ All permutations generated! Total: ${result.length} permutations found.`,
      currentResults: [...result],
      line: 14,
      finished: true,
      highlight: Array.from({ length: n }, (_, i) => i),
    });

    load(newHistory);
  }, [arrayInput, load]);

  const {
    line,
    nums = [],
    currentPath = [],
    used = [],
    currentResults = [],
    comparing = [],
    focus = [],
    depth = 0
  } = currentState;

  const codeContent = {
    1: `void backtrack(vector<vector<int>>& res, vector<int>& nums, vector<int>& path, vector<bool>& used) {`,
    2: `    if (path.size() == nums.size()) {`,
    3: `        res.push_back(path);`,
    4: `        return;`,
    5: `    }`,
    6: `    for (int i = 0; i < nums.size(); i++) {`,
    7: `        if (used[i]) continue;`,
    8: `        used[i] = true;`,
    9: `        path.push_back(nums[i]);`,
    10: `        backtrack(res, nums, path, used);`,
    11: `        path.pop_back();`,
    12: `        used[i] = false;`,
    13: `    }`,
    14: `}`
  };

  const inputSection = (
    <>
      <input
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        placeholder="e.g., 1,2,3 (max 5 numbers)"
        className="flex-grow min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-purple-400 shadow-sm"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={() => handleLoad("1,2,3")}
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Recursion Depth
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {depth}/{nums.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Path Length
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {currentPath.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Permutations
        </h4>
        <div className="text-3xl font-mono text-emerald-300">
          {currentResults.length}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N × N!)</span>
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
      title="Permutations"
      description="Generate all possible permutations of a collection of distinct integers using backtracking."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter numbers to begin."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div>
          <h4 className="text-sm text-gray-400 mb-3 select-none">
            Available Numbers
          </h4>
          <div className="flex gap-3 flex-wrap">
            {nums.map((num, index) => (
              <div
                key={index}
                className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-300 ${
                  used[index]
                    ? "bg-red-500/20 border-red-400 text-red-300 scale-95"
                    : comparing.includes(index)
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110 shadow-lg shadow-cyan-500/30"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:scale-105"
                }`}
              >
                <span className="text-xl">{num}</span>
                <span className="text-xs text-gray-400 mt-1">[{index}]</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm text-gray-400 mb-3 select-none">
            Current Path (Depth: {currentPath.length})
          </h4>
          <div className="flex gap-3 flex-wrap min-h-[5rem] items-center bg-gray-950 rounded-lg p-4 border border-gray-800">
            {currentPath.length === 0 ? (
              <div className="text-gray-500 italic text-center w-full">Empty path - start building permutation</div>
            ) : (
              currentPath.map((num, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-white text-lg shadow-lg transform transition-all duration-300 ${
                    focus.includes(index)
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 scale-110"
                      : "bg-gradient-to-br from-blue-500 to-purple-500 border-blue-400 scale-100"
                  }`}
                >
                  {num}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm text-gray-400 mb-3 select-none">
            Generated Permutations ({currentResults.length})
          </h4>
          <div className="max-h-48 overflow-y-auto bg-gray-950 p-4 border border-gray-800 rounded-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentResults.map((permutation, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-3 font-mono text-sm text-green-400 text-center transition-all hover:scale-105 hover:bg-green-500/20 shadow-lg"
                >
                  [{permutation.join(", ")}]
                </div>
              ))}
            </div>
            {currentResults.length === 0 && (
              <div className="text-gray-500 text-center py-6 italic">
                No permutations generated yet...
              </div>
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default Permutations;