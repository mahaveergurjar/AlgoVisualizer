import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Hash,
  Layers, // Icon for Heap
  List,
  Calculator, // Icon for Greedy/Math approach
  CheckCircle,
  Play,
  Pause,
  StepBack,
  StepForward,
  RotateCcw,
  Clock,
  SortAsc, // Icon for sorted frequencies
  Timer, // Icon for cooldown/time
  MinusCircle, // Icon for decrementing
  PlusCircle, // Icon for incrementing/adding
} from "lucide-react";

// Simple Max Heap simulation using array sort (for visualization purposes)
const heapPush = (heap, value) => {
  heap.push(value);
};
const heapPop = (heap) => {
  if (heap.length === 0) return null;
  heap.sort((a, b) => a - b); // Sort ascending to easily pop max
  return heap.pop();
};
const heapIsEmpty = (heap) => heap.length === 0;


const TaskSchedulerVisualizer = () => {
  // --- STATE ---
  const [mode, setMode] = useState("greedy");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [tasksInput, setTasksInput] = useState("A,A,A,B,B,B");
  const [nInput, setNInput] = useState("2");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // --- HISTORY LOGIC ---

  const generateGreedyHistory = useCallback((tasks, n) => {
    const newHistory = [];
    let frequencyMap = new Map();
    let freqArray = Array(26).fill(0); // Use array like C++ code

    // Helper to add state
    const addState = (props) => {
      // Deep copy maps and arrays for immutability
      newHistory.push({
        tasks: [...tasks],
        n,
        frequencyMap: new Map(frequencyMap),
        freqArray: [...freqArray], // Store the raw array
        sortedFrequencies: freqArray.filter(f => f > 0).sort((a, b) => a - b), // Derive sorted non-zero freq for display
        currentTask: null,
        highlightedFreqIndex: -1, // Index in the raw freqArray
        maxFreq: null,
        chunk: null,
        idleSlots: null,
        totalTime: null,
        explanation: "",
        line: null,
        finished: false,
        ...props,
      });
    };

    // Initial state
    addState({ explanation: "Initialize frequency array (size 26) to zeros.", line: 4});

    // Step 1: Count frequencies
     addState({ explanation: "Start counting task frequencies.", line: 5 });
    for (const task of tasks) {
      const index = task.charCodeAt(0) - 'A'.charCodeAt(0);
      freqArray[index]++;
      frequencyMap.set(task, freqArray[index]); // Keep map updated for display
      addState({
        currentTask: task,
        highlightedFreqIndex: index,
        explanation: `Incremented frequency for task '${task}'. Count is now ${freqArray[index]}.`,
        line: 6
      });
    }
     addState({ explanation: "Finished counting frequencies.", line: 6, currentTask: null, highlightedFreqIndex: -1 });


    // Step 2: Sort frequencies
    addState({ explanation: "Sorting the frequency array.", line: 8 });
    const sortedFreqArray = [...freqArray].sort((a, b) => a - b);
    // Find index of max freq in the *original* array for potential highlighting later
    const maxFreq = sortedFreqArray[25];
    let originalMaxFreqIndex = freqArray.findIndex(f => f === maxFreq);

    addState({
        explanation: `Frequency array sorted. Max frequency is ${maxFreq}.`,
        line: 8,
        freqArray: sortedFreqArray, // Show sorted array now (though C++ sorts in place)
        highlightedFreqIndex: 25, // Highlight the max element in the sorted representation
        maxFreq: maxFreq
    });


    // Step 3: Calculate initial idle slots
    const chunk = maxFreq - 1;
     addState({
        explanation: `Calculate 'chunk' = maxFreq - 1 = ${maxFreq} - 1 = ${chunk}.`,
        line: 9,
        chunk: chunk,
        highlightedFreqIndex: 25 // Keep max highlighted
     });

    let idle = chunk * n;
     addState({
        explanation: `Calculate initial 'idle' slots = chunk * n = ${chunk} * ${n} = ${idle}.`,
        line: 10,
        idleSlots: idle,
        highlightedFreqIndex: 25
     });


    // Step 4: Subtract other frequencies from idle slots
    addState({ explanation: "Iterate through other frequencies to fill idle slots.", line: 11, highlightedFreqIndex: -1 });
    // Iterate descending through the *sorted* array (excluding the max frequency)
    for (let i = 24; i >= 0; i--) {
        if (sortedFreqArray[i] === 0) continue; // Skip zeros

        const freqToSubtract = sortedFreqArray[i];
        const subAmount = Math.min(chunk, freqToSubtract);
        idle -= subAmount;
        addState({
            explanation: `Considering frequency ${freqToSubtract}. Subtracting min(chunk=${chunk}, freq=${freqToSubtract}) = ${subAmount} from idle slots. Idle = ${idle}.`,
            line: 12,
            idleSlots: idle,
            highlightedFreqIndex: i // Highlight current freq being processed in sorted view
        });
    }
     addState({ explanation: "Finished iterating through frequencies.", line: 12, highlightedFreqIndex: -1 });

    // Step 5: Calculate final result
    const finalTime = idle < 0 ? tasks.length : tasks.length + idle;
    addState({
        explanation: `Idle slots = ${idle}. Since ${idle < 0 ? 'idle < 0' : 'idle >= 0'}, result is ${idle < 0 ? 'tasks.length' : 'tasks.length + idle'} = ${finalTime}.`,
        line: 14,
        totalTime: finalTime,
        finished: true
    });


    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateMaxHeapHistory = useCallback((tasks, n) => {
    const newHistory = [];
    let frequencyMap = new Map();
    let maxHeap = []; // Simulate using array + sort/pop
    let cooldownQueue = []; // Stores [freq, availableTime]
    let time = 0;

    // Helper
    const addState = (props) => {
      newHistory.push({
        tasks: [...tasks],
        n,
        frequencyMap: new Map(frequencyMap),
        maxHeap: [...maxHeap].sort((a,b)=>b-a), // Display sorted
        cooldownQueue: JSON.parse(JSON.stringify(cooldownQueue)), // Deep copy
        currentTime: time,
        processedTasksInCycle: [], // Freqs processed in this n+1 cycle
        addedToCooldown: [], // Freqs added to cooldown in this cycle
        movedFromCooldown: [], // Freqs moved from cooldown to heap this cycle
        explanation: "",
        line: null,
        finished: false,
        totalTime: null,
        ...props,
      });
    };

    // Step 1: Count frequencies
    addState({ explanation: "Initialize frequency map.", line: 4 });
    for (const task of tasks) {
      frequencyMap.set(task, (frequencyMap.get(task) || 0) + 1);
       addState({
            currentTask: task,
            explanation: `Counted task '${task}'. Frequency is now ${frequencyMap.get(task)}.`,
            line: 6,
       });
    }
    addState({ explanation: "Finished counting frequencies.", line: 6, currentTask: null });

    // Step 2: Build Max Heap
    addState({ explanation: "Building Max Heap from frequencies.", line: 9 });
    for (const freq of frequencyMap.values()) {
        heapPush(maxHeap, freq);
         addState({
            explanation: `Added frequency ${freq} to the heap.`,
            line: 11
         });
    }
    addState({ explanation: "Max Heap built.", line: 11 });


    // Step 3: Process tasks cycle by cycle
    addState({ explanation: "Start processing cycles.", line: 14 });

    while (!heapIsEmpty(maxHeap) || cooldownQueue.length > 0) {
      addState({ explanation: `Start cycle. Time = ${time}. Check cooldown.`, line: 15});

      // Check cooldown queue *before* processing heap for this cycle
       let movedFromCd = [];
       cooldownQueue = cooldownQueue.filter(([freq, availableTime]) => {
         if (availableTime <= time) {
           heapPush(maxHeap, freq);
           movedFromCd.push(freq);
           return false; // Remove from queue
         }
         return true; // Keep in queue
       });
       if (movedFromCd.length > 0) {
            addState({
                explanation: `Tasks with frequencies [${movedFromCd.join(', ')}] finished cooldown and returned to heap.`,
                line: 31, // Corresponds to pushing back after cooldown loop
                movedFromCooldown: movedFromCd
            });
       }

      let cycleLimit = n + 1;
      let processedInCycle = [];
      let addedToCd = [];

      addState({ explanation: `Begin execution cycle (up to ${cycleLimit} tasks or idles). Time = ${time}.`, line: 17, movedFromCooldown: []});

      for (let i = 0; i < cycleLimit; i++) {
        // Check cooldown again inside the cycle? No, the C++ code checks heap first.
        if (!heapIsEmpty(maxHeap)) {
            const currentFreq = heapPop(maxHeap); // Simulate pop
            processedInCycle.push(currentFreq);
             addState({
                explanation: `Executing task with highest frequency (${currentFreq}). Time = ${time + 1}.`,
                line: 18, // Start of if
                processedTasksInCycle: [...processedInCycle]
             });

            if (currentFreq > 1) {
                const nextAvailableTime = time + 1 + n;
                cooldownQueue.push([currentFreq - 1, nextAvailableTime]);
                addedToCd.push(currentFreq - 1);
                 addState({
                    explanation: `Task frequency decremented to ${currentFreq - 1}. Added to cooldown, available at time ${nextAvailableTime}.`,
                    line: 22,
                    addedToCooldown: [...addedToCd],
                    processedTasksInCycle: [...processedInCycle]
                 });
            } else {
                 addState({
                    explanation: `Task frequency ${currentFreq} completed.`,
                    line: 21, // Condition top > 1 failed
                    processedTasksInCycle: [...processedInCycle]
                 });
            }
        } else {
            addState({
                explanation: `CPU is idle. Time = ${time + 1}.`,
                line: 18, // Heap was empty
                processedTasksInCycle: [...processedInCycle] // Show empty processing for idle
            });
             // Need to check exit condition even when idling
             if (heapIsEmpty(maxHeap) && cooldownQueue.length === 0) {
                 time++; // Increment time for this last idle slot
                  addState({ explanation: `Heap and cooldown are empty. Final idle. Time = ${time}.`, line: 26});
                 break; // Exit inner loop early
             }
        }
        time++; // Increment time for each slot in the cycle

         // Check exit condition inside the loop (as per C++ code)
         if (heapIsEmpty(maxHeap) && cooldownQueue.length === 0) {
              addState({ explanation: `Heap and cooldown became empty during cycle. Exiting early. Time = ${time}.`, line: 26});
             break; // Exit inner loop
         }
      } // End of inner for loop (cycleLimit)

       // State after the inner loop finishes (before pushing cooldown back)
       addState({
          explanation: `Finished execution cycle. Processed: [${processedInCycle.join(', ')}]. Added to cooldown: [${addedToCd.join(', ')}]. Time = ${time}.`,
          line: 29, // Between loops
          processedTasksInCycle: processedInCycle,
          addedToCooldown: addedToCd,
          movedFromCooldown: [] // Reset moved list for next iteration
       });


      if (heapIsEmpty(maxHeap) && cooldownQueue.length === 0) {
        break; // Exit outer while loop
      }
    } // End of while loop

    addState({ explanation: `Processing complete. Final time = ${time}.`, line: 34, totalTime: time, finished: true });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // --- VISUALIZATION CONTROLS --- (Mostly unchanged, added safety checks)
  const loadArray = () => {
    const localTasks = tasksInput
      .toUpperCase()
      .split(",")
      .map((s) => s.trim())
      .filter(s => s.length === 1 && s >= 'A' && s <= 'Z');

    const nValue = parseInt(nInput);

    if (localTasks.length === 0 || isNaN(nValue) || nValue < 0) {
      alert("Invalid input. Please provide uppercase letters (A-Z) separated by commas for tasks, and a non-negative integer for N.");
      return;
    }
    // Reset state before loading new data
    reset();
    setIsLoaded(true); // Set loaded only after reset and validation
    if (mode === "greedy") {
      generateGreedyHistory(localTasks, nValue);
    } else {
      generateMaxHeapHistory(localTasks, nValue);
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    if (!isLoaded || !history || history.length === 0) return;
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [isLoaded, history]);

  const stepBackward = useCallback(() => {
    if (!isLoaded || !history || history.length === 0) return;
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [isLoaded, history]);

 const playAnimation = () => {
    if (!isLoaded || !history || history.length === 0 || finished) return; // Prevent play if not loaded or finished
    if (currentStep >= history.length - 1) {
      setCurrentStep(0); // Restart if at the end
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

 useEffect(() => {
    let timer;
    // Make sure history is loaded and we are playing
    if (isPlaying && isLoaded && history.length > 0 && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (isPlaying && currentStep >= history.length - 1) {
       // Stop playing automatically when the end is reached
       setIsPlaying(false);
       setCurrentStep(history.length - 1); // Ensure we stay on the last step
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isLoaded, currentStep, history, stepForward, speed]);


  const generateNewArray = () => {
    const len = Math.floor(Math.random() * 8) + 8;
    const taskChars = ['A', 'B', 'C', 'D', 'E'];
    const arr = Array.from({ length: len }, () => taskChars[Math.floor(Math.random() * taskChars.length)]);
    setTasksInput(arr.join(","));
    setNInput(String(Math.floor(Math.random() * 4)));
    reset(); // Reset visualization state
  };


  // --- CURRENT STATE ---
  const state = (isLoaded && history[currentStep]) ? history[currentStep] : {}; // Use state only if loaded
  const {
    tasks = tasksInput.split(",").map(s => s.trim()).filter(Boolean),
    n = parseInt(nInput) || 0,
    frequencyMap = new Map(),
    // For Greedy
    freqArray = [],
    sortedFrequencies = [],
    highlightedFreqIndex = -1,
    maxFreq = null,
    chunk = null,
    idleSlots = null,
    // For Heap
    maxHeap = [],
    cooldownQueue = [], // [[freq, availableTime], ...]
    currentTime = 0,
    processedTasksInCycle = [],
    addedToCooldown = [],
    movedFromCooldown = [],
    // Common
    currentTask = null,
    explanation = isLoaded ? "Algorithm steps will appear here." : "Load tasks and cooldown 'N' to start.",
    line = null,
    finished = false,
    totalTime = null
  } = state;

  // --- C++ CODES --- (Added line comments)
  const greedyCode = `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int freq[26] = {0};                 // Line 4
        for(char task : tasks){             // Line 5
            freq[task - 'A']++;             // Line 6
        }
        sort(begin(freq) , end(freq));      // Line 8
        int chunk = freq[25] - 1;           // Line 9
        int idle = chunk * n;               // Line 10
        for(int i=24; i>=0; i--){           // Line 11
            idle -= min(chunk, freq[i]);    // Line 12
        }                                   // Line 13
        return idle < 0 ? tasks.size() : tasks.size() + idle; // Line 14
    }
};`;

  const maxHeapCode = `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        unordered_map<char, int> freq;       // Line 4
        for (char task : tasks) {            // Line 5
            freq[task]++;                    // Line 6
        }                                   // Line 7
        
        priority_queue<int> maxHeap;         // Line 9
        for (auto& pair : freq) {            // Line 10
            maxHeap.push(pair.second);       // Line 11
        }                                   // Line 12
        
        int time = 0;                        // Line 14
        while (!maxHeap.empty()) {           // Line 15
            vector<int> cooldown;            // Line 16
            for (int i = 0; i <= n; ++i) {   // Line 17
                if (!maxHeap.empty()) {      // Line 18
                    int top = maxHeap.top(); // Line 19
                    maxHeap.pop();           // Line 20
                    if (top > 1) {           // Line 21
                        cooldown.push_back(top - 1); // Line 22
                    }                        // Line 23
                }                            // Line 24
                time++;                      // Line 25
                if (maxHeap.empty() && cooldown.empty()) { // Line 26
                    break;                   // Line 27
                }                            // Line 28
            }                                // Line 29
            for (int count : cooldown) {     // Line 30
                maxHeap.push(count);         // Line 31
            }                                // Line 32
        }                                    // Line 33
        return time;                         // Line 34
    }
};`;


  // --- RENDER FUNCTIONS ---

  const renderGreedy = () => {
    const currentCodeLine = line; // Use line directly from state

    // Find the value being highlighted in the sorted view
    const highlightedSortedValue = sortedFrequencies[highlightedFreqIndex] ?? null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Column 1: Controls and Code */}
        <div className="lg:col-span-1 space-y-4">
          {/* Speed and Reset */}
           <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm font-medium">Speed:</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isPlaying}
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 text-sm flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* C++ Code Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/50">
            <h3 className="font-semibold text-lg text-blue-300 mb-3 border-b border-gray-600/50 pb-2 flex items-center gap-2">
              <Code className="w-5 h-5" />
              C++ Greedy Solution
            </h3>
            <div className="overflow-auto max-h-[calc(100vh-350px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
              <pre className="text-sm">
                <code className="language-cpp font-mono">
                  {greedyCode.split('\n').map((codeLine, index) => {
                    const lineNum = index + 1;
                    const isActive = currentCodeLine === lineNum;
                    const cleanedLine = codeLine.replace(/\s*\/\/ Line \d+$/, '');
                    return (
                      <div
                        key={lineNum}
                        className={`block transition-all duration-200 px-2 py-0.5 rounded ${
                          isActive
                            ? "bg-blue-500/20 border-l-4 border-blue-500"
                            : "hover:bg-gray-700/30"
                        }`}
                      >
                        <span className="text-gray-500 select-none inline-block w-8 text-right mr-3 font-mono">
                          {lineNum}
                        </span>
                        <span className={isActive ? "text-blue-200 font-medium" : "text-gray-300"}>
                          {cleanedLine}
                        </span>
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Column 2: Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Array */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 shadow-lg">
            <h3 className="font-semibold text-lg text-gray-300 mb-4">Input Tasks</h3>
            <div className="flex justify-center items-center gap-2 flex-wrap min-h-[56px]">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-md border-2 transition-all duration-300 ${
                    currentTask === task
                      ? "bg-yellow-600/30 border-yellow-400 scale-110 shadow-md shadow-yellow-500/20"
                      : "bg-gray-700/40 border-gray-600"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {task}
                </div>
              ))}
              {tasks.length === 0 && <span className="text-gray-500">No tasks loaded</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequency Map */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-blue-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-blue-300 mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Frequency Map
              </h3>
              <div className="space-y-1.5 text-sm max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
                {Array.from(frequencyMap.entries()).sort().map(([task, freq]) => (
                  <div key={task} className={`flex justify-between items-center px-3 py-1.5 rounded transition-colors duration-200 ${
                    currentTask === task ? "bg-yellow-500/20" : "bg-gray-800/30"
                  }`}>
                    <span className="font-mono text-gray-200">Task: '{task}'</span>
                    <span className="font-mono font-semibold text-yellow-300">Freq: {freq}</span>
                  </div>
                ))}
                {frequencyMap.size === 0 && (
                  <div className="text-gray-500 text-center italic py-4">Counting...</div>
                )}
              </div>
            </div>

            {/* Sorted Frequencies */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-purple-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <SortAsc className="w-5 h-5" />
                Sorted Frequencies (Non-zero)
              </h3>
               <div className="flex justify-start items-center gap-2 flex-wrap min-h-[40px] max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 py-1">
                {sortedFrequencies.map((freq, index) => (
                  <div key={index} className={`px-3 py-1 flex items-center justify-center text-sm font-semibold rounded-md border transition-all duration-300 ${
                     // Highlight based on index in sorted array or if it's the max frequency
                    (index === highlightedFreqIndex || freq === maxFreq && highlightedFreqIndex === 25)
                      ? "bg-yellow-600/30 border-yellow-400 scale-105 text-yellow-200"
                      : "bg-gray-700/40 border-gray-600 text-gray-200"
                  }`}>
                    {freq}
                     {index === sortedFrequencies.length - 1 && <span className="text-xs text-purple-400 ml-1">(max)</span>}
                  </div>
                ))}
                 {sortedFrequencies.length === 0 && (
                  <div className="text-gray-500 text-center italic py-4">Sorting...</div>
                )}
              </div>
            </div>
          </div>

          {/* Result and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calculation/Result */}
             <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-green-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-green-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Calculation & Result
              </h3>
              <div className="space-y-1 text-sm text-gray-300 font-mono">
                  <p>Max Freq (f_max): <span className={`font-semibold ${line >= 8 ? 'text-green-400' : 'text-gray-500'}`}>{maxFreq ?? '-'}</span></p>
                  <p>Chunks (f_max - 1): <span className={`font-semibold ${line >= 9 ? 'text-green-400' : 'text-gray-500'}`}>{chunk ?? '-'}</span></p>
                   <p>N (Cooldown): <span className="font-semibold text-gray-200">{n}</span></p>
                  <p>Initial Idles (chunk * n): <span className={`font-semibold ${line >= 10 ? 'text-green-400' : 'text-gray-500'}`}>{chunk !== null ? chunk * n : '-'}</span></p>
                  <p>Current Idle Slots: <span className={`font-semibold ${line >= 10 ? 'text-yellow-300' : 'text-gray-500'}`}>{idleSlots ?? '-'}</span></p>
                  <p className="border-t border-green-700/50 pt-1 mt-2">Total Time: <span className={`text-xl font-bold ${finished ? 'text-green-300' : 'text-gray-500'}`}>{totalTime ?? '...'}</span></p>
              </div>
            </div>

            {/* Algorithm Status */}
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-orange-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-orange-300 mb-3 flex items-center gap-2">
                <List className="w-5 h-5" />
                Algorithm Status
              </h3>
              <div className="text-gray-300 text-sm h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-1">
                {explanation}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMaxHeap = () => {
    const currentCodeLine = line; // Use line directly

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Column 1: Controls and Code */}
         <div className="lg:col-span-1 space-y-4">
          {/* Speed and Reset */}
           <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm font-medium">Speed:</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isPlaying}
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 text-sm flex items-center gap-1"
              >
                 <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* C++ Code Panel */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/50">
            <h3 className="font-semibold text-lg text-blue-300 mb-3 border-b border-gray-600/50 pb-2 flex items-center gap-2">
              <Code className="w-5 h-5" />
              C++ Max-Heap Solution
            </h3>
            <div className="overflow-auto max-h-[calc(100vh-350px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
              <pre className="text-sm">
                <code className="language-cpp font-mono">
                  {maxHeapCode.split('\n').map((codeLine, index) => {
                    const lineNum = index + 1;
                    const isActive = currentCodeLine === lineNum;
                    const cleanedLine = codeLine.replace(/\s*\/\/ Line \d+$/, '');
                    return (
                       <div
                        key={lineNum}
                        className={`block transition-all duration-200 px-2 py-0.5 rounded ${
                          isActive
                            ? "bg-blue-500/20 border-l-4 border-blue-500"
                            : "hover:bg-gray-700/30"
                        }`}
                      >
                        <span className="text-gray-500 select-none inline-block w-8 text-right mr-3 font-mono">
                          {lineNum}
                        </span>
                        <span className={isActive ? "text-blue-200 font-medium" : "text-gray-300"}>
                          {cleanedLine}
                        </span>
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Column 2: Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Array */}
           <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 shadow-lg">
            <h3 className="font-semibold text-lg text-gray-300 mb-4">Input Tasks</h3>
            <div className="flex justify-center items-center gap-2 flex-wrap min-h-[56px]">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-md border-2 transition-all duration-300 ${
                    currentTask === task
                      ? "bg-yellow-600/30 border-yellow-400 scale-110 shadow-md shadow-yellow-500/20"
                      : "bg-gray-700/40 border-gray-600"
                  } ${finished ? "!border-green-500" : ""}`}
                >
                  {task}
                </div>
              ))}
               {tasks.length === 0 && <span className="text-gray-500">No tasks loaded</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequency Map */}
             <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-blue-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-blue-300 mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Frequency Map
              </h3>
               <div className="space-y-1.5 text-sm max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
                {Array.from(frequencyMap.entries()).sort().map(([task, freq]) => (
                  <div key={task} className={`flex justify-between items-center px-3 py-1.5 rounded transition-colors duration-200 ${
                    currentTask === task ? "bg-yellow-500/20" : "bg-gray-800/30"
                  }`}>
                    <span className="font-mono text-gray-200">Task: '{task}'</span>
                    <span className="font-mono font-semibold text-yellow-300">Freq: {freq}</span>
                  </div>
                ))}
                {frequencyMap.size === 0 && (
                  <div className="text-gray-500 text-center italic py-4">Counting...</div>
                )}
              </div>
            </div>

            {/* Max Heap */}
             <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-purple-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-purple-300 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                 Max Heap (Frequencies)
              </h3>
               <div className="flex justify-start items-center gap-2 flex-wrap min-h-[40px] max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2 py-1">
                 {/* Display the heap (already sorted for max view in addState) */}
                {maxHeap.map((freq, index) => (
                  <div key={index} className={`relative px-3 py-1 flex items-center justify-center text-sm font-semibold rounded-md border transition-all duration-300 ${
                     // Highlight if it was just processed or moved from cooldown
                    (processedTasksInCycle.includes(freq) || movedFromCooldown.includes(freq))
                      ? "bg-yellow-600/30 border-yellow-400 scale-105 text-yellow-200"
                      : "bg-gray-700/40 border-gray-600 text-gray-200"
                  } ${index === 0 ? 'border-purple-400 shadow shadow-purple-500/30' : ''}`}> {/* Highlight top */}
                    {freq}
                     {index === 0 && <span className="absolute -top-2 -right-2 text-xs text-purple-400 bg-gray-900 px-1 rounded">max</span>}
                     {/* Indicate if moved from cooldown */}
                     {movedFromCooldown.includes(freq) && <PlusCircle className="w-3 h-3 text-green-400 absolute -bottom-1 -left-1"/>}
                     {/* Indicate if processed (will be decremented or removed) */}
                     {processedTasksInCycle.includes(freq) && <MinusCircle className="w-3 h-3 text-red-400 absolute -bottom-1 -right-1"/>}
                  </div>
                ))}
                 {maxHeap.length === 0 && line > 11 && ( // Only show empty if heap was built
                  <div className="text-gray-500 text-center italic py-4">Heap Empty</div>
                )}
                 {maxHeap.length === 0 && line <= 11 && (
                     <div className="text-gray-500 text-center italic py-4">Building...</div>
                 )}
              </div>
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cooldown Queue */}
             <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-yellow-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-yellow-300 mb-3 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Cooldown Queue ([Freq, Avail @ Time])
              </h3>
               <div className="space-y-1.5 text-sm max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
                 {cooldownQueue.map(([freq, availableTime], index) => (
                   <div key={index} className={`flex justify-between items-center px-3 py-1.5 rounded transition-colors duration-200 ${addedToCooldown.includes(freq) ? 'bg-yellow-500/20' : 'bg-gray-800/30'}`}>
                    <span className="font-mono text-gray-200">Freq: {freq}</span>
                     <span className={`font-mono font-semibold ${availableTime <= currentTime ? 'text-green-400' : 'text-yellow-300'}`}>
                        Avail @ {availableTime}
                     </span>
                  </div>
                ))}
                 {cooldownQueue.length === 0 && (
                   <div className="text-gray-500 text-center italic py-4">Queue Empty</div>
                 )}
               </div>
             </div>

             {/* Result and Status */}
             <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-green-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-green-300 mb-3 flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5" />
                Time Elapsed & Result
              </h3>
                <div className="text-center">
                    <p className="text-gray-300 font-mono text-sm">Current Time:</p>
                    <p className="text-3xl text-green-400 font-bold font-mono">{currentTime}</p>
                    {finished && (
                         <p className="text-lg text-green-300 font-semibold mt-2">Final Time: {totalTime}</p>
                    )}
                     {!finished && line >= 14 && <p className="text-gray-500 text-xs mt-1">Processing...</p>}
                </div>
            </div>
          </div>

             {/* Algorithm Status */}
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-orange-700/50 min-h-[160px]">
              <h3 className="font-semibold text-lg text-orange-300 mb-3 flex items-center gap-2">
                <List className="w-5 h-5" />
                Algorithm Status
              </h3>
              <div className="text-gray-300 text-sm h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-1">
                {explanation}
              </div>
            </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER --- (Improved layout and accessibility)
 return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto text-gray-100 animate-fade-in">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-400">Task Scheduler</h1>
        <p className="text-md sm:text-lg text-gray-400 mt-2">Visualizing LeetCode 621</p>
      </header>

      {/* Input Panel */}
      <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-grow w-full md:w-auto">
          <label htmlFor="tasks-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
            Tasks (A-Z):
          </label>
          <input
            id="tasks-input"
            type="text"
            value={tasksInput}
            onChange={(e) => setTasksInput(e.target.value)}
            disabled={isLoaded && isPlaying} // Disable input during play
            placeholder="e.g., A,A,B,C,A"
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto min-w-[150px] disabled:opacity-70"
          />
          <label htmlFor="n-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
            N (Cooldown):
          </label>
          <input
            id="n-input"
            type="number"
            min="0"
            value={nInput}
            onChange={(e) => setNInput(e.target.value)}
            disabled={isLoaded && isPlaying} // Disable input during play
            className="font-mono bg-gray-900 border border-gray-600 rounded-md p-2 w-20 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-70"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          {!isLoaded ? (
            <>
              <button
                onClick={loadArray}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-colors duration-300 text-sm flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Visualize
              </button>
              <button
                onClick={generateNewArray}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 text-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4"/> Random
              </button>
            </>
          ) : (
            <>
              {/* Animation Controls */}
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0 || isPlaying}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Step Backward"
              >
                <StepBack className="h-5 w-5" />
              </button>

              {!isPlaying ? (
                <button
                  onClick={playAnimation}
                  // Disable play if finished OR if history is not yet properly loaded
                  disabled={finished || history.length === 0 || currentStep >= history.length -1 }
                  className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   aria-label="Play"
                >
                  <Play className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={pauseAnimation}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded-md transition-colors duration-300"
                   aria-label="Pause"
                >
                  <Pause className="h-5 w-5" />
                </button>
              )}
               <span className="font-mono text-sm text-gray-400 w-24 text-center px-1 tabular-nums"> {/* tabular-nums helps prevent layout shifts */}
                 {currentStep >= 0 && history.length > 0 ? `${currentStep + 1}/${history.length}`: `0/${history.length}`}
               </span>
              <button
                onClick={stepForward}
                 // Disable forward if finished OR playing OR history not loaded
                disabled={finished || isPlaying || history.length === 0 || currentStep >= history.length -1}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                 aria-label="Step Forward"
              >
                <StepForward className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => { if (!isPlaying) { setMode("greedy"); reset(); } }}
          disabled={isPlaying}
          className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm sm:text-base ${
            mode === "greedy"
              ? "border-blue-400 text-blue-300 font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-200"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="whitespace-nowrap">Greedy Approach O(N)</span>
        </button>
        <button
          onClick={() => { if (!isPlaying) { setMode("max-heap"); reset(); } }}
          disabled={isPlaying}
          className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm sm:text-base ${
            mode === "max-heap"
              ? "border-blue-400 text-blue-300 font-semibold"
              : "border-transparent text-gray-400 hover:text-gray-200"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
           <span className="whitespace-nowrap">Max-Heap Approach O(Time)</span> {/* Actual complexity depends on Time, roughly N*log(alphabet) */}
        </button>
      </div>

      {/* Render Area */}
      {isLoaded && history.length > 0 ? ( // Ensure history has content before rendering
        mode === "greedy" ? (
          renderGreedy()
        ) : (
          renderMaxHeap()
        )
      ) : (
        <div className="text-center py-16">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse"/>
            <p className="text-gray-500 text-lg">Load tasks and cooldown 'N' to start the visualization.</p>
        </div>
      )}
    </div>
  );
};

export default TaskSchedulerVisualizer;