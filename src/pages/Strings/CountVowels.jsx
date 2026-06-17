import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu, Clock } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "int countVowels(string s) {",
  2: "    int count = 0;",
  3: "    for (int i = 0; i < s.length(); i++) {",
  4: "        char c = tolower(s[i]);",
  5: "        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {",
  6: "            count++;",
  7: "        }",
  8: "    }",
  9: "    return count;",
  10: "}"
};

const generateHistory = (str) => {
  const steps = [];
  const charsArray = str.split('');
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);
  
  // Step 1: Initialize
  let currentCount = 0;
  let positions = [];
  steps.push({
    line: 2,
    currentIndex: -1,
    currentChar: null,
    vowelCount: currentCount,
    vowelPositions: [...positions],
    explanation: "Initialize vowel counter to 0."
  });

  // Loop
  for (let i = 0; i < charsArray.length; i++) {
    const origChar = charsArray[i];
    const char = origChar.toLowerCase();
    const isVowel = vowels.has(char);

    // Step 2a: Loop header
    steps.push({
      line: 3,
      currentIndex: i,
      currentChar: origChar,
      vowelCount: currentCount,
      vowelPositions: [...positions],
      explanation: `Loop check: index i = ${i} < s.length() (${charsArray.length}).`
    });

    // Step 2b: tolower
    steps.push({
      line: 4,
      currentIndex: i,
      currentChar: origChar,
      vowelCount: currentCount,
      vowelPositions: [...positions],
      explanation: `Retrieve character s[${i}] = '${origChar}' and convert to lowercase: '${char}'.`
    });

    // Step 2c: Condition check
    steps.push({
      line: 5,
      currentIndex: i,
      currentChar: origChar,
      vowelCount: currentCount,
      vowelPositions: [...positions],
      explanation: `Check if '${char}' is a vowel (a, e, i, o, u).`
    });

    if (isVowel) {
      currentCount++;
      positions.push(i);
      // Step 2d: Increment count
      steps.push({
        line: 6,
        currentIndex: i,
        currentChar: origChar,
        vowelCount: currentCount,
        vowelPositions: [...positions],
        explanation: `'${origChar}' is a vowel. Increment vowel count to ${currentCount}.`
      });
    }
  }

  // Final loop check (failed condition)
  steps.push({
    line: 3,
    currentIndex: charsArray.length,
    currentChar: null,
    vowelCount: currentCount,
    vowelPositions: [...positions],
    explanation: `Loop terminated: index i = ${charsArray.length} is not less than s.length() (${charsArray.length}).`
  });

  // Step 3: Return count
  steps.push({
    line: 9,
    currentIndex: charsArray.length,
    currentChar: null,
    vowelCount: currentCount,
    vowelPositions: [...positions],
    explanation: `Return the final vowel count of ${currentCount}.`
  });

  return steps;
};

const CountVowels = ({ navigate }) => {
  const [inputString, setInputString] = useState("Hello World");
  const [loadedString, setLoadedString] = useState("Hello World");
  const visualizerState = useVisualizer({ defaultSpeed: 1000 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    if (!inputString.trim()) return;
    setLoadedString(inputString);
    const history = generateHistory(inputString);
    visualizerState.load(history);
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
    const val = examples[example];
    setInputString(val);
    setLoadedString(val);
    visualizerState.load(generateHistory(val));
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadedChars = loadedString.split('');
  const { currentIndex = -1, vowelCount = 0, vowelPositions = [] } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
          placeholder="Enter string..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
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
            className={`px-3 py-1 bg-${example.color}-500/20 border border-${example.color}-500/30 rounded-lg text-${example.color}-400 text-sm hover:bg-${example.color}-500/30 transition-all cursor-pointer`}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );

  const statsSection = (
    <>
      {/* Data Structures Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Variables</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Vowel Counter (count):</div>
            <div className="text-2xl font-mono text-purple-400">{vowelCount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Current Position (i):</div>
            <div className="text-lg font-mono text-yellow-400">
              {currentIndex >= 0 && currentIndex < loadedChars.length ? `${currentIndex} (char: '${loadedChars[currentIndex]}')` : "Finished / Initial"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Progress:</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadedChars.length > 0 ? (Math.max(0, currentIndex + 1) / loadedChars.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Output State</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Vowels Found:</span>
            <span className="text-green-400 font-mono text-lg">{vowelCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Characters:</span>
            <span className="text-white font-mono">{loadedChars.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Vowel Percentage:</span>
            <span className="text-blue-400 font-mono">
              {loadedChars.length > 0 ? Math.round((vowelCount / loadedChars.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Complexity & Notes Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Complexity</h3>
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
    </>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
        <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group cursor-pointer"
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

      <VisualizerLayout
        title="Count Vowels"
        description="Visualize the linear traversal algorithm for counting vowels in a string."
        isLoaded={isLoaded}
        inputSection={inputSection}
        codeContent={codeContent}
        activeLine={currentState.line || 0}
        message={currentState.explanation || ""}
        visualizerState={visualizerState}
        statsSection={statsSection}
      >
        {/* Children: String visualization content */}
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {loadedChars.map((char, index) => {
              const isMatched = vowelPositions.includes(index);
              const isCurrent = index === currentIndex;
              
              let charColorClass = "bg-gray-800 border-gray-600";
              if (isCurrent) {
                charColorClass = "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25 animate-pulse";
              } else if (isMatched) {
                charColorClass = "bg-green-500/20 border-green-400";
              } else if (currentIndex !== -1 && index < currentIndex) {
                charColorClass = "bg-gray-700 border-gray-500 opacity-60";
              }

              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                  <div className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${charColorClass}`}>
                    <span className="text-white font-bold text-lg font-mono">{char}</span>
                  </div>
                  <div className="text-[10px] font-bold h-4">
                    {isCurrent ? (
                      <span className="text-yellow-400">CURRENT</span>
                    ) : isMatched ? (
                      <span className="text-green-400">VOWEL</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-gray-400">
            Vowel positions: [{vowelPositions.join(', ')}]
          </div>
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default CountVowels;
