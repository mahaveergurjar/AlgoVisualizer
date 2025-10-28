import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Play,
  RotateCcw,
  Code,
  Zap,
  Clock,
  Cpu,
  CheckCircle,
  XCircle
} from "lucide-react";

const IsSubsequence = ({ navigate }) => {
  const [sInput, setSInput] = useState("abc");
  const [tInput, setTInput] = useState("ahbgdc");
  const [chars, setChars] = useState([]);
  const [ptrS, setPtrS] = useState(0);
  const [ptrT, setPtrT] = useState(0);
  const [matchedIndices, setMatchedIndices] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubseq, setIsSubseq] = useState(null);
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [currentComparison, setCurrentComparison] = useState(null);

  const resetAnimation = () => {
    const tChars = tInput.split("");
    setChars(tChars);
    setPtrS(0);
    setPtrT(0);
    setMatchedIndices(new Set());
    setIsPlaying(false);
    setIsComplete(false);
    setIsSubseq(null);
    setComparisonHistory([]);
    setCurrentComparison(null);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
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
    // resetAnimation will be triggered by useEffect on inputs
  };

  useEffect(() => {
    resetAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sInput, tInput]);

  useEffect(() => {
    let interval;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        const s = sInput;
        const t = tInput;
        if (ptrS >= s.length) {
          setIsSubseq(true);
          setIsPlaying(false);
          setIsComplete(true);
          return;
        }
        if (ptrT >= t.length) {
          // reached end of t without matching all of s
          setIsSubseq(ptrS === s.length);
          setIsPlaying(false);
          setIsComplete(true);
          return;
        }

        const match = s[ptrS] === t[ptrT];
        setCurrentComparison({
          sIndex: ptrS,
          tIndex: ptrT,
          sChar: s[ptrS] ?? "",
          tChar: t[ptrT],
          match
        });
        setComparisonHistory((prev) => [
          ...prev,
          {
            sIndex: ptrS,
            tIndex: ptrT,
            sChar: s[ptrS] ?? "",
            tChar: t[ptrT],
            match
          }
        ]);

        if (match) {
          setMatchedIndices((prev) => new Set([...Array.from(prev), ptrT]));
          setPtrS((p) => p + 1);
        }
        setPtrT((p) => p + 1);
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, ptrS, ptrT, sInput, tInput, isComplete, speed]);

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
            <ArrowLeftRight className="h-12 w-12 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
              Is Subsequence
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Given s and t, determine whether s is a subsequence of t (scan t while advancing pointer in s).
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
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
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

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">s (subsequence):</label>
                <input
                  type="text"
                  value={sInput}
                  onChange={(e) => setSInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-mono"
                  placeholder="Enter s..."
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">t (source string):</label>
                <input
                  type="text"
                  value={tInput}
                  onChange={(e) => setTInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-mono"
                  placeholder="Enter t..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => loadExamples("ex1")} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-all">s='abc', t='ahbgdc'</button>
              <button onClick={() => loadExamples("ex2")} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-all">s='axc', t='ahbgdc'</button>
              <button onClick={() => loadExamples("ex3")} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-all">s='ace', t='abcde'</button>
              <button onClick={() => loadExamples("ex4")} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-all">empty s</button>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Scan Visualization</h3>

            <div className="flex justify-center items-center gap-3 mb-8 flex-wrap min-h-[120px]">
              {chars.map((char, index) => {
                const isMatched = matchedIndices.has(index);
                const isCurrent = index === ptrT && isPlaying;
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                    <div
                      className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                        isMatched
                          ? "bg-green-500/20 border-green-400 scale-105 shadow-sm"
                          : isCurrent
                          ? "bg-yellow-500/20 border-yellow-400 scale-110 shadow-lg"
                          : "bg-gray-800 border-gray-600"
                      }`}
                    >
                      <span className="text-white font-bold text-2xl font-mono">{char}</span>
                    </div>
                    <div className="text-xs font-bold">
                      {isMatched && <span className="text-green-400">MATCHED</span>}
                      {!isMatched && isCurrent && <span className="text-yellow-400">SCANNING</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-yellow-400 text-sm font-bold mb-1">s Pointer</div>
                <div className="text-white text-2xl font-mono">
                  {isPlaying || isComplete ? `[${ptrS}] = '${sInput[ptrS] ?? ""}'` : "Not started"}
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 text-sm font-bold mb-1">t Pointer</div>
                <div className="text-white text-2xl font-mono">
                  {isPlaying || isComplete ? `[${ptrT}] = '${tInput[ptrT] ?? ""}'` : "Not started"}
                </div>
              </div>
            </div>

            {currentComparison && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                currentComparison.match
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Current Comparison</div>
                  <div className="text-xl font-mono">
                    <span className="text-yellow-400">'{currentComparison.sChar}'</span>
                    <span className="text-gray-400 mx-3"> vs </span>
                    <span className="text-blue-400">'{currentComparison.tChar}'</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              {isComplete ? (
                isSubseq ? (
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-green-400 animate-pulse">
                    <CheckCircle className="h-8 w-8" />
                    "{sInput}" is a subsequence of "{tInput}"
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold text-red-400 animate-pulse">
                    <XCircle className="h-8 w-8" />
                    "{sInput}" is NOT a subsequence of "{tInput}"
                  </div>
                )
              ) : isPlaying ? (
                <div className="text-lg text-yellow-400">
                  Scanning t at position {ptrT} for s[{ptrS}]...
                </div>
              ) : (
                <div className="text-gray-400">Click "Start Animation" to check subsequence</div>
              )}
            </div>
          </div>

          {comparisonHistory.length > 0 && (
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Comparison History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comparisonHistory.map((comp, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${comp.match ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                    <div className="text-sm font-mono">
                      Step {idx + 1}: compare s[{comp.sIndex}]='{comp.sChar}' with t[{comp.tIndex}]='{comp.tChar}' → {comp.match ? "Match ✓" : "No match ✗"}
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
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Code className="h-5 w-5 text-green-400" />
                <div>
                  <div className="font-bold text-white">All Platforms</div>
                  <div className="text-sm text-gray-400">Is Subsequence</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-blue-400">bool isSubsequence(string s, string t) {'{'}</div>
              <div className="text-green-400 ml-4">int i = 0;</div>
              <div className="text-green-400 ml-4">for (char c : t) {'{'}</div>
              <div className="text-yellow-400 ml-8">if (i &lt; (int)s.size() &amp;&amp; s[i] == c) i++;</div>
              <div className="text-green-400 ml-4">{'}'}</div>
              <div className="text-green-400 ml-4 mt-2">return i == (int)s.size();</div>
              <div className="text-blue-400">{'}'}</div>

              <div className="text-sm text-gray-400 mt-3">/* Follow-up: for many s queries, preprocess t with next pointers (next[index][char]) to answer each query in O(|s|) or faster. */</div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Algorithm Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Time Complexity</div>
                  <div className="text-sm text-gray-400">O(|t|) for single check, O(|s|) with preprocessing per query</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Space Complexity</div>
                  <div className="text-sm text-gray-400">O(1) for two-pointer scan; O(|t|*alphabet) for preprocessing</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Approach</div>
                  <div className="text-sm text-gray-400">Scan t, advance pointer in s on matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsSubsequence;