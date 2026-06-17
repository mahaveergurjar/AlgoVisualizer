import React, { useState, useCallback } from "react";
import { CheckCircle, XCircle, Terminal, Clock } from "lucide-react";

import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const SearchInRotatedSortedArray = () => {
  const [arrInput, setArrInput] = useState("4,5,6,7,0,1,2");
  const [targetInput, setTargetInput] = useState("0");

  // Initialise our blueprint visualizer state manager
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(0);

  // Generate history for the algorithm
  const generateSearchHistory = useCallback(() => {
    const arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10)).filter((s) => !isNaN(s));
    const tgt = parseInt(targetInput, 10);
    if (arr.length === 0 || isNaN(tgt)) {
      alert("Invalid input");
      return;
    }
    setArray(arr);
    setTarget(tgt);

    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, target: tgt, ...s });

    let left = 0;
    let right = arr.length - 1;

    add({
      left,
      right,
      mid: null,
      found: false,
      message: `Searching for target ${tgt} in rotated sorted array.`,
      line: 2
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      add({
        left,
        right,
        mid,
        found: false,
        message: `Checking middle element at index ${mid}: ${arr[mid]}.`,
        line: 4
      });

      if (arr[mid] === tgt) {
        add({
          left,
          right,
          mid,
          found: true,
          foundIndex: mid,
          message: `Found target ${tgt} at index ${mid}!`,
          line: 5
        });
        load(newHistory);
        return;
      }

      // Determine which half is sorted
      if (arr[left] <= arr[mid]) {
        // Left half is sorted
        add({
          left,
          right,
          mid,
          found: false,
          message: `Left half [${left}..${mid}] is sorted (${arr[left]} <= ${arr[mid]}).`,
          line: 6
        });

        if (tgt >= arr[left] && tgt < arr[mid]) {
          add({
            left,
            right: mid - 1,
            mid,
            found: false,
            message: `Target ${tgt} lies within the sorted left half range [${arr[left]}, ${arr[mid]}). Moving right pointer to ${mid - 1}.`,
            line: 7
          });
          right = mid - 1;
        } else {
          add({
            left: mid + 1,
            right,
            mid,
            found: false,
            message: `Target ${tgt} does not lie in sorted left half. Search in the right half. Moving left pointer to ${mid + 1}.`,
            line: 8
          });
          left = mid + 1;
        }
      } else {
        // Right half is sorted
        add({
          left,
          right,
          mid,
          found: false,
          message: `Right half [${mid}..${right}] is sorted (${arr[mid]} < ${arr[left]}).`,
          line: 9
        });

        if (tgt > arr[mid] && tgt <= arr[right]) {
          add({
            left: mid + 1,
            right,
            mid,
            found: false,
            message: `Target ${tgt} lies within the sorted right half range (${arr[mid]}, ${arr[right]}]. Moving left pointer to ${mid + 1}.`,
            line: 10
          });
          left = mid + 1;
        } else {
          add({
            left,
            right: mid - 1,
            mid,
            found: false,
            message: `Target ${tgt} does not lie in sorted right half. Search in the left half. Moving right pointer to ${mid - 1}.`,
            line: 11
          });
          right = mid - 1;
        }
      }
    }

    add({
      left,
      right,
      mid: null,
      found: false,
      foundIndex: -1,
      message: `Target ${tgt} not found in the array.`,
      line: 14
    });

    load(newHistory);
  }, [arrInput, targetInput, load]);

  const codeContent = {
    1: `int search(vector<int>& nums, int target) {`,
    2: `    int left = 0, right = nums.size() - 1;`,
    3: `    while (left <= right) {`,
    4: `        int mid = left + (right - left) / 2;`,
    5: `        if (nums[mid] == target) return mid;`,
    6: `        if (nums[left] <= nums[mid]) {`,
    7: `            if (target >= nums[left] && target < nums[mid]) right = mid - 1;`,
    8: `            else left = mid + 1;`,
    9: `        } else {`,
    10: `            if (target > nums[mid] && target <= nums[right]) left = mid + 1;`,
    11: `            else right = mid - 1;`,
    12: `        }`,
    13: `    }`,
    14: `    return -1;`,
    15: `}`,
  };

  const arrayToDisplay = currentState.array || array;
  const { line, left, right, mid, found, foundIndex, message } = currentState;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
        placeholder="Rotated Array"
      />
      <input
        type="text"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        disabled={isLoaded}
        className="w-full md:w-32 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
        placeholder="Target"
      />
      {!isLoaded && (
        <button
          onClick={generateSearchHistory}
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-cyan-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-cyan-300">O(log n)</span> - Performs a single pass binary search.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-cyan-300">O(1)</span> - Constant auxiliary space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Search in Rotated Array"
      description="Finding a target value in a sorted array that has been rotated at an unknown pivot index in logarithmic time."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={message}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter a rotated array and target, then click Load & Visualize."
    >
      <div id="rotated-search-array" className="relative h-24 w-full">
        {arrayToDisplay.map((value, index) => {
          const isFound = found && index === foundIndex;
          const isMid = index === mid;
          const isLeft = index === left;
          const isRight = index === right;

          let bgClass = "bg-gray-800 text-gray-500";
          if (isFound) {
            bgClass = "bg-green-500 text-white scale-110 ring-2 ring-green-300 font-black";
          } else if (isMid) {
            bgClass = "bg-purple-600 text-white scale-105";
          } else if (left <= right && index >= left && index <= right) {
            bgClass = "bg-gray-700 text-white";
          }

          return (
            <div
              key={index}
              id={`rotated-search-array-element-${index}`}
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
          containerId="rotated-search-array"
          color="red"
          label="L"
        />
        <VisualizerPointer
          index={right}
          containerId="rotated-search-array"
          color="red"
          label="R"
        />
        <VisualizerPointer
          index={mid}
          containerId="rotated-search-array"
          color="purple"
          label="MID"
          direction="up"
        />
      </div>
    </VisualizerLayout>
  );
};

export default SearchInRotatedSortedArray;
