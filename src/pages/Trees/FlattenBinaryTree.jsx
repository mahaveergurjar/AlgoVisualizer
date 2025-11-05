import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  FileText,
  GitBranch,
  Sparkles,
  Clock,
  HelpCircle,
  Zap,
} from "lucide-react";

// TreeNode class
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Build tree from array (This one is already iterative and fine)
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

    if (values[i] !== null && values[i] !== undefined) {
      node.left = new TreeNode(values[i]);
      queue.push(node.left);
    }
    i++;

    if (i >= values.length) break; // Add boundary check

    if (values[i] !== null && values[i] !== undefined) {
      node.right = new TreeNode(values[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
};

// Deep clone tree (ITERATIVE)
const cloneTree = (root) => {
  if (!root) return null;
  
  const newRoot = new TreeNode(root.val);
  const stack = [[root, newRoot]]; // [originalNode, newCloneNode]
  
  while (stack.length > 0) {
    const [orig, clone] = stack.pop();
    
    if (orig.left) {
      clone.left = new TreeNode(orig.left.val);
      stack.push([orig.left, clone.left]);
    }
    if (orig.right) {
      clone.right = new TreeNode(orig.right.val);
      stack.push([orig.right, clone.right]);
    }
  }
  return newRoot;
};

// Convert tree to simple object structure for visualization (ITERATIVE)
const treeToObject = (root) => {
  if (!root) return null;
  const nodes = {};
  const stack = [root]; // Use an explicit stack
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    
    // Check if node already processed (for graphs with cycles, though trees shouldn't)
    if (nodes[node.val]) continue; 

    nodes[node.val] = {
      val: node.val,
      left: node.left ? node.left.val : null,
      right: node.right ? node.right.val : null,
    };
    
    // We are traversing the *real* node object
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return nodes;
};


// Code snippets
const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "public:" },
    { l: 3, t: "    void flatten(TreeNode* root) {" },
    { l: 4, t: "        if (!root) return;" },
    { l: 5, t: "        " },
    { l: 6, t: "        // Flatten left and right subtrees" },
    { l: 7, t: "        flatten(root->left);" },
    { l: 8, t: "        flatten(root->right);" },
    { l: 9, t: "        " },
    { l: 10, t: "        // Save right subtree" },
    { l: 11, t: "        TreeNode* tempRight = root->right;" },
    { l: 12, t: "        " },
    { l: 13, t: "        // Move left subtree to right" },
    { l: 14, t: "        root->right = root->left;" },
    { l: 15, t: "        root->left = nullptr;" },
    { l: 16, t: "        " },
    { l: 17, t: "        // Find the rightmost node" },
    { l: 18, t: "        TreeNode* curr = root;" },
    { l: 19, t: "        while (curr->right) {" },
    { l: 20, t: "            curr = curr->right;" },
    { l: 21, t: "        }" },
    { l: 22, t: "        " },
    { l: 23, t: "        // Attach the saved right subtree" },
    { l: 24, t: "        curr->right = tempRight;" },
    { l: 25, t: "    }" },
    { l: 26, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def flatten(self, root: Optional[TreeNode]) -> None:" },
    { l: 3, t: '        """' },
    { l: 4, t: '        Do not return anything, modify root in-place.' },
    { l: 5, t: '        """' },
    { l: 6, t: "        if not root:" },
    { l: 7, t: "            return" },
    { l: 8, t: "        " },
    { l: 9, t: "        # Flatten left and right subtrees" },
    { l: 10, t: "        self.flatten(root.left)" },
    { l: 11, t: "        self.flatten(root.right)" },
    { l: 12, t: "        " },
    { l: 13, t: "        # Save right subtree" },
    { l: 14, t: "        temp_right = root.right" },
    { l: 15, t: "        " },
    { l: 16, t: "        # Move left subtree to right" },
    { l: 17, t: "        root.right = root.left" },
    { l: 18, t: "        root.left = None" },
    { l: 19, t: "        " },
    { l: 20, t: "        # Find the rightmost node" },
    { l: 21, t: "        curr = root" },
    { l: 22, t: "        while curr.right:" },
    { l: 23, t: "            curr = curr.right" },
    { l: 24, t: "        " },
    { l: 25, t: "        # Attach the saved right subtree" },
    { l: 26, t: "        curr.right = temp_right" },
  ],
  Java: [
    { l: 1, t: "class Solution {" },
    { l: 2, t: "    public void flatten(TreeNode root) {" },
    { l: 3, t: "        if (root == null) return;" },
    { l: 4, t: "        " },
    { l: 5, t: "        // Flatten left and right subtrees" },
    { l: 6, t: "        flatten(root.left);" },
    { l: 7, t: "        flatten(root.right);" },
    { l: 8, t: "        " },
    { l: 9, t: "        // Save right subtree" },
    { l: 10, t: "        TreeNode tempRight = root.right;" },
    { l: 11, t: "        " },
    { l: 12, t: "        // Move left subtree to right" },
    { l: 13, t: "        root.right = root.left;" },
    { l: 14, t: "        root.left = null;" },
    { l: 15, t: "        " },
    { l: 16, t: "        // Find the rightmost node" },
    { l: 17, t: "        TreeNode curr = root;" },
    { l: 18, t: "        while (curr.right != null) {" },
    { l: 19, t: "            curr = curr.right;" },
    { l: 20, t: "        }" },
    { l: 21, t: "        " },
    { l: 22, t: "        // Attach the saved right subtree" },
    { l: 23, t: "        curr.right = tempRight;" },
    { l: 24, t: "    }" },
    { l: 25, t: "}" },
  ],
};

const FlattenBinaryTreeVisualizer = () => {
  const [treeInput, setTreeInput] = useState("[1,2,5,3,4,null,6]");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [activeLang, setActiveLang] = useState("Python");
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  // Line mapping
  const lineMap = {
    "C++": { baseCase: 4, flattenLeft: 7, flattenRight: 8, saveRight: 11, moveLeftToRight: 14, nullLeft: 15, initCurr: 18, whileLoop: 19, attachRight: 24 },
    Python: { baseCase: 6, flattenLeft: 10, flattenRight: 11, saveRight: 14, moveLeftToRight: 17, nullLeft: 18, initCurr: 21, whileLoop: 22, attachRight: 26 },
    Java: { baseCase: 3, flattenLeft: 6, flattenRight: 7, saveRight: 10, moveLeftToRight: 13, nullLeft: 14, initCurr: 17, whileLoop: 18, attachRight: 23 },
  };
  
  const resetAll = useCallback(() => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  }, []);

  // Get Preorder (ITERATIVE)
  const getPreorder = (node) => {
    if (!node) return [];
    const result = [];
    const stack = [node];
    while (stack.length > 0) {
      const curr = stack.pop();
      result.push(curr.val);
      // Push right first, so left is processed first
      if (curr.right) stack.push(curr.right);
      if (curr.left) stack.push(curr.left);
    }
    return result;
  };

  // Generate visualization history (This iterative logic is correct)
  const generateHistory = useCallback((treeStr) => {
    try {
      let root;
      try {
        root = buildTree(treeStr);
      } catch (e) {
        alert(`Invalid tree format: ${e.message}`);
        resetAll(); // Reset on build failure
        return;
      }

      if (!root) {
        alert("Tree is empty!");
        return;
      }

      const newHistory = [];
      let callStack = [];
      let workingTree = cloneTree(root);
      
      const expectedPreorder = getPreorder(root); // Use new iterative getPreorder

      const addState = (props) => {
        // Use new iterative treeToObject
        const treeStructure = treeToObject(workingTree);
        newHistory.push({
          treeStructure: treeStructure,
          callStack: [...callStack],
          currentNode: null,
          highlightNodes: [],
          tempRight: null,
          currentPtr: null,
          explanation: "",
          line: null,
          preorderList: expectedPreorder,
          ...props,
        });
      };
      
      const iterativeFlattenAndLog = (rootNode) => {
        if (!rootNode) return;

        addState({
          explanation: "Initial binary tree. We'll flatten it using an iterative post-order approach.",
        });

        const nodeStack = []; 
        const processingStack = []; 
        
        nodeStack.push(rootNode);
        
        while (nodeStack.length > 0) {
          const node = nodeStack.pop();
          processingStack.push(node);
          
          if (node.left) nodeStack.push(node.left);
          if (node.right) nodeStack.push(node.right);
        }
        
        callStack.push("Processing stack (post-order)");
        addState({
          explanation: "Built a post-order processing stack. Now, we process each node from the stack.",
        });

        while (processingStack.length > 0) {
          const node = processingStack.pop();
          const nodeVal = node.val;

          addState({
            currentNode: nodeVal,
            explanation: `Processing node ${nodeVal} (from post-order stack)`,
            line: lineMap[activeLang].saveRight,
            highlightNodes: [nodeVal],
          });

          // 1. Save right subtree
          const tempRight = node.right;
          const tempRightVal = tempRight ? tempRight.val : null;
          addState({
            currentNode: nodeVal,
            tempRight: tempRightVal,
            explanation: `Save right subtree of node ${nodeVal}: ${tempRightVal !== null ? `node ${tempRightVal}` : "null"}`,
            line: lineMap[activeLang].saveRight,
            highlightNodes: tempRightVal !== null ? [nodeVal, tempRightVal] : [nodeVal],
          });

          // 2. Move left to right
          if (node.left) {
            const leftNodeVal = node.left.val;
            node.right = node.left;
            
            addState({
              currentNode: nodeVal,
              tempRight: tempRightVal,
              explanation: `Move left subtree (starting at node ${leftNodeVal}) to right of node ${nodeVal}`,
              line: lineMap[activeLang].moveLeftToRight,
              highlightNodes: [nodeVal, leftNodeVal],
            });
          }

          // 3. Set left to null
          node.left = null;
          addState({
            currentNode: nodeVal,
            tempRight: tempRightVal,
            explanation: `Set left child of node ${nodeVal} to null`,
            line: lineMap[activeLang].nullLeft,
            highlightNodes: [nodeVal],
          });

          // 4. Find rightmost node and attach tempRight
          if (tempRight) {
            let curr = node;
            addState({
              currentNode: nodeVal,
              tempRight: tempRightVal,
              currentPtr: curr.val,
              explanation: `Initialize curr pointer at node ${nodeVal} to find the rightmost node`,
              line: lineMap[activeLang].initCurr,
              highlightNodes: [nodeVal],
            });

            while (curr.right) {
              curr = curr.right;
              addState({
                currentNode: nodeVal,
                tempRight: tempRightVal,
                currentPtr: curr.val,
                explanation: `Move curr to node ${curr.val} (traversing right to find the end)`,
                line: lineMap[activeLang].whileLoop,
                highlightNodes: [curr.val],
              });
            }

            curr.right = tempRight;
            addState({
              currentNode: nodeVal,
              tempRight: tempRightVal,
              currentPtr: curr.val,
              explanation: `Attach saved right subtree (node ${tempRightVal}) to rightmost node ${curr.val}`,
              line: lineMap[activeLang].attachRight,
              highlightNodes: [curr.val, tempRightVal],
            });
          }
          
          addState({
            currentNode: nodeVal,
            explanation: `Finished processing node ${nodeVal}.`,
          });
        }
        
        callStack.pop();
      };
      
      iterativeFlattenAndLog(workingTree);

      addState({
        explanation: "✅ Flatten complete! Tree is now a linked list using right pointers (all left pointers are null).",
      });

      setHistory(newHistory);
      setCurrentStep(0);
    
    } catch (error) {
      console.error("Visualization Error:", error);
      alert(`An error occurred during visualization: ${error.message}.\nThis can happen with very deep or invalid trees. Resetting.`);
      resetAll();
    }
  }, [activeLang, resetAll]);

  const load = () => {
    setIsLoaded(true);
    setTimeout(() => generateHistory(treeInput), 0);
  };

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
      }, 2100 - speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, history.length, currentStep]);
  
  // Reload history if language changes
  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => generateHistory(treeInput), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  // Get tree positions for rendering (ITERATIVE)
  const getNodePositions = (treeStructure) => {
    if (!treeStructure || Object.keys(treeStructure).length === 0) return {};
    
    const positions = {};
    const visited = new Set();
    
    const allNodes = new Set(Object.keys(treeStructure).map(k => parseInt(k, 10)));
    const children = new Set();
    Object.values(treeStructure).forEach(node => {
      if (node.left !== null) children.add(node.left);
      if (node.right !== null) children.add(node.right);
    });
    
    let rootVal = [...allNodes].find(val => !children.has(val));
    
    if (rootVal === undefined) {
      if (allNodes.size === 1) {
        rootVal = allNodes.values().next().value;
      } else {
         return {}; // No root found or empty
      }
    }
    
    // Use an explicit stack for iterative traversal
    // Stack will hold [val, x, y, offset]
    const stack = [[rootVal, 400, 40, 150]];
    
    while (stack.length > 0) {
      const [val, x, y, offset] = stack.pop();
      
      if (val === null || visited.has(val)) continue;
      visited.add(val);
      
      const node = treeStructure[val];
      if (!node) continue;
      
      positions[val] = { x, y };
      
      // Push right child first, so left is processed first (pre-order)
      if (node.right !== null) {
        stack.push([node.right, x + offset, y + 80, offset / 2]);
      }
      if (node.left !== null) {
        stack.push([node.left, x - offset, y + 80, offset / 2]);
      }
    }
    
    return positions;
  };

  const renderTree = () => {
    if (!state.treeStructure) return null;
    
    const positions = getNodePositions(state.treeStructure);
    const nodes = Object.keys(state.treeStructure).map(val => parseInt(val, 10));
    
    if (nodes.length === 0) {
      return (
        <div className="w-full h-[450px] bg-gray-900/50 rounded-xl border border-gray-700 flex items-center justify-center">
          <p className="text-gray-500 italic">No tree to display</p>
        </div>
      );
    }
    
    return (
      <svg width="100%" height="450" className="bg-gray-900/50 rounded-xl border border-gray-700">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
          </marker>
        </defs>
        
        {nodes.map((val) => {
          const node = state.treeStructure[val];
          const pos = positions[val];
          if (!pos || !node) return null;
          
          return (
            <g key={`edges-${val}`}>
              {node.left && positions[node.left] && (
                <line
                  x1={pos.x}
                  y1={pos.y + 20}
                  x2={positions[node.left].x}
                  y2={positions[node.left].y - 20}
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              )}
              {node.right && positions[node.right] && (
                <line
                  x1={pos.x}
                  y1={pos.y + 20}
                  x2={positions[node.right].x}
                  y2={positions[node.right].y - 20}
                  stroke="#10b981"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />
              )}
            </g>
          );
        })}
        
        {nodes.map((val) => {
          const pos = positions[val];
          if (!pos) return null;
          
          const isHighlighted = state.highlightNodes?.includes(val);
          const isCurrent = state.currentNode === val;
          const isPointer = state.currentPtr === val;
          const isTempRight = state.tempRight === val;
          
          return (
            <g key={`node-${val}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="22"
                fill={
                  isCurrent ? "#3b82f6" :
                  isPointer ? "#10b981" :
                  isTempRight ? "#f59e0b" :
                  isHighlighted ? "#8b5cf6" :
                  "#1f2937"
                }
                stroke={isHighlighted || isCurrent ? "#a78bfa" : "#4b5563"}
                strokeWidth="3"
                className="transition-all duration-300"
              />
              <text
                x={pos.x}
                y={pos.y + 6}
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderCodeLine = (lineObj) => {
    const active = state.line === lineObj.l;
    return (
      <div
        key={lineObj.l}
        className={`relative flex font-mono text-sm ${active ? "bg-green-500/10" : ""}`}
      >
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">
          {lineObj.l}
        </div>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">
          {lineObj.t}
        </pre>
      </div>
    );
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative bg-gray-900 text-gray-200 min-h-screen">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-blue-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-purple-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <div className="inline-block mb-4 px-4 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
          <span className="text-blue-300 text-sm font-medium">LeetCode 114 • Medium</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
          Flatten Binary Tree to Linked List
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Transform a binary tree into a "linked list" using right pointers in pre-order traversal order
        </p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={treeInput}
            onChange={(e) => setTreeInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm disabled:opacity-50"
            placeholder="e.g., [1,2,5,3,4,null,6]"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition text-white font-bold shadow-lg cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={18} /> Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow"
                  aria-label="Step Backward"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-purple-600 transition shadow"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow"
                  aria-label="Step Forward"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 shadow-inner">
                {currentStep + 1} / {history.length}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300" htmlFor="speed-control">
                  <Zap size={14} className="inline" /> Speed
                </label>
                <input
                  id="speed-control"
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              <button
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </>
          )}
        </div>
      </section>

      {isLoaded && (
        <section className="mb-4 z-10 relative">
          <div className="flex items-center gap-2 flex-wrap">
            {["C++", "Python", "Java"].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm transition ${
                  activeLang === lang
                    ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400"
                    : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
                }`}
              >
                {lang}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
              <GitBranch size={16} /> <span>Post-order DFS</span>
            </div>
          </div>
        </section>
      )}

      {!isLoaded ? (
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700/50">
            <FileText size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 italic mb-2">
              Enter a binary tree in LeetCode array format
            </p>
            <p className="text-sm text-gray-500">
              Example: <code className="bg-gray-800 px-2 py-1 rounded">[1,2,5,3,4,null,6]</code>
            </p>
          </div>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">{activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[600px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map(renderCodeLine)}
            </div>
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <div>✨ Active line highlighted in green</div>
              <div>⌨️ Use ← → keys or Space to control</div>
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-4 flex items-center gap-2 font-semibold">
                <GitBranch size={16} /> Tree Structure
              </h4>
              {renderTree()}
              
              <div className="flex flex-wrap gap-4 mt-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-300"></div>
                  <span className="text-gray-300">Current Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 border-2 border-purple-300"></div>
                  <span className="text-gray-300">Highlighted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-300"></div>
                  <span className="text-gray-300">Pointer (curr)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-300"></div>
                  <span className="text-gray-300">Saved Right</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-green-500"></div>
                  <span className="text-gray-300">Right Pointer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-gray-500 border-dashed border"></div>
                  <span className="text-gray-300">Left Pointer</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2 font-semibold">
                <FileText size={14} /> Expected Pre-order Result
              </h4>
              <div className="flex flex-wrap gap-2">
                {state.preorderList && state.preorderList.map((val, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-200 flex items-center gap-2"
                  >
                    {val}
                    {idx < state.preorderList.length - 1 && (
                      <span className="text-green-400">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/60 shadow-inner">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2 font-semibold">
                  <Cpu size={14} /> Call Stack
                </h4>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 max-h-48 overflow-auto">
                  {state.callStack && state.callStack.length > 0 ? (
                    <div className="flex flex-col-reverse space-y-reverse space-y-1">
                      {[...state.callStack].reverse().map((call, idx) => (
                        <div
                          key={idx}
                          className={`font-mono text-xs p-2 rounded ${
                            idx === 0
                              ? "text-blue-300 bg-blue-500/10 font-bold"
                              : "text-gray-400"
                          }`}
                        >
                          {call}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic text-sm text-center py-4">
                      Stack is empty
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/60 shadow-inner">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2 font-semibold">
                  <Zap size={14} /> Variables
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-900 rounded border border-gray-700">
                    <span className="text-gray-400">Current Node:</span>
                    <span className="text-blue-300 font-mono font-bold">
                      {state.currentNode ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-900 rounded border border-gray-700">
                    <span className="text-gray-400">Temp Right:</span>
                    <span className="text-amber-300 font-mono font-bold">
                      {state.tempRight ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-900 rounded border border-gray-700">
                    <span className="text-gray-400">Curr Pointer:</span>
                    <span className="text-green-300 font-mono font-bold">
                      {state.currentPtr ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2 font-semibold">
                <FileText size={16} /> Step Explanation
              </h4>
              <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                {state.explanation || "Load a tree to begin visualization"}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-900/10 to-purple-900/10 backdrop-blur-xl rounded-2xl border border-blue-700/30 shadow-2xl">
              <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-4">
                <Clock size={18} /> Complexity Analysis
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <strong className="text-green-300">Time Complexity:</strong>{" "}
                  <span className="font-mono text-teal-300 text-base">O(N)</span>
                  <p className="text-gray-400 text-xs mt-1">
                    Each node is visited exactly once during the traversal
                  </p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-lg">
                  <strong className="text-purple-300">Space Complexity:</strong>{" "}
                  <span className="font-mono text-purple-300 text-base">O(N)</span>
                  <p className="text-gray-400 text-xs mt-1">
                    In this post-order iterative approach, the stack can hold up to N/2 nodes (in a full tree)
                  </p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30 flex gap-2">
                  <HelpCircle size={16} className="flex-shrink-0 mt-0.5 text-blue-300" />
                  <div className="text-xs text-gray-300">
                    <strong>Algorithm:</strong> Iterative Post-order DFS. Process left subtree, then right subtree, 
                    then current node. For each node: save right, move left to right, attach saved right to the end.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
        .animate-float { 
          animation: float 18s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float 20s ease-in-out 8s infinite; 
        }
        @keyframes float { 
          0%, 100% { transform: translate(0, 0); } 
          50% { transform: translate(30px, -30px); } 
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        *::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default FlattenBinaryTreeVisualizer;