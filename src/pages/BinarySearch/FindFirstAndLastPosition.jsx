import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCw,
  FileText,
  Clock,
  CheckCircle,
  Terminal,
} from "lucide-react";

// The Pointer component adapted for this layout
const VisualizerPointer = ({
  index,
  total,
  label,
  color = "blue",
  position = "bottom",
}) => {
  if (index === null || index < 0 || index >= total) return null;
  const left = `${((index + 0.5) / total) * 100}%`;
  const colorClasses = {
    blue: "border-b-blue-400 text-blue-400",
    teal: "border-b-teal-400 text-teal-400",
    red: "border-b-red-400 text-red-400",
    green: "border-b-green-400 text-green-400",
  };
  const topColorClasses = {
    blue: "border-t-blue-400 text-blue-400",
    teal: "border-t-teal-400 text-teal-400",
    red: "border-t-red-400 text-red-400",
    green: "border-t-green-400 text-green-400",
  };

  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-300"
      style={{
        left,
        transform: "translateX(-50%)",
        top: position === "top" ? "auto" : "100%",
        bottom: position === "top" ? "100%" : "auto",
      }}
    >
      {position === "top" ? (
        <div className="mb-1 flex flex-col items-center">
          <span className={`text-sm font-bold ${topColorClasses[color]} mb-1`}>
            {label}
          </span>
          <div
            className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${topColorClasses[color]}`}
          />
        </div>
      ) : (
        <div className="mt-1 flex flex-col items-center">
          <div
            className={`w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent ${colorClasses[color]}`}
          />
          <span className={`text-sm font-bold ${colorClasses[color]} mt-1`}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

const FindFirstAndLastPosition = () => {
  const [arrInput, setArrInput] = useState("5,7,7,8,8,10");
  const [targetInput, setTargetInput] = useState("8");

  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(0);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  const generateHistory = useCallback(() => {
    const arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10));
    const tgt = parseInt(targetInput, 10);
    if (arr.some(isNaN) || isNaN(tgt)) {
      alert("Invalid input");
      return;
    }
    setArray(arr);
    setTarget(tgt);

    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, target: tgt, ...s });

    // Left boundary search
    let l = 0,
      r = arr.length - 1,
      leftBoundary = -1,
      rightBoundary = -1;
    add({
      phase: "left",
      l,
      r,
      mid: null,
      leftBoundary,
      rightBoundary,
      message: `Searching for the first occurrence of ${tgt}.`,
      line: 5,
    });
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      add({
        phase: "left",
        l,
        r,
        mid,
        leftBoundary,
        rightBoundary,
        message: `Checking index ${mid}. Value is ${arr[mid]}.`,
        line: 7,
      });
      if (arr[mid] === tgt) {
        leftBoundary = mid;
        r = mid - 1;
        add({
          phase: "left",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `Found target. Storing index ${mid} and searching left.`,
          line: 8,
        });
      } else if (arr[mid] < tgt) {
        l = mid + 1;
        add({
          phase: "left",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} < ${tgt}. Moving left pointer right.`,
          line: 9,
        });
      } else {
        r = mid - 1;
        add({
          phase: "left",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} > ${tgt}. Moving right pointer left.`,
          line: 10,
        });
      }
    }

    // Right boundary search
    l = 0;
    r = arr.length - 1;
    add({
      phase: "right",
      l,
      r,
      mid: null,
      leftBoundary,
      rightBoundary,
      message: `Searching for the last occurrence of ${tgt}.`,
      line: 13,
    });
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      add({
        phase: "right",
        l,
        r,
        mid,
        leftBoundary,
        rightBoundary,
        message: `Checking index ${mid}. Value is ${arr[mid]}.`,
        line: 15,
      });
      if (arr[mid] === tgt) {
        rightBoundary = mid;
        l = mid + 1;
        add({
          phase: "right",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `Found target. Storing index ${mid} and searching right.`,
          line: 16,
        });
      } else if (arr[mid] < tgt) {
        l = mid + 1;
        add({
          phase: "right",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} < ${tgt}. Moving left pointer right.`,
          line: 17,
        });
      } else {
        r = mid - 1;
        add({
          phase: "right",
          l,
          r,
          mid,
          leftBoundary,
          rightBoundary,
          message: `${arr[mid]} > ${tgt}. Moving right pointer left.`,
          line: 18,
        });
      }
    }

    add({
      phase: "result",
      l,
      r,
      leftBoundary,
      rightBoundary,
      message: `Search complete. Result is [${leftBoundary}, ${rightBoundary}].`,
      line: 20,
    });
    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [arrInput, targetInput]);

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    clearInterval(playRef.current);
  };
  const stepForward = useCallback(
    () => currentStep < history.length - 1 && setCurrentStep((s) => s + 1),
    [currentStep, history.length]
  );
  const stepBackward = useCallback(
    () => currentStep > 0 && setCurrentStep((s) => s - 1),
    [currentStep]
  );
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  useEffect(() => {
    if (isPlaying) {
      if (currentStep >= history.length - 1) {
        setIsPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            clearInterval(playRef.current);
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, speed, history.length, currentStep]);

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
    // Corrected line with capital 'K'
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

  const codeContent = useMemo(
    () => ({
      1: `vector<int> searchRange(vector<int>& nums, int target) {`,
      3: `    int left = -1, right = -1;`,
      4: `    // Find first occurrence`,
      5: `    int l = 0, r = nums.size() - 1;`,
      6: `    while (l <= r) {`,
      7: `        int mid = l + (r - l) / 2;`,
      8: `        if (nums[mid] == target) { left = mid; r = mid - 1; }`,
      9: `        else if (nums[mid] < target) l = mid + 1;`,
      10: `       else r = mid - 1;`,
      11: `   }`,
      12: `   // Find last occurrence`,
      13: `   l = 0; r = nums.size() - 1;`,
      14: `   while (l <= r) {`,
      15: `       int mid = l + (r - l) / 2;`,
      16: `       if (nums[mid] == target) { right = mid; l = mid + 1; }`,
      17: `       else if (nums[mid] < target) l = mid + 1;`,
      18: `       else r = mid - 1;`,
      19: `   }`,
      20: `   return {left, right};`,
      21: `}`,
    }),
    []
  );

  const arrayToDisplay = state.array || array;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <style>{`.animate-highlight { animation: highlight-anim 700ms ease forwards; } @keyframes highlight-anim { 0% { background-color: rgba(20,184,166,0.0); } 30% { background-color: rgba(20,184,166,0.2); } 100% { background-color: rgba(20,184,166,0.1); } }`}</style>
      <div className="px-6 py-8 max-w-7xl mx-auto relative">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-teal-500/10 rounded-full blur-3xl -z-0" />

        <header className="relative z-10 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
            Find First and Last Position of Element
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Visualizing two binary searches to find the start and end indices of
            a target value.
          </p>
        </header>

        {/* --- CONTROLS SECTION --- */}
        <section className="mb-6 z-10 relative p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              type="text"
              value={arrInput}
              onChange={(e) => setArrInput(e.target.value)}
              disabled={isLoaded}
              className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-teal-400"
              placeholder="Array (comma-separated)"
            />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              disabled={isLoaded}
              className="w-48 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-teal-400"
              placeholder="Target"
            />

            {!isLoaded ? (
              <button
                onClick={generateHistory}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-90 transition text-white font-bold shadow-lg"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="p-3 rounded-full bg-gray-700 hover:bg-teal-600 disabled:opacity-40 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-gray-700 hover:bg-teal-600 transition"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="p-3 rounded-full bg-gray-700 hover:bg-teal-600 disabled:opacity-40 transition"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200">
                  {currentStep + 1}/{history.length}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">Speed</label>
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={speed}
                    onChange={(e) =>
                      setSpeed(2100 - parseInt(e.target.value, 10))
                    }
                    className="w-24"
                  />
                </div>
                <button
                  onClick={resetAll}
                  className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
                >
                  <RotateCw size={16} /> Reset
                </button>
              </>
            )}
          </div>
        </section>

        {/* --- MAIN GRID --- */}
        {!isLoaded ? (
          <div className="mt-10 text-center text-gray-400">
            Enter a comma-separated array and a target, then click{" "}
            <span className="font-semibold text-teal-400">
              Load & Visualize
            </span>
            .
          </div>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* LEFT: CODE */}
            <aside className="lg:col-span-1 p-4 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
              <h3 className="text-teal-300 flex items-center gap-2 font-semibold mb-3">
                <FileText size={18} /> Algorithm Steps
              </h3>
              <pre className="bg-[#0b1020] rounded-lg border border-gray-700/80 p-3 max-h-[640px] overflow-auto text-sm font-mono">
                {Object.entries(codeContent).map(([ln, txt]) => (
                  <div
                    key={ln}
                    className={`flex items-start ${
                      state.line === parseInt(ln, 10)
                        ? "bg-teal-500/10 animate-highlight"
                        : ""
                    }`}
                  >
                    <span className="text-gray-600 w-8 mr-3 text-right select-none">
                      {ln}
                    </span>
                    <div className="flex-1 whitespace-pre-wrap">{txt}</div>
                  </div>
                ))}
              </pre>
            </aside>

            {/* RIGHT: VISUALIZATION */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              <div className="relative p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
                <h3 className="text-lg font-semibold text-teal-300 mb-4">
                  {state.phase === "left"
                    ? "Phase 1: Finding First Occurrence"
                    : state.phase === "right"
                    ? "Phase 2: Finding Last Occurrence"
                    : "Result"}
                </h3>
                <div className="relative h-24 w-full">
                  {arrayToDisplay.map((value, index) => (
                    <div
                      key={index}
                      className="absolute flex flex-col items-center"
                      style={{
                        left: `${
                          ((index + 0.5) / arrayToDisplay.length) * 100
                        }%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold transition-colors ${
                          value === target ? "bg-teal-600" : "bg-gray-700"
                        }`}
                      >
                        {value}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        [{index}]
                      </div>
                    </div>
                  ))}
                  <VisualizerPointer
                    index={state.l}
                    total={arrayToDisplay.length}
                    label="L"
                    color="red"
                  />
                  <VisualizerPointer
                    index={state.r}
                    total={arrayToDisplay.length}
                    label="R"
                    color="red"
                  />
                  <VisualizerPointer
                    index={state.mid}
                    total={arrayToDisplay.length}
                    label="MID"
                    color="blue"
                    position="top"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-gray-300 text-sm mb-2 font-semibold">
                    Explanation
                  </h4>
                  <p className="text-gray-200 min-h-[3rem]">
                    {state.message || "..."}
                  </p>
                </div>
                <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-gray-300 text-sm mb-2 font-semibold flex items-center gap-2">
                    <Terminal size={16} /> Search State
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-400">Left (L):</span>{" "}
                      <span className="font-mono text-red-300">
                        {state.l ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Right (R):</span>{" "}
                      <span className="font-mono text-red-300">
                        {state.r ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mid:</span>{" "}
                      <span className="font-mono text-blue-300">
                        {state.mid ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mid Val:</span>{" "}
                      <span className="font-mono text-blue-300">
                        {state.mid != null ? arrayToDisplay[state.mid] : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2 text-green-300">
                    <CheckCircle size={16} /> Result Boundaries
                  </h4>
                  <div className="text-2xl font-mono text-green-400">
                    [{(state.leftBoundary ?? "?", state.rightBoundary ?? "?")}]
                  </div>
                </div>
                <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-teal-300 font-semibold flex items-center gap-2 mb-2">
                    <Clock size={16} /> Complexity
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>
                      <strong>Time:</strong>{" "}
                      <span className="font-mono text-cyan-300">O(log n)</span>{" "}
                      — Two separate binary searches are performed.
                    </div>
                    <div>
                      <strong>Space:</strong>{" "}
                      <span className="font-mono text-cyan-300">O(1)</span> —
                      The algorithm requires constant extra space.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default FindFirstAndLastPosition;
