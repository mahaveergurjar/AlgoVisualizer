import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const PancakeSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("3,5,2,9,6,1,4");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    let n = arr.length;
    const newHistory = [];
    let totalFlips = 0;

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        currentIndex: null,
        maxIndex: null,
        sortedIndices: Array.from({ length: arr.length - n }, (_, i) => n + i),
        explanation: "",
        totalFlips,
        line: 10,
        ...props,
      });

    addState({ line: 10, explanation: "Initialize Pancake Sort algorithm." });

    for (let curr_size = n; curr_size > 1; --curr_size) {
      addState({
        line: 12,
        currentIndex: curr_size - 1,
        explanation: `Start pass for size ${curr_size}. Goal is to move the largest element to index ${curr_size - 1}.`,
      });

      let mi = 0;
      for (let i = 1; i < curr_size; i++) {
        addState({
          line: 13,
          currentIndex: curr_size - 1,
          maxIndex: mi,
          i,
          explanation: `Searching for max element in unsorted prefix. Current max is ${arr[mi].value} at index ${mi}.`,
        });
        if (arr[i].value > arr[mi].value) {
          mi = i;
          addState({
            line: 13,
            currentIndex: curr_size - 1,
            maxIndex: mi,
            i,
            explanation: `Found new max element ${arr[mi].value} at index ${mi}.`,
          });
        }
      }

      if (mi !== curr_size - 1) {
        if (mi !== 0) {
          totalFlips++;
          addState({
            line: 15,
            currentIndex: curr_size - 1,
            maxIndex: mi,
            explanation: `Flip 1: Bring max element (${arr[mi].value}) to the front. Flipping subarray from index 0 to ${mi}.`,
          });
          let tempArr = arr.slice(0, mi + 1).reverse();
          for (let i = 0; i <= mi; i++) arr[i] = tempArr[i];
          addState({
            line: 15,
            currentIndex: curr_size - 1,
            maxIndex: 0,
            explanation: "Subarray flipped. Max element is now at index 0.",
          });
        }

        totalFlips++;
        addState({
          line: 16,
          currentIndex: curr_size - 1,
          maxIndex: 0,
          explanation: `Flip 2: Move max element to its correct position. Flipping subarray from index 0 to ${curr_size - 1}.`,
        });
        let tempArr = arr.slice(0, curr_size).reverse();
        for (let i = 0; i < curr_size; i++) arr[i] = tempArr[i];
        addState({
          line: 16,
          currentIndex: curr_size - 1,
          maxIndex: curr_size - 1,
          explanation: `Subarray flipped. Element ${arr[curr_size - 1].value} is now sorted.`,
        });
      }
    }

    addState({
      line: 18,
      finished: true,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
      explanation: "Algorithm finished. The array is fully sorted.",
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (localArray.some(isNaN) || localArray.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }

    const initialObjects = localArray.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 6;
    const array = Array.from({ length }, () => Math.floor(Math.random() * 15) + 1);
    setArrayInput(array.join(","));
    const initialObjects = array.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const {
    array = [],
    currentIndex = null,
    maxIndex = null,
    sortedIndices = [],
    explanation = "",
    totalFlips = 0,
    line = 10
  } = currentState;

  const codeContent = {
    1: "void flip(vector<int>& arr, int i) {",
    2: "    int temp, start = 0;",
    3: "    while (start < i) {",
    4: "        temp = arr[start]; arr[start] = arr[i]; arr[i] = temp;",
    5: "        start++; i--;",
    6: "    }",
    7: "}",
    8: "void pancakeSort(vector<int>& arr) {",
    9: "    int n = arr.size();",
    10: "    for (int curr_size = n; curr_size > 1; --curr_size) {",
    11: "        int mi = findMax(arr, curr_size);",
    12: "        if (mi != curr_size - 1) {",
    13: "            flip(arr, mi);",
    14: "            flip(arr, curr_size - 1);",
    15: "        }",
    16: "    }",
    17: "}"
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., 3,5,2,9,6,1,4"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl col-span-3">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Total Flips
        </h4>
        <div className="text-3xl font-mono text-cyan-305 font-bold">
          {totalFlips}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-350 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst/Average Case Time:</strong>{" "}
            <span className="font-mono text-teal-350">O(n²)</span> - scanning prefix to find max and flipping.
          </div>
          <div>
            <strong>Best Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - when already sorted, but scan is still required.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(1)</span> - sorts in-place.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Pancake Sort"
      description="Visualizes the Pancake Sort algorithm, which sorts an array by reversing (flipping) prefixes to bring the maximum element to the end."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array, then click Load & Visualize to begin."
    >
      <div className="w-full space-y-6">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Sorting Algorithms
          </button>
        )}
        <div className="flex justify-center items-end gap-3 min-h-[220px]">
          {array.map((item, index) => {
            const isSorted = sortedIndices.includes(index);
            const isMax = maxIndex === index;
            const isCurrent = currentIndex === index;

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isMax
                      ? "bg-red-500/30 border-red-400 text-white scale-110"
                      : isCurrent
                      ? "bg-yellow-500/30 border-yellow-400 text-white scale-110"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {maxIndex === index ? "max" : currentIndex === index ? "curr" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default PancakeSortVisualizer;
