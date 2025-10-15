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
import VisualizerPointer from "../../components/VisualizerPointer"; // Make sure this path is correct

// Main Visualizer Component
const SelectionSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("7,4,10,8,3,1");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateSelectionSortHistory = useCallback((initialArray) => {
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
        i: null,
        j: null,
        minIndex: null,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Selection Sort algorithm." });

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      addState({
        line: 4,
        i,
        minIndex,
        explanation: `Start of outer loop. Set boundary at index ${i}. Assume element ${arr[i].value} is the minimum.`,
      });

      for (let j = i + 1; j < n; j++) {
        addState({
          line: 5,
          i,
          j,
          minIndex,
          explanation: `Comparing current minimum (${arr[minIndex].value}) with element at index ${j} (${arr[j].value}).`,
        });
        totalComparisons++;

        if (arr[j].value < arr[minIndex].value) {
          minIndex = j;
          addState({
            line: 6,
            i,
            j,
            minIndex,
            explanation: `Found a new minimum: ${arr[minIndex].value} at index ${minIndex}.`,
          });
        }
      }

      addState({
        line: 7,
        i,
        minIndex,
        explanation: `Inner loop finished. The minimum in the unsorted part is ${arr[minIndex].value}.`,
      });
      
      if (minIndex !== i) {
        addState({
            line: 8,
            i,
            minIndex,
            explanation: `Swapping the boundary element ${arr[i].value} with the minimum element ${arr[minIndex].value}.`,
          });
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        totalSwaps++;
      }
      
      sortedIndices.push(i);
      addState({
        line: 8,
        array: [...arr],
        i,
        minIndex: i, // minIndex is now i after the swap
        sortedIndices: [...sortedIndices],
        explanation: `Element ${arr[i].value} is now in its correct sorted position.`,
      });
    }

    sortedIndices.push(n - 1);
    addState({
      line: 10,
      finished: true,
      sortedIndices,
      explanation: "Selection Sort completed. Array is fully sorted.",
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
    generateSelectionSortHistory(initialObjects);
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

  const selectionSortCode = [
    { l: 2, c: [{ t: "function selectionSort(arr) {", c: "" }] },
    { l: 3, c: [{ t: "  for i from 0 to n-2:", c: "purple" }] },
    { l: 4, c: [{ t: "    minIndex = i", c: "" }] },
    { l: 5, c: [{ t: "    for j from i+1 to n-1:", c: "purple" }] },
    { l: 6, c: [{ t: "      if arr[j] < arr[minIndex]", c: "" }] },
    { l: 7, c: [{ t: "        minIndex = j", c: "" }] },
    { l: 8, c: [{ t: "    swap(arr[i], arr[minIndex])", c: "" }] },
    { l: 9, c: [{ t: "  }", c: "purple" }] },
    { l: 10, c: [{ t: "}", c: "" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Shuffle /> Selection Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the in-place comparison sorting algorithm
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
          <button onClick={reset} className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg">
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} /> Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {selectionSortCode.map((line) => (
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
              <div id="array-container" className="flex justify-center items-center flex-wrap gap-2 min-h-[120px] relative">
                  {array.map((item, index) => {
                    const isSorted = state.sortedIndices?.includes(index);
                    const isMin = state.minIndex === index;
                    const isBoundary = state.i === index;
                    const isComparing = state.j === index;

                    let boxStyles = "bg-gray-700 border-gray-600";
                    if (state.finished || isSorted) {
                        boxStyles = "bg-green-700 border-green-500 text-white";
                    } else if (isMin) {
                        boxStyles = "bg-blue-600 border-blue-400 text-white";
                    } else if (isBoundary) {
                        boxStyles = "bg-red-600 border-red-400 text-white";
                    } else if (isComparing) {
                        boxStyles = "bg-amber-600 border-amber-400 text-white";
                    }
                    
                    return (
                        <div key={item.id} id={`array-container-element-${index}`} className="text-center relative">
                            <div className={`w-14 h-14 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-xl transition-all duration-300 ${boxStyles}`}>
                                {item.value}
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{index}</span>
                        </div>
                    );
                  })}

                  {isLoaded && state.i !== null && (
                    <VisualizerPointer 
                      index={state.i} 
                      containerId="array-container" 
                      color="red" 
                      label="i"
                    />
                  )}
                  {isLoaded && state.j !== null && (
                    <VisualizerPointer 
                      index={state.j} 
                      containerId="array-container" 
                      color="amber" 
                      label="j"
                    />
                  )}
                  {isLoaded && state.minIndex !== null && (
                    <VisualizerPointer 
                      index={state.minIndex} 
                      containerId="array-container" 
                      color="blue" 
                      label="min"
                    />
                  )}
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
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">Worst Case: O(N²)</strong><br/>The algorithm always performs two nested loops. The outer loop runs N-1 times and the inner loop runs about N/2 times on average, leading to a quadratic time complexity regardless of the initial order of elements.</p>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">Average Case: O(N²)</strong><br/>The number of comparisons is fixed, so the average performance is the same as the worst-case performance.</p>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">Best Case: O(N²)</strong><br/>Even if the array is already sorted, the algorithm must still iterate through the entire unsorted portion to find the minimum, resulting in the same quadratic complexity.</p>
                </div>
                <div className="space-y-4">
                    <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                    <p className="text-gray-400"><strong className="text-teal-300 font-mono">O(1)</strong><br/>Selection Sort is an in-place algorithm. It only requires a few extra variables to store indices and for swapping, so its space usage is constant and does not depend on the size of the input array.</p>
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

export default SelectionSortVisualizer;