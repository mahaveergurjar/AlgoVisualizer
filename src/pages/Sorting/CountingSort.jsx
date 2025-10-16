import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  ListOrdered,
} from "lucide-react";

// Highlighting is done via CSS classes.

// Main Visualizer Component
const CountingSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("4,2,2,8,3,3,1");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateCountingSortHistory = useCallback((initialArray) => {
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
      explanation: `Created a 'count' array of size ${
        max + 1
      } to store frequencies.`,
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
        line: 7,
        highlightedIndex: i,
        countIndex: value,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Element is ${value}. Incrementing count at index ${value}. Count is now ${count[value]}.`,
      });
    }

    // 2. Store cumulative count
    addState({
      line: 8,
      countArray: [...count],
      outputArray: [...output],
      explanation:
        "Modify the count array to store the cumulative sum of counts.",
    });
    for (let i = 1; i <= max; i++) {
      count[i] += count[i - 1];
      totalOperations++;
      addState({
        line: 9,
        countIndex: i,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Updating count at index ${i} to ${count[i]} (cumulative sum of previous counts). This value now represents the last position for element ${i}.`,
      });
    }

    // 3. Build the output array
    addState({
      line: 10,
      countArray: [...count],
      outputArray: [...output],
      explanation: "Build the sorted output array using the cumulative counts.",
    });
    for (let i = n - 1; i >= 0; i--) {
      const value = arr[i].value;
      const pos = count[value] - 1;
      output[pos] = arr[i];
      totalOperations++;
      addState({
        line: 11,
        highlightedIndex: i,
        countIndex: value,
        outputIndex: pos,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Element is ${value}. Its position is at count[${value}]-1 = ${pos}. Placing it in the output array.`,
      });

      count[value]--;
      totalOperations++;
      addState({
        line: 12,
        highlightedIndex: i,
        countIndex: value,
        outputIndex: pos,
        countArray: [...count],
        outputArray: [...output],
        explanation: `Decrementing count at index ${value} for the next occurrence of this element.`,
      });
    }

    // 4. Copy the output array to arr
    addState({
      line: 13,
      countArray: [...count],
      outputArray: [...output],
      explanation:
        "Copy the sorted elements from the output array back to the original array.",
    });
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      sortedIndices.push(i);
      totalOperations++;
      addState({
        line: 14,
        array: [...arr],
        outputArray: [...output],
        countArray: [...count],
        highlightedIndex: i,
        sortedIndices: [...sortedIndices],
        explanation: `Copying ${arr[i].value} from output to the final position ${i}.`,
      });
    }

    addState({
      line: 15,
      finished: true,
      array: [...arr],
      outputArray: [...output],
      countArray: [...count],
      sortedIndices: Array.from({ length: n }, (_, k) => k),
      explanation: "Counting Sort completed. Array is fully sorted.",
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

    if (
      localArray.some(isNaN) ||
      localArray.length === 0 ||
      localArray.some((n) => n < 0)
    ) {
      alert("Invalid input. Please use comma-separated non-negative numbers.");
      return;
    }

    const initialObjects = localArray.map((value, id) => ({ value, id }));
    setIsLoaded(true);
    generateCountingSortHistory(initialObjects);
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
  const { array = [], countArray = [], outputArray = [] } = state;

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

  const countingSortCode = [
    { l: 2, c: [{ t: "function countingSort(arr) {", c: "" }] },
    { l: 3, c: [{ t: "  max = findMax(arr)", c: "" }] },
    { l: 4, c: [{ t: "  count = new Array(max + 1).fill(0)", c: "" }] },
    { l: 5, c: [{ t: "  output = new Array(arr.length)", c: "" }] },
    { l: 6, c: [{ t: "  for i from 0 to arr.length-1:", c: "purple" }] },
    { l: 7, c: [{ t: "    count[arr[i]]++", c: "" }] },
    { l: 8, c: [{ t: "  for i from 1 to max:", c: "purple" }] },
    { l: 9, c: [{ t: "    count[i] += count[i-1]", c: "" }] },
    { l: 10, c: [{ t: "  for i from arr.length-1 down to 0:", c: "purple" }] },
    { l: 11, c: [{ t: "    output[count[arr[i]]-1] = arr[i]", c: "" }] },
    { l: 12, c: [{ t: "    count[arr[i]]--", c: "" }] },
    { l: 13, c: [{ t: "  for i from 0 to arr.length-1:", c: "purple" }] },
    { l: 14, c: [{ t: "    arr[i] = output[i]", c: "" }] },
    { l: 15, c: [{ t: "}", c: "" }] },
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
          <ListOrdered /> Counting Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the non-comparative integer sorting algorithm
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
              <Code size={20} /> Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {countingSortCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Main Array Visualization */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} /> Input/Final Array
              </h3>
              <div className="flex justify-center items-end flex-wrap gap-2 min-h-[80px]">
                {array.map((item, index) => {
                  const isHighlighted = state.highlightedIndex === index;
                  const isSorted = state.sortedIndices?.includes(index);

                  let boxStyles = "bg-gray-700 border-gray-600";
                  if (state.finished || isSorted) {
                    boxStyles = "bg-green-700 border-green-500 text-white";
                  } else if (isHighlighted) {
                    boxStyles = "bg-amber-600 border-amber-400 text-white";
                  }

                  return (
                    <div key={item.id} className="text-center">
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
              </div>
            </div>

            {/* Count Array Visualization */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4">
                Count Array
              </h3>
              <div className="flex justify-center items-end flex-wrap gap-2 min-h-[60px]">
                {countArray.map((count, index) => {
                  const isCountIndex = state.countIndex === index;
                  const boxStyles = isCountIndex
                    ? "bg-yellow-600 border-yellow-400 text-white"
                    : "bg-gray-700 border-gray-600";
                  return (
                    <div key={index} className="text-center">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-md shadow-md border-2 font-medium text-lg transition-all duration-300 ${boxStyles}`}
                      >
                        {count}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {index}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output Array Visualization */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4">
                Output Array
              </h3>
              <div className="flex justify-center items-end flex-wrap gap-2 min-h-[80px]">
                {outputArray.map((item, index) => {
                  const isOutputIndex = state.outputIndex === index;
                  const boxStyles = isOutputIndex
                    ? "bg-blue-600 border-blue-400 text-white"
                    : "bg-gray-700 border-gray-600";
                  return (
                    <div key={index} className="text-center">
                      <div
                        className={`w-14 h-14 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-xl transition-all duration-300 ${boxStyles}`}
                      >
                        {item?.value ?? ""}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {index}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Total Operations
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">
                  {state.totalOperations ?? 0}
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
                    All Cases: O(N + K)
                  </strong>
                  <br />
                  Where N is the number of elements in the input array and K is
                  the range of the input (i.e., the maximum value). The
                  algorithm iterates through the input array a fixed number of
                  times and also iterates through the count array of size K. Its
                  performance is not dependent on the initial order of elements.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">
                  Space Complexity
                </h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(N + K)</strong>
                  <br />
                  The space complexity is determined by the extra arrays used.
                  It requires an 'output' array of size N and a 'count' array of
                  size K. Therefore, the total auxiliary space is proportional
                  to N + K.
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

export default CountingSortVisualizer;
