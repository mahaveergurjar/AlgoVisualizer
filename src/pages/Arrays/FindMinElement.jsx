import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, Minimize2, Zap } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const FindMinElement = () => {
  const [arrInput, setArrInput] = useState("7, 3, 9, 2, 8, 1, 6, 4");
  const [array, setArray] = useState([7, 3, 9, 2, 8, 1, 6, 4]);

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
    let minIndex = 0;
    let comparisons = 0;

    // Init
    newHistory.push({
      array: arr,
      currentIndex: 0,
      minIndex: 0,
      comparisons: 0,
      message: `Initialize min_index = 0 (value: ${arr[0]}).`,
      line: 2,
    });

    for (let i = 1; i < arr.length; i++) {
      comparisons++;
      newHistory.push({
        array: arr,
        currentIndex: i,
        minIndex,
        comparisons,
        message: `Compare arr[${i}] (${arr[i]}) with current min arr[${minIndex}] (${arr[minIndex]}).`,
        line: 4,
      });

      if (arr[i] < arr[minIndex]) {
        minIndex = i;
        newHistory.push({
          array: arr,
          currentIndex: i,
          minIndex,
          comparisons,
          message: `arr[${i}] (${arr[i]}) is smaller. Update min_index = ${i}.`,
          line: 5,
        });
      }
    }

    newHistory.push({
      array: arr,
      currentIndex: arr.length,
      minIndex,
      comparisons,
      message: `Loop finished. Return minimum element arr[${minIndex}] = ${arr[minIndex]}.`,
      line: 8,
    });

    load(newHistory);
  }, [arrInput, load]);

  const loadDefault = () => {
    const defaultArr = [7, 3, 9, 2, 8, 1, 6, 4];
    handleLoad(defaultArr);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    handleLoad(newArray);
  };

  const codeContent = {
    1: `int findMin(vector<int>& arr) {`,
    2: `    int min_index = 0;`,
    3: `    for (int i = 1; i < arr.size(); i++) {`,
    4: `        if (arr[i] < arr[min_index]) {`,
    5: `            min_index = i;`,
    6: `        }`,
    7: `    }`,
    8: `    return arr[min_index];`,
    9: `}`
  };

  const {
    line,
    currentIndex = 0,
    minIndex = 0,
    comparisons = 0,
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
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
        placeholder="Array e.g. 7, 3, 9, 2"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
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
          i={currentIndex < displayArray.length ? currentIndex : "-"} | min={minIndex}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none text-sm">
          <Code size={14} /> Comparisons
        </h4>
        <div className="text-3xl font-mono text-cyan-300 font-bold">
          {comparisons}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Minimum Value
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {displayArray[minIndex] ?? "-"}
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
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span> — Only uses a pointer to track the minimum element.
          </div>
        </div>
      </div>
    </>
  );

  const maxVal = Math.max(...displayArray, 1);

  return (
    <VisualizerLayout
      title="Find Minimum Element"
      description="Visualizing the process of finding the smallest element in an array."
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
            const isMin = index === minIndex;
            const isProcessed = index < currentIndex;

            let barBg = "bg-gray-800 border-gray-700";
            if (isActive) {
              barBg = "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25";
            } else if (isMin) {
              barBg = isComplete
                ? "bg-green-500/40 border-green-400 scale-105 shadow-2xl shadow-green-500/30"
                : "bg-green-500/30 border-green-400 scale-105 shadow-lg shadow-green-500/25";
            } else if (isProcessed) {
              barBg = "bg-blue-500/20 border-blue-400";
            }

            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                <div
                  className={`w-14 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${barBg}`}
                  style={{ height: `${Math.min(160, (value / maxVal) * 120 + 60)}px` }}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-white font-bold text-base">{value}</span>
                  </div>
                  <div
                    className={`w-full text-center py-1 text-xs font-bold rounded-b-md ${
                      isMin ? "bg-green-500 text-white font-black" : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {isMin ? "MIN" : " "}
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

export default FindMinElement;