import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Zap,
  Cpu,
  GitBranch,
  Target,
  Gauge,
  Check,
  X,
  FlipHorizontal,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

// BinaryTreeNode class for building the tree
class BinaryTreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// TreeNode Component
const TreeNode = ({
  node,
  x,
  y,
  isHighlighted = false,
  isCurrent = false,
  isRoot = false,
  isValid = null,
  side = "root",
}) => {
  if (!node) return null;

  const getNodeColor = () => {
    if (isCurrent) return "#f59e0b"; // Amber for current processing node
    if (isHighlighted) return side === "left" ? "#3b82f6" : "#ef4444"; // Blue for Left, Red for Right
    if (isValid === true) return "#22c55e"; // Green for valid
    if (isValid === false) return "#ef4444"; // Red for invalid
    if (isRoot) return "#3b82f6"; // Blue for root
    return "#6b7280"; // Gray for normal
  };

  const getStrokeColor = () => {
    if (isCurrent) return "#d97706";
    if (isHighlighted) return side === "left" ? "#1d4ed8" : "#dc2626";
    if (isValid === true) return "#16a34a";
    if (isValid === false) return "#dc2626";
    if (isRoot) return "#1d4ed8";
    return "#4b5563";
  };

  return (
    <g className="transition-all duration-500 ease-out">
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={20}
        fill={getNodeColor()}
        stroke={getStrokeColor()}
        strokeWidth={2}
        className="transition-all duration-300"
      />

      {/* Node value */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-bold fill-white pointer-events-none select-none"
      >
        {node.val}
      </text>

      {/* Validation icon */}
      {isValid !== null && (
        <g transform={`translate(${x + 25}, ${y - 25})`}>
          {isValid ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <X className="w-4 h-4 text-red-500" />
          )}
        </g>
      )}

      {/* Current/Comparison Highlight effect */}
      {(isCurrent || isHighlighted) && (
        <circle
          cx={x}
          cy={y}
          r={24}
          fill="none"
          stroke={isCurrent ? "#f59e0b" : side === "left" ? "#3b82f6" : "#ef4444"}
          strokeWidth={2}
          strokeDasharray="4"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

// Tree Visualization Component
const TreeVisualization = ({ tree, traversalState }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width: Math.min(800, width - 40), height: 400 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const calculateTreeDepth = (node) => {
    if (!node) return 0;
    return (
      1 +
      Math.max(calculateTreeDepth(node.left), calculateTreeDepth(node.right))
    );
  };

  const calculateNodePositions = (node, level = 0, position = 0) => {
    if (!node) return { nodes: [] };

    const depth = calculateTreeDepth(tree);
    const levelHeight = dimensions.height / (depth + 1);
    const y = 60 + level * levelHeight;

    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

    const nodeKey = `${node.val}-${level}-${position}`;

    const isHighlighted = traversalState?.nodeA?.key === nodeKey || traversalState?.nodeB?.key === nodeKey;
    const side = (traversalState?.nodeA?.key === nodeKey) ? 'left' : (traversalState?.nodeB?.key === nodeKey) ? 'right' : 'root';
    const isValid = traversalState?.nodeValidity?.[nodeKey];

    const leftResult = node.left
      ? calculateNodePositions(node.left, level + 1, position * 2)
      : { nodes: [] };
    const rightResult = node.right
      ? calculateNodePositions(node.right, level + 1, position * 2 + 1)
      : { nodes: [] };

    const nodes = [
      {
        node,
        x,
        y,
        level,
        isHighlighted,
        isCurrent: traversalState?.processingNode === node.val,
        isRoot: level === 0,
        isValid,
        side,
        key: nodeKey,
      },
      ...leftResult.nodes,
      ...rightResult.nodes,
    ];

    return { nodes };
  };

  const { nodes } = calculateNodePositions(tree);

  const renderEdges = (
    node,
    parentX = null,
    parentY = null,
    level = 0,
    position = 0
  ) => {
    if (!node) return [];

    const depth = calculateTreeDepth(tree);
    const levelHeight = dimensions.height / (depth + 1);
    const y = 60 + level * levelHeight;
    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

    const edges = [];

    if (parentX !== null && parentY !== null) {
      edges.push(
        <line
          key={`edge-${node.val}-${parentX}-${parentY}`}
          x1={parentX}
          y1={parentY}
          x2={x}
          y2={y}
          stroke="#4b5563"
          strokeWidth={2}
          className="transition-all duration-500"
        />
      );
    }

    const leftEdges = node.left
      ? renderEdges(node.left, x, y, level + 1, position * 2)
      : [];
    const rightEdges = node.right
      ? renderEdges(node.right, x, y, level + 1, position * 2 + 1)
      : [];

    return [...edges, ...leftEdges, ...rightEdges];
  };

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-800 rounded-xl bg-gray-950/40 backdrop-blur-sm"
      >
        {/* Render edges first */}
        {tree && renderEdges(tree)}

        {/* Render nodes on top */}
        {nodes.map((nodeData, index) => (
          <TreeNode key={`node-${index}`} {...nodeData} />
        ))}
      </svg>
    </div>
  );
};

// Main Component
const SymmetricTreeVisualizer = () => {
  const [treeInput, setTreeInput] = useState("1,2,2,3,4,4,3");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState, currentStep } = visualizer;

  const buildTreeFromLevelOrder = (values) => {
    if (values.length === 0 || values[0] === null) return null;

    const nodes = values.map((val) =>
      val === null ? null : new BinaryTreeNode(val)
    );

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

  const generateHistory = useCallback(() => {
    const values = treeInput
      .split(",")
      .map((s) => {
        const trimmed = s.trim();
        return trimmed === "null" || trimmed === "" ? null : parseInt(trimmed);
      })
      .filter((val) => val !== undefined);

    const root = buildTreeFromLevelOrder(values);

    if (!root) {
      alert("Invalid tree input. Please provide comma-separated values in level order.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let callStack = [];
    const nodeMap = new Map();

    const traverseAndMap = (node, depth, position) => {
        if (!node) return;
        const key = `${node.val}-${depth}-${position}`;
        nodeMap.set(node, key);

        traverseAndMap(node.left, depth + 1, position * 2);
        traverseAndMap(node.right, depth + 1, position * 2 + 1);
    };
    traverseAndMap(root, 0, 0);

    const checkSymmetry = (nodeA, nodeB, depth = 0, sideA = "left", sideB = "right") => {
      const keyA = nodeMap.get(nodeA);
      const keyB = nodeMap.get(nodeB);

      callStack.push({ nodeA: nodeA?.val, nodeB: nodeB?.val, depth, sideA, sideB });
      
      const currentCall = {
        step: stepCount++,
        explanation: `Comparing ${nodeA?.val ?? "null"} (${sideA}) and ${nodeB?.val ?? "null"} (${sideB}).`,
        tree: root,
        nodeA: { val: nodeA?.val, key: keyA, side: sideA },
        nodeB: { val: nodeB?.val, key: keyB, side: sideB },
        line: 8,
        callStack: [...callStack],
        depth,
      };
      newHistory.push(currentCall);

      if (!nodeA && !nodeB) {
        newHistory.push({
          ...currentCall,
          step: stepCount++,
          explanation: `Base Case: Both nodes are null. Result: TRUE (Symmetric)`,
          isValid: true,
          comparison: { result: true, type: "null" },
          line: 10,
        });
        callStack.pop();
        return true;
      }

      const areValuesEqual = nodeA?.val === nodeB?.val;
      if (!nodeA || !nodeB || !areValuesEqual) {
        newHistory.push({
          ...currentCall,
          step: stepCount++,
          explanation: `Mismatch: One node is null or values differ. Result: FALSE (Asymmetric)`,
          isValid: false,
          comparison: { 
              result: false, 
              type: (!nodeA || !nodeB) ? "null" : "value" 
          },
          line: 13,
        });
        callStack.pop();
        return false;
      }
      
      // Left-to-Right comparison (A.left, B.right)
      newHistory.push({
          ...currentCall,
          step: stepCount++,
          explanation: `Recurse 1: Compare A.left (${nodeA.left?.val ?? 'null'}) with B.right (${nodeB.right?.val ?? 'null'}).`,
          nodeA: { val: nodeA.left?.val, key: nodeMap.get(nodeA.left), side: 'left' },
          nodeB: { val: nodeB.right?.val, key: nodeMap.get(nodeB.right), side: 'right' },
          line: 18,
      });

      const leftMirrorRight = checkSymmetry(
        nodeA.left,
        nodeB.right,
        depth + 1,
        "left",
        "right"
      );

      if (!leftMirrorRight) {
        callStack.pop();
        return false;
      }
      
      // Right-to-Left comparison (A.right with B.left)
      newHistory.push({
          ...currentCall,
          step: stepCount++,
          explanation: `Recurse 2: Compare A.right (${nodeA.right?.val ?? 'null'}) with B.left (${nodeB.left?.val ?? 'null'}).`,
          nodeA: { val: nodeA.right?.val, key: nodeMap.get(nodeA.right), side: 'right' }, 
          nodeB: { val: nodeB.left?.val, key: nodeMap.get(nodeB.left), side: 'left' }, 
          line: 19,
      });
      
      const rightMirrorLeft = checkSymmetry(
        nodeA.right,
        nodeB.left,
        depth + 1,
        "right",
        "left"
      );

      const finalValid = leftMirrorRight && rightMirrorLeft;
      
      newHistory.push({
        ...currentCall,
        step: stepCount++,
        explanation: finalValid
          ? `✅ Nodes ${nodeA.val} and ${nodeB.val} and their subtrees are symmetric.`
          : `❌ Nodes ${nodeA.val} and ${nodeB.val} have asymmetric subtrees.`,
        nodeA: { val: nodeA?.val, key: keyA, side: sideA },
        nodeB: { val: nodeB?.val, key: keyB, side: sideB },
        isValid: finalValid,
        comparison: { result: finalValid, type: "recursive" },
        line: 19,
      });

      callStack.pop();
      return finalValid;
    };

    const result = root ? checkSymmetry(root.left, root.right, 0, "left", "right") : true;

    newHistory.push({
      step: stepCount++,
      explanation: result
        ? "🎉 The entire tree is SYMMETRIC!"
        : "💥 The tree is NOT symmetric!",
      tree: root,
      isComplete: true,
      isValid: result,
      line: 4,
      callStack: [],
    });

    load(newHistory);
  }, [treeInput, load]);

  const generateRandomTree = (isSymmetric = true) => {
    const getRandomVal = () => Math.floor(Math.random() * 10) + 1;

    const buildNodes = (depth) => {
      if (depth > 2) return null; 

      const val = getRandomVal();
      const node = new BinaryTreeNode(val);

      if (isSymmetric) {
          node.left = buildNodes(depth + 1);
          if (node.left === null) {
              node.right = null;
          } else {
              const mirrorNode = (sourceNode) => {
                  if (!sourceNode) return null;
                  const mirrored = new BinaryTreeNode(sourceNode.val);
                  mirrored.left = mirrorNode(sourceNode.right); 
                  mirrored.right = mirrorNode(sourceNode.left); 
                  return mirrored;
              };
              node.right = mirrorNode(node.left);
          }
      } else {
          node.left = buildNodes(depth + 1);
          if (node.left) {
             const mirrorNode = (sourceNode) => {
                if (!sourceNode) return null;
                const mirrored = new BinaryTreeNode(sourceNode.val);
                mirrored.left = mirrorNode(sourceNode.right);
                mirrored.right = mirrorNode(sourceNode.left); 
                return mirrored;
            };
            node.right = mirrorNode(node.left);
            if (node.right && node.right.left) {
                node.right.left.val = getRandomVal() * 100;
            }
          } else {
              node.right = new BinaryTreeNode(getRandomVal());
          }
      }
      return node;
    };
    
    const root = new BinaryTreeNode(getRandomVal());
    if (isSymmetric) {
        root.left = buildNodes(1);
        if (root.left) {
            const mirrorNode = (sourceNode) => {
                if (!sourceNode) return null;
                const mirrored = new BinaryTreeNode(sourceNode.val);
                mirrored.left = mirrorNode(sourceNode.right); 
                mirrored.right = mirrorNode(sourceNode.left); 
                return mirrored;
            };
            root.right = mirrorNode(root.left);
        } else {
            root.right = null;
        }
    } else {
        root.left = buildNodes(1);
        const valRight = getRandomVal();
        root.right = new BinaryTreeNode(valRight);
        root.right.left = buildNodes(2);
        
        if (root.left && root.right && root.left.val === root.right.val) {
             root.right.val += 1;
        }
    }

    const levelOrder = [];
    const queue = [root];
    let count = 0;
    while (queue.length > 0 && count < 50) { 
      const node = queue.shift();
      count++;
      if (node) {
        levelOrder.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        levelOrder.push(null);
      }
    }
    
    while (levelOrder.length > 0 && levelOrder[levelOrder.length - 1] === null) {
        levelOrder.pop();
    }

    setTreeInput(levelOrder.map(val => val === null ? "null" : val).join(","));
    visualizer.reset();
  };

  const {
    tree = null,
    explanation = "",
    line,
    nodeA,
    nodeB,
    isValid,
    comparison,
    callStack = [],
    depth = 0,
    isComplete = false
  } = currentState;

  const codeContent = {
    1: "// Function to check if the tree is symmetric",
    2: "bool isSymmetric(TreeNode* root) {",
    3: "    if (!root) return true;",
    4: "    return isMirror(root->left, root->right);",
    5: "}",
    6: "",
    7: "// Helper function to check if two subtrees are mirrors",
    8: "bool isMirror(TreeNode* A, TreeNode* B) {",
    9: "    // 1. Base Case: Both nodes are null",
    10: "    if (!A && !B) return true;",
    11: "    ",
    12: "    // 2. Base Case: One node is null, or values differ",
    13: "    if (!A || !B || A->val != B->val) {",
    14: "        return false;",
    15: "    }",
    16: "    ",
    17: "    // 3. Recursive Step: Cross-compare children",
    18: "    return isMirror(A->left, B->right) &&",
    19: "           isMirror(A->right, B->left);",
    20: "}"
  };

  const nodeValidity = {};
  if (nodeA?.key && isValid !== undefined) {
    nodeValidity[nodeA.key] = isValid;
  }
  if (nodeB?.key && isValid !== undefined) {
    nodeValidity[nodeB.key] = isValid;
  }
  if (tree && currentStep > 0) {
      const rootKey = `${tree.val}-0-0`; 
      nodeValidity[rootKey] = true; 
  }

  const inputSection = (
    <>
      <div className="flex items-center gap-2 flex-grow">
        <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          Tree (Level Order):
        </label>
        <input
          id="tree-input"
          type="text"
          value={treeInput}
          onChange={(e) => setTreeInput(e.target.value)}
          disabled={isLoaded}
          placeholder="e.g., 1,2,2,3,4,4,3"
          className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2">
          <button
            onClick={generateHistory}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={() => generateRandomTree(true)}
            className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs cursor-pointer"
          >
            Sym Tree
          </button>
          <button
            onClick={() => generateRandomTree(false)}
            className="px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition text-xs cursor-pointer"
          >
            Asym Tree
          </button>
        </div>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h4 className="font-semibold text-blue-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={20} /> Comparing Nodes
        </h4>
        <div className="font-mono text-xl font-bold text-blue-300">
          A: {nodeA?.val !== undefined ? nodeA.val : "null"} | B: {nodeB?.val !== undefined ? nodeB.val : "null"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Depth: {depth}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Gauge size={20} /> Match Type
        </h4>
        <div className="font-mono text-2xl font-bold text-purple-400 capitalize">
          {comparison?.type || "None"}
        </div>
        {comparison?.result !== undefined && (
          <div className="text-xs text-gray-400 mt-1">
            Result: {comparison.result ? "Symmetric" : "Asymmetric"}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={20} /> Symmetry Status
        </h4>
        <div className="font-mono text-2xl font-bold text-green-400">
          {isComplete ? (isValid ? "Symmetric" : "Asymmetric") : "Checking..."}
        </div>
      </div>

      {callStack.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <GitBranch size={16} /> Call Stack (Depth: {depth})
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {callStack.map((call, idx) => (
              <div key={idx} className="text-xs font-mono bg-gray-850 p-1.5 rounded text-gray-300">
                isMirror(A={call.nodeA !== undefined ? call.nodeA : "null"}, B={call.nodeB !== undefined ? call.nodeB : "null"})
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
            <p className="text-gray-400">We traverse the entire tree once, comparing mirror nodes at each step.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(H)</span>
            <p className="text-gray-400">H is the height of the tree. Recursion stack size is bounded by tree height.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Symmetric Tree Visualizer"
      description="Check if a binary tree is a mirror of itself (LeetCode #101)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <TreeVisualization 
        tree={tree}
        traversalState={{
          nodeA,
          nodeB,
          nodeValidity
        }}
      />
    </VisualizerLayout>
  );
};

export default SymmetricTreeVisualizer;