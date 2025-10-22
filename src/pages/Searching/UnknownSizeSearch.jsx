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
  Binary,
  Infinity,
  FastForward,
  Maximize2,
  ChevronLeft,
  ChevronRight,
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
    blue: { bg: "bg-blue-500", text: "text-blue-500" },
    green: { bg: "bg-green-500", text: "text-green-500" },
    purple: { bg: "bg-purple-500", text: "text-purple-500" },
    orange: { bg: "bg-orange-500", text: "text-orange-500" },
    red: { bg: "bg-red-500", text: "text-red-500" },
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
          borderBottomColor: color === "blue" ? "#3b82f6" : 
                           color === "green" ? "#10b981" : 
                           color === "purple" ? "#8b5cf6" : 
                           color === "orange" ? "#f97316" : "#ef4444"
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

// Mock ArrayReader API simulation
class ArrayReader {
  constructor(array) {
    this.array = array;
  }

  get(index) {
    if (index >= this.array.length) {
      return Number.MAX_SAFE_INTEGER; // Simulate out-of-bounds
    }
    return this.array[index];
  }
}

// Main Component
const UnknownSizeSearch = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("-1, 0, 3, 5, 9, 12, 15, 18, 21, 24, 27, 30");
  const [targetInput, setTargetInput] = useState("24");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(15);
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const localTarget = parseInt(targetInput, 10);

    if (localArray.some(isNaN) || isNaN(localTarget)) {
      alert("Invalid input. Please use comma-separated numbers for the array and a valid target.");
      return;
    }

    const reader = new ArrayReader(localArray);
    const newHistory = [];
    let stepCount = 0;
    let foundIndex = -1;
    let phase = "exponential"; // "exponential" or "binary"
    let left = 0, right = 0;
    let currentBounds = [0, 0];
    let exponentialIndex = 1;

    const addState = (explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        array: [...localArray],
        target: localTarget,
        foundIndex,
        step: stepCount++,
        explanation,
        line,
        phase,
        left,
        right,
        currentBounds: [...currentBounds],
        exponentialIndex,
        reader: reader,
        ...extraProps,
      });
    };

    // Initial setup
    addState("Initialize search in sorted array of unknown size", 1);
    addState(`Target value: ${localTarget}`, 2);
    addState("Starting exponential search to find the bounds...", 3);

    // Phase 1: Exponential Search to find bounds
    addState("Check if array is empty or first element is target", 4);
    if (reader.get(0) === Number.MAX_SAFE_INTEGER) {
      foundIndex = -1;
      addState("Array is empty - target not found", 5);
    } else if (reader.get(0) === localTarget) {
      foundIndex = 0;
      addState("Target found at first element! Index: 0", 6);
    } else {
      exponentialIndex = 1;
      
      // Exponential growth to find bounds
      while (reader.get(exponentialIndex) < localTarget) {
        addState(`Exponential step: Checking index ${exponentialIndex}, value ${reader.get(exponentialIndex)}`, 7);
        addState(`Value ${reader.get(exponentialIndex)} < target ${localTarget}, doubling search range...`, 8);
        
        exponentialIndex *= 2;
        currentBounds = [Math.floor(exponentialIndex / 2), exponentialIndex];
        addState(`New search range: [${Math.floor(exponentialIndex / 2)}, ${exponentialIndex}]`, 9);
      }

      // Set bounds for binary search
      left = Math.floor(exponentialIndex / 2);
      right = exponentialIndex;
      currentBounds = [left, right];
      addState(`Bounds found! Target is between indices ${left} and ${right}`, 10);
      addState(`Switching to binary search within range [${left}, ${right}]`, 11);

      // Phase 2: Binary Search within bounds
      phase = "binary";
      addState("Starting binary search in the identified range", 12);

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midValue = reader.get(mid);
        
        currentBounds = [left, right];
        addState(`Binary search: Checking middle index ${mid}, value ${midValue}`, 13);
        addState(`Current search window: [${left}, ${right}]`, 14);

        if (midValue === localTarget) {
          foundIndex = mid;
          addState(`Target found at index ${mid}`, 15);
          break;
        } else if (midValue === Number.MAX_SAFE_INTEGER || midValue > localTarget) {
          right = mid - 1;
          addState(`Target is smaller or out of bounds, searching left half: [${left}, ${mid - 1}]`, 16);
        } else {
          left = mid + 1;
          addState(`Target is greater, searching right half: [${mid + 1}, ${right}]`, 17);
        }
        
        if (left > right) {
          addState("Search bounds exhausted - target not found", 18);
        }
      }
    }

    // Final state
    if (foundIndex === -1) {
      addState(`Target ${localTarget} not found in the array`, 19);
    } else {
      addState(`Search complete! Target ${localTarget} found at index ${foundIndex}`, 20);
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [arrayInput, targetInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
    setVisibleStart(0);
    setVisibleEnd(15);
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
    const length = Math.floor(Math.random() * 4) + 4; 
    const start = Math.floor(Math.random() * 20) - 10; // -10 to 10
    const array = Array.from({ length }, (_, i) => start + i * 3);
    
    // Pick a random target from the array
    const target = array[Math.floor(Math.random() * array.length)];
    
    setArrayInput(array.join(', '));
    setTargetInput(target.toString());
    resetVisualization();
  };

  const scrollLeft = () => {
    setVisibleStart(prev => Math.max(0, prev - 5));
    setVisibleEnd(prev => Math.max(15, prev - 5));
  };

  const scrollRight = () => {
    setVisibleStart(prev => prev + 5);
    setVisibleEnd(prev => prev + 5);
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
    array = [],
    target = 0,
    foundIndex = -1,
    line,
    explanation = "",
    phase = "exponential",
    left = 0,
    right = 0,
    currentBounds = [0, 0],
    exponentialIndex = 1,
    reader,
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        isActive
          ? "bg-purple-500/20 border-l-4 border-purple-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={isActive ? "text-purple-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const unknownSizeSearchCode = [
    { line: 1, content: "#include <vector>" },
    { line: 2, content: "using namespace std;" },
    { line: 3, content: "" },
    { line: 4, content: "int searchUnknownSize(ArrayReader& reader, int target) {" },
    { line: 5, content: "    // Handle empty array case" },
    { line: 6, content: "    if (reader.get(0) == INT_MAX) return -1;" },
    { line: 7, content: "    if (reader.get(0) == target) return 0;" },
    { line: 8, content: "    " },
    { line: 9, content: "    // Exponential search to find bounds" },
    { line: 10, content: "    int i = 1;" },
    { line: 11, content: "    while (reader.get(i) < target) {" },
    { line: 12, content: "        i *= 2; // Double the range" },
    { line: 13, content: "    }" },
    { line: 14, content: "    " },
    { line: 15, content: "    // Binary search in found range" },
    { line: 16, content: "    int left = i / 2, right = i;" },
    { line: 17, content: "    while (left <= right) {" },
    { line: 18, content: "        int mid = (left + right) / 2;" },
    { line: 19, content: "        int val = reader.get(mid);" },
    { line: 20, content: "        if (val == target) return mid;" },
    { line: 21, content: "        else if (val > target || val == INT_MAX)" },
    { line: 22, content: "            right = mid - 1;" },
    { line: 23, content: "        else left = mid + 1;" },
    { line: 24, content: "    }" },
    { line: 25, content: "    " },
    { line: 26, content: "    return -1; // Not found" },
    { line: 27, content: "}" },
];

  const getCellColor = (index) => {
    const [boundsLeft, boundsRight] = currentBounds;
    const isInCurrentBounds = index >= boundsLeft && index <= boundsRight;
    const isOutOfBounds = reader && reader.get(index) === Number.MAX_SAFE_INTEGER;
    const isTargetFound = index === foundIndex;

    if (isTargetFound) {
      return "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-500 shadow-lg shadow-green-500/50 scale-110";
    }

    if (isOutOfBounds) {
      return "bg-gradient-to-br from-red-500 to-pink-600 text-white border-red-500 shadow-lg shadow-red-500/50";
    }

    if (isInCurrentBounds) {
      if (phase === "exponential") {
        return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-blue-500 shadow-lg shadow-blue-500/50";
      } else {
        return "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/50";
      }
    }

    if (index === exponentialIndex && phase === "exponential") {
      return "bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-500 shadow-lg shadow-orange-500/50";
    }

    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50";
  };

  const getCurrentPointerIndex = () => {
    if (phase === "exponential") {
      return exponentialIndex;
    } else {
      // For binary search phase, show the middle index
      return Math.floor((left + right) / 2);
    }
  };

  const getPointerColor = () => {
    if (phase === "exponential") {
      return "orange";
    } else {
      const mid = Math.floor((left + right) / 2);
      if (reader && reader.get(mid) === target) {
        return "green";
      }
      return "purple";
    }
  };

  const getPointerLabel = () => {
    if (phase === "exponential") {
      return "Exp Check";
    } else {
      return "Binary Check";
    }
  };

  // Calculate visible indices for the array visualization
  const totalIndices = Math.max(array.length * 2, 30);
  const visibleIndices = Array.from({ length: totalIndices }, (_, i) => i)
    .filter(i => i >= visibleStart && i <= visibleEnd);

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <Infinity size={28} />
          Search in Sorted Array of Unknown Size
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          LeetCode #702 - Search target in a sorted array of unknown size using exponential search approach
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="array-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Sorted Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., -1, 0, 3, 5, 9, 12, 15, 18, 21, 24"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="target-input" className="font-medium text-gray-300 font-mono">
              Target:
            </label>
            <input
              id="target-input"
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              disabled={isLoaded}
              className="font-mono bg-gray-900 border border-gray-600 rounded-lg p-3 w-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={generateHistory}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomArray}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
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
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Algorithm Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {unknownSizeSearchCode.map((codeLine) => (
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

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Array Visualization */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Grid size={20} />
                Array Visualization (Unknown Size)
                {array.length > 0 && (
                  <span className="text-sm text-gray-400 ml-2">
                    (Actual size: {array.length} elements)
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* Target and Phase Display */}
                <div className="flex gap-4 w-full max-w-md">
                  <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 flex-1">
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Target size={16} />
                      Target Value
                    </h4>
                    <div className="font-mono text-xl font-bold text-center text-purple-400">
                      {target}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 flex-1">
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Zap size={16} />
                      Current Phase
                    </h4>
                    <div className="font-mono text-sm font-bold text-center text-blue-400 capitalize">
                      {phase} Search
                    </div>
                  </div>
                </div>

                {/* Scrollable Array Container */}
                <div className="w-full max-w-4xl">
                  {/* Scroll Controls */}
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={scrollLeft}
                      disabled={visibleStart === 0}
                      className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="text-xs text-gray-500 font-mono">
                      Showing indices {visibleStart} to {visibleEnd}
                    </div>
                    <button
                      onClick={scrollRight}
                      disabled={visibleEnd >= totalIndices - 1}
                      className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Array with indices */}
                  <div className="relative bg-gray-900/50 rounded-lg p-4" id="main-array-container">
                    {/* Column headers */}
                    <div className="flex gap-1 mb-2 justify-center flex-wrap">
                      {visibleIndices.map((index) => (
                        <div key={index} className="w-8 text-center text-xs text-gray-500 font-mono">
                          {index}
                        </div>
                      ))}
                    </div>
                    
                    {/* Array elements */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {visibleIndices.map((index) => {
                        const value = reader ? reader.get(index) : (index < array.length ? array[index] : Number.MAX_SAFE_INTEGER);
                        const displayValue = value === Number.MAX_SAFE_INTEGER ? "∞" : value;
                        
                        return (
                          <div
                            key={index}
                            id={`main-array-container-element-${index}`}
                            className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-xs transition-all duration-500 transform ${getCellColor(index)}`}
                          >
                            {displayValue}
                          </div>
                        );
                      })}
                    </div>

                    {/* Current bounds highlight */}
                    {currentBounds[1] > currentBounds[0] && visibleIndices.some(i => i >= currentBounds[0] && i <= currentBounds[1]) && (
                      <div
                        className="absolute h-1 bg-gradient-to-r from-purple-500/40 to-blue-500/40 rounded-full transition-all duration-500"
                        style={{
                          left: `${((Math.max(currentBounds[0], visibleStart) - visibleStart) / visibleIndices.length) * 100}%`,
                          width: `${((Math.min(currentBounds[1], visibleEnd) - Math.max(currentBounds[0], visibleStart) + 1) / visibleIndices.length) * 100}%`,
                          top: '4px'
                        }}
                      />
                    )}

                    {/* Pointer */}
                    {getCurrentPointerIndex() >= 0 && visibleIndices.includes(getCurrentPointerIndex()) && (
                      <Pointer
                        index={getCurrentPointerIndex() - visibleStart}
                        containerId="main-array-container"
                        color={getPointerColor()}
                        label={getPointerLabel()}
                      />
                    )}
                  </div>
                </div>

                {/* Search Status */}
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-xl p-4 border border-green-700/50 w-full max-w-md">
                  <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <Gauge size={16} />
                    Search Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Current Bounds:</div>
                      <div className="font-mono text-green-400">
                        [{currentBounds[0]}, {currentBounds[1]}]
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Bounds Size:</div>
                      <div className="font-mono text-green-400">
                        {currentBounds[1] - currentBounds[0] + 1}
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
                  <Clock size={20} />
                  Time Complexity
                </h3>
                <div className="text-center">
                  <span className="font-mono text-2xl font-bold text-blue-300">
                    O(log n)
                  </span>
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  Exponential + Binary search
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Cpu size={20} />
                  Space Complexity
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-purple-300">
                  O(1)
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  Constant extra space
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Result
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-green-400">
                  {foundIndex !== -1 ? foundIndex : "Not Found"}
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  {foundIndex !== -1 ? `Found at index ${foundIndex}` : "Target not in array"}
                </div>
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-900/40 to-amber-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-orange-700/50">
                <h3 className="font-bold text-lg text-orange-300 mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  Algorithm State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Phase: <span className="font-mono font-bold text-purple-400 capitalize">{phase}</span>
                  </p>
                  <p>
                    Search Bounds: <span className="font-mono font-bold text-blue-400">
                      [{currentBounds[0]}, {currentBounds[1]}]
                    </span>
                  </p>
                  <p>
                    Exponential Index: <span className="font-mono font-bold text-orange-400">
                      {exponentialIndex}
                    </span>
                  </p>
                  <p>
                    Progress: <span className="font-mono font-bold text-green-400">
                      {Math.round(((currentStep + 1) / history.length) * 100)}%
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
                  {explanation || "Starting search in array of unknown size..."}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Maximize2 size={20} /> Algorithm Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Key Features
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 block mb-1">Handles Unknown Size</strong>
                    <p className="text-gray-400 text-sm">
                      Uses exponential growth to efficiently find bounds without knowing array size.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 block mb-1">Two-Phase Approach</strong>
                    <p className="text-gray-400 text-sm">
                      First exponential search to find bounds, then binary search within those bounds.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 block mb-1">Out-of-Bounds Detection</strong>
                    <p className="text-gray-400 text-sm">
                      Simulates ArrayReader API that returns special value for out-of-bounds access.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Binary size={16} />
                  Performance
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 block mb-1">Time: O(log n)</strong>
                    <p className="text-gray-400 text-sm">
                      Exponential phase: O(log i) where i is target position. Binary phase: O(log n).
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 block mb-1">Space: O(1)</strong>
                    <p className="text-gray-400 text-sm">
                      Only uses constant extra space for pointers and bounds.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 block mb-1">Optimal for Unbounded</strong>
                    <p className="text-gray-400 text-sm">
                      Perfect for infinite streams or arrays where size is unknown.
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
            Enter a sorted array and target value to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Array must be sorted</span>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Simulates unknown size</span>
            </div>
            <p>
              <strong>Example:</strong> Array: "-1, 0, 3, 5, 9, 12, 15, 18, 21, 24", Target: 24 → Returns 9
            </p>
            <p className="text-gray-500">
              The algorithm doesn't know the array size and uses exponential search to find bounds before binary search.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnknownSizeSearch;