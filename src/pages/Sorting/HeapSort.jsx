import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const HeapSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("12,11,13,5,6,7");
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
        heapSize: n,
        rootIndex: null,
        leftIndex: null,
        rightIndex: null,
        largestIndex: null,
        line: 12,
        ...props,
      });

    addState({ line: 12, explanation: "Initialize Heap Sort algorithm." });

    const heapify = (heapSize, i) => {
      addState({
        line: 1,
        heapSize,
        rootIndex: i,
        explanation: `Heapifying subtree rooted at index ${i}.`,
      });

      let largest = i;
      let left = 2 * i + 1;
      let right = 2 * i + 2;

      if (left < heapSize) {
        totalComparisons++;
        addState({
          line: 5,
          heapSize,
          rootIndex: i,
          leftIndex: left,
          rightIndex: right,
          largestIndex: largest,
          explanation: `Comparing root/largest (${arr[largest].value}) with left child (${arr[left].value}).`,
        });
        if (arr[left].value > arr[largest].value) {
          largest = left;
        }
      }

      if (right < heapSize) {
        totalComparisons++;
        addState({
          line: 6,
          heapSize,
          rootIndex: i,
          leftIndex: left,
          rightIndex: right,
          largestIndex: largest,
          explanation: `Comparing current largest (${arr[largest].value}) with right child (${arr[right].value}).`,
        });
        if (arr[right].value > arr[largest].value) {
          largest = right;
        }
      }

      addState({
        line: 7,
        heapSize,
        rootIndex: i,
        leftIndex: left,
        rightIndex: right,
        largestIndex: largest,
        explanation: `Checking if the largest element (${arr[largest].value}) is not the root (${arr[i].value}).`,
      });

      if (largest !== i) {
        addState({
          line: 8,
          heapSize,
          rootIndex: i,
          largestIndex: largest,
          explanation: `Swapping root ${arr[i].value} with largest child ${arr[largest].value}.`,
        });
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        totalSwaps++;

        addState({
          line: 9,
          heapSize,
          rootIndex: i,
          largestIndex: largest,
          explanation: `Swap complete. Recursively heapifying the affected sub-tree rooted at index ${largest}.`,
        });

        heapify(heapSize, largest);
      }
    };

    addState({
      line: 14,
      explanation: "Building max heap from unsorted array.",
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    addState({
      line: 15,
      explanation: "Max heap built. Starting extraction phase.",
    });

    for (let i = n - 1; i > 0; i--) {
      addState({
        line: 16,
        heapSize: i + 1,
        rootIndex: 0,
        largestIndex: i,
        explanation: `Swapping max element (root) ${arr[0].value} with last element of heap ${arr[i].value}.`,
      });
      [arr[0], arr[i]] = [arr[i], arr[0]];
      totalSwaps++;
      sortedIndices.unshift(i);

      addState({
        line: 17,
        heapSize: i,
        rootIndex: 0,
        largestIndex: i,
        explanation: `Element ${arr[i].value} is now sorted. Heapifying remaining elements.`,
      });

      heapify(i, 0);
    }

    sortedIndices.unshift(0);
    addState({
      line: 18,
      finished: true,
      sortedIndices,
      explanation: "Heap Sort completed. Array is fully sorted.",
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
    rootIndex = null,
    largestIndex = null,
    leftIndex = null,
    rightIndex = null,
    heapSize = 0,
    line = 12
  } = currentState;

  const codeContent = {
    1: "void heapify(vector<int>& arr, int n, int i) {",
    2: "    int largest = i;",
    3: "    int l = 2 * i + 1;",
    4: "    int r = 2 * i + 2;",
    5: "    if (l < n && arr[l] > arr[largest]) largest = l;",
    6: "    if (r < n && arr[r] > arr[largest]) largest = r;",
    7: "    if (largest != i) {",
    8: "        swap(arr[i], arr[largest]);",
    9: "        heapify(arr, n, largest);",
    10: "    }",
    11: "}",
    12: "void heapSort(vector<int>& arr) {",
    13: "    int n = arr.size();",
    14: "    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);",
    15: "    for (int i = n - 1; i > 0; i--) {",
    16: "        swap(arr[0], arr[i]);",
    17: "        heapify(arr, i, 0);",
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
        placeholder="e.g., 12,11,13,5,6,7"
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
          Heap Size
        </h4>
        <div className="text-3xl font-mono text-cyan-305 font-bold">
          {heapSize}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst/Average/Best Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n log n)</span> - heap construction + extraction.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(1)</span> - in-place sorting.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Heap Sort"
      description="Visualizes the Heap Sort algorithm, which builds a binary max heap from the array, then repeatedly extracts the maximum element and restores the heap."
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
            const isRoot = rootIndex === index;
            const isLargest = largestIndex === index;
            const isComparing = leftIndex === index || rightIndex === index;
            const isInHeap = index < heapSize;

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isRoot
                      ? "bg-red-500/30 border-red-400 text-white scale-110"
                      : isLargest
                      ? "bg-blue-500/30 border-blue-400 text-white scale-110"
                      : isComparing
                      ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                      : !isInHeap
                      ? "bg-gray-800 border-gray-700 opacity-40 text-gray-500"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {rootIndex === index ? "root" : largestIndex === index ? "largest" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default HeapSortVisualizer;
