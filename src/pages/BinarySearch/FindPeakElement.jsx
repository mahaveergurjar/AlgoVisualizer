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
  Code,
  Play,
  Pause,
  RotateCw,
  FileText,
  Clock,
  CheckCircle,
  Terminal,
  Activity,
  Mountain,
} from "lucide-react";

// A standardized Pointer component for the visualizer
const VisualizerPointer = ({
  index,
  total,
  label,
  color = "green",
  position = "bottom",
}) => {
  if (index === null || index < 0 || index >= total) return null;
  const left = `${((index + 0.5) / total) * 100}%`;
  const colorClasses = {
    green: "border-b-green-400 text-green-400",
    red: "border-b-red-400 text-red-400",
    blue: "border-b-blue-400 text-blue-400",
  };
  const topColorClasses = {
    green: "border-t-green-400 text-green-400",
    red: "border-t-red-400 text-red-400",
    blue: "border-t-blue-400 text-blue-400",
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

const FindPeakElement = () => {
  const [arrInput, setArrInput] = useState("1,2,3,1");
  const [array, setArray] = useState([]);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  const load = useCallback(() => {
    const arr = arrInput.split(",").map((s) => parseInt(s.trim(), 10));
    if (arr.some(isNaN) || arr.length === 0) {
      alert("Invalid input");
      return;
    }
    setArray(arr);

    const newHistory = [];
    const add = (s) => newHistory.push({ array: arr, ...s });

    let l = 0,
      r = arr.length - 1;
    add({ l, r, mid: null, message: "Initialize search pointers.", line: 2 });
    while (l < r) {
      const mid = Math.floor((l + r) / 2);
      add({
        l,
        r,
        mid,
        message: `Check if arr[mid] (${arr[mid]}) < arr[mid+1] (${
          arr[mid + 1]
        })`,
        line: 4,
      });
      if (arr[mid] < arr[mid + 1]) {
        l = mid + 1;
        add({
          l,
          r,
          mid,
          message: "Condition is true. A peak must be in the right half.",
          line: 5,
        });
      } else {
        r = mid;
        add({
          l,
          r,
          mid,
          message:
            "Condition is false. Peak is in the left half (including mid).",
          line: 6,
        });
      }
    }
    add({
      l,
      r,
      mid: l,
      peak: l,
      message: `Loop terminates. Peak found at index ${l}.`,
      line: 8,
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [arrInput]);

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
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

  const codeContent = useMemo(
    () => ({
      1: `int findPeakElement(vector<int>& nums) {`,
      2: `    int l = 0, r = nums.size() - 1;`,
      3: `    while (l < r) {`,
      4: `        int mid = l + (r - l) / 2;`,
      5: `        if (nums[mid] < nums[mid + 1]) l = mid + 1;`,
      6: `        else r = mid;`,
      7: `    }`,
      8: `    return l; // or r, since l == r`,
      9: `}`,
    }),
    []
  );

  const arrayToDisplay = state.array || array;
  const { line, l, r, mid, peak, message } = state;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto relative">
      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-teal-400 to-green-300">
          Find Peak Element
        </h1>
        <p className="text-gray-400 mt-3 text-base max-w-2xl mx-auto">
          Visualizing an O(log n) binary search approach to find any peak in an
          array.
        </p>
      </header>

      {/* --- START: REPLACED SECTION --- */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={arrInput}
            onChange={(e) => setArrInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
            placeholder="Array (comma-separated)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-green-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-green-600 transition shadow"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-green-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow-inner">
                {currentStep + 1}/{history.length}
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
      {/* --- END: REPLACED SECTION --- */}

      {!isLoaded ? (
        <div className="mt-12 text-center text-gray-500 animate-pulse">
          Enter an array to begin the visualization.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10 animate-[fadeIn_0.5s_ease-in-out]">
          <aside className="lg:col-span-2 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
            <h3 className="text-green-300 flex items-center gap-2 font-semibold mb-3 text-lg">
              <FileText size={18} /> Algorithm Steps
            </h3>
            <pre className="bg-gray-950/70 rounded-lg border border-gray-800 p-3 font-mono text-sm max-h-[60vh] overflow-y-auto">
              {Object.entries(codeContent).map(([ln, txt]) => (
                <div
                  key={ln}
                  className={`flex items-start rounded-sm transition-colors ${
                    line === parseInt(ln, 10) ? "bg-green-500/10" : ""
                  }`}
                >
                  <span className="text-gray-600 w-8 mr-3 text-right select-none pt-0.5">
                    {ln}
                  </span>
                  <div className="flex-1 whitespace-pre-wrap pt-0.5">{txt}</div>
                </div>
              ))}
            </pre>
          </aside>

          <section className="lg:col-span-3 flex flex-col gap-6">
            <div className="relative p-6 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
              <h3 className="text-lg font-semibold text-green-300 mb-4 text-center">
                Array Visualization
              </h3>
              <div className="relative h-24 w-full">
                {arrayToDisplay.map((value, index) => (
                  <div
                    key={index}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${((index + 0.5) / arrayToDisplay.length) * 100}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold transition-all duration-300 ${
                        index === peak
                          ? "bg-green-500 scale-110 ring-2 ring-green-300"
                          : l <= r && index >= l && index <= r
                          ? "bg-gray-700"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {value}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">[{index}]</div>
                  </div>
                ))}
                <VisualizerPointer
                  index={l}
                  total={arrayToDisplay.length}
                  label="L"
                  color="red"
                />
                <VisualizerPointer
                  index={r}
                  total={arrayToDisplay.length}
                  label="R"
                  color="red"
                />
                <VisualizerPointer
                  index={mid}
                  total={arrayToDisplay.length}
                  label="MID"
                  color="blue"
                  position="top"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-gray-300 text-sm mb-2 font-semibold flex items-center gap-2">
                <Activity size={16} /> Explanation
              </h4>
              <p className="text-gray-200 min-h-[2rem] text-center font-medium">
                {message || "..."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
                <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300">
                  <Terminal size={16} /> Pointers
                </h4>
                <div className="text-3xl font-mono text-red-300">
                  L={l ?? "-"} | R={r ?? "-"}
                </div>
              </div>
              <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
                <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300">
                  <Code size={16} /> Mid Value
                </h4>
                <div className="text-3xl font-mono text-blue-300">
                  {mid !== null ? arrayToDisplay[mid] : "-"}
                </div>
              </div>
              <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
                <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300">
                  <Mountain size={16} /> Peak Index
                </h4>
                <div className="text-3xl font-bold text-emerald-300">
                  {peak ?? "..."}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-cyan-300">O(log n)</span> -
                  The search space is halved in each step.
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-cyan-300">O(1)</span> - No
                  extra space is used besides pointers.
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default FindPeakElement;
