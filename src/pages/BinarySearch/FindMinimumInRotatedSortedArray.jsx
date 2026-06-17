import React, { useState, useCallback } from "react";
import { Code, CheckCircle, Terminal, Clock } from "lucide-react";

import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const FindMinimumInRotatedSortedArray = () => {
  const [arrInput, setArrInput] = useState("4,5,6,7,0,1,2");

  // Initialise our blueprint visualizer state manager
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const [array, setArray] = useState([]);

  const handleLoad = useCallback(() => {
    const arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10));
    if (arr.some(isNaN) || arr.length === 0) {
      alert("Invalid input");
      return;
    }
    setArray(arr);

    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, ...s });

    let l = 0,
      r = arr.length - 1;
    add({ l, r, mid: null, message: "Initialize search pointers.", line: 2 });
    
    while (l < r) {
      const mid = Math.floor((l + r) / 2);
      add({
        l,
        r,
        mid,
        message: `Check if arr[mid] (${arr[mid]}) > arr[r] (${arr[r]})`,
        line: 4,
      });
      if (arr[mid] > arr[r]) {
        l = mid + 1;
        add({
          l,
          r,
          mid,
          message: `Condition is true (${arr[mid]} > ${arr[r]}). Minimum must be in the right half.`,
          line: 5,
        });
      } else {
        r = mid;
        add({
          l,
          r,
          mid,
          message: `Condition is false (${arr[mid]} <= ${arr[r]}). Minimum is in the left half (including mid).`,
          line: 6,
        });
      }
    }
    
    add({
      l,
      r,
      mid: l,
      result: arr[l],
      message: `Loop terminates (l == r). Minimum found at index ${l} with value ${arr[l]}.`,
      line: 8,
    });

    load(newHistory);
  }, [arrInput, load]);

  const codeContent = {
    1: `int findMin(vector<int>& nums) {`,
    2: `    int l = 0, r = nums.size() - 1;`,
    3: `    while (l < r) {`,
    4: `        int mid = l + (r - l) / 2;`,
    5: `        if (nums[mid] > nums[r]) l = mid + 1;`,
    6: `        else r = mid;`,
    7: `    }`,
    8: `    return nums[l];`,
    9: `}`,
  };

  const arrayToDisplay = currentState.array || array;
  const { line, l, r, mid, result, message } = currentState;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
        placeholder="Rotated Sorted Array"
      />
      {!isLoaded && (
        <button
          onClick={handleLoad}
          className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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
          L={l ?? "-"} | R={r ?? "-"}
        </div>
      </div>
      
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          <Code size={16} /> Mid Value
        </h4>
        <div className="text-3xl font-mono text-green-300">
          {mid !== null && mid !== undefined ? arrayToDisplay[mid] : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          <CheckCircle size={16} /> Minimum
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {result ?? "-"}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-cyan-300">O(log n)</span> - The search space is halved in each step.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-cyan-300">O(1)</span> - No extra space is used besides pointers.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Find Min in Rotated Sorted Array"
      description="Visualizing an efficient binary search to find the minimum element in a rotated sorted array in logarithmic time."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={message}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter a rotated sorted array to begin the visualization."
    >
      <div id="rotated-min-array" className="relative h-24 w-full">
        {arrayToDisplay.map((value, index) => {
          const isMin = result !== undefined && value === result;
          let bgClass = "bg-gray-800 text-gray-500";
          
          if (isMin) {
            bgClass = "bg-green-500 text-white scale-110 ring-2 ring-green-300 font-black";
          } else if (l <= r && index >= l && index <= r) {
            bgClass = "bg-gray-700 text-white";
          }

          return (
            <div
              key={index}
              id={`rotated-min-array-element-${index}`}
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
          index={l}
          containerId="rotated-min-array"
          color="red"
          label="L"
        />
        <VisualizerPointer
          index={r}
          containerId="rotated-min-array"
          color="red"
          label="R"
        />
        <VisualizerPointer
          index={mid}
          containerId="rotated-min-array"
          color="green"
          label="MID"
          direction="up"
        />
      </div>
    </VisualizerLayout>
  );
};

export default FindMinimumInRotatedSortedArray;
