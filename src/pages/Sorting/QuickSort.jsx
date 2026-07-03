import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const QuickSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalComparisons = 0;
    let totalSwaps = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        low: null,
        high: null,
        pivot: null,
        i: null,
        j: null,
        pivotIndex: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalSwaps,
        line: 13,
        ...props,
      });

    addState({ line: 13, explanation: "Initialize Quick Sort algorithm." });

    const partition = (arr, low, high) => {
      const pivot = arr[high].value;
      let i = low - 1;

      addState({
        line: 1,
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: high,
        i: i,
        j: low,
        explanation: `Partitioning subarray from index ${low} to ${high}. Pivot: ${pivot}`,
      });

      for (let j = low; j < high; j++) {
        totalComparisons++;
        addState({
          line: 5,
          low: low,
          high: high,
          pivot: pivot,
          pivotIndex: high,
          i: i,
          j: j,
          explanation: `Comparing element arr[${j}] (${arr[j].value}) with pivot (${pivot}).`,
        });

        if (arr[j].value <= pivot) {
          i++;
          if (i !== j) {
            totalSwaps++;
            addState({
              line: 7,
              low: low,
              high: high,
              pivot: pivot,
              pivotIndex: high,
              i: i,
              j: j,
              explanation: `${arr[j].value} <= ${pivot}, swapping arr[${i}] with arr[${j}].`,
            });
            [arr[i], arr[j]] = [arr[j], arr[i]];
            addState({
              line: 7,
              low: low,
              high: high,
              pivot: pivot,
              pivotIndex: high,
              i: i,
              j: j,
              explanation: `Elements swapped. i updated to ${i}.`,
            });
          } else {
            addState({
              line: 6,
              low: low,
              high: high,
              pivot: pivot,
              pivotIndex: high,
              i: i,
              j: j,
              explanation: `${arr[j].value} <= ${pivot}, but i == j. No swap needed.`,
            });
          }
        }
      }

      totalSwaps++;
      addState({
        line: 10,
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: high,
        i: i,
        j: high,
        explanation: `Placing pivot in its correct position by swapping with arr[${i + 1}] (${arr[i + 1].value}).`,
      });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      addState({
        line: 11,
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: i + 1,
        i: i,
        j: high,
        explanation: `Pivot is now in correct position at index ${i + 1}.`,
      });

      return i + 1;
    };

    const quickSort = (arr, low, high) => {
      if (low < high) {
        addState({
          line: 14,
          low: low,
          high: high,
          explanation: `Sorting subarray from index ${low} to ${high}.`,
        });

        const pivotIndex = partition(arr, low, high);
        sortedIndices.push(pivotIndex);

        addState({
          line: 15,
          low: low,
          high: high,
          pivotIndex: pivotIndex,
          explanation: `Pivot is sorted. Recursively sorting left [${low}..${pivotIndex - 1}] and right [${pivotIndex + 1}..${high}] subarrays.`,
        });

        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
      } else if (low === high) {
        addState({
          line: 14,
          low: low,
          high: high,
          explanation: `Base case reached. Single element at index ${low} (${arr[low].value}) is sorted.`,
        });
        sortedIndices.push(low);
      }
    };

    quickSort(arr, 0, n - 1);

    const finalSorted = Array.from({ length: n }, (_, k) => k);

    addState({
      line: 19,
      sortedIndices: finalSorted,
      finished: true,
      explanation: "Quick Sort completed. Array is fully sorted.",
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
    low = null,
    high = null,
    pivotIndex = null,
    j = null,
    sortedIndices = [],
    explanation = "",
    totalComparisons = 0,
    totalSwaps = 0,
    line = 13
  } = currentState;

  const codeContent = {
    1: "int partition(vector<int>& arr, int low, int high) {",
    2: "    int pivot = arr[high];",
    3: "    int i = low - 1;",
    4: "    for (int j = low; j < high; j++) {",
    5: "        if (arr[j] <= pivot) {",
    6: "            i++;",
    7: "            swap(arr[i], arr[j]);",
    8: "        }",
    9: "    }",
    10: "    swap(arr[i + 1], arr[high]);",
    11: "    return i + 1;",
    12: "}",
    13: "void quickSort(vector<int>& arr, int low, int high) {",
    14: "    if (low < high) {",
    15: "        int pi = partition(arr, low, high);",
    16: "        quickSort(arr, low, pi - 1);",
    17: "        quickSort(arr, pi + 1, high);",
    18: "    }",
    19: "}"
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
        placeholder="e.g., 8,5,2,9,5,6,3"
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
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Comparisons
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {totalComparisons}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Swaps
        </h4>
        <div className="text-3xl font-mono text-purple-305 font-bold">
          {totalSwaps}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Complexity
        </h4>
        <div className="text-sm font-mono text-gray-300 space-y-1">
          <div>Time: O(n log n)</div>
          <div>Space: O(log n)</div>
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Average/Best Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n log n)</span> - balanced partitioning.
          </div>
          <div>
            <strong>Worst Case Time:</strong>{" "}
            <span className="font-mono text-teal-305">O(n²)</span> - highly unbalanced partitions.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Quick Sort"
      description="Visualizes the divide-and-conquer Quick Sort algorithm, which partitions the array around a pivot element so that elements smaller than the pivot go to the left and larger elements go to the right."
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
            const isInRange = low !== null && high !== null && index >= low && index <= high;
            const isPivot = pivotIndex === index;
            const isComparing = j === index;
            const isSorted = sortedIndices.includes(index);

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isPivot
                      ? "bg-red-500/30 border-red-400 text-white scale-110"
                      : isComparing
                      ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                      : isInRange
                      ? "bg-blue-500/30 border-blue-400 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {low === index ? "L" : high === index ? "H" : pivotIndex === index ? "P" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default QuickSortVisualizer;
