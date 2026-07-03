import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  Clock,
  Zap,
  Cpu,
  GitBranch,
  Target,
  Gauge,
  Sparkles,
  Terminal,
  HelpCircle
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

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
  const s = str.replace(/\[|\]|\s/g, "");
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

// --- Helper: Get Height ---
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
    { l: 3, t: "    int getHeight(TreeNode* root) {" },
    { l: 4, t: "        if (!root) return -1;" },
    { l: 5, t: "        return 1 + max(getHeight(root->left), getHeight(root->right));" },
    { l: 6, t: "    }" },
    { l: 7, t: "" },
    { l: 8, t: "    void fill(vector<vector<string>>& res, TreeNode* root, int r, int c, int height) {" },
    { l: 9, t: "        if (!root) return;" },
    { l: 10, t: "        " },
    { l: 11, t: "        res[r][c] = to_string(root->val);" },
    { l: 12, t: "        " },
    { l: 13, t: "        int offset = pow(2, height - r - 1);" },
    { l: 14, t: "        int leftCol = c - offset;" },
    { l: 15, t: "        int rightCol = c + offset;" },
    { l: 16, t: "        " },
    { l: 17, t: "        fill(res, root->left, r + 1, leftCol, height);" },
    { l: 18, t: "        fill(res, root->right, r + 1, rightCol, height);" },
    { l: 19, t: "    }" },
    { l: 20, t: "" },
    { l: 21, t: "public:" },
    { l: 22, t: "    vector<vector<string>> printTree(TreeNode* root) {" },
    { l: 23, t: "        int height = getHeight(root);" },
    { l: 24, t: "        int m = height + 1;" },
    { l: 25, t: "        int n = pow(2, height + 1) - 1;" },
    { l: 26, t: "        vector<vector<string>> res(m, vector<string>(n, \"\"));" },
    { l: 27, t: "        " },
    { l: 28, t: "        fill(res, root, 0, (n - 1) / 2, height);" },
    { l: 29, t: "        return res;" },
    { l: 30, t: "    }" },
    { l: 31, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def printTree(self, root: Optional[TreeNode]) -> list[list[str]]:" },
    { l: 3, t: "        " },
    { l: 4, t: "        def getHeight(node):" },
    { l: 5, t: "            if not node: return -1" },
    { l: 6, t: "            return 1 + max(getHeight(node.left), getHeight(node.right))" },
    { l: 7, t: "        " },
    { l: 8, t: "        height = getHeight(root)" },
    { l: 9, t: "        m = height + 1" },
    { l: 10, t: "        n = 2**(height + 1) - 1" },
    { l: 11, t: "        res = [[\"\" for _ in range(n)] for _ in range(m)]" },
    { l: 12, t: "        " },
    { l: 13, t: "        def fill(node, r, c):" },
    { l: 14, t: "            if not node: return" },
    { l: 15, t: "            " },
    { l: 16, t: "            res[r][c] = str(node.val)" },
    { l: 17, t: "            " },
    { l: 18, t: "            offset = 2**(height - r - 1)" },
    { l: 19, t: "            leftCol = c - offset" },
    { l: 20, t: "            rightCol = c + offset" },
    { l: 21, t: "            " },
    { l: 22, t: "            fill(node.left, r + 1, leftCol)" },
    { l: 23, t: "            fill(node.right, r + 1, rightCol)" },
    { l: 24, t: "        " },
    { l: 25, t: "        rootCol = (n - 1) // 2" },
    { l: 26, t: "        fill(root, 0, rootCol)" },
    { l: 27, t: "        return res" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "    private int getHeight(TreeNode root) {" },
    { l: 3, t: "        if (root == null) return -1;" },
    { l: 4, t: "        return 1 + Math.max(getHeight(root.left), getHeight(root.right));" },
    { l: 5, t: "    }" },
    { l: 6, t: "" },
    { l: 7, t: "    private void fill(List<List<String>> res, TreeNode root, int r, int c, int height) {" },
    { l: 8, t: "        if (root == null) return;" },
    { l: 9, t: "        " },
    { l: 10, t: "        res.get(r).set(c, String.valueOf(root.val));" },
    { l: 11, t: "        " },
    { l: 12, t: "        int offset = (int) Math.pow(2, height - r - 1);" },
    { l: 13, t: "        int leftCol = c - offset;" },
    { l: 14, t: "        int rightCol = c + offset;" },
    { l: 15, t: "        " },
    { l: 16, t: "        fill(res, root.left, r + 1, leftCol, height);" },
    { l: 17, t: "        fill(res, root.right, r + 1, rightCol, height);" },
    { l: 18, t: "    }" },
    { l: 19, t: "" },
    { l: 20, t: "    public List<List<String>> printTree(TreeNode root) {" },
    { l: 21, t: "        int height = getHeight(root);" },
    { l: 22, t: "        int m = height + 1;" },
    { l: 23, t: "        int n = (int) Math.pow(2, height + 1) - 1;" },
    { l: 24, t: "        " },
    { l: 25, t: "        List<List<String>> res = new ArrayList<>();" },
    { l: 26, t: "        for (int i = 0; i < m; i++) {" },
    { l: 27, t: "            List<String> row = new ArrayList<>();" },
    { l: 28, t: "            for (int j = 0; j < n; j++) {" },
    { l: 29, t: "                row.add(\"\");" },
    { l: 30, t: "            }" },
    { l: 31, t: "            res.add(row);" },
    { l: 32, t: "        }" },
    { l: 33, t: "        " },
    { l: 34, t: "        fill(res, root, 0, (n - 1) / 2, height);" },
    { l: 35, t: "        return res;" },
    { l: 36, t: "    }" },
    { l: 37, t: "}" },
  ],
};

const lineMap = {
  "C++": {
    getHeight_call: 3,
    getHeight_base: 4,
    getHeight_recurse: 5,
    fill_call: 8,
    fill_baseCase: 9,
    fill_placeVal: 11,
    fill_calcOffset: 13,
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
    fill_calcOffset: 18,
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
    fill_calcOffset: 12,
    fill_recurseLeft: 16,
    fill_recurseRight: 17,
    main: 20,
    main_getHeight: 21,
    main_initMatrix: 25,
    main_fillCall: 34,
  },
};

const PrintBinaryTreeVisualizer = () => {
  const [treeInput, setTreeInput] = useState("[1,2,3,null,4]");
  const [activeLang, setActiveLang] = useState("C++");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;
  // empty content here because lineMap was hoisted above

  const generateHistory = useCallback(() => {
    let root;
    try {
      root = buildTree(treeInput);
      if (!root && treeInput.replace(/\[|\]|\s|,/g, "") !== "") {
        throw new Error("Input is empty or invalid.");
      }
    } catch (e) {
      alert(`Invalid tree format: ${e.message}. Example: [1,2,3,null,4]`);
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
        activeCell: null,
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
      const stackEntry = `fill(node=${node ? node.val : "null"}, r=${r}, c=${c})`;
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

    load(newHistory);
  }, [treeInput, activeLang, load]);

  useEffect(() => {
    if (isLoaded) {
      generateHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  const {
    matrix = [[]],
    height = -1,
    m = 0,
    n = 0,
    callStack = [],
    activeCell = null,
    explanation = ""
  } = currentState;

  const codeContent = {};
  CODE_SNIPPETS[activeLang].forEach((item) => {
    codeContent[item.l] = item.t;
  });

  const cellClass = (r, c) => {
    if (!matrix || !matrix[r]) return "bg-gray-700/40 text-gray-500";
    if (activeCell && r === activeCell[0] && c === activeCell[1]) {
      return "bg-blue-500/80 ring-2 ring-blue-300 shadow-lg text-white font-bold animate-pulse";
    }
    if (matrix[r][c] !== "") {
      return "bg-green-700/60 text-white";
    }
    return "bg-gray-800 text-gray-400 border border-gray-700";
  };

  const inputSection = (
    <>
      <div className="flex flex-col sm:flex-row gap-3 flex-grow w-full items-center">
        <input
          type="text"
          value={treeInput}
          onChange={(e) => setTreeInput(e.target.value)}
          disabled={isLoaded}
          className="flex-grow p-2.5 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm disabled:opacity-50"
          placeholder="e.g., [1,2,3,null,4]"
        />
        <select
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-semibold cursor-pointer text-sm"
        >
          {LANG_TABS.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      {!isLoaded && (
        <button
          onClick={generateHistory}
          className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
        >
          <Sparkles size={18} /> Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h4 className="font-semibold text-blue-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={20} /> Matrix Height (h)
        </h4>
        <div className="font-mono text-3xl font-bold text-blue-300">
          {height !== -1 ? height : "-"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Gauge size={20} /> Matrix Size (m x n)
        </h4>
        <div className="font-mono text-2xl font-bold text-purple-300">
          {m > 0 ? `${m} x ${n}` : "-"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center col-span-1 md:col-span-1">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={20} /> Active Cell [r, c]
        </h4>
        <div className="font-mono text-2xl font-bold text-green-400">
          {activeCell ? `[${activeCell[0]}, ${activeCell[1]}]` : "-"}
        </div>
      </div>

      {callStack.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <Cpu size={16} /> Call Stack
          </h4>
          <div className="space-y-1 max-h-28 overflow-y-auto flex flex-col-reverse">
            {[...callStack].reverse().map((call, idx) => (
              <div key={idx} className={`font-mono text-xs p-1.5 rounded ${idx === 0 ? "text-blue-300 bg-blue-500/10" : "text-gray-400"}`}>
                {call}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sm:col-span-3 bg-gray-950/40 rounded-xl p-4 border border-gray-800">
        <h4 className="text-sm font-bold text-gray-300 mb-2 select-none">Formulas:</h4>
        <div className="text-gray-400 font-mono text-xs space-y-1">
          <div>Left Child Position: [r + 1][c - 2^(height - r - 1)]</div>
          <div>Right Child Position: [r + 1][c + 2^(height - r - 1)]</div>
        </div>
      </div>

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 select-none">
          <Clock size={16} /> Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Time Complexity: O(h * 2ʰ)</span>
            <p className="text-gray-400">Proportional to the output matrix size, where m = h+1 and n = 2^(h+1)-1.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(h * 2ʰ)</span>
            <p className="text-gray-400">Dominated by the output matrix size. Recursion stack uses O(h) space.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Print Binary Tree"
      description="Visualize the recursive tree printing matrix placement algorithm (LeetCode #655)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={currentState.line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full overflow-auto max-h-80 p-2 bg-gray-950/50 rounded-xl border border-gray-850">
        <table className="font-mono text-xs border-collapse w-full text-center select-none">
          <thead>
            <tr>
              <th className="sticky top-0 bg-gray-950 p-2 text-gray-400 border-b border-gray-800">
                r \ c
              </th>
              {matrix && matrix[0] && matrix[0].map((_, c) => (
                <th key={c} className="sticky top-0 bg-gray-950 p-2 text-gray-400 border-b border-gray-800">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix && matrix.map((row, r) => (
              <tr key={r}>
                <td className="sticky left-0 bg-gray-950 p-2 text-gray-400 border-r border-gray-800">
                  {r}
                </td>
                {row.map((val, c) => (
                  <td
                    key={c}
                    className={`w-10 h-10 text-center ${cellClass(r, c)} text-[11px] border border-gray-800/50 transition-all duration-300`}
                  >
                    {val === "" ? `""` : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VisualizerLayout>
  );
};

export default PrintBinaryTreeVisualizer;