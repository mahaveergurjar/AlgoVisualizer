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
import Tooltip from "../../components/Tooltip";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "public:" },
    { l: 3, t: "    int t[101][101];" },
    { l: 4, t: "    " },
    { l: 5, t: "    int solve(int i, int j, int m, int n) {" },
    { l: 6, t: "        if (i >= m || j >= n) return 0;" },
    { l: 7, t: "        if (i == m-1 && j == n-1) return 1;" },
    { l: 8, t: "        if (t[i][j] != -1) return t[i][j];" },
    { l: 9, t: "" },
    { l: 10, t: "        int right = solve(i, j+1, m, n);" },
    { l: 11, t: "        int down = solve(i+1, j, m, n);" },
    { l: 12, t: "" },
    { l: 13, t: "        return t[i][j] = right + down;" },
    { l: 14, t: "    }" },
    { l: 15, t: "" },
    { l: 16, t: "    int uniquePaths(int m, int n) {" },
    { l: 17, t: "        memset(t, -1, sizeof(t));" },
    { l: 18, t: "        return solve(0, 0, m, n);" },
    { l: 19, t: "    }" },
    { l: 20, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def uniquePaths(self, m: int, n: int) -> int:" },
    { l: 3, t: "        memo = {}" },
    { l: 4, t: "        " },
    { l: 5, t: "        def solve(i, j):" },
    { l: 6, t: "            if i >= m or j >= n:" },
    { l: 7, t: "                return 0" },
    { l: 8, t: "            if i == m-1 and j == n-1:" },
    { l: 9, t: "                return 1" },
    { l: 10, t: "            if (i, j) in memo:" },
    { l: 11, t: "                return memo[(i, j)]" },
    { l: 12, t: "            " },
    { l: 13, t: "            right = solve(i, j+1)" },
    { l: 14, t: "            down = solve(i+1, j)" },
    { l: 15, t: "            " },
    { l: 16, t: "            memo[(i, j)] = right + down" },
    { l: 17, t: "            return memo[(i, j)]" },
    { l: 18, t: "        " },
    { l: 19, t: "        return solve(0, 0)" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "    int[][] t;" },
    { l: 3, t: "    " },
    { l: 4, t: "    public int solve(int i, int j, int m, int n) {" },
    { l: 5, t: "        if (i >= m || j >= n) return 0;" },
    { l: 6, t: "        if (i == m-1 && j == n-1) return 1;" },
    { l: 7, t: "        if (t[i][j] != -1) return t[i][j];" },
    { l: 8, t: "        " },
    { l: 9, t: "        int right = solve(i, j+1, m, n);" },
    { l: 10, t: "        int down = solve(i+1, j, m, n);" },
    { l: 11, t: "        " },
    { l: 12, t: "        return t[i][j] = right + down;" },
    { l: 13, t: "    }" },
    { l: 14, t: "    " },
    { l: 15, t: "    public int uniquePaths(int m, int n) {" },
    { l: 16, t: "        t = new int[m][n];" },
    { l: 17, t: "        for (int[] row : t) Arrays.fill(row, -1);" },
    { l: 18, t: "        return solve(0, 0, m, n);" },
    { l: 19, t: "    }" },
    { l: 20, t: "}" },
  ],
};

const LINE_MAP = {
  INIT: 17,
  CALL_SOLVE: 18,
  CHECK_BOUNDS: 6,
  CHECK_END: 7,
  CHECK_MEMO: 8,
  CALC_RIGHT: 10,
  CALC_DOWN: 11,
  STORE_RESULT: 13,
};

const UniquePathsVisualizer = () => {
  const [mInput, setMInput] = useState("3");
  const [nInput, setNInput] = useState("3");

  const [m, setM] = useState(0);
  const [n, setN] = useState(0);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const playRef = useRef(null);

  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  // Generate visualization history
  const generateHistory = useCallback((rows, cols) => {
    const newHistory = [];
    const memo = Array(rows).fill(null).map(() => Array(cols).fill(-1));
    
    const addState = (props) =>
      newHistory.push({
        memo: memo.map(row => [...row]),
        currentCell: null,
        line: null,
        explanation: "",
        finalResult: 0,
        callStack: [],
        ...props,
      });

    addState({
      line: LINE_MAP.INIT,
      explanation: "Initialize memoization table with -1 (not computed yet).",
    });

    addState({
      line: LINE_MAP.CALL_SOLVE,
      explanation: `Start solving from top-left corner (0, 0) to reach bottom-right (${rows-1}, ${cols-1}).`,
      currentCell: [0, 0],
    });

    // Simulate recursive calls with memoization
    const solve = (i, j, stack = []) => {
      const cellKey = `${i},${j}`;
      
      addState({
        currentCell: [i, j],
        line: LINE_MAP.CHECK_BOUNDS,
        callStack: [...stack, [i, j]],
        explanation: `Checking cell (${i}, ${j}): Is it out of bounds?`,
      });

      // Out of bounds
      if (i >= rows || j >= cols) {
        addState({
          currentCell: [i, j],
          line: LINE_MAP.CHECK_BOUNDS,
          callStack: stack,
          explanation: `Cell (${i}, ${j}) is out of bounds. Return 0 paths.`,
        });
        return 0;
      }

      // Reached destination
      if (i === rows - 1 && j === cols - 1) {
        memo[i][j] = 1;
        addState({
          currentCell: [i, j],
          line: LINE_MAP.CHECK_END,
          callStack: stack,
          explanation: `Reached destination (${i}, ${j})! This is 1 valid path.`,
        });
        return 1;
      }

      // Check memo
      if (memo[i][j] !== -1) {
        addState({
          currentCell: [i, j],
          line: LINE_MAP.CHECK_MEMO,
          callStack: stack,
          explanation: `Cell (${i}, ${j}) already computed: ${memo[i][j]} paths. Using memoized value!`,
        });
        return memo[i][j];
      }

      // Explore right
      addState({
        currentCell: [i, j],
        line: LINE_MAP.CALC_RIGHT,
        callStack: [...stack, [i, j]],
        explanation: `From (${i}, ${j}), exploring RIGHT to (${i}, ${j+1})...`,
      });
      const right = solve(i, j + 1, [...stack, [i, j]]);

      // Explore down
      addState({
        currentCell: [i, j],
        line: LINE_MAP.CALC_DOWN,
        callStack: [...stack, [i, j]],
        explanation: `From (${i}, ${j}), exploring DOWN to (${i+1}, ${j})...`,
      });
      const down = solve(i + 1, j, [...stack, [i, j]]);

      // Store result
      memo[i][j] = right + down;
      addState({
        currentCell: [i, j],
        line: LINE_MAP.STORE_RESULT,
        callStack: stack,
        explanation: `Cell (${i}, ${j}): right=${right} + down=${down} = ${memo[i][j]} total paths. Stored in memo!`,
      });

      return memo[i][j];
    };

    const result = solve(0, 0, []);

    addState({
      line: LINE_MAP.CALL_SOLVE,
      explanation: `Algorithm complete! Total unique paths from (0,0) to (${rows-1},${cols-1}) = ${result}`,
      finalResult: result,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const mVal = parseInt(mInput, 10);
    const nVal = parseInt(nInput, 10);

    if (isNaN(mVal) || isNaN(nVal) || mVal < 1 || nVal < 1) {
      return alert("Please enter valid positive integers for m and n (at least 1).");
    }

    if (mVal > 7 || nVal > 7) {
      return alert("For better visualization, please keep m and n ≤ 7.");
    }

    setM(mVal);
    setN(nVal);
    setIsLoaded(true);
    generateHistory(mVal, nVal);
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
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

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

  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      clearInterval(playRef.current);
    }
  }, [currentStep, history.length]);

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
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">
          {ln}
        </div>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">{text}</pre>
      </div>
    );
  };

  const getCellClass = (i, j) => {
    const isCurrent = state.currentCell && state.currentCell[0] === i && state.currentCell[1] === j;
    const isDestination = i === m - 1 && j === n - 1;
    const isStart = i === 0 && j === 0;
    
    if (isCurrent) {
      return "bg-amber-500/80 shadow-lg scale-110 ring-2 ring-amber-400";
    }
    if (isDestination) {
      return "bg-green-600/60 ring-2 ring-green-400";
    }
    if (isStart) {
      return "bg-blue-600/60 ring-2 ring-blue-400";
    }
    return "bg-gray-700";
  };

  const formatMemoValue = (val) => {
    if (val === -1) return "?";
    return val;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-blue-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-purple-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
          Unique Paths (Memoization)
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Find all unique paths from top-left to bottom-right. You can only move right or down.
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={mInput}
            onChange={(e) => setMInput(e.target.value)}
            disabled={isLoaded}
            className="w-32 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
            placeholder="rows (m)"
          />
          <input
            type="text"
            value={nInput}
            onChange={(e) => setNInput(e.target.value)}
            disabled={isLoaded}
            className="w-32 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
            placeholder="cols (n)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Tooltip content="Previous step" position="top">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition shadow"
                    aria-label="Previous step"
                  >
                    <ArrowLeft />
                  </button>
                </Tooltip>

                <Tooltip content={playing ? "Pause visualization" : "Play visualization"} position="top">
                  <button
                    onClick={togglePlay}
                    className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 transition shadow"
                    aria-label={playing ? "Pause visualization" : "Play visualization"}
                  >
                    {playing ? <Pause /> : <Play />}
                  </button>
                </Tooltip>

                <Tooltip content="Next step" position="top">
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition shadow"
                    aria-label="Next step"
                  >
                    <ArrowRight />
                  </button>
                </Tooltip>
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

              <Tooltip content="Reset visualization" position="top">
                <button
                  onClick={resetAll}
                  className="ml-3 px-4 py-2 rounded-xl bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold shadow"
                  aria-label="Reset visualization"
                >
                  Reset
                </button>
              </Tooltip>
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
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${
                activeLang === lang
                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Recursion + Memoization (Top-Down DP)</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter grid dimensions (m × n), then click
          <span className="text-blue-400 font-semibold"> Load & Visualize</span> to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
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
              <div>Tip: Use &lt; or &gt; keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Terminal size={16} /> Grid ({m} × {n}) - Memoization Table
              </h4>
              <div className="flex justify-center">
                <div className="inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                  {state.memo && state.memo.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg font-mono font-bold text-white transition-all duration-300 relative ${getCellClass(i, j)}`}
                      >
                        {state.currentCell && state.currentCell[0] === i && state.currentCell[1] === j && (
                          <VisualizerPointer className="absolute -top-5" />
                        )}
                        <div className="text-xs text-gray-300">{i},{j}</div>
                        <div className="text-lg">{formatMemoValue(val)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-4 justify-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600/60 ring-2 ring-blue-400 rounded" />
                  <span className="text-gray-300">Start (0,0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600/60 ring-2 ring-green-400 rounded" />
                  <span className="text-gray-300">End ({m-1},{n-1})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500/80 ring-2 ring-amber-400 rounded" />
                  <span className="text-gray-300">Current</span>
                </div>
              </div>
            </div>

            {state.callStack && state.callStack.length > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <List size={14} /> Call Stack (Recursion Depth: {state.callStack.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {state.callStack.map((cell, idx) => (
                    <div key={idx} className="px-3 py-1 bg-gray-700 rounded-lg text-sm font-mono text-cyan-300">
                      ({cell[0]},{cell[1]})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation || "Load inputs to begin."}</p>

                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg text-sm text-gray-300 space-y-1">
                  <div><strong>Algorithm:</strong> Top-Down DP (Memoization)</div>
                  <div><strong>Base Cases:</strong></div>
                  <ul className="ml-4 text-xs space-y-1">
                    <li>• Out of bounds → 0 paths</li>
                    <li>• Reached destination → 1 path</li>
                    <li>• Already computed → use memo</li>
                  </ul>
                  <div className="pt-2"><strong>Recurrence:</strong> <span className="font-mono text-cyan-300">paths(i,j) = paths(i,j+1) + paths(i+1,j)</span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Result
                </h4>
                <div className="text-3xl font-mono text-green-400">
                  {state.finalResult || (state.memo && state.memo[0] && state.memo[0][0] !== -1 ? state.memo[0][0] : "?")}
                </div>
                <div className="mt-2 text-xs text-gray-400">Total unique paths</div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity Analysis
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong> <span className="font-mono text-teal-300">O(m × n)</span> — Each cell computed once and memoized
                </div>
                <div>
                  <strong>Space:</strong> <span className="font-mono text-teal-300">O(m × n)</span> — Memoization table + recursion stack
                </div>
                <div>
                  <strong>Optimization:</strong> Can be further optimized to O(n) space using bottom-up DP with a 1D array
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

export default UniquePathsVisualizer;