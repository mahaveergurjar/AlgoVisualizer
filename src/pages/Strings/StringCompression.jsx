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
    { l: 4, t: "string compress(string s) {" },
    { l: 5, t: "    string result = \"\";" },
    { l: 6, t: "    int i = 0;" },
    { l: 7, t: "    while (i < s.length()) {" },
    { l: 8, t: "        char current = s[i];" },
    { l: 9, t: "        int count = 0;" },
    { l: 10, t: "        while (i < s.length() && s[i] == current) {" },
    { l: 11, t: "            count++;" },
    { l: 12, t: "            i++;" },
    { l: 13, t: "        }" },
    { l: 14, t: "        result += current + to_string(count);" },
    { l: 15, t: "    }" },
    { l: 16, t: "    return result.length() < s.length() ? result : s;" },
    { l: 17, t: "}" },
  ],
  Python: [
    { l: 1, t: "def compress(s):" },
    { l: 2, t: "    result = []" },
    { l: 3, t: "    i = 0" },
    { l: 4, t: "    while i < len(s):" },
    { l: 5, t: "        current = s[i]" },
    { l: 6, t: "        count = 0" },
    { l: 7, t: "        while i < len(s) and s[i] == current:" },
    { l: 8, t: "            count += 1" },
    { l: 9, t: "            i += 1" },
    { l: 10, t: "        result.append(current + str(count))" },
    { l: 11, t: "    compressed = ''.join(result)" },
    { l: 12, t: "    return compressed if len(compressed) < len(s) else s" },
  ],
  Java: [
    { l: 1, t: "public static String compress(String s) {" },
    { l: 2, t: "    StringBuilder result = new StringBuilder();" },
    { l: 3, t: "    int i = 0;" },
    { l: 4, t: "    while (i < s.length()) {" },
    { l: 5, t: "        char current = s.charAt(i);" },
    { l: 6, t: "        int count = 0;" },
    { l: 7, t: "        while (i < s.length() && s.charAt(i) == current) {" },
    { l: 8, t: "            count++;" },
    { l: 9, t: "            i++;" },
    { l: 10, t: "        }" },
    { l: 11, t: "        result.append(current).append(count);" },
    { l: 12, t: "    }" },
    { l: 13, t: "    String compressed = result.toString();" },
    { l: 14, t: "    return compressed.length() < s.length() ? compressed : s;" },
    { l: 15, t: "}" },
  ],
};

const StringCompressionVisualizer = () => {
  const [stringInput, setStringInput] = useState("aaabbbcccaaa");
  const [string, setString] = useState("");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const playRef = useRef(null);
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  const generateHistory = useCallback((s) => {
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

    addState({
      line: 5,
      explanation: "Initialize empty result string.",
      result: "",
    });

    addState({
      line: 6,
      explanation: "Set pointer i = 0 to traverse the string.",
      i: 0,
    });

    let i = 0;
    let result = "";

    while (i < s.length) {
      const current = s[i];
      let count = 0;
      const startIdx = i;

      addState({
        line: 8,
        i,
        currentChar: current,
        result,
        explanation: `Current character is '${current}' at index ${i}.`,
        highlightIndices: [i],
      });

      addState({
        line: 9,
        i,
        currentChar: current,
        count: 0,
        result,
        explanation: `Initialize count = 0 for character '${current}'.`,
        highlightIndices: [i],
      });

      const countIndices = [];
      while (i < s.length && s[i] === current) {
        count++;
        countIndices.push(i);
        addState({
          line: 11,
          i,
          currentChar: current,
          count,
          result,
          explanation: `Found '${current}' at index ${i}. Increment count to ${count}.`,
          highlightIndices: [...countIndices],
        });
        i++;
        addState({
          line: 12,
          i,
          currentChar: current,
          count,
          result,
          explanation: `Move pointer to index ${i}.`,
          highlightIndices: [...countIndices],
        });
      }

      result += current + count;
      addState({
        line: 14,
        i,
        currentChar: current,
        count,
        result,
        explanation: `Append '${current}${count}' to result. Result = "${result}".`,
        highlightIndices: [],
      });
    }

    const finalResult = result.length < s.length ? result : s;
    addState({
      line: 16,
      result,
      finalResult,
      explanation: `Compressed: "${result}" (length ${result.length}). Original: "${s}" (length ${s.length}). ${
        result.length < s.length
          ? `Return compressed string "${result}".`
          : `Compressed is not shorter, return original "${s}".`
      }`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const s = stringInput.trim();
    if (!s) return alert("String must be non-empty.");
    setString(s);
    setIsLoaded(true);
    generateHistory(s);
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

  const charClass = (idx) => {
    const isHighlighted = state.highlightIndices && state.highlightIndices.includes(idx);
    const isPointer = state.i === idx;
    return `w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-white ${
      isPointer
        ? "bg-purple-500 shadow-lg ring-2 ring-purple-400"
        : isHighlighted
        ? "bg-indigo-500 shadow-lg"
        : "bg-slate-700"
    }`;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-950 min-h-screen text-white">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
          String Compression
        </h1>
        <p className="text-gray-300 mt-2 text-lg">
          Compress a string using character counts (e.g., "aaa" → "a3")
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={stringInput}
            onChange={(e) => setStringInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-purple-400"
            placeholder="Enter string (e.g., aaabbbccc)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-purple-600 transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-40 transition"
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
                  ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Two Pointers</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter a string and click{" "}
          <span className="text-purple-400 font-semibold">Load & Visualize</span>
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
                  className={`flex font-mono text-sm ${
                    state.line === line.l ? "bg-green-500/10" : ""
                  }`}
                >
                  <div className="w-10 text-right text-gray-500 pr-3">{line.l}</div>
                  <pre className="flex-1 text-gray-200">{line.t}</pre>
                </div>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-3">Original String</h4>
              <div className="flex gap-1 flex-wrap">
                {string.split("").map((c, i) => (
                  <div key={i} className={charClass(i)}>
                    {c}
                  </div>
                ))}
              </div>
              {state.i !== undefined && (
                <div className="mt-3 text-sm text-gray-400">
                  <strong>Pointer i:</strong>{" "}
                  <span className="text-purple-300 font-mono">{state.i}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <Hash size={14} /> Current Processing
              </h4>
              <div className="space-y-2">
                {state.currentChar && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">Character:</div>
                    <div className="px-3 py-2 bg-indigo-500/20 border border-indigo-500 rounded-lg font-mono text-lg text-white">
                      {state.currentChar}
                    </div>
                    <div className="text-sm text-gray-400">Count:</div>
                    <div className="px-3 py-2 bg-green-700/30 border border-green-600 rounded-lg font-mono text-lg text-white">
                      {state.count}
                    </div>
                  </div>
                )}
                {!state.currentChar && (
                  <div className="text-gray-500 italic text-sm">Not processing any character</div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2">Result String</h4>
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 font-mono text-xl text-white min-h-[3rem] flex items-center">
                {state.result || '""'}
              </div>
              {state.finalResult !== null && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/50">
                  <div className="text-sm text-gray-300 mb-1">
                    <strong>Final Result:</strong>
                  </div>
                  <div className="font-mono text-2xl text-purple-300">{state.finalResult}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-green-300 font-semibold flex items-center gap-2">
                  <Clock size={16} /> Complexity
                </h4>
                <div className="mt-3 text-sm text-gray-300 space-y-2">
                  <div>
                    <strong>Time:</strong>{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </div>
                  <div>
                    <strong>Space:</strong>{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    N = length of string. We traverse once and build result string.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default StringCompressionVisualizer;