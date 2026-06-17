import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, Hash, Zap } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const MaxConsecutiveOnes = () => {
  const [numsInput, setNumsInput] = useState("1,1,1,0,0,0,1,1,1,1,0");
  const [kInput, setKInput] = useState("2");

  const [nums, setNums] = useState([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0]);
  const [k, setK] = useState(2);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;
  const state = currentState || {};

  const handleLoad = useCallback((customNums, customK) => {
    let numsArr = customNums;
    let kVal = customK;
    if (!numsArr) {
      numsArr = numsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .map(Number);
      kVal = parseInt(kInput, 10);
    }
    if (numsArr.some(isNaN) || isNaN(kVal)) {
      alert("Invalid input. Please use comma-separated numbers for the array.");
      return;
    }
    setNums(numsArr);
    setNumsInput(numsArr.join(", "));
    setK(kVal);
    setKInput(String(kVal));

    const newHistory = [];
    let left = 0;
    let zeroCount = 0;
    let maxLength = 0;

    const addState = (props) =>
      newHistory.push({
        nums: [...numsArr],
        left,
        right: null,
        zeroCount,
        maxLength,
        line: null,
        k: kVal,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize left pointer to 0." });
    addState({ line: 3, explanation: "Initialize zeroCount to 0." });
    addState({ line: 4, explanation: "Initialize maxLength to 0." });

    for (let right = 0; right < numsArr.length; right++) {
      addState({ line: 6, right, explanation: `Move right pointer to index ${right} (value: ${numsArr[right]}).` });
      if (numsArr[right] === 0) {
        zeroCount++;
        addState({ line: 8, right, explanation: `Element at index ${right} is 0. Increment zeroCount to ${zeroCount}.` });
      }

      while (zeroCount > kVal) {
        addState({ line: 11, right, explanation: `zeroCount (${zeroCount}) exceeds k (${kVal}). Shrink window from left.` });
        if (numsArr[left] === 0) {
          zeroCount--;
          addState({ line: 13, right, explanation: `Element at left pointer (index ${left}) is 0. Decrement zeroCount to ${zeroCount}.` });
        }
        left++;
        addState({ line: 15, right, explanation: `Increment left pointer to index ${left}.` });
      }

      maxLength = Math.max(maxLength, right - left + 1);
      addState({ line: 18, right, explanation: `Calculate window length: right - left + 1 = ${right - left + 1}. Update maxLength to ${maxLength}.` });
    }

    addState({ line: 21, left, right: numsArr.length - 1, explanation: `Traversal complete. Return maximum consecutive ones with flipped zeros: ${maxLength}` });

    load(newHistory);
  }, [numsInput, kInput, load]);

  const loadDefault = () => {
    handleLoad([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2);
  };

  const generateNewArray = () => {
    const size = 10 + Math.floor(Math.random() * 5);
    const newArray = Array.from({ length: size }, () => (Math.random() > 0.3 ? 1 : 0));
    const randomK = 1 + Math.floor(Math.random() * 3);
    handleLoad(newArray, randomK);
  };

  const codeContent = {
    1: `int longestOnes(vector<int>& nums, int k) {`,
    2: `    int left = 0;`,
    3: `    int zeroCount = 0;`,
    4: `    int maxLength = 0;`,
    5: ``,
    6: `    for (int right = 0; right < nums.size(); right++) {`,
    7: `        if (nums[right] == 0) {`,
    8: `            zeroCount++;`,
    9: `        }`,
    10: ``,
    11: `        while (zeroCount > k) {`,
    12: `            if (nums[left] == 0) {`,
    13: `                zeroCount--;`,
    14: `            }`,
    15: `            left++;`,
    16: `        }`,
    17: ``,
    18: `        maxLength = max(maxLength, right - left + 1);`,
    19: `    }`,
    20: ``,
    21: `    return maxLength;`,
    22: `}`
  };

  const currentNums = isLoaded ? (state.nums || nums) : nums;
  const leftIdx = isLoaded ? state.left : null;
  const rightIdx = isLoaded ? state.right : null;

  const inputSection = (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={numsInput}
          onChange={(e) => setNumsInput(e.target.value)}
          disabled={isLoaded}
          className="flex-1 min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400 shadow-sm text-sm"
          placeholder="Array e.g. 1,1,1,0,0,0,1"
        />
        <input
          type="number"
          value={kInput}
          onChange={(e) => setKInput(e.target.value)}
          disabled={isLoaded}
          className="w-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400 shadow-sm text-sm"
          placeholder="k"
        />
        {!isLoaded && (
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
          >
            Load & Visualize
          </button>
        )}
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2">
          <button
            onClick={loadDefault}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg font-medium transition cursor-pointer text-xs"
          >
            Default
          </button>
          <button
            onClick={generateNewArray}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg font-medium transition cursor-pointer text-xs"
          >
            Random
          </button>
        </div>
      )}
    </div>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none text-sm">
          <Terminal size={14} /> Pointers
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          L={leftIdx ?? "-"} | R={rightIdx ?? "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none text-sm">
          <Hash size={14} /> Zeros Flipped
        </h4>
        <div className="text-3xl font-mono text-red-300 font-bold">
          {state.zeroCount ?? 0} <span className="text-xs text-gray-500">/ {k}</span>
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Max Length
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {state.maxLength ?? 0}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-amber-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong> <span className="font-mono text-cyan-300">O(N)</span> — Sliding window pointers traverse the array at most twice.
          </div>
          <div>
            <strong>Space:</strong> <span className="font-mono text-cyan-300">O(1)</span> — Only uses auxiliary pointers and zero counters.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Max Consecutive Ones III"
      description="Find the maximum number of consecutive 1s in the array if you can flip at most k 0s."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={state.line}
      message={state.explanation || "Enter inputs to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array and k values to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="p-6 bg-gray-900/40 rounded-xl border border-gray-800">
          <div
            id="main-array-container"
            className="w-full h-24 flex justify-center items-center gap-2 flex-wrap relative"
          >
            {currentNums.map((num, index) => {
              const isInWindow = leftIdx !== null && rightIdx !== null && index >= leftIdx && index <= rightIdx;
              const isFlipped = isInWindow && num === 0;

              let cellStyle = "bg-gray-700/50 border-gray-600 hover:scale-105";
              if (isFlipped) {
                cellStyle = "bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-400 scale-110 shadow-lg shadow-amber-500/50";
              } else if (isInWindow) {
                cellStyle = "bg-gray-600 border-amber-400 scale-105 shadow-lg text-white";
              }

              return (
                <div
                  key={index}
                  id={`main-array-container-element-${index}`}
                  className={`w-12 h-12 flex flex-col items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-300 ${cellStyle}`}
                >
                  <span className="text-xs text-[10px] text-gray-400 font-mono scale-75">[{index}]</span>
                  <span>{num}</span>
                </div>
              );
            })}
          </div>

          {isLoaded && leftIdx !== null && (
            <VisualizerPointer
              index={leftIdx}
              containerId="main-array-container"
              color="red"
              label="L"
            />
          )}
          {isLoaded && rightIdx !== null && (
            <VisualizerPointer
              index={rightIdx}
              containerId="main-array-container"
              color="blue"
              label="R"
              direction="up"
            />
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MaxConsecutiveOnes;
