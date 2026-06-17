import React, { useState, useCallback } from "react";
import { CheckCircle, Terminal, Clock } from "lucide-react";

import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const FindFirstAndLastPosition = () => {
  const [arrInput, setArrInput] = useState("5,7,7,8,8,10");
  const [targetInput, setTargetInput] = useState("8");

  // Initialise our blueprint visualizer state manager
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(0);

  const generateHistory = useCallback(() => {
    const arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10));
    const tgt = parseInt(targetInput, 10);
    if (arr.some(isNaN) || isNaN(tgt)) {
      alert("Invalid input");
      return;
    }
    setArray(arr);
    setTarget(tgt);

    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, target: tgt, ...s });

    // Left boundary search
    let l = 0,
      r = arr.length - 1,
      leftBoundary = -1,
      rightBoundary = -1;
    
    add({
      phase: "left",
      l,
      r,
      mid: null,
      leftBoundary,
      rightBoundary,
      message: `Searching for the first occurrence of ${tgt}.`,
      line: 5,
    });

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      add({
        phase: "left",
        l,
        r,
        mid,
        leftBoundary,
        rightBoundary,
        message: `Checking index ${mid}. Value is ${arr[mid]}.`,
        line: 7,
      });

      if (arr[mid] === tgt) {
        leftBoundary = mid;
        r = mid - 1;
        add({
          phase: "left",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `Found target. Storing index ${mid} and searching left.`,
          line: 8,
        });
      } else if (arr[mid] < tgt) {
        l = mid + 1;
        add({
          phase: "left",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} < ${tgt}. Moving left pointer right.`,
          line: 9,
        });
      } else {
        r = mid - 1;
        add({
          phase: "left",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} > ${tgt}. Moving right pointer left.`,
          line: 10,
        });
      }
    }

    // Right boundary search
    l = 0;
    r = arr.length - 1;
    add({
      phase: "right",
      l,
      r,
      mid: null,
      leftBoundary,
      rightBoundary,
      message: `Searching for the last occurrence of ${tgt}.`,
      line: 13,
    });

    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      add({
        phase: "right",
        l,
        r,
        mid,
        leftBoundary,
        rightBoundary,
        message: `Checking index ${mid}. Value is ${arr[mid]}.`,
        line: 15,
      });

      if (arr[mid] === tgt) {
        rightBoundary = mid;
        l = mid + 1;
        add({
          phase: "right",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `Found target. Storing index ${mid} and searching right.`,
          line: 16,
        });
      } else if (arr[mid] < tgt) {
        l = mid + 1;
        add({
          phase: "right",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} < ${tgt}. Moving left pointer right.`,
          line: 17,
        });
      } else {
        r = mid - 1;
        add({
          phase: "right",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} > ${tgt}. Moving right pointer left.`,
          line: 18,
        });
      }
    }

    add({
      phase: "result",
      l,
      r,
      leftBoundary,
      rightBoundary,
      message: `Search complete. Result is [${leftBoundary}, ${rightBoundary}].`,
      line: 20,
    });

    load(newHistory);
  }, [arrInput, targetInput, load]);

  const codeContent = {
    1: `vector<int> searchRange(vector<int>& nums, int target) {`,
    3: `    int left = -1, right = -1;`,
    4: `    // Find first occurrence`,
    5: `    int l = 0, r = nums.size() - 1;`,
    6: `    while (l <= r) {`,
    7: `        int mid = l + (r - l) / 2;`,
    8: `        if (nums[mid] == target) { left = mid; r = mid - 1; }`,
    9: `        else if (nums[mid] < target) l = mid + 1;`,
    10: `       else r = mid - 1;`,
    11: `   }`,
    12: `   // Find last occurrence`,
    13: `   l = 0; r = nums.size() - 1;`,
    14: `   while (l <= r) {`,
    15: `       int mid = l + (r - l) / 2;`,
    16: `       if (nums[mid] == target) { right = mid; l = mid + 1; }`,
    17: `       else if (nums[mid] < target) l = mid + 1;`,
    18: `       else r = mid - 1;`,
    19: `   }`,
    20: `   return {left, right};`,
    21: `}`,
  };

  const arrayToDisplay = currentState.array || array;
  const { phase, l, r, mid, leftBoundary, rightBoundary, message, line } = currentState;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-teal-400 shadow-sm"
        placeholder="Array (comma-separated)"
      />
      <input
        type="text"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        disabled={isLoaded}
        className="w-full md:w-32 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-teal-400 shadow-sm"
        placeholder="Target"
      />
      {!isLoaded && (
        <button
          onClick={generateHistory}
          className="px-5 py-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/60 shadow-lg text-center">
        <h4 className="text-gray-300 text-sm mb-2 font-semibold flex items-center justify-center gap-2 select-none">
          <Terminal size={16} /> Search State
        </h4>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm font-mono text-left max-w-[180px] mx-auto">
          <div>L: <span className="text-red-300 font-bold">{l ?? "-"}</span></div>
          <div>R: <span className="text-red-300 font-bold">{r ?? "-"}</span></div>
          <div>Mid: <span className="text-blue-300 font-bold">{mid ?? "-"}</span></div>
          <div>Val: <span className="text-blue-300 font-bold">{mid != null ? arrayToDisplay[mid] : "-"}</span></div>
        </div>
      </div>

      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/60 shadow-lg text-center flex flex-col justify-center">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          <CheckCircle size={16} /> Boundaries
        </h4>
        <div className="text-2xl font-mono text-green-400 font-bold">
          [{leftBoundary !== undefined ? leftBoundary : "?"}, {rightBoundary !== undefined ? rightBoundary : "?"}]
        </div>
      </div>

      <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700/60 shadow-lg text-center">
        <h4 className="text-teal-300 font-semibold flex items-center justify-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-[11px] text-gray-300 text-left space-y-1">
          <div><strong>Time:</strong> <span className="font-mono text-cyan-300">O(log n)</span> - 2 binary searches.</div>
          <div><strong>Space:</strong> <span className="font-mono text-cyan-300">O(1)</span> - In-place search.</div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="First & Last Position"
      description={`Finding the start and end indices of a target value using two separate binary searches.`}
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={message}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter a sorted array and target, then click Load & Visualize."
    >
      <div className="flex flex-col w-full gap-4">
        {/* Phase Header */}
        <div className="text-sm font-bold text-center text-cyan-300 uppercase tracking-wider select-none">
          {phase === "left"
            ? "Phase 1: Finding First Occurrence"
            : phase === "right"
            ? "Phase 2: Finding Last Occurrence"
            : "Search Finished"}
        </div>

        {/* Array display */}
        <div id="first-last-array" className="relative h-24 w-full mt-4">
          {arrayToDisplay.map((value, index) => {
            const isTarget = value === target;
            const isFirst = index === leftBoundary;
            const isLast = index === rightBoundary;
            
            let bgClass = "bg-gray-800 text-gray-400";
            if (isFirst || isLast) {
              bgClass = "bg-green-500 text-white scale-115 ring-2 ring-green-300 font-black";
            } else if (isTarget) {
              bgClass = "bg-teal-600 text-white";
            } else if (l <= r && index >= l && index <= r) {
              bgClass = "bg-gray-700 text-white";
            }

            return (
              <div
                key={index}
                id={`first-last-array-element-${index}`}
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
            containerId="first-last-array"
            color="red"
            label="L"
          />
          <VisualizerPointer
            index={r}
            containerId="first-last-array"
            color="red"
            label="R"
          />
          <VisualizerPointer
            index={mid}
            containerId="first-last-array"
            color="purple"
            label="MID"
            direction="up"
          />
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default FindFirstAndLastPosition;
