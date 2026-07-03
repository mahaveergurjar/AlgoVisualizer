import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Hash, Terminal, CheckCircle } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const ThreeSum = () => {
  const [arrInput, setArrInput] = useState("-1, 0, 1, 2, -1, -4");
  const [array, setArray] = useState([-1, 0, 1, 2, -1, -4]);

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

    const sorted = [...arr].sort((a, b) => a - b);
    const newHistory = [];

    // Step 1: Sorting
    newHistory.push({
      array: arr,
      displayArray: arr,
      i: -1,
      left: -1,
      right: -1,
      currentSum: null,
      foundTriplets: [],
      message: "Sort the array in ascending order.",
      line: 3,
      phase: "sorting",
    });

    newHistory.push({
      array: sorted,
      displayArray: sorted,
      i: -1,
      left: -1,
      right: -1,
      currentSum: null,
      foundTriplets: [],
      message: "Array sorted, starting 3Sum algorithm.",
      line: 4,
      phase: "finding",
    });

    const triplets = [];
    for (let i = 0; i < sorted.length - 2; i++) {
      newHistory.push({
        array: sorted,
        displayArray: sorted,
        i,
        left: i + 1,
        right: sorted.length - 1,
        currentSum: null,
        foundTriplets: [...triplets],
        message: `Set i pointer at index ${i} (value: ${sorted[i]}). Initialize left and right pointers.`,
        line: 4,
        phase: "finding",
      });

      if (i > 0 && sorted[i] === sorted[i - 1]) {
        newHistory.push({
          array: sorted,
          displayArray: sorted,
          i,
          left: i + 1,
          right: sorted.length - 1,
          currentSum: null,
          foundTriplets: [...triplets],
          message: `Duplicate value at index ${i} (${sorted[i]}), skipping to avoid duplicate triplets.`,
          line: 5,
          phase: "finding",
        });
        continue;
      }

      let left = i + 1;
      let right = sorted.length - 1;

      while (left < right) {
        const sum = sorted[i] + sorted[left] + sorted[right];

        newHistory.push({
          array: sorted,
          displayArray: sorted,
          i,
          left,
          right,
          currentSum: sum,
          foundTriplets: [...triplets],
          message: `Calculate sum: ${sorted[i]} + ${sorted[left]} + ${sorted[right]} = ${sum}.`,
          line: 8,
          phase: "finding",
        });

        if (sum === 0) {
          const tripletValues = [sorted[i], sorted[left], sorted[right]];
          const isDuplicate = triplets.some(
            (t) =>
              t.values[0] === tripletValues[0] &&
              t.values[1] === tripletValues[1] &&
              t.values[2] === tripletValues[2]
          );

          if (!isDuplicate) {
            triplets.push({
              indices: [i, left, right],
              values: tripletValues,
            });
          }

          newHistory.push({
            array: sorted,
            displayArray: sorted,
            i,
            left,
            right,
            currentSum: sum,
            foundTriplets: [...triplets],
            message: `Sum is 0! Found triplet: [${tripletValues.join(", ")}].`,
            line: 10,
            phase: "finding",
          });

          left++;
          right--;

          while (left < right && sorted[left] === sorted[left - 1]) {
            newHistory.push({
              array: sorted,
              displayArray: sorted,
              i,
              left,
              right,
              currentSum: sum,
              foundTriplets: [...triplets],
              message: `Skip duplicate left element: ${sorted[left]}.`,
              line: 11,
              phase: "finding",
            });
            left++;
          }
          while (left < right && sorted[right] === sorted[right + 1]) {
            newHistory.push({
              array: sorted,
              displayArray: sorted,
              i,
              left,
              right,
              currentSum: sum,
              foundTriplets: [...triplets],
              message: `Skip duplicate right element: ${sorted[right]}.`,
              line: 12,
              phase: "finding",
            });
            right--;
          }
        } else if (sum < 0) {
          newHistory.push({
            array: sorted,
            displayArray: sorted,
            i,
            left,
            right,
            currentSum: sum,
            foundTriplets: [...triplets],
            message: `Sum (${sum}) < 0. Move left pointer right to increase sum.`,
            line: 15,
            phase: "finding",
          });
          left++;
        } else {
          newHistory.push({
            array: sorted,
            displayArray: sorted,
            i,
            left,
            right,
            currentSum: sum,
            foundTriplets: [...triplets],
            message: `Sum (${sum}) > 0. Move right pointer left to decrease sum.`,
            line: 17,
            phase: "finding",
          });
          right--;
        }
      }
    }

    newHistory.push({
      array: sorted,
      displayArray: sorted,
      i: -1,
      left: -1,
      right: -1,
      currentSum: null,
      foundTriplets: [...triplets],
      message: `Complete! Found ${triplets.length} unique triplet(s).`,
      line: 21,
      phase: "finding",
    });

    load(newHistory);
  }, [arrInput, load]);

  const loadDefault = () => {
    const defaultArr = [-1, 0, 1, 2, -1, -4];
    handleLoad(defaultArr);
  };

  const generateNewArray = () => {
    const newArray = [];
    const size = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 11) - 5);
    }
    handleLoad(newArray);
  };

  const codeContent = {
    1: `vector<vector<int>> threeSum(vector<int>& nums) {`,
    2: `    vector<vector<int>> result;`,
    3: `    sort(nums.begin(), nums.end());`,
    4: `    for (int i = 0; i < nums.size() - 2; i++) {`,
    5: `        if (i > 0 && nums[i] == nums[i-1]) continue;`,
    6: `        int left = i + 1, right = nums.size() - 1;`,
    7: `        while (left < right) {`,
    8: `            int sum = nums[i] + nums[left] + nums[right];`,
    9: `            if (sum == 0) {`,
    10: `                result.push_back({nums[i], nums[left], nums[right]});`,
    11: `                while (left < right && nums[left] == nums[left+1]) left++;`,
    12: `                while (left < right && nums[right] == nums[right-1]) right--;`,
    13: `                left++; right--;`,
    14: `            } else if (sum < 0) {`,
    15: `                left++;`,
    16: `            } else {`,
    17: `                right--;`,
    18: `            }`,
    19: `        }`,
    20: `    }`,
    21: `    return result;`,
    22: `}`
  };

  const {
    line,
    i,
    left,
    right,
    currentSum,
    displayArray = array,
    phase = "sorting",
    foundTriplets = []
  } = currentState;

  const inputSection = (
    <>
      <input
        type="text"
        value={arrInput}
        onChange={(e) => setArrInput(e.target.value)}
        disabled={isLoaded}
        className="flex-1 min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
        placeholder="Array (e.g. -1,0,1,2,-1,-4)"
      />
      {!isLoaded ? (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={loadDefault}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Default
          </button>
          <button
            onClick={generateNewArray}
            className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Random
          </button>
        </>
      ) : null}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none">
          <Terminal size={16} /> Pointers
        </h4>
        <div className="text-3xl font-mono text-red-300">
          i={i >= 0 ? i : "-"} | L={left >= 0 ? left : "-"} | R={right >= 0 ? right : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          <Hash size={16} /> Sum
        </h4>
        <div
          className={`text-3xl font-mono ${
            currentSum === 0
              ? "text-green-400 font-bold"
              : currentSum < 0
              ? "text-blue-400"
              : "text-orange-400"
          }`}
        >
          {currentSum !== null ? currentSum : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          <CheckCircle size={16} /> Triplets
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {foundTriplets.length}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong> <span className="font-mono text-cyan-300">O(N²)</span> - Sorting is O(N log N) + two nested loops O(N²).
          </div>
          <div>
            <strong>Space:</strong> <span className="font-mono text-cyan-300">O(1)</span> or <span className="font-mono text-cyan-300">O(N)</span> for sorting space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="3Sum"
      description="Find all unique triplets in the array that sum to zero using sorting and the two-pointer technique."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.message || "Enter array inputs to begin the visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter a list of numbers to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="flex justify-center items-end gap-3 min-h-[220px] pt-4">
          {displayArray.map((value, index) => {
            const isI = phase === "finding" && index === i;
            const isLeft = phase === "finding" && index === left;
            const isRight = phase === "finding" && index === right;
            const isInRange =
              phase === "finding" &&
              index > i &&
              index >= left &&
              index <= right;

            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                <div
                  className={`w-14 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                    isI
                      ? "bg-red-500/30 border-red-400 scale-110 shadow-lg shadow-red-500/25"
                      : isLeft
                      ? "bg-green-500/30 border-green-400 scale-110 shadow-lg shadow-green-500/25"
                      : isRight
                      ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                      : isInRange
                      ? "bg-blue-500/20 border-blue-400"
                      : "bg-gray-700/30 border-gray-600"
                  }`}
                  style={{ height: `${Math.min(150, Math.abs(value) * 15 + 60)}px` }}
                >
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-white font-bold text-base">{value}</span>
                  </div>
                  <div
                    className={`w-full text-center py-1 text-xs font-bold ${
                      isI
                        ? "bg-red-500 text-white"
                        : isLeft
                        ? "bg-green-500 text-white"
                        : isRight
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {isI ? "i" : isLeft ? "L" : isRight ? "R" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 max-w-lg mx-auto">
          <h4 className="text-sm font-bold text-gray-300 mb-3">
            Found Triplets ({foundTriplets.length}):
          </h4>
          {foundTriplets.length === 0 ? (
            <p className="text-gray-500 text-sm">No triplets found yet...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {foundTriplets.map((triplet, idx) => (
                <div
                  key={idx}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center"
                >
                  <span className="text-green-400 font-mono text-sm">
                    [{triplet.values.join(", ")}]
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default ThreeSum;
