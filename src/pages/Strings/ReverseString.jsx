import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Play, RotateCcw, Code, Zap, Clock, Cpu, ArrowLeftRight } from "lucide-react";

const ReverseString = ({ navigate }) => {
  const [inputString, setInputString] = useState("hello");
  const [chars, setChars] = useState([]);
  const [leftPointer, setLeftPointer] = useState(0);
  const [rightPointer, setRightPointer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [swapHistory, setSwapHistory] = useState([]);
  const [currentSwap, setCurrentSwap] = useState(null);

  const resetAnimation = () => {
    const charArray = inputString.split('');
    setChars(charArray);
    setLeftPointer(0);
    setRightPointer(charArray.length - 1);
    setIsPlaying(false);
    setIsComplete(false);
    setSwapHistory([]);
    setCurrentSwap(null);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const loadExamples = (example) => {
    const examples = {
      example1: "hello",
      example2: "world",
      example3: "algorithm",
      example4: "racecar",
      example5: "javascript",
      example6: "react"
    };
    setInputString(examples[example]);
  };

  useEffect(() => {
    if (inputString) {
      resetAnimation();
    }
  }, [inputString]);

  useEffect(() => {
    let interval;
    if (isPlaying && leftPointer < rightPointer && !isComplete) {
      interval = setInterval(() => {
        setChars(prevChars => {
          const newChars = [...prevChars];
          
          // Record the swap
          setCurrentSwap({
            left: leftPointer,
            right: rightPointer,
            leftChar: newChars[leftPointer],
            rightChar: newChars[rightPointer]
          });

          setSwapHistory(prev => [...prev, {
            left: leftPointer,
            right: rightPointer,
            leftChar: newChars[leftPointer],
            rightChar: newChars[rightPointer]
          }]);

          // Perform the swap
          const temp = newChars[leftPointer];
          newChars[leftPointer] = newChars[rightPointer];
          newChars[rightPointer] = temp;

          // Update pointers for next iteration
          const newLeft = leftPointer + 1;
          const newRight = rightPointer - 1;

          if (newLeft >= newRight) {
            setIsPlaying(false);
            setIsComplete(true);
          } else {
            setLeftPointer(newLeft);
            setRightPointer(newRight);
          }

          return newChars;
        });
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, leftPointer, rightPointer, isComplete, speed]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to String Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <RefreshCw className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Reverse String
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Reverse characters in a string in-place using two pointers
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
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
              <div className="flex items-center gap-2">
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

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Input String:</label>
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-mono"
                placeholder="Enter a string..."
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => loadExamples('example1')} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-all">
                hello
              </button>
              <button onClick={() => loadExamples('example2')} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all">
                world
              </button>
              <button onClick={() => loadExamples('example3')} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-500/30 transition-all">
                algorithm
              </button>
              <button onClick={() => loadExamples('example4')} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-all">
                racecar
              </button>
              <button onClick={() => loadExamples('example5')} className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm hover:bg-orange-500/30 transition-all">
                javascript
              </button>
              <button onClick={() => loadExamples('example6')} className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-sm hover:bg-pink-500/30 transition-all">
                react
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Two-Pointer Swap Visualization</h3>
            
            {/* String Visualization */}
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap min-h-[120px]">
              {chars.map((char, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-500 ${
                      index === leftPointer && isPlaying
                        ? "bg-blue-500/30 border-blue-400 scale-110 shadow-lg shadow-blue-500/25 animate-pulse"
                        : index === rightPointer && isPlaying
                        ? "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25 animate-pulse"
                        : isComplete
                        ? "bg-green-500/20 border-green-400"
                        : swapHistory.some(h => h.left === index || h.right === index)
                        ? "bg-cyan-500/20 border-cyan-400"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    <span className="text-white font-bold text-2xl font-mono">{char}</span>
                  </div>
                  <div className="text-xs font-bold">
                    {index === leftPointer && isPlaying && (
                      <span className="text-blue-400">LEFT</span>
                    )}
                    {index === rightPointer && isPlaying && (
                      <span className="text-purple-400">RIGHT</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pointer Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 text-sm font-bold mb-1">Left Pointer</div>
                <div className="text-white text-2xl font-mono">
                  {isPlaying || isComplete ? `[${leftPointer}] = '${chars[leftPointer]}'` : "Not started"}
                </div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-400 text-sm font-bold mb-1">Right Pointer</div>
                <div className="text-white text-2xl font-mono">
                  {isPlaying || isComplete ? `[${rightPointer}] = '${chars[rightPointer]}'` : "Not started"}
                </div>
              </div>
            </div>

            {/* Current Swap */}
            {currentSwap && isPlaying && (
              <div className="mb-6 p-4 rounded-lg border-2 bg-cyan-500/10 border-cyan-500/30">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Current Swap</div>
                  <div className="text-xl font-mono flex items-center justify-center gap-3">
                    <span className="text-blue-400">'{currentSwap.leftChar}'</span>
                    <ArrowLeftRight className="h-5 w-5 text-cyan-400 animate-pulse" />
                    <span className="text-purple-400">'{currentSwap.rightChar}'</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Swapping positions [{currentSwap.left}] ↔ [{currentSwap.right}]
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-2">Original:</div>
                  <div className="text-white text-xl font-mono">{inputString}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-2">Reversed:</div>
                  <div className={`text-xl font-mono transition-colors ${
                    isComplete ? "text-green-400 font-bold" : "text-white"
                  }`}>
                    {chars.join('')}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-green-400 animate-pulse">
                  <RefreshCw className="h-8 w-8" />
                  String Reversed Successfully!
                </div>
              ) : isPlaying ? (
                <div className="text-lg text-yellow-400">
                  Swapping characters at positions {leftPointer} and {rightPointer}...
                </div>
              ) : (
                <div className="text-gray-400">
                  Click "Start Animation" to reverse the string
                </div>
              )}
            </div>
          </div>

          {/* Swap History */}
          {swapHistory.length > 0 && (
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Swap History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {swapHistory.map((swap, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-cyan-500/10 border-cyan-500/30">
                    <div className="text-sm font-mono flex items-center justify-between">
                      <span>
                        Step {index + 1}: 
                        <span className="text-blue-400"> [{swap.left}]='{swap.leftChar}' </span>
                        <ArrowLeftRight className="h-3 w-3 inline text-cyan-400" />
                        <span className="text-purple-400"> [{swap.right}]='{swap.rightChar}'</span>
                      </span>
                      <span className="text-cyan-400">Swapped ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Platform</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Code className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-bold text-white">LeetCode #344</div>
                  <div className="text-sm text-gray-400">Reverse String</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-blue-400">void reverseString(vector<span className="text-pink-400">{'<'}</span>char<span className="text-pink-400">{'>'}</span>& s) {'{'}</div>
              <div className={`text-green-400 ml-4 ${isPlaying ? "bg-green-500/20 px-2 rounded" : ""}`}>
                int left = 0;
              </div>
              <div className={`text-green-400 ml-4 ${isPlaying ? "bg-green-500/20 px-2 rounded" : ""}`}>
                int right = s.size() - 1;
              </div>
              <div className="text-green-400 ml-4 mt-2">while (left {'<'} right) {'{'}</div>
              <div className={`text-yellow-400 ml-8 ${isPlaying ? "bg-yellow-500/20 px-2 rounded" : ""}`}>
                swap(s[left], s[right]);
              </div>
              <div className={`text-cyan-400 ml-8 ${isPlaying ? "bg-cyan-500/20 px-2 rounded" : ""}`}>
                left++;
              </div>
              <div className={`text-purple-400 ml-8 ${isPlaying ? "bg-purple-500/20 px-2 rounded" : ""}`}>
                right--;
              </div>
              <div className="text-green-400 ml-4">{'}'}</div>
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
                  <div className="text-sm text-gray-400">O(n/2) ≈ O(n) - Swap half the characters</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Space Complexity</div>
                  <div className="text-sm text-gray-400">O(1) - In-place reversal with two pointers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Approach</div>
                  <div className="text-sm text-gray-400">Two Pointers - Swap characters from both ends moving inward</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-2">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Initialize two pointers: left at start, right at end</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Swap characters at both pointer positions</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Move left pointer forward and right pointer backward</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Continue until pointers meet or cross</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400 font-bold">5.</span>
                <span>String is now reversed in-place</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Key Points</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>In-place algorithm - no extra space needed</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Classic two-pointer technique application</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Only n/2 swaps needed to reverse entire string</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Works for any string length including odd/even</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseString;