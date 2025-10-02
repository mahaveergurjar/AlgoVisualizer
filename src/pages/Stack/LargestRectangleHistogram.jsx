import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUp,
  Code,
  CheckCircle,
  List,
  Calculator,
  Layers,
  BarChart3,
  Clock,
} from "lucide-react";

// Pointer Component
const VisualizerPointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0 });

  useEffect(() => {
    if (index === null || index < 0) {
      setPosition({ opacity: 0 });
      return;
    }
    const container = document.getElementById(containerId);
    const element = document.getElementById(`${containerId}-element-${index}`);
    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset =
        elementRect.left - containerRect.left + elementRect.width / 2 - 12;
      setPosition({ opacity: 1, left: offset });
    } else {
      setPosition({ opacity: 0 });
    }
  }, [index, containerId]);

  return (
    <div
      className="absolute top-full text-center transition-all duration-300 ease-out"
      style={position}
    >
      <ArrowUp className={`w-6 h-6 mx-auto text-${color}-400`} />
      <span className={`font-bold text-lg font-mono text-${color}-400`}>
        {label}
      </span>
    </div>
  );
};

// Main Visualizer Component
const LargestRectangleHistogram = () => {
  const [mode, setMode] = useState("brute-force");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [heightsInput, setHeightsInput] = useState("2,1,5,6,2,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [maxHeight, setMaxHeight] = useState(1);

  const generateBruteForceHistory = useCallback((heights) => {
    const newHistory = [];
    let maxArea = 0;
    const addState = (props) =>
      newHistory.push({
        heights,
        maxArea,
        i: null,
        j: null,
        minHeight: null,
        currentArea: 0,
        highlight: { start: -1, end: -1, h: 0 },
        maxHighlight: { start: -1, end: -1, h: 0 },
        ...props,
      });

    addState({ line: 4, explanation: "Initialize maxArea to 0." });
    for (let i = 0; i < heights.length; i++) {
      addState({ line: 5, i, explanation: `Outer loop starts. i = ${i}.` });
      let minHeight = Infinity;
      addState({
        line: 6,
        i,
        minHeight: "∞",
        explanation: `Initialize minHeight for this subarray.`,
      });
      for (let j = i; j < heights.length; j++) {
        addState({
          line: 7,
          i,
          j,
          minHeight: minHeight === Infinity ? "∞" : minHeight,
          explanation: `Inner loop. j = ${j}.`,
        });
        minHeight = Math.min(minHeight, heights[j]);
        const currentArea = minHeight * (j - i + 1);

        let maxHighlight = newHistory[newHistory.length - 1].maxHighlight;
        if (currentArea > maxArea) {
          maxArea = currentArea;
          maxHighlight = { start: i, end: j, h: minHeight };
        }

        addState({
          line: 8,
          i,
          j,
          minHeight,
          explanation: `Update minHeight to ${minHeight} for range [${i}, ${j}].`,
        });
        addState({
          line: 9,
          i,
          j,
          minHeight,
          currentArea,
          maxArea,
          highlight: { start: i, end: j, h: minHeight },
          maxHighlight,
          explanation: `Calculate area: ${minHeight} * (${j} - ${i} + 1) = ${currentArea}. Update maxArea to ${maxArea}.`,
        });
      }
    }
    addState({
      line: 12,
      finished: true,
      explanation: "All subarrays checked. Final maxArea is found.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((heights) => {
    const n = heights.length;
    const newHistory = [];
    let stack = [];
    let leftSmall = new Array(n).fill(0);
    let rightSmall = new Array(n).fill(n - 1);
    let maxA = 0;

    const addState = (props) =>
      newHistory.push({
        heights,
        stack: [...stack],
        leftSmall: [...leftSmall],
        rightSmall: [...rightSmall],
        maxA,
        i: null,
        highlight: { start: -1, end: -1, h: 0 },
        maxHighlight: { start: -1, end: -1, h: 0 },
        ...props,
      });

    addState({
      line: 7,
      explanation: "Pass 1: Find the previous smaller element for each bar.",
    });
    for (let i = 0; i < n; i++) {
      addState({ line: 8, i, explanation: `Processing bar at index ${i}.` });
      addState({ line: 9, i, explanation: "Check while loop condition." });
      while (
        stack.length > 0 &&
        heights[stack[stack.length - 1]] >= heights[i]
      ) {
        const top = stack.pop();
        addState({
          line: 10,
          i,
          explanation: `height[${top}] >= height[${i}]. Popping ${top}.`,
        });
        addState({ line: 9, i, explanation: "Re-check while loop." });
      }
      if (stack.length === 0) {
        leftSmall[i] = 0;
        addState({
          line: 12,
          i,
          explanation: `Stack empty. Left boundary for index ${i} is 0.`,
        });
      } else {
        leftSmall[i] = stack[stack.length - 1] + 1;
        addState({
          line: 14,
          i,
          explanation: `Stack not empty. Left boundary for ${i} is ${
            stack[stack.length - 1]
          } + 1 = ${leftSmall[i]}.`,
        });
      }
      stack.push(i);
      addState({ line: 15, i, explanation: `Pushing index ${i} onto stack.` });
    }

    stack = [];
    addState({
      line: 18,
      explanation: "Pass 1 finished. Clearing stack for Pass 2.",
    });

    addState({
      line: 20,
      explanation: "Pass 2: Find the next smaller element for each bar.",
    });
    for (let i = n - 1; i >= 0; i--) {
      addState({ line: 21, i, explanation: `Processing bar at index ${i}.` });
      addState({ line: 22, i, explanation: "Check while loop condition." });
      while (
        stack.length > 0 &&
        heights[stack[stack.length - 1]] >= heights[i]
      ) {
        const top = stack.pop();
        addState({
          line: 23,
          i,
          explanation: `height[${top}] >= height[${i}]. Popping ${top}.`,
        });
        addState({ line: 22, i, explanation: "Re-check while loop." });
      }
      if (stack.length === 0) {
        rightSmall[i] = n - 1;
        addState({
          line: 25,
          i,
          explanation: `Stack empty. Right boundary for index ${i} is ${
            n - 1
          }.`,
        });
      } else {
        rightSmall[i] = stack[stack.length - 1] - 1;
        addState({
          line: 27,
          i,
          explanation: `Stack not empty. Right boundary for ${i} is ${
            stack[stack.length - 1]
          } - 1 = ${rightSmall[i]}.`,
        });
      }
      stack.push(i);
      addState({ line: 29, i, explanation: `Pushing index ${i} onto stack.` });
    }

    let maxHighlight = { start: -1, end: -1, h: 0 };
    addState({
      line: 32,
      explanation:
        "Pass 3: Calculate max area using left and right boundaries.",
    });
    for (let i = 0; i < n; i++) {
      const currentArea = heights[i] * (rightSmall[i] - leftSmall[i] + 1);
      if (currentArea > maxA) {
        maxA = currentArea;
        maxHighlight = {
          start: leftSmall[i],
          end: rightSmall[i],
          h: heights[i],
        };
      }
      addState({
        line: 34,
        i,
        maxA,
        highlight: { start: leftSmall[i], end: rightSmall[i], h: heights[i] },
        maxHighlight,
        explanation: `For index ${i}, area = ${heights[i]} * (${rightSmall[i]} - ${leftSmall[i]} + 1) = ${currentArea}. Max Area = ${maxA}`,
      });
    }
    addState({
      line: 36,
      finished: true,
      maxHighlight,
      explanation: "All bars processed. Final answer found.",
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
    if (localHeights.some(isNaN) || localHeights.length === 0) {
      alert("Invalid input. Please use comma-separated numbers for heights.");
      return;
    }
    setMaxHeight(Math.max(...localHeights, 1));
    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(localHeights);
    } else {
      generateOptimalHistory(localHeights);
    }
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

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "light-blue": "text-sky-300",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    green: "text-green-500",
    red: "text-red-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-green-500/20" : ""
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
      l: 4,
      c: [
        { t: "int", c: "cyan" },
        { t: " maxArea ", c: "" },
        { t: "=", c: "red" },
        { t: " ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "for", c: "purple" },
        { t: " (", c: "light-gray" },
        { t: "int", c: "cyan" },
        { t: " i", c: "light-blue" },
        { t: "=", c: "red" },
        { t: "0", c: "orange" },
        { t: "; i<n; i++) {", c: "" },
      ],
    },
    {
      l: 6,
      c: [
        { t: "  int", c: "cyan" },
        { t: " minHeight ", c: "" },
        { t: "=", c: "red" },
        { t: " INT_MAX", c: "light-blue" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 7,
      c: [
        { t: "  for", c: "purple" },
        { t: " (", c: "light-gray" },
        { t: "int", c: "cyan" },
        { t: " j", c: "light-blue" },
        { t: "=", c: "red" },
        { t: "i; j<n; j++) {", c: "" },
      ],
    },
    {
      l: 8,
      c: [
        { t: "    minHeight ", c: "light-blue" },
        { t: "=", c: "red" },
        { t: " min(minHeight, arr[j]);", c: "" },
      ],
    },
    {
      l: 9,
      c: [
        { t: "    maxArea ", c: "light-blue" },
        { t: "=", c: "red" },
        { t: " max(maxArea, minHeight ", c: "" },
        { t: "*", c: "red" },
        { t: " (j ", c: "" },
        { t: "-", c: "red" },
        { t: " i ", c: "" },
        { t: "+", c: "red" },
        { t: " ", c: "" },
        { t: "1", c: "orange" },
        { t: "));", c: "" },
      ],
    },
    { l: 10, c: [{ t: "  }", c: "light-gray" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 12,
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
        { t: " largestRectangleArea(", c: "yellow" },
        { t: "vector<", c: "yellow" },
        { t: "int", c: "cyan" },
        { t: ">&", c: "yellow" },
        { t: " heights) {", c: "" },
      ],
    },
    {
      l: 3,
      c: [
        { t: "  int", c: "cyan" },
        { t: " n ", c: "" },
        { t: "=", c: "red" },
        { t: " heights.", c: "" },
        { t: "size", c: "yellow" },
        { t: "();", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "  stack<", c: "yellow" },
        { t: "int", c: "cyan" },
        { t: "> st;", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "  int", c: "cyan" },
        { t: " leftsmall[n], rightsmall[n];", c: "" },
      ],
    },
    { l: 7, c: [{ t: "  // Find previous smaller element", c: "green" }] },
    {
      l: 8,
      c: [
        { t: "  for", c: "purple" },
        { t: " (", c: "light-gray" },
        { t: "int", c: "cyan" },
        { t: " i ", c: "light-blue" },
        { t: "=", c: "red" },
        { t: " ", c: "" },
        { t: "0", c: "orange" },
        { t: "; i < n; i++) {", c: "" },
      ],
    },
    {
      l: 9,
      c: [
        { t: "    while", c: "purple" },
        { t: " (!st.", c: "" },
        { t: "empty", c: "yellow" },
        { t: "() && heights[st.", c: "" },
        { t: "top", c: "yellow" },
        { t: "()] >= heights[i]) {", c: "" },
      ],
    },
    {
      l: 10,
      c: [
        { t: "      st.", c: "" },
        { t: "pop", c: "yellow" },
        { t: "();", c: "" },
      ],
    },
    { l: 11, c: [{ t: "    }", c: "light-gray" }] },
    {
      l: 12,
      c: [
        { t: "    if", c: "purple" },
        { t: " (st.", c: "" },
        { t: "empty", c: "yellow" },
        { t: "()) leftsmall[i] ", c: "" },
        { t: "=", c: "red" },
        { t: " ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 14,
      c: [
        { t: "    else", c: "purple" },
        { t: " leftsmall[i] ", c: "" },
        { t: "=", c: "red" },
        { t: " st.", c: "" },
        { t: "top", c: "yellow" },
        { t: "() + ", c: "" },
        { t: "1", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 15,
      c: [
        { t: "    st.", c: "" },
        { t: "push", c: "yellow" },
        { t: "(i);", c: "" },
      ],
    },
    { l: 16, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 18,
      c: [
        { t: "  while", c: "purple" },
        { t: " (!st.", c: "" },
        { t: "empty", c: "yellow" },
        { t: "()) st.", c: "" },
        { t: "pop", c: "yellow" },
        { t: "();", c: "" },
      ],
    },
    { l: 20, c: [{ t: "  // Find next smaller element", c: "green" }] },
    {
      l: 21,
      c: [
        { t: "  for", c: "purple" },
        { t: " (", c: "light-gray" },
        { t: "int", c: "cyan" },
        { t: " i ", c: "light-blue" },
        { t: "=", c: "red" },
        { t: " n - ", c: "" },
        { t: "1", c: "orange" },
        { t: "; i >= 0; i--) {", c: "" },
      ],
    },
    {
      l: 22,
      c: [
        { t: "    while", c: "purple" },
        { t: " (!st.", c: "" },
        { t: "empty", c: "yellow" },
        { t: "() && heights[st.", c: "" },
        { t: "top", c: "yellow" },
        { t: "()] >= heights[i])", c: "" },
      ],
    },
    {
      l: 23,
      c: [
        { t: "      st.", c: "" },
        { t: "pop", c: "yellow" },
        { t: "();", c: "" },
      ],
    },
    { l: 24, c: [{ t: "    }", c: "light-gray" }] },
    {
      l: 25,
      c: [
        { t: "    if", c: "purple" },
        { t: " (st.", c: "" },
        { t: "empty", c: "yellow" },
        { t: "()) rightsmall[i] ", c: "" },
        { t: "=", c: "red" },
        { t: " n - ", c: "" },
        { t: "1", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 27,
      c: [
        { t: "    else", c: "purple" },
        { t: " rightsmall[i] ", c: "" },
        { t: "=", c: "red" },
        { t: " st.", c: "" },
        { t: "top", c: "yellow" },
        { t: "() - ", c: "" },
        { t: "1", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 29,
      c: [
        { t: "    st.", c: "" },
        { t: "push", c: "yellow" },
        { t: "(i);", c: "" },
      ],
    },
    { l: 30, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 32,
      c: [
        { t: "  int", c: "cyan" },
        { t: " maxA ", c: "" },
        { t: "=", c: "red" },
        { t: " ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 33,
      c: [
        { t: "  for", c: "purple" },
        { t: " (", c: "light-gray" },
        { t: "int", c: "cyan" },
        { t: " i ", c: "light-blue" },
        { t: "=", c: "red" },
        { t: " ", c: "" },
        { t: "0", c: "orange" },
        { t: "; i < n; i++) {", c: "" },
      ],
    },
    {
      l: 34,
      c: [
        { t: "    maxA ", c: "light-blue" },
        { t: "=", c: "red" },
        { t: " max(maxA, heights[i] ", c: "" },
        { t: "*", c: "red" },
        { t: " (rightsmall[i] - leftsmall[i] + ", c: "" },
        { t: "1", c: "orange" },
        { t: "));", c: "" },
      ],
    },
    { l: 35, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 36,
      c: [
        { t: "  return", c: "purple" },
        { t: " maxA;", c: "" },
      ],
    },
    { l: 37, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-fit mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-green-400">
          Largest Rectangle in Histogram
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 84</p>
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
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-2 px-4 rounded-lg"
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

      <div className="flex border-b border-gray-700 mb-6">
        <div
          onClick={() => {
            setMode("brute-force");
            reset();
          }}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "brute-force"
              ? "border-green-400 text-green-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Brute Force O(n²)
        </div>
        <div
          onClick={() => {
            setMode("optimal");
            reset();
          }}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-green-400 text-green-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Optimal O(n)
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-green-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
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
                Histogram
              </h3>
              <div
                id="histogram-container"
                className="flex justify-center items-end gap-1 h-64 border-b-2 border-gray-600 pb-2"
              >
                {state.heights?.map((h, index) => (
                  <div
                    key={index}
                    id={`histogram-container-element-${index}`}
                    className="flex-1 flex flex-col justify-end items-center h-full"
                  >
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        state.i === index
                          ? "bg-amber-400"
                          : "bg-gradient-to-t from-gray-700 to-gray-600"
                      }`}
                      style={{ height: `${(h / maxHeight) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-400 mt-1">{index}</span>
                  </div>
                ))}
                <div
                  className="absolute bottom-[4.5rem] left-0 right-0 mx-auto transition-all duration-300 pointer-events-none"
                  style={{
                    height: `${(state.highlight?.h / maxHeight) * 70}%`,
                    width: `${
                      state.highlight
                        ? (state.highlight.end - state.highlight.start + 1) *
                          (100 / (state.heights?.length || 1))
                        : 0
                    }%`,
                    left: `${
                      state.highlight
                        ? state.highlight.start *
                          (100 / (state.heights?.length || 1))
                        : 0
                    }%`,
                    backgroundColor: "rgba(239, 68, 68, 0.3)",
                    border: "1px solid rgba(239, 68, 68, 0.7)",
                  }}
                />
                <div
                  className="absolute bottom-[4.5rem] left-0 right-0 mx-auto transition-all duration-300 pointer-events-none"
                  style={{
                    height: `${(state.maxHighlight?.h / maxHeight) * 70}%`,
                    width: `${
                      state.maxHighlight
                        ? (state.maxHighlight.end -
                            state.maxHighlight.start +
                            1) *
                          (100 / (state.heights?.length || 1))
                        : 0
                    }%`,
                    left: `${
                      state.maxHighlight
                        ? state.maxHighlight.start *
                          (100 / (state.heights?.length || 1))
                        : 0
                    }%`,
                    backgroundColor: "rgba(52, 211, 153, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.6)",
                  }}
                />
              </div>
              {isLoaded && mode === "brute-force" && (
                <VisualizerPointer
                  index={state.i}
                  containerId="histogram-container"
                  color="amber"
                  label="i"
                />
              )}
              {isLoaded && mode === "brute-force" && (
                <VisualizerPointer
                  index={state.j}
                  containerId="histogram-container"
                  color="cyan"
                  label="j"
                />
              )}
              {isLoaded && mode === "optimal" && (
                <VisualizerPointer
                  index={state.i}
                  containerId="histogram-container"
                  color="amber"
                  label="i"
                />
              )}
            </div>

            {mode === "brute-force" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <h3 className="text-gray-400 text-sm flex items-center gap-2">
                      <List size={16} />
                      Min Height
                    </h3>
                    <p className="font-mono text-3xl mt-2">{state.minHeight}</p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <h3 className="text-gray-400 text-sm flex items-center gap-2">
                      <Calculator size={16} />
                      Current Area
                    </h3>
                    <p className="font-mono text-3xl mt-2">
                      {state.currentArea}
                    </p>
                  </div>
                </div>
                <div className="bg-green-800/30 p-4 rounded-xl border border-green-700/50">
                  <h3 className="text-green-300 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    Max Area Found
                  </h3>
                  <p className="font-mono text-4xl text-green-400 mt-2">
                    {state.maxArea ?? 0}
                  </p>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 md:h-60">
                  <h3 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Layers size={16} />
                    Stack
                  </h3>
                  <div className="flex flex-col-reverse gap-1 h-full pb-4 overflow-y-auto">
                    {state.stack?.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-700 text-center font-mono rounded-md py-1"
                      >
                        {s}
                      </div>
                    ))}
                    {state.stack?.length === 0 && (
                      <span className="text-gray-500 text-xs text-center">
                        Stack is empty
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-green-800/30 p-4 rounded-xl border border-green-700/50 md:h-60 flex flex-col justify-center">
                  <h3 className="text-green-300 text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    Max Area Found
                  </h3>
                  <p className="font-mono text-5xl text-green-400 mt-2">
                    {state.maxA ?? 0}
                  </p>
                </div>
              </div>
            )}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
            </div>
          </div>
          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-green-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-green-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N²)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    The algorithm uses nested loops. The outer loop runs N times
                    and the inner loop runs up to N times for each outer
                    iteration, considering every possible subarray. This results
                    in a quadratic time complexity.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(1)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    Only a constant amount of extra space is used for variables
                    like `maxArea` and `minHeight`, regardless of the input
                    size.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-green-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    The algorithm consists of three separate passes (one for
                    `leftSmall`, one for `rightSmall`, and one for calculating
                    `maxA`), each iterating through the N elements once. Each
                    element is pushed onto and popped from the stack at most
                    once. This results in a time complexity of O(N) + O(N) +
                    O(N), which simplifies to O(N).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    In the worst-case scenario (e.g., a sorted list of heights),
                    the stack can hold up to N elements. Additionally, two
                    arrays, `leftSmall` and `rightSmall`, of size N are used.
                    Therefore, the space complexity is linear.
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

export default LargestRectangleHistogram;
