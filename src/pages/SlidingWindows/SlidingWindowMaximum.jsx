import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, Layers } from "lucide-react";
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
        className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}
      >
        {label}
      </div>
    </div>
  );
};

const SlidingWindowMaximum = ({ navigate }) => {
  const [mode, setMode] = useState("optimal");
  const [numsInput, setNumsInput] = useState("1,3,-1,-3,5,3,6,7");
  const [kInput, setKInput] = useState("3");
  const [windowStyle, setWindowStyle] = useState({});

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState, setCurrentStep } = visualizer;

  const generateBruteForceHistory = useCallback((nums, k) => {
    const newHistory = [];
    const result = [];
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        nums,
        k,
        result: [...result],
        windowStart: null,
        windowEnd: null,
        currentMax: null,
        comparingIndex: null,
        explanation: "",
        step: stepCount++,
        line: 3,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting brute force approach. Array has ${nums.length} elements, window size k = ${k}`,
    });

    for (let i = 0; i <= nums.length - k; i++) {
      addState({
        line: 4,
        windowStart: i,
        windowEnd: i + k - 1,
        currentIndex: i,
        explanation: `Checking window from index ${i} to ${i + k - 1}`,
      });

      let maxVal = -Infinity;
      addState({
        line: 5,
        windowStart: i,
        windowEnd: i + k - 1,
        currentMax: null,
        currentIndex: i,
        comparingIndex: i,
        explanation: "Initialize max for this window.",
      });

      for (let j = i; j < i + k; j++) {
        addState({
          line: 6,
          windowStart: i,
          windowEnd: i + k - 1,
          currentMax: maxVal === -Infinity ? null : maxVal,
          currentIndex: i,
          comparingIndex: j,
          explanation: `Comparing: current max = ${
            maxVal === -Infinity ? "-∞" : maxVal
          }, nums[${j}] = ${nums[j]}`,
        });

        if (nums[j] > maxVal) {
          maxVal = nums[j];
          addState({
            line: 7,
            windowStart: i,
            windowEnd: i + k - 1,
            currentMax: maxVal,
            currentIndex: i,
            comparingIndex: j,
            explanation: `Found new max: ${maxVal} at index ${j}`,
          });
        }
      }

      result.push(maxVal);
      addState({
        line: 9,
        windowStart: i,
        windowEnd: i + k - 1,
        currentMax: maxVal,
        currentIndex: i,
        explanation: `Window maximum is ${maxVal}. Added to result.`,
        justAddedToResult: true,
      });
    }

    addState({
      line: 11,
      finished: true,
      explanation: `Completed! Result: [${result.join(", ")}]`,
    });

    load(newHistory);
  }, [load]);

  const generateOptimalHistory = useCallback((nums, k) => {
    const newHistory = [];
    const result = [];
    const deque = [];
    let stepCount = 0;

    const addState = (props) => {
      newHistory.push({
        nums,
        k,
        result: [...result],
        deque: [...deque],
        windowStart: null,
        windowEnd: null,
        currentIndex: null,
        explanation: "",
        step: stepCount++,
        line: 3,
        ...props,
      });
    };

    addState({
      line: 3,
      explanation: `Starting optimal approach using Deque. Array has ${nums.length} elements, window size k = ${k}`,
    });

    for (let i = 0; i < nums.length; i++) {
      addState({
        line: 5,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Processing index ${i}, value = ${nums[i]}`,
      });

      addState({
        line: 7,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Check if deque front is outside window (i - k + 1 = ${i - k + 1})`,
      });

      while (deque.length > 0 && deque[0] < i - k + 1) {
        const removed = deque.shift();
        addState({
          line: 8,
          currentIndex: i,
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          removedFromFront: removed,
          explanation: `Removed index ${removed} from deque front (outside window)`,
        });
      }

      addState({
        line: 11,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        explanation: `Remove elements smaller than or equal to ${nums[i]} from deque back`,
      });

      while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
        const removed = deque.pop();
        addState({
          line: 12,
          currentIndex: i,
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          removedFromBack: removed,
          explanation: `Removed index ${removed} (value ${nums[removed]}) from back because ${nums[i]} is larger or equal`,
        });
      }

      deque.push(i);
      addState({
        line: 15,
        currentIndex: i,
        windowStart: Math.max(0, i - k + 1),
        windowEnd: i,
        justAddedToDeque: i,
        explanation: `Added index ${i} to deque back. Deque now: [${deque.join(", ")}]`,
      });

      if (i >= k - 1) {
        const maxVal = nums[deque[0]];
        result.push(maxVal);
        addState({
          line: 18,
          currentIndex: i,
          windowStart: i - k + 1,
          windowEnd: i,
          justAddedToResult: true,
          explanation: `Window [${i - k + 1}, ${i}] complete. Maximum = ${maxVal} at index ${deque[0]}`,
        });
      }
    }

    addState({
      line: 21,
      finished: true,
      explanation: `Completed! Result: [${result.join(", ")}]`,
    });

    load(newHistory);
  }, [load]);

  const loadArray = () => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput, 10);

    if (nums.some(isNaN) || nums.length === 0) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }

    if (isNaN(k) || k <= 0 || k > nums.length) {
      alert(`Invalid k value. Must be between 1 and ${nums.length}`);
      return;
    }

    if (mode === "brute-force") {
      generateBruteForceHistory(nums, k);
    } else {
      generateOptimalHistory(nums, k);
    }
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 5) + 8;
    const array = Array.from({ length }, () => Math.floor(Math.random() * 20) - 5);
    
    setNumsInput(array.join(","));
    const randomK = Math.floor(Math.random() * 4) + 2;
    setKInput(randomK.toString());
    if (mode === "brute-force") {
      generateBruteForceHistory(array, randomK);
    } else {
      generateOptimalHistory(array, randomK);
    }
  };

  const parseInput = useCallback(() => {
    const nums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput, 10);
    if (nums.some(isNaN) || isNaN(k) || k <= 0) throw new Error("Invalid input");
    return { nums, k };
  }, [numsInput, kInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ nums, k }) => generateBruteForceHistory(nums, k),
      optimal: ({ nums, k }) => generateOptimalHistory(nums, k),
    },
    setCurrentStep,
  });

  const {
    nums = [],
    result = [],
    deque = [],
    windowStart = null,
    windowEnd = null,
    currentIndex = null,
    comparingIndex = null,
    currentMax = null,
    explanation = "",
    line = 3,
  } = currentState;

  useEffect(() => {
    if (isLoaded && windowStart !== null && windowEnd !== null) {
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
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          border: "2px solid rgba(56, 189, 248, 0.5)",
          borderRadius: "12px",
          transition: "all 300ms ease-out",
          opacity: 1,
        });
      }
    } else {
      setWindowStyle({ opacity: 0 });
    }
  }, [visualizer.currentStep, isLoaded, windowStart, windowEnd]);

  const codeContent = mode === "brute-force" ? {
    1: "vector<int> maxSlidingWindow(vector<int>& nums, int k) {",
    2: "    vector<int> result;",
    3: "    int n = nums.size();",
    4: "    for (int i = 0; i <= n - k; i++) {",
    5: "        int maxVal = nums[i];",
    6: "        for (int j = i; j < i + k; j++) {",
    7: "            maxVal = max(maxVal, nums[j]);",
    8: "        }",
    9: "        result.push_back(maxVal);",
    10: "    }",
    11: "    return result;",
    12: "}"
  } : {
    1: "vector<int> maxSlidingWindow(vector<int>& nums, int k) {",
    2: "    vector<int> result;",
    3: "    deque<int> dq;",
    4: "    int n = nums.size();",
    5: "    for (int i = 0; i < n; i++) {",
    6: "        // Remove out-of-window elements",
    7: "        while (!dq.empty() && dq.front() < i - k + 1) {",
    8: "            dq.pop_front();",
    9: "        }",
    10: "        // Remove smaller elements",
    11: "        while (!dq.empty() && nums[dq.back()] <= nums[i]) {",
    12: "            dq.pop_back();",
    13: "        }",
    14: "        // Add current index",
    15: "        dq.push_back(i);",
    16: "        // Add to result if window is complete",
    17: "        if (i >= k - 1) {",
    18: "            result.push_back(nums[dq.front()]);",
    19: "        }",
    20: "    }",
    21: "    return result;",
    22: "}"
  };

  const getCellColor = (index) => {
    const num = nums[index];
    const isComp = comparingIndex === index;
    const isCurMax = mode === "brute-force" && num === currentMax && index <= comparingIndex;
    const isDeq = mode === "optimal" && deque.includes(index);
    const isDeqFront = mode === "optimal" && deque[0] === index;
    const isCurIdx = currentIndex === index;
    const isInWindow = index >= windowStart && index <= windowEnd;

    if (isCurIdx) {
      return "bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 border-yellow-400 shadow-lg shadow-yellow-500/50 scale-110 font-bold";
    } else if (isDeqFront) {
      return "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/50 font-bold";
    } else if (isDeq) {
      return "bg-gradient-to-br from-cyan-400 to-blue-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/50 font-bold";
    } else if (isCurMax || isComp) {
      return "bg-gradient-to-br from-pink-400 to-rose-500 text-white border-pink-400 shadow-lg shadow-pink-500/50 font-bold";
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
        id="array-input"
        type="text"
        value={numsInput}
        onChange={(e) => setNumsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., 1,3,-1,-3,5,3,6,7"
      />
      <div className="flex items-center gap-3">
        <label htmlFor="k-input" className="text-gray-350 font-mono text-sm whitespace-nowrap">k:</label>
        <input
          id="k-input"
          type="number"
          value={kInput}
          onChange={(e) => setKInput(e.target.value)}
          disabled={isLoaded}
          className="w-20 bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm text-center"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={loadArray}
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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
          Current Max
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {mode === "brute-force" ? (currentMax !== null && currentMax !== undefined ? currentMax : "N/A") : (deque?.length > 0 ? nums[deque[0]] : "N/A")}
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
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Result Count
        </h4>
        <div className="text-3xl font-mono text-green-405 font-bold">
          {result?.length || 0}
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
              {mode === "brute-force" ? "O(n · k)" : "O(n)"}
            </span>{" "}
            - {mode === "brute-force" ? "Scanning all elements in each window of size k." : "Each index is pushed and popped from deque at most once."}
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(k)</span> - Deque stores at most k elements at any time.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Sliding Window Maximum"
      description="Find the maximum value in each sliding window of size k (LeetCode #239)."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array and window size k, then click Load & Visualize."
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
        <div className="relative py-4 w-full" id="array-container">
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

          {isLoaded && windowStart !== null && (
            <Pointer
              index={windowStart}
              containerId="array-container"
              color="red"
              label="start"
            />
          )}
          {isLoaded && currentIndex !== null && (
            <Pointer
              index={currentIndex}
              containerId="array-container"
              color="green"
              label="current"
            />
          )}
        </div>

        {/* Deque Visualization (Optimal Mode) */}
        {mode === "optimal" && (
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 shadow-xl w-full">
            <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
              <Layers size={20} />
              Deque (Front → Back)
            </h3>
            <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
              {deque.length > 0 ? (
                deque.map((idx, index) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 transition-all ${
                        index === 0
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-400 text-white"
                          : "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-400 text-white"
                      }`}
                    >
                      <span className="text-xs opacity-80">idx: {idx}</span>
                      <span className="text-lg">{nums[idx]}</span>
                    </div>
                    {index === 0 && (
                      <span className="text-xs text-green-400 mt-1 font-bold">Front (Max)</span>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-gray-400 italic text-sm">Deque is empty</span>
              )}
            </div>
          </div>
        )}

        {/* Result Array Visualization */}
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-800/40 backdrop-blur-sm p-6 rounded-xl border border-green-700/50 shadow-xl w-full">
          <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
            <CheckCircle size={20} />
            Result Maximums Array
          </h3>
          <div className="flex gap-2 min-h-[3.5rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center justify-center">
            {result.length > 0 ? (
              result.map((val, index) => (
                <div
                  key={index}
                  className="w-12 h-12 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white"
                >
                  {val}
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic text-sm">Result is empty</span>
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SlidingWindowMaximum;