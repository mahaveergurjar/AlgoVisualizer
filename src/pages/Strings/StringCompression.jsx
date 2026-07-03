import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "string compress(string s) {",
  2: "    string result = \"\";",
  3: "    int i = 0;",
  4: "    while (i < s.length()) {",
  5: "        char current = s[i];",
  6: "        int count = 0;",
  7: "        while (i < s.length() && s[i] == current) {",
  8: "            count++;",
  9: "            i++;",
  10: "        }",
  11: "        result += current + to_string(count);",
  12: "    }",
  13: "    return result.length() < s.length() ? result : s;",
  14: "}"
};

const generateHistory = (s) => {
  const newHistory = [];
  const addState = (props) =>
    newHistory.push({
      i: 0,
      currentChar: null,
      count: 0,
      result: "",
      line: null,
      explanation: "",
      finalResult: null,
      highlightIndices: [],
      ...props,
    });

  // Line 2: string result = "";
  addState({
    line: 2,
    explanation: "Initialize empty result string.",
    result: "",
    i: 0,
  });

  // Line 3: int i = 0;
  addState({
    line: 3,
    explanation: "Initialize pointer i = 0.",
    result: "",
    i: 0,
  });

  let i = 0;
  let result = "";

  while (i < s.length) {
    const current = s[i];
    let count = 0;
    // Line 4: while (i < s.length())
    addState({
      line: 4,
      i,
      currentChar: null,
      result,
      explanation: `Check loop: pointer i (${i}) < s.length() (${s.length}) is true.`,
      highlightIndices: [i],
    });

    // Line 5: char current = s[i];
    addState({
      line: 5,
      i,
      currentChar: current,
      result,
      explanation: `Identify character current = '${current}' at index i = ${i}.`,
      highlightIndices: [i],
    });

    // Line 6: int count = 0;
    addState({
      line: 6,
      i,
      currentChar: current,
      count: 0,
      result,
      explanation: `Initialize count = 0 for character '${current}'.`,
      highlightIndices: [i],
    });

    const countIndices = [];
    while (i < s.length && s[i] === current) {
      // Line 7: while (i < s.length() && s[i] == current)
      addState({
        line: 7,
        i,
        currentChar: current,
        count,
        result,
        explanation: `Check condition: index i = ${i} < ${s.length} and s[${i}] ('${s[i]}') == '${current}' is true.`,
        highlightIndices: [...countIndices, i],
      });

      // Line 8: count++;
      count++;
      countIndices.push(i);
      addState({
        line: 8,
        i,
        currentChar: current,
        count,
        result,
        explanation: `Increment count to ${count}.`,
        highlightIndices: [...countIndices],
      });

      // Line 9: i++;
      i++;
      addState({
        line: 9,
        i,
        currentChar: current,
        count,
        result,
        explanation: `Increment pointer i to ${i}.`,
        highlightIndices: [...countIndices],
      });
    }

    // Line 7: while check (failed)
    addState({
      line: 7,
      i,
      currentChar: current,
      count,
      result,
      explanation: i < s.length
        ? `Inner loop check: s[${i}] ('${s[i]}') != '${current}' (inner loop terminates).`
        : `Inner loop check: index i = ${i} reached end of string (inner loop terminates).`,
      highlightIndices: [...countIndices],
    });

    // Line 11: result += current + to_string(count);
    result += current + count;
    addState({
      line: 11,
      i,
      currentChar: current,
      count,
      result,
      explanation: `Append '${current}${count}' to compressed result. Result = "${result}".`,
      highlightIndices: [],
    });
  }

  // Line 4: while (failed)
  addState({
    line: 4,
    i,
    currentChar: null,
    count: 0,
    result,
    explanation: `Loop check: index i = ${i} reached end of string. Outer loop terminates.`,
    highlightIndices: [],
  });

  const finalResult = result.length < s.length ? result : s;
  
  // Line 13: return result.length() < s.length() ? result : s;
  addState({
    line: 13,
    i,
    currentChar: null,
    count: 0,
    result,
    finalResult,
    explanation: `Compressed length (${result.length}) is ${
      result.length < s.length ? "less than" : "not less than"
    } original length (${s.length}). Return "${finalResult}".`,
    highlightIndices: [],
  });

  return newHistory;
};

const StringCompressionVisualizer = ({ navigate }) => {
  const [stringInput, setStringInput] = useState("aaabbbcccaaa");
  const [loadedString, setLoadedString] = useState("aaabbbcccaaa");
  const visualizerState = useVisualizer({ defaultSpeed: 900 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    const s = stringInput.trim();
    if (!s) return;
    setLoadedString(s);
    visualizerState.load(generateHistory(s));
  };

  const loadExamples = (example) => {
    const examples = {
      ex1: "aaabbbcccaaa",
      ex2: "abcd",
      ex3: "aabcccccc",
      ex4: "pqpqpqpq"
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
    i = 0,
    currentChar = null,
    count = 0,
    result = "",
    finalResult = null,
    highlightIndices = []
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={stringInput}
          onChange={(e) => setStringInput(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-purple-500 focus:outline-none w-56"
          placeholder="Enter string..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("ex1")} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs hover:bg-purple-500/20 transition-all cursor-pointer">aaabbbcccaaa</button>
        <button onClick={() => loadExamples("ex2")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">abcd</button>
        <button onClick={() => loadExamples("ex3")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">aabcccccc</button>
        <button onClick={() => loadExamples("ex4")} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs hover:bg-blue-500/20 transition-all cursor-pointer">pqpqpqpq</button>
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
            <div className="text-xs text-gray-400 mb-1">i (index):</div>
            <div className="text-lg font-mono text-purple-400">
              {i < loadedString.length ? `${i} ('${loadedString[i]}')` : `${i} (finished)`}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">current:</div>
            <div className="text-lg font-mono text-cyan-300">
              {currentChar ? `'${currentChar}'` : "None"}
            </div>
          </div>
        </div>
      </div>

      {/* State details */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Current Group</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Character:</span>
            <span className="text-cyan-400 font-mono font-semibold">{currentChar || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Count:</span>
            <span className="text-green-400 font-mono font-semibold">{count}</span>
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
              <div className="text-gray-400">O(n) - Single pass through string</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(n) - For storing result copy</div>
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
              String Problems
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="String Compression"
        description="Compress a string using character counts (e.g., 'aaa' → 'a3')."
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
          {/* Character blocks */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Original String</h4>
            <div className="flex justify-center items-center gap-3 flex-wrap min-h-[80px]">
              {loadedString.split("").map((char, index) => {
                const isPointer = i === index;
                const isHighlighted = highlightIndices.includes(index);
                
                let charColorClass = "bg-gray-800 border-gray-600";
                if (isPointer) {
                  charColorClass = "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25 animate-pulse";
                } else if (isHighlighted) {
                  charColorClass = "bg-indigo-500/25 border-indigo-400 scale-105";
                } else if (index < i) {
                  charColorClass = "bg-gray-705 border-gray-500 opacity-60";
                }

                return (
                  <div key={index} className="flex flex-col items-center gap-1 animate-fade-in-up">
                    <div className="text-gray-400 text-[10px] font-mono">[{index}]</div>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${charColorClass}`}>
                      <span className="text-white font-bold text-lg font-mono">{char}</span>
                    </div>
                    <div className="text-[9px] font-bold h-3">
                      {isPointer && <span className="text-purple-400">i</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Processing display */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Current Character & Count</h4>
            <div className="flex items-center justify-center gap-6 min-h-[40px]">
              {currentChar ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Character:</span>
                    <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/40 rounded font-mono text-base text-indigo-300 font-bold">
                      '{currentChar}'
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Count:</span>
                    <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/40 rounded font-mono text-base text-green-300 font-bold">
                      {count}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-gray-500 italic text-sm">No active character processing</span>
              )}
            </div>
          </div>

          {/* Result string */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Compressed Result</h4>
            <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 font-mono text-xl text-white min-h-[3rem] flex items-center justify-center">
              {result !== "" ? `"${result}"` : '""'}
            </div>
            {finalResult !== null && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 text-center animate-fade-in-up">
                <span className="text-purple-300 font-bold block text-sm mb-1">FINAL OUTPUT</span>
                <span className="font-mono text-2xl text-white">"{finalResult}"</span>
              </div>
            )}
          </div>
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default StringCompressionVisualizer;