import React, { useState, useCallback } from "react";
import { Clock, TrendingUp } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const MaximumSubarray = () => {
  const [arrayInput, setArrayInput] = useState("-2,1,-3,4,-1,2,1,-5,4");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateKadaneHistory = useCallback((arr) => {
    const newHistory = [];
    let maxSum = arr[0];
    let currentSum = arr[0];

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        maxSum,
        currentSum,
        explanation: "",
        ...props,
      });

    addState({ 
      line: 2, 
      currentIndex: 0,
      subarrayStart: 0,
      subarrayEnd: 0,
      explanation: `Initialize: currentSum = ${arr[0]}, maxSum = ${arr[0]}.` 
    });

    let tempStart = 0;
    let finalStart = 0;
    let finalEnd = 0;

    for (let i = 1; i < arr.length; i++) {
      addState({
        line: 3,
        currentIndex: i,
        subarrayStart: tempStart,
        subarrayEnd: i - 1,
        explanation: `At index ${i}: arr[${i}] = ${arr[i]}, currentSum = ${currentSum}.`,
      });

      if (currentSum < 0) {
        currentSum = arr[i];
        tempStart = i;
        addState({
          line: 4,
          currentIndex: i,
          subarrayStart: i,
          subarrayEnd: i,
          reset: true,
          explanation: `currentSum was negative (${currentSum - arr[i]}). Reset: currentSum = arr[${i}] = ${arr[i]}.`,
        });
      } else {
        currentSum += arr[i];
        addState({
          line: 5,
          currentIndex: i,
          subarrayStart: tempStart,
          subarrayEnd: i,
          explanation: `Add to current: currentSum = ${currentSum - arr[i]} + ${arr[i]} = ${currentSum}.`,
        });
      }

      if (currentSum > maxSum) {
        maxSum = currentSum;
        finalStart = tempStart;
        finalEnd = i;
        addState({
          line: 6,
          currentIndex: i,
          subarrayStart: finalStart,
          subarrayEnd: finalEnd,
          newMax: true,
          explanation: `New maximum! maxSum = ${maxSum}. Subarray from index ${finalStart} to ${finalEnd}.`,
        });
      }
    }

    addState({
      line: 8,
      finished: true,
      subarrayStart: finalStart,
      subarrayEnd: finalEnd,
      explanation: `Complete! Maximum subarray sum = ${maxSum}, from index ${finalStart} to ${finalEnd}: [${arr.slice(finalStart, finalEnd + 1).join(", ")}].`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    generateKadaneHistory(arr);
  };

  const {
    arr = [],
    currentIndex = -1,
    maxSum = 0,
    currentSum = 0,
    subarrayStart = -1,
    subarrayEnd = -1,
    explanation = "",
    finished = false,
    newMax = false,
    line = 2
  } = currentState;

  const codeContent = {
    1: `int maxSubArray(vector<int>& nums) {`,
    2: `    int maxSum = nums[0], currentSum = nums[0];`,
    3: `    for (int i = 1; i < nums.size(); i++) {`,
    4: `        if (currentSum < 0) currentSum = nums[i];`,
    5: `        else currentSum += nums[i];`,
    6: `        maxSum = max(maxSum, currentSum);`,
    7: `    }`,
    8: `    return maxSum;`,
    9: `}`
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
        placeholder="e.g., -2,1,-3,4,-1,2,1,-5,4"
      />
      {!isLoaded && (
        <button 
          onClick={loadProblem} 
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Current Sum
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {currentSum}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Max Sum
        </h4>
        <div className="text-3xl font-mono text-purple-400">
          {maxSum}
        </div>
      </div>
      <div className="sm:col-span-2 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Single pass.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - Constant extra space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Maximum Subarray (Kadane's)"
      description="LeetCode #53 - Find the contiguous subarray with the largest sum."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter an array to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
        <h3 className="font-bold text-lg text-gray-300 mb-4">Array Visualization</h3>
        <div className="flex gap-2 flex-wrap min-h-[100px] items-end pb-2">
          {arr.map((value, index) => {
            const isActive = index === currentIndex;
            const inSubarray = index >= subarrayStart && index <= subarrayEnd;
            
            let bgColor = "bg-gray-700";
            let borderColor = "border-gray-600";
            let textColor = "text-gray-200";

            if (inSubarray && !finished) {
              bgColor = "bg-cyan-600/30";
              borderColor = "border-cyan-500/50";
            }

            if (isActive) {
              bgColor = "bg-purple-600/50";
              borderColor = "border-purple-500";
              textColor = "text-purple-100";
            }

            if (newMax && inSubarray) {
              bgColor = "bg-amber-600/50";
              borderColor = "border-amber-500";
            }

            if (finished && inSubarray) {
              bgColor = "bg-green-600/50";
              borderColor = "border-green-500";
              textColor = "text-green-100";
            }

            return (
              <div key={index} className="flex flex-col items-center relative min-w-[64px]">
                {isActive && (
                  <div className="absolute bottom-full mb-1 flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400 animate-bounce" />
                    <span className="text-rose-400 text-xs font-bold font-mono">i</span>
                  </div>
                )}
                <div className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${textColor}`}>
                  <span className="text-lg">{value}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">{index}</span>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MaximumSubarray;
