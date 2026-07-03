import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerPointer from "../../components/VisualizerPointer";

const RadixSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("170,45,75,90,802,24,2,66");
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
        digitIndex: null,
        bucketIndex: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalSwaps,
        line: 2,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Radix Sort algorithm." });

    const getMax = (arrayObjects) => Math.max(...arrayObjects.map((obj) => obj.value));

    const countingSort = (exp) => {
      const output = new Array(n);
      const count = new Array(10).fill(0);

      addState({ line: 5, explanation: `Counting sort for digit exponent ${exp}` });

      for (let i = 0; i < n; i++) {
        const index = Math.floor(arr[i].value / exp) % 10;
        count[index]++;
        totalComparisons++;
        addState({
          line: 6,
          digitIndex: i,
          explanation: `Increment count for digit ${index} (value: ${arr[i].value})`,
        });
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
        addState({
          line: 7,
          bucketIndex: i,
          explanation: `Cumulative count for digit ${i}: ${count[i]}`,
        });
      }

      for (let i = n - 1; i >= 0; i--) {
        const index = Math.floor(arr[i].value / exp) % 10;
        output[count[index] - 1] = arr[i];
        totalSwaps++;
        addState({
          line: 8,
          digitIndex: i,
          bucketIndex: count[index] - 1,
          explanation: `Place value ${arr[i].value} at position ${count[index] - 1}`,
        });
        count[index]--;
      }

      for (let i = 0; i < n; i++) {
        arr[i] = output[i];
        addState({
          line: 9,
          digitIndex: i,
          explanation: `Update original array position ${i} with value ${arr[i].value}`,
        });
      }
    };

    const max = getMax(arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      addState({ line: 4, explanation: `Sorting by digit at exponent ${exp}` });
      countingSort(exp);
    }

    sortedIndices = Array.from({ length: n }, (_, k) => k);
    addState({
      line: 20,
      finished: true,
      sortedIndices,
      explanation: "Radix Sort completed. Array is fully sorted.",
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
    const array = Array.from({ length }, () => Math.floor(Math.random() * 999) + 1);
    setArrayInput(array.join(","));
    const initialObjects = array.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const {
    array = [],
    digitIndex = null,
    bucketIndex = null,
    sortedIndices = [],
    explanation = "",
    totalComparisons = 0,
    totalSwaps = 0,
    line = 2,
    finished = false,
  } = currentState;

  const codeContent = {
    2: "void radixSort(vector<int>& arr) {",
    3: "    int maxVal = getMax(arr);",
    4: "    for (int exp = 1; maxVal / exp > 0; exp *= 10) {",
    5: "        // Run Counting Sort on current exponent:",
    6: "        for (int i = 0; i < n; i++) count[(arr[i]/exp)%10]++;",
    7: "        for (int i = 1; i < 10; i++) count[i] += count[i-1];",
    8: "        for (int i = n - 1; i >= 0; i--) output[--count[(arr[i]/exp)%10]] = arr[i];",
    9: "        for (int i = 0; i < n; i++) arr[i] = output[i];",
    10: "    }",
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
        placeholder="e.g., 170,45,75,90,802,24,2,66"
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
          Digit Scans
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {totalComparisons}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Placements
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
          <div>Time: O(d * (n + k))</div>
          <div>Space: O(n + k)</div>
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(d * (n + k))</span> - where d is number of digits, n is elements count, k is base (10).
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(n + k)</span> - auxiliary array and counts.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Radix Sort"
      description="Visualizes Radix Sort, a non-comparative sorting algorithm that groups keys by individual digits sharing the same significant position and value."
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
              const isDigitExamined = digitIndex === index;
              const isBucketTarget = bucketIndex === index;
              const isSorted = finished || sortedIndices.includes(index);

              let boxStyles = "bg-gray-700 border-gray-600 text-gray-300";
              if (isSorted) {
                boxStyles = "bg-green-700 border-green-500 text-white";
              } else if (isDigitExamined) {
                boxStyles = "bg-amber-600 border-amber-400 text-white scale-110";
              } else if (isBucketTarget) {
                boxStyles = "bg-cyan-700 border-cyan-400 text-white scale-110";
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
            {isLoaded && digitIndex !== null && (
              <VisualizerPointer
                index={digitIndex}
                containerId="array-container"
                color="amber"
                label="idx"
              />
            )}
            {isLoaded && bucketIndex !== null && (
              <VisualizerPointer
                index={bucketIndex}
                containerId="array-container"
                color="cyan"
                label="dest"
              />
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default RadixSortVisualizer;
