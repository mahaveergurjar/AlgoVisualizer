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
  Type,
  Calculator,
  Grid,
  Layers,
  TrendingUp,
  Target,
  Gauge,
  Info,
  FileSpreadsheet,
} from "lucide-react";

const ExcelSheetColumnTitle = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [columnInput, setColumnInput] = useState("28");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback((columnNumber) => {
    const newHistory = [];
    let stepCount = 0;
    let currentColumn = columnNumber;
    let result = "";
    const operations = [];

    const addState = (props) => {
      newHistory.push({
        columnNumber,
        currentColumn,
        result,
        operations: [...operations],
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting conversion: Column ${columnNumber} to Excel title`,
      operation: "initialize",
    });

    let iteration = 0;
    while (currentColumn > 0) {
      addState({
        line: 5,
        explanation: `Iteration ${iteration + 1}: Current column number is ${currentColumn}`,
        operation: "check_condition",
        iteration,
      });

      const beforeDecrement = currentColumn;
      currentColumn--;
      
      addState({
        line: 6,
        currentColumn,
        explanation: `Decrement: ${beforeDecrement} - 1 = ${currentColumn} (adjust for 0-based indexing)`,
        operation: "decrement",
        iteration,
        beforeDecrement,
      });

      const remainder = currentColumn % 26;
      const letter = String.fromCharCode(remainder + 65); // 65 is 'A'
      
      operations.push({
        iteration,
        beforeDecrement,
        afterDecrement: currentColumn,
        remainder,
        letter,
        beforeResult: result,
      });

      addState({
        line: 7,
        currentColumn,
        remainder,
        letter,
        explanation: `Calculate: ${currentColumn} % 26 = ${remainder}, which maps to '${letter}' (ASCII ${remainder + 65})`,
        operation: "calculate_char",
        iteration,
      });

      result = letter + result;

      addState({
        line: 7,
        result,
        explanation: `Prepend '${letter}' to result: "${result}"`,
        operation: "prepend_char",
        iteration,
      });

      const beforeDivision = currentColumn;
      currentColumn = Math.floor(currentColumn / 26);

      addState({
        line: 8,
        currentColumn,
        explanation: `Divide: floor(${beforeDivision} / 26) = ${currentColumn}`,
        operation: "divide",
        iteration,
        beforeDivision,
      });

      iteration++;
    }

    addState({
      line: 11,
      result,
      explanation: `Conversion complete! Column ${columnNumber} = "${result}"`,
      operation: "complete",
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
    const column = parseInt(columnInput, 10);

    if (isNaN(column) || column < 1) {
      alert("Please enter a valid positive integer (1 or greater)");
      return;
    }

    if (column > 1000000) {
      if (!confirm(`Column ${column} is very large. Continue?`)) {
        return;
      }
    }

    generateHistory(column);
  };

  const generateRandomInput = () => {
    const random = Math.floor(Math.random() * 702) + 1; // 1 to 702 (covers A to ZZ)
    setColumnInput(random.toString());
    resetVisualization();
  };

  const generatePresetInput = (value) => {
    setColumnInput(value.toString());
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
      check_condition: "Check Loop",
      decrement: "Decrement",
      calculate_char: "Calculate Character",
      prepend_char: "Prepend to Result",
      divide: "Divide by 26",
      complete: "Complete",
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
    { line: 1, content: 'string convertToTitle(int columnNumber) {' },
    { line: 2, content: '    string res = "";' },
    { line: 3, content: '' },
    { line: 4, content: '    while(columnNumber > 0){' },
    { line: 5, content: '        columnNumber--;' },
    { line: 6, content: '        res = char((columnNumber % 26) + \'A\') + res;' },
    { line: 7, content: '        columnNumber /= 26;' },
    { line: 8, content: '    }' },
    { line: 9, content: '' },
    { line: 10, content: '    return res;' },
    { line: 11, content: '}' },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-green-400 flex items-center justify-center gap-3">
          <FileSpreadsheet size={28} />
          Excel Sheet Column Title
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Convert column number to Excel column title (LeetCode #168)
        </p>
      </header>

      {/* Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="column-input" className="font-medium text-gray-300 font-mono">
              Column Number:
            </label>
            <input
              id="column-input"
              type="number"
              min="1"
              value={columnInput}
              onChange={(e) => setColumnInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 28"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadVisualization}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomInput}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
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
              { num: 1, title: "A" },
              { num: 26, title: "Z" },
              { num: 27, title: "AA" },
              { num: 28, title: "AB" },
              { num: 52, title: "AZ" },
              { num: 701, title: "ZY" },
              { num: 702, title: "ZZ" },
            ].map(({ num, title }) => (
              <button
                key={num}
                onClick={() => generatePresetInput(num)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
              >
                {num} → {title}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
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
          </div>

          {/* Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversion Progress */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Calculator size={20} />
                Conversion Progress
                <span className="text-sm text-gray-400 ml-2">
                  Converting {state.columnNumber}
                </span>
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Current State Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-lg border border-blue-700/50">
                    <div className="text-sm text-blue-300 mb-1">Column Number</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.currentColumn !== undefined ? state.currentColumn : state.columnNumber}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 rounded-lg border border-purple-700/50">
                    <div className="text-sm text-purple-300 mb-1">Remainder</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.remainder !== undefined ? state.remainder : "-"}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 rounded-lg border border-green-700/50">
                    <div className="text-sm text-green-300 mb-1">Current Letter</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {state.letter || "-"}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 p-4 rounded-lg border border-amber-700/50">
                    <div className="text-sm text-amber-300 mb-1">Operation</div>
                    <div className="text-sm font-bold text-white">
                      {getOperationDisplay(state.operation)}
                    </div>
                  </div>
                </div>

                {/* Building Result String */}
                <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-4 rounded-lg border border-gray-700/50 w-full max-w-2xl">
                  <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Type size={16} />
                    Building Result: "{state.result || ""}"
                  </h4>
                  <div className="flex gap-2 justify-center flex-wrap min-h-12 items-center">
                    {state.result ? (
                      state.result.split('').map((char, index) => (
                        <div
                          key={index}
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all ${
                            index === state.result.length - 1 && state.operation === "prepend_char"
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400 scale-110"
                              : "bg-gray-700 border-gray-600 text-white"
                          }`}
                        >
                          {char}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">Empty string</div>
                    )}
                  </div>
                </div>

                {/* Step Explanation */}
                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-lg border border-blue-700/50 w-full max-w-2xl">
                  <h4 className="font-semibold text-blue-300 mb-3">Current Step Details</h4>
                  <div className="space-y-2 text-sm">
                    {state.operation === "decrement" && (
                      <div className="font-mono text-yellow-400">
                        {state.beforeDecrement} - 1 = {state.currentColumn} (0-based adjustment)
                      </div>
                    )}
                    {state.operation === "calculate_char" && (
                      <div className="font-mono text-green-400">
                        {state.currentColumn} % 26 = {state.remainder} → '{state.letter}' (ASCII {state.remainder + 65})
                      </div>
                    )}
                    {state.operation === "divide" && (
                      <div className="font-mono text-blue-400">
                        floor({state.beforeDivision} / 26) = {state.currentColumn}
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations History */}
                {state.operations && state.operations.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-4 rounded-lg border border-purple-700/50 w-full max-w-2xl">
                    <h4 className="font-semibold text-purple-300 mb-3">Operations History</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                      {state.operations.map((op, idx) => (
                        <div key={idx} className="text-xs font-mono bg-gray-900/50 p-2 rounded border border-gray-700">
                          <div className="text-gray-400">Step {op.iteration + 1}:</div>
                          <div className="text-white">
                            {op.beforeDecrement} → {op.afterDecrement} % 26 = {op.remainder} → '{op.letter}'
                          </div>
                          <div className="text-green-400">
                            Result: "{op.beforeResult}" → "{op.letter}{op.beforeResult}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      "{state.result}"
                    </div>
                    <div className="text-gray-300 text-sm">
                      Column {state.columnNumber} = "{state.result}"
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Conversion in progress...
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

          {/* Algorithm Explanation */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Info size={20} /> How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 flex items-center gap-2">
                  <Hash size={16} />
                  Algorithm Overview
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-3">
                  <p className="text-gray-300">
                    Excel columns work like a base-26 numbering system, but with a twist: there's no zero!
                  </p>
                  <div className="text-gray-400 space-y-2">
                    <div>• A = 1, B = 2, ..., Z = 26</div>
                    <div>• AA = 27, AB = 28, ..., AZ = 52</div>
                    <div>• BA = 53, ..., ZZ = 702</div>
                  </div>
                  <p className="text-yellow-300 font-semibold">
                    Key insight: We decrement before calculating remainder because Excel is 1-indexed, not 0-indexed!
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 flex items-center gap-2">
                  <Calculator size={16} />
                  Step-by-Step Process
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <ol className="text-gray-400 space-y-2 list-decimal list-inside">
                    <li><strong className="text-white">Decrement:</strong> Subtract 1 to convert to 0-based indexing</li>
                    <li><strong className="text-white">Calculate:</strong> Get remainder when divided by 26</li>
                    <li><strong className="text-white">Convert:</strong> Map remainder (0-25) to letter (A-Z)</li>
                    <li><strong className="text-white">Prepend:</strong> Add letter to the front of result</li>
                    <li><strong className="text-white">Divide:</strong> Integer divide by 26 for next iteration</li>
                    <li><strong className="text-white">Repeat:</strong> Continue until number becomes 0</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Time Complexity: O(log₂₆ n)
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 mb-2">
                    We divide the column number by 26 in each iteration, similar to base conversion algorithms.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Each iteration reduces the number by ~26x</div>
                    <div>• For n=1,000: approximately 3 iterations</div>
                    <div>• For n=1,000,000: approximately 5 iterations</div>
                    <div>• Logarithmic growth with respect to column number</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 flex items-center gap-2">
                  <Layers size={16} />
                  Space Complexity: O(log₂₆ n)
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 mb-2">
                    The result string grows proportionally to the number of digits in base-26 representation.
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• String length = number of letters needed</div>
                    <div>• 1-26 (A-Z): 1 character</div>
                    <div>• 27-702 (AA-ZZ): 2 characters</div>
                    <div>• 703-18,278 (AAA-ZZZ): 3 characters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-lg mb-4">
            Enter a column number to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Column: positive integer</span>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Result: Excel title (A-ZZZ...)</span>
            </div>
            <p>
              <strong>Example:</strong> 1 → "A", 26 → "Z", 27 → "AA"
            </p>
            <p>
              <strong>Example:</strong> 28 → "AB", 701 → "ZY", 702 → "ZZ"
            </p>
            <p>
              <strong>Large number:</strong> 16384 → "XFD" (last column in Excel 2007+)
            </p>
            <p className="text-gray-500">
              This algorithm converts numbers to Excel column titles using base-26 conversion with 1-based indexing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelSheetColumnTitle;