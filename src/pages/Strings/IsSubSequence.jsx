import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu, Clock } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "bool isSubsequence(string s, string t) {",
  2: "    int i = 0;",
  3: "    for (char c : t) {",
  4: "        if (i < (int)s.size() && s[i] == c) {",
  5: "            i++;",
  6: "        }",
  7: "    }",
  8: "    return i == (int)s.size();",
  9: "}"
};

const generateHistory = (s, t) => {
  const steps = [];
  const sChars = s.split('');
  const tChars = t.split('');
  
  let i = 0;
  let matched = [];
  let comparisons = [];
  
  // Step 1: Initialize
  steps.push({
    line: 2,
    ptrS: i,
    ptrT: -1,
    matchedIndices: [...matched],
    currentComparison: null,
    comparisonHistory: [...comparisons],
    isSubseq: null,
    explanation: "Initialize pointer i = 0 (points to the beginning of s)."
  });

  // Loop through t
  for (let j = 0; j < tChars.length; j++) {
    const c = tChars[j];
    
    // Step 2a: loop header
    steps.push({
      line: 3,
      ptrS: i,
      ptrT: j,
      matchedIndices: [...matched],
      currentComparison: null,
      comparisonHistory: [...comparisons],
      isSubseq: null,
      explanation: `Loop iteration: examine character t[${j}] = '${c}'.`
    });

    // Step 2b: condition check
    const sChar = i < sChars.length ? sChars[i] : "";
    const isMatch = i < sChars.length && sChars[i] === c;
    const comparisonObj = {
      sIndex: i,
      tIndex: j,
      sChar,
      tChar: c,
      match: isMatch
    };
    
    steps.push({
      line: 4,
      ptrS: i,
      ptrT: j,
      matchedIndices: [...matched],
      currentComparison: comparisonObj,
      comparisonHistory: [...comparisons],
      isSubseq: null,
      explanation: i < sChars.length 
        ? `Compare s[${i}] ('${sChar}') with t[${j}] ('${c}').`
        : `Pointer i has already matched all characters in s. No further matches needed.`
    });

    if (isMatch) {
      matched.push(j);
      i++;
      comparisons.push(comparisonObj);
      
      // Step 2c: increment i
      steps.push({
        line: 5,
        ptrS: i,
        ptrT: j,
        matchedIndices: [...matched],
        currentComparison: comparisonObj,
        comparisonHistory: [...comparisons],
        isSubseq: null,
        explanation: `Characters match! Increment pointer i to ${i}.`
      });
    } else {
      comparisons.push(comparisonObj);
    }
  }

  // Final step: return i == s.size()
  const isFinalSubseq = (i === sChars.length);
  steps.push({
    line: 8,
    ptrS: i,
    ptrT: tChars.length,
    matchedIndices: [...matched],
    currentComparison: null,
    comparisonHistory: [...comparisons],
    isSubseq: isFinalSubseq,
    explanation: `Return check: i (${i}) == s.size() (${sChars.length}) → ${isFinalSubseq ? "TRUE" : "FALSE"}.`
  });

  return steps;
};

const IsSubsequence = ({ navigate }) => {
  const [sInput, setSInput] = useState("abc");
  const [tInput, setTInput] = useState("ahbgdc");
  const [loadedS, setLoadedS] = useState("abc");
  const [loadedT, setLoadedT] = useState("ahbgdc");
  const visualizerState = useVisualizer({ defaultSpeed: 1000 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    setLoadedS(sInput);
    setLoadedT(tInput);
    visualizerState.load(generateHistory(sInput, tInput));
  };

  const loadExamples = (example) => {
    const examples = {
      ex1: { s: "abc", t: "ahbgdc" },
      ex2: { s: "axc", t: "ahbgdc" },
      ex3: { s: "ace", t: "abcde" },
      ex4: { s: "", t: "anything" }
    };
    const eg = examples[example];
    setSInput(eg.s);
    setTInput(eg.t);
    setLoadedS(eg.s);
    setLoadedT(eg.t);
    visualizerState.load(generateHistory(eg.s, eg.t));
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { 
    ptrS = 0, 
    ptrT = -1, 
    matchedIndices = [], 
    currentComparison = null, 
    comparisonHistory = [] 
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <div>
          <input
            type="text"
            value={sInput}
            onChange={(e) => setSInput(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-green-500 focus:outline-none w-32"
            placeholder="Subsequence s..."
          />
        </div>
        <div>
          <input
            type="text"
            value={tInput}
            onChange={(e) => setTInput(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:border-green-500 focus:outline-none w-44"
            placeholder="Source string t..."
          />
        </div>
        <button
          onClick={handleLoad}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("ex1")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">s='abc', t='ahbgdc'</button>
        <button onClick={() => loadExamples("ex2")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">s='axc', t='ahbgdc'</button>
        <button onClick={() => loadExamples("ex3")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">s='ace', t='abcde'</button>
        <button onClick={() => loadExamples("ex4")} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs hover:bg-purple-500/20 transition-all cursor-pointer">empty s</button>
      </div>
    </div>
  );

  const statsSection = (
    <>
      {/* Pointers Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Pointers</h3>
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-yellow-400 text-xs font-bold mb-1">s Pointer (i)</div>
            <div className="text-white text-lg font-mono">
              {ptrS < loadedS.length ? `[${ptrS}] = '${loadedS[ptrS]}'` : `[${ptrS}] (end of s)`}
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 text-xs font-bold mb-1">t Pointer (j)</div>
            <div className="text-white text-lg font-mono">
              {ptrT >= 0 && ptrT < loadedT.length ? `[${ptrT}] = '${loadedT[ptrT]}'` : ptrT >= loadedT.length ? `[${ptrT}] (end of t)` : "Initial"}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Current Match</h3>
        <div className="h-full flex flex-col justify-center">
          {currentComparison ? (
            <div className={`p-4 rounded-lg border ${
              currentComparison.match
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="text-center font-mono">
                <div className="text-xl">
                  <span className="text-yellow-400">'{currentComparison.sChar || "∅"}'</span>
                  <span className="text-gray-400 mx-2"> vs </span>
                  <span className="text-blue-400">'{currentComparison.tChar}'</span>
                </div>
                <div className="mt-2 text-xs font-semibold">
                  {currentComparison.match ? (
                    <span className="text-green-400">MATCH FOUND</span>
                  ) : (
                    <span className="text-red-400">MISMATCH</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center text-sm font-medium">
              No comparison active
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
              <div className="text-gray-400">O(|t|) - Scan t once</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(1) - Two pointers</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-purple-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Approach</div>
              <div className="text-gray-400">Two Pointers - Scan t, advance s on match</div>
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
            <Hash className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Algorithms
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="Is Subsequence"
        description="Given s and t, determine whether s is a subsequence of t (scan t while advancing pointer in s)."
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
          {/* Scan Visualization */}
          <div className="flex justify-center items-center gap-3 flex-wrap min-h-[120px]">
            {loadedT.split("").map((char, index) => {
              const isMatched = matchedIndices.includes(index);
              const isCurrent = index === ptrT;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      isMatched
                        ? "bg-green-500/20 border-green-400 scale-105 shadow-sm"
                        : isCurrent
                        ? "bg-yellow-500/20 border-yellow-400 scale-110 shadow-lg animate-pulse"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    <span className="text-white font-bold text-xl font-mono">{char}</span>
                  </div>
                  <div className="text-[10px] font-bold h-4">
                    {isMatched && <span className="text-green-400 font-semibold">MATCHED</span>}
                    {!isMatched && isCurrent && <span className="text-yellow-400 font-semibold">SCANNING</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* s visual representation */}
          <div className="flex flex-col items-center p-3 bg-gray-950/45 rounded-xl border border-gray-800/40">
            <span className="text-xs text-gray-400 mb-2 font-mono">s (target subsequence):</span>
            <div className="flex gap-2">
              {loadedS.split("").map((char, index) => {
                const isProcessed = index < ptrS;
                const isCurrent = index === ptrS;
                return (
                  <div
                    key={index}
                    className={`px-3 py-1.5 rounded border ${
                      isProcessed 
                        ? "bg-green-500/10 border-green-500/40 text-green-300"
                        : isCurrent
                        ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-300 scale-105 font-bold"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    } font-mono text-sm`}
                  >
                    {char}
                  </div>
                );
              })}
              {loadedS.length === 0 && <span className="text-gray-500 text-sm font-mono">(empty string)</span>}
            </div>
          </div>
          
          {/* Comparison history */}
          {comparisonHistory.length > 0 && (
            <div className="bg-gray-950/30 rounded-xl p-4 border border-gray-800/60 max-h-40 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Comparison History</h4>
              <div className="space-y-1">
                {comparisonHistory.map((comp, idx) => (
                  <div key={idx} className={`p-2 rounded border text-xs font-mono ${comp.match ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-gray-450"}`}>
                    Step {idx + 1}: compare s[{comp.sIndex}]='{comp.sChar}' with t[{comp.tIndex}]='{comp.tChar}' → {comp.match ? "Match ✓" : "No match ✗"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default IsSubsequence;