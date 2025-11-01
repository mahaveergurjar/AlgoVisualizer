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
  Layers,
  GitMerge,
  Eye, // Added Eye icon
  ArrowRight,
  List,
  ArrowLeft,
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
  isCurrent = false, // The single node being processed (dequeued)
  isRoot = false,
  isRightSideView = false, // Part of the final result
  isCurrentLevel = false, // Any node in the level being processed
}) => {
  if (!node) return null;

  const getNodeColor = () => {
    if (isRightSideView) return "#ef4444"; // Red for result nodes
    if (isCurrent) return "#10b981"; // Green for current
    if (isCurrentLevel) return "#f59e0b"; // Amber for nodes in the current level
    if (isRoot) return "#3b82f6"; // Blue for root
    return "#6b7280"; // Gray for normal
  };

  const getStrokeColor = () => {
    if (isRightSideView) return "#dc2626";
    if (isCurrent) return "#059669";
    if (isCurrentLevel) return "#d97706";
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
        strokeWidth={isRightSideView || isCurrent ? 3 : 2}
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

      {/* Current processing effect */}
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

      {/* Right Side View indicator */}
      {isRightSideView && (
        <g transform={`translate(${x + 18}, ${y - 28})`}>
          <Eye className="w-5 h-5 text-red-300" />
        </g>
      )}
    </g>
  );
};

// Tree Visualization Component
const TreeVisualization = ({ tree, traversalState }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        // Use a slightly smaller width to avoid overflow
        setDimensions({ width: Math.max(300, width - 40), height: 400 });
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

  const treeDepth = calculateTreeDepth(tree);

  const calculateNodePositions = (node, level = 0, position = 0, maxLevelWidth = 1) => {
    if (!node) return { nodes: [], maxLevelWidth: 1 };

    // Calculate level width
    maxLevelWidth = Math.max(maxLevelWidth, Math.pow(2, level));

    const levelHeight = dimensions.height / (treeDepth + 1);
    const y = 60 + level * levelHeight;

    // Calculate x position based on binary tree positioning
    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

    const leftResult = node.left ? calculateNodePositions(node.left, level + 1, position * 2, maxLevelWidth) : { nodes: [], maxLevelWidth: 1 };
    const rightResult = node.right ? calculateNodePositions(node.right, level + 1, position * 2 + 1, maxLevelWidth) : { nodes: [], maxLevelWidth: 1 };

    const nodes = [
      {
        node,
        x,
        y,
        level,
        isCurrent: traversalState?.processingNode === node.val,
        isRoot: level === 0,
        isRightSideView: traversalState?.rightSideViewNodes?.includes(node.val),
        isCurrentLevel: traversalState?.currentLevelNodes?.includes(node.val),
      },
      ...leftResult.nodes,
      ...rightResult.nodes
    ];

    return { nodes, maxLevelWidth };
  };

  const { nodes } = calculateNodePositions(tree);

  const renderEdges = (node, parentX = null, parentY = null, level = 0, position = 0) => {
    if (!node) return [];

    const levelHeight = dimensions.height / (treeDepth + 1);
    const y = 60 + level * levelHeight;
    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

    const edges = [];

    if (parentX !== null && parentY !== null) {
      const isPathToResult = traversalState?.rightSideViewNodes?.includes(node.val);

      edges.push(
        <line
          key={`edge-${node.val}-${parentX}-${parentY}`}
          x1={parentX}
          y1={parentY}
          x2={x}
          y2={y}
          stroke={isPathToResult ? "#ef4444" : "#6b7280"}
          strokeWidth={isPathToResult ? 3 : 2}
          className="transition-all duration-500"
        />
      );
    }

    const leftEdges = node.left ? renderEdges(node.left, x, y, level + 1, position * 2) : [];
    const rightEdges = node.right ? renderEdges(node.right, x, y, level + 1, position * 2 + 1) : [];

    return [...edges, ...leftEdges, ...rightEdges];
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl overflow-x-auto">
      <h3 className="font-bold text-lg text-purple-300 mb-4 flex items-center gap-2">
        <TreePine size={20} />
        Tree Visualization
      </h3>

      <div className="flex justify-center min-w-[500px]">
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
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-300">Right Side View</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Current Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-gray-300">Current Level</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Root Node</span>
        </div>
      </div>
    </div>
  );
};

// Queue Visualization Component
const QueueVisualization = ({ queue = [] }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2">
        <Layers size={20} />
        BFS Queue
      </h3>
      <div className="bg-gray-900/50 p-4 rounded-lg min-h-16 flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-sm font-mono">Front</span>
        <ArrowRight size={16} className="text-gray-500" />
        {queue.length === 0 ? (
           <span className="text-gray-500 italic">Queue is empty</span>
        ) : (
          queue.map((val, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm font-mono shadow-md"
            >
              {val}
            </span>
          ))
        )}
         <ArrowLeft size={16} className="text-gray-500 ml-auto" />
        <span className="text-gray-400 text-sm font-mono">Back</span>
      </div>
    </div>
  );
};

// Result Visualization Component
const ResultVisualization = ({ result = [] }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-red-300 mb-4 flex items-center gap-2">
        <List size={20} />
        Right Side View (Result)
      </h3>
      <div className="bg-gray-900/50 p-4 rounded-lg min-h-16 flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-sm font-mono">[</span>
        {result.length === 0 ? (
           <span className="text-gray-500 italic">Result is empty</span>
        ) : (
          result.map((val, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-red-500/20 text-red-300 rounded-md text-sm font-mono shadow-md"
            >
              {val}
            </span>
          ))
        )}
         <span className="text-gray-400 text-sm font-mono">]</span>
      </div>
    </div>
  );
};


// Main Component
const BinaryTreeRightSideView = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("1,2,3,null,5,null,4");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);
  const [message, setMessage] = useState(null);

  // Function to show a custom modal message
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => {
      setMessage(null);
    }, 3000); // Hide after 3 seconds
  };

  // Build tree from level order input
  const buildTreeFromLevelOrder = (values) => {
    if (values.length === 0 || values[0] === null) return null;
    
    const nodes = values.map(val => val === null || val === "null" ? null : new BinaryTreeNode(val));
    
    let queue = [nodes[0]];
    let i = 1;
    
    while (queue.length > 0 && i < nodes.length) {
      let currentNode = queue.shift();
      
      if (nodes[i] !== undefined) {
        currentNode.left = nodes[i];
        if (nodes[i] !== null) queue.push(nodes[i]);
        i++;
      }
      
      if (nodes[i] !== undefined) {
        currentNode.right = nodes[i];
         if (nodes[i] !== null) queue.push(nodes[i]);
        i++;
      }
    }
    
    return nodes[0];
  };

  const generateHistory = useCallback(() => {
    const values = treeInput.split(",").map(s => {
      const trimmed = s.trim();
      if (trimmed === "null" || trimmed === "") return null;
      const num = parseInt(trimmed);
      return isNaN(num) ? undefined : num;
    }).filter(val => val !== undefined);
    
    if (values.length === 0) {
      showMessage("Tree input is empty. Please enter values.");
      return;
    }

    const root = buildTreeFromLevelOrder([...values]); // Pass a copy
    
    if (!root) {
      showMessage("Invalid tree input. Please provide valid comma-separated values.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    
    let queue = [];
    let result = [];
    
    if (root) {
      queue.push(root);
    }

    // Initial state
    newHistory.push({
      step: stepCount++,
      explanation: "Starting BFS. Adding root to the queue.",
      tree: root,
      highlightLine: 3,
      queue: queue.map(n => n.val),
      currentLevelNodes: [],
      rightSideViewNodes: [],
      processingNode: null,
      isComplete: false,
    });

    if (queue.length === 0) {
       newHistory.push({
        step: stepCount++,
        explanation: "Tree is empty. Returning empty list.",
        tree: root,
        highlightLine: 2,
        queue: [],
        currentLevelNodes: [],
        rightSideViewNodes: [],
        processingNode: null,
        isComplete: true,
      });
      setHistory(newHistory);
      setCurrentStep(0);
      setIsLoaded(true);
      return;
    }
    
    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevelNodesForVis = queue.map(n => n.val); // Snapshot for visualization

      newHistory.push({
        step: stepCount++,
        explanation: `Starting new level. Level size: ${levelSize}.`,
        tree: root,
        highlightLine: 6,
        queue: queue.map(n => n.val),
        currentLevelNodes: currentLevelNodesForVis,
        rightSideViewNodes: [...result],
        processingNode: null,
        isComplete: false,
      });

      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();

        // Step: Dequeue node
        newHistory.push({
          step: stepCount++,
          explanation: `Processing node ${node.val} (index ${i} of ${levelSize - 1}).`,
          tree: root,
          highlightLine: 8,
          queue: queue.map(n => n.val),
          currentLevelNodes: currentLevelNodesForVis,
          rightSideViewNodes: [...result],
          processingNode: node.val,
          isComplete: false,
        });
        
        // Step: Check if it's the right-most node
        newHistory.push({
          step: stepCount++,
          explanation: `Checking if ${node.val} is the last node at this level (i=${i}, levelSize-1=${levelSize - 1}).`,
          tree: root,
          highlightLine: 9,
          queue: queue.map(n => n.val),
          currentLevelNodes: currentLevelNodesForVis,
          rightSideViewNodes: [...result],
          processingNode: node.val,
          isComplete: false,
        });

        if (i === levelSize - 1) {
          result.push(node.val);
          // Step: Add to result
          newHistory.push({
            step: stepCount++,
            explanation: `Yes, ${node.val} is the last node. Adding to Right Side View result.`,
            tree: root,
            highlightLine: 10,
            queue: queue.map(n => n.val),
            currentLevelNodes: currentLevelNodesForVis,
            rightSideViewNodes: [...result],
            processingNode: node.val,
            isComplete: false,
          });
        }

        // Step: Enqueue left child
        if (node.left) {
          queue.push(node.left);
          newHistory.push({
            step: stepCount++,
            explanation: `Enqueuing left child: ${node.left.val}.`,
            tree: root,
            highlightLine: 11,
            queue: queue.map(n => n.val),
            currentLevelNodes: currentLevelNodesForVis,
            rightSideViewNodes: [...result],
            processingNode: node.val,
            isComplete: false,
          });
        }
        
        // Step: Enqueue right child
        if (node.right) {
          queue.push(node.right);
          newHistory.push({
            step: stepCount++,
            explanation: `Enqueuing right child: ${node.right.val}.`,
            tree: root,
            highlightLine: 12,
            queue: queue.map(n => n.val),
            currentLevelNodes: currentLevelNodesForVis,
            rightSideViewNodes: [...result],
            processingNode: node.val,
            isComplete: false,
          });
        }
      }
      
      // Step: End of level
      newHistory.push({
        step: stepCount++,
        explanation: `Finished processing level.`,
        tree: root,
        highlightLine: 5, // Loop back to while
        queue: queue.map(n => n.val),
        currentLevelNodes: [], // Clear level highlight
        rightSideViewNodes: [...result],
        processingNode: null,
        isComplete: false,
      });
    }

    // Final state
    newHistory.push({
      step: stepCount++,
      explanation: `🎉 BFS complete! Queue is empty. Final Right Side View: [${result.join(', ')}]`,
      tree: root,
      highlightLine: 13, // return result
      queue: [],
      currentLevelNodes: [],
      rightSideViewNodes: [...result],
      processingNode: null,
      isComplete: true,
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
    const size = Math.floor(Math.random() * 10) + 5; // 5-14 nodes
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    // Shuffle
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    
    // Add nulls
    const levelOrder = [];
    let valueIndex = 0;
    levelOrder.push(values[valueIndex++]); // Root
    
    let i = 0;
    while(valueIndex < values.length) {
      if(levelOrder[i] !== null) {
        // Left child
        if (Math.random() > 0.25) { // 75% chance of child
          levelOrder.push(values[valueIndex++]);
        } else {
          levelOrder.push(null);
        }
        if(valueIndex >= values.length) break;

        // Right child
        if (Math.random() > 0.25) { // 75% chance of child
          levelOrder.push(values[valueIndex++]);
        } else {
          levelOrder.push(null);
        }
      } else {
         levelOrder.push(null);
         levelOrder.push(null);
      }
      i++;
    }
    
    // Trim trailing nulls
    while(levelOrder.length > 0 && levelOrder[levelOrder.length - 1] === null) {
      levelOrder.pop();
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (visualizerRef.current && visualizerRef.current.contains(document.activeElement)) {
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, isPlaying, stepBackward, stepForward, playAnimation, pauseAnimation]);

  const state = history[currentStep] || {};
  const {
    tree = null,
    explanation = "Load a tree to begin visualization.",
    highlightLine,
    processingNode,
    queue = [],
    currentLevelNodes = [],
    rightSideViewNodes = [],
    isComplete = false
  } = state;

  const CodeLine = ({ lineNum, content, indent = 0 }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        highlightLine === lineNum
          ? "bg-purple-500/20 border-l-4 border-purple-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
      style={{ paddingLeft: `${indent * 1.5 + 0.5}rem` }}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={highlightLine === lineNum ? "text-purple-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const rightSideViewCode = [
    { line: 1, content: "function rightSideView(root):", indent: 0 },
    { line: 2, content: "if !root: return []", indent: 1 },
    { line: 3, content: "queue = [root]", indent: 1 },
    { line: 4, content: "result = []", indent: 1 },
    { line: 5, content: "while queue is not empty:", indent: 1 },
    { line: 6, content: "levelSize = queue.length", indent: 2 },
    { line: 7, content: "for i from 0 to levelSize - 1:", indent: 2 },
    { line: 8, content: "node = queue.dequeue()", indent: 3 },
    { line: 9, content: "if i == levelSize - 1:", indent: 3 },
    { line: 10, content: "result.push(node.val)", indent: 4 },
    { line: 11, content: "if node.left: queue.enqueue(node.left)", indent: 3 },
    { line: 12, content: "if node.right: queue.enqueue(node.right)", indent: 3 },
    { line: 13, content: "return result", indent: 1 },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none text-white"
    >
      {/* Custom Message Modal */}
      {message && (
        <div className="fixed top-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 animate-pulse">
          {message}
        </div>
      )}

      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <Eye size={36} />
          Binary Tree Right Side View
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find nodes visible from the right side, top to bottom (LeetCode #199)
        </p>
      </header>

      {/* Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow w-full md:w-auto">
          <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono hidden xl:block my-auto">
            Tree (Level Order):
          </label>
          <input
            id="tree-input"
            type="text"
            value={treeInput}
            onChange={(e) => setTreeInput(e.target.value)}
            disabled={isLoaded}
            placeholder="e.g., 1,2,3,null,5,null,4"
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap justify-center">
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
                  title="Step Backward (Left Arrow)"
                >
                  <SkipBack size={20} />
                </button>
                
                {!isPlaying ? (
                  <button
                    onClick={playAnimation}
                    disabled={currentStep >= history.length - 1}
                    className="bg-green-500 hover:bg-green-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                    title="Play (Spacebar)"
                  >
                    <Play size={20} />
                  </button>
                ) : (
                  <button
                    onClick={pauseAnimation}
                    className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg transition-all duration-300 cursor-pointer"
                    title="Pause (Spacebar)"
                  >
                    <Pause size={20} />
                  </button>
                )}

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50 transition-all duration-300 cursor-pointer"
                  title="Step Forward (Right Arrow)"
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
              BFS Algorithm
            </h3>
            <div className="overflow-y-auto max-h-[40rem] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {rightSideViewCode.map((codeLine) => (
                    <CodeLine 
                      key={codeLine.line} 
                      lineNum={codeLine.line} 
                      content={codeLine.content}
                      indent={codeLine.indent}
                    />
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tree Visualization */}
            <TreeVisualization 
              tree={tree}
              traversalState={{
                processingNode,
                currentLevelNodes,
                rightSideViewNodes
              }}
            />

            {/* Queue Visualization */}
            <QueueVisualization queue={queue} />

            {/* Result Visualization */}
            <ResultVisualization result={rightSideViewNodes} />

            {/* Status and Explanation Panel */}
            <div className="bg-gradient-to-br from-amber-900/40 to-yellow-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-amber-700/50">
              <h3 className="font-bold text-lg text-amber-300 mb-3 flex items-center gap-2">
                <BarChart3 size={20} />
                Step Explanation
              </h3>
              <div className="text-gray-300 text-sm h-16 overflow-y-auto scrollbar-thin">
                {explanation}
              </div>
            </div>
          </div>

          {/* Complexity Analysis */}
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
                      Each node is visited, enqueued, and dequeued exactly once.
                      The algorithm performs constant-time operations for each node.
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
                    <strong className="text-teal-300 font-mono block mb-1">O(W)</strong>
                    <p className="text-gray-400 text-sm">
                      The space complexity is determined by the maximum size of the queue, 
                      which holds at most one level's nodes.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Worst Case: O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      In the worst case (a perfect, complete binary tree), the last level
                      can contain up to O(N) nodes (specifically, (N+1)/2).
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
            Enter tree values to visualize the Right Side View algorithm
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Level Order: 1,2,3...</span>
              <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">Use 'null' for empty nodes</span>
            </div>
            <p>
              <strong>Example 1:</strong> "1,2,3,null,5,null,4" &rarr; [1, 3, 4]
            </p>
             <p>
              <strong>Example 2:</strong> "1,2,3,4,null,null,null,5" &rarr; [1, 3, 4, 5]
            </p>
            <p className="text-gray-500 pt-2">
              The algorithm uses BFS to traverse the tree level by level,
              adding the *last* node of each level to the result.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinaryTreeRightSideView;
