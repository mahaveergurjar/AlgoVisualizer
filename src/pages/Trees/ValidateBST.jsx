// ValidBST.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Play,
  Pause,
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
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

// BinaryTreeNode class for building the tree
class BinaryTreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// TreeNode Component for Visualization
const TreeNode = ({
  node,
  x,
  y,
  isHighlighted = false,
  isCurrent = false,
  isRoot = false,
  isValid = null,
  range = null,
}) => {
  if (!node) return null;

  const getNodeColor = () => {
    if (isCurrent) return "#10b981"; // Green for current
    if (isHighlighted) return "#f59e0b"; // Amber for highlighted
    if (isValid === true) return "#22c55e"; // Green for valid
    if (isValid === false) return "#ef4444"; // Red for invalid
    if (isRoot) return "#3b82f6"; // Blue for root
    return "#6b7280"; // Gray for normal
  };

  const getStrokeColor = () => {
    if (isCurrent) return "#059669";
    if (isHighlighted) return "#d97706";
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

      {/* Range information */}
      {range && (
        <text
          x={x}
          y={y + 30}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-400 pointer-events-none select-none"
        >
          [{range.min}, {range.max}]
        </text>
      )}

      {/* Highlight effect */}
      {isCurrent && (
        <circle
          cx={x}
          cy={y}
          r={24}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="4"
          className="animate-pulse"
        />
      )}

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

  // Calculate tree depth for proper spacing
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

    // Calculate x position based on binary tree positioning
    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

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
        isHighlighted: traversalState?.currentNode === node.val,
        isCurrent: traversalState?.processingNode === node.val,
        isRoot: level === 0,
        isValid: traversalState?.nodeValidity?.[node.val],
        range: traversalState?.nodeRanges?.[node.val],
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
      const isValid =
        traversalState?.edgeValidity?.[`${parentX}-${parentY}-${x}-${y}`];

      edges.push(
        <line
          key={`edge-${node.val}-${parentX}-${parentY}`}
          x1={parentX}
          y1={parentY}
          x2={x}
          y2={y}
          stroke={isValid === false ? "#ef4444" : "#6b7280"}
          strokeWidth={isValid === false ? 3 : 2}
          strokeDasharray={isValid === false ? "5,5" : "none"}
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
      <h3 className="font-bold text-lg text-green-300 mb-4 flex items-center gap-2">
        <TreePine size={20} />
        BST Validation Visualization
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
          {nodes.map((nodeData, index) => (
            <TreeNode
              key={`node-${nodeData.node.val}-${index}`}
              {...nodeData}
            />
          ))}
        </svg>
      </div>

      {/* Validation Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Valid Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-300">Invalid Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Root Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-300">Current Node</span>
        </div>
      </div>
    </div>
  );
};

// Range Visualization Component
const RangeVisualization = ({ currentNode, currentRange, comparison }) => {
  if (!currentNode || !currentRange) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2">
        <Target size={20} />
        Range Validation
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Minimum</div>
            <div className="font-mono text-lg text-red-400">
              {currentRange.min}
            </div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg border-2 border-amber-400">
            <div className="text-gray-400 text-sm">Current Value</div>
            <div className="font-mono text-lg text-amber-400">
              {currentNode}
            </div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Maximum</div>
            <div className="font-mono text-lg text-green-400">
              {currentRange.max}
            </div>
          </div>
        </div>

        {comparison && (
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-4 rounded-lg border border-purple-700/50">
            <div className="flex items-center justify-center gap-3">
              {comparison.leftCheck !== undefined && (
                <div
                  className={`flex items-center gap-2 ${
                    comparison.leftCheck ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {comparison.leftCheck ? <Check size={16} /> : <X size={16} />}
                  <span className="text-sm">
                    Left: {currentNode} &gt; {comparison.leftValue}
                  </span>
                </div>
              )}
              {comparison.rightCheck !== undefined && (
                <div
                  className={`flex items-center gap-2 ${
                    comparison.rightCheck ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {comparison.rightCheck ? (
                    <Check size={16} />
                  ) : (
                    <X size={16} />
                  )}
                  <span className="text-sm">
                    Right: {currentNode} &lt; {comparison.rightValue}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">BST Rule:</div>
          <div className="font-mono text-amber-400">
            min &lt; node.val &lt; max
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ValidateBST = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("5,3,7,2,4,6,8");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  // Build tree from level order input
  const buildTreeFromLevelOrder = (values) => {
    if (values.length === 0) return null;

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

    const isValidBST = (
      node,
      min = -Infinity,
      max = Infinity,
      depth = 0,
      side = "root"
    ) => {
      callStack.push({ node: node?.val, min, max, depth, side });

      // Base case: null node is always valid
      if (!node) {
        newHistory.push({
          step: stepCount++,
          explanation: `Reached null node - valid by definition`,
          tree: root,
          currentNode: null,
          processingNode: null,
          currentRange: { min, max },
          isValid: true,
          line: 2,
          callStack: [...callStack],
          depth,
          side,
        });
        callStack.pop();
        return true;
      }

      // Show current node being processed
      newHistory.push({
        step: stepCount++,
        explanation: `Processing node ${node.val} with range [${
          min === -Infinity ? "-∞" : min
        }, ${max === Infinity ? "∞" : max}]`,
        tree: root,
        currentNode: node.val,
        processingNode: node.val,
        currentRange: { min, max },
        line: 4,
        callStack: [...callStack],
        depth,
        side,
      });

      // Check BST condition: min < node.val < max
      const isCurrentValid = node.val > min && node.val < max;

      newHistory.push({
        step: stepCount++,
        explanation: `Checking BST condition: ${
          min === -Infinity ? "-∞" : min
        } < ${node.val} < ${max === Infinity ? "∞" : max} = ${
          isCurrentValid ? "VALID" : "INVALID"
        }`,
        tree: root,
        currentNode: node.val,
        processingNode: node.val,
        currentRange: { min, max },
        isValid: isCurrentValid,
        comparison: {
          leftCheck: node.val > min,
          leftValue: min,
          rightCheck: node.val < max,
          rightValue: max,
        },
        line: 5,
        callStack: [...callStack],
        depth,
        side,
      });

      if (!isCurrentValid) {
        newHistory.push({
          step: stepCount++,
          explanation: `❌ Node ${node.val} violates BST condition! Tree is NOT a valid BST.`,
          tree: root,
          currentNode: node.val,
          processingNode: node.val,
          currentRange: { min, max },
          isValid: false,
          isComplete: true,
          line: 6,
          callStack: [...callStack],
          depth,
          side,
        });
        callStack.pop();
        return false;
      }

      // Process left subtree with updated max
      newHistory.push({
        step: stepCount++,
        explanation: `Checking left subtree of ${
          node.val
        } with updated range [${min === -Infinity ? "-∞" : min}, ${node.val}]`,
        tree: root,
        currentNode: node.val,
        processingNode: null,
        currentRange: { min, max: node.val },
        line: 8,
        callStack: [...callStack],
        depth: depth + 1,
        side: "left",
      });

      const leftValid = isValidBST(node.left, min, node.val, depth + 1, "left");

      if (!leftValid) {
        callStack.pop();
        return false;
      }

      // Process right subtree with updated min
      newHistory.push({
        step: stepCount++,
        explanation: `Checking right subtree of ${
          node.val
        } with updated range [${node.val}, ${max === Infinity ? "∞" : max}]`,
        tree: root,
        currentNode: node.val,
        processingNode: null,
        currentRange: { min: node.val, max },
        line: 9,
        callStack: [...callStack],
        depth: depth + 1,
        side: "right",
      });

      const rightValid = isValidBST(
        node.right,
        node.val,
        max,
        depth + 1,
        "right"
      );

      // Final result for this subtree
      const finalValid = leftValid && rightValid;

      newHistory.push({
        step: stepCount++,
        explanation: finalValid
          ? `✅ Subtree rooted at ${node.val} is valid BST`
          : `❌ Subtree rooted at ${node.val} is invalid BST`,
        tree: root,
        currentNode: node.val,
        processingNode: node.val,
        currentRange: { min, max },
        isValid: finalValid,
        line: 10,
        callStack: [...callStack],
        depth,
        side,
      });

      callStack.pop();
      return finalValid;
    };

    const result = isValidBST(root);

    newHistory.push({
      step: stepCount++,
      explanation: result
        ? "🎉 The entire tree is a VALID Binary Search Tree!"
        : "💥 The tree is NOT a valid Binary Search Tree!",
      tree: root,
      isComplete: true,
      isValid: result,
      line: 11,
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

    // Generate a valid BST (sorted array converted to BST)
    const sortedValues = Array.from({ length: size }, (_, i) => i + 1);

    // Build balanced BST from sorted array
    const buildBalancedBST = (arr, start, end) => {
      if (start > end) return null;
      const mid = Math.floor((start + end) / 2);
      const node = new BinaryTreeNode(arr[mid]);
      node.left = buildBalancedBST(arr, start, mid - 1);
      node.right = buildBalancedBST(arr, mid + 1, end);
      return node;
    };

    const balancedRoot = buildBalancedBST(
      sortedValues,
      0,
      sortedValues.length - 1
    );

    // Convert to level order for input
    const levelOrder = [];
    const queue = [balancedRoot];
    while (queue.length > 0 && levelOrder.length < size) {
      const node = queue.shift();
      if (node) {
        levelOrder.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        levelOrder.push(null);
      }
    }

    setTreeInput(levelOrder.filter((val) => val !== null).join(","));
    resetVisualization();
  };

  // Auto-play
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(() => {
        stepForward();
      }, speed);
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
          if (isPlaying) {
            pauseAnimation();
          } else {
            playAnimation();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLoaded,
    isPlaying,
    stepBackward,
    stepForward,
    playAnimation,
    pauseAnimation,
  ]);

  const state = history[currentStep] || {};
  const {
    tree = null,
    explanation = "",
    line,
    currentNode,
    processingNode,
    currentRange,
    isValid,
    comparison,
    callStack = [],
    depth = 0,
    side = "root",
    isComplete = false,
  } = state;

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-green-500/20 border-l-4 border-green-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span
        className={
          line === lineNum ? "text-green-300 font-semibold" : "text-gray-300"
        }
      >
        {content}
      </span>
    </div>
  );

  const bstValidationCode = [
    { line: 1, content: "bool isValidBST(TreeNode* root) {" },
    { line: 2, content: "    return validate(root, LONG_MIN, LONG_MAX);" },
    { line: 3, content: "}" },
    { line: 4, content: "" },
    { line: 5, content: "bool validate(TreeNode* node, long min, long max) {" },
    { line: 6, content: "    if (!node) return true;" },
    { line: 7, content: "    " },
    { line: 8, content: "    // Check BST condition" },
    { line: 9, content: "    if (node->val <= min || node->val >= max) {" },
    { line: 10, content: "        return false;" },
    { line: 11, content: "    }" },
    { line: 12, content: "    " },
    { line: 13, content: "    // Validate left and right subtrees" },
    { line: 14, content: "    return validate(node->left, min, node->val)" },
    { line: 15, content: "        && validate(node->right, node->val, max);" },
    { line: 16, content: "}" },
  ];

  // Prepare node validity and range data for visualization
  const nodeValidity = {};
  const nodeRanges = {};
  if (currentNode !== undefined && isValid !== undefined) {
    nodeValidity[currentNode] = isValid;
  }
  if (currentNode !== undefined && currentRange) {
    nodeRanges[currentNode] = currentRange;
  }

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-green-400 flex items-center justify-center gap-3">
          <CheckCircle size={28} />
          Validate Binary Search Tree
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Determine if a binary tree is a valid binary search tree (LeetCode
          #98)
        </p>
      </header>

      {/* Enhanced Controls Section */}
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
              placeholder="e.g., 5,3,7,2,4,6,8"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={generateHistory}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomTree}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random BST
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

              <div className="flex items-center gap-4">
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

                <div className="font-mono px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-center min-w-20">
                  {currentStep + 1}/{history.length}
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
            <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              BST Validation Algorithm
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {bstValidationCode.map((codeLine) => (
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
                  Call Stack (Depth: {depth})
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {callStack.map((call, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono bg-gray-800/50 p-1 rounded"
                    >
                      {call.side}: node={call.node}, range=[
                      {call.min === -Infinity ? "-∞" : call.min},{" "}
                      {call.max === Infinity ? "∞" : call.max}]
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
                currentNode: processingNode,
                processingNode,
                nodeValidity,
                nodeRanges,
              }}
            />

            {/* Range Visualization */}
            <RangeVisualization
              currentNode={currentNode}
              currentRange={currentRange}
              comparison={comparison}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Target size={20} />
                  Current Node
                </h3>
                <div className="text-center">
                  <span className="font-mono text-4xl font-bold text-blue-300">
                    {currentNode || "null"}
                  </span>
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  {side} subtree
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Gauge size={20} />
                  Validation
                </h3>
                <div className="text-center">
                  {isValid === true ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Check size={24} />
                      <span className="font-mono text-xl">VALID</span>
                    </div>
                  ) : isValid === false ? (
                    <div className="flex items-center justify-center gap-2 text-red-400">
                      <X size={24} />
                      <span className="font-mono text-xl">INVALID</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 font-mono text-lg">
                      Checking...
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Final Result
                </h3>
                <div className="text-center">
                  {isComplete ? (
                    isValid ? (
                      <div className="text-green-400 font-mono text-xl">
                        VALID BST
                      </div>
                    ) : (
                      <div className="text-red-400 font-mono text-xl">
                        INVALID BST
                      </div>
                    )
                  ) : (
                    <div className="text-gray-400 font-mono text-lg">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status and Explanation Panel */}
            <div className="bg-gradient-to-br from-amber-900/40 to-yellow-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-amber-700/50">
              <h3 className="font-bold text-lg text-amber-300 mb-3 flex items-center gap-2">
                <BarChart3 size={20} />
                Step Explanation
              </h3>
              <div className="text-gray-300 text-sm h-20 overflow-y-auto scrollbar-thin">
                {explanation || "Starting BST validation algorithm..."}
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">
                      O(N)
                    </strong>
                    <p className="text-gray-400 text-sm">
                      Each node is visited exactly once. The algorithm performs
                      constant-time operations at each node during the DFS
                      traversal.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">
                      Why O(N)?
                    </strong>
                    <p className="text-gray-400 text-sm">
                      The recursive DFS visits all N nodes exactly once, making
                      the time complexity linear with respect to the number of
                      nodes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-green-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">
                      O(H)
                    </strong>
                    <p className="text-gray-400 text-sm">
                      The recursion stack uses O(H) space where H is the height
                      of the tree. For balanced trees, H = O(log N).
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">
                      Worst Case
                    </strong>
                    <p className="text-gray-400 text-sm">
                      For a skewed tree, the recursion depth is O(N), making
                      space complexity O(N) in worst case.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-lg mb-4">
            Enter tree values in level order to start the validation
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                Level Order: root, left, right, ...
              </span>
              <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">
                Use 'null' for empty nodes
              </span>
            </div>
            <p>
              <strong>Example:</strong> "5,3,7,2,4,6,8" represents a valid BST
            </p>
            <p className="text-gray-500">
              The algorithm uses DFS with range checking to validate the BST
              property: left subtree values &lt; node value &lt; right subtree
              values
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidateBST;
