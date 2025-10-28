// SymmetricTreeVisualizer.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Cpu,
  TreePine,
  Target,
  Gauge,
  AlertTriangle,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  FlipHorizontal, // Corrected icon for Mirror
  ArrowDown,
  Minus,
} from "lucide-react";

// BinaryTreeNode class for building the tree (re-used from ValidBST)
class BinaryTreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// TreeNode Component for Visualization (modified for symmetry check)
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

// Tree Visualization Component (modified to handle twin nodes)
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

    const isCurrent = traversalState?.nodeA?.key === nodeKey || traversalState?.nodeB?.key === nodeKey;
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
          stroke="#6b7280"
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
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-purple-300 mb-4 flex items-center gap-2">
        <FlipHorizontal size={20} /> {/* Used FlipHorizontal */}
        Symmetry Check Visualization
        {tree && (
          <span className="text-sm text-gray-400 ml-2">
            (Root: {tree.val}, Depth: {calculateTreeDepth(tree)})
          </span>
        )}
      </h3>

      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="border border-gray-600 rounded-lg bg-gray-900/50"
        >
          {/* Render edges first */}
          {tree && renderEdges(tree)}

          {/* Render nodes on top */}
          {nodes.map((nodeData) => (
            <TreeNode
              key={`node-${nodeData.key}`}
              {...nodeData}
            />
          ))}
        </svg>
      </div>

      {/* Validation Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Node A (Left Side)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-300">Node B (Right Side)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-300">Current Comparison</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Valid Subtree</span>
        </div>
      </div>
    </div>
  );
};

// Comparison Visualization Component
const ComparisonVisualization = ({ nodeA, nodeB, comparison }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-amber-300 mb-4 flex items-center gap-2">
        <Target size={20} />
        Symmetry Comparison
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-4 text-center items-center">
          {/* Node A (Left) */}
          <div className="bg-gray-700/50 p-3 rounded-lg border-2 border-blue-400 col-span-2">
            <div className="text-gray-400 text-sm">Node A (Left Side)</div>
            <div className="font-mono text-lg text-blue-400">
              {nodeA?.val ?? "null"}
            </div>
          </div>

          <div className="text-4xl text-gray-400 font-bold">=?</div>

          {/* Node B (Right) */}
          <div className="bg-gray-700/50 p-3 rounded-lg border-2 border-red-400 col-span-2">
            <div className="text-gray-400 text-sm">Node B (Right Side)</div>
            <div className="font-mono text-lg text-red-400">
              {nodeB?.val ?? "null"}
            </div>
          </div>
        </div>

        {comparison && (
          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 p-4 rounded-lg border border-amber-700/50">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-sm text-gray-400">Comparison Result:</div>
              <div
                className={`flex items-center gap-2 ${
                  comparison.result ? "text-green-400" : "text-red-400"
                }`}
              >
                {comparison.result ? <Check size={20} /> : <X size={20} />}
                <span className="font-mono text-lg">
                  {comparison.type === "value" && (
                    `${nodeA?.val} ${comparison.result ? "==" : "!="} ${nodeB?.val}`
                  )}
                  {comparison.type === "null" && (
                    `${nodeA?.val ?? "null"} ${comparison.result ? "==" : "!="} ${nodeB?.val ?? "null"}`
                  )}
                  {comparison.type === "recursive" && (
                    comparison.result ? "Subtrees Are Symmetric" : "Subtrees Are Asymmetric"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">Symmetry Rule:</div>
          <div className="font-mono text-amber-400">
            Node A.val == Node B.val AND (A.left, B.right) symmetric AND (A.right, B.left) symmetric
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const SymmetricTreeVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("1,2,2,3,4,4,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const visualizerRef = useRef(null);
  
  // NOTE: isPlaying and speed states are removed for manual control

  // Build tree from level order input (re-used)
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
      alert(
        "Invalid tree input. Please provide comma-separated values in level order."
      );
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let callStack = [];
    const nodeMap = new Map(); // To track keys for visualization

    const traverseAndMap = (node, depth, position) => {
        if (!node) return;
        const key = `${node.val}-${depth}-${position}`;
        nodeMap.set(node, key);

        traverseAndMap(node.left, depth + 1, position * 2);
        traverseAndMap(node.right, depth + 1, position * 2 + 1);
    };
    traverseAndMap(root, 0, 0); // Resetting the mapping with depth/position

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


      // Case 1: Both null (Base Case) - corresponds to line 10
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

      // Case 2: One is null, or values differ - corresponds to line 13
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

      // Case 3: Recursive checks - corresponds to line 18/19
      
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
          nodeA: { val: nodeA.right?.val, key: nodeMap.get(nodeA.right), side: 'right' }, // Switched side to 'right' for visual clarity
          nodeB: { val: nodeB.left?.val, key: nodeMap.get(nodeB.left), side: 'left' }, // Switched side to 'left' for visual clarity
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
      
      // Final result for this pair
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

    // The initial call is to compare root.left and root.right (corresponds to line 4)
    const result = root ? checkSymmetry(root.left, root.right, 0, "left", "right") : true;


    newHistory.push({
      step: stepCount++,
      explanation: result
        ? "🎉 The entire tree is SYMMETRIC!"
        : "💥 The tree is NOT symmetric!",
      tree: root,
      isComplete: true,
      isValid: result,
      line: 4, // Final check line in isSymmetric function
      callStack: [],
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [treeInput]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
    // setIsPlaying(false); <-- REMOVED
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);
  
  // NOTE: handleSpeedChange and playAnimation/pauseAnimation are removed

  const generateRandomTree = (isSymmetric = true) => {
    const getRandomVal = () => Math.floor(Math.random() * 10) + 1;

    // Helper for recursive build (ensures symmetry)
    const buildNodes = (depth) => {
      if (depth > 2) return null; 

      const val = getRandomVal();
      const node = new BinaryTreeNode(val);

      if (isSymmetric) {
          node.left = buildNodes(depth + 1);
          
          if (node.left === null) {
              node.right = null;
          } else {
              // Create a mirror of the left subtree
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
          // Asymmetric: generate one subtree and break the mirror
          node.left = buildNodes(depth + 1);
          if (node.left) {
             const mirrorNode = (sourceNode) => {
                if (!sourceNode) return null;
                const mirrored = new BinaryTreeNode(sourceNode.val);
                mirrored.left = mirrorNode(sourceNode.right);
                mirrored.right = mirrorNode(sourceNode.left); 
                return mirrored;
            };
            // Start with a mirror
            node.right = mirrorNode(node.left);
            
            // Introduce asymmetry by changing a value or structure
            if (node.right && node.right.left) {
                node.right.left.val = getRandomVal() * 100; // Break it clearly
            } else if (node.left && !node.right) {
                // Ensure asymmetry if a complex left exists but right is null
            }
            
          } else {
              // Simple asymmetry: left null, right non-null
              node.right = new BinaryTreeNode(getRandomVal());
          }
      }
      return node;
    };
    
    // Build the tree (starting with the root's children for primary symmetry check)
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
        
        // Start with asymmetry (e.g., asymmetric root children)
        const valRight = getRandomVal();
        root.right = new BinaryTreeNode(valRight);
        root.right.left = buildNodes(2);
        
        // Ensure asymmetry if values are the same
        if (root.left && root.right && root.left.val === root.right.val) {
             root.right.val += 1;
        }
        
        // Introduce a clear structural break if both exist
        if (root.left && root.right && root.left.left && !root.right.right) {
            // Left has a left child, but right doesn't have a right child
        }
    }


    // Convert to level order for input
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
    
    // Trim trailing nulls
    while (levelOrder.length > 0 && levelOrder[levelOrder.length - 1] === null) {
        levelOrder.pop();
    }


    setTreeInput(levelOrder.map(val => val === null ? "null" : val).join(","));
    resetVisualization();
  };


  // NOTE: Auto-play useEffect block removed here

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepBackward();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        } 
        // NOTE: Spacebar functionality removed here
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLoaded,
    stepBackward,
    stepForward,
  ]); // Simplified dependencies

  const state = history[currentStep] || {};
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
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-purple-500/20 border-l-4 border-purple-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span
        className={
          line === lineNum ? "text-purple-300 font-semibold" : "text-gray-300"
        }
      >
        {content}
      </span>
    </div>
  );

  const symmetricValidationCode = [
    { line: 1, content: "// Function to check if the tree is symmetric" },
    { line: 2, content: "bool isSymmetric(TreeNode* root) {" },
    { line: 3, content: "    if (!root) return true;" },
    { line: 4, content: "    return isMirror(root->left, root->right);" },
    { line: 5, content: "}" },
    { line: 6, content: "" },
    { line: 7, content: "// Helper function to check if two subtrees are mirrors" },
    { line: 8, content: "bool isMirror(TreeNode* A, TreeNode* B) {" },
    { line: 9, content: "    // 1. Base Case: Both nodes are null" },
    { line: 10, content: "    if (!A && !B) return true;" },
    { line: 11, content: "    " },
    { line: 12, content: "    // 2. Base Case: One node is null, or values differ" },
    { line: 13, content: "    if (!A || !B || A->val != B->val) {" },
    { line: 14, content: "        return false;" },
    { line: 15, content: "    }" },
    { line: 16, content: "    " },
    { line: 17, content: "    // 3. Recursive Step: Cross-compare children" },
    { line: 18, content: "    return isMirror(A->left, B->right) &&" },
    { line: 19, content: "           isMirror(A->right, B->left);" },
    { line: 20, content: "}" },
  ];

  // Prepare node validity data for visualization
  const nodeValidity = {};
  if (nodeA?.key && isValid !== undefined) {
    nodeValidity[nodeA.key] = isValid;
  }
  if (nodeB?.key && isValid !== undefined) {
    nodeValidity[nodeB.key] = isValid;
  }
  
  // Root node is always 'valid' for symmetry as it's the center
  if (tree && currentStep > 0) {
      // Find the root key (since mapping logic ensures it's the first node at level 0, pos 0)
      const rootKey = `${tree.val}-0-0`; 
      nodeValidity[rootKey] = true; 
  }


  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none text-white bg-gray-900 min-h-screen"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <FlipHorizontal size={28} /> {/* Used FlipHorizontal */}
          Symmetric Tree Validation
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Determine if a binary tree is a mirror image of itself (LeetCode #101)
        </p>
      </header>

      {/* Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label
              htmlFor="tree-input"
              className="font-medium text-gray-300 font-mono hidden md:block"
            >
              Tree (Level Order):
            </label>
            <input
              id="tree-input"
              type="text"
              value={treeInput}
              onChange={(e) => setTreeInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 1,2,2,3,null,null,3"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={generateHistory}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={() => generateRandomTree(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Symmetric
              </button>
               <button
                onClick={() => generateRandomTree(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Asymmetric
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
                
                {/* Simplified to only show SkipForward as the primary action */}
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-purple-500 hover:bg-purple-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Speed control is now optional as it doesn't affect manual steps */}
                {/* <div className="flex items-center gap-2">
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
                </div> */}

                <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                  Step {currentStep + 1}/{history.length}
                </div>
              </div>

              <button
                onClick={resetVisualization}
                className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg cursor-pointer"
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
          {/* Pseudocode Panel */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Symmetry Algorithm (isMirror)
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {symmetricValidationCode.map((codeLine) => (
                    <CodeLine
                      key={codeLine.line}
                      lineNum={codeLine.line}
                      content={codeLine.content}
                    />
                  ))}
                </code>
              </pre>
            </div>

            {/* Call Stack Visualization */}
            {callStack.length > 0 && (
              <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <BarChart3 size={16} />
                  Call Stack (Depth: {callStack.length})
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {callStack.map((call, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono bg-gray-800/50 p-1 rounded"
                    >
                      (D{call.depth}) {call.sideA}:{call.nodeA} vs {call.sideB}:{call.nodeB}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tree Visualization */}
            <TreeVisualization
              tree={tree}
              traversalState={{
                nodeA,
                nodeB,
                nodeValidity,
              }}
            />

            {/* Comparison Visualization */}
            <ComparisonVisualization
              nodeA={nodeA}
              nodeB={nodeB}
              comparison={comparison}
            />

            {/* Step Explanation Card */}
             <div className="bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-gray-700/50">
              <h3 className="font-bold text-lg text-amber-300 mb-3 flex items-center gap-2">
                <Clock size={20} />
                Step-by-Step Explanation
              </h3>
              <p className={`text-lg font-medium ${isComplete ? (isValid ? 'text-green-300' : 'text-red-300') : 'text-gray-300'}`}>
                {explanation || "Press 'Load & Visualize' to start."}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                 <div className="text-gray-400">Status:</div>
                 <div className={`font-mono font-bold ${isComplete ? (isValid ? 'text-green-400' : 'text-red-400') : 'text-yellow-400'}`}>
                    {isComplete ? (isValid ? 'COMPLETED (SYMMETRIC)' : 'COMPLETED (ASYMMETRIC)') : 'IN PROGRESS'}
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-20 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <FlipHorizontal size={48} className="text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            Enter a tree structure (e.g., <span className="font-mono text-white">1,2,2,3,4,4,3</span> for a symmetric tree) or load a random example to begin the symmetry visualization.
          </p>
        </div>
      )}
    </div>
  );
};

export default SymmetricTreeVisualizer;