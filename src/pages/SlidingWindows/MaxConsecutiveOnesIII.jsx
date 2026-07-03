import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
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
        style={{ borderBottomColor: color === "red" ? "#ef4444" : "#3b82f6" }}
      />
      <div
        className={`text-xs font-bold mt-1 text-center ${colors[color].text}`}
      >
        {label}
      </div>
    </div>
  );
};

const MaxConsecutiveOnes = ({ navigate }) => {
  const [numsInput, setNumsInput] = useState("1,1,1,0,0,0,1,1,1,1,0");
  const [kInput, setKInput] = useState("2");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((localNums, localK) => {
    const newHistory = [];
    let left = 0;
    let zeroCount = 0;
    let maxLength = 0;
    let stepCount = 0;

    const addState = (right = null, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        nums: [...localNums],
        left,
        right,
        zeroCount,
        maxLength,
        line,
        k: localK,
        step: stepCount++,
        explanation,
        ...extraProps,
      });
    };

    addState(null, "Initialize left pointer, zero count, and max length variables", 2);
    addState(null, "Variables initialized: left=0, zeroCount=0, maxLength=0", 3);
    addState(null, "Ready to start sliding window algorithm", 4);

    for (let right = 0; right < localNums.length; right++) {
      addState(right, `Right pointer moves to position ${right}. Current element: ${localNums[right]}`, 6);
      addState(right, `Checking if element at position ${right} is zero`, 7);
      
      if (localNums[right] === 0) {
        zeroCount++;
        addState(right, `Found zero! Zero count increased to ${zeroCount}`, 8);
      }
      
      addState(right, `Checking if zero count (${zeroCount}) exceeds k (${localK})`, 11);
      
      while (zeroCount > localK) {
        addState(right, `Too many zeros! Need to shrink window from the left`, 12);
        
        if (localNums[left] === 0) {
          zeroCount--;
          addState(right, `Left element is zero. Zero count decreased to ${zeroCount}`, 13);
        }
        
        left++;
        addState(right, `Left pointer moved to position ${left}`, 15);
        addState(right, `Updated zero count: ${zeroCount}, k: ${localK}`, 11);
      }
      
      const currentLength = right - left + 1;
      maxLength = Math.max(maxLength, currentLength);
      addState(right, `Window from ${left} to ${right} has length ${currentLength}. Max length updated to ${maxLength}`, 18);
    }

    addState(localNums.length - 1, `Algorithm complete! Maximum consecutive ones with at most ${localK} flips: ${maxLength}`, 21);

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number);
    const localK = parseInt(kInput, 10);

    if (localNums.some(isNaN) || isNaN(localK)) {
      alert("Invalid input. Please use comma-separated numbers for the array.");
      return;
    }

    generateHistory(localNums, localK);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 8;
    const zeros = Math.floor(Math.random() * 4) + 2;
    const ones = length - zeros;
    
    const array = [
      ...Array(ones).fill(1),
      ...Array(zeros).fill(0)
    ];
    
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    setNumsInput(array.join(","));
    const randomK = Math.floor(Math.random() * 3) + 1;
    setKInput(randomK.toString());
    generateHistory(array, randomK);
  };

  const {
    nums = [],
    left = 0,
    right = -1,
    zeroCount = 0,
    maxLength = 0,
    line = 2,
    k = 2,
    explanation = "",
  } = currentState;

  const codeContent = {
    1: "int longestOnes(vector<int>& nums, int k) {",
    2: "    int left = 0;",
    3: "    int zeroCount = 0;",
    4: "    int maxLength = 0;",
    6: "    for (int right = 0; right < nums.size(); right++) {",
    7: "        if (nums[right] == 0) {",
    8: "            zeroCount++;",
    9: "        }",
    11: "        while (zeroCount > k) {",
    12: "            if (nums[left] == 0) {",
    13: "                zeroCount--;",
    14: "            }",
    15: "            left++;",
    16: "        }",
    18: "        maxLength = max(maxLength, right - left + 1);",
    19: "    }",
    21: "    return maxLength;",
    22: "}"
  };

  const getCellColor = (index) => {
    const isInWindow = index >= left && index <= right;
    const isZero = nums[index] === 0;
    
    if (isInWindow) {
      if (isZero) {
        return "bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-400 shadow-lg shadow-amber-500/50 scale-110";
      }
      return "bg-gray-600 border-amber-400 shadow-lg text-white";
    }
    return "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300";
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={numsInput}
        onChange={(e) => setNumsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500 font-mono shadow-sm"
        placeholder="e.g., 1,1,1,0,0,0,1,1,1,1,0"
      />
      <div className="flex items-center gap-3">
        <label htmlFor="k-input" className="text-gray-305 font-mono text-sm whitespace-nowrap">k:</label>
        <input
          id="k-input"
          type="number"
          value={kInput}
          onChange={(e) => setKInput(e.target.value)}
          disabled={isLoaded}
          className="w-20 bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-amber-500 font-mono shadow-sm text-center"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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

  const currentWindowLength = right >= left && left !== null && right !== null ? right - left + 1 : 0;

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Zeros Flipped
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {zeroCount} <span className="text-sm text-gray-500">/ {k}</span>
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
        <h4 className="text-amber-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(n)</span> - Each element is visited at most twice (by left and right pointers).
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-35">O(1)</span> - Only constant extra space for pointers.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Max Consecutive Ones III"
      description="Find the longest subarray of 1s after flipping at most K zeros (LeetCode #1004)."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter binary array and k, then click Load & Visualize."
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
        <div className="relative py-4 w-full" id="main-array-container">
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
                id={`main-array-container-element-${index}`}
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-xl transition-all duration-500 transform ${getCellColor(index)} ${
                  (index >= left && index <= right) ? "scale-110" : "scale-100"
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          {isLoaded && left !== null && right !== null && (
            <>
              <Pointer
                index={left}
                containerId="main-array-container"
                color="red"
                label="left"
              />
              <Pointer
                index={right}
                containerId="main-array-container"
                color="blue"
                label="right"
              />
            </>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MaxConsecutiveOnes;
