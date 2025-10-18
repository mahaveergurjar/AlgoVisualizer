import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  CheckCircle,
  Layers,
  Shuffle,
  ListRestart,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer"; // Assuming this path

// --- Helper functions ---
// (These are pure functions, so they can live outside the component)

/**
 * Swaps two elements in an array and returns a new array.
 * @param {Array<any>} arr - The input array.
 * @param {number} i - The first index.
 * @param {number} j - The second index.
 * @returns {Array<any>} A new array with elements swapped.
 */
const swap = (arr, i, j) => {
  const newArr = [...arr];
  [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  return newArr;
};

/**
 * Reverses a subarray in place (on a copy) and returns the new array.
 * @param {Array<any>} arr - The input array.
 *_ @param {number} start - The start index of the subarray (inclusive).
 * @param {number} end - The end index of the subarray (inclusive).
 * @returns {Array<any>} A new array with the subarray reversed.
 */
const reverse = (arr, start, end) => {
  const newArr = [...arr];
  while (start < end) {
    [newArr[start], newArr[end]] = [newArr[end], newArr[start]];
    start++;
    end--;
  }
  return newArr;
};


const Permutation = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("1,2,3");
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Generates the step-by-step history for the "Next Permutation" algorithm.
   */
  const generatePermutationsHistory = useCallback((nums) => {
    const n = nums.length;
    const newHistory = [];
    let allPermutations = [];
    
    // Start with the sorted array
    let currentNums = [...nums].sort((a, b) => a - b);

    const addState = (props) =>
      newHistory.push({
        nums: [...currentNums],
        allPermutations: [...allPermutations],
        i: null, // Pointer for finding k
        j: null, // Pointer for finding l
        k: null, // Pivot 1
        l: null, // Pivot 2
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Start with the sorted array." });
    
    allPermutations.push([...currentNums]);
    addState({
      line: 3,
      explanation: "Add the first (sorted) permutation to the results list.",
    });

    while (true) {
      // 1. Find the largest index k such that nums[k] < nums[k+1]
      let k = -1;
      addState({
        line: 6,
        i: n - 2,
        explanation: `Start searching for pivot 'k' from i = ${n - 2}.`,
      });
      for (let i = n - 2; i >= 0; i--) {
        if (currentNums[i] < currentNums[i + 1]) {
          k = i;
          addState({
            line: 7,
            i,
            explanation: `Found k = ${i}, because nums[${i}] (${currentNums[i]}) < nums[${i + 1}] (${currentNums[i+1]}).`,
          });
          addState({ line: 8, i, k, explanation: `Set k = ${k} and break.` });
          break;
        } else {
            addState({
            line: 7,
            i,
            explanation: `Checking i = ${i}: nums[${i}] (${currentNums[i]}) is NOT < nums[${i + 1}] (${currentNums[i+1]}).`,
          });
        }
      }

      // 2. If no such k, we are at the last permutation
      if (k === -1) {
        addState({
          line: 11,
          explanation: "No 'k' was found. The array is in descending order.",
        });
        addState({
          line: 12,
          finished: true,
          explanation: "Algorithm finished. All permutations have been found.",
        });
        break;
      }

      // 3. Find the largest index l > k such that nums[l] > nums[k]
      let l = -1;
      addState({
        line: 15,
        k,
        j: n - 1,
        explanation: `Start searching for pivot 'l' from j = ${n - 1}.`,
      });
      for (let j = n - 1; j > k; j--) {
        if (currentNums[j] > currentNums[k]) {
          l = j;
          addState({
            line: 16,
            k,
            j,
            explanation: `Found l = ${j}, because nums[${j}] (${currentNums[j]}) > nums[${k}] (${currentNums[k]}).`,
          });
          addState({ line: 17, k, j, l, explanation: `Set l = ${l} and break.` });
          break;
        } else {
            addState({
            line: 16,
            k,
            j,
            explanation: `Checking j = ${j}: nums[${j}] (${currentNums[j]}) is NOT > nums[${k}] (${currentNums[k]}).`,
          });
        }
      }

      // 4. Swap nums[k] and nums[l]
      addState({
        line: 20,
        k,
        l,
        explanation: `Swapping nums[k] (${currentNums[k]}) and nums[l] (${currentNums[l]}).`,
      });
      currentNums = swap(currentNums, k, l);
      addState({
        nums: currentNums,
        line: 20,
        k,
        l,
        explanation: "Array after swap.",
      });

      // 5. Reverse the subarray from k+1 to the end
      addState({
        line: 21,
        k,
        l,
        explanation: `Reversing the subarray from index k+1 (${k + 1}) to the end.`,
      });
      currentNums = reverse(currentNums, k + 1, n - 1);
      addState({
        nums: currentNums,
        line: 21,
        explanation: "Array after reverse.",
      });

      // 6. Add the new permutation
      allPermutations.push([...currentNums]);
      addState({
        line: 3, // Back to adding to the list
        explanation: "Added new permutation to the results list.",
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
  }, []); // No dependencies, it's a pure generator

  // --- Control and Setup Logic ---
  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localNums.some(isNaN) || localNums.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    // Check for duplicates, as next_permutation works best on unique elements
    if (new Set(localNums).size !== localNums.length) {
        alert("Warning: The 'Next Permutation' algorithm is best visualized with unique elements. Duplicates may produce fewer steps.");
    }
    setIsLoaded(true);
    generatePermutationsHistory(localNums);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    // setNumsInput("1,2,3"); // Optionally reset input
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { nums = [], line, i, j, k, l, allPermutations, explanation, finished } = state;

  const renderPermutations = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
          <h3 className="font-bold text-xl text-teal-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
            <Code size={20} />
            Iterative (Next Permutation)
          </h3>
          <pre className="text-sm font-mono leading-relaxed">
            {[
              { l: 1, c: "vector<vector<int>> allPerms;" },
              { l: 2, c: "sort(nums.begin(), nums.end());" },
              { l: 3, c: "allPerms.push_back(nums);" },
              { l: 4, c: "while (true) {" },
              { l: 5, c: "  int k = -1;" },
              { l: 6, c: "  for (int i=n-2; i>=0; --i) {" },
              { l: 7, c: "    if (nums[i] < nums[i+1]) {" },
              { l: 8, c: "      k = i; break;" },
              { l: 9, c: "    }" },
              { l: 10, c: "  }" },
              { l: 11, c: "  if (k == -1) {" },
              { l: 12, c: "    break; // All done" },
              { l: 13, c: "  }" },
              { l: 14, c: "  int l = -1;" },
              { l: 15, c: "  for (int j=n-1; j>k; --j) {" },
              { l: 16, c: "    if (nums[j] > nums[k]) {" },
              { l: 17, c: "      l = j; break;" },
              { l: 18, c: "    }" },
              { l: 19, c: "  }" },
              { l: 20, c: "  swap(nums[k], nums[l]);" },
              { l: 21, c: "  reverse(nums.begin()+k+1, nums.end());" },
              { l: 22, c: "  allPerms.push_back(nums);" },
              { l: 23, c: "}" },
              { l: 24, c: "return allPerms;" },
            ].map(({ l, c }) => (
              <div key={l} className={`block px-2 transition-all ${line === l ? "bg-teal-500/20 border-l-2 border-teal-400" : ""}`}>
                <span className="text-gray-500 mr-4 select-none">{l}</span>
                {c}
              </div>
            ))}
          </pre>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
            <h3 className="font-bold text-lg text-gray-300 mb-8">
              Array Visualization
            </h3>
            <div id="perm-array-container" className="flex justify-center items-center gap-2 flex-wrap">
              {nums.map((num, index) => {
                let borderClass = 'border-gray-600 bg-gray-700';
                let scaleClass = '';
                if (k === index) {
                    borderClass = 'border-rose-500 bg-rose-500/20';
                    scaleClass = 'scale-110';
                }
                if (l === index) {
                    borderClass = 'border-fuchsia-500 bg-fuchsia-500/20';
                    scaleClass = 'scale-110';
                }
                if (i === index) {
                    borderClass = 'border-amber-400 bg-amber-500/20';
                    scaleClass = 'scale-105';
                }
                 if (j === index) {
                    borderClass = 'border-cyan-400 bg-cyan-500/20';
                    scaleClass = 'scale-105';
                }

                return (
                  <div key={index} id={`perm-array-container-element-${index}`} 
                       className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-300 ${borderClass} ${scaleClass}`}>
                    {num}
                  </div>
                );
              })}
            </div>
            {/* Pointers */}
            <VisualizerPointer index={i} containerId="perm-array-container" color="amber" label="i" direction="down"/>
            <VisualizerPointer index={j} containerId="perm-array-container" color="cyan" label="j" direction="down"/>
            <VisualizerPointer index={k} containerId="perm-array-container" color="rose" label="k (pivot)" direction="up"/>
            <VisualizerPointer index={l} containerId="perm-array-container" color="fuchsia" label="l (swap)" direction="up"/>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
              <Layers size={20} />
              Permutations Found
            </h3>
            <div className="h-48 overflow-y-auto bg-gray-900/50 rounded-lg p-3 flex flex-col gap-2">
              {allPermutations?.map((perm, index) => (
                <div key={index} className="font-mono text-lg text-gray-300 bg-gray-800 p-2 rounded-md">
                  [{perm.join(", ")}]
                </div>
              ))}
              {allPermutations?.length === 0 && <span className="text-gray-500">...</span>}
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
            <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
            <p className="text-gray-300">{explanation || " "}</p>
            {finished && (
              <CheckCircle className="inline-block ml-2 text-green-400" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-teal-400 flex items-center justify-center gap-3">
          <Shuffle />
          Iterative Permutations
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the "Next Permutation" Algorithm (LeetCode 31)
        </p>
      </header>

      {/* --- Controls --- */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="array-input" className="font-medium text-gray-300 font-mono">
            Array:
          </label>
          <input
            id="array-input"
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., 1,2,3"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-teal-500 hover:bg-teal-600 text-gray-900 font-bold py-2 px-4 rounded-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="font-mono w-24 text-center">
                {currentStep + 1}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <ListRestart size={18} /> Reset
          </button>
        </div>
      </div>

      {/* --- No Tabs Needed, only one mode --- */}

      {isLoaded ? (
        renderPermutations()
      ) : (
        <div className="text-center py-10 text-gray-500">
          Load an array (e.g., "1,2,3") to begin visualization.
        </div>
      )}
    </div>
  );
};

export default Permutation;