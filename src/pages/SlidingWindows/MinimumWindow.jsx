import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, Gauge } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

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
                          color === "blue" ? "#3b82f6" : "#10b981" 
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

const MinimumWindow = ({ navigate }) => {
  const [sInput, setSInput] = useState("ADOBECODEBANC");
  const [tInput, setTInput] = useState("ABC");
  const [windowStyle, setWindowStyle] = useState({});

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((s, t) => {
    const newHistory = [];
    let stepCount = 0;
    
    const tCount = {};
    const windowCount = {};
    let have = 0;
    let need = 0;
    let left = 0;
    let right = 0;
    let result = [-1, -1];
    let resultLen = Infinity;

    for (let char of t) {
      tCount[char] = (tCount[char] || 0) + 1;
    }
    need = Object.keys(tCount).length;

    const addState = (props) => {
      newHistory.push({
        s,
        t,
        left,
        right,
        have,
        need,
        windowCount: { ...windowCount },
        tCount: { ...tCount },
        result: [...result],
        resultLen,
        explanation: "",
        step: stepCount++,
        line: 2,
        ...props,
      });
    };

    addState({
      line: 2,
      explanation: `Initializing variables. Need to find characters: ${t}. Need count: ${need}`,
    });

    for (right = 0; right < s.length; right++) {
      const char = s[right];
      
      addState({
        line: 9,
        right,
        left,
        explanation: `Right pointer at index ${right}, character '${char}'`,
      });

      if (tCount[char]) {
        windowCount[char] = (windowCount[char] || 0) + 1;
        
        addState({
          line: 12,
          right,
          left,
          explanation: `Character '${char}' is in t. Window count for '${char}': ${windowCount[char]}`,
        });

        if (windowCount[char] === tCount[char]) {
          have++;
          addState({
            line: 13,
            right,
            left,
            explanation: `Window now has required count for '${char}'. Have count: ${have}/${need}`,
          });
        }
      }

      addState({
        line: 16,
        right,
        left,
        explanation: `Checking if current window [${left}, ${right}] contains all characters (have: ${have}, need: ${need})`,
      });

      while (have === need) {
        addState({
          line: 16,
          right,
          left,
          explanation: `Window [${left}, ${right}] contains all characters! Current substring: "${s.substring(left, right + 1)}"`,
        });

        if ((right - left + 1) < resultLen) {
          resultLen = right - left + 1;
          result = [left, right];
          addState({
            line: 18,
            right,
            left,
            explanation: `New minimum window found: "${s.substring(left, right + 1)}" (length: ${resultLen})`,
            newMinWindow: true,
          });
        }

        const leftChar = s[left];
        
        addState({
          line: 22,
          right,
          left,
          explanation: `Shrinking window from left. Removing character '${leftChar}'`,
        });

        if (tCount[leftChar]) {
          windowCount[leftChar]--;
          
          addState({
            line: 24,
            right,
            left,
            explanation: `Character '${leftChar}' is in t. Window count for '${leftChar}': ${windowCount[leftChar]}`,
          });

          if (windowCount[leftChar] < tCount[leftChar]) {
            have--;
            addState({
              line: 25,
              right,
              left,
              explanation: `Window no longer has required count for '${leftChar}'. Have count: ${have}/${need}`,
            });
          }
        }
        
        left++;
        addState({
          line: 27,
          right,
          left,
          explanation: `Left pointer moved to ${left}. Continuing to search for smaller windows...`,
        });
      }
    }

    addState({
      line: 31,
      finished: true,
      explanation: resultLen === Infinity 
        ? `No window found containing all characters of "${t}"`
        : `Minimum window found: "${s.substring(result[0], result[1] + 1)}" from indices [${result[0]}, ${result[1]}]`,
    });

    load(newHistory);
  }, [load]);

  const loadStrings = () => {
    const s = sInput.trim();
    const t = tInput.trim();

    if (!s || !t) {
      alert("Please enter both string s and string t.");
      return;
    }

    if (t.length > s.length) {
      alert("String t cannot be longer than string s.");
      return;
    }

    generateHistory(s, t);
  };

  const generateRandomStrings = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const sLength = Math.floor(Math.random() * 4) + 8;
    const tLength = Math.floor(Math.random() * 3) + 2;
    
    let s = "";
    for (let i = 0; i < sLength; i++) {
      s += characters[Math.floor(Math.random() * characters.length)];
    }
    
    let t = "";
    for (let i = 0; i < tLength; i++) {
      t += characters[Math.floor(Math.random() * characters.length)];
    }
    
    setSInput(s);
    setTInput(t);
    generateHistory(s, t);
  };

  const {
    s = "",
    left = 0,
    right = 0,
    have = 0,
    need = 0,
    windowCount = {},
    tCount = {},
    result = [-1, -1],
    explanation = "",
    newMinWindow = false,
    line = 2,
  } = currentState;

  useEffect(() => {
    if (isLoaded && left !== null && right !== null) {
      const container = document.getElementById("string-container");
      const startEl = document.getElementById(`string-container-element-${left}`);
      const endEl = document.getElementById(`string-container-element-${right}`);

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
          backgroundColor: newMinWindow 
            ? "rgba(34, 197, 94, 0.1)" 
            : "rgba(56, 189, 248, 0.1)",
          border: newMinWindow 
            ? "2px solid rgba(34, 197, 94, 0.5)"
            : "2px solid rgba(56, 189, 248, 0.5)",
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [visualizer.currentStep, isLoaded, left, right, newMinWindow]);

  const codeContent = {
    1: "string minWindow(string s, string t) {",
    2: "    unordered_map<char, int> tCount, windowCount;",
    3: "    for (char c : t) tCount[c]++;",
    4: "    int left = 0, right = 0;",
    5: "    int have = 0, need = tCount.size();",
    6: "    vector<int> result = {-1, -1}; int resultLen = INT_MAX;",
    8: "",
    9: "    for (right = 0; right < s.length(); right++) {",
    10: "        char c = s[right];",
    11: "        if (tCount.count(c)) {",
    12: "            windowCount[c]++;",
    13: "            if (windowCount[c] == tCount[c]) have++;",
    14: "        }",
    16: "        while (have == need) {",
    17: "            if ((right - left + 1) < resultLen) {",
    18: "                result = {left, right};",
    19: "                resultLen = right - left + 1;",
    20: "            }",
    22: "            char leftChar = s[left];",
    23: "            if (tCount.count(leftChar)) {",
    24: "                windowCount[leftChar]--;",
    25: "                if (windowCount[leftChar] < tCount[leftChar]) have--;",
    26: "            }",
    27: "            left++;",
    28: "        }",
    29: "    }",
    31: "    return resultLen == INT_MAX ? \"\" : s.substr(result[0], resultLen);",
    32: "}"
  };

  const getCharColor = (index, char) => {
    const isInWindow = index >= left && index <= right;
    const isInT = tCount && tCount[char];
    const isCurrentLeft = index === left;
    const isCurrentRight = index === right;
    const isInResult = index >= result?.[0] && index <= result?.[1];

    if (isCurrentLeft && isCurrentRight) {
      return "bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 border-yellow-400 shadow-lg shadow-yellow-500/50 scale-110";
    } else if (isCurrentLeft) {
      return "bg-gradient-to-br from-red-400 to-pink-500 text-white border-red-400 shadow-lg shadow-red-500/50";
    } else if (isCurrentRight) {
      return "bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-blue-400 shadow-lg shadow-blue-500/50";
    } else if (isInResult && isInT) {
      return "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/50";
    } else if (isInResult) {
      return "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400";
    } else if (isInWindow && isInT) {
      return "bg-gradient-to-br from-purple-400 to-indigo-500 text-white border-purple-400 shadow-lg";
    } else if (isInWindow) {
      return "bg-gray-600 border-blue-400 shadow-lg text-white";
    } else if (isInT) {
      return "bg-gray-700 border-purple-400 text-gray-300";
    }
    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300";
  };

  const minWindowStr = s && result?.[0] !== -1 ? s.substring(result[0], result[1] + 1) : "";

  const inputSection = (
    <>
      <input
        id="s-input"
        type="text"
        value={sInput}
        onChange={(e) => setSInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-green-500 font-mono shadow-sm"
        placeholder="e.g., ADOBECODEBANC"
      />
      <input
        id="t-input"
        type="text"
        value={tInput}
        onChange={(e) => setTInput(e.target.value)}
        disabled={isLoaded}
        className="w-full md:w-32 bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-green-500 font-mono shadow-sm text-center"
        placeholder="e.g., ABC"
      />
      {!isLoaded && (
        <button
          onClick={loadStrings}
          className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
      <button
        onClick={generateRandomStrings}
        className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl font-bold transition-all text-white shadow-lg cursor-pointer"
      >
        Random
      </button>
    </>
  );

  const currentWindowLength = right >= left && left !== null && right !== null ? right - left + 1 : 0;

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Characters Match
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {have} <span className="text-sm text-gray-500">/ {need}</span>
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
          Min Window
        </h4>
        <div className="text-3xl font-mono text-green-405 font-bold">
          {minWindowStr.length || 0}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(s + t)</span> - Linear time complexity since left and right pointers only move forward.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(s + t)</span> - For the maps storing character frequencies.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Minimum Window Substring"
      description="Find the minimum window in string s that contains all characters of string t (LeetCode #76)."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter string s and string t, then click Load & Visualize."
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
            {s.split("").map((_, index) => (
              <div key={index} className="w-10 text-center text-xs text-gray-500 font-mono">
                {index}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 justify-center">
            {s.split("").map((char, index) => (
              <div
                key={index}
                id={`string-container-element-${index}`}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${getCharColor(index, char)} ${
                  (index >= left && index <= right) ? "scale-110" : "scale-100"
                }`}
              >
                {char}
              </div>
            ))}
          </div>

          <div style={windowStyle} />

          {isLoaded && left !== null && (
            <Pointer
              index={left}
              containerId="string-container"
              color="red"
              label="left"
            />
          )}
          {isLoaded && right !== null && (
            <Pointer
              index={right}
              containerId="string-container"
              color="blue"
              label="right"
            />
          )}
        </div>

        {/* Character Counts */}
        <div className="bg-gradient-to-br from-amber-900/40 to-yellow-800/40 backdrop-blur-sm p-6 rounded-xl border border-amber-700/50 shadow-xl w-full">
          <h3 className="font-bold text-lg text-amber-300 mb-3 flex items-center gap-2">
            <Gauge size={20} />
            Character Counts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {tCount && Object.entries(tCount).map(([char, required]) => {
              const current = windowCount[char] || 0;
              const isMet = current >= required;
              return (
                <div key={char} className="flex flex-col items-center">
                  <div className="font-mono text-lg font-bold text-amber-400">
                    '{char}'
                  </div>
                  <div className="text-xs text-gray-400">
                    Required: {required}
                  </div>
                  <div className={`text-sm font-bold ${isMet ? "text-green-400" : "text-red-400"}`}>
                    Current: {current}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MinimumWindow;