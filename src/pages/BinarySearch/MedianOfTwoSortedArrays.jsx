import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Play,
  Pause,
  RotateCw,
  Cpu,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer"; // Assuming this component is available

const LANG_TABS = ["JavaScript"];

// Code snippet for the algorithm to be displayed in the UI
const CODE_SNIPPETS = {
  JavaScript: [
    { l: 1, t: "function findMedian(nums1, nums2) {" },
    {
      l: 2,
      t: "  if (nums1.length > nums2.length) return findMedian(nums2, nums1);",
    },
    { l: 3, t: "  const m = nums1.length, n = nums2.length;" },
    { l: 4, t: "  let left = 0, right = m;" },
    { l: 5, t: "  while (left <= right) {" },
    { l: 6, t: "    const p1 = Math.floor((left + right) / 2);" },
    { l: 7, t: "    const p2 = Math.floor((m + n + 1) / 2) - p1;" },
    { l: 8, t: "    const maxLeft1 = p1 === 0 ? -Infinity : nums1[p1 - 1];" },
    { l: 9, t: "    const minRight1 = p1 === m ? Infinity : nums1[p1];" },
    { l: 10, t: "    const maxLeft2 = p2 === 0 ? -Infinity : nums2[p2 - 1];" },
    { l: 11, t: "    const minRight2 = p2 === n ? Infinity : nums2[p2];" },
    { l: 12, t: "    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {" },
    { l: 13, t: "      if ((m + n) % 2 === 0) {" },
    {
      l: 14,
      t: "        return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;",
    },
    { l: 15, t: "      } else {" },
    { l: 16, t: "        return Math.max(maxLeft1, maxLeft2);" },
    { l: 17, t: "      }" },
    { l: 18, t: "    } else if (maxLeft1 > minRight2) {" },
    { l: 19, t: "      right = p1 - 1;" },
    { l: 20, t: "    } else {" },
    { l: 21, t: "      left = p1 + 1;" },
    { l: 22, t: "    }" },
    { l: 23, t: "  }" },
    { l: 24, t: "}" },
  ],
};

const MedianOfTwoSortedArrays = () => {
  const [inputArray1, setInputArray1] = useState("1,8,9");
  const [inputArray2, setInputArray2] = useState("2,3,5,6,7");

  const [array1, setArray1] = useState([]);
  const [array2, setArray2] = useState([]);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const playRef = useRef(null);

  const activeLang = "JavaScript"; // Only one language for this visualizer
  const state = history[currentStep] || {};

  // --- GENERATE HISTORY ---
  const generateMedianHistory = useCallback((nums1, nums2) => {
    const hist = [];
    const addState = (props) => hist.push({ ...props });

    if (nums1.length > nums2.length) {
      [nums1, nums2] = [nums2, nums1];
    }

    const m = nums1.length;
    const n = nums2.length;

    addState({
      line: 2,
      array1: [...nums1],
      array2: [...nums2],
      message: `Ensuring the first array is smaller. m=${m}, n=${n}`,
    });

    let left = 0,
      right = m;

    while (left <= right) {
      const p1 = Math.floor((left + right) / 2);
      const p2 = Math.floor((m + n + 1) / 2) - p1;

      addState({
        line: 6,
        array1: [...nums1],
        array2: [...nums2],
        partition1: p1,
        partition2: p2,
        message: `Looping... Trying partition p1=${p1} in array1 and p2=${p2} in array2.`,
      });

      const maxLeft1 = p1 === 0 ? -Infinity : nums1[p1 - 1];
      const minRight1 = p1 === m ? Infinity : nums1[p1];
      const maxLeft2 = p2 === 0 ? -Infinity : nums2[p2 - 1];
      const minRight2 = p2 === n ? Infinity : nums2[p2];

      const ml1 = maxLeft1 === -Infinity ? "−∞" : maxLeft1;
      const mr1 = minRight1 === Infinity ? "+∞" : minRight1;
      const ml2 = maxLeft2 === -Infinity ? "−∞" : maxLeft2;
      const mr2 = minRight2 === Infinity ? "+∞" : minRight2;

      addState({
        line: 8,
        array1: [...nums1],
        array2: [...nums2],
        partition1: p1,
        partition2: p2,
        maxLeft1: ml1,
        minRight1: mr1,
        maxLeft2: ml2,
        minRight2: mr2,
        message: `Checking partition boundaries: maxLeft1=${ml1}, minRight1=${mr1}, maxLeft2=${ml2}, minRight2=${mr2}.`,
      });

      if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
        let median;
        if ((m + n) % 2 === 0) {
          median =
            (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
          addState({
            line: 14,
            array1: [...nums1],
            array2: [...nums2],
            partition1: p1,
            partition2: p2,
            maxLeft1: ml1,
            minRight1: mr1,
            maxLeft2: ml2,
            minRight2: mr2,
            median,
            message: `Found partition! Total length is even. Median = (max(${ml1}, ${ml2}) + min(${mr1}, ${mr2})) / 2 = ${median}.`,
          });
        } else {
          median = Math.max(maxLeft1, maxLeft2);
          addState({
            line: 16,
            array1: [...nums1],
            array2: [...nums2],
            partition1: p1,
            partition2: p2,
            maxLeft1: ml1,
            minRight1: mr1,
            maxLeft2: ml2,
            minRight2: mr2,
            median,
            message: `Found partition! Total length is odd. Median = max(${ml1}, ${ml2}) = ${median}.`,
          });
        }
        setHistory(hist);
        setCurrentStep(0);
        return;
      } else if (maxLeft1 > minRight2) {
        addState({
          line: 19,
          array1: [...nums1],
          array2: [...nums2],
          partition1: p1,
          partition2: p2,
          maxLeft1: ml1,
          minRight1: mr1,
          maxLeft2: ml2,
          minRight2: mr2,
          message: `maxLeft1 (${ml1}) > minRight2 (${mr2}). Partition is too far right. Moving left.`,
        });
        right = p1 - 1;
      } else {
        addState({
          line: 21,
          array1: [...nums1],
          array2: [...nums2],
          partition1: p1,
          partition2: p2,
          maxLeft1: ml1,
          minRight1: mr1,
          maxLeft2: ml2,
          minRight2: mr2,
          message: `maxLeft2 (${ml2}) > minRight1 (${mr1}). Partition is too far left. Moving right.`,
        });
        left = p1 + 1;
      }
    }
    setHistory(hist);
    setCurrentStep(0);
  }, []);

  // --- CONTROLS ---
  const load = () => {
    const arr1 = inputArray1
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
    const arr2 = inputArray2
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (arr1.length === 0 && arr2.length === 0) {
      return alert("Please provide at least one array.");
    }
    setArray1(arr1);
    setArray2(arr2);
    setIsLoaded(true);
    generateMedianHistory(arr1, arr2);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    clearInterval(playRef.current);
  };

  const stepForward = useCallback(() => {
    if (currentStep < history.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, history.length]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

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
    if (currentStep >= history.length - 1 && history.length > 0) {
      setIsPlaying(false);
    }
  }, [currentStep, history.length]);

  // Keyboard navigation
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

  // --- RENDER HELPERS ---
  const renderCodeLine = (lineObj) => {
    const active = state.line === lineObj.l;
    return (
      <div
        key={lineObj.l}
        className={`flex font-mono text-sm ${active ? "bg-purple-500/10" : ""}`}
      >
        <span className="flex-none w-8 text-right text-gray-500 pr-3">
          {lineObj.l}
        </span>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">
          {lineObj.t}
        </pre>
      </div>
    );
  };

  const arrayToDisplay1 = state.array1 || array1;
  const arrayToDisplay2 = state.array2 || array2;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="px-6 py-8 max-w-7xl mx-auto relative">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-purple-500/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-12 right-12 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl -z-0" />

        <header className="relative z-10 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500">
            Median of Two Sorted Arrays
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Visualizing the binary search approach to find the median with
            O(log(min(m,n))) complexity.
          </p>
        </header>

        {/* --- CONTROLS SECTION --- */}
        <section className="mb-6 z-10 relative p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              type="text"
              value={inputArray1}
              onChange={(e) => setInputArray1(e.target.value)}
              disabled={isLoaded}
              className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-purple-400"
              placeholder="Array 1 (comma-separated)"
            />
            <input
              type="text"
              value={inputArray2}
              onChange={(e) => setInputArray2(e.target.value)}
              disabled={isLoaded}
              className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-purple-400"
              placeholder="Array 2 (comma-separated)"
            />

            {!isLoaded ? (
              <button
                onClick={load}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition text-white font-bold shadow-lg"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="p-3 rounded-full bg-gray-700 hover:bg-pink-600 disabled:opacity-40 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-gray-700 hover:bg-pink-600 transition"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="p-3 rounded-full bg-gray-700 hover:bg-pink-600 disabled:opacity-40 transition"
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
            Enter two comma-separated arrays and click{" "}
            <span className="font-semibold text-purple-400">
              Load & Visualize
            </span>{" "}
            to begin.
          </div>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* LEFT PANEL: CODE */}
            <aside className="lg:col-span-1 p-4 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
              <h3 className="text-purple-300 flex items-center gap-2 font-semibold mb-3">
                <FileText size={18} /> Algorithm Steps
              </h3>
              <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 p-3 max-h-[640px] overflow-auto">
                {CODE_SNIPPETS[activeLang].map(renderCodeLine)}
              </div>
            </aside>

            {/* RIGHT PANEL: VISUALIZATION */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              {/* TOP PART: Arrays & Partitions */}
              <div className="p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">
                      Array 1
                    </h3>
                    <div className="flex justify-center items-end gap-2 flex-wrap min-h-[5rem]">
                      {arrayToDisplay1.map((value, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2 relative"
                        >
                          {state.partition1 === index && (
                            <VisualizerPointer label="P1" color="purple" />
                          )}
                          <div
                            className={`w-14 h-14 flex items-center justify-center rounded-xl font-bold text-lg ${
                              index < state.partition1
                                ? "bg-blue-600"
                                : "bg-gray-700"
                            }`}
                          >
                            {value}
                          </div>
                          <div className="text-xs text-gray-400">[{index}]</div>
                        </div>
                      ))}
                      {state.partition1 === arrayToDisplay1.length && (
                        <VisualizerPointer label="P1" color="purple" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pink-300 mb-3">
                      Array 2
                    </h3>
                    <div className="flex justify-center items-end gap-2 flex-wrap min-h-[5rem]">
                      {arrayToDisplay2.map((value, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2 relative"
                        >
                          {state.partition2 === index && (
                            <VisualizerPointer label="P2" color="pink" />
                          )}
                          <div
                            className={`w-14 h-14 flex items-center justify-center rounded-xl font-bold text-lg ${
                              index < state.partition2
                                ? "bg-blue-600"
                                : "bg-gray-700"
                            }`}
                          >
                            {value}
                          </div>
                          <div className="text-xs text-gray-400">[{index}]</div>
                        </div>
                      ))}
                      {state.partition2 === arrayToDisplay2.length && (
                        <VisualizerPointer label="P2" color="pink" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE PART: Explanation & Values */}
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
                  <h4 className="text-gray-300 text-sm mb-2 font-semibold">
                    Partition Boundaries
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-400">maxLeft1:</span>{" "}
                      <span className="font-mono text-purple-300">
                        {state.maxLeft1 ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">minRight1:</span>{" "}
                      <span className="font-mono text-purple-300">
                        {state.minRight1 ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">maxLeft2:</span>{" "}
                      <span className="font-mono text-pink-300">
                        {state.maxLeft2 ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">minRight2:</span>{" "}
                      <span className="font-mono text-pink-300">
                        {state.minRight2 ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM PART: Result & Complexity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle size={16} /> Result
                  </h4>
                  {state.median != null ? (
                    <div className="text-4xl font-mono text-green-400">
                      {state.median}
                    </div>
                  ) : (
                    <div className="text-2xl text-gray-500">...</div>
                  )}
                </div>
                <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-purple-300 font-semibold flex items-center gap-2 mb-2">
                    <Clock size={16} /> Complexity
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>
                      <strong>Time:</strong>{" "}
                      <span className="font-mono text-teal-300">
                        O(log(min(m, n)))
                      </span>{" "}
                      — Binary search on the smaller array.
                    </div>
                    <div>
                      <strong>Space:</strong>{" "}
                      <span className="font-mono text-teal-300">O(1)</span> —
                      Algorithm requires constant extra space.
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

export default MedianOfTwoSortedArrays;
