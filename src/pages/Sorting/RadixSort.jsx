import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  Shuffle,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const RadixSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("170,45,75,90,802,24,2,66");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateRadixSortHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalComparisons = 0; // Radix sort technically doesn't compare values, but we can count iterations
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
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Radix Sort algorithm." });

    const getMax = (arr) => Math.max(...arr.map((obj) => obj.value));

    const countingSort = (exp) => {
      const output = new Array(n);
      const count = new Array(10).fill(0);

      addState({ line: 5, explanation: `Counting sort for exponent ${exp}` });

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
      line: 10,
      finished: true,
      sortedIndices,
      explanation: "Radix Sort completed. Array is fully sorted.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
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
    setIsLoaded(true);
    generateRadixSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );

  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { array = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-blue-500/20" : ""
      }`}
    >
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  const radixSortCode = [
    { l: 2, c: [{ t: "function radixSort(arr) {", c: "" }] },
    { l: 3, c: [{ t: "  max = getMax(arr);", c: "" }] },
    { l: 4, c: [{ t: "  for (exp = 1; max/exp > 0; exp *= 10) {", c: "" }] },
    { l: 5, c: [{ t: "    countingSort(arr, exp);", c: "" }] },
    { l: 6, c: [{ t: "  }", c: "" }] },
    { l: 7, c: [{ t: "}", c: "" }] },
    { l: 8, c: [{ t: "", c: "" }] },
    { l: 9, c: [{ t: "function countingSort(arr, exp) {", c: "" }] },
    { l: 10, c: [{ }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Shuffle /> Radix Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the non-comparative digit-based sorting algorithm
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="array-input" className="font-medium text-gray-300 font-mono">
            Array:
          </label>
          <input
            id="array-input"
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer font-bold py-2 px-4 rounded-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                &larr;
              </button>
              <span className="font-mono w-24 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
              <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                &rarr;
              </button>
            </>
          )}
          <button onClick={reset} className="ml-4 bg-red-600 cursor-pointer hover:bg-red-700 font-bold py-2 px-4 rounded-lg">
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode */}
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} /> Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {radixSortCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

<div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Array Visualization
              </h3>
              <div className="flex justify-center items-center min-h-[150px] py-4">
                  <div id="array-container" className="relative transition-all" style={{ width: `${array.length * 4.5}rem`, height: '4rem' }}>
                      {array.map((item, index) => {
                          const isInRange = state.low !== null && state.high !== null && index >= state.low && index <= state.high;
                          const isPivot = state.pivotIndex === index;
                          const isComparing = state.j === index;
                          const isSorted = state.sortedIndices?.includes(index);
                          
                          let boxStyles = "bg-gray-700 border-gray-600";
                          if (state.finished || isSorted) {
                              boxStyles = "bg-green-700 border-green-500 text-white";
                          } else if (isPivot) {
                              boxStyles = "bg-red-600 border-red-400 text-white";
                          } else if (isComparing) {
                              boxStyles = "bg-amber-600 border-amber-400 text-white";
                          } else if (isInRange) {
                              boxStyles = "bg-blue-600 border-blue-400 text-white";
                          }

                          return (
                              <div
                                  key={item.id} // Use stable ID for key
                                  id={`array-container-element-${index}`}
                                  className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                                  style={{ left: `${index * 4.5}rem` /* 4rem width + 0.5rem gap */ }}
                              >
                                  {item.value}
                              </div>
                          );
                      })}
                      {isLoaded && state.low !== null && state.high !== null && (
                          <>
                              <VisualizerPointer index={state.low} containerId="array-container" color="blue" label="L" />
                              <VisualizerPointer index={state.high} containerId="array-container" color="purple" label="H" />
                              {state.pivotIndex !== null && (
                                  <VisualizerPointer index={state.pivotIndex} containerId="array-container" color="red" label="P" />
                              )}
                          </>
                      )}
                  </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2"><GitCompareArrows size={16} /> Total Comparisons</h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">{state.totalComparisons ?? 0}</p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2"><Repeat size={16} /> Total Swaps</h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">{state.totalSwaps ?? 0}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
              {state.finished && <CheckCircle className="inline-block ml-2 text-green-400"/>}
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                    <h4 className="font-semibold text-blue-300">Time Complexity</h4>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">Worst Case: O(N²)</strong><br/>Occurs when the pivot is always the smallest or largest element, creating unbalanced partitions. This happens with already sorted or reverse-sorted arrays.</p>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">Average Case: O(N log N)</strong><br/>With good pivot selection, the array is divided roughly in half at each step, leading to log N levels of recursion and O(N) work per level.</p>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">Best Case: O(N log N)</strong><br/>Occurs when the pivot always divides the array into equal halves, creating a balanced recursion tree.</p>
                </div>
                 <div className="space-y-4">
                    <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">O(log N)</strong><br/>The space complexity is determined by the recursion depth. In the best case, the recursion tree is balanced with depth log N. In the worst case, it can be O(N) for very unbalanced partitions. (Note: Our visualizer's history adds O(N log N) space for demonstration, but the algorithm itself is O(log N)).</p>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Load an array to begin visualization.
        </p>
      )}
    </div>
  );
};

export default RadixSortVisualizer;
