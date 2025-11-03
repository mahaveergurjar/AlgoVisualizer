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
  GitBranch,
  Sparkles,
  HelpCircle,
} from "lucide-react";

// --- Helper: TreeNode class ---
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// --- Helper: Build Tree from LeetCode array format ---
const buildTree = (str) => {
  const s = str.replace(/[\[\]\s]/g, "");
  if (s === "") return null;
  const values = s.split(",").map((v) => (v === "null" ? null : parseInt(v, 10)));
  if (values.length === 0 || values[0] === null) return null;

  const root = new TreeNode(values[0]);
  const queue = [root];
  let i = 1;

  while (i < values.length) {
    const node = queue.shift();
    if (!node) break;

    // Left child
    if (values[i] !== null && values[i] !== undefined) {
      node.left = new TreeNode(values[i]);
      queue.push(node.left);
    }
    i++;

    // Right child
    if (values[i] !== null && values[i] !== undefined) {
      node.right = new TreeNode(values[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
};

// --- Helper: Get Height (LC definition) ---
const getTreeHeight = (root) => {
  if (!root) return -1;
  return 1 + Math.max(getTreeHeight(root.left), getTreeHeight(root.right));
};

// --- Code Snippets ---
const LANG_TABS = ["C++", "Python", "Java"];
const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "private:" },
    { l: 3, t: "    int getHeight(TreeNode* root) {" },
    { l: 4, t: "        if (!root) return -1;" },
    { l: 5, t: "        return 1 + max(getHeight(root->left), getHeight(root->right));" },
    { l: 6, t: "    }" },
    { l: 7, t: "" },
    { l: 8, t: "    void fill(vector<vector<string>>& res, TreeNode* root, int r, int c, int height) {" },
    { l: 9, t: "        if (!root) return;" },
    { l: 10, t: "        " },
    { l: 11, t: "        res[r][c] = to_string(root->val);" },
    { l: 12, t: "        " },
    { l: 13, t: "        int offset = pow(2, height - r - 1);" },
    { l: 14, t: "        int leftCol = c - offset;" },
    { l: 15, t: "        int rightCol = c + offset;" },
    { l: 16, t: "        " },
    { l: 17, t: "        fill(res, root->left, r + 1, leftCol, height);" },
    { l: 18, t: "        fill(res, root->right, r + 1, rightCol, height);" },
    { l: 19, t: "    }" },
    { l: 20, t: "" },
    { l: 21, t: "public:" },
    { l: 22, t: "    vector<vector<string>> printTree(TreeNode* root) {" },
    { l: 23, t: "        int height = getHeight(root);" },
    { l: 24, t: "        int m = height + 1;" },
    { l: 25, t: "        int n = pow(2, height + 1) - 1;" },
    { l: 26, t: "        vector<vector<string>> res(m, vector<string>(n, \"\"));" },
    { l: 27, t: "        " },
    { l: 28, t: "        fill(res, root, 0, (n - 1) / 2, height);" },
    { l: 29, t: "        return res;" },
    { l: 30, t: "    }" },
    { l: 31, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def printTree(self, root: Optional[TreeNode]) -> list[list[str]]:" },
    { l: 3, t: "        " },
    { l: 4, t: "        def getHeight(node):" },
    { l: 5, t: "            if not node: return -1" },
    { l: 6, t: "            return 1 + max(getHeight(node.left), getHeight(node.right))" },
    { l: 7, t: "        " },
    { l: 8, t: "        height = getHeight(root)" },
    { l: 9, t: "        m = height + 1" },
    { l: 10, t: "        n = 2**(height + 1) - 1" },
    { l: 11, t: "        res = [[\"\" for _ in range(n)] for _ in range(m)]" },
    { l: 12, t: "        " },
    { l: 13, t: "        def fill(node, r, c):" },
    { l: 14, t: "            if not node: return" },
    { l: 15, t: "            " },
    { l: 16, t: "            res[r][c] = str(node.val)" },
    { l: 17, t: "            " },
    { l: 18, t: "            offset = 2**(height - r - 1)" },
    { l: 19, t: "            leftCol = c - offset" },
    { l: 20, t: "            rightCol = c + offset" },
    { l: 21, t: "            " },
    { l: 22, t: "            fill(node.left, r + 1, leftCol)" },
    { l: 23, t: "            fill(node.right, r + 1, rightCol)" },
    { l: 24, t: "        " },
    { l: 25, t: "        rootCol = (n - 1) // 2" },
    { l: 26, t: "        fill(root, 0, rootCol)" },
    { l: 27, t: "        return res" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "    private int getHeight(TreeNode root) {" },
    { l: 3, t: "        if (root == null) return -1;" },
    { l: 4, t: "        return 1 + Math.max(getHeight(root.left), getHeight(root.right));" },
    { l: 5, t: "    }" },
    { l: 6, t: "" },
    { l: 7, t: "    private void fill(List<List<String>> res, TreeNode root, int r, int c, int height) {" },
    { l: 8, t: "        if (root == null) return;" },
    { l: 9, t: "        " },
    { l: 10, t: "        res.get(r).set(c, String.valueOf(root.val));" },
    { l: 11, t: "        " },
    { l: 12, t: "        int offset = (int) Math.pow(2, height - r - 1);" },
    { l: 13, t: "        int leftCol = c - offset;" },
    { l: 14, t: "        int rightCol = c + offset;" },
    { l: 15, t: "        " },
    { l: 16, t: "        fill(res, root.left, r + 1, leftCol, height);" },
    { l: 17, t: "        fill(res, root.right, r + 1, rightCol, height);" },
    { l: 18, t: "    }" },
    { l: 19, t: "" },
    { l: 20, t: "    public List<List<String>> printTree(TreeNode root) {" },
    { l: 21, t: "        int height = getHeight(root);" },
    { l: 22, t: "        int m = height + 1;" },
    { l: 23, t: "        int n = (int) Math.pow(2, height + 1) - 1;" },
    { l: 24, t: "        " },
    { l: 25, t: "        List<List<String>> res = new ArrayList<>();" },
    { l: 26, t: "        for (int i = 0; i < m; i++) {" },
    { l: 27, t: "            List<String> row = new ArrayList<>();" },
    { l: 28, t: "            for (int j = 0; j < n; j++) {" },
    { l: 29, t: "                row.add(\"\");" },
    { l: 30, t: "            }" },
    { l: 31, t: "            res.add(row);" },
    { l: 32, t: "        }" },
    { l: 33, t: "        " },
    { l: 34, t: "        fill(res, root, 0, (n - 1) / 2, height);" },
    { l: 35, t: "        return res;" },
    { l: 36, t: "    }" },
    { l: 37, t: "}" },
  ],
};

// Main component
const PrintBinaryTreeVisualizer = () => {
  const [treeInput, setTreeInput] = useState("[1,2,3,null,4]");
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
      getHeight_call: 3,
      getHeight_base: 4,
      getHeight_recurse: 5,
      fill_call: 8,
      fill_baseCase: 9,
      fill_placeVal: 11,
      fill_calcOffset: 13, // 13-15
      fill_recurseLeft: 17,
      fill_recurseRight: 18,
      main: 22,
      main_getHeight: 23,
      main_initMatrix: 26,
      main_fillCall: 28,
    },
    Python: {
      getHeight_call: 4,
      getHeight_base: 5,
      getHeight_recurse: 6,
      fill_call: 13,
      fill_baseCase: 14,
      fill_placeVal: 16,
      fill_calcOffset: 18, // 18-20
      fill_recurseLeft: 22,
      fill_recurseRight: 23,
      main: 2,
      main_getHeight: 8,
      main_initMatrix: 11,
      main_fillCall: 26,
    },
    Java: {
      getHeight_call: 2,
      getHeight_base: 3,
      getHeight_recurse: 4,
      fill_call: 7,
      fill_baseCase: 8,
      fill_placeVal: 10,
      fill_calcOffset: 12, // 12-14
      fill_recurseLeft: 16,
      fill_recurseRight: 17,
      main: 20,
      main_getHeight: 21,
      main_initMatrix: 25, // 25-32
      main_fillCall: 34,
    },
  };

  // ----------------- GENERATE HISTORY (Recursive Logic) -----------------
  const generateHistory = useCallback(
    (treeStr) => {
      let root;
      try {
        root = buildTree(treeStr);
        if (!root && treeStr.replace(/[\[\]\s,]/g, "") !== "")
          throw new Error("Input is empty or invalid.");
      } catch (e) {
        alert(
          `Invalid tree format: ${e.message}. Example: [1,2,3,null,4]`
        );
        resetAll();
        return;
      }

      const newHistory = [];
      let callStack = [];

      const addState = (props) =>
        newHistory.push({
          matrix: [[]],
          height: -1,
          m: 0,
          n: 0,
          callStack: [],
          activeCell: null, // [r, c]
          explanation: "",
          line: null,
          ...props,
        });

      // --- Phase 1: Get Height ---
      addState({
        explanation: "Calculating tree height...",
        line: lineMap[activeLang].main_getHeight,
      });

      const height = getTreeHeight(root);

      addState({
        height: height,
        explanation: `Height calculated: h = ${height}.`,
        line: lineMap[activeLang].main_getHeight,
      });

      // --- Phase 2: Initialize Matrix ---
      const m = height + 1;
      const n = Math.pow(2, height + 1) - 1;
      let matrix = Array.from({ length: m }, () => Array(n).fill(""));

      addState({
        height,
        m,
        n,
        matrix: matrix.map((r) => [...r]),
        explanation: `Initializing ${m}x${n} matrix.\nm = h + 1 = ${m}\nn = 2^(h+1) - 1 = ${n}`,
        line: lineMap[activeLang].main_initMatrix,
      });

      // --- Phase 3: Recursive Fill ---
      const fill = (node, r, c) => {
        const stackEntry = `fill(node=${
          node ? node.val : "null"
        }, r=${r}, c=${c})`;
        callStack.push(stackEntry);

        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          activeCell: [r, c],
          explanation: `Calling ${stackEntry}.`,
          line: lineMap[activeLang].fill_call,
        });

        // Base case
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          activeCell: [r, c],
          explanation: `Checking base case: if (node == null) -> ${!node}.`,
          line: lineMap[activeLang].fill_baseCase,
        });
        if (!node) {
          addState({
            height,
            m,
            n,
            matrix: matrix.map((r) => [...r]),
            callStack: [...callStack],
            explanation: `Base case hit. Returning.`,
            line: lineMap[activeLang].fill_baseCase,
          });
          callStack.pop();
          return;
        }

        // Place value
        matrix[r][c] = node.val.toString();
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          activeCell: [r, c],
          explanation: `Placed ${node.val} at res[${r}][${c}].`,
          line: lineMap[activeLang].fill_placeVal,
        });

        // Calculate offset
        const offset = Math.pow(2, height - r - 1);
        const leftCol = c - offset;
        const rightCol = c + offset;

        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          activeCell: [r, c],
          explanation: `Calculating offset for row ${r + 1}:\noffset = 2^(h-r-1) = 2^(${height}-${r}-1) = ${offset}\nLeft col: ${c} - ${offset} = ${leftCol}\nRight col: ${c} + ${offset} = ${rightCol}`,
          line: lineMap[activeLang].fill_calcOffset,
        });

        // Recurse Left
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          explanation: `Recursing for left child...`,
          line: lineMap[activeLang].fill_recurseLeft,
        });
        fill(node.left, r + 1, leftCol);

        // Back from left
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          explanation: `Returned from left child call.`,
          line: lineMap[activeLang].fill_recurseLeft,
        });

        // Recurse Right
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          explanation: `Recursing for right child...`,
          line: lineMap[activeLang].fill_recurseRight,
        });
        fill(node.right, r + 1, rightCol);

        // Back from right
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          explanation: `Returned from right child call.`,
          line: lineMap[activeLang].fill_recurseRight,
        });

        // Return
        callStack.pop();
        addState({
          height,
          m,
          n,
          matrix: matrix.map((r) => [...r]),
          callStack: [...callStack],
          explanation: `Returning from ${stackEntry}.`,
          line: lineMap[activeLang].fill_call,
        });
      };

      // --- Start the process ---
      const rootCol = (n - 1) / 2;
      addState({
        height,
        m,
        n,
        matrix: matrix.map((r) => [...r]),
        explanation: `Starting fill process at root.\nCalling fill(root, 0, ${rootCol}).`,
        line: lineMap[activeLang].main_fillCall,
      });

      fill(root, 0, rootCol);

      addState({
        height,
        m,
        n,
        matrix: matrix.map((r) => [...r]),
        explanation: `Matrix construction complete!`,
        line: lineMap[activeLang].main_fillCall,
        activeCell: null,
      });

      setHistory(newHistory);
      setCurrentStep(0);
    },
    [activeLang]
  ); // Re-run if language changes (for line highlights)

  // ----------------- LOAD / VALIDATE -----------------
  const load = () => {
    setIsLoaded(true);
    // Use a timeout to ensure state update applies before heavy compute
    setTimeout(() => generateHistory(treeInput), 0);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
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

  // color mapping for Matrix cells
  const cellClass = (r, c) => {
    if (!state.matrix || !state.matrix[r])
      return "bg-gray-700/40 text-gray-500";

    // Cell being placed
    if (
      state.activeCell &&
      r === state.activeCell[0] &&
      c === state.activeCell[1]
    ) {
      return "bg-blue-500/80 ring-2 ring-blue-300 shadow-lg text-white font-bold animate-pulse";
    }

    // Already computed cells
    if (state.matrix[r][c] !== "") {
      return "bg-green-700/60 text-white";
    }

    // Not yet computed (base state)
    return "bg-gray-700 text-gray-400";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-900 text-gray-200">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-blue-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-green-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-400 to-teal-400">
          Print Binary Tree Visualizer
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Visualize the recursive placement algorithm (LC 655).
        </p>
      </header>

      {/* INPUT CONTROLS ROW */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <label
            htmlFor="tree-input"
            className="text-gray-300 font-medium sr-only"
          >
            Tree (LeetCode format):
          </label>
          <input
            id="tree-input"
            type="text"
            value={treeInput}
            onChange={(e) => setTreeInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
            placeholder="e.g., [1,2,3,null,4]"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={18} /> Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-40 transition shadow"
                  aria-label="Step Backward"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 transition shadow"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-40 transition shadow"
                  aria-label="Step Forward"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow-inner">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <label
                  className="text-sm text-gray-300"
                  htmlFor="speed-slider"
                >
                  Speed
                </label>
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
                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <GitBranch size={16} /> <span>Approach: Recursive DFS</span>
          </div>
        </div>
      </section>

      {/* MAIN GRID: left (code) / right (visualization) */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter inputs and
          <span className="text-blue-400 font-semibold">
            {" "}
            Load & Visualize
          </span>{" "}
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
            {/* MATRIX & CALL STACK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matrix Table */}
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Terminal size={14} /> Output Matrix `res[r][c]`
                </h4>
                <div className="overflow-auto max-h-80">
                  <table className="font-mono text-xs border-collapse w-full text-center">
                    <thead>
                      <tr>
                        <th className="sticky top-0 bg-gray-800/50 p-2 text-gray-400 border-b border-gray-700">
                          r \ c
                        </th>
                        {state.matrix &&
                          state.matrix[0] &&
                          state.matrix[0].map((_, c) => (
                            <th
                              key={c}
                              className="sticky top-0 bg-gray-800/50 p-2 text-gray-400 border-b border-gray-700"
                            >
                              {c}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {state.matrix &&
                        state.matrix.map((row, r) => (
                          <tr key={r}>
                            <td className="sticky left-0 bg-gray-800/50 p-2 text-gray-400 border-r border-gray-700">
                              {r}
                            </td>
                            {row.map((val, c) => (
                              <td
                                key={c}
                                className={`w-10 h-10 text-center ${cellClass(
                                  r,
                                  c
                                )} text-[11px] border border-gray-800/50 transition-all duration-300`}
                              >
                                {val === "" ? `""` : val}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!state.matrix && (
                    <div className="text-gray-500 italic mt-2">
                      Matrix not computed yet
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-700 border border-gray-600"></div>
                    <span className="text-gray-400">Empty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-700/60 border border-green-600"></div>
                    <span className="text-gray-400">Set</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500/80 border border-blue-300"></div>
                    <span className="text-gray-400">Placing</span>
                  </div>
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
                      <div
                        key={idx}
                        className={`font-mono text-sm p-2 rounded ${
                          idx === 0
                            ? "text-blue-300 bg-blue-500/10"
                            : "text-gray-400"
                        }`}
                      >
                        {call}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic h-full flex items-center justify-center">
                      Stack is empty.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EXPLANATION */}
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg min-h-[160px]">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <FileText size={14} /> Explanation
              </h4>
              <p className="text-gray-200 whitespace-pre-wrap text-sm">
                {state.explanation ||
                  "Load inputs and press 'Load & Visualize' to begin. Use play/step controls to move through the algorithm."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>
                  <strong>Height (h):</strong>{" "}
                  <span className="text-gray-200">
                    {state.height !== -1 ? state.height : "-"}
                  </span>
                </div>
                <div>
                  <strong>Dimensions:</strong>{" "}
                  <span className="text-gray-200">
                    {state.m > 0 ? `${state.m} x ${state.n}` : "-"}
                  </span>
                </div>
                <div className="col-span-2 mt-2">
                  <strong>Formulas:</strong>{" "}
                  <div className="text-gray-200 font-mono text-xs space-y-1 mt-1">
                    <div>Left Child: [r+1][c - 2^(h-r-1)]</div>
                    <div>Right Child: [r+1][c + 2^(h-r-1)]</div>
                  </div>
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
                  <span className="font-mono text-teal-300">
                    O(h * 2ʰ)
                  </span>{" "}
                  — The algorithm performs two passes. First, `getHeight` runs in
                  O(N) time (N=nodes). Second, the `fill` function visits
                  each cell of the `m x n` matrix. Since `m = h+1` and `n =
                  2^(h+1)-1`, the time is proportional to the matrix size,
                  which is O(h * 2ʰ).
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">
                    O(h * 2ʰ)
                  </span>{" "}
                  — The space is dominated by the output matrix `res`.
                  The recursion stack depth is at most O(h).
                </div>
                <div>
                  <HelpCircle size={14} className="inline mr-1" />
                  `h` is the height of the tree (a root-only tree has `h=0`).
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

export default PrintBinaryTreeVisualizer;