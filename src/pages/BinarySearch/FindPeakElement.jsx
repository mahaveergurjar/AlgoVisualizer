import React, { useState, useCallback } from "react";
import { CheckCircle, Terminal, Clock } from "lucide-react";

import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const FindPeakElement = () => {
  const [arrInput, setArrInput] = useState("1,2,3,1");

  // Initialise our blueprint visualizer state manager
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const [array, setArray] = useState([]);

  // Generate history for finding peak element
  const handleLoad = useCallback(() => {
    const arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10)).filter((s) => !isNaN(s));
    if (arr.length === 0) {
      alert("Invalid input");
      return;
    }
    setArray(arr);

    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, ...s });

    let left = 0;
    let right = arr.length - 1;

    add({
      left,
      right,
      mid: null,
      peak: null,
      message: "Initialize binary search range [0, nums.size() - 1]",
      line: 2
    });

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      
      add({
        left,
        right,
        mid,
        peak: null,
        message: `Checking element at mid index ${mid}: value ${arr[mid]}. Comparing with arr[mid+1] (${arr[mid + 1]}).`,
        line: 4
      });

      // Compare with next element
      if (arr[mid] < arr[mid + 1]) {
        add({
          left,
          right,
          mid,
          peak: null,
          message: `arr[mid] (${arr[mid]}) < arr[mid+1] (${arr[mid + 1]}). Ascending slope - peak lies to the right.`,
          line: 5
        });
        left = mid + 1;
      } else {
        add({
          left,
          right,
          mid,
          peak: null,
          message: `arr[mid] (${arr[mid]}) >= arr[mid+1] (${arr[mid + 1]}). Descending slope - peak lies to the left (including mid).`,
          line: 6
        });
        right = mid;
      }
    }

    add({
      left,
      right,
      mid: null,
      peak: left,
      message: `Search range collapsed to a single element. Peak element ${arr[left]} found at index ${left}.`,
      line: 8
    });

    load(newHistory);
  }, [arrInput, load]);

  const codeContent = {
    1: `int findPeakElement(vector<int>& nums) {`,
    2: `    int left = 0, right = nums.size() - 1;`,
    3: `    while (left < right) {`,
    4: `        int mid = left + (right - left) / 2;`,
    5: `        if (nums[mid] < nums[mid + 1]) left = mid + 1;`,
    6: `        else right = mid;`,
    7: `    }`,
    8: `    return left;`,
    9: `}`,
  };

  const arrayToDisplay = currentState.array || array;
  const { line, left, right, mid, peak, message } = currentState;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
        placeholder="Array (comma-separated)"
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

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          <CheckCircle size={16} /> Peak Index
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {peak !== null && peak !== undefined ? `Index: ${peak}` : "-"}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-cyan-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-cyan-300">O(log n)</span> - Search space is halved each step.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-cyan-300">O(1)</span> - Constant extra space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Find Peak Element"
      description="A peak element is an element that is strictly greater than its neighbors. The boundary is assumed to be -∞."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={message}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter an array (peak search logic) to begin visualization."
    >
      <div id="peak-visualizer-array" className="relative h-24 w-full">
        {arrayToDisplay.map((value, index) => {
          const isPeak = peak !== null && index === peak;
          const isMid = index === mid;
          const isLeft = index === left;
          const isRight = index === right;

          let bgClass = "bg-gray-800 text-gray-500";
          if (isPeak) {
            bgClass = "bg-green-500 text-white scale-110 ring-2 ring-green-300 font-black";
          } else if (isMid) {
            bgClass = "bg-purple-600 text-white scale-105";
          } else if (left <= right && index >= left && index <= right) {
            bgClass = "bg-gray-700 text-white";
          }

          return (
            <div
              key={index}
              id={`peak-visualizer-array-element-${index}`}
              className="absolute flex flex-col items-center"
              style={{
                left: `${((index + 0.5) / arrayToDisplay.length) * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold transition-all duration-300 ${bgClass}`}>
                {value}
              </div>
              <div className="text-xs text-gray-400 mt-1">[{index}]</div>
            </div>
          );
        })}

        <VisualizerPointer
          index={left}
          containerId="peak-visualizer-array"
          color="red"
          label="L"
        />
        <VisualizerPointer
          index={right}
          containerId="peak-visualizer-array"
          color="red"
          label="R"
        />
        <VisualizerPointer
          index={mid}
          containerId="peak-visualizer-array"
          color="purple"
          label="MID"
          direction="up"
        />
      </div>
    </VisualizerLayout>
  );
};

export default FindPeakElement;
