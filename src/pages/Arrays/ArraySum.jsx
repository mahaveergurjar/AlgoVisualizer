import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, Sigma, Zap } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const ArraySum = () => {
  const [arrInput, setArrInput] = useState("2, 5, 3, 8, 1, 7, 4, 6");
  const [array, setArray] = useState([2, 5, 3, 8, 1, 7, 4, 6]);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customArr) => {
    let arr = customArr;
    if (!arr) {
      arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10));
    }
    if (arr.some(isNaN) || arr.length === 0) {
      alert("Invalid input");
      return;
    }
    setArray(arr);
    setArrInput(arr.join(", "));

    const newHistory = [];
    let currentSum = 0;
    const partials = [];

    // Init
    newHistory.push({
      array: arr,
      currentIndex: -1,
      sum: 0,
      partialSums: [],
      message: "Initialize sum = 0.",
      line: 2,
    });

    for (let i = 0; i < arr.length; i++) {
      currentSum += arr[i];
      partials.push({ index: i, value: arr[i], cumulative: currentSum });
      newHistory.push({
        array: arr,
        currentIndex: i,
        sum: currentSum,
        partialSums: [...partials],
        message: `Add arr[${i}] (${arr[i]}) to sum. Current cumulative sum = ${currentSum}.`,
        line: 4,
      });
    }

    newHistory.push({
      array: arr,
      currentIndex: arr.length,
      sum: currentSum,
      partialSums: [...partials],
      message: `Loop finished. Return final sum = ${currentSum}.`,
      line: 6,
    });

    load(newHistory);
  }, [arrInput, load]);

  const loadDefault = () => {
    const defaultArr = [2, 5, 3, 8, 1, 7, 4, 6];
    handleLoad(defaultArr);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1);
    handleLoad(newArray);
  };

  const codeContent = {
    1: `int arraySum(vector<int>& arr) {`,
    2: `    int sum = 0;`,
    3: `    for (int i = 0; i < arr.size(); i++) {`,
    4: `        sum += arr[i];`,
    5: `    }`,
    6: `    return sum;`,
    7: `}`
  };

  const {
    line,
    currentIndex = -1,
    sum = 0,
    partialSums = [],
    displayArray = array
  } = currentState;

  const totalSum = displayArray.reduce((acc, val) => acc + val, 0);
  const isComplete = currentIndex >= displayArray.length;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm text-sm"
        placeholder="Array e.g. 2, 5, 3, 8"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
          >
            Load & Visualize
          </button>
          <button
            onClick={loadDefault}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition cursor-pointer text-sm"
          >
            Default
          </button>
          <button
            onClick={generateNewArray}
            className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-xl font-medium transition cursor-pointer text-sm"
          >
            Random
          </button>
        </>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none text-sm">
          <Terminal size={14} /> Pointers
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          i = {currentIndex >= 0 && currentIndex < displayArray.length ? currentIndex : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none text-sm">
          <Sigma size={14} /> Sum
        </h4>
        <div className="text-3xl font-mono text-green-300 font-bold">
          {sum} / {totalSum}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Progress
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {isComplete ? "Done" : `${currentIndex + 1} / ${displayArray.length}`}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N)</span> — Single pass through the array.
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span> — Only uses a single variable for cumulative sum.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Array Sum"
      description="Calculate the sum of all elements in an array through cumulative addition."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.message || "Enter inputs to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter numbers to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="flex justify-center items-end gap-3 min-h-[220px] pt-4">
          {displayArray.map((value, index) => {
            const isActive = index === currentIndex && !isComplete;
            const isProcessed = index < currentIndex;

            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                <div
                  className={`w-14 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                      : isProcessed
                      ? "bg-green-500/20 border-green-400"
                      : "bg-blue-500/20 border-blue-400"
                  }`}
                  style={{ height: `${Math.min(150, value * 15 + 60)}px` }}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-white font-bold text-base">{value}</span>
                  </div>
                  <div className="w-full text-center py-1 text-xs font-bold bg-gray-700 text-gray-300 rounded-b-md">
                    +{value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cumulative Sum Progress Bar */}
        <div className="bg-gray-800 rounded-xl p-4 max-w-lg mx-auto border border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-2">Cumulative Sum Progress</div>
            <div className="text-2xl font-bold text-green-400">
              {sum} / {totalSum}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 overflow-hidden">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${totalSum > 0 ? (sum / totalSum) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Steps Table */}
        {partialSums.length > 0 && (
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-4">Step-by-Step Calculation</h3>
            <div className="overflow-x-auto max-h-[160px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 font-semibold">
                    <th className="py-2">Step</th>
                    <th className="py-2">Index</th>
                    <th className="py-2">Value</th>
                    <th className="py-2">Add</th>
                    <th className="py-2">Cumulative Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {partialSums.map((step, idx) => (
                    <tr key={idx} className="border-b border-gray-800 text-gray-300 font-mono">
                      <td className="py-2">{idx + 1}</td>
                      <td className="py-2">[{step.index}]</td>
                      <td className="py-2">{step.value}</td>
                      <td className="py-2 text-green-400">+{step.value}</td>
                      <td className="py-2 text-blue-400">{step.cumulative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default ArraySum;