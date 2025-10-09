import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import { Code, Clock, Maximize2, TrendingUp, Layers } from "lucide-react";

const SlidingWindowMaximum = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("1,3,-1,-3,5,3,6,7");
  const [kInput, setKInput] = useState("3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [windowStyle, setWindowStyle] = useState({});

  const generateBruteForceHistory = useCallback((nums, k) => {
    const newHistory = [];
    const result = [];

    const addState = (props) =>
      newHistory.push({
        nums,
        k,
        result: [...result],
        windowStart: null,
        windowEnd: null,
        currentMax: null,
        comparingIndex: null,
        explanation: "",
        ...props,
      });

    addState({
      line: 3,
      explanation: `Starting brute force approach. Array has ${nums.length} elements, window size k = ${k}`,
    });

    for (let i = 0; i <= nums.length - k; i++) {
      addState({
        line: 4,
        windowStart: i,
        windowEnd: i + k - 1,
        explanation: `Checking window from index ${i} to ${i + k - 1}`,
      });

      let maxVal = -Infinity;
      addState({
        line: 5,
        windowStart: i,
        windowEnd: i + k - 1,
        currentMax: null,
        comparingIndex: i,
        explanation: `Initialize max for this window.`,
      });

      for (let j = i; j < i + k; j++) {
        addState({
          line: 6,
          windowStart: i,
          windowEnd: i + k - 1,
          currentMax: maxVal === -Infinity ? null : maxVal,
          comparingIndex: j,
          explanation: `Comparing: current max = ${
            maxVal === -Infinity ? "-∞" : maxVal
          }, nums[${j}] = ${nums[j]}`,
        });

        if (nums[j] > maxVal) {
          maxVal = nums[j];
          addState({
            line: 7,
            windowStart: i,
            windowEnd: i + k - 1,
            currentMax: maxVal,
            comparingIndex: j,
            explanation: `Found new max: ${maxVal} at index ${j}`,
          });
        }
      }

      result.push(maxVal);
      addState({
        line: 9,
        windowStart: i,
        windowEnd: i + k - 1,
        currentMax: maxVal,
        explanation: `Window maximum is ${maxVal}. Added to result.`,
        justAddedToResult: true,
      });
    }

    addState({
      line: 11,
      finished: true,
      explanation: `Completed! Result: [${result.join(", ")}]`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((nums, k) => {
    const newHistory = [];
    const result = [];
    const deque = [];

    const addState = (props) =>
      newHistory.push({
        nums,
        k,
        result: [...result],
        deque: [...deque],
        windowStart: null,
        windowEnd: null,
        currentIndex: null,
        explanation: "",
        ...props,
      });

    addState({
      line: 3,
      explanation: `Starting optimal approach using Deque. Array has ${nums.length} elements, window size k = ${k}`,
    });

    for (let i = 0; i < nums.length; i++) {
      addState({
        line: 5,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Processing index ${i}, value = ${nums[i]}`,
      });

      addState({
        line: 7,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Check if deque front is outside window (i - k + 1 = ${
          i - k + 1
        })`,
      });

      while (deque.length > 0 && deque[0] < i - k + 1) {
        const removed = deque.shift();
        addState({
          line: 8,
          currentIndex: i,
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          removedFromFront: removed,
          explanation: `Removed index ${removed} from deque front (outside window)`,
        });
      }

      addState({
        line: 11,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Remove elements smaller than or equal to ${nums[i]} from deque back`,
      });

      while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
        const removed = deque.pop();
        addState({
          line: 12,
          currentIndex: i,
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          removedFromBack: removed,
          explanation: `Removed index ${removed} (value ${nums[removed]}) from back because ${nums[i]} is larger or equal`,
        });
      }

      deque.push(i);
      addState({
        line: 15,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        justAddedToDeque: i,
        explanation: `Added index ${i} to deque back. Deque now: [${deque.join(
          ", "
        )}]`,
      });

      if (i >= k - 1) {
        const maxVal = nums[deque[0]];
        result.push(maxVal);
        addState({
          line: 18,
          currentIndex: i,
          windowStart: i - k + 1,
          windowEnd: i,
          justAddedToResult: true,
          explanation: `Window [${
            i - k + 1
          }, ${i}] complete. Maximum = ${maxVal} at index ${deque[0]}`,
        });
      }
    }

    addState({
      line: 21,
      finished: true,
      explanation: `Completed! Result: [${result.join(", ")}]`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput, 10);

    if (nums.some(isNaN) || nums.length === 0) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }

    if (isNaN(k) || k <= 0 || k > nums.length) {
      alert(`Invalid k value. Must be between 1 and ${nums.length}`);
      return;
    }

    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(nums, k);
    } else {
      generateOptimalHistory(nums, k);
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };
  const parseInput = useCallback(() => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput, 10);
    if (nums.some(isNaN) || isNaN(k) || k <= 0) throw new Error("Invalid input");
    return { nums, k };
  }, [numsInput, kInput]);
  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ nums, k }) => generateBruteForceHistory(nums, k),
      optimal: ({ nums, k }) => generateOptimalHistory(nums, k),
    },
    setCurrentStep,
    onError: () => {},
  });

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  const state = history[currentStep] || {};

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

  useEffect(() => {
    if (isLoaded && state.windowStart !== null) {
      const container = document.getElementById("array-container");
      const startEl = document.getElementById(
        `array-container-element-${state.windowStart}`
      );
      const endEl = document.getElementById(
        `array-container-element-${state.windowEnd}`
      );

      if (container && startEl && endEl) {
        const containerRect = container.getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        setWindowStyle({
          position: "absolute",
          top: "-8px",
          bottom: "-8px",
          left: `${startRect.left - containerRect.left - 8}px`,
          width: `${endRect.right - startRect.left + 16}px`,
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          border: "2px solid rgba(56, 189, 248, 0.5)",
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [currentStep, isLoaded, state.windowStart, state.windowEnd]);

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "light-blue": "text-sky-300",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    red: "text-red-400",
    "light-gray": "text-gray-400",
    green: "text-green-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors px-2 py-1 ${
        state.line === line ? "bg-blue-500/20 border-l-4 border-blue-400" : ""
      }`}
    >
      <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  const bruteForceCode = [
    {
      l: 3,
      c: [
        { t: "vector<int>", c: "cyan" },
        { t: " result;", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i = 0; i <= n - k; i++) {", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "  int", c: "cyan" },
        { t: " maxVal = nums[i];", c: "" },
      ],
    },
    {
      l: 6,
      c: [
        { t: "  for", c: "purple" },
        { t: " (int j = i; j < i + k; j++) {", c: "" },
      ],
    },
    { l: 7, c: [{ t: "    maxVal = max(maxVal, nums[j]);", c: "" }] },
    { l: 8, c: [{ t: "  }", c: "light-gray" }] },
    { l: 9, c: [{ t: "  result.push_back(maxVal);", c: "" }] },
    { l: 10, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 11,
      c: [
        { t: "return", c: "purple" },
        { t: " result;", c: "" },
      ],
    },
  ];

  const optimalCode = [
    {
      l: 3,
      c: [
        { t: "vector<int>", c: "cyan" },
        { t: " result;", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "deque<int>", c: "cyan" },
        { t: " dq;", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i = 0; i < n; i++) {", c: "" },
      ],
    },
    {
      l: 7,
      c: [
        { t: "  while", c: "purple" },
        { t: " (!dq.empty() && dq.front() < i - k + 1)", c: "" },
      ],
    },
    { l: 8, c: [{ t: "    dq.pop_front();", c: "" }] },
    {
      l: 11,
      c: [
        { t: "  while", c: "purple" },
        { t: " (!dq.empty() && nums[dq.back()] <= nums[i])", c: "" },
      ],
    },
    { l: 12, c: [{ t: "    dq.pop_back();", c: "" }] },
    { l: 15, c: [{ t: "  dq.push_back(i);", c: "" }] },
    {
      l: 18,
      c: [
        { t: "  if", c: "purple" },
        { t: " (i >= k - 1)", c: "" },
      ],
    },
    { l: 19, c: [{ t: "    result.push_back(nums[dq.front()]);", c: "" }] },
    {
      l: 21,
      c: [
        { t: "return", c: "purple" },
        { t: " result;", c: "" },
      ],
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          Sliding Window Maximum
        </h1>
        <p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 239</p>
      </header>

      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
            <div className="flex items-center gap-3 w-full">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                Array:
              </label>
              <input
                type="text"
                value={numsInput}
                onChange={(e) => setNumsInput(e.target.value)}
                disabled={isLoaded}
                className="font-mono flex-grow bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
                placeholder="1,3,-1,-3,5,3,6,7"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                k:
              </label>
              <input
                type="text"
                value={kInput}
                onChange={(e) => setKInput(e.target.value)}
                disabled={isLoaded}
                className="font-mono w-20 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
                placeholder="3"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isLoaded ? (
              <button
                onClick={loadArray}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                  {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                </span>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b-2 border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "brute-force"
              ? "border-blue-400 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Brute Force O(n·k)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "optimal"
              ? "border-blue-400 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Optimal O(n) - Deque
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-blue-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
              <Code size={22} />
              C++ Solution
            </h3>
            <pre className="text-sm overflow-auto max-h-96">
              <code className="font-mono leading-relaxed">
                {mode === "brute-force"
                  ? bruteForceCode.map((l) => (
                      <CodeLine key={l.l} line={l.l} content={l.c} />
                    ))
                  : optimalCode.map((l) => (
                      <CodeLine key={l.l} line={l.l} content={l.c} />
                    ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl">
              <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2">
                <TrendingUp size={22} />
                Array Visualization
              </h3>
              <div className="bg-gray-900/50 p-4 rounded-xl min-h-[12rem] flex items-center">
                <div
                  id="array-container"
                  className="relative flex gap-2 justify-center w-full"
                >
                  {state.nums?.map((num, index) => {
                    const isComparing = state.comparingIndex === index;
                    const isCurrentMax =
                      mode === "brute-force" &&
                      num === state.currentMax &&
                      index <= state.comparingIndex;
                    const isDequeIndex =
                      mode === "optimal" && state.deque?.includes(index);
                    const isDequeFront =
                      mode === "optimal" && state.deque?.[0] === index;
                    const isCurrentIndex = state.currentIndex === index;

                    return (
                      <div
                        key={index}
                        id={`array-container-element-${index}`}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-16 h-16 flex items-center justify-center font-bold text-xl rounded-lg shadow-lg border-2 transition-all duration-300 ${
                            isCurrentIndex
                              ? "bg-yellow-500/80 border-yellow-300"
                              : isDequeFront
                              ? "bg-green-500/80 border-green-300"
                              : isDequeIndex
                              ? "bg-cyan-500/80 border-cyan-300"
                              : isCurrentMax || isComparing
                              ? "bg-pink-500/80 border-pink-300"
                              : "bg-gray-600/80 border-gray-500"
                          }`}
                        >
                          {num}
                        </div>
                        <span className="text-xs text-gray-400 mt-2 font-mono">
                          [{index}]
                        </span>
                      </div>
                    );
                  })}
                  <div style={windowStyle} />
                </div>
              </div>

              <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-blue-400 bg-blue-500/10"></div>
                    <span>Window</span>
                  </div>
                  {mode === "brute-force" && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-pink-500/80 rounded border-2 border-pink-300"></div>
                      <span>Current Max</span>
                    </div>
                  )}
                  {mode === "optimal" && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-cyan-500/80 rounded border-2 border-cyan-300"></div>
                        <span>In Deque</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500/80 rounded border-2 border-green-300"></div>
                        <span>Deque Front (Max)</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500/80 rounded border-2 border-yellow-300"></div>
                    <span>Current Index</span>
                  </div>
                </div>
              </div>
            </div>

            {mode === "optimal" && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                  <Layers size={18} />
                  Deque (Front → Back)
                </h3>
                <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap">
                  {state.deque?.length > 0 ? (
                    state.deque.map((idx, pos) => (
                      <div key={pos} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 transition-all ${
                            pos === 0
                              ? "bg-gradient-to-br from-green-600 to-emerald-700 border-green-400 scale-110"
                              : "bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400"
                          }`}
                        >
                          <span className="text-xs text-gray-300">idx</span>
                          <span className="text-lg text-white">{idx}</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                          val: {state.nums[idx]}
                        </span>
                        {pos === 0 && (
                          <span className="text-xs text-green-400 font-bold mt-1">
                            FRONT
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-sm">
                      Deque is empty
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
              <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                <Maximize2 size={18} />
                Result Array
              </h3>
              <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap">
                {state.result?.length > 0 ? (
                  state.result.map((val, index) => (
                    <div
                      key={index}
                      className={`w-14 h-14 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 transition-all ${
                        state.justAddedToResult &&
                        index === state.result.length - 1
                          ? "bg-gradient-to-br from-pink-600 to-rose-700 border-pink-400 scale-110 animate-bounce"
                          : "bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400"
                      }`}
                    >
                      {val}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-sm">
                    No results yet
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Step Explanation
              </h3>
              <p className="text-gray-200 text-base leading-relaxed">
                {state.explanation || 'Click "Load & Visualize" to begin'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-blue-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
              <Clock size={24} />
              Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="space-y-5 text-base">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-300 text-lg mb-2">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(n · k)</span>
                  </h4>
                  <p className="text-gray-300">
                    For each of the (n - k + 1) windows, we iterate through k
                    elements to find the maximum. This results in approximately
                    n · k operations for large arrays.
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-300 text-lg mb-2">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(1)</span>
                  </h4>
                  <p className="text-gray-300">
                    We only use a constant amount of extra space (excluding the
                    result array) - just variables for tracking the maximum
                    value and loop indices.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-base">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-300 text-lg mb-2">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(n)</span>
                  </h4>
                  <p className="text-gray-300">
                    Each element is added to the deque exactly once and removed
                    at most once. This gives us 2n operations in total, which
                    simplifies to O(n) linear time complexity.
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-300 text-lg mb-2">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(k)</span>
                  </h4>
                  <p className="text-gray-300">
                    The deque will store at most k elements at any time. The
                    result array also stores n - k + 1 elements. Thus, the space
                    complexity is O(k).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center py-12 text-gray-500">
          Load an array and window size to begin visualization.
        </p>
      )}
    </div>
  );
};

export default SlidingWindowMaximum;
