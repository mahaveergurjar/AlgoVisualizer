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
  Type,
  Target,
  Gauge,
  Maximize2,
} from "lucide-react";

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
        style={{ borderBottomColor: color === "red" ? "#ef4444" : "#3b82f6" }}
      />
      <div
        className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}
      >
        {label}
      </div>
    </div>
  );
};

// Main Component
const MaxConsecutiveOnes = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("1,1,1,0,0,0,1,1,1,1,0");
  const [kInput, setKInput] = useState("2");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const localK = parseInt(kInput, 10);

    if (localNums.some(isNaN) || isNaN(localK)) {
      alert("Invalid input. Please use comma-separated numbers for the array.");
      return;
    }

    const newHistory = [];
    let left = 0;
    let zeroCount = 0;
    let maxLength = 0;
    let stepCount = 0;

    const addState = (right = null, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        nums: [...localNums],
        left,
        right,
        zeroCount,
        maxLength,
        line,
        k: localK,
        step: stepCount++,
        explanation,
        ...extraProps,
      });
    };

    // Initial setup
    addState(null, "Initialize left pointer, zero count, and max length variables", 2);
    addState(null, "Variables initialized: left=0, zeroCount=0, maxLength=0", 3);
    addState(null, "Ready to start sliding window algorithm", 4);

    // Main algorithm loop
    for (let right = 0; right < localNums.length; right++) {
      addState(right, `Right pointer moves to position ${right}. Current element: ${localNums[right]}`, 6);
      addState(right, `Checking if element at position ${right} is zero`, 7);
      
      if (localNums[right] === 0) {
        zeroCount++;
        addState(right, `Found zero! Zero count increased to ${zeroCount}`, 8);
      }
      
      addState(right, `Checking if zero count (${zeroCount}) exceeds k (${localK})`, 11);
      
      // Handle window shrinking
      while (zeroCount > localK) {
        addState(right, `Too many zeros! Need to shrink window from the left`, 12);
        
        if (localNums[left] === 0) {
          zeroCount--;
          addState(right, `Left element is zero. Zero count decreased to ${zeroCount}`, 13);
        }
        
        left++;
        addState(right, `Left pointer moved to position ${left}`, 15);
        addState(right, `Updated zero count: ${zeroCount}, k: ${localK}`, 11);
      }
      
      // Update max length
      const currentLength = right - left + 1;
      maxLength = Math.max(maxLength, currentLength);
      addState(right, `Window from ${left} to ${right} has length ${currentLength}. Max length updated to ${maxLength}`, 18);
    }

    // Final state
    addState(localNums.length - 1, `Algorithm complete! Maximum consecutive ones with at most ${localK} flips: ${maxLength}`, 21);

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [numsInput, kInput]);

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

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 8; // 8-15 elements
    const zeros = Math.floor(Math.random() * 4) + 2; // 2-5 zeros
    const ones = length - zeros;
    
    const array = [
      ...Array(ones).fill(1),
      ...Array(zeros).fill(0)
    ];
    
    // Shuffle array
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    setNumsInput(array.join(','));
    setKInput(Math.floor(Math.random() * 3) + 1); // k between 1-3
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
  }, [isLoaded, isPlaying, stepBackward, stepForward]);

  const state = history[currentStep] || {};
  const {
    nums = [],
    left = 0,
    right = -1,
    zeroCount = 0,
    maxLength = 0,
    line,
    k = parseInt(kInput) || 0,
    explanation = "",
  } = state;

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-amber-500/20 border-l-4 border-amber-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={line === lineNum ? "text-amber-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const slidingWindowCode = [
    { line: 1, content: "int longestOnes(vector<int>& nums, int k) {" },
    { line: 2, content: "    int left = 0;" },
    { line: 3, content: "    int zeroCount = 0;" },
    { line: 4, content: "    int maxLength = 0;" },
    { line: 5, content: "" },
    { line: 6, content: "    for (int right = 0; right < nums.size(); right++) {" },
    { line: 7, content: "        if (nums[right] == 0) {" },
    { line: 8, content: "            zeroCount++;" },
    { line: 9, content: "        }" },
    { line: 10, content: "" },
    { line: 11, content: "        while (zeroCount > k) {" },
    { line: 12, content: "            if (nums[left] == 0) {" },
    { line: 13, content: "                zeroCount--;" },
    { line: 14, content: "            }" },
    { line: 15, content: "            left++;" },
    { line: 16, content: "        }" },
    { line: 17, content: "" },
    { line: 18, content: "        maxLength = max(maxLength, right - left + 1);" },
    { line: 19, content: "    }" },
    { line: 20, content: "" },
    { line: 21, content: "    return maxLength;" },
    { line: 22, content: "}" },
  ];

  const getCellColor = (index) => {
    const isInWindow = index >= left && index <= right;
    const isZero = nums[index] === 0;
    
    if (isInWindow) {
      if (isZero) {
        return "bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-400 shadow-lg shadow-amber-500/50";
      }
      return "bg-gray-600 border-amber-400 shadow-lg";
    }
    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50";
  };

  const currentWindowLength = right >= left ? right - left + 1 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-amber-400 flex items-center justify-center gap-3">
          <Maximize2 size={28} />
          Max Consecutive Ones III
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find the longest subarray of 1s after flipping at most K zeros (LeetCode #1004)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="array-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={numsInput}
              onChange={(e) => setNumsInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 1,1,1,0,0,0,1,1,1,1,0"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="k-input" className="font-medium text-gray-300 font-mono">
              k:
            </label>
            <input
              id="k-input"
              type="number"
              value={kInput}
              onChange={(e) => setKInput(e.target.value)}
              disabled={isLoaded}
              className="font-mono bg-gray-900 border border-gray-600 rounded-lg p-3 w-20 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={generateHistory}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomArray}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Array
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

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-amber-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Sliding Window Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {slidingWindowCode.map((codeLine) => (
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
            {/* Array Visualization */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Grid size={20} />
                Array Visualization
                {nums.length > 0 && (
                  <span className="text-sm text-gray-400 ml-2">
                    ({nums.length} elements)
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Array with indices */}
                <div className="relative" id="main-array-container">
                  {/* Column headers */}
                  <div className="flex gap-2 mb-2 justify-center">
                    {nums.map((_, index) => (
                      <div key={index} className="w-14 text-center text-xs text-gray-500 font-mono">
                        {index}
                      </div>
                    ))}
                  </div>
                  
                  {/* Array elements */}
                  <div className="flex gap-2 justify-center">
                    {nums.map((num, index) => (
                      <div
                        key={index}
                        id={`main-array-container-element-${index}`}
                        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${
                          (index >= left && index <= right) ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {/* Pointers */}
                  {left !== null && right !== null && (
                    <>
                      <Pointer
                        index={left}
                        containerId="main-array-container"
                        color="red"
                        label="left"
                      />
                      <Pointer
                        index={right}
                        containerId="main-array-container"
                        color="blue"
                        label="right"
                      />
                    </>
                  )}
                </div>

                {/* Current Window Info */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700 w-full max-w-md">
                  <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <Target size={16} />
                    Current Window
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Window:</div>
                      <div className="font-mono text-amber-400">
                        [{left}, {right}]
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Length:</div>
                      <div className="font-mono text-amber-400">
                        {currentWindowLength}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Gauge size={20} />
                  Zeros Flipped
                </h3>
                <div className="text-center">
                  <span className="font-mono text-4xl font-bold text-blue-300">
                    {zeroCount}
                  </span>
                  <span className="text-gray-400 text-2xl mx-2">/</span>
                  <span className="font-mono text-4xl font-bold text-gray-300">
                    {k}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25"
                    style={{ width: `${Math.min((zeroCount / Math.max(k, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Maximize2 size={20} />
                  Window Length
                </h3>
                <div className="font-mono text-4xl font-bold text-center text-purple-300">
                  {currentWindowLength}
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  Current window size
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Max Length Found
                </h3>
                <div className="font-mono text-4xl font-bold text-center text-green-400">
                  {maxLength}
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  Best so far
                </div>
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-amber-700/50">
                <h3 className="font-bold text-lg text-amber-300 mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Left Pointer: <span className="font-mono font-bold text-red-400">{left}</span>
                  </p>
                  <p>
                    Right Pointer: <span className="font-mono font-bold text-blue-400">{right}</span>
                  </p>
                  <p>
                    Zero Count: <span className="font-mono font-bold text-amber-400">{zeroCount}</span>
                  </p>
                  <p>
                    Window Valid: <span className={`font-mono font-bold ${
                      zeroCount <= k ? "text-green-400" : "text-red-400"
                    }`}>
                      {zeroCount <= k ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Step Explanation
                </h3>
                <div className="text-gray-300 text-sm h-20 overflow-y-auto scrollbar-thin">
                  {explanation || "Starting sliding window algorithm..."}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-amber-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-amber-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      Each element is visited at most twice - once by the right pointer 
                      and once by the left pointer. This gives us O(2N) = O(N) time.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Why O(N)?</strong>
                    <p className="text-gray-400 text-sm">
                      The while loop doesn't make it O(N²) because left pointer 
                      moves forward only and never goes backward.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-amber-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(1)</strong>
                    <p className="text-gray-400 text-sm">
                      Only constant extra space is used for pointers and counters.
                      No additional data structures are required.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Optimization</strong>
                    <p className="text-gray-400 text-sm">
                      The algorithm processes the array in-place without 
                      creating any copies or using recursion.
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
            Enter an array and k value to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">Array Format: 1,1,0,0,1,1</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">k: max zeros to flip</span>
            </div>
            <p>
              <strong>Example:</strong> Array: "1,1,1,0,0,0,1,1,1,1,0", k: 2 → Returns 6
            </p>
            <p className="text-gray-500">
              The algorithm finds the longest subarray containing at most k zeros by flipping them to ones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaxConsecutiveOnes;