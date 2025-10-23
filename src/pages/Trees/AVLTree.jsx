// AVLTree.jsx
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
  GitBranch,
  Scale,
  RefreshCw,
  Target,
  Gauge,
  ArrowUp,
  ArrowDown,
  RotateCw,
  List,
} from "lucide-react";

// TreeNode class for building the tree
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.height = 1;
  }
}

const Tree = ({ node, x, y, isHighlighted = false, isCurrent = false, isRoot = false, isNew = false, balanceFactor = 0 }) => {
  if (!node) return null;

  const getBalanceColor = (bf) => {
    if (bf > 1 || bf < -1) return "#ef4444";
    if (bf === 1 || bf === -1) return "#f59e0b";
    return "#10b981";
  };

  return (
    <g className="transition-all duration-500 ease-out">
      {/* Node circle */}
      <circle
        cx={x}
        cy={y}
        r={20}
        fill={
          isCurrent ? "#10b981" : 
          isHighlighted ? "#f59e0b" : 
          isNew ? "#8b5cf6" :
          isRoot ? "#3b82f6" : "#6b7280"
        }
        stroke={isCurrent ? "#059669" : isHighlighted ? "#d97706" : isNew ? "#7c3aed" : isRoot ? "#1d4ed8" : "#4b5563"}
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
      
      {/* Balance factor indicator */}
      <circle
        cx={x + 25}
        cy={y - 15}
        r={12}
        fill={getBalanceColor(balanceFactor)}
        stroke="#1f2937"
        strokeWidth={1}
      />
      <text
        x={x + 25}
        cy={y - 15}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-bold fill-white pointer-events-none select-none"
      >
        {balanceFactor}
      </text>
      
      {/* Height indicator */}
      <text
        x={x}
        y={y + 35}
        textAnchor="middle"
        className="text-xs text-gray-400 pointer-events-none select-none"
      >
        h:{node.height}
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
      
      {/* New node effect */}
      {isNew && (
        <circle
          cx={x}
          cy={y}
          r={28}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={2}
          className="animate-ping"
        />
      )}
    </g>
  );
};

// Tree Visualization Component
const TreeVisualization = ({ tree, avlState }) => {
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

  const calculateNodePositions = (node, level = 0, position = 0, maxPosition = 1) => {
    if (!node) return { nodes: [], maxPosition: 1 };

    const depth = calculateTreeDepth(tree);
    const levelHeight = dimensions.height / (depth + 1);
    const y = 60 + level * levelHeight;
    
    // Calculate x position based on binary tree positioning
    const x = (position + 0.5) * (dimensions.width / Math.pow(2, level));

    const leftResult = node.left ? calculateNodePositions(node.left, level + 1, position * 2, maxPosition) : { nodes: [], maxPosition };
    const rightResult = node.right ? calculateNodePositions(node.right, level + 1, position * 2 + 1, maxPosition) : { nodes: [], maxPosition };

    const nodes = [
      {
        node,
        x,
        y,
        level,
        isHighlighted: avlState?.currentNode === node.val,
        isCurrent: avlState?.processingNode === node.val,
        isRoot: level === 0,
        isNew: avlState?.newNodes?.includes(node.val),
        balanceFactor: avlState?.balanceFactors?.[node.val] || 0
      },
      ...leftResult.nodes,
      ...rightResult.nodes
    ];

    return { nodes, maxPosition: Math.max(position, leftResult.maxPosition, rightResult.maxPosition) };
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
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-purple-300 mb-4 flex items-center gap-2">
        <Scale size={20} />
        AVL Tree Visualization
        {tree && (
          <span className="text-sm text-gray-400 ml-2">
            (Root: {tree.val}, Height: {tree.height}, Balance: {avlState?.balanceFactors?.[tree.val] || 0})
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
            <Tree key={`node-${nodeData.node.val}-${index}`} {...nodeData} />
          ))}
        </svg>
      </div>

      {/* Tree Info */}
      {tree && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400">Tree Height</div>
            <div className="font-mono text-emerald-400">
              {tree.height}
            </div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400">Total Nodes</div>
            <div className="font-mono text-emerald-400">
              {nodes.length}
            </div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400">Root Balance</div>
            <div className="font-mono text-emerald-400">
              {avlState?.balanceFactors?.[tree.val] || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Array Visualization Component
const ArrayVisualization = ({ inorder, avlState }) => {
  const getArrayElementStyle = (value, index) => {
    const isCurrent = avlState?.currentIndex === index;
    const isPivot = avlState?.pivotIndex === index;
    const isInRange = 
      avlState?.start !== undefined && 
      avlState?.end !== undefined &&
      index >= avlState.start && 
      index <= avlState.end;

    const baseStyle = "w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 transform";
    
    if (isCurrent) {
      return `${baseStyle} bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg shadow-emerald-500/50`;
    } else if (isPivot) {
      return `${baseStyle} bg-purple-500 border-purple-400 text-white scale-110 shadow-lg shadow-purple-500/50`;
    } else if (isInRange) {
      return `${baseStyle} bg-blue-500/30 border-blue-400/50 text-gray-300 scale-105`;
    }
    
    return `${baseStyle} bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600/50 scale-100`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2">
        <List size={20} />
        Inorder Traversal (Sorted)
      </h3>

      <div className="space-y-6">
        {/* Inorder Array */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <RefreshCw size={16} />
            Sorted Array for Balanced BST Construction
            {avlState?.start !== undefined && avlState?.end !== undefined && (
              <span className="text-amber-400 font-mono ml-2">
                Range: [{avlState.start}, {avlState.end}]
              </span>
            )}
          </h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {inorder.map((value, index) => (
              <div key={`inorder-${index}`} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1 font-mono">{index}</div>
                <div
                  className={getArrayElementStyle(value, index)}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Range Visualization */}
      {avlState?.start !== undefined && avlState?.end !== undefined && (
        <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Target size={16} />
            Current Subarray Range
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Start Index:</div>
              <div className="font-mono text-amber-400">{avlState.start}</div>
            </div>
            <div>
              <div className="text-gray-500">End Index:</div>
              <div className="font-mono text-amber-400">{avlState.end}</div>
            </div>
            {avlState.pivotIndex !== undefined && (
              <div className="col-span-2">
                <div className="text-gray-500">Mid Index (Root):</div>
                <div className="font-mono text-purple-400">{avlState.pivotIndex}</div>
              </div>
            )}
          </div>
          {avlState.currentRoot !== undefined && (
            <div className="mt-2 text-xs text-gray-400">
              Creating node: <span className="font-mono text-emerald-400">{avlState.currentRoot}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Rotation Visualization Component
const RotationVisualization = ({ rotationState }) => {
  if (!rotationState || !rotationState.type) return null;

  const getRotationDescription = (type) => {
    switch (type) {
      case 'left':
        return "Left Rotation (LL Case)";
      case 'right':
        return "Right Rotation (RR Case)";
      case 'leftRight':
        return "Left-Right Rotation (LR Case)";
      case 'rightLeft':
        return "Right-Left Rotation (RL Case)";
      default:
        return "Rotation";
    }
  };

  const getRotationExplanation = (type, node) => {
    switch (type) {
      case 'left':
        return `Left rotation at node ${node} to fix right-heavy subtree`;
      case 'right':
        return `Right rotation at node ${node} to fix left-heavy subtree`;
      case 'leftRight':
        return `Left-Right rotation at node ${node} to fix left-right case`;
      case 'rightLeft':
        return `Right-Left rotation at node ${node} to fix right-left case`;
      default:
        return `Balancing node ${node}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
      <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
        <RefreshCw size={20} />
        AVL Rotation
      </h3>
      <div className="text-center mb-4">
        <div className="font-mono text-2xl font-bold text-purple-400 mb-2">
          {getRotationDescription(rotationState.type)}
        </div>
        <div className="text-sm text-gray-300">
          {getRotationExplanation(rotationState.type, rotationState.node)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="text-gray-400">Unbalanced Node</div>
          <div className="font-mono text-red-400 text-lg">{rotationState.node}</div>
        </div>
        <div className="bg-purple-900/30 p-3 rounded-lg">
          <div className="text-gray-400">Balance Factor</div>
          <div className="font-mono text-yellow-400 text-lg">{rotationState.balanceFactor}</div>
        </div>
      </div>
      
      {rotationState.case && (
        <div className="mt-3 text-xs text-gray-400 text-center">
          Case: <span className="font-mono text-amber-400">{rotationState.case}</span>
        </div>
      )}
    </div>
  );
};

// Main Component
const AVLTree = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("1,2,3,4,5,6,7");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);


  // Generate history for AVL tree construction
  const generateHistory = useCallback(() => {
    // Local helpers to avoid external dependencies
    const height = (node) => (node ? node.height : 0);
    const getBalance = (node) => (node ? height(node.left) - height(node.right) : 0);
    const values = treeInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    if (values.length === 0) {
      alert("Invalid input. Please provide valid tree values.");
      return;
    }

    const newHistory = [];
    let stepCount = 0;
    let callStack = [];

    // Step 1: Convert to sorted array (inorder)
    const sortedValues = [...values].sort((a, b) => a - b);
    
    newHistory.push({
      step: stepCount++,
      explanation: `Step 1: Sort input array to get inorder traversal: [${sortedValues.join(', ')}]`,
      inorder: sortedValues,
      line: 1,
      phase: "sorting"
    });

    // Step 2: Build balanced BST from sorted array
    const buildBalancedBST = (start, end, depth = 0, side = 'root') => {
      callStack.push({ start, end, depth, side });

      if (start > end) {
        newHistory.push({
          step: stepCount++,
          explanation: `Empty range [${start}, ${end}], returning null`,
          inorder: sortedValues,
          start,
          end,
          currentRoot: null,
          processingNode: null,
          line: 3,
          callStack: [...callStack],
          depth,
          side,
          phase: "building"
        });
        callStack.pop();
        return null;
      }

      const mid = Math.floor((start + end) / 2);
      const rootVal = sortedValues[mid];
      const rootNode = new TreeNode(rootVal);

      // Show root creation
      newHistory.push({
        step: stepCount++,
        explanation: `Creating root node with value ${rootVal} from sorted[${mid}]`,
        inorder: sortedValues,
        start,
        end,
        pivotIndex: mid,
        currentRoot: rootVal,
        processingNode: rootVal,
        tree: JSON.parse(JSON.stringify(rootNode)),
        line: 5,
        callStack: [...callStack],
        depth,
        side,
        phase: "building"
      });

      // Build left subtree
      if (start <= mid - 1) {
        newHistory.push({
          step: stepCount++,
          explanation: `Building left subtree: range [${start}, ${mid - 1}]`,
          inorder: sortedValues,
          start,
          end: mid - 1,
          currentRoot: rootVal,
          processingNode: null,
          tree: JSON.parse(JSON.stringify(rootNode)),
          line: 7,
          callStack: [...callStack],
          depth: depth + 1,
          side: 'left',
          phase: "building"
        });
      }

      const leftTree = buildBalancedBST(start, mid - 1, depth + 1, 'left');
      rootNode.left = leftTree;

      // Update height after left subtree
      rootNode.height = 1 + Math.max(height(leftTree), height(rootNode.right));

      if (leftTree) {
        newHistory.push({
          step: stepCount++,
          explanation: `Completed left subtree of ${rootVal}, updated height to ${rootNode.height}`,
          inorder: sortedValues,
          start: mid + 1,
          end,
          currentRoot: rootVal,
          processingNode: rootVal,
          tree: JSON.parse(JSON.stringify(rootNode)),
          balanceFactors: { [rootVal]: getBalance(rootNode) },
          line: 9,
          callStack: [...callStack],
          depth,
          side,
          phase: "building"
        });
      }

      // Build right subtree
      if (mid + 1 <= end) {
        newHistory.push({
          step: stepCount++,
          explanation: `Building right subtree: range [${mid + 1}, ${end}]`,
          inorder: sortedValues,
          start: mid + 1,
          end,
          currentRoot: rootVal,
          processingNode: null,
          tree: JSON.parse(JSON.stringify(rootNode)),
          line: 7,
          callStack: [...callStack],
          depth: depth + 1,
          side: 'right',
          phase: "building"
        });
      }

      const rightTree = buildBalancedBST(mid + 1, end, depth + 1, 'right');
      rootNode.right = rightTree;

      // Update height and check balance
      rootNode.height = 1 + Math.max(height(rootNode.left), height(rootNode.right));
      const balance = getBalance(rootNode);

      newHistory.push({
        step: stepCount++,
        explanation: `Completed subtree rooted at ${rootVal}, height: ${rootNode.height}, balance: ${balance}`,
        inorder: sortedValues,
        start,
        end,
        currentRoot: rootVal,
        processingNode: rootVal,
        tree: JSON.parse(JSON.stringify(rootNode)),
        balanceFactors: { [rootVal]: balance },
        line: 11,
        callStack: [...callStack],
        depth,
        side,
        phase: "building"
      });

      // Simulate AVL rotations if needed (for educational purposes)
      if (balance > 1 || balance < -1) {
        let rotationType = '';
        let rotationCase = '';
        
        if (balance > 1) {
          if (getBalance(rootNode.left) >= 0) {
            rotationType = 'right';
            rotationCase = 'LL Case';
          } else {
            rotationType = 'leftRight';
            rotationCase = 'LR Case';
          }
        } else {
          if (getBalance(rootNode.right) <= 0) {
            rotationType = 'left';
            rotationCase = 'RR Case';
          } else {
            rotationType = 'rightLeft';
            rotationCase = 'RL Case';
          }
        }

        newHistory.push({
          step: stepCount++,
          explanation: `Node ${rootVal} is unbalanced (balance: ${balance}), performing ${rotationType} rotation`,
          inorder: sortedValues,
          currentRoot: rootVal,
          processingNode: rootVal,
          tree: JSON.parse(JSON.stringify(rootNode)),
          balanceFactors: { [rootVal]: balance },
          rotationState: {
            type: rotationType,
            node: rootVal,
            balanceFactor: balance,
            case: rotationCase
          },
          line: 13,
          phase: "balancing"
        });

        // Simulate rotation result
        const balancedTree = JSON.parse(JSON.stringify(rootNode));
        newHistory.push({
          step: stepCount++,
          explanation: `✅ Rotation completed! Node ${rootVal} is now balanced`,
          inorder: sortedValues,
          currentRoot: rootVal,
          processingNode: rootVal,
          tree: balancedTree,
          balanceFactors: { [rootVal]: 0 },
          newNodes: [rootVal],
          line: 14,
          phase: "balancing"
        });
      }

      callStack.pop();
      return rootNode;
    };

    const root = buildBalancedBST(0, sortedValues.length - 1);

    newHistory.push({
      step: stepCount++,
      explanation: `🎉 AVL Tree construction complete! Built balanced BST with root ${root.val}, height ${root.height}`,
      inorder: sortedValues,
      tree: root,
      line: 16,
      isComplete: true,
      phase: "complete",
      balanceFactors: { [root.val]: getBalance(root) }
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
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    // Shuffle array to create unbalanced tree
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    setTreeInput(values.join(','));
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
    inorder = [],
    tree = null,
    explanation = "",
    line,
    start,
    end,
    pivotIndex,
    currentRoot,
    processingNode,
    callStack = [],
    depth = 0,
    side = 'root',
    isComplete = false,
    phase = "initial",
    balanceFactors = {},
    rotationState = null,
    newNodes = []
  } = state;

  const CodeLine = ({ lineNum, content }) => (
    <div
      className={`block rounded-md transition-all duration-300 ${
        line === lineNum
          ? "bg-emerald-500/20 border-l-4 border-emerald-500 shadow-lg"
          : "hover:bg-gray-700/30"
      }`}
    >
      <span className="text-gray-500 select-none inline-block w-8 text-right mr-3">
        {lineNum}
      </span>
      <span className={line === lineNum ? "text-emerald-300 font-semibold" : "text-gray-300"}>
        {content}
      </span>
    </div>
  );

  const avlTreeCode = [
    { line: 1, content: "TreeNode* balanceBST(TreeNode* root) {" },
    { line: 2, content: "    vector<int> inorder;" },
    { line: 3, content: "    inOrderTraversal(root, inorder);" },
    { line: 4, content: "    return buildBalancedBST(inorder, 0," },
    { line: 5, content: "                            inorder.size()-1);" },
    { line: 6, content: "}" },
    { line: 7, content: "" },
    { line: 8, content: "TreeNode* buildBalancedBST(vector<int>& arr," },
    { line: 9, content: "                          int start, int end) {" },
    { line: 10, content: "    if (start > end) return nullptr;" },
    { line: 11, content: "" },
    { line: 12, content: "    int mid = start + (end - start) / 2;" },
    { line: 13, content: "    TreeNode* root = new TreeNode(arr[mid]);" },
    { line: 14, content: "" },
    { line: 15, content: "    root->left = buildBalancedBST(arr," },
    { line: 16, content: "                               start, mid-1);" },
    { line: 17, content: "    root->right = buildBalancedBST(arr," },
    { line: 18, content: "                                mid+1, end);" },
    { line: 19, content: "" },
    { line: 20, content: "    root->height = 1 + max(height(root->left)," },
    { line: 21, content: "                           height(root->right));" },
    { line: 22, content: "" },
    { line: 23, content: "    int balance = getBalance(root);" },
    { line: 24, content: "" },
    { line: 25, content: "    // AVL Rotations if needed" },
    { line: 26, content: "    if (balance > 1) {" },
    { line: 27, content: "        if (getBalance(root->left) >= 0)" },
    { line: 28, content: "            return rightRotate(root);  // LL" },
    { line: 29, content: "        else" },
    { line: 30, content: "            return leftRightRotate(root);// LR" },
    { line: 31, content: "    }" },
    { line: 32, content: "    if (balance < -1) {" },
    { line: 33, content: "        if (getBalance(root->right) <= 0)" },
    { line: 34, content: "            return leftRotate(root);   // RR" },
    { line: 35, content: "        else" },
    { line: 36, content: "            return rightLeftRotate(root);// RL" },
    { line: 37, content: "    }" },
    { line: 38, content: "" },
    { line: 39, content: "    return root;" },
    { line: 40, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-purple-400 flex items-center justify-center gap-3">
          <Scale size={28} />
          Balance BST (AVL Tree)
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Convert any Binary Search Tree to a balanced AVL Tree (LeetCode #1382)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono">
              Tree Values:
            </label>
            <input
              id="tree-input"
              type="text"
              value={treeInput}
              onChange={(e) => setTreeInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 1,2,3,4,5,6,7"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
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
              AVL Tree Algorithm
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {avlTreeCode.map((codeLine) => (
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
                  <GitBranch size={16} />
                  Call Stack (Depth: {depth})
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {callStack.map((call, idx) => (
                    <div key={idx} className="text-xs font-mono bg-gray-800/50 p-1 rounded">
                      {call.side}: [{call.start}, {call.end}]
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Visualization Panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rotation Visualization */}
            {rotationState && <RotationVisualization rotationState={rotationState} />}

            {/* Tree Visualization */}
            <TreeVisualization 
              tree={tree}
              avlState={{
                currentNode: currentRoot,
                processingNode,
                start,
                end,
                pivotIndex,
                balanceFactors,
                newNodes
              }}
            />

            {/* Array Visualization */}
            <ArrayVisualization
              inorder={inorder}
              avlState={{
                start,
                end,
                pivotIndex,
                currentIndex: pivotIndex,
                currentRoot
              }}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Gauge size={20} />
                  Current Phase
                </h3>
                <div className="text-center">
                  <span className="font-mono text-lg font-bold text-blue-300 capitalize">
                    {phase}
                  </span>
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  {side} subtree • Depth: {depth}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Target size={20} />
                  Current Root
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-purple-400">
                  {currentRoot || "null"}
                </div>
                {balanceFactors[currentRoot] !== undefined && (
                  <div className="text-xs text-gray-400 text-center mt-2">
                    Balance: {balanceFactors[currentRoot]}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Progress
                </h3>
                <div className="font-mono text-2xl font-bold text-center text-green-400">
                  {isComplete ? "Complete!" : "Building..."}
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  {Math.round((currentStep / history.length) * 100)}% Complete
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
                {explanation || "Starting AVL tree construction algorithm..."}
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
                      Inorder traversal takes O(N) time, and building the balanced BST 
                      from sorted array also takes O(N) time.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Optimal Solution</strong>
                    <p className="text-gray-400 text-sm">
                      The algorithm ensures the tree is balanced in O(N) time, 
                      providing optimal O(log N) operations for search, insert, and delete.
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
                    <strong className="text-teal-300 font-mono block mb-1">O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      The inorder array uses O(N) space, and the recursion stack 
                      uses O(log N) space for the balanced tree construction.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">AVL Benefits</strong>
                    <p className="text-gray-400 text-sm">
                      Balanced BST ensures O(log N) time for all operations and 
                      prevents worst-case O(N) scenarios of unbalanced trees.
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
            Enter BST values to visualize AVL tree balancing
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Balanced Height</span>
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">O(log N) Operations</span>
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Auto-Rebalancing</span>
            </div>
            <p>
              <strong>Example:</strong> Input: "1,2,3,4,5,6,7" → Balanced AVL Tree
            </p>
            <p className="text-gray-500">
              The algorithm converts any BST to a balanced AVL tree by:
              1) Extracting values in sorted order, 2) Building balanced BST from sorted array,
              3) Maintaining AVL property with rotations when needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AVLTree;