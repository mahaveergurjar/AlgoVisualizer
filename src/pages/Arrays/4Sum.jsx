import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, List, Hash } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const FourSum = () => {
  const [arrayInput, setArrayInput] = useState("1,0,-1,0,-2,2");
  const [targetInput, setTargetInput] = useState("0");

  const [nums, setNums] = useState([]);
  const [target, setTarget] = useState(0);
  const [sortedArray, setSortedArray] = useState([]);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;
  const state = currentState || {};

  const generateHistory = useCallback((arr, tgt) => {
    const sortedNums = [...arr].sort((a, b) => a - b);
    setSortedArray(sortedNums);
    const n = sortedNums.length;
    const result = [];
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        sortedArray: [...sortedNums],
        i: null,
        j: null,
        left: null,
        right: null,
        line: null,
        sum: null,
        decision: null,
        currentQuad: [],
        foundQuads: result.map((q) => [...q]),
        explanation: "",
        ...props,
      });

    addState({
      line: 6,
      decision: "sort",
      explanation: `Array sorted: [${sortedNums.join(
        ", "
      )}]. Ready to find quadruplets.`,
    });

    for (let i = 0; i < n - 3; i++) {
      if (i > 0 && sortedNums[i] === sortedNums[i - 1]) {
        addState({
          i,
          line: 9,
          decision: "skip-i",
          explanation: `Skipping duplicate i=${i} (value=${sortedNums[i]}) to avoid duplicate quadruplets.`,
        });
        continue;
      }

      addState({
        i,
        line: 8,
        decision: "loop-i",
        explanation: `Outer loop: i = ${i}, value = ${sortedNums[i]}`,
      });

      for (let j = i + 1; j < n - 2; j++) {
        if (j > i + 1 && sortedNums[j] === sortedNums[j - 1]) {
          addState({
            i,
            j,
            line: 11,
            decision: "skip-j",
            explanation: `Skipping duplicate j=${j} (value=${sortedNums[j]}) to avoid duplicate quadruplets.`,
          });
          continue;
        }

        addState({
          i,
          j,
          line: 10,
          decision: "loop-j",
          explanation: `Inner loop: j = ${j}, value = ${sortedNums[j]}`,
        });

        let left = j + 1;
        let right = n - 1;

        addState({
          i,
          j,
          left,
          right,
          line: 12,
          decision: "init-pointers",
          explanation: `Initialize pointers: left = ${left}, right = ${right}`,
        });

        while (left < right) {
          const sum = sortedNums[i] + sortedNums[j] + sortedNums[left] + sortedNums[right];

          addState({
            i,
            j,
            left,
            right,
            sum,
            line: 14,
            decision: "compute-sum",
            currentQuad: [
              sortedNums[i],
              sortedNums[j],
              sortedNums[left],
              sortedNums[right],
            ],
            explanation: `Computing sum: ${sortedNums[i]} + ${sortedNums[j]} + ${sortedNums[left]} + ${sortedNums[right]} = ${sum}. Target = ${tgt}.`,
          });

          if (sum === tgt) {
            result.push([
              sortedNums[i],
              sortedNums[j],
              sortedNums[left],
              sortedNums[right],
            ]);

            addState({
              i,
              j,
              left,
              right,
              sum,
              line: 16,
              decision: "found",
              currentQuad: [
                sortedNums[i],
                sortedNums[j],
                sortedNums[left],
                sortedNums[right],
              ],
              foundQuads: result.map((q) => [...q]),
              explanation: `Found quadruplet: [${sortedNums[i]}, ${sortedNums[j]}, ${sortedNums[left]}, ${sortedNums[right]}]. Adding to result.`,
            });

            while (left < right && sortedNums[left] === sortedNums[left + 1]) {
              left++;
              addState({
                i,
                j,
                left,
                right,
                line: 17,
                decision: "skip-left-dup",
                explanation: `Skipping duplicate left values. left now = ${left}.`,
              });
            }

            while (left < right && sortedNums[right] === sortedNums[right - 1]) {
              right--;
              addState({
                i,
                j,
                left,
                right,
                line: 18,
                decision: "skip-right-dup",
                explanation: `Skipping duplicate right values. right now = ${right}.`,
              });
            }

            left++;
            right--;

            addState({
              i,
              j,
              left,
              right,
              line: 19,
              decision: "move-both",
              explanation: `Moving both pointers: left=${left}, right=${right}.`,
            });
          } else if (sum < tgt) {
            left++;
            addState({
              i,
              j,
              left,
              right,
              sum,
              line: 20,
              decision: "move-left",
              explanation: `Sum ${sum} < target ${tgt}. Moving left pointer to ${left}.`,
            });
          } else {
            right--;
            addState({
              i,
              j,
              left,
              right,
              sum,
              line: 21,
              decision: "move-right",
              explanation: `Sum ${sum} > target ${tgt}. Moving right pointer to ${right}.`,
            });
          }
        }
      }
    }

    addState({
      line: 25,
      decision: "done",
      explanation: `Finished. Found ${result.length} unique quadruplet(s).`,
      foundQuads: result.map((q) => [...q]),
    });

    load(newHistory);
  }, [load]);

  const handleLoad = () => {
    const arr = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const tgt = parseInt(targetInput, 10);

    if (arr.length < 4 || isNaN(tgt)) {
      alert("Please enter at least 4 numbers and a valid target.");
      return;
    }

    setNums(arr);
    setTarget(tgt);
    generateHistory(arr, tgt);
  };

  const codeContent = {
    1: `#include <bits/stdc++.h>`,
    2: `using namespace std;`,
    3: ``,
    4: `vector<vector<int>> fourSum(vector<int>& nums, int target) {`,
    5: `    vector<vector<int>> result;`,
    6: `    sort(nums.begin(), nums.end());`,
    7: `    int n = nums.size();`,
    8: `    for (int i = 0; i < n-3; ++i) {`,
    9: `        if (i > 0 && nums[i] == nums[i-1]) continue;`,
    10: `        for (int j = i+1; j < n-2; ++j) {`,
    11: `            if (j > i+1 && nums[j] == nums[j-1]) continue;`,
    12: `            int left = j+1, right = n-1;`,
    13: `            while (left < right) {`,
    14: `                long long sum = (long long)nums[i]+nums[j]+nums[left]+nums[right];`,
    15: `                if (sum == target) {`,
    16: `                    result.push_back({nums[i],nums[j],nums[left],nums[right]});`,
    17: `                    while (left<right && nums[left]==nums[left+1]) ++left;`,
    18: `                    while (left<right && nums[right]==nums[right-1]) --right;`,
    19: `                    ++left; --right;`,
    20: `                } else if (sum < target) { ++left; }`,
    21: `                else { --right; }`,
    22: `            }`,
    23: `        }`,
    24: `    }`,
    25: `    return result;`,
    26: `}`
  };

  const displayArray = isLoaded ? sortedArray : nums;

  const getPointerIndices = () => {
    const pointers = [];
    if (state.i != null)
      pointers.push({ index: state.i, color: "amber", label: "i" });
    if (state.j != null)
      pointers.push({ index: state.j, color: "purple", label: "j" });
    if (state.left != null)
      pointers.push({ index: state.left, color: "cyan", label: "L", direction: "up" });
    if (state.right != null)
      pointers.push({ index: state.right, color: "green", label: "R", direction: "up" });
    return pointers;
  };

  const inputSection = (
    <>
      <input
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm text-sm"
        placeholder="Nums e.g. 1,0,-1,0,-2,2"
      />
      <input
        type="text"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        disabled={isLoaded}
        className="w-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm text-sm"
        placeholder="Target"
      />
      {!isLoaded && (
        <button
          onClick={handleLoad}
          className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none text-sm">
          <Terminal size={14} /> Pointers
        </h4>
        <div className="text-2xl font-mono text-red-300">
          i={state.i ?? "-"} | j={state.j ?? "-"} | L={state.left ?? "-"} | R={state.right ?? "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none text-sm">
          <Hash size={14} /> Sum
        </h4>
        <div
          className={`text-3xl font-mono ${
            state.sum === target
              ? "text-green-400 font-bold animate-pulse"
              : "text-gray-300"
          }`}
        >
          {state.sum ?? "-"} <span className="text-xs text-gray-500">/ {target}</span>
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Quadruplets
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {(state.foundQuads || []).length}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong> <span className="font-mono text-cyan-300">O(n³)</span> — 2 nested loops + 2 pointers.
          </div>
          <div>
            <strong>Space:</strong> <span className="font-mono text-cyan-300">O(log n)</span> for sorting space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="4Sum"
      description="Find all unique quadruplets in the array that sum to a target value."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={state.line}
      message={state.explanation || "Enter inputs to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter numbers and target to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="p-4 bg-gray-900/40 rounded-xl border border-gray-800">
          <h4 className="text-gray-300 text-sm mb-4 flex items-center gap-2 select-none">
            <List size={16} /> Sorted Array
          </h4>
          <div className="relative min-h-[10rem] pt-6 pb-6 flex items-center justify-center">
            <div id="foursum-array-container" className="flex gap-2 flex-wrap justify-center">
              {displayArray.map((num, idx) => {
                const highlight = [state.i, state.j, state.left, state.right].includes(idx);
                return (
                  <div
                    key={idx}
                    id={`foursum-array-container-element-${idx}`}
                    className={`w-14 h-14 flex flex-col items-center justify-center rounded-lg font-mono font-bold text-white transition-all ${
                      highlight
                        ? "bg-cyan-500/80 shadow-lg ring-2 ring-cyan-400 scale-105"
                        : "bg-gradient-to-br from-slate-700 to-slate-600 shadow-md"
                    }`}
                  >
                    <div className="text-[10px] text-gray-300">[{idx}]</div>
                    <div className="text-base">{num}</div>
                  </div>
                );
              })}
            </div>

            {getPointerIndices().map((ptr) => (
              <VisualizerPointer
                key={ptr.label}
                index={ptr.index}
                containerId="foursum-array-container"
                color={ptr.color}
                label={ptr.label}
                direction={ptr.direction || "down"}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 max-w-lg mx-auto">
          <h4 className="text-sm font-bold text-gray-300 mb-3">
            Found Quadruplets ({(state.foundQuads || []).length}):
          </h4>
          {(!state.foundQuads || state.foundQuads.length === 0) ? (
            <p className="text-gray-500 text-sm">No quadruplets found yet...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {state.foundQuads.map((quad, idx) => (
                <div
                  key={idx}
                  className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-center"
                >
                  <span className="text-cyan-400 font-mono text-xs">
                    [{quad.join(", ")}]
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default FourSum;
