import { useState, useEffect, useRef, useCallback } from "react";
import {
    Play,
    Pause,
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    FileText,
    Terminal,
    Hash,
    CheckCircle,
    Clock,
    Cpu,
    Target,
    Plus,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <unordered_map>" },
    { l: 2, t: "#include <vector>" },
    { l: 3, t: "using namespace std;" },
    { l: 4, t: "" },
    { l: 5, t: "int subarraySum(vector<int>& nums, int k) {" },
    { l: 6, t: "    unordered_map<int, int> prefixSumCount;" },
    { l: 7, t: "    prefixSumCount[0] = 1;" },
    { l: 8, t: "    int count = 0, prefixSum = 0;" },
    { l: 9, t: "    for (int num : nums) {" },
    { l: 10, t: "        prefixSum += num;" },
    { l: 11, t: "        if (prefixSumCount.count(prefixSum - k)) {" },
    { l: 12, t: "            count += prefixSumCount[prefixSum - k];" },
    { l: 13, t: "        }" },
    { l: 14, t: "        prefixSumCount[prefixSum]++;" },
    { l: 15, t: "    }" },
    { l: 16, t: "    return count;" },
    { l: 17, t: "}" },
  ],
  Python: [
    { l: 1, t: "def subarraySum(nums, k):" },
    { l: 2, t: "    prefix_sum_count = {0: 1}" },
    { l: 3, t: "    count = 0" },
    { l: 4, t: "    prefix_sum = 0" },
    { l: 5, t: "    for num in nums:" },
    { l: 6, t: "        prefix_sum += num" },
    { l: 7, t: "        if prefix_sum - k in prefix_sum_count:" },
    { l: 8, t: "            count += prefix_sum_count[prefix_sum - k]" },
    {
        l: 9,
        t: "        prefix_sum_count[prefix_sum] = prefix_sum_count.get(prefix_sum, 0) + 1",
    },
    { l: 10, t: "    return count" },
  ],
  Java: [
    { l: 1, t: "import java.util.HashMap;" },
    { l: 2, t: "import java.util.Map;" },
    { l: 3, t: "" },
    { l: 4, t: "public int subarraySum(int[] nums, int k) {" },
    { l: 5, t: "    Map<Integer, Integer> prefixSumCount = new HashMap<>();" },
    { l: 6, t: "    prefixSumCount.put(0, 1);" },
    { l: 7, t: "    int count = 0, prefixSum = 0;" },
    { l: 8, t: "    for (int num : nums) {" },
    { l: 9, t: "        prefixSum += num;" },
    { l: 10, t: "        if (prefixSumCount.containsKey(prefixSum - k)) {" },
    { l: 11, t: "            count += prefixSumCount.get(prefixSum - k);" },
    { l: 12, t: "        }" },
    { l: 13, t: "        prefixSumCount.put(prefixSum, prefixSumCount.getOrDefault(prefixSum, 0) + 1);",},
    { l: 14, t: "    }" },
    { l: 15, t: "    return count;" },
    { l: 16, t: "}" },
  ],
};

const SubarraySumEqualsK = () => {
  const [numsInput, setNumsInput] = useState("1,1,1");
  const [kInput, setKInput] = useState("2");
  const [nums, setNums] = useState([]);
  const [k, setK] = useState(0);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [activeLang, setActiveLang] = useState("C++");

  const playRef = useRef(null);

  // Generate simulation history
  const generateHistory = useCallback((numArray, target) => {
    const newHistory = [];
    const prefixSumCount = new Map();
    prefixSumCount.set(0, 1);
    let count = 0;
    let prefixSum = 0;
    let foundSubarrays = [];

    const addState = (props) => {
      newHistory.push({
        prefixSumCount: new Map(prefixSumCount),
        prefixSum,
        count,
        currentIndex: -1,
        currentNum: null,
        target,
        phase: "init",
        line: null,
        explanation: "",
        foundSubarrays: [...foundSubarrays],
        lookingFor: null,
        foundCount: 0,
        ...props,
      });
    };

    // Initial state
    addState({
      line: 6,
      explanation: `Initialize hash map with {0: 1} to handle subarrays starting from index 0. Target sum k = ${target}`,
      phase: "init",
    });

    // Process each number
    for (let i = 0; i < numArray.length; i++) {
      const num = numArray[i];
      prefixSum += num;

      addState({
        line: 10,
        explanation: `Processing nums[${i}] = ${num}. Update prefix sum: ${
          prefixSum - num
        } + ${num} = ${prefixSum}`,
        currentIndex: i,
        currentNum: num,
        phase: "updating-prefix",
      });

      // Check if (prefixSum - k) exists in map
      const lookingFor = prefixSum - target;
      const foundCount = prefixSumCount.get(lookingFor) || 0;

      addState({
        line: 11,
        explanation: `Looking for prefix sum ${lookingFor} (current ${prefixSum} - k ${target}) in hash map`,
        currentIndex: i,
        currentNum: num,
        phase: "checking-map",
        lookingFor,
      });

      if (foundCount > 0) {
        count += foundCount;
        // Find the actual subarrays for visualization
        for (let j = 0; j <= i; j++) {
          let sum = 0;
          for (let l = j; l <= i; l++) {
            sum += numArray[l];
          }
          if (sum === target) {
            foundSubarrays.push({ start: j, end: i, sum: target });
          }
        }

        addState({
          line: 12,
          explanation: `Found ${foundCount} previous prefix sum(s) = ${lookingFor}! This means ${foundCount} subarray(s) ending at index ${i} sum to ${target}. Count: ${
            count - foundCount
          } + ${foundCount} = ${count}`,
          currentIndex: i,
          currentNum: num,
          phase: "found-subarray",
          lookingFor,
          foundCount,
        });
      } else {
        addState({
          line: 11,
          explanation: `Prefix sum ${lookingFor} not found in hash map. No new subarrays ending at index ${i}.`,
          currentIndex: i,
          currentNum: num,
          phase: "not-found",
          lookingFor,
        });
      }

      // Update the map with current prefix sum
      const currentCount = prefixSumCount.get(prefixSum) || 0;
      prefixSumCount.set(prefixSum, currentCount + 1);

      addState({
        line: 14,
        explanation: `Update hash map: prefix_sum[${prefixSum}] = ${currentCount} + 1 = ${
          currentCount + 1
        }`,
        currentIndex: i,
        currentNum: num,
        phase: "updating-map",
      });
    }

    // Final result
    addState({
      line: 16,
      explanation: `Algorithm complete! Found ${count} subarray(s) that sum to ${target}.`,
      phase: "done",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // Load and validate inputs
  const load = () => {
    const numsStr = numsInput.trim();
    const kStr = kInput.trim();

    if (!numsStr || !kStr) {
      alert("Please enter both array and target sum.");
      return;
    }

    try {
      const numArray = numsStr.split(",").map((s) => {
        const num = parseInt(s.trim(), 10);
        if (isNaN(num)) throw new Error(`Invalid number: ${s.trim()}`);
        return num;
      });

      const target = parseInt(kStr, 10);
      if (isNaN(target)) throw new Error("Invalid target sum");

      if (numArray.length === 0) {
        alert("Please enter at least one number.");
        return;
      }

      setNums(numArray);
      setK(target);
      setIsLoaded(true);
      generateHistory(numArray, target);
    } catch (e) {
      alert(
        "Please enter valid comma-separated integers and a valid target sum", e
      );
    }
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  // Step controls
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

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

  // Auto-play functionality
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

  // Stop playing when reaching the end
  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      clearInterval(playRef.current);
    }
  }, [currentStep, history.length]);

  const state = history[currentStep] || {};

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
        className={`relative flex font-mono text-sm ${
          active ? "bg-amber-500/10 border-l-4 border-amber-400" : ""
        }`}
      >
        <div className="flex-none w-8 text-right text-gray-500 select-none pr-3">
          {text ? ln : ""}
        </div>
        <pre className="flex-1 m-0 p-1 text-gray-200 whitespace-pre">
          {text}
        </pre>
      </div>
    );
  };

  const getNumberClass = (num, index) => {
    const { currentIndex, phase } = state;

    if (
      currentIndex === index &&
      (phase === "updating-prefix" ||
        phase === "checking-map" ||
        phase === "found-subarray" ||
        phase === "not-found" ||
        phase === "updating-map")
    ) {
      return "bg-blue-500/80 text-white shadow-lg transform scale-110 border-2 border-blue-300";
    } else if (currentIndex !== -1 && index <= currentIndex) {
      return "bg-green-600/60 text-white border-2 border-green-400";
    } else {
      return "bg-gray-700 text-gray-300";
    }
  };

  const getPrefixSumClass = (index) => {
    const { currentIndex } = state;

    if (currentIndex === index) {
      return "bg-yellow-500/80 text-white font-bold transform scale-110";
    } else if (currentIndex !== -1 && index <= currentIndex) {
      return "bg-yellow-600/60 text-white";
    } else {
      return "bg-gray-600/40 text-gray-400";
    }
  };

  // Calculate prefix sums for display
  const getPrefixSums = () => {
    if (!nums.length) return [];
    const prefixSums = [nums[0]];
    for (let i = 1; i < nums.length; i++) {
      prefixSums.push(prefixSums[i - 1] + nums[i]);
    }
    return prefixSums;
  };

  const prefixSums = getPrefixSums();

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      {/* Background effects */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-amber-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-orange-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
          🎯 Subarray Sum Equals K
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Count subarrays with sum equal to k using prefix sum and hash map
        </p>
      </header>

      {/* Input Controls */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400 shadow-sm"
            placeholder="Enter comma-separated numbers (e.g., 1,1,1)"
          />

          <input
            type="text"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
            disabled={isLoaded}
            className="w-32 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400 shadow-sm"
            placeholder="Target k"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-amber-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-amber-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-amber-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <label className="text-sm text-gray-300">Speed</label>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={100}
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

      {/* Algorithm Tabs */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeLang === lang
                  ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Prefix Sum + Hash Map</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter array and target sum then click{" "}
          <span className="text-amber-400 font-semibold">Load & Visualize</span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Code Panel */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-amber-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">
                Language: {activeLang}
              </div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) =>
                renderCodeLine(activeLang, line)
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Current active line highlighted in amber.</div>
              <div>Tip: Use ← → keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          {/* Visualization Panel */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Array and Prefix Sum Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <FileText size={16} /> Array & Prefix Sums (Target k = {k})
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">Array:</div>
                  <div className="flex gap-2 flex-wrap">
                    {nums.map((num, idx) => (
                      <div
                        key={`num-${idx}`}
                        className={`min-w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-300 ${getNumberClass(
                          num,
                          idx
                        )}`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-2">Prefix Sums:</div>
                  <div className="flex gap-2 flex-wrap">
                    {prefixSums.map((sum, idx) => (
                      <div
                        key={`prefix-${idx}`}
                        className={`min-w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm transition-all duration-300 ${getPrefixSumClass(
                          idx
                        )}`}
                      >
                        {sum}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/80 rounded border-2 border-blue-300"></div>
                  <span>Currently processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600/60 rounded border-2 border-green-400"></div>
                  <span>Processed elements</span>
                </div>
              </div>
            </div>

            {/* Hash Map Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Hash size={16} /> Prefix Sum Count Map
              </h4>

              <div className="flex gap-2 flex-wrap">
                {Array.from(state.prefixSumCount || new Map()).map(
                  ([sum, count]) => (
                    <div
                      key={sum}
                      className={`p-3 rounded-xl border transition-all ${
                        state.lookingFor === sum
                          ? "border-blue-400 bg-blue-500/20 ring-2 ring-blue-400"
                          : sum === state.prefixSum &&
                            state.phase === "updating-map"
                          ? "border-amber-400 bg-amber-500/20"
                          : "border-gray-600 bg-gray-700/60"
                      }`}
                    >
                      <div className="text-sm font-bold text-white">
                        sum: {sum}
                      </div>
                      <div className="text-xs opacity-80">count: {count}</div>
                    </div>
                  )
                )}
                {(!state.prefixSumCount || state.prefixSumCount.size === 0) && (
                  <div className="text-gray-500 italic">
                    Hash map will appear here
                  </div>
                )}
              </div>
            </div>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Plus size={14} /> Current Prefix Sum
                </h4>
                <div className="text-2xl font-mono text-yellow-400 font-bold">
                  {state.prefixSum || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Sum from start to current index
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Target size={14} /> Looking For
                </h4>
                <div className="text-2xl font-mono text-blue-400 font-bold">
                  {state.lookingFor !== null ? state.lookingFor : "-"}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  prefix_sum - k = {state.prefixSum || 0} - {k}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Total Count
                </h4>
                <div className="text-2xl font-mono text-green-400 font-bold">
                  {state.count || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Subarrays found so far
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <FileText size={14} /> Explanation
              </h4>
              <p className="text-gray-200">
                {state.explanation ||
                  "Load array and target sum then press 'Load & Visualize' to begin."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>
                  <strong>Phase:</strong>{" "}
                  <span className="text-gray-200">{state.phase || "-"}</span>
                </div>
                <div>
                  <strong>Current index:</strong>{" "}
                  <span className="text-gray-200">
                    {state.currentIndex !== -1 ? state.currentIndex : "-"}
                  </span>
                </div>
                <div className="col-span-2 mt-2">
                  <strong>Key Insight:</strong>{" "}
                  <span className="text-gray-200">
                    If prefix_sum[j] - prefix_sum[i] = k, then subarray from i+1
                    to j sums to k
                  </span>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-amber-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity & Notes
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n)</span> — single
                  pass through the array
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n)</span> — hash
                  map stores prefix sum frequencies
                </div>
                <div>
                  <strong>Key Technique:</strong> Use hash map to store prefix
                  sum frequencies for O(1) lookup
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

export default SubarraySumEqualsK;
