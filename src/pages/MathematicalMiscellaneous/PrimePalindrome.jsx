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
  Hash,
  Target,
  Gauge,
  AlertTriangle,
  Info,
  Search,
} from "lucide-react";

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
    green: { bg: "bg-green-500", text: "text-green-500" },
    yellow: { bg: "bg-yellow-500", text: "text-yellow-500" },
    purple: { bg: "bg-purple-500", text: "text-purple-500" },
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
          borderBottomColor: color === "red" ? "#ef4444" : 
                          color === "blue" ? "#3b82f6" : 
                          color === "green" ? "#10b981" : 
                          color === "yellow" ? "#eab308" : "#a855f7"
        }}
      />
      <div className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}>
        {label}
      </div>
    </div>
  );
};

const PrimePalindrome = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [nInput, setNInput] = useState("6");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  const isPrime = (num) => {
    if (num < 2 || num % 2 === 0) return num === 2;
    for (let i = 3; i * i <= num; i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const isPalindrome = (num) => {
    const str = num.toString();
    return str === str.split('').reverse().join('');
  };

  const generateHistory = useCallback((n) => {
    const newHistory = [];
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        n,
        result: null,
        currentX: null,
        currentPalindrome: null,
        leftHalf: null,
        rightHalf: null,
        palindromeString: null,
        isPrimeCheck: null,
        divisorChecking: null,
        explanation: "",
        step: stepCount++,
        testedNumbers: [],
        ...props,
      });
    };

    addState({
      line: 1,
      explanation: `Starting search for smallest prime palindrome >= ${n}`,
    });

    // Edge case: 8 <= n <= 11
    if (8 <= n && n <= 11) {
      addState({
        line: 2,
        explanation: `Special case: n is between 8 and 11, return 11`,
        result: 11,
        finished: true,
      });
      setHistory(newHistory);
      setCurrentStep(0);
      setIsLoaded(true);
      return;
    }

    const testedNumbers = [];

    // Generate palindromes by constructing them from x
    for (let x = 1; x < 100000; x++) {
      const s = x.toString();
      const r = s.split('').reverse().join('');
      const palindromeStr = s + r.substring(1);
      const y = parseInt(palindromeStr);

      addState({
        line: 4,
        currentX: x,
        leftHalf: s,
        rightHalf: r.substring(1),
        palindromeString: palindromeStr,
        currentPalindrome: y,
        testedNumbers: [...testedNumbers],
        explanation: `Constructing palindrome from x=${x}: "${s}" + "${r.substring(1)}" = ${y}`,
      });

      if (y >= n) {
        addState({
          line: 5,
          currentX: x,
          currentPalindrome: y,
          palindromeString: palindromeStr,
          testedNumbers: [...testedNumbers],
          explanation: `Palindrome ${y} >= ${n}, now checking if it's prime...`,
        });

        // Check if prime
        let primeCheckResult = true;
        
        if (y < 2 || (y > 2 && y % 2 === 0)) {
          primeCheckResult = false;
          addState({
            line: 6,
            currentX: x,
            currentPalindrome: y,
            palindromeString: palindromeStr,
            isPrimeCheck: false,
            testedNumbers: [...testedNumbers, { num: y, isPrime: false, isPalindrome: true }],
            explanation: `${y} is not prime (${y < 2 ? 'less than 2' : 'even number'})`,
          });
        } else if (y === 2) {
          primeCheckResult = true;
          testedNumbers.push({ num: y, isPrime: true, isPalindrome: true });
          addState({
            line: 7,
            currentX: x,
            currentPalindrome: y,
            palindromeString: palindromeStr,
            isPrimeCheck: true,
            result: y,
            testedNumbers: [...testedNumbers],
            explanation: `${y} is prime! Found the answer.`,
            finished: true,
          });
          break;
        } else {
          // Check divisors
          for (let i = 3; i * i <= y; i += 2) {
            addState({
              line: 6,
              currentX: x,
              currentPalindrome: y,
              palindromeString: palindromeStr,
              divisorChecking: i,
              testedNumbers: [...testedNumbers],
              explanation: `Checking if ${y} is divisible by ${i}...`,
            });

            if (y % i === 0) {
              primeCheckResult = false;
              testedNumbers.push({ num: y, isPrime: false, isPalindrome: true });
              addState({
                line: 6,
                currentX: x,
                currentPalindrome: y,
                palindromeString: palindromeStr,
                divisorChecking: i,
                isPrimeCheck: false,
                testedNumbers: [...testedNumbers],
                explanation: `${y} is divisible by ${i}, not prime. Continue searching...`,
              });
              break;
            }
          }

          if (primeCheckResult) {
            testedNumbers.push({ num: y, isPrime: true, isPalindrome: true });
            addState({
              line: 7,
              currentX: x,
              currentPalindrome: y,
              palindromeString: palindromeStr,
              isPrimeCheck: true,
              result: y,
              testedNumbers: [...testedNumbers],
              explanation: `${y} is prime! Found the answer.`,
              finished: true,
            });
            break;
          }
        }
      } else {
        testedNumbers.push({ num: y, isPrime: null, isPalindrome: true });
        addState({
          line: 4,
          currentX: x,
          currentPalindrome: y,
          palindromeString: palindromeStr,
          testedNumbers: [...testedNumbers],
          explanation: `Palindrome ${y} < ${n}, skip and continue...`,
        });
      }

      // Safety break for visualization
      if (testedNumbers.length > 50) {
        addState({
          explanation: "Stopping visualization after 50 candidates for performance...",
          finished: true,
        });
        break;
      }
    }

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

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

  const playAnimation = useCallback(() => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, history.length]);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const loadVisualization = () => {
    const n = parseInt(nInput, 10);

    if (isNaN(n) || n < 1) {
      alert("Please enter a number greater than or equal to 1");
      return;
    }

    if (n > 10000) {
      if (!confirm(`You entered n = ${n}. Large values may cause performance issues. Continue?`)) {
        return;
      }
    }

    setIsLoaded(true);
    generateHistory(n);
  };

  const generateRandomN = () => {
    const randomN = Math.floor(Math.random() * 100) + 1;
    setNInput(randomN.toString());
    resetVisualization();
  };

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
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        state.line === lineNum
          ? "bg-purple-500/20 border-l-4 border-purple-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={state.line === lineNum ? "text-purple-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const codeLines = [
    { line: 1, content: "int primePalindrome(int n) {" },
    { line: 2, content: "    if (8 <= n && n <= 11) return 11;" },
    { line: 3, content: "    for (int x = 1; x < 100000; ++x) {" },
    { line: 4, content: "        string s = to_string(x), r(s.rbegin(), s.rend());" },
    { line: 5, content: "        int y = stoi(s + r.substr(1));" },
    { line: 6, content: "        if (y >= n && isPrime(y)) return y;" },
    { line: 7, content: "    }" },
    { line: 8, content: "    return -1;" },
    { line: 9, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <Hash size={28} />
          Prime Palindrome
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find the smallest prime palindrome greater than or equal to n (LeetCode #866)
        </p>
      </header>

      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="n-input" className="font-medium text-gray-300 font-mono hidden md:block">
              n:
            </label>
            <input
              id="n-input"
              type="number"
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 6"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadVisualization}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomN}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random n
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
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Algorithm Code
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {codeLines.map((codeLine) => (
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

          <div className="lg:col-span-2 space-y-6">
            {/* Palindrome Construction */}
            {state.currentX && (
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                  <Target size={20} />
                  Palindrome Construction
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">x</div>
                      <div className="bg-blue-500/20 border-2 border-blue-400 rounded-lg p-4 font-mono text-2xl font-bold text-blue-300">
                        {state.currentX}
                      </div>
                    </div>

                    <div className="text-gray-400 text-2xl">→</div>

                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">Left Half (s)</div>
                      <div className="bg-purple-500/20 border-2 border-purple-400 rounded-lg p-4 font-mono text-2xl font-bold text-purple-300">
                        {state.leftHalf}
                      </div>
                    </div>

                    <div className="text-gray-400 text-2xl">+</div>

                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">Right Half (reversed)</div>
                      <div className="bg-pink-500/20 border-2 border-pink-400 rounded-lg p-4 font-mono text-2xl font-bold text-pink-300">
                        {state.rightHalf || "(empty)"}
                      </div>
                    </div>

                    <div className="text-gray-400 text-2xl">=</div>

                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">Palindrome (y)</div>
                      <div className={`border-2 rounded-lg p-4 font-mono text-2xl font-bold ${
                        state.isPrimeCheck === true 
                          ? "bg-green-500/20 border-green-400 text-green-300"
                          : state.isPrimeCheck === false
                          ? "bg-red-500/20 border-red-400 text-red-300"
                          : "bg-yellow-500/20 border-yellow-400 text-yellow-300"
                      }`}>
                        {state.currentPalindrome}
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-400">
                    Palindrome String: <span className="font-mono text-purple-300">{state.palindromeString}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Primality Check */}
            {state.divisorChecking && (
              <div className="bg-blue-900/40 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 shadow-xl">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Search size={20} />
                  Checking Primality
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Testing if <span className="font-mono font-bold text-yellow-400">{state.currentPalindrome}</span> is divisible by{" "}
                    <span className="font-mono font-bold text-blue-400">{state.divisorChecking}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Checking divisors from 3 up to √{state.currentPalindrome} ≈ {Math.floor(Math.sqrt(state.currentPalindrome))}
                  </p>
                </div>
              </div>
            )}

            {/* Tested Numbers */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Tested Palindromes
              </h3>
              
              <div className="min-h-[8rem] max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                {state.testedNumbers && state.testedNumbers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {state.testedNumbers.map((item, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg font-mono text-sm font-bold transition-all ${
                          item.isPrime === true
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg"
                            : item.isPrime === false
                            ? "bg-gray-600 text-gray-300 line-through"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {item.num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    No palindromes tested yet
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded"></div>
                  <span>Prime Palindrome</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded line-through"></div>
                  <span>Not Prime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <span>Skipped (too small)</span>
                </div>
              </div>
            </div>

            {/* Result */}
            {state.result && (
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Result Found!
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400 font-mono">
                    {state.result}
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    The smallest prime palindrome ≥ {state.n}
                  </div>
                </div>
              </div>
            )}

            {/* Status and Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Input n: <span className="font-mono font-bold text-blue-400">{state.n}</span>
                  </p>
                  <p>
                    Current x: <span className="font-mono font-bold text-purple-400">
                      {state.currentX ?? "N/A"}
                    </span>
                  </p>
                  <p>
                    Palindrome: <span className="font-mono font-bold text-yellow-400">
                      {state.currentPalindrome ?? "N/A"}
                    </span>
                  </p>
                  {state.result && (
                    <p>
                      Result: <span className="font-mono font-bold text-green-400">
                        {state.result}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
                <h3 className="font-bold text-lg text-gray-300 mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Step Explanation
                </h3>
                <div className="text-gray-300 text-sm h-20 overflow-y-auto scrollbar-thin">
                  {state.explanation || "Processing..."}
                </div>
              </div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <strong className="text-teal-300 font-mono">O(n × √n)</strong>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      For each palindrome candidate, we check primality by testing divisors up to √n.
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• Generate palindromes: O(√n) palindromes of length ≤ log(n)</div>
                      <div>• Primality check for each: O(√n) divisor tests</div>
                      <div>• Total: O(√n × √n) = O(n) worst case</div>
                      <div>• For n=1000: ~1000 operations expected</div>
                      <div>• Most palindromes are composite, so we find answer quickly</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-green-500" />
                      <strong className="text-teal-300 font-mono">O(log n) - Logarithmic Space</strong>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      Only stores string representations of numbers (length = log₁₀(n)).
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• String s: O(log n) characters</div>
                      <div>• String r: O(log n) characters</div>
                      <div>• Loop variables: O(1)</div>
                      <div>• No arrays or data structures</div>
                      <div>• Very memory efficient approach</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Key Insights */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Gauge size={16} />
                  Algorithm Insights
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                    <div className="text-green-300 font-semibold mb-2">Key Optimizations</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Constructs palindromes systematically from 1-digit numbers</li>
                      <li>• Skips even-length palindromes (except 11) - all are divisible by 11</li>
                      <li>• Uses efficient string reversal for palindrome generation</li>
                      <li>• Early termination once prime palindrome ≥ n found</li>
                      <li>• Special case handling for n ∈ [8, 11] returns 11 directly</li>
                    </ul>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                    <div className="text-blue-300 font-semibold mb-2">Mathematical Properties</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• All even-length palindromes (except 11) divisible by 11</li>
                      <li>• Algorithm generates odd-length palindromes efficiently</li>
                      <li>• Palindrome structure: middle digit is not mirrored</li>
                      <li>• Example: x=12 → "12" + "1" = 121 (odd length)</li>
                      <li>• Guarantees finding smallest prime palindrome</li>
                    </ul>
                  </div>
                </div>
                
                {/* Example Walkthrough */}
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                  <h5 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                    <Calculator size={16} />
                    Example: n = 6
                  </h5>
                  <div className="text-xs text-gray-400 space-y-2">
                    <p>
                      <strong className="text-purple-300">Step 1:</strong> x=1 → "1" + "" = 1 (too small, skip)
                    </p>
                    <p>
                      <strong className="text-purple-300">Step 2:</strong> x=2 → "2" + "" = 2 (too small, skip)
                    </p>
                    <p>
                      <strong className="text-purple-300">Step 3:</strong> x=3 → "3" + "" = 3 (too small, skip)
                    </p>
                    <p>
                      <strong className="text-purple-300">Step 4:</strong> x=4 → "4" + "" = 4 (too small, skip)
                    </p>
                    <p>
                      <strong className="text-purple-300">Step 5:</strong> x=5 → "5" + "" = 5 (too small, skip)
                    </p>
                    <p>
                      <strong className="text-purple-300">Step 6:</strong> x=6 → "6" + "" = 6 (≥ 6, but not prime)
                    </p>
                    <p>
                      <strong className="text-purple-300">Step 7:</strong> x=7 → "7" + "" = 7 (≥ 6, and is prime!)
                    </p>
                    <p className="text-green-400 font-semibold mt-2">
                      ✓ Result: 7 is the smallest prime palindrome ≥ 6
                    </p>
                  </div>
                </div>

                {/* Why Skip Even-Length Palindromes */}
                <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                  <h5 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Why Even-Length Palindromes Are Divisible by 11
                  </h5>
                  <div className="text-xs text-gray-400 space-y-2">
                    <p>
                      An even-length palindrome has the form: abccba, aabbccbbaa, etc.
                    </p>
                    <p>
                      For divisibility by 11: (sum of digits at odd positions) - (sum at even positions) must be divisible by 11.
                    </p>
                    <p>
                      In an even-length palindrome, every digit appears once at an odd position and once at an even position.
                    </p>
                    <p>
                      Therefore: (odd sum) - (even sum) = 0, which is divisible by 11.
                    </p>
                    <p className="text-yellow-400 font-semibold">
                      Exception: 11 itself is prime, so we handle the range [8, 11] specially.
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
            Enter a number n to find the smallest prime palindrome
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">n ≥ 1</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Finds prime palindrome</span>
              <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full">Efficient algorithm</span>
            </div>
            <p>
              <strong>Example:</strong> n = 6 → Returns 7 (7 is prime and palindrome)
            </p>
            <p>
              <strong>Example:</strong> n = 8 → Returns 11 (next prime palindrome)
            </p>
            <p>
              <strong>Example:</strong> n = 13 → Returns 101 (next prime palindrome)
            </p>
            <p className="text-gray-500 mt-4">
              A palindrome reads the same forwards and backwards. This algorithm efficiently
              constructs palindromes and checks if they're prime, skipping even-length palindromes
              (except 11) since they're all divisible by 11.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimePalindrome;