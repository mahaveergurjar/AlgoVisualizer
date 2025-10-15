import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, GitBranch, Activity, Zap } from "lucide-react";

const FibonacciVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("5");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateFibonacciHistory = useCallback((n) => {
    const newHistory = [];
    let callCount = 0;
    const callStack = [];
    const computedValues = new Map();
    const treeNodes = [];

    const addState = (props) =>
      newHistory.push({
        callStack: [...callStack],
        computedValues: new Map(computedValues),
        treeNodes: [...treeNodes],
        callCount,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Calculate Fibonacci(${n}) using recursion.` });

    const fibonacci = (num, parent = null, depth = 0, position = 0) => {
      callCount++;
      const nodeId = treeNodes.length;
      
      treeNodes.push({
        id: nodeId,
        value: num,
        parent,
        depth,
        position,
        result: null,
        isComputing: true
      });

      callStack.push({ n: num, depth });
      addState({
        line: 2,
        currentNode: nodeId,
        explanation: `Call fib(${num}). Call count: ${callCount}.`,
      });

      if (num <= 1) {
        addState({
          line: 3,
          currentNode: nodeId,
          explanation: `Base case: fib(${num}) = ${num}.`,
        });
        
        treeNodes[nodeId].result = num;
        treeNodes[nodeId].isComputing = false;
        computedValues.set(num, num);

        addState({
          line: 4,
          currentNode: nodeId,
          explanation: `Return ${num} from fib(${num}).`,
        });

        callStack.pop();
        return num;
      }

      addState({
        line: 5,
        currentNode: nodeId,
        explanation: `Compute fib(${num}) = fib(${num - 1}) + fib(${num - 2}).`,
      });

      addState({
        line: 6,
        currentNode: nodeId,
        explanation: `Calculate left child: fib(${num - 1}).`,
      });

      const left = fibonacci(num - 1, nodeId, depth + 1, position * 2);

      addState({
        line: 7,
        currentNode: nodeId,
        explanation: `Received fib(${num - 1}) = ${left}. Now calculate right child: fib(${num - 2}).`,
      });

      const right = fibonacci(num - 2, nodeId, depth + 1, position * 2 + 1);

      const result = left + right;
      treeNodes[nodeId].result = result;
      treeNodes[nodeId].isComputing = false;
      computedValues.set(num, result);

      addState({
        line: 8,
        currentNode: nodeId,
        explanation: `fib(${num}) = ${left} + ${right} = ${result}. Return ${result}.`,
      });

      callStack.pop();
      return result;
    };

    const result = fibonacci(n);

    addState({
      line: 9,
      finished: true,
      finalResult: result,
      explanation: `Fibonacci(${n}) = ${result}. Total function calls: ${callCount}.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const n = parseInt(nInput);
    if (isNaN(n) || n < 0 || n > 10) {
      alert("Please enter a number between 0 and 10.");
      return;
    }
    setIsLoaded(true);
    generateFibonacciHistory(n);
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
  const { callStack = [], computedValues = new Map(), treeNodes = [], callCount = 0, explanation = "", currentNode = null, finalResult = null, finished = false } = state;

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

  const fibCode = [
    { l: 1, c: [{ t: "function fibonacci(n) {", c: "" }] },
    { l: 2, c: [{ t: "  if", c: "purple" }, { t: " (n <= 1) {", c: "" }] },
    { l: 3, c: [{ t: "    return", c: "purple" }, { t: " n;", c: "" }] },
    { l: 4, c: [{ t: "  }", c: "light-gray" }] },
    { l: 5, c: [{ t: "  return", c: "purple" }, { t: " fibonacci(n-1) + fibonacci(n-2);", c: "" }] },
    { l: 6, c: [{ t: "}", c: "light-gray" }] },
  ];

  const renderTree = () => {
    if (treeNodes.length === 0) return null;

    const maxDepth = Math.max(...treeNodes.map(n => n.depth));
    const width = Math.pow(2, maxDepth) * 60;

    return (
      <svg width={width} height={(maxDepth + 1) * 80} className="mx-auto">
        {treeNodes.map((node) => {
          if (node.parent !== null) {
            const parentNode = treeNodes[node.parent];
            const x1 = (parentNode.position + 1) * (width / Math.pow(2, parentNode.depth + 1));
            const y1 = parentNode.depth * 80 + 40;
            const x2 = (node.position + 1) * (width / Math.pow(2, node.depth + 1));
            const y2 = node.depth * 80 + 40;
            
            return (
              <line
                key={`line-${node.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4B5563"
                strokeWidth="2"
              />
            );
          }
          return null;
        })}

        {treeNodes.map((node) => {
          const x = (node.position + 1) * (width / Math.pow(2, node.depth + 1));
          const y = node.depth * 80 + 40;
          const isActive = node.id === currentNode;
          const hasResult = node.result !== null;

          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={x}
                cy={y}
                r="20"
                fill={isActive ? "#3B82F6" : hasResult ? "#10B981" : "#6B7280"}
                stroke={isActive ? "#60A5FA" : hasResult ? "#34D399" : "#9CA3AF"}
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {node.value}
              </text>
              {hasResult && (
                <text
                  x={x}
                  y={y + 35}
                  textAnchor="middle"
                  fill="#10B981"
                  fontSize="12"
                  fontWeight="bold"
                >
                  = {node.result}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Zap /> Fibonacci Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualize recursive Fibonacci with call tree and stack
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="n-input" className="font-medium text-gray-300 font-mono">Fibonacci(n), n =</label>
          <input id="n-input" type="number" min="0" max="10" value={nInput} onChange={(e) => setNInput(e.target.value)} disabled={isLoaded} className="font-mono w-24 bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
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
                {fibCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <GitBranch size={20} />
                Recursion Tree
              </h3>
              <div className="overflow-x-auto">
                {renderTree()}
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
                  <GitBranch size={16} /> Stack Depth
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">{callStack.length}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <GitBranch size={16} />
                Call Stack
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {callStack.length === 0 ? (
                  <p className="text-gray-500 text-sm">Empty</p>
                ) : (
                  callStack.slice().reverse().map((call, index) => (
                    <div key={index} className="bg-gray-700/50 p-2 rounded text-xs font-mono text-gray-300" style={{ marginLeft: `${call.depth * 12}px` }}>
                      fib({call.n})
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-2">Computed Values</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(computedValues.entries()).map(([n, val]) => (
                  <div key={n} className="bg-green-800/30 px-3 py-1 rounded border border-green-700/50 text-sm font-mono text-green-300">
                    fib({n}) = {val}
                  </div>
                ))}
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
                <h4 className="font-semibold text-blue-300">Time Complexity (Naive)</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(2^n)</strong>
                  <br />
                  Without memoization, each call spawns two more calls, creating an exponential tree. Many values are computed multiple times.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">With Memoization</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(n)</strong>
                  <br />
                  By caching computed values, each Fibonacci number is calculated only once, reducing time complexity to linear.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(n)</strong>
                  <br />
                  The maximum depth of recursion is n, so the call stack grows to size n in the worst case.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Optimization</h4>
                <p className="text-gray-400">
                  Notice the duplicate subtrees! Memoization or dynamic programming can eliminate redundant calculations and dramatically improve performance.
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

export default FibonacciVisualizer;
