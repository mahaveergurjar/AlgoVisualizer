 import React, { useState, useEffect } from "react";
import { ArrowLeft, Maximize2, Play, RotateCcw, Code, Zap, Clock, Cpu } from "lucide-react";

const FindMaxElement = ({ navigate }) => {
  const [array, setArray] = useState([3, 1, 4, 1, 5, 9, 2, 6]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [algorithm, setAlgorithm] = useState("optimal"); // "bruteforce" or "optimal"
  const [comparisons, setComparisons] = useState(0);

  const resetAnimation = () => {
    setCurrentIndex(0);
    setMaxIndex(0);
    setIsPlaying(false);
    setIsComplete(false);
    setComparisons(0);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    setArray(newArray);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([3, 1, 4, 1, 5, 9, 2, 6]);
    resetAnimation();
  };

  // Optimal O(n) algorithm simulation
  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < array.length && algorithm === "optimal") {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          setComparisons(c => c + 1);
          
          if (nextIndex < array.length && array[nextIndex] > array[maxIndex]) {
            setMaxIndex(nextIndex);
          }

          if (nextIndex >= array.length) {
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }

          return nextIndex;
        });
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, array, maxIndex, speed, algorithm]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Maximize2 className="h-12 w-12 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
              Find Maximum Element
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Visualizing the process of finding the largest element in an array
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={loadDefaultArray}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-all cursor-pointer"
                >
                  Load & Visualize
                </button>
                
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Animation"}
                </button>
                
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple-500 cursor-pointer hover:bg-purple-600 rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-400 text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 cursor-pointer rounded-lg px-3 py-2 text-white"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>

              <div className="flex items-center gap-2 ml-4">
                <Code className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Comparisons: {comparisons}</span>
              </div>
            </div>
          </div>

          {/* Array Visualization */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Array Visualization</h3>
            
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-gray-400 text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === currentIndex && !isComplete
                        ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                        : index === maxIndex
                        ? "bg-green-500/30 border-green-400 scale-105 shadow-lg shadow-green-500/25"
                        : index < currentIndex
                        ? "bg-blue-500/20 border-blue-400"
                        : "bg-gray-800 border-gray-700"
                    } ${
                      isComplete && index === maxIndex
                        ? "bg-green-500/40 border-green-400 animate-pulse shadow-2xl shadow-green-500/30"
                        : ""
                    }`}
                    style={{ height: `${value * 20 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold ${
                      index === maxIndex ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                    }`}>
                      {index === maxIndex ? "MAX" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-green-400 animate-pulse">
                  <Maximize2 className="h-8 w-8" />
                  Maximum Element Found: {array[maxIndex]} at index {maxIndex}
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-yellow-400">
                  <Zap className="h-5 w-5" />
                  Checking element at index {currentIndex}...
                </div>
              ) : (
                <div className="text-gray-400">
                  Click "Start Animation" to begin visualization
                </div>
              )}
            </div>
          </div>

          {/* Algorithm Steps */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Algorithm Steps</h3>
            <div className="space-y-3 text-gray-300">
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                currentIndex >= 0 ? "bg-blue-500/10 border border-blue-500/30" : ""
              }`}>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">1</div>
                <p>Initialize <code className="bg-gray-800 px-2 py-1 rounded">max_index = 0</code></p>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                currentIndex > 0 ? "bg-blue-500/10 border border-blue-500/30" : ""
              }`}>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">2</div>
                <p>Traverse through each element in the array from index 1 to n-1</p>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                currentIndex > 0 ? "bg-blue-500/10 border border-blue-500/30" : ""
              }`}>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">3</div>
                <p>For each element, compare with current maximum: <code className="bg-gray-800 px-2 py-1 rounded">if (array[i] {">"} array[max_index])</code></p>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg ${
                isComplete ? "bg-green-500/10 border border-green-500/30" : ""
              }`}>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">4</div>
                <p>Update <code className="bg-gray-800 px-2 py-1 rounded">max_index = i</code> if current element is larger</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Code and Complexity */}
        <div className="space-y-6">
          {/* Algorithm Selection */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Algorithm</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Zap className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-bold text-white">Optimal O(n)</div>
                  <div className="text-sm text-gray-400">Single pass through array</div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Optimal Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
              <div className="text-blue-400">int findMax(vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span>& arr) {'{'}</div>
              <div className="text-green-400 ml-4">int max_index = 0;</div>
              <div className="text-green-400 ml-4">for (int i = 1; i {'<'} arr.size(); i++) {'{'}</div>
              <div className={`text-yellow-400 ml-8 ${currentIndex > 0 ? "bg-yellow-500/20 px-2 rounded" : ""}`}>
                if (arr[i] {'>'} arr[max_index]) {'{'}
              </div>
              <div className={`text-red-400 ml-12 ${maxIndex === currentIndex ? "bg-red-500/20 px-2 rounded" : ""}`}>
                max_index = i;
              </div>
              <div className="text-yellow-400 ml-8">{'}'}</div>
              <div className="text-green-400 ml-4">{'}'}</div>
              <div className="text-green-400 ml-4">return arr[max_index];</div>
              <div className="text-blue-400">{'}'}</div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Complexity Analysis</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <div className="font-bold text-white">Time Complexity: O(N)</div>
                  <div className="text-sm text-gray-400">
                    We make a single pass through the array, comparing each element with the current maximum. 
                    Each element is visited exactly once.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <div className="font-bold text-white">Space Complexity: O(1)</div>
                  <div className="text-sm text-gray-400">
                    We only use constant extra space for tracking the maximum index and loop variables. 
                    No additional arrays are required.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-300">
                <strong>Key Insight:</strong> The maximum element can be found in linear time by maintaining 
                a running maximum while traversing the array once.
              </div>
            </div>
          </div>

          {/* Current Array Display */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Current Array</h3>
            <div className="bg-gray-950 rounded-lg p-4">
              <div className="font-mono text-sm text-gray-300 mb-2">
                [{array.join(", ")}]
              </div>
              <div className="text-xs text-gray-500">
                Array length: {array.length} elements
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMaxElement;