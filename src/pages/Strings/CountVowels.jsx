import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Play, RotateCcw, Code, Zap, Clock, Cpu, CheckCircle, XCircle, Volume2, SkipBack, SkipForward, Pause, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("C++");
  const [explanation, setExplanation] = useState("");
  const [output, setOutput] = useState({ bestValue: 0, chosenItems: [] });

  // Code implementations for different languages
  const codeImplementations = {
    "C++": {
      lines: [
        "int countVowels(string s) {",
        "\tint count = 0;",
        "\tfor (int i = 0; i < s.length(); i++) {",
        "\t\tchar c = tolower(s[i]);",
        "\t\tif (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {",
        "\t\t\tcount++;",
        "\t\t}",
        "\t}",
        "\treturn count;",
        "}"
      ],
      activeLineMap: { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }
    },
    "Java": {
      lines: [
        "public int countVowels(String s) {",
        "\tint count = 0;",
        "\tfor (int i = 0; i < s.length(); i++) {",
        "\t\tchar c = Character.toLowerCase(s.charAt(i));",
        "\t\tif (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {",
        "\t\t\tcount++;",
        "\t\t}",
        "\t}",
        "\treturn count;",
        "}"
      ],
      activeLineMap: { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }
    },
    "Python": {
      lines: [
        "def count_vowels(s):",
        "\tcount = 0",
        "\tfor char in s.lower():",
        "\t\tif char in 'aeiou':",
        "\t\t\tcount += 1",
        "\treturn count"
      ],
      activeLineMap: { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
    }
  };

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
    setCurrentStep(0);
    setTotalSteps(charArray.length);
    setActiveLine(0);
    setExplanation("Initialize vowel counter to 0");
    setOutput({ bestValue: 0, chosenItems: [] });
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (currentIndex < chars.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentStep(prev => prev - 1);
    }
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

        // Update active line based on current step
        if (currentIndex === 0) {
          setActiveLine(2); // Initialize counter
          setExplanation("Initialize vowel counter to 0");
        } else {
          setActiveLine(3); // For loop
          setExplanation(`Check character '${char}' at position ${currentIndex}`);
        }

        if (isVowel) {
          const newCount = vowelCount + 1;
          setVowelCount(newCount);
          setVowelPositions(prev => {
            // Only add if not already present to avoid duplicates
            if (!prev.includes(currentIndex)) {
              return [...prev, currentIndex];
            }
            return prev;
          });
          setActiveLine(4); // Vowel check
          setExplanation(`Character '${char}' is a vowel! Incrementing counter to ${newCount}`);
          
          setVowelHistory(prev => [...prev, {
            char: char,
            index: currentIndex,
            count: newCount,
            step: prev.length + 1
          }]);
        } else {
          setActiveLine(3); // Continue loop
          setExplanation(`Character '${char}' is not a vowel. Continue to next character.`);
        }

        setOutput({
          bestValue: vowelCount + (isVowel ? 1 : 0),
          chosenItems: vowelPositions.map(pos => ({ char: chars[pos], index: pos }))
        });

        if (currentIndex === chars.length - 1) {
          setIsPlaying(false);
          setIsComplete(true);
          setCurrentChar(null);
          setActiveLine(6); // Return statement
          setExplanation(`Algorithm complete! Found ${vowelCount + (isVowel ? 1 : 0)} vowels total.`);
        } else {
          setCurrentIndex(prev => prev + 1);
          setCurrentStep(prev => prev + 1);
        }
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, chars, isComplete, speed, vowelCount, vowelPositions]);

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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
        <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Problems
          </button>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Algorithms
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Title Area */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-4">
            Count Vowels Visualizer
          </h1>
          <p className="text-gray-400 text-lg">
            Visualize the linear traversal algorithm for counting vowels
          </p>
        </div>

        {/* Input and Controls Section */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Enter string..."
              />
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={isPlaying ? pauseAnimation : startAnimation}
                  className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep >= totalSteps}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm font-mono text-gray-400">
                {currentStep}/{totalSteps}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm">Speed:</label>
                <input
                  type="range"
                  min="250"
                  max="2000"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <button
                onClick={resetAnimation}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Example Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'example1', label: 'Hello World', color: 'purple' },
              { key: 'example2', label: 'Algorithm', color: 'indigo' },
              { key: 'example3', label: 'Programming', color: 'cyan' },
              { key: 'example4', label: 'aeiou', color: 'green' },
              { key: 'example5', label: 'bcdfg', color: 'red' },
              { key: 'example6', label: 'Beautiful', color: 'pink' },
              { key: 'example7', label: 'Count Vowels', color: 'orange' },
              { key: 'example8', label: 'Education', color: 'violet' }
            ].map((example) => (
              <button
                key={example.key}
                onClick={() => loadExamples(example.key)}
                className={`px-3 py-1 bg-${example.color}-500/20 border border-${example.color}-500/30 rounded-lg text-${example.color}-400 text-sm hover:bg-${example.color}-500/30 transition-all`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area - 30% Code Left, 70% Three Rows Right */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - Code Only (30%) */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 h-full">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-bold text-white">Code</h3>
                <div className="flex gap-1">
                  {['C++', 'Python', 'Java'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        selectedLanguage === lang
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="text-gray-500 text-xs mb-3">
                  {selectedLanguage === "C++" && "// Count Vowels Algorithm"}
                  {selectedLanguage === "Java" && "// Count Vowels Algorithm"}
                  {selectedLanguage === "Python" && "# Count Vowels Algorithm"}
                </div>
                <div className="space-y-0.5">
                  {codeImplementations[selectedLanguage].lines.map((line, index) => {
                    const lineNumber = index + 1;
                    const isActive = activeLine === lineNumber;
                    const getColorClass = (line, index) => {
                      if (selectedLanguage === "Python") {
                        if (line.includes("def ")) return "text-blue-400";
                        if (line.includes("count = 0")) return "text-green-400";
                        if (line.includes("for ")) return "text-green-400";
                        if (line.includes("char in")) return "text-yellow-400";
                        if (line.includes("if char in")) return "text-cyan-400";
                        if (line.includes("count +=")) return "text-purple-400";
                        if (line.includes("return")) return "text-green-400";
                        return "text-white";
                      } else {
                        if (line.includes("int countVowels") || line.includes("public int countVowels")) return "text-blue-400";
                        if (line.includes("int count = 0")) return "text-green-400";
                        if (line.includes("for (")) return "text-green-400";
                        if (line.includes("char c =") || line.includes("Character.toLowerCase")) return "text-yellow-400";
                        if (line.includes("if (c ==")) return "text-cyan-400";
                        if (line.includes("count++")) return "text-purple-400";
                        if (line.includes("return count")) return "text-green-400";
                        if (line.includes("}")) return "text-blue-400";
                        return "text-white";
                      }
                    };
                    
                    return (
                      <div
                        key={index}
                        className={`${isActive ? "bg-green-500/20 px-2 py-1 rounded" : "px-2 py-1"} whitespace-pre`}
                      >
                        <span className={`${getColorClass(line, index)}`}>
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                <div>Current active line highlighted in green.</div>
                <div>Lines map to steps in the algorithm.</div>
                <div>Tip: Use ← or → keys to navigate, Space to play/pause.</div>
              </div>
            </div>
          </div>

          {/* Right Column - Three Rows (70%) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Row 1: Characters and Data Structures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Characters Panel */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Characters (C/V)</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {chars.map((char, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${getCharColor(index)}`}
                    >
                      <span className="text-white font-bold text-sm font-mono">{char}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <div>Active character: {currentChar ? `'${currentChar.char}'` : '-'}</div>
                  <div>Vowel positions: [{vowelPositions.join(', ')}]</div>
                </div>
              </div>

              {/* Data Structures Panel */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Data Structures</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Vowel Counter:</div>
                    <div className="text-2xl font-mono text-purple-400">{vowelCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Current Position:</div>
                    <div className="text-lg font-mono text-yellow-400">{currentIndex + 1}/{chars.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Progress:</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${chars.length > 0 ? ((currentIndex + 1) / chars.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Explanation */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Explanation</h3>
              <div className="text-sm text-gray-300 leading-relaxed">
                {explanation || "Click play to start the algorithm visualization"}
              </div>
            </div>

            {/* Row 3: Output and Complexity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Output Panel */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Output</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vowels Found:</span>
                    <span className="text-green-400 font-mono text-lg">{vowelCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Characters:</span>
                    <span className="text-white font-mono">{chars.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vowel Percentage:</span>
                    <span className="text-blue-400 font-mono">
                      {chars.length > 0 ? Math.round((vowelCount / chars.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Complexity & Notes Panel */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Complexity & Notes</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Zap className="h-4 w-4 text-green-400 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Time Complexity</div>
                      <div className="text-gray-400">O(n) - Single pass through string</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Space Complexity</div>
                      <div className="text-gray-400">O(1) - Only using counter variable</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-purple-400 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Approach</div>
                      <div className="text-gray-400">Linear Traversal - Check each character once</div>
                    </div>
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

export default CountVowels;
