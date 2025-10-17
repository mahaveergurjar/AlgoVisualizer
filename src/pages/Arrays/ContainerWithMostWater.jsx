import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  CheckCircle,
  Calculator,
  BarChart3,
  Clock,
  Droplets,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const ContainerWithMostWater = () => {
  const [mode, setMode] = useState("brute-force");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [heightsInput, setHeightsInput] = useState("1,8,6,2,5,4,8,3,7");
  const [isLoaded, setIsLoaded] = useState(false);
  const [maxHeight, setMaxHeight] = useState(1);

  const generateBruteForceHistory = useCallback((heights) => {
    const n = heights.length;
    const newHistory = [];
    let maxArea = 0;
    let maxHighlight = { i: -1, j: -1 };

    const addState = (props) =>
      newHistory.push({
        heights,
        maxArea,
        maxHighlight: { ...maxHighlight },
        i: null,
        j: null,
        currentArea: 0,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize maxArea to 0." });
    for (let i = 0; i < n; i++) {
      addState({ line: 3, i, explanation: `Outer loop starts. i = ${i}.` });
      for (let j = i + 1; j < n; j++) {
        addState({ line: 4, i, j, explanation: `Inner loop. j = ${j}.` });
        const currentArea = Math.min(heights[i], heights[j]) * (j - i);
        if (currentArea > maxArea) {
          maxArea = currentArea;
          maxHighlight = { i, j };
        }
        addState({
          line: 5,
          i,
          j,
          currentArea,
          explanation: `Area between lines ${i} and ${j} is ${currentArea}.`,
        });
        addState({
          line: 6,
          i,
          j,
          currentArea,
          maxArea,
          explanation: `Update maxArea to ${maxArea}.`,
        });
      }
    }
    addState({
      line: 9,
      finished: true,
      explanation: "Finished all pairs. Returning maxArea.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((heights) => {
    const n = heights.length;
    const newHistory = [];
    let maxArea = 0;
    let maxHighlight = { left: -1, right: -1 };
    let left = 0;
    let right = n - 1;

    const addState = (props) =>
      newHistory.push({
        heights,
        maxArea,
        maxHighlight: { ...maxHighlight },
        left,
        right,
        currentArea: 0,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize maxArea to 0." });
    addState({
      line: 3,
      explanation: `Initialize left pointer to 0 and right pointer to ${
        n - 1
      }.`,
    });

    while (left < right) {
      addState({
        line: 4,
        explanation: "Check while loop condition (left < right).",
      });
      const currentArea =
        Math.min(heights[left], heights[right]) * (right - left);
      if (currentArea > maxArea) {
        maxArea = currentArea;
        maxHighlight = { left, right };
      }
      addState({
        line: 5,
        currentArea,
        explanation: `Area between lines ${left} and ${right} is ${currentArea}.`,
      });
      addState({
        line: 6,
        currentArea,
        maxArea,
        explanation: `Update maxArea to ${maxArea}.`,
      });

      if (heights[left] < heights[right]) {
        addState({
          line: 7,
          explanation: `height[left] < height[right] (${heights[left]} < ${heights[right]}). Increment left pointer.`,
        });
        left++;
        addState({ line: 8, explanation: `New left pointer is ${left}.` });
      } else {
        addState({
          line: 10,
          explanation: `height[left] >= height[right] (${heights[left]} >= ${heights[right]}). Decrement right pointer.`,
        });
        right--;
        addState({ line: 12, explanation: `New right pointer is ${right}.` });
      }
    }
    addState({
      line: 4,
      explanation: `Loop condition false (${left} is not < ${right}).`,
    });
    addState({
      line: 15,
      finished: true,
      explanation: "Finished. Returning maxArea.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN) || localHeights.length < 2) {
      alert("Invalid input. Please use at least two comma-separated numbers.");
      return;
    }
    setMaxHeight(Math.max(...localHeights, 1));
    setIsLoaded(true);
    mode === "brute-force"
      ? generateBruteForceHistory(localHeights)
      : generateOptimalHistory(localHeights);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };
  // Provide parsed input & generator mapping for generic mode switching
  const parseInput = useCallback(() => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN) || localHeights.length < 2) throw new Error("Invalid input");
    return localHeights;
  }, [heightsInput]);
  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (h) => generateBruteForceHistory(h),
      optimal: (h) => generateOptimalHistory(h),
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
  const { heights = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "light-blue": "text-sky-300",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    red: "text-red-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };
  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-sky-500/20" : ""
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

  const bruteForceCode = [
    {
      l: 2,
      c: [
        { t: "int", c: "cyan" },
        { t: " maxArea = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 3,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i = 0; i < n; i++) {", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "  for", c: "purple" },
        { t: " (int j = i + 1; j < n; j++) {", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        {
          t: "    int currentArea = min(height[i], height[j]) * (j - i);",
          c: "",
        },
      ],
    },
    { l: 6, c: [{ t: "    maxArea = max(maxArea, currentArea);", c: "" }] },
    { l: 7, c: [{ t: "  }", c: "light-gray" }] },
    { l: 8, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 9,
      c: [
        { t: "return", c: "purple" },
        { t: " maxArea;", c: "" },
      ],
    },
  ];

  const optimalCode = [
    {
      l: 2,
      c: [
        { t: "int", c: "cyan" },
        { t: " maxArea = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 3,
      c: [
        { t: "int", c: "cyan" },
        { t: " left = ", c: "" },
        { t: "0", c: "orange" },
        { t: ", right = n - ", c: "" },
        { t: "1", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "while", c: "purple" },
        { t: " (left < right) {", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        {
          t: "  int currentArea = min(height[left], height[right]) * (right - left);",
          c: "",
        },
      ],
    },
    { l: 6, c: [{ t: "  maxArea = max(maxArea, currentArea);", c: "" }] },
    {
      l: 7,
      c: [
        { t: "  if", c: "purple" },
        { t: " (height[left] < height[right]) {", c: "" },
      ],
    },
    { l: 8, c: [{ t: "    left++;", c: "" }] },
    { l: 9, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 10,
      c: [
        { t: "  else", c: "purple" },
        { t: " {", c: "" },
      ],
    },
    { l: 12, c: [{ t: "    right--;", c: "" }] },
    { l: 13, c: [{ t: "  }", c: "light-gray" }] },
    { l: 14, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 15,
      c: [
        { t: "return", c: "purple" },
        { t: " maxArea;", c: "" },
      ],
    },
  ];

  const leftIndex = mode === "brute-force" ? state.i : state.left;
  const rightIndex = mode === "brute-force" ? state.j : state.right;

  let waterStyle = {};
  if (
    isLoaded &&
    leftIndex !== null &&
    rightIndex !== null &&
    leftIndex >= 0 &&
    rightIndex < heights.length
  ) {
    const waterHeight = Math.min(heights[leftIndex], heights[rightIndex]);
    waterStyle = {
      position: "absolute",
      bottom: "1.75rem", // Adjust for label height + border
      height: `${(waterHeight / maxHeight) * 100}%`,
      left: `calc(${leftIndex} * (1rem + 0.5rem) + 0.25rem)`, // 1rem bar, 0.5rem total margin
      width: `calc(${rightIndex - leftIndex} * 1.5rem)`,
      backgroundColor: "rgba(56, 189, 248, 0.2)",
      border: "1px solid rgba(56, 189, 248, 0.5)",
      transition: "all 300ms ease-out",
      pointerEvents: "none",
    };
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-sky-400">
          Container With Most Water
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 11</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label
            htmlFor="heights-input"
            className="font-medium text-gray-300 font-mono"
          >
            Heights:
          </label>
          <input
            id="heights-input"
            type="text"
            value={heightsInput}
            onChange={(e) => setHeightsInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
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
            className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "brute-force"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Brute Force O(n²)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Optimal O(n)
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-sky-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              C++ {mode === "brute-force" ? "Brute Force" : "Optimal"} Solution
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {mode === "brute-force"
                  ? bruteForceCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))
                  : optimalCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[340px]">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Container Lines
              </h3>
              <div
                id="container-lines"
                className="flex justify-center items-end h-64 border-b-2 border-gray-600 pb-2"
              >
                {heights.map((h, index) => {
                  const isLeft =
                    (mode === "brute-force" && state.i === index) ||
                    (mode === "optimal" && state.left === index);
                  const isRight =
                    (mode === "brute-force" && state.j === index) ||
                    (mode === "optimal" && state.right === index);
                  return (
                    <div
                      key={index}
                      id={`container-lines-element-${index}`}
                      className="w-4 mx-1 flex flex-col justify-end items-center h-full"
                    >
                      <div
                        className={`w-full transition-all duration-300 ${
                          isLeft
                            ? "bg-amber-400"
                            : isRight
                            ? "bg-cyan-400"
                            : "bg-gray-600"
                        }`}
                        style={{ height: `${(h / maxHeight) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-400 mt-1">{h}</span>
                    </div>
                  );
                })}
                <div style={waterStyle} />
              </div>
              {isLoaded && mode === "brute-force" && (
                <VisualizerPointer
                  index={state.i}
                  containerId="container-lines"
                  color="amber"
                  label="i"
                  direction="up"
                />
              )}
              {isLoaded && mode === "brute-force" && (
                <VisualizerPointer
                  index={state.j}
                  containerId="container-lines"
                  color="cyan"
                  label="j"
                  direction="up"
                />
              )}
              {isLoaded && mode === "optimal" && (
                <VisualizerPointer
                  index={state.left}
                  containerId="container-lines"
                  color="amber"
                  label="left"
                  direction="up"
                />
              )}
              {isLoaded && mode === "optimal" && (
                <VisualizerPointer
                  index={state.right}
                  containerId="container-lines"
                  color="cyan"
                  label="right"
                  direction="up"
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <h3 className="text-gray-400 text-sm flex items-center gap-2">
                  <Calculator size={16} />
                  Current Area
                </h3>
                <p className="font-mono text-3xl mt-2">{state.currentArea}</p>
              </div>
              <div className="bg-green-800/30 p-4 rounded-xl border border-green-700/50">
                <h3 className="text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Max Area Found
                </h3>
                <p className="font-mono text-3xl text-green-400 mt-2">
                  {state.maxArea ?? 0}
                </p>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
            </div>
          </div>
          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-sky-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N²)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    We consider every possible pair of lines by using nested
                    loops. The outer loop runs N times, and the inner loop runs
                    up to N-1 times, resulting in a quadratic time complexity.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(1)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    Only a few variables are used to store the pointers and max
                    area. The space required is constant and does not depend on
                    the input size.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    We use a two-pointer approach where each pointer traverses
                    the array at most once. The `left` pointer moves from left
                    to right, and the `right` pointer moves from right to left.
                    Since they only move in one direction, they will cross each
                    other after a single pass through the array, resulting in
                    linear time complexity.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(1)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    The two pointers (`left` and `right`) and a variable for
                    `maxArea` use a constant amount of extra space.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Load heights to begin visualization.
        </p>
      )}
    </div>
  );
};

export default ContainerWithMostWater;
