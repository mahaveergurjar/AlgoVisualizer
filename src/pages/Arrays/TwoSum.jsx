import React, { useState, useCallback } from "react";
import { ArrowLeft, Target, Clock, Cpu } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const TwoSum = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("2,7,11,15,3,6,8,4");
  const [targetInput, setTargetInput] = useState("9");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((arr, tgt) => {
    const newHistory = [];
    const map = new Map();

    const addState = (props) => {
      newHistory.push({
        array: [...arr],
        target: tgt,
        map: new Map(map),
        currentIndex: props.currentIndex ?? 0,
        explanation: props.explanation || "",
        line: props.line || 3,
        found: props.found || false,
        pair: props.pair || [],
        finished: props.finished || false,
      });
    };

    addState({
      line: 2,
      currentIndex: 0,
      explanation: `Initialize empty hash map to store value-to-index mappings.`,
    });

    for (let i = 0; i < arr.length; i++) {
      addState({
        line: 3,
        currentIndex: i,
        explanation: `Iteration i = ${i}. Checking element array[${i}] = ${arr[i]}.`,
      });

      const complement = tgt - arr[i];
      addState({
        line: 4,
        currentIndex: i,
        explanation: `Calculate complement: target (${tgt}) - current element (${arr[i]}) = ${complement}.`,
      });

      addState({
        line: 5,
        currentIndex: i,
        explanation: `Check if complement ${complement} exists in hash map.`,
      });

      if (map.has(complement)) {
        const complIdx = map.get(complement);
        addState({
          line: 6,
          currentIndex: i,
          found: true,
          pair: [complIdx, i],
          explanation: `Complement ${complement} found at index ${complIdx}! We found our pair!`,
        });

        addState({
          line: 6,
          currentIndex: i,
          found: true,
          pair: [complIdx, i],
          finished: true,
          explanation: `Return indices: [${complIdx}, ${i}]. Solution found.`,
        });
        load(newHistory);
        return;
      }

      map.set(arr[i], i);
      addState({
        line: 8,
        currentIndex: i,
        explanation: `Complement not found. Insert value ${arr[i]} at index ${i} into hash map.`,
      });
    }

    addState({
      line: 10,
      finished: true,
      explanation: `No two numbers sum to ${tgt} in the array.`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    const tgt = parseInt(targetInput, 10);
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    if (isNaN(tgt)) {
      alert("Please enter a valid target.");
      return;
    }
    generateHistory(arr, tgt);
  };

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    const tgt = Math.floor(Math.random() * 30) + 5;
    setArrayInput(newArray.join(","));
    setTargetInput(tgt.toString());
    generateHistory(newArray, tgt);
  };

  const {
    array = [],
    target = 9,
    map = new Map(),
    currentIndex = 0,
    explanation = "",
    found = false,
    pair = [],
    finished = false,
    line = 3
  } = currentState;

  const codeContent = {
    1: `vector<int> twoSum(vector<int>& nums, int target) {`,
    2: `    unordered_map<int, int> map;`,
    3: `    for (int i = 0; i < nums.size(); i++) {`,
    4: `        int complement = target - nums[i];`,
    5: `        if (map.find(complement) != map.end()) {`,
    6: `            return {map[complement], i};`,
    7: `        }`,
    8: `        map[nums[i]] = i;`,
    9: `    }`,
    10: `    return {-1, -1};`,
    11: `}`
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
        placeholder="e.g., 2,7,11,15,3,6,8,4"
      />
      <input 
        id="target-input" 
        type="number" 
        value={targetInput} 
        onChange={(e) => setTargetInput(e.target.value)} 
        disabled={isLoaded} 
        className="w-full md:w-24 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="Target"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-orange-400 select-none">
          Target Sum
        </h4>
        <div className="text-3xl font-mono text-orange-400 font-bold">
          {target}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none">
          Current Element
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          {currentIndex < array.length ? array[currentIndex] : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Complement
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {currentIndex < array.length ? (target - array[currentIndex]) : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Single pass hash map lookup.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Hash map storage for up to n elements.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Two Sum"
      description="LeetCode #1 - Find two numbers in an array that add up to a target using a Hash Map."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array and target to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-8">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Array Problems
          </button>
        )}
        <h3 className="text-xl font-bold text-white mb-6 text-center">Hash Map Visualization</h3>
        
        {/* Array Visualization */}
        <div className="flex justify-center items-end gap-4 mb-8 min-h-[220px]">
          {array.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="flex gap-1 justify-center min-h-[30px]">
                {index === currentIndex && !finished && (
                  <span className="bg-yellow-500 text-gray-900 px-1 text-[10px] font-bold rounded animate-bounce">CURR</span>
                )}
                {found && pair.includes(index) && (
                  <span className="bg-green-500 text-gray-900 px-1 text-[10px] font-bold rounded animate-pulse">FOUND</span>
                )}
              </div>
              <div
                className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                  index === currentIndex && !finished
                    ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                    : found && pair.includes(index)
                    ? "bg-green-500/30 border-green-400 scale-105 shadow-lg shadow-green-500/25 animate-pulse"
                    : index < currentIndex
                    ? "bg-blue-500/20 border-blue-400 text-gray-300"
                    : "bg-gray-700 border-gray-600 text-gray-400"
                }`}
                style={{ height: `${value * 10 + 60}px` }}
              >
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{value}</span>
                </div>
                <div className={`w-full text-center py-1 text-xs font-bold ${
                  index === currentIndex ? "bg-yellow-500 text-white" :
                  found && pair.includes(index) ? "bg-green-500 text-white" :
                  "bg-gray-600 text-gray-300"
                }`}>
                  {index === currentIndex ? "CURR" : 
                   found && pair.includes(index) ? "FOUND" : ""}
                </div>
              </div>
              <div className="text-gray-400 text-sm font-mono">[{index}]</div>
            </div>
          ))}
        </div>

        {/* Hash Map Display */}
        {map && map.size > 0 && (
          <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-750">
            <h4 className="text-lg font-bold text-gray-300 mb-3 font-mono">Hash Map Contents (value → index)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from(map.entries()).map(([key, val]) => (
                <div key={key} className="bg-gray-800 rounded-lg p-2 text-center border border-gray-700">
                  <div className="text-orange-400 font-mono font-bold text-lg">{key}</div>
                  <div className="text-gray-400 text-sm">→ index [{val}]</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default TwoSum;