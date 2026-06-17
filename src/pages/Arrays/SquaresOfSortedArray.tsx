import React, { useState, useCallback } from "react";
import { Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

interface State {
  array: number[];
  result: (number | null)[];
  leftPointer: number;
  rightPointer: number;
  resultPointer: number;
  explanation: string;
  line: number;
  finished: boolean;
}

const SquaresOfSortedArray: React.FC = () => {
  const [arrayInput, setArrayInput] = useState<string>("-4,-1,0,3,10");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((arr: number[]) => {
    const newHistory: State[] = [];
    const n = arr.length;
    const result: (number | null)[] = Array(n).fill(null);
    let leftPointer = 0;
    let rightPointer = n - 1;
    let resultPointer = n - 1;

    const addState = (props: Partial<State>) => {
      newHistory.push({
        array: [...arr],
        result: [...result],
        leftPointer,
        rightPointer,
        resultPointer,
        explanation: props.explanation || "",
        line: props.line || 5,
        finished: props.finished || false,
      });
    };

    addState({
      line: 4,
      explanation: `Initialize: left pointer at index 0, right pointer at index ${rightPointer}, result index at ${resultPointer}.`,
    });

    for (let k = n - 1; k >= 0; k--) {
      addState({
        line: 5,
        explanation: `Loop step k = ${k}. Compare squares of elements at left (${leftPointer}) and right (${rightPointer}).`,
      });

      const leftSquare = arr[leftPointer]! * arr[leftPointer]!;
      const rightSquare = arr[rightPointer]! * arr[rightPointer]!;

      addState({
        line: 6,
        explanation: `Comparing: |${arr[leftPointer]}|² = ${leftSquare} vs |${arr[rightPointer]}|² = ${rightSquare}.`,
      });

      if (leftSquare > rightSquare) {
        result[k] = leftSquare;
        addState({
          line: 7,
          explanation: `Since ${leftSquare} > ${rightSquare}, store ${leftSquare} at result[${k}].`,
        });
        leftPointer++;
        addState({
          line: 8,
          explanation: `Increment left pointer to ${leftPointer}.`,
        });
      } else {
        result[k] = rightSquare;
        addState({
          line: 10,
          explanation: `Since ${rightSquare} >= ${leftSquare}, store ${rightSquare} at result[${k}].`,
        });
        rightPointer--;
        addState({
          line: 11,
          explanation: `Decrement right pointer to ${rightPointer}.`,
        });
      }
      resultPointer--;
    }

    addState({
      line: 14,
      finished: true,
      explanation: `Finished squaring and sorting. Result: [${result.join(", ")}].`,
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
    const size = Math.floor(Math.random() * 5) + 5;
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 21) - 10);
    newArray.sort((a, b) => a - b);
    setArrayInput(newArray.join(","));
    generateHistory(newArray);
  };

  const state = (currentState as State) || {};
  const {
    array = [],
    result = [],
    leftPointer = 0,
    rightPointer = 0,
    resultPointer = 0,
    explanation = "",
    finished = false,
    line = 2
  } = state;

  const codeContent = {
    1: `vector<int> sortedSquares(vector<int>& nums) {`,
    2: `    int n = nums.size();`,
    3: `    vector<int> result(n);`,
    4: `    int left = 0, right = n - 1;`,
    5: `    for (int k = n - 1; k >= 0; k--) {`,
    6: `        if (abs(nums[left]) > abs(nums[right])) {`,
    7: `            result[k] = nums[left] * nums[left];`,
    8: `            left++;`,
    9: `        } else {`,
    10: `            result[k] = nums[right] * nums[right];`,
    11: `            right--;`,
    12: `        }`,
    13: `    }`,
    14: `    return result;`,
    15: `}`
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
        placeholder="e.g., -4,-1,0,3,10"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Left Pointer
        </h4>
        <div className="text-3xl font-mono text-blue-400">
          {leftPointer}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Right Pointer
        </h4>
        <div className="text-3xl font-mono text-purple-400">
          {rightPointer}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none">
          Result Index
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          {resultPointer >= 0 ? resultPointer : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Each element is processed at most once.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - For the result array storage.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Squares of Sorted Array"
      description="LeetCode #977 - Square each element in a sorted array and return a new sorted array in O(n) time."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter an array to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-8">
        <div>
          <h4 className="text-lg font-bold text-gray-300 mb-4 text-center">Input Array</h4>
          <div className="flex justify-center items-end gap-2 min-h-[150px]">
            {array.map((value, index) => {
              const isLeft = index === leftPointer;
              const isRight = index === rightPointer;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="flex gap-1 justify-center min-h-[24px]">
                    {isLeft && (
                      <span className="bg-blue-500 text-gray-900 px-1 text-[10px] font-bold rounded">L</span>
                    )}
                    {isRight && (
                      <span className="bg-purple-500 text-gray-900 px-1 text-[10px] font-bold rounded">R</span>
                    )}
                  </div>
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      isLeft ? "bg-blue-500/30 border-blue-400 scale-110 shadow-lg shadow-blue-500/25" :
                      isRight ? "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25" :
                      "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <span className="text-white font-bold text-lg">{value}</span>
                  </div>
                  <div className="text-gray-500 text-xs font-mono mt-1">[{index}]</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-300 mb-4 text-center">Result Array</h4>
          <div className="flex justify-center items-end gap-2 min-h-[150px]">
            {result.map((value, index) => {
              const isResult = index === resultPointer && !finished;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="flex gap-1 justify-center min-h-[24px]">
                    {isResult && (
                      <span className="bg-yellow-500 text-gray-900 px-1 text-[10px] font-bold rounded animate-bounce">K</span>
                    )}
                  </div>
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      isResult ? "bg-yellow-500/30 border-yellow-400 scale-110" :
                      value !== null ? "bg-green-500/30 border-green-400" :
                      "bg-gray-800 border-gray-700"
                    }`}
                  >
                    {value !== null && <span className="text-white font-bold text-lg">{value}</span>}
                  </div>
                  <div className="text-gray-500 text-xs font-mono mt-1">[{index}]</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SquaresOfSortedArray;