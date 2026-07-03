import React, { useState, useCallback } from "react";
import {
  Layers,
  Calculator,
  CheckCircle,
  Clock,
  SortAsc,
  Timer,
  Play,
  RotateCcw,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

// Simple Max Heap simulation using array sort
const heapPush = (heap, value) => {
  heap.push(value);
};
const heapPop = (heap) => {
  if (heap.length === 0) return null;
  heap.sort((a, b) => a - b);
  return heap.pop();
};
const heapIsEmpty = (heap) => heap.length === 0;

const TaskSchedulerVisualizer = () => {
  const [mode, setMode] = useState("greedy");
  const [tasksInput, setTasksInput] = useState("A,A,A,B,B,B");
  const [nInput, setNInput] = useState("2");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateGreedyHistory = useCallback((tasks, n) => {
    const newHistory = [];
    let frequencyMap = new Map();
    let freqArray = Array(26).fill(0);

    const addState = (props) => {
      newHistory.push({
        tasks: [...tasks],
        n,
        frequencyMap: new Map(frequencyMap),
        freqArray: [...freqArray],
        sortedFrequencies: freqArray.filter(f => f > 0).sort((a, b) => a - b),
        currentTask: null,
        highlightedFreqIndex: -1,
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

    addState({ explanation: "Initialize frequency array (size 26) to zeros.", line: 4 });

    addState({ explanation: "Start counting task frequencies.", line: 5 });
    for (const task of tasks) {
      const index = task.charCodeAt(0) - 'A'.charCodeAt(0);
      freqArray[index]++;
      frequencyMap.set(task, freqArray[index]);
      addState({
        currentTask: task,
        highlightedFreqIndex: index,
        explanation: `Incremented frequency for task '${task}'. Count is now ${freqArray[index]}.`,
        line: 6
      });
    }
    addState({ explanation: "Finished counting frequencies.", line: 6, currentTask: null, highlightedFreqIndex: -1 });

    addState({ explanation: "Sorting the frequency array.", line: 8 });
    const sortedFreqArray = [...freqArray].sort((a, b) => a - b);
    const maxFreq = sortedFreqArray[25];

    addState({
      explanation: `Frequency array sorted. Max frequency is ${maxFreq}.`,
      line: 8,
      freqArray: sortedFreqArray,
      highlightedFreqIndex: 25,
      maxFreq: maxFreq
    });

    const chunk = maxFreq - 1;
    addState({
      explanation: `Calculate 'chunk' = maxFreq - 1 = ${maxFreq} - 1 = ${chunk}.`,
      line: 9,
      chunk: chunk,
      highlightedFreqIndex: 25
    });

    let idle = chunk * n;
    addState({
      explanation: `Calculate initial 'idle' slots = chunk * n = ${chunk} * ${n} = ${idle}.`,
      line: 10,
      idleSlots: idle,
      highlightedFreqIndex: 25
    });

    addState({ explanation: "Iterate through other frequencies to fill idle slots.", line: 11, highlightedFreqIndex: -1 });
    for (let i = 24; i >= 0; i--) {
      if (sortedFreqArray[i] === 0) continue;

      const freqToSubtract = sortedFreqArray[i];
      const subAmount = Math.min(chunk, freqToSubtract);
      idle -= subAmount;
      addState({
        explanation: `Considering frequency ${freqToSubtract}. Subtracting min(chunk=${chunk}, freq=${freqToSubtract}) = ${subAmount} from idle slots. Idle = ${idle}.`,
        line: 12,
        idleSlots: idle,
        highlightedFreqIndex: i
      });
    }
    addState({ explanation: "Finished iterating through frequencies.", line: 12, highlightedFreqIndex: -1 });

    const finalTime = idle < 0 ? tasks.length : tasks.length + idle;
    addState({
      explanation: `Idle slots = ${idle}. Since ${idle < 0 ? 'idle < 0' : 'idle >= 0'}, result is ${idle < 0 ? 'tasks.length' : 'tasks.length + idle'} = ${finalTime}.`,
      line: 14,
      totalTime: finalTime,
      finished: true
    });

    load(newHistory);
  }, [load]);

  const generateMaxHeapHistory = useCallback((tasks, n) => {
    const newHistory = [];
    let frequencyMap = new Map();
    let maxHeap = [];
    let cooldownQueue = [];
    let time = 0;

    const addState = (props) => {
      newHistory.push({
        tasks: [...tasks],
        n,
        frequencyMap: new Map(frequencyMap),
        maxHeap: [...maxHeap].sort((a, b) => b - a),
        cooldownQueue: JSON.parse(JSON.stringify(cooldownQueue)),
        currentTime: time,
        processedTasksInCycle: [],
        addedToCooldown: [],
        movedFromCooldown: [],
        explanation: "",
        line: null,
        finished: false,
        totalTime: null,
        ...props,
      });
    };

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

    addState({ explanation: "Building Max Heap from frequencies.", line: 9 });
    for (const freq of frequencyMap.values()) {
      heapPush(maxHeap, freq);
      addState({
        explanation: `Added frequency ${freq} to the heap.`,
        line: 11
      });
    }
    addState({ explanation: "Max Heap built.", line: 11 });

    addState({ explanation: "Start processing cycles.", line: 14 });

    while (!heapIsEmpty(maxHeap) || cooldownQueue.length > 0) {
      addState({ explanation: `Start cycle. Time = ${time}. Check cooldown.`, line: 15 });

      let movedFromCd = [];
      cooldownQueue = cooldownQueue.filter(([freq, availableTime]) => {
        if (availableTime <= time) {
          heapPush(maxHeap, freq);
          movedFromCd.push(freq);
          return false;
        }
        return true;
      });
      if (movedFromCd.length > 0) {
        addState({
          explanation: `Tasks with frequencies [${movedFromCd.join(', ')}] finished cooldown and returned to heap.`,
          line: 31,
          movedFromCooldown: movedFromCd
        });
      }

      let cycleLimit = n + 1;
      let processedInCycle = [];
      let addedToCd = [];

      addState({ explanation: `Begin execution cycle (up to ${cycleLimit} tasks or idles). Time = ${time}.`, line: 17, movedFromCooldown: [] });

      for (let i = 0; i < cycleLimit; i++) {
        if (!heapIsEmpty(maxHeap)) {
          const currentFreq = heapPop(maxHeap);
          processedInCycle.push(currentFreq);
          addState({
            explanation: `Executing task with highest frequency (${currentFreq}). Time = ${time + 1}.`,
            line: 18,
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
              line: 21,
              processedTasksInCycle: [...processedInCycle]
            });
          }
        } else {
          addState({
            explanation: `CPU is idle. Time = ${time + 1}.`,
            line: 18,
            processedTasksInCycle: [...processedInCycle]
          });
          if (heapIsEmpty(maxHeap) && cooldownQueue.length === 0) {
            time++;
            addState({ explanation: `Heap and cooldown are empty. Final idle. Time = ${time}.`, line: 26 });
            break;
          }
        }
        time++;

        if (heapIsEmpty(maxHeap) && cooldownQueue.length === 0) {
          addState({ explanation: `Heap and cooldown became empty during cycle. Exiting early. Time = ${time}.`, line: 26 });
          break;
        }
      }

      addState({
        explanation: `Finished execution cycle. Processed: [${processedInCycle.join(', ')}]. Added to cooldown: [${addedToCd.join(', ')}]. Time = ${time}.`,
        line: 29,
        processedTasksInCycle: processedInCycle,
        addedToCooldown: addedToCd,
        movedFromCooldown: []
      });

      if (heapIsEmpty(maxHeap) && cooldownQueue.length === 0) {
        break;
      }
    }

    addState({ explanation: `Processing complete. Final time = ${time}.`, line: 34, totalTime: time, finished: true });

    load(newHistory);
  }, [load]);

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

    if (mode === "greedy") {
      generateGreedyHistory(localTasks, nValue);
    } else {
      generateMaxHeapHistory(localTasks, nValue);
    }
  };

  const generateNewArray = () => {
    const len = Math.floor(Math.random() * 8) + 8;
    const taskChars = ['A', 'B', 'C', 'D', 'E'];
    const arr = Array.from({ length: len }, () => taskChars[Math.floor(Math.random() * taskChars.length)]);
    setTasksInput(arr.join(","));
    setNInput(String(Math.floor(Math.random() * 4)));
    visualizer.reset();
  };

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

  const activeCodeString = mode === "greedy" ? greedyCode : maxHeapCode;
  const codeContent = {};
  activeCodeString.split("\n").forEach((lineContent, index) => {
    codeContent[index + 1] = lineContent;
  });

  const inputSection = (
    <>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-grow w-full md:w-auto">
        <label htmlFor="tasks-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          Tasks (A-Z):
        </label>
        <input
          id="tasks-input"
          type="text"
          value={tasksInput}
          onChange={(e) => setTasksInput(e.target.value)}
          disabled={isLoaded}
          placeholder="e.g., A,A,B,C,A"
          className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto min-w-[150px] disabled:opacity-75 text-sm"
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
          disabled={isLoaded}
          className="font-mono bg-gray-950 border border-gray-700 text-white rounded-lg p-2 w-20 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-75"
        />
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={loadArray}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-200 transform hover:scale-105 cursor-pointer text-sm flex items-center gap-1.5"
          >
            <Play className="w-4 h-4" /> Visualize
          </button>
          <button
            onClick={generateNewArray}
            className="bg-purple-650 hover:bg-purple-750 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-105 cursor-pointer text-sm flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4"/> Random
          </button>
        </div>
      )}
    </>
  );

  const state = currentState || {};
  const {
    sortedFrequencies = [],
    highlightedFreqIndex = -1,
    maxFreq = null,
    chunk = null,
    idleSlots = null,
    maxHeap = [],
    cooldownQueue = [],
    currentTime = 0,
    processedTasksInCycle = [],
    explanation = isLoaded ? "Algorithm steps will appear here." : "Load tasks and cooldown 'N' to start.",
    line = null,
    finished = false,
    totalTime = null
  } = state;

  const statsSection = (
    <>
      {mode === "greedy" ? (
        <>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
            <h3 className="font-semibold text-blue-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
              Max Frequency
            </h3>
            <div className="font-mono text-2xl font-bold text-blue-300">
              {maxFreq !== null ? maxFreq : "N/A"}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
            <h3 className="font-semibold text-purple-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
              Idle Slots
            </h3>
            <div className="font-mono text-2xl font-bold text-purple-300">
              {idleSlots !== null ? idleSlots : "N/A"}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
            <h3 className="font-semibold text-green-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
              Total Time
            </h3>
            <div className="font-mono text-2xl font-bold text-green-400">
              {finished ? totalTime : "Calculating..."}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
            <h3 className="font-semibold text-blue-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
              Current Time
            </h3>
            <div className="font-mono text-2xl font-bold text-blue-300">
              {currentTime}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-850/40 backdrop-blur-sm p-4 rounded-xl border border-yellow-700/50 text-center">
            <h3 className="font-semibold text-yellow-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
              Cooldown Queue
            </h3>
            <div className="font-mono text-2xl font-bold text-yellow-300">
              {cooldownQueue?.length || 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
            <h3 className="font-semibold text-green-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
              Total Time
            </h3>
            <div className="font-mono text-2xl font-bold text-green-400">
              {finished ? totalTime : "Running..."}
            </div>
          </div>
        </>
      )}

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-xs">
          Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity</span>
            {mode === "greedy" ? (
              <p className="text-gray-405">O(N) to count frequencies, sorting takes O(26 log 26) = O(1).</p>
            ) : (
              <p className="text-gray-405">O(Time * log 26) where Time is the total intervals elapsed.</p>
            )}
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            {mode === "greedy" ? (
              <p className="text-gray-450">O(1) auxiliary space (size 26 array).</p>
            ) : (
              <p className="text-gray-450">O(26) = O(1) space to store frequencies and heap.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderGreedyVisualization = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 select-none">
            <SortAsc className="w-4 h-4 text-blue-400" />
            Sorted Task Frequencies (Non-zero)
          </h4>
          <div className="flex justify-center items-end gap-3 min-h-[140px] pt-4">
            {sortedFrequencies.map((freq, index) => {
              const isMax = index === sortedFrequencies.length - 1;
              const isCurrent = index === highlightedFreqIndex;
              return (
                <div key={index} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-mono text-gray-400">{freq}</span>
                  <div
                    className={`w-10 rounded-t-lg transition-all duration-350 ${
                      isCurrent
                        ? "bg-yellow-500 shadow-lg shadow-yellow-500/25"
                        : isMax
                        ? "bg-blue-500 shadow-lg shadow-blue-500/25"
                        : "bg-gray-800 border border-gray-700"
                    }`}
                    style={{ height: `${freq * 20 + 20}px` }}
                  />
                  <span className="text-[10px] font-mono text-gray-500">
                    {isMax ? "Max" : `F[${index}]`}
                  </span>
                </div>
              );
            })}
            {sortedFrequencies.length === 0 && (
              <span className="text-gray-500 italic text-sm">No active tasks</span>
            )}
          </div>
        </div>

        <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800 space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 select-none">
            <Calculator className="w-4 h-4 text-purple-400" />
            Greedy Allocation Simulation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/80">
              <span className="text-xs text-gray-500 block mb-1">Formula Chunk representation</span>
              <p className="text-xs text-gray-300">
                Number of chunks: <span className="text-blue-300 font-bold font-mono">{chunk ?? "N/A"}</span> (maxFreq - 1)
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Initial idle slots: <span className="text-purple-300 font-bold font-mono">{idleSlots ?? "N/A"}</span> (chunks * n)
              </p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800/80 flex flex-col justify-center">
              <span className="text-xs text-gray-505 block mb-1">Idle slots remaining</span>
              <div className="font-mono text-lg font-bold text-yellow-400">
                {idleSlots !== null ? Math.max(0, idleSlots) : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMaxHeapVisualization = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 select-none">
            <Clock className="w-4 h-4 text-green-400" />
            CPU Execution Timeline
          </h4>
          <div className="flex flex-wrap gap-2 p-2 bg-gray-900/50 rounded-lg min-h-16">
            {processedTasksInCycle.map((item, idx) => (
              <div
                key={idx}
                className="w-10 h-10 flex items-center justify-center font-mono font-bold text-sm rounded bg-blue-600/30 border border-blue-500 text-blue-300"
              >
                {item}
              </div>
            ))}
            {processedTasksInCycle.length === 0 && (
              <span className="text-gray-550 italic text-sm self-center">Idle or waiting...</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
              <Layers className="w-4 h-4 text-purple-400" />
              Priority Queue (Max Heap)
            </h4>
            <div className="flex flex-wrap gap-2 pt-2">
              {maxHeap.map((freq, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-900/30 border border-purple-500 text-purple-300 font-mono font-bold"
                >
                  {freq}
                </div>
              ))}
              {maxHeap.length === 0 && (
                <span className="text-gray-500 italic text-xs">Heap empty</span>
              )}
            </div>
          </div>

          <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
              <Timer className="w-4 h-4 text-yellow-450" />
              Cooldown Queue
            </h4>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {cooldownQueue.map(([freq, availableTime], idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-mono bg-gray-900/50 p-1.5 rounded">
                  <span className="text-gray-300">Freq: {freq}</span>
                  <span className="text-yellow-450 font-bold transition-all duration-200">
                    Avail @ {availableTime}
                  </span>
                </div>
              ))}
              {cooldownQueue.length === 0 && (
                <span className="text-gray-505 italic text-xs">No tasks in cooldown</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    visualizer.reset();
  };

  return (
    <VisualizerLayout
      title="Task Scheduler"
      description="Calculate the minimum intervals needed to complete all tasks under cooldown constraints"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="space-y-6">
        {/* Mode Tabs */}
        <div className="flex border-b border-gray-800 mb-4 select-none">
          <button
            onClick={() => handleModeChange("greedy")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "greedy"
                ? "border-blue-500 text-blue-300 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Calculator className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Greedy Approach O(N)</span>
          </button>
          <button
            onClick={() => handleModeChange("max-heap")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "max-heap"
                ? "border-blue-500 text-blue-300 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Max-Heap Approach</span>
          </button>
        </div>

        {isLoaded ? (
          mode === "greedy" ? renderGreedyVisualization() : renderMaxHeapVisualization()
        ) : (
          <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-400 text-sm">Load tasks and cooldown 'N' to start the visualization.</p>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default TaskSchedulerVisualizer;