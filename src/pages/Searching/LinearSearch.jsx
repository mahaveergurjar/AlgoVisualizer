import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock, Target, Cpu } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const LinearSearch = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("10, 23, 45, 70, 11, 15, 89, 34, 92, 56");
  const [targetInput, setTargetInput] = useState("70");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((localArray, localTarget) => {
    const newHistory = [];
    let stepCount = 0;
    let foundIndex = -1;
    let comparisons = 0;
    let checks = 0;

    const addState = (currentIndex = -1, explanation = "", line = null, extraProps = {}) => {
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
        ...extraProps,
      });
    };

    // Initial setup
    addState(-1, "Starting Linear Search Algorithm", 1);
    addState(-1, `Target value: ${localTarget}`, 2);
    addState(-1, `Array size: ${localArray.length} elements`, 3);
    addState(-1, "Beginning sequential scan from left to right...", 3);

    // Main algorithm loop
    for (let i = 0; i < localArray.length; i++) {
      checks++;
      addState(i, `Checking element at index ${i}: ${localArray[i]}`, 3);

      comparisons++;
      addState(i, `Comparing ${localArray[i]} with target ${localTarget}`, 5);

      if (localArray[i] === localTarget) {
        foundIndex = i;
        addState(i, `SUCCESS! Found target ${localTarget} at index ${i}`, 6, { isMatch: true });
        break;
      } else {
        addState(i, `${localArray[i]} ≠ ${localTarget}. Continuing search...`, 8);
      }
    }

    // Final state
    if (foundIndex === -1) {
      addState(localArray.length - 1, `Target ${localTarget} not found in the array after ${checks} checks`, 9);
    } else {
      addState(foundIndex, `SEARCH COMPLETE! Target ${localTarget} found at index ${foundIndex} (${checks} checks)`, 10, { isComplete: true });
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

    generateHistory(arr, tgt);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 5; // 5-8 elements
    const array = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10); // 10-99

    // 80% chance target is in array, 20% chance it's not
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
    line = 1,
    explanation = "",
    comparisons = 0,
    checks = 0,
    isMatch = false,
  } = currentState;

  const codeContent = {
    1: "int linearSearch(vector<int> & arr, int target) {",
    2: "    // Search for target in array",
    3: "    for (int i = 0; i < arr.size(); i++) {",
    4: "        // Check each element",
    5: "        if (arr[i] == target) {",
    6: "            return i; // Found!",
    7: "        }",
    8: "    }",
    9: "    return -1; // Not found",
    10: "}",
  };

  const getCellColor = (index) => {
    if (index === currentIndex) {
      if (array[index] === target) {
        return "bg-green-500/30 border-green-400 text-white shadow-lg shadow-green-500/20 scale-110";
      }
      return "bg-blue-500/30 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-110";
    }

    if (index < currentIndex) {
      if (array[index] === target && index === foundIndex) {
        return "bg-green-500/25 border-green-500/50 text-white";
      }
      return "bg-gray-800/40 border-gray-700 text-gray-500";
    }

    return "bg-gray-950 border-gray-700 text-gray-300";
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        placeholder="Enter numbers separated by commas..."
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
          Load &amp; Visualize
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
          Target
        </h4>
        <div className="text-3xl font-mono text-green-400 font-bold">
          {target}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Checked
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {checks}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
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
            <span className="font-mono text-teal-300">O(n)</span> - Worst case scans all elements.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - No additional space needed.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Linear Search"
      description="Sequentially check each element of the list until a match is found or the whole list has been searched."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array and target, then click Load &amp; Visualize to begin."
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
              <div className="text-xs text-gray-400 font-bold min-h-[1rem]">
                {index === currentIndex ? (isMatch ? "FOUND!" : "CHECK") : index === foundIndex ? "MATCH" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default LinearSearch;