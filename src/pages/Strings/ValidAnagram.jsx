import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "bool isAnagram(string s, string t) {",
  2: "    if (s.length() != t.length()) return false;",
  3: "    unordered_map<char, int> count;",
  4: "    for (char c : s) count[c]++;",
  5: "    for (char c : t) {",
  6: "        count[c]--;",
  7: "        if (count[c] < 0) return false;",
  8: "    }",
  9: "    return true;",
  10: "}"
};

const generateHistory = (s1, s2) => {
  const newHistory = [];
  const addState = (props) =>
    newHistory.push({
      charMap: {},
      currentChar: null,
      currentIndex: null,
      phase: null,
      line: null,
      explanation: "",
      isValid: null,
      ...props,
    });

  // Line 2: length check
  if (s1.length !== s2.length) {
    addState({
      line: 2,
      phase: "length-check",
      explanation: `Compare lengths: s length (${s1.length}) != t length (${s2.length}). Return false.`,
      isValid: false,
    });
    return newHistory;
  }

  addState({
    line: 2,
    phase: "length-check",
    explanation: `Compare lengths: s length (${s1.length}) == t length (${s2.length}). Proceed.`,
    isValid: null,
  });

  const charMap = {};
  
  // Line 3: unordered_map<char, int> count;
  addState({
    line: 3,
    phase: "init",
    explanation: "Initialize character frequency map.",
    charMap: { ...charMap },
  });

  for (let i = 0; i < s1.length; i++) {
    const c = s1[i];
    charMap[c] = (charMap[c] || 0) + 1;
    // Line 4: for (char c : s) count[c]++;
    addState({
      line: 4,
      phase: "counting-s1",
      currentChar: c,
      currentIndex: i,
      charMap: { ...charMap },
      explanation: `Read s[${i}] = '${c}'. Increment count['${c}'] to ${charMap[c]}.`,
    });
  }

  for (let i = 0; i < s2.length; i++) {
    const c = s2[i];
    
    // Line 5: for (char c : t)
    addState({
      line: 5,
      phase: "counting-s2",
      currentChar: c,
      currentIndex: i,
      charMap: { ...charMap },
      explanation: `Loop iteration: examine character t[${i}] = '${c}'.`,
    });

    const oldCount = charMap[c] || 0;
    charMap[c] = oldCount - 1;
    // Line 6: count[c]--;
    addState({
      line: 6,
      phase: "counting-s2",
      currentChar: c,
      currentIndex: i,
      charMap: { ...charMap },
      explanation: `Decrement count['${c}'] to ${charMap[c]}.`,
    });

    // Line 7: if (count[c] < 0)
    addState({
      line: 7,
      phase: "counting-s2",
      currentChar: c,
      currentIndex: i,
      charMap: { ...charMap },
      explanation: `Check if count['${c}'] (${charMap[c]}) < 0.`,
    });

    if (charMap[c] < 0) {
      // Return false
      addState({
        line: 7,
        phase: "invalid",
        currentChar: c,
        currentIndex: i,
        charMap: { ...charMap },
        explanation: `count['${c}'] is negative! string t has more '${c}' than string s. Return false.`,
        isValid: false,
      });
      return newHistory;
    }
  }

  // Line 9: return true;
  addState({
    line: 9,
    phase: "valid",
    charMap: { ...charMap },
    explanation: "All character frequencies balanced. The strings are valid anagrams. Return true.",
    isValid: true,
  });

  return newHistory;
};

const ValidAnagramVisualizer = ({ navigate }) => {
  const [string1Input, setString1Input] = useState("anagram");
  const [string2Input, setString2Input] = useState("nagaram");
  const [loadedS1, setLoadedS1] = useState("anagram");
  const [loadedS2, setLoadedS2] = useState("nagaram");
  const visualizerState = useVisualizer({ defaultSpeed: 950 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    const s1 = string1Input.trim().toLowerCase();
    const s2 = string2Input.trim().toLowerCase();
    if (!s1 || !s2) return;
    setLoadedS1(s1);
    setLoadedS2(s2);
    visualizerState.load(generateHistory(s1, s2));
  };

  const loadExamples = (example) => {
    const examples = {
      ex1: { s1: "anagram", s2: "nagaram" },
      ex2: { s1: "rat", s2: "car" },
      ex3: { s1: "awesome", s2: "asewome" },
      ex4: { s1: "ab", s2: "a" }
    };
    const eg = examples[example];
    setString1Input(eg.s1);
    setString2Input(eg.s2);
    setLoadedS1(eg.s1);
    setLoadedS2(eg.s2);
    visualizerState.load(generateHistory(eg.s1, eg.s2));
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    charMap = {},
    currentChar = null,
    currentIndex = null,
    phase = null,
    isValid = null
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={string1Input}
          onChange={(e) => setString1Input(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none w-32"
          placeholder="First string s..."
        />
        <input
          type="text"
          value={string2Input}
          onChange={(e) => setString2Input(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none w-32"
          placeholder="Second string t..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("ex1")} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 text-xs hover:bg-indigo-500/20 transition-all cursor-pointer">anagram / nagaram</button>
        <button onClick={() => loadExamples("ex2")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">rat / car</button>
        <button onClick={() => loadExamples("ex3")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">awesome / asewome</button>
        <button onClick={() => loadExamples("ex4")} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs hover:bg-purple-500/20 transition-all cursor-pointer">diff lengths</button>
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
            <div className="text-xs text-gray-400 mb-1">currentChar:</div>
            <div className="text-lg font-mono text-cyan-300">
              {currentChar ? `'${currentChar}'` : "None"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">currentIndex:</div>
            <div className="text-lg font-mono text-yellow-400">
              {currentIndex !== null ? currentIndex : "None"}
            </div>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Anagram Result</h3>
        <div className="h-full flex flex-col justify-center">
          {isValid === true && (
            <div className="text-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 font-bold text-xl animate-pulse">
              VALID ANAGRAM
            </div>
          )}
          {isValid === false && (
            <div className="text-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold text-xl animate-pulse">
              INVALID ANAGRAM
            </div>
          )}
          {isValid === null && (
            <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 font-bold text-lg">
              Checking...
            </div>
          )}
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
              <div className="text-gray-400">O(n) - Traverses s & t once</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(k) - Max alphabet size</div>
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
            <Hash className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Problems
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="Valid Anagram"
        description="Check if two strings are anagrams using character frequencies."
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
          {/* Traversal display */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Strings Traversal</h4>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1 font-mono">s (string 1):</div>
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                  {loadedS1.split("").map((c, idx) => {
                    const isActive = phase === "counting-s1" && currentIndex === idx;
                    const isProcessed = (phase === "counting-s1" && idx < currentIndex) || phase === "counting-s2" || phase === "valid";
                    
                    let cls = "bg-gray-800 border-gray-600";
                    if (isActive) cls = "bg-indigo-500/30 border-indigo-400 scale-110 shadow-lg shadow-indigo-500/25 animate-pulse";
                    else if (isProcessed) cls = "bg-gray-700 border-gray-500 opacity-60";
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 animate-fade-in-up">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${cls}`}>
                          <span className="text-white font-bold text-sm font-mono">{c}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 font-mono font-bold">t (string 2):</div>
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                  {loadedS2.split("").map((c, idx) => {
                    const isActive = phase === "counting-s2" && currentIndex === idx;
                    const isProcessed = (phase === "counting-s2" && idx < currentIndex) || phase === "valid";
                    
                    let cls = "bg-gray-800 border-gray-600";
                    if (isActive) cls = "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25 animate-pulse";
                    else if (isProcessed) cls = "bg-gray-700 border-gray-500 opacity-60";
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 animate-fade-in-up">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${cls}`}>
                          <span className="text-white font-bold text-sm font-mono">{c}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-mono">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Map display */}
          <div className="p-4 bg-gray-950/45 rounded-xl border border-gray-800/60">
            <h4 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wide">Character Frequency Map (count)</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Object.keys(charMap).length > 0 ? (
                Object.entries(charMap).map(([char, count]) => {
                  const isActive = char === currentChar;
                  
                  let blockClass = "bg-gray-950 border-gray-800";
                  if (isActive) {
                    blockClass = "bg-indigo-500/20 border-indigo-400 scale-105 shadow-md shadow-indigo-500/10";
                  } else if (count === 0) {
                    blockClass = "bg-gray-800 border-gray-700 opacity-80";
                  } else if (count > 0) {
                    blockClass = "bg-green-500/10 border-green-500/40";
                  } else {
                    blockClass = "bg-red-500/10 border-red-500/40";
                  }

                  return (
                    <div key={char} className={`p-2 rounded-lg border transition-all duration-300 ${blockClass}`}>
                      <div className="text-lg font-mono font-bold text-white text-center">{char}</div>
                      <div className={`text-xs text-center font-bold font-mono ${count >= 0 ? "text-cyan-400" : "text-red-400"}`}>{count}</div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-6 text-gray-500 italic text-sm text-center py-2">Map is currently empty</div>
              )}
            </div>
          </div>
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default ValidAnagramVisualizer;