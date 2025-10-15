import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Zap,
  CheckCircle,
  Layers,
  Clock,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer"; // Assuming this path is correct
// import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch"; // Assuming this path is correct

const NextGreaterElementVisualizer = () => {
  const [mode, setMode] = useState("brute-force");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("4,5,2,10,8");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateBruteForceHistory = useCallback((nums) => {
    const n = nums.length;
    const newHistory = [];
    let results = new Array(n).fill(-1);

    const addState = (props) =>
      newHistory.push({
        nums,
        results: [...results],
        i: null,
        j: null,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize results array with -1." });
    for (let i = 0; i < n; i++) {
      addState({
        line: 3,
        i,
        explanation: `Finding Next Greater Element (NGE) for nums[${i}] = ${nums[i]}.`,
      });
      for (let j = i + 1; j < n; j++) {
        addState({
          line: 4,
          i,
          j,
          explanation: `Comparing nums[${i}] (${nums[i]}) with nums[${j}] (${nums[j]}).`,
        });
        if (nums[j] > nums[i]) {
          results[i] = nums[j];
          addState({
            line: 5,
            i,
            j,
            explanation: `Found NGE for ${nums[i]}: ${nums[j]}. Breaking inner loop.`,
          });
          break;
        }
      }
       if (results[i] === -1) {
         addState({
            line: 8,
            i,
            explanation: `No NGE found for ${nums[i]} after scanning. Result remains -1.`,
          });
       }
    }
    addState({
      line: 11,
      finished: true,
      explanation: "Algorithm finished. All NGEs have been computed.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((nums) => {
    const n = nums.length;
    const newHistory = [];
    let results = new Array(n).fill(-1);
    let stack = []; // Stack will store indices

    const addState = (props) =>
      newHistory.push({
        nums,
        results: [...results],
        stack: [...stack],
        i: null,
        top: null,
        explanation: "",
        ...props,
      });

    addState({ line: 3, explanation: "Initialize results array and an empty stack." });
    // Iterate from right to left
    for (let i = n - 1; i >= 0; i--) {
      addState({
        line: 4,
        i,
        explanation: `Processing element nums[${i}] = ${nums[i]}.`,
      });

      while (
        stack.length > 0 &&
        nums[stack[stack.length - 1]] <= nums[i]
      ) {
        const topIndex = stack[stack.length-1];
        addState({
          line: 5,
          i,
          explanation: `Stack top nums[${topIndex}] (${nums[topIndex]}) <= current nums[${i}] (${nums[i]}). Popping.`,
        });
        stack.pop();
      }

      if (stack.length > 0) {
        const topIndex = stack[stack.length - 1];
        results[i] = nums[topIndex];
        addState({
          line: 9,
          i,
          explanation: `Stack is not empty. NGE for ${nums[i]} is stack top nums[${topIndex}] = ${nums[topIndex]}.`,
        });
      } else {
        addState({
          line: 11,
          i,
          explanation: `Stack is empty. No NGE found for ${nums[i]}. Result is -1.`,
        });
      }

      stack.push(i);
      addState({
        line: 14,
        i,
        explanation: `Pushing index ${i} onto the stack.`,
      });
    }

    addState({
      line: 16,
      finished: true,
      explanation: "Algorithm finished. All NGEs have been computed.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);


  // --- Control and Setup Logic (similar to your provided component) ---
  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localNums.some(isNaN) || localNums.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    setIsLoaded(true);
    mode === "brute-force"
      ? generateBruteForceHistory(localNums)
      : generateOptimalHistory(localNums);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };
  
  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
  
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

  const handleModeChange = (newMode) => {
      setMode(newMode);
      reset();
  };

  const state = history[currentStep] || {};
  const { nums = [], line } = state;

  const renderBruteForce = () => {
    const { i, j, results, explanation, finished } = state;
    return (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
          <h3 className="font-bold text-xl text-teal-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2"><Code size={20}/>Brute Force Solution</h3>
          <pre className="text-sm font-mono leading-relaxed">
            {/* C++ Code for Brute Force */}
            {[{l:1, c:"vector<int> nextGreater(vector<int>& nums) {"}, {l:2, c:"  vector<int> res(n, -1);"}, {l:3, c:"  for (int i=0; i<n; ++i) {"}, {l:4, c:"    for (int j=i+1; j<n; ++j) {"}, {l:5, c:"      if (nums[j] > nums[i]) {"}, {l:6, c:"        res[i] = nums[j];"}, {l:7, c:"        break;"}, {l:8, c:"      }"}, {l:9, c:"    }"}, {l:10, c:"  }"}, {l:11, c:"  return res;"}, {l:12, c:"}"}]
            .map(({l, c}) => <div key={l} className={`block px-2 transition-all ${line === l ? "bg-teal-500/20 border-l-2 border-teal-400" : ""}`}><span className="text-gray-500 mr-4 select-none">{l}</span>{c}</div>)}
          </pre>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
                <h3 className="font-bold text-lg text-gray-300 mb-8">Array Visualization</h3>
                <div id="bf-array-container" className="flex justify-center items-center gap-2 flex-wrap">
                    {nums.map((num, index) => (
                        <div key={index} id={`bf-array-container-element-${index}`} className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-300 ${i === index ? 'border-amber-400 bg-amber-500/20 scale-110' : j === index ? 'border-cyan-400 bg-cyan-500/20 scale-105' : 'border-gray-600 bg-gray-700'}`}>
                            {num}
                        </div>
                    ))}
                </div>
                <VisualizerPointer index={i} containerId="bf-array-container" color="amber" label="i" direction="down"/>
                <VisualizerPointer index={j} containerId="bf-array-container" color="cyan" label="j" direction="down"/>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                 <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2"><Zap size={20}/>Results (NGE)</h3>
                 <div className="flex flex-wrap gap-3">
                     {results?.map((res, index) => (
                         <div key={index} className={`p-2 rounded-lg text-center transition-all duration-300 ${i === index ? 'bg-amber-500/20' : ''}`}>
                             <div className="text-sm text-gray-400">nums[{index}]</div>
                             <div className="font-mono text-2xl font-bold text-teal-400">{res}</div>
                         </div>
                     ))}
                 </div>
            </div>
             <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{explanation || " "}</p>
              {finished && <CheckCircle className="inline-block ml-2 text-green-400"/>}
            </div>
        </div>
      </div>
    );
  };
  
  const renderOptimal = () => {
    const { i, stack, results, explanation, finished } = state;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
          <h3 className="font-bold text-xl text-teal-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2"><Code size={20}/>Optimal Solution (Stack)</h3>
          <pre className="text-sm font-mono leading-relaxed">
            {[{l:1,c:"vector<int> nextGreater(vector<int>& nums) {"},{l:2,c:"  int n = nums.size();"},{l:3,c:"  vector<int> res(n, -1);"},{l:4,c:"  stack<int> s;"},{l:5,c:"  for (int i=n-1; i>=0; --i) {"},{l:6,c:"    while (!s.empty() && nums[s.top()] <= nums[i]) {"},{l:7,c:"      s.pop();"},{l:8,c:"    }"},{l:9,c:"    if (!s.empty()) {"},{l:10,c:"      res[i] = nums[s.top()];"},{l:11,c:"    }"},{l:12,c:"    else {"},{l:13,c:"      res[i] = -1;"},{l:14,c:"    }"},{l:15,c:"    s.push(i);"},{l:16,c:"  }"},{l:17,c:"  return res;"},{l:18,c:"}"}]
            .map(({l, c}) => <div key={l} className={`block px-2 transition-all ${line === l ? "bg-teal-500/20 border-l-2 border-teal-400" : ""}`}><span className="text-gray-500 mr-4 select-none">{l}</span>{c}</div>)}
          </pre>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
                <h3 className="font-bold text-lg text-gray-300 mb-8">Array Visualization</h3>
                <div id="opt-array-container" className="flex justify-center items-center gap-2 flex-wrap">
                    {nums.map((num, index) => (
                        <div key={index} id={`opt-array-container-element-${index}`} className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-300 ${i === index ? 'border-amber-400 bg-amber-500/20 scale-110' : 'border-gray-600 bg-gray-700'}`}>
                            {num}
                        </div>
                    ))}
                </div>
                <VisualizerPointer index={i} containerId="opt-array-container" color="amber" label="i" direction="down"/>
            </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                    <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2"><Layers size={20}/>Stack (stores indices)</h3>
                     <div className="h-48 flex flex-col-reverse items-center gap-2 bg-gray-900/50 rounded-lg p-3 overflow-y-auto">
                        {stack?.map((idx, s_idx) => (
                          <div key={s_idx} className="w-full h-12 flex items-center justify-center bg-indigo-600 text-xl font-bold rounded-lg font-mono shadow-md">
                            {idx} <span className="text-sm text-indigo-200 ml-2">({nums[idx]})</span>
                          </div>
                        ))}
                        {stack?.length === 0 && <span className="text-gray-500">Empty</span>}
                    </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                    <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2"><Zap size={20}/>Results (NGE)</h3>
                    <div className="flex flex-col gap-1 h-48 overflow-y-auto">
                         {results?.map((res, index) => (
                             <div key={index} className={`p-2 rounded-lg flex justify-between items-center transition-all duration-300 ${i === index ? 'bg-amber-500/20' : ''}`}>
                                 <div className="text-sm text-gray-400">NGE for {nums[index]}</div>
                                 <div className="font-mono text-2xl font-bold text-teal-400">{res}</div>
                             </div>
                         ))}
                     </div>
                </div>
             </div>
             <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{explanation || " "}</p>
              {finished && <CheckCircle className="inline-block ml-2 text-green-400"/>}
            </div>
        </div>
      </div>
    );
  };
  

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-teal-400 flex items-center justify-center gap-3">
          <Zap/>Next Greater Element
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 496 & 503</p>
      </header>

      {/* --- Controls --- */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
         <div className="flex items-center gap-4 flex-grow w-full">
             <label htmlFor="array-input" className="font-medium text-gray-300 font-mono">Array:</label>
             <input id="array-input" type="text" value={numsInput} onChange={(e) => setNumsInput(e.target.value)} disabled={isLoaded} className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-teal-500"/>
         </div>
         <div className="flex items-center gap-2">
             {!isLoaded ? (
                 <button onClick={loadArray} className="bg-teal-500 hover:bg-teal-600 text-gray-900 font-bold py-2 px-4 rounded-lg">Load & Visualize</button>
             ) : (
                 <>
                    <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 p-2 rounded-md disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                    <span className="font-mono w-24 text-center">{currentStep + 1}/{history.length}</span>
                    <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 p-2 rounded-md disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                 </>
             )}
             <button onClick={reset} className="ml-4 bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg">Reset</button>
         </div>
      </div>
      
      {/* --- Tabs --- */}
      <div className="flex border-b border-gray-700 mb-6">
        <div onClick={() => handleModeChange("brute-force")} className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "brute-force" ? "border-teal-400 text-teal-400" : "border-transparent text-gray-400"}`}>Brute Force O(n²)</div>
        <div onClick={() => handleModeChange("optimal")} className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "optimal" ? "border-teal-400 text-teal-400" : "border-transparent text-gray-400"}`}>Optimal O(n)</div>
      </div>
      
      {isLoaded ? (mode === "brute-force" ? renderBruteForce() : renderOptimal()) : (
        <div className="text-center py-10 text-gray-500">Load an array to begin visualization.</div>
      )}
    </div>
  );
};

export default NextGreaterElementVisualizer;