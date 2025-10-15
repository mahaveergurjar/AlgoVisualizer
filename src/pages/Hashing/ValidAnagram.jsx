import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  FileText,
  Terminal,
  Hash,
  CheckCircle,
  Clock,
  Cpu,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <unordered_map>" },
    { l: 2, t: "#include <string>" },
    { l: 3, t: "using namespace std;" },
    { l: 4, t: "" },
    { l: 5, t: "bool isAnagram(string s, string t) {" },
    { l: 6, t: "    if (s.length() != t.length()) return false;" },
    { l: 7, t: "    unordered_map<char, int> freq;" },
    { l: 8, t: "    for (char c : s) freq[c]++;" },
    { l: 9, t: "    for (char c : t) {" },
    { l: 10, t: "        if (--freq[c] < 0) return false;" },
    { l: 11, t: "    }" },
    { l: 12, t: "    return true;" },
    { l: 13, t: "}" },
  ],
  Python: [
    { l: 1, t: "def isAnagram(s, t):" },
    { l: 2, t: "    if len(s) != len(t):" },
    { l: 3, t: "        return False" },
    { l: 4, t: "    freq = {}" },
    { l: 5, t: "    for c in s:" },
    { l: 6, t: "        freq[c] = freq.get(c, 0) + 1" },
    { l: 7, t: "    for c in t:" },
    { l: 8, t: "        if freq.get(c, 0) == 0:" },
    { l: 9, t: "            return False" },
    { l: 10, t: "        freq[c] -= 1" },
    { l: 11, t: "    return True" },
  ],
  Java: [
    { l: 1, t: "import java.util.HashMap;" },
    { l: 2, t: "import java.util.Map;" },
    { l: 3, t: "" },
    { l: 4, t: "public boolean isAnagram(String s, String t) {" },
    { l: 5, t: "    if (s.length() != t.length()) return false;" },
    { l: 6, t: "    Map<Character, Integer> freq = new HashMap<>();" },
    { l: 7, t: "    for (char c : s.toCharArray()) {" },
    { l: 8, t: "        freq.put(c, freq.getOrDefault(c, 0) + 1);" },
    { l: 9, t: "    }" },
    { l: 10, t: "    for (char c : t.toCharArray()) {" },
    { l: 11, t: "        if (freq.getOrDefault(c, 0) == 0) return false;" },
    { l: 12, t: "        freq.put(c, freq.get(c) - 1);" },
    { l: 13, t: "    }" },
    { l: 14, t: "    return true;" },
    { l: 15, t: "}" },
  ],
};

const ValidAnagram = () => {
  const [sInput, setSInput] = useState("anagram");
  const [tInput, setTInput] = useState("nagaram");
  const [s, setS] = useState("");
  const [t, setT] = useState("");

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [activeLang, setActiveLang] = useState("C++");

  const playRef = useRef(null);

  // Generate simulation history
  const generateHistory = useCallback((str1, str2) => {
    const newHistory = [];
    const freq = {};
    //let currentChar = null;
    //let phase = "init";

    const addState = (props) => {
      newHistory.push({
        freq: { ...freq },
        currentChar: null,
        phase: "init",
        result: null,
        line: null,
        explanation: "",
        ...props,
      });
    };

    // Initial state
    addState({
      line: 6,
      explanation: "Starting anagram check. Initialize frequency map.",
      phase: "init",
    });

    // Length check
    addState({
      line: 6,
      explanation: `Checking string lengths: s.length=${str1.length}, t.length=${str2.length}`,
      phase: "length-check",
    });

    if (str1.length !== str2.length) {
      addState({
        line: 6,
        explanation: "Strings have different lengths → Not an anagram ❌",
        phase: "done",
        result: false,
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    // Count characters in first string
    for (let i = 0; i < str1.length; i++) {
      const ch = str1[i];
      freq[ch] = (freq[ch] || 0) + 1;

      addState({
        line: 8,
        explanation: `Counting character '${ch}' from string s → freq['${ch}'] = ${freq[ch]}`,
        currentChar: ch,
        phase: "counting-s",
        charIndex: i,
      });
    }

    // Process characters in second string
    for (let i = 0; i < str2.length; i++) {
      const ch = str2[i];

      if (!freq[ch] || freq[ch] === 0) {
        freq[ch] = (freq[ch] || 0) - 1;
        addState({
          line: 10,
          explanation: `Character '${ch}' not found or already exhausted → Not an anagram ❌`,
          currentChar: ch,
          phase: "checking-t",
          result: false,
          charIndex: i,
        });
        setHistory(newHistory);
        setCurrentStep(0);
        return;
      }

      freq[ch]--;
      addState({
        line: 10,
        explanation: `Decrementing frequency for '${ch}' → freq['${ch}'] = ${freq[ch]}`,
        currentChar: ch,
        phase: "checking-t",
        charIndex: i,
      });
    }

    // Final result
    const isAnagram = Object.values(freq).every((v) => v === 0);
    addState({
      line: 12,
      explanation: isAnagram
        ? "All frequencies are zero → Strings are anagrams ✅"
        : "Some frequencies are non-zero → Not anagrams ❌",
      phase: "done",
      result: isAnagram,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // Load and validate inputs
  const load = () => {
    const str1 = sInput.trim().toLowerCase();
    const str2 = tInput.trim().toLowerCase();

    if (!str1 || !str2) {
      alert("Please enter both strings.");
      return;
    }

    setS(str1);
    setT(str2);
    setIsLoaded(true);
    generateHistory(str1, str2);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  // Step controls
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

  // Auto-play functionality
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

  // Stop playing when reaching the end
  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      clearInterval(playRef.current);
    }
  }, [currentStep, history.length]);

  const state = history[currentStep] || {};

  const formattedStep = () => {
    if (!isLoaded) return "0/0";
    return `${Math.max(0, currentStep + 1)}/${history.length}`;
  };

  const renderCodeLine = (lang, lineObj) => {
    const text = lineObj.t;
    const ln = lineObj.l;
    const active = state.line === ln;

    return (
      <div
        key={ln}
        className={`relative flex font-mono text-sm ${
          active ? "bg-green-500/10 border-l-4 border-green-400" : ""
        }`}
      >
        <div className="flex-none w-8 text-right text-gray-500 select-none pr-3">
          {text ? ln : ""}
        </div>
        <pre className="flex-1 m-0 p-1 text-gray-200 whitespace-pre">
          {text}
        </pre>
      </div>
    );
  };

  const getCharacterClass = (char, index, stringType) => {
    const isCurrentChar =
      state.currentChar === char &&
      ((stringType === "s" &&
        state.phase === "counting-s" &&
        state.charIndex === index) ||
        (stringType === "t" &&
          state.phase === "checking-t" &&
          state.charIndex === index));

    const isProcessed =
      (stringType === "s" &&
        state.phase !== "init" &&
        state.phase !== "length-check" &&
        (state.phase !== "counting-s" || state.charIndex > index)) ||
      (stringType === "t" && state.phase === "done") ||
      (state.phase === "checking-t" && state.charIndex > index);

    if (isCurrentChar) {
      return "bg-blue-500/80 text-white shadow-lg transform scale-110";
    } else if (isProcessed) {
      return "bg-green-600/60 text-white";
    } else {
      return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      {/* Background effects */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-lime-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-green-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400">
          🔠 Valid Anagram Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Visualize character frequency counting for anagram detection
        </p>
      </header>

      {/* Input Controls */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={sInput}
            onChange={(e) => setSInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-lime-400 shadow-sm"
            placeholder="First string (s)"
          />
          <input
            type="text"
            value={tInput}
            onChange={(e) => setTInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-lime-400 shadow-sm"
            placeholder="Second string (t)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-lime-500/20 hover:bg-lime-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-lime-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-lime-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-lime-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <label className="text-sm text-gray-300">Speed</label>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={100}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  className="w-36"
                />
              </div>

              <button
                onClick={resetAll}
                className="ml-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      {/* Algorithm Tabs */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeLang === lang
                  ? "bg-lime-500/20 text-lime-300 ring-1 ring-lime-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Hash Map Frequency Count</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter two strings then click{" "}
          <span className="text-lime-400 font-semibold">Load & Visualize</span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Code Panel */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lime-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">
                Language: {activeLang}
              </div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) =>
                renderCodeLine(activeLang, line)
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Current active line highlighted in green.</div>
              <div>Tip: Use ← → keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          {/* Visualization Panel */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* String Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <FileText size={16} /> Input Strings
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">
                    String s: "{s}"
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {s.split("").map((char, idx) => (
                      <div
                        key={`s-${idx}`}
                        className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm transition-all ${getCharacterClass(
                          char,
                          idx,
                          "s"
                        )}`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-2">
                    String t: "{t}"
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {t.split("").map((char, idx) => (
                      <div
                        key={`t-${idx}`}
                        className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm transition-all ${getCharacterClass(
                          char,
                          idx,
                          "t"
                        )}`}
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Frequency Map */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Hash size={16} /> Frequency Map
              </h4>

              <div className="flex gap-3 flex-wrap">
                {Object.entries(state.freq || {}).map(([char, count]) => (
                  <div
                    key={char}
                    className={`p-3 rounded-xl border transition-all ${
                      count === 0
                        ? "border-green-400 bg-green-500/20"
                        : count < 0
                        ? "border-red-400 bg-red-500/20"
                        : "border-yellow-400 bg-yellow-500/20"
                    } ${
                      state.currentChar === char
                        ? "ring-2 ring-blue-400 transform scale-110"
                        : ""
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{char}</div>
                    <div className="text-sm opacity-80">count: {count}</div>
                  </div>
                ))}
                {Object.keys(state.freq || {}).length === 0 && (
                  <div className="text-gray-500 italic">
                    Frequency map will appear here
                  </div>
                )}
              </div>
            </div>

            {/* Explanation and Result */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">
                  {state.explanation ||
                    "Load strings and press 'Load & Visualize' to begin."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>
                    <strong>Phase:</strong>{" "}
                    <span className="text-gray-200">{state.phase || "-"}</span>
                  </div>
                  <div>
                    <strong>Current char:</strong>{" "}
                    <span className="text-gray-200">
                      {state.currentChar || "-"}
                    </span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <strong>Algorithm:</strong>{" "}
                    <span className="text-gray-200">
                      Count characters in first string, then decrement for
                      second string
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Result
                </h4>
                <div
                  className={`text-3xl font-mono ${
                    state.result === true
                      ? "text-green-400"
                      : state.result === false
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  {state.result === true
                    ? "✅ TRUE"
                    : state.result === false
                    ? "❌ FALSE"
                    : "..."}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {state.result === true
                    ? "Strings are anagrams!"
                    : state.result === false
                    ? "Strings are not anagrams"
                    : "Processing..."}
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-lime-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity & Notes
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n)</span> — single
                  pass through each string
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">O(k)</span> — where
                  k is the number of unique characters
                </div>
                <div>
                  <strong>Note:</strong> For English lowercase letters, k ≤ 26
                  (constant space)
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
        .animate-float { animation: float 18s ease-in-out infinite; }
        .animate-float-delayed { animation: float 20s ease-in-out 8s infinite; }
        @keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
      `}</style>
    </div>
  );
};

export default ValidAnagram;
