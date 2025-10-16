import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, Search, Layers, Target } from "lucide-react";

const BinarySearchRecursiveVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("1,3,5,7,9,11,13,15,17,19");
  const [targetInput, setTargetInput] = useState("13");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateBinarySearchHistory = useCallback((arr, target) => {
    const newHistory = [];
    let callCount = 0;
    const callStack = [];

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        callStack: [...callStack],
        callCount,
        target,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Search for ${target} in sorted array using recursive binary search.` });

    const binarySearch = (left, right, depth = 0) => {
      callCount++;
      
      callStack.push({ left, right, depth });

      addState({
        line: 2,
        left,
        right,
        explanation: `Call binarySearch(left=${left}, right=${right}). Call count: ${callCount}.`,
      });

      if (left > right) {
        addState({
          line: 3,
          left,
          right,
          explanation: `Base case: left > right. Target ${target} not found.`,
        });
        
        callStack.pop();
        return -1;
      }

      const mid = Math.floor((left + right) / 2);

      addState({
        line: 4,
        left,
        right,
        mid,
        explanation: `Calculate mid = ${mid}. arr[${mid}] = ${arr[mid]}.`,
      });

      if (arr[mid] === target) {
        addState({
          line: 5,
          left,
          right,
          mid,
          found: true,
          explanation: `Found! arr[${mid}] = ${target}. Return index ${mid}.`,
        });
        
        callStack.pop();
        return mid;
      }

      if (arr[mid] > target) {
        addState({
          line: 6,
          left,
          right,
          mid,
          searchLeft: true,
          explanation: `arr[${mid}] = ${arr[mid]} > ${target}. Search left half.`,
        });

        const result = binarySearch(left, mid - 1, depth + 1);
        callStack.pop();
        return result;
      } else {
        addState({
          line: 7,
          left,
          right,
          mid,
          searchRight: true,
          explanation: `arr[${mid}] = ${arr[mid]} < ${target}. Search right half.`,
        });

        const result = binarySearch(mid + 1, right, depth + 1);
        callStack.pop();
        return result;
      }
    };

    const result = binarySearch(0, arr.length - 1);

    if (result !== -1) {
      addState({
        line: 8,
        finished: true,
        foundIndex: result,
        explanation: `Binary search complete. Found ${target} at index ${result}. Total calls: ${callCount}.`,
      });
    } else {
      addState({
        line: 8,
        finished: true,
        notFound: true,
        explanation: `Binary search complete. ${target} not found in array. Total calls: ${callCount}.`,
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const arr = arrayInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const target = parseInt(targetInput);
    
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    if (isNaN(target)) {
      alert("Please enter a valid target number.");
      return;
    }
    
    const sortedArr = [...arr].sort((a, b) => a - b);
    if (JSON.stringify(arr) !== JSON.stringify(sortedArr)) {
      alert("Array must be sorted! Sorting automatically.");
      setArrayInput(sortedArr.join(","));
    }
    
    setIsLoaded(true);
    generateBinarySearchHistory(sortedArr, target);
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
  const { arr = [], left = -1, right = -1, mid = -1, callStack = [], callCount = 0, target = null, explanation = "", found = false, foundIndex = -1, finished = false } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
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

  const binarySearchCode = [
    { l: 1, c: [{ t: "function binarySearch(arr, left, right, target) {", c: "" }] },
    { l: 2, c: [{ t: "  if", c: "purple" }, { t: " (left > right) return", c: "" }, { t: " -1", c: "cyan" }, { t: ";", c: "" }] },
    { l: 3, c: [{ t: "  mid = floor((left + right) / 2);", c: "" }] },
    { l: 4, c: [{ t: "  if", c: "purple" }, { t: " (arr[mid] == target) return", c: "" }, { t: " mid", c: "cyan" }, { t: ";", c: "" }] },
    { l: 5, c: [{ t: "  if", c: "purple" }, { t: " (arr[mid] > target)", c: "" }] },
    { l: 6, c: [{ t: "    return", c: "purple" }, { t: " binarySearch(arr, left, mid-1, target);", c: "" }] },
    { l: 7, c: [{ t: "  return", c: "purple" }, { t: " binarySearch(arr, mid+1, right, target);", c: "" }] },
    { l: 8, c: [{ t: "}", c: "light-gray" }] },
  ];

  const renderArray = () => {
    if (arr.length === 0) return null;

    const maxBoxes = 15;
    const displayArr = arr.length > maxBoxes ? arr.slice(0, maxBoxes) : arr;

    return (
      <div className="flex justify-center items-center gap-2 flex-wrap">
        {displayArr.map((value, index) => {
          let bgColor = "bg-gray-700";
          let borderColor = "border-gray-600";
          let textColor = "text-gray-300";

          if (index >= left && index <= right) {
            bgColor = "bg-blue-800/30";
            borderColor = "border-blue-600/50";
          }

          if (index === mid) {
            bgColor = "bg-yellow-600/50";
            borderColor = "border-yellow-500";
            textColor = "text-yellow-200";
          }

          if (found && index === mid) {
            bgColor = "bg-green-600/50";
            borderColor = "border-green-500";
            textColor = "text-green-200";
          }

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`${bgColor} ${borderColor} border-2 rounded-lg w-14 h-14 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${textColor}`}
              >
                <span className="text-lg">{value}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{index}</span>
            </div>
          );
        })}
        {arr.length > maxBoxes && (
          <div className="text-gray-500 text-sm ml-2">...{arr.length - maxBoxes} more</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Search /> Binary Search (Recursive)
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualize recursive binary search with call stack
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label htmlFor="array-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">Sorted Array:</label>
          <input 
            id="array-input" 
            type="text" 
            value={arrayInput} 
            onChange={(e) => setArrayInput(e.target.value)} 
            disabled={isLoaded} 
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="e.g., 1,3,5,7,9,11"
          />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="target-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">Target:</label>
            <input 
              id="target-input" 
              type="number" 
              value={targetInput} 
              onChange={(e) => setTargetInput(e.target.value)} 
              disabled={isLoaded} 
              className="font-mono w-32 bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
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
                {binarySearchCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Target size={20} />
                Array Visualization {target !== null && `(Target: ${target})`}
              </h3>
              {renderArray()}
              <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-800/30 border border-blue-600/50"></div>
                  <span className="text-gray-300">Search Range</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-600/50 border border-yellow-500"></div>
                  <span className="text-gray-300">Mid Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600/50 border border-green-500"></div>
                  <span className="text-gray-300">Found</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Layers size={16} />
                Call Stack
              </h3>
              <div className="space-y-2">
                {callStack.length === 0 ? (
                  <p className="text-gray-500 text-sm">Empty</p>
                ) : (
                  callStack.slice().reverse().map((call, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-700/50 border border-gray-600/50 p-3 rounded text-sm font-mono text-gray-300"
                      style={{ marginLeft: `${call.depth * 12}px` }}
                    >
                      binarySearch(left={call.left}, right={call.right})
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <Layers size={16} /> Recursive Calls
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">{callCount}</p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2">
                  <Layers size={16} /> Stack Depth
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">{callStack.length}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{explanation}</p>
              {finished && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  {foundIndex !== -1 ? (
                    <span className="text-green-400 font-bold">Found at index {foundIndex}</span>
                  ) : (
                    <span className="text-red-400 font-bold">Target not found</span>
                  )}
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
                  <strong className="text-teal-300 font-mono">O(log n)</strong>
                  <br />
                  Binary search divides the search space in half with each recursive call. The maximum number of comparisons is log₂(n), making it extremely efficient for large sorted arrays.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Iterative vs Recursive</h4>
                <p className="text-gray-400">
                  Both implementations have the same time complexity, but iterative uses O(1) space while recursive uses O(log n) space for the call stack.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(log n)</strong>
                  <br />
                  The recursive implementation uses stack space proportional to the depth of recursion, which is logarithmic. Each recursive call adds a frame to the call stack.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Prerequisite</h4>
                <p className="text-gray-400">
                  Binary search requires the input array to be sorted. If the array is unsorted, you must sort it first (O(n log n)) or use linear search instead.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Enter a sorted array and target value to begin visualization.</p>
      )}
    </div>
  );
};

export default BinarySearchRecursiveVisualizer;
