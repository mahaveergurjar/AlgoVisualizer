import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Play, RotateCcw, Code, Zap, Clock, Cpu, Sigma } from "lucide-react";

const ArraySum = ({ navigate }) => {
  const [array, setArray] = useState([2, 5, 3, 8, 1, 7, 4, 6]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sum, setSum] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [partialSums, setPartialSums] = useState([]);

  const resetAnimation = () => {
    setCurrentIndex(0);
    setSum(0);
    setPartialSums([]);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1);
    setArray(newArray);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([2, 5, 3, 8, 1, 7, 4, 6]);
    resetAnimation();
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < array.length) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          const newSum = sum + array[prev];
          setSum(newSum);
          setPartialSums(ps => [...ps, { index: prev, value: array[prev], cumulative: newSum }]);
          
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
  }, [isPlaying, currentIndex, array, sum, speed]);

  const totalSum = array.reduce((acc, val) => acc + val, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform " />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Plus className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Array Sum
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Calculate the sum of all elements in an array through cumulative addition
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 cursor-pointer disabled:bg-green-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Animation"}
                </button>
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-all cursor-pointer"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-400 text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer text-white"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
              <div className="flex items-center gap-2 ml-4">
                <Sigma className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Current Sum: {sum}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Cumulative Sum Visualization</h3>
            
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-gray-400 text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === currentIndex && !isComplete
                        ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                        : index < currentIndex
                        ? "bg-green-500/20 border-green-400"
                        : "bg-blue-500/20 border-blue-400"
                    }`}
                    style={{ height: `${value * 15 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                    <div className="w-full text-center py-1 text-xs font-bold bg-gray-700 text-gray-300">
                      +{value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cumulative Sum Display */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="text-center">
                <div className="text-lg text-gray-300 mb-2">Cumulative Sum Progress</div>
                <div className="text-2xl font-bold text-green-400">
                  {sum} / {totalSum}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(sum / totalSum) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-green-400 animate-pulse">
                  <Sigma className="h-8 w-8" />
                  Total Sum: {sum}
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-yellow-400">
                  <Zap className="h-5 w-5" />
                  Adding element at index {currentIndex}: +{array[currentIndex]}
                </div>
              ) : (
                <div className="text-gray-400">
                  Click "Start Animation" to begin visualization
                </div>
              )}
            </div>
          </div>

          {/* Steps Table */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Step-by-Step Calculation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">Step</th>
                    <th className="text-left py-2 text-gray-400">Index</th>
                    <th className="text-left py-2 text-gray-400">Value</th>
                    <th className="text-left py-2 text-gray-400">Add</th>
                    <th className="text-left py-2 text-gray-400">Cumulative Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {partialSums.map((step, idx) => (
                    <tr key={idx} className="border-b border-gray-800">
                      <td className="py-2 text-gray-300">{idx + 1}</td>
                      <td className="py-2 text-gray-300">[{step.index}]</td>
                      <td className="py-2 text-gray-300">{step.value}</td>
                      <td className="py-2 text-green-400">+{step.value}</td>
                      <td className="py-2 text-blue-400 font-mono">{step.cumulative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Platform</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Code className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-bold text-white">All Platforms</div>
                  <div className="text-sm text-gray-400">Fundamental Operation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
              <div className="text-blue-400">int arraySum(vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span>& arr) {'{'}</div>
              <div className="text-green-400 ml-4">int sum = 0;</div>
              <div className="text-green-400 ml-4">for (int i = 0; i {'<'} arr.size(); i++) {'{'}</div>
              <div className={`text-yellow-400 ml-8 ${currentIndex > 0 ? "bg-yellow-500/20 px-2 rounded" : ""}`}>
                sum += arr[i];
              </div>
              <div className="text-green-400 ml-4">{'}'}</div>
              <div className="text-green-400 ml-4">return sum;</div>
              <div className="text-blue-400">{'}'}</div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Complexity Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <div className="font-bold text-white">Time Complexity: O(N)</div>
                  <div className="text-sm text-gray-400">
                    Single pass through array, adding each element once
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <div className="font-bold text-white">Space Complexity: O(1)</div>
                  <div className="text-sm text-gray-400">
                    Only constant space for sum variable
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArraySum;