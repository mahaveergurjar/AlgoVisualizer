import React, { useState, useEffect } from "react";
import { ArrowLeft, Target, Play, RotateCcw, Code, Zap, Clock, Cpu, Search } from "lucide-react";

const SquaresOfSortedArray = ({ navigate }) => {
  const [array, setArray] = useState([-4, -1, 0, 3, 10]);
  const [result, setResult] = useState(Array(5).fill(null));
  const [leftPointer, setLeftPointer] = useState(0);
  const [rightPointer, setRightPointer] = useState(4);
  const [resultPointer, setResultPointer] = useState(4);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const resetAnimation = (arr = array) => {
    setResult(Array(arr.length).fill(null));
    setLeftPointer(0);
    setRightPointer(arr.length - 1);
    setResultPointer(arr.length - 1);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const startAnimation = () => {
    if (isComplete) {
      resetAnimation();
    }
    setIsPlaying(true);
  };

  const generateNewArray = () => {
    const size = Math.floor(Math.random() * 5) + 5; // Array size between 5 and 9
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 21) - 10); // Numbers from -10 to 10
    newArray.sort((a, b) => a - b);
    setArray(newArray);
    resetAnimation(newArray);
  };

  const loadDefaultArray = () => {
    const defaultArray = [-4, -1, 0, 3, 10];
    setArray(defaultArray);
    resetAnimation(defaultArray);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && leftPointer <= rightPointer) {
      interval = setInterval(() => {
        // Usamos a forma funcional do setState para não depender do 'result' diretamente
        setResult(prevResult => {
          const newResult = [...prevResult];
          const leftSquare = array[leftPointer] * array[leftPointer];
          const rightSquare = array[rightPointer] * array[rightPointer];

          if (leftSquare > rightSquare) {
            newResult[resultPointer] = leftSquare;
          } else {
            newResult[resultPointer] = rightSquare;
          }
          return newResult;
        });

        // Atualiza os ponteiros baseado na comparação
        const leftSquare = array[leftPointer] * array[leftPointer];
        const rightSquare = array[rightPointer] * array[rightPointer];
        if (leftSquare > rightSquare) {
          setLeftPointer(lp => lp + 1);
        } else {
          setRightPointer(rp => rp - 1);
        }
        setResultPointer(rp => rp - 1);

      }, speed);
    } else if (leftPointer > rightPointer && isPlaying) {
      setIsPlaying(false);
      setIsComplete(true);
    }

    return () => clearInterval(interval);
    // AQUI A CORREÇÃO: removemos 'result' da lista de dependências
  }, [isPlaying, leftPointer, rightPointer, resultPointer, array, speed]);


  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Array Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Target className="h-12 w-12 text-orange-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              Squares of a Sorted Array
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Given an integer array sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-all"
                >
                  Load & Visualize
                </button>
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  {isPlaying ? "Running..." : "Start Animation"}
                </button>
                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <button
                onClick={generateNewArray}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-all"
              >
                New Array
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-gray-400 text-sm">Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Medium</option>
                <option value={500}>Fast</option>
                <option value={250}>Very Fast</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Two Pointers Visualization</h3>

            {/* Input Array Visualization */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4 text-center">Input Array</h4>
              <div className="flex justify-center items-end gap-2 min-h-[150px]">
                {array.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="text-gray-400 text-sm font-mono">[{index}]</div>
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${index === leftPointer ? "bg-blue-500/30 border-blue-400 scale-110 shadow-lg shadow-blue-500/25" :
                          index === rightPointer ? "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25" :
                            "bg-gray-700 border-gray-600"
                        }`}
                    >
                      <span className="text-white font-bold text-lg">{value}</span>
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold rounded-b-lg transition-all ${index === leftPointer ? "bg-blue-500 text-white" :
                        index === rightPointer ? "bg-purple-500 text-white" : "opacity-0"
                      }`}>
                      {index === leftPointer ? "LEFT" : index === rightPointer ? "RIGHT" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Array Visualization */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4 text-center">Result Array</h4>
              <div className="flex justify-center items-end gap-2 min-h-[150px]">
                {result.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="text-gray-400 text-sm font-mono">[{index}]</div>
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${index === resultPointer && isPlaying ? "bg-yellow-500/30 border-yellow-400 scale-110" :
                          value !== null ? "bg-green-500/30 border-green-400" :
                            "bg-gray-800 border-gray-700"
                        }`}
                    >
                      {value !== null && <span className="text-white font-bold text-lg">{value}</span>}
                    </div>
                    <div className={`w-full text-center py-1 text-xs font-bold rounded-b-lg transition-all ${index === resultPointer && isPlaying ? "bg-yellow-500 text-white" : "opacity-0"
                      }`}>
                      {index === resultPointer && isPlaying ? "INSERT" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-8 text-lg min-h-[2.5rem]">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 font-bold text-green-400 animate-pulse">
                  <Target className="h-8 w-8" />
                  Algorithm Complete!
                </div>
              ) : isPlaying && leftPointer <= rightPointer ? (
                <div className="text-yellow-400 font-mono">
                  Comparing |{array[leftPointer]}|² ({array[leftPointer] * array[leftPointer]}) vs |{array[rightPointer]}|² ({array[rightPointer] * array[rightPointer]})
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
                  <div className="font-bold text-white">Leetcode #977</div>
                  <div className="text-sm text-gray-400">Squares of a Sorted Array</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
              <div className="text-blue-400">vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span> sortedSquares(vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span>& nums) {'{'}</div>
              <div className="text-green-400 ml-4">int n = nums.size();</div>
              <div className="text-green-400 ml-4">vector<span className="text-pink-400">{'<'}</span>int<span className="text-pink-400">{'>'}</span> result(n);</div>
              <div className="text-green-400 ml-4">int left = 0;</div>
              <div className="text-green-400 ml-4">int right = n - 1;</div>
              <div className="text-green-400 ml-4">for (int k = n - 1; k {'>='} 0; k--) {'{'}</div>
              <div className="text-yellow-400 ml-8">
                if (abs(nums[left] * nums[left]) {'>'} abs(nums[right] * nums[right])) {'{'}
              </div>
              <div className="text-red-400 ml-12">
                result[k] = nums[left] * nums[left];
              </div>
              <div className="text-red-400 ml-12">left++;</div>
              <div className="text-yellow-400 ml-8">{'}'} else {'{'}</div>
              <div className="text-red-400 ml-12">
                result[k] = nums[right] * nums[right];
              </div>
              <div className="text-red-400 ml-12">right--;</div>
              <div className="text-yellow-400 ml-8">{'}'}</div>
              <div className="text-green-400 ml-4">{'}'}</div>
              <div className="text-green-400 ml-4">return result;</div>
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
                  <div className="text-sm text-gray-400">O(n) - Two Pointers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Space Complexity</div>
                  <div className="text-sm text-gray-400">O(n) - For the result array</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Approach</div>
                  <div className="text-sm text-gray-400">Two Pointers from ends of the array</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquaresOfSortedArray;