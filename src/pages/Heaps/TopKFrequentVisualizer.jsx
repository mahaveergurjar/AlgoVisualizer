import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Hash,
  Filter,
  List,
  Calculator,
  CheckCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const TopKFrequentVisualizer = () => {
  const [mode, setMode] = useState("bucket-sort");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("1,1,1,2,2,3");
  const [kInput, setKInput] = useState("2");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

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

    // Step 1: Count frequencies
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

    // Step 2: Create buckets
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

    // Step 3: Collect top K elements
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

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

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

    // Step 1: Count frequencies
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

    // Step 2: Build min-heap
    let heapIndex = 0;
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
        heapIndex = minHeap.length - 1;
        
        // Bubble up
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
          
          // Heapify down
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
      addState({ 
        line: 16, 
        currentNum: num,
        explanation: `Current heap: [${minHeap.map(([n, f]) => `[${n},${f}]`).join(', ')}]`
      });
    }

    addState({ line: 18, explanation: "Step 3: Extract elements from heap to get result" });

    // Step 3: Extract result
    result = minHeap.map(([num, freq]) => num);
    addState({ 
      line: 19, 
      finished: true, 
      explanation: `Final result: [${result.join(', ')}] - Top ${k} frequent elements` 
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const k = parseInt(kInput);
    
    if (localNums.some(isNaN) || isNaN(k) || k <= 0 || k > localNums.length) {
      alert("Invalid input. Please check array and K value.");
      return;
    }
    setIsLoaded(true);
    if (mode === "bucket-sort") {
      generateBucketSortHistory(localNums, k);
    } else {
      generateHeapHistory(localNums, k);
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  const generateNewArray = () => {
    const n = Math.floor(Math.random() * 6) + 5;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 5) + 1);
    setNumsInput(arr.join(","));
    setKInput("2");
    reset();
  };

  const state = history[currentStep] || {};
  const { 
    nums = [], 
    k, 
    frequencyMap = new Map(), 
    buckets = [], 
    minHeap = [], 
    result = [], 
    currentNum, 
    currentFreq, 
    currentBucket,
    explanation,
    line,
    finished 
  } = state;

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

  const renderBucketSort = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Speed and Reset buttons */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm">Speed:</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* C++ Solution Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
            <h3 className="font-bold text-xl text-teal-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              C++ Bucket Sort Solution
            </h3>
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="language-cpp font-mono leading-relaxed block">
                  {[...Array(16)].map((_, idx) => {
                    const lineNum = idx + 1;
                    return (
                      <span
                        key={lineNum}
                        className={`block px-3 py-0.5 transition-all duration-300 ${
                          line === lineNum
                            ? "bg-teal-500/20 border-l-4 border-teal-500 shadow-lg"
                            : "hover:bg-gray-700/30"
                        }`}
                      >
                        <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
                          {lineNum}
                        </span>
                        <span className={line === lineNum ? "text-teal-300" : "text-gray-300"}>
                          {lineNum === 1 && `vector<int> topKFrequent(vector<int>& nums, int k) {`}
                          {lineNum === 2 && `    unordered_map<int, int> freq;`}
                          {lineNum === 3 && `    for (int num : nums) {`}
                          {lineNum === 4 && `        freq[num]++;`}
                          {lineNum === 5 && `    }`}
                          {lineNum === 6 && `    `}
                          {lineNum === 7 && `    vector<vector<int>> buckets(nums.size() + 1);`}
                          {lineNum === 8 && `    for (auto& [num, count] : freq) {`}
                          {lineNum === 9 && `        buckets[count].push_back(num);`}
                          {lineNum === 10 && `    }`}
                          {lineNum === 11 && `    `}
                          {lineNum === 12 && `    vector<int> result;`}
                          {lineNum === 13 && `    for (int i = buckets.size() - 1; i >= 0; i--) {`}
                          {lineNum === 14 && `        for (int num : buckets[i]) {`}
                          {lineNum === 15 && `            if (result.size() < k) {`}
                          {lineNum === 16 && `                result.push_back(num);`}
                        </span>
                      </span>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Array Visualization */}
          <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
            <h3 className="font-bold text-lg text-gray-300 mb-4">Array Visualization</h3>
            <div id="array-container" className="w-full flex justify-center items-center gap-2 flex-wrap mb-6">
              {nums.map((num, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-500 transform ${
                    currentNum === num
                      ? "bg-yellow-600/40 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/30"
                      : "bg-gray-700/50 border-gray-600 hover:scale-105"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequency Map */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
              <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Frequency Map
              </h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {Array.from(frequencyMap.entries()).map(([num, freq]) => (
                  <div key={num} className={`flex justify-between items-center p-2 rounded ${
                    currentNum === num ? "bg-yellow-500/20" : "bg-gray-800/30"
                  }`}>
                    <span className="font-mono">Number: {num}</span>
                    <span className="font-mono font-bold text-yellow-400">Freq: {freq}</span>
                  </div>
                ))}
                {frequencyMap.size === 0 && (
                  <div className="text-gray-500 text-center">No frequencies counted yet</div>
                )}
              </div>
            </div>

            {/* Buckets */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Frequency Buckets
              </h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {buckets.map((bucket, freq) => (
                  bucket.length > 0 && (
                    <div key={freq} className={`p-2 rounded ${
                      currentBucket === freq ? "bg-yellow-500/20" : "bg-gray-800/30"
                    }`}>
                      <div className="font-mono text-yellow-400">Freq {freq}: [{bucket.join(', ')}]</div>
                    </div>
                  )
                ))}
                {buckets.every(bucket => bucket.length === 0) && (
                  <div className="text-gray-500 text-center">No buckets filled yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Result and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
              <h3 className="font-bold text-xl text-center text-green-300 mb-3 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Top K Result
              </h3>
              <div className="font-mono text-2xl text-center font-bold text-green-400">
                [{result.join(', ')}]
              </div>
              <div className="text-center text-gray-300 mt-2">
                K = {k}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-orange-700/50">
              <h3 className="font-bold text-lg text-orange-300 mb-3 flex items-center gap-2">
                <List className="w-5 h-5" />
                Algorithm Status
              </h3>
              <div className="text-gray-300 text-sm h-20 overflow-y-auto">
                {explanation || "Waiting for computation..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeap = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Speed and Reset buttons */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm">Speed:</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* C++ Solution Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
            <h3 className="font-bold text-xl text-teal-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              C++ Min-Heap Solution
            </h3>
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="language-cpp font-mono leading-relaxed block">
                  {[...Array(20)].map((_, idx) => {
                    const lineNum = idx + 1;
                    return (
                      <span
                        key={lineNum}
                        className={`block px-3 py-0.5 transition-all duration-300 ${
                          line === lineNum
                            ? "bg-teal-500/20 border-l-4 border-teal-500 shadow-lg"
                            : "hover:bg-gray-700/30"
                        }`}
                      >
                        <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
                          {lineNum}
                        </span>
                        <span className={line === lineNum ? "text-teal-300" : "text-gray-300"}>
                          {lineNum === 1 && `vector<int> topKFrequent(vector<int>& nums, int k) {`}
                          {lineNum === 2 && `    unordered_map<int, int> freq;`}
                          {lineNum === 3 && `    for (int num : nums) {`}
                          {lineNum === 4 && `        freq[num]++;`}
                          {lineNum === 5 && `    }`}
                          {lineNum === 6 && `    `}
                          {lineNum === 7 && `    priority_queue<pair<int, int>,`}
                          {lineNum === 8 && `                   vector<pair<int, int>>,`}
                          {lineNum === 9 && `                   greater<pair<int, int>>> minHeap;`}
                          {lineNum === 10 && `    `}
                          {lineNum === 11 && `    for (auto& [num, count] : freq) {`}
                          {lineNum === 12 && `        if (minHeap.size() < k) {`}
                          {lineNum === 13 && `            minHeap.push({count, num});`}
                          {lineNum === 14 && `        } else if (count > minHeap.top().first) {`}
                          {lineNum === 15 && `            minHeap.pop();`}
                          {lineNum === 16 && `            minHeap.push({count, num});`}
                          {lineNum === 17 && `        }`}
                          {lineNum === 18 && `    }`}
                          {lineNum === 19 && `    `}
                          {lineNum === 20 && `    vector<int> result;`}
                        </span>
                      </span>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Array Visualization */}
          <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
            <h3 className="font-bold text-lg text-gray-300 mb-4">Array Visualization</h3>
            <div id="array-container" className="w-full flex justify-center items-center gap-2 flex-wrap mb-6">
              {nums.map((num, index) => (
                <div
                  key={index}
                  className={`w-12 h-12 flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-500 transform ${
                    currentNum === num
                      ? "bg-yellow-600/40 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/30"
                      : "bg-gray-700/50 border-gray-600 hover:scale-105"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequency Map */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
              <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Frequency Map
              </h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {Array.from(frequencyMap.entries()).map(([num, freq]) => (
                  <div key={num} className={`flex justify-between items-center p-2 rounded ${
                    currentNum === num ? "bg-yellow-500/20" : "bg-gray-800/30"
                  }`}>
                    <span className="font-mono">Number: {num}</span>
                    <span className="font-mono font-bold text-yellow-400">Freq: {freq}</span>
                  </div>
                ))}
                {frequencyMap.size === 0 && (
                  <div className="text-gray-500 text-center">No frequencies counted yet</div>
                )}
              </div>
            </div>

            {/* Min-Heap */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
              <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Min-Heap ([number, frequency])
              </h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {minHeap.map(([num, freq], index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                    <span className="font-mono">[{num}, {freq}]</span>
                    {index === 0 && <span className="text-xs text-yellow-400">min</span>}
                  </div>
                ))}
                {minHeap.length === 0 && (
                  <div className="text-gray-500 text-center">Heap is empty</div>
                )}
              </div>
            </div>
          </div>

          {/* Result and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
              <h3 className="font-bold text-xl text-center text-green-300 mb-3 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Top K Result
              </h3>
              <div className="font-mono text-2xl text-center font-bold text-green-400">
                [{result.join(', ')}]
              </div>
              <div className="text-center text-gray-300 mt-2">
                K = {k}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-orange-700/50">
              <h3 className="font-bold text-lg text-orange-300 mb-3 flex items-center gap-2">
                <List className="w-5 h-5" />
                Algorithm Status
              </h3>
              <div className="text-gray-300 text-sm h-20 overflow-y-auto">
                {explanation || "Waiting for computation..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-fit mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-teal-400">Top K Frequent Elements</h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 347</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label htmlFor="array-input" className="font-medium text-gray-300 mono">
            Array:
          </label>
          <input
            id="array-input"
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 w-full sm:w-64 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <label htmlFor="k-input" className="font-medium text-gray-300 mono">
            K:
          </label>
          <input
            id="k-input"
            type="number"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
            disabled={isLoaded}
            className="mono bg-gray-900 border border-gray-600 rounded-md p-2 w-20 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <>
              <button
                onClick={loadArray}
                className="bg-teal-500 hover:bg-teal-600 text-gray-900 font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-300"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateNewArray}
                className="ml-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              >
                New Array
              </button>
            </>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 hover:bg-gray-600 font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              
              {!isPlaying ? (
                <button
                  onClick={playAnimation}
                  disabled={currentStep >= history.length - 1}
                  className="bg-green-500 hover:bg-green-600 font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={pauseAnimation}
                  className="bg-yellow-500 hover:bg-yellow-600 font-bold p-2 rounded-md transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}

              <span className="mono text-lg text-gray-400 w-24 text-center">
                Step {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 hover:bg-gray-600 font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-6">
        <div
          onClick={() => setMode("bucket-sort")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "bucket-sort"
              ? "border-teal-400 text-teal-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Bucket Sort O(n)
        </div>
        <div
          onClick={() => setMode("heap")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "heap"
              ? "border-teal-400 text-teal-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Min-Heap O(n log k)
        </div>
      </div>

      {isLoaded ? (
        mode === "bucket-sort" ? (
          renderBucketSort()
        ) : (
          renderHeap()
        )
      ) : (
        <p className="text-gray-500 text-center py-10">Load an array to begin visualization.</p>
      )}
    </div>
  );
};

export default TopKFrequentVisualizer;