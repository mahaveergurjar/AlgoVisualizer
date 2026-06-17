import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Zap,
  Cpu,
  GitBranch,
  GitMerge,
  Target,
  Gauge,
  Sparkles,
  Circle
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
  isDeepest = false,
  isLCA = false,
  depth = 0
}) => {
  if (!node) return null;

  const getNodeColor = () => {
    if (isLCA) return "#8b5cf6"; // Purple for LCA
    if (isDeepest) return "#ef4444"; // Red for deepest leaves
    if (isCurrent) return "#10b981"; // Green for current
    if (isHighlighted) return "#f59e0b"; // Amber for highlighted
    if (isRoot) return "#3b82f6"; // Blue for root
    return "#6b7280"; // Gray for normal
  };

  const getStrokeColor = () => {
    if (isLCA) return "#7c3aed";
    if (isDeepest) return "#dc2626";
    if (isCurrent) return "#059669";
    if (isHighlighted) return "#d97706";
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
        strokeWidth={isLCA ? 3 : 2}
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

      {/* Depth information */}
      <text
        x={x}
        y={y + 30}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-gray-400 pointer-events-none select-none"
      >
        d:{depth}
      </text>
      
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

      {/* LCA indicator */}
      {isLCA && (
        <g transform={`translate(${x + 25}, ${y - 25})`}>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </g>
      )}

      {/* Deepest leaf indicator */}
      {isDeepest && (
        <g transform={`translate(${x - 25}, ${y - 25})`}>
          <Circle className="w-4 h-4 text-red-400 fill-red-400" />
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
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate tree depth for proper spacing
  const calculateTreeDepth = (node) => {
    if (!node) return 0;
    return 1 + Math.max(calculateTreeDepth(node.left), calculateTreeDepth(node.right));
  };

  const calculateNodePositions = (node, level = 0, position = 0) => {
    if (!node) return { nodes: [] };

    const depth = calculateTreeDepth(tree);
    const levelHeight = dimensions.height / (depth + 1);
    const y = 60 + level * levelHeight;
    
    // Calculate x position based on binary tree positioning
    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

    const leftResult = node.left ? calculateNodePositions(node.left, level + 1, position * 2) : { nodes: [] };
    const rightResult = node.right ? calculateNodePositions(node.right, level + 1, position * 2 + 1) : { nodes: [] };

    const nodes = [
      {
        node,
        x,
        y,
        level,
        depth: level,
        isHighlighted: traversalState?.currentNode === node.val,
        isCurrent: traversalState?.processingNode === node.val,
        isRoot: level === 0,
        isDeepest: traversalState?.deepestLeaves?.includes(node.val),
        isLCA: traversalState?.lcaNode === node.val
      },
      ...leftResult.nodes,
      ...rightResult.nodes
    ];

    return { nodes };
  };

  const { nodes } = calculateNodePositions(tree);

  const renderEdges = (node, parentX = null, parentY = null, level = 0, position = 0) => {
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

    const leftEdges = node.left ? renderEdges(node.left, x, y, level + 1, position * 2) : [];
    const rightEdges = node.right ? renderEdges(node.right, x, y, level + 1, position * 2 + 1) : [];

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
          <TreeNode key={`node-${index}`} {...nodeData} />
        ))}
      </svg>
    </div>
  );
};

// Main Component
const LCAofDeepestLeaves = () => {
  const [treeInput, setTreeInput] = useState("3,5,1,6,2,0,8,null,null,7,4");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  // Build tree from level order input
  const buildTreeFromLevelOrder = (values) => {
    if (values.length === 0) return null;
    
    const nodes = values.map(val => val === null || val === "null" ? null : new BinaryTreeNode(val));
    
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
    const values = treeInput.split(",").map(s => {
      const trimmed = s.trim();
      return trimmed === "null" || trimmed === "" ? null : parseInt(trimmed);
    }).filter(val => val !== undefined);

    const root = buildTreeFromLevelOrder(values);
    
    if (!root) {
      alert("Invalid tree input. Please provide comma-separated values in level order.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let callStack = [];

    const lcaDeepestLeaves = (node, depth = 0, side = 'root') => {
      callStack.push({ node: node?.val, depth, side });

      // Base case: null node
      if (!node) {
        newHistory.push({
          step: stepCount++,
          explanation: `Reached null node at depth ${depth}`,
          tree: root,
          currentNode: null,
          processingNode: null,
          currentDepth: depth,
          maxDepth: 0,
          line: 6,
          callStack: [...callStack],
          depth,
          side,
          result: { depth: 0, lca: null }
        });
        callStack.pop();
        return { depth: 0, lca: null };
      }

      // Show current node being processed
      newHistory.push({
        step: stepCount++,
        explanation: `Processing node ${node.val} at depth ${depth}`,
        tree: root,
        currentNode: node.val,
        processingNode: node.val,
        currentDepth: depth,
        line: 8,
        callStack: [...callStack],
        depth,
        side
      });

      // Process left subtree
      newHistory.push({
        step: stepCount++,
        explanation: `Checking left subtree of ${node.val}`,
        tree: root,
        currentNode: node.val,
        processingNode: null,
        currentDepth: depth,
        line: 8,
        callStack: [...callStack],
        depth: depth + 1,
        side: 'left'
      });

      const left = lcaDeepestLeaves(node.left, depth + 1, 'left');

      // Process right subtree
      newHistory.push({
        step: stepCount++,
        explanation: `Checking right subtree of ${node.val}`,
        tree: root,
        currentNode: node.val,
        processingNode: null,
        currentDepth: depth,
        line: 9,
        callStack: [...callStack],
        depth: depth + 1,
        side: 'right'
      });

      const right = lcaDeepestLeaves(node.right, depth + 1, 'right');

      // Determine result based on left and right subtrees
      let result;
      let explanation;

      if (left.depth > right.depth) {
        result = { depth: left.depth + 1, lca: left.lca || node };
        explanation = `Left subtree deeper (${left.depth} > ${right.depth}), LCA comes from left`;
      } else if (right.depth > left.depth) {
        result = { depth: right.depth + 1, lca: right.lca || node };
        explanation = `Right subtree deeper (${right.depth} > ${left.depth}), LCA comes from right`;
      } else {
        // Both subtrees have same depth, current node is LCA
        result = { depth: left.depth + 1, lca: node };
        explanation = `Both subtrees same depth (${left.depth}), current node ${node.val} becomes LCA`;
      }

      newHistory.push({
        step: stepCount++,
        explanation,
        tree: root,
        currentNode: node.val,
        processingNode: node.val,
        currentDepth: depth,
        maxDepth: result.depth,
        result,
        line: 11,
        callStack: [...callStack],
        depth,
        side
      });

      callStack.pop();
      return result;
    };

    const result = lcaDeepestLeaves(root);

    // Find all deepest leaves
    const findDeepestLeaves = (node, currentDepth, maxDepth, leaves = []) => {
      if (!node) return leaves;
      if (currentDepth === maxDepth) {
        leaves.push(node.val);
      }
      findDeepestLeaves(node.left, currentDepth + 1, maxDepth, leaves);
      findDeepestLeaves(node.right, currentDepth + 1, maxDepth, leaves);
      return leaves;
    };

    const deepestLeaves = findDeepestLeaves(root, 1, result.depth);

    newHistory.push({
      step: stepCount++,
      explanation: `🎉 Found LCA of deepest leaves! LCA is node ${result.lca.val} at depth ${result.depth}`,
      tree: root,
      isComplete: true,
      lcaNode: result.lca.val,
      maxDepth: result.depth,
      deepestLeaves,
      line: 17,
      callStack: []
    });

    load(newHistory);
  }, [treeInput, load]);

  const generateRandomTree = () => {
    // Generates a simple random level order tree representation
    const size = Math.floor(Math.random() * 8) + 5;
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    const levelOrder = [];
    levelOrder.push(values[0]);
    let index = 1;
    let i = 0;
    while (index < values.length) {
      if (levelOrder[i] !== null) {
        levelOrder.push(Math.random() > 0.2 ? values[index++] : null);
        if (index >= values.length) break;
        levelOrder.push(Math.random() > 0.2 ? values[index++] : null);
      } else {
        levelOrder.push(null);
        levelOrder.push(null);
      }
      i++;
    }

    while (levelOrder[levelOrder.length - 1] === null) {
      levelOrder.pop();
    }

    setTreeInput(levelOrder.map(v => v === null ? 'null' : v).join(','));
    visualizer.reset();
  };

  const {
    tree = null,
    explanation = "Load a tree to begin visualization.",
    line,
    currentRoot,
    processingNode,
    currentDepth = 0,
    maxDepth = 0,
    lcaNode = null,
    deepestLeaves = [],
    callStack = [],
    depth = 0,
    side = 'root',
    isComplete = false
  } = currentState;

  const codeContent = {
    1: "TreeNode* lcaDeepestLeaves(TreeNode* root) {",
    2: "    return dfs(root).second;",
    3: "}",
    4: "",
    5: "pair<int, TreeNode*> dfs(TreeNode* node) {",
    6: "    if (!node) return {0, nullptr};",
    7: "    ",
    8: "    auto left = dfs(node->left);",
    9: "    auto right = dfs(node->right);",
    10: "    ",
    11: "    if (left.first > right.first) {",
    12: "        return {left.first + 1, left.second};",
    13: "    }",
    14: "    if (right.first > left.first) {",
    15: "        return {right.first + 1, right.second};",
    16: "    }",
    17: "    return {left.first + 1, node};",
    18: "}"
  };

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
          placeholder="e.g., 3,5,1,6,2,0,8,null,null,7,4"
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
            onClick={generateRandomTree}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Random Tree
          </button>
        </div>
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
          {processingNode || "null"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Depth: {currentDepth} • {side} subtree
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Gauge size={20} /> Current LCA
        </h4>
        <div className="font-mono text-3xl font-bold text-purple-300">
          {lcaNode || "null"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Max Depth Found: {maxDepth}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={20} /> Progress
        </h4>
        <div className="font-mono text-2xl font-bold text-green-400">
          {isComplete ? "Complete!" : "Searching..."}
        </div>
      </div>

      {callStack.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <GitBranch size={16} /> Call Stack (Depth: {depth})
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {callStack.map((call, idx) => (
              <div key={idx} className="text-xs font-mono bg-gray-850 p-1.5 rounded text-gray-300">
                {call.side}: node={call.node}, depth={call.depth}
              </div>
            ))}
          </div>
        </div>
      )}

      {deepestLeaves.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <h4 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2 select-none">
            <Circle className="w-4 h-4 text-red-400 fill-red-400" /> Deepest Leaves (Depth: {maxDepth})
          </h4>
          <div className="flex gap-2 overflow-x-auto py-1">
            {deepestLeaves.map((leafVal, idx) => (
              <div key={idx} className="bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-1 text-sm font-mono text-red-300 font-bold">
                {leafVal}
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
            <p className="text-gray-400">We visit every node in the binary tree exactly once to find subtree depths and determine LCA.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(H)</span>
            <p className="text-gray-400">The call stack uses O(H) space, where H is the height of the tree. Worst case is O(N) for skewed tree.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="LCA of Deepest Leaves"
      description="Find the lowest common ancestor of the deepest leaves in a binary tree (LeetCode #1123)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter tree values to begin visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <TreeVisualization 
        tree={tree}
        traversalState={{
          currentNode: currentRoot,
          processingNode,
          deepestLeaves,
          lcaNode
        }}
      />
    </VisualizerLayout>
  );
};

export default LCAofDeepestLeaves;