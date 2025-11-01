import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, RotateCw } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer.jsx";

const RotateArray = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("1,2,3,4,5,6,7");
  const [kInput, setKInput] = useState("3");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateRotateHistory = useCallback((arr, k) => {
    const newHistory = [];
    const n = arr.length;
    k = k % n;

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        explanation: "",
        ...props,
      });

    addState({ 
      line: 1, 
      explanation: `Rotate array [${arr.join(", ")}] right by k=${k} positions.` 
    });

    if (k === 0) {
      addState({ 
        line: 2, 
        finished: true,
        explanation: `k=0 or k is multiple of n. No rotation needed.` 
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    const reverse = (start, end) => {
      addState({
        line: 2,
        reverseStart: start,
        reverseEnd: end,
        explanation: `Reverse subarray from index ${start} to ${end}.`,
      });

      while (start < end) {
        addState({
          line: 3,
          swapIndices: [start, end],
          explanation: `Swap arr[${start}] (${arr[start]}) with arr[${end}] (${arr[end]}).`,
        });
        [arr[start], arr[end]] = [arr[end], arr[start]];
        start++;
        end--;
      }
    };

    addState({ 
      line: 4, 
      step: 1,
      explanation: `Step 1: Reverse entire array.` 
    });
    reverse(0, n - 1);

    addState({ 
      line: 5, 
      step: 2,
      explanation: `Step 2: Reverse first k elements.` 
    });
    reverse(0, k - 1);

    addState({ 
      line: 6, 
      step: 3,
      explanation: `Step 3: Reverse remaining n-k elements.` 
    });
    reverse(k, n - 1);

    addState({
      line: 7,
      finished: true,
      explanation: `Complete! Array rotated right by ${k}: [${arr.join(", ")}].`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const arr = arrayInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const k = parseInt(kInput);
    
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    if (isNaN(k) || k < 0) {
      alert("Please enter a valid positive number for k.");
      return;
    }
    
    setIsLoaded(true);
    generateRotateHistory(arr, k);
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
  const { arr = [], swapIndices = [], reverseStart = -1, reverseEnd = -1, explanation = "", finished = false, step = 0 } = state;

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

  const rotateCode = [
    { l: 1, c: [{ t: "function rotate(nums, k) {", c: "" }] },
    { l: 2, c: [{ t: "  k = k % n;", c: "" }] },
    { l: 3, c: [{ t: "  reverse(nums, 0, n-1);", c: "cyan" }, { t: " // reverse all", c: "light-gray" }] },
    { l: 4, c: [{ t: "  reverse(nums, 0, k-1);", c: "cyan" }, { t: " // reverse first k", c: "light-gray" }] },
    { l: 5, c: [{ t: "  reverse(nums, k, n-1);", c: "cyan" }, { t: " // reverse rest", c: "light-gray" }] },
    { l: 6, c: [{ t: "}", c: "light-gray" }] },
    { l: 7, c: [{ t: "", c: "" }] },
    { l: 8, c: [{ t: "function reverse(nums, start, end) {", c: "" }] },
    { l: 9, c: [{ t: "  while", c: "purple" }, { t: " (start < end) {", c: "" }] },
    { l: 10, c: [{ t: "    swap(nums[start++], nums[end--]);", c: "" }] },
    { l: 11, c: [{ t: "  }", c: "light-gray" }] },
    { l: 12, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <RotateCw /> Rotate Array
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          LeetCode #189 - Rotate array using reversal algorithm
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label htmlFor="array-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">Array:</label>
          <input 
            id="array-input" 
            type="text" 
            value={arrayInput} 
            onChange={(e) => setArrayInput(e.target.value)} 
            disabled={isLoaded} 
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="e.g., 1,2,3,4,5,6,7"
          />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="k-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">Rotate by k:</label>
            <input 
              id="k-input" 
              type="number" 
              min="0"
              value={kInput} 
              onChange={(e) => setKInput(e.target.value)} 
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
                {rotateCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4">
                Array Visualization {step > 0 && `(Step ${step}/3)`}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {arr.map((value, index) => {
                  const isSwapping = swapIndices.includes(index);
                  const inReverse = index >= reverseStart && index <= reverseEnd;
                  
                  let bgColor = "bg-gray-700";
                  let borderColor = "border-gray-600";
                  let textColor = "text-gray-200";

                  if (inReverse && !isSwapping) {
                    bgColor = "bg-cyan-600/30";
                    borderColor = "border-cyan-500/50";
                  }

                  if (isSwapping) {
                    bgColor = "bg-amber-600/50";
                    borderColor = "border-amber-500";
                    textColor = "text-amber-100";
                  }

                  if (finished) {
                    bgColor = "bg-green-600/30";
                    borderColor = "border-green-500/50";
                    textColor = "text-green-100";
                  }

                  return (
                    <div key={index} className="flex flex-col items-center relative">
                      {isSwapping && <VisualizerPointer />}
                      <div className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${textColor}`}>
                        <span className="text-lg">{value}</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{index}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-2">Algorithm Steps</h3>
              <div className="space-y-2">
                <div className={`p-2 rounded ${step >= 1 ? 'bg-green-600/20' : 'bg-gray-700/30'}`}>
                  <span className="text-sm text-gray-300">1. Reverse entire array</span>
                </div>
                <div className={`p-2 rounded ${step >= 2 ? 'bg-green-600/20' : 'bg-gray-700/30'}`}>
                  <span className="text-sm text-gray-300">2. Reverse first k elements</span>
                </div>
                <div className={`p-2 rounded ${step >= 3 ? 'bg-green-600/20' : 'bg-gray-700/30'}`}>
                  <span className="text-sm text-gray-300">3. Reverse remaining elements</span>
                </div>
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
                  We perform three reversals, each taking O(n/2) operations. Total is O(3n/2) = O(n). This is optimal since we need to touch each element at least once.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(1)</strong>
                  <br />
                  The reversal algorithm only uses a constant amount of extra space for swapping, making this solution extremely space-efficient. We rotate the array in-place.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Enter an array and rotation amount to begin visualization.</p>
      )}
    </div>
  );
};

export default RotateArray;
