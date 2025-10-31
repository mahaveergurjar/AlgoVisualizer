import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Terminal,
  FileText,
  Clock,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "int specialArray(vector<int>& nums) {" },
    { l: 2, t: "    int n = nums.size();" },
    { l: 3, t: "    for (int x = 0; x <= n; x++) {" },
    { l: 4, t: "        int count = 0;" },
    { l: 5, t: "        for (int i = 0; i < n; i++) {" },
    { l: 6, t: "            if (nums[i] >= x) count++;" },
    { l: 7, t: "        }" },
    { l: 8, t: "        if (count == x) return x;" },
    { l: 9, t: "    }" },
    { l: 10, t: "    return -1;" },
    { l: 11, t: "}" },
  ],
  Python: [
    { l: 1, t: "def specialArray(nums):" },
    { l: 2, t: "    n = len(nums)" },
    { l: 3, t: "    for x in range(n + 1):" },
    { l: 4, t: "        count = 0" },
    { l: 5, t: "        for num in nums:" },
    { l: 6, t: "            if num >= x:" },
    { l: 7, t: "                count += 1" },
    { l: 8, t: "        if count == x:" },
    { l: 9, t: "            return x" },
    { l: 10, t: "    return -1" },
  ],
  Java: [
    { l: 1, t: "public int specialArray(int[] nums) {" },
    { l: 2, t: "    int n = nums.length;" },
    { l: 3, t: "    for (int x = 0; x <= n; x++) {" },
    { l: 4, t: "        int count = 0;" },
    { l: 5, t: "        for (int i = 0; i < n; i++) {" },
    { l: 6, t: "            if (nums[i] >= x) count++;" },
    { l: 7, t: "        }" },
    { l: 8, t: "        if (count == x) return x;" },
    { l: 9, t: "    }" },
    { l: 10, t: "    return -1;" },
    { l: 11, t: "}" },
  ],
};

const SpecialArray = () => {
  const [arrayInput, setArrayInput] = useState("3,5,0,8,4");
  const [nums, setNums] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [activeLang, setActiveLang] = useState("C++");
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  const generateHistory = useCallback((arr) => {
    const n = arr.length;
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        x: null,
        count: 0,
        currentIndex: null,
        line: null,
        explanation: "",
        result: null,
        checking: [],
        ...props,
      });

    addState({ 
      line: 2, 
      explanation: `Starting search. Array has ${n} elements. We'll check x from 0 to ${n}.` 
    });

    for (let x = 0; x <= n; x++) {
      addState({
        x,
        line: 3,
        explanation: `Checking if x = ${x} is special. Need exactly ${x} numbers ≥ ${x}.`,
      });

      let count = 0;
      const checking = [];

      for (let i = 0; i < n; i++) {
        addState({
          x,
          count,
          currentIndex: i,
          line: 5,
          checking: [...checking],
          explanation: `Examining nums[${i}] = ${arr[i]}. Is ${arr[i]} ≥ ${x}?`,
        });

        if (arr[i] >= x) {
          count++;
          checking.push(i);
          addState({
            x,
            count,
            currentIndex: i,
            line: 6,
            checking: [...checking],
            explanation: `Yes! ${arr[i]} ≥ ${x}. Count increases to ${count}.`,
          });
        } else {
          addState({
            x,
            count,
            currentIndex: i,
            line: 6,
            checking: [...checking],
            explanation: `No. ${arr[i]} < ${x}. Count stays ${count}.`,
          });
        }
      }

      addState({
        x,
        count,
        line: 8,
        checking: [...checking],
        explanation: `Finished counting for x = ${x}. Found ${count} elements ≥ ${x}.`,
      });

      if (count === x) {
        addState({
          x,
          count,
          line: 8,
          checking: [...checking],
          result: x,
          explanation: `🎉 Found it! Count (${count}) equals x (${x}). Returning ${x}.`,
        });
        setHistory(newHistory);
        setCurrentStep(0);
        return;
      } else {
        addState({
          x,
          count,
          line: 8,
          checking: [...checking],
          explanation: `Count (${count}) ≠ x (${x}). Continue searching...`,
        });
      }
    }

    addState({
      line: 10,
      result: -1,
      explanation: `No special value found. Returning -1.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const arr = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    if (arr.length === 0 || arr.some(isNaN)) {
      return alert("Invalid input. Enter comma-separated numbers.");
    }

    setNums(arr);
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

  const cellClass = (idx) => {
    if (state.currentIndex === idx) return "bg-blue-500 ring-2 ring-blue-300";
    if (state.checking?.includes(idx)) return "bg-green-600";
    return "bg-gray-700";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
          Special Array Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
          Find x where exactly x numbers are ≥ x
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-purple-400"
            placeholder="array (comma-separated)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 transition text-white font-bold cursor-pointer"
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
                  onClick={togglePlay}
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
                  ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-400"
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
          Enter array values then click
          <span className="text-purple-400 font-semibold"> Load & Visualize</span>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">{activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map(renderCodeLine)}
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Terminal size={16} /> Array Elements
              </h4>
              <div className="flex gap-3 flex-wrap">
                {nums.map((num, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all ${cellClass(
                      idx
                    )}`}
                  >
                    <div className="text-xs text-gray-300">[{idx}]</div>
                    <div className="text-lg">{num}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-300">
                <div>
                  <strong>Testing x =</strong> {state.x ?? "-"}
                </div>
                <div>
                  <strong>Count ≥ x:</strong> {state.count ?? 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation || "Load and visualize to begin"}</p>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  {state.result !== null && state.result !== -1 ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : state.result === -1 ? (
                    <XCircle size={14} className="text-red-400" />
                  ) : (
                    <Terminal size={14} />
                  )}{" "}
                  Result
                </h4>
                <div className={`text-3xl font-mono ${state.result !== null && state.result !== -1 ? "text-green-400" : state.result === -1 ? "text-red-400" : "text-gray-400"}`}>
                  {state.result !== null ? state.result : "..."}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {state.result !== null && state.result !== -1
                    ? `Found special value: ${state.result}`
                    : state.result === -1
                    ? "No special value exists"
                    : "Searching..."}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong> <span className="font-mono text-teal-300">O(N²)</span> — check N+1 values, each requires O(N) scan
                </div>
                <div>
                  <strong>Space:</strong> <span className="font-mono text-teal-300">O(1)</span> — constant extra space
                </div>
                <div>
                  <strong>Optimization:</strong> Sort + binary search can achieve O(N log N)
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default SpecialArray;