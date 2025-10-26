import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, Play, Pause, Cpu, FileText, Clock } from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "string reverseWords(string s) {" },
    { l: 5, t: "    vector<string> words;" },
    { l: 6, t: "    stringstream ss(s);" },
    { l: 7, t: "    string word;" },
    { l: 8, t: "    while (ss >> word) {" },
    { l: 9, t: "        words.push_back(word);" },
    { l: 10, t: "    }" },
    { l: 11, t: "    reverse(words.begin(), words.end());" },
    { l: 12, t: "    string result = \"\";" },
    { l: 13, t: "    for (int i = 0; i < words.size(); i++) {" },
    { l: 14, t: "        result += words[i];" },
    { l: 15, t: "        if (i != words.size() - 1) result += \" \";" },
    { l: 16, t: "    }" },
    { l: 17, t: "    return result;" },
    { l: 18, t: "}" },
  ],
  Python: [
    { l: 1, t: "def reverseWords(s):" },
    { l: 2, t: "    words = s.split()" },
    { l: 3, t: "    words.reverse()" },
    { l: 4, t: "    return ' '.join(words)" },
  ],
  Java: [
    { l: 1, t: "public static String reverseWords(String s) {" },
    { l: 2, t: "    String[] words = s.trim().split(\"\\\\s+\");" },
    { l: 3, t: "    Collections.reverse(Arrays.asList(words));" },
    { l: 4, t: "    return String.join(\" \", words);" },
    { l: 5, t: "}" },
  ],
};

const ReverseWordsVisualizer = () => {
  const [stringInput, setStringInput] = useState("the sky is blue");
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
        words: [],
        currentWord: null,
        reversedWords: [],
        result: null,
        line: null,
        explanation: "",
        phase: null,
        ...props,
      });

    addState({
      line: 5,
      phase: "init",
      explanation: "Initialize empty words array.",
      words: [],
    });

    const words = s.trim().split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      addState({
        line: 9,
        phase: "extracting",
        currentWord: words[i],
        words: words.slice(0, i + 1),
        explanation: `Extract word "${words[i]}" and add to array.`,
      });
    }

    addState({
      line: 11,
      phase: "reversing",
      words: [...words],
      explanation: "Reverse the words array.",
    });

    const reversedWords = [...words].reverse();
    
    addState({
      line: 11,
      phase: "reversed",
      words: [...words],
      reversedWords: [...reversedWords],
      explanation: `Words reversed: [${reversedWords.map(w => `"${w}"`).join(", ")}].`,
    });

    addState({
      line: 12,
      phase: "building",
      reversedWords: [...reversedWords],
      explanation: "Build result string by joining reversed words.",
    });

    const result = reversedWords.join(" ");
    
    addState({
      line: 17,
      phase: "complete",
      reversedWords: [...reversedWords],
      result,
      explanation: `Final result: "${result}".`,
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

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-950 min-h-screen text-white">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
          Reverse Words
        </h1>
        <p className="text-gray-300 mt-2 text-lg">
          Reverse the order of words in a string
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={stringInput}
            onChange={(e) => setStringInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-orange-400"
            placeholder="Enter sentence (e.g., the sky is blue)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-orange-600 disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-orange-600 transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-orange-600 disabled:opacity-40 transition"
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
                  ? "bg-orange-500/20 text-orange-300 ring-1 ring-orange-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Split, Reverse, Join</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter a sentence and click{" "}
          <span className="text-orange-400 font-semibold">Load & Visualize</span>
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
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 font-mono text-xl text-white">
                "{string}"
              </div>
            </div>

            {state.currentWord && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2">Current Word</h4>
                <div className="p-3 bg-orange-500/20 border border-orange-500 rounded-lg font-mono text-2xl text-orange-300">
                  "{state.currentWord}"
                </div>
              </div>
            )}

            {state.words && state.words.length > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-3">Extracted Words Array</h4>
                <div className="flex gap-2 flex-wrap">
                  {state.words.map((word, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-blue-700/30 border border-blue-600 rounded-lg font-mono text-white"
                    >
                      <span className="text-xs text-gray-400">[{idx}]</span> {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.reversedWords && state.reversedWords.length > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-3">Reversed Words Array</h4>
                <div className="flex gap-2 flex-wrap">
                  {state.reversedWords.map((word, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-green-700/30 border border-green-600 rounded-lg font-mono text-white"
                    >
                      <span className="text-xs text-gray-400">[{idx}]</span> {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation}</p>
                <div className="mt-3 text-sm text-gray-400">
                  <strong>Phase:</strong>{" "}
                  <span className="text-gray-200">{state.phase || "-"}</span>
                </div>
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
                    N = length of string. Split and reverse operations.
                  </div>
                </div>
              </div>
            </div>

            {state.result !== null && (
              <div className="p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl border border-orange-500/50">
                <h4 className="text-orange-300 font-semibold mb-3">Final Result</h4>
                <div className="font-mono text-3xl text-white">"{state.result}"</div>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};

export default ReverseWordsVisualizer;