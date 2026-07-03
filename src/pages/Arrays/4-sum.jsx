import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, List, Hash } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const FourSumVisualizer = () => {
  const [numsInput, setNumsInput] = useState("1,0,-1,0,-2,2");
  const [targetInput, setTargetInput] = useState("0");

  const [nums, setNums] = useState([]);
  const [target, setTarget] = useState(0);
  const [sortedNums, setSortedNums] = useState([]);
  const [mode, setMode] = useState("optimal");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;
  const state = currentState || {};

  const generateBruteForceHistory = useCallback(
    ({ nums: inputNums, target: tgt }) => {
      const n = inputNums.length;
      const newHistory = [];
      const results = [];

      const addState = (props) =>
        newHistory.push({
          i: null,
          j: null,
          k: null,
          l: null,
          line: null,
          sum: null,
          decision: null,
          explanation: "",
          results: [...results],
          ...props,
        });

      addState({
        explanation: "Starting brute-force 4-Sum with 4 nested loops.",
        line: 7,
      });

      for (let i = 0; i < n - 3; i++) {
        addState({
          i,
          line: 7,
          decision: "loop-i",
          explanation: `Outer loop: i = ${i}, nums[${i}] = ${inputNums[i]}`,
        });

        for (let j = i + 1; j < n - 2; j++) {
          addState({
            i,
            j,
            line: 8,
            decision: "loop-j",
            explanation: `Second loop: j = ${j}, nums[${j}] = ${inputNums[j]}`,
          });

          for (let k = j + 1; k < n - 1; k++) {
            addState({
              i,
              j,
              k,
              line: 9,
              decision: "loop-k",
              explanation: `Third loop: k = ${k}, nums[${k}] = ${inputNums[k]}`,
            });

            for (let l = k + 1; l < n; l++) {
              const sum =
                inputNums[i] + inputNums[j] + inputNums[k] + inputNums[l];

              addState({
                i,
                j,
                k,
                l,
                sum,
                line: 11,
                decision: "check",
                explanation: `Checking quadruplet [${i},${j},${k},${l}]: ${inputNums[i]} + ${inputNums[j]} + ${inputNums[k]} + ${inputNums[l]} = ${sum}, target = ${tgt}`,
              });

              if (sum === tgt) {
                results.push([
                  inputNums[i],
                  inputNums[j],
                  inputNums[k],
                  inputNums[l],
                ]);
                addState({
                  i,
                  j,
                  k,
                  l,
                  sum,
                  line: 12,
                  decision: "found",
                  explanation: `✓ Found match! [${inputNums[i]}, ${inputNums[j]}, ${inputNums[k]}, ${inputNums[l]}] sums to ${tgt}`,
                  results: [...results],
                });
              }
            }
          }
        }
      }

      addState({
        line: 18,
        decision: "done",
        explanation: `Brute-force complete. Found ${results.length} quadruplet(s).`,
        results: [...results],
      });

      load(newHistory);
    },
    [load]
  );

  const generateOptimalHistory = useCallback(
    ({ nums: inputNums, target: tgt }) => {
      const sorted = [...inputNums].sort((a, b) => a - b);
      setSortedNums(sorted);
      const n = sorted.length;
      const newHistory = [];
      const results = [];

      const addState = (props) =>
        newHistory.push({
          i: null,
          j: null,
          left: null,
          right: null,
          line: null,
          sum: null,
          decision: null,
          explanation: "",
          results: [...results],
          ...props,
        });

      addState({
        explanation: "Sorted array for optimal two-pointer approach.",
        line: 6,
      });

      for (let i = 0; i < n - 3; i++) {
        if (i > 0 && sorted[i] === sorted[i - 1]) {
          addState({
            i,
            line: 9,
            decision: "skip-i",
            explanation: `Skipping duplicate i=${i}: ${sorted[i]} == ${
              sorted[i - 1]
            }`,
          });
          continue;
        }

        addState({
          i,
          line: 8,
          decision: "loop-i",
          explanation: `Outer loop: i = ${i}, nums[${i}] = ${sorted[i]}`,
        });

        for (let j = i + 1; j < n - 2; j++) {
          if (j > i + 1 && sorted[j] === sorted[j - 1]) {
            addState({
              i,
              j,
              line: 11,
              decision: "skip-j",
              explanation: `Skipping duplicate j=${j}: ${sorted[j]} == ${
                sorted[j - 1]
              }`,
            });
            continue;
          }

          addState({
            i,
            j,
            line: 10,
            decision: "loop-j",
            explanation: `Second loop: j = ${j}, nums[${j}] = ${sorted[j]}`,
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
            explanation: `Initialize two pointers: left = ${left}, right = ${right}`,
          });

          while (left < right) {
            const sum = sorted[i] + sorted[j] + sorted[left] + sorted[right];

            addState({
              i,
              j,
              left,
              right,
              sum,
              line: 14,
              decision: "compute-sum",
              explanation: `Compute sum: ${sorted[i]} + ${sorted[j]} + ${sorted[left]} + ${sorted[right]} = ${sum}, target = ${tgt}`,
            });

            if (sum === tgt) {
              results.push([sorted[i], sorted[j], sorted[left], sorted[right]]);
              addState({
                i,
                j,
                left,
                right,
                sum,
                line: 16,
                decision: "found",
                explanation: `✓ Found quadruplet: [${sorted[i]}, ${sorted[j]}, ${sorted[left]}, ${sorted[right]}]`,
                results: [...results],
              });

              while (left < right && sorted[left] === sorted[left + 1]) left++;
              while (left < right && sorted[right] === sorted[right - 1])
                right--;
              left++;
              right--;

              addState({
                i,
                j,
                left,
                right,
                line: 19,
                decision: "skip-duplicates",
                explanation: `Skipped duplicates, moved pointers: left = ${left}, right = ${right}`,
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
                explanation: `Sum ${sum} < target ${tgt}, move left pointer to ${left}`,
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
                explanation: `Sum ${sum} > target ${tgt}, move right pointer to ${right}`,
              });
            }
          }
        }
      }

      addState({
        line: 25,
        decision: "done",
        explanation: `Optimal two-pointer approach complete. Found ${results.length} unique quadruplet(s).`,
        results: [...results],
      });

      load(newHistory);
    },
    [load]
  );

  const parseInput = useCallback(() => {
    const parsed = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const tgt = parseInt(targetInput, 10);
    if (parsed.length < 4 || parsed.some(isNaN) || isNaN(tgt)) {
      throw new Error("Invalid input. Need at least 4 numbers and a valid target.");
    }
    return { nums: parsed, target: tgt };
  }, [numsInput, targetInput]);

  const handleLoad = () => {
    try {
      const parsed = parseInput();
      setNums(parsed.nums);
      setTarget(parsed.target);
      if (mode === "brute-force") {
        generateBruteForceHistory(parsed);
      } else {
        generateOptimalHistory(parsed);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (isLoaded) {
      try {
        const parsed = parseInput();
        if (nextMode === "brute-force") {
          generateBruteForceHistory(parsed);
        } else {
          generateOptimalHistory(parsed);
        }
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const bruteForceCode = {
    1: `#include <bits/stdc++.h>`,
    2: `using namespace std;`,
    3: ``,
    4: `vector<vector<int>> fourSum(vector<int>& nums, int target) {`,
    5: `    vector<vector<int>> result;`,
    6: `    int n = nums.size();`,
    7: `    for (int i = 0; i < n-3; ++i) {`,
    8: `        for (int j = i+1; j < n-2; ++j) {`,
    9: `            for (int k = j+1; k < n-1; ++k) {`,
    10: `                for (int l = k+1; l < n; ++l) {`,
    11: `                    if (nums[i] + nums[j] + nums[k] + nums[l] == target) {`,
    12: `                        result.push_back({nums[i], nums[j], nums[k], nums[l]});`,
    13: `                    }`,
    14: `                }`,
    15: `            }`,
    16: `        }`,
    17: `    }`,
    18: `    return result;`,
    19: `}`
  };

  const optimalCode = {
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

  const displayArray = mode === "optimal" && isLoaded ? sortedNums : nums;

  const getPointerIndices = () => {
    const pointers = [];
    if (state.i != null)
      pointers.push({ index: state.i, color: "amber", label: "i" });
    if (state.j != null)
      pointers.push({ index: state.j, color: "purple", label: "j" });
    if (mode === "brute-force") {
      if (state.k != null)
        pointers.push({ index: state.k, color: "cyan", label: "k" });
      if (state.l != null)
        pointers.push({ index: state.l, color: "green", label: "l" });
    } else {
      if (state.left != null)
        pointers.push({
          index: state.left,
          color: "cyan",
          label: "L",
          direction: "up",
        });
      if (state.right != null)
        pointers.push({
          index: state.right,
          color: "green",
          label: "R",
          direction: "up",
        });
    }
    return pointers;
  };

  const inputSection = (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={numsInput}
          onChange={(e) => setNumsInput(e.target.value)}
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
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleModeChange("brute-force")}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-xs ${
            mode === "brute-force"
              ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
              : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
          }`}
        >
          Brute Force O(n⁴)
        </button>
        <button
          onClick={() => handleModeChange("optimal")}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-xs ${
            mode === "optimal"
              ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
              : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
          }`}
        >
          Optimal O(n³)
        </button>
      </div>
    </div>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none text-sm">
          <Terminal size={14} /> Pointers
        </h4>
        <div className="text-2xl font-mono text-red-300">
          i={state.i ?? "-"} | j={state.j ?? "-"}
          {mode === "brute-force" ? (
            ` | k=${state.k ?? "-"} | l=${state.l ?? "-"}`
          ) : (
            ` | L=${state.left ?? "-"} | R=${state.right ?? "-"}`
          )}
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
          {(state.results || []).length}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          {mode === "brute-force" ? (
            <div>
              <strong>Time:</strong> <span className="font-mono text-red-300">O(n⁴)</span> — 4 nested loops.
            </div>
          ) : (
            <div>
              <strong>Time:</strong> <span className="font-mono text-cyan-300">O(n³)</span> — 2 nested loops + 2 pointers.
            </div>
          )}
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-cyan-300">
              {mode === "brute-force" ? "O(1)" : "O(log n)"}
            </span>{" "}
            for sorting space.
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
      codeContent={mode === "brute-force" ? bruteForceCode : optimalCode}
      activeLine={state.line}
      message={state.explanation || "Enter inputs to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter numbers and target to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="p-4 bg-gray-900/40 rounded-xl border border-gray-800">
          <h4 className="text-gray-300 text-sm mb-4 flex items-center gap-2 select-none">
            <List size={16} /> {mode === "optimal" ? "Sorted Array" : "Array"}
          </h4>
          <div className="relative min-h-[10rem] pt-6 pb-6 flex items-center justify-center">
            <div id="foursum-array-container" className="flex gap-2 flex-wrap justify-center">
              {displayArray.map((num, idx) => {
                let highlight = false;
                if (mode === "brute-force") {
                  highlight = [state.i, state.j, state.k, state.l].includes(idx);
                } else {
                  highlight = [state.i, state.j, state.left, state.right].includes(idx);
                }

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
            Found Quadruplets ({(state.results || []).length}):
          </h4>
          {(!state.results || state.results.length === 0) ? (
            <p className="text-gray-500 text-sm">No quadruplets found yet...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {state.results.map((quad, idx) => (
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

export default FourSumVisualizer;
