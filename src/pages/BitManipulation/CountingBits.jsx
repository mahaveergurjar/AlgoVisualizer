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
  ArrowLeft,
} from "lucide-react";

// Enhanced Code Line Component
const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
  <div
    className={`block rounded-lg transition-all duration-300 border-l-4 ${
      isActive
        ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]"
        : isHighlighted
        ? "bg-blue-500/10 border-blue-500/50"
        : "border-transparent hover:bg-gray-700/30"
    }`}
  >
    <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
      {lineNum}
    </span>
    <span className={`font-mono ${isActive ? "text-purple-300 font-bold" : isHighlighted ? "text-blue-300" : "text-gray-300"}`}>
      {content}
    </span>
  </div>
);

// Binary Visualization Component
const BinaryVisualization = ({ number, bitCount, bitWidth = 8, isActive = false }) => {
  const binary = number.toString(2).padStart(bitWidth, '0');
  const activeBits = number.toString(2).split('').filter(bit => bit === '1').length;

  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400 scale-105 shadow-lg shadow-purple-500/50" 
        : "bg-gray-800 border-gray-700"
    }`}>
      <div className="text-center">
        <div className="text-2xl font-bold mb-2">{number}</div>
        <div className="text-xs font-mono text-gray-400 mb-3 break-all">Binary: {binary}</div>
        <div className="flex justify-center gap-1 mb-3 flex-wrap">
          {binary.split('').map((bit, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${
                bit === '1' 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {bit}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-300">
          → <span className="text-green-400 font-bold">{activeBits}</span> set bit{activeBits !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

// Main Component
const CountingBits = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("5");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [bitWidth, setBitWidth] = useState(8);
  const visualizerRef = useRef(null);

  const countBits = (num) => {
    let count = 0;
    let temp = num;
    while (temp) {
      count += temp & 1;
      temp >>>= 1;
    }
    return count;
  };

  const generateHistory = useCallback((maxN) => {
    const newHistory = [];
    const results = [];
    let stepCount = 0;

    const addState = (currentNum = null, binary = "", bitCount = null, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        currentNum,
        binary,
        bitCount,
        results: [...results],
        explanation,
        line,
        step: stepCount++,
        ...extraProps,
      });
    };

    // Initial setup
    addState(
      null, "", null, 
      "Starting Counting Bits Algorithm\n" +
      `Counting set bits for numbers from 0 to ${maxN}\n` +
      "Using Brian Kernighan's algorithm for efficiency",
      1,
      { phase: "init" }
    );

    addState(
      null, "", null,
      `Problem: Generate array ans where ans[i] = number of 1's in binary representation of i\n` +
      `Range: 0 to ${maxN} (${maxN + 1} numbers total)`,
      2,
      { phase: "problem" }
    );

    // Process each number
    for (let i = 0; i <= maxN; i++) {
      const binary = i.toString(2).padStart(bitWidth, '0');
      const bitCount = countBits(i);
      
      // Show current number
      addState(
        i, binary, bitCount,
        `Processing number ${i}\n` +
        `Binary: ${binary}\n` +
        `Starting bit count calculation...`,
        3,
        { phase: "processing" }
      );

      // Show bit counting process for demonstration
      if (i > 0) {
        let temp = i;
        let steps = 0;
        while (temp) {
          const prevTemp = temp;
          temp = temp & (temp - 1);
          steps++;
          
          if (temp > 0) {
            addState(
              i, binary, bitCount,
              `Brian Kernighan's step ${steps}: ${prevTemp} & (${prevTemp} - 1) = ${temp}\n` +
              `Remaining bits to check: ${temp.toString(2).padStart(bitWidth, '0')}`,
              4,
              { phase: "counting", substep: steps }
            );
          }
        }
      }

      // Add result
      results.push({ num: i, binary, count: bitCount });
      
      addState(
        i, binary, bitCount,
        `Completed: ${i} → ${bitCount} set bits\n` +
        `Binary: ${binary} has ${bitCount} '1' bits\n` +
        (i < maxN ? `Moving to next number: ${i + 1}` : "Finalizing results..."),
        5,
        { phase: "result", isComplete: i === maxN }
      );
    }

    // Final state
    addState(
      null, "", null,
      `🎉 Algorithm Complete!\n` +
      `Generated array: [${results.map(r => r.count).join(', ')}]\n` +
      `All numbers from 0 to ${maxN} processed successfully`,
      6,
      { phase: "complete", isFinal: true }
    );

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [bitWidth]);

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

  const handleStart = () => {
    const maxN = parseInt(nInput, 10);
    if (isNaN(maxN) || maxN < 0 || maxN > 20) {
      alert("Please enter a valid number between 0 and 20 for visualization.");
      return;
    }
    generateHistory(maxN);
  };

  const generateRandomN = () => {
    const randomN = Math.floor(Math.random() * 11) + 5; // 5-15
    setNInput(randomN.toString());
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
    currentNum = null,
    binary = "",
    bitCount = null,
    results = [],
    line,
    explanation = "",
    phase = "init",
    isComplete = false,
    isFinal = false,
  } = state;

  const countingBitsCode = [
    { line: 1, content: "vector<int> countBits(int n) {" },
    { line: 2, content: "  vector<int> ans(n + 1);" },
    { line: 3, content: "  for (int i = 0; i <= n; i++) {" },
    { line: 4, content: "    ans[i] = countOnes(i);" },
    { line: 5, content: "  }" },
    { line: 6, content: "  return ans;" },
    { line: 7, content: "}" },
    { line: 8, content: "" },
    { line: 9, content: "int countOnes(int x) {" },
    { line: 10, content: "  int count = 0;" },
    { line: 11, content: "  while (x) {" },
    { line: 12, content: "    count++;" },
    { line: 13, content: "    x &= (x - 1); // Brian Kernighan's" },
    { line: 14, content: "  }" },
    { line: 15, content: "  return count;" },
    { line: 16, content: "}" },
  ];

  const progressPercentage = results.length > 0 ? ((results.length) / (parseInt(nInput) + 1)) * 100 : 0;

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none min-h-screen"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-8 relative z-10">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-4">
          Counting Bits
        </h1>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Count the number of 1's in binary representation for all numbers from 0 to n.{" "}
          <span className="text-purple-400 font-semibold">Efficient bit manipulation magic.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">O(n) Time</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
            <Cpu className="h-4 w-4 text-green-400" />
            <span className="text-green-300 text-sm font-medium">O(1) Space per number</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/30">
            <Binary className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Brian Kernighan's Algorithm</span>
          </div>
        </div>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700/50 mb-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-grow w-full">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                <Target className="inline w-4 h-4 mr-2" />
                Maximum Number (n)
              </label>
              <input
                type="number"
                value={nInput}
                onChange={(e) => setNInput(e.target.value)}
                disabled={isLoaded}
                min="0"
                max="20"
                placeholder="Enter n (0-20 for visualization)..."
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 font-mono text-center"
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
                className="w-full bg-gray-900/80 border border-gray-600 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 font-mono"
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {!isLoaded ? (
              <>
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25 cursor-pointer flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Visualization
                </button>
                <button
                  onClick={generateRandomN}
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
                      <option value={1500}>Slow</option>
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
              <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <pre className="text-sm leading-relaxed">
                  <code className="font-mono block space-y-1">
                    {countingBitsCode.map((codeLine) => (
                      <CodeLine 
                        key={codeLine.line} 
                        lineNum={codeLine.line} 
                        content={codeLine.content}
                        isActive={line === codeLine.line}
                        isHighlighted={[3, 4, 11, 12, 13].includes(codeLine.line)}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-blue-400">{results.length}</div>
                <div className="text-xs text-gray-400">Numbers Processed</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-2xl font-bold text-green-400">{parseInt(nInput) + 1}</div>
                <div className="text-xs text-gray-400">Total Numbers</div>
              </div>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="xl:col-span-2 space-y-8 overflow-x-hidden">
            {/* Current Number Visualization */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3">
                  <Binary className="h-6 w-6 text-purple-400" />
                  Current Number Analysis
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                  Step {currentStep + 1}
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-8">
                {/* Current Number Display */}
                {currentNum !== null && (
                  <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-6 rounded-2xl border border-purple-700/50 w-full max-w-full shadow-xl">
                    <h4 className="text-lg text-gray-300 mb-4 flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-purple-400" />
                      Processing Number
                    </h4>
                    <div className="font-mono text-4xl font-bold text-center text-purple-400 bg-gray-900/50 py-4 rounded-xl border border-purple-700/30">
                      {currentNum}
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                        <div className="text-gray-400">Binary</div>
                        <div className="text-green-300 font-mono break-all">{binary}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                        <div className="text-gray-400">Set Bits</div>
                        <div className="text-amber-300 font-mono text-xl">{bitCount}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Binary Visualization */}
                {currentNum !== null && (
                  <div className="w-full max-w-full">
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 overflow-x-auto">
                      <h4 className="text-lg text-gray-300 mb-4 text-center">
                        Binary Representation
                      </h4>
                      <div className="flex justify-center gap-2 mb-4 flex-wrap min-w-fit mx-auto" style={{ maxWidth: 'fit-content' }}>
                        {binary.split('').map((bit, index) => (
                          <div key={index} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">2<sup>{bitWidth - 1 - index}</sup></div>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                              bit === '1' 
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 scale-110' 
                                : 'bg-gray-600 text-gray-300'
                            }`}>
                              {bit}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center text-sm text-gray-400">
                        Total set bits: <span className="text-green-400 font-bold">{bitCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div className="bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-2xl text-gray-200 flex items-center gap-3">
                  <Grid className="h-6 w-6 text-purple-400" />
                  Results Array
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                  {results.length} of {parseInt(nInput) + 1} numbers
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((result) => (
                  <BinaryVisualization
                    key={result.num}
                    number={result.num}
                    bitCount={result.count}
                    bitWidth={bitWidth}
                    isActive={result.num === currentNum}
                  />
                ))}
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
                    <span className="text-gray-300">Current Number</span>
                    <span className="font-mono font-bold text-amber-400 text-lg">
                      {currentNum !== null ? currentNum : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Set Bits</span>
                    <span className="font-mono font-bold text-green-400 text-lg">
                      {bitCount !== null ? bitCount : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-amber-700/30">
                    <span className="text-gray-300">Numbers Processed</span>
                    <span className="font-mono font-bold text-purple-400 text-lg">
                      {results.length}/{parseInt(nInput) + 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Algorithm Phase</span>
                    <span className="font-mono font-bold text-blue-400 text-lg capitalize">
                      {phase}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Step Explanation */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-xl text-purple-300 mb-4 flex items-center gap-3">
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
                {isFinal && (
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
              <h3 className="font-bold text-2xl text-purple-400 mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6" />
                Algorithm Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-purple-300 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Brian Kernighan's Algorithm
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-cyan-300 block mb-2 text-sm">x & (x - 1)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Clears the rightmost set bit in each iteration. Extremely efficient for sparse numbers.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-cyan-300 block mb-2 text-sm">Iterations = Set Bits</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Only loops as many times as there are set bits, not the total bit length.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                      <strong className="text-cyan-300 block mb-2 text-sm">Bit Manipulation</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Uses fast hardware-level operations. Much faster than string conversion methods.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-semibold text-purple-300 text-lg flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Performance Characteristics
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-green-300 block mb-2 text-sm">Time: O(n log n)</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        For n numbers, each takes O(k) where k is number of set bits. Optimal for this problem.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-green-300 block mb-2 text-sm">Space: O(1) auxiliary</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Only uses a few variables per number. Output array is required by problem.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                      <strong className="text-green-300 block mb-2 text-sm">Best for Sparse Numbers</strong>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Extremely efficient for numbers with few set bits. Perfect for counting applications.
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
              🚀 Ready to visualize Counting Bits?
            </div>
            <div className="text-gray-500 text-sm mb-8 leading-relaxed">
              Enter a maximum number n to see how we count set bits for all numbers from 0 to n using Brian Kernighan's algorithm.
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
                <div>Input: <span className="text-purple-300 font-mono">n = 5</span></div>
                <div>Output: <span className="text-green-300 font-mono">[0, 1, 1, 2, 1, 2]</span></div>
                <div className="text-gray-500 text-xs mt-2">
                  → 0: 0 bits, 1: 1 bit, 2: 1 bit, 3: 2 bits, 4: 1 bit, 5: 2 bits
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountingBits;