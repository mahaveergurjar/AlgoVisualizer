import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  Terminal,
  CheckCircle,
  Clock,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "int lcs(string s1, string s2) {" },
    { l: 5, t: "    int m = s1.length(), n = s2.length();" },
    { l: 6, t: "    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));" },
    { l: 7, t: "    for (int i = 1; i <= m; ++i) {" },
    { l: 8, t: "        for (int j = 1; j <= n; ++j) {" },
    { l: 9, t: "            if (s1[i-1] == s2[j-1]) {" },
    { l: 10, t: "                dp[i][j] = dp[i-1][j-1] + 1;" },
    { l: 11, t: "            } else {" },
    { l: 12, t: "                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);" },
    { l: 13, t: "            }" },
    { l: 14, t: "        }" },
    { l: 15, t: "    }" },
    { l: 16, t: "    return dp[m][n];" },
    { l: 17, t: "}" },
  ],
  Python: [
    { l: 1, t: "def lcs(s1, s2):" },
    { l: 2, t: "    m, n = len(s1), len(s2)" },
    { l: 3, t: "    dp = [[0]*(n+1) for _ in range(m+1)]" },
    { l: 4, t: "    for i in range(1, m+1):" },
    { l: 5, t: "        for j in range(1, n+1):" },
    { l: 6, t: "            if s1[i-1] == s2[j-1]:" },
    { l: 7, t: "                dp[i][j] = dp[i-1][j-1] + 1" },
    { l: 8, t: "            else:" },
    { l: 9, t: "                dp[i][j] = max(dp[i-1][j], dp[i][j-1])" },
    { l: 10, t: "    return dp[m][n]" },
  ],
  Java: [
    { l: 1, t: "public static int lcs(String s1, String s2) {" },
    { l: 2, t: "    int m = s1.length(), n = s2.length();" },
    { l: 3, t: "    int[][] dp = new int[m+1][n+1];" },
    { l: 4, t: "    for (int i = 1; i <= m; ++i) {" },
    { l: 5, t: "        for (int j = 1; j <= n; ++j) {" },
    { l: 6, t: "            if (s1.charAt(i-1) == s2.charAt(j-1)) {" },
    { l: 7, t: "                dp[i][j] = dp[i-1][j-1] + 1;" },
    { l: 8, t: "            } else {" },
    { l: 9, t: "                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);" },
    { l: 10, t: "            }" },
    { l: 11, t: "        }" },
    { l: 12, t: "    }" },
    { l: 13, t: "    return dp[m][n];" },
    { l: 14, t: "}" },
  ],
};

const LCSVisualizer = () => {
  const [string1Input, setString1Input] = useState("AGGTAB");
  const [string2Input, setString2Input] = useState("GXTXAYB");
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
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const lcsStr = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""));
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        dp: dp.map((row) => [...row]),
        lcsStr: lcsStr.map((row) => [...row]),
        i: null,
        j: null,
        line: null,
        decision: null,
        explanation: "",
        lcsLength: dp[m][n],
        lcsResult: lcsStr[m][n],
        ...props,
      });

    addState({ explanation: "Initialize DP table with zeros.", line: 6 });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        addState({
          i,
          j,
          line: 7,
          decision: "consider",
          explanation: `Comparing s1[${i-1}]='${s1[i-1]}' with s2[${j-1}]='${s2[j-1]}'.`,
          lcsLength: dp[m][n],
          lcsResult: lcsStr[m][n],
        });

        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          lcsStr[i][j] = lcsStr[i - 1][j - 1] + s1[i - 1];
          addState({
            i,
            j,
            line: 10,
            decision: "match",
            explanation: `Characters match! dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}. LCS: "${lcsStr[i][j]}"`,
            lcsLength: dp[m][n],
            lcsResult: lcsStr[m][n],
          });
        } else {
          const fromTop = dp[i - 1][j];
          const fromLeft = dp[i][j - 1];
          if (fromTop >= fromLeft) {
            dp[i][j] = fromTop;
            lcsStr[i][j] = lcsStr[i - 1][j];
          } else {
            dp[i][j] = fromLeft;
            lcsStr[i][j] = lcsStr[i][j - 1];
          }
          addState({
            i,
            j,
            line: 12,
            decision: "no-match",
            explanation: `No match. dp[${i}][${j}] = max(dp[${i-1}][${j}], dp[${i}][${j-1}]) = ${dp[i][j]}`,
            lcsLength: dp[m][n],
            lcsResult: lcsStr[m][n],
          });
        }
      }
    }

    addState({
      i: m,
      j: n,
      line: 16,
      decision: "done",
      explanation: `DP complete. LCS length = ${dp[m][n]}, LCS = "${lcsStr[m][n]}"`,
      lcsLength: dp[m][n],
      lcsResult: lcsStr[m][n],
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const s1 = string1Input.trim().toUpperCase();
    const s2 = string2Input.trim().toUpperCase();
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

  const cellClass = (i, j) => {
    if (!state.dp) return "bg-gray-700";
    if (i === state.i && j === state.j) return "bg-blue-500/80 shadow-lg";
    if (i < (state.i || 0) || (i === state.i && j < (state.j || 0))) return "bg-green-700/60";
    return "bg-gray-700";
  };

  const charClass = (str, idx, isFirst) => {
    const activeIdx = isFirst ? (state.i ? state.i - 1 : -1) : (state.j ? state.j - 1 : -1);
    return `w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-white ${
      idx === activeIdx ? "bg-blue-500 shadow-lg" : "bg-slate-700"
    }`;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
          Longest Common Subsequence
        </h1>
        <p className="text-gray-300 mt-2 text-lg">Visualize the DP table & LCS construction</p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={string1Input}
            onChange={(e) => setString1Input(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400"
            placeholder="First string"
          />
          <input
            type="text"
            value={string2Input}
            onChange={(e) => setString2Input(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400"
            placeholder="Second string"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition"
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
                  ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Iterative DP</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter two strings and click <span className="text-cyan-400 font-semibold">Load & Visualize</span>
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
                  <div className="flex gap-1">
                    {string1.split("").map((c, i) => (
                      <div key={i} className={charClass(string1, i, true)}>{c}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">String 2</div>
                  <div className="flex gap-1">
                    {string2.split("").map((c, i) => (
                      <div key={i} className={charClass(string2, i, false)}>{c}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <Terminal size={14} /> DP Table
              </h4>
              <div className="overflow-auto">
                <table className="font-mono text-xs border-collapse">
                  <tbody>
                    {state.dp &&
                      state.dp.map((row, i) => (
                        <tr key={i}>
                          {row.map((val, j) => (
                            <td
                              key={j}
                              className={`px-2 py-1 text-center ${cellClass(i, j)} text-white border border-gray-800`}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation}</p>
                <div className="mt-3 text-sm text-gray-400">
                  <div><strong>Decision:</strong> <span className="text-gray-200">{state.decision || "-"}</span></div>
                  <div className="mt-1"><strong>Active line:</strong> <span className="text-gray-200">{state.line ?? "-"}</span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Result
                </h4>
                <div className="text-3xl font-mono text-green-400">{state.lcsLength ?? 0}</div>
                <div className="mt-2 text-xs text-gray-400">LCS Length: {state.lcsLength ?? 0}</div>
                <div className="mt-3">
                  <div className="text-xs text-gray-300 mb-1">LCS String:</div>
                  <div className="bg-amber-600/80 text-white px-3 py-2 rounded-md font-mono text-sm">
                    {state.lcsResult || '""'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(M × N)</span></div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(M × N)</span></div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default LCSVisualizer;