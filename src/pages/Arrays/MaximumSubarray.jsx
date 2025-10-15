import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, TrendingUp } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer.jsx";

const MaximumSubarray = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("-2,1,-3,4,-1,2,1,-5,4");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateKadaneHistory = useCallback((arr) => {
    const newHistory = [];
    let maxSum = arr[0];
    let currentSum = arr[0];

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        maxSum,
        currentSum,
        explanation: "",
        ...props,
      });

    addState({ 
      line: 1, 
      currentIndex: 0,
      subarrayStart: 0,
      subarrayEnd: 0,
      explanation: `Initialize: currentSum = ${arr[0]}, maxSum = ${arr[0]}.` 
    });

    let tempStart = 0;
    let finalStart = 0;
    let finalEnd = 0;

    for (let i = 1; i < arr.length; i++) {
      addState({
        line: 2,
        currentIndex: i,
        subarrayStart: tempStart,
        subarrayEnd: i - 1,
        explanation: `At index ${i}: arr[${i}] = ${arr[i]}, currentSum = ${currentSum}.`,
      });

      if (currentSum < 0) {
        currentSum = arr[i];
        tempStart = i;
        addState({
          line: 3,
          currentIndex: i,
          subarrayStart: i,
          subarrayEnd: i,
          reset: true,
          explanation: `currentSum was negative (${currentSum + arr[i] - arr[i]}). Reset: currentSum = arr[${i}] = ${arr[i]}.`,
        });
      } else {
        currentSum += arr[i];
        addState({
          line: 4,
          currentIndex: i,
          subarrayStart: tempStart,
          subarrayEnd: i,
          explanation: `Add to current: currentSum = ${currentSum - arr[i]} + ${arr[i]} = ${currentSum}.`,
        });
      }

      if (currentSum > maxSum) {
        maxSum = currentSum;
        finalStart = tempStart;
        finalEnd = i;
        addState({
          line: 5,
          currentIndex: i,
          subarrayStart: finalStart,
          subarrayEnd: finalEnd,
          newMax: true,
          explanation: `New maximum! maxSum = ${maxSum}. Subarray from index ${finalStart} to ${finalEnd}.`,
        });
      }
    }

    addState({
      line: 6,
      finished: true,
      subarrayStart: finalStart,
      subarrayEnd: finalEnd,
      explanation: `Complete! Maximum subarray sum = ${maxSum}, from index ${finalStart} to ${finalEnd}: [${arr.slice(finalStart, finalEnd + 1).join(", ")}].`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const arr = arrayInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    setIsLoaded(true);
    generateKadaneHistory(arr);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      else if (e.key === "ArrowLeft") stepBackward();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { arr = [], currentIndex = -1, maxSum = 0, currentSum = 0, subarrayStart = -1, subarrayEnd = -1, explanation = "", finished = false, newMax = false } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    green: "text-green-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-blue-500/20" : ""}`}>
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">{line}</span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>{token.t}</span>
      ))}
    </div>
  );

  const kadaneCode = [
    { l: 1, c: [{ t: "function maxSubArray(nums) {", c: "" }] },
    { l: 2, c: [{ t: "  maxSum = currentSum = nums[0];", c: "" }] },
    { l: 3, c: [{ t: "  for", c: "purple" }, { t: " (i = 1; i < n; i++) {", c: "" }] },
    { l: 4, c: [{ t: "    if", c: "purple" }, { t: " (currentSum < 0)", c: "" }] },
    { l: 5, c: [{ t: "      currentSum = nums[i];", c: "" }] },
    { l: 6, c: [{ t: "    else", c: "purple" }] },
    { l: 7, c: [{ t: "      currentSum += nums[i];", c: "" }] },
    { l: 8, c: [{ t: "    maxSum = max(maxSum, currentSum);", c: "" }] },
    { l: 9, c: [{ t: "  }", c: "light-gray" }] },
    { l: 10, c: [{ t: "  return", c: "purple" }, { t: " maxSum;", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <TrendingUp /> Maximum Subarray (Kadane's Algorithm)
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          LeetCode #53 - Find contiguous subarray with maximum sum
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-grow w-full">
            <label htmlFor="array-input" className="font-medium text-gray-300 font-mono">Array:</label>
            <input 
              id="array-input" 
              type="text" 
              value={arrayInput} 
              onChange={(e) => setArrayInput(e.target.value)} 
              disabled={isLoaded} 
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., -2,1,-3,4,-1,2,1,-5,4"
            />
          </div>
          <div className="flex items-center gap-2">
            {!isLoaded ? (
              <button onClick={loadProblem} className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded-lg">Load & Visualize</button>
            ) : (
              <>
                <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
                <span className="font-mono w-24 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
                <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
            <button onClick={reset} className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg">Reset</button>
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
                {kadaneCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4">Array Visualization</h3>
              <div className="flex gap-2 flex-wrap">
                {arr.map((value, index) => {
                  const isActive = index === currentIndex;
                  const inSubarray = index >= subarrayStart && index <= subarrayEnd;
                  
                  let bgColor = "bg-gray-700";
                  let borderColor = "border-gray-600";
                  let textColor = "text-gray-200";

                  if (inSubarray && !finished) {
                    bgColor = "bg-cyan-600/30";
                    borderColor = "border-cyan-500/50";
                  }

                  if (isActive) {
                    bgColor = "bg-purple-600/50";
                    borderColor = "border-purple-500";
                    textColor = "text-purple-100";
                  }

                  if (newMax && inSubarray) {
                    bgColor = "bg-amber-600/50";
                    borderColor = "border-amber-500";
                  }

                  if (finished && inSubarray) {
                    bgColor = "bg-green-600/50";
                    borderColor = "border-green-500";
                    textColor = "text-green-100";
                  }

                  return (
                    <div key={index} className="flex flex-col items-center relative">
                      {isActive && <VisualizerPointer />}
                      <div className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${textColor}`}>
                        <span className="text-lg">{value}</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm">Current Sum</h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">{currentSum}</p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm">Max Sum</h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">{maxSum}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{explanation}</p>
              {finished && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  <span className="text-green-400 font-bold">Algorithm Complete!</span>
                </div>
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
                  <strong className="text-teal-300 font-mono">O(n)</strong>
                  <br />
                  Kadane's algorithm makes a single pass through the array, examining each element once. This is the optimal solution for the maximum subarray problem.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(1)</strong>
                  <br />
                  We only use two variables (currentSum and maxSum) regardless of input size, making this solution extremely space-efficient.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Enter an array to begin visualization.</p>
      )}
    </div>
  );
};

export default MaximumSubarray;
