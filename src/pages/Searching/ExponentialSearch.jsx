import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock, Target, Cpu } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const ExponentialSearch = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("2, 3, 4, 10, 15, 18, 23, 35, 42, 55, 68, 79, 81, 88, 95");
  const [targetInput, setTargetInput] = useState("55");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((localArray, localTarget) => {
    const newHistory = [];
    let stepCount = 0;
    let foundIndex = -1;
    let comparisons = 0;
    let checks = 0;
    let phase = "exponential";
    let boundStart = 0;
    let boundEnd = localArray.length - 1;
    let currentRange = [0, 0];
    let currentIndex = -1;
    let exponentialIndex = 1;

    const addState = (explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        array: [...localArray],
        currentIndex,
        target: localTarget,
        foundIndex,
        step: stepCount++,
        explanation,
        line,
        comparisons,
        checks,
        phase,
        boundStart,
        boundEnd,
        currentRange: [...currentRange],
        exponentialIndex,
        ...extraProps,
      });
    };

    // Initial setup
    addState("Starting Exponential Search Algorithm", 4);
    addState(`Target value: ${localTarget} in sorted array of ${localArray.length} elements`, 4);
    addState("Phase 1: Exponential Range Finding - Doubling index to find search range", 7);

    // Check first element
    checks++;
    currentIndex = 0;
    if (localArray[0] === localTarget) {
      foundIndex = 0;
      addState(`Target found at first element! Index: 0`, 5, { isMatch: true });
    } else {
      addState(`First element (${localArray[0]}) ≠ ${localTarget}. Starting exponential search...`, 9);

      // Exponential phase - find range
      let i = 1;
      while (i < localArray.length && localArray[i] <= localTarget) {
        currentIndex = i;
        checks++;
        comparisons++;
        boundStart = Math.floor(i / 2);
        currentRange = [boundStart, Math.min(i, localArray.length - 1)];
        exponentialIndex = i;
        
        addState(`Exponential: Checking index ${i}, value ${localArray[i]}`, 9);
        addState(`Current range: [${boundStart}, ${Math.min(i, localArray.length - 1)}]`, 9);
        
        if (localArray[i] === localTarget) {
          foundIndex = i;
          addState(`Target found during exponential phase at index ${i}`, 10, { isMatch: true });
          break;
        }
        
        addState(`Doubling search range from ${i} to ${i * 2}`, 11);
        i *= 2;
      }

      // If not found in exponential phase, set bounds for binary search
      if (foundIndex === -1) {
        boundStart = Math.floor(i / 2);
        boundEnd = Math.min(i, localArray.length - 1);
        currentRange = [boundStart, boundEnd];
        currentIndex = -1;
        phase = "binary";
        
        addState(`Range identified: [${boundStart}, ${boundEnd}]`, 15);
        addState(`Switching to Binary Search phase within the identified range`, 17);

        // Binary Search Phase
        let left = boundStart;
        let right = boundEnd;
        let mid = -1;

        addState(`Starting binary search between indices ${left} and ${right}`, 17);

        while (left <= right) {
          mid = Math.floor((left + right) / 2);
          currentIndex = mid;
          currentRange = [left, right];
          checks++;
          comparisons++;
          
          addState(`Binary: Checking middle index ${mid}, value ${localArray[mid]}`, 18);
          addState(`Search window: [${left}, ${right}]`, 18);

          if (localArray[mid] === localTarget) {
            foundIndex = mid;
            addState(`Target found at index ${mid} during binary search!`, 19, { isMatch: true });
            break;
          } else if (localArray[mid] < localTarget) {
            left = mid + 1;
            addState(`Target is greater, searching right half: [${mid + 1}, ${right}]`, 20);
          } else {
            right = mid - 1;
            addState(`Target is smaller, searching left half: [${left}, ${mid - 1}]`, 21);
          }
        }
      }
    }

    // Final state
    if (foundIndex === -1) {
      addState(`Target ${localTarget} not found in the array after ${checks} checks`, 24);
    } else {
      addState(`SEARCH COMPLETE! Target ${localTarget} found at index ${foundIndex} (${checks} checks)`, 25, { isComplete: true });
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
      alert("Please enter valid numbers separated by commas for the array and a valid target number.");
      return;
    }

    if (arr.length === 0) {
      alert("Array cannot be empty. Please enter some numbers.");
      return;
    }

    // Check if array is sorted
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[i - 1]) {
        alert("Array must be sorted in ascending order for exponential search to work correctly.");
        return;
      }
    }

    generateHistory(arr, tgt);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 8;
    const start = Math.floor(Math.random() * 20);
    const array = Array.from({ length }, (_, i) => start + i * 3 + Math.floor(Math.random() * 3));
    
    const targetInArray = Math.random() > 0.2;
    const target = targetInArray 
      ? array[Math.floor(Math.random() * array.length)]
      : Math.floor(Math.random() * 90) + 100;
    
    setArrayInput(array.join(", "));
    setTargetInput(target.toString());
    generateHistory(array, target);
  };

  const {
    array = [],
    currentIndex = -1,
    target = 0,
    foundIndex = -1,
    line = 4,
    explanation = "",
    comparisons = 0,
    checks = 0,
    phase = "exponential",
    currentRange = [0, 0]
  } = currentState;

  const codeContent = {
    1: "int exponentialSearch(vector<int>& arr, int target) {",
    2: "    int n = arr.size();",
    3: "    if (n == 0) return -1;",
    4: "    if (arr[0] == target) return 0;",
    5: "    ",
    6: "    // Double index exponentially",
    7: "    int i = 1;",
    8: "    while (i < n && arr[i] <= target) {",
    9: "        if (arr[i] == target) return i;",
    10: "        i *= 2;",
    11: "    }",
    12: "    ",
    13: "    // Binary search within identified range",
    14: "    int left = i / 2;",
    15: "    int right = min(i, n - 1);",
    16: "    while (left <= right) {",
    17: "        int mid = left + (right - left) / 2;",
    18: "        if (arr[mid] == target) return mid;",
    19: "        else if (arr[mid] < target) left = mid + 1;",
    20: "        else right = mid - 1;",
    21: "    }",
    22: "    return -1;",
    23: "}"
  };

  const getCellColor = (index) => {
    const [rangeStart, rangeEnd] = currentRange;
    const isInRange = index >= rangeStart && index <= rangeEnd;

    if (index === foundIndex) {
      return "bg-green-500/30 border-green-400 text-white shadow-lg shadow-green-500/25 scale-110";
    }
    if (index === currentIndex) {
      return "bg-blue-500/30 border-blue-400 text-white shadow-lg shadow-blue-500/25 scale-110";
    }
    if (isInRange) {
      return "bg-teal-500/20 border-teal-500/50 text-white";
    }
    return "bg-gray-950 border-gray-700 text-gray-500";
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        placeholder="Enter sorted numbers separated by commas..."
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-green-500 font-mono shadow-sm"
      />
      <input
        id="target-input"
        type="number"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        disabled={isLoaded}
        placeholder="Target"
        className="w-full md:w-24 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-green-500 font-mono shadow-sm"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-400 select-none">
          Target / Phase
        </h4>
        <div className="text-2xl font-mono text-green-400 font-bold uppercase">
          {target} ({phase})
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Checks
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {checks}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-305 select-none">
          Comparisons
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {comparisons}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(log i)</span> - where i is the position of the target.
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
      title="Exponential Search"
      description="Find a range where the target element may reside, and then perform a binary search within that range."
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
        <div className="flex gap-4 justify-center flex-wrap">
          {array.map((num, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-xs font-mono text-gray-500">[{index}]</div>
              <div
                className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${getCellColor(index)} relative`}
              >
                {num}
                {index === currentIndex && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900 animate-ping">
                    !
                  </div>
                )}
              </div>
              <div className="text-[10px] text-gray-400 font-bold min-h-[1rem]">
                {index === currentIndex ? (index === foundIndex ? "FOUND!" : "CHECK") : index === foundIndex ? "MATCH" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default ExponentialSearch;