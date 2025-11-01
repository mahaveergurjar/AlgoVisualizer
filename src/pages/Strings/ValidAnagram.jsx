import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  CheckCircle,
  Clock,
  Hash,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "bool isAnagram(string s, string t) {" },
    { l: 5, t: "    if (s.length() != t.length()) return false;" },
    { l: 6, t: "    unordered_map<char, int> count;" },
    { l: 7, t: "    for (char c : s) count[c]++;" },
    { l: 8, t: "    for (char c : t) {" },
    { l: 9, t: "        count[c]--;" },
    { l: 10, t: "        if (count[c] < 0) return false;" },
    { l: 11, t: "    }" },
    { l: 12, t: "    return true;" },
    { l: 13, t: "}" },
  ],
  Python: [
    { l: 1, t: "def isAnagram(s, t):" },
    { l: 2, t: "    if len(s) != len(t): return False" },
    { l: 3, t: "    count = {}" },
    { l: 4, t: "    for c in s:" },
    { l: 5, t: "        count[c] = count.get(c, 0) + 1" },
    { l: 6, t: "    for c in t:" },
    { l: 7, t: "        count[c] = count.get(c, 0) - 1" },
    { l: 8, t: "        if count[c] < 0: return False" },
    { l: 9, t: "    return True" },
  ],
  Java: [
    { l: 1, t: "public static boolean isAnagram(String s, String t) {" },
    { l: 2, t: "    if (s.length() != t.length()) return false;" },
    { l: 3, t: "    HashMap<Character, Integer> count = new HashMap<>();" },
    { l: 4, t: "    for (char c : s.toCharArray())" },
    { l: 5, t: "        count.put(c, count.getOrDefault(c, 0) + 1);" },
    { l: 6, t: "    for (char c : t.toCharArray()) {" },
    { l: 7, t: "        count.put(c, count.getOrDefault(c, 0) - 1);" },
    { l: 8, t: "        if (count.get(c) < 0) return false;" },
    { l: 9, t: "    }" },
    { l: 10, t: "    return true;" },
    { l: 11, t: "}" },
  ],
};

const ValidAnagramVisualizer = () => {
  const [string1Input, setString1Input] = useState("anagram");
  const [string2Input, setString2Input] = useState("nagaram");
  const [string1, setString1] = useState("");
  const [string2, setString2] = useState("");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const playRef = useRef(null);
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  const generateHistory = useCallback((s1, s2) => {
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

    if (s1.length !== s2.length) {
      addState({
        line: 5,
        phase: "length-check",
        explanation: `Strings have different lengths (${s1.length} vs ${s2.length}). Cannot be anagrams.`,
        isValid: false,
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    addState({
      line: 5,
      phase: "length-check",
      explanation: `Both strings have length ${s1.length}. Continue checking.`,
      isValid: null,
    });

    const charMap = {};
    
    addState({
      line: 6,
      phase: "init",
      explanation: "Initialize character frequency map.",
      charMap: { ...charMap },
    });

    for (let i = 0; i < s1.length; i++) {
      const c = s1[i];
      charMap[c] = (charMap[c] || 0) + 1;
      addState({
        line: 7,
        phase: "counting-s1",
        currentChar: c,
        currentIndex: i,
        charMap: { ...charMap },
        explanation: `Counting '${c}' from string 1. count['${c}'] = ${charMap[c]}`,
      });
    }

    for (let i = 0; i < s2.length; i++) {
      const c = s2[i];
      const oldCount = charMap[c] || 0;
      charMap[c] = oldCount - 1;
      
      addState({
        line: 9,
        phase: "counting-s2",
        currentChar: c,
        currentIndex: i,
        charMap: { ...charMap },
        explanation: `Decrementing '${c}' from string 2. count['${c}'] = ${charMap[c]}`,
      });

      if (charMap[c] < 0) {
        addState({
          line: 10,
          phase: "invalid",
          currentChar: c,
          currentIndex: i,
          charMap: { ...charMap },
          explanation: `count['${c}'] is negative! String 2 has more '${c}' than string 1. Not an anagram.`,
          isValid: false,
        });
        setHistory(newHistory);
        setCurrentStep(0);
        return;
      }
    }

    addState({
      line: 12,
      phase: "valid",
      charMap: { ...charMap },
      explanation: "All characters matched! The strings are anagrams.",
      isValid: true,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const s1 = string1Input.trim().toLowerCase();
    const s2 = string2Input.trim().toLowerCase();
    if (!s1 || !s2) return alert("Both strings must be non-empty.");
    setString1(s1);
    setString2(s2);
    setIsLoaded(true);
    generateHistory(s1, s2);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

  useEffect(() => {
    if (playing) {
      if (currentStep >= history.length - 1) {
        setPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            clearInterval(playRef.current);
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, history.length, currentStep]);

  const charClass = (str, idx, isFirst) => {
    const isActive = state.phase && (isFirst ? state.phase.includes("s1") : state.phase.includes("s2")) && idx === state.currentIndex;
    return `w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-white ${
      isActive ? "bg-indigo-500 shadow-lg ring-2 ring-indigo-400" : "bg-slate-700"
    }`;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-950 min-h-screen text-white">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Valid Anagram
        </h1>
        <p className="text-gray-300 mt-2 text-lg">Check if two strings are anagrams using character frequency</p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={string1Input}
            onChange={(e) => setString1Input(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-indigo-400"
            placeholder="First string"
          />
          <input
            type="text"
            value={string2Input}
            onChange={(e) => setString2Input(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-indigo-400"
            placeholder="Second string"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-indigo-600 disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-indigo-600 transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-indigo-600 disabled:opacity-40 transition"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200">
                {Math.max(0, currentStep + 1)}/{history.length}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Speed</label>
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={50}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  className="w-36"
                />
              </div>

              <button
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeLang === lang
                  ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Hash Map</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter two strings and click <span className="text-indigo-400 font-semibold">Load & Visualize</span>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">{activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) => (
                <div
                  key={line.l}
                  className={`flex font-mono text-sm ${state.line === line.l ? "bg-green-500/10" : ""}`}
                >
                  <div className="w-10 text-right text-gray-500 pr-3">{line.l}</div>
                  <pre className="flex-1 text-gray-200">{line.t}</pre>
                </div>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-3">Strings</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">String 1</div>
                  <div className="flex gap-1 flex-wrap">
                    {string1.split("").map((c, i) => (
                      <div key={i} className={charClass(string1, i, true)}>{c}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">String 2</div>
                  <div className="flex gap-1 flex-wrap">
                    {string2.split("").map((c, i) => (
                      <div key={i} className={charClass(string2, i, false)}>{c}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <Hash size={14} /> Character Frequency Map
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {state.charMap && Object.keys(state.charMap).length > 0 ? (
                  Object.entries(state.charMap).map(([char, count]) => (
                    <div
                      key={char}
                      className={`p-3 rounded-lg border ${
                        char === state.currentChar
                          ? "bg-indigo-500/20 border-indigo-500"
                          : count === 0
                          ? "bg-gray-700/50 border-gray-600"
                          : count > 0
                          ? "bg-green-700/30 border-green-600"
                          : "bg-red-700/30 border-red-600"
                      }`}
                    >
                      <div className="text-lg font-mono text-white text-center">{char}</div>
                      <div className="text-sm text-gray-300 text-center">{count}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-gray-500 italic text-sm">Map is empty</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation}</p>
                <div className="mt-3 text-sm text-gray-400">
                  <div><strong>Phase:</strong> <span className="text-gray-200">{state.phase || "-"}</span></div>
                  {state.currentChar && (
                    <div className="mt-1"><strong>Current char:</strong> <span className="text-gray-200">'{state.currentChar}'</span></div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Result
                </h4>
                {state.isValid === true && (
                  <div className="text-3xl font-mono text-green-400">✓ Valid</div>
                )}
                {state.isValid === false && (
                  <div className="text-3xl font-mono text-red-400">✗ Invalid</div>
                )}
                {state.isValid === null && (
                  <div className="text-2xl font-mono text-gray-400">Checking...</div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(N)</span></div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(1)</span></div>
                <div className="text-xs text-gray-400 mt-2">
                  N = length of strings. Space is O(1) as we have at most 26 characters.
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default ValidAnagramVisualizer;