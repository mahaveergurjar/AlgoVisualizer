import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock, Cpu } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const SplitArrayLargestSum = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("7,2,5,10,8");
  const [kInput, setKInput] = useState(2);
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateSplitHistory = useCallback((arr, kVal) => {
    const newHistory = [];
    let left = Math.max(...arr);
    let right = arr.reduce((a, b) => a + b, 0);
    let ans = right;

    const addState = (props) => {
      newHistory.push({
        nums: [...arr],
        k: kVal,
        left,
        right,
        mid: props.mid ?? null,
        ans,
        explanation: props.explanation || "",
        line: props.line || 5,
        finished: props.finished || false,
      });
    };

    addState({
      line: 2,
      explanation: `Initialize binary search range. Left = max(nums) = ${left}, Right = sum(nums) = ${right}.`,
    });

    while (left <= right) {
      addState({
        line: 5,
        explanation: `Checking condition: left <= right (${left} <= ${right}).`,
      });

      const mid = Math.floor((left + right) / 2);
      addState({
        line: 6,
        mid,
        explanation: `Compute mid = (left + right) / 2 = (${left} + ${right}) / 2 = ${mid}.`,
      });

      let subCount = 1, current = 0;
      let splitsDetail = [];
      let tempSubarray = [];
      for (let n of arr) {
        if (current + n > mid) {
          splitsDetail.push(`[${tempSubarray.join(", ")}] (sum: ${current})`);
          subCount++;
          current = n;
          tempSubarray = [n];
        } else {
          current += n;
          tempSubarray.push(n);
        }
      }
      splitsDetail.push(`[${tempSubarray.join(", ")}] (sum: ${current})`);

      const possible = subCount <= kVal;
      addState({
        line: 7,
        mid,
        explanation: `Check if split is possible with max sum ${mid}. Subarrays: ${splitsDetail.join(" | ")}, count = ${subCount}. Can split into <= ${kVal} groups? ${possible ? "Yes" : "No"}.`,
      });

      if (possible) {
        ans = mid;
        right = mid - 1;
        addState({
          line: 8,
          mid,
          explanation: `Possible! Update ans = ${mid}. Search left half by setting right = mid - 1 = ${mid - 1}.`,
        });
      } else {
        left = mid + 1;
        addState({
          line: 11,
          mid,
          explanation: `Not possible! Subarrays count ${subCount} > k (${kVal}). Search right half by setting left = mid + 1 = ${mid + 1}.`,
        });
      }
    }

    addState({
      line: 14,
      finished: true,
      explanation: `Binary search complete. Minimized largest sum is ${ans}.`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    const kVal = parseInt(kInput, 10);
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    if (isNaN(kVal) || kVal < 1 || kVal > arr.length) {
      alert(`Please enter a valid k between 1 and ${arr.length}.`);
      return;
    }
    generateSplitHistory(arr, kVal);
  };

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 6 }, () => Math.floor(Math.random() * 15) + 1);
    setArrayInput(newArray.join(","));
    generateSplitHistory(newArray, kInput);
  };

  const {
    nums = [],
    left = 0,
    right = 0,
    mid = null,
    ans = 0,
    explanation = "",
    line = 2
  } = currentState;

  const codeContent = {
    1: `int splitArray(vector<int>& nums, int k) {`,
    2: `    int left = *max_element(nums.begin(), nums.end());`,
    3: `    int right = accumulate(nums.begin(), nums.end(), 0);`,
    4: `    int ans = right;`,
    5: `    while (left <= right) {`,
    6: `        int mid = left + (right - left) / 2;`,
    7: `        if (canSplit(nums, mid, k)) {`,
    8: `            ans = mid;`,
    9: `            right = mid - 1;`,
    10: `        } else {`,
    11: `            left = mid + 1;`,
    12: `        }`,
    13: `    }`,
    14: `    return ans;`,
    15: `}`
  };

  const inputSection = (
    <>
      <input 
        id="array-input" 
        type="text" 
        value={arrayInput} 
        onChange={(e) => setArrayInput(e.target.value)} 
        disabled={isLoaded} 
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., 7,2,5,10,8"
      />
      <input 
        id="k-input" 
        type="number" 
        min="1"
        max={nums.length || 10}
        value={kInput} 
        onChange={(e) => setKInput(parseInt(e.target.value, 10))} 
        disabled={isLoaded} 
        className="w-full md:w-24 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="k"
      />
      {!isLoaded && (
        <button 
          onClick={loadProblem} 
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
      <button
        onClick={generateRandomArray}
        className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl font-bold transition-all text-white shadow-lg cursor-pointer"
      >
        Random
      </button>
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none">
          Search Range [L, R]
        </h4>
        <div className="text-2xl font-mono text-red-300">
          [{left}, {right}]
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Mid (Target Sum)
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {mid !== null ? mid : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Current Ans
        </h4>
        <div className="text-3xl font-mono text-green-300">
          {ans}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n log(Sum))</span> - Binary search with verify scans.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - Constant extra variables.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Split Array Largest Sum"
      description="LeetCode #410 - Split array into k contiguous subarrays to minimize the largest sum of any subarray."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array and k parts to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Array Problems
          </button>
        )}
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          Binary Search Visualization
        </h3>

        {/* Array Visualization */}
        <div className="flex justify-center items-end gap-4 mb-8 min-h-[220px]">
          {nums.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="text-gray-400 text-sm font-mono">[{index}]</div>
              <div
                className="w-16 bg-blue-500/30 border-2 border-blue-400 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all duration-300 hover:scale-105"
                style={{ height: `${value * 10 + 60}px` }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SplitArrayLargestSum;
