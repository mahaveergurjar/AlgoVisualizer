import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  Sigma,
  CheckCircle,
  List,
  Calculator,
  Layers,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const SubarrayRangesVisualizer = () => {
  const [mode, setMode] = useState("brute-force");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("4,-2,-3,4,1");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateBruteForceHistory = useCallback((nums) => {
    const newHistory = [];
    let totalSum = 0;

    const addState = (props) =>
      newHistory.push({
        nums,
        totalSum,
        i: null,
        j: null,
        minVal: "N/A",
        maxVal: "N/A",
        rangeText: "N/A",
        currentSub: [],
        highlighted: [],
        finished: false,
        ...props,
      });

    addState({ line: 2 });
    addState({ line: 3 });

    for (let i = 0; i < nums.length; i++) {
      addState({ line: 4, i });
      let minInSubarray = nums[i];
      let maxInSubarray = nums[i];
      addState({ line: 5, i, minVal: minInSubarray });
      addState({ line: 6, i, minVal: minInSubarray, maxVal: maxInSubarray });

      for (let j = i; j < nums.length; j++) {
        const highlightedIndices = Array.from(
          { length: j - i + 1 },
          (_, k) => i + k
        );
        addState({
          line: 7,
          i,
          j,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
        });

        minInSubarray = Math.min(minInSubarray, nums[j]);
        addState({
          line: 8,
          i,
          j,
          minVal: minInSubarray,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
        });

        maxInSubarray = Math.max(maxInSubarray, nums[j]);
        addState({
          line: 9,
          i,
          j,
          minVal: minInSubarray,
          maxVal: maxInSubarray,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
        });

        const range = maxInSubarray - minInSubarray;
        totalSum += range;

        addState({
          line: 10,
          i,
          j,
          totalSum,
          rangeText: `${maxInSubarray} - ${minInSubarray} = ${range}`,
          highlighted: highlightedIndices,
          currentSub: nums.slice(i, j + 1),
        });
      }
    }
    addState({ line: 13, totalSum, finished: true });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((nums) => {
    const newHistory = [];
    let sumMax = 0,
      sumMin = 0;
    let stack = [];

    const addState = (props) =>
      newHistory.push({
        nums,
        sumMax,
        sumMin,
        i: null,
        j: null,
        k: null,
        stack: [...stack],
        explanation: "",
        finished: false,
        ...props,
      });

    addState({ line: 6, explanation: "Calculating sum of subarray maximums." });
    for (let i = 0; i <= nums.length; i++) {
      addState({ line: 7, i });
      while (
        stack.length > 0 &&
        (i === nums.length || nums[stack[stack.length - 1]] < nums[i])
      ) {
        addState({ line: 8, i });
        const j = stack.pop();
        addState({ line: 9, i, j });
        const k = stack.length > 0 ? stack[stack.length - 1] : -1;
        addState({ line: 10, i, j, k });
        const contribution = nums[j] * (i - j) * (j - k);
        sumMax += contribution;
        addState({
          line: 11,
          i,
          j,
          k,
          sumMax,
          explanation: `Popped j=${j} (val ${nums[j]}).<br>Right bound i=${i}, Left bound k=${k}.<br>Contrib: ${nums[j]}*(${i}-${j})*(${j}-${k}) = ${contribution}`,
        });
      }
      if (i < nums.length) {
        stack.push(i);
        addState({ line: 13, i });
      }
    }
    stack = [];
    addState({ line: 16, explanation: "Stack cleared." });

    addState({
      line: 18,
      explanation: "Calculating sum of subarray minimums.",
    });
    for (let i = 0; i <= nums.length; i++) {
      addState({ line: 19, i });
      while (
        stack.length > 0 &&
        (i === nums.length || nums[stack[stack.length - 1]] > nums[i])
      ) {
        addState({ line: 20, i });
        const j = stack.pop();
        addState({ line: 21, i, j });
        const k = stack.length > 0 ? stack[stack.length - 1] : -1;
        addState({ line: 22, i, j, k });
        const contribution = nums[j] * (i - j) * (j - k);
        sumMin += contribution;
        addState({
          line: 23,
          i,
          j,
          k,
          sumMin,
          explanation: `Popped j=${j} (val ${nums[j]}).<br>Right bound i=${i}, Left bound k=${k}.<br>Contrib: ${nums[j]}*(${i}-${j})*(${j}-${k}) = ${contribution}`,
        });
      }
      if (i < nums.length) {
        stack.push(i);
        addState({ line: 25, i });
      }
    }
    addState({
      line: 28,
      finished: true,
      explanation: `Final Result: ${sumMax} (sum_max) - ${sumMin} (sum_min) = ${
        sumMax - sumMin
      }`,
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localNums.some(isNaN)) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }
    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(localNums);
    } else {
      generateOptimalHistory(localNums);
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepBackward();
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepBackward, stepForward]);

  const parseInput = useCallback(() => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localNums.some(isNaN) || localNums.length === 0) throw new Error("Invalid input");
    return localNums;
  }, [numsInput]);
  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (n) => generateBruteForceHistory(n),
      optimal: (n) => generateOptimalHistory(n),
    },
    setCurrentStep,
    onError: (m) => console.warn(m),
  });

  const state = history[currentStep] || {};
  const { nums = [], line } = state;

  const renderBruteForce = () => {
    const {
      i,
      j,
      totalSum,
      currentSub,
      minVal,
      maxVal,
      rangeText,
      highlighted,
      finished,
    } = state;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <h3 className="font-bold text-xl text-teal-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
            <Code className="w-5 h-5" />
            C++ Brute Force Solution
          </h3>
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <pre className="text-sm">
              <code className="language-cpp font-mono leading-relaxed block">
                {[...Array(14)].map((_, idx) => {
                  const lineNum = idx + 1;
                  return (
                    <span
                      key={lineNum}
                      className={`block px-3 py-0.5 transition-all duration-300 ${
                        line === lineNum
                          ? "bg-teal-500/20 border-l-4 border-teal-500 shadow-lg"
                          : "hover:bg-gray-700/30"
                      }`}
                    >
                      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
                        {lineNum}
                      </span>
                      <span
                        className={
                          line === lineNum ? "text-teal-300" : "text-gray-300"
                        }
                      >
                        {lineNum === 1 &&
                          `long long subArrayRanges(vector<int>& nums) {`}
                        {lineNum === 2 && `  long long sum = 0;`}
                        {lineNum === 3 && `  int n = nums.size();`}
                        {lineNum === 4 && `  for (int i = 0; i < n; i++) {`}
                        {lineNum === 5 && `    int minVal = nums[i];`}
                        {lineNum === 6 && `    int maxVal = nums[i];`}
                        {lineNum === 7 && `    for (int j = i; j < n; j++) {`}
                        {lineNum === 8 &&
                          `      minVal = min(minVal, nums[j]);`}
                        {lineNum === 9 &&
                          `      maxVal = max(maxVal, nums[j]);`}
                        {lineNum === 10 && `      sum += (maxVal - minVal);`}
                        {lineNum === 11 && `    }`}
                        {lineNum === 12 && `  }`}
                        {lineNum === 13 && `  return sum;`}
                        {lineNum === 14 && `}`}
                      </span>
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 mb-12 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
            <h3 className="font-bold text-lg text-gray-300 mb-4">
              Array Visualization
            </h3>
            <div
              id="bf-array-container"
              className="w-full h-24 flex justify-center items-center gap-2 flex-wrap"
            >
              {nums.map((num, index) => (
                <div
                  key={index}
                  id={`bf-array-container-element-${index}`}
                  className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-500 transform ${
                    highlighted?.includes(index)
                      ? "bg-teal-600/40 border-teal-400 scale-105 shadow-lg shadow-teal-500/30"
                      : "bg-gray-700/50 border-gray-600 hover:scale-105"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
            {isLoaded && (
              <VisualizerPointer
                index={i}
                containerId="bf-array-container"
                color="amber"
                label="i"
                direction="up"
              />
            )}
            {isLoaded && (
              <VisualizerPointer
                index={j}
                containerId="bf-array-container"
                color="cyan"
                label="j"
                direction="up"
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
              <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                <List className="w-5 h-5" />
                Current Subarray
              </h3>
              <div className="font-mono text-xl h-16 flex items-center justify-center bg-gray-900/50 rounded-lg">
                [{currentSub?.join(", ")}]
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculation
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  Min:{" "}
                  <span className="font-mono font-bold text-yellow-400">
                    {minVal}
                  </span>
                </p>
                <p>
                  Max:{" "}
                  <span className="font-mono font-bold text-yellow-400">
                    {maxVal}
                  </span>
                </p>
                <p>
                  Range:{" "}
                  <span className="font-mono font-bold text-yellow-400">
                    {rangeText}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
            <h3 className="font-bold text-xl text-center text-green-300 mb-3 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Total Sum of Ranges
            </h3>
            <div className="font-mono text-5xl text-center font-bold text-green-400">
              {totalSum ?? 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptimal = () => {
    const { i, j, k, sumMax, sumMin, stack, explanation, finished } = state;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <h3 className="font-bold text-xl text-teal-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
            <Code className="w-5 h-5" />
            C++ Optimal Solution
          </h3>
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <pre className="text-sm">
              <code className="language-cpp font-mono leading-relaxed block">
                {[...Array(29)].map((_, idx) => {
                  const lineNum = idx + 1;
                  const lineContent =
                    {
                      1: `long long subArrayRanges(vector<int>& nums) {`,
                      2: `    int n = nums.size();`,
                      3: `    long long sum_max = 0, sum_min = 0;`,
                      4: `    stack<int> st;`,
                      6: `    // Calculate sum of subarray maximums`,
                      7: `    for (int i = 0; i <= n; ++i) {`,
                      8: `        while (!st.empty() && (i == n || nums[st.top()] < nums[i])) {`,
                      9: `            int j = st.top(); st.pop();`,
                      10: `            int k = st.empty() ? -1 : st.top();`,
                      11: `            sum_max += (long long)nums[j] * (i - j) * (j - k);`,
                      12: `        }`,
                      13: `        if (i < n) st.push(i);`,
                      14: `    }`,
                      16: `    while(!st.empty()) st.pop();`,
                      18: `    // Calculate sum of subarray minimums`,
                      19: `    for (int i = 0; i <= n; ++i) {`,
                      20: `        while (!st.empty() && (i == n || nums[st.top()] > nums[i])) {`,
                      21: `            int j = st.top(); st.pop();`,
                      22: `            int k = st.empty() ? -1 : st.top();`,
                      23: `            sum_min += (long long)nums[j] * (i - j) * (j - k);`,
                      24: `        }`,
                      25: `        if (i < n) st.push(i);`,
                      26: `    }`,
                      28: `    return sum_max - sum_min;`,
                      29: `}`,
                    }[lineNum] || "";
                  return (
                    <span
                      key={lineNum}
                      className={`block px-3 py-0.5 transition-all duration-300 ${
                        line === lineNum
                          ? "bg-teal-500/20 border-l-4 border-teal-500 shadow-lg"
                          : "hover:bg-gray-700/30"
                      }`}
                    >
                      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
                        {lineNum}
                      </span>
                      <span
                        className={
                          line === lineNum ? "text-teal-300" : "text-gray-300"
                        }
                      >
                        {lineContent}
                      </span>
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 mb-12 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
            <h3 className="font-bold text-lg text-gray-300 mb-4">
              Array Visualization
            </h3>
            <div
              id="opt-array-container"
              className="w-full h-24 flex justify-center items-center gap-2 flex-wrap"
            >
              {nums.map((num, index) => (
                <div
                  key={index}
                  id={`opt-array-container-element-${index}`}
                  className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-500 transform ${
                    j === index
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 scale-110 shadow-lg shadow-yellow-500/50"
                      : k === index
                      ? "bg-blue-500/60 scale-105 border-blue-400 shadow-lg"
                      : "bg-gray-700/50 border-gray-600 hover:scale-105"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
            {isLoaded && (
              <VisualizerPointer
                index={i}
                containerId="opt-array-container"
                color="amber"
                label="i"
                isEnd={i === nums.length}
                direction="up"
              />
            )}
            {isLoaded && (
              <VisualizerPointer
                index={j}
                containerId="opt-array-container"
                color="cyan"
                label="j"
                direction="up"
              />
            )}
            {isLoaded && (
              <VisualizerPointer
                index={k}
                containerId="opt-array-container"
                color="violet"
                label="k"
                direction="up"
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-indigo-700/50">
              <h3 className="font-bold text-lg text-center text-indigo-300 mb-4 flex items-center justify-center gap-2">
                <Layers className="w-5 h-5" />
                Stack
              </h3>
              <div className="h-64 flex flex-col-reverse items-center gap-2 bg-gray-900/50 rounded-lg p-3 overflow-y-auto">
                {stack?.length > 0 ? (
                  stack.map((idx, s_idx) => (
                    <div
                      key={s_idx}
                      className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-2xl font-bold rounded-lg font-mono shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                      {idx}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Empty</div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculation
              </h3>
              <div className="space-y-3 text-base">
                <p>
                  Sum of Maximums:{" "}
                  <span className="font-mono font-bold text-yellow-400">
                    {sumMax ?? 0}
                  </span>
                </p>
                <p>
                  Sum of Minimums:{" "}
                  <span className="font-mono font-bold text-yellow-400">
                    {sumMin ?? 0}
                  </span>
                </p>
                <hr className="border-gray-600/50" />
                <p className="text-lg">
                  Total Range Sum:{" "}
                  <span className="font-mono font-bold text-green-400">
                    {(sumMax ?? 0) - (sumMin ?? 0)}
                  </span>
                </p>
              </div>
              <div
                className="mt-4 text-gray-300 text-sm h-24 overflow-y-auto bg-gray-900/30 rounded-lg p-3"
                dangerouslySetInnerHTML={{
                  __html: explanation || "Waiting for computation...",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-fit mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-teal-400">
          Sum of Subarray Ranges
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 2104</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label
            htmlFor="array-input"
            className="font-medium text-gray-300 mono"
          >
            Array:
          </label>
          <input
            id="array-input"
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 w-full sm:w-64 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-teal-500 hover:bg-teal-600 text-gray-900 cursor-pointer font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-300"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 hover:bg-gray-600 font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="mono text-lg text-gray-400 w-24 text-center">
                Step {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 hover:bg-gray-600 font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white cursor-pointer font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
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
              ? "border-teal-400 text-teal-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Brute Force O(n²)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-teal-400 text-teal-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Optimal O(n)
        </div>
      </div>

      {isLoaded ? (
        mode === "brute-force" ? (
          renderBruteForce()
        ) : (
          renderOptimal()
        )
      ) : (
        <p className="text-gray-500 text-center py-10">
          Load an array to begin.
        </p>
      )}
    </div>
  );
};
export default SubarrayRangesVisualizer;
