import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const ShellSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("12,34,54,2,3,9,23,18,7");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalSwaps = 0;
    let totalComparisons = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        gap: null,
        i: null,
        j: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps,
        totalComparisons,
        line: 3,
        ...props,
      });

    addState({ line: 3, explanation: "Initialize Shell Sort algorithm." });

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      addState({
        line: 3,
        gap,
        explanation: `Starting new pass with gap = ${gap}. Comparing elements ${gap} positions apart.`,
      });

      for (let i = gap; i < n; i++) {
        addState({
          line: 4,
          gap,
          i,
          explanation: `Select element at index ${i} (value: ${arr[i].value}) as the key element.`,
        });

        const temp = arr[i];
        let j = i;

        while (j >= gap) {
          totalComparisons++;
          addState({
            line: 7,
            gap,
            i,
            j,
            explanation: `Compare element at index ${j - gap} (${arr[j - gap].value}) with key (${temp.value}).`,
          });

          if (arr[j - gap].value > temp.value) {
            totalSwaps++;
            addState({
              line: 8,
              gap,
              i,
              j,
              explanation: `${arr[j - gap].value} > ${temp.value}, shift ${arr[j - gap].value} to position ${j}.`,
            });

            arr[j] = arr[j - gap];
            j -= gap;

            addState({
              line: 9,
              gap,
              i,
              j,
              explanation: `Element shifted. Move back by gap (${gap}) positions.`,
            });
          } else {
            break;
          }
        }

        arr[j] = temp;
        addState({
          line: 11,
          gap,
          i,
          j,
          explanation: `Place key element ${temp.value} at correct position ${j}.`,
        });
      }
    }

    sortedIndices = Array.from({ length: n }, (_, k) => k);
    addState({
      line: 14,
      sortedIndices,
      finished: true,
      explanation: "Shell Sort complete. Array is fully sorted.",
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
    gap = null,
    i = null,
    j = null,
    sortedIndices = [],
    explanation = "",
    totalComparisons = 0,
    totalSwaps = 0,
    line = 3
  } = currentState;

  const codeContent = {
    1: "void shellSort(vector<int>& arr) {",
    2: "    int n = arr.size();",
    3: "    for (int gap = n / 2; gap > 0; gap /= 2) {",
    4: "        for (int i = gap; i < n; i++) {",
    5: "            int temp = arr[i];",
    6: "            int j = i;",
    7: "            while (j >= gap && arr[j - gap] > temp) {",
    8: "                arr[j] = arr[j - gap];",
    9: "                j -= gap;",
    10: "            }",
    11: "            arr[j] = temp;",
    12: "        }",
    13: "    }",
    14: "}"
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
        placeholder="e.g., 12,34,54,2,3,9,23,18,7"
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
          Shifts
        </h4>
        <div className="text-3xl font-mono text-purple-355 font-bold">
          {totalSwaps}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Current Gap
        </h4>
        <div className="text-3xl font-mono text-cyan-305 font-bold">
          {gap !== null ? gap : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-305 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n²)</span> - depending on gap sequence.
          </div>
          <div>
            <strong>Average Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n^(3/2))</span> - standard Shell sequence performance.
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
      title="Shell Sort"
      description="Visualizes the Shell Sort algorithm, which is an optimized version of insertion sort that compares elements at varying gaps."
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
            const isComparing = j !== null && index === j - gap;
            const isCurrent = i === index;
            const isInsertion = j === index;
            const isSorted = sortedIndices.includes(index);

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isComparing
                      ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                      : isInsertion
                      ? "bg-cyan-500/30 border-cyan-400 text-white scale-110"
                      : isCurrent
                      ? "bg-purple-500/30 border-purple-400 text-white scale-110"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 3 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {i === index ? "i" : j === index ? "j" : j !== null && index === j - gap ? "j-gap" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default ShellSortVisualizer;
