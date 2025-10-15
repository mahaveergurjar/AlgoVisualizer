import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Play, RotateCcw, Code, Zap, Clock, Cpu, CheckCircle, XCircle, Volume2 } from "lucide-react";

const CountVowels = ({ navigate }) => {
  const [inputString, setInputString] = useState("Hello World");
  const [chars, setChars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [isComplete, setIsComplete] = useState(false);
  const [vowelCount, setVowelCount] = useState(0);
  const [vowelHistory, setVowelHistory] = useState([]);
  const [currentChar, setCurrentChar] = useState(null);
  const [vowelPositions, setVowelPositions] = useState([]);

  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

  const resetAnimation = () => {
    const charArray = inputString.toLowerCase().split('');
    setChars(charArray);
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsComplete(false);
    setVowelCount(0);
    setVowelHistory([]);
    setCurrentChar(null);
    setVowelPositions([]);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const loadExamples = (example) => {
    const examples = {
      example1: "Hello World",
      example2: "Algorithm",
      example3: "Programming",
      example4: "aeiou",
      example5: "bcdfg",
      example6: "Beautiful",
      example7: "Count Vowels",
      example8: "Education"
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
    if (isPlaying && currentIndex < chars.length && !isComplete) {
      interval = setInterval(() => {
        const char = chars[currentIndex];
        const isVowel = vowels.has(char);
        
        setCurrentChar({
          char: char,
          index: currentIndex,
          isVowel: isVowel
        });

        if (isVowel) {
          const newCount = vowelCount + 1;
          setVowelCount(newCount);
          setVowelPositions(prev => [...prev, currentIndex]);
          
          setVowelHistory(prev => [...prev, {
            char: char,
            index: currentIndex,
            count: newCount,
            step: prev.length + 1
          }]);
        }

        if (currentIndex === chars.length - 1) {
          setIsPlaying(false);
          setIsComplete(true);
          setCurrentChar(null);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, chars, isComplete, speed, vowelCount]);

  const getCharColor = (index) => {
    if (index === currentIndex && isPlaying) {
      return "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25 animate-pulse";
    }
    if (vowelPositions.includes(index)) {
      return "bg-green-500/20 border-green-400";
    }
    if (index < currentIndex) {
      return "bg-gray-700 border-gray-500";
    }
    return "bg-gray-800 border-gray-600";
  };

  const getCharLabel = (index) => {
    if (index === currentIndex && isPlaying) {
      return <span className="text-yellow-400">CURRENT</span>;
    }
    if (vowelPositions.includes(index)) {
      return <span className="text-green-400">VOWEL</span>;
    }
    return null;
  };

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
            <Hash className="h-12 w-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Count Vowels
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Count the number of vowels in a string using linear traversal
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
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
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
              <button onClick={() => loadExamples('example1')} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:bg-purple-500/30 transition-all">
                Hello World
              </button>
              <button onClick={() => loadExamples('example2')} className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm hover:bg-indigo-500/30 transition-all">
                Algorithm
              </button>
              <button onClick={() => loadExamples('example3')} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all">
                Programming
              </button>
              <button onClick={() => loadExamples('example4')} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-all">
                aeiou
              </button>
              <button onClick={() => loadExamples('example5')} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-all">
                bcdfg
              </button>
              <button onClick={() => loadExamples('example6')} className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-sm hover:bg-pink-500/30 transition-all">
                Beautiful
              </button>
              <button onClick={() => loadExamples('example7')} className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-sm hover:bg-orange-500/30 transition-all">
                Count Vowels
              </button>
              <button onClick={() => loadExamples('example8')} className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 text-sm hover:bg-violet-500/30 transition-all">
                Education
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Vowel Counting Visualization</h3>
            
            {/* String Visualization */}
            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap min-h-[120px]" id="string-container">
              {chars.map((char, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                  <div
                    id={`string-container-element-${index}`}
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-500 ${getCharColor(index)}`}
                  >
                    <span className="text-white font-bold text-2xl font-mono">{char}</span>
                  </div>
                  <div className="text-xs font-bold">
                    {getCharLabel(index)}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Character Analysis */}
            {currentChar && isPlaying && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                currentChar.isVowel 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-gray-500/10 border-gray-500/30"
              }`}>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Current Character Analysis</div>
                  <div className="text-xl font-mono">
                    <span className="text-yellow-400">'{currentChar.char}'</span>
                    <span className="text-gray-400 mx-3">at position [{currentChar.index}]</span>
                    <span className={currentChar.isVowel ? "text-green-400" : "text-gray-400"}>
                      {currentChar.isVowel ? "→ VOWEL ✓" : "→ Consonant"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Vowel Counter Display */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Current Position</div>
                  <div className="text-2xl font-mono text-yellow-400">
                    {isPlaying || isComplete ? `${currentIndex + 1}/${chars.length}` : "0/0"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Vowels Found</div>
                  <div className={`text-3xl font-mono transition-colors ${
                    isComplete ? "text-green-400 font-bold" : "text-purple-400"
                  }`}>
                    {vowelCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Progress</div>
                  <div className="text-2xl font-mono text-blue-400">
                    {chars.length > 0 ? Math.round(((currentIndex + (isComplete ? 1 : 0)) / chars.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-green-400 animate-pulse">
                  <CheckCircle className="h-8 w-8" />
                  Found {vowelCount} vowel{vowelCount !== 1 ? 's' : ''} in "{inputString}"!
                </div>
              ) : isPlaying ? (
                <div className="text-lg text-yellow-400">
                  Analyzing character at position {currentIndex}...
                </div>
              ) : (
                <div className="text-gray-400">
                  Click "Start Animation" to count vowels in the string
                </div>
              )}
            </div>
          </div>

          {/* Vowel History */}
          {vowelHistory.length > 0 && (
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Vowel Detection History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {vowelHistory.map((vowel, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-green-500/10 border-green-500/30">
                    <div className="text-sm font-mono flex items-center justify-between">
                      <span>
                        Step {vowel.step}: 
                        <span className="text-yellow-400"> [{vowel.index}]='{vowel.char}' </span>
                        <span className="text-green-400">→ VOWEL FOUND</span>
                      </span>
                      <span className="text-green-400">Total: {vowel.count}</span>
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
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Code className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="font-bold text-white">GfG</div>
                  <div className="text-sm text-gray-400">Count Vowels</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-blue-400">int countVowels(string s) {'{'}</div>
              <div className={`text-green-400 ml-4 ${isPlaying ? "bg-green-500/20 px-2 rounded" : ""}`}>
                int count = 0;
              </div>
              <div className="text-green-400 ml-4 mt-2">for (int i = 0; i {'<'} s.length(); i++) {'{'}</div>
              <div className={`text-yellow-400 ml-8 ${isPlaying ? "bg-yellow-500/20 px-2 rounded" : ""}`}>
                char c = tolower(s[i]);
              </div>
              <div className={`text-cyan-400 ml-8 ${isPlaying ? "bg-cyan-500/20 px-2 rounded" : ""}`}>
                if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {'{'}
              </div>
              <div className={`text-purple-400 ml-12 ${isPlaying ? "bg-purple-500/20 px-2 rounded" : ""}`}>
                count++;
              </div>
              <div className="text-cyan-400 ml-8">{'}'}</div>
              <div className="text-green-400 ml-4">{'}'}</div>
              <div className={`text-green-400 ml-4 mt-2 ${isComplete ? "bg-green-500/20 px-2 rounded" : ""}`}>
                return count;
              </div>
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
                  <div className="text-sm text-gray-400">O(n) - Single pass through string</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Space Complexity</div>
                  <div className="text-sm text-gray-400">O(1) - Only using counter variable</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Approach</div>
                  <div className="text-sm text-gray-400">Linear Traversal - Check each character once</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span>Initialize vowel counter to 0</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span>Iterate through each character in the string</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span>Convert character to lowercase for case-insensitive check</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold">4.</span>
                <span>Check if character is a vowel (a, e, i, o, u)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold">5.</span>
                <span>If vowel found, increment counter</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold">6.</span>
                <span>Return total vowel count</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Key Points</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Case-insensitive vowel detection</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Single pass algorithm - optimal time complexity</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Constant space usage - only one counter variable</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Works with any string length and character set</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Handles both uppercase and lowercase vowels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountVowels;
