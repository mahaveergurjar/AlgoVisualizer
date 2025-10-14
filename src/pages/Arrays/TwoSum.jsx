 import React, { useState, useEffect } from "react";
import { ArrowLeft, Target, Play, RotateCcw, Code, Zap, Clock, Cpu, Search } from "lucide-react";

const TwoSum = ({ navigate }) => {
  const [array, setArray] = useState([2, 7, 11, 15, 3, 6, 8, 4]);
  const [target, setTarget] = useState(9);
  const [map, setMap] = useState(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [found, setFound] = useState(false);
  const [pair, setPair] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const resetAnimation = () => {
    setMap(new Map());
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsComplete(false);
    setFound(false);
    setPair([]);
    setSearchHistory([]);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    setArray(newArray);
    setTarget(Math.floor(Math.random() * 30) + 5);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([2, 7, 11, 15, 3, 6, 8, 4]);
    setTarget(9);
    resetAnimation();
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < array.length && !found) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const complement = target - array[prev];
          
          setSearchHistory(sh => [...sh, {
            index: prev,
            value: array[prev],
            complement: complement,
            inMap: map.has(complement)
          }]);

          if (map.has(complement)) {
            setFound(true);
            setPair([map.get(complement), prev]);
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }

          const newMap = new Map(map);
          newMap.set(array[prev], prev);
          setMap(newMap);

          const nextIndex = prev + 1;
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
  }, [isPlaying, currentIndex, array, target, map, found, speed]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
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
            <Target className="h-12 w-12 text-orange-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              Two Sum
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find two numbers that add up to the target value using hash map
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
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 cursor-pointer rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-400 text-sm">Speed:</label>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white cursor-pointer"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-300">Target: </span>
                <span className="text-lg font-bold text-orange-400">{target}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Hash Map Visualization</h3>
            
            {/* Array Visualization */}
            <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
              {array.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="text-gray-400 text-sm font-mono">[{index}]</div>
                  <div
                    className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      index === currentIndex && !isComplete
                        ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                        : found && pair.includes(index)
                        ? "bg-green-500/30 border-green-400 scale-105 shadow-lg shadow-green-500/25"
                        : index < currentIndex
                        ? "bg-blue-500/20 border-blue-400"
                        : "bg-gray-700 border-gray-600"
                    }`}
                    style={{ height: `${value * 10 + 60}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold ${
                      index === currentIndex ? "bg-yellow-500 text-white" :
                      found && pair.includes(index) ? "bg-green-500 text-white" :
                      "bg-gray-600 text-gray-300"
                    }`}>
                      {index === currentIndex ? "CURRENT" : 
                       found && pair.includes(index) ? "FOUND" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hash Map Display */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-bold text-white mb-3">Hash Map Contents</h4>
              <div className="grid grid-cols-4 gap-2">
                {Array.from(map.entries()).map(([key, value]) => (
                  <div key={key} className="bg-gray-700 rounded p-2 text-center">
                    <div className="text-blue-400 font-mono">{key}</div>
                    <div className="text-gray-400 text-sm">→ [{value}]</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              {found ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-green-400 animate-pulse">
                  <Target className="h-8 w-8" />
                  Found: array[{pair[0]}] + array[{pair[1]}] = {array[pair[0]]} + {array[pair[1]]} = {target}
                </div>
              ) : isComplete && !found ? (
                <div className="text-2xl font-bold text-red-400">
                  No two sum solution found
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-3 text-lg text-yellow-400">
                  <Search className="h-5 w-5" />
                  Checking complement {target - array[currentIndex]} for array[{currentIndex}] = {array[currentIndex]}
                </div>
              ) : (
                <div className="text-gray-400">
                  Click "Start Animation" to begin visualization
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Platform</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <Code className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="font-bold text-white">LeetCode #1</div>
                  <div className="text-sm text-gray-400">Two Sum</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
              <div className="text-blue-400">vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span> twoSum(vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span>& nums, int target) {'{'}</div>
              <div className="text-green-400 ml-4">unordered_map<span className="text-pink-400">{'<'}</span>int, int<span className="text-pink-400">{'>'}</span> map;</div>
              <div className="text-green-400 ml-4">for (int i = 0; i {'<'} nums.size(); i++) {'{'}</div>
              <div className={`text-yellow-400 ml-8 ${currentIndex > 0 ? "bg-yellow-500/20 px-2 rounded" : ""}`}>
                int complement = target - nums[i];
              </div>
              <div className={`text-yellow-400 ml-8 ${currentIndex > 0 ? "bg-yellow-500/20 px-2 rounded" : ""}`}>
                if (map.find(complement) != map.end()) {'{'}
              </div>
              <div className={`text-red-400 ml-12 ${found ? "bg-red-500/20 px-2 rounded" : ""}`}>
                return {'{'}map[complement], i{'}'};
              </div>
              <div className="text-yellow-400 ml-8">{'}'}</div>
              <div className={`text-green-400 ml-8 ${currentIndex > 0 ? "bg-green-500/20 px-2 rounded" : ""}`}>
                map[nums[i]] = i;
              </div>
              <div className="text-green-400 ml-4">{'}'}</div>
              <div className="text-green-400 ml-4">return {'{'}-1, -1{'}'};</div>
              <div className="text-blue-400">{'}'}</div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Algorithm Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Time Complexity</div>
                  <div className="text-sm text-gray-400">O(n) - Single pass through array</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Space Complexity</div>
                  <div className="text-sm text-gray-400">O(n) - Hash map storage</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Approach</div>
                  <div className="text-sm text-gray-400">Hash Map - Store visited numbers and check complements</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoSum;