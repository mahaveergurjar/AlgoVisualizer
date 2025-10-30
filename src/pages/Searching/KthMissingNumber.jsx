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
  Hash,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
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
    pink: { bg: "bg-pink-500", text: "text-pink-500", glow: "shadow-pink-500/50" },
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
                             color === "pink" ? "#ec4899" : "#f59e0b"
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
  const [numbersInput, setNumbersInput] = useState("2, 3, 4, 7, 11");
  const [kInput, setKInput] = useState("5");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localNumbers = numbersInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    const k = parseInt(kInput.trim());

    if (localNumbers.length === 0 || isNaN(k) || k <= 0) {
      alert("Invalid input. Please enter positive integers.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let result = null;
    let currentIndex = -1;
    let missingCount = 0;
    let currentNum = 1;
    let arrayPointer = 0;

    const addState = (index = -1, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        numbers: [...localNumbers],
        k,
        currentIndex: index,
        currentNum,
        missingCount,
        arrayPointer,
        result,
        step: stepCount++,
        explanation,
        line,
        ...extraProps,
      });
    };

    // Initial setup
    addState(-1, `Finding the ${k}th missing positive number`, 1);
    addState(-1, `Array: [${localNumbers.join(", ")}]`, 2);
    addState(-1, "Starting from number 1, checking each positive integer", 3);

    // Main algorithm
    while (missingCount < k) {
      addState(arrayPointer, `Checking positive integer: ${currentNum}`, 4);
      
      if (arrayPointer < localNumbers.length && localNumbers[arrayPointer] === currentNum) {
        addState(arrayPointer, `${currentNum} is in the array (found at index ${arrayPointer})`, 5, { isPresent: true });
        addState(arrayPointer, `Not missing - move to next array element`, 6);
        arrayPointer++;
      } else {
        missingCount++;
        addState(arrayPointer, `${currentNum} is NOT in the array - this is missing number #${missingCount}`, 7, { isMissing: true });
        
        if (missingCount === k) {
          result = currentNum;
          addState(arrayPointer, `Found the ${k}th missing number: ${result}`, 8, { isComplete: true });
          break;
        } else {
          addState(arrayPointer, `Need to find ${k - missingCount} more missing numbers`, 9);
        }
      }
      
      currentNum++;
      addState(arrayPointer, `Move to next positive integer: ${currentNum}`, 10);
    }

    // Final state
    addState(arrayPointer, `RESULT: The ${k}th missing positive number is ${result}`, 11, { isComplete: true });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [numbersInput, kInput]);

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
    const length = Math.floor(Math.random() * 4) + 4; // 4-7 numbers
    const numbers = [];
    let current = Math.floor(Math.random() * 3) + 2; // Start from 2-4
    
    for (let i = 0; i < length; i++) {
      numbers.push(current);
      current += Math.floor(Math.random() * 3) + 1; // Gap of 1-3
    }
    
    const k = Math.floor(Math.random() * 6) + 3; // k between 3-8
    
    setNumbersInput(numbers.join(', '));
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepBackward, stepForward, goToStart, goToEnd]);

  const state = history[currentStep] || {};
  const {
    numbers = [],
    k = 0,
    currentIndex = -1,
    currentNum = 1,
    missingCount = 0,
    arrayPointer = 0,
    result = null,
    line,
    explanation = "",
    isPresent = false,
    isMissing = false,
    isComplete = false,
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

  const kthMissingCode = [
    { line: 1, content: "int findKthPositive(vector<int>& arr, int k) {" },
    { line: 2, content: "    int missing = 0;" },
    { line: 3, content: "    int current = 1;" },
    { line: 4, content: "    int i = 0;" },
    { line: 5, content: "    " },
    { line: 6, content: "    while (missing < k) {" },
    { line: 7, content: "        if (i < arr.size() && arr[i] == current) {" },
    { line: 8, content: "            i++; // Number exists in array" },
    { line: 9, content: "        } else {" },
    { line: 10, content: "            missing++; // Found missing number" },
    { line: 11, content: "            if (missing == k) return current;" },
    { line: 12, content: "        }" },
    { line: 13, content: "        current++;" },
    { line: 14, content: "    }" },
    { line: 15, content: "    return current;" },
    { line: 16, content: "}" },
  ];

  const getCellColor = (index, num) => {
    if (arrayPointer === index && isPresent) {
      return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/50 scale-110";
    }
    
    if (index < arrayPointer) {
      return "bg-gray-600 border-gray-500 shadow-inner";
    }
    
    return "bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-600/70 transition-colors";
  };

  const progressPercentage = k > 0 ? (missingCount / k) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
          Kth Missing Positive Number
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          LeetCode #1539 - Find the kth positive integer that is missing from the array
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">O(n + k) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 rounded-full border border-pink-500/30">
            <Hash className="h-4 w-4 text-pink-400" />
            <span className="text-pink-300 text-sm font-medium">Sequential Search</span>
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
                Array (sorted positive integers)
              </label>
              <input
                type="text"
                value={numbersInput}
                onChange={(e) => setNumbersInput(e.target.value)}
                disabled={isLoaded}
                placeholder="e.g., 2, 3, 4, 7, 11"
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
            <div className="sm:w-32">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Target className="inline w-4 h-4 mr-2" />
                K Value
              </label>
              <input
                type="text"
                value={kInput}
                onChange={(e) => setKInput(e.target.value)}
                disabled={isLoaded}
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 font-mono text-center text-xl"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomInput}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-2"
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
                    <button onClick={playAnimation} disabled={currentStep >= history.length - 1} className="bg-blue-500 hover:bg-blue-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer">
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
                    <div className="text-blue-400 font-bold">{currentStep + 1}</div>
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

        {isLoaded && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress: {missingCount} / {k} missing found</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25" style={{ width: `${progressPercentage}%` }}></div>
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
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="overflow-y-auto max-h-96">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {kthMissingCode.map((codeLine) => (
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
              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Result
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-blue-400">
                  {result || "?"}
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">
                  {result ? `${k}th missing number` : "Searching..."}
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3 mb-8">
                <Grid className="h-6 w-6 text-blue-400" />
                Array and Current Number
              </h3>
              
              <div className="space-y-8">
                {/* Current Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-4 rounded-xl border border-blue-700/50">
                    <div className="text-sm text-gray-400 mb-1">Current #</div>
                    <div className="font-mono text-2xl font-bold text-blue-400">{currentNum}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-4 rounded-xl border border-purple-700/50">
                    <div className="text-sm text-gray-400 mb-1">Missing Count</div>
                    <div className="font-mono text-2xl font-bold text-purple-400">{missingCount} / {k}</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-900/40 to-blue-900/40 p-4 rounded-xl border border-pink-700/50">
                    <div className="text-sm text-gray-400 mb-1">Array Index</div>
                    <div className="font-mono text-2xl font-bold text-pink-400">{arrayPointer}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-900/40 to-blue-900/40 p-4 rounded-xl border border-amber-700/50">
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className="font-mono text-lg font-bold text-amber-400">
                      {isMissing ? "Missing!" : isPresent ? "Present" : "—"}
                    </div>
                  </div>
                </div>

                {/* Array Visualization */}
                <div className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50" id="array-container">
                  <div className="flex gap-3 mb-4 justify-center">
                    {numbers.map((_, index) => (
                      <div key={index} className="w-16 text-center">
                        <div className="text-xs text-gray-500 font-mono mb-2">Index</div>
                        <div className="text-sm font-bold text-gray-400 bg-gray-800/50 rounded-lg py-1 px-2 border border-gray-600/50">
                          {index}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    {numbers.map((num, index) => (
                      <div
                        key={index}
                        id={`array-container-element-${index}`}
                        className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 ${getCellColor(index, num)}`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {arrayPointer >= 0 && arrayPointer < numbers.length && (
                    <Pointer
                      index={arrayPointer}
                      containerId="array-container"
                      color="blue"
                      label="Checking"
                    />
                  )}
                </div>

                {/* Current Number Display */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${
                  isMissing ? "bg-purple-500/20 border-purple-500" : 
                  isPresent ? "bg-blue-500/20 border-blue-500" : 
                  "bg-gray-700/20 border-gray-600"
                }`}>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Checking Positive Integer</div>
                    <div className="font-mono text-5xl font-bold text-white mb-2">{currentNum}</div>
                    <div className={`text-lg font-semibold ${
                      isMissing ? "text-purple-300" : 
                      isPresent ? "text-blue-300" : 
                      "text-gray-400"
                    }`}>
                      {isMissing ? `🎯 Missing Number #${missingCount}` : 
                       isPresent ? "✓ Present in Array" : 
                       "Evaluating..."}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-6 rounded-2xl border border-purple-700/50">
                  <h3 className="font-bold text-xl text-purple-300 mb-4 flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    Step Explanation
                  </h3>
                  <div className="text-gray-200 text-sm leading-relaxed">
                    {explanation}
                  </div>
                  {isComplete && (
                    <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <div className="text-blue-300 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Search Completed Successfully!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Algorithm Analysis */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-2xl text-blue-400 mb-6 flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                Algorithm Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 text-lg">Key Concepts</h4>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-purple-300 block mb-2">Sequential Check</strong>
                    <p className="text-gray-400 text-sm">
                      Check each positive integer starting from 1 to find missing numbers.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-purple-300 block mb-2">Counter Approach</strong>
                    <p className="text-gray-400 text-sm">
                      Keep a count of missing numbers until we reach the kth one.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 text-lg">Optimization</h4>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-purple-300 block mb-2">Binary Search</strong>
                    <p className="text-gray-400 text-sm">
                      Can optimize to O(log n) using binary search on missing count formula.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <strong className="text-purple-300 block mb-2">Formula: arr[i] - (i+1)</strong>
                    <p className="text-gray-400 text-sm">
                      The number of missing integers before index i.
                    </p>
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
              🚀 Ready to find the Kth Missing Number?
            </div>
            <div className="text-gray-500 text-sm mb-8">
              Enter a sorted array of positive integers and a value k to find the kth missing positive number.
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 text-left">
              <div className="text-blue-400 font-mono text-sm mb-2">💡 Example:</div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>Array: <span className="text-blue-300 font-mono">[2, 3, 4, 7, 11]</span></div>
                <div>k: <span className="text-purple-300 font-mono">5</span></div>
                <div className="text-gray-500 text-xs mt-2">→ Missing: 1, 5, 6, 8, 9... Returns 9 (5th missing)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KthMissingNumber;