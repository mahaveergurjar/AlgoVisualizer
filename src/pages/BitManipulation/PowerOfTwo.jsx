import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Zap,
  Code2,
  Binary,
  Cpu,
  Clock,
  CheckCircle,
  Target,
  Gauge,
  Sparkles,
  TrendingUp,
  Calculator,
  AlertCircle
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "bool isPowerOfTwo(int n) {" },
    { l: 2, t: "    if (n <= 0) return false;" },
    { l: 3, t: "    return (n & (n - 1)) == 0;" },
    { l: 4, t: "}" },
  ],
  Python: [
    { l: 1, t: "def isPowerOfTwo(n):" },
    { l: 2, t: "    if n <= 0:" },
    { l: 3, t: "        return False" },
    { l: 4, t: "    return (n & (n - 1)) == 0" },
  ],
  Java: [
    { l: 1, t: "public boolean isPowerOfTwo(int n) {" },
    { l: 2, t: "    if (n <= 0) return false;" },
    { l: 3, t: "    return (n & (n - 1)) == 0;" },
    { l: 4, t: "}" },
  ],
};

// Enhanced Code Line Component
const CodeLine = ({ lineNum, content, isActive = false, isHighlighted = false }) => (
  <div
    className={`block rounded-lg transition-all duration-300 border-l-4 ${
      isActive
        ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]"
        : isHighlighted
        ? "bg-blue-500/10 border-blue-500/50"
        : "border-transparent hover:bg-gray-700/30"
    }`}
  >
    <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
      {lineNum}
    </span>
    <span className={`font-mono ${isActive ? "text-amber-300 font-bold" : isHighlighted ? "text-blue-300" : "text-gray-300"}`}>
      {content}
    </span>
  </div>
);

const PowerOfTwo = ({ navigate }) => {
  const defaultNumber = 16;
  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber.toString());
  const [animSpeed, setAnimSpeed] = useState(800);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("input");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeLang, setActiveLang] = useState("C++");
  const playRef = useRef(null);

  const generatePowerOfTwoHistory = useCallback((num) => {
    const hist = [];
    const binary = num > 0 ? num.toString(2).padStart(Math.ceil(Math.log2(num + 1)), '0') : '0';
    
    // Initial state
    hist.push({
      number: num,
      binary,
      message: `Checking if ${num} is a power of 2\nA number is a power of 2 if it can be expressed as 2^x for some integer x`,
      phase: "init",
      result: null,
      line: 1
    });

    // Check if number is positive
    if (num <= 0) {
      hist.push({
        number: num,
        binary,
        message: `${num} is not positive\nOnly positive numbers can be powers of 2`,
        phase: "negative",
        result: false,
        line: 2
      });
      return hist;
    }

    hist.push({
      number: num,
      binary,
      message: `✓ Number is positive\nBinary representation: ${binary}`,
      phase: "show-binary",
      result: null,
      line: 3
    });

    // Calculate n-1
    const nMinus1 = num - 1;
    const nMinus1Binary = nMinus1.toString(2).padStart(binary.length, '0');

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      message: `Calculate n - 1:\n${num} - 1 = ${nMinus1}`,
      phase: "subtract",
      result: null,
      line: 3
    });

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      message: `Binary of (n-1): ${nMinus1Binary}`,
      phase: "show-n-minus-1",
      result: null,
      line: 3
    });

    // Perform AND operation
    const andResult = num & nMinus1;
    const andBinary = andResult.toString(2).padStart(binary.length, '0');

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      andResult,
      andBinary,
      message: `Perform bitwise AND operation:\nn & (n-1) = ${num} & ${nMinus1} = ${andResult}`,
      phase: "and-operation",
      result: null,
      line: 3
    });

    // Check result
    const isPowerOfTwo = andResult === 0;

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      andResult,
      andBinary,
      message: isPowerOfTwo 
        ? `✓ SUCCESS: ${num} & ${nMinus1} = 0\n${num} IS a power of 2! 🎉`
        : `✗ FAILED: ${num} & ${nMinus1} = ${andResult} ≠ 0\n${num} is NOT a power of 2`,
      phase: "complete",
      result: isPowerOfTwo,
      line: 3
    });

    return hist;
  }, []);

  const handleStart = () => {
    const num = parseInt(inputNumber, 10);
    if (isNaN(num)) {
      alert("Please enter a valid integer");
      return;
    }
    setNumber(num);
    setMode("visualizing");
    const hist = generatePowerOfTwoHistory(num);
    setHistory(hist);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
    clearInterval(playRef.current);
  };

  const handleNumberChange = (e) => {
    setInputNumber(e.target.value);
  };

  const handleExample = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 1; // Generate random number between 1 and 1000
    setInputNumber(randomNum.toString());
  };

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < history.length - 1) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [history.length]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStart = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const goToEnd = useCallback(() => {
    setCurrentStep(history.length - 1);
  }, [history.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && currentStep < history.length - 1) {
      playRef.current = setInterval(() => {
        goToNextStep();
      }, 1100 - animSpeed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, currentStep, history.length, animSpeed, goToNextStep]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== "visualizing") return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevStep();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNextStep();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
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
  }, [mode, goToPrevStep, goToNextStep, goToStart, goToEnd, togglePlay]);

  const step = history[currentStep] || {};
  const { 
    binary = "", 
    nMinus1Binary = "", 
    andBinary = "", 
    message = "", 
    result = null, 
    phase = "init",
    line,
    number: currentNum,
    nMinus1,
    andResult
  } = step;

  const progressPercentage = history.length > 0 ? ((currentStep + 1) / history.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400 mb-4">
            Power of Two
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Check if a number is a power of two using bit manipulation magic
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/30">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">O(1) Time</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
              <Cpu className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">O(1) Space</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/30">
              <Binary className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-medium">Bit Manipulation</span>
            </div>
          </div>
        </header>

        {/* Input Controls */}
        {mode === "input" && (
          <section className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Target className="inline w-4 h-4 mr-2" />
                    Number to Check
                  </label>
                  <input
                    type="number"
                    value={inputNumber}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter a number to check..."
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Examples: 16 (power of 2), 18 (not power of 2), 0 (not power of 2)
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStart}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Start Visualization
                  </button>
                  <button
                    onClick={handleExample}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Example
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {mode === "visualizing" && (
          <>
            {/* Controls & Language Tabs */}
            <section className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-2">
                  {LANG_TABS.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLang(lang)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeLang === lang
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-600"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-600">
                    <button
                      onClick={goToStart}
                      disabled={currentStep <= 0}
                      className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                      title="Go to Start (Home)"
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToPrevStep}
                      disabled={currentStep <= 0}
                      className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    
                    {!isPlaying ? (
                      <button
                        onClick={togglePlay}
                        disabled={currentStep >= history.length - 1}
                        className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={togglePlay}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={goToNextStep}
                      disabled={currentStep >= history.length - 1}
                      className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                    <button
                      onClick={goToEnd}
                      disabled={currentStep >= history.length - 1}
                      className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 transition-all"
                      title="Go to End (End)"
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Speed:</label>
                    <select
                      value={animSpeed}
                      onChange={(e) => setAnimSpeed(parseInt(e.target.value))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={400}>Slow</option>
                      <option value={700}>Medium</option>
                      <option value={1000}>Fast</option>
                    </select>
                  </div>

                  <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                    <div className="text-amber-400 font-bold">{currentStep + 1}</div>
                    <div className="text-gray-400 text-xs">of {history.length}</div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-amber-500/25"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </section>

            {/* Main Visualization */}
            <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Code Panel */}
              <div className="xl:col-span-1">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-5 w-5 text-amber-400" />
                    <h3 className="font-semibold text-gray-200">Algorithm Code</h3>
                  </div>
                  <div className="bg-gray-900 rounded-xl border border-gray-600 p-4 font-mono text-sm">
                    {CODE_SNIPPETS[activeLang].map((codeLine) => (
                      <CodeLine 
                        key={codeLine.l} 
                        lineNum={codeLine.l} 
                        content={codeLine.t}
                        isActive={line === codeLine.l}
                        isHighlighted={[2, 3].includes(codeLine.l)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Visualization Panel */}
              <div className="xl:col-span-2 space-y-6">
                {/* Binary Representations */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-200 flex items-center gap-3">
                      <Binary className="h-6 w-6 text-amber-400" />
                      Binary Representations
                    </h3>
                    <div className="text-sm text-gray-400 font-mono bg-gray-900/50 px-3 py-1 rounded-full">
                      Step {currentStep + 1}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* n (Original Number) */}
                    {binary && (
                      <div className="bg-gradient-to-br from-amber-900/40 to-yellow-800/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/50">
                        <h4 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                          <Gauge className="h-5 w-5" />
                          n = {currentNum}
                        </h4>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {binary.split('').map((bit, index) => (
                            <div
                              key={index}
                              className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                                bit === '1' 
                                  ? "bg-amber-600 text-white shadow-lg shadow-amber-500/50" 
                                  : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {bit}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* n-1 */}
                    {nMinus1Binary && (
                      <div className="bg-gradient-to-br from-orange-900/40 to-red-800/40 backdrop-blur-sm p-4 rounded-xl border border-orange-700/50">
                        <h4 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          n - 1 = {nMinus1}
                        </h4>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {nMinus1Binary.split('').map((bit, index) => (
                            <div
                              key={index}
                              className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                                bit === '1' 
                                  ? "bg-orange-600 text-white shadow-lg shadow-orange-500/50" 
                                  : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {bit}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* n & (n-1) */}
                    {andBinary && (
                      <div className="bg-gradient-to-br from-purple-900/40 to-pink-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50">
                        <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          n & (n-1) = {andResult}
                        </h4>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {andBinary.split('').map((bit, index) => (
                            <div
                              key={index}
                              className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                                bit === '1' 
                                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50" 
                                  : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {bit}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explanation & Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm p-6 rounded-2xl border border-amber-700/50">
                    <h3 className="font-bold text-xl text-amber-300 mb-4 flex items-center gap-3">
                      <Cpu className="h-5 w-5" />
                      Step Explanation
                    </h3>
                    <div className="text-gray-200 text-sm leading-relaxed h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 p-2">
                      {message.split('\n').map((line, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          {line}
                        </div>
                      ))}
                    </div>
                    {phase === "complete" && (
                      <div className={`mt-4 p-3 rounded-lg border ${
                        result 
                          ? "bg-green-500/20 border-green-500/30" 
                          : "bg-red-500/20 border-red-500/30"
                      }`}>
                        <div className={`text-sm font-semibold flex items-center gap-2 ${
                          result ? "text-green-300" : "text-red-300"
                        }`}>
                          <CheckCircle className="h-4 w-4" />
                          {result ? "Power of 2 Confirmed!" : "Not a Power of 2"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-sm p-6 rounded-2xl border border-orange-700/50">
                    <h3 className="font-bold text-xl text-orange-300 mb-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5" />
                      Current State
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-orange-700/30">
                        <span className="text-gray-300">Number</span>
                        <span className="font-mono font-bold text-amber-400">
                          {currentNum}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-orange-700/30">
                        <span className="text-gray-300">Phase</span>
                        <span className="font-mono font-bold text-blue-400 capitalize">
                          {phase.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-orange-700/30">
                        <span className="text-gray-300">Steps Completed</span>
                        <span className="font-mono font-bold text-amber-400">
                          {currentStep + 1}/{history.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-300">Active Line</span>
                        <span className="font-mono font-bold text-green-400">
                          {line || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Result */}
                {result !== null && (
                  <div className={`p-6 rounded-2xl border-2 shadow-xl ${
                    result 
                      ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500" 
                      : "bg-gradient-to-br from-red-900/40 to-pink-900/40 border-red-500"
                  }`}>
                    <div className="text-center">
                      <div className={`text-sm mb-2 ${result ? "text-green-300" : "text-red-300"}`}>
                        Final Result
                      </div>
                      <div className={`text-4xl font-black mb-4 ${result ? "text-green-200" : "text-red-200"}`}>
                        {result ? "✓ Power of 2" : "✗ Not a Power of 2"}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {result 
                          ? `${currentNum} = 2^${Math.log2(currentNum)}` 
                          : `${currentNum} cannot be expressed as 2^x`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Complexity Analysis */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="font-bold text-xl text-amber-400 mb-6 flex items-center gap-3">
                    <Zap className="h-6 w-6" />
                    Algorithm Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-amber-300 text-lg">Time Complexity</h4>
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="text-2xl font-bold text-green-400 text-center mb-2">O(1)</div>
                        <p className="text-gray-400 text-sm text-center">
                          Single bitwise operation regardless of input size
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-orange-300 text-lg">Space Complexity</h4>
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="text-2xl font-bold text-green-400 text-center mb-2">O(1)</div>
                        <p className="text-gray-400 text-sm text-center">
                          Uses only constant extra space
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-900/30 rounded-xl border border-gray-600">
                    <h5 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Key Insight
                    </h5>
                    <p className="text-gray-400 text-sm">
                      Powers of 2 have exactly one '1' bit in their binary representation. 
                      The operation <code className="px-2 py-1 bg-gray-800 rounded">n & (n-1)</code> clears the rightmost set bit. 
                      If the result is 0, there was only one set bit to begin with.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default PowerOfTwo;