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
  Grid,
  Target,
  Search,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Hash,
  ChevronRight,
  ChevronLeft,
  XCircle,
} from "lucide-react";

// Enhanced Pointer Component
const Pointer = ({ index, containerId, color, label, isFound = false }) => {
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
    blue: { bg: "bg-blue-500", text: "text-blue-500", glow: "shadow-blue-500/50" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", glow: "shadow-purple-500/50" },
    green: { bg: "bg-green-500", text: "text-green-500", glow: "shadow-green-500/50" },
    amber: { bg: "bg-amber-500", text: "text-amber-500", glow: "shadow-amber-500/50" },
  };

  return (
    <div
      className="absolute transition-all duration-500 ease-out z-20 animate-pulse"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="relative">
        <div
          className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${colors[color].bg} ${isFound ? 'animate-bounce' : ''}`}
          style={{ 
            borderBottomColor: color === "blue" ? "#3b82f6" : 
                             color === "purple" ? "#a855f7" : 
                             color === "green" ? "#22c55e" : "#f59e0b"
          }}
        />
        {isFound && (
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-spin" />
        )}
      </div>
      <div
        className={`text-xs font-bold mt-1 text-center px-2 py-1 rounded-full bg-gray-900/90 backdrop-blur-sm border ${colors[color].text} border-current ${colors[color].glow} shadow-lg whitespace-nowrap`}
      >
        {label}
        {isFound && " 🎉"}
      </div>
    </div>
  );
};

// Main Component
const SpecialArrayVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numbersInput, setNumbersInput] = useState("3, 5, 0, 0, 0, 0, 4");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localNumbers = numbersInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    if (localNumbers.length === 0) {
      alert("Invalid input. Please enter non-negative integers.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;

    const addState = (explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        numbers: [...localNumbers],
        step: stepCount++,
        explanation,
        line,
        ...extraProps,
      });
    };

    // Initial setup
    addState(`Finding special value x where exactly x numbers are ≥ x`, 1, {
      phase: "init"
    });
    addState(`Array: [${localNumbers.join(", ")}]`, 2, {
      phase: "init"
    });
    addState(`Array length: ${localNumbers.length}. Will check x from 0 to ${localNumbers.length}`, 3, {
      phase: "init"
    });

    // Sort array for easier counting
    const sortedNumbers = [...localNumbers].sort((a, b) => a - b);
    addState(`Sorting array for easier analysis: [${sortedNumbers.join(", ")}]`, 4, {
      phase: "sort",
      sortedArray: sortedNumbers
    });

    let result = -1;
    let foundX = false;

    // Check each possible value of x
    for (let x = 0; x <= localNumbers.length; x++) {
      addState(`Checking if x = ${x} is the special value`, 5, {
        phase: "checking",
        currentX: x,
        sortedArray: sortedNumbers
      });

      // Count how many numbers are >= x
      let count = 0;
      const highlightedIndices = [];
      
      for (let i = 0; i < sortedNumbers.length; i++) {
        if (sortedNumbers[i] >= x) {
          count++;
          highlightedIndices.push(i);
        }
      }

      addState(
        `Counting numbers ≥ ${x}: Found ${count} number${count !== 1 ? 's' : ''}`,
        6,
        {
          phase: "counting",
          currentX: x,
          count: count,
          sortedArray: sortedNumbers,
          highlightedIndices: highlightedIndices
        }
      );

      if (count === x) {
        result = x;
        foundX = true;
        addState(
          `✓ Found it! Count (${count}) equals x (${x})`,
          7,
          {
            phase: "found",
            currentX: x,
            count: count,
            result: x,
            sortedArray: sortedNumbers,
            highlightedIndices: highlightedIndices,
            isSuccess: true
          }
        );
        break;
      } else {
        addState(
          `✗ Not special: Count (${count}) ≠ x (${x})`,
          8,
          {
            phase: "not-match",
            currentX: x,
            count: count,
            sortedArray: sortedNumbers,
            highlightedIndices: highlightedIndices,
            isFailure: true
          }
        );
      }
    }

    if (!foundX) {
      addState(
        `No special value found. Return -1`,
        9,
        {
          phase: "complete",
          result: -1,
          sortedArray: sortedNumbers,
          noResult: true
        }
      );
    } else {
      addState(
        `RESULT: ${result} is the special value`,
        10,
        {
          phase: "complete",
          result: result,
          sortedArray: sortedNumbers,
          isComplete: true
        }
      );
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [numbersInput]);

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

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const goToStart = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentStep(history.length - 1);
  }, [history.length]);

  const generateRandomInput = () => {
    const length = Math.floor(Math.random() * 6) + 4; // 4-9 numbers
    const numbers = [];
    
    for (let i = 0; i < length; i++) {
      numbers.push(Math.floor(Math.random() * 12)); // 0-11
    }
    
    setNumbersInput(numbers.join(', '));
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLoaded) return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          stepBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case " ":
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case "Home":
          e.preventDefault();
          goToStart();
          break;
        case "End":
          e.preventDefault();
          goToEnd();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepBackward, stepForward, goToStart, goToEnd]);

  const state = history[currentStep] || {};
  const {
    numbers = [],
    line,
    explanation = "",
    phase = "init",
    currentX = null,
    count = null,
    result = null,
    sortedArray = [],
    highlightedIndices = [],
    isSuccess = false,
    isFailure = false,
    isComplete = false,
    noResult = false,
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false }) => (
    <div
      className={`block rounded-lg transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]"
          : "border-transparent hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={`font-mono ${isActive ? "text-blue-300 font-bold" : "text-gray-300"}`}>
        {content}
      </span>
    </div>
  );

  const specialArrayCode = [
    { line: 1, content: "int specialArray(vector<int>& nums) {" },
    { line: 2, content: "    int n = nums.size();" },
    { line: 3, content: "    " },
    { line: 4, content: "    for (int x = 0; x <= n; x++) {" },
    { line: 5, content: "        int count = 0;" },
    { line: 6, content: "        " },
    { line: 7, content: "        for (int num : nums) {" },
    { line: 8, content: "            if (num >= x) count++;" },
    { line: 9, content: "        }" },
    { line: 10, content: "        " },
    { line: 11, content: "        if (count == x) return x;" },
    { line: 12, content: "    }" },
    { line: 13, content: "    " },
    { line: 14, content: "    return -1;" },
    { line: 15, content: "}" },
  ];

  const getCellColor = (num, index) => {
    if (phase === "counting" || phase === "found" || phase === "not-match") {
      if (highlightedIndices.includes(index)) {
        if (isSuccess) {
          return "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-2 border-green-400 shadow-lg shadow-green-500/50 scale-110";
        } else if (isFailure) {
          return "bg-gradient-to-br from-red-500 to-rose-600 text-white border-2 border-red-400 shadow-lg shadow-red-500/50";
        }
        return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/50 scale-105";
      }
    }
    
    return "bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 text-gray-300";
  };

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-4">
          Special Array with X Elements
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          LeetCode #1608 - Find x where exactly x numbers are greater than or equal to x
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">O(n²) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30">
            <Hash className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Counting Algorithm</span>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 mb-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-grow w-full">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Grid className="inline w-4 h-4 mr-2" />
                Array (non-negative integers)
              </label>
              <input
                type="text"
                value={numbersInput}
                onChange={(e) => setNumbersInput(e.target.value)}
                disabled={isLoaded}
                placeholder="e.g., 3, 5, 0, 0, 0, 0, 4"
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomInput}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Random
                </button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button onClick={goToStart} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer">
                    <SkipBack className="h-5 w-5" />
                  </button>
                  <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {!isPlaying ? (
                    <button onClick={playAnimation} disabled={currentStep >= history.length - 1} className="bg-purple-500 hover:bg-purple-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer">
                      <Play className="h-5 w-5" />
                    </button>
                  ) : (
                    <button onClick={pauseAnimation} className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-xl transition-all duration-300 cursor-pointer">
                      <Pause className="h-5 w-5" />
                    </button>
                  )}

                  <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button onClick={goToEnd} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer">
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <select value={speed} onChange={handleSpeedChange} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer">
                    <option value={2000}>Slow</option>
                    <option value={1000}>Medium</option>
                    <option value={500}>Fast</option>
                  </select>

                  <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                    <div className="text-purple-400 font-bold">{currentStep + 1}</div>
                    <div className="text-gray-400 text-xs">of {history.length}</div>
                  </div>
                </div>

                <button onClick={resetVisualization} className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-500/25 cursor-pointer">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          {/* Code Panel */}
          <div className="xl:col-span-1 bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-purple-400 flex items-center gap-3">
                <Code className="h-6 w-6" />
                Algorithm Code
              </h3>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="overflow-y-auto max-h-96">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {specialArrayCode.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className={`backdrop-blur-sm p-4 rounded-xl border ${
                result === -1 && isComplete 
                  ? "bg-gradient-to-br from-red-900/40 to-pink-900/40 border-red-700/50" 
                  : "bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-700/50"
              }`}>
                <h3 className="font-bold text-lg text-purple-300 mb-2 flex items-center gap-2">
                  {result === -1 && isComplete ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  Result
                </h3>
                <div className={`font-mono text-2xl font-bold text-center ${
                  result === -1 && isComplete ? "text-red-400" : "text-purple-400"
                }`}>
                  {result !== null ? result : "?"}
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">
                  {result !== null ? (result === -1 ? "No special value" : "Special value found") : "Searching..."}
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3 mb-8">
                <Grid className="h-6 w-6 text-purple-400" />
                Array Visualization
              </h3>
              
              <div className="space-y-8">
                {/* Current Status */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentX !== null && (
                    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-700/50">
                      <div className="text-sm text-gray-400 mb-1">Testing x</div>
                      <div className="font-mono text-3xl font-bold text-purple-400">{currentX}</div>
                    </div>
                  )}
                  {count !== null && (
                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4 rounded-xl border border-blue-700/50">
                      <div className="text-sm text-gray-400 mb-1">Count (≥ {currentX})</div>
                      <div className="font-mono text-3xl font-bold text-blue-400">{count}</div>
                    </div>
                  )}
                  {currentX !== null && count !== null && (
                    <div className={`p-4 rounded-xl border ${
                      isSuccess 
                        ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700/50" 
                        : isFailure
                        ? "bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-700/50"
                        : "bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/50"
                    }`}>
                      <div className="text-sm text-gray-400 mb-1">Match?</div>
                      <div className={`font-mono text-2xl font-bold ${
                        isSuccess ? "text-green-400" : isFailure ? "text-red-400" : "text-gray-400"
                      }`}>
                        {isSuccess ? "✓ Yes" : isFailure ? "✗ No" : "—"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Original Array */}
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
                  <h4 className="text-sm font-semibold text-gray-400 mb-4">Original Array</h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {numbers.map((num, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 rounded-xl border-2 border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xl text-gray-300 transition-all duration-500"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sorted Array Visualization */}
                {sortedArray.length > 0 && (
                  <div className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50" id="array-container">
                    <h4 className="text-sm font-semibold text-gray-400 mb-4">
                      Sorted Array {phase === "counting" || phase === "found" || phase === "not-match" ? `(Numbers ≥ ${currentX} highlighted)` : ""}
                    </h4>
                    
                    <div className="flex gap-3 mb-4 justify-center flex-wrap">
                      {sortedArray.map((_, index) => (
                        <div key={index} className="w-16 text-center">
                          <div className="text-xs text-gray-500 font-mono mb-2">i={index}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 justify-center flex-wrap">
                      {sortedArray.map((num, index) => (
                        <div
                          key={index}
                          id={`array-container-element-${index}`}
                          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 ${getCellColor(num, index)}`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className={`p-6 rounded-2xl border ${
                  isSuccess 
                    ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700/50" 
                    : isFailure
                    ? "bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-700/50"
                    : "bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-700/50"
                }`}>
                  <h3 className="font-bold text-xl text-purple-300 mb-4 flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    Step Explanation
                  </h3>
                  <div className="text-gray-200 text-sm leading-relaxed">
                    {explanation}
                  </div>
                  {isComplete && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      result === -1 
                        ? "bg-red-500/20 border-red-500/30" 
                        : "bg-green-500/20 border-green-500/30"
                    }`}>
                      <div className={`text-sm font-semibold flex items-center gap-2 ${
                        result === -1 ? "text-red-300" : "text-green-300"
                      }`}>
                        {result === -1 ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        {result === -1 ? "No Special Value Exists!" : "Special Value Found!"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Algorithm Analysis */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-2xl text-purple-400 mb-6 flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                Algorithm Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-300 text-lg">Key Concepts</h4>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-blue-300 block mb-2">Brute Force Approach</strong>
                    <p className="text-gray-400 text-sm">
                      Test each possible value of x from 0 to n, counting how many numbers are ≥ x.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-blue-300 block mb-2">Special Condition</strong>
                    <p className="text-gray-400 text-sm">
                      A value x is special when exactly x numbers in the array are greater than or equal to x.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-300 text-lg">Optimization</h4>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-blue-300 block mb-2">Sorting Strategy</strong>
                    <p className="text-gray-400 text-sm">
                      Sort the array first to optimize counting with binary search - O(n log n) time.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-blue-300 block mb-2">Early Termination</strong>
                    <p className="text-gray-400 text-sm">
                      Return immediately when we find x where count equals x.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-5 rounded-xl border border-blue-700/30">
                <h4 className="font-semibold text-blue-300 text-base mb-3">Example Walkthrough</h4>
                <div className="text-gray-400 text-sm space-y-2">
                  <p><strong className="text-blue-300">Array:</strong> [3, 5, 0, 0, 0, 0, 4]</p>
                  <p><strong className="text-blue-300">When x = 3:</strong> Numbers ≥ 3 are 3, 5, 4 → count = 3 ✓</p>
                  <p><strong className="text-purple-300">Result:</strong> 3 is the special value!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-gray-400 text-lg mb-6">
              🎯 Ready to find the Special Array value?
            </div>
            <div className="text-gray-500 text-sm mb-8">
              Enter an array of non-negative integers to find the special value x.
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 text-left">
              <div className="text-purple-400 font-mono text-sm mb-2">💡 Example:</div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>Array: <span className="text-purple-300 font-mono">[3, 5, 0, 0, 0, 0, 4]</span></div>
                <div className="text-gray-500 text-xs mt-2">→ When x = 3: exactly 3 numbers (3, 5, 4) are ≥ 3</div>
                <div className="text-gray-500 text-xs">→ Returns 3 (special value found!)</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-purple-400 font-mono text-sm mb-2">💡 Another Example:</div>
                <div className="text-gray-400 text-sm space-y-1">
                  <div>Array: <span className="text-purple-300 font-mono">[0, 4, 3, 0, 4]</span></div>
                  <div className="text-gray-500 text-xs mt-2">→ No value x satisfies the condition</div>
                  <div className="text-gray-500 text-xs">→ Returns -1 (no special value)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialArrayVisualizer;