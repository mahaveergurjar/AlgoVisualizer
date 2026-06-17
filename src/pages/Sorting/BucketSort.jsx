import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerPointer from "../../components/VisualizerPointer";

// ---------------------- Helpers ----------------------
function deepCloneObjects(arr) {
  return JSON.parse(JSON.stringify(arr));
}

// Stable Insertion Sort (for each bucket) with comparison/move counting
function insertionSortStable(arr, counts) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j].value > key.value) {
      counts.totalComparisons++;
      arr[j + 1] = arr[j];
      counts.totalMoves++;
      j--;
    }
    if (i - 1 >= 0) counts.totalComparisons++;
    arr[j + 1] = key;
    counts.totalMoves++;
  }
  return arr;
}

const BucketSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("0.42,0.32,0.33,0.52,0.37,0.47,0.51");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArrayObjects) => {
    const arr = deepCloneObjects(initialArrayObjects);
    const n = arr.length;
    const newHistory = [];
    const counts = { totalMoves: 0, totalComparisons: 0 };
    let sortedIndices = [];
    let finished = false;

    const addState = (props = {}) => {
      newHistory.push({
        array: deepCloneObjects(arr),
        i: null,
        j: null,
        bucketIndex: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps: counts.totalMoves,
        totalComparisons: counts.totalComparisons,
        finished,
        line: 1,
        ...props,
      });
    };

    addState({
      line: 1,
      explanation: "Initialize Bucket Sort. Choose number of buckets (≈ √n).",
    });

    if (n <= 1) {
      finished = true;
      sortedIndices = Array.from({ length: n }, (_, k) => k);
      addState({
        line: 20,
        sortedIndices,
        finished: true,
        explanation: "Trivial input (n <= 1). Already sorted.",
      });
      load(newHistory);
      return;
    }

    const min = Math.min(...arr.map((o) => o.value));
    const max = Math.max(...arr.map((o) => o.value));
    const range = Math.max(1e-9, max - min);
    const b = Math.max(1, Math.floor(Math.sqrt(n)));
    const buckets = Array.from({ length: b }, () => []);

    addState({
      line: 2,
      explanation: `Create ${b} buckets. Normalize values using (x-min)/(max-min).`,
    });

    for (let i = 0; i < n; i++) {
      const x = arr[i];
      const norm = (x.value - min) / range;
      let idx = Math.floor(norm * b);
      if (idx >= b) idx = b - 1;
      buckets[idx].push(x);

      addState({
        line: 4,
        i,
        bucketIndex: idx,
        explanation: `Place value ${x.value} into bucket ${idx}.`,
      });
    }

    for (let bi = 0; bi < b; bi++) {
      const before = buckets[bi].map((o) => o.value).join(", ");
      insertionSortStable(buckets[bi], counts);
      const after = buckets[bi].map((o) => o.value).join(", ");
      addState({
        line: 8,
        bucketIndex: bi,
        explanation: `Sort bucket ${bi} with insertion sort: [${before}] -> [${after}]`,
      });
    }

    let k = 0;
    for (let bi = 0; bi < b; bi++) {
      for (let j = 0; j < buckets[bi].length; j++) {
        arr[k] = buckets[bi][j];
        counts.totalMoves++;
        addState({
          line: 12,
          j: k,
          bucketIndex: bi,
          explanation: `Place ${buckets[bi][j].value} back into array at position ${k}.`,
        });
        k++;
      }
    }

    finished = true;
    sortedIndices = Array.from({ length: n }, (_, idx) => idx);
    addState({
      line: 20,
      sortedIndices,
      finished: true,
      explanation: "Array fully sorted by concatenating sorted buckets.",
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
    const array = Array.from({ length }, () => parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)));
    setArrayInput(array.join(","));
    const initialObjects = array.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const {
    array = [],
    j = null,
    sortedIndices = [],
    explanation = "",
    totalSwaps = 0,
    totalComparisons = 0,
    line = 1,
    finished = false,
  } = currentState;

  const codeContent = {
    1: "void bucketSort(vector<float>& arr) {",
    2: "    int n = arr.size(); int b = sqrt(n);",
    3: "    vector<vector<float>> buckets(b);",
    4: "    for (float x : arr)",
    5: "        buckets[bucketIndex(x)].push_back(x);",
    6: "",
    8: "    for (int i = 0; i < b; i++)",
    9: "        sort(buckets[i].begin(), buckets[i].end());",
    10: "",
    12: "    int k = 0;",
    13: "    for (int i = 0; i < b; i++)",
    14: "        for (float x : buckets[i]) arr[k++] = x;",
    20: "}"
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
        placeholder="e.g. 0.42,0.32,0.33,0.52,0.37,0.47,0.51"
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
          Swaps / Moves
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
          <div>Time: O(n + k)</div>
          <div>Space: O(n + k)</div>
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n²)</span> - when all elements land in the same bucket.
          </div>
          <div>
            <strong>Average Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n + k)</span> - with uniform distribution.
          </div>
          <div>
            <strong>Best Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n)</span> - when sorting is linear or elements already sorted.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Bucket Sort"
      description="Distribution-based, non-comparative sorting (stable if bucket sort uses a stable sub-sort)."
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
        <div className="flex justify-center items-center min-h-[170px] py-4 overflow-x-auto">
          <div
            id="array-container"
            className="relative transition-all"
            style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}
          >
            {array.map((item, index) => {
              const isPlacing = j === index;
              const isSorted = sortedIndices.includes(index);

              let boxStyles = "bg-gray-700 border-gray-600 text-gray-300";
              if (finished || isSorted) {
                boxStyles = "bg-green-700 border-green-500 text-white";
              } else if (isPlacing) {
                boxStyles = "bg-cyan-700 border-cyan-400 text-white scale-110";
              }

              return (
                <div
                  key={item.id}
                  id={`array-container-element-${index}`}
                  className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-lg transition-all duration-500 ease-in-out ${boxStyles}`}
                  style={{ left: `${index * 4.5}rem` }}
                  title={String(item.value)}
                >
                  {item.value}
                </div>
              );
            })}
            {isLoaded && j !== null && (
              <VisualizerPointer
                index={j}
                containerId="array-container"
                color="cyan"
                label="pos"
              />
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default BucketSortVisualizer;
