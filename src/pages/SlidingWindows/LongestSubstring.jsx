import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, Eye, Hash } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";
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
    window.addEventListener("resize", updatePosition);
    
    return () => window.removeEventListener("resize", updatePosition);
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

const LongestSubstring = ({ navigate }) => {
  const [mode, setMode] = useState("optimal");
  const [inputString, setInputString] = useState("abcabcbb");
  const [windowStyle, setWindowStyle] = useState({});

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState, setCurrentStep } = visualizer;

  const generateBruteForceHistory = useCallback((s) => {
    const newHistory = [];
    let maxLength = 0;
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        s: s.split(""),
        maxLength,
        currentStart: null,
        currentEnd: null,
        currentChars: new Set(),
        duplicateIndex: null,
        duplicateChar: null,
        explanation: "",
        step: stepCount++,
        line: 3,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting brute force approach. String length: ${s.length}`,
    });

    for (let start = 0; start < s.length; start++) {
      const currentChars = new Set();
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
        foundDuplicate = false;
        let duplicateChar = null;

        addState({
          line: 5,
          currentStart: start,
          currentEnd: end,
          currentChars: new Set(currentChars),
          explanation: `Checking substring from ${start} to ${end}: "${s.substring(start, end + 1)}"`,
        });

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

        if (end > start) {
          currentChars.add(s[end]);
          addState({
            line: 8,
            currentStart: start,
            currentEnd: end,
            currentChars: new Set(currentChars),
            explanation: `Added '${s[end]}' to substring. Current unique characters: ${Array.from(currentChars).join(", ")}`,
          });
        }

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

        if (foundDuplicate) {
          break;
        }
      }

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

    load(newHistory);
  }, [load]);

  const generateOptimalHistory = useCallback((s) => {
    const newHistory = [];
    let maxLength = 0;
    let left = 0;
    const charIndexMap = new Map();
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        s: s.split(""),
        maxLength,
        left,
        right: null,
        charIndexMap: new Map(charIndexMap),
        duplicateChar: null,
        duplicateIndex: null,
        explanation: "",
        step: stepCount++,
        line: 3,
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

    load(newHistory);
  }, [load]);

  const loadString = () => {
    if (!inputString.trim()) {
      alert("Please enter a valid string.");
      return;
    }

    if (mode === "brute-force") {
      generateBruteForceHistory(inputString);
    } else {
      generateOptimalHistory(inputString);
    }
  };

  const generateRandomString = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const length = Math.floor(Math.random() * 6) + 6;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputString(result);
    if (mode === "brute-force") {
      generateBruteForceHistory(result);
    } else {
      generateOptimalHistory(result);
    }
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
  });

  const {
    s = [],
    maxLength = 0,
    currentStart = null,
    currentEnd = null,
    currentChars = new Set(),
    duplicateIndex = null,
    left = null,
    right = null,
    charIndexMap = new Map(),
    explanation = "",
    line = 3,
  } = currentState;

  const windowStart = mode === "brute-force" ? currentStart : left;
  const windowEnd = mode === "brute-force" ? currentEnd : right;

  useEffect(() => {
    if (isLoaded && windowStart !== null && windowEnd !== null) {
      const container = document.getElementById("string-container");
      const startEl = document.getElementById(`string-container-element-${windowStart}`);
      const endEl = document.getElementById(`string-container-element-${windowEnd}`);

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
          backgroundColor: duplicateIndex !== null ? "rgba(239, 68, 68, 0.1)" : "rgba(56, 189, 248, 0.1)",
          border: `2px solid ${duplicateIndex !== null ? "rgba(239, 68, 68, 0.5)" : "rgba(56, 189, 248, 0.5)"}`,
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [visualizer.currentStep, isLoaded, windowStart, windowEnd, duplicateIndex]);

  const codeContent = mode === "brute-force" ? {
    3: "int lengthOfLongestSubstring(string s) {",
    4: "    int maxLength = 0; int n = s.length();",
    5: "    for (int start = 0; start < n; start++) {",
    6: "        for (int end = start; end < n; end++) {",
    7: "            if (hasDuplicate(s, start, end)) break;",
    8: "            // Add character to set",
    9: "            maxLength = max(maxLength, end - start + 1);",
    10: "        }",
    11: "    }",
    13: "    return maxLength;",
    14: "}"
  } : {
    2: "int lengthOfLongestSubstring(string s) {",
    3: "    int maxLength = 0; int left = 0;",
    4: "    unordered_map<char, int> charIndex;",
    5: "    for (int right = 0; right < s.length(); right++) {",
    6: "        if (charIndex.find(s[right]) != charIndex.end()) {",
    7: "            left = max(left, charIndex[s[right]] + 1);",
    8: "        }",
    9: "        charIndex[s[right]] = right;",
    10: "        maxLength = max(maxLength, right - left + 1);",
    11: "    }",
    12: "    return maxLength;",
    13: "}"
  };

  const getCellColor = (index) => {
    const isInWindow = index >= windowStart && index <= windowEnd;
    const isDuplicate = index === duplicateIndex;
    const isStart = index === windowStart;
    const isEnd = index === windowEnd;

    if (isDuplicate) {
      return "bg-gradient-to-br from-red-400 to-rose-500 text-white border-red-400 shadow-lg shadow-red-500/50 scale-110";
    } else if (isStart) {
      return "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/50";
    } else if (isEnd) {
      return "bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 border-yellow-400 shadow-lg shadow-yellow-500/50";
    } else if (isInWindow) {
      return "bg-gray-600 border-blue-400 shadow-lg text-white";
    }
    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300";
  };

  const inputSection = (
    <>
      <div className="flex bg-gray-950 p-1.5 rounded-xl border border-gray-800">
        <button
          onClick={() => handleModeChange("brute-force")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "brute-force"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Brute Force
        </button>
        <button
          onClick={() => handleModeChange("optimal")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "optimal"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Optimal (O(n))
        </button>
      </div>
      <input
        id="string-input"
        type="text"
        value={inputString}
        onChange={(e) => setInputString(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., abcabcbb"
      />
      {!isLoaded && (
        <button
          onClick={loadString}
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
      <button
        onClick={generateRandomString}
        className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl font-bold transition-all text-white shadow-lg cursor-pointer"
      >
        Random
      </button>
    </>
  );

  const currentWindowLength = windowEnd !== null && windowStart !== null ? windowEnd - windowStart + 1 : 0;

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Unique Characters
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {mode === "optimal" ? charIndexMap?.size || 0 : currentChars?.size || 0}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Window Length
        </h4>
        <div className="text-3xl font-mono text-purple-305 font-bold">
          {currentWindowLength}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Max Length
        </h4>
        <div className="text-3xl font-mono text-green-405 font-bold">
          {maxLength}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">
              {mode === "brute-force" ? "O(n³)" : "O(n)"}
            </span>{" "}
            - {mode === "brute-force" ? "Substrings generation combined with duplicates check." : "Linear scan with right and left pointers."}
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(min(n, m))</span> - hash set or map space bounded by character set size m or string size n.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Longest Substring"
      description="Find the length of the longest substring without repeating characters (LeetCode #3)."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter a string, then click Load & Visualize."
    >
      <div className="w-full space-y-8">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Sliding Windows
          </button>
        )}
        
        {/* String Visualization */}
        <div className="relative py-4 w-full" id="string-container">
          <div className="flex gap-2 mb-2 justify-center">
            {s.map((_, index) => (
              <div key={index} className="w-12 text-center text-xs text-gray-500 font-mono">
                {index}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 justify-center">
            {s.map((char, index) => (
              <div
                key={index}
                id={`string-container-element-${index}`}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${
                  (index >= windowStart && index <= windowEnd) ? "scale-110" : "scale-100"
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          <div style={windowStyle} />

          {isLoaded && windowStart !== null && (
            <Pointer
              index={windowStart}
              containerId="string-container"
              color="green"
              label={mode === "brute-force" ? "start" : "left"}
            />
          )}
          {isLoaded && windowEnd !== null && (
            <Pointer
              index={windowEnd}
              containerId="string-container"
              color="blue"
              label={mode === "brute-force" ? "end" : "right"}
            />
          )}
          {isLoaded && duplicateIndex !== null && (
            <Pointer
              index={duplicateIndex}
              containerId="string-container"
              color="red"
              label="duplicate"
            />
          )}
        </div>

        {/* Character Map Visualization (Optimal Mode) */}
        {mode === "optimal" && (
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 shadow-xl w-full">
            <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
              <Hash size={20} />
              Character Index Map
            </h3>
            <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
              {charIndexMap && Array.from(charIndexMap.entries()).length > 0 ? (
                Array.from(charIndexMap.entries()).map(([char, idx]) => (
                  <div key={char} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 transition-all ${
                        idx === right
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-400 scale-110 text-gray-900"
                          : "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-400 text-white"
                      }`}
                    >
                      <span className="text-xs opacity-80">{char}</span>
                      <span className="text-lg">{idx}</span>
                    </div>
                    <span className="text-xs text-gray-300 mt-1">index</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 italic text-sm">Character map is empty</span>
              )}
            </div>
          </div>
        )}

        {/* Current Substring Visualization */}
        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm p-6 rounded-xl border border-purple-700/50 shadow-xl w-full">
          <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
            <Eye size={20} />
            Current Substring
            {windowStart !== null && windowEnd !== null && (
              <span className="text-sm text-purple-200 ml-2">
                Length: {currentWindowLength}
              </span>
            )}
          </h3>
          <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
            {windowStart !== null && windowEnd !== null ? (
              s.slice(windowStart, windowEnd + 1).map((char, index) => (
                <div
                  key={index}
                  className="w-12 h-12 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-purple-400 to-indigo-500 border-purple-400 text-white"
                >
                  {char}
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic text-sm">No active substring</span>
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default LongestSubstring;