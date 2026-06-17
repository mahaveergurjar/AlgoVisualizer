import React, { useState, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  CheckCircle,
  List,
  Calculator,
  Layers,
  Clock,
} from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const SubarrayRangesVisualizer = () => {
  const [mode, setMode] = useState("brute-force");
  const [numsInput, setNumsInput] = useState("4,-2,-3,4,1");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateBruteForceHistory = useCallback((nums) => {
    const newHistory = [];
    let totalSum = 0;

    const addState = (props) =>
      newHistory.push({
        nums,
        totalSum,
        i: null,
        j: null,
        minVal: "N/A",
        maxVal: "N/A",
        rangeText: "N/A",
        currentSub: [],
        highlighted: [],
        finished: false,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize sum = 0." });
    addState({ line: 3, explanation: "Get size of array." });

    for (let i = 0; i < nums.length; i++) {
      addState({ line: 4, i, explanation: `Outer loop: i = ${i}, val = ${nums[i]}.` });
      let minInSubarray = nums[i];
      let maxInSubarray = nums[i];
      addState({ line: 5, i, minVal: minInSubarray, explanation: `Initialize minVal = nums[${i}] = ${nums[i]}.` });
      addState({ line: 6, i, minVal: minInSubarray, maxVal: maxInSubarray, explanation: `Initialize maxVal = nums[${i}] = ${nums[i]}.` });

      for (let j = i; j < nums.length; j++) {
        const highlightedIndices = Array.from(
          { length: j - i + 1 },
          (_, k) => i + k
        );
        addState({
          line: 7,
          i,
          j,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
          explanation: `Inner loop: j = ${j}, subarray range is [${i}, ${j}].`,
        });

        minInSubarray = Math.min(minInSubarray, nums[j]);
        addState({
          line: 8,
          i,
          j,
          minVal: minInSubarray,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
          explanation: `Update minVal = min(${minInSubarray}, ${nums[j]}) = ${minInSubarray}.`,
        });

        maxInSubarray = Math.max(maxInSubarray, nums[j]);
        addState({
          line: 9,
          i,
          j,
          minVal: minInSubarray,
          maxVal: maxInSubarray,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
          explanation: `Update maxVal = max(${maxInSubarray}, ${nums[j]}) = ${maxInSubarray}.`,
        });

        const range = maxInSubarray - minInSubarray;
        totalSum += range;

        addState({
          line: 10,
          i,
          j,
          totalSum,
          rangeText: `${maxInSubarray} - ${minInSubarray} = ${range}`,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
          explanation: `Add range (${maxInSubarray} - ${minInSubarray} = ${range}) to total sum. New total sum = ${totalSum}.`,
        });
      }
    }
    addState({ line: 13, totalSum, finished: true, explanation: `Complete! Total sum of subarray ranges is ${totalSum}.` });
    load(newHistory);
  }, [load]);

  const generateOptimalHistory = useCallback((nums) => {
    const newHistory = [];
    let sumMax = 0,
      sumMin = 0;
    let stack = [];

    const addState = (props) =>
      newHistory.push({
        nums,
        sumMax,
        sumMin,
        i: null,
        j: null,
        k: null,
        stack: [...stack],
        explanation: "",
        finished: false,
        ...props,
      });

    addState({ line: 6, explanation: "Calculating sum of subarray maximums." });
    for (let i = 0; i <= nums.length; i++) {
      addState({ line: 7, i, explanation: `Step maximums: checking i = ${i}.` });
      while (
        stack.length > 0 &&
        (i === nums.length || nums[stack[stack.length - 1]] < nums[i])
      ) {
        addState({ line: 8, i, explanation: `nums[stack.top] < nums[${i}]. Pop elements to calculate contribution.` });
        const j = stack.pop();
        addState({ line: 9, i, j, explanation: `Popped index j = ${j} (value = ${nums[j]}).` });
        const k = stack.length > 0 ? stack[stack.length - 1] : -1;
        addState({ line: 10, i, j, k, explanation: `k (previous stack top index) = ${k}.` });
        const contribution = nums[j] * (i - j) * (j - k);
        sumMax += contribution;
        addState({
          line: 11,
          i,
          j,
          k,
          sumMax,
          explanation: `Popped j=${j} (val ${nums[j]}).<br/>Right bound i=${i}, Left bound k=${k}.<br/>Contrib: ${nums[j]}*(${i}-${j})*(${j}-${k}) = ${contribution}`,
        });
      }
      if (i < nums.length) {
        stack.push(i);
        addState({ line: 13, i, explanation: `Push current index i = ${i} to stack.` });
      }
    }
    stack = [];
    addState({ line: 16, explanation: "Stack cleared for calculating subarray minimums." });

    addState({
      line: 18,
      explanation: "Calculating sum of subarray minimums.",
    });
    for (let i = 0; i <= nums.length; i++) {
      addState({ line: 19, i, explanation: `Step minimums: checking i = ${i}.` });
      while (
        stack.length > 0 &&
        (i === nums.length || nums[stack[stack.length - 1]] > nums[i])
      ) {
        addState({ line: 20, i, explanation: `nums[stack.top] > nums[${i}]. Pop elements to calculate contribution.` });
        const j = stack.pop();
        addState({ line: 21, i, j, explanation: `Popped index j = ${j} (value = ${nums[j]}).` });
        const k = stack.length > 0 ? stack[stack.length - 1] : -1;
        addState({ line: 22, i, j, k, explanation: `k (previous stack top index) = ${k}.` });
        const contribution = nums[j] * (i - j) * (j - k);
        sumMin += contribution;
        addState({
          line: 23,
          i,
          j,
          k,
          sumMin,
          explanation: `Popped j=${j} (val ${nums[j]}).<br/>Right bound i=${i}, Left bound k=${k}.<br/>Contrib: ${nums[j]}*(${i}-${j})*(${j}-${k}) = ${contribution}`,
        });
      }
      if (i < nums.length) {
        stack.push(i);
        addState({ line: 25, i, explanation: `Push current index i = ${i} to stack.` });
      }
    }
    addState({
      line: 28,
      finished: true,
      explanation: `Final Result: ${sumMax} (sum_max) - ${sumMin} (sum_min) = ${
        sumMax - sumMin
      }`,
    });
    load(newHistory);
  }, [load]);

  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localNums.some(isNaN)) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }
    if (mode === "brute-force") {
      generateBruteForceHistory(localNums);
    } else {
      generateOptimalHistory(localNums);
    }
  };

  const parseInput = useCallback(() => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (nums.some(isNaN) || nums.length === 0) throw new Error("Invalid input");
    return nums;
  }, [numsInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (n) => generateBruteForceHistory(n),
      optimal: (n) => generateOptimalHistory(n),
    },
    setCurrentStep: () => {},
    onError: () => {},
  });

  const state = currentState || {};
  const { nums = [], line = 2 } = state;

  const bruteForceCode = {
    1: `long long subArrayRanges(vector<int>& nums) {`,
    2: `    long long sum = 0;`,
    3: `    int n = nums.size();`,
    4: `    for (int i = 0; i < n; i++) {`,
    5: `        int minVal = nums[i];`,
    6: `        int maxVal = nums[i];`,
    7: `        for (int j = i; j < n; j++) {`,
    8: `            minVal = min(minVal, nums[j]);`,
    9: `            maxVal = max(maxVal, nums[j]);`,
    10: `            sum += (maxVal - minVal);`,
    11: `        }`,
    12: `    }`,
    13: `    return sum;`,
    14: `}`
  };

  const optimalCode = {
    1: `long long subArrayRanges(vector<int>& nums) {`,
    2: `    int n = nums.size();`,
    3: `    long long sum_max = 0, sum_min = 0;`,
    4: `    stack<int> st;`,
    5: ``,
    6: `    // Calculate sum of subarray maximums`,
    7: `    for (int i = 0; i <= n; ++i) {`,
    8: `        while (!st.empty() && (i == n || nums[st.top()] < nums[i])) {`,
    9: `            int j = st.top(); st.pop();`,
    10: `            int k = st.empty() ? -1 : st.top();`,
    11: `            sum_max += (long long)nums[j] * (i - j) * (j - k);`,
    12: `        }`,
    13: `        if (i < n) st.push(i);`,
    14: `    }`,
    15: ``,
    16: `    while(!st.empty()) st.pop();`,
    17: ``,
    18: `    // Calculate sum of subarray minimums`,
    19: `    for (int i = 0; i <= n; ++i) {`,
    20: `        while (!st.empty() && (i == n || nums[st.top()] > nums[i])) {`,
    21: `            int j = st.top(); st.pop();`,
    22: `            int k = st.empty() ? -1 : st.top();`,
    23: `            sum_min += (long long)nums[j] * (i - j) * (j - k);`,
    24: `        }`,
    25: `        if (i < n) st.push(i);`,
    26: `    }`,
    27: ``,
    28: `    return sum_max - sum_min;`,
    29: `}`
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={numsInput}
        onChange={(e) => setNumsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-teal-500 font-mono shadow-sm"
        placeholder="e.g., 4,-2,-3,4,1"
      />
      {!isLoaded && (
        <button
          onClick={loadArray}
          className="px-5 py-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = mode === "brute-force" ? (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none">
          Min Value
        </h4>
        <div className="text-3xl font-mono text-red-400">
          {currentState.minVal ?? "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Max Value
        </h4>
        <div className="text-3xl font-mono text-green-400">
          {currentState.maxVal ?? "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Total Sum
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {currentState.totalSum ?? 0}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-teal-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity (Brute Force)
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n²)</span> - Nested loops check all subarrays.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - Constant extra space.
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Sum of Max
        </h4>
        <div className="text-3xl font-mono text-green-400">
          {currentState.sumMax ?? 0}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none">
          Sum of Min
        </h4>
        <div className="text-3xl font-mono text-red-400">
          {currentState.sumMin ?? 0}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Total Sum
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {(currentState.sumMax ?? 0) - (currentState.sumMin ?? 0)}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-teal-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity (Optimal)
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Monotonic stack pushes/pops.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Stack space up to n.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Sum of Subarray Ranges"
      description="LeetCode #2104 - Find the sum of all subarray ranges (max - min) using Brute Force O(n²) or Optimal Monotonic Stack O(n)."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={mode === "brute-force" ? bruteForceCode : optimalCode}
      activeLine={line}
      message={currentState.explanation || ""}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array to begin visualization."
    >
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all font-bold ${
            mode === "brute-force"
              ? "border-teal-400 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Brute Force O(n²)
        </button>
        <button
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all font-bold ${
            mode === "optimal"
              ? "border-teal-400 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          Optimal O(n)
        </button>
      </div>

      {mode === "brute-force" ? (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-6">
          <h3 className="font-bold text-lg text-gray-300 mb-4">Array Visualization</h3>
          <div id="bf-array-container" className="relative w-full h-24 flex justify-center items-center gap-2 flex-wrap pb-8">
            {nums.map((num, index) => {
              const isI = index === currentState.i;
              const isJ = index === currentState.j;
              const isHighlighted = currentState.highlighted?.includes(index);
              return (
                <div key={index} className="flex flex-col items-center relative min-w-[64px]">
                  <div className="flex gap-1 justify-center min-h-[24px]">
                    {isI && <span className="bg-amber-500 text-gray-900 px-1 text-[10px] font-bold rounded">i</span>}
                    {isJ && <span className="bg-cyan-500 text-gray-900 px-1 text-[10px] font-bold rounded">j</span>}
                  </div>
                  <div
                    className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-300 ${
                      isHighlighted
                        ? "bg-teal-600/40 border-teal-400 scale-105 shadow-lg shadow-teal-500/30 text-white"
                        : "bg-gray-700/50 border-gray-600 text-gray-300"
                    } ${currentState.finished ? "!border-green-500" : ""}`}
                  >
                    {num}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">[{index}]</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50">
              <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                <List className="w-5 h-5" /> Current Subarray
              </h3>
              <div className="font-mono text-xl h-16 flex items-center justify-center bg-gray-900/50 rounded-lg text-gray-200">
                [{currentState.currentSub?.join(", ")}]
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Calculation
              </h3>
              <div className="space-y-2 text-sm text-gray-200">
                <div>Min: <span className="font-mono font-bold text-yellow-400">{currentState.minVal}</span></div>
                <div>Max: <span className="font-mono font-bold text-yellow-400">{currentState.maxVal}</span></div>
                <div>Range: <span className="font-mono font-bold text-yellow-400">{currentState.rangeText}</span></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
            <h3 className="font-bold text-lg text-gray-300 mb-4">Array Visualization</h3>
            <div id="opt-array-container" className="relative w-full h-24 flex justify-center items-center gap-2 flex-wrap pb-8">
              {nums.map((num, index) => {
                const isI = index === currentState.i;
                const isJ = index === currentState.j;
                const isK = index === currentState.k;
                return (
                  <div key={index} className="flex flex-col items-center relative min-w-[64px]">
                    <div className="flex gap-1 justify-center min-h-[24px]">
                      {isI && <span className="bg-amber-500 text-gray-900 px-1 text-[10px] font-bold rounded">i</span>}
                      {isJ && <span className="bg-yellow-500 text-gray-900 px-1 text-[10px] font-bold rounded animate-bounce">j</span>}
                      {isK && <span className="bg-blue-500 text-gray-900 px-1 text-[10px] font-bold rounded">k</span>}
                    </div>
                    <div
                      className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-300 ${
                        isJ
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 scale-110 shadow-lg shadow-yellow-500/50"
                          : isK
                          ? "bg-blue-500/60 scale-105 border-blue-400 shadow-lg text-white"
                          : "bg-gray-700/50 border-gray-600 text-gray-300"
                      } ${currentState.finished ? "!border-green-500" : ""}`}
                    >
                      {num}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">[{index}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 backdrop-blur-sm p-6 rounded-xl border border-indigo-700/50">
              <h3 className="font-bold text-lg text-center text-indigo-300 mb-4 flex items-center justify-center gap-2">
                <Layers className="w-5 h-5" /> Stack (indices)
              </h3>
              <div className="h-64 flex flex-col-reverse items-center gap-2 bg-gray-900/50 rounded-lg p-3 overflow-y-auto">
                {currentState.stack?.length > 0 ? (
                  currentState.stack.map((idx, s_idx) => (
                    <div
                      key={s_idx}
                      className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-2xl font-bold rounded-lg font-mono shadow-lg transition-all hover:scale-105 text-white"
                    >
                      {idx}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Empty</div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Calculation Details
              </h3>
              <div className="space-y-3 text-base text-gray-200">
                <div>Sum of Maximums: <span className="font-mono font-bold text-yellow-400">{currentState.sumMax ?? 0}</span></div>
                <div>Sum of Minimums: <span className="font-mono font-bold text-yellow-400">{currentState.sumMin ?? 0}</span></div>
                <hr className="border-gray-700" />
                <div className="text-lg">Total Range Sum: <span className="font-mono font-bold text-green-400">{(currentState.sumMax ?? 0) - (currentState.sumMin ?? 0)}</span></div>
              </div>
              <div
                className="mt-4 text-gray-300 text-sm h-24 overflow-y-auto bg-gray-900/30 rounded-lg p-3 border border-gray-750"
                dangerouslySetInnerHTML={{
                  __html: currentState.explanation || "Waiting for computation...",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default SubarrayRangesVisualizer;
