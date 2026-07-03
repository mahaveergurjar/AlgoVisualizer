import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const SmallestLetter = ({ navigate }) => {
  const [lettersInput, setLettersInput] = useState("c, f, j, k, m, p, r, t, v, x, z");
  const [targetInput, setTargetInput] = useState("k");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((localLetters, localTarget) => {
    const newHistory = [];
    let stepCount = 0;
    let result = null;
    let comparisons = 0;
    let checks = 0;

    const addState = (index = -1, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        letters: [...localLetters],
        target: localTarget,
        currentIndex: index,
        result,
        step: stepCount++,
        explanation,
        line,
        comparisons,
        checks,
        ...extraProps,
      });
    };

    // Initial setup
    addState(-1, "Starting search for smallest letter greater than target", 4);
    addState(-1, `Target letter: '${localTarget}'`, 4);
    addState(-1, "Starting linear scan through the sorted letters array...", 6);

    // Main loop
    for (let i = 0; i < localLetters.length; i++) {
      checks++;
      const currentChar = localLetters[i];
      addState(i, `Checking letter at index ${i}: '${currentChar}'`, 6);

      comparisons++;
      addState(i, `Comparing '${currentChar}' with target '${localTarget}'`, 8);

      if (currentChar > localTarget) {
        result = currentChar;
        addState(i, `Found letter '${currentChar}' that is greater than '${localTarget}'`, 9, { isMatch: true });
        break;
      } else {
        addState(i, `'${currentChar}' is not greater than '${localTarget}', moving to next letter`, 8);
      }
    }

    // Wrap‑around case
    if (result === null) {
      result = localLetters[0];
      addState(localLetters.length - 1, `No letter found greater than '${localTarget}'`, 12);
      addState(localLetters.length - 1, `Wrapping around to first letter: '${result}'`, 13, { isComplete: true });
    } else {
      addState(newHistory[newHistory.length - 1].currentIndex, `RESULT: '${result}' is the smallest letter greater than '${localTarget}'`, 9, { isComplete: true });
    }

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const localLetters = lettersInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "")
      .map(s => s.charAt(0));
    const localTarget = targetInput.trim().charAt(0);

    if (localLetters.some(ch => !ch.match(/[a-z]/i)) || !localTarget.match(/[a-z]/i)) {
      alert("Invalid input. Please use comma‑separated letters (a‑z) and a single letter target.");
      return;
    }
    generateHistory(localLetters, localTarget);
  };

  const generateRandomLetters = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const length = Math.floor(Math.random() * 4) + 6;
    const letters = [];
    while (letters.length < length) {
      const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!letters.includes(rand)) letters.push(rand);
    }
    letters.sort();
    const targetIdx = Math.floor(Math.random() * (letters.length - 1));
    const target = letters[targetIdx];
    setLettersInput(letters.join(", "));
    setTargetInput(target);
    generateHistory(letters, target);
  };

  const {
    letters = [],
    target = "",
    currentIndex = -1,
    result = null,
    line = 4,
    explanation = "",
    checks = 0,
  } = currentState;

  const codeContent = {
    1: "char nextGreatestLetter(vector<char> & letters, char target) {",
    2: "    int n = letters.size();",
    3: "    // Search for next greatest letter",
    4: "    for (int i = 0; i < n; i++) {",
    5: "        // Check if current letter is greater",
    6: "        if (letters[i] > target) {",
    7: "            return letters[i];",
    8: "        }",
    9: "    }",
    10: "    // Wrap‑around case",
    11: "    return letters[0];",
    12: "}",
  };

  const getCellColor = (index, char) => {
    if (index === currentIndex) {
      return char > target
        ? "bg-green-500/30 border-green-400 text-white shadow-lg shadow-green-500/20 scale-110"
        : "bg-blue-500/30 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-110";
    }
    if (index < currentIndex) {
      return char === result && char > target
        ? "bg-green-500/25 border-green-500/50 text-white"
        : "bg-gray-800/40 border-gray-700 text-gray-500";
    }
    return "bg-gray-950 border-gray-700 text-gray-300";
  };

  const getComparisonSymbol = (char) => {
    if (char === target) return "=";
    if (char > target) return ">";
    return "<";
  };

  const getComparisonColor = (char) => {
    if (char === target) return "text-yellow-400";
    if (char > target) return "text-green-400";
    return "text-red-400";
  };

  const inputSection = (
    <>
      <input
        id="letters-input"
        type="text"
        value={lettersInput}
        onChange={e => setLettersInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-green-500 font-mono shadow-sm"
        placeholder="Enter sorted letters separated by commas..."
      />
      <input
        id="target-input"
        type="text"
        value={targetInput}
        onChange={e => setTargetInput(e.target.value)}
        disabled={isLoaded}
        maxLength={1}
        className="w-full md:w-24 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-green-500 font-mono shadow-sm text-center"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load &amp; Visualize
        </button>
      )}
      <button
        onClick={generateRandomLetters}
        className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl font-bold transition-all text-white shadow-lg cursor-pointer"
      >
        Random
      </button>
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-400 select-none">
          Target Letter
        </h4>
        <div className="text-3xl font-mono text-green-400 font-bold">'{target}'</div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Checks
        </h4>
        <div className="text-3xl font-mono text-blue-300">{checks}</div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Result
        </h4>
        <div className="text-3xl font-mono text-purple-300 font-bold">{result ? `'${result}'` : "..."}</div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Worst case scans all elements or wraps around.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - Constant extra space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Smallest Letter Greater Than Target"
      description="Find the smallest character in a sorted list that is lexicographically greater than the target character. Wraps around if none found."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter sorted letters and target letter, then click Load &amp; Visualize to begin."
    >
      <div className="w-full space-y-6">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Searching Algorithms
          </button>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          {letters.map((char, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-xs font-mono text-gray-500">[{index}]</div>
              <div
                className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 ${getCellColor(index, char)} relative`}
              >
                {char}
                {index === currentIndex && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900 animate-ping">
                    !
                  </div>
                )}
              </div>
              <div className="min-h-[1.5rem] flex flex-col items-center">
                {index === currentIndex && (
                  <div className={`text-sm font-bold ${getComparisonColor(char)}`}>
                    {getComparisonSymbol(char)} '{target}'
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SmallestLetter;