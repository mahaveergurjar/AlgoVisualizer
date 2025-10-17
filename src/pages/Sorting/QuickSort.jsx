import React, { useState, useEffect, useCallback, useRef } from "react";
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
const QuickSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showJava, setShowJava] = useState(false); // Track JS/Java code toggle
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateQuickSortHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalComparisons = 0;
    let totalSwaps = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)), // Deep copy of objects
        low: null,
        high: null,
        pivot: null,
        i: null,
        j: null,
        pivotIndex: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalSwaps,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Quick Sort algorithm." });

    const partition = (arr, low, high) => {
      const pivot = arr[high].value;
      let i = low - 1;

      addState({
        line: 4,
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: high,
        i: i,
        j: low,
        explanation: `Partitioning array from index ${low} to ${high}. Pivot: ${pivot}`,
      });

      for (let j = low; j < high; j++) {
        totalComparisons++;
        addState({
          line: 5,
          low: low,
          high: high,
          pivot: pivot,
          pivotIndex: high,
          i: i,
          j: j,
          explanation: `Comparing arr[${j}] (${arr[j].value}) with pivot (${pivot})`,
        });

        if (arr[j].value <= pivot) {
          i++;
          if (i !== j) {
            totalSwaps++;
            addState({
              line: 6,
              low: low,
              high: high,
              pivot: pivot,
              pivotIndex: high,
              i: i,
              j: j,
              explanation: `${arr[j].value} <= ${pivot}, swapping arr[${i}] with arr[${j}]`,
            });
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
            addState({
              line: 7,
              low: low,
              high: high,
              pivot: pivot,
              pivotIndex: high,
              i: i,
              j: j,
              explanation: `Elements swapped. i = ${i}`,
            });
          } else {
            addState({
              line: 8,
              low: low,
              high: high,
              pivot: pivot,
              pivotIndex: high,
              i: i,
              j: j,
              explanation: `${arr[j].value} <= ${pivot}, but i == j, no swap needed`,
            });
          }
        } else {
          addState({
            line: 9,
            low: low,
            high: high,
            pivot: pivot,
            pivotIndex: high,
            i: i,
            j: j,
            explanation: `${arr[j].value} > ${pivot}, skipping`,
          });
        }
      }

      totalSwaps++;
      addState({
        line: 11,
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: high,
        i: i,
        j: high,
        explanation: `Swapping pivot with arr[${i + 1}]`,
      });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // Swap pivot
      addState({
        line: 12,
        low: low,
        high: high,
        pivot: pivot,
        pivotIndex: i + 1,
        i: i,
        j: high,
        explanation: `Pivot ${pivot} is now in correct position at index ${
          i + 1
        }`,
      });

      return i + 1;
    };

    const quickSort = (arr, low, high) => {
      if (low < high) {
        addState({
          line: 3,
          low: low,
          high: high,
          explanation: `Sorting subarray from index ${low} to ${high}`,
        });

        const pivotIndex = partition(arr, low, high);
        sortedIndices.push(pivotIndex);

        addState({
          line: 14,
          low: low,
          high: high,
          pivotIndex: pivotIndex,
          explanation: `Pivot ${arr[pivotIndex].value} is in correct position. Recursively sorting left and right subarrays.`,
        });

        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
      } else if (low === high) {
        addState({
          line: 15,
          low: low,
          high: high,
          explanation: `Base case: single element at index ${low} (value: ${arr[low].value})`,
        });
        sortedIndices.push(low);
      }
    };

    quickSort(arr, 0, n - 1);

    // Mark all elements as sorted
    const finalSorted = Array.from({ length: n }, (_, k) => k);

    addState({
      line: 16,
      sortedIndices: finalSorted,
      finished: true,
      explanation:
        "Algorithm finished. The array is fully sorted using divide and conquer approach.",
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
    generateQuickSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const btn = document.getElementById("load-button"); // the Load & Visualize button
      if (btn) btn.click();
    }
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseFloat(e.target.value));
  };

  const playhead = useCallback(() => {
    setIsPlaying((prev) => !prev); // toggle between play/pause
  }, []);

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );

  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );
  // --- Keyboard control only when active ---
  useEffect(() => {
    if (!active || !isLoaded) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBackward();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, isLoaded, stepForward, stepBackward]);

  // --- Click outside to deactivate ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (visualizerRef.current && !visualizerRef.current.contains(e.target)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isPlaying || history.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= history.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed); // faster speed = shorter delay

    return () => clearInterval(interval); // cleanup
  }, [isPlaying, speed, history.length]);
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

  // JS Pseudocode
  const quickSortCodeJS = [
    { l: 2, c: [{ t: "function quickSort(arr, low, high) {", c: "" }] },
    {
      l: 3,
      c: [
        { t: "  if", c: "purple" },
        { t: " (low < high) {", c: "" },
      ],
    },
    { l: 4, c: [{ t: "    pivotIndex = partition(arr, low, high);", c: "" }] },
    { l: 5, c: [{ t: "    quickSort(arr, low, pivotIndex-1);", c: "" }] },
    { l: 6, c: [{ t: "    quickSort(arr, pivotIndex+1, high);", c: "" }] },
    { l: 7, c: [{ t: "  }", c: "light-gray" }] },
    { l: 8, c: [{ t: "}", c: "light-gray" }] },
    { l: 10, c: [{ t: "function partition(arr, low, high) {", c: "" }] },
    { l: 11, c: [{ t: "  pivot = arr[high];", c: "" }] },
    { l: 12, c: [{ t: "  i = low - 1;", c: "" }] },
    {
      l: 13,
      c: [
        { t: "  for", c: "purple" },
        { t: " (j = low; j < high; j++) {", c: "" },
      ],
    },
    {
      l: 14,
      c: [
        { t: "    if", c: "purple" },
        { t: " (arr[j] <= pivot) {", c: "" },
      ],
    },
    { l: 15, c: [{ t: "      i++; swap(arr[i], arr[j]);", c: "" }] },
    { l: 18, c: [{ t: "  swap(arr[i+1], arr[high]);", c: "" }] },
    { l: 19, c: [{ t: "  return i + 1;", c: "" }] },
    { l: 20, c: [{ t: "}", c: "light-gray" }] },
  ];

  // Java QuickSort code
  const quickSortCodeJava = [
    {
      l: 1,
      c: [{ t: "public static void quickSortFunction(int[] arr) {", c: "" }],
    },
    { l: 2, c: [{ t: "    quickSort(arr, 0, arr.length - 1);", c: "" }] },
    { l: 3, c: [{ t: "}", c: "" }] },
    {
      l: 4,
      c: [
        {
          t: "private static void quickSort(int[] arr, int low, int high) {",
          c: "",
        },
      ],
    },
    { l: 5, c: [{ t: "    if (low < high) {", c: "" }] },
    {
      l: 6,
      c: [{ t: "        int pivotIndex = partition(arr, low, high);", c: "" }],
    },
    { l: 7, c: [{ t: "        quickSort(arr, low, pivotIndex - 1);", c: "" }] },
    {
      l: 8,
      c: [{ t: "        quickSort(arr, pivotIndex + 1, high);", c: "" }],
    },
    { l: 9, c: [{ t: "    }", c: "" }] },
    { l: 10, c: [{ t: "}", c: "" }] },
    {
      l: 11,
      c: [
        {
          t: "private static int partition(int[] arr, int low, int high) {",
          c: "",
        },
      ],
    },
    { l: 12, c: [{ t: "    int pivot = arr[high];", c: "" }] },
    { l: 13, c: [{ t: "    int i = low - 1;", c: "" }] },
    { l: 14, c: [{ t: "    for (int j = low; j < high; j++) {", c: "" }] },
    { l: 15, c: [{ t: "        if (arr[j] <= pivot) {", c: "" }] },
    { l: 16, c: [{ t: "            i++;", c: "" }] },
    {
      l: 17,
      c: [
        {
          t: "            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;",
          c: "",
        },
      ],
    },
    {
      l: 20,
      c: [
        {
          t: "    int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;",
          c: "",
        },
      ],
    },
    { l: 21, c: [{ t: "    return i + 1;", c: "" }] },
    { l: 22, c: [{ t: "}", c: "" }] },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      onClick={() => setActive(true)}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Shuffle /> Quick Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the efficient partitioning sorting algorithm
        </p>
      </header>

      {/* Input and Load */}

      <div class="w-full flex justify-center">
        <div className="shadow-2xl border border-gray-700/50 bg-gray-800/50 p-4 rounded-lg  flex flex-col md:flex-row items-center justify-between gap-2 mb-6 w-full">
          <div
            className={`flex items-center gap-4 ${
              isLoaded ? "w-full" : "w-full md:w-950"
            }`}
          >
            <label
              htmlFor="array-input"
              className="font-medium text-gray-300 font-mono hidden md:block"
            >
              Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              onKeyDown={handleEnterKey}
              disabled={isLoaded}
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center flex-wrap gap-4 md:flex-nowrap w-full md:w-150">
            {!isLoaded ? (
              <button
                id="load-button"
                onClick={loadArray}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex gap-2 w-full md:w-40 justify-center">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
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
                  {/* on click change state form play to pause */}
                  <button
                    onClick={playhead}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
                  >
                    {isPlaying ? (
                      // Pause icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                      </svg>
                    ) : (
                      // Play icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="white"
                        viewBox="0 0 448 512"
                      >
                        <path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72v368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1L91.2 36.9z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
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
                </div>
                <div className="flex gap-2 w-full lg:w-72 justify-center gap-4">
                  <div className="flex items-center gap-2 rounded-lg flex-shrink-0 lg:w-72 w-full">
                    <span className="text-sm font-semibold">Speed</span>
                    <input
                      type="range"
                      className="w-full h-1.5 bg-gray-600 rounded-lg outline-none cursor-pointer"
                      min="0.25"
                      max="2"
                      step="0.25"
                      value={speed}
                      onChange={handleSpeedChange}
                    />
                    <span className="text-sm min-w-8 font-mono text-gray-300  text-right">
                      {speed}x
                    </span>
                    <span className="font-mono w-18 px-4 py-2 flex items-center justify-center text-center bg-gray-900 border border-gray-600 rounded-md">
                      {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                    </span>
                  </div>
                </div>
              </>
            )}
            <div className="flex w-full md:w-20">
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg whitespace-nowrap text-sm sm:text-base flex-shrink-0 mx-auto w-full "
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Section */}
      {/* Code Section */}
      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode + JS/Java Toggle */}
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
                <Code size={20} />
                Pseudocode
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowJava(false)}
                  className={`py-1 px-3 rounded-lg font-bold ${
                    !showJava
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  JS
                </button>
                <button
                  onClick={() => setShowJava(true)}
                  className={`py-1 px-3 rounded-lg font-bold ${
                    showJava
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  Java
                </button>
              </div>
            </div>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {(showJava ? quickSortCodeJava : quickSortCodeJS).map(
                  (line) => (
                    <CodeLine key={line.l} line={line.l} content={line.c} />
                  )
                )}
              </code>
            </pre>
          </div>

          {/* Visualization + Stats + Explanation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Array Visualization
              </h3>
              <div className="flex justify-center items-center min-h-[170px] py-4 overflow-x-auto">
                <div
                  id="array-container"
                  className="relative transition-all"
                  style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}
                >
                  {array.map((item, index) => {
                    const isInRange =
                      state.low !== null &&
                      state.high !== null &&
                      index >= state.low &&
                      index <= state.high;
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
                        key={item.id}
                        id={`array-container-element-${index}`}
                        className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                        style={{ left: `${index * 4.5}rem` }}
                      >
                        {item.value}
                      </div>
                    );
                  })}
                  {isLoaded && state.low !== null && state.high !== null && (
                    <>
                      <VisualizerPointer
                        index={state.low}
                        containerId="array-container"
                        color="blue"
                        label="L"
                      />
                      <VisualizerPointer
                        index={state.high}
                        containerId="array-container"
                        color="purple"
                        label="H"
                      />
                      {state.pivotIndex !== null && (
                        <VisualizerPointer
                          index={state.pivotIndex}
                          containerId="array-container"
                          color="red"
                          label="P"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
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

            {/* Explanation */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-green-400" />
              )}
            </div>
          </div>
          {/* Complexity Analysis (added as requested) */}
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
                  Occurs when the pivot is always the smallest or largest
                  element, creating unbalanced partitions. This happens with
                  already sorted or reverse-sorted arrays.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Average Case: O(N log N)
                  </strong>
                  <br />
                  With good pivot selection, the array is divided roughly in
                  half at each step, leading to log N levels of recursion and
                  O(N) work per level.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Best Case: O(N log N)
                  </strong>
                  <br />
                  Occurs when the pivot always divides the array into equal
                  halves, creating a balanced recursion tree.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">
                  Space Complexity
                </h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(log N)</strong>
                  <br />
                  The space complexity is determined by the recursion depth. In
                  the best case, the recursion tree is balanced with depth log
                  N. In the worst case, it can be O(N) for very unbalanced
                  partitions. (Note: Our visualizer's history adds O(N log N)
                  space for demonstration, but the algorithm itself is O(log
                  N)).
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

export default QuickSortVisualizer;
