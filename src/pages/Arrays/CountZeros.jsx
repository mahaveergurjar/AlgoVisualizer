import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, Hash, Zap } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const CountZeros = () => {
  const [arrInput, setArrInput] = useState("1, 0, 5, 0, 0, 3, 0, 8");
  const [array, setArray] = useState([1, 0, 5, 0, 0, 3, 0, 8]);

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
    let count = 0;

    // Init
    newHistory.push({
      array: arr,
      currentIndex: -1,
      count: 0,
      message: "Initialize counter count = 0.",
      line: 2,
    });

    for (let i = 0; i < arr.length; i++) {
      newHistory.push({
        array: arr,
        currentIndex: i,
        count,
        message: `Check if element at index ${i} is 0 (arr[${i}] = ${arr[i]}).`,
        line: 4,
      });

      if (arr[i] === 0) {
        count++;
        newHistory.push({
          array: arr,
          currentIndex: i,
          count,
          message: `Element at index ${i} is 0. Increment count to ${count}.`,
          line: 5,
        });
      }
    }

    newHistory.push({
      array: arr,
      currentIndex: arr.length,
      count,
      message: `Loop finished. Return final count = ${count}.`,
      line: 8,
    });

    load(newHistory);
  }, [arrInput, load]);

  const loadDefault = () => {
    const defaultArr = [1, 0, 5, 0, 0, 3, 0, 8];
    handleLoad(defaultArr);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () =>
      Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 1 : 0
    );
    handleLoad(newArray);
  };

  const codeContent = {
    1: `int countZeros(vector<int>& arr) {`,
    2: `    int count = 0;`,
    3: `    for (int i = 0; i < arr.size(); i++) {`,
    4: `        if (arr[i] == 0) {`,
    5: `            count++;`,
    6: `        }`,
    7: `    }`,
    8: `    return count;`,
    9: `}`
  };

  const {
    line,
    currentIndex = -1,
    count = 0,
    displayArray = array
  } = currentState;

  const isComplete = currentIndex >= displayArray.length;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm text-sm"
        placeholder="Array e.g. 1, 0, 5, 0"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
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
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-xl font-medium transition cursor-pointer text-sm"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none text-sm">
          <Hash size={14} /> Zeros Count
        </h4>
        <div className="text-3xl font-mono text-cyan-300 font-bold">
          {count}
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
        <h4 className="text-cyan-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N)</span> — Single linear scan over all elements.
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span> — Only uses a single count variable.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Count Zeros"
      description="Count the number of zero elements in an array through linear traversal."
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
            const isZero = value === 0;
            const isProcessed = index < currentIndex;

            let barBg = "bg-blue-500/20 border-blue-400";
            if (isActive) {
              barBg = "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25";
            } else if (isProcessed && isZero) {
              barBg = "bg-red-500/40 border-red-400 shadow-lg shadow-red-500/25";
            } else if (isZero) {
              barBg = "bg-red-500/20 border-red-400 scale-105";
            }

            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                <div
                  className={`w-14 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${barBg}`}
                  style={{ height: `${value === 0 ? 60 : Math.min(150, value * 10 + 60)}px` }}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-white font-bold text-base">{value}</span>
                  </div>
                  <div
                    className={`w-full text-center py-1 text-xs font-bold rounded-b-md ${
                      value === 0 ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                    }`}
                  >
                    {value === 0 ? "ZERO" : " "}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default CountZeros;