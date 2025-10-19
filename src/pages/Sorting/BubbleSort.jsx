import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

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
    <div
      ref={visualizerRef}
      tabIndex={0}
      onClick={() => setActive(true)}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <List /> Bubble Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the classic comparison sorting algorithm
        </p>
      </header>
      {/* ---------------------------------------under work---------------------------------------------- */}
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
                <div className="flex gap-2 w-full lg:w-72 justify-center ">
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
      {/* ----------------------------------------------------------------------------------------------- */}
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
              <div className="flex justify-center items-center min-h-[170px] py-4 overflow-x-auto">
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
