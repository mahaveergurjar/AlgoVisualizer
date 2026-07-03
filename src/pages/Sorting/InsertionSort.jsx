import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const InsertionSortVisualizer = ({ navigate }) => {
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
        i: null,
        j: null,
        key: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalSwaps,
        line: 1,
        ...props,
      });

    addState({ line: 1, explanation: "Initialize Insertion Sort algorithm." });

    for (let i = 1; i < n; i++) {
      const key = arr[i].value;
      let j = i - 1;

      addState({
        line: 4,
        i,
        j,
        key,
        explanation: `Considering element ${key} (index ${i}) to insert into the sorted part.`,
      });

      while (j >= 0 && arr[j].value > key) {
        totalComparisons++;
        addState({
          line: 6,
          i,
          j,
          key,
          explanation: `Compare key (${key}) with arr[${j}] (${arr[j].value}). Since ${key} < ${arr[j].value}, we shift.`,
        });

        arr[j + 1] = { ...arr[j] };
        totalSwaps++;
        addState({
          line: 7,
          i,
          j,
          key,
          explanation: `Shifted ${arr[j].value} to index ${j + 1}.`,
        });

        j--;
      }

      totalComparisons++;
      arr[j + 1] = { value: key, id: arr[i].id };
      addState({
        line: 10,
        i,
        j,
        key,
        explanation: `Placed key (${key}) at correct position index ${j + 1}.`,
      });

      sortedIndices = Array.from({ length: i + 1 }, (_, k) => k);
      addState({
        line: 3,
        sortedIndices,
        explanation: `Subarray [0..${i}] is now sorted.`,
      });
    }

    const finalSorted = Array.from({ length: n }, (_, k) => k);
    addState({
      line: 12,
      sortedIndices: finalSorted,
      finished: true,
      explanation: "Algorithm finished. Entire array is sorted.",
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
    i = null,
    j = null,
    key = null,
    sortedIndices = [],
    explanation = "",
    totalComparisons = 0,
    totalSwaps = 0,
    line = 1
  } = currentState;

  const codeContent = {
    1: "void insertionSort(vector<int>& arr) {",
    2: "    int n = arr.size();",
    3: "    for (int i = 1; i < n; i++) {",
    4: "        int key = arr[i];",
    5: "        int j = i - 1;",
    6: "        while (j >= 0 && arr[j] > key) {",
    7: "            arr[j + 1] = arr[j];",
    8: "            j--;",
    9: "        }",
    10: "        arr[j + 1] = key;",
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-305 select-none">
          Comparisons
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {totalComparisons}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-305 select-none">
          Shifts
        </h4>
        <div className="text-3xl font-mono text-purple-305 font-bold">
          {totalSwaps}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Key
        </h4>
        <div className="text-3xl font-mono text-cyan-300 font-bold">
          {key !== null ? key : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-305 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst/Average Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n²)</span> - when elements are reversed.
          </div>
          <div>
            <strong>Best Case Time:</strong>{" "}
            <span className="font-mono text-teal-305">O(n)</span> - when elements are already sorted.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(1)</span> - sorting is done in-place.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Insertion Sort"
      description="Visualizes the Insertion Sort algorithm, which builds the final sorted array one item at a time by shifting larger elements to the right."
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
            const isComparing = j === index;
            const isCurrent = i === index;
            const isSorted = sortedIndices.includes(index);

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isComparing
                      ? "bg-yellow-500/30 border-yellow-400 text-white scale-110"
                      : isCurrent
                      ? "bg-blue-500/30 border-blue-400 text-white scale-110"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {i === index ? "i" : j === index ? "j" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default InsertionSortVisualizer;
