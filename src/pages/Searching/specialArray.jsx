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
  List,
  Binary,
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
    amber: { bg: "bg-amber-500", text: "text-amber-500", glow: "shadow-amber-500/50" },
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
                             color === "blue" ? "#3b82f6" : 
                             color === "purple" ? "#a855f7" : "#f59e0b"
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
  const [arrayInput, setArrayInput] = useState("3, 5, 0, 2, 3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const nums = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);

    if (nums.some(isNaN)) {
      alert("Please enter valid numbers separated by commas for the array.");
      return;
    }

    if (nums.length === 0) {
      alert("Array cannot be empty. Please enter some numbers.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;

    const addState = (params = {}) => {
      newHistory.push({
        step: stepCount++,
        sortedArray: [...params.sortedArray] || [],
        currentX: params.currentX ?? -1,
        binarySearchActive: params.binarySearchActive ?? false,
        left: params.left ?? -1,
        right: params.right ?? -1,
        mid: params.mid ?? -1,
        firstIndex: params.firstIndex ?? -1,
        count: params.count ?? -1,
        explanation: params.explanation || "",
        line: params.line ?? null,
        isFound: params.isFound ?? false,
        result: params.result ?? null,
        originalArray: [...nums],
      });
    };

    // Initial state
    addState({
      sortedArray: nums,
      explanation: "Starting Special Array Algorithm",
      line: 1,
    });

    // Sort the array
    const sortedNums = [...nums].sort((a, b) => a - b);
    addState({
      sortedArray: sortedNums,
      explanation: `Sorted array: [${sortedNums.join(", ")}]`,
      line: 2,
    });

    const n = sortedNums.length;
    addState({
      sortedArray: sortedNums,
      explanation: `Array size n = ${n}`,
      line: 3,
    });

    // Binary search function
    const findNumberOfNums = (curNum) => {
      let left = 0;
      let right = n - 1;
      let firstIndex = n;
      const searchHistory = [];

      addState({
        sortedArray: sortedNums,
        currentX: curNum,
        binarySearchActive: true,
        left,
        right,
        explanation: `Binary search for first element >= ${curNum}`,
        line: 7,
      });

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        addState({
          sortedArray: sortedNums,
          currentX: curNum,
          binarySearchActive: true,
          left,
          right,
          mid,
          explanation: `Checking middle index ${mid}, value = ${sortedNums[mid]}`,
          line: 11,
        });

        if (sortedNums[mid] >= curNum) {
          firstIndex = mid;
          addState({
            sortedArray: sortedNums,
            currentX: curNum,
            binarySearchActive: true,
            left,
            right,
            mid,
            firstIndex,
            explanation: `${sortedNums[mid]} >= ${curNum}, update first_index = ${mid}, search left half`,
            line: 13,
          });
          right = mid - 1;
        } else {
          addState({
            sortedArray: sortedNums,
            currentX: curNum,
            binarySearchActive: true,
            left,
            right,
            mid,
            explanation: `${sortedNums[mid]} < ${curNum}, search right half`,
            line: 16,
          });
          left = mid + 1;
        }
      }

      const count = n - firstIndex;
      addState({
        sortedArray: sortedNums,
        currentX: curNum,
        binarySearchActive: false,
        firstIndex,
        count,
        explanation: `Binary search complete. Count of elements >= ${curNum} is ${count} (n - first_index = ${n} - ${firstIndex})`,
        line: 20,
      });

      return count;
    };

    // Main loop
    addState({
      sortedArray: sortedNums,
      explanation: `Starting to test x from 1 to ${n}`,
      line: 23,
    });

    let result = -1;
    for (let x = 1; x <= n; x++) {
      addState({
        sortedArray: sortedNums,
        currentX: x,
        explanation: `Testing x = ${x}`,
        line: 24,
      });

      const count = findNumberOfNums(x);

      if (x === count) {
        result = x;
        addState({
          sortedArray: sortedNums,
          currentX: x,
          count,
          isFound: true,
          result: x,
          explanation: `SUCCESS! x = ${x} equals count = ${count}. Found special array!`,
          line: 25,
        });
        break;
      } else {
        addState({
          sortedArray: sortedNums,
          currentX: x,
          count,
          explanation: `x = ${x} ≠ count = ${count}. Continue searching...`,
          line: 24,
        });
      }
    }

    if (result === -1) {
      addState({
        sortedArray: sortedNums,
        result: -1,
        explanation: `No special value found. Returning -1`,
        line: 30,
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [arrayInput]);

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

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 4; // 4-7 elements
    const array = Array.from({ length }, () => Math.floor(Math.random() * 10)); // 0-9
    
    setArrayInput(array.join(', '));
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
    sortedArray = [],
    currentX = -1,
    binarySearchActive = false,
    left = -1,
    right = -1,
    mid = -1,
    firstIndex = -1,
    count = -1,
    line,
    explanation = "",
    isFound = false,
    result = null,
    originalArray = [],
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
    <div
      className={`block rounded-lg transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20 scale-[1.02]"
          : isHighlighted
          ? "bg-blue-500/10 border-blue-500/50"
          : "border-transparent hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={`font-mono ${isActive ? "text-green-300 font-bold" : isHighlighted ? "text-blue-300" : "text-gray-300"}`}>
        {content}
      </span>
    </div>
  );

  const codeLines = [
    { line: 1, content: "int specialArray(vector<int>& nums) {" },
    { line: 2, content: "  sort(nums.begin(), nums.end());" },
    { line: 3, content: "  int n = nums.size();" },
    { line: 4, content: "" },
    { line: 5, content: "  auto find_number_of_nums = [&](int cur_num) -> int {" },
    { line: 6, content: "    int left = 0, right = n - 1;" },
    { line: 7, content: "    int first_index = n;" },
    { line: 8, content: "" },
    { line: 9, content: "    while (left <= right) {" },
    { line: 10, content: "      int mid = (left + right) / 2;" },
    { line: 11, content: "" },
    { line: 12, content: "      if (nums[mid] >= cur_num) {" },
    { line: 13, content: "        first_index = mid;" },
    { line: 14, content: "        right = mid - 1;" },
    { line: 15, content: "      } else {" },
    { line: 16, content: "        left = mid + 1;" },
    { line: 17, content: "      }" },
    { line: 18, content: "    }" },
    { line: 19, content: "" },
    { line: 20, content: "    return n - first_index;" },
    { line: 21, content: "  };" },
    { line: 22, content: "" },
    { line: 23, content: "  for (int x = 1; x <= n; ++x) {" },
    { line: 24, content: "    if (x == find_number_of_nums(x)) {" },
    { line: 25, content: "      return x;" },
    { line: 26, content: "    }" },
    { line: 27, content: "  }" },
    { line: 28, content: "" },
    { line: 29, content: "  return -1;" },
    { line: 30, content: "}" },
  ];

  const getCellColor = (index) => {
    if (binarySearchActive) {
      if (index === mid) {
        return "bg-gradient-to-br from-purple-500 to-pink-600 text-white border-purple-500 shadow-lg shadow-purple-500/50 scale-110 animate-pulse";
      }
      if (index === left || index === right) {
        return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-blue-500 shadow-lg shadow-blue-500/50";
      }
      if (index >= left && index <= right) {
        return "bg-blue-500/30 border-blue-500/50";
      }
      return "bg-gray-700/40 border-gray-600/40";
    }
    
    if (firstIndex >= 0 && index >= firstIndex) {
      return "bg-green-500/40 border-green-500/50 shadow-md";
    }
    
    return "bg-gray-700/60 border-gray-600 hover:bg-gray-600/70 transition-colors";
  };

  const progressPercentage = history.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4">
          Special Array with X Elements ≥ X
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Find value x such that there are exactly x numbers ≥ x.{" "}
          <span className="text-purple-400 font-semibold">Binary search meets mathematical elegance.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
            <Binary className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">O(n log n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <Target className="h-4 w-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">LeetCode #1608</span>
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
                Array Elements
              </label>
              <input
                type="text"
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                disabled={isLoaded}
                placeholder="Enter numbers separated by commas..."
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomArray}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2"
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
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
                      className="bg-purple-500 hover:bg-purple-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={2000}>Slow</option>
                      <option value={1000}>Medium</option>
                      <option value={500}>Fast</option>
                      <option value={250}>Very Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                    <div className="text-purple-400 font-bold">{currentStep + 1}</div>
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
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/25"
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
              <h3 className="font-bold text-2xl text-purple-400 flex items-center gap-3">
                <Code className="h-6 w-6" />
                Algorithm Code
              </h3>
              <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                C++
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {codeLines.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                        isHighlighted={[12, 13, 14, 24, 25].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-purple-400">{currentX >= 0 ? currentX : "—"}</div>
                <div className="text-xs text-gray-400">Current X</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-blue-400">{count >= 0 ? count : "—"}</div>
                <div className="text-xs text-gray-400">Count ≥ X</div>
              </div>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="xl:col-span-2 space-y-8">
            {/* Array Visualization */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3">
                  <Grid className="h-6 w-6 text-purple-400" />
                  Array Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                  {sortedArray.length} elements
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Current X Display */}
                {currentX >= 0 && (
                  <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-6 rounded-2xl border border-purple-700/50 w-full max-w-md shadow-xl">
                    <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-400" />
                      Testing Value X
                    </h4>
                    <div className="font-mono text-4xl font-bold text-center text-purple-400 bg-gray-900/50 py-4 rounded-xl border border-purple-700/30">
                      {currentX}
                    </div>
                    {count >= 0 && (
                      <div className="mt-4 text-center">
                        <div className="text-sm text-gray-400">Elements ≥ {currentX}</div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">{count}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sorted Array Visualization */}
                <div className="w-full">
                  <div className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50" id="main-array-container">
                    <div className="text-sm text-gray-400 mb-4 text-center font-mono">
                      Sorted Array: [{sortedArray.join(", ")}]
                    </div>
                    
                    {/* Column headers */}
                    <div className="flex gap-4 mb-4 justify-center flex-wrap">
                      {sortedArray.map((_, index) => (
                        <div key={index} className="w-20 text-center">
                          <div className="text-xs text-gray-500 font-mono mb-2">Index</div>
                          <div className="text-lg font-bold text-gray-400 bg-gray-800/50 rounded-lg py-1 px-3 border border-gray-600/50">
                            {index}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Array elements */}
                    <div className="flex gap-4 justify-center flex-wrap">
                      {sortedArray.map((num, index) => (
                        <div
                          key={index}
                          id={`main-array-container-element-${index}`}
                          className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} relative`}
                        >
                          {num}
                          {index === mid && binarySearchActive && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 animate-ping">
                              M
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pointers */}
                    {binarySearchActive && left >= 0 && (
                      <Pointer
                        index={left}
                        containerId="main-array-container"
                        color="blue"
                        label="Left"
                      />
                    )}
                    {binarySearchActive && right >= 0 && right < sortedArray.length && (
                      <Pointer
                        index={right}
                        containerId="main-array-container"
                        color="amber"
                        label="Right"
                      />
                    )}
                    {binarySearchActive && mid >= 0 && (
                      <Pointer
                        index={mid}
                        containerId="main-array-container"
                        color="purple"
                        label="Mid"
                      />
                    )}
                    {!binarySearchActive && firstIndex >= 0 && firstIndex < sortedArray.length && (
                      <Pointer
                        index={firstIndex}
                        containerId="main-array-container"
                        color="green"
                        label="First ≥ X"
                      />
                    )}
                  </div>
                </div>

                {/* Binary Search Status */}
                {binarySearchActive && (
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/50 w-full max-w-md shadow-xl">
                    <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                      <Search className="h-5 w-5 text-blue-400" />
                      Binary Search Active
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="text-gray-400">Left</div>
                        <div className="font-mono text-2xl font-bold text-blue-400 bg-gray-900/50 py-2 rounded-lg text-center border border-blue-700/30">
                          {left}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-gray-400">Mid</div>
                        <div className="font-mono text-2xl font-bold text-purple-400 bg-gray-900/50 py-2 rounded-lg text-center border border-purple-700/30">
                          {mid >= 0 ? mid : "—"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-gray-400">Right</div>
                        <div className="font-mono text-2xl font-bold text-amber-400 bg-gray-900/50 py-2 rounded-lg text-center border border-amber-700/30">
                          {right}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result Display */}
                {isFound && (
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 border border-green-700/50 w-full max-w-md shadow-xl animate-pulse">
                    <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Special Array Found!
                    </h4>
                    <div className="font-mono text-5xl font-bold text-center text-green-400 bg-gray-900/50 py-6 rounded-xl border border-green-700/30">
                      {result}
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-300">
                      There are exactly {result} numbers ≥ {result}
                    </div>
                  </div>
                )}

                {result === -1 && currentStep === history.length - 1 && (
                  <div className="bg-gradient-to-br from-red-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 border border-red-700/50 w-full max-w-md shadow-xl">
                    <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      No Special Array
                    </h4>
                    <div className="font-mono text-4xl font-bold text-center text-red-400 bg-gray-900/50 py-4 rounded-xl border border-red-700/30">
                      -1
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-300">
                      No value x exists where count ≥ x equals x
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats and Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current State */}
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-800/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-amber-700/50">
                <h3 className="font-bold text-xl text-amber-300 mb-4 flex items-center gap-3">
                  <Calculator className="h-5 w-5" />
                  Current State
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Testing X</span>
                    <span className="font-mono font-bold text-purple-400 text-lg">
                      {currentX >= 0 ? currentX : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Count ≥ X</span>
                    <span className="font-mono font-bold text-blue-400 text-lg">
                      {count >= 0 ? count : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Match</span>
                    <span className={`font-mono font-bold ${currentX === count && currentX >= 0 ? "text-green-400" : "text-red-400"} text-lg`}>
                      {currentX >= 0 && count >= 0 ? (currentX === count ? "YES ✓" : "NO ✗") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Binary Search</span>
                    <span className={`font-mono font-bold ${binarySearchActive ? "text-green-400" : "text-gray-400"} text-lg`}>
                      {binarySearchActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-700/50">
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
                {isFound && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-green-300 text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Special Array Found!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Algorithm Analysis */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-2xl text-purple-400 mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6" />
                Algorithm Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-purple-300 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Problem Understanding
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Special Array Definition</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        An array has a "special" value x if there are exactly x numbers in the array that are ≥ x.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Why Sort First?</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Sorting enables binary search to efficiently find the first element ≥ x, turning an O(n²) problem into O(n log n).
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Key Insight</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        For each candidate x (1 to n), use binary search to count elements ≥ x. If count equals x, we found our answer!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-purple-300 text-lg flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Complexity Breakdown
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Sorting: O(n log n)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Initial sort of the array is the dominant factor in time complexity.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Main Loop: O(n log n)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Testing n candidates (x = 1 to n), each requiring O(log n) binary search.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Space: O(1)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Only constant extra space needed (ignoring input array). Sort can be in-place.
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
              🚀 Ready to visualize Special Array?
            </div>
            <div className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enter an array of numbers to see how the algorithm finds the special value x where exactly x elements are ≥ x.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-8">
              <div className="bg-purple-500/10 text-purple-300 px-4 py-2 rounded-full border border-purple-500/20 flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Click "Start Visualization" to begin
              </div>
              <div className="bg-blue-500/10 text-blue-300 px-4 py-2 rounded-full border border-blue-500/20 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Use "Random" for quick examples
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 text-left">
              <div className="text-purple-400 font-mono text-sm mb-2">💡 Example Usage:</div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>Array: <span className="text-purple-300 font-mono">3, 5, 0, 2, 3</span></div>
                <div className="text-gray-500 text-xs mt-2">→ Returns 3 (there are exactly 3 numbers ≥ 3: [3, 5, 3])</div>
                <div className="mt-4">Array: <span className="text-purple-300 font-mono">0, 4, 3, 0, 4</span></div>
                <div className="text-gray-500 text-xs mt-2">→ Returns 3 (there are exactly 3 numbers ≥ 3: [4, 3, 4])</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialArrayVisualizer;