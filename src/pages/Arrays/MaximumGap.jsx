import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, TrendingUp, Hash } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const MaximumGap = () => {
  const [arrInput, setArrInput] = useState("3, 6, 9, 1");
  const [array, setArray] = useState([3, 6, 9, 1]);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateMaxGapHistory = useCallback((arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const newHistory = [];
    let maxGap = 0;

    const addState = (props) =>
      newHistory.push({
        arr: [...sorted],
        maxGap,
        currentGap: 0,
        currentIndex: -1,
        newMax: false,
        line: null,
        explanation: "",
        ...props,
      });

    addState({
      line: 3,
      currentIndex: -1,
      explanation: `Sort the array in ascending order: [${sorted.join(", ")}].`,
    });

    addState({
      line: 4,
      currentIndex: -1,
      explanation: `Initialize maxGap = 0.`,
    });

    for (let i = 1; i < sorted.length; i++) {
      const currentGap = sorted[i] - sorted[i - 1];
      const isUpdated = currentGap > maxGap;

      addState({
        line: 5,
        currentIndex: i,
        currentGap,
        explanation: `Checking gap between index ${i-1} (${sorted[i-1]}) and index ${i} (${sorted[i]}). Gap is ${currentGap}.`,
      });

      if (isUpdated) {
        maxGap = currentGap;
        addState({
          line: 6,
          currentIndex: i,
          currentGap,
          newMax: true,
          explanation: `Current gap ${currentGap} > maxGap. Update maxGap to ${maxGap}.`,
        });
      }
    }

    addState({
      line: 8,
      currentIndex: sorted.length,
      explanation: `Algorithm complete. Maximum gap between successive sorted elements is ${maxGap}.`,
    });

    load(newHistory);
  }, [load]);

  const handleLoad = useCallback((customArr) => {
    let arr = customArr;
    if (!arr) {
      arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10));
    }
    if (arr.some(isNaN) || arr.length < 2) {
      alert("Invalid input. Please enter at least 2 numbers.");
      return;
    }
    setArray(arr);
    setArrInput(arr.join(", "));
    generateMaxGapHistory(arr);
  }, [arrInput, generateMaxGapHistory]);

  const loadDefault = () => {
    handleLoad([3, 6, 9, 1]);
  };

  const generateNewArray = () => {
    const size = 6 + Math.floor(Math.random() * 4);
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 30));
    handleLoad(newArray);
  };

  const codeContent = {
    1: `int maximumGap(vector<int>& nums) {`,
    2: `    if (nums.size() < 2) return 0;`,
    3: `    sort(nums.begin(), nums.end());`,
    4: `    int maxGap = 0;`,
    5: `    for (int i = 1; i < nums.size(); i++) {`,
    6: `        maxGap = max(maxGap, nums[i] - nums[i-1]);`,
    7: `    }`,
    8: `    return maxGap;`,
    9: `}`
  };

  const {
    line,
    currentIndex = -1,
    currentGap = 0,
    maxGap = 0,
    newMax = false,
    arr: displayArray = array
  } = currentState;

  const isComplete = currentIndex > displayArray.length - 1;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
        placeholder="Array e.g. 3,6,9,1"
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
          <Terminal size={14} /> Active Gap Index
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          {currentIndex > 0 && currentIndex < displayArray.length ? `${currentIndex - 1} ↔ ${currentIndex}` : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none text-sm">
          <Hash size={14} /> Current Gap
        </h4>
        <div className="text-3xl font-mono text-cyan-300 font-bold">
          {currentIndex > 0 && currentIndex < displayArray.length ? currentGap : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Maximum Gap
        </h4>
        <div className={`text-3xl font-bold text-emerald-300 ${newMax ? "animate-bounce" : ""}`}>
          {maxGap}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong> <span className="font-mono text-cyan-300">O(N log N)</span> — Dominated by sorting array.
          </div>
          <div>
            <strong>Space:</strong> <span className="font-mono text-cyan-300">O(N)</span> or <span className="font-mono text-cyan-300">O(1)</span> depending on sort implementation space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Maximum Gap"
      description="Find the maximum difference between two successive elements in its sorted form."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter inputs to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter numbers (at least two) to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="flex justify-center items-end gap-3 min-h-[220px] pt-4">
          {displayArray.map((value, index) => {
            const isLeftActive = index === currentIndex - 1;
            const isRightActive = index === currentIndex;
            const isHighlight = isLeftActive || isRightActive;

            let cellStyle = "bg-gray-800 border-gray-700";
            if (isHighlight) {
              cellStyle = newMax
                ? "bg-amber-500/30 border-amber-500 scale-110 shadow-lg shadow-amber-500/25"
                : "bg-cyan-500/30 border-cyan-500 scale-105 shadow-md shadow-cyan-500/20";
            } else if (isComplete) {
              cellStyle = "bg-green-500/10 border-green-500/30";
            }

            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-white transition-all duration-300 text-base ${cellStyle}`}
                >
                  {value}
                </div>
                <div className="text-[10px] text-gray-500">
                  {isLeftActive ? "L" : isRightActive ? "R" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MaximumGap;
