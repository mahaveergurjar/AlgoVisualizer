import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock, Cpu } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const MoveZeros = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("0,1,0,3,12,0,8,0");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((arr) => {
    const newHistory = [];
    let currentArray = [...arr];
    let left = 0;

    const addState = (props) => {
      newHistory.push({
        array: [...currentArray],
        left,
        right: props.right,
        explanation: props.explanation || "",
        line: props.line || 3,
        finished: props.finished || false,
      });
    };

    // Initial state
    addState({
      right: 0,
      line: 2,
      explanation: `Initialize left = 0, starting right = 0.`,
    });

    for (let right = 0; right < currentArray.length; right++) {
      addState({
        right,
        line: 3,
        explanation: `Checking element at index right = ${right}. Value is ${currentArray[right]}.`,
      });

      addState({
        right,
        line: 4,
        explanation: `Is nums[${right}] (${currentArray[right]}) non-zero?`,
      });

      if (currentArray[right] !== 0) {
        const prevLeft = left;
        const temp = currentArray[left];
        currentArray[left] = currentArray[right];
        currentArray[right] = temp;
        
        addState({
          right,
          line: 5,
          explanation: `Yes, swap nums[left] (index ${prevLeft}: ${currentArray[right]}) with nums[right] (index ${right}: ${currentArray[prevLeft]}).`,
        });

        left++;
        addState({
          right,
          line: 6,
          explanation: `Increment left to ${left}.`,
        });
      } else {
        addState({
          right,
          line: 3,
          explanation: `Value is 0. Do nothing, move right pointer.`,
        });
      }
    }

    addState({
      right: currentArray.length,
      line: 9,
      finished: true,
      explanation: `Finished processing array. All zeros moved to end.`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    generateHistory(arr);
  };

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 8 }, () => 
      Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 1 : 0
    );
    setArrayInput(newArray.join(","));
    generateHistory(newArray);
  };

  const {
    array = [],
    left = 0,
    right = 0,
    explanation = "",
    finished = false,
    line = 2
  } = currentState;

  const codeContent = {
    1: `void moveZeroes(vector<int>& nums) {`,
    2: `    int left = 0;`,
    3: `    for (int right = 0; right < nums.size(); right++) {`,
    4: `        if (nums[right] != 0) {`,
    5: `            swap(nums[left], nums[right]);`,
    6: `            left++;`,
    7: `        }`,
    8: `    }`,
    9: `}`
  };

  const inputSection = (
    <>
      <input 
        id="array-input" 
        type="text" 
        value={arrayInput} 
        onChange={(e) => setArrayInput(e.target.value)} 
        disabled={isLoaded} 
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., 0, 1, 0, 3, 12, 0, 8, 0"
      />
      {!isLoaded && (
        <button 
          onClick={loadProblem} 
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

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Left (Non-zero boundary)
        </h4>
        <div className="text-3xl font-mono text-green-400">
          {left}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none">
          Right (Current)
        </h4>
        <div className="text-3xl font-mono text-yellow-400">
          {right < array.length ? right : "End"}
        </div>
      </div>
      <div className="sm:col-span-2 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Single pass.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - In-place swaps.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Move Zeros"
      description="LeetCode #283 - Move all zeros to the end in-place while maintaining order of non-zero elements."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter an array to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Array Problems
          </button>
        )}
        <h3 className="text-xl font-bold text-white mb-6 text-center">Two Pointers Visualization</h3>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Left (Non-zero boundary)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Right (Current)</span>
          </div>
        </div>

        {/* Array Visualization */}
        <div className="flex justify-center items-end gap-4 mb-8 min-h-[220px]">
          {array.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="flex gap-1 justify-center min-h-[30px]">
                {index === left && (
                  <span className="bg-green-500 text-gray-900 px-1 text-[10px] font-bold rounded">L</span>
                )}
                {index === right && !finished && (
                  <span className="bg-yellow-500 text-gray-900 px-1 text-[10px] font-bold rounded animate-bounce">R</span>
                )}
              </div>
              <div
                className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                  index === right && !finished
                    ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                    : index === left
                    ? "bg-green-500/30 border-green-400 scale-105 shadow-lg shadow-green-500/25"
                    : value === 0
                    ? "bg-red-500/20 border-red-400"
                    : "bg-blue-500/20 border-blue-400"
                } ${
                  finished && value === 0
                    ? "bg-red-500/30 border-red-400"
                    : ""
                }`}
                style={{ height: `${value === 0 ? 60 : value * 10 + 60}px` }}
              >
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{value}</span>
                </div>
                <div className={`w-full text-center py-1 text-xs font-bold ${
                  value === 0 ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                }`}>
                  {value === 0 ? "ZERO" : "NON-ZERO"}
                </div>
              </div>
              <div className="text-gray-400 text-sm font-mono">[{index}]</div>
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MoveZeros;