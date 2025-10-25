import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  List,
  FlipVertical,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const PancakeSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("3,5,2,9,6,1,4");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generatePancakeSortHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    let n = arr.length;
    const newHistory = [];
    let totalFlips = 0;

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        currentIndex: null,
        maxIndex: null,
        sortedIndices: Array.from({ length: arr.length - n }, (_, i) => n + i),
        explanation: "",
        totalFlips,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Pancake Sort algorithm." });

    for (let curr_size = n; curr_size > 1; --curr_size) {
      addState({
        line: 3,
        currentIndex: curr_size - 1,
        explanation: `Start pass for size ${curr_size}. Goal is to move the largest element to index ${
          curr_size - 1
        }.`,
      });

      let mi = 0;
      for (let i = 1; i < curr_size; i++) {
        addState({
          line: 4,
          currentIndex: curr_size - 1,
          maxIndex: mi,
          i,
          explanation: `Searching for max element. Current max is ${arr[mi].value} at index ${mi}. Comparing with ${arr[i].value}.`,
        });
        if (arr[i].value > arr[mi].value) {
          mi = i;
          addState({
            line: 5,
            currentIndex: curr_size - 1,
            maxIndex: mi,
            i,
            explanation: `Found new max element ${arr[mi].value} at index ${mi}.`,
          });
        }
      }

      if (mi !== curr_size - 1) {
        if (mi !== 0) {
          totalFlips++;
          addState({
            line: 7,
            currentIndex: curr_size - 1,
            maxIndex: mi,
            explanation: `Flip 1: Bring max element (${arr[mi].value}) to the front. Flipping subarray from index 0 to ${mi}.`,
          });
          let tempArr = arr.slice(0, mi + 1).reverse();
          for (let i = 0; i <= mi; i++) arr[i] = tempArr[i];
          addState({
            line: 8,
            currentIndex: curr_size - 1,
            maxIndex: 0,
            explanation: "Subarray flipped. Max element is now at index 0.",
          });
        }

        totalFlips++;
        addState({
          line: 10,
          currentIndex: curr_size - 1,
          maxIndex: 0,
          explanation: `Flip 2: Move max element to its correct position. Flipping subarray from index 0 to ${
            curr_size - 1
          }.`,
        });
        let tempArr = arr.slice(0, curr_size).reverse();
        for (let i = 0; i < curr_size; i++) arr[i] = tempArr[i];
        addState({
          line: 11,
          currentIndex: curr_size - 1,
          maxIndex: curr_size - 1,
          explanation: `Subarray flipped. Element ${
            arr[curr_size - 1].value
          } is now sorted.`,
        });
      }
    }

    addState({
      line: 14,
      finished: true,
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
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

    const initialObjects = localArray.map((value, id) => ({ value, id }));

    setIsLoaded(true);
    generatePancakeSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("load-button")?.click();
    }
  };

  const handleSpeedChange = (e) => setSpeed(parseFloat(e.target.value));
  const playhead = useCallback(() => setIsPlaying((prev) => !prev), []);
  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

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
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, history.length]);

  const state = history[currentStep] || {};
  const { array = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "": "text-gray-200",
    "light-gray": "text-gray-400",
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

  const pancakeSortCode = [
    { l: 2, c: [{ t: "function pancakeSort(arr) {", c: "" }] },
    {
      l: 3,
      c: [
        { t: "  for", c: "purple" },
        { t: " (let n = arr.length; n > 1; n--) {", c: "" },
      ],
    },
    {
      l: 4,
      c: [{ t: "    let maxIndex = findMaxIndex(arr, n);", c: "" }],
    },
    {
      l: 5,
      c: [
        { t: "    if", c: "purple" },
        { t: " (maxIndex !== n - 1) {", c: "" },
      ],
    },
    {
      l: 7,
      c: [
        { t: "      if", c: "purple" },
        { t: " (maxIndex !== 0) {", c: "" },
      ],
    },
    {
      l: 8,
      c: [{ t: "        flip(arr, maxIndex + 1);", c: "" }],
    },
    { l: 9, c: [{ t: "      }", c: "light-gray" }] },
    { l: 10, c: [{ t: "      flip(arr, n);", c: "" }] },
    { l: 11, c: [{ t: "    }", c: "light-gray" }] },
    { l: 12, c: [{ t: "  }", c: "light-gray" }] },
    { l: 14, c: [{ t: "}", c: "light-gray" }] },
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
          <FlipVertical /> Pancake Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the pancake sorting algorithm by flipping prefixes.
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
                  <button
                    onClick={playhead}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                      </svg>
                    ) : (
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
      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {pancakeSortCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Flipping Bars Visualization
              </h3>
              <div className="flex justify-center items-end min-h-[170px] py-4 overflow-x-auto">
                {array.map((item, index) => {
                  const isSorted = state.sortedIndices?.includes(index);
                  const isMax = state.maxIndex === index;
                  const isCurrent = state.i === index;

                  let barStyles = "bg-gray-600";
                  if (state.finished || isSorted) {
                    barStyles = "bg-green-600";
                  } else if (isMax) {
                    barStyles = "bg-red-500";
                  } else if (isCurrent) {
                    barStyles = "bg-yellow-500";
                  }
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col items-center justify-end mx-1`}
                      style={{ width: "2.5rem" }}
                    >
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${barStyles}`}
                        style={{ height: `${item.value * 1.5}rem` }}
                      ></div>
                      <span className="text-sm font-bold mt-2">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <Repeat size={16} /> Total Flips
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">
                  {state.totalFlips ?? 0}
                </p>
              </div>
               <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
                  <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
                  <p className="text-gray-300">{state.explanation}</p>
                  {state.finished && (
                    <CheckCircle className="inline-block ml-2 text-green-400" />
                  )}
                </div>
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
                  Occurs as in each iteration we scan the array to find the maximum element and then perform flips.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Average Case: O(N²)
                  </strong>
                  <br />
                  The number of comparisons is always O(N²).
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Best Case: O(N)
                  </strong>
                  <br />
                  Occurs when the array is already sorted. No flips are needed, but we still need to scan the array.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">
                  Space Complexity
                </h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(1)</strong>
                  <br />
                  Pancake sort is an in-place sorting algorithm. It only requires a constant amount of extra memory.
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

export default PancakeSortVisualizer;
