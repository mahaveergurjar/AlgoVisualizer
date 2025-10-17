import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  Zap,
  Clock,
  Cpu,
  Play,
  RotateCcw,
  Layers,
  Calculator,
  CheckCircle,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const HeapifyVisualizer = () => {
  const [mode, setMode] = useState("heapify");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("5,3,8,1,2,7");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const generateHeapifyHistory = useCallback((nums) => {
    const newHistory = [];
    const arr = nums.slice();
    const n = arr.length;

    const addState = (props) =>
      newHistory.push({
        nums: arr.slice(),
        line: null,
        i: null,
        largest: null,
        left: null,
        right: null,
        comparing: [],
        swapped: [],
        focus: [],
        note: "",
        heapSize: n,
        finished: false,
        ...props,
      });

    addState({ line: 1, note: "Start building max heap" });

    const siftDown = (i, heapSize) => {
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let largest = i;

        addState({
          line: 3,
          i,
          largest,
          left,
          right,
          focus: [i],
          comparing: [],
          note: `Sift-down at index ${i}, value ${arr[i]}`,
        });

        if (left < heapSize) {
          addState({
            line: 4,
            i,
            largest,
            left,
            right,
            focus: [i],
            comparing: [i, left],
            note: `Compare ${arr[i]} and ${arr[left]}`,
          });
          if (arr[left] > arr[largest]) {
            largest = left;
            addState({
              line: 5,
              i,
              largest,
              left,
              right,
              focus: [i],
              comparing: [i, left],
              note: `Left child ${arr[left]} is larger, update largest to ${largest}`,
            });
          }
        }

        if (right < heapSize) {
          addState({
            line: 6,
            i,
            largest,
            left,
            right,
            focus: [i],
            comparing: [i, right],
            note: `Compare ${arr[largest]} and ${arr[right]}`,
          });
          if (arr[right] > arr[largest]) {
            largest = right;
            addState({
              line: 7,
              i,
              largest,
              left,
              right,
              focus: [i],
              comparing: [i, right],
              note: `Right child ${arr[right]} is larger, update largest to ${largest}`,
            });
          }
        }

        if (largest !== i) {
          addState({
            line: 9,
            i,
            largest,
            left,
            right,
            focus: [i],
            comparing: [i, largest],
            note: `Need to swap ${arr[i]} and ${arr[largest]}`,
          });

          [arr[i], arr[largest]] = [arr[largest], arr[i]];
          addState({
            line: 10,
            i,
            largest,
            left,
            right,
            focus: [i],
            swapped: [i, largest],
            note: `Swapped ${arr[largest]} and ${arr[i]}`,
          });

          i = largest;
        } else {
          break;
        }
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      addState({
        line: 13,
        i,
        note: `Processing non-leaf node at index ${i}`,
        focus: [i],
      });
      siftDown(i, n);
    }

    addState({
      line: 15,
      note: "Max heap built successfully!",
      finished: true,
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
    if (localNums.some(isNaN)) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }
    setIsLoaded(true);
    generateHeapifyHistory(localNums);
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
    const n = Math.floor(Math.random() * 4) + 5;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 1);
    setNumsInput(arr.join(","));
    reset();
  };

  const state = history[currentStep] || {};
  const { nums = [], line, note, comparing = [], swapped = [], focus = [], i, largest, left, right, finished } = state;

  const cppCode = `void heapify(vector<int>& a, int n, int i) {
    int largest = i;
    int l = 2*i + 1;
    int r = 2*i + 2;

    if (l < n && a[l] > a[largest])
        largest = l;
    if (r < n && a[r] > a[largest])
        largest = r;

    if (largest != i) {
        swap(a[i], a[largest]);
        heapify(a, n, largest);
    }
}

void buildHeap(vector<int>& a, int n) {
    for (int i = n/2 - 1; i >= 0; i--)
        heapify(a, n, i);
}`;

  return (
    <div className="p-4 max-w-fit mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-teal-400">Heapify (Build Heap)</h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing Heap Construction</p>
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

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {/* Speed and Reset buttons placed above the C++ Solution */}
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
                C++ Heapify Solution
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
                            {lineNum === 1 && `void heapify(vector<int>& a, int n, int i) {`}
                            {lineNum === 2 && `    int largest = i;`}
                            {lineNum === 3 && `    int l = 2*i + 1;`}
                            {lineNum === 4 && `    int r = 2*i + 2;`}
                            {lineNum === 5 && ``}
                            {lineNum === 6 && `    if (l < n && a[l] > a[largest])`}
                            {lineNum === 7 && `        largest = l;`}
                            {lineNum === 8 && `    if (r < n && a[r] > a[largest])`}
                            {lineNum === 9 && `        largest = r;`}
                            {lineNum === 10 && ``}
                            {lineNum === 11 && `    if (largest != i) {`}
                            {lineNum === 12 && `        swap(a[i], a[largest]);`}
                            {lineNum === 13 && `        heapify(a, n, largest);`}
                            {lineNum === 14 && `    }`}
                            {lineNum === 15 && `}`}
                            {lineNum === 16 && ``}
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
            <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 mb-12 rounded-xl border border-gray-700/50 shadow-2xl min-h-[300px]">
              <h3 className="font-bold text-lg text-gray-300 mb-4">Heap Visualization</h3>
              
              {/* Array Representation */}
              <div className="mb-8">
                <h4 className="text-sm text-gray-400 mb-2">Array Representation:</h4>
                <div id="heap-array-container" className="w-full flex justify-center items-center gap-2 flex-wrap mb-6">
                  {nums.map((num, index) => (
                    <div
                      key={index}
                      id={`heap-array-container-element-${index}`}
                      className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all duration-500 transform ${
                        swapped.includes(index)
                          ? "bg-green-600/40 border-green-400 scale-105 shadow-lg shadow-green-500/30"
                          : comparing.includes(index)
                          ? "bg-yellow-600/40 border-yellow-400 scale-105 shadow-lg shadow-yellow-500/30"
                          : focus.includes(index)
                          ? "bg-blue-600/40 border-blue-400 scale-105 shadow-lg shadow-blue-500/30"
                          : "bg-gray-700/50 border-gray-600 hover:scale-105"
                      } ${finished ? "!border-green-500" : ""}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                {isLoaded && (
                  <>
                    <VisualizerPointer index={i} containerId="heap-array-container" color="amber" label="i" direction="up" />
                    <VisualizerPointer index={largest} containerId="heap-array-container" color="cyan" label="largest" direction="up" />
                    <VisualizerPointer index={left} containerId="heap-array-container" color="violet" label="left" direction="up" />
                    <VisualizerPointer index={right} containerId="heap-array-container" color="rose" label="right" direction="up" />
                  </>
                )}
              </div>

              {/* Tree Visualization */}
              <div className="text-center">
                <h4 className="text-sm text-gray-400 mb-4">Tree Structure:</h4>
                <div className="flex justify-center items-end gap-8 min-h-[200px]">
                  {nums.map((value, index) => {
                    const level = Math.floor(Math.log2(index + 1));
                    const isComparing = comparing.includes(index);
                    const isSwapped = swapped.includes(index);
                    const isFocus = focus.includes(index);

                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                        <div
                          className={`w-12 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                            isSwapped
                              ? "bg-green-500/30 border-green-400 scale-110 shadow-lg shadow-green-500/25"
                              : isComparing
                              ? "bg-yellow-500/30 border-yellow-400 scale-105 shadow-lg shadow-yellow-500/25"
                              : isFocus
                              ? "bg-blue-500/30 border-blue-400 scale-105 shadow-lg shadow-blue-500/25"
                              : "bg-gray-700 border-gray-600"
                          }`}
                          style={{ height: `${value * 8 + 30}px` }}
                        >
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Current Operation
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Current Index: <span className="font-mono font-bold text-yellow-400">{i ?? "N/A"}</span>
                  </p>
                  <p>
                    Largest: <span className="font-mono font-bold text-yellow-400">{largest ?? "N/A"}</span>
                  </p>
                  <p>
                    Left Child: <span className="font-mono font-bold text-yellow-400">{left ?? "N/A"}</span>
                  </p>
                  <p>
                    Right Child: <span className="font-mono font-bold text-yellow-400">{right ?? "N/A"}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Algorithm Status
                </h3>
                <div className="text-gray-300 text-sm h-20 overflow-y-auto">
                  {note || "Waiting for computation..."}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
              <h3 className="font-bold text-xl text-center text-green-300 mb-3 flex items-center justify-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Heap Status
              </h3>
              <div className="font-mono text-2xl text-center font-bold text-green-400">
                {finished ? "Max Heap Built!" : "Building Heap..."}
              </div>
            </div>

            {/* Algorithm Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
              <h3 className="font-bold text-lg text-gray-300 mb-4">Algorithm Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Time Complexity</div>
                    <div className="text-sm text-gray-400">O(n) — Building heap from array</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cpu className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Space Complexity</div>
                    <div className="text-sm text-gray-400">O(1) — In-place heapify</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">Approach</div>
                    <div className="text-sm text-gray-400">Sift-down from last non-leaf node to root</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">Load an array to begin heapify visualization.</p>
      )}
    </div>
  );
};

export default HeapifyVisualizer;