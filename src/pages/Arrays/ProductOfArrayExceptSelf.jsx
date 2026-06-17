import React, { useState, useCallback } from "react";
import { Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const ProductOfArrayExceptSelf = () => {
  const [arrayInput, setArrayInput] = useState("1,2,3,4");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateProductHistory = useCallback((arr) => {
    const newHistory = [];
    const n = arr.length;
    const result = Array(n).fill(1);
    const prefix = Array(n).fill(1);
    const suffix = Array(n).fill(1);

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        result: [...result],
        prefix: [...prefix],
        suffix: [...suffix],
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: `Calculate product of array except self for [${arr.join(", ")}].` });

    addState({ line: 4, explanation: `Step 1: Calculate prefix products (left to right).` });

    for (let i = 1; i < n; i++) {
      prefix[i] = prefix[i - 1] * arr[i - 1];
      addState({
        line: 5,
        currentIndex: i,
        prefixPhase: true,
        explanation: `prefix[${i}] = prefix[${i - 1}] × arr[${i - 1}] = ${prefix[i - 1]} × ${arr[i - 1]} = ${prefix[i]}.`,
      });
    }

    addState({ line: 6, explanation: `Step 2: Calculate suffix products (right to left).` });

    for (let i = n - 2; i >= 0; i--) {
      suffix[i] = suffix[i + 1] * arr[i + 1];
      addState({
        line: 7,
        currentIndex: i,
        suffixPhase: true,
        explanation: `suffix[${i}] = suffix[${i + 1}] × arr[${i + 1}] = ${suffix[i + 1]} × ${arr[i + 1]} = ${suffix[i]}.`,
      });
    }

    addState({ line: 8, explanation: `Step 3: Multiply prefix and suffix for final result.` });

    for (let i = 0; i < n; i++) {
      result[i] = prefix[i] * suffix[i];
      addState({
        line: 9,
        currentIndex: i,
        finalPhase: true,
        explanation: `result[${i}] = prefix[${i}] × suffix[${i}] = ${prefix[i]} × ${suffix[i]} = ${result[i]}.`,
      });
    }

    addState({
      line: 10,
      finished: true,
      explanation: `Complete! Product array: [${result.join(", ")}].`,
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
    generateProductHistory(arr);
  };

  const {
    arr = [],
    result = [],
    prefix = [],
    suffix = [],
    currentIndex = -1,
    explanation = "",
    prefixPhase = false,
    suffixPhase = false,
    finalPhase = false,
    finished = false,
    line = 2
  } = currentState;

  const codeContent = {
    1: `vector<int> productExceptSelf(vector<int>& nums) {`,
    2: `    int n = nums.size();`,
    3: `    vector<int> prefix(n, 1), suffix(n, 1), result(n);`,
    4: `    for (int i = 1; i < n; i++)`,
    5: `        prefix[i] = prefix[i-1] * nums[i-1];`,
    6: `    for (int i = n - 2; i >= 0; i--)`,
    7: `        suffix[i] = suffix[i+1] * nums[i+1];`,
    8: `    for (int i = 0; i < n; i++)`,
    9: `        result[i] = prefix[i] * suffix[i];`,
    10: `    return result;`,
    11: `}`
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
        placeholder="e.g., 1,2,3,4"
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
          Current Index
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {currentIndex !== -1 ? currentIndex : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Phase
        </h4>
        <div className="text-xl font-bold text-purple-400 uppercase select-none">
          {prefixPhase ? "Prefix" : suffixPhase ? "Suffix" : finalPhase ? "Multiply" : finished ? "Done" : "Init"}
        </div>
      </div>
      <div className="sm:col-span-2 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Three passes.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Clear arrays representation.
          </div>
        </div>
      </div>
    </>
  );

  const renderArray = (values, label, highlightColor = "purple") => (
    <div className="space-y-2">
      <h4 className="text-sm text-gray-400 font-mono">{label}</h4>
      <div className="flex gap-2 flex-wrap">
        {values.map((value, index) => {
          const isActive = index === currentIndex;
          let bgColor = "bg-gray-700";
          let borderColor = "border-gray-600";
          
          if (isActive) {
            if (highlightColor === "purple") {
              bgColor = "bg-purple-600/50";
              borderColor = "border-purple-500";
            } else if (highlightColor === "cyan") {
              bgColor = "bg-cyan-600/50";
              borderColor = "border-cyan-500";
            } else if (highlightColor === "green") {
              bgColor = "bg-green-600/50";
              borderColor = "border-green-500";
            }
          }

          if (finished && label === "Result") {
            bgColor = "bg-green-600/30";
            borderColor = "border-green-500/50";
          }

          return (
            <div key={index} className="flex flex-col items-center relative min-w-[64px]">
              {isActive && (
                <div className="absolute bottom-full mb-1 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400 animate-bounce" />
                  <span className="text-rose-400 text-xs font-bold font-mono">i</span>
                </div>
              )}
              <div className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300`}>
                <span className="text-lg text-gray-200">{value}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{index}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <VisualizerLayout
      title="Product of Array Except Self"
      description="LeetCode #238 - Calculate products without division using prefix and suffix arrays."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter an array to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-6">
        {renderArray(arr, "Original Array", "gray")}
        {(prefixPhase || suffixPhase || finalPhase || finished) && renderArray(prefix, "Prefix Products", "purple")}
        {(suffixPhase || finalPhase || finished) && renderArray(suffix, "Suffix Products", "cyan")}
        {(finalPhase || finished) && renderArray(result, "Result", "green")}
      </div>
    </VisualizerLayout>
  );
};

export default ProductOfArrayExceptSelf;
