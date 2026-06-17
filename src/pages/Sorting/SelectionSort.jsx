import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const SelectionSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("7,4,10,8,3,1");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    let arr = JSON.parse(JSON.stringify(initialArray));
    let n = arr.length;
    const newHistory = [];
    let totalComparisons = 0;
    let totalSwaps = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalSwaps,
        i: null,
        j: null,
        minIndex: null,
        line: 2,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Selection Sort algorithm." });

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      addState({
        line: 4,
        i,
        minIndex,
        explanation: `Boundary at index ${i}. Assume element ${arr[i].value} is the minimum.`,
      });

      for (let j = i + 1; j < n; j++) {
        totalComparisons++;
        addState({
          line: 5,
          i,
          j,
          minIndex,
          explanation: `Comparing current minimum (${arr[minIndex].value}) with element at index ${j} (${arr[j].value}).`,
        });

        if (arr[j].value < arr[minIndex].value) {
          minIndex = j;
          addState({
            line: 6,
            i,
            j,
            minIndex,
            explanation: `Found new minimum: ${arr[minIndex].value} at index ${minIndex}.`,
          });
        }
      }

      addState({
        line: 8,
        i,
        minIndex,
        explanation: `Inner loop finished. Minimum in unsorted part is ${arr[minIndex].value}.`,
      });

      if (minIndex !== i) {
        addState({
          line: 8,
          i,
          minIndex,
          explanation: `Swapping boundary element ${arr[i].value} with minimum element ${arr[minIndex].value}.`,
        });
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        totalSwaps++;
      }

      sortedIndices.push(i);
      addState({
        line: 3,
        i,
        minIndex: i,
        sortedIndices: [...sortedIndices],
        explanation: `Element ${arr[i].value} is now sorted.`,
      });
    }

    sortedIndices.push(n - 1);
    addState({
      line: 10,
      finished: true,
      sortedIndices,
      explanation: "Selection Sort completed. Array is fully sorted.",
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
    sortedIndices = [],
    explanation = "",
    totalComparisons = 0,
    totalSwaps = 0,
    i = null,
    j = null,
    minIndex = null,
    line = 2
  } = currentState;

  const codeContent = {
    1: "void selectionSort(vector<int>& arr) {",
    2: "    int n = arr.size();",
    3: "    for (int i = 0; i < n - 1; i++) {",
    4: "        int minIndex = i;",
    5: "        for (int j = i + 1; j < n; j++) {",
    6: "            if (arr[j] < arr[minIndex]) {",
    7: "                minIndex = j;",
    8: "            }",
    9: "        }",
    10: "        swap(arr[i], arr[minIndex]);",
    11: "    }",
    12: "}"
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
        placeholder="e.g., 7,4,10,8,3,1"
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
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Comparisons
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {totalComparisons}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Swaps
        </h4>
        <div className="text-3xl font-mono text-purple-355 font-bold">
          {totalSwaps}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Min Value
        </h4>
        <div className="text-3xl font-mono text-cyan-305 font-bold">
          {minIndex !== null && array[minIndex] ? array[minIndex].value : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst/Average/Best Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n²)</span> - requires scanning the unsorted portion regardless of ordering.
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
      title="Selection Sort"
      description="Visualizes the Selection Sort algorithm, which repeatedly finds the minimum element from the unsorted part and puts it at the beginning."
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
            const isMin = minIndex === index;
            const isBoundary = i === index;
            const isComparing = j === index;

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isMin
                      ? "bg-blue-500/30 border-blue-400 text-white scale-110"
                      : isBoundary
                      ? "bg-red-500/30 border-red-400 text-white scale-110"
                      : isComparing
                      ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {i === index ? "i (boundary)" : minIndex === index ? "min" : j === index ? "j" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SelectionSortVisualizer;
