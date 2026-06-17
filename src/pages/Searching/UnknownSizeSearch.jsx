import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

class ArrayReader {
  constructor(array) {
    this.array = array;
  }

  get(index) {
    if (index >= this.array.length) {
      return Number.MAX_SAFE_INTEGER;
    }
    return this.array[index];
  }
}

const UnknownSizeSearch = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("-1, 0, 3, 5, 9, 12, 15, 18, 21, 24, 27, 30");
  const [targetInput, setTargetInput] = useState("24");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((localArray, localTarget) => {
    const reader = new ArrayReader(localArray);
    const newHistory = [];
    let stepCount = 0;
    let foundIndex = -1;
    let phase = "exponential";
    let left = 0, right = 0;
    let currentBounds = [0, 0];
    let exponentialIndex = 1;
    let checks = 0;
    let comparisons = 0;

    const addState = (explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        array: [...localArray],
        target: localTarget,
        foundIndex,
        step: stepCount++,
        explanation,
        line,
        phase,
        left,
        right,
        currentBounds: [...currentBounds],
        exponentialIndex,
        checks,
        comparisons,
        ...extraProps,
      });
    };

    // Initial setup
    addState("Initialize search in sorted array of unknown size", 6);
    addState(`Target value: ${localTarget}`, 6);
    addState("Starting exponential search to find the bounds...", 6);

    checks++;
    if (reader.get(0) === Number.MAX_SAFE_INTEGER) {
      foundIndex = -1;
      addState("Array is empty - target not found", 6);
    } else if (reader.get(0) === localTarget) {
      foundIndex = 0;
      addState("Target found at first element! Index: 0", 7, { isMatch: true });
    } else {
      exponentialIndex = 1;
      
      while (reader.get(exponentialIndex) < localTarget) {
        checks++;
        comparisons++;
        addState(`Exponential step: Checking index ${exponentialIndex}, value ${reader.get(exponentialIndex)}`, 11);
        addState(`Value ${reader.get(exponentialIndex)} < target ${localTarget}, doubling search range...`, 12);
        
        exponentialIndex *= 2;
        currentBounds = [Math.floor(exponentialIndex / 2), exponentialIndex];
        addState(`New search range: [${Math.floor(exponentialIndex / 2)}, ${exponentialIndex}]`, 12);
      }

      left = Math.floor(exponentialIndex / 2);
      right = exponentialIndex;
      currentBounds = [left, right];
      addState(`Bounds found! Target is between indices ${left} and ${right}`, 16);
      addState(`Switching to binary search within range [${left}, ${right}]`, 16);

      phase = "binary";

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midValue = reader.get(mid);
        checks++;
        comparisons++;
        
        currentBounds = [left, right];
        addState(`Binary search: Checking middle index ${mid}, value ${midValue === Number.MAX_SAFE_INTEGER ? "∞" : midValue}`, 18);

        if (midValue === localTarget) {
          foundIndex = mid;
          addState(`Target found at index ${mid}`, 20, { isMatch: true });
          break;
        } else if (midValue === Number.MAX_SAFE_INTEGER || midValue > localTarget) {
          right = mid - 1;
          addState(`Target is smaller or out of bounds, searching left half: [${left}, ${mid - 1}]`, 22);
        } else {
          left = mid + 1;
          addState(`Target is greater, searching right half: [${mid + 1}, ${right}]`, 23);
        }
      }
    }

    if (foundIndex === -1) {
      addState(`Target ${localTarget} not found in the array`, 21);
    } else {
      addState(`Search complete! Target ${localTarget} found at index ${foundIndex}`, 20, { isComplete: true });
    }

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const tgt = parseInt(targetInput, 10);

    if (arr.some(isNaN) || isNaN(tgt)) {
      alert("Invalid input. Please use comma-separated numbers for the array and a valid target.");
      return;
    }

    generateHistory(arr, tgt);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 8; 
    const start = Math.floor(Math.random() * 10) - 5;
    const array = Array.from({ length }, (_, i) => start + i * 3);
    const target = array[Math.floor(Math.random() * array.length)];
    
    setArrayInput(array.join(", "));
    setTargetInput(target.toString());
    generateHistory(array, target);
  };

  const {
    array = [],
    target = 0,
    foundIndex = -1,
    line = 6,
    explanation = "",
    phase = "exponential",
    left = 0,
    right = 0,
    currentBounds = [0, 0],
    exponentialIndex = 1,
    checks = 0
  } = currentState;

  const codeContent = {
    1: "int searchUnknownSize(ArrayReader& reader, int target) {",
    2: "    if (reader.get(0) == INT_MAX) return -1;",
    3: "    if (reader.get(0) == target) return 0;",
    4: "    ",
    5: "    // Exponential search to find bounds",
    6: "    int i = 1;",
    7: "    while (reader.get(i) < target) {",
    8: "        i *= 2; // Double the range",
    9: "    }",
    10: "    ",
    11: "    // Binary search in found range",
    12: "    int left = i / 2, right = i;",
    13: "    while (left <= right) {",
    14: "        int mid = (left + right) / 2;",
    15: "        int val = reader.get(mid);",
    16: "        if (val == target) return mid;",
    17: "        else if (val > target || val == INT_MAX)",
    18: "            right = mid - 1;",
    19: "        else left = mid + 1;",
    20: "    }",
    21: "    return -1;",
    22: "}"
  };

  const getCellColor = (index) => {
    const [boundsLeft, boundsRight] = currentBounds;
    const isInBounds = index >= boundsLeft && index <= boundsRight;
    const isOutOfBounds = index >= array.length;

    if (index === foundIndex) {
      return "bg-green-500/30 border-green-400 text-white shadow-lg shadow-green-500/20 scale-110";
    }
    if (isOutOfBounds) {
      return "bg-red-500/20 border-red-500 text-gray-500";
    }
    if (phase === "exponential" && index === exponentialIndex) {
      return "bg-orange-500/30 border-orange-400 text-white scale-110";
    }
    if (phase === "binary" && index === Math.floor((left + right) / 2)) {
      return "bg-blue-500/30 border-blue-400 text-white scale-110";
    }
    if (isInBounds) {
      return "bg-purple-500/25 border-purple-500/50 text-white";
    }
    return "bg-gray-950 border-gray-700 text-gray-400";
  };

  const visibleIndices = Array.from({ length: 16 }, (_, i) => i);

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        placeholder="Enter sorted numbers separated by commas..."
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 font-mono shadow-sm"
      />
      <input
        id="target-input"
        type="number"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        disabled={isLoaded}
        className="w-full md:w-24 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-purple-500 font-mono shadow-sm text-center"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-400 select-none">
          Target / Phase
        </h4>
        <div className="text-xl font-mono text-purple-400 font-bold uppercase">
          {target} ({phase})
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Checks
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {checks}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Bounds
        </h4>
        <div className="text-2xl font-mono text-green-300 font-bold">
          [{currentBounds[0]}, {currentBounds[1]}]
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-purple-305 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(log T)</span> - where T is the target's index.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - constant extra space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Search in Sorted Array of Unknown Size"
      description="Perform binary search in an array with unknown size by exponentially finding the search bounds first."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter sorted array and target, then click Load & Visualize to begin."
    >
      <div className="w-full space-y-6">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Searching Algorithms
          </button>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          {visibleIndices.map((index) => {
            const isOutOfBounds = index >= array.length;
            const value = isOutOfBounds ? "∞" : array[index];
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="text-[10px] font-mono text-gray-500">[{index}]</div>
                <div
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${getCellColor(index)} relative`}
                >
                  {value}
                </div>
                <div className="text-[9px] text-gray-400 font-bold min-h-[1rem]">
                  {phase === "exponential" && index === exponentialIndex
                    ? "EXP"
                    : phase === "binary" && index === Math.floor((left + right) / 2)
                    ? "MID"
                    : index === foundIndex
                    ? "FOUND!"
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default UnknownSizeSearch;