import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  Clock,
  GitBranch,
  Sparkles,
  RotateCcw,
  SkipBack,
  SkipForward,
  TreePine,
  TrendingUp,
  Target,
  Layers,
} from "lucide-react";

// --- Helper: TreeNode class (with unique ID) ---
let nodeIdCounter = 0; // Global counter for unique IDs
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.id = ++nodeIdCounter; // Assign a unique, incrementing ID
  }
}

// --- Helper: Build Tree (CORRECTED, from your LCA reference) ---
const buildTreeFromLevelOrder = (values) => {
  nodeIdCounter = 0; // Reset ID counter
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

// --- Helper: Compute (x, y) Layout (FINAL, CORRECTED VERSION) ---
const computeTreeLayout = (root) => {
  if (!root) {
    return { nodes: [], edges: [], width: 0, height: 0 };
  }

  const nodes = [];
  const edges = [];
  const allNodes = []; // To iterate over later
  const xCoords = {};
  const xSpacing = 60; // Horizontal space between nodes
  const ySpacing = 70; // Vertical space between levels
  const yOffset = 40;  // Top padding
  let currentX = 0;
  let maxLevel = 0;

  // Pass 1: Get levels (y-coord) and find all nodes using pre-order
  function getLevels(node, level) {
    if (!node) return;
    node.level = level; // Assign level property to the node itself
    allNodes.push(node);
    maxLevel = Math.max(maxLevel, level);
    getLevels(node.left, level + 1);
    getLevels(node.right, level + 1);
  }
  getLevels(root, 0);

  // Pass 2: Inorder traversal to assign x-coordinates
  function assignXCoords(node) {
    if (!node) return;
    assignXCoords(node.left);
    
    // Assign x based on inorder position
    xCoords[node.id] = currentX;
    currentX += xSpacing;
    
    assignXCoords(node.right);
  }
  assignXCoords(root);

  // Pass 3: Build final nodes and edges arrays
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

  // Normalize coordinates so the tree isn't off-screen
  const xOffset = (minX < 30) ? (30 - minX) : 0; // Add 30px padding on the left
  for (const node of nodes) {
      node.x += xOffset;
  }
  
  const layoutWidth = maxX + xOffset + 30; // Add 30px padding on the right
  const height = maxLevel * ySpacing + yOffset + 40; // Add 40px padding at the bottom

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

  const getNodeById = (id) => nodes.find(n => n.id === id);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2">
        <TreePine size={20} />
        Morris Traversal Visualization
      </h3>
      
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full min-h-[300px] max-h-[400px] border border-gray-600 rounded-lg bg-gray-900/50"
        >
          {/* Render regular edges */}
          {edges.map((edge) => {
            const fromNode = getNodeById(edge.from);
            const toNode = getNodeById(edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={`edge-${edge.from}-${edge.to}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#6b7280"
                strokeWidth={2}
                className="transition-all duration-500"
              />
            );
          })}
          
          {/* Render temporary threads */}
          {tempLinks.map((link) => {
            const fromNode = getNodeById(link.from);
            const toNode = getNodeById(link.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={`thread-${link.from}-${link.to}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                className="transition-all duration-500"
              />
            );
          })}
          
          {/* Render nodes on top */}
          {nodes.map((nodeData) => (
            <TreeNodeVisual 
              key={`node-${nodeData.id}`} 
              node={nodeData} 
              x={nodeData.x} 
              y={nodeData.y}
              isCurr={nodeData.id === currId}
              isPred={nodeData.id === predId}
              isVisited={result.includes(nodeData.val)}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Curr Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-300">Pred Pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Visited (in Result)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-dashed border-red-500 rounded-full"></div>
          <span className="text-gray-300">Temporary Thread</span>
        </div>
      </div>

      {/* --- RESULT CONTAINER (MOVED HERE) --- */}
      <div className="mt-4">
        <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
          <TrendingUp size={16} />
          Result Array `ans`
        </h4>
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 min-h-[4rem] font-mono text-green-300">
          [{result?.join(", ")}]
        </div>
      </div>
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

// --- Main Component ---
const MorrisTraversalVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("4,2,6,1,3,5,7");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [activeLang, setActiveLang] = useState("C++");
  const visualizerRef = useRef(null);

  // Line mapping for code highlighting
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
      resetVisualization();
      return;
    }

    if (!root) {
      setHistory([{
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
      setCurrentStep(0);
      setIsLoaded(true);
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

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [treeInput, activeLang, lineMap]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    setIsPlaying(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  const playAnimation = useCallback(() => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, history.length]);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const generateRandomTree = () => {
    const size = Math.floor(Math.random() * 8) + 5; // 5-12 nodes
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
    resetVisualization();
  };

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, 2100 - speed); // Inverted speed
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepBackward();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        } else if (e.key === " ") {
          e.preventDefault();
          if (isPlaying) pauseAnimation();
          else playAnimation();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};
  const {
    layout = {},
    explanation = "Load a tree to begin.",
    line,
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-blue-500/20 border-l-4 border-blue-500"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={line === lineNum ? "text-blue-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none bg-gray-900 text-gray-200"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <GitBranch size={28} />
          Morris Traversal Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualize the O(1) space, O(N) time Inorder Traversal (LeetCode #94)
        </p>
      </header>

      {/* Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow w-full md:w-auto">
          <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono hidden md:block my-auto">
            Tree (Level Order):
          </label>
          <input
            id="tree-input"
            type="text"
            value={treeInput}
            onChange={(e) => setTreeInput(e.target.value)}
            disabled={isLoaded}
            placeholder="e.g., 4,2,6,1,3,5,7"
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={generateHistory}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={18} />
                Load & Visualize
              </button>
              <button
                onClick={generateRandomTree}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipBack size={20} />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-green-500 hover:bg-green-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <Pause size={20} />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm">Speed:</label>
                <select
                  value={speed}
                  onChange={handleSpeedChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm cursor-pointer"
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>

              <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-[7rem]">
                {currentStep + 1}/{history.length}
              </div>

              <button
                onClick={resetVisualization}
                className="bg-red-600 hover:bg-red-700 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Code */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
                <FileText size={20} />
                Algorithm Code
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                {LANG_TABS.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-lg font-medium cursor-pointer text-sm ${
                      activeLang === lang
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto max-h-[400px]">
                <pre className="text-sm">
                  <code className="font-mono leading-relaxed block">
                    {/* --- THIS IS THE FIX --- */}
                    {CODE_SNIPPETS[activeLang].map((codeLine) => (
                      <CodeLine 
                        key={codeLine.l} 
                        lineNum={codeLine.l} 
                        content={codeLine.t}
                      />
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Right Panel: Visualization + Explanation + Complexity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tree Visualization (Now includes Result) */}
            <TreeVisualization 
              layout={layout}
              state={state}
            />

            {/* Explanation Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h3 className="font-bold text-lg text-amber-300 mb-3 flex items-center gap-2">
                <FileText size={20} />
                Step Explanation
              </h3>
              <div className="text-gray-300 text-sm min-h-[3rem]">
                {explanation}
                {isComplete && (
                  <span className="text-green-400 font-bold block mt-2">
                    ✓ Traversal Complete
                  </span>
                )}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-xl text-blue-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
                <Clock size={20} /> Complexity Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-300">Time Complexity</h4>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      Each node is visited at most twice. Finding the predecessor is amortized, as each "thread" edge is traversed only twice (once to create, once to remove).
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(1)</strong>
                    <p className="text-gray-400 text-sm">
                      This is the main advantage. No recursion stack or auxiliary stack is used. Space is only for pointers (curr, pred). (Note: `ans` array is O(N) but is output, not auxiliary space).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-400 text-lg mb-4">
            Enter a tree in level-order format to begin visualization.
          </div>
          <div className="text-gray-500 text-sm">
            Example: 4,2,6,1,3,5,7
          </div>
        </div>
      )}
    </div>
  );
};

export default MorrisTraversalVisualizer;