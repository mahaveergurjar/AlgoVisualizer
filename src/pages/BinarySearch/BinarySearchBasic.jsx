import React, { useState, useCallback } from "react";
import {
  Code,
  CheckCircle,
  XCircle,
  Terminal,
  Clock
} from "lucide-react";

import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const BinarySearchBasic = () => {
  const [arrInput, setArrInput] = useState("-1,0,3,5,9,12");
  const [targetInput, setTargetInput] = useState("9");

  // Initialise our blueprint visualizer state manager
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(0);

  const handleLoad = useCallback(() => {
    const arr = arrInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    
    // Binary search requires a sorted array
    arr.sort((a, b) => a - b);
    const tgt = parseInt(targetInput, 10);
    
    if (arr.length === 0 || isNaN(tgt)) {
      alert("Invalid input");
      return;
    }

    setArray(arr);
    setTarget(tgt);

    // Reconstruct step-by-step history
    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, target: tgt, ...s });

    let left = 0,
      right = arr.length - 1;
    
    add({
      left,
      right,
      mid: null,
      message: `Initialize search for ${tgt}. Range is [${left}, ${right}].`,
      line: 2,
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      add({
        left,
        right,
        mid,
        message: `Checking middle element at index ${mid}. Value is ${arr[mid]}.`,
        line: 4,
      });

      if (arr[mid] === tgt) {
        add({
          left,
          right,
          mid,
          foundIndex: mid,
          message: `Target ${tgt} found at index ${mid}!`,
          line: 5,
        });
        load(newHistory);
        return;
      } else if (arr[mid] < tgt) {
        add({
          left,
          right,
          mid,
          message: `${arr[mid]} < ${tgt}. Search in the right half.`,
          line: 6,
        });
        left = mid + 1;
      } else {
        add({
          left,
          right,
          mid,
          message: `${arr[mid]} > ${tgt}. Search in the left half.`,
          line: 7,
        });
        right = mid - 1;
      }
    }

    add({
      foundIndex: -1,
      message: `Target ${tgt} not found in the array.`,
      line: 9,
    });

    load(newHistory);
  }, [arrInput, targetInput, load]);

  // C++ Code content for side-by-side display
  const codeContent = {
    1: `int search(vector<int>& nums, int target) {`,
    2: `    int left = 0, right = nums.size() - 1;`,
    3: `    while (left <= right) {`,
    4: `        int mid = left + (right - left) / 2;`,
    5: `        if (nums[mid] == target) return mid;`,
    6: `        if (nums[mid] < target) left = mid + 1;`,
    7: `        else right = mid - 1;`,
    8: `    }`,
    9: `    return -1;`,
    10: `}`,
  };

  const arrayToDisplay = currentState.array || array;
  const { line, left, right, mid, foundIndex, message } = currentState;

  // Input fields rendered in control header
  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
        placeholder="Array (comma-separated)"
      />
      <input
        type="text"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        disabled={isLoaded}
        className="w-full md:w-32 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
        placeholder="Target"
      />
      {!isLoaded && (
        <button
          onClick={handleLoad}
          className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  // Variables and pointer statistics box
  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none">
          <Terminal size={16} /> Pointers
        </h4>
        <div className="text-3xl font-mono text-red-300">
          L={left ?? "-"} | R={right ?? "-"}
        </div>
      </div>
      
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          <Code size={16} /> Mid Value
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {mid !== null && mid !== undefined ? arrayToDisplay[mid] : "-"}
        </div>
      </div>

      <div className={`p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl`}>
        <h4 className={`font-semibold flex items-center justify-center gap-2 mb-2 select-none ${
          foundIndex != null && foundIndex !== -1 ? "text-green-300" : "text-red-300"
        }`}>
          {foundIndex != null && foundIndex !== -1 ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          Result
        </h4>
        <div className={`text-3xl font-bold ${
          foundIndex != null && foundIndex !== -1 ? "text-green-400" : "text-red-400"
        }`}>
          {foundIndex != null
            ? foundIndex !== -1
              ? `Index: ${foundIndex}`
              : "Not Found"
            : "-"}
        </div>
      </div>

      {/* Complexity panel spanning full width under pointers */}
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-cyan-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(log n)</span> - Search space is halved at each step.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - Constant extra space for pointers.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Binary Search"
      description="Visualizing the classic algorithm for finding an item from a sorted array of items in O(log n) time."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={message}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter a sorted array and a target to begin the visualization."
    >
      {/* Array visualization canvas content */}
      <div id="array-visualizer" className="relative h-24 w-full">
        {arrayToDisplay.map((value, idx) => (
          <div
            key={idx}
            id={`array-visualizer-element-${idx}`}
            className="absolute flex flex-col items-center"
            style={{
              left: `${((idx + 0.5) / arrayToDisplay.length) * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold transition-all duration-300 ${
                idx === foundIndex
                  ? "bg-green-500 scale-110 ring-2 ring-green-300"
                  : left <= right && idx >= left && idx <= right
                  ? "bg-gray-700"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              {value}
            </div>
            <div className="text-xs text-gray-400 mt-1">[{idx}]</div>
          </div>
        ))}

        <VisualizerPointer
          index={left}
          containerId="array-visualizer"
          color="red"
          label="L"
        />
        <VisualizerPointer
          index={right}
          containerId="array-visualizer"
          color="red"
          label="R"
        />
        <VisualizerPointer
          index={mid}
          containerId="array-visualizer"
          color="purple"
          label="MID"
          direction="up"
        />
      </div>
    </VisualizerLayout>
  );
};

export default BinarySearchBasic;
