import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "string reverseWords(string s) {",
  2: "    vector<string> words;",
  3: "    stringstream ss(s);",
  4: "    string word;",
  5: "    while (ss >> word) {",
  6: "        words.push_back(word);",
  7: "    }",
  8: "    reverse(words.begin(), words.end());",
  9: "    string result = \"\";",
  10: "    for (int i = 0; i < words.size(); i++) {",
  11: "        result += words[i];",
  12: "        if (i != words.size() - 1) result += \" \";",
  13: "    }",
  14: "    return result;",
  15: "}"
};

const generateHistory = (s) => {
  const newHistory = [];
  const addState = (props) =>
    newHistory.push({
      words: [],
      currentWord: null,
      reversedWords: [],
      result: null,
      line: null,
      explanation: "",
      phase: null,
      ...props,
    });

  // Line 2: vector<string> words;
  addState({
    line: 2,
    phase: "init",
    explanation: "Initialize an empty vector of strings to hold the extracted words.",
    words: [],
  });

  const words = s.trim().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    // Line 5: while (ss >> word)
    addState({
      line: 5,
      phase: "extracting",
      currentWord: words[i],
      words: words.slice(0, i),
      explanation: `Read next word from stringstream: "${words[i]}".`,
    });

    // Line 6: words.push_back(word)
    addState({
      line: 6,
      phase: "extracting",
      currentWord: words[i],
      words: words.slice(0, i + 1),
      explanation: `Push word "${words[i]}" into the words vector.`,
    });
  }

  // Line 8: reverse(words.begin(), words.end());
  addState({
    line: 8,
    phase: "reversing",
    words: [...words],
    explanation: "Reverse the vector of words in-place using two-pointer swapping under the hood.",
  });

  const reversedWords = [...words].reverse();
  
  addState({
    line: 8,
    phase: "reversed",
    words: [...words],
    reversedWords: [...reversedWords],
    explanation: `Words vector reversed successfully: [${reversedWords.map(w => `"${w}"`).join(", ")}].`,
  });

  // Line 9: string result = "";
  addState({
    line: 9,
    phase: "building",
    reversedWords: [...reversedWords],
    explanation: "Initialize an empty result string.",
    result: "",
  });

  let currentBuilt = "";
  for (let i = 0; i < reversedWords.length; i++) {
    // Line 10: loop check
    addState({
      line: 10,
      phase: "building",
      reversedWords: [...reversedWords],
      explanation: `Loop condition check: index i = ${i} < words.size() (${reversedWords.length}).`,
      result: currentBuilt,
    });

    // Line 11: result += words[i]
    currentBuilt += reversedWords[i];
    addState({
      line: 11,
      phase: "building",
      reversedWords: [...reversedWords],
      explanation: `Append word "${reversedWords[i]}" to the result string.`,
      result: currentBuilt,
    });

    if (i !== reversedWords.length - 1) {
      // Line 12: result += " "
      currentBuilt += " ";
      addState({
        line: 12,
        phase: "building",
        reversedWords: [...reversedWords],
        explanation: "Append space separator since this is not the last word.",
        result: currentBuilt,
      });
    }
  }

  // Line 14: return result;
  addState({
    line: 14,
    phase: "complete",
    reversedWords: [...reversedWords],
    result: currentBuilt,
    explanation: `All words joined. Return final reversed sentence: "${currentBuilt}".`,
  });

  return newHistory;
};

const ReverseWordsVisualizer = ({ navigate }) => {
  const [stringInput, setStringInput] = useState("the sky is blue");
  const [loadedString, setLoadedString] = useState("the sky is blue");
  const visualizerState = useVisualizer({ defaultSpeed: 950 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    const s = stringInput.trim();
    if (!s) return;
    setLoadedString(s);
    visualizerState.load(generateHistory(s));
  };

  const loadExamples = (example) => {
    const examples = {
      ex1: "the sky is blue",
      ex2: "  hello world  ",
      ex3: "a good   example",
      ex4: "SingleWord"
    };
    const val = examples[example];
    setStringInput(val);
    setLoadedString(val);
    visualizerState.load(generateHistory(val));
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    words = [],
    currentWord = null,
    reversedWords = [],
    result = null,
    phase = null
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={stringInput}
          onChange={(e) => setStringInput(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-orange-500 focus:outline-none w-72"
          placeholder="Enter sentence..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("ex1")} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-xs hover:bg-orange-500/20 transition-all cursor-pointer">sky is blue</button>
        <button onClick={() => loadExamples("ex2")} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-xs hover:bg-orange-500/20 transition-all cursor-pointer">spaces</button>
        <button onClick={() => loadExamples("ex3")} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-xs hover:bg-orange-500/20 transition-all cursor-pointer">multi spaces</button>
        <button onClick={() => loadExamples("ex4")} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-xs hover:bg-orange-500/20 transition-all cursor-pointer">single word</button>
      </div>
    </div>
  );

  const statsSection = (
    <>
      {/* Variables Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Variables</h3>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">currentWord:</div>
            <div className="text-lg font-mono text-orange-400">
              {currentWord ? `"${currentWord}"` : "None"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Phase:</div>
            <div className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              {phase || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Vector Details */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">State Sizes</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Words Vector:</span>
            <span className="text-blue-400 font-mono font-semibold">{words.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Reversed Vector:</span>
            <span className="text-green-400 font-mono font-semibold">{reversedWords.length}</span>
          </div>
        </div>
      </div>

      {/* Complexity & Details Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Complexity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-green-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Time Complexity</div>
              <div className="text-gray-400">O(n) - Linear scan & join</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(n) - To hold words copy</div>
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
            <Hash className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Problems
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="Reverse Words"
        description="Reverse the order of words in a sentence."
        isLoaded={isLoaded}
        inputSection={inputSection}
        codeContent={codeContent}
        activeLine={currentState.line || 0}
        message={currentState.explanation || ""}
        visualizerState={visualizerState}
        statsSection={statsSection}
      >
        {/* Children: String visualization content */}
        <div className="flex flex-col w-full gap-6">
          {/* Loaded sentence info */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Original Sentence</h4>
            <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 font-mono text-lg text-white">
              "{loadedString}"
            </div>
          </div>

          {currentWord && (
            <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60 animate-pulse">
              <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Current Word</h4>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg font-mono text-2xl text-orange-400 text-center font-bold">
                "{currentWord}"
              </div>
            </div>
          )}

          {words && words.length > 0 && (
            <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
              <h4 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Extracted Words (vector)</h4>
              <div className="flex gap-2 flex-wrap animate-fade-in-up">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-blue-700/20 border border-blue-600/40 rounded-lg font-mono text-blue-300"
                  >
                    <span className="text-xs text-gray-500 mr-1.5">[{idx}]</span>
                    {word}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reversedWords && reversedWords.length > 0 && (
            <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
              <h4 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Reversed Words (vector)</h4>
              <div className="flex gap-2 flex-wrap animate-fade-in-up">
                {reversedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-green-700/20 border border-green-600/40 rounded-lg font-mono text-green-300"
                  >
                    <span className="text-xs text-gray-500 mr-1.5">[{idx}]</span>
                    {word}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result !== null && (
            <div className="p-4 bg-gradient-to-r from-orange-950/30 to-red-950/30 rounded-xl border border-orange-500/30 animate-fade-in-up">
              <h4 className="text-orange-400 font-semibold mb-2 text-xs uppercase tracking-wide">Result String</h4>
              <div className="font-mono text-2xl text-white">"{result}"</div>
            </div>
          )}
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default ReverseWordsVisualizer;