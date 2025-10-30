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
  Grid,
  Target,
  Gauge,
  Search,
  ArrowRight,
  AlertCircle,
  Sparkles,
  TrendingUp,
  MousePointer,
  Filter,
  List,
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
    red: { bg: "bg-red-500", text: "text-red-500", glow: "shadow-red-500/50" },
    green: { bg: "bg-green-500", text: "text-green-500", glow: "shadow-green-500/50" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", glow: "shadow-blue-500/50" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", glow: "shadow-purple-500/50" },
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
            borderBottomColor: color === "red" ? "#ef4444" : 
                             color === "green" ? "#10b981" : 
                             color === "blue" ? "#3b82f6" : "#a855f7"
          }}
        />
        {isFound && (
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300 animate-spin" />
        )}
      </div>
      <div
        className={`text-xs font-bold mt-1 text-center px-2 py-1 rounded-full bg-gray-900/90 backdrop-blur-sm border ${colors[color].text} border-current ${colors[color].glow} shadow-lg`}
      >
        {label}
        {isFound && " 🎉"}
      </div>
    </div>
  );
};

// Main Component
const KthMissingNumber = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("2, 3, 4, 7, 11");
  const [kInput, setKInput] = useState("5");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [searchStats, setSearchStats] = useState({ comparisons: 0, iterations: 0 });
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const k = parseInt(kInput, 10);

    if (localArray.some(isNaN) || isNaN(k)) {
      alert("Please enter valid numbers separated by commas for the array and a valid k value.");
      return;
    }

    if (localArray.length === 0) {
      alert("Array cannot be empty. Please enter some numbers.");
      return;
    }

    if (k <= 0) {
      alert("k must be a positive integer.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let comparisons = 0;
    let iterations = 0;

    const addState = (low, high, mid = null, missing = null, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        array: [...localArray],
        k,
        low,
        high,
        mid,
        missing,
        step: stepCount++,
        explanation,
        line,
        comparisons,
        iterations,
        ...extraProps,
      });
    };

    // Initial setup
    addState(0, localArray.length, null, null, "Starting Binary Search for Kth Missing Number", 1);
    addState(0, localArray.length, null, null, `Array size: ${localArray.length} elements, K = ${k}`, 2);
    addState(0, localArray.length, null, null, "Initialize: low = 0, high = array.length", 3);
    addState(0, localArray.length, null, null, "We'll use binary search to find the position where the kth missing number lies", 4);

    // Binary search algorithm
    let low = 0;
    let high = localArray.length;

    while (low < high) {
      iterations++;
      const mid = Math.floor(low + (high - low) / 2);
      const missing = localArray[mid] - (mid + 1);

      addState(low, high, mid, null, `Calculate mid = ${low} + (${high} - ${low}) / 2 = ${mid}`, 5);
      addState(low, high, mid, missing, `At index ${mid}, arr[${mid}] = ${localArray[mid]}. Missing numbers before this = ${localArray[mid]} - (${mid} + 1) = ${missing}`, 6);
      
      comparisons++;
      if (missing < k) {
        addState(low, high, mid, missing, `${missing} < ${k}: The kth missing number is after index ${mid}. Move right: low = mid + 1 = ${mid + 1}`, 7);
        low = mid + 1;
        addState(low, high, null, null, `Updated search range: low = ${low}, high = ${high}`, 8);
      } else {
        addState(low, high, mid, missing, `${missing} >= ${k}: The kth missing number is at or before index ${mid}. Move left: high = mid = ${mid}`, 9);
        high = mid;
        addState(low, high, null, null, `Updated search range: low = ${low}, high = ${high}`, 10);
      }
    }

    const result = low + k;
    addState(low, high, null, null, `Binary search complete! low = ${low}, high = ${high}`, 11);
    addState(low, high, null, null, `Result = low + k = ${low} + ${k} = ${result}`, 12, { result, isComplete: true });
    addState(low, high, null, null, `The ${k}th missing positive number is ${result}`, 13, { result, isComplete: true });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
    setSearchStats({ comparisons, iterations });
  }, [arrayInput, kInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
    setSearchStats({ comparisons: 0, iterations: 0 });
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

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 3) + 4; // 4-6 elements
    const array = [];
    let current = 2;
    
    for (let i = 0; i < length; i++) {
      array.push(current);
      current += Math.floor(Math.random() * 3) + 1; // Skip 1-3 numbers
    }
    
    const k = Math.floor(Math.random() * 8) + 3; // k between 3-10
    
    setArrayInput(array.join(', '));
    setKInput(k.toString());
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
        case "r":
        case "R":
          if (e.ctrlKey) {
            e.preventDefault();
            resetVisualization();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, isPlaying, stepBackward, stepForward, goToStart, goToEnd]);

  const state = history[currentStep] || {};
  const {
    array = [],
    k = 0,
    low = 0,
    high = 0,
    mid = null,
    missing = null,
    line,
    explanation = "",
    comparisons = 0,
    iterations = 0,
    result = null,
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
    <div
      className={`block rounded-lg transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]"
          : isHighlighted
          ? "bg-purple-500/10 border-purple-500/50"
          : "border-transparent hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={`font-mono ${isActive ? "text-blue-300 font-bold" : isHighlighted ? "text-purple-300" : "text-gray-300"}`}>
        {content}
      </span>
    </div>
  );

  const kthMissingCode = [
    { line: 1, content: "int findKthPositive(vector<int>& arr, int k) {" },
    { line: 2, content: "  int low = 0, high = arr.size();" },
    { line: 3, content: "  " },
    { line: 4, content: "  while (low < high) {" },
    { line: 5, content: "    int mid = low + (high - low) / 2;" },
    { line: 6, content: "    int missing = arr[mid] - (mid + 1);" },
    { line: 7, content: "    " },
    { line: 8, content: "    if (missing < k) {" },
    { line: 9, content: "      low = mid + 1;" },
    { line: 10, content: "    } else {" },
    { line: 11, content: "      high = mid;" },
    { line: 12, content: "    }" },
    { line: 13, content: "  }" },
    { line: 14, content: "  return low + k;" },
    { line: 15, content: "}" },
  ];

  const getCellColor = (index) => {
    if (index === mid) {
      return "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/50 scale-110";
    }
    
    if (index >= low && index < high) {
      if (index === low) {
        return "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-500 shadow-lg shadow-green-500/50";
      }
      if (index === high - 1) {
        return "bg-gradient-to-br from-red-500 to-pink-600 text-white border-red-500 shadow-lg shadow-red-500/50";
      }
      return "bg-blue-700/50 border-blue-500";
    }
    
    return "bg-gray-700/40 border-gray-600 opacity-50";
  };

  const getMissingSequence = () => {
    if (array.length === 0) return [];
    const maxNum = Math.max(...array, array[array.length - 1] + k + 5);
    const allNumbers = [];
    for (let i = 1; i <= maxNum; i++) {
      allNumbers.push({
        num: i,
        isMissing: !array.includes(i),
        isInArray: array.includes(i),
        isResult: i === result
      });
    }
    return allNumbers;
  };

  const missingSequence = getMissingSequence();
  const progressPercentage = history.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4">
          Kth Missing Positive Number
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Find the kth positive integer missing from a sorted array using{" "}
          <span className="text-blue-400 font-semibold">Binary Search optimization.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">O(log n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/30">
            <Search className="h-4 w-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">LeetCode #1539</span>
          </div>
        </div>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 mb-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-grow w-full">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Grid className="inline w-4 h-4 mr-2" />
                Array Elements (sorted)
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                disabled={isLoaded}
                placeholder="Enter sorted numbers separated by commas..."
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Filter className="inline w-4 h-4 mr-2" />
                K Value
              </label>
              <input
                type="number"
                value={kInput}
                onChange={(e) => setKInput(e.target.value)}
                disabled={isLoaded}
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 font-mono text-center"
                min="1"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomArray}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Random
                </button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={goToStart}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer tooltip"
                    title="Go to Start (Home)"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>
                  
                  {!isPlaying ? (
                    <button
                      onClick={playAnimation}
                      disabled={currentStep >= history.length - 1}
                      className="bg-blue-500 hover:bg-blue-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseAnimation}
                      className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToEnd}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer tooltip"
                    title="Go to End (End)"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-400 text-sm">Speed:</label>
                    <select
                      value={speed}
                      onChange={handleSpeedChange}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2000}>Slow</option>
                      <option value={1000}>Medium</option>
                      <option value={500}>Fast</option>
                      <option value={250}>Very Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                    <div className="text-blue-400 font-bold">{currentStep + 1}</div>
                    <div className="text-gray-400 text-xs">of {history.length}</div>
                  </div>
                </div>

                <button
                  onClick={resetVisualization}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-500/25 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoaded && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          {/* Code Panel */}
          <div className="xl:col-span-1 bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-blue-400 flex items-center gap-3">
                <Code className="h-6 w-6" />
                Algorithm Code
              </h3>
              <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                C++
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {kthMissingCode.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                        isHighlighted={[5, 6, 8, 9, 10, 11, 14].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-blue-400">{iterations}</div>
                <div className="text-xs text-gray-400">Iterations</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-purple-400">{comparisons}</div>
                <div className="text-xs text-gray-400">Comparisons</div>
              </div>
            </div>

            {/* Result Display */}
            {result !== null && (
              <div className="mt-6 bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Result Found!
                </div>
                <div className="text-center">
                  <div className="text-gray-300 text-sm mb-1">The {k}th missing number is</div>
                  <div className="text-4xl font-bold text-yellow-400 bg-gray-900/50 py-3 rounded-lg border border-yellow-500/30">
                    {result}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visualization Panels */}
          <div className="xl:col-span-2 space-y-8">
            {/* Array Visualization */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3">
                  <Grid className="h-6 w-6 text-blue-400" />
                  Binary Search Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                  {array.length} elements
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* K Value Display */}
                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-700/50 w-full max-w-md shadow-xl">
                  <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                    <Filter className="h-5 w-5 text-blue-400" />
                    Finding Kth Missing Number
                  </h4>
                  <div className="font-mono text-4xl font-bold text-center text-blue-400 bg-gray-900/50 py-4 rounded-xl border border-blue-700/30">
                    K = {k}
                  </div>
                </div>

                {/* Search Range Indicators */}
                <div className="w-full bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex justify-around text-sm">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">Low Pointer</div>
                      <div className="text-2xl font-bold text-green-400 bg-gray-800/50 px-4 py-2 rounded-lg">
                        {low}
                      </div>
                    </div>
                    {mid !== null && (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">Mid Pointer</div>
                        <div className="text-2xl font-bold text-purple-400 bg-gray-800/50 px-4 py-2 rounded-lg">
                          {mid}
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">High Pointer</div>
                      <div className="text-2xl font-bold text-red-400 bg-gray-800/50 px-4 py-2 rounded-lg">
                        {high}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Array Visualization */}
                <div className="w-full">
                  <div className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50" id="main-array-container">
                    {/* Column headers */}
                    <div className="flex gap-4 mb-4 justify-center">
                      {array.map((_, index) => (
                        <div key={index} className="w-20 text-center">
                          <div className="text-xs text-gray-500 font-mono mb-2">Index</div>
                          <div className="text-lg font-bold text-gray-400 bg-gray-800/50 rounded-lg py-1 px-3 border border-gray-600/50">
                            {index}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Array elements */}
                    <div className="flex gap-4 justify-center">
                      {array.map((num, index) => (
                        <div
                          key={index}
                          id={`main-array-container-element-${index}`}
                          className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} relative`}
                        >
                          {num}
                          {index === mid && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 animate-ping">
                              M
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pointers */}
                    {low < array.length && (
                      <Pointer
                        index={low}
                        containerId="main-array-container"
                        color="green"
                        label="Low"
                      />
                    )}
                    {mid !== null && mid < array.length && (
                      <Pointer
                        index={mid}
                        containerId="main-array-container"
                        color="purple"
                        label="Mid"
                      />
                    )}
                    {high > 0 && high - 1 < array.length && (
                      <Pointer
                        index={high - 1}
                        containerId="main-array-container"
                        color="red"
                        label="High"
                      />
                    )}
                  </div>
                </div>

                {/* Missing Count Display */}
                {missing !== null && mid !== null && (
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-700/50 w-full max-w-md shadow-xl">
                    <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                      <Calculator className="h-5 w-5 text-purple-400" />
                      Missing Count Calculation
                    </h4>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-700/30">
                        <div className="text-gray-400">At index {mid}:</div>
                        <div className="text-purple-300 text-lg mt-2">
                          missing = arr[{mid}] - ({mid} + 1)
                        </div>
                        <div className="text-purple-300 text-lg mt-1">
                          missing = {array[mid]} - {mid + 1} = <span className="text-purple-400 font-bold">{missing}</span>
                        </div>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-700/30">
                        <div className={`text-lg font-bold ${missing < k ? 'text-green-400' : 'text-red-400'}`}>
                          {missing} {missing < k ? '<' : '≥'} {k}
                        </div>
                        <div className="text-gray-400 mt-1">
                          {missing < k ? '→ Search right (low = mid + 1)' : '→ Search left (high = mid)'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Number Sequence Visualization */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-2xl text-gray-200 mb-6 flex items-center gap-3">
                <List className="h-6 w-6 text-indigo-400" />
                Complete Number Sequence
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {missingSequence.slice(0, 25).map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                      item.isResult
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white scale-110 shadow-lg shadow-yellow-500/50 animate-pulse'
                        : item.isInArray
                        ? 'bg-gray-700 text-gray-300 border border-gray-600'
                        : 'bg-red-900/30 border-2 border-red-500/50 text-red-400'
                    }`}
                  >
                    {item.num}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-6 h-6 bg-gray-700 border border-gray-600 rounded"></div>
                  <span>In array</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-6 h-6 bg-red-900/30 border-2 border-red-500/50 rounded"></div>
                  <span>Missing</span>
                </div>
                {result && (
                  <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded"></div>
                    <span>K={k} Result</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats and Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current State */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-cyan-700/50">
                <h3 className="font-bold text-xl text-cyan-300 mb-4 flex items-center gap-3">
                  <Gauge className="h-5 w-5" />
                  Current State
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-cyan-700/30">
                    <span className="text-gray-300">Low Index</span>
                    <span className="font-mono font-bold text-green-400 text-lg">{low}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-cyan-700/30">
                    <span className="text-gray-300">High Index</span>
                    <span className="font-mono font-bold text-red-400 text-lg">{high}</span>
                  </div>
                  {mid !== null && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-cyan-700/30">
                        <span className="text-gray-300">Mid Index</span>
                        <span className="font-mono font-bold text-purple-400 text-lg">{mid}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-cyan-700/30">
                        <span className="text-gray-300">Missing Count</span>
                        <span className="font-mono font-bold text-blue-400 text-lg">{missing}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Target K</span>
                    <span className="font-mono font-bold text-indigo-400 text-lg">{k}</span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-xl text-blue-300 mb-4 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  Step Explanation
                </h3>
                <div className="text-gray-200 text-sm leading-relaxed h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2">
                  {explanation.split('\n').map((line, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      {line}
                    </div>
                  ))}
                </div>
                {isComplete && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-green-300 text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Binary Search Completed!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Algorithm Analysis */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-2xl text-blue-400 mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6" />
                Algorithm Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-blue-300 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Key Insight
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                      <strong className="text-blue-300 block mb-2 text-sm">Missing Count Formula</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        At any index i, the count of missing numbers = arr[i] - (i + 1). This tells us how many positive integers are missing before arr[i].
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                      <strong className="text-blue-300 block mb-2 text-sm">Binary Search Logic</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        If missing count &lt; k, the kth missing number is to the right. Otherwise, it's to the left or at current position.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                      <strong className="text-blue-300 block mb-2 text-sm">Final Result</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        After binary search converges, the answer is simply low + k. This gives us the exact kth missing number.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-blue-300 text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-blue-300 block mb-2 text-sm">Time: O(log n)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Binary search divides the search space in half at each step. Much faster than O(n) linear approach.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-blue-300 block mb-2 text-sm">Space: O(1)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Only uses a constant amount of extra space for variables (low, high, mid, missing).
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-blue-300 block mb-2 text-sm">Optimization</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        This binary search approach is significantly more efficient than checking each number linearly, especially for large arrays.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700/50 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-gray-400 text-lg mb-6">
              🔍 Ready to find the Kth Missing Number?
            </div>
            <div className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enter a sorted array and a k value to see how binary search efficiently finds the kth missing positive integer.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-8">
              <div className="bg-blue-500/10 text-blue-300 px-4 py-2 rounded-full border border-blue-500/20 flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Click "Start Visualization" to begin
              </div>
              <div className="bg-indigo-500/10 text-indigo-300 px-4 py-2 rounded-full border border-indigo-500/20 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Use "Random" for quick examples
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 text-left">
              <div className="text-blue-400 font-mono text-sm mb-2">💡 Example Usage:</div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>Array: <span className="text-blue-300 font-mono">[2, 3, 4, 7, 11]</span></div>
                <div>K: <span className="text-indigo-300 font-mono">5</span></div>
                <div className="text-gray-500 text-xs mt-2">
                  → Missing numbers: 1, 5, 6, 8, 9, ...
                </div>
                <div className="text-gray-500 text-xs">
                  → 5th missing number is <span className="text-yellow-400 font-bold">9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KthMissingNumber;