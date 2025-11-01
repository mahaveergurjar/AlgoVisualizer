import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, TrendingUp } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer.jsx";

const ProductOfArrayExceptSelf = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("1,2,3,4");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateProductHistory = useCallback((arr) => {
    const newHistory = [];
    const n = arr.length;
    const result = Array(n).fill(1);
    const prefix = Array(n).fill(1);
    const suffix = Array(n).fill(1);

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        result: [...result],
        prefix: [...prefix],
        suffix: [...suffix],
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Calculate product of array except self for [${arr.join(", ")}].` });

    addState({ line: 2, explanation: `Step 1: Calculate prefix products (left to right).` });

    for (let i = 1; i < n; i++) {
      prefix[i] = prefix[i - 1] * arr[i - 1];
      addState({
        line: 3,
        currentIndex: i,
        prefixPhase: true,
        explanation: `prefix[${i}] = prefix[${i - 1}] × arr[${i - 1}] = ${prefix[i - 1]} × ${arr[i - 1]} = ${prefix[i]}.`,
      });
    }

    addState({ line: 4, explanation: `Step 2: Calculate suffix products (right to left).` });

    for (let i = n - 2; i >= 0; i--) {
      suffix[i] = suffix[i + 1] * arr[i + 1];
      addState({
        line: 5,
        currentIndex: i,
        suffixPhase: true,
        explanation: `suffix[${i}] = suffix[${i + 1}] × arr[${i + 1}] = ${suffix[i + 1]} × ${arr[i + 1]} = ${suffix[i]}.`,
      });
    }

    addState({ line: 6, explanation: `Step 3: Multiply prefix and suffix for final result.` });

    for (let i = 0; i < n; i++) {
      result[i] = prefix[i] * suffix[i];
      addState({
        line: 7,
        currentIndex: i,
        finalPhase: true,
        explanation: `result[${i}] = prefix[${i}] × suffix[${i}] = ${prefix[i]} × ${suffix[i]} = ${result[i]}.`,
      });
    }

    addState({
      line: 8,
      finished: true,
      explanation: `Complete! Product array: [${result.join(", ")}].`,
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
    generateProductHistory(arr);
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
  const { arr = [], result = [], prefix = [], suffix = [], currentIndex = -1, explanation = "", prefixPhase = false, suffixPhase = false, finalPhase = false, finished = false } = state;

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

  const productCode = [
    { l: 1, c: [{ t: "function productExceptSelf(nums) {", c: "" }] },
    { l: 2, c: [{ t: "  prefix = [1], suffix = [1], result = [];", c: "" }] },
    { l: 3, c: [{ t: "  for", c: "purple" }, { t: " (i = 1; i < n; i++)", c: "" }] },
    { l: 4, c: [{ t: "    prefix[i] = prefix[i-1] * nums[i-1];", c: "" }] },
    { l: 5, c: [{ t: "  for", c: "purple" }, { t: " (i = n-2; i >= 0; i--)", c: "" }] },
    { l: 6, c: [{ t: "    suffix[i] = suffix[i+1] * nums[i+1];", c: "" }] },
    { l: 7, c: [{ t: "  for", c: "purple" }, { t: " (i = 0; i < n; i++)", c: "" }] },
    { l: 8, c: [{ t: "    result[i] = prefix[i] * suffix[i];", c: "" }] },
    { l: 9, c: [{ t: "  return", c: "purple" }, { t: " result;", c: "" }] },
    { l: 10, c: [{ t: "}", c: "light-gray" }] },
  ];

  const renderArray = (values, label, highlightColor = "purple") => (
    <div className="space-y-2">
      <h4 className="text-sm text-gray-400 font-mono">{label}</h4>
      <div className="flex gap-2 flex-wrap">
        {values.map((value, index) => {
          const isActive = index === currentIndex;
          let bgColor = "bg-gray-700";
          let borderColor = "border-gray-600";
          
          if (isActive) {
            if (highlightColor === "purple") {
              bgColor = "bg-purple-600/50";
              borderColor = "border-purple-500";
            } else if (highlightColor === "cyan") {
              bgColor = "bg-cyan-600/50";
              borderColor = "border-cyan-500";
            } else if (highlightColor === "green") {
              bgColor = "bg-green-600/50";
              borderColor = "border-green-500";
            }
          }

          if (finished && label === "Result") {
            bgColor = "bg-green-600/30";
            borderColor = "border-green-500/50";
          }

          return (
            <div key={index} className="flex flex-col items-center relative">
              {isActive && <VisualizerPointer />}
              <div className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300`}>
                <span className="text-lg text-gray-200">{value}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{index}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <TrendingUp /> Product of Array Except Self
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          LeetCode #238 - Calculate product without division
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
              placeholder="e.g., 1,2,3,4"
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
                {productCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-6">
              {renderArray(arr, "Original Array", "gray")}
              {prefixPhase && renderArray(prefix, "Prefix Products", "purple")}
              {suffixPhase && renderArray(suffix, "Suffix Products", "cyan")}
              {finalPhase && renderArray(result, "Result", "green")}
              {finished && renderArray(result, "Result", "green")}
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
                  We make three passes through the array: one for prefix products, one for suffix products, and one to combine them. Each pass is O(n), so total is O(3n) = O(n).
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(1)</strong>
                  <br />
                  We can optimize to O(1) extra space by storing prefix products directly in the result array and computing suffix products on the fly. The current implementation uses O(n) for visualization clarity.
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

export default ProductOfArrayExceptSelf;
