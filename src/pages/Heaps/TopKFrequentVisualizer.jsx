import React, { useState, useCallback } from "react";
import {
  Hash,
  Filter,
  List,
  Calculator,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const TopKFrequentVisualizer = () => {
  const [mode, setMode] = useState("bucket-sort");
  const [numsInput, setNumsInput] = useState("1,1,1,2,2,3");
  const [kInput, setKInput] = useState("2");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateBucketSortHistory = useCallback((nums, k) => {
    const newHistory = [];
    let frequencyMap = new Map();
    let buckets = Array(nums.length + 1).fill().map(() => []);
    let result = [];

    const addState = (props) =>
      newHistory.push({
        nums: [...nums],
        k,
        frequencyMap: new Map(frequencyMap),
        buckets: buckets.map(bucket => [...bucket]),
        result: [...result],
        currentNum: null,
        currentFreq: null,
        currentBucket: null,
        explanation: "",
        line: null,
        finished: false,
        ...props,
      });

    addState({ line: 1, explanation: "Step 1: Count frequency of each number" });

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      addState({ 
        line: 2, 
        currentNum: num,
        explanation: `Counting frequency for number ${num}`
      });
      
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      addState({ 
        line: 3, 
        currentNum: num,
        explanation: `Number ${num} frequency: ${frequencyMap.get(num)}`
      });
    }

    addState({ line: 5, explanation: "Step 2: Group numbers by frequency into buckets" });

    for (const [num, freq] of frequencyMap) {
      addState({ 
        line: 6, 
        currentNum: num,
        currentFreq: freq,
        explanation: `Placing number ${num} (frequency ${freq}) into bucket[${freq}]`
      });
      
      buckets[freq].push(num);
      addState({ 
        line: 7, 
        currentNum: num,
        currentFreq: freq,
        currentBucket: freq,
        explanation: `Added ${num} to bucket[${freq}]`
      });
    }

    addState({ line: 9, explanation: "Step 3: Collect top K frequent elements from highest frequency buckets" });

    for (let freq = buckets.length - 1; freq >= 0 && result.length < k; freq--) {
      if (buckets[freq].length > 0) {
        addState({ 
          line: 10, 
          currentFreq: freq,
          explanation: `Checking bucket[${freq}] with ${buckets[freq].length} elements`
        });
        
        for (const num of buckets[freq]) {
          if (result.length < k) {
            addState({ 
              line: 11, 
              currentNum: num,
              currentFreq: freq,
              explanation: `Adding ${num} (frequency ${freq}) to result`
            });
            
            result.push(num);
            addState({ 
              line: 12, 
              currentNum: num,
              currentFreq: freq,
              explanation: `Added ${num}. Result so far: [${result.join(', ')}]`
            });
          } else {
            break;
          }
        }
      }
    }

    addState({ 
      line: 15, 
      finished: true, 
      explanation: `Final result: [${result.join(', ')}] - Top ${k} frequent elements` 
    });

    load(newHistory);
  }, [load]);

  const generateHeapHistory = useCallback((nums, k) => {
    const newHistory = [];
    let frequencyMap = new Map();
    let minHeap = [];
    let result = [];

    const addState = (props) =>
      newHistory.push({
        nums: [...nums],
        k,
        frequencyMap: new Map(frequencyMap),
        minHeap: [...minHeap],
        result: [...result],
        currentNum: null,
        currentFreq: null,
        explanation: "",
        line: null,
        finished: false,
        ...props,
      });

    addState({ line: 1, explanation: "Step 1: Count frequency of each number" });

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];
      addState({ 
        line: 2, 
        currentNum: num,
        explanation: `Counting frequency for number ${num}`
      });
      
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      addState({ 
        line: 3, 
        currentNum: num,
        explanation: `Number ${num} frequency: ${frequencyMap.get(num)}`
      });
    }

    addState({ line: 5, explanation: "Step 2: Use min-heap to keep track of top K frequent elements" });

    for (const [num, freq] of frequencyMap) {
      addState({ 
        line: 6, 
        currentNum: num,
        currentFreq: freq,
        explanation: `Processing number ${num} with frequency ${freq}`
      });

      if (minHeap.length < k) {
        addState({ 
          line: 7, 
          currentNum: num,
          explanation: `Heap size < k (${minHeap.length} < ${k}), adding [${num}, ${freq}] to heap`
        });
        minHeap.push([num, freq]);
        let heapIndex = minHeap.length - 1;
        
        while (heapIndex > 0 && minHeap[Math.floor((heapIndex - 1) / 2)][1] > minHeap[heapIndex][1]) {
          const parentIndex = Math.floor((heapIndex - 1) / 2);
          addState({ 
            line: 8, 
            explanation: `Bubbling up: swapping [${minHeap[parentIndex][0]}, ${minHeap[parentIndex][1]}] with [${minHeap[heapIndex][0]}, ${minHeap[heapIndex][1]}]`
          });
          [minHeap[parentIndex], minHeap[heapIndex]] = [minHeap[heapIndex], minHeap[parentIndex]];
          heapIndex = parentIndex;
        }
      } else {
        addState({ 
          line: 10, 
          currentNum: num,
          explanation: `Heap is full. Comparing ${freq} with smallest frequency in heap: ${minHeap[0][1]}`
        });
        
        if (freq > minHeap[0][1]) {
          addState({ 
            line: 11, 
            currentNum: num,
            explanation: `Frequency ${freq} > ${minHeap[0][1]}, replacing [${minHeap[0][0]}, ${minHeap[0][1]}] with [${num}, ${freq}]`
          });
          minHeap[0] = [num, freq];
          
          let index = 0;
          while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < minHeap.length && minHeap[left][1] < minHeap[smallest][1]) {
              smallest = left;
            }
            if (right < minHeap.length && minHeap[right][1] < minHeap[smallest][1]) {
              smallest = right;
            }

            if (smallest !== index) {
              addState({ 
                line: 12, 
                explanation: `Heapifying: swapping [${minHeap[index][0]}, ${minHeap[index][1]}] with [${minHeap[smallest][0]}, ${minHeap[smallest][1]}]`
              });
              [minHeap[index], minHeap[smallest]] = [minHeap[smallest], minHeap[index]];
              index = smallest;
            } else {
              break;
            }
          }
        } else {
          addState({ 
            line: 14, 
            currentNum: num,
            explanation: `Frequency ${freq} <= ${minHeap[0][1]}, skipping ${num}`
          });
        }
      }
    }

    addState({ 
      line: 19, 
      explanation: "Step 3: Collect top K elements from heap" 
    });

    while (minHeap.length > 0) {
      const [num] = minHeap[0];
      addState({ 
        line: 20, 
        explanation: `Extracting ${num} from heap`
      });
      
      result.push(num);
      
      const last = minHeap.pop();
      if (minHeap.length > 0) {
        minHeap[0] = last;
        let index = 0;
        while (true) {
          const left = 2 * index + 1;
          const right = 2 * index + 2;
          let smallest = index;

          if (left < minHeap.length && minHeap[left][1] < minHeap[smallest][1]) {
            smallest = left;
          }
          if (right < minHeap.length && minHeap[right][1] < minHeap[smallest][1]) {
            smallest = right;
          }

          if (smallest !== index) {
            [minHeap[index], minHeap[smallest]] = [minHeap[smallest], minHeap[index]];
            index = smallest;
          } else {
            break;
          }
        }
      }
      addState({ 
        line: 21, 
        explanation: `Result so far: [${result.join(', ')}]`
      });
    }

    addState({ 
      line: 24, 
      finished: true, 
      explanation: `Final result: [${result.join(', ')}]` 
    });

    load(newHistory);
  }, [load]);

  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const kValue = parseInt(kInput);

    if (localNums.some(isNaN) || isNaN(kValue) || kValue <= 0 || kValue > new Set(localNums).size) {
      alert("Invalid input. Please provide numbers separated by commas for the array, and K should be <= number of unique elements.");
      return;
    }

    if (mode === "bucket-sort") {
      generateBucketSortHistory(localNums, kValue);
    } else {
      generateHeapHistory(localNums, kValue);
    }
  };

  const generateNewArray = () => {
    const n = Math.floor(Math.random() * 5) + 6;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 5) + 1);
    setNumsInput(arr.join(","));
    setKInput(String(Math.floor(Math.random() * 2) + 2));
    visualizer.reset();
  };

  const bucketSortCode = `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> freq;
    for (int num : nums) {
        freq[num]++;
    }
    
    vector<vector<int>> buckets(nums.size() + 1);
    for (auto& [num, count] : freq) {
        buckets[count].push_back(num);
    }
    
    vector<int> result;
    for (int i = buckets.size() - 1; i >= 0; i--) {
        for (int num : buckets[i]) {
            if (result.size() < k) {
                result.push_back(num);
            } else {
                break;
            }
        }
    }
    return result;
}`;

  const heapCode = `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> freq;
    for (int num : nums) {
        freq[num]++;
    }
    
    priority_queue<pair<int, int>, vector<pair<int, int>>, 
                   greater<pair<int, int>>> minHeap;
    
    for (auto& [num, count] : freq) {
        if (minHeap.size() < k) {
            minHeap.push({count, num});
        } else if (count > minHeap.top().first) {
            minHeap.pop();
            minHeap.push({count, num});
        }
    }
    
    vector<int> result;
    while (!minHeap.empty()) {
        result.push_back(minHeap.top().second);
        minHeap.pop();
    }
    return result;
}`;

  const activeCodeString = mode === "bucket-sort" ? bucketSortCode : heapCode;
  const codeContent = {};
  activeCodeString.split("\n").forEach((lineContent, index) => {
    codeContent[index + 1] = lineContent;
  });

  const inputSection = (
    <>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-grow w-full md:w-auto">
        <label htmlFor="array-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          Array:
        </label>
        <input
          id="array-input"
          type="text"
          value={numsInput}
          onChange={(e) => setNumsInput(e.target.value)}
          disabled={isLoaded}
          className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full sm:w-auto min-w-[150px] text-sm"
        />
        <label htmlFor="k-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          K:
        </label>
        <input
          id="k-input"
          type="number"
          value={kInput}
          onChange={(e) => setKInput(e.target.value)}
          disabled={isLoaded}
          className="font-mono bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 w-20 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={loadArray}
            className="bg-teal-500 hover:bg-teal-650 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition duration-205 transform hover:scale-105 cursor-pointer text-sm"
          >
            Load & Visualize
          </button>
          <button
            onClick={generateNewArray}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-205 transform hover:scale-105 cursor-pointer text-sm"
          >
            New Array
          </button>
        </div>
      )}
    </>
  );

  const state = currentState || {};
  const {
    nums = [],
    k = 0,
    frequencyMap = new Map(),
    buckets = [],
    minHeap = [],
    result = [],
    currentNum = null,
    currentBucket = null,
    explanation = "",
    line = null,
    finished = false,
  } = state;

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h3 className="font-semibold text-blue-300 mb-1.5 flex items-center justify-center gap-2 select-none text-xs">
          Frequency Map
        </h3>
        <div className="space-y-1.5 text-left max-h-32 overflow-y-auto text-xs font-mono text-gray-300 pr-1">
          {Array.from(frequencyMap.entries()).map(([num, freq]) => (
            <div key={num} className={`flex justify-between items-center p-1 rounded ${
              currentNum === num ? "bg-yellow-500/20" : "bg-gray-800/30"
            }`}>
              <span>Num: {num}</span>
              <span className="font-bold text-yellow-400">Freq: {freq}</span>
            </div>
          ))}
          {frequencyMap.size === 0 && (
            <div className="text-gray-500 italic text-center">Empty</div>
          )}
        </div>
      </div>

      {mode === "bucket-sort" ? (
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
          <h3 className="font-semibold text-purple-300 mb-1.5 flex items-center justify-center gap-2 select-none text-xs">
            Frequency Buckets
          </h3>
          <div className="space-y-1.5 text-left max-h-32 overflow-y-auto text-xs font-mono text-gray-300 pr-1">
            {buckets.map((bucket, freq) => (
              bucket.length > 0 && (
                <div key={freq} className={`p-1 rounded ${
                  currentBucket === freq ? "bg-yellow-500/20" : "bg-gray-800/30"
                }`}>
                  <span>Freq {freq}: [{bucket.join(', ')}]</span>
                </div>
              )
            ))}
            {buckets.every(bucket => bucket.length === 0) && (
              <div className="text-gray-500 italic text-center">Empty</div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
          <h3 className="font-semibold text-purple-300 mb-1.5 flex items-center justify-center gap-2 select-none text-xs">
            Min-Heap
          </h3>
          <div className="space-y-1.5 text-left max-h-32 overflow-y-auto text-xs font-mono text-gray-300 pr-1">
            {minHeap.map(([num, freq], idx) => (
              <div key={idx} className="flex justify-between items-center p-1 rounded bg-gray-800/30">
                <span>Num: {num}</span>
                <span className="font-bold text-purple-400">Freq: {freq}</span>
              </div>
            ))}
            {minHeap.length === 0 && (
              <div className="text-gray-500 italic text-center">Heap empty</div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center flex flex-col justify-center">
        <h3 className="font-semibold text-green-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
          Result Array
        </h3>
        <div className="font-mono text-lg font-bold text-green-400">
          [{result.join(', ')}]
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          K = {k}
        </div>
      </div>

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-xs">
          Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity</span>
            {mode === "bucket-sort" ? (
              <p className="text-gray-400">O(N) — One pass to count frequencies, one pass to bucket, and one pass to collect top K.</p>
            ) : (
              <p className="text-gray-400">O(N log K) — N elements are processed; each push/pop in heap takes O(log K) time.</p>
            )}
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            {mode === "bucket-sort" ? (
              <p className="text-gray-450">O(N) — For frequency hash map and bucket list array.</p>
            ) : (
              <p className="text-gray-450">O(N) — For frequency hash map, and O(K) for min-heap.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const handleModeChange = (newMode) => {
    setMode(newMode);
    visualizer.reset();
  };

  return (
    <VisualizerLayout
      title="Top K Frequent Elements"
      description="Find the K most frequent elements in an array"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="space-y-6 select-none">
        {/* Mode Tabs */}
        <div className="flex border-b border-gray-800 mb-4 select-none">
          <button
            onClick={() => handleModeChange("bucket-sort")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "bucket-sort"
                ? "border-teal-400 text-teal-350 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Bucket Sort O(n)
          </button>
          <button
            onClick={() => handleModeChange("heap")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "heap"
                ? "border-teal-400 text-teal-350 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Min-Heap O(n log k)
          </button>
        </div>

        {isLoaded ? (
          <div className="relative bg-gray-900/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-2xl min-h-[200px]">
            <h3 className="font-bold text-base text-gray-300 mb-4">Array Representation</h3>
            <div id="array-container" className="w-full flex justify-center items-center gap-2 flex-wrap mb-4">
              {nums.map((num, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-300 transform ${
                    currentNum === num
                      ? "bg-yellow-600/40 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/30"
                      : "bg-gray-800 border-gray-700 hover:scale-105"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
            <p className="text-gray-400 text-sm">Load an array and K to start visualization.</p>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default TopKFrequentVisualizer;