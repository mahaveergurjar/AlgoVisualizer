import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  Zap,
  Cpu,
  GitBranch,
  Target,
  Sparkles,
  Layers,
  List
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

// --- Helper: TreeNode class (with unique ID) ---
let nodeIdCounter = 0;
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.id = ++nodeIdCounter;
  }
}

// --- Helper: Build Tree ---
const buildTreeFromLevelOrder = (values) => {
  nodeIdCounter = 0;
  if (values.length === 0 || values[0] === null) return null;
  
  const nodes = values.map(val => val === null ? null : new TreeNode(val));
  
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] !== null) {
      const leftIndex = 2 * i + 1;
      const rightIndex = 2 * i + 2;
      
      if (leftIndex < nodes.length) nodes[i].left = nodes[leftIndex];
      if (rightIndex < nodes.length) nodes[i].right = nodes[rightIndex];
    }
  }
  
  return nodes[0];
};

// --- Helper: Compute (x, y) Layout ---
const computeTreeLayout = (root) => {
  if (!root) {
    return { nodes: [], edges: [], width: 0, height: 0 };
  }

  const nodes = [];
  const edges = [];
  const allNodes = [];
  const xCoords = {};
  const xSpacing = 60;
  const ySpacing = 70;
  const yOffset = 40;
  let currentX = 0;
  let maxLevel = 0;

  function getLevels(node, level) {
    if (!node) return;
    node.level = level;
    allNodes.push(node);
    maxLevel = Math.max(maxLevel, level);
    getLevels(node.left, level + 1);
    getLevels(node.right, level + 1);
  }
  getLevels(root, 0);

  function assignXCoords(node) {
    if (!node) return;
    assignXCoords(node.left);
    xCoords[node.id] = currentX;
    currentX += xSpacing;
    assignXCoords(node.right);
  }
  assignXCoords(root);

  let minX = Infinity;
  let maxX = -Infinity;

  for (const node of allNodes) {
    const x = xCoords[node.id];
    const y = node.level * ySpacing + yOffset;
    
    nodes.push({ id: node.id, val: node.val, x, y, level: node.level });
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);

    if (node.left) {
      edges.push({ from: node.id, to: node.left.id, type: "left" });
    }
    if (node.right) {
      edges.push({ from: node.id, to: node.right.id, type: "right" });
    }
  }

  const xOffset = (minX < 30) ? (30 - minX) : 0;
  for (const node of nodes) {
      node.x += xOffset;
  }
  
  const layoutWidth = maxX + xOffset + 30;
  const height = maxLevel * ySpacing + yOffset + 40;

  return { nodes, edges, width: layoutWidth, height: Math.max(250, height) };
};

// --- TreeNode SVG Component ---
const TreeNodeVisual = ({ 
  node, 
  x, 
  y,
  isCurr = false,
  isPred = false,
  isVisited = false,
}) => {
  if (!node) return null;

  const getNodeColor = () => {
    if (isCurr) return "#3b82f6"; // Blue for curr
    if (isPred) return "#f59e0b"; // Amber for pred
    if (isVisited) return "#10b981"; // Green for visited
    return "#6b7280"; // Gray for normal
  };

  const getStrokeColor = () => {
    if (isCurr) return "#1d4ed8";
    if (isPred) return "#d97706";
    if (isVisited) return "#059669";
    return "#4b5563";
  };

  return (
    <g className="transition-all duration-500 ease-out">
      <circle
        cx={x}
        cy={y}
        r={20}
        fill={getNodeColor()}
        stroke={getStrokeColor()}
        strokeWidth={2}
        className="transition-all duration-300"
      />
      
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-bold fill-white pointer-events-none select-none"
      >
        {node.val}
      </text>
      
      {isCurr && (
        <circle
          cx={x}
          cy={y}
          r={24}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

// --- Tree Visualization Component ---
const TreeVisualization = ({ layout, state }) => {
  const svgRef = useRef();
  const [viewBox, setViewBox] = useState(`0 0 800 400`);
  
  useEffect(() => {
    if (layout.width && layout.height) {
      setViewBox(`0 0 ${layout.width} ${layout.height}`);
    }
  }, [layout.width, layout.height]);

  const { nodes = [], edges = [] } = layout;
  const { currId, predId, result = [], tempLinks = [] } = state;

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full max-w-[650px] border border-gray-800 rounded-xl bg-gray-950/40 backdrop-blur-sm"
        style={{ maxHeight: "380px" }}
      >
        <defs>
          <marker
            id="arrowhead-morris"
            markerWidth="10"
            markerHeight="10"
            refX="18"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>

        {/* 1. Normal tree edges */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={`edge-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#4b5563"
              strokeWidth="2"
            />
          );
        })}

        {/* 2. Morris Thread Links (Predecessor -> Curr) */}
        {tempLinks.map((link, idx) => {
          const fromNode = nodes.find(n => n.id === link.from);
          const toNode = nodes.find(n => n.id === link.to);
          if (!fromNode || !toNode) return null;

          // Draw a curved bezier curve for threads
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const dr = Math.sqrt(dx * dx + dy * dy);

          return (
            <path
              key={`thread-${idx}`}
              d={`M${fromNode.x},${fromNode.y} A${dr},${dr} 0 0,1 ${toNode.x},${toNode.y}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="4,4"
              markerEnd="url(#arrowhead-morris)"
              className="transition-all duration-500"
            />
          );
        })}

        {/* 3. Tree Nodes */}
        {nodes.map((node) => (
          <TreeNodeVisual
            key={node.id}
            node={node}
            x={node.x}
            y={node.y}
            isCurr={currId === node.id}
            isPred={predId === node.id}
            isVisited={result.includes(node.val)}
          />
        ))}
      </svg>
    </div>
  );
};

// --- Code Snippets ---
const LANG_TABS = ["C++", "Python", "Java"];
const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "public:" },
    { l: 3, t: "  vector<int> inorderTraversal(TreeNode* root) {" },
    { l: 4, t: "    vector<int> ans;" },
    { l: 5, t: "    TreeNode* curr = root;" },
    { l: 6, t: "    while(curr != NULL) {" },
    { l: 7, t: "      if(curr->left != NULL) {" },
    { l: 8, t: "        TreeNode* pred = curr->left;" },
    { l: 9, t: "        while(pred->right != NULL && pred->right != curr) {" },
    { l: 10, t: "          pred = pred->right;" },
    { l: 11, t: "        }" },
    { l: 12, t: "        if(pred->right == NULL) {" },
    { l: 13, t: "          pred->right = curr;" },
    { l: 14, t: "          curr = curr->left;" },
    { l: 15, t: "        }" },
    { l: 16, t: "        else { // pred->right == curr" },
    { l: 17, t: "          pred->right = NULL;" },
    { l: 18, t: "          ans.push_back(curr->val);" },
    { l: 19, t: "          curr = curr->right;" },
    { l: 20, t: "        }" },
    { l: 21, t: "      }" },
    { l: 22, t: "      else { // curr->left == NULL" },
    { l: 23, t: "        ans.push_back(curr->val);" },
    { l: 24, t: "        curr = curr->right;" },
    { l: 25, t: "      }" },
    { l: 26, t: "    }" },
    { l: 27, t: "    return ans;" },
    { l: 28, t: "  }" },
    { l: 29, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "  def inorderTraversal(self, root: Optional[TreeNode]) -> list[int]:" },
    { l: 3, t: "    ans = []" },
    { l: 4, t: "    curr = root" },
    { l: 5, t: "    while curr:" },
    { l: 6, t: "      if curr.left:" },
    { l: 7, t: "        pred = curr.left" },
    { l: 8, t: "        while pred.right and pred.right != curr:" },
    { l: 9, t: "          pred = pred.right" },
    { l: 10, t: "        " },
    { l: 11, t: "        if not pred.right:" },
    { l: 12, t: "          pred.right = curr" },
    { l: 13, t: "          curr = curr.left" },
    { l: 14, t: "        else: # pred.right == curr" },
    { l: 15, t: "          pred.right = None" },
    { l: 16, t: "          ans.append(curr.val)" },
    { l: 17, t: "          curr = curr.right" },
    { l: 18, t: "      " },
    { l: 19, t: "      else: # curr.left is None" },
    { l: 20, t: "        ans.append(curr.val)" },
    { l: 21, t: "        curr = curr.right" },
    { l: 22, t: "    " },
    { l: 23, t: "    return ans" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "  public List<Integer> inorderTraversal(TreeNode root) {" },
    { l: 3, t: "    List<Integer> ans = new ArrayList<>();" },
    { l: 4, t: "    TreeNode curr = root;" },
    { l: 5, t: "    while (curr != null) {" },
    { l: 6, t: "      if (curr.left != null) {" },
    { l: 7, t: "        TreeNode pred = curr.left;" },
    { l: 8, t: "        while (pred.right != null && pred.right != curr) {" },
    { l: 9, t: "          pred = pred.right;" },
    { l: 10, t: "        }" },
    { l: 11, t: "        if (pred.right == null) {" },
    { l: 12, t: "          pred.right = curr;" },
    { l: 13, t: "          curr = curr.left;" },
    { l: 14, t: "        }" },
    { l: 15, t: "        else { // pred.right == curr" },
    { l: 16, t: "          pred.right = null;" },
    { l: 17, t: "          ans.add(curr.val);" },
    { l: 18, t: "          curr = curr.right;" },
    { l: 19, t: "        }" },
    { l: 20, t: "      }" },
    { l: 21, t: "      else { // curr.left == null" },
    { l: 22, t: "        ans.add(curr.val);" },
    { l: 23, t: "        curr = curr.right;" },
    { l: 24, t: "      }" },
    { l: 25, t: "    }" },
    { l: 26, t: "    return ans;" },
    { l: 27, t: "  }" },
    { l: 28, t: "}" },
  ],
};

const lineMap = {
  "C++": {
    init_ans: 4,
    init_curr: 5,
    main_loop: 6,
    check_left: 7,
    find_pred_start: 8,
    find_pred_loop: 9,
    move_pred: 10,
    check_link: 12,
    link_pred: 13,
    move_left: 14,
    unlink_pred: 17,
    visit_unlink: 18,
    move_right_unlink: 19,
    visit_no_left: 23,
    move_right_no_left: 24,
    end: 27,
  },
  Python: {
    init_ans: 3,
    init_curr: 4,
    main_loop: 5,
    check_left: 6,
    find_pred_start: 7,
    find_pred_loop: 8,
    move_pred: 9,
    check_link: 11,
    link_pred: 12,
    move_left: 13,
    unlink_pred: 15,
    visit_unlink: 16,
    move_right_unlink: 17,
    visit_no_left: 20,
    move_right_no_left: 21,
    end: 23,
  },
  Java: {
    init_ans: 3,
    init_curr: 4,
    main_loop: 5,
    check_left: 6,
    find_pred_start: 7,
    find_pred_loop: 8,
    move_pred: 9,
    check_link: 11,
    link_pred: 12,
    move_left: 13,
    unlink_pred: 16,
    visit_unlink: 17,
    move_right_unlink: 18,
    visit_no_left: 22,
    move_right_no_left: 23,
    end: 26,
  },
};

// --- Main Component ---
const MorrisTraversalVisualizer = () => {
  const [treeInput, setTreeInput] = useState("4,2,6,1,3,5,7");
  const [activeLang, setActiveLang] = useState("C++");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback(() => {
    let root;
    let layout;
    
    try {
      const values = treeInput.split(",").map(s => {
        const trimmed = s.trim();
        if (trimmed === "null" || trimmed === "") return null;
        const num = parseInt(trimmed);
        return isNaN(num) ? null : num;
      });

      root = buildTreeFromLevelOrder(values);
      layout = computeTreeLayout(root);
    } catch (e) {
      alert(`Invalid tree format: ${e.message}. Example: 4,2,6,1,3,5,7`);
      return;
    }

    if (!root) {
      load([{
        layout: { nodes: [], edges: [], width: 300, height: 250 },
        result: [],
        tempLinks: [],
        currId: null,
        predId: null,
        explanation: "Tree is empty.",
        isComplete: true,
        step: 0,
        line: lineMap[activeLang].end,
      }]);
      return;
    }

    const newHistory = [];
    const baseState = {
      layout: layout,
      result: [],
      tempLinks: [],
      currId: null,
      predId: null,
    };

    const addState = (props) => {
      const lastState = newHistory[newHistory.length - 1] || baseState;
      newHistory.push({
        ...lastState,
        ...props,
        step: newHistory.length,
      });
    };

    let result = [];
    let tempLinks = [];
    let curr = root;

    addState({
      explanation: "Initializing `ans` array.",
      line: lineMap[activeLang].init_ans,
      result: [...result],
    });

    addState({
      currId: curr?.id,
      explanation: "Set `curr` pointer to root.",
      line: lineMap[activeLang].init_curr,
    });

    while (curr) {
      addState({
        currId: curr.id,
        predId: null,
        explanation: `Start loop. \`curr\` is at node ${curr.val}.`,
        line: lineMap[activeLang].main_loop,
        tempLinks: [...tempLinks],
        result: [...result],
      });

      if (curr.left) {
        addState({
          explanation: `\`curr.left\` exists. Find predecessor of ${curr.val}.`,
          line: lineMap[activeLang].check_left,
        });

        let pred = curr.left;
        addState({
          predId: pred.id,
          explanation: `Start \`pred\` at \`curr.left\` (node ${pred.val}).`,
          line: lineMap[activeLang].find_pred_start,
        });

        addState({
          explanation: "Check: `pred.right != null` and `pred.right != curr`.",
          line: lineMap[activeLang].find_pred_loop,
        });

        while (pred.right && pred.right.id !== curr.id) {
          pred = pred.right;
          addState({
            predId: pred.id,
            explanation: `Move \`pred\` to its right (now at ${pred.val}).`,
            line: lineMap[activeLang].move_pred,
          });

          addState({
            explanation: "Check: `pred.right != null` and `pred.right != curr`.",
            line: lineMap[activeLang].find_pred_loop,
          });
        }

        addState({
          predId: pred.id,
          explanation: `Found predecessor: ${pred.val}. Check if thread exists.`,
          line: lineMap[activeLang].check_link,
        });

        if (!pred.right) {
          pred.right = curr;
          tempLinks.push({ from: pred.id, to: curr.id });

          addState({
            explanation: `No thread. Create link: ${pred.val} -> ${curr.val}.`,
            line: lineMap[activeLang].link_pred,
            tempLinks: [...tempLinks],
          });

          curr = curr.left;
          addState({
            currId: curr?.id,
            explanation: `Move \`curr\` to its left (now at ${curr?.val}).`,
            line: lineMap[activeLang].move_left,
          });
        } else {
          pred.right = null;
          tempLinks = tempLinks.filter(
            (l) => !(l.from === pred.id && l.to === curr.id)
          );

          addState({
            explanation: `Thread exists. Break link: ${pred.val} -> ${curr.val}.`,
            line: lineMap[activeLang].unlink_pred,
            tempLinks: [...tempLinks],
          });

          result.push(curr.val);
          addState({
            explanation: `Visit node ${curr.val}. Add to \`ans\`.`,
            line: lineMap[activeLang].visit_unlink,
            result: [...result],
          });

          curr = curr.right;
          addState({
            currId: curr?.id,
            explanation: `Move \`curr\` to its right (now at ${curr?.val}).`,
            line: lineMap[activeLang].move_right_unlink,
          });
        }
      } else {
        addState({
          explanation: `\`curr.left\` is null. Visit node.`,
          line: lineMap[activeLang].visit_no_left,
        });

        result.push(curr.val);
        addState({
          explanation: `Visit node ${curr.val}. Add to \`ans\`.`,
          line: lineMap[activeLang].visit_no_left,
          result: [...result],
        });

        curr = curr.right;
        addState({
          currId: curr?.id,
          explanation: `Move \`curr\` to its right (now at ${curr?.val}).`,
          line: lineMap[activeLang].move_right_no_left,
        });
      }
    }

    addState({
      currId: null,
      predId: null,
      explanation: `\`curr\` is null. Loop terminates.`,
      line: lineMap[activeLang].main_loop,
    });

    addState({
      isComplete: true,
      explanation: "Traversal complete. Return `ans`.",
      line: lineMap[activeLang].end,
    });

    load(newHistory);
  }, [treeInput, activeLang, load]);

  const generateRandomTree = () => {
    const size = Math.floor(Math.random() * 8) + 5;
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    
    const levelOrder = [values[0]];
    let i = 1;
    let queueIdx = 0;

    while (i < values.length && queueIdx < levelOrder.length) {
      const curr = levelOrder[queueIdx++];
      if (curr === null) continue;

      if (i < values.length && Math.random() > 0.15) {
        levelOrder.push(values[i++]);
      } else {
        levelOrder.push(null);
      }
      
      if (i < values.length && Math.random() > 0.15) {
        levelOrder.push(values[i++]);
      } else {
        levelOrder.push(null);
      }
    }

    while (levelOrder.length > 0 && levelOrder[levelOrder.length - 1] === null) {
      levelOrder.pop();
    }
    
    setTreeInput(levelOrder.map(val => val === null ? 'null' : val).join(','));
    visualizer.reset();
  };

  useEffect(() => {
    if (isLoaded) {
      generateHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  const {
    layout = {},
    explanation = "Load a tree to begin.",
    line,
    isComplete = false,
    currId = null,
    predId = null,
    result = []
  } = currentState;

  const codeContent = {};
  CODE_SNIPPETS[activeLang].forEach((item) => {
    codeContent[item.l] = item.t;
  });

  const inputSection = (
    <>
      <div className="flex flex-col sm:flex-row gap-3 flex-grow w-full items-center">
        <input
          type="text"
          value={treeInput}
          onChange={(e) => setTreeInput(e.target.value)}
          disabled={isLoaded}
          placeholder="e.g., 4,2,6,1,3,5,7"
          className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
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
        <div className="flex items-center gap-2">
          <button
            onClick={generateHistory}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={18} /> Load & Visualize
          </button>
          <button
            onClick={generateRandomTree}
            className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Random
          </button>
        </div>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h4 className="font-semibold text-blue-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={20} /> Current Node (curr)
        </h4>
        <div className="font-mono text-3xl font-bold text-blue-300">
          {currId ? layout.nodes.find(n => n.id === currId)?.val ?? "null" : "null"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/50 text-center">
        <h4 className="font-semibold text-amber-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={20} /> Predecessor (pred)
        </h4>
        <div className="font-mono text-3xl font-bold text-amber-400">
          {predId ? layout.nodes.find(n => n.id === predId)?.val ?? "null" : "null"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={20} /> Progress
        </h4>
        <div className="font-mono text-2xl font-bold text-green-400">
          {isComplete ? "Complete!" : "Traversing..."}
        </div>
      </div>

      <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 select-none">
          <List className="w-4 h-4 text-green-400" /> Inorder Traversal Output (ans)
        </h4>
        {result.length === 0 ? (
          <span className="text-gray-500 italic text-sm">Output array is empty</span>
        ) : (
          <div className="flex gap-2 overflow-x-auto py-1">
            {result.map((nodeVal, idx) => (
              <div key={idx} className="bg-green-500/20 border border-green-500/40 rounded-lg px-3 py-1 text-sm font-mono text-green-300 font-bold animate-fade-in-up">
                {nodeVal}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 select-none">
          <Clock size={16} /> Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Time Complexity: O(N)</span>
            <p className="text-gray-400">Each edge in the tree is traversed at most 3 times. Thus, the time complexity remains linear, O(N).</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(1)</span>
            <p className="text-gray-400">Morris traversal uses threads to link nodes, requiring no extra stack space for recursion or traversal.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Morris Traversal Visualizer"
      description="Visualize the O(1) space, O(N) time Inorder Traversal (LeetCode #94)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <TreeVisualization 
        layout={layout}
        state={currentState}
      />
    </VisualizerLayout>
  );
};

export default MorrisTraversalVisualizer;