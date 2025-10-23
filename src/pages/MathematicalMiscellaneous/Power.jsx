import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Cpu,
  Calculator,
  Binary,
  Grid,
  Layers,
  TrendingUp,
  Target,
  Gauge,
  Divide,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";

// Pointer Component
const Pointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const updatePosition = () => {
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
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => window.removeEventListener('resize', updatePosition);
  }, [index, containerId]);

  const colors = {
    red: { bg: "bg-red-500", text: "text-red-500" },
    blue: { bg: "bg-blue-500", text: "text-blue-500" },
    green: { bg: "bg-green-500", text: "text-green-500" },
    yellow: { bg: "bg-yellow-500", text: "text-yellow-500" },
    purple: { bg: "bg-purple-500", text: "text-purple-500" },
  };

  return (
    <div
      className="absolute transition-all duration-500 ease-out z-10"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${colors[color].bg}`}
        style={{ 
          borderBottomColor: color === "red" ? "#ef4444" : 
                          color === "blue" ? "#3b82f6" : 
                          color === "green" ? "#10b981" : 
                          color === "yellow" ? "#eab308" : "#a855f7"
        }}
      />
      <div
        className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}
      >
        {label}
      </div>
    </div>
  );
};

const PowerPage = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [xInput, setXInput] = useState("2");
  const [nInput, setNInput] = useState("10");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateBruteForceHistory = useCallback((x, n) => {
    const newHistory = [];
    let stepCount = 0;
    let currentResult = 1;
    const isNegative = n < 0;
    const absN = Math.abs(n);

    const addState = (props) => {
      newHistory.push({
        x,
        n,
        absN,
        isNegative,
        currentResult,
        currentExponent: 0,
        iteration: 0,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting brute force approach: Calculate ${x}^${n}`,
      operation: "initialize",
    });

    if (isNegative) {
      addState({
        line: 4,
        explanation: `Negative exponent detected: ${n}. We'll calculate ${x}^${absN} and take reciprocal`,
        operation: "check_negative",
      });
    }

    for (let i = 0; i < absN; i++) {
      const prevResult = currentResult;
      currentResult *= x;
      
      addState({
        line: 7,
        currentExponent: i + 1,
        iteration: i,
        currentResult: prevResult,
        explanation: `Step ${i + 1}: ${prevResult} × ${x} = ${currentResult}`,
        operation: "multiply",
        justMultiplied: true,
      });
    }

    if (isNegative) {
      const finalResult = 1 / currentResult;
      addState({
        line: 9,
        currentResult: finalResult,
        explanation: `Negative exponent: Taking reciprocal 1 / ${currentResult} = ${finalResult}`,
        operation: "reciprocal",
        finalStep: true,
      });
    } else {
      addState({
        line: 11,
        currentResult,
        explanation: `Final result: ${currentResult}`,
        operation: "final",
        finalStep: true,
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

  const generateOptimalHistory = useCallback((x, n) => {
    const newHistory = [];
    let stepCount = 0;
    let currentResult = 1;
    let currentBase = x;
    let currentExponent = Math.abs(n);
    const isNegative = n < 0;

    const addState = (props) => {
      newHistory.push({
        x,
        n,
        currentBase,
        currentExponent,
        currentResult,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting fast exponentiation: Calculate ${x}^${n} using binary exponentiation`,
      operation: "initialize",
    });

    if (isNegative) {
      addState({
        line: 4,
        explanation: `Negative exponent detected: ${n}. We'll calculate ${x}^${currentExponent} and take reciprocal`,
        operation: "check_negative",
      });
    }

    let iteration = 0;
    while (currentExponent > 0) {
      addState({
        line: 6,
        explanation: `Current exponent: ${currentExponent}, checking if odd or even`,
        operation: "check_parity",
        iteration: iteration,
      });

      if (currentExponent % 2 === 1) {
        const prevResult = currentResult;
        currentResult *= currentBase;
        addState({
          line: 7,
          explanation: `Exponent ${currentExponent} is ODD: Multiply result by current base (${currentBase}) → ${prevResult} × ${currentBase} = ${currentResult}`,
          operation: "multiply",
          iteration: iteration,
        });
      } else {
        addState({
          line: 9,
          explanation: `Exponent ${currentExponent} is EVEN: No multiplication needed`,
          operation: "skip_multiply",
          iteration: iteration,
        });
      }

      const prevBase = currentBase;
      currentBase *= currentBase;
      const prevExponent = currentExponent;
      currentExponent = Math.floor(currentExponent / 2);

      addState({
        line: 10,
        explanation: `Square the base: ${prevBase}² = ${currentBase}, Halve the exponent: ${prevExponent} → ${currentExponent}`,
        operation: "square_and_halve",
        iteration: iteration,
      });
      
      iteration++;
    }

    if (isNegative) {
      const finalResult = 1 / currentResult;
      addState({
        line: 12,
        currentResult: finalResult,
        explanation: `Negative exponent: Taking reciprocal 1 / ${currentResult} = ${finalResult}`,
        operation: "reciprocal",
        finalStep: true,
      });
    } else {
      addState({
        line: 14,
        currentResult,
        explanation: `Final result: ${currentResult}`,
        operation: "final",
        finalStep: true,
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  const playAnimation = useCallback(() => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, history.length]);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const loadVisualization = () => {
    const x = parseFloat(xInput);
    const n = parseInt(nInput, 10);

    if (isNaN(x)) {
      alert("Please enter a valid number for x");
      return;
    }

    if (isNaN(n)) {
      alert("Please enter a valid integer for n");
      return;
    }

    if (mode === "brute-force" && Math.abs(n) > 50) {
      if (!confirm(`You entered n = ${n}. Large exponents may cause performance issues in brute force mode. Continue?`)) {
        return;
      }
    }

    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(x, n);
    } else {
      generateOptimalHistory(x, n);
    }
  };

  const generateRandomInput = () => {
    const randomX = (Math.random() * 4 - 2).toFixed(1); // -2 to 2
    const randomN = Math.floor(Math.random() * 11) - 5; // -5 to 5
    setXInput(randomX);
    setNInput(randomN.toString());
    resetVisualization();
  };

  const parseInput = useCallback(() => {
    const x = parseFloat(xInput);
    const n = parseInt(nInput, 10);
    if (isNaN(x) || isNaN(n)) throw new Error("Invalid input");
    return { x, n };
  }, [xInput, nInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ x, n }) => generateBruteForceHistory(x, n),
      optimal: ({ x, n }) => generateOptimalHistory(x, n),
    },
    setCurrentStep,
    onError: () => {},
  });

  // Auto-play
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepBackward();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        } else if (e.key === " ") {
          e.preventDefault();
          if (isPlaying) {
            pauseAnimation();
          } else {
            playAnimation();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};

  // Operation display mapping
  const getOperationDisplay = (operation) => {
    const operationMap = {
      "initialize": "Initialize",
      "check_negative": "Check Negative",
      "check_parity": "Check Parity",
      "multiply": "Multiply",
      "skip_multiply": "Skip Multiply", 
      "square_and_halve": "Square & Halve",
      "reciprocal": "Take Reciprocal",
      "final": "Final Result",
      "square": "Square Base",
      "halve": "Halve Exponent"
    };
    return operationMap[operation] || "Initialize";
  };

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        state.line === lineNum
          ? "bg-blue-500/20 border-l-4 border-blue-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={state.line === lineNum ? "text-blue-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const bruteForceCode = [
    { line: 1, content: "double myPow(double x, int n) {" },
    { line: 2, content: "    if (n == 0) return 1.0;" },
    { line: 3, content: "    long absN = Math.abs((long)n);" },
    { line: 4, content: "    double result = 1.0;" },
    { line: 5, content: "    for (int i = 0; i < absN; i++) {" },
    { line: 6, content: "        result *= x;" },
    { line: 7, content: "    }" },
    { line: 8, content: "    if (n < 0) {" },
    { line: 9, content: "        return 1.0 / result;" },
    { line: 10, content: "    }" },
    { line: 11, content: "    return result;" },
    { line: 12, content: "}" },
  ];

  const optimalCode = [
    { line: 1, content: "double myPow(double x, int n) {" },
    { line: 2, content: "    if (n == 0) return 1.0;" },
    { line: 3, content: "    long absN = Math.abs((long)n);" },
    { line: 4, content: "    double result = 1.0;" },
    { line: 5, content: "    while (absN > 0) {" },
    { line: 6, content: "        if (absN % 2 == 1) {" },
    { line: 7, content: "            result *= x;" },
    { line: 8, content: "        }" },
    { line: 9, content: "        x *= x;" },
    { line: 10, content: "        absN /= 2;" },
    { line: 11, content: "    }" },
    { line: 12, content: "    if (n < 0) {" },
    { line: 13, content: "        return 1.0 / result;" },
    { line: 14, content: "    }" },
    { line: 15, content: "    return result;" },
    { line: 16, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Calculator size={28} />
          Pow(x, n)
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Implement pow(x, n) which calculates x raised to the power n (LeetCode #50)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="x-input" className="font-medium text-gray-300 font-mono">
              x:
            </label>
            <input
              id="x-input"
              type="number"
              step="0.1"
              value={xInput}
              onChange={(e) => setXInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 2"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="n-input" className="font-medium text-gray-300 font-mono">
              n:
            </label>
            <input
              id="n-input"
              type="number"
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 10"
              className="font-mono bg-gray-900 border border-gray-600 rounded-lg p-3 w-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadVisualization}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomInput}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Input
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipBack size={20} />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-green-500 hover:bg-green-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <Pause size={20} />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Speed:</label>
                  <select
                    value={speed}
                    onChange={handleSpeedChange}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer"
                  >
                    <option value={1500}>Slow</option>
                    <option value={1000}>Medium</option>
                    <option value={500}>Fast</option>
                    <option value={250}>Very Fast</option>
                  </select>
                </div>

                <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                  {currentStep + 1}/{history.length}
                </div>
              </div>

              <button
                onClick={resetVisualization}
                className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex border-b-2 border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "brute-force"
              ? "border-blue-400 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Brute Force O(n)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "optimal"
              ? "border-blue-400 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Optimal O(log n) - Fast Exponentiation
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              {mode === "brute-force" ? "Brute Force Code" : "Fast Exponentiation Code"}
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {(mode === "brute-force" ? bruteForceCode : optimalCode).map((codeLine) => (
                    <CodeLine 
                      key={codeLine.line} 
                      lineNum={codeLine.line} 
                      content={codeLine.content}
                    />
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calculation Visualization */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Calculator size={20} />
                Calculation Progress
                <span className="text-sm text-gray-400 ml-2">
                  Calculating {state.x}^{state.n}
                </span>
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Current State Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-lg border border-blue-700/50">
                    <div className="text-sm text-blue-300 mb-1">Base (x)</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {mode === "optimal" ? state.currentBase?.toFixed(2) : state.x}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 rounded-lg border border-purple-700/50">
                    <div className="text-sm text-purple-300 mb-1">Exponent</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {mode === "optimal" ? state.currentExponent : state.currentExponent}
                      {state.absN !== undefined && `/${state.absN}`}
                      {mode === "optimal" && state.currentExponent !== undefined && (
                        <span className="text-sm text-purple-300 ml-2">
                          ({state.currentExponent.toString(2)}₂)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 rounded-lg border border-green-700/50">
                    <div className="text-sm text-green-300 mb-1">Current Result</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.currentResult?.toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 p-4 rounded-lg border border-amber-700/50">
                    <div className="text-sm text-amber-300 mb-1">Operation</div>
                    <div className="text-lg font-bold text-white">
                      {getOperationDisplay(state.operation)}
                    </div>
                  </div>
                </div>

                {/* Binary Representation (Optimal Mode) */}
                {mode === "optimal" && state.currentExponent !== undefined && (
                  <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-4 rounded-lg border border-gray-700/50 w-full max-w-2xl">
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Binary size={16} />
                      Binary Representation of Exponent: {state.currentExponent}
                    </h4>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {state.currentExponent.toString(2).split('').map((bit, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                            bit === '1' 
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400"
                              : "bg-gray-700 border-gray-600 text-gray-400"
                          }`}
                        >
                          {bit}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-2">
                      Reading bits from left to right determines when to multiply
                    </div>
                  </div>
                )}

                {/* Step-by-step Calculation */}
                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-lg border border-blue-700/50 w-full max-w-2xl">
                  <h4 className="font-semibold text-blue-300 mb-3">Calculation Steps</h4>
                  <div className="space-y-2 text-sm">
                    {mode === "brute-force" ? (
                      <div>
                        <div className="text-gray-300">
                          Iteration {state.iteration + 1} of {state.absN}:
                        </div>
                        <div className="font-mono text-green-400">
                          {state.currentResult} × {state.x} = {(state.currentResult * state.x).toFixed(4)}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {state.operation === "multiply" && (
                          <div className="text-green-400 font-mono">
                            Multiply: result × base = {state.currentResult}
                          </div>
                        )}
                        {state.operation === "square_and_halve" && (
                          <div className="text-blue-400 font-mono">
                            Square: base² = {state.currentBase}
                          </div>
                        )}
                        <div className="text-yellow-400 font-mono">
                          Current exponent: {state.currentExponent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Final Result */}
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
              <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                <CheckCircle size={20} />
                Final Result
              </h3>
              <div className="min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex items-center justify-center">
                {state.finalStep ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white font-mono mb-2">
                      {state.currentResult?.toFixed(6)}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {state.x}^{state.n} = {state.currentResult?.toFixed(6)}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Calculation in progress...
                  </span>
                )}
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Target size={20} />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Base: <span className="font-mono font-bold text-blue-400">
                      {mode === "optimal" ? state.currentBase?.toFixed(4) : state.x}
                    </span>
                  </p>
                  <p>
                    Exponent: <span className="font-mono font-bold text-purple-400">
                      {state.currentExponent ?? "N/A"}
                    </span>
                  </p>
                  <p>
                    Result: <span className="font-mono font-bold text-green-400">
                      {state.currentResult?.toFixed(4) ?? "1.0"}
                    </span>
                  </p>
                  <p>
                    Operation: <span className="font-mono font-bold text-amber-400">
                      {getOperationDisplay(state.operation)}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
                <h3 className="font-bold text-lg text-gray-300 mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Step Explanation
                </h3>
                <div className="text-gray-300 text-sm h-20 overflow-y-auto scrollbar-thin">
                  {state.explanation || "Processing..."}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity: O(n)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <strong className="text-teal-300 font-mono">O(n)</strong>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        We perform exactly n multiplications, where n is the absolute value of the exponent.
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• Each iteration: 1 multiplication operation</div>
                        <div>• Total iterations: |n| (absolute value of n)</div>
                        <div>• For n=100: 100 multiplications</div>
                        <div>• For n=1,000: 1,000 multiplications</div>
                        <div>• Linear growth with exponent size</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity: O(1)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-green-500" />
                        <strong className="text-teal-300 font-mono">O(1) - Constant Space</strong>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        Uses only a fixed number of variables regardless of input size.
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• Single variable for result storage</div>
                        <div>• Loop counter variable</div>
                        <div>• Temporary variables for calculations</div>
                        <div>• No recursion or dynamic memory allocation</div>
                        <div>• Memory usage remains constant</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Analysis */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Gauge size={16} />
                    Performance Characteristics
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                      <div className="text-yellow-300 font-semibold mb-2">Advantages</div>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Simple and intuitive implementation</li>
                        <li>• Easy to understand and debug</li>
                        <li>• No special cases for edge conditions</li>
                        <li>• Good for small exponents (n &lt; 1000)</li>
                        <li>• Predictable performance</li>
                      </ul>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                      <div className="text-red-300 font-semibold mb-2">Limitations</div>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Becomes slow for large exponents</li>
                        <li>• Not suitable for n &gt; 10⁶</li>
                        <li>• Repeated multiplications are inefficient</li>
                        <li>• Does not leverage mathematical optimizations</li>
                        <li>• Poor scalability</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity: O(log n)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-green-500" />
                        <strong className="text-teal-300 font-mono">O(log n)</strong>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        We halve the exponent in each iteration, leading to logarithmic time complexity.
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• Each iteration: exponent divided by 2</div>
                        <div>• Total iterations: log₂(|n|)</div>
                        <div>• For n=1024: only 10 iterations needed</div>
                        <div>• For n=1,000,000: only 20 iterations needed</div>
                        <div>• Exponential speedup over brute force</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity: O(1)
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-green-500" />
                        <strong className="text-teal-300 font-mono">O(1) - Constant Space</strong>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        Uses a fixed number of variables with iterative approach.
                      </p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• Variables for base, exponent, result</div>
                        <div>• No recursion stack overhead</div>
                        <div>• No additional data structures</div>
                        <div>• Memory efficient for large exponents</div>
                        <div>• Same memory footprint as brute force</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Analysis */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Gauge size={16} />
                    Performance Characteristics
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                      <div className="text-green-300 font-semibold mb-2">Advantages</div>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Extremely efficient for large exponents</li>
                        <li>• Handles n up to 10¹⁸ efficiently</li>
                        <li>• Leverages binary representation</li>
                        <li>• Optimal for mathematical computations</li>
                        <li>• Industry standard for exponentiation</li>
                      </ul>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                      <div className="text-blue-300 font-semibold mb-2">Algorithm Insight</div>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Uses exponentiation by squaring</li>
                        <li>• Exploits binary representation of n</li>
                        <li>• Multiplies only when bit is set (odd exponent)</li>
                        <li>• Squares base in each iteration</li>
                        <li>• Halves exponent until it reaches 0</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Mathematical Insight */}
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                    <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      <Calculator size={16} />
                      Mathematical Foundation
                    </h5>
                    <div className="text-xs text-gray-400 space-y-2">
                      <p>
                        The algorithm uses the mathematical property: 
                        <code className="bg-gray-800 px-1 mx-1 rounded">xⁿ = (x²)ⁿᐟ²</code>
                        when n is even, and 
                        <code className="bg-gray-800 px-1 mx-1 rounded">xⁿ = x × (x²)⁽ⁿ⁻¹⁾ᐟ²</code>
                        when n is odd.
                      </p>
                      <p>
                        This reduces the problem size by half in each iteration, leading to 
                        logarithmic time complexity.
                      </p>
                      <p className="text-green-400">
                        Fast exponentiation is fundamental in cryptography, computer graphics, 
                        and scientific computing where large exponents are common.
                      </p>
                    </div>
                  </div>

                  {/* Performance Comparison */}
                  <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
                    <h5 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Performance Comparison
                    </h5>
                    <div className="text-xs text-gray-400 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="font-bold">Exponent (n)</div>
                        <div className="font-bold">Brute Force</div>
                        <div className="font-bold">Fast Exponentiation</div>
                        <div>1,024</div>
                        <div>1,024 operations</div>
                        <div className="text-green-400">10 operations</div>
                        <div>1,000,000</div>
                        <div>1,000,000 operations</div>
                        <div className="text-green-400">20 operations</div>
                        <div>1,000,000,000</div>
                        <div>1B operations</div>
                        <div className="text-green-400">30 operations</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-lg mb-4">
            Enter x and n values to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">x: base number</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">n: exponent</span>
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Supports negative exponents</span>
            </div>
            <p>
              <strong>Example:</strong> x: 2, n: 10 → Returns 1024
            </p>
            <p>
              <strong>Example with negative exponent:</strong> x: 2, n: -3 → Returns 0.125
            </p>
            <p>
              <strong>Large exponent example:</strong> x: 1.0001, n: 10000 → Fast exponentiation handles this efficiently
            </p>
            <p className="text-gray-500">
              Fast exponentiation uses the mathematical property: xⁿ = (x²)ⁿᐟ² when n is even, 
              reducing the problem size exponentially.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PowerPage;