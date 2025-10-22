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
  Layers,
  TrendingUp,
  Maximize2,
  Target,
  Gauge,
  Hash,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";

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
    green: { bg: "bg-green-500", text: "text-green-500" },
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
                          color === "green" ? "#10b981" : "#8b5cf6"
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

const LongestSubstring = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [inputString, setInputString] = useState("abcabcbb");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [windowStyle, setWindowStyle] = useState({});
  const visualizerRef = useRef(null);

  const generateBruteForceHistory = useCallback((s) => {
    const newHistory = [];
    let maxLength = 0;
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        s: s.split(''),
        maxLength,
        currentStart: null,
        currentEnd: null,
        currentChars: new Set(),
        duplicateIndex: null,
        duplicateChar: null,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting brute force approach. String length: ${s.length}`,
    });

    for (let start = 0; start < s.length; start++) {
      let currentChars = new Set();
      let foundDuplicate = false;
      
      addState({
        line: 4,
        currentStart: start,
        currentEnd: start,
        currentChars: new Set([s[start]]),
        explanation: `Starting new substring at index ${start} with character '${s[start]}'`,
      });

      currentChars.add(s[start]);

      for (let end = start; end < s.length; end++) {
        // Reset duplicate state for each iteration
        foundDuplicate = false;
        let duplicateChar = null;

        addState({
          line: 5,
          currentStart: start,
          currentEnd: end,
          currentChars: new Set(currentChars),
          explanation: `Checking substring from ${start} to ${end}: "${s.substring(start, end + 1)}"`,
        });

        // Check if current character already exists
        if (end > start && currentChars.has(s[end])) {
          foundDuplicate = true;
          duplicateChar = s[end];
          addState({
            line: 6,
            currentStart: start,
            currentEnd: end,
            currentChars: new Set(currentChars),
            duplicateIndex: end,
            duplicateChar: duplicateChar,
            explanation: `Found duplicate character '${duplicateChar}' at index ${end}. Cannot extend further.`,
          });
          break;
        }

        // Add current character to set (if not start index which was already added)
        if (end > start) {
          currentChars.add(s[end]);
          addState({
            line: 8,
            currentStart: start,
            currentEnd: end,
            currentChars: new Set(currentChars),
            explanation: `Added '${s[end]}' to substring. Current unique characters: ${Array.from(currentChars).join(', ')}`,
          });
        }

        // Calculate current length and update max if needed
        const currentLength = end - start + 1;
        if (currentLength > maxLength) {
          maxLength = currentLength;
          addState({
            line: 9,
            currentStart: start,
            currentEnd: end,
            currentChars: new Set(currentChars),
            maxLength,
            explanation: `New maximum length found: ${maxLength} (substring: "${s.substring(start, end + 1)}")`,
            justUpdatedMax: true,
          });
        } else {
          addState({
            line: 9,
            currentStart: start,
            currentEnd: end,
            currentChars: new Set(currentChars),
            explanation: `Current length: ${currentLength}, max remains: ${maxLength}`,
          });
        }

        // If we found a duplicate in this iteration, break
        if (foundDuplicate) {
          break;
        }
      }

      // Add state after inner loop completes
      const finalLength = newHistory[newHistory.length - 1].currentEnd - start + 1;
      addState({
        line: 11,
        currentStart: start,
        currentEnd: newHistory[newHistory.length - 1].currentEnd,
        currentChars: new Set(),
        explanation: `Completed checking substrings starting at index ${start}. Max length so far: ${maxLength}`,
      });
    }

    addState({
      line: 13,
      finished: true,
      explanation: `Completed! Longest substring without repeating characters has length: ${maxLength}`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, []);

  const generateOptimalHistory = useCallback((s) => {
    const newHistory = [];
    let maxLength = 0;
    let left = 0;
    const charIndexMap = new Map();
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        s: s.split(''),
        maxLength,
        left,
        right: null,
        charIndexMap: new Map(charIndexMap),
        duplicateChar: null,
        duplicateIndex: null,
        explanation: "",
        step: stepCount++,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting optimal sliding window approach. String length: ${s.length}`,
    });

    for (let right = 0; right < s.length; right++) {
      addState({
        line: 5,
        left,
        right,
        explanation: `Processing character '${s[right]}' at index ${right}`,
      });

      if (charIndexMap.has(s[right])) {
        const prevIndex = charIndexMap.get(s[right]);
        addState({
          line: 6,
          left,
          right,
          duplicateChar: s[right],
          duplicateIndex: prevIndex,
          explanation: `Found duplicate character '${s[right]}' previously at index ${prevIndex}`,
        });

        left = Math.max(left, prevIndex + 1);
        addState({
          line: 7,
          left,
          right,
          explanation: `Moving left pointer to ${left} (max of current left ${left} and ${prevIndex + 1})`,
        });
      }

      charIndexMap.set(s[right], right);
      addState({
        line: 9,
        left,
        right,
        justAddedToMap: right,
        explanation: `Added/updated '${s[right]}' in map with index ${right}`,
      });

      const currentLength = right - left + 1;
      if (currentLength > maxLength) {
        maxLength = currentLength;
        addState({
          line: 10,
          left,
          right,
          maxLength,
          explanation: `New maximum length: ${maxLength} (window [${left}, ${right}]: "${s.substring(left, right + 1)}")`,
          justUpdatedMax: true,
        });
      } else {
        addState({
          line: 10,
          left,
          right,
          explanation: `Current window length: ${currentLength}, max remains ${maxLength}`,
        });
      }
    }

    addState({
      line: 12,
      finished: true,
      explanation: `Completed! Longest substring without repeating characters has length: ${maxLength}`,
    });

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

  const loadString = () => {
    if (!inputString.trim()) {
      alert("Please enter a valid string.");
      return;
    }

    setIsLoaded(true);
    if (mode === "brute-force") {
      generateBruteForceHistory(inputString);
    } else {
      generateOptimalHistory(inputString);
    }
  };

  const generateRandomString = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const length = Math.floor(Math.random() * 6) + 6; // 6-12 characters
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputString(result);
    resetVisualization();
  };

  const parseInput = useCallback(() => {
    if (!inputString.trim()) throw new Error("Invalid input");
    return inputString;
  }, [inputString]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (s) => generateBruteForceHistory(s),
      optimal: (s) => generateOptimalHistory(s),
    },
    setCurrentStep,
    onError: () => {},
  });

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
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};

  useEffect(() => {
    if (isLoaded && state.currentStart !== null && state.currentEnd !== null) {
      const container = document.getElementById("string-container");
      const startEl = document.getElementById(
        `string-container-element-${state.currentStart}`
      );
      const endEl = document.getElementById(
        `string-container-element-${state.currentEnd}`
      );

      if (container && startEl && endEl) {
        const containerRect = container.getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        setWindowStyle({
          position: "absolute",
          top: "-8px",
          bottom: "-8px",
          left: `${startRect.left - containerRect.left - 8}px`,
          width: `${endRect.right - startRect.left + 16}px`,
          backgroundColor: state.duplicateIndex !== undefined ? "rgba(239, 68, 68, 0.1)" : "rgba(56, 189, 248, 0.1)",
          border: `2px solid ${state.duplicateIndex !== undefined ? "rgba(239, 68, 68, 0.5)" : "rgba(56, 189, 248, 0.5)"}`,
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [currentStep, isLoaded, state.currentStart, state.currentEnd, state.duplicateIndex]);

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        state.line === lineNum
          ? "bg-blue-500/20 border-l-4 border-blue-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={state.line === lineNum ? "text-blue-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const bruteForceCode = [
    { line: 1, content: "int lengthOfLongestSubstring(string s) {" },
    { line: 2, content: "    int maxLength = 0;" },
    { line: 3, content: "    int n = s.length();" },
    { line: 4, content: "    for (int start = 0; start < n; start++) {" },
    { line: 5, content: "        for (int end = start; end < n; end++) {" },
    { line: 6, content: "            if (hasDuplicate(s, start, end)) {" },
    { line: 7, content: "                break;" },
    { line: 8, content: "            }" },
    { line: 9, content: "            maxLength = max(maxLength, end - start + 1);" },
    { line: 10, content: "        }" },
    { line: 11, content: "    }" },
    { line: 12, content: "    return maxLength;" },
    { line: 13, content: "}" },
  ];

  const optimalCode = [
    { line: 1, content: "int lengthOfLongestSubstring(string s) {" },
    { line: 2, content: "    int maxLength = 0;" },
    { line: 3, content: "    int left = 0;" },
    { line: 4, content: "    unordered_map<char, int> charIndex;" },
    { line: 5, content: "    for (int right = 0; right < s.length(); right++) {" },
    { line: 6, content: "        if (charIndex.find(s[right]) != charIndex.end()) {" },
    { line: 7, content: "            left = max(left, charIndex[s[right]] + 1);" },
    { line: 8, content: "        }" },
    { line: 9, content: "        charIndex[s[right]] = right;" },
    { line: 10, content: "        maxLength = max(maxLength, right - left + 1);" },
    { line: 11, content: "    }" },
    { line: 12, content: "    return maxLength;" },
    { line: 13, content: "}" },
  ];

  const getCellColor = (index) => {
    if (mode === "brute-force") {
      const isInWindow = index >= state.currentStart && index <= state.currentEnd;
      const isDuplicate = index === state.duplicateIndex;
      const isStart = index === state.currentStart;
      const isEnd = index === state.currentEnd;

      if (isDuplicate) {
        return "bg-gradient-to-br from-red-400 to-rose-500 text-white border-red-400 shadow-lg shadow-red-500/50";
      } else if (isStart) {
        return "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/50";
      } else if (isEnd) {
        return "bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 border-yellow-400 shadow-lg shadow-yellow-500/50";
      } else if (isInWindow) {
        return "bg-gray-600 border-blue-400 shadow-lg";
      }
    } else {
      const isInWindow = index >= state.left && index <= state.right;
      const isDuplicate = index === state.duplicateIndex;
      const isLeftPointer = index === state.left;
      const isRightPointer = index === state.right;

      if (isDuplicate) {
        return "bg-gradient-to-br from-red-400 to-rose-500 text-white border-red-400 shadow-lg shadow-red-500/50";
      } else if (isLeftPointer) {
        return "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/50";
      } else if (isRightPointer) {
        return "bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 border-yellow-400 shadow-lg shadow-yellow-500/50";
      } else if (isInWindow) {
        return "bg-gray-600 border-blue-400 shadow-lg";
      }
    }
    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50";
  };

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Maximize2 size={28} />
          Longest Substring Without Repeating Characters
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find the length of the longest substring without repeating characters (LeetCode #3)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="string-input" className="font-medium text-gray-300 font-mono hidden md:block">
              String:
            </label>
            <input
              id="string-input"
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., abcabcbb"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={loadString}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomString}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random String
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

      {/* Mode Selection */}
      <div className="flex border-b-2 border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "brute-force"
              ? "border-blue-400 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Brute Force O(n²)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${
            mode === "optimal"
              ? "border-blue-400 text-blue-400 bg-blue-500/10"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Optimal O(n) - Sliding Window
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              {mode === "brute-force" ? "Brute Force Code" : "Optimal Code"}
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {(mode === "brute-force" ? bruteForceCode : optimalCode).map((codeLine) => (
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
            {/* String Visualization */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-6 flex items-center gap-2">
                <Grid size={20} />
                String Visualization
                {state.s?.length > 0 && (
                  <span className="text-sm text-gray-400 ml-2">
                    ({state.s.length} characters)
                  </span>
                )}
              </h3>
              
              <div className="flex flex-col items-center space-y-6">
                {/* String with indices */}
                <div className="relative" id="string-container">
                  {/* Column headers */}
                  <div className="flex gap-2 mb-2 justify-center">
                    {state.s?.map((_, index) => (
                      <div key={index} className="w-12 text-center text-xs text-gray-500 font-mono">
                        {index}
                      </div>
                    ))}
                  </div>
                  
                  {/* String elements */}
                  <div className="flex gap-2 justify-center">
                    {state.s?.map((char, index) => (
                      <div
                        key={index}
                        id={`string-container-element-${index}`}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${
                          ((mode === "brute-force" && index >= state.currentStart && index <= state.currentEnd) ||
                           (mode === "optimal" && index >= state.left && index <= state.right)) ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>

                  {/* Window overlay */}
                  <div style={windowStyle} />

                  {/* Pointers */}
                  {mode === "brute-force" ? (
                    <>
                      {state.currentStart !== null && (
                        <Pointer
                          index={state.currentStart}
                          containerId="string-container"
                          color="green"
                          label="start"
                        />
                      )}
                      {state.currentEnd !== null && (
                        <Pointer
                          index={state.currentEnd}
                          containerId="string-container"
                          color="blue"
                          label="end"
                        />
                      )}
                      {state.duplicateIndex !== null && (
                        <Pointer
                          index={state.duplicateIndex}
                          containerId="string-container"
                          color="red"
                          label="duplicate"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {state.left !== null && (
                        <Pointer
                          index={state.left}
                          containerId="string-container"
                          color="green"
                          label="left"
                        />
                      )}
                      {state.right !== null && (
                        <Pointer
                          index={state.right}
                          containerId="string-container"
                          color="blue"
                          label="right"
                        />
                      )}
                      {state.duplicateIndex !== null && (
                        <Pointer
                          index={state.duplicateIndex}
                          containerId="string-container"
                          color="red"
                          label="duplicate"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Character Map Visualization (Optimal Mode) */}
            {mode === "optimal" && (
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Hash size={20} />
                  Character Index Map
                </h3>
                <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
                  {state.charIndexMap && Array.from(state.charIndexMap.entries()).length > 0 ? (
                    Array.from(state.charIndexMap.entries()).map(([char, index]) => (
                      <div key={char} className="flex flex-col items-center">
                        <div
                          className={`w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 transition-all ${
                            index === state.right
                              ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-400 scale-110 text-gray-900"
                              : "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-400 text-white"
                          }`}
                        >
                          <span className="text-xs opacity-80">{char}</span>
                          <span className="text-lg">{index}</span>
                        </div>
                        <span className="text-xs text-gray-300 mt-1">
                          index
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 italic text-sm">
                      Character map is empty
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Current Substring Visualization */}
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <Eye size={20} />
                Current Substring
                {((mode === "brute-force" && state.currentStart !== null && state.currentEnd !== null) ||
                  (mode === "optimal" && state.left !== null && state.right !== null)) && (
                  <span className="text-sm text-purple-200 ml-2">
                    Length: {mode === "brute-force" ? state.currentEnd - state.currentStart + 1 : state.right - state.left + 1}
                  </span>
                )}
              </h3>
              <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
                {mode === "brute-force" && state.currentStart !== null && state.currentEnd !== null ? (
                  state.s.slice(state.currentStart, state.currentEnd + 1).map((char, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 transition-all ${
                        "bg-gradient-to-br from-purple-400 to-indigo-500 border-purple-400 text-white"
                      }`}
                    >
                      {char}
                    </div>
                  ))
                ) : mode === "optimal" && state.left !== null && state.right !== null ? (
                  state.s.slice(state.left, state.right + 1).map((char, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 transition-all ${
                        "bg-gradient-to-br from-purple-400 to-indigo-500 border-purple-400 text-white"
                      }`}
                    >
                      {char}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    No active substring
                  </span>
                )}
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  Current State
                </h3>
                <div className="space-y-2 text-sm">
                  {mode === "brute-force" ? (
                    <>
                      <p>
                        Window: <span className="font-mono font-bold text-amber-400">
                          [{state.currentStart}, {state.currentEnd}]
                        </span>
                      </p>
                      <p>
                        Window Length: <span className="font-mono font-bold text-cyan-400">
                          {state.currentStart !== null && state.currentEnd !== null ? state.currentEnd - state.currentStart + 1 : "N/A"}
                        </span>
                      </p>
                      <p>
                        Max Length: <span className="font-mono font-bold text-green-400">
                          {state.maxLength}
                        </span>
                      </p>
                      {state.duplicateChar && (
                        <p>
                          Duplicate: <span className="font-mono font-bold text-red-400">
                            '{state.duplicateChar}' at index {state.duplicateIndex}
                          </span>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        Window: <span className="font-mono font-bold text-amber-400">
                          [{state.left}, {state.right}]
                        </span>
                      </p>
                      <p>
                        Window Length: <span className="font-mono font-bold text-cyan-400">
                          {state.left !== null && state.right !== null ? state.right - state.left + 1 : "N/A"}
                        </span>
                      </p>
                      <p>
                        Max Length: <span className="font-mono font-bold text-green-400">
                          {state.maxLength}
                        </span>
                      </p>
                      {state.duplicateChar && (
                        <p>
                          Duplicate: <span className="font-mono font-bold text-red-400">
                            '{state.duplicateChar}' at index {state.duplicateIndex}
                          </span>
                        </p>
                      )}
                    </>
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

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <strong className="text-teal-300 font-mono block mb-1">O(n³)</strong>
                      <p className="text-gray-400 text-sm">
                        We check all possible substrings (O(n²)) and for each substring, 
                        we check for duplicates which takes O(n) time in worst case.
                        This results in O(n³) time complexity.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <strong className="text-teal-300 font-mono block mb-1">O(min(n, m))</strong>
                      <p className="text-gray-400 text-sm">
                        We need space to store the character set for the current substring. 
                        In worst case, this is the size of the character set (m) or the string length (n).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Zap size={16} />
                    Time Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <strong className="text-teal-300 font-mono block mb-1">O(n)</strong>
                      <p className="text-gray-400 text-sm">
                        Each character is visited exactly once by the right pointer, and the left pointer 
                        moves only forward. This gives us O(n) time complexity.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Cpu size={16} />
                    Space Complexity
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                      <strong className="text-teal-300 font-mono block mb-1">O(min(n, m))</strong>
                      <p className="text-gray-400 text-sm">
                        We store characters in a hash map. The space required is bounded by the size of 
                        the character set (m) or the string length (n), whichever is smaller.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-lg mb-4">
            Enter a string to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Examples: abcabcbb, bbbbb, pwwkew</span>
            </div>
            <p>
              <strong>Example:</strong> "abcabcbb" → Longest substring is "abc" with length 3
            </p>
            <p className="text-gray-500">
              Find the length of the longest substring without repeating characters using either brute force or optimal sliding window approach.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LongestSubstring;