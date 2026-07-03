import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, ShoppingBasket } from "lucide-react";
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
        className={`text-xs font-bold mt-1 text-center ${colors[color].text} whitespace-nowrap`}
      >
        {label}
      </div>
    </div>
  );
};

const FruitsIntoBaskets = ({ navigate }) => {
  const [mode, setMode] = useState("optimal");
  const [numsInput, setNumsInput] = useState("2,4,5,2,2,1,3,2,1,1");
  const [windowStyle, setWindowStyle] = useState({ opacity: 0 });

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState, setCurrentStep } = visualizer;

  const generateBruteForceHistory = useCallback((fruits) => {
    const newHistory = [];
    let maxLength = 0;

    const addState = (props) =>
      newHistory.push({
        nums: fruits,
        windowStart: null,
        windowEnd: null,
        maxLength,
        currentBaskets: new Set(),
        explanation: "",
        line: 1,
        ...props,
      });

    addState({ line: 1, explanation: "Initializing brute-force approach. Max length is 0." });

    for (let i = 0; i < fruits.length; i++) {
      addState({
        line: 2,
        windowStart: i,
        explanation: `Starting a new potential subarray from outer loop index i = ${i}.`,
      });

      for (let j = i; j < fruits.length; j++) {
        const currentSubarray = fruits.slice(i, j + 1);
        const currentBaskets = new Set(currentSubarray);

        addState({
          line: 3,
          windowStart: i,
          windowEnd: j,
          currentBaskets,
          explanation: `Inner loop j = ${j}. Checking subarray from index ${i} to ${j}. It has ${currentBaskets.size} fruit types.`,
        });

        if (currentBaskets.size <= 2) {
          addState({
            line: 6,
            windowStart: i,
            windowEnd: j,
            currentBaskets,
            explanation: `Subarray is valid (${currentBaskets.size} types <= 2).`,
          });
          maxLength = Math.max(maxLength, j - i + 1);
          addState({
            line: 7,
            windowStart: i,
            windowEnd: j,
            currentBaskets,
            maxLength,
            updatedMaxLength: true,
            explanation: `Updated max length to ${maxLength}.`,
          });
        } else {
          addState({
            line: 8,
            windowStart: i,
            windowEnd: j,
            currentBaskets,
            isInvalid: true,
            explanation: `Invalid subarray with ${currentBaskets.size} fruit types. Breaking inner loop.`,
          });
          break;
        }
      }
    }
    addState({
      line: 11,
      finished: true,
      maxLength,
      explanation: `Finished! The maximum number of fruits is ${maxLength}.`,
    });
    load(newHistory);
  }, [load]);

  const generateOptimalHistory = useCallback((fruits) => {
    const newHistory = [];
    let windowStart = 0;
    let maxLength = 0;
    const fruitFrequency = new Map();

    const addState = (props) =>
      newHistory.push({
        nums: fruits,
        windowStart,
        windowEnd: null,
        maxLength,
        fruitFrequency: new Map(fruitFrequency),
        explanation: "",
        updatedMaxLength: false,
        isInvalid: false,
        removingIndex: null,
        line: 1,
        ...props,
      });

    addState({ line: 1, explanation: "Initializing variables. Window is empty." });

    for (let windowEnd = 0; windowEnd < fruits.length; windowEnd++) {
      const rightFruit = fruits[windowEnd];
      addState({
        line: 4,
        windowEnd,
        explanation: `Processing element at windowEnd = ${windowEnd} (fruit type ${rightFruit}).`,
      });

      fruitFrequency.set(rightFruit, (fruitFrequency.get(rightFruit) || 0) + 1);
      addState({
        line: 6,
        windowEnd,
        explanation: `Added fruit ${rightFruit} to basket. Basket now has ${fruitFrequency.size} fruit types.`,
      });
      
      if (fruitFrequency.size > 2) {
        addState({
          line: 8,
          windowEnd,
          isInvalid: true,
          explanation: `Window is invalid! More than 2 fruit types (${fruitFrequency.size}). Need to shrink from the left.`,
        });
      }

      while (fruitFrequency.size > 2) {
        const leftFruit = fruits[windowStart];
        addState({
          line: 9,
          windowEnd,
          isInvalid: true,
          removingIndex: windowStart,
          explanation: `Shrinking window. Element at windowStart = ${windowStart} (fruit type ${leftFruit}) will be removed.`,
        });

        fruitFrequency.set(leftFruit, fruitFrequency.get(leftFruit) - 1);
        if (fruitFrequency.get(leftFruit) === 0) {
          fruitFrequency.delete(leftFruit);
        }
        
        windowStart++;
        addState({
          line: 12,
          windowEnd,
          explanation: `Removed fruit ${leftFruit}. Window start is now at index ${windowStart}. Baskets are valid again.`,
        });
      }

      maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
      addState({
        line: 15,
        windowEnd,
        maxLength,
        updatedMaxLength: true,
        explanation: `Window is valid. Current length is ${windowEnd - windowStart + 1}. Max length is ${maxLength}.`,
      });
    }

    addState({
      line: 18,
      windowEnd: fruits.length - 1,
      finished: true,
      maxLength,
      explanation: `Finished! The maximum number of fruits we can pick is ${maxLength}.`,
    });
    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const fruits = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (fruits.some(isNaN) || fruits.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }

    if (mode === "brute-force") {
      generateBruteForceHistory(fruits);
    } else {
      generateOptimalHistory(fruits);
    }
  };

  const generateRandomArray = () => {
    const length = 10;
    const array = Array.from({ length }, () => Math.floor(Math.random() * 5) + 1);
    setNumsInput(array.join(","));
    if (mode === "brute-force") {
      generateBruteForceHistory(array);
    } else {
      generateOptimalHistory(array);
    }
  };

  const parseInput = useCallback(() => {
    const nums = numsInput.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
    if (nums.some(isNaN) || nums.length === 0) throw new Error("Invalid input");
    return { nums };
  }, [numsInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ nums }) => generateBruteForceHistory(nums),
      optimal: ({ nums }) => generateOptimalHistory(nums),
    },
    setCurrentStep,
  });

  const {
    nums = [],
    windowStart = null,
    windowEnd = null,
    maxLength = 0,
    currentBaskets = new Set(),
    fruitFrequency = new Map(),
    explanation = "",
    isInvalid = false,
    removingIndex = null,
    line = 1,
  } = currentState;

  useEffect(() => {
    if (isLoaded && windowStart !== null && windowEnd !== null && windowStart >= 0) {
      const container = document.getElementById("array-container");
      const startEl = document.getElementById(`array-container-element-${windowStart}`);
      const endEl = document.getElementById(`array-container-element-${windowEnd}`);
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
          backgroundColor: isInvalid ? "rgba(239, 68, 68, 0.1)" : "rgba(56, 189, 248, 0.1)",
          border: `2px solid ${isInvalid ? "rgba(239, 68, 68, 0.5)" : "rgba(56, 189, 248, 0.5)"}`,
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [visualizer.currentStep, isLoaded, windowStart, windowEnd, isInvalid]);

  const codeContent = mode === "brute-force" ? {
    1: "int totalFruit(vector<int>& fruits) {",
    2: "    int maxLength = 0; int n = fruits.size();",
    3: "    for (int i = 0; i < n; i++) {",
    4: "        unordered_set<int> baskets;",
    5: "        for (int j = i; j < n; j++) {",
    6: "            baskets.insert(fruits[j]);",
    7: "            if (baskets.size() <= 2)",
    8: "                maxLength = max(maxLength, j - i + 1);",
    9: "            else",
    10: "                break;",
    11: "        }",
    12: "    }",
    13: "    return maxLength;",
    14: "}"
  } : {
    1: "int totalFruit(vector<int>& fruits) {",
    2: "    int windowStart = 0; int maxLength = 0;",
    3: "    unordered_map<int, int> fruitFrequency;",
    4: "    for (int windowEnd = 0; windowEnd < fruits.size(); windowEnd++) {",
    5: "        int rightFruit = fruits[windowEnd];",
    6: "        fruitFrequency[rightFruit]++;",
    8: "        while (fruitFrequency.size() > 2) {",
    9: "            int leftFruit = fruits[windowStart];",
    10: "            fruitFrequency[leftFruit]--;",
    11: "            if (fruitFrequency[leftFruit] == 0) {",
    12: "                fruitFrequency.erase(leftFruit);",
    13: "            }",
    14: "            windowStart++;",
    15: "        }",
    16: "        maxLength = max(maxLength, windowEnd - windowStart + 1);",
    17: "    }",
    18: "    return maxLength;",
    19: "}"
  };

  const inputSection = (
    <>
      <div className="flex bg-gray-950 p-1.5 rounded-xl border border-gray-800">
        <button
          onClick={() => handleModeChange("brute-force")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "brute-force"
              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Brute Force
        </button>
        <button
          onClick={() => handleModeChange("optimal")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "optimal"
              ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Optimal (O(n))
        </button>
      </div>
      <input
        id="array-input"
        type="text"
        value={numsInput}
        onChange={(e) => setNumsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-orange-500 font-mono shadow-sm"
        placeholder="e.g., 2,4,5,2,2,1,3,2,1,1"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
      <button
        onClick={generateRandomArray}
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
          Fruit Types
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {mode === "optimal" ? fruitFrequency?.size || 0 : currentBaskets?.size || 0} <span className="text-sm text-gray-500">/ 2</span>
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
        <h4 className="text-orange-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">
              {mode === "brute-force" ? "O(n²)" : "O(n)"}
            </span>{" "}
            - {mode === "brute-force" ? "Checks all subarrays starting at each position." : "Linear scan where both pointers only move forward."}
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(1)</span> - Baskets storage is limited to at most 3 elements.
          </div>
        </div>
      </div>
    </>
  );

  const getCellColor = (index) => {
    const isInWindow = index >= windowStart && index <= windowEnd;
    const isWindowStart = index === windowStart && isInWindow;
    const isWindowEnd = index === windowEnd && isInWindow;
    const isRemoving = index === removingIndex;

    if (isRemoving) {
      return "bg-gradient-to-br from-purple-400 to-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/50 scale-110";
    } else if (isWindowStart) {
      return "bg-gradient-to-br from-red-400 to-red-500 text-white border-red-400 shadow-lg shadow-red-500/50";
    } else if (isWindowEnd) {
      return "bg-gradient-to-br from-blue-400 to-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/50";
    } else if (isInWindow) {
      return "bg-gray-600 border-blue-400 shadow-lg";
    }
    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300";
  };

  return (
    <VisualizerLayout
      title="Fruits Into Baskets"
      description="Find the longest contiguous subarray containing at most 2 different fruit types (LeetCode #904)."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter fruit types separated by commas, then click Load & Visualize."
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
        
        {/* Array Visualization */}
        <div className="relative w-full py-4" id="array-container">
          <div className="flex gap-2 mb-2 justify-center">
            {nums.map((_, index) => (
              <div key={index} className="w-14 text-center text-xs text-gray-500 font-mono">
                {index}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 justify-center">
            {nums.map((num, index) => (
              <div
                key={index}
                id={`array-container-element-${index}`}
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${
                  (index >= windowStart && index <= windowEnd) ? "scale-110" : "scale-100"
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          <div style={windowStyle} />

          {isLoaded && windowStart !== null && windowStart >= 0 && (
            <Pointer
              index={windowStart}
              containerId="array-container"
              color="red"
              label="start"
            />
          )}
          {isLoaded && windowEnd !== null && windowEnd < nums.length && (
            <Pointer
              index={windowEnd}
              containerId="array-container"
              color="blue"
              label="end"
            />
          )}
        </div>

        {/* Baskets Visualization */}
        <div className="bg-gradient-to-br from-orange-900/40 to-amber-800/40 backdrop-blur-sm p-6 rounded-xl border border-orange-700/50 shadow-xl w-full">
          <h3 className="font-bold text-lg text-orange-300 mb-3 flex items-center gap-2">
            <ShoppingBasket size={20} />
            Baskets (Fruit Types)
          </h3>
          <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
            {mode === "optimal" && fruitFrequency?.size > 0 && Array.from(fruitFrequency.entries()).map(([fruit, count]) => (
              <div key={fruit} className="flex flex-col items-center">
                <div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange-600 to-amber-700 border-orange-400">
                  <span className="text-xs text-gray-300">Type</span>
                  <span className="text-lg text-white">{fruit}</span>
                </div>
                <span className="text-xs text-gray-400 mt-1">count: {count}</span>
              </div>
            ))}
            {mode === "brute-force" && currentBaskets?.size > 0 && Array.from(currentBaskets.values()).map((fruit) => (
              <div key={fruit} className="flex flex-col items-center">
                <div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange-600 to-amber-700 border-orange-400">
                  <span className="text-xs text-gray-300">Type</span>
                  <span className="text-lg text-white">{fruit}</span>
                </div>
              </div>
            ))}
            {(!fruitFrequency || fruitFrequency.size === 0) && (!currentBaskets || currentBaskets.size === 0) && (
              <span className="text-gray-500 italic text-sm">Baskets are empty</span>
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default FruitsIntoBaskets;