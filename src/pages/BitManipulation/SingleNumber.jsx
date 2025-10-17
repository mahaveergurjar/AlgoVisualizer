import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, List, FileText, Play, Pause, Clock, CheckCircle, Cpu } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "int singleNumber(vector<int>& nums) {" },
    { l: 2, t: "    int result = 0;" },
    { l: 3, t: "    for (int x : nums) {" },
    { l: 4, t: "        result ^= x;" },
    { l: 5, t: "    }" },
    { l: 6, t: "    return result;" },
    { l: 7, t: "}" },
  ],
  Python: [
    { l: 1, t: "def singleNumber(nums):" },
    { l: 2, t: "    result = 0" },
    { l: 3, t: "    for x in nums:" },
    { l: 4, t: "        result ^= x" },
    { l: 5, t: "    return result" },
  ],
  Java: [
    { l: 1, t: "public int singleNumber(int[] nums) {" },
    { l: 2, t: "    int result = 0;" },
    { l: 3, t: "    for (int x : nums) {" },
    { l: 4, t: "        result ^= x;" },
    { l: 5, t: "    }" },
    { l: 6, t: "    return result;" },
    { l: 7, t: "}" },
  ],
};

const formatBinary = (num, bits) => {
  const mask = (1n << BigInt(bits)) - 1n;
  const bn = BigInt(num) & mask;
  let s = bn.toString(2);
  if (s.length > bits) s = s.slice(-bits);
  return s.padStart(bits, "0");
};

const chunkBits = (binStr) => binStr.split("").map((b, i) => ({ b, idx: i }));

const SingleNumberVisualizer = () => {
  // inputs
  const [numsInput, setNumsInput] = useState("2,2,1");
  const [bitWidth, setBitWidth] = useState(8);

  // parsed
  const [nums, setNums] = useState([]);

  // history & state
  // each state: { index, before, current, after, explanation, binBefore, binCurrent, binAfter, line, bestValue }
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // UI controls
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [activeLang, setActiveLang] = useState("C++");
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  // generate history
  const generateHistory = useCallback((arr, bits) => {
    const newHistory = [];
    let acc = 0;

    const add = (obj) => newHistory.push({ bestValue: acc, ...obj });

    add({ index: null, before: acc, current: null, after: acc, explanation: `Initialize accumulator to 0.`, binBefore: formatBinary(acc, bits), binCurrent: null, binAfter: formatBinary(acc, bits), line: 2 });

    for (let i = 0; i < arr.length; i++) {
      const cur = arr[i];
      // snapshot before operation
      add({ index: i, before: acc, current: cur, after: null, explanation: `Preparing to XOR accumulator (${acc}) with nums[${i}] = ${cur}.`, binBefore: formatBinary(acc, bits), binCurrent: formatBinary(cur, bits), binAfter: null, line: 3 });

      const after = acc ^ cur;
      // compute line
      add({ index: i, before: acc, current: cur, after, explanation: `${acc} ^ ${cur} = ${after}`, binBefore: formatBinary(acc, bits), binCurrent: formatBinary(cur, bits), binAfter: formatBinary(after, bits), line: 4 });

      acc = after;
    }

    // final state
    add({ index: arr.length - 1, before: acc, current: null, after: acc, explanation: `Done. Single number is ${acc}.`, binBefore: formatBinary(acc, bits), binCurrent: null, binAfter: formatBinary(acc, bits), line: 6 });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // load and validate
  const load = () => {
    const arr = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    if (arr.length === 0 || arr.some(isNaN)) return alert("Invalid input. Enter comma-separated integers, e.g. 2,2,1");

    setNums(arr);
    setIsLoaded(true);
    generateHistory(arr, bitWidth);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  // step controls
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
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
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

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

  // helpers
  const formattedStep = () => {
    if (!isLoaded) return "0/0";
    return `${Math.max(0, currentStep + 1)}/${history.length}`;
  };

  const renderCodeLine = (lang, lineObj) => {
    const text = lineObj.t;
    const ln = lineObj.l;
    const active = state.line === ln;

    return (
      <div key={ln} className={`relative flex font-mono text-sm ${active ? "bg-green-500/10" : ""}`}>
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">{ln}</div>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">{text}</pre>
      </div>
    );
  };

  const bitCellClass = (row, idx) => {
    // highlight active bit when current step has bin strings
    if (!state.binBefore) return "bg-gray-700";

    const activeIdx = state.binAfter ? state.binAfter.length - 1 - idx : null; // mapping to show from left

    return "bg-gray-700";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-rose-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400">
          Single Number (Bitwise Visualizer)
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          XOR your way to the unique number - step through each operation
        </p>
      </header>

      {/* INPUT CONTROLS */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="nums (comma-separated)"
          />

          <select
            value={bitWidth}
            onChange={(e) => setBitWidth(parseInt(e.target.value, 10))}
            disabled={isLoaded}
            className="w-36 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
          >
            <option value={8}>8-bit</option>
            <option value={16}>16-bit</option>
            <option value={32}>32-bit</option>
            <option value={64}>64-bit</option>
          </select>

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 transition text-white font-bold shadow-lg"
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
                className="ml-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      {/* LANGUAGE TABS */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${activeLang === lang
                ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400"
                : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
                }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: XOR accumulation</span>
          </div>
        </div>
      </section>

      {/* MAIN */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter a list like <span className="text-rose-400 font-semibold">2,2,1</span> and click
          <span className="text-rose-400 font-semibold"> Load & Visualize</span> to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* CODE */}
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
              <div>Active line highlighted in green. Space toggles play/pause.</div>
              <div>Tip: Use &lt; or &gt; keys to step backward/forward</div>
            </div>
          </aside>

          {/* VISUALIZATION */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner flex flex-wrap gap-3">
              <div className="flex-1">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><List size={16} /> Numbers</h4>
                <div className="flex gap-3 flex-wrap items-center">
                  {nums.map((n, idx) => {
                    const selected = state.index === idx;
                    return (
                      <div key={idx} className={`relative w-36 h-24 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all ${selected
                        ? "bg-amber-500/80 shadow-[0_8px_30px_rgba(250,204,21,0.18)] ring-2 ring-amber-400"
                        : "bg-gradient-to-br from-slate-700 to-slate-600 shadow-md"
                      }`}>
                        {selected && <VisualizerPointer className="absolute -top-6" />}
                        <div className="text-xs text-gray-100">#{idx}</div>
                        <div className="text-sm">{n}</div>
                        <div className="text-xs text-gray-200 mt-1">{formatBinary(n, bitWidth)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-80">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><Clock size={14} /> Accumulator</h4>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">Accumulator snapshot</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">Before</div>
                      <div className="font-mono text-sm text-gray-200">{state.binBefore ?? formatBinary(0, bitWidth)}</div>
                      <div className="text-2xl font-mono text-green-400">{state.before ?? 0}</div>
                    </div>

                    <div className="flex-1">
                      <div className="text-xs text-gray-400">Current</div>
                      <div className="font-mono text-sm text-gray-200">{state.binCurrent ?? "-"}</div>
                      <div className="text-2xl font-mono text-rose-400">{state.current ?? "-"}</div>
                    </div>

                    <div className="flex-1">
                      <div className="text-xs text-gray-400">After</div>
                      <div className="font-mono text-sm text-gray-200">{state.binAfter ?? formatBinary(state.before ?? 0, bitWidth)}</div>
                      <div className="text-2xl font-mono text-teal-300">{state.after ?? state.before ?? 0}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div><span className="text-gray-400">Step:</span> {state.index !== null && state.index !== undefined ? `processing index ${state.index}` : "-"}</div>
                    <div className="mt-1"><span className="text-gray-400">Current result:</span> {state.after ?? state.bestValue ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* explanation & output */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><FileText size={14} /> Explanation</h4>
                <p className="text-gray-200">{state.explanation || "Step through XOR operations to see the accumulator evolve."}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div><strong>Operation:</strong> <span className="text-gray-200">result ^= x</span></div>
                  <div><strong>Active line:</strong> <span className="text-gray-200">{state.line ?? "-"}</span></div>
                  <div className="col-span-2 mt-2"><strong>Bitwidth:</strong> <span className="text-gray-200">{bitWidth}</span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><CheckCircle size={14} /> Output</h4>
                <div className="text-3xl font-mono text-green-400">{state.after ?? state.bestValue ?? 0}</div>
                <div className="mt-2 text-xs text-gray-400">Single number result: {state.after ?? state.bestValue ?? 0}</div>
                <div className="mt-3">
                  <h5 className="text-xs text-gray-300">Binary result</h5>
                  <div className="mt-2 font-mono text-sm text-gray-200">{state.binAfter ?? formatBinary(state.bestValue ?? 0, bitWidth)}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2"><Clock size={16} /> Complexity & Notes</h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(N)</span> - single pass XOR accumulation</div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(1)</span> - constant extra space</div>
                <div><strong>Note:</strong> Works because x ^ x = 0 and XOR is commutative.</div>
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

export default SingleNumberVisualizer;
