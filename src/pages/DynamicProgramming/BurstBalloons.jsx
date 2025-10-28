import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Zap,
  List,
  Calculator,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Cpu,
  FileText,
  Terminal,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <vector>" },
    { l: 2, t: "#include <algorithm>" },
    { l: 3, t: "using namespace std;" },
    { l: 4, t: "" },
    { l: 5, t: "class Solution {" },
    { l: 6, t: "public:" },
    { l: 7, t: "    int maxCoins(vector<int>& nums) {" },
    { l: 8, t: "        int n = nums.size();" },
    { l: 9, t: "        nums.insert(nums.begin(), 1);" },
    { l: 10, t: "        nums.push_back(1);" },
    { l: 11, t: "        int m = nums.size();" },
    { l: 12, t: "        " },
    { l: 13, t: "        vector<vector<int>> dp(m, vector<int>(m, 0));" },
    { l: 14, t: "        " },
    { l: 15, t: "        for (int len = 3; len <= m; ++len) {" },
    { l: 16, t: "            for (int i = 0; i <= m - len; ++i) {" },
    { l: 17, t: "                int j = i + len - 1;" },
    { l: 18, t: "                for (int k = i + 1; k < j; ++k) {" },
    { l: 19, t: "                    dp[i][j] = max(dp[i][j], " },
    { l: 20, t: "                        dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j]);" },
    { l: 21, t: "                }" },
    { l: 22, t: "            }" },
    { l: 23, t: "        }" },
    { l: 24, t: "        return dp[0][m - 1];" },
    { l: 25, t: "    }" },
    { l: 26, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def maxCoins(self, nums: list[int]) -> int:" },
    { l: 3, t: "        nums = [1] + nums + [1]" },
    { l: 4, t: "        n = len(nums)" },
    { l: 5, t: "        dp = [[0] * n for _ in range(n)]" },
    { l: 6, t: "        " },
    { l: 7, t: "        for length in range(3, n + 1):" },
    { l: 8, t: "            for i in range(n - length + 1):" },
    { l: 9, t: "                j = i + length - 1" },
    { l: 10, t: "                for k in range(i + 1, j):" },
    { l: 11, t: "                    dp[i][j] = max(dp[i][j]," },
    { l: 12, t: "                                    dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j])" },
    { l: 13, t: "                " },
    { l: 14, t: "        return dp[0][n - 1]" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "    public int maxCoins(int[] nums) {" },
    { l: 3, t: "        int n = nums.length;" },
    { l: 4, t: "        int[] newNums = new int[n + 2];" },
    { l: 5, t: "        newNums[0] = 1;" },
    { l: 6, t: "        newNums[n + 1] = 1;" },
    { l: 7, t: "        for (int i = 0; i < n; i++) {" },
    { l: 8, t: "            newNums[i + 1] = nums[i];" },
    { l: 9, t: "        }" },
    { l: 10, t: "        " },
    { l: 11, t: "        int m = n + 2;" },
    { l: 12, t: "        int[][] dp = new int[m][m];" },
    { l: 13, t: "        " },
    { l: 14, t: "        for (int len = 3; len <= m; len++) {" },
    { l: 15, t: "            for (int i = 0; i <= m - len; i++) {" },
    { l: 16, t: "                int j = i + len - 1;" },
    { l: 17, t: "                for (int k = i + 1; k < j; k++) {" },
    { l: 18, t: "                    dp[i][j] = Math.max(dp[i][j]," },
    { l: 19, t: "                            dp[i][k] + dp[k][j] + newNums[i] * newNums[k] * newNums[j]);" },
    { l: 20, t: "                }" },
    { l: 21, t: "            }" },
    { l: 22, t: "        }" },
    { l: 23, t: "        return dp[0][m - 1];" },
    { l: 24, t: "    }" },
    { l: 25, t: "}" },
  ],
};

const BurstBalloonsVisualizer = () => {
  const [weightsInput, setWeightsInput] = useState("3,1,5,8"); // Changed example input
  const [valuesInput, setValuesInput] = useState("30,20,50,60"); // Unused for this problem
  const [capacityInput, setCapacityInput] = useState("8"); // Unused for this problem

  const [weights, setWeights] = useState([]);
  const [values, setValues] = useState([]);
  const [capacity, setCapacity] = useState(0);

  // history: each state contains dp snapshot, i, w, line, decision, currentItems (indices), explanation, bestValue
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // UI controls
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const playRef = useRef(null);

  // code tab
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  // ----------------- GENERATE HISTORY (DP+PATH TRACE) -----------------
  // !!! THIS LOGIC IS FOR KNAPSACK AND WILL NOT WORK FOR BURST BALLOONS !!!
  const generateHistory = useCallback((wtArr, valArr, W) => {
    const n = wtArr.length;
    const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
    // path[i][w] = list of item indices selected to achieve dp[i][w]
    const path = Array.from({ length: n + 1 }, () =>
      Array.from({ length: W + 1 }, () => [])
    );


    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        dp: dp.map((row) => [...row]),
        i: null,
        w: null,
        line: null,
        decision: null,
        currentItems: [],
        bestValue: dp[n][W],
        explanation: "",
        ...props,
      });

    // initial
    addState({ explanation: `Initialize DP table with zeros.`, line: 6 });

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= W; w++) {
        // consider
        addState({
          i,
          w,
          line: 7,
          decision: "consider",
          explanation: `Considering item ${i} (wt=${wtArr[i - 1]}, val=${valArr[i - 1]}) for capacity ${w}.`,
          currentItems: path[i - 1][w].slice(),
          bestValue: dp[n][W],
        });

        if (wtArr[i - 1] <= w) {
          const includeVal = valArr[i - 1] + dp[i - 1][w - wtArr[i - 1]];
          const excludeVal = dp[i - 1][w];

          // before decision snapshot
          addState({
            i,
            w,
            line: 9,
            decision: "compute-include-exclude",
            explanation: `Include value = ${includeVal}; Exclude value = ${excludeVal}.`,
            currentItems: path[i - 1][w].slice(),
            bestValue: dp[n][W],
          });

          if (includeVal > excludeVal) {
            dp[i][w] = includeVal;
            path[i][w] = [...path[i - 1][w - wtArr[i - 1]], i - 1];

            addState({
              i,
              w,
              line: 10,
              decision: "include",
              explanation: `Including item ${i} yields ${includeVal} > ${excludeVal}. Updated dp[${i}][${w}] = ${dp[i][w]}.`,
              currentItems: path[i][w].slice(),
              bestValue: dp[n][W],
            });
          } else {
            dp[i][w] = excludeVal;
            path[i][w] = [...path[i - 1][w]];

            addState({
              i,
              w,
              line: 10,
              decision: "exclude",
              explanation: `Excluding item ${i} keeps value ${excludeVal} >= ${includeVal}. dp[${i}][${w}] = ${dp[i][w]}.`,
              currentItems: path[i][w].slice(),
              bestValue: dp[n][W],
            });
          }
        } else {
          dp[i][w] = dp[i - 1][w];
          path[i][w] = [...path[i - 1][w]];

          addState({
            i,
            w,
            line: 12,
            decision: "skip",
            explanation: `Item ${i} (wt=${wtArr[i - 1]}) too heavy for capacity ${w}. Carry dp[${i}][${w}] = ${dp[i][w]}.`,
            currentItems: path[i][w].slice(),
            bestValue: dp[n][W],
          });
        }
      }
      // mark row as completed
      addState({
        i,
        w: null,
        line: 15,
        decision: "row-complete",
        explanation: `Finished processing items up to index ${i}.`,
        currentItems: path[i][capacity].slice(),
        bestValue: dp[n][W],
      });
    }

    // final state
    addState({
      i: n,
      w: W,
      line: 16,
      decision: "done",
      explanation: `DP complete. Maximum value = ${dp[n][W]}. Selected items: [${path[n][W].join(", ")}]`,
      currentItems: path[n][W].slice(),
      bestValue: dp[n][W],
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // ----------------- LOAD / VALIDATE -----------------
  // !!! THIS LOGIC IS FOR KNAPSACK AND WILL NOT WORK FOR BURST BALLOONS !!!
  const load = () => {
    const wt = weightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const val = valuesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const W = parseInt(capacityInput, 10);

    if (wt.length === 0 || wt.length !== val.length || wt.some(isNaN) || val.some(isNaN) || isNaN(W)) {
      return alert("Invalid input. Ensure weights and values are same length and capacity is a number.");
    }

    setWeights(wt);
    setValues(val);
    setCapacity(W);
    setIsLoaded(true);
    generateHistory(wt, val, W);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  // ----------------- STEP CONTROLS -----------------
  const stepForward = useCallback(() => {
    setCurrentStep((s) => {
      const next = Math.min(s + 1, history.length - 1);
      return next;
    });
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        // space toggles play/pause
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

  // play/pause with speed
  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

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

  // update playing state when reaching end
  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      clearInterval(playRef.current);
    }
  }, [currentStep, history.length]);


  // ----------------- RENDER HELPERS -----------------
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
        className={`relative flex font-mono text-sm ${active ? "bg-green-500/10" : ""}`}
      >
        {/* line number */}
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">
          {ln}
        </div>

        {/* code text */}
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">{text}</pre>
      </div>
    );
  };


  // color mapping for DP table cells
  const cellClass = (i, j) => {
    if (!state.dp) return "bg-gray-700";
    // currently processing
    if (i === state.i && j === state.w) return "bg-blue-500/80 shadow-lg";
    // completed rows
    if (i < (state.i || 0)) return "bg-green-700/60";
    return "bg-gray-700";
  };

  // Item card classes (selected -> gold glow)
  const itemClass = (idx) => {
    const selected = (state.currentItems || []).includes(idx);
    return `relative w-24 h-24 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all ${selected
      ? "bg-amber-500/80 shadow-[0_8px_30px_rgba(250,204,21,0.18)] ring-2 ring-amber-400"
      : "bg-gradient-to-br from-slate-700 to-slate-600 shadow-md"
      }`;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-rose-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400">
          Burst Balloons Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Visualize the Dynamic Programming (Interval DP) solution.
        </p>
      </header>



      {/* INPUT CONTROLS ROW */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={weightsInput} // This is still named weightsInput from the template
            onChange={(e) => setWeightsInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="nums (comma-separated), e.g., 3,1,5,8"
          />
          {/* These inputs are from the Knapsack template and not used by Burst Balloons */}
          <input
            type="text"
            value={valuesInput}
            onChange={(e) => setValuesInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="values (unused)"
          />
          <input
            type="text"
            value={capacityInput}
            onChange={(e) => setCapacityInput(e.target.value)}
            disabled={isLoaded}
            className="w-36 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="capacity (unused)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 transition text-white font-bold shadow-lg cursor-pointer"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={() => {
                    togglePlay();
                  }}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow inner">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
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
                className="ml-3 px-4 py-2 rounded-xl bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold shadow"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      {/* ALGORITHM TABS */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${activeLang === lang
                  ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
                }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Iterative DP (Interval DP)</span>
          </div>
        </div>
      </section>

      {/* MAIN GRID: left (code) / right (visualization) */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter inputs and
          <span className="text-rose-400 font-semibold"> Load & Visualize</span> to begin.
          <br />
          (Note: Visualization logic is non-functional for this problem)
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* LEFT PANEL: CODE SECTION */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">Language: {activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) => renderCodeLine(activeLang, line))}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Current active line highlighted in green.</div>
              <div>Tip: Use &lt or &gt keys to navigate, Space to play/pause.</div>
            </div>
          </aside>


          {/* RIGHT PANEL: VISUALIZATION SECTION */}
          {/* !!! THIS ENTIRE SECTION'S LOGIC IS FOR KNAPSACK AND WILL NOT WORK !!! */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner flex flex-wrap gap-3">
              <div className="flex-1">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <List size={16} /> Items (Balloons)
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {weights.map((w, idx) => ( // Using 'weights' as 'nums' from the old template
                    <div key={idx} className={itemClass(idx)}>
                      {state.i - 1 === idx && <VisualizerPointer className="absolute -top-4" />}
                      <div className="text-xs text-gray-100">#{idx}</div>
                      <div className="text-sm">Val:{w}</div>
                    </div>
                  ))}
                  {weights.length === 0 && <div className="text-gray-500 italic">No balloons loaded</div>}
                </div>
              </div>

              {/* DATA STRUCTURE DISPLAY */}
              <div className="w-80">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Terminal size={14} /> Data Structures
                </h4>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">DP Table (snapshot)</div>
                  <div className="overflow-auto max-h-40">
                    <table className="font-mono text-xs border-collapse w-full">
                      <tbody>
                        {state.dp &&
                          state.dp.map((row, i) => (
                            <tr key={i}>
                              {row.map((val, j) => (
                                <td key={j} className={`px-1 py-1 text-center ${cellClass(i, j)} text-white text-[10px] border border-gray-800`}>
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {!state.dp && <div className="text-gray-500 italic mt-2">DP not computed yet</div>}
                  </div>
                  <div className="mt-3 text-sm">
                    <div><span className="text-gray-400">Active cell:</span> {state.i ? `i=${state.i}` : "-"} , {state.w ? `j=${state.w}` : "-"}</div>
                    <div className="mt-1"><span className="text-gray-400">Selected items:</span> {state.currentItems?.length ? `[${state.currentItems.join(", ")}]` : "[]"} </div>
                  </div>
                </div>
              </div>
            </div>

            {/* explanation*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><FileText size={14} /> Explanation</h4>
                <p className="text-gray-200">{state.explanation || "Load inputs and press 'Load & Visualize' to begin. Use play/step controls to move through the DP."}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div><strong>Decision:</strong> <span className="text-gray-200">{state.decision || "-"}</span></div>
                  <div><strong>Active line:</strong> <span className="text-gray-200">{state.line ?? "-"}</span></div>
                  <div className="col-span-2 mt-2"><strong>Formula applied:</strong> <span className="text-gray-200">dp[i][j] = max(dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j])</span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><CheckCircle size={14} /> Output</h4>
                <div className="text-3xl font-mono text-green-400">{state.bestValue ?? 0}</div>
                <div className="mt-2 text-xs text-gray-400">Best value: {state.bestValue ?? 0}</div>
                <div className="mt-3">
                  <h5 className="text-xs text-gray-300">Chosen items</h5>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {(state.currentItems || []).map((i) => (
                      <div key={i} className="bg-amber-600/80 text-white px-3 py-1 rounded-md font-mono text-xs shadow">
                        #{i} (Val:{weights[i]})
                      </div>
                    ))}
                    {(!state.currentItems || state.currentItems.length === 0) && <div className="text-gray-500 italic text-xs">None yet</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* complexixty */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2"><Clock size={16} /> Complexity & Notes</h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(N³)</span> — We have three nested loops (length, i, k).</div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(N²)</span> — Storing the 2D DP table.</div>
                <div><strong>Approach:</strong> This is an Interval DP problem, similar to Matrix Chain Multiplication. `dp[i][j]` stores the max coins from bursting balloons in the interval (i, j).</div>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
        .animate-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        .animate-float { animation: float 18s ease-in-out infinite; }
        .animate-float-delayed { animation: float 20s ease-in-out 8s infinite; }
        @keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
       `}</style>
    </div>
  );
};

export default BurstBalloonsVisualizer;