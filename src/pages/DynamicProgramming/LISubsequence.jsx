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
  TrendingUp,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "int lengthOfLIS(vector<int>& nums) {" },
    { l: 5, t: "    int n = nums.size();" },
    { l: 6, t: "    vector<int> dp(n, 1);" },
    { l: 7, t: "    int maxLen = 1;" },
    { l: 8, t: "    for (int i = 1; i < n; ++i) {" },
    { l: 9, t: "        for (int j = 0; j < i; ++j) {" },
    { l: 10, t: "            if (nums[j] < nums[i]) {" },
    { l: 11, t: "                dp[i] = max(dp[i], dp[j] + 1);" },
    { l: 12, t: "            }" },
    { l: 13, t: "        }" },
    { l: 14, t: "        maxLen = max(maxLen, dp[i]);" },
    { l: 15, t: "    }" },
    { l: 16, t: "    return maxLen;" },
    { l: 17, t: "}" },
  ],
  Python: [
    { l: 1, t: "def lengthOfLIS(nums):" },
    { l: 2, t: "    n = len(nums)" },
    { l: 3, t: "    dp = [1] * n" },
    { l: 4, t: "    max_len = 1" },
    { l: 5, t: "    for i in range(1, n):" },
    { l: 6, t: "        for j in range(i):" },
    { l: 7, t: "            if nums[j] < nums[i]:" },
    { l: 8, t: "                dp[i] = max(dp[i], dp[j] + 1)" },
    { l: 9, t: "        max_len = max(max_len, dp[i])" },
    { l: 10, t: "    return max_len" },
  ],
  Java: [
    { l: 1, t: "public static int lengthOfLIS(int[] nums) {" },
    { l: 2, t: "    int n = nums.length;" },
    { l: 3, t: "    int[] dp = new int[n];" },
    { l: 4, t: "    Arrays.fill(dp, 1);" },
    { l: 5, t: "    int maxLen = 1;" },
    { l: 6, t: "    for (int i = 1; i < n; ++i) {" },
    { l: 7, t: "        for (int j = 0; j < i; ++j) {" },
    { l: 8, t: "            if (nums[j] < nums[i]) {" },
    { l: 9, t: "                dp[i] = Math.max(dp[i], dp[j] + 1);" },
    { l: 10, t: "            }" },
    { l: 11, t: "        }" },
    { l: 12, t: "        maxLen = Math.max(maxLen, dp[i]);" },
    { l: 13, t: "    }" },
    { l: 14, t: "    return maxLen;" },
    { l: 15, t: "}" },
  ],
};

const LISVisualizer = () => {
  const [arrayInput, setArrayInput] = useState("10,9,2,5,3,7,101,18");
  const [array, setArray] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const playRef = useRef(null);
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  const generateHistory = useCallback((arr) => {
    const n = arr.length;
    const dp = Array(n).fill(1);
    const sequences = arr.map((val, idx) => [val]);
    const newHistory = [];
    let maxLen = 1;
    
    const addState = (props) =>
      newHistory.push({
        dp: [...dp],
        sequences: sequences.map(s => [...s]),
        i: null,
        j: null,
        line: null,
        decision: null,
        explanation: "",
        maxLen,
        ...props,
      });

    addState({ explanation: "Initialize dp array with 1s. Each element is a subsequence of length 1.", line: 6 });

    for (let i = 1; i < n; i++) {
      addState({
        i,
        line: 8,
        decision: "outer",
        explanation: `Processing element at index ${i} (value = ${arr[i]})`,
        maxLen,
      });

      for (let j = 0; j < i; j++) {
        addState({
          i,
          j,
          line: 9,
          decision: "compare",
          explanation: `Comparing nums[${j}]=${arr[j]} with nums[${i}]=${arr[i]}`,
          maxLen,
        });

        if (arr[j] < arr[i]) {
          const newLen = dp[j] + 1;
          if (newLen > dp[i]) {
            dp[i] = newLen;
            sequences[i] = [...sequences[j], arr[i]];
            
            addState({
              i,
              j,
              line: 11,
              decision: "update",
              explanation: `${arr[j]} < ${arr[i]}. Update dp[${i}] = dp[${j}] + 1 = ${dp[i]}. Sequence: [${sequences[i].join(", ")}]`,
              maxLen,
            });
          } else {
            addState({
              i,
              j,
              line: 11,
              decision: "skip",
              explanation: `${arr[j]} < ${arr[i]}, but dp[${j}] + 1 = ${newLen} doesn't improve dp[${i}] = ${dp[i]}`,
              maxLen,
            });
          }
        } else {
          addState({
            i,
            j,
            line: 10,
            decision: "no-increase",
            explanation: `${arr[j]} >= ${arr[i]}. Cannot extend subsequence ending at j.`,
            maxLen,
          });
        }
      }
      
      maxLen = Math.max(maxLen, dp[i]);
      addState({
        i,
        line: 14,
        decision: "update-max",
        explanation: `Finished processing index ${i}. Current max LIS length = ${maxLen}`,
        maxLen,
      });
    }

    addState({
      line: 16,
      decision: "done",
      explanation: `DP complete. Longest Increasing Subsequence length = ${maxLen}`,
      maxLen,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const arr = arrayInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (arr.length === 0) return alert("Please enter valid numbers.");
    
    setArray(arr);
    setIsLoaded(true);
    generateHistory(arr);
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

  const arrayBoxClass = (idx) => {
    if (idx === state.i) return "bg-blue-500/80 shadow-lg ring-2 ring-blue-400";
    if (idx === state.j) return "bg-amber-500/80 shadow-lg ring-2 ring-amber-400";
    if (idx < (state.i || 0)) return "bg-green-700/60";
    return "bg-gray-700";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-950 min-h-screen text-white">
      <div className="absolute top-8 right-12 w-96 h-96 bg-green-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-blue-400">
          Longest Increasing Subsequence
        </h1>
        <p className="text-gray-300 mt-2 text-lg">Find the length of the longest strictly increasing subsequence</p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400"
            placeholder="Array (comma-separated)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-green-600 disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-green-600 transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-green-600 disabled:opacity-40 transition"
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
                  ? "bg-green-500/20 text-green-300 ring-1 ring-green-400"
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
          Enter an array and click <span className="text-green-400 font-semibold">Load & Visualize</span>
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
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={16} /> Input Array
              </h4>
              <div className="flex gap-2 flex-wrap">
                {array.map((val, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${arrayBoxClass(idx)} border border-gray-800 transition-all`}
                  >
                    <div className="text-xs text-gray-400">{idx}</div>
                    <div className="text-lg font-mono text-white font-bold">{val}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-400">Current (i)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-gray-400">Comparing (j)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <Terminal size={14} /> DP Array (LIS length ending at each index)
              </h4>
              <div className="flex gap-2 flex-wrap">
                {state.dp &&
                  state.dp.map((val, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${arrayBoxClass(idx)} border border-gray-800 transition-all`}
                    >
                      <div className="text-xs text-gray-400">{idx}</div>
                      <div className="text-lg font-mono text-white font-bold">{val}</div>
                    </div>
                  ))}
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
                  <div className="mt-1"><strong>Processing:</strong> <span className="text-gray-200">
                    {state.i !== null ? `Index ${state.i}` : "-"}
                    {state.j !== null ? ` vs ${state.j}` : ""}
                  </span></div>
                </div>
                {state.sequences && state.i !== null && state.sequences[state.i] && (
                  <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-xs text-green-300 font-semibold mb-1">LIS ending at index {state.i}:</div>
                    <div className="flex gap-1 flex-wrap">
                      {state.sequences[state.i].map((num, idx) => (
                        <div key={idx} className="bg-green-600/80 text-white px-2 py-1 rounded-md font-mono text-xs">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Result
                </h4>
                <div className="text-3xl font-mono text-green-400">{state.maxLen ?? 1}</div>
                <div className="mt-2 text-xs text-gray-400">LIS Length: {state.maxLen ?? 1}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(N²)</span></div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(N)</span></div>
                <div className="text-xs text-gray-400 mt-2">
                  N = length of array. There's also an O(N log N) solution using binary search.
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default LISVisualizer;