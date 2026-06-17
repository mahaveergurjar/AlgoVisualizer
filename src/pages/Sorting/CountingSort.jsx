import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const CountingSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("4,2,2,8,3,3,1");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalOperations = 0;
    let sortedIndices = [];

    const max = Math.max(...arr.map((obj) => obj.value));

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        countArray: [],
        outputArray: new Array(n).fill(null),
        highlightedIndex: null,
        countIndex: null,
        outputIndex: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalOperations,
        line: 2,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Counting Sort algorithm." });

    const count = new Array(max + 1).fill(0);
    const output = new Array(n).fill(null);

    addState({
      line: 3,
      countArray: [...count],
      outputArray: [...output],
      explanation: `Found the maximum value in the array: ${max}.`,
    });

    addState({
      line: 4,
      countArray: [...count],
      outputArray: [...output],
      explanation: `Created a 'count' array of size ${max + 1} to store frequencies.`,
    });

    addState({
      line: 5,
      countArray: [...count],
      outputArray: [...output],
      explanation: `Created an 'output' array of size ${n} to store the sorted elements.`,
    });

    // 1. Store count of each element
    addState({
      line: 6,
      countArray: [...count],
      outputArray: [...output],
      explanation: "Count the frequency of each element in the input array.",
    });
    for (let i = 0; i < n; i++) {
      const value = arr[i].value;
      count[value]++;
      totalOperations++;
      addState({
        line: 6,
        highlightedIndex: i,
        countIndex: value,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Element is ${value}. Incrementing count at index ${value}. Count is now ${count[value]}.`,
      });
    }

    // 2. Store cumulative count
    addState({
      line: 7,
      countArray: [...count],
      outputArray: [...output],
      explanation: "Modify the count array to store the cumulative sum of counts.",
    });
    for (let i = 1; i <= max; i++) {
      count[i] += count[i - 1];
      totalOperations++;
      addState({
        line: 7,
        countIndex: i,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Updating count at index ${i} to ${count[i]} (cumulative sum). This is the last position for element ${i}.`,
      });
    }

    // 3. Build the output array
    addState({
      line: 8,
      countArray: [...count],
      outputArray: [...output],
      explanation: "Build the sorted output array using cumulative counts.",
    });
    for (let i = n - 1; i >= 0; i--) {
      const value = arr[i].value;
      const pos = count[value] - 1;
      output[pos] = arr[i];
      totalOperations++;
      addState({
        line: 9,
        highlightedIndex: i,
        countIndex: value,
        outputIndex: pos,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Element is ${value}. Its position is count[${value}]-1 = ${pos}. Placing it in output array.`,
      });

      count[value]--;
      totalOperations++;
      addState({
        line: 10,
        highlightedIndex: i,
        countIndex: value,
        outputIndex: pos,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Decremented count at index ${value} to ${count[value]}.`,
      });
    }

    // 4. Copy the output array to arr
    addState({
      line: 12,
      countArray: [...count],
      outputArray: [...output],
      explanation: "Copy the sorted elements from output array back to original array.",
    });
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      sortedIndices.push(i);
      totalOperations++;
      addState({
        line: 12,
        array: [...arr],
        outputArray: [...output],
        countArray: [...count],
        highlightedIndex: i,
        sortedIndices: [...sortedIndices],
        explanation: `Copying ${arr[i].value} from output to final position ${i}.`,
      });
    }

    addState({
      line: 13,
      finished: true,
      array: [...arr],
      outputArray: [...output],
      countArray: [...count],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      explanation: "Counting Sort completed. Array is fully sorted.",
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (localArray.some(isNaN) || localArray.length === 0 || localArray.some((x) => x < 0)) {
      alert("Invalid input. Please use comma-separated non-negative numbers.");
      return;
    }

    const initialObjects = localArray.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 6;
    const array = Array.from({ length }, () => Math.floor(Math.random() * 10));
    setArrayInput(array.join(","));
    const initialObjects = array.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const {
    array = [],
    countArray = [],
    outputArray = [],
    highlightedIndex = null,
    countIndex = null,
    outputIndex = null,
    sortedIndices = [],
    explanation = "",
    totalOperations = 0,
    line = 2
  } = currentState;

  const codeContent = {
    1: "void countingSort(vector<int>& arr) {",
    2: "    int n = arr.size();",
    3: "    int max = *max_element(arr.begin(), arr.end());",
    4: "    vector<int> count(max + 1, 0);",
    5: "    vector<int> output(n);",
    6: "    for (int i = 0; i < n; i++) count[arr[i]]++;",
    7: "    for (int i = 1; i <= max; i++) count[i] += count[i - 1];",
    8: "    for (int i = n - 1; i >= 0; i--) {",
    9: "        output[count[arr[i]] - 1] = arr[i];",
    10: "        count[arr[i]]--;",
    11: "    }",
    12: "    for (int i = 0; i < n; i++) arr[i] = output[i];",
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
        placeholder="e.g., 4,2,2,8,3,3,1"
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
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold col-span-3">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Total Operations
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {totalOperations}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-305 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(n + k)</span> - where n is the number of elements and k is the range of values.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(n + k)</span> - uses count array of size k + 1 and output array of size n.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Counting Sort"
      description="Visualizes the non-comparative integer Counting Sort algorithm, which sorts elements by mapping their frequencies to helper arrays."
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
        <div className="space-y-6">
          {/* Input/Final Array */}
          <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
            <h4 className="text-gray-300 font-semibold mb-2">Input / Final Array:</h4>
            <div className="flex gap-2 justify-center flex-wrap">
              {array.map((item, index) => {
                const isHighlighted = highlightedIndex === index;
                const isSorted = sortedIndices.includes(index);
                return (
                  <div key={item.id} className="text-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                        isSorted
                          ? "bg-green-500/30 border-green-400 text-white"
                          : isHighlighted
                          ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                          : "bg-gray-700 border-gray-600 text-gray-350"
                      }`}
                    >
                      {item.value}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">[{index}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Count Array */}
          <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
            <h4 className="text-gray-300 font-semibold mb-2">Count Array:</h4>
            <div className="flex gap-2 justify-center flex-wrap">
              {countArray.map((count, index) => {
                const isCountIndex = countIndex === index;
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-md border-2 font-medium text-sm transition-all duration-300 ${
                        isCountIndex
                          ? "bg-yellow-500/30 border-yellow-400 text-white scale-110"
                          : "bg-gray-700 border-gray-600 text-gray-350"
                      }`}
                    >
                      {count}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">[{index}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Output Array */}
          <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
            <h4 className="text-gray-300 font-semibold mb-2">Output Array:</h4>
            <div className="flex gap-2 justify-center flex-wrap">
              {outputArray.map((item, index) => {
                const isOutputIndex = outputIndex === index;
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                        isOutputIndex
                          ? "bg-blue-500/30 border-blue-400 text-white scale-110"
                          : "bg-gray-700 border-gray-600 text-gray-350"
                      }`}
                    >
                      {item?.value ?? ""}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">[{index}]</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default CountingSortVisualizer;
