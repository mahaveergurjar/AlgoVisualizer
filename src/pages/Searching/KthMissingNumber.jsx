import React, { useState, useEffect, useCallback, useRef } from "react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "int findKthPositive(vector<int>& arr, int k) {" },
    { l: 2, t: "    int missing = 0, current = 1, i = 0;" },
    { l: 3, t: "    while (missing < k) {" },
    { l: 4, t: "        if (i < arr.size() && arr[i] == current) {" },
    { l: 5, t: "            i++;" },
    { l: 6, t: "        } else {" },
    { l: 7, t: "            missing++;" },
    { l: 8, t: "            if (missing == k) return current;" },
    { l: 9, t: "        }" },
    { l: 10, t: "        current++;" },
    { l: 11, t: "    }" },
    { l: 12, t: "    return current - 1;" },
    { l: 13, t: "}" },
  ],
  Python: [
    { l: 1, t: "def findKthPositive(arr, k):" },
    { l: 2, t: "    missing = 0" },
    { l: 3, t: "    current = 1" },
    { l: 4, t: "    i = 0" },
    { l: 5, t: "    while missing < k:" },
    { l: 6, t: "        if i < len(arr) and arr[i] == current:" },
    { l: 7, t: "            i += 1" },
    { l: 8, t: "        else:" },
    { l: 9, t: "            missing += 1" },
    { l: 10, t: "            if missing == k:" },
    { l: 11, t: "                return current" },
    { l: 12, t: "        current += 1" },
    { l: 13, t: "    return current - 1" },
  ],
  Java: [
    { l: 1, t: "public int findKthPositive(int[] arr, int k) {" },
    { l: 2, t: "    int missing = 0, current = 1, i = 0;" },
    { l: 3, t: "    while (missing < k) {" },
    { l: 4, t: "        if (i < arr.length && arr[i] == current) {" },
    { l: 5, t: "            i++;" },
    { l: 6, t: "        } else {" },
    { l: 7, t: "            missing++;" },
    { l: 8, t: "            if (missing == k) return current;" },
    { l: 9, t: "        }" },
    { l: 10, t: "        current++;" },
    { l: 11, t: "    }" },
    { l: 12, t: "    return current - 1;" },
    { l: 13, t: "}" },
  ],
};

const KthMissingNumber = () => {
  const [arrayInput, setArrayInput] = useState("2,3,4,7,11");
  const [kInput, setKInput] = useState("5");
  const [arr, setArr] = useState([]);
  const [k, setK] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [activeLang, setActiveLang] = useState("C++");
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  const generateHistory = useCallback((array, targetK) => {
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        current: 1,
        i: 0,
        missing: 0,
        line: null,
        explanation: "",
        missingNumbers: [],
        result: null,
        ...props,
      });

    addState({
      line: 2,
      explanation: `Initialize: current=1, i=0, missing=0. Looking for ${targetK}th missing positive number.`,
    });

    let missing = 0;
    let current = 1;
    let i = 0;
    const missingNumbers = [];

    while (missing < targetK) {
      addState({
        current,
        i,
        missing,
        line: 3,
        missingNumbers: [...missingNumbers],
        explanation: `Check: current=${current}. Missing count=${missing}, need ${targetK}.`,
      });

      if (i < array.length && array[i] === current) {
        addState({
          current,
          i,
          missing,
          line: 4,
          missingNumbers: [...missingNumbers],
          explanation: `${current} is in array at index ${i}. Skip it.`,
        });

        i++;

        addState({
          current,
          i,
          missing,
          line: 5,
          missingNumbers: [...missingNumbers],
          explanation: `Move array pointer: i=${i}.`,
        });
      } else {
        addState({
          current,
          i,
          missing,
          line: 6,
          missingNumbers: [...missingNumbers],
          explanation: `${current} is NOT in array. It's missing!`,
        });

        missing++;
        missingNumbers.push(current);

        addState({
          current,
          i,
          missing,
          line: 7,
          missingNumbers: [...missingNumbers],
          explanation: `Missing count increased to ${missing}. Found missing: [${missingNumbers.join(", ")}]`,
        });

        if (missing === targetK) {
          addState({
            current,
            i,
            missing,
            line: 8,
            missingNumbers: [...missingNumbers],
            result: current,
            explanation: `🎉 Found ${targetK}th missing number: ${current}!`,
          });
          setHistory(newHistory);
          setCurrentStep(0);
          return;
        }
      }

      current++;

      addState({
        current,
        i,
        missing,
        line: 10,
        missingNumbers: [...missingNumbers],
        explanation: `Move to next number: current=${current}.`,
      });
    }

    addState({
      current: current - 1,
      i,
      missing,
      line: 12,
      missingNumbers: [...missingNumbers],
      result: current - 1,
      explanation: `Done! ${targetK}th missing positive: ${current - 1}.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const array = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const kVal = parseInt(kInput, 10);

    if (array.length === 0 || array.some(isNaN) || isNaN(kVal) || kVal < 1) {
      return alert("Invalid input. Enter comma-separated positive integers and k >= 1.");
    }

    setArr(array);
    setK(kVal);
    setIsLoaded(true);
    generateHistory(array, kVal);
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

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
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
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

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

  const renderCodeLine = (lineObj) => {
    const { l, t } = lineObj;
    const active = state.line === l;

    return (
      <div
        key={l}
        className={`relative flex font-mono text-sm ${active ? "bg-green-500/10" : ""}`}
      >
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">
          {l}
        </div>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">{t}</pre>
      </div>
    );
  };

  const arrayIndexClass = (idx) => {
    if (state.i === idx) return "bg-blue-500 ring-2 ring-blue-300";
    if (state.i > idx) return "bg-gray-600";
    return "bg-gray-700";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-900 min-h-screen text-white">
      <div className="absolute top-8 right-12 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          Kth Missing Positive Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
          Find the kth missing positive number from a sorted array
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400"
            placeholder="sorted array (comma-separated)"
          />
          <input
            type="text"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
            disabled={isLoaded}
            className="w-32 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400"
            placeholder="k value"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold cursor-pointer"
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
                  ←
                </button>
                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 transition"
                >
                  {playing ? "⏸" : "▶"}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition"
                >
                  →
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200">
                {formattedStep()}
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
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
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
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${
                activeLang === lang
                  ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter sorted array and k value, then click
          <span className="text-cyan-400 font-semibold"> Load & Visualize</span>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                📄 Code
              </h3>
              <div className="text-sm text-gray-400">{activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map(renderCodeLine)}
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-3">📊 Array (pointer at i={state.i ?? 0})</h4>
              <div className="flex gap-3 flex-wrap mb-4">
                {arr.map((num, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all ${arrayIndexClass(
                      idx
                    )}`}
                  >
                    <div className="text-xs text-gray-300">[{idx}]</div>
                    <div className="text-lg">{num}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Current</div>
                  <div className="text-xl font-mono text-cyan-300">{state.current ?? 1}</div>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Missing Count</div>
                  <div className="text-xl font-mono text-amber-300">{state.missing ?? 0}</div>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Target k</div>
                  <div className="text-xl font-mono text-pink-300">{k}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2">🔢 Missing Numbers Found</h4>
              <div className="flex gap-2 flex-wrap min-h-[2.5rem]">
                {(state.missingNumbers || []).map((num, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg font-mono text-sm ${
                      idx === state.missingNumbers.length - 1 && state.result === null
                        ? "bg-amber-500 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {num}
                  </div>
                ))}
                {(!state.missingNumbers || state.missingNumbers.length === 0) && (
                  <div className="text-gray-500 italic text-sm">None yet...</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2">📝 Explanation</h4>
                <p className="text-gray-200">{state.explanation || "Load and visualize to begin"}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2">
                  {state.result !== null ? "✓" : "⏳"} Result
                </h4>
                <div className={`text-3xl font-mono ${state.result !== null ? "text-green-400" : "text-gray-400"}`}>
                  {state.result !== null ? state.result : "..."}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {state.result !== null ? `${k}th missing: ${state.result}` : "Computing..."}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-green-300 font-semibold mb-3">⏱ Complexity & Approach</h4>
              <div className="text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong> <span className="font-mono text-teal-300">O(N + K)</span> — linear scan through array + missing numbers
                </div>
                <div>
                  <strong>Space:</strong> <span className="font-mono text-teal-300">O(1)</span> — constant extra space
                </div>
                <div>
                  <strong>Approach:</strong> Check each positive integer starting from 1. If it's in array, skip. Otherwise, count as missing.
                </div>
                <div>
                  <strong>Optimization:</strong> Binary search approach can solve in O(log N) + O(1) extra
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default KthMissingNumber;