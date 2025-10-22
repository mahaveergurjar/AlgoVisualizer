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
  Type,
  ArrowUp,
  ArrowDown,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Enhanced Pointer Component with green theme
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
    green: { bg: "bg-green-500", text: "text-green-500", glow: "shadow-green-500/50" },
    teal: { bg: "bg-teal-500", text: "text-teal-500", glow: "shadow-teal-500/50" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-500", glow: "shadow-emerald-500/50" },
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
            borderBottomColor: color === "green" ? "#10b981" : 
                             color === "teal" ? "#14b8a6" : 
                             color === "emerald" ? "#10b981" : "#f59e0b"
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
const SmallestLetter = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [lettersInput, setLettersInput] = useState("c, f, j, k, m, p, r, t, v, x, z");
  const [targetInput, setTargetInput] = useState("k");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [searchStats, setSearchStats] = useState({ comparisons: 0, checks: 0 });
  const visualizerRef = useRef(null);

  const generateHistory = useCallback(() => {
    const localLetters = lettersInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(s => s.charAt(0)); // Take first character only
    const localTarget = targetInput.trim().charAt(0);

    if (localLetters.some(char => !char.match(/[a-z]/i)) || !localTarget.match(/[a-z]/i)) {
      alert("Invalid input. Please use comma-separated letters (a-z) and a single letter target.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let result = null;
    let currentIndex = -1;
    let comparisons = 0;
    let checks = 0;

    const addState = (index = -1, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        letters: [...localLetters],
        target: localTarget,
        currentIndex: index,
        result,
        step: stepCount++,
        explanation,
        line,
        comparisons,
        checks,
        ...extraProps,
      });
    };

    // Initial setup
    addState(-1, "Starting search for smallest letter greater than target", 1);
    addState(-1, `Target letter: '${localTarget}'`, 2);
    addState(-1, "Starting linear scan through the sorted letters array...", 3);

    // Main algorithm loop
    for (let i = 0; i < localLetters.length; i++) {
      currentIndex = i;
      checks++;
      const currentChar = localLetters[i];
      
      addState(i, `Checking letter at index ${i}: '${currentChar}'`, 4);
      
      comparisons++;
      addState(i, `Comparing '${currentChar}' with target '${localTarget}'`, 5);
      
      // Compare characters lexicographically
      if (currentChar > localTarget) {
        result = currentChar;
        addState(i, `Found letter '${currentChar}' that is greater than '${localTarget}'`, 6, { isMatch: true });
        addState(i, `This is the smallest such letter since array is sorted`, 7);
        break;
      } else {
        addState(i, `'${currentChar}' is not greater than '${localTarget}', moving to next letter`, 8);
      }
      
      // Show moving to next element
      if (i < localLetters.length - 1) {
        addState(i, `Moving to next index: ${i + 1}`, 4);
      }
    }

    // Handle wrap-around case (return first letter if no greater letter found)
    if (result === null) {
      result = localLetters[0];
      addState(localLetters.length - 1, `No letter found greater than '${localTarget}'`, 9);
      addState(localLetters.length - 1, `Wrapping around to first letter: '${result}'`, 10);
    }

    // Final state
    addState(currentIndex, `RESULT: '${result}' is the smallest letter greater than '${localTarget}'`, 11, { isComplete: true });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
    setSearchStats({ comparisons, checks });
  }, [lettersInput, targetInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
    setSearchStats({ comparisons: 0, checks: 0 });
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

  const generateRandomLetters = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const length = Math.floor(Math.random() * 4) + 5; // 5-8 letters
    const letters = [];
    
    // Generate sorted unique letters
    while (letters.length < length) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!letters.includes(randomChar)) {
        letters.push(randomChar);
      }
    }
    letters.sort();
    
    // Pick a random target (not the last one to allow finding greater letter)
    const targetIndex = Math.floor(Math.random() * (letters.length - 1));
    const target = letters[targetIndex];
    
    setLettersInput(letters.join(', '));
    setTargetInput(target);
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
    letters = [],
    target = '',
    currentIndex = -1,
    result = null,
    line,
    explanation = "",
    comparisons = 0,
    checks = 0,
    isMatch = false,
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
    <div
      className={`block rounded-lg transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20 scale-[1.02]"
          : isHighlighted
          ? "bg-teal-500/10 border-teal-500/50"
          : "border-transparent hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={`font-mono ${isActive ? "text-green-300 font-bold" : isHighlighted ? "text-teal-300" : "text-gray-300"}`}>
        {content}
      </span>
    </div>
  );

  const smallestLetterCode = [
    { line: 1, content: "#include <vector>" },
    { line: 2, content: "using namespace std;" },
    { line: 3, content: "" },
    { line: 4, content: "char nextGreatestLetter(vector<char>& letters, char target) {" },
    { line: 5, content: "    // Find smallest letter greater than target" },
    { line: 6, content: "    for (int i = 0; i < letters.size(); i++) {" },
    { line: 7, content: "        // Check each letter" },
    { line: 8, content: "        if (letters[i] > target) {" },
    { line: 9, content: "            return letters[i]; // Found result" },
    { line: 10, content: "        }" },
    { line: 11, content: "    }" },
    { line: 12, content: "    // No greater letter found" },
    { line: 13, content: "    return letters[0]; // Wrap to first" },
    { line: 14, content: "}" },
];

  const getCellColor = (index, char) => {
    if (index === currentIndex) {
      if (char > target) {
        return "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-2 border-green-400 shadow-lg shadow-green-500/50 scale-110 animate-pulse";
      }
      return "bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-2 border-teal-400 shadow-lg shadow-teal-500/50 scale-110";
    }
    
    if (index < currentIndex) {
      if (letters[index] === result && letters[index] > target) {
        return "bg-gradient-to-br from-green-500/80 to-emerald-600/80 text-white border-green-500/60 shadow-lg";
      }
      return "bg-gray-600 border-gray-500 shadow-inner";
    }
    
    if (result && letters[index] === result) {
      return "bg-gradient-to-br from-emerald-500 to-green-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/50";
    }
    
    return "bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-600/70 transition-colors";
  };

  const getComparisonSymbol = (char) => {
    if (char === target) return "=";
    if (char > target) return ">";
    return "<";
  };

  const getComparisonColor = (char) => {
    if (char === target) return "text-yellow-400";
    if (char > target) return "text-green-400";
    return "text-red-400";
  };

  const getPointerColor = () => {
    if (currentIndex >= 0 && letters[currentIndex] > target) return "green";
    return "teal";
  };

  const getPointerLabel = () => {
    if (currentIndex >= 0 && letters[currentIndex] > target) return "Found!";
    return "Checking";
  };

  const progressPercentage = letters.length > 0 ? ((currentIndex + 1) / letters.length) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-4">
          Smallest Letter Greater Than Target
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          LeetCode #744 - Find the smallest character in letters that is lexicographically greater than target{" "}
          <span className="text-green-400 font-semibold">Linear scan with wrap-around.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <MousePointer className="h-4 w-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">O(n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-full border border-teal-500/30">
            <Cpu className="h-4 w-4 text-teal-400" />
            <span className="text-teal-300 text-sm font-medium">O(1) Space</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/30">
            <Type className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">Lexicographical</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <Mail className="h-4 w-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">Wrap-around</span>
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
                Sorted Letters
              </label>
              <input
                type="text"
                value={lettersInput}
                onChange={(e) => setLettersInput(e.target.value)}
                disabled={isLoaded}
                placeholder="Enter sorted letters separated by commas..."
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              />
            </div>
            <div className="sm:w-32">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Target className="inline w-4 h-4 mr-2" />
                Target Letter
              </label>
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                disabled={isLoaded}
                maxLength={1}
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 font-mono text-center text-xl"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomLetters}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25 cursor-pointer flex items-center gap-2"
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
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {!isPlaying ? (
                    <button
                      onClick={playAnimation}
                      disabled={currentStep >= history.length - 1}
                      className="bg-green-500 hover:bg-green-600 p-3 rounded-xl disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
                    <ChevronRight className="h-5 w-5" />
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
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer focus:ring-2 focus:ring-green-500"
                    >
                      <option value={2000}>Slow</option>
                      <option value={1000}>Medium</option>
                      <option value={500}>Fast</option>
                      <option value={250}>Very Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                    <div className="text-green-400 font-bold">{currentStep + 1}</div>
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
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/25"
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
              <h3 className="font-bold text-2xl text-green-400 flex items-center gap-3">
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
                    {smallestLetterCode.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                        isHighlighted={[5, 6, 7, 10].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Complexity Cards */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Complexity
                </h3>
                <div className="text-center">
                  <span className="font-mono text-2xl font-bold text-green-300">
                    O(n)
                  </span>
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">
                  Linear scan through array
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 backdrop-blur-sm p-4 rounded-xl border border-teal-700/50">
                <h3 className="font-bold text-lg text-teal-300 mb-2 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Space Complexity
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-teal-300">
                  O(1)
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">
                  Constant extra space
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-sm p-4 rounded-xl border border-emerald-700/50">
                <h3 className="font-bold text-lg text-emerald-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Result
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-emerald-400">
                  '{result || "?"}'
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">
                  {result ? `Smallest letter > '${target}'` : "Searching..."}
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="xl:col-span-2 space-y-8">
            {/* Letters Visualization */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3">
                  <Grid className="h-6 w-6 text-green-400" />
                  Letters Array Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                  {letters.length} letters
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Target and Result Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm p-5 rounded-xl border border-green-700/50">
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Target Letter
                    </h4>
                    <div className="font-mono text-2xl font-bold text-center text-green-400">
                      '{target}'
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 backdrop-blur-sm p-5 rounded-xl border border-teal-700/50">
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Current Letter
                    </h4>
                    <div className="font-mono text-xl font-bold text-center text-teal-400">
                      {currentIndex >= 0 ? `'${letters[currentIndex]}'` : "—"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 backdrop-blur-sm p-5 rounded-xl border border-emerald-700/50">
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Result
                    </h4>
                    <div className="font-mono text-xl font-bold text-center text-emerald-400">
                      '{result || "?"}'
                    </div>
                  </div>
                </div>

                {/* Letters array with indices and comparisons */}
                <div className="w-full">
                  <div className="relative bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50" id="main-array-container">
                    {/* Column headers */}
                    <div className="flex gap-3 mb-4 justify-center">
                      {letters.map((_, index) => (
                        <div key={index} className="w-16 text-center">
                          <div className="text-xs text-gray-500 font-mono mb-2">Index</div>
                          <div className="text-sm font-bold text-gray-400 bg-gray-800/50 rounded-lg py-1 px-2 border border-gray-600/50">
                            {index}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Letters elements */}
                    <div className="flex gap-3 justify-center mb-4">
                      {letters.map((char, index) => (
                        <div
                          key={index}
                          id={`main-array-container-element-${index}`}
                          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index, char)} relative`}
                        >
                          {char}
                          {index === currentIndex && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 animate-ping">
                              !
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Comparison symbols */}
                    <div className="flex gap-3 justify-center">
                      {letters.map((char, index) => (
                        <div key={index} className="w-16 text-center">
                          {index === currentIndex && (
                            <div className={`text-lg font-bold ${getComparisonColor(char)}`}>
                              {getComparisonSymbol(char)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pointer */}
                    {currentIndex >= 0 && (
                      <Pointer
                        index={currentIndex}
                        containerId="main-array-container"
                        color={getPointerColor()}
                        label={getPointerLabel()}
                        isFound={letters[currentIndex] > target}
                      />
                    )}
                  </div>
                </div>

                {/* Search Status */}
                <div className="bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/50 w-full max-w-2xl shadow-xl">
                  <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-teal-400" />
                    Search Status
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="text-gray-400">Current Index</div>
                      <div className="font-mono text-xl font-bold text-green-400 bg-gray-900/50 py-2 rounded-lg text-center border border-green-700/30">
                        {currentIndex >= 0 ? currentIndex : "—"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">Letters Checked</div>
                      <div className="font-mono text-xl font-bold text-teal-400 bg-gray-900/50 py-2 rounded-lg text-center border border-teal-700/30">
                        {currentIndex + 1}/{letters.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">Comparisons</div>
                      <div className="font-mono text-xl font-bold text-emerald-400 bg-gray-900/50 py-2 rounded-lg text-center border border-emerald-700/30">
                        {comparisons}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">Progress</div>
                      <div className="font-mono text-xl font-bold text-amber-400 bg-gray-900/50 py-2 rounded-lg text-center border border-amber-700/30">
                        {Math.round(progressPercentage)}%
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
                    <span className="text-gray-300">Current Letter</span>
                    <span className="font-mono font-bold text-green-400 text-lg">
                      {currentIndex >= 0 ? `'${letters[currentIndex]}'` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Target</span>
                    <span className="font-mono font-bold text-teal-400 text-lg">'{target}'</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Comparison</span>
                    <span className={`font-mono font-bold ${
                      currentIndex >= 0 ? getComparisonColor(letters[currentIndex]) : "text-gray-400"
                    } text-lg`}>
                      {currentIndex >= 0 ? `${letters[currentIndex]} ${getComparisonSymbol(letters[currentIndex])} ${target}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Match Found</span>
                    <span className={`font-mono font-bold ${currentIndex >= 0 && letters[currentIndex] > target ? "text-green-400" : "text-red-400"} text-lg`}>
                      {currentIndex >= 0 && letters[currentIndex] > target ? "YES" : "NO"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-teal-700/50">
                <h3 className="font-bold text-xl text-teal-300 mb-4 flex items-center gap-3">
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
                      Search Completed Successfully!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-2xl text-green-400 mb-6 flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                Problem Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-green-300 text-lg flex items-center gap-2">
                    <ArrowUp className="h-5 w-5" />
                    Key Insights
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Sorted Array Advantage</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Since the array is sorted, the first letter we find that is greater than the target 
                        is guaranteed to be the smallest such letter.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Wrap-around Behavior</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        If no letter is greater than target, we return the first letter (circular behavior).
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Lexicographical Comparison</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Letters are compared using their Unicode values, which follows alphabetical order.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-green-300 text-lg flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Optimization Notes
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-teal-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Binary Search Alternative</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        This can be optimized to O(log n) using binary search since the array is sorted.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-teal-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Early Termination</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Linear search stops immediately when a greater letter is found due to sorted property.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-teal-500/30 transition-all">
                      <strong className="text-teal-300 block mb-2 text-sm">Edge Cases</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Handles cases where target is the last letter or greater than all letters.
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
              🚀 Ready to visualize Smallest Letter Search?
            </div>
            <div className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enter sorted letters and a target letter to find the smallest letter greater than target.
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-8">
              <div className="bg-green-500/10 text-green-300 px-4 py-2 rounded-full border border-green-500/20 flex items-center gap-2">
                <MousePointer className="h-3 w-3" />
                Click "Start Visualization" to begin
              </div>
              <div className="bg-teal-500/10 text-teal-300 px-4 py-2 rounded-full border border-teal-500/20 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Use "Random" for quick examples
              </div>
              <div className="bg-emerald-500/10 text-emerald-300 px-4 py-2 rounded-full border border-emerald-500/20 flex items-center gap-2">
                <Type className="h-3 w-3" />
                Lexicographical search
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/30 text-left">
              <div className="text-green-400 font-mono text-sm mb-2">💡 Example Usage:</div>
              <div className="text-gray-400 text-sm space-y-1">
                <div>Letters: <span className="text-green-300 font-mono">c, f, j, k, m, p, r, t, v, x, z</span></div>
                <div>Target: <span className="text-teal-300 font-mono">k</span></div>
                <div className="text-gray-500 text-xs mt-2">→ Returns 'm' (smallest letter greater than 'k')</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmallestLetter;