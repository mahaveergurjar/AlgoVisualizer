import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Zap,
  Cpu,
  Target,
  Gauge,
  Check,
  X,
  BarChart3,
  TreePine,
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
    <div className="w-full flex flex-col items-center">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-800 rounded-lg bg-gray-950/40 backdrop-blur-sm"
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
      {/* Validation Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs select-none">
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
    <div className="bg-gray-950/40 backdrop-blur-sm p-4 rounded-xl border border-gray-800 shadow-xl w-full">
      <h3 className="font-bold text-sm text-blue-300 mb-3 flex items-center gap-2 select-none">
        <Target size={16} />
        Range Validation
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-gray-800/40 p-2 rounded-lg">
            <div className="text-gray-500">Minimum</div>
            <div className="font-mono text-sm text-red-400">
              {currentRange.min === -Infinity ? "-∞" : currentRange.min}
            </div>
          </div>
          <div className="bg-gray-800/40 p-2 rounded-lg border-2 border-amber-400">
            <div className="text-gray-500">Current Value</div>
            <div className="font-mono text-sm text-amber-400 font-bold">
              {currentNode}
            </div>
          </div>
          <div className="bg-gray-800/40 p-2 rounded-lg">
            <div className="text-gray-500">Maximum</div>
            <div className="font-mono text-sm text-green-400">
              {currentRange.max === Infinity ? "∞" : currentRange.max}
            </div>
          </div>
        </div>

        {comparison && (
          <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/40 p-3 rounded-lg border border-purple-800/40">
            <div className="flex items-center justify-center gap-4 text-xs font-mono">
              {comparison.leftCheck !== undefined && (
                <div className={`flex items-center gap-1.5 ${comparison.leftCheck ? "text-green-400" : "text-red-400"}`}>
                  {comparison.leftCheck ? <Check size={14} /> : <X size={14} />}
                  <span>Left: {currentNode} &gt; {comparison.leftValue === -Infinity ? "-∞" : comparison.leftValue}</span>
                </div>
              )}
              {comparison.rightCheck !== undefined && (
                <div className={`flex items-center gap-1.5 ${comparison.rightCheck ? "text-green-400" : "text-red-400"}`}>
                  {comparison.rightCheck ? <Check size={14} /> : <X size={14} />}
                  <span>Right: {currentNode} &lt; {comparison.rightValue === Infinity ? "∞" : comparison.rightValue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs select-none">
          <div className="text-gray-500">BST Rule:</div>
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
  const [treeInput, setTreeInput] = useState("5,3,7,2,4,6,8");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

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
      alert("Invalid tree input. Please provide comma-separated values in level order.");
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

      if (!node) {
        newHistory.push({
          step: stepCount++,
          explanation: `Reached null node - valid by definition`,
          tree: root,
          currentNode: null,
          processingNode: null,
          currentRange: { min, max },
          isValid: true,
          line: 6,
          callStack: [...callStack],
          depth,
          side,
        });
        callStack.pop();
        return true;
      }

      newHistory.push({
        step: stepCount++,
        explanation: `Processing node ${node.val} with range [${min === -Infinity ? "-∞" : min}, ${max === Infinity ? "∞" : max}]`,
        tree: root,
        currentNode: node.val,
        processingNode: node.val,
        currentRange: { min, max },
        line: 9,
        callStack: [...callStack],
        depth,
        side,
      });

      const isCurrentValid = node.val > min && node.val < max;

      newHistory.push({
        step: stepCount++,
        explanation: `Checking BST condition: ${min === -Infinity ? "-∞" : min} < ${node.val} < ${max === Infinity ? "∞" : max} = ${isCurrentValid ? "VALID" : "INVALID"}`,
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
        line: 9,
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
          line: 10,
          callStack: [...callStack],
          depth,
          side,
        });
        callStack.pop();
        return false;
      }

      newHistory.push({
        step: stepCount++,
        explanation: `Checking left subtree of ${node.val} with updated range [${min === -Infinity ? "-∞" : min}, ${node.val}]`,
        tree: root,
        currentNode: node.val,
        processingNode: null,
        currentRange: { min, max: node.val },
        line: 14,
        callStack: [...callStack],
        depth: depth + 1,
        side: "left",
      });

      const leftValid = isValidBST(node.left, min, node.val, depth + 1, "left");

      if (!leftValid) {
        callStack.pop();
        return false;
      }

      newHistory.push({
        step: stepCount++,
        explanation: `Checking right subtree of ${node.val} with updated range [${node.val}, ${max === Infinity ? "∞" : max}]`,
        tree: root,
        currentNode: node.val,
        processingNode: null,
        currentRange: { min: node.val, max },
        line: 15,
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
        line: 15,
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
      line: 16,
      callStack: [],
    });

    load(newHistory);
  }, [treeInput, load]);

  const generateRandomTree = () => {
    const size = Math.floor(Math.random() * 8) + 5;
    const sortedValues = Array.from({ length: size }, (_, i) => i + 1);

    const buildBalancedBST = (arr, start, end) => {
      if (start > end) return null;
      const mid = Math.floor((start + end) / 2);
      const node = new BinaryTreeNode(arr[mid]);
      node.left = buildBalancedBST(arr, start, mid - 1);
      node.right = buildBalancedBST(arr, mid + 1, end);
      return node;
    };

    const balancedRoot = buildBalancedBST(sortedValues, 0, sortedValues.length - 1);

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
    visualizer.reset();
  };

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
  } = currentState;

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

  const codeContent = {};
  bstValidationCode.forEach((item) => {
    codeContent[item.line] = item.content;
  });

  const nodeValidity = {};
  const nodeRanges = {};
  if (currentNode !== undefined && isValid !== undefined) {
    nodeValidity[currentNode] = isValid;
  }
  if (currentNode !== undefined && currentRange) {
    nodeRanges[currentNode] = currentRange;
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
          placeholder="e.g., 5,3,7,2,4,6,8"
          className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2">
          <button
            onClick={generateHistory}
            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={generateRandomTree}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
          >
            Random BST
          </button>
        </div>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center justify-center gap-2 select-none text-sm">
          <Target size={16} /> Current Node
        </h3>
        <div className="font-mono text-3xl font-bold text-blue-300">
          {currentNode !== undefined && currentNode !== null ? currentNode : "null"}
        </div>
        <div className="text-[10px] text-gray-400 mt-1 capitalize">
          {side} subtree
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h3 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none text-sm">
          <Gauge size={16} /> Validation
        </h3>
        <div className="text-center font-mono text-xl font-bold">
          {isValid === true ? (
            <span className="text-green-400">VALID</span>
          ) : isValid === false ? (
            <span className="text-red-400">INVALID</span>
          ) : (
            <span className="text-gray-400">Checking...</span>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h3 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none text-sm">
          <CheckCircle size={16} /> Final Result
        </h3>
        <div className="font-mono text-xl font-bold text-green-400">
          {isComplete ? (isValid ? "Valid BST" : "Invalid BST") : "In Progress"}
        </div>
      </div>

      {callStack.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <BarChart3 size={16} /> Recursion Call Stack (Depth: {depth})
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {callStack.map((call, idx) => (
              <div key={idx} className="text-xs font-mono bg-gray-850 p-1.5 rounded text-gray-300">
                validate(node: {call.node !== undefined ? call.node : "null"}, min: {call.min === -Infinity ? "-∞" : call.min}, max: {call.max === Infinity ? "∞" : call.max})
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
            <p className="text-gray-400">The algorithm visits every node in the binary tree exactly once to validate it.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(H)</span>
            <p className="text-gray-400">H is the tree height. Recursion stack takes O(log N) for balanced, O(N) for skewed tree.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Validate Binary Search Tree"
      description="Determine if a binary tree is a valid binary search tree (LeetCode #98)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter tree values to begin visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6 flex flex-col items-center">
        <TreeVisualization
          tree={tree}
          traversalState={{
            currentNode: processingNode,
            processingNode,
            nodeValidity,
            nodeRanges,
          }}
        />
        <RangeVisualization
          currentNode={currentNode}
          currentRange={currentRange}
          comparison={comparison}
        />
      </div>
    </VisualizerLayout>
  );
};

export default ValidateBST;
