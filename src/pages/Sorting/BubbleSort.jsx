import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  List,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const BubbleSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateBubbleSortHistory = useCallback((initialArray) => {
    // The array is now objects like {id, value}
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalSwaps = 0;
    let totalComparisons = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)), // Deep copy of objects
        i: null,
        j: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps,
        totalComparisons,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Bubble Sort algorithm." });

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      addState({
        line: 3,
        i,
        explanation: `Start Pass ${
          i + 1
        }. The largest unsorted element will bubble to the end.`,
      });

      for (let j = 0; j < n - i - 1; j++) {
        totalComparisons++;
        addState({
          line: 4,
          i,
          j,
          explanation: `Comparing adjacent elements at index ${j} (${
            arr[j].value
          }) and ${j + 1} (${arr[j + 1].value}).`,
        });

        if (arr[j].value > arr[j + 1].value) {
          swappedInPass = true;
          totalSwaps++;
          addState({
            line: 5,
            i,
            j,
            explanation: `${arr[j].value} > ${
              arr[j + 1].value
            }, so they need to be swapped.`,
          });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // Swap
          addState({
            line: 6,
            i,
            j,
            explanation: `Elements swapped.`,
          });
        }
      }

      sortedIndices.push(n - 1 - i);
      addState({
        line: 8,
        i,
        explanation: `End of Pass ${i + 1}. Element ${
          arr[n - 1 - i].value
        } is now in its correct sorted position.`,
      });

      if (!swappedInPass) {
        addState({
          line: 9,
          i,
          explanation:
            "No swaps occurred in this pass. The array is already sorted. Breaking early.",
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

    // Convert to array of objects with stable IDs
    const initialObjects = localArray.map((value, id) => ({ value, id }));

    setIsLoaded(true);
    generateBubbleSortHistory(initialObjects);
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

  const bubbleSortCode = [
    { l: 2, c: [{ t: "function bubbleSort(arr) {", c: "" }] },
    {
      l: 3,
      c: [
        { t: "  for", c: "purple" },
        { t: " (let i = 0; i < n - 1; i++) {", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "    for", c: "purple" },
        { t: " (let j = 0; j < n - i - 1; j++) {", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "      if", c: "purple" },
        { t: " (arr[j] > arr[j + 1]) {", c: "" },
      ],
    },
    { l: 6, c: [{ t: "        swap(arr[j], arr[j + 1]);", c: "" }] },
    { l: 7, c: [{ t: "      }", c: "light-gray" }] },
    { l: 8, c: [{ t: "    }", c: "light-gray" }] },
    {
      l: 9,
      c: [
        { t: "    if", c: "purple" },
        { t: " (!swappedInPass) ", c: "" },
        { t: "break", c: "purple" },
        { t: ";", c: "light-gray" },
      ],
    },
    { l: 12, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 13,
      c: [
        { t: "  return", c: "purple" },
        { t: " arr;", c: "" },
      ],
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <List /> Bubble Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the classic comparison sorting algorithm
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label
            htmlFor="array-input"
            className="font-medium text-gray-300 font-mono"
          >
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
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-mono w-24 text-center">
                {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {bubbleSortCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Swapping Boxes Visualization
              </h3>
              <div className="flex justify-center items-center min-h-[150px] py-4">
                <div
                  id="array-container"
                  className="relative transition-all"
                  style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}
                >
                  {array.map((item, index) => {
                    const isComparing =
                      state.j === index || state.j + 1 === index;
                    const isSorted = state.sortedIndices?.includes(index);

                    let boxStyles = "bg-gray-700 border-gray-600";
                    if (state.finished || isSorted) {
                      boxStyles = "bg-green-700 border-green-500 text-white";
                    } else if (isComparing) {
                      boxStyles = "bg-amber-600 border-amber-400 text-white";
                    }

                    return (
                      <div
                        key={item.id} // Use stable ID for key
                        id={`array-container-element-${index}`}
                        className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                        style={{
                          left: `${
                            index * 4.5
                          }rem` /* 4rem width + 0.5rem gap */,
                        }}
                      >
                        {item.value}
                      </div>
                    );
                  })}
                  {isLoaded && (
                    <>
                      <VisualizerPointer
                        index={state.j}
                        containerId="array-container"
                        color="amber"
                        label="j"
                      />
                      <VisualizerPointer
                        index={state.j !== null ? state.j + 1 : null}
                        containerId="array-container"
                        color="amber"
                        label="j+1"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Total Comparisons
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">
                  {state.totalComparisons ?? 0}
                </p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2">
                  <Repeat size={16} /> Total Swaps
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">
                  {state.totalSwaps ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-green-400" />
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Time Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Worst Case: O(N²)
                  </strong>
                  <br />
                  Occurs when the array is in reverse order. We must make N-1
                  passes, and each pass compares and swaps through the unsorted
                  portion of the array.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Average Case: O(N²)
                  </strong>
                  <br />
                  For a random array, the number of comparisons and swaps is
                  also proportional to N².
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Best Case: O(N)
                  </strong>
                  <br />
                  Occurs when the array is already sorted. The algorithm makes a
                  single pass through the array to check if any swaps are
                  needed. Finding none, it terminates early.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">
                  Space Complexity
                </h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(1)</strong>
                  <br />
                  Bubble sort is an in-place sorting algorithm. It only requires
                  a constant amount of extra memory for variables like loop
                  counters, regardless of the input size. (Note: Our
                  visualizer's history adds O(N²) space for demonstration, but
                  the algorithm itself is O(1)).
                </p>
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

export default BubbleSortVisualizer;
