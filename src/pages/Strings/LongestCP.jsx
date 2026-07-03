import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "string longestCommonPrefix(vector<string>& strs) {",
  2: "    if (strs.empty()) return \"\";",
  3: "    string prefix = strs[0];",
  4: "    for (int i = 1; i < strs.size(); i++) {",
  5: "        while (strs[i].find(prefix) != 0) {",
  6: "            prefix = prefix.substr(0, prefix.length() - 1);",
  7: "            if (prefix.empty()) return \"\";",
  8: "        }",
  9: "    }",
  10: "    return prefix;",
  11: "}"
};

const generateHistory = (strs) => {
  const newHistory = [];
  const addState = (props) =>
    newHistory.push({
      prefix: "",
      currentStringIndex: null,
      currentString: null,
      line: null,
      explanation: "",
      finalResult: null,
      ...props,
    });

  if (strs.length === 0) {
    addState({
      line: 2,
      explanation: "Array is empty. Return empty string.",
      finalResult: "",
    });
    return newHistory;
  }

  let prefix = strs[0];
  addState({
    line: 3,
    prefix,
    explanation: `Initialize prefix with first string: "${prefix}".`,
  });

  for (let i = 1; i < strs.length; i++) {
    const currentStr = strs[i];
    
    addState({
      line: 4,
      prefix,
      currentStringIndex: i,
      currentString: currentStr,
      explanation: `Compare prefix with string[${i}]: "${currentStr}".`,
    });

    while (!currentStr.startsWith(prefix)) {
      addState({
        line: 5,
        prefix,
        currentStringIndex: i,
        currentString: currentStr,
        explanation: `"${currentStr}" doesn't start with "${prefix}". Need to shorten prefix.`,
      });

      prefix = prefix.slice(0, -1);
      
      addState({
        line: 6,
        prefix,
        currentStringIndex: i,
        currentString: currentStr,
        explanation: `Shortened prefix to: "${prefix}".`,
      });

      if (prefix === "") {
        addState({
          line: 7,
          prefix,
          currentStringIndex: i,
          currentString: currentStr,
          explanation: "Prefix is now empty. No common prefix exists.",
          finalResult: "",
        });
        return newHistory;
      }
    }

    addState({
      line: 5,
      prefix,
      currentStringIndex: i,
      currentString: currentStr,
      explanation: `"${currentStr}" starts with "${prefix}". Continue to next string.`,
    });
  }

  addState({
    line: 10,
    prefix,
    explanation: `All strings checked. Longest common prefix is: "${prefix}".`,
    finalResult: prefix,
  });

  return newHistory;
};

const LongestCommonPrefixVisualizer = ({ navigate }) => {
  const [stringsInput, setStringsInput] = useState("flower,flow,flight");
  const [loadedStrings, setLoadedStrings] = useState(["flower", "flow", "flight"]);
  const visualizerState = useVisualizer({ defaultSpeed: 900 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    const strs = stringsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (strs.length === 0) return;
    setLoadedStrings(strs);
    visualizerState.load(generateHistory(strs));
  };

  const loadExamples = (example) => {
    const examples = {
      ex1: "flower,flow,flight",
      ex2: "dog,racecar,car",
      ex3: "interspecies,interstellar,interstate",
      ex4: "prefix,prefix,prefix"
    };
    const val = examples[example];
    setStringsInput(val);
    const strs = val.split(",").map((s) => s.trim());
    setLoadedStrings(strs);
    visualizerState.load(generateHistory(strs));
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    prefix = "",
    currentStringIndex = null,
    currentString = null,
    finalResult = null
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={stringsInput}
          onChange={(e) => setStringsInput(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none w-80"
          placeholder="Enter strings (comma separated)..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("ex1")} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs hover:bg-blue-500/20 transition-all cursor-pointer">flower,flow,flight</button>
        <button onClick={() => loadExamples("ex2")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">dog,racecar,car</button>
        <button onClick={() => loadExamples("ex3")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">inter...</button>
        <button onClick={() => loadExamples("ex4")} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs hover:bg-purple-500/20 transition-all cursor-pointer">prefix identical</button>
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
            <div className="text-xs text-gray-400 mb-1">prefix:</div>
            <div className="text-lg font-mono text-cyan-300">"{prefix}"</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">i (index):</div>
            <div className="text-lg font-mono text-yellow-400">
              {currentStringIndex !== null ? `${currentStringIndex} ('${currentString}')` : "Initial / Finished"}
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Output</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Final Prefix:</span>
            <span className="text-green-400 font-mono">{finalResult !== null ? `"${finalResult}"` : "Calculating..."}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Strings:</span>
            <span className="text-white font-mono">{loadedStrings.length}</span>
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
              <div className="text-gray-400">O(S) - S sum of characters</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(1) - Constant helper space</div>
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
            <Hash className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Problems
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="Longest Common Prefix"
        description="Find the longest common prefix string among an array of strings."
        isLoaded={isLoaded}
        inputSection={inputSection}
        codeContent={codeContent}
        activeLine={currentState.line || 0}
        message={currentState.explanation || ""}
        visualizerState={visualizerState}
        statsSection={statsSection}
      >
        {/* Children: String visualization content */}
        <div className="flex flex-col gap-6 w-full">
          {/* Input Strings list */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Input Strings</h4>
            <div className="space-y-2">
              {loadedStrings.map((str, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg font-mono text-base border transition-all duration-355 ${
                    currentStringIndex === idx
                      ? "bg-blue-500/20 border-blue-500 text-white font-bold"
                      : "bg-gray-900/50 border-gray-800 text-gray-450"
                  }`}
                >
                  <span className="text-xs text-gray-500 mr-2">[{idx}]</span>
                  {str}
                </div>
              ))}
            </div>
          </div>

          {/* Current Prefix visual state */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Current Prefix</h4>
            <div className="p-4 bg-gray-950 rounded-lg border border-gray-800 font-mono text-3xl text-cyan-300 min-h-[4rem] flex items-center justify-center">
              {prefix !== "" ? `"${prefix}"` : `""`}
            </div>
            {currentString && (
              <div className="mt-3 text-xs text-gray-400 text-center font-mono">
                <strong>Comparing with:</strong>{" "}
                <span className="text-blue-300 font-mono">"{currentString}"</span>
              </div>
            )}
          </div>
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default LongestCommonPrefixVisualizer;