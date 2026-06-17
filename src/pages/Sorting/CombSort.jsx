import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerPointer from "../../components/VisualizerPointer";

const CombSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalSwaps = 0;
    let totalComparisons = 0;

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        i: null,
        j: null,
        sortedIndices: [],
        explanation: "",
        totalSwaps,
        totalComparisons,
        line: 2,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Comb Sort algorithm." });

    let gap = n;
    const shrink = 1.3;
    let swapped = true;

    addState({ line: 3, explanation: `Initial gap is ${gap}.` });

    while (gap > 1 || swapped) {
      gap = Math.floor(gap / shrink);
      if (gap < 1) {
        gap = 1;
      }
      addState({ line: 5, explanation: `New gap is ${gap}.` });

      swapped = false;
      addState({ line: 6, explanation: "Start a pass. Reset swapped to false." });

      for (let i = 0; i + gap < n; i++) {
        totalComparisons++;
        addState({
          line: 8,
          i,
          j: i + gap,
          explanation: `Comparing elements at index ${i} (${arr[i].value}) and ${i + gap} (${arr[i + gap].value}).`,
        });

        if (arr[i].value > arr[i + gap].value) {
          swapped = true;
          totalSwaps++;
          addState({
            line: 9,
            i,
            j: i + gap,
            explanation: `${arr[i].value} > ${arr[i + gap].value}, so they need to be swapped.`,
          });
          [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
          addState({
            line: 10,
            i,
            j: i + gap,
            explanation: `Elements swapped.`,
          });
        }
      }
    }

    addState({
      line: 15,
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
    i = null,
    j = null,
    explanation = "",
    totalSwaps = 0,
    totalComparisons = 0,
    line = 2,
    finished = false,
  } = currentState;

  const codeContent = {
    2: "void combSort(vector<int>& arr) {",
    3: "    int n = arr.size(); int gap = n; bool swapped = true;",
    4: "    while (gap > 1 || swapped) {",
    5: "        gap = gap / 1.3; if (gap < 1) gap = 1;",
    6: "        swapped = false;",
    7: "        for (int i = 0; i + gap < n; i++) {",
    8: "            if (arr[i] > arr[i + gap]) {",
    9: "                swap(arr[i], arr[i + gap]);",
    10: "                swapped = true;",
    11: "            }",
    12: "        }",
    13: "    }",
    15: "}"
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
          <div>Space: O(1)</div>
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n²)</span> - rare sequence triggers bubble-sort-like performance.
          </div>
          <div>
            <strong>Average/Best Case:</strong>{" "}
            <span className="font-mono text-teal-305">O(n log n)</span> - highly efficient gap-based reduction.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Comb Sort"
      description="Visualizes Comb Sort, an improvement over Bubble Sort that eliminates 'turtles' (small values near the end of the list) using a gap size reduced by a shrink factor."
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
              const isComparing = i === index || j === index;
              const isSorted = finished;

              let boxStyles = "bg-gray-700 border-gray-600 text-gray-300";
              if (isSorted) {
                boxStyles = "bg-green-700 border-green-500 text-white";
              } else if (isComparing) {
                boxStyles = "bg-amber-600 border-amber-400 text-white scale-110";
              }

              return (
                <div
                  key={item.id}
                  id={`array-container-element-${index}`}
                  className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                  style={{ left: `${index * 4.5}rem` }}
                >
                  {item.value}
                </div>
              );
            })}
            {isLoaded && i !== null && (
              <VisualizerPointer
                index={i}
                containerId="array-container"
                color="amber"
                label="i"
              />
            )}
            {isLoaded && j !== null && (
              <VisualizerPointer
                index={j}
                containerId="array-container"
                color="amber"
                label="i + gap"
              />
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default CombSortVisualizer;