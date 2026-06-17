import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const BubbleSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
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
        i: null,
        j: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps,
        totalComparisons,
        line: 2,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Bubble Sort algorithm." });

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      addState({
        line: 3,
        i,
        explanation: `Start Pass ${i + 1}. Unsorted portion will bubble up the largest element.`,
      });

      for (let j = 0; j < n - i - 1; j++) {
        totalComparisons++;
        addState({
          line: 5,
          i,
          j,
          explanation: `Comparing elements at index ${j} (${arr[j].value}) and ${j + 1} (${arr[j + 1].value}).`,
        });

        if (arr[j].value > arr[j + 1].value) {
          swappedInPass = true;
          totalSwaps++;
          addState({
            line: 6,
            i,
            j,
            explanation: `${arr[j].value} > ${arr[j + 1].value}, so we swap.`,
          });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          addState({
            line: 7,
            i,
            j,
            explanation: `Elements swapped.`,
          });
        }
      }

      sortedIndices.push(n - 1 - i);
      addState({
        line: 3,
        i,
        explanation: `End of Pass ${i + 1}. Element ${arr[n - 1 - i].value} is sorted.`,
      });

      if (!swappedInPass) {
        addState({
          line: 11,
          i,
          explanation: "No swaps occurred in this pass. The array is already sorted. Breaking early.",
        });
        const remainingUnsorted = Array.from(
          { length: n - sortedIndices.length },
          (_, k) => k
        );
        sortedIndices.push(...remainingUnsorted);
        break;
      }
    }

    const finalSorted = Array.from({ length: n }, (_, k) => k);

    addState({
      line: 13,
      sortedIndices: finalSorted,
      finished: true,
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
    j = null,
    sortedIndices = [],
    explanation = "",
    totalSwaps = 0,
    totalComparisons = 0,
    line = 2
  } = currentState;

  const codeContent = {
    1: "void bubbleSort(vector<int>& arr) {",
    2: "    int n = arr.size();",
    3: "    for (int i = 0; i < n - 1; i++) {",
    4: "        bool swapped = false;",
    5: "        for (int j = 0; j < n - i - 1; j++) {",
    6: "            if (arr[j] > arr[j + 1]) {",
    7: "                swap(arr[j], arr[j + 1]);",
    8: "                swapped = true;",
    9: "            }",
    10: "        }",
    11: "        if (!swapped) break;",
    12: "    }",
    13: "}"
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
          <div>Time: O(n²)</div>
          <div>Space: O(1)</div>
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst/Average Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n²)</span> - when elements are in reverse order.
          </div>
          <div>
            <strong>Best Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n)</span> - when the array is already sorted.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Bubble Sort"
      description="Visualizes the classic Bubble Sort algorithm by repeatedly stepping through the list and swapping adjacent elements if they are in the wrong order."
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
            const isComparing = j === index || j + 1 === index;
            const isSorted = sortedIndices.includes(index);

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isComparing
                      ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {j === index ? "j" : j + 1 === index ? "j+1" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default BubbleSortVisualizer;
