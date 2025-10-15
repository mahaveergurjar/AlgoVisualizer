import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Play,
  Pause,
  RotateCw,
  Cpu,
  FileText,
  Clock,
  CheckCircle,
  Terminal,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Code snippet for the algorithm to be displayed in the UI
const CODE_SNIPPETS = {
  JavaScript: [
    { l: 1, t: "function search(nums, target) {" },
    { l: 2, t: "  let left = 0, right = nums.length - 1;" },
    { l: 3, t: "  while (left <= right) {" },
    { l: 4, t: "    let mid = Math.floor((left + right) / 2);" },
    { l: 5, t: "    if (nums[mid] === target) return mid;" },
    { l: 6, t: "    // Check if the left half is sorted" },
    { l: 7, t: "    if (nums[left] <= nums[mid]) {" },
    { l: 8, t: "      if (target >= nums[left] && target < nums[mid]) {" },
    { l: 9, t: "        right = mid - 1;" },
    { l: 10, t: "      } else {" },
    { l: 11, t: "        left = mid + 1;" },
    { l: 12, t: "      }" },
    { l: 13, t: "    } else { // Right half is sorted" },
    { l: 14, t: "      if (target > nums[mid] && target <= nums[right]) {" },
    { l: 15, t: "        left = mid + 1;" },
    { l: 16, t: "      } else {" },
    { l: 17, t: "        right = mid - 1;" },
    { l: 18, t: "      }" },
    { l: 19, t: "    }" },
    { l: 20, t: "  }" },
    { l: 21, t: "  return -1;" },
    { l: 22, t: "}" },
  ],
};

const SearchInRotatedSortedArray = () => {
  const [inputArray, setInputArray] = useState("4,5,6,7,0,1,2");
  const [inputTarget, setInputTarget] = useState("0");

  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(0);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const playRef = useRef(null);

  const activeLang = "JavaScript";
  const state = history[currentStep] || {};

  // --- GENERATE HISTORY ---
  const generateSearchHistory = useCallback((arr, tgt) => {
    const hist = [];
    const addState = (props) =>
      hist.push({ array: [...arr], target: tgt, ...props });
    let left = 0;
    let right = arr.length - 1;

    addState({
      left,
      right,
      line: 2,
      message: `Initializing search for ${tgt}. Range is [${left}, ${right}].`,
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      addState({
        left,
        right,
        mid,
        line: 4,
        message: `Calculating middle element at index ${mid}. Value is ${arr[mid]}.`,
      });

      if (arr[mid] === tgt) {
        addState({
          left,
          right,
          mid,
          foundIndex: mid,
          line: 5,
          message: `Target ${tgt} found at index ${mid}!`,
        });
        setHistory(hist);
        setCurrentStep(0);
        return;
      }

      if (arr[left] <= arr[mid]) {
        // Left half is sorted
        addState({
          left,
          right,
          mid,
          line: 7,
          message: `Left half [${left}..${mid}] is sorted, as ${arr[left]} <= ${arr[mid]}.`,
        });
        if (tgt >= arr[left] && tgt < arr[mid]) {
          addState({
            left,
            right,
            mid,
            line: 9,
            message: `Target ${tgt} is within the sorted left half. Shrinking search to [${left}, ${
              mid - 1
            }].`,
          });
          right = mid - 1;
        } else {
          addState({
            left,
            right,
            mid,
            line: 11,
            message: `Target ${tgt} is not in the sorted left half. Searching right half [${
              mid + 1
            }, ${right}].`,
          });
          left = mid + 1;
        }
      } else {
        // Right half is sorted
        addState({
          left,
          right,
          mid,
          line: 13,
          message: `Right half [${mid}..${right}] is sorted, as ${arr[left]} > ${arr[mid]}.`,
        });
        if (tgt > arr[mid] && tgt <= arr[right]) {
          addState({
            left,
            right,
            mid,
            line: 15,
            message: `Target ${tgt} is within the sorted right half. Searching [${
              mid + 1
            }, ${right}].`,
          });
          left = mid + 1;
        } else {
          addState({
            left,
            right,
            mid,
            line: 17,
            message: `Target ${tgt} is not in sorted right half. Shrinking search to [${left}, ${
              mid - 1
            }].`,
          });
          right = mid - 1;
        }
      }
    }

    addState({
      foundIndex: -1,
      line: 21,
      message: `Target ${tgt} not found in the array. Loop terminated.`,
    });
    setHistory(hist);
    setCurrentStep(0);
  }, []);

  // --- CONTROLS ---
  const load = () => {
    const arr = inputArray
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const tgt = parseInt(inputTarget, 10);
    if (arr.length === 0 || isNaN(tgt)) {
      return alert("Invalid input. Please provide a valid array and target.");
    }
    setArray(arr);
    setTarget(tgt);
    setIsLoaded(true);
    generateSearchHistory(arr, tgt);
  };

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

  // --- RENDER HELPERS ---
  const renderCodeLine = (lineObj) => {
    const active = state.line === lineObj.l;
    return (
      <div
        key={lineObj.l}
        className={`flex font-mono text-sm ${active ? "bg-blue-500/10" : ""}`}
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

  const arrayToDisplay = state.array || array;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="px-6 py-8 max-w-7xl mx-auto relative">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-blue-500/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-12 right-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-0" />

        <header className="relative z-10 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500">
            Search in Rotated Sorted Array
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Visualizing a modified binary search to find a target in a rotated
            array with O(log n) complexity.
          </p>
        </header>

        {/* --- CONTROLS SECTION --- */}
        <section className="mb-6 z-10 relative p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              type="text"
              value={inputArray}
              onChange={(e) => setInputArray(e.target.value)}
              disabled={isLoaded}
              className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-blue-400"
              placeholder="Rotated Array (comma-separated)"
            />
            <input
              type="text"
              value={inputTarget}
              onChange={(e) => setInputTarget(e.target.value)}
              disabled={isLoaded}
              className="w-48 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-blue-400"
              placeholder="Target"
            />

            {!isLoaded ? (
              <button
                onClick={load}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition text-white font-bold shadow-lg"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="p-3 rounded-full bg-gray-700 hover:bg-purple-600 disabled:opacity-40 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-gray-700 hover:bg-purple-600 transition"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="p-3 rounded-full bg-gray-700 hover:bg-purple-600 disabled:opacity-40 transition"
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
            <span className="font-semibold text-blue-400">
              Load & Visualize
            </span>{" "}
            to begin.
          </div>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* LEFT PANEL: CODE */}
            <aside className="lg:col-span-1 p-4 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
              <h3 className="text-blue-300 flex items-center gap-2 font-semibold mb-3">
                <FileText size={18} /> Algorithm Steps
              </h3>
              <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 p-3 max-h-[640px] overflow-auto">
                {CODE_SNIPPETS[activeLang].map(renderCodeLine)}
              </div>
            </aside>

            {/* RIGHT PANEL: VISUALIZATION */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              {/* TOP: Array Viz */}
              <div
                id="array-container"
                className="relative p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-blue-300 mb-8">
                  Array Visualization
                </h3>
                <div className="flex justify-center items-center gap-2 flex-wrap min-h-[5rem]">
                  {arrayToDisplay.map((value, index) => {
                    const isFound = state.foundIndex === index;
                    const inRange = index >= state.left && index <= state.right;
                    return (
                      <div
                        id={`array-container-element-${index}`}
                        key={index}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-14 h-14 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-300
                                 ${
                                   isFound
                                     ? "bg-green-500 scale-110 ring-2 ring-green-300"
                                     : inRange
                                     ? "bg-gray-700"
                                     : "bg-gray-800 text-gray-500"
                                 }`}
                        >
                          {value}
                        </div>
                        <div className="text-xs text-gray-400">[{index}]</div>
                      </div>
                    );
                  })}
                </div>
                <VisualizerPointer
                  index={state.left}
                  containerId="array-container"
                  color="blue"
                  label="L"
                />
                <VisualizerPointer
                  index={state.right}
                  containerId="array-container"
                  color="orange"
                  label="R"
                />
                <VisualizerPointer
                  index={state.mid}
                  containerId="array-container"
                  color="purple"
                  label="MID"
                />
              </div>

              {/* MIDDLE: State & Explanation */}
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
                      <span className="text-gray-400">Left:</span>{" "}
                      <span className="font-mono text-blue-300">
                        {state.left ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Right:</span>{" "}
                      <span className="font-mono text-orange-300">
                        {state.right ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mid:</span>{" "}
                      <span className="font-mono text-purple-300">
                        {state.mid ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mid Val:</span>{" "}
                      <span className="font-mono text-purple-300">
                        {state.mid != null ? arrayToDisplay[state.mid] : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: Result & Complexity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4
                    className={`font-semibold flex items-center gap-2 mb-2
                        ${
                          state.foundIndex != null && state.foundIndex !== -1
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                  >
                    <CheckCircle size={16} /> Result
                  </h4>
                  {state.foundIndex != null ? (
                    state.foundIndex !== -1 ? (
                      <div className="text-2xl font-mono text-green-400">
                        Found at index {state.foundIndex}
                      </div>
                    ) : (
                      <div className="text-2xl font-mono text-red-400">
                        Not Found
                      </div>
                    )
                  ) : (
                    <div className="text-2xl text-gray-500">...</div>
                  )}
                </div>
                <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2">
                    <Clock size={16} /> Complexity
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>
                      <strong>Time:</strong>{" "}
                      <span className="font-mono text-teal-300">O(log n)</span>{" "}
                      — Standard binary search on a partitioned array.
                    </div>
                    <div>
                      <strong>Space:</strong>{" "}
                      <span className="font-mono text-teal-300">O(1)</span> —
                      The algorithm uses a constant amount of extra space.
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

export default SearchInRotatedSortedArray;
