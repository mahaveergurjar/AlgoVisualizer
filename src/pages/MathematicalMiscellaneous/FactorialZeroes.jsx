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
  Hash,
  Calculator,
  Divide,
  TrendingUp,
  Target,
  Info,
  Zap,
  Cpu,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

const FactorialTrailingZeroes = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("25");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback((n) => {
    const newHistory = [];
    let stepCount = 0;
    let count = 0;
    let divisor = 5;
    const operations = [];

    const addState = (props) => {
      newHistory.push({
        n,
        count,
        divisor,
        operations: [...operations],
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 2,
      explanation: `Starting calculation: Finding trailing zeroes in ${n}!`,
      operation: "initialize",
    });

    addState({
      line: 3,
      count: 0,
      explanation: `Initialize count = 0. We'll count factors of 5 in ${n}!`,
      operation: "init_count",
    });

    let iteration = 0;
    while (Math.floor(n / divisor) >= 1) {
      addState({
        line: 4,
        divisor,
        explanation: `Iteration ${iteration + 1}: Check if ${n} / ${divisor} >= 1`,
        operation: "check_condition",
        iteration,
        conditionCheck: `${n} / ${divisor} = ${(n / divisor).toFixed(2)}`,
      });

      const contribution = Math.floor(n / divisor);
      const prevCount = count;
      count += contribution;

      operations.push({
        iteration,
        divisor,
        contribution,
        prevCount,
        newCount: count,
        calculation: `${n} / ${divisor} = ${contribution}`,
      });

      addState({
        line: 5,
        divisor,
        contribution,
        count,
        explanation: `Add ${n} / ${divisor} = ${contribution} to count. Count: ${prevCount} + ${contribution} = ${count}`,
        operation: "add_contribution",
        iteration,
      });

      const prevDivisor = divisor;
      
      // Check for overflow prevention
      if (divisor > Math.floor(Number.MAX_SAFE_INTEGER / 5)) {
        addState({
          line: 6,
          explanation: `Stopping: ${divisor} × 5 would cause overflow`,
          operation: "overflow_prevention",
          iteration,
        });
        break;
      }

      divisor *= 5;

      addState({
        line: 4,
        divisor,
        explanation: `Multiply divisor: ${prevDivisor} × 5 = ${divisor}`,
        operation: "multiply_divisor",
        iteration,
      });

      iteration++;
    }

    addState({
      line: 4,
      explanation: `Loop ends: ${n} / ${divisor} = ${(n / divisor).toFixed(2)} < 1`,
      operation: "loop_end",
    });

    addState({
      line: 7,
      count,
      explanation: `Final result: ${n}! has ${count} trailing zeroes`,
      operation: "return",
      finalStep: true,
    });

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
    const n = parseInt(nInput, 10);

    if (isNaN(n) || n < 0) {
      alert("Please enter a valid non-negative integer");
      return;
    }

    if (n > 10000) {
      if (!confirm(`n = ${n} is quite large. Continue?`)) {
        return;
      }
    }

    generateHistory(n);
  };

  const generateRandomInput = () => {
    const random = Math.floor(Math.random() * 100) + 1;
    setNInput(random.toString());
    resetVisualization();
  };

  const generatePresetInput = (value) => {
    setNInput(value.toString());
    resetVisualization();
  };

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

  const getOperationDisplay = (operation) => {
    const operationMap = {
      initialize: "Initialize",
      init_count: "Init Count",
      check_condition: "Check Loop",
      add_contribution: "Add Contribution",
      multiply_divisor: "Multiply Divisor",
      loop_end: "Loop End",
      overflow_prevention: "Overflow Check",
      return: "Return Result",
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

  const code = [
    { line: 1, content: 'int trailingZeroes(int n) {' },
    { line: 2, content: '    int count = 0;' },
    { line: 3, content: '    for(int i=5; n/i >= 1; i *= 5){' },
    { line: 4, content: '        count += n/i;' },
    { line: 5, content: '    }' },
    { line: 6, content: '    return count;' },
    { line: 7, content: '}' },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <Hash size={28} />
          Factorial Trailing Zeroes
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find the number of trailing zeroes in n! (LeetCode #172)
        </p>
      </header>

      {/* Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="n-input" className="font-medium text-gray-300 font-mono">
              n:
            </label>
            <input
              id="n-input"
              type="number"
              min="0"
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 25"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadVisualization}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomInput}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random
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

      {/* Preset Examples */}
      {!isLoaded && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-700/50 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Examples:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { n: 5, zeros: 1 },
              { n: 10, zeros: 2 },
              { n: 25, zeros: 6 },
              { n: 30, zeros: 7 },
              { n: 100, zeros: 24 },
              { n: 125, zeros: 31 },
              { n: 1000, zeros: 249 },
            ].map(({ n, zeros }) => (
              <button
                key={n}
                onClick={() => generatePresetInput(n)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
              >
                {n}! → {zeros} zeros
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Algorithm Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {code.map((codeLine) => (
                    <CodeLine 
                      key={codeLine.line} 
                      lineNum={codeLine.line} 
                      content={codeLine.content}
                    />
                  ))}
                </code>
              </pre>
            </div>

            {/* Key Insight Box */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300">
                  <div className="font-semibold text-blue-300 mb-1">Key Insight:</div>
                  <p>Trailing zeros come from factors of 10, which is 2 × 5. Since there are always more factors of 2 than 5 in n!, we only need to count factors of 5!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calculation Progress */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Calculator size={20} />
                Counting Process
                <span className="text-sm text-gray-400 ml-2">
                  Finding trailing zeros in {state.n}!
                </span>
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Current State Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-lg border border-blue-700/50">
                    <div className="text-sm text-blue-300 mb-1">n</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.n}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 rounded-lg border border-purple-700/50">
                    <div className="text-sm text-purple-300 mb-1">Divisor (5ⁱ)</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.divisor || "-"}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 rounded-lg border border-green-700/50">
                    <div className="text-sm text-green-300 mb-1">Total Count</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.count !== undefined ? state.count : 0}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 p-4 rounded-lg border border-amber-700/50">
                    <div className="text-sm text-amber-300 mb-1">Operation</div>
                    <div className="text-sm font-bold text-white">
                      {getOperationDisplay(state.operation)}
                    </div>
                  </div>
                </div>

                {/* Current Calculation */}
                {state.contribution !== undefined && (
                  <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-4 rounded-lg border border-gray-700/50 w-full max-w-2xl">
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Divide size={16} />
                      Current Calculation
                    </h4>
                    <div className="space-y-2 font-mono text-lg">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-blue-400">{state.n}</span>
                        <span className="text-gray-500">÷</span>
                        <span className="text-purple-400">{state.divisor}</span>
                        <span className="text-gray-500">=</span>
                        <span className="text-green-400 font-bold">{state.contribution}</span>
                      </div>
                      <div className="text-sm text-gray-400 text-center">
                        Contributing {state.contribution} to the count
                      </div>
                    </div>
                  </div>
                )}

                {/* Powers of 5 Visualization */}
                {state.operations && state.operations.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 rounded-lg border border-purple-700/50 w-full max-w-2xl">
                    <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                      <Zap size={16} />
                      Powers of 5 Breakdown
                    </h4>
                    <div className="space-y-2">
                      {state.operations.map((op, idx) => (
                        <div 
                          key={idx} 
                          className={`font-mono text-sm p-3 rounded-lg border transition-all ${
                            idx === state.iteration && state.operation === "add_contribution"
                              ? "bg-green-500/20 border-green-500/50"
                              : "bg-gray-900/50 border-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-gray-400">
                              <span className="text-purple-400 font-semibold">5^{idx + 1}</span> = {op.divisor}:
                            </div>
                            <div className="text-white">
                              {state.n} ÷ {op.divisor} = <span className="text-green-400 font-bold">{op.contribution}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-700/50 text-sm">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-purple-300">Total Sum:</span>
                        <span className="text-green-400 font-bold text-lg">
                          {state.operations.reduce((sum, op) => sum + op.contribution, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Counter */}
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 rounded-lg border border-green-700/50 w-full max-w-2xl">
                  <h4 className="font-semibold text-green-300 mb-3">Running Total</h4>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {Array.from({ length: Math.min(state.count || 0, 50) }).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      >
                        0
                      </div>
                    ))}
                    {(state.count || 0) > 50 && (
                      <div className="text-gray-400 text-sm">
                        ... +{state.count - 50} more
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
              <div className="min-h-24 bg-gray-900/50 p-4 rounded-lg flex items-center justify-center">
                {state.finalStep ? (
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white font-mono mb-2">
                      {state.count}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {state.n}! has {state.count} trailing {state.count === 1 ? 'zero' : 'zeros'}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Calculation in progress...
                  </span>
                )}
              </div>
            </div>

            {/* Status Panel */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h3 className="font-bold text-lg text-gray-300 mb-3 flex items-center gap-2">
                <BarChart3 size={20} />
                Step Explanation
              </h3>
              <div className="text-gray-300 text-sm min-h-16 overflow-y-auto scrollbar-thin">
                {state.explanation || "Processing..."}
              </div>
            </div>
          </div>

          {/* Why This Works Section */}
          <div className="lg:col-span-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-blue-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-blue-600/50 pb-3 flex items-center gap-2">
              <Info size={20} /> Mathematical Insight: Why Count Factors of 5?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <Target size={16} />
                  The Key Observation
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                  <p className="text-gray-300">
                    <strong className="text-white">Trailing zeros come from factors of 10 = 2 × 5</strong>
                  </p>
                  <div className="text-gray-400 space-y-2 text-xs">
                    <div>• In any factorial, we have <span className="text-green-400">many more factors of 2 than 5</span></div>
                    <div>• Every even number contributes at least one factor of 2</div>
                    <div>• But only every 5th number contributes a factor of 5</div>
                    <div>• Therefore, <span className="text-yellow-400">factors of 5 are the limiting factor!</span></div>
                  </div>
                  <p className="text-blue-300 font-semibold text-xs">
                    We only need to count how many times 5 appears as a factor in n!
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <Calculator size={16} />
                  Example: 25!
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="text-gray-400 space-y-2 text-xs font-mono">
                    <div className="text-purple-300 font-semibold mb-2">Multiples of powers of 5:</div>
                    <div>• <span className="text-blue-400">5¹ = 5</span>: Numbers 5, 10, 15, 20, 25 → <span className="text-green-400">25 ÷ 5 = 5</span></div>
                    <div>• <span className="text-blue-400">5² = 25</span>: Number 25 (extra factor) → <span className="text-green-400">25 ÷ 25 = 1</span></div>
                    <div>• <span className="text-blue-400">5³ = 125</span>: No numbers → <span className="text-green-400">25 ÷ 125 = 0</span></div>
                    <div className="pt-2 mt-2 border-t border-gray-700">
                      <span className="text-yellow-400">Total: 5 + 1 = 6 trailing zeros</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    Note: 25 = 5² contributes TWO factors of 5, so it's counted twice!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity: O(log₅ n)
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-green-500" />
                    <strong className="text-teal-300 font-mono">O(log₅ n)</strong>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    We divide by 5 in each iteration, so the loop runs log₅(n) times.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Each iteration: multiply divisor by 5</div>
                    <div>• Loop continues while n/divisor ≥ 1</div>
                    <div>• For n=25: 2 iterations (5, 25)</div>
                    <div>• For n=125: 3 iterations (5, 25, 125)</div>
                    <div>• For n=1000: approximately 4 iterations</div>
                    <div>• Logarithmic growth with base 5</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity: O(1)
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-green-500" />
                    <strong className="text-teal-300 font-mono">O(1) - Constant Space</strong>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    Uses only a fixed number of variables regardless of input size.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Variable for count accumulator</div>
                    <div>• Variable for current divisor (powers of 5)</div>
                    <div>• No recursion or auxiliary data structures</div>
                    <div>• Memory usage remains constant</div>
                    <div>• Extremely space-efficient solution</div>
                  </div>
                </div>
              </div>

              {/* Performance Characteristics */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Algorithm Efficiency
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                    <div className="text-green-300 font-semibold mb-2">Advantages</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Extremely fast - no need to calculate n!</li>
                      <li>• Works for very large n (up to 10⁹)</li>
                      <li>• Avoids overflow issues from factorial calculation</li>
                      <li>• Mathematical insight reduces O(n) to O(log n)</li>
                      <li>• Minimal memory footprint</li>
                    </ul>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                    <div className="text-blue-300 font-semibold mb-2">Key Insight</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Counts factors of 5 at each power level</li>
                      <li>• n/5 gives multiples of 5</li>
                      <li>• n/25 gives multiples of 25 (extra 5)</li>
                      <li>• n/125 gives multiples of 125 (another 5)</li>
                      <li>• Continues until divisor exceeds n</li>
                    </ul>
                  </div>
                </div>
                
                {/* Comparison Table */}
                <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
                  <h5 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Why Not Calculate n! Directly?
                  </h5>
                  <div className="text-xs text-gray-400 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="font-bold">n</div>
                      <div className="font-bold">n! (approximate)</div>
                      <div className="font-bold">Our Algorithm</div>
                      <div>10</div>
                      <div className="text-red-400">3,628,800</div>
                      <div className="text-green-400">2 operations</div>
                      <div>100</div>
                      <div className="text-red-400">9.3 × 10¹⁵⁷</div>
                      <div className="text-green-400">4 operations</div>
                      <div>1000</div>
                      <div className="text-red-400">Massive overflow!</div>
                      <div className="text-green-400">5 operations</div>
                    </div>
                    <p className="text-yellow-300 mt-2">
                      Computing n! would overflow even for small values. Our algorithm elegantly sidesteps this problem!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-lg mb-4">
            Enter a value for n to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">n: non-negative integer</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Counts trailing zeros in n!</span>
            </div>
            <p>
              <strong>Example:</strong> n = 5 → 5! = 120 → 1 trailing zero
            </p>
            <p>
              <strong>Example:</strong> n = 25 → 25! has 6 trailing zeros
            </p>
            <p>
              <strong>Example:</strong> n = 100 → 100! has 24 trailing zeros
            </p>
            <p className="text-gray-500">
              The algorithm counts factors of 5 in n! since trailing zeros come from multiplying by 10 (2 × 5), and there are always more factors of 2 than 5.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactorialTrailingZeroes;