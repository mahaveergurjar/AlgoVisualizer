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
  TrendingUp,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <unordered_set>" },
    { l: 2, t: "#include <vector>" },
    { l: 3, t: "using namespace std;" },
    { l: 4, t: "" },
    { l: 5, t: "int longestConsecutive(vector<int>& nums) {" },
    { l: 6, t: "    unordered_set<int> numSet(nums.begin(), nums.end());" },
    { l: 7, t: "    int maxLength = 0;" },
    { l: 8, t: "    for (int num : nums) {" },
    { l: 9, t: "        if (numSet.find(num - 1) == numSet.end()) {" },
    { l: 10, t: "            int currentNum = num;" },
    { l: 11, t: "            int currentLength = 1;" },
    {
      l: 12,
      t: "            while (numSet.find(currentNum + 1) != numSet.end()) {",
    },
    { l: 13, t: "                currentNum++;" },
    { l: 14, t: "                currentLength++;" },
    { l: 15, t: "            }" },
    { l: 16, t: "            maxLength = max(maxLength, currentLength);" },
    { l: 17, t: "        }" },
    { l: 18, t: "    }" },
    { l: 19, t: "    return maxLength;" },
    { l: 20, t: "}" },
  ],
  Python: [
    { l: 1, t: "def longestConsecutive(nums):" },
    { l: 2, t: "    num_set = set(nums)" },
    { l: 3, t: "    max_length = 0" },
    { l: 4, t: "    for num in nums:" },
    { l: 5, t: "        if num - 1 not in num_set:" },
    { l: 6, t: "            current_num = num" },
    { l: 7, t: "            current_length = 1" },
    { l: 8, t: "            while current_num + 1 in num_set:" },
    { l: 9, t: "                current_num += 1" },
    { l: 10, t: "                current_length += 1" },
    { l: 11, t: "            max_length = max(max_length, current_length)" },
    { l: 12, t: "    return max_length" },
  ],
  Java: [
    { l: 1, t: "import java.util.HashSet;" },
    { l: 2, t: "import java.util.Set;" },
    { l: 3, t: "" },
    { l: 4, t: "public int longestConsecutive(int[] nums) {" },
    { l: 5, t: "    Set<Integer> numSet = new HashSet<>();" },
    { l: 6, t: "    for (int num : nums) numSet.add(num);" },
    { l: 7, t: "    int maxLength = 0;" },
    { l: 8, t: "    for (int num : nums) {" },
    { l: 9, t: "        if (!numSet.contains(num - 1)) {" },
    { l: 10, t: "            int currentNum = num;" },
    { l: 11, t: "            int currentLength = 1;" },
    { l: 12, t: "            while (numSet.contains(currentNum + 1)) {" },
    { l: 13, t: "                currentNum++;" },
    { l: 14, t: "                currentLength++;" },
    { l: 15, t: "            }" },
    { l: 16, t: "            maxLength = Math.max(maxLength, currentLength);" },
    { l: 17, t: "        }" },
    { l: 18, t: "    }" },
    { l: 19, t: "    return maxLength;" },
    { l: 20, t: "}" },
  ],
};

const LongestConsecutiveSequence = () => {
  const [numsInput, setNumsInput] = useState("100,4,200,1,3,2");
  const [nums, setNums] = useState([]);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [activeLang, setActiveLang] = useState("C++");

  const playRef = useRef(null);

  // Generate simulation history
  const generateHistory = useCallback((numArray) => {
    const newHistory = [];
    const numSet = new Set(numArray);
    let maxLength = 0;
    let currentSequence = [];
    let longestSequence = [];

    const addState = (props) => {
      newHistory.push({
        numSet: new Set(numSet),
        currentNum: null,
        currentLength: 0,
        maxLength,
        currentSequence: [...currentSequence],
        longestSequence: [...longestSequence],
        phase: "init",
        line: null,
        explanation: "",
        isSequenceStart: false,
        ...props,
      });
    };

    // Initial state - create set
    addState({
      line: 6,
      explanation:
        "Creating hash set from input array for O(1) lookup operations.",
      phase: "creating-set",
    });

    // Process each number
    for (let i = 0; i < numArray.length; i++) {
      const num = numArray[i];

      addState({
        line: 8,
        explanation: `Processing number ${num} from the array.`,
        currentNum: num,
        phase: "processing-num",
      });

      // Check if this is the start of a sequence
      if (!numSet.has(num - 1)) {
        addState({
          line: 9,
          explanation: `${
            num - 1
          } is not in set, so ${num} is the start of a potential sequence.`,
          currentNum: num,
          phase: "sequence-start",
          isSequenceStart: true,
        });

        let currentNum = num;
        let currentLength = 1;
        currentSequence = [currentNum];

        addState({
          line: 11,
          explanation: `Starting sequence from ${num}. Current length = ${currentLength}.`,
          currentNum,
          currentLength,
          currentSequence: [...currentSequence],
          phase: "sequence-building",
        });

        // Extend the sequence
        while (numSet.has(currentNum + 1)) {
          currentNum++;
          currentLength++;
          currentSequence.push(currentNum);

          addState({
            line: 12,
            explanation: `Found ${currentNum} in set. Extending sequence. Length = ${currentLength}.`,
            currentNum,
            currentLength,
            currentSequence: [...currentSequence],
            phase: "sequence-extending",
          });
        }

        // Update max length if current is longer
        if (currentLength > maxLength) {
          maxLength = currentLength;
          longestSequence = [...currentSequence];

          addState({
            line: 16,
            explanation: `New longest sequence found! Length = ${maxLength}. Sequence: [${longestSequence.join(
              ", "
            )}]`,
            currentNum,
            currentLength,
            maxLength,
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence],
            phase: "new-max-found",
          });
        } else {
          addState({
            line: 16,
            explanation: `Sequence length ${currentLength} is not greater than current max ${maxLength}.`,
            currentNum,
            currentLength,
            maxLength,
            currentSequence: [...currentSequence],
            longestSequence: [...longestSequence],
            phase: "sequence-complete",
          });
        }

        currentSequence = [];
      } else {
        addState({
          line: 9,
          explanation: `${
            num - 1
          } exists in set, so ${num} is not a sequence start. Skipping.`,
          currentNum: num,
          phase: "not-sequence-start",
        });
      }
    }

    // Final result
    addState({
      line: 19,
      explanation: `Algorithm complete! Longest consecutive sequence has length ${maxLength}.`,
      maxLength,
      longestSequence: [...longestSequence],
      phase: "done",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // Load and validate inputs
  const load = () => {
    const input = numsInput.trim();
    if (!input) {
      alert("Please enter numbers.");
      return;
    }

    try {
      const numArray = input.split(",").map((s) => {
        const num = parseInt(s.trim(), 10);
        if (isNaN(num)) throw new Error(`Invalid number: ${s.trim()}`);
        return num;
      });

      if (numArray.length === 0) {
        alert("Please enter at least one number.");
        return;
      }

      setNums(numArray);
      setIsLoaded(true);
      generateHistory(numArray);
    } catch (e) {
      alert(
        "Please enter valid comma-separated integers (e.g., 100,4,200,1,3,2)",
        e
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
          active ? "bg-cyan-500/10 border-l-4 border-cyan-400" : ""
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

  const getNumberClass = (num) => {
    const { currentNum, currentSequence, longestSequence, phase } = state;

    if (
      currentNum === num &&
      (phase === "processing-num" ||
        phase === "sequence-start" ||
        phase === "not-sequence-start")
    ) {
      return "bg-blue-500/80 text-white shadow-lg transform scale-110 border-2 border-blue-300";
    } else if (currentSequence.includes(num)) {
      return "bg-yellow-500/80 text-white shadow-md border-2 border-yellow-300";
    } else if (longestSequence.includes(num)) {
      return "bg-green-600/80 text-white shadow-md border-2 border-green-300";
    } else if (state.numSet && state.numSet.has(num)) {
      return "bg-gray-600/60 text-gray-200 border-2 border-gray-500";
    } else {
      return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      {/* Background effects */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-cyan-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          🔢 Longest Consecutive Sequence
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Find the longest sequence of consecutive integers using hash set
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
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
            placeholder="Enter comma-separated numbers (e.g., 100,4,200,1,3,2)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition shadow"
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
                  ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} />{" "}
            <span>Approach: Hash Set + Sequence Building</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter comma-separated numbers then click{" "}
          <span className="text-cyan-400 font-semibold">Load & Visualize</span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Code Panel */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-300 flex items-center gap-2 font-semibold">
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
              <div>Current active line highlighted in cyan.</div>
              <div>Tip: Use ← → keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          {/* Visualization Panel */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Array Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <FileText size={16} /> Input Array
              </h4>

              <div className="flex gap-2 flex-wrap">
                {nums.map((num, idx) => (
                  <div
                    key={`${num}-${idx}`}
                    className={`min-w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-300 ${getNumberClass(
                      num
                    )}`}
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/80 rounded border-2 border-blue-300"></div>
                  <span>Currently processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/80 rounded border-2 border-yellow-300"></div>
                  <span>Current sequence being built</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600/80 rounded border-2 border-green-300"></div>
                  <span>Longest sequence found</span>
                </div>
              </div>
            </div>

            {/* Hash Set Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Hash size={16} /> Hash Set Contents
              </h4>

              <div className="flex gap-2 flex-wrap">
                {Array.from(state.numSet || new Set())
                  .sort((a, b) => a - b)
                  .map((num) => (
                    <div
                      key={num}
                      className="px-3 py-2 bg-gray-700/60 rounded-lg font-mono text-sm text-gray-200"
                    >
                      {num}
                    </div>
                  ))}
                {(!state.numSet || state.numSet.size === 0) && (
                  <div className="text-gray-500 italic">
                    Hash set will appear here
                  </div>
                )}
              </div>
            </div>

            {/* Current Sequence and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <TrendingUp size={14} /> Current Sequence
                </h4>

                {state.currentSequence && state.currentSequence.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {state.currentSequence.map((num, idx) => (
                      <div
                        key={`seq-${num}-${idx}`}
                        className="px-3 py-2 bg-yellow-500/60 text-white rounded-lg font-mono text-sm font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No sequence being built
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-400">
                  Length:{" "}
                  <span className="text-yellow-400 font-bold">
                    {state.currentLength || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Longest Sequence
                </h4>

                {state.longestSequence && state.longestSequence.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {state.longestSequence.map((num, idx) => (
                      <div
                        key={`longest-${num}-${idx}`}
                        className="px-3 py-2 bg-green-600/60 text-white rounded-lg font-mono text-sm font-bold"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No sequence found yet
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-400">
                  Max Length:{" "}
                  <span className="text-green-400 font-bold text-2xl">
                    {state.maxLength || 0}
                  </span>
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
                  "Load numbers and press 'Load & Visualize' to begin."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>
                  <strong>Phase:</strong>{" "}
                  <span className="text-gray-200">{state.phase || "-"}</span>
                </div>
                <div>
                  <strong>Current num:</strong>{" "}
                  <span className="text-gray-200">
                    {state.currentNum || "-"}
                  </span>
                </div>
                <div className="col-span-2 mt-2">
                  <strong>Key Insight:</strong>{" "}
                  <span className="text-gray-200">
                    Only start counting from numbers that don't have (num-1) in
                    the set
                  </span>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-cyan-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity & Notes
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n)</span> — each
                  number is visited at most twice
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n)</span> — hash
                  set stores all unique numbers
                </div>
                <div>
                  <strong>Key Optimization:</strong> Only start sequences from
                  numbers that are sequence beginnings
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

export default LongestConsecutiveSequence;
