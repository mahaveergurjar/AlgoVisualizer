// LCAofDeepestLeaves.jsx
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
  Layers,
  GitMerge,
  ArrowDown,
  ArrowUp,
  Circle,
  Sparkles,
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
      const isPathToDeepest = traversalState?.deepestLeaves?.includes(node.val);
      
      edges.push(
        <line
          key={`edge-${node.val}-${parentX}-${parentY}`}
          x1={parentX}
          y1={parentY}
          x2={x}
          y2={y}
          stroke={isPathToDeepest ? "#ef4444" : "#6b7280"}
          strokeWidth={isPathToDeepest ? 3 : 2}
          strokeDasharray={isPathToDeepest ? "none" : "none"}
          className="transition-all duration-500"
        />
      );
    }

    const leftEdges = node.left ? renderEdges(node.left, x, y, level + 1, position * 2) : [];
    const rightEdges = node.right ? renderEdges(node.right, x, y, level + 1, position * 2 + 1) : [];

    return [...edges, ...leftEdges, ...rightEdges];
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-purple-300 mb-4 flex items-center gap-2">
        <TreePine size={20} />
        LCA of Deepest Leaves Visualization
        {tree && (
          <span className="text-sm text-gray-400 ml-2">
            (Root: {tree.val}, Max Depth: {traversalState?.maxDepth || calculateTreeDepth(tree)})
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
            <TreeNode key={`node-${nodeData.node.val}-${index}`} {...nodeData} />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-gray-300">LCA Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-300">Deepest Leaves</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Current Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Root Node</span>
        </div>
      </div>
    </div>
  );
};

// Depth Visualization Component
const DepthVisualization = ({ currentDepth, maxDepth, deepestLeaves = [] }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2">
        <Layers size={20} />
        Depth Analysis
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Current Depth</div>
            <div className="font-mono text-2xl font-bold text-amber-400">{currentDepth}</div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400 text-sm">Max Depth</div>
            <div className="font-mono text-2xl font-bold text-green-400">{maxDepth}</div>
          </div>
        </div>

        {deepestLeaves.length > 0 && (
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 p-4 rounded-lg border border-red-700/50">
            <h4 className="text-sm text-red-300 mb-2 flex items-center gap-2">
              <Target size={16} />
              Deepest Leaves
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {deepestLeaves.map((leaf, index) => (
                <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-mono">
                  {leaf}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">Progress:</div>
          <div className="font-mono text-amber-400">
            {currentDepth === maxDepth ? "At deepest level" : `${maxDepth - currentDepth} levels to deepest`}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const LCAofDeepestLeaves = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("3,5,1,6,2,0,8,null,null,7,4");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

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
          line: 2,
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
        line: 4,
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
        line: 5,
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
        line: 6,
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
        line: 7,
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
      line: 8,
      callStack: []
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
    const size = Math.floor(Math.random() * 10) + 6; // 6-15 nodes
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    // Shuffle array for random tree structure
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    
    // Add some nulls for incomplete levels
    const levelOrder = [];
    let nullCount = 0;
    for (let i = 0; i < values.length; i++) {
      if (Math.random() < 0.3 && nullCount < 3) { // 30% chance for null, max 3 nulls
        levelOrder.push(null);
        nullCount++;
      } else {
        levelOrder.push(values[i]);
      }
    }
    
    setTreeInput(levelOrder.map(val => val === null ? 'null' : val).join(','));
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
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};
  const {
    tree = null,
    explanation = "",
    line,
    currentNode,
    processingNode,
    currentDepth = 0,
    maxDepth = 0,
    lcaNode,
    deepestLeaves = [],
    result,
    callStack = [],
    depth = 0,
    side = 'root',
    isComplete = false
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
      <span className={line === lineNum ? "text-purple-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const lcaDeepestCode = [
    { line: 1, content: "TreeNode* lcaDeepestLeaves(TreeNode* root) {" },
    { line: 2, content: "    return dfs(root).second;" },
    { line: 3, content: "}" },
    { line: 4, content: "" },
    { line: 5, content: "pair<int, TreeNode*> dfs(TreeNode* node) {" },
    { line: 6, content: "    if (!node) return {0, nullptr};" },
    { line: 7, content: "    " },
    { line: 8, content: "    auto left = dfs(node->left);" },
    { line: 9, content: "    auto right = dfs(node->right);" },
    { line: 10, content: "    " },
    { line: 11, content: "    if (left.first > right.first) {" },
    { line: 12, content: "        return {left.first + 1, left.second};" },
    { line: 13, content: "    }" },
    { line: 14, content: "    if (right.first > left.first) {" },
    { line: 15, content: "        return {right.first + 1, right.second};" },
    { line: 16, content: "    }" },
    { line: 17, content: "    return {left.first + 1, node};" },
    { line: 18, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <GitMerge size={28} />
          LCA of Deepest Leaves
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find the lowest common ancestor of the deepest leaves in a binary tree (LeetCode #1123)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Tree (Level Order):
            </label>
            <input
              id="tree-input"
              type="text"
              value={treeInput}
              onChange={(e) => setTreeInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 3,5,1,6,2,0,8,null,null,7,4"
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
                onClick={generateRandomTree}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Random Tree
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
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Postorder DFS Algorithm
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {lcaDeepestCode.map((codeLine) => (
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
                  <Layers size={16} />
                  Call Stack (Depth: {depth})
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {callStack.map((call, idx) => (
                    <div key={idx} className="text-xs font-mono bg-gray-800/50 p-1 rounded">
                      {call.side}: node={call.node}, depth={call.depth}
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
                lcaNode,
                deepestLeaves,
                maxDepth
              }}
            />

            {/* Depth Visualization */}
            <DepthVisualization 
              currentNode={currentNode}
              currentDepth={currentDepth}
              maxDepth={maxDepth}
              deepestLeaves={deepestLeaves}
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
                  LCA Candidate
                </h3>
                <div className="text-center">
                  {result?.lca ? (
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                      <Sparkles size={20} />
                      <span className="font-mono text-xl">{result.lca.val}</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 font-mono text-lg">Finding...</div>
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
                    <div className="text-purple-400 font-mono text-xl">LCA: {lcaNode}</div>
                  ) : (
                    <div className="text-gray-400 font-mono text-lg">In Progress</div>
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
                {explanation || "Starting LCA of deepest leaves algorithm..."}
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-purple-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      Each node is visited exactly once during the postorder DFS traversal.
                      The algorithm performs constant-time operations at each node.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Why O(N)?</strong>
                    <p className="text-gray-400 text-sm">
                      The recursive DFS visits all N nodes exactly once, 
                      making the time complexity linear with respect to the number of nodes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(H)</strong>
                    <p className="text-gray-400 text-sm">
                      The recursion stack uses O(H) space where H is the height of the tree.
                      For balanced trees, H = O(log N).
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Worst Case</strong>
                    <p className="text-gray-400 text-sm">
                      For a skewed tree, the recursion depth is O(N), 
                      making space complexity O(N) in worst case.
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
            Enter tree values in level order to find LCA of deepest leaves
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Level Order: root, left, right, ...</span>
              <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">Use 'null' for empty nodes</span>
            </div>
            <p>
              <strong>Example:</strong> "3,5,1,6,2,0,8,null,null,7,4" - LCA is node 2
            </p>
            <p className="text-gray-500">
              The algorithm uses postorder DFS to find the lowest common ancestor 
              of all deepest leaves by comparing subtree depths.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LCAofDeepestLeaves;