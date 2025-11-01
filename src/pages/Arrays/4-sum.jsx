import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  Terminal,
  Clock,
  CheckCircle,
  List,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "brute-force": {
    "C++": [
      { l: 1, t: "#include <bits/stdc++.h>" },
      { l: 2, t: "using namespace std;" },
      {
        l: 4,
        t: "vector<vector<int>> fourSum(vector<int>& nums, int target) {",
      },
      { l: 5, t: "    vector<vector<int>> result;" },
      { l: 6, t: "    int n = nums.size();" },
      { l: 7, t: "    for (int i = 0; i < n-3; ++i) {" },
      { l: 8, t: "        for (int j = i+1; j < n-2; ++j) {" },
      { l: 9, t: "            for (int k = j+1; k < n-1; ++k) {" },
      { l: 10, t: "                for (int l = k+1; l < n; ++l) {" },
      {
        l: 11,
        t: "                    if (nums[i] + nums[j] + nums[k] + nums[l] == target) {",
      },
      {
        l: 12,
        t: "                        result.push_back({nums[i], nums[j], nums[k], nums[l]});",
      },
      { l: 13, t: "                    }" },
      { l: 14, t: "                }" },
      { l: 15, t: "            }" },
      { l: 16, t: "        }" },
      { l: 17, t: "    }" },
      { l: 18, t: "    return result;" },
      { l: 19, t: "}" },
    ],
    Python: [
      { l: 1, t: "def fourSum(nums, target):" },
      { l: 2, t: "    result = []" },
      { l: 3, t: "    n = len(nums)" },
      { l: 4, t: "    for i in range(n-3):" },
      { l: 5, t: "        for j in range(i+1, n-2):" },
      { l: 6, t: "            for k in range(j+1, n-1):" },
      { l: 7, t: "                for l in range(k+1, n):" },
      {
        l: 8,
        t: "                    if nums[i] + nums[j] + nums[k] + nums[l] == target:",
      },
      {
        l: 9,
        t: "                        result.append([nums[i], nums[j], nums[k], nums[l]])",
      },
      { l: 10, t: "    return result" },
    ],
    Java: [
      {
        l: 1,
        t: "public List<List<Integer>> fourSum(int[] nums, int target) {",
      },
      { l: 2, t: "    List<List<Integer>> result = new ArrayList<>();" },
      { l: 3, t: "    int n = nums.length;" },
      { l: 4, t: "    for (int i = 0; i < n-3; i++) {" },
      { l: 5, t: "        for (int j = i+1; j < n-2; j++) {" },
      { l: 6, t: "            for (int k = j+1; k < n-1; k++) {" },
      { l: 7, t: "                for (int l = k+1; l < n; l++) {" },
      {
        l: 8,
        t: "                    if (nums[i] + nums[j] + nums[k] + nums[l] == target) {",
      },
      {
        l: 9,
        t: "                        result.add(Arrays.asList(nums[i], nums[j], nums[k], nums[l]));",
      },
      { l: 10, t: "                    }" },
      { l: 11, t: "                }" },
      { l: 12, t: "            }" },
      { l: 13, t: "        }" },
      { l: 14, t: "    }" },
      { l: 15, t: "    return result;" },
      { l: 16, t: "}" },
    ],
  },
  optimal: {
    "C++": [
      { l: 1, t: "#include <bits/stdc++.h>" },
      { l: 2, t: "using namespace std;" },
      {
        l: 4,
        t: "vector<vector<int>> fourSum(vector<int>& nums, int target) {",
      },
      { l: 5, t: "    vector<vector<int>> result;" },
      { l: 6, t: "    sort(nums.begin(), nums.end());" },
      { l: 7, t: "    int n = nums.size();" },
      { l: 8, t: "    for (int i = 0; i < n-3; ++i) {" },
      { l: 9, t: "        if (i > 0 && nums[i] == nums[i-1]) continue;" },
      { l: 10, t: "        for (int j = i+1; j < n-2; ++j) {" },
      {
        l: 11,
        t: "            if (j > i+1 && nums[j] == nums[j-1]) continue;",
      },
      { l: 12, t: "            int left = j+1, right = n-1;" },
      { l: 13, t: "            while (left < right) {" },
      {
        l: 14,
        t: "                long long sum = (long long)nums[i] + nums[j] + nums[k] + nums[l];",
      },
      { l: 15, t: "                if (sum == target) {" },
      {
        l: 16,
        t: "                    result.push_back({nums[i], nums[j], nums[left], nums[right]});",
      },
      {
        l: 17,
        t: "                    while (left < right && nums[left] == nums[left+1]) left++;",
      },
      {
        l: 18,
        t: "                    while (left < right && nums[right] == nums[right-1]) right--;",
      },
      { l: 19, t: "                    left++; right--;" },
      { l: 20, t: "                } else if (sum < target) left++;" },
      { l: 21, t: "                else right--;" },
      { l: 22, t: "            }" },
      { l: 23, t: "        }" },
      { l: 24, t: "    }" },
      { l: 25, t: "    return result;" },
      { l: 26, t: "}" },
    ],
    Python: [
      { l: 1, t: "def fourSum(nums, target):" },
      { l: 2, t: "    result = []" },
      { l: 3, t: "    nums.sort()" },
      { l: 4, t: "    n = len(nums)" },
      { l: 5, t: "    for i in range(n-3):" },
      { l: 6, t: "        if i > 0 and nums[i] == nums[i-1]: continue" },
      { l: 7, t: "        for j in range(i+1, n-2):" },
      { l: 8, t: "            if j > i+1 and nums[j] == nums[j-1]: continue" },
      { l: 9, t: "            left, right = j+1, n-1" },
      { l: 10, t: "            while left < right:" },
      {
        l: 11,
        t: "                total = nums[i] + nums[j] + nums[left] + nums[right]",
      },
      { l: 12, t: "                if total == target:" },
      {
        l: 13,
        t: "                    result.append([nums[i], nums[j], nums[left], nums[right]])",
      },
      {
        l: 14,
        t: "                    while left < right and nums[left] == nums[left+1]: left += 1",
      },
      {
        l: 15,
        t: "                    while left < right and nums[right] == nums[right-1]: right -= 1",
      },
      { l: 16, t: "                    left += 1; right -= 1" },
      { l: 17, t: "                elif total < target: left += 1" },
      { l: 18, t: "                else: right -= 1" },
      { l: 19, t: "    return result" },
    ],
    Java: [
      {
        l: 1,
        t: "public List<List<Integer>> fourSum(int[] nums, int target) {",
      },
      { l: 2, t: "    List<List<Integer>> result = new ArrayList<>();" },
      { l: 3, t: "    Arrays.sort(nums);" },
      { l: 4, t: "    int n = nums.length;" },
      { l: 5, t: "    for (int i = 0; i < n-3; i++) {" },
      { l: 6, t: "        if (i > 0 && nums[i] == nums[i-1]) continue;" },
      { l: 7, t: "        for (int j = i+1; j < n-2; j++) {" },
      { l: 8, t: "            if (j > i+1 && nums[j] == nums[j-1]) continue;" },
      { l: 9, t: "            int left = j+1, right = n-1;" },
      { l: 10, t: "            while (left < right) {" },
      {
        l: 11,
        t: "                long sum = (long)nums[i] + nums[j] + nums[left] + nums[right];",
      },
      { l: 12, t: "                if (sum == target) {" },
      {
        l: 13,
        t: "                    result.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));",
      },
      {
        l: 14,
        t: "                    while (left < right && nums[left] == nums[left+1]) left++;",
      },
      {
        l: 15,
        t: "                    while (left < right && nums[right] == nums[right-1]) right--;",
      },
      { l: 16, t: "                    left++; right--;" },
      { l: 17, t: "                } else if (sum < target) left++;" },
      { l: 18, t: "                else right--;" },
      { l: 19, t: "            }" },
      { l: 20, t: "        }" },
      { l: 21, t: "    }" },
      { l: 22, t: "    return result;" },
      { l: 23, t: "}" },
    ],
  },
};

const FourSumVisualizer = () => {
  const [numsInput, setNumsInput] = useState("1,0,-1,0,-2,2");
  const [targetInput, setTargetInput] = useState("0");

  const [nums, setNums] = useState([]);
  const [target, setTarget] = useState(0);
  const [sortedNums, setSortedNums] = useState([]);

  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const playRef = useRef(null);

  const [activeLang, setActiveLang] = useState("C++");

  const state = history[currentStep] || {};

  // ----------------- BRUTE FORCE HISTORY -----------------
  const generateBruteForceHistory = useCallback(
    ({ nums: inputNums, target: tgt }) => {
      const n = inputNums.length;
      const newHistory = [];
      const results = [];

      const addState = (props) =>
        newHistory.push({
          i: null,
          j: null,
          k: null,
          l: null,
          line: null,
          sum: null,
          decision: null,
          explanation: "",
          results: [...results],
          ...props,
        });

      addState({
        explanation: "Starting brute-force 4-Sum with 4 nested loops.",
        line: 7,
      });

      for (let i = 0; i < n - 3; i++) {
        addState({
          i,
          line: 7,
          decision: "loop-i",
          explanation: `Outer loop: i = ${i}, nums[${i}] = ${inputNums[i]}`,
        });

        for (let j = i + 1; j < n - 2; j++) {
          addState({
            i,
            j,
            line: 8,
            decision: "loop-j",
            explanation: `Second loop: j = ${j}, nums[${j}] = ${inputNums[j]}`,
          });

          for (let k = j + 1; k < n - 1; k++) {
            addState({
              i,
              j,
              k,
              line: 9,
              decision: "loop-k",
              explanation: `Third loop: k = ${k}, nums[${k}] = ${inputNums[k]}`,
            });

            for (let l = k + 1; l < n; l++) {
              const sum =
                inputNums[i] + inputNums[j] + inputNums[k] + inputNums[l];

              addState({
                i,
                j,
                k,
                l,
                sum,
                line: 11,
                decision: "check",
                explanation: `Checking quadruplet [${i},${j},${k},${l}]: ${inputNums[i]} + ${inputNums[j]} + ${inputNums[k]} + ${inputNums[l]} = ${sum}, target = ${tgt}`,
              });

              if (sum === tgt) {
                results.push([
                  inputNums[i],
                  inputNums[j],
                  inputNums[k],
                  inputNums[l],
                ]);
                addState({
                  i,
                  j,
                  k,
                  l,
                  sum,
                  line: 12,
                  decision: "found",
                  explanation: `✓ Found match! [${inputNums[i]}, ${inputNums[j]}, ${inputNums[k]}, ${inputNums[l]}] sums to ${tgt}`,
                  results: [...results],
                });
              }
            }
          }
        }
      }

      addState({
        line: 18,
        decision: "done",
        explanation: `Brute-force complete. Found ${results.length} quadruplet(s).`,
        results: [...results],
      });

      setHistory(newHistory);
      setCurrentStep(0);
    },
    []
  );

  // ----------------- OPTIMAL (TWO-POINTER) HISTORY -----------------
  const generateOptimalHistory = useCallback(
    ({ nums: inputNums, target: tgt }) => {
      const sorted = [...inputNums].sort((a, b) => a - b);
      setSortedNums(sorted);
      const n = sorted.length;
      const newHistory = [];
      const results = [];

      const addState = (props) =>
        newHistory.push({
          i: null,
          j: null,
          left: null,
          right: null,
          line: null,
          sum: null,
          decision: null,
          explanation: "",
          results: [...results],
          ...props,
        });

      addState({
        explanation: "Sorted array for optimal two-pointer approach.",
        line: 6,
      });

      for (let i = 0; i < n - 3; i++) {
        if (i > 0 && sorted[i] === sorted[i - 1]) {
          addState({
            i,
            line: 9,
            decision: "skip-i",
            explanation: `Skipping duplicate i=${i}: ${sorted[i]} == ${
              sorted[i - 1]
            }`,
          });
          continue;
        }

        addState({
          i,
          line: 8,
          decision: "loop-i",
          explanation: `Outer loop: i = ${i}, nums[${i}] = ${sorted[i]}`,
        });

        for (let j = i + 1; j < n - 2; j++) {
          if (j > i + 1 && sorted[j] === sorted[j - 1]) {
            addState({
              i,
              j,
              line: 11,
              decision: "skip-j",
              explanation: `Skipping duplicate j=${j}: ${sorted[j]} == ${
                sorted[j - 1]
              }`,
            });
            continue;
          }

          addState({
            i,
            j,
            line: 10,
            decision: "loop-j",
            explanation: `Second loop: j = ${j}, nums[${j}] = ${sorted[j]}`,
          });

          let left = j + 1;
          let right = n - 1;

          addState({
            i,
            j,
            left,
            right,
            line: 12,
            decision: "init-pointers",
            explanation: `Initialize two pointers: left = ${left}, right = ${right}`,
          });

          while (left < right) {
            const sum = sorted[i] + sorted[j] + sorted[left] + sorted[right];

            addState({
              i,
              j,
              left,
              right,
              sum,
              line: 14,
              decision: "compute-sum",
              explanation: `Compute sum: ${sorted[i]} + ${sorted[j]} + ${sorted[left]} + ${sorted[right]} = ${sum}, target = ${tgt}`,
            });

            if (sum === tgt) {
              results.push([sorted[i], sorted[j], sorted[left], sorted[right]]);
              addState({
                i,
                j,
                left,
                right,
                sum,
                line: 16,
                decision: "found",
                explanation: `✓ Found quadruplet: [${sorted[i]}, ${sorted[j]}, ${sorted[left]}, ${sorted[right]}]`,
                results: [...results],
              });

              while (left < right && sorted[left] === sorted[left + 1]) left++;
              while (left < right && sorted[right] === sorted[right - 1])
                right--;
              left++;
              right--;

              addState({
                i,
                j,
                left,
                right,
                line: 19,
                decision: "skip-duplicates",
                explanation: `Skipped duplicates, moved pointers: left = ${left}, right = ${right}`,
              });
            } else if (sum < tgt) {
              left++;
              addState({
                i,
                j,
                left,
                right,
                sum,
                line: 20,
                decision: "move-left",
                explanation: `Sum ${sum} < target ${tgt}, move left pointer to ${left}`,
              });
            } else {
              right--;
              addState({
                i,
                j,
                left,
                right,
                sum,
                line: 21,
                decision: "move-right",
                explanation: `Sum ${sum} > target ${tgt}, move right pointer to ${right}`,
              });
            }
          }
        }
      }

      addState({
        line: 25,
        decision: "done",
        explanation: `Optimal two-pointer approach complete. Found ${results.length} unique quadruplet(s).`,
        results: [...results],
      });

      setHistory(newHistory);
      setCurrentStep(0);
    },
    []
  );

  // ----------------- MODE SWITCHING HOOK -----------------
  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput: () => {
      const parsed = numsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => parseInt(s, 10));
      const tgt = parseInt(targetInput, 10);
      if (parsed.length < 4 || parsed.some(isNaN) || isNaN(tgt)) {
        throw new Error("Invalid input");
      }
      return { nums: parsed, target: tgt };
    },
    generators: {
      "brute-force": generateBruteForceHistory,
      optimal: generateOptimalHistory,
    },
    setCurrentStep,
    onError: (msg) => alert(msg),
  });

  // ----------------- LOAD / VALIDATE -----------------
  const load = () => {
    const parsed = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const tgt = parseInt(targetInput, 10);

    if (parsed.length < 4 || parsed.some(isNaN) || isNaN(tgt)) {
      return alert(
        "Invalid input. Need at least 4 numbers and a valid target."
      );
    }

    setNums(parsed);
    setTarget(tgt);
    setIsLoaded(true);

    if (mode === "brute-force") {
      generateBruteForceHistory({ nums: parsed, target: tgt });
    } else {
      generateOptimalHistory({ nums: parsed, target: tgt });
    }
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    setSortedNums([]);
    clearInterval(playRef.current);
  };

  // ----------------- STEP CONTROLS -----------------
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
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
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

  // play/pause
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

  // ----------------- RENDER HELPERS -----------------
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
          active ? "bg-green-500/10" : ""
        }`}
      >
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">
          {ln}
        </div>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">
          {text}
        </pre>
      </div>
    );
  };

  const displayArray = mode === "optimal" && isLoaded ? sortedNums : nums;

  const getPointerIndices = () => {
    const pointers = [];
    if (state.i != null)
      pointers.push({ index: state.i, color: "amber", label: "i" });
    if (state.j != null)
      pointers.push({ index: state.j, color: "purple", label: "j" });
    if (mode === "brute-force") {
      if (state.k != null)
        pointers.push({ index: state.k, color: "cyan", label: "k" });
      if (state.l != null)
        pointers.push({ index: state.l, color: "green", label: "l" });
    } else {
      if (state.left != null)
        pointers.push({
          index: state.left,
          color: "cyan",
          label: "L",
          direction: "up",
        });
      if (state.right != null)
        pointers.push({
          index: state.right,
          color: "green",
          label: "R",
          direction: "up",
        });
    }
    return pointers;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-blue-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
          4-Sum Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          visualize brute-force vs optimal two-pointer approach
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
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
            placeholder="numbers (comma-separated)"
          />
          <input
            type="text"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            disabled={isLoaded}
            className="w-36 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
            placeholder="target"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg cursor-pointer"
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

      {/* MODE SELECTOR */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModeChange("brute-force")}
            className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${
              mode === "brute-force"
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
                : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
            }`}
          >
            Brute Force O(n⁴)
          </button>
          <button
            onClick={() => handleModeChange("optimal")}
            className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${
              mode === "optimal"
                ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
                : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
            }`}
          >
            Optimal O(n³)
          </button>
        </div>
      </section>

      {/* LANGUAGE TABS */}
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
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} />{" "}
            <span>
              Approach: {mode === "optimal" ? "Two Pointers" : "Nested Loops"}
            </span>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter numbers and target, then click
          <span className="text-cyan-400 font-semibold">
            {" "}
            Load & Visualize
          </span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* LEFT PANEL: CODE */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">
                Language: {activeLang}
              </div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[mode][activeLang].map((line) =>
                renderCodeLine(activeLang, line)
              )}
            </div>
            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Active line highlighted in green.</div>
              <div>Use arrow keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          {/* RIGHT PANEL: VISUALIZATION */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Array Visualization */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <List size={16} />{" "}
                {mode === "optimal" ? "Sorted Array" : "Array"}
              </h4>
              <div className="relative">
                <div
                  id="foursum-array-container"
                  className="flex gap-2 flex-wrap"
                >
                  {displayArray.map((num, idx) => {
                    let highlight = false;
                    if (mode === "brute-force") {
                      highlight = [state.i, state.j, state.k, state.l].includes(
                        idx
                      );
                    } else {
                      highlight = [
                        state.i,
                        state.j,
                        state.left,
                        state.right,
                      ].includes(idx);
                    }

                    return (
                      <div
                        key={idx}
                        id={`foursum-array-container-element-${idx}`}
                        className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg font-mono font-bold text-white transition-all ${
                          highlight
                            ? "bg-cyan-500/80 shadow-lg ring-2 ring-cyan-400"
                            : "bg-gradient-to-br from-slate-700 to-slate-600 shadow-md"
                        }`}
                      >
                        <div className="text-xs text-gray-300">[{idx}]</div>
                        <div className="text-lg">{num}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Pointers */}
                {getPointerIndices().map((ptr) => (
                  <VisualizerPointer
                    key={ptr.label}
                    index={ptr.index}
                    containerId="foursum-array-container"
                    color={ptr.color}
                    label={ptr.label}
                    direction={ptr.direction || "down"}
                  />
                ))}
              </div>
            </div>

            {/* Current State */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <Terminal size={14} /> Current State
              </h4>
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-sm text-gray-200 space-y-1">
                {mode === "brute-force" ? (
                  <>
                    <div>i = {state.i ?? "-"}</div>
                    <div>j = {state.j ?? "-"}</div>
                    <div>k = {state.k ?? "-"}</div>
                    <div>l = {state.l ?? "-"}</div>
                  </>
                ) : (
                  <>
                    <div>i = {state.i ?? "-"}</div>
                    <div>j = {state.j ?? "-"}</div>
                    <div>left = {state.left ?? "-"}</div>
                    <div>right = {state.right ?? "-"}</div>
                  </>
                )}
                <div className="pt-2 border-t border-gray-700">
                  Sum = {state.sum ?? "-"} | Target = {target}
                </div>
                <div>Decision: {state.decision || "-"}</div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <FileText size={14} /> Explanation
              </h4>
              <p className="text-gray-200">
                {state.explanation ||
                  "Load inputs and visualize the algorithm."}
              </p>
            </div>

            {/* Results */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <CheckCircle size={14} /> Found Quadruplets
              </h4>
              <div className="flex flex-wrap gap-2">
                {state.results && state.results.length > 0 ? (
                  state.results.map((quad, idx) => (
                    <div
                      key={idx}
                      className="bg-cyan-600/80 text-white px-3 py-1 rounded-md font-mono text-sm shadow"
                    >
                      [{quad.join(", ")}]
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    No quadruplets found yet
                  </div>
                )}
              </div>
            </div>

            {/* Complexity */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                {mode === "brute-force" ? (
                  <>
                    <div>
                      <strong>Time:</strong>{" "}
                      <span className="font-mono text-red-300">O(n⁴)</span> — 4
                      nested loops
                    </div>
                    <div>
                      <strong>Space:</strong>{" "}
                      <span className="font-mono text-teal-300">O(1)</span> — no
                      extra space
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>Time:</strong>{" "}
                      <span className="font-mono text-teal-300">O(n³)</span> — 2
                      loops + two pointers
                    </div>
                    <div>
                      <strong>Space:</strong>{" "}
                      <span className="font-mono text-teal-300">O(log n)</span>{" "}
                      — sorting space
                    </div>
                    <div>
                      <strong>Optimization:</strong> Two-pointer eliminates
                      innermost loop, skips duplicates
                    </div>
                  </>
                )}
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

export default FourSumVisualizer;
