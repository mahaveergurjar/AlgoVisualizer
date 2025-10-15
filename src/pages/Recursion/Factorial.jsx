import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, Layers, Activity, Hash } from "lucide-react";

const FactorialVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("5");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateFactorialHistory = useCallback((n) => {
    const newHistory = [];
    let callCount = 0;
    const callStack = [];

    const addState = (props) =>
      newHistory.push({
        callStack: [...callStack],
        callCount,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Calculate ${n}! (factorial of ${n}) using recursion.` });

    const factorial = (num) => {
      callCount++;
      callStack.push({ n: num, result: null });
      
      addState({
        line: 2,
        explanation: `Call factorial(${num}). Call count: ${callCount}.`,
      });

      if (num <= 1) {
        addState({
          line: 3,
          explanation: `Base case: factorial(${num}) = 1.`,
        });
        
        callStack[callStack.length - 1].result = 1;
        
        addState({
          line: 4,
          explanation: `Return 1 from factorial(${num}).`,
        });

        callStack.pop();
        return 1;
      }

      addState({
        line: 5,
        explanation: `Compute factorial(${num}) = ${num} × factorial(${num - 1}).`,
      });

      addState({
        line: 6,
        explanation: `Calculate factorial(${num - 1}) recursively.`,
      });

      const result = num * factorial(num - 1);

      callStack[callStack.length - 1].result = result;

      addState({
        line: 7,
        explanation: `factorial(${num}) = ${num} × factorial(${num - 1}) = ${result}. Return ${result}.`,
      });

      callStack.pop();
      return result;
    };

    const result = factorial(n);

    addState({
      line: 8,
      finished: true,
      finalResult: result,
      explanation: `${n}! = ${result}. Total function calls: ${callCount}.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const n = parseInt(nInput);
    if (isNaN(n) || n < 0 || n > 12) {
      alert("Please enter a number between 0 and 12.");
      return;
    }
    setIsLoaded(true);
    generateFactorialHistory(n);
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
  const { callStack = [], callCount = 0, explanation = "", finalResult = null, finished = false } = state;

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

  const factorialCode = [
    { l: 1, c: [{ t: "function factorial(n) {", c: "" }] },
    { l: 2, c: [{ t: "  if", c: "purple" }, { t: " (n <= 1) {", c: "" }] },
    { l: 3, c: [{ t: "    return", c: "purple" }, { t: " 1;", c: "" }] },
    { l: 4, c: [{ t: "  }", c: "light-gray" }] },
    { l: 5, c: [{ t: "  return", c: "purple" }, { t: " n * factorial(n - 1);", c: "" }] },
    { l: 6, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Hash /> Factorial Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualize recursive factorial with linear call stack
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="n-input" className="font-medium text-gray-300 font-mono">Calculate n!, n =</label>
          <input id="n-input" type="number" min="0" max="12" value={nInput} onChange={(e) => setNInput(e.target.value)} disabled={isLoaded} className="font-mono w-24 bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
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

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {factorialCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Layers size={20} />
                Call Stack (Linear Recursion)
              </h3>
              <div className="space-y-3">
                {callStack.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Call stack is empty</p>
                ) : (
                  callStack.slice().reverse().map((call, index) => {
                    const depth = callStack.length - 1 - index;
                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-blue-800/30 to-purple-800/30 border border-blue-700/50 rounded-lg p-4 transform transition-all"
                        style={{ marginLeft: `${depth * 20}px` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 border border-blue-400/50 rounded-full w-8 h-8 flex items-center justify-center text-blue-300 font-bold text-sm">
                              {depth + 1}
                            </div>
                            <span className="font-mono text-lg text-blue-300">
                              factorial({call.n})
                            </span>
                          </div>
                          {call.result !== null && (
                            <div className="bg-green-500/20 border border-green-400/50 rounded px-3 py-1">
                              <span className="text-green-300 font-mono font-bold">
                                = {call.result}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <Activity size={16} /> Function Calls
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
              {finished && finalResult !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  <span className="text-green-400 font-bold">Final Result: {finalResult}</span>
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
                  The function makes exactly n recursive calls, one for each number from n down to 1. This is linear recursion - each call makes only one recursive call.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Iterative Alternative</h4>
                <p className="text-gray-400">
                  Factorial can be computed iteratively with a simple loop, which avoids the overhead of recursive function calls and uses constant space.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(n)</strong>
                  <br />
                  The call stack grows linearly with n. Each recursive call adds a new frame to the stack, and the maximum depth is n.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Linear Recursion</h4>
                <p className="text-gray-400">
                  Unlike tree recursion (like Fibonacci), factorial uses linear recursion where each call makes exactly one recursive call, creating a simple linear call stack.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Enter a value for n to begin visualization.</p>
      )}
    </div>
  );
};

export default FactorialVisualizer;
