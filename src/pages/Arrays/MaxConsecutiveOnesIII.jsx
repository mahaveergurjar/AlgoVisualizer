import React, { useState, useEffect, useCallback } from "react";

// Pointer Component
const Pointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const container = document.getElementById(containerId);
    const element = document.getElementById(`${containerId}-element-${index}`);

    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      setPosition({
        left: elementRect.left - containerRect.left + elementRect.width / 2,
        top: elementRect.bottom - containerRect.top + 8,
      });
    }
  }, [index, containerId]);

  const colors = {
    red: { bg: "bg-red-500", text: "text-red-500" },
    blue: { bg: "bg-blue-500", text: "text-blue-500" },
  };

  return (
    <div
      className="absolute transition-all duration-500 ease-out"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${colors[color].bg}`}
        style={{ borderBottomColor: color === "red" ? "#ef4444" : "#3b82f6" }}
      />
      <div
        className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}
      >
        {label}
      </div>
    </div>
  );
};

// Main Component
const MaxConsecutiveOnes = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("1,1,1,0,0,0,1,1,1,1,0");
  const [kInput, setKInput] = useState("2");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateHistory = useCallback(() => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const localK = parseInt(kInput, 10);

    if (localNums.some(isNaN) || isNaN(localK)) {
      alert("Invalid input. Please use comma-separated numbers for the array.");
      return;
    }

    const newHistory = [];
    let left = 0;
    let zeroCount = 0;
    let maxLength = 0;

    const addState = (props) =>
      newHistory.push({
        nums: [...localNums],
        left,
        right: null,
        zeroCount,
        maxLength,
        line: null,
        k: localK,
        ...props,
      });

    addState({ line: 2 });
    addState({ line: 3 });
    addState({ line: 4 });

    for (let right = 0; right < localNums.length; right++) {
      addState({ line: 6, right });
      addState({ line: 7, right });
      if (localNums[right] === 0) {
        zeroCount++;
        addState({ line: 8, right });
      }
      addState({ line: 11, right });
      while (zeroCount > localK) {
        addState({ line: 12, right });
        if (localNums[left] === 0) {
          zeroCount--;
          addState({ line: 13, right });
        }
        left++;
        addState({ line: 15, right });
        addState({ line: 11, right });
      }
      maxLength = Math.max(maxLength, right - left + 1);
      addState({ line: 18, right });
    }
    addState({ line: 21, left: left, right: localNums.length - 1 });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [numsInput, kInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
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
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepBackward, stepForward]);

  const state = history[currentStep] || {};
  const {
    nums = [],
    left,
    right,
    zeroCount,
    maxLength,
    line,
    k = kInput,
  } = state;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="p-4 max-w-fit mx-auto">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3">
            Max Consecutive Ones III
          </h1>
          <p className="text-lg text-gray-400">
            Visualizing LeetCode 1004 - Sliding Window Algorithm
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>
              Navigate
            </span>
          </div>
        </header>

        {/* Input and Controls Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label
                  htmlFor="array-input"
                  className="font-semibold text-gray-300 text-sm whitespace-nowrap"
                >
                  Array:
                </label>
                <input
                  id="array-input"
                  type="text"
                  value={numsInput}
                  onChange={(e) => setNumsInput(e.target.value)}
                  disabled={isLoaded}
                  className="bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 w-full sm:w-72 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  placeholder="e.g., 1,1,1,0,0,0,1,1,1,1,0"
                />
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="k-input"
                  className="font-semibold text-gray-300 text-sm"
                >
                  k:
                </label>
                <input
                  id="k-input"
                  type="number"
                  value={kInput}
                  onChange={(e) => setKInput(e.target.value)}
                  disabled={isLoaded}
                  className="bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 w-24 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isLoaded ? (
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-900 font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Load & Visualize
                </button>
              ) : (
                <>
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95"
                    title="Previous step (←)"
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
                  <span className="font-mono text-base text-gray-300 min-w-[100px] text-center bg-gray-900/50 px-4 py-2 rounded-lg">
                    Step{" "}
                    <span className="text-amber-400 font-bold">
                      {currentStep + 1}
                    </span>
                    /{history.length}
                  </span>
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95"
                    title="Next step (→)"
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
                onClick={resetVisualization}
                className="ml-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Section */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
            <h3 className="font-bold text-xl text-amber-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              C++ Sliding Window Solution
            </h3>
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="language-cpp font-mono leading-relaxed block">
                  {[...Array(22)].map((_, i) => {
                    const lineNum = i + 1;
                    return (
                      <span
                        key={lineNum}
                        className={`block px-3 py-0.5 transition-all duration-300 ${
                          line === lineNum
                            ? "bg-amber-500/20 border-l-4 border-amber-500 shadow-lg"
                            : "hover:bg-gray-700/30"
                        }`}
                      >
                        <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
                          {lineNum}
                        </span>
                        <span
                          className={
                            line === lineNum
                              ? "text-amber-300"
                              : "text-gray-300"
                          }
                        >
                          {lineNum === 1 &&
                            `int longestOnes(vector<int>& nums, int k) {`}
                          {lineNum === 2 && `    int left = 0;`}
                          {lineNum === 3 && `    int zeroCount = 0;`}
                          {lineNum === 4 && `    int maxLength = 0;`}
                          {lineNum === 5 && ` `}
                          {lineNum === 6 &&
                            `    for (int right = 0; right < nums.size(); right++) {`}
                          {lineNum === 7 && `        if (nums[right] == 0) {`}
                          {lineNum === 8 && `            zeroCount++;`}
                          {lineNum === 9 && `        }`}
                          {lineNum === 10 && ` `}
                          {lineNum === 11 && `        while (zeroCount > k) {`}
                          {lineNum === 12 &&
                            `            if (nums[left] == 0) {`}
                          {lineNum === 13 && `                zeroCount--;`}
                          {lineNum === 14 && `            }`}
                          {lineNum === 15 && `            left++;`}
                          {lineNum === 16 && `        }`}
                          {lineNum === 17 && ` `}
                          {lineNum === 18 &&
                            `        maxLength = max(maxLength, right - left + 1);`}
                          {lineNum === 19 && `    }`}
                          {lineNum === 20 && ` `}
                          {lineNum === 21 && `    return maxLength;`}
                          {lineNum === 22 && `}`}
                        </span>
                      </span>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Array Visualization */}
            <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
              <h3 className="font-bold text-lg text-gray-300 mb-4">
                Array Visualization
              </h3>
              <div
                id="main-array-container"
                className="w-full h-24 flex justify-center items-center gap-2 flex-wrap"
              >
                {isLoaded ? (
                  nums.map((num, index) => {
                    const isInWindow = index >= left && index <= right;
                    const isFlipped = isInWindow && num === 0;
                    return (
                      <div
                        key={index}
                        id={`main-array-container-element-${index}`}
                        className={`w-14 h-14 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all duration-500 transform ${
                          isFlipped
                            ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-400 scale-110 shadow-lg shadow-amber-500/50"
                            : isInWindow
                            ? "bg-gray-600 border-amber-400 scale-105 shadow-lg"
                            : "bg-gray-700/50 border-gray-600 hover:scale-105"
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <svg
                      className="w-16 h-16 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p>Load an array to start visualizing</p>
                  </div>
                )}
              </div>
              {isLoaded && left !== null && (
                <Pointer
                  index={left}
                  containerId="main-array-container"
                  color="red"
                  label="left"
                />
              )}
              {isLoaded && right !== null && (
                <Pointer
                  index={right}
                  containerId="main-array-container"
                  color="blue"
                  label="right"
                />
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Zeros Flipped
                </h3>
                <div className="text-center">
                  <span className="font-mono text-5xl font-bold text-blue-300">
                    {zeroCount ?? 0}
                  </span>
                  <span className="text-gray-400 text-3xl mx-2">/</span>
                  <span className="font-mono text-5xl font-bold text-gray-300">
                    {k}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Window Length
                </h3>
                <div className="font-mono text-5xl font-bold text-center text-purple-300">
                  {right === null || left === null || right < left
                    ? 0
                    : right - left + 1}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Max Length Found
                </h3>
                <div className="font-mono text-5xl font-bold text-center text-green-400">
                  {maxLength ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-6 text-gray-500 text-sm">
          <p>Use arrow keys ← → to navigate through steps</p>
        </footer>
      </div>
    </div>
  );
};

export default MaxConsecutiveOnes;
