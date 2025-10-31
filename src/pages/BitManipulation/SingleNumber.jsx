import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Code2,
  Binary,
  Zap,
  Cpu,
  Clock,
  CheckCircle,
  BarChart3,
  Target,
  Gauge,
  Calculator,
  Grid,
  Search,
  Sparkles,
  TrendingUp,
  MousePointer,
  List,
  AlertCircle,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { line: 1, content: "int singleNumber(vector<int>& nums) {" },
    { line: 2, content: "    int result = 0;" },
    { line: 3, content: "    for (int x : nums) {" },
    { line: 4, content: "        result ^= x;" },
    { line: 5, content: "    }" },
    { line: 6, content: "    return result;" },
    { line: 7, content: "}" },
  ],
  Python: [
    { line: 1, content: "def singleNumber(nums):" },
    { line: 2, content: "    result = 0" },
    { line: 3, content: "    for x in nums:" },
    { line: 4, content: "        result ^= x" },
    { line: 5, content: "    return result" },
  ],
  Java: [
    { line: 1, content: "public int singleNumber(int[] nums) {" },
    { line: 2, content: "    int result = 0;" },
    { line: 3, content: "    for (int x : nums) {" },
    { line: 4, content: "        result ^= x;" },
    { line: 5, content: "    }" },
    { line: 6, content: "    return result;" },
    { line: 7, content: "}" },
  ],
};

const formatBinary = (num, bits) => {
  if (num === null || num === undefined) return "-".repeat(bits);
  const mask = (1n << BigInt(bits)) - 1n;
  const bn = BigInt(num) & mask;
  let s = bn.toString(2);
  if (s.length > bits) s = s.slice(-bits);
  return s.padStart(bits, "0");
};

// Enhanced Code Line Component
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

const SingleNumberVisualizer = ({ navigate }) => {
  // State management
  const [numsInput, setNumsInput] = useState("2,2,1,3,3,4,4");
  const [bitWidth, setBitWidth] = useState(8);
  const [nums, setNums] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [activeLang, setActiveLang] = useState("C++");
  const visualizerRef = useRef(null);

  const currentState = history[currentStep] || {};

  // Enhanced history generation with better explanations
  const generateHistory = useCallback((arr, bits) => {
    const newHistory = [];
    let accumulator = 0;
    let stepCount = 0;

    // Initial state
    newHistory.push({
      index: null,
      before: accumulator,
      current: null,
      after: accumulator,
      explanation: "🚀 Starting XOR Algorithm\nInitializing accumulator to 0",
      binBefore: formatBinary(accumulator, bits),
      binCurrent: null,
      binAfter: formatBinary(accumulator, bits),
      line: 2,
      status: "initial",
      step: stepCount++,
    });

    // Process each number
    for (let i = 0; i < arr.length; i++) {
      const currentNum = arr[i];
      
      // Before XOR
      newHistory.push({
        index: i,
        before: accumulator,
        current: currentNum,
        after: null,
        explanation: `📊 Checking element at index ${i}\nAccumulator: ${accumulator}, Current: ${currentNum}\nReady to perform XOR operation`,
        binBefore: formatBinary(accumulator, bits),
        binCurrent: formatBinary(currentNum, bits),
        binAfter: null,
        line: 3,
        status: "before",
        step: stepCount++,
      });

      // Perform XOR
      const result = accumulator ^ currentNum;
      newHistory.push({
        index: i,
        before: accumulator,
        current: currentNum,
        after: result,
        explanation: `⚡ XOR Operation\n${accumulator} ^ ${currentNum} = ${result}\n${formatBinary(accumulator, bits)} XOR ${formatBinary(currentNum, bits)} = ${formatBinary(result, bits)}`,
        binBefore: formatBinary(accumulator, bits),
        binCurrent: formatBinary(currentNum, bits),
        binAfter: formatBinary(result, bits),
        line: 4,
        status: "operation",
        step: stepCount++,
      });

      accumulator = result;

      // Show intermediate result
      if (i < arr.length - 1) {
        newHistory.push({
          index: i,
          before: accumulator,
          current: null,
          after: accumulator,
          explanation: `📈 Intermediate Result: ${accumulator}\nMoving to next element...`,
          binBefore: formatBinary(accumulator, bits),
          binCurrent: null,
          binAfter: formatBinary(accumulator, bits),
          line: 3,
          status: "intermediate",
          step: stepCount++,
        });
      }
    }

    // Final state
    newHistory.push({
      index: arr.length - 1,
      before: accumulator,
      current: null,
      after: accumulator,
      explanation: `🎉 Algorithm Complete!\nThe single number is: ${accumulator}\nAll pairs canceled out through XOR operations`,
      binBefore: formatBinary(accumulator, bits),
      binCurrent: null,
      binAfter: formatBinary(accumulator, bits),
      line: 6,
      status: "final",
      step: stepCount++,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

  // Load and validate input
  const loadVisualization = () => {
    const arr = numsInput
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(num => !isNaN(num));

    if (arr.length === 0) {
      alert("Please enter valid comma-separated integers");
      return;
    }

    // Validate that there's exactly one single number
    const frequency = {};
    arr.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    
    const singles = Object.keys(frequency).filter(num => frequency[num] === 1);
    if (singles.length !== 1) {
      alert("Please ensure there's exactly one number that appears once, and all others appear twice");
      return;
    }

    setNums(arr);
    generateHistory(arr, bitWidth);
  };

  const resetVisualization = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 3) + 4; // 4-6 elements (2-3 pairs + 1 single)
    const pairs = Array.from({ length: Math.floor(length / 2) }, () => Math.floor(Math.random() * 50) + 1);
    
    // Duplicate pairs and add one single number
    const array = [];
    pairs.forEach(num => {
      array.push(num, num);
    });
    
    // Add single number (different from pairs)
    let single;
    do {
      single = Math.floor(Math.random() * 50) + 1;
    } while (pairs.includes(single));
    array.push(single);
    
    // Shuffle array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    setNumsInput(array.join(', '));
    resetVisualization();
  };

  // Navigation controls
  const stepForward = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

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

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.key === "Home") goToStart();
      if (e.key === "End") goToEnd();
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoaded, stepForward, stepBackward, goToStart, goToEnd]);

  // Auto-play functionality
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, 1100 - speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  const progressPercentage = nums.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  const getCellColor = (index) => {
    if (index === currentState.index) {
      return "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-500 shadow-lg shadow-amber-500/50 scale-110 animate-pulse";
    }
    
    if (currentState.index !== null && index < currentState.index) {
      return "bg-gray-600 border-gray-500 shadow-inner";
    }
    
    return "bg-gray-700/60 border-gray-600 hover:bg-gray-600/70 transition-colors";
  };

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
          Single Number
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Find the unique number using XOR magic.{" "}
          <span className="text-cyan-400 font-semibold">Elegant, efficient, and bitwise brilliant.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">O(n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <Cpu className="h-4 w-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Bitwise XOR</span>
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
                value={numsInput}
                onChange={(e) => setNumsInput(e.target.value)}
                disabled={isLoaded}
                placeholder="Enter numbers with exactly one single (e.g., 2,2,1,3,3,4,4)..."
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Binary className="inline w-4 h-4 mr-2" />
                Bit Width
              </label>
              <select
                value={bitWidth}
                onChange={(e) => setBitWidth(parseInt(e.target.value))}
                disabled={isLoaded}
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              >
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
                <option value={64}>64-bit</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={loadVisualization}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomArray}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-2"
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
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  
                  {!isPlaying ? (
                    <button
                      onClick={playAnimation}
                      disabled={currentStep >= history.length - 1}
                      className="bg-cyan-500 hover:bg-cyan-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToEnd}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
                    title="Go to End (End)"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-400 text-sm">Speed:</label>
                    <select
                      value={speed}
                      onChange={handleSpeedChange}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value={400}>Slow</option>
                      <option value={700}>Medium</option>
                      <option value={1000}>Fast</option>
                      <option value={1200}>Very Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                    <div className="text-cyan-400 font-bold">{currentStep + 1}</div>
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
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/25"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10 w-full overflow-x-hidden">
          {/* Code Panel */}
          <div className="xl:col-span-1 bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-cyan-400 flex items-center gap-3">
                <Code2 className="h-6 w-6" />
                Algorithm Code
              </h3>
              <div className="flex gap-2">
                {LANG_TABS.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeLang === lang
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 border border-gray-600"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {CODE_SNIPPETS[activeLang].map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={currentState.line === codeLine.line}
                        isHighlighted={[2, 3, 4, 6].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-purple-400">{nums.length}</div>
                <div className="text-xs text-gray-400">Total Elements</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-green-400">{currentState.index !== null ? currentState.index + 1 : 0}</div>
                <div className="text-xs text-gray-400">Elements Processed</div>
              </div>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="xl:col-span-2 space-y-8 overflow-x-hidden">
            {/* Array Visualization */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3">
                  <Grid className="h-6 w-6 text-cyan-400" />
                  Array Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                  {nums.length} elements
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Array elements */}
                <div className="w-full overflow-x-auto">
                  <div className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 min-w-fit">
                    {/* Column headers */}
                    <div className="flex gap-4 mb-4 justify-center flex-wrap">
                      {nums.map((_, index) => (
                        <div key={index} className="min-w-[96px] text-center">
                          <div className="text-xs text-gray-500 font-mono mb-2">Index</div>
                          <div className={`text-lg font-bold rounded-lg py-1 px-3 border ${
                            index === currentState.index 
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50" 
                              : "bg-gray-800/50 text-gray-400 border-gray-600/50"
                          }`}>
                            {index}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Array elements */}
                    <div className="flex gap-4 justify-center flex-wrap">
                      {nums.map((num, index) => (
                        <div
                          key={index}
                          className={`min-w-[96px] max-w-full h-auto p-4 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-500 transform ${getCellColor(index)} relative`}
                        >
                          <div className="text-2xl mb-1">{num}</div>
                          <div className="text-xs font-mono text-gray-200 opacity-80 break-all text-center max-w-full overflow-wrap px-1">
                            {formatBinary(num, bitWidth)}
                          </div>
                          {index === currentState.index && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 animate-ping">
                              <Zap className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* XOR Operation Display */}
                <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-sm p-6 rounded-2xl border border-cyan-700/50 w-full max-w-full shadow-xl overflow-hidden">
                  <h4 className="text-lg text-gray-300 mb-6 flex items-center gap-3">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    XOR Operation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-cyan-600/30">
                      <div className="text-sm text-gray-400 mb-2">Before XOR</div>
                      <div className="text-2xl font-mono text-cyan-400 mb-2">
                        {currentState.before ?? 0}
                      </div>
                      <div className="text-xs font-mono text-gray-300 bg-black/30 p-2 rounded break-all overflow-wrap">
                        {currentState.binBefore ?? formatBinary(0, bitWidth)}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-amber-600/30">
                      <div className="text-sm text-gray-400 mb-2">Current Element</div>
                      <div className="text-2xl font-mono text-amber-400 mb-2">
                        {currentState.current ?? "-"}
                      </div>
                      <div className="text-xs font-mono text-gray-300 bg-black/30 p-2 rounded break-all overflow-wrap">
                        {currentState.binCurrent ?? "-"}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-green-600/30">
                      <div className="text-sm text-gray-400 mb-2">After XOR</div>
                      <div className="text-2xl font-mono text-green-400 mb-2">
                        {currentState.after ?? currentState.before ?? 0}
                      </div>
                      <div className="text-xs font-mono text-gray-300 bg-black/30 p-2 rounded break-all overflow-wrap">
                        {currentState.binAfter ?? currentState.binBefore ?? formatBinary(0, bitWidth)}
                      </div>
                    </div>
                  </div>
                </div>
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
                    <span className="text-gray-300">Current Index</span>
                    <span className="font-mono font-bold text-amber-400 text-lg">
                      {currentState.index !== null ? currentState.index : "Initial"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Accumulator</span>
                    <span className="font-mono font-bold text-cyan-400 text-lg">
                      {currentState.after ?? currentState.before ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Elements Processed</span>
                    <span className="font-mono font-bold text-purple-400 text-lg">
                      {currentState.index !== null ? currentState.index + 1 : 0}/{nums.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Search Progress</span>
                    <span className="font-mono font-bold text-green-400 text-lg">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-cyan-700/50">
                <h3 className="font-bold text-xl text-cyan-300 mb-4 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  Step Explanation
                </h3>
                <div className="text-gray-200 text-sm leading-relaxed h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2">
                  {currentState.explanation?.split('\n').map((line, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      {line}
                    </div>
                  )) || "Load the visualization to see step-by-step explanation."}
                </div>
                {currentState.status === "final" && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-green-300 text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Algorithm Completed Successfully!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-2xl text-cyan-400 mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6" />
                Algorithm Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-cyan-300 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    XOR Properties
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/30 transition-all">
                      <strong className="text-cyan-300 block mb-2 text-sm">a ^ a = 0</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Any number XORed with itself equals 0. This cancels out pairs automatically.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/30 transition-all">
                      <strong className="text-cyan-300 block mb-2 text-sm">a ^ 0 = a</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Any number XORed with 0 remains unchanged. Perfect for accumulation.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/30 transition-all">
                      <strong className="text-cyan-300 block mb-2 text-sm">Commutative & Associative</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Order doesn't matter: (a ^ b) ^ c = a ^ (b ^ c). Works regardless of element order.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-cyan-300 text-lg flex items-center gap-2">
                    <ArrowRightIcon className="h-5 w-5" />
                    Performance Characteristics
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-green-300 block mb-2 text-sm">Time: O(n)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Single pass through the array. Each element processed exactly once.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-green-300 block mb-2 text-sm">Space: O(1)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Only one variable (accumulator) needed regardless of input size.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-green-300 block mb-2 text-sm">Bitwise Efficiency</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        XOR operations are extremely fast at the hardware level. Optimal for this problem.
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
              🚀 Ready to visualize XOR Magic?
            </div>
            <div className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enter an array where every number appears twice except one, and watch how XOR finds the single number.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-8">
              <div className="bg-cyan-500/10 text-cyan-300 px-4 py-2 rounded-full border border-cyan-500/20 flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Click "Start Visualization" to begin
              </div>
              <div className="bg-purple-500/10 text-purple-300 px-4 py-2 rounded-full border border-purple-500/20 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Use "Random" for quick examples
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 text-left">
              <div className="text-cyan-400 font-mono text-sm mb-2">💡 Example Usage:</div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>Array: <span className="text-cyan-300 font-mono">2, 2, 1, 3, 3, 4, 4</span></div>
                <div>Single Number: <span className="text-green-300 font-mono">1</span></div>
                <div className="text-gray-500 text-xs mt-2">→ XOR cancels all pairs: 2^2=0, 3^3=0, 4^4=0, leaving 0^1=1</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleNumberVisualizer;