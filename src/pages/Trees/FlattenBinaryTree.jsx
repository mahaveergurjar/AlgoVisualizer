import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Zap,
  Cpu,
  GitBranch,
  Target,
  Sparkles,
  Layers
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

// TreeNode class
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Build tree from array
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

    if (values[i] !== null && values[i] !== undefined) {
      node.left = new TreeNode(values[i]);
      queue.push(node.left);
    }
    i++;

    if (i >= values.length) break;

    if (values[i] !== null && values[i] !== undefined) {
      node.right = new TreeNode(values[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
};

// Deep clone tree
const cloneTree = (root) => {
  if (!root) return null;
  
  const newRoot = new TreeNode(root.val);
  const stack = [[root, newRoot]];
  
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

// Convert tree to simple object structure for visualization
const treeToObject = (root) => {
  if (!root) return null;
  const nodes = {};
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    
    if (nodes[node.val]) continue; 

    nodes[node.val] = {
      val: node.val,
      left: node.left ? node.left.val : null,
      right: node.right ? node.right.val : null,
    };
    
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

const lineMap = {
  "C++": { baseCase: 4, flattenLeft: 7, flattenRight: 8, saveRight: 11, moveLeftToRight: 14, nullLeft: 15, initCurr: 18, whileLoop: 19, attachRight: 24 },
  Python: { baseCase: 6, flattenLeft: 10, flattenRight: 11, saveRight: 14, moveLeftToRight: 17, nullLeft: 18, initCurr: 21, whileLoop: 22, attachRight: 26 },
  Java: { baseCase: 3, flattenLeft: 6, flattenRight: 7, saveRight: 10, moveLeftToRight: 13, nullLeft: 14, initCurr: 17, whileLoop: 18, attachRight: 23 },
};

const FlattenBinaryTreeVisualizer = () => {
  const [treeInput, setTreeInput] = useState("[1,2,5,3,4,null,6]");
  const [activeLang, setActiveLang] = useState("C++");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const getPreorder = (node) => {
    if (!node) return [];
    const result = [];
    const stack = [node];
    while (stack.length > 0) {
      const curr = stack.pop();
      result.push(curr.val);
      if (curr.right) stack.push(curr.right);
      if (curr.left) stack.push(curr.left);
    }
    return result;
  };

  const generateHistory = useCallback(() => {
    try {
      const root = buildTree(treeInput);
      if (!root) {
        alert("Tree is empty!");
        return;
      }

      const newHistory = [];
      let callStack = [];
      let workingTree = cloneTree(root);
      const expectedPreorder = getPreorder(root);

      const addState = (props) => {
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
        
        callStack.push("Processing Stack");
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

      load(newHistory);
    } catch (error) {
      console.error("Visualization Error:", error);
      alert(`An error occurred: ${error.message}`);
    }
  }, [activeLang, treeInput, load]);

  // Reload history if language changes
  useEffect(() => {
    if (isLoaded) {
      generateHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLang]);

  const {
    treeStructure = {},
    callStack = [],
    currentNode = null,
    highlightNodes = [],
    tempRight = null,
    currentPtr = null,
    explanation = "",
    line = null
  } = currentState;

  const codeContent = {};
  CODE_SNIPPETS[activeLang].forEach((item) => {
    codeContent[item.l] = item.t;
  });

  const getNodePositions = (treeStr) => {
    if (!treeStr || Object.keys(treeStr).length === 0) return {};
    
    const positions = {};
    const visited = new Set();
    const allNodes = new Set(Object.keys(treeStr).map(k => parseInt(k, 10)));
    const childrenVal = new Set();
    
    Object.values(treeStr).forEach(node => {
      if (node.left !== null) childrenVal.add(node.left);
      if (node.right !== null) childrenVal.add(node.right);
    });
    
    let rootVal = [...allNodes].find(val => !childrenVal.has(val));
    if (rootVal === undefined) {
      if (allNodes.size === 1) {
        rootVal = allNodes.values().next().value;
      } else {
         return {};
      }
    }
    
    const stack = [[rootVal, 400, 40, 150]];
    while (stack.length > 0) {
      const [val, x, y, offset] = stack.pop();
      if (val === null || visited.has(val)) continue;
      visited.add(val);
      
      const node = treeStr[val];
      if (!node) continue;
      
      positions[val] = { x, y };
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
    if (!treeStructure) return null;
    const positions = getNodePositions(treeStructure);
    const nodes = Object.keys(treeStructure).map(val => parseInt(val, 10));
    
    if (nodes.length === 0) {
      return (
        <p className="text-gray-500 italic text-center">No tree to display</p>
      );
    }
    
    return (
      <svg width="100%" height="450" className="w-full bg-gray-950/40 rounded-xl border border-gray-800">
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
          const node = treeStructure[val];
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
                  stroke="#4b5563"
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
          
          const isHighlighted = highlightNodes?.includes(val);
          const isCurrent = currentNode === val;
          const isPointer = currentPtr === val;
          const isTempRight = tempRight === val;
          
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
                className="select-none pointer-events-none"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    );
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
          placeholder="e.g., [1,2,5,3,4,null,6]"
        />
        <select
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white font-semibold cursor-pointer text-sm"
        >
          <option value="C++">C++</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
        </select>
      </div>
      {!isLoaded && (
        <button
          onClick={generateHistory}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
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
          <Target size={20} /> Current Node
        </h4>
        <div className="font-mono text-3xl font-bold text-blue-300">
          {currentNode || "null"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={20} /> Temp Right Node
        </h4>
        <div className="font-mono text-3xl font-bold text-purple-300">
          {tempRight || "null"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={20} /> Curr Pointer
        </h4>
        <div className="font-mono text-3xl font-bold text-green-400">
          {currentPtr || "null"}
        </div>
      </div>

      {callStack.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <Layers size={16} /> Call Stack / Stack Details
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {callStack.map((call, idx) => (
              <div key={idx} className="text-xs font-mono bg-gray-850 p-1.5 rounded text-gray-300">
                {call}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 select-none">
          <Clock size={16} /> Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Time Complexity: O(N)</span>
            <p className="text-gray-400">Each node is processed constant times during post-order traversal stack popping.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(N)</span>
            <p className="text-gray-400">Explicit post-order processing stacks use linear space with respect to nodes.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Flatten Binary Tree to Linked List"
      description="Transform a binary tree into a linked list using right pointers in pre-order traversal order (LeetCode #114)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      {renderTree()}
    </VisualizerLayout>
  );
};

export default FlattenBinaryTreeVisualizer;