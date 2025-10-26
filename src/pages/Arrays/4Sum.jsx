import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  Terminal,
  CheckCircle,
  Clock,
  Hash,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const VisualizerPointer = ({ className = "" }) => (
  <div className={`text-xs font-bold text-cyan-400 ${className}`}>▼</div>
);

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "vector<vector<int>> fourSum(vector<int>& nums, int target) {" },
    { l: 5, t: "    vector<vector<int>> result;" },
    { l: 6, t: "    sort(nums.begin(), nums.end());" },
    { l: 7, t: "    int n = nums.size();" },
    { l: 8, t: "    for (int i = 0; i < n-3; ++i) {" },
    { l: 9, t: "        if (i > 0 && nums[i] == nums[i-1]) continue;" },
    { l: 10, t: "        for (int j = i+1; j < n-2; ++j) {" },
    { l: 11, t: "            if (j > i+1 && nums[j] == nums[j-1]) continue;" },
    { l: 12, t: "            int left = j+1, right = n-1;" },
    { l: 13, t: "            while (left < right) {" },
    {
      l: 14,
      t: "                long long sum = (long long)nums[i]+nums[j]+nums[left]+nums[right];",
    },
    { l: 15, t: "                if (sum == target) {" },
    {
      l: 16,
      t: "                    result.push_back({nums[i],nums[j],nums[left],nums[right]});",
    },
    {
      l: 17,
      t: "                    while (left<right && nums[left]==nums[left+1]) ++left;",
    },
    {
      l: 18,
      t: "                    while (left<right && nums[right]==nums[right-1]) --right;",
    },
    { l: 19, t: "                    ++left; --right;" },
    { l: 20, t: "                } else if (sum < target) { ++left; }" },
    { l: 21, t: "                else { --right; }" },
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
    { l: 6, t: "        if i > 0 and nums[i] == nums[i-1]:" },
    { l: 7, t: "            continue" },
    { l: 8, t: "        for j in range(i+1, n-2):" },
    { l: 9, t: "            if j > i+1 and nums[j] == nums[j-1]:" },
    { l: 10, t: "                continue" },
    { l: 11, t: "            left, right = j+1, n-1" },
    { l: 12, t: "            while left < right:" },
    {
      l: 13,
      t: "                total = nums[i] + nums[j] + nums[left] + nums[right]",
    },
    { l: 14, t: "                if total == target:" },
    {
      l: 15,
      t: "                    result.append([nums[i], nums[j], nums[left], nums[right]])",
    },
    {
      l: 16,
      t: "                    while left < right and nums[left] == nums[left+1]:",
    },
    { l: 17, t: "                        left += 1" },
    {
      l: 18,
      t: "                    while left < right and nums[right] == nums[right-1]:",
    },
    { l: 19, t: "                        right -= 1" },
    { l: 20, t: "                    left += 1" },
    { l: 21, t: "                    right -= 1" },
    { l: 22, t: "                elif total < target:" },
    { l: 23, t: "                    left += 1" },
    { l: 24, t: "                else:" },
    { l: 25, t: "                    right -= 1" },
    { l: 26, t: "    return result" },
  ],
  Java: [
    { l: 1, t: "public List<List<Integer>> fourSum(int[] nums, int target) {" },
    { l: 2, t: "    List<List<Integer>> result = new ArrayList<>();" },
    { l: 3, t: "    Arrays.sort(nums);" },
    { l: 4, t: "    int n = nums.length;" },
    { l: 5, t: "    for (int i = 0; i < n-3; ++i) {" },
    { l: 6, t: "        if (i > 0 && nums[i] == nums[i-1]) continue;" },
    { l: 7, t: "        for (int j = i+1; j < n-2; ++j) {" },
    { l: 8, t: "            if (j > i+1 && nums[j] == nums[j-1]) continue;" },
    { l: 9, t: "            int left = j+1, right = n-1;" },
    { l: 10, t: "            while (left < right) {" },
    {
      l: 11,
      t: "                long sum = (long)nums[i]+nums[j]+nums[left]+nums[right];",
    },
    { l: 12, t: "                if (sum == target) {" },
    {
      l: 13,
      t: "                    result.add(Arrays.asList(nums[i],nums[j],nums[left],nums[right]));",
    },
    {
      l: 14,
      t: "                    while (left<right && nums[left]==nums[left+1]) ++left;",
    },
    {
      l: 15,
      t: "                    while (left<right && nums[right]==nums[right-1]) --right;",
    },
    { l: 16, t: "                    ++left; --right;" },
    { l: 17, t: "                } else if (sum < target) { ++left; }" },
    { l: 18, t: "                else { --right; }" },
    { l: 19, t: "            }" },
    { l: 20, t: "        }" },
    { l: 21, t: "    }" },
    { l: 22, t: "    return result;" },
    { l: 23, t: "}" },
  ],
};

const FourSum = () => {
  const [arrayInput, setArrayInput] = useState("1,0,-1,0,-2,2");
  const [targetInput, setTargetInput] = useState("0");

  const [, setNums] = useState([]);
  const [target, setTarget] = useState(0);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const playRef = useRef(null);
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  const generateHistory = useCallback((arr, tgt) => {
    const sortedNums = [...arr].sort((a, b) => a - b);
    const n = sortedNums.length;
    const result = [];
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        sortedArray: [...sortedNums],
        i: null,
        j: null,
        left: null,
        right: null,
        line: null,
        sum: null,
        decision: null,
        currentQuad: [],
        foundQuads: result.map((q) => [...q]),
        explanation: "",
        ...props,
      });

    addState({
      line: 6,
      decision: "sort",
      explanation: `Array sorted: [${sortedNums.join(
        ", "
      )}]. Ready to find quadruplets.`,
    });

    for (let i = 0; i < n - 3; i++) {
      if (i > 0 && sortedNums[i] === sortedNums[i - 1]) {
        addState({
          i,
          line: 9,
          decision: "skip-i",
          explanation: `Skipping duplicate i=${i} (value=${sortedNums[i]}) to avoid duplicate quadruplets.`,
        });
        continue;
      }

      addState({
        i,
        line: 8,
        decision: "fix-i",
        explanation: `Fixed first element: nums[${i}] = ${sortedNums[i]}. Now searching for j, left, right.`,
      });

      for (let j = i + 1; j < n - 2; j++) {
        if (j > i + 1 && sortedNums[j] === sortedNums[j - 1]) {
          addState({
            i,
            j,
            line: 11,
            decision: "skip-j",
            explanation: `Skipping duplicate j=${j} (value=${sortedNums[j]}) to avoid duplicate quadruplets.`,
          });
          continue;
        }

        addState({
          i,
          j,
          line: 10,
          decision: "fix-j",
          explanation: `Fixed second element: nums[${j}] = ${sortedNums[j]}. Initializing two pointers.`,
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
          explanation: `Two pointers initialized: left=${left}, right=${right}.`,
        });

        while (left < right) {
          const sum =
            sortedNums[i] +
            sortedNums[j] +
            sortedNums[left] +
            sortedNums[right];

          addState({
            i,
            j,
            left,
            right,
            sum,
            line: 14,
            decision: "compute-sum",
            currentQuad: [
              sortedNums[i],
              sortedNums[j],
              sortedNums[left],
              sortedNums[right],
            ],
            explanation: `Computing sum: ${sortedNums[i]} + ${sortedNums[j]} + ${sortedNums[left]} + ${sortedNums[right]} = ${sum}. Target = ${tgt}.`,
          });

          if (sum === tgt) {
            result.push([
              sortedNums[i],
              sortedNums[j],
              sortedNums[left],
              sortedNums[right],
            ]);

            addState({
              i,
              j,
              left,
              right,
              sum,
              line: 16,
              decision: "found",
              currentQuad: [
                sortedNums[i],
                sortedNums[j],
                sortedNums[left],
                sortedNums[right],
              ],
              foundQuads: result.map((q) => [...q]),
              explanation: `Found quadruplet: [${sortedNums[i]}, ${sortedNums[j]}, ${sortedNums[left]}, ${sortedNums[right]}]. Adding to result.`,
            });

            while (left < right && sortedNums[left] === sortedNums[left + 1]) {
              left++;
              addState({
                i,
                j,
                left,
                right,
                line: 17,
                decision: "skip-left-dup",
                explanation: `Skipping duplicate left values to avoid duplicate quadruplets. left now = ${left}.`,
              });
            }

            while (
              left < right &&
              sortedNums[right] === sortedNums[right - 1]
            ) {
              right--;
              addState({
                i,
                j,
                left,
                right,
                line: 18,
                decision: "skip-right-dup",
                explanation: `Skipping duplicate right values to avoid duplicate quadruplets. right now = ${right}.`,
              });
            }

            left++;
            right--;

            addState({
              i,
              j,
              left,
              right,
              line: 19,
              decision: "move-both",
              explanation: `Moving both pointers: left=${left}, right=${right}.`,
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
              explanation: `Sum ${sum} < target ${tgt}. Moving left pointer to ${left}.`,
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
              explanation: `Sum ${sum} > target ${tgt}. Moving right pointer to ${right}.`,
            });
          }
        }

        addState({
          i,
          j,
          line: 23,
          decision: "end-j-loop",
          explanation: `Completed search for j=${j}. Moving to next j.`,
        });
      }

      addState({
        i,
        line: 24,
        decision: "end-i-loop",
        explanation: `Completed search for i=${i}. Moving to next i.`,
      });
    }

    addState({
      line: 25,
      decision: "done",
      foundQuads: result.map((q) => [...q]),
      explanation: `Algorithm complete. Found ${
        result.length
      } unique quadruplet(s): ${
        result.length > 0 ? JSON.stringify(result) : "none"
      }.`,
    });

    setHistory(newHistory);
    setCurrentStep(newHistory.length > 0 ? 0 : -1);
  }, []);

  const load = useCallback(() => {
    const arr = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));
    const tgt = Number(targetInput);

    if (
      arr.length < 4 ||
      arr.some((x) => Number.isNaN(x)) ||
      Number.isNaN(tgt)
    ) {
      window.alert(
        "Invalid input. Ensure array has at least 4 numbers and target is valid."
      );
      return;
    }

    setNums(arr);
    setTarget(tgt);
    setIsLoaded(true);
    generateHistory(arr, tgt);
  }, [arrayInput, targetInput, generateHistory]);

  const resetAll = useCallback(() => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    if (playRef.current !== null) {
      window.clearInterval(playRef.current);
      playRef.current = null;
    }
  }, []);

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
      if (e.code === "Space") {
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

      playRef.current = window.setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            if (playRef.current !== null) {
              window.clearInterval(playRef.current);
              playRef.current = null;
            }
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      if (playRef.current !== null) {
        window.clearInterval(playRef.current);
        playRef.current = null;
      }
    }
    return () => {
      if (playRef.current !== null) {
        window.clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [playing, speed, history.length, currentStep]);

  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      if (playRef.current !== null) {
        window.clearInterval(playRef.current);
        playRef.current = null;
      }
    }
  }, [currentStep, history.length]);

  const formattedStep = useCallback(() => {
    if (!isLoaded || history.length === 0) return "0/0";
    return `${Math.max(0, currentStep + 1)}/${history.length}`;
  }, [isLoaded, currentStep, history.length]);

  const renderCodeLine = (lang, lineObj) => {
    const text = lineObj.t;
    const ln = lineObj.l;
    const active = state?.line === ln;

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

  const cellClass = (idx) => {
    const { i, j, left, right } = state || {};
    if (idx === i) return "bg-rose-500/80 ring-2 ring-rose-400";
    if (idx === j) return "bg-amber-500/80 ring-2 ring-amber-400";
    if (idx === left) return "bg-blue-500/80 ring-2 ring-blue-400";
    if (idx === right) return "bg-green-500/80 ring-2 ring-green-400";
    return "bg-gray-700";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-cyan-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400">
          4-Sum Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Find all unique quadruplets that sum to target using two pointers
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
            placeholder="array (comma-separated)"
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
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-40 transition shadow"
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
                className="ml-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow"
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
            <Cpu size={16} /> <span>Approach: Sorting + Two Pointers</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter an array and target, then click
          <span className="text-cyan-400 font-semibold">
            {" "}
            Load & Visualize
          </span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
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
              {(CODE_SNIPPETS[activeLang] || []).map((line) =>
                renderCodeLine(activeLang, line)
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>
                Current line highlighted in green. Lines map to algorithm steps.
              </div>
              <div>Tip: Use ← → keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Hash size={16} /> Sorted Array
              </h4>
              <div className="flex gap-2 flex-wrap">
                {state.sortedArray?.map((val, idx) => (
                  <div
                    key={idx}
                    className={`relative w-16 h-16 flex flex-col items-center justify-center rounded-lg font-mono font-bold text-white transition-all ${cellClass(
                      idx
                    )}`}
                  >
                    {idx === state.i && (
                      <VisualizerPointer className="absolute -top-5" />
                    )}
                    {idx === state.j && (
                      <VisualizerPointer className="absolute -top-5" />
                    )}
                    {idx === state.left && (
                      <VisualizerPointer className="absolute -top-5" />
                    )}
                    {idx === state.right && (
                      <VisualizerPointer className="absolute -top-5" />
                    )}
                    <div className="text-xs text-gray-300">[{idx}]</div>
                    <div className="text-lg">{val}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rose-500/80 rounded" />
                  <span className="text-gray-300">i (first)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500/80 rounded" />
                  <span className="text-gray-300">j (second)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/80 rounded" />
                  <span className="text-gray-300">left</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/80 rounded" />
                  <span className="text-gray-300">right</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">
                  {state.explanation || "Load inputs and visualize."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>
                    <strong>Decision:</strong>{" "}
                    <span className="text-gray-200">
                      {state.decision || "-"}
                    </span>
                  </div>
                  <div>
                    <strong>Active line:</strong>{" "}
                    <span className="text-gray-200">{state.line ?? "-"}</span>
                  </div>
                  {state.sum !== null && state.sum !== undefined && (
                    <>
                      <div>
                        <strong>Current Sum:</strong>{" "}
                        <span className="text-gray-200">{state.sum}</span>
                      </div>
                      <div>
                        <strong>Target:</strong>{" "}
                        <span className="text-gray-200">{target}</span>
                      </div>
                    </>
                  )}
                  {state.currentQuad && state.currentQuad.length > 0 && (
                    <div className="col-span-2">
                      <strong>Current Quad:</strong>{" "}
                      <span className="text-gray-200">
                        [{state.currentQuad.join(", ")}]
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Terminal size={14} /> Pointers
                </h4>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-gray-400">i:</span>{" "}
                    <span className="text-rose-300">{state.i ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">j:</span>{" "}
                    <span className="text-amber-300">{state.j ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">left:</span>{" "}
                    <span className="text-blue-300">{state.left ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">right:</span>{" "}
                    <span className="text-green-300">{state.right ?? "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <CheckCircle size={14} /> Found Quadruplets
              </h4>
              <div className="flex gap-2 flex-wrap">
                {state.foundQuads && state.foundQuads.length > 0 ? (
                  state.foundQuads.map((quad, idx) => (
                    <div
                      key={idx}
                      className="bg-teal-600/80 text-white px-4 py-2 rounded-lg font-mono text-sm shadow"
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
              <div className="mt-3 text-sm text-gray-400">
                Total found:{" "}
                <span className="text-teal-300">
                  {state.foundQuads?.length || 0}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity & Notes
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-teal-300">O(N³)</span> — two
                  loops + two pointers for each pair.
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">O(1)</span> —
                  excluding space for output.
                </div>
                <div>
                  <strong>Key:</strong> Sorting enables duplicate skipping and
                  efficient two-pointer search.
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

export default FourSum;
