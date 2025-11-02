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
  MousePointer,
  Sparkles,
  HelpCircle,
  Zap,
} from "lucide-react";

// Helper component for pointers in the balloon array
const VisualizerPointer = ({ className = "", text = "" }) => (
  <div
    className={`absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center ${className}`}
  >
    <span className="text-xs font-semibold">{text}</span>
    <MousePointer className="w-5 h-5 -mt-1" />
  </div>
);

// Code snippets for the three languages (from your reference)
const LANG_TABS = ["C++", "Python", "Java"];
const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "int dp[305][305];" },
    { l: 2, t: "int helper(vector<int> &nums, int i, int j) {" },
    { l: 3, t: "    if(i > j) return 0;" },
    { l: 4, t: "    if(dp[i][j] != -1) return dp[i][j];" },
    { l: 5, t: "    int ans = 0;" },
    { l: 6, t: "    for(int k = i; k <= j; k++) {" },
    { l: 7, t: "        ans = max(ans, nums[i-1]*nums[k]*nums[j+1]" },
    { l: 8, t: "                     + helper(nums, i, k-1)" },
    { l: 9, t: "                     + helper(nums, k+1, j));" },
    { l: 10, t: "    }" },
    { l: 11, t: "    return dp[i][j] = ans;" },
    { l: 12, t: "}" },
    { l: 13, t: "int maxCoins(vector<int>& nums) {" },
    { l: 14, t: "    nums.insert(nums.begin(), 1);" },
    { l: 15, t: "    nums.push_back(1);" },
    { l: 16, t: "    int n = nums.size();" },
    { l: 17, t: "    memset(dp, -1, sizeof dp);" },
    { l: 18, t: "    return helper(nums, 1, n-2);" },
    { l: 19, t: "}" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def maxCoins(self, nums: list[int]) -> int:" },
    { l: 3, t: "        nums = [1] + nums + [1]" },
    { l: 4, t: "        n = len(nums)" },
    { l: 5, t: "        memo = {}" },
    { l: 6, t: "" },
    { l: 7, t: "        def helper(i, j):" },
    { l: 8, t: "            if i > j: return 0" },
    { l: 9, t: "            if (i, j) in memo: return memo[(i, j)]" },
    { l: 10, t: "" },
    { l: 11, t: "            ans = 0" },
    { l: 12, t: "            for k in range(i, j + 1):" },
    { l: 13, t: "                coins = nums[i-1] * nums[k] * nums[j+1]" },
    { l: 14, t: "                ans = max(ans, coins + helper(i, k-1) + helper(k+1, j))" },
    { l: 15, t: "            " },
    { l: 16, t: "            memo[(i, j)] = ans" },
    { l: 17, t: "            return ans" },
    { l: 18, t: "" },
    { l: 19, t: "        return helper(1, n - 2)" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "    int[][] dp;" },
    { l: 3, t: "    public int maxCoins(int[] nums) {" },
    { l: 4, t: "        int n = nums.length;" },
    { l: 5, t: "        int[] newNums = new int[n + 2];" },
    { l: 6, t: "        newNums[0] = 1;" },
    { l: 7, t: "        newNums[n + 1] = 1;" },
    { l: 8, t: "        for (int i = 0; i < n; i++) {" },
    { l: 9, t: "            newNums[i + 1] = nums[i];" },
    { l: 10, t: "        }" },
    { l: 11, t: "        " },
    { l: 12, t: "        dp = new int[n + 2][n + 2];" },
    { l: 13, t: "        for (int[] row : dp) Arrays.fill(row, -1);" },
    { l: 14, t: "        return helper(newNums, 1, n);" },
    { l: 15, t: "    }" },
    { l: 16, t: "" },
    { l: 17, t: "    private int helper(int[] nums, int i, int j) {" },
    { l: 18, t: "        if (i > j) return 0;" },
    { l: 19, t: "        if (dp[i][j] != -1) return dp[i][j];" },
    { l: 20, t: "" },
    { l: 21, t: "        int ans = 0;" },
    { l: 22, t: "        for (int k = i; k <= j; k++) {" },
    { l: 23, t: "            int coins = nums[i-1] * nums[k] * nums[j+1];" },
    { l: 24, t: "            ans = Math.max(ans, coins + helper(nums, i, k-1) + helper(nums, k+1, j));" },
    { l: 25, t: "        }" },
    { l: 26, t: "" },
    { l: 27, t: "        return dp[i][j] = ans;" },
    { l: 28, t: "    }" },
    { l: 29, t: "}" },
  ],
};

// Main component
const BurstBalloonsTopDownVisualizer = () => {
  const [numsInput, setNumsInput] = useState("3,1,5,8");
  const [nums, setNums] = useState([]); // This will store the *augmented* [1, ...nums, 1] array
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // UI controls
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1600); // ms per step (inverted)
  const playRef = useRef(null);

  // code tab
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  // Line mapping for code highlighting
  const lineMap = {
    "C++": {
      helper: 2,
      baseCase1: 3,
      baseCase2: 4,
      initAns: 5,
      kLoop: 6,
      calcAns: 7, // Combined 7, 8, 9
      returnAns: 11,
      main: 13,
      mainAugment: 14,
      mainCall: 18,
    },
    Python: {
      helper: 7,
      baseCase1: 8,
      baseCase2: 9,
      initAns: 11,
      kLoop: 12,
      calcAns: 14,
      returnAns: 16,
      main: 2,
      mainAugment: 3,
      mainCall: 19,
    },
    Java: {
      helper: 17,
      baseCase1: 18,
      baseCase2: 19,
      initAns: 21,
      kLoop: 22,
      calcAns: 24,
      returnAns: 27,
      main: 3,
      mainAugment: 5, // Start of augmentation
      mainCall: 14,
    },
  };

  // ----------------- GENERATE HISTORY (Recursive Logic) -----------------
  const generateHistory = useCallback(
    (originalNums) => {
      // 1. Create augmented array
      const newNums = [1, ...originalNums, 1];
      const n = newNums.length;
      const original_n = originalNums.length;
      setNums(newNums);

      // 2. Initialize DP table and history
      const dp = Array.from({ length: n }, () => Array(n).fill(-1));
      // kSplit[i][j] = k that gave the max value for dp[i][j]
      const kSplit = Array.from({ length: n }, () => Array(n).fill(-1));
      const newHistory = [];

      const addState = (props) =>
        newHistory.push({
          dp: dp.map((row) => [...row]),
          kSplit: kSplit.map((row) => [...row]),
          i: null,
          j: null,
          k: null, // Current function call (i, j) and loop (k)
          callStack: [], // To show the recursion
          decision: null,
          explanation: "",
          bestValue: dp[1] ? (dp[1][original_n] !== -1 ? dp[1][original_n] : 0) : 0, // The final answer
          line: null,
          ...props,
        });

      let callStack = [];

      function recursiveHelper(i, j) {
        const stackEntry = `helper(${i}, ${j})`;
        callStack.push(stackEntry);
        const currentLang = activeLang; // Capture lang at time of call

        addState({
          i,
          j,
          callStack: [...callStack],
          line: lineMap[currentLang].helper,
          explanation: `Calling ${stackEntry}. Finding max coins for range [${i}, ${j}].\nBoundaries: nums[${
            i - 1
          }]=${newNums[i - 1]}, nums[${j + 1}]=${newNums[j + 1]}.`,
        });

        // Base case 1: if(i > j)
        addState({
          i,
          j,
          callStack: [...callStack],
          line: lineMap[currentLang].baseCase1,
          explanation: `Checking base case: if(i > j) -> if(${i} > ${j}) is ${
            i > j
          }.`,
        });
        if (i > j) {
          addState({
            i,
            j,
            callStack: [...callStack],
            line: lineMap[currentLang].baseCase1,
            explanation: `Base case hit (i > j). Returning 0.`,
          });
          callStack.pop();
          return 0;
        }

        // Base case 2: memoization
        addState({
          i,
          j,
          callStack: [...callStack],
          line: lineMap[currentLang].baseCase2,
          explanation: `Checking memo: if(dp[${i}][${j}] != -1) -> if(${
            dp[i][j]
          } != -1) is ${dp[i][j] != -1}.`,
          decision: "check-memo",
        });
        if (dp[i][j] != -1) {
          addState({
            i,
            j,
            callStack: [...callStack],
            line: lineMap[currentLang].baseCase2,
            explanation: `Value found in memo. Returning dp[${i}][${j}] = ${dp[i][j]}.`,
            decision: "memo-hit",
          });
          callStack.pop();
          return dp[i][j];
        }

        // Init ans
        let ans = 0;
        addState({
          i,
          j,
          ans,
          callStack: [...callStack],
          line: lineMap[currentLang].initAns,
          explanation: `Initializing ans = 0.`,
        });

        let bestK = -1;

        // k loop
        for (let k = i; k <= j; k++) {
          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].kLoop,
            explanation: `Looping for k=${k}. Considering balloon ${k} (value ${newNums[k]}) as LAST burst in range [${i}, ${j}].`,
            decision: "try-k",
          });

          // Calculate coins for this k
          let coins_k = newNums[i - 1] * newNums[k] * newNums[j + 1];

          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].calcAns,
            explanation: `Calculating burst cost for k=${k}:\nnums[${i - 1}]*nums[${
              k
            }]*nums[${j + 1}] = ${newNums[i - 1]}*${newNums[k]}*${
              newNums[j + 1]
            } = ${coins_k}.`,
            decision: "calc-k-cost",
          });

          // Recursive call left
          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].calcAns,
            explanation: `Making recursive call for left part: helper(${i}, ${
              k - 1
            }).`,
          });
          let left = recursiveHelper(i, k - 1);
          // After call returns, we are back in this context
          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].calcAns,
            explanation: `Left call helper(${i}, ${k - 1}) returned ${left}.`,
          });

          // Recursive call right
          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].calcAns,
            explanation: `Making recursive call for right part: helper(${k + 1}, ${
              j
            }).`,
          });
          let right = recursiveHelper(k + 1, j);
          // After call returns
          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].calcAns,
            explanation: `Right call helper(${k + 1}, ${j}) returned ${right}.`,
          });

          let total = coins_k + left + right;
          let expl = `Total for k=${k}: ${coins_k} (burst) + ${left} (left) + ${right} (right) = ${total}.`;
          let decision = "no-update";

          if (total > ans) {
            expl += `\nThis is > current ans (${ans}). Updating ans = ${total}.`;
            ans = total;
            bestK = k;
            decision = "update-max";
          } else {
            expl += `\nThis is <= current ans (${ans}). No update.`;
          }

          addState({
            i,
            j,
            k,
            ans,
            callStack: [...callStack],
            line: lineMap[currentLang].calcAns,
            explanation: expl,
            decision: decision,
          });
        }

        // End of k loop
        addState({
          i,
          j,
          ans,
          callStack: [...callStack],
          line: lineMap[currentLang].returnAns,
          explanation: `Finished k-loop for helper(${i}, ${j}). Max ans = ${ans}.`,
        });

        // Store in dp and return
        dp[i][j] = ans;
        kSplit[i][j] = bestK;

        addState({
          i,
          j,
          k: bestK,
          ans,
          callStack: [...callStack],
          line: lineMap[currentLang].returnAns,
          explanation: `Storing in memo: dp[${i}][${j}] = ${ans}. Returning ${ans}.`,
          bestValue: dp[1][original_n] !== -1 ? dp[1][original_n] : 0,
          decision: "set-dp",
        });

        callStack.pop();
        return ans;
      }

      // Main execution flow
      addState({
        line: lineMap[activeLang].mainAugment,
        explanation: `Starting maxCoins(). Augmenting nums to [${newNums.join(
          ", "
        )}].`,
      });

      addState({
        line: lineMap[activeLang].mainCall,
        explanation: `Calling main function: helper(1, ${original_n}).`,
      });

      recursiveHelper(1, original_n); // Call with original range (1 to n-2 in C++)

      addState({
        line: lineMap[activeLang].mainCall,
        explanation: `Main call helper(1, ${original_n}) returned.  ${
          dp[1][original_n]
        }.`,
        bestValue: dp[1][original_n],
        decision: "done",
      });

      setHistory(newHistory);
      setCurrentStep(0);
    },
    [activeLang]
  ); // Re-run if language changes (for line highlights)

  // ----------------- LOAD / VALIDATE -----------------
  const load = () => {
    const parsedNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    if (parsedNums.length === 0 || parsedNums.some(isNaN)) {
      alert(
        "Invalid input. Please enter comma-separated numbers (e.g., 3,1,5,8)."
      );
      return;
    }
    
    // Force C++ lang on load, as it's the user's reference
    setActiveLang("C++");
    setIsLoaded(true);
    // Use a timeout to ensure state update applies before heavy compute
    setTimeout(() => generateHistory(parsedNums), 0);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    setNums([]);
    clearInterval(playRef.current);
  };

  // ----------------- STEP CONTROLS -----------------
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // play/pause with speed
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
      }, 2100 - speed); // Invert speed for intuitive slider
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, history.length, currentStep]);

  // update playing state when reaching end
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

  // color mapping for DP table cells
  const cellClass = (row, col) => {
    if (!state.dp) return "bg-gray-700/40 text-gray-500";
    
    // Cell being calculated
    if (row === state.i && col === state.j && state.decision !== 'set-dp' && state.decision !== 'done' && state.decision !== 'memo-hit') {
      return "bg-blue-500/80 ring-2 ring-blue-300 shadow-lg text-white font-bold animate-pulse";
    }

    // Value read from memo
    if (state.decision === 'memo-hit' && row === state.i && col === state.j) {
         return "bg-purple-500/70 ring-2 ring-purple-300 text-white font-bold";
    }
    
    // Highlight subproblems when used in `ans = max(...)`
    // This highlights the cells *after* their recursive calls have returned
     if (state.decision === 'calc-k-cost' || state.decision === 'update-max' || state.decision === 'no-update') {
         if (row === state.i && col === (state.k - 1) && state.dp[row][col] !== -1) { // left call
            return "bg-yellow-500/70 ring-2 ring-yellow-300 text-black font-bold";
         }
         if (row === (state.k + 1) && col === state.j && state.dp[row][col] !== -1) { // right call
            return "bg-yellow-500/70 ring-2 ring-yellow-300 text-black font-bold";
         }
    }

    // Already computed cells
    if (state.dp[row][col] != -1) {
      return "bg-green-700/60 text-white";
    }

    // Not yet computed (base state)
    return "bg-gray-700 text-gray-400";
  };
  
  // Balloon card classes
   const itemClass = (idx) => {
    let classes = "relative w-16 h-16 flex flex-col items-center justify-center rounded-full font-mono font-bold text-white transition-all shadow-lg border-2";

    // Boundaries of the *current call* (i-1 and j+1)
    if (idx === state.i - 1) {
        classes += " bg-blue-600 border-blue-300 scale-110";
    } else if (idx === state.j + 1) {
        classes += " bg-blue-600 border-blue-300 scale-110";
    } 
    // Last-burst balloon (k) being tested
    else if (idx === state.k) {
         classes += " bg-yellow-500 border-yellow-300 scale-110 text-black";
    }
    // Other balloons inside the (i, j) range
    else if (idx >= state.i && idx <= state.j) {
         classes += " bg-gradient-to-br from-rose-500 to-rose-400 border-rose-300";
    }
    // Boundary 1's (if not part of current call)
    else if (idx === 0 || idx === nums.length - 1) {
        classes += " bg-gray-500 border-gray-400 opacity-60";
    }
    // Balloons outside the current call
    else {
        classes += " bg-gray-700 border-gray-600 opacity-70";
    }

    return classes;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-900 text-gray-200">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-rose-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400">
          Burst Balloons Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Visualize the Top-Down Recursive DP (Memoization) solution.
        </p>
      </header>

      {/* INPUT CONTROLS ROW */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <label htmlFor="nums-input" className="text-gray-300 font-medium sr-only">Balloons (nums):</label>
          <input
            id="nums-input"
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="nums (comma-separated), e.g., 3,1,5,8"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 transition text-white font-bold shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={18} /> Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition shadow"
                  aria-label="Step Backward"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 transition shadow"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition shadow"
                  aria-label="Step Forward"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow-inner">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <label className="text-sm text-gray-300" htmlFor="speed-slider">Speed</label>
                <input
                  id="speed-slider"
                  type="range"
                  min={100}
                  max={2000}
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

      {/* ALGORITHM TABS */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${
                activeLang === lang
                  ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Zap size={16} /> <span>Approach: Recursive DP (Memoization)</span>
          </div>
        </div>
      </section>

      {/* MAIN GRID: left (code) / right (visualization) */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter inputs and
          <span className="text-rose-400 font-semibold"> Load & Visualize</span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* LEFT PANEL: CODE SECTION */}
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
              {CODE_SNIPPETS[activeLang].map((line) =>
                renderCodeLine(activeLang, line)
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Current active line highlighted in green.</div>
              <div>
                Tip: Use &lt or &gt keys to navigate, Space to play/pause.
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL: VISUALIZATION SECTION */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* BALLOON ARRAY */}
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner flex flex-col gap-3">
               <h4 className="text-gray-300 text-sm mb-6 flex items-center gap-2">
                 <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZHRoPSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2EtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJhbGxvbiI+PHBhdGggZD0iTTEyLjEgMTguOUE3IDcgMCAwIDAgMTkgMTIiLz48cGF0aCBkPSJNMTEuOSAxOC45QTcgNyAwIDAgMSAxMiAxOSI+PC9wYXRoIGQ9Ik0xMiAyMmExIDEgMCAwIDEtMS0xdi0zLjA3YTEgMSAwIDAgMSAucjY4LTEuMDJMMTIgMTdhMSAxIDAgMCAxIC4xMzIuOThMMTIgMjFhMSAxIDAgMCAxLTEgMWoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI3Ii8+PC9zdmc+" alt="balloon" className="w-4 h-4 text-rose-400" />
                 Augmented Balloon Array `nums`
               </h4>
               <div className="flex gap-4 flex-wrap justify-center items-center h-28">
                 {nums.map((val, idx) => (
                   <div key={idx} className={itemClass(idx)}>
                     {idx === state.i - 1 && <VisualizerPointer text="i-1" className="text-blue-300" />}
                     {idx === state.j + 1 && <VisualizerPointer text="j+1" className="text-blue-300" />}
                     {idx === state.k && <VisualizerPointer text="k" className="text-yellow-300" />}

                     <div className="text-xs text-gray-100 opacity-70">#{idx}</div>
                     <div className="text-xl">{val}</div>
                   </div>
                 ))}
               </div>
            </div>
            
            {/* DP TABLE & CALL STACK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DP Table */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
                  <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                    <Terminal size={14} /> Memoization Table `dp[i][j]`
                  </h4>
                   <div className="overflow-auto max-h-80">
                     <table className="font-mono text-xs border-collapse w-full text-center">
                        <thead>
                            <tr>
                                <th className="sticky top-0 bg-gray-800/50 p-2 text-gray-400 border-b border-gray-700">i \ j</th>
                                {nums.map((_, j) => (
                                    <th key={j} className="sticky top-0 bg-gray-800/50 p-2 text-gray-400 border-b border-gray-700">{j}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                          {state.dp &&
                            state.dp.map((row, i) => (
                              <tr key={i}>
                                <td className="sticky left-0 bg-gray-800/50 p-2 text-gray-400 border-r border-gray-700">{i}</td>
                                {row.map((val, j) => (
                                  <td
                                    key={j}
                                    className={`w-12 h-12 text-center ${cellClass(
                                      i,
                                      j
                                    )} text-[11px] border border-gray-800/50 transition-all duration-300`}
                                  >
                                    {val === -1 ? "-" : val}
                                    {state.kSplit && state.kSplit[i][j] !== -1 && (
                                        <div className="text-[9px] text-yellow-300 opacity-70">(k={state.kSplit[i][j]})</div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                     </table>
                     {!state.dp && <div className="text-gray-500 italic mt-2">DP not computed yet</div>}
                   </div>
                   
                   <div className="flex flex-wrap gap-4 mt-4 text-xs">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-700 border border-gray-600"></div><span className="text-gray-400">Not Computed</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-700/60 border border-green-600"></div><span className="text-gray-400">Computed</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500/80 border border-blue-300"></div><span className="text-gray-400">Calculating</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-500/70 border border-yellow-300"></div><span className="text-gray-400">Subproblem</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-500/70 border border-purple-300"></div><span className="text-gray-400">Memo Hit</span></div>
                   </div>
                </div>

                {/* Call Stack */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
                    <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                        <Cpu size={14} /> Call Stack
                    </h4>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 h-80 overflow-auto flex flex-col-reverse">
                        {state.callStack && state.callStack.length > 0 ? (
                             [...state.callStack].reverse().map((call, idx) => (
                                <div key={idx} className={`font-mono text-sm p-2 rounded ${idx === 0 ? 'text-blue-300 bg-blue-500/10' : 'text-gray-400'}`}>
                                    {call}
                                </div>
                             ))
                        ) : (
                            <div className="text-gray-500 italic h-full flex items-center justify-center">Stack is empty.</div>
                        )}
                    </div>
                </div>
            </div>


            {/* EXPLANATION & OUTPUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg min-h-[160px]">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200 whitespace-pre-wrap text-sm">
                  {state.explanation ||
                    "Load inputs and press 'Load & Visualize' to begin. Use play/step controls to move through the DP."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>
                    <strong>Range (i, j):</strong>{" "}
                    <span className="text-gray-200">
                      {state.i !== null ? `[${state.i}, ${state.j}]` : "-"}
                    </span>
                  </div>
                   <div>
                    <strong>Testing k:</strong>{" "}
                    <span className="text-gray-200">
                      {state.k !== null ? state.k : "-"}
                    </span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <strong>Formula:</strong>{" "}
                    <span className="text-gray-200 font-mono text-xs">
                      ans = max(ans, n[i-1]*n[k]*n[j+1] + h(i,k-1) + h(k+1,j))
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Output
                </h4>
                <div className="text-4xl font-mono text-green-400">
                  {state.bestValue ?? 0}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Final Answer: dp[1][{nums.length > 0 ? nums.length - 2 : 'n-2'}]
                </div>
                 <div className="mt-4 text-xs text-gray-400 space-y-2">
                    <div className="flex items-center gap-2"><HelpCircle size={14} /> <span>`dp[i][j]` = max coins from bursting balloons in range `[i...j]`.</span></div>
                </div>
              </div>
            </div>

            {/* COMPLEXITY */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity & Notes
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-teal-300">O(N³)</span> — Each
                  state `dp[i][j]` is computed once. Inside, there's an O(N)
                  loop (for k). Total states: O(N²). Total time: O(N³)
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">O(N²)</span> — For the
                  memoization table `dp` and O(N) for the recursion stack depth.
                </div>
                <div>
                  <strong>Approach:</strong> This is a Top-Down DP (Memoization). `helper(i, j)` finds the max coins for bursting all balloons in the *inclusive* range `[i, j]`.
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
      .animate-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
      @keyframes gradient-animation { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
      .animate-float { animation: float 18s ease-in-out infinite; }
      .animate-float-delayed { animation: float 20s ease-in-out 8s infinite; }
      @keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
     `}</style>
    </div>
  );
};

export default BurstBalloonsTopDownVisualizer;

