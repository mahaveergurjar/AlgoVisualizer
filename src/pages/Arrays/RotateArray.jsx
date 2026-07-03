import React, { useState, useCallback } from "react";
import { Clock, RotateCw } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const RotateArray = () => {
  const [arrayInput, setArrayInput] = useState("1,2,3,4,5,6,7");
  const [kInput, setKInput] = useState("3");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateRotateHistory = useCallback((arr, k) => {
    const newHistory = [];
    const n = arr.length;
    k = k % n;

    const addState = (props) =>
      newHistory.push({
        arr: [...arr],
        explanation: "",
        ...props,
      });

    addState({ 
      line: 3, 
      explanation: `Rotate array [${arr.join(", ")}] right by k=${k} positions (k = k % n).` 
    });

    if (k === 0) {
      addState({ 
        line: 7, 
        finished: true,
        explanation: `k=0 or k is a multiple of n. No rotation needed.` 
      });
      load(newHistory);
      return;
    }

    const reverse = (start, end, parentLine, stepNum) => {
      addState({
        line: parentLine,
        step: stepNum,
        reverseStart: start,
        reverseEnd: end,
        explanation: `Reverse subarray from index ${start} to ${end}.`,
      });

      while (start < end) {
        addState({
          line: parentLine,
          step: stepNum,
          reverseStart: start,
          reverseEnd: end,
          swapIndices: [start, end],
          explanation: `Swap arr[${start}] (${arr[start]}) with arr[${end}] (${arr[end]}).`,
        });
        [arr[start], arr[end]] = [arr[end], arr[start]];
        start++;
        end--;
      }
    };

    addState({ 
      line: 4, 
      step: 1,
      explanation: `Step 1: Reverse entire array.` 
    });
    reverse(0, n - 1, 4, 1);

    addState({ 
      line: 5, 
      step: 2,
      explanation: `Step 2: Reverse first k elements.` 
    });
    reverse(0, k - 1, 5, 2);

    addState({ 
      line: 6, 
      step: 3,
      explanation: `Step 3: Reverse remaining n-k elements.` 
    });
    reverse(k, n - 1, 6, 3);

    addState({
      line: 7,
      finished: true,
      explanation: `Complete! Array rotated right by ${k}: [${arr.join(", ")}].`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput.split(",").map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
    const k = parseInt(kInput, 10);
    
    if (arr.length === 0) {
      alert("Please enter a valid array.");
      return;
    }
    if (isNaN(k) || k < 0) {
      alert("Please enter a valid positive number for k.");
      return;
    }
    
    generateRotateHistory(arr, k);
  };

  const {
    arr = [],
    swapIndices = [],
    reverseStart = -1,
    reverseEnd = -1,
    explanation = "",
    finished = false,
    step = 0,
    line = 2
  } = currentState;

  const codeContent = {
    1: `void rotate(vector<int>& nums, int k) {`,
    2: `    int n = nums.size();`,
    3: `    k = k % n;`,
    4: `    reverse(nums.begin(), nums.end());`,
    5: `    reverse(nums.begin(), nums.begin() + k);`,
    6: `    reverse(nums.begin() + k, nums.end());`,
    7: `}`
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
        placeholder="e.g., 1,2,3,4,5,6,7"
      />
      <input 
        id="k-input" 
        type="number" 
        min="0"
        value={kInput} 
        onChange={(e) => setKInput(e.target.value)} 
        disabled={isLoaded} 
        className="w-full md:w-32 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="k"
      />
      {!isLoaded && (
        <button 
          onClick={loadProblem} 
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          k Value
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {kInput}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Current Phase
        </h4>
        <div className="text-xl font-bold text-purple-400 select-none uppercase">
          {step > 0 ? `Step ${step}/3` : finished ? "Done" : "Init"}
        </div>
      </div>
      <div className="sm:col-span-2 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Three reversals.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - In-place rotation.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Rotate Array"
      description="LeetCode #189 - Rotate an array to the right by k steps in-place using array reversals."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array and rotation steps to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-300">
            Array Visualization {step > 0 && `(Step ${step}/3)`}
          </h3>
        </div>

        <div className="flex gap-2 flex-wrap min-h-[100px] items-end pb-2">
          {arr.map((value, index) => {
            const isSwapping = swapIndices.includes(index);
            const inReverse = index >= reverseStart && index <= reverseEnd;
            
            let bgColor = "bg-gray-700";
            let borderColor = "border-gray-600";
            let textColor = "text-gray-200";

            if (inReverse && !isSwapping) {
              bgColor = "bg-cyan-600/30";
              borderColor = "border-cyan-500/50";
            }

            if (isSwapping) {
              bgColor = "bg-amber-600/50";
              borderColor = "border-amber-500";
              textColor = "text-amber-100";
            }

            if (finished) {
              bgColor = "bg-green-600/30";
              borderColor = "border-green-500/50";
              textColor = "text-green-100";
            }

            return (
              <div key={index} className="flex flex-col items-center relative min-w-[64px]">
                {isSwapping && (
                  <div className="absolute bottom-full mb-1 flex flex-col items-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-yellow-400 animate-bounce" />
                    <span className="text-yellow-400 text-xs font-bold font-mono">swap</span>
                  </div>
                )}
                <div className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${textColor}`}>
                  <span className="text-lg">{value}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">{index}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-700/40">
          <h4 className="text-gray-400 text-sm mb-2 font-mono">Rotation Steps Progress</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-2 rounded-lg border transition-colors ${step >= 1 ? 'bg-cyan-600/10 border-cyan-500/30 text-cyan-200' : 'bg-gray-800/20 border-gray-700/30 text-gray-500'}`}>
              <span className="text-xs font-mono font-bold">1. Reverse all</span>
            </div>
            <div className={`p-2 rounded-lg border transition-colors ${step >= 2 ? 'bg-cyan-600/10 border-cyan-500/30 text-cyan-200' : 'bg-gray-800/20 border-gray-700/30 text-gray-500'}`}>
              <span className="text-xs font-mono font-bold">2. Reverse first k</span>
            </div>
            <div className={`p-2 rounded-lg border transition-colors ${step >= 3 ? 'bg-cyan-600/10 border-cyan-500/30 text-cyan-200' : 'bg-gray-800/20 border-gray-700/30 text-gray-500'}`}>
              <span className="text-xs font-mono font-bold">3. Reverse remaining</span>
            </div>
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default RotateArray;
