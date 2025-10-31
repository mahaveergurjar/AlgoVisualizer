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
import VisualizerPointer from "../../components/VisualizerPointer"; // Make sure this path is correct

// Main Visualizer Component
const HeapSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("12,11,13,5,6,7");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateHeapSortHistory = useCallback((initialArray) => {
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
        heapSize: n,
        rootIndex: null,
        leftIndex: null, // Still track for coloring, but no pointer
        rightIndex: null, // Still track for coloring, but no pointer
        largestIndex: null,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Heap Sort algorithm." });

    // Heapify subtree rooted at index i
    const heapify = (heapSize, i) => {
      addState({
        line: 10,
        heapSize,
        rootIndex: i,
        explanation: `Heapifying subtree with root at index ${i}.`,
      });

      let largest = i;
      let left = 2 * i + 1;
      let right = 2 * i + 2;

      // See if left child exists and is greater than root
      if (left < heapSize) {
        totalComparisons++;
        addState({
          line: 11,
          heapSize,
          rootIndex: i,
          leftIndex: left,
          rightIndex: right,
          largestIndex: largest,
          explanation: `Comparing root (${arr[i].value}) with left child (${arr[left].value}).`,
        });
        if (arr[left].value > arr[largest].value) {
          largest = left;
        }
      }

      // See if right child exists and is greater than largest so far
      if (right < heapSize) {
        totalComparisons++;
        addState({
          line: 12,
          heapSize,
          rootIndex: i,
          leftIndex: left,
          rightIndex: right,
          largestIndex: largest,
          explanation: `Comparing largest so far (${arr[largest].value}) with right child (${arr[right].value}).`,
        });
        if (arr[right].value > arr[largest].value) {
          largest = right;
        }
      }

      // If largest is not root
      addState({
        line: 13,
        heapSize,
        rootIndex: i,
        leftIndex: left,
        rightIndex: right,
        largestIndex: largest,
        explanation: `Checking if the largest element (${arr[largest].value}) is not the root (${arr[i].value}).`,
      });
      if (largest !== i) {
        addState({
          line: 14,
          heapSize,
          rootIndex: i,
          largestIndex: largest,
          explanation: `Swapping root ${arr[i].value} with largest child ${arr[largest].value}.`,
        });
        [arr[i], arr[largest]] = [arr[largest], arr[i]]; // Swap
        totalSwaps++;
        addState({
          line: 14,
          heapSize,
          rootIndex: i,
          largestIndex: largest,
          array: [...arr],
          explanation: `Swap complete.`,
        });

        // Recursively heapify the affected sub-tree
        heapify(heapSize, largest);
      }
    };

    // Build a maxheap
    addState({
      line: 3,
      explanation: "Building the max heap from the unsorted array.",
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }
    addState({
      line: 4,
      explanation:
        "Max heap has been built. The largest element is at the root.",
    });

    // One by one extract an element from heap
    addState({
      line: 5,
      explanation:
        "Starting extraction phase. Swap root with last element and reduce heap size.",
    });
    for (let i = n - 1; i > 0; i--) {
      // Move current root to end
      addState({
        line: 6,
        heapSize: i + 1,
        rootIndex: 0,
        largestIndex: i,
        explanation: `Swapping max element (root) ${arr[0].value} with last element of heap ${arr[i].value}.`,
      });
      [arr[0], arr[i]] = [arr[i], arr[0]];
      totalSwaps++;
      sortedIndices.unshift(i);
      addState({
        line: 6,
        array: [...arr],
        heapSize: i,
        rootIndex: 0,
        largestIndex: i,
        explanation: `Element ${arr[i].value} is now sorted.`,
      });

      // call max heapify on the reduced heap
      heapify(i, 0);
    }

    sortedIndices.unshift(0);
    addState({
      line: 8,
      finished: true,
      sortedIndices,
      explanation: "Heap Sort completed. Array is fully sorted.",
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
    generateHeapSortHistory(initialObjects);
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

  const heapSortCode = [
    { l: 2, c: [{ t: "function heapSort(arr) {", c: "" }] },
    { l: 3, c: [{ t: "  buildMaxHeap(arr)", c: "yellow" }] },
    { l: 4, c: [{ t: "  // Heap is built", c: "light-gray" }] },
    { l: 5, c: [{ t: "  for i from n-1 down to 1:", c: "purple" }] },
    { l: 6, c: [{ t: "    swap(arr[0], arr[i])", c: "" }] },
    { l: 7, c: [{ t: "    heapify(arr, i, 0)", c: "yellow" }] },
    { l: 8, c: [{ t: "}", c: "" }] },
    { l: 9, c: [{ t: "", c: "" }] },
    { l: 10, c: [{ t: "function heapify(arr, heapSize, i) {", c: "" }] },
    {
      l: 11,
      c: [{ t: "  if leftChild < heapSize and arr[l] > arr[largest]", c: "" }],
    },
    {
      l: 12,
      c: [{ t: "  if rightChild < heapSize and arr[r] > arr[largest]", c: "" }],
    },
    { l: 13, c: [{ t: "  if largest != i:", c: "purple" }] },
    { l: 14, c: [{ t: "    swap(arr[i], arr[largest])", c: "" }] },
    { l: 15, c: [{ t: "    heapify(arr, heapSize, largest)", c: "yellow" }] },
    { l: 16, c: [{ t: "}", c: "" }] },
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
          <Shuffle /> Heap Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the comparison-based sorting algorithm using a binary heap
        </p>
      </header>
      <div className="w-full flex justify-center">
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
                    {/* Array size display - showing current number of elements */}
                    {isLoaded && arrayInput && (
                      <span className="text-sm text-gray-400 font-medium ml-4">
                        Array Size: {arrayInput.split(',').filter(item => item.trim() !== '').length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex w-full md:w-20">
                  <button
                    onClick={reset}
                    className="bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg whitespace-nowrap text-sm sm:text-base flex-shrink-0 mx-auto w-full "
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
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
                {heapSortCode.map((line) => (
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
              <div
                id="array-container"
                className="flex justify-center items-center flex-wrap gap-2 min-h-[80px] relative"
              >
                {array.map((item, index) => {
                  const isSorted = state.sortedIndices?.includes(index);
                  const isRoot = state.rootIndex === index;
                  const isLargest = state.largestIndex === index;
                  const isLeftChild = state.leftIndex === index;
                  const isRightChild = state.rightIndex === index;
                  const isComparing = isLeftChild || isRightChild; // Keep for coloring
                  const isInHeap = index < state.heapSize;

                  let boxStyles = "bg-gray-700 border-gray-600";
                  if (state.finished || isSorted) {
                    boxStyles = "bg-green-700 border-green-500 text-white";
                  } else if (isRoot) {
                    boxStyles = "bg-red-600 border-red-400 text-white";
                  } else if (isLargest) {
                    boxStyles = "bg-blue-600 border-blue-400 text-white";
                  } else if (isComparing) {
                    boxStyles = "bg-amber-600 border-amber-400 text-white";
                  } else if (!isInHeap) {
                    boxStyles = "bg-gray-800 border-gray-700 opacity-50";
                  }

                  return (
                    <div
                      key={item.id}
                      id={`array-container-element-${index}`}
                      className="text-center relative"
                    >
                      <div
                        className={`w-14 h-14 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-xl transition-all duration-300 ${boxStyles}`}
                      >
                        {item.value}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {index}
                      </span>
                    </div>
                  );
                })}
                {state.heapSize > 0 && state.heapSize < array.length && (
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-dashed border-purple-400 transition-all duration-300"
                    style={{ left: `${state.heapSize * 3.75 - 0.25}rem` }} // Adjust position based on element width + gap
                    title={`Heap size: ${state.heapSize}`}
                  ></div>
                )}

                {isLoaded && state.rootIndex !== null && (
                  <VisualizerPointer
                    index={state.rootIndex}
                    containerId="array-container"
                    color="red"
                    label="R" // Root
                  />
                )}
                {isLoaded &&
                  state.largestIndex !== null &&
                  state.largestIndex !== state.rootIndex && (
                    <VisualizerPointer
                      index={state.largestIndex}
                      containerId="array-container"
                      color="blue"
                      label="Lg" // Largest
                    />
                  )}
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
                    Worst Case: O(N log N)
                  </strong>
                  <br />
                  Occurs for all inputs. The height of the heap is log N.
                  Building the heap takes O(N), and each of the N extraction
                  operations takes O(log N) for heapifying.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Average Case: O(N log N)
                  </strong>
                  <br />
                  The performance of Heap Sort is very consistent across
                  different input distributions, making it reliable.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Best Case: O(N log N)
                  </strong>
                  <br />
                  Even if the array is already sorted, the algorithm must still
                  build the heap and extract each element, resulting in the same
                  complexity.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">
                  Space Complexity
                </h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(1)</strong>
                  <br />
                  Heap sort is an in-place algorithm, meaning it requires a
                  constant amount of extra memory regardless of the input size.
                  If the recursive implementation of `heapify` is considered,
                  the space for the recursion stack is O(log N) due to the
                  height of the heap.
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

export default HeapSortVisualizer;
