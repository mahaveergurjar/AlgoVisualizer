// ConstructTree.jsx
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
  GitMerge,
  Target,
  Gauge,
  Maximize2,
  ArrowRight,
  ArrowLeft,
  Split,
  List,
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
const TreeNode = ({ node, x, y, isHighlighted = false, isCurrent = false, isRoot = false }) => {
  if (!node) return null;

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
          isRoot ? "#3b82f6" : "#6b7280"
        }
        stroke={isCurrent ? "#059669" : isHighlighted ? "#d97706" : isRoot ? "#1d4ed8" : "#4b5563"}
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
        isHighlighted: traversalState?.currentNode === node.val,
        isCurrent: traversalState?.processingNode === node.val,
        isRoot: level === 0
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
      <h3 className="font-bold text-lg text-emerald-300 mb-4 flex items-center gap-2">
        <TreePine size={20} />
        Tree Visualization
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
            <TreeNode key={`node-${nodeData.node.val}-${index}`} {...nodeData} />
          ))}
        </svg>
      </div>

      {/* Tree Info */}
      {tree && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400">Tree Height</div>
            <div className="font-mono text-emerald-400">
              {calculateTreeDepth(tree)}
            </div>
          </div>
          <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="text-gray-400">Total Nodes</div>
            <div className="font-mono text-emerald-400">
              {nodes.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Array Visualization Component
const ArrayVisualization = ({ preorder, inorder, traversalState }) => {
  const getArrayElementStyle = (value, arrayType, index) => {
    const isCurrent = 
      (arrayType === 'preorder' && traversalState?.preIndex === index) ||
      (arrayType === 'inorder' && index === traversalState?.inIndex);

    const isInRange = 
      arrayType === 'inorder' && 
      traversalState?.inStart !== undefined && 
      traversalState?.inEnd !== undefined &&
      index >= traversalState.inStart && 
      index <= traversalState.inEnd;

    const isHighlighted = 
      traversalState?.currentRoot === value;

    const baseStyle = "w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 transform";
    
    if (isCurrent) {
      return `${baseStyle} bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg shadow-emerald-500/50`;
    } else if (isHighlighted) {
      return `${baseStyle} bg-amber-500 border-amber-400 text-gray-900 scale-105 shadow-lg shadow-amber-500/50`;
    } else if (isInRange) {
      return `${baseStyle} bg-blue-500/30 border-blue-400/50 text-gray-300 scale-105`;
    }
    
    return `${baseStyle} bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600/50 scale-100`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2">
        <List size={20} />
        Traversal Arrays
      </h3>

      <div className="space-y-6">
        {/* Preorder Array */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <ArrowRight size={16} />
            Preorder Traversal (Root → Left → Right)
            {traversalState?.preIndex !== undefined && (
              <span className="text-emerald-400 font-mono ml-2">
                Index: {traversalState.preIndex}
              </span>
            )}
          </h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {preorder.map((value, index) => (
              <div key={`preorder-${index}`} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1 font-mono">{index}</div>
                <div
                  className={getArrayElementStyle(value, 'preorder', index)}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inorder Array */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <ArrowLeft size={16} />
            Inorder Traversal (Left → Root → Right)
            {traversalState?.inStart !== undefined && traversalState?.inEnd !== undefined && (
              <span className="text-amber-400 font-mono ml-2">
                Range: [{traversalState.inStart}, {traversalState.inEnd}]
              </span>
            )}
          </h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {inorder.map((value, index) => (
              <div key={`inorder-${index}`} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1 font-mono">{index}</div>
                <div
                  className={getArrayElementStyle(value, 'inorder', index)}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Range Visualization */}
      {traversalState?.inStart !== undefined && traversalState?.inEnd !== undefined && (
        <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Target size={16} />
            Current Subtree Range
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Inorder Start:</div>
              <div className="font-mono text-amber-400">{traversalState.inStart}</div>
            </div>
            <div>
              <div className="text-gray-500">Inorder End:</div>
              <div className="font-mono text-amber-400">{traversalState.inEnd}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Processing subtree rooted at: <span className="font-mono text-emerald-400">{traversalState.currentRoot}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const ConstructTree = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [preorderInput, setPreorderInput] = useState("3,9,20,15,7");
  const [inorderInput, setInorderInput] = useState("9,3,15,20,7");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const visualizerRef = useRef(null);

  // Create a proper binary tree from sorted array for random generation
  const createBalancedBST = (arr, start = 0, end = arr.length - 1) => {
    if (start > end) return null;
    
    const mid = Math.floor((start + end) / 2);
    const node = new BinaryTreeNode(arr[mid]);
    
    node.left = createBalancedBST(arr, start, mid - 1);
    node.right = createBalancedBST(arr, mid + 1, end);
    
    return node;
  };

  // Generate traversals from tree
  const generatePreorder = (node, result = []) => {
    if (!node) return result;
    result.push(node.val);
    generatePreorder(node.left, result);
    generatePreorder(node.right, result);
    return result;
  };

  const generateInorder = (node, result = []) => {
    if (!node) return result;
    generateInorder(node.left, result);
    result.push(node.val);
    generateInorder(node.right, result);
    return result;
  };

  const generateHistory = useCallback(() => {
    const preorder = preorderInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const inorder = inorderInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    if (preorder.length === 0 || inorder.length === 0) {
      alert("Invalid input. Please provide valid preorder and inorder traversals.");
      return;
    }

    if (preorder.length !== inorder.length) {
      alert("Preorder and inorder traversals must have the same length.");
      return;
    }

    // Validate that both arrays contain the same elements
    const preSorted = [...preorder].sort((a, b) => a - b);
    const inSorted = [...inorder].sort((a, b) => a - b);
    
    for (let i = 0; i < preSorted.length; i++) {
      if (preSorted[i] !== inSorted[i]) {
        alert("Preorder and inorder traversals must contain the same elements.");
        return;
      }
    }

    const newHistory = [];
    let stepCount = 0;
    let callStack = [];

    const buildTree = (preStart, preEnd, inStart, inEnd, depth = 0, side = 'root') => {
      callStack.push({ preStart, preEnd, inStart, inEnd, depth, side });

      if (preStart > preEnd || inStart > inEnd) {
        newHistory.push({
          step: stepCount++,
          explanation: `Empty subtree range [${inStart}, ${inEnd}], returning null`,
          preorder,
          inorder,
          preIndex: preStart,
          inStart,
          inEnd,
          currentRoot: null,
          processingNode: null,
          tree: null,
          line: 3,
          callStack: [...callStack],
          depth,
          side
        });
        callStack.pop();
        return null;
      }

      const rootVal = preorder[preStart];
      const rootNode = new BinaryTreeNode(rootVal);
      
      // Show root creation
      newHistory.push({
        step: stepCount++,
        explanation: `Creating root node with value ${rootVal} from preorder[${preStart}]`,
        preorder,
        inorder,
        preIndex: preStart,
        inStart,
        inEnd,
        currentRoot: rootVal,
        processingNode: rootVal,
        tree: JSON.parse(JSON.stringify(rootNode)), // Deep copy for visualization
        line: 5,
        callStack: [...callStack],
        depth,
        side
      });

      // Find root in inorder
      let inIndex = -1;
      for (let i = inStart; i <= inEnd; i++) {
        if (inorder[i] === rootVal) {
          inIndex = i;
          break;
        }
      }

      if (inIndex === -1) {
        alert(`Error: Root value ${rootVal} not found in inorder array within range [${inStart}, ${inEnd}]`);
        callStack.pop();
        return null;
      }

      newHistory.push({
        step: stepCount++,
        explanation: `Found root ${rootVal} in inorder array at index ${inIndex}`,
        preorder,
        inorder,
        preIndex: preStart,
        inStart,
        inEnd,
        inIndex,
        currentRoot: rootVal,
        processingNode: rootVal,
        tree: JSON.parse(JSON.stringify(rootNode)),
        line: 7,
        callStack: [...callStack],
        depth,
        side
      });

      const leftSize = inIndex - inStart;
      
      newHistory.push({
        step: stepCount++,
        explanation: `Left subtree: ${leftSize} elements, Right subtree: ${inEnd - inIndex} elements`,
        preorder,
        inorder,
        preIndex: preStart,
        inStart,
        inEnd,
        inIndex,
        leftSize,
        currentRoot: rootVal,
        processingNode: rootVal,
        tree: JSON.parse(JSON.stringify(rootNode)),
        line: 9,
        callStack: [...callStack],
        depth,
        side
      });

      // Build left subtree with visualization of partial tree
      if (leftSize > 0) {
        newHistory.push({
          step: stepCount++,
          explanation: `Building left subtree: preorder[${preStart + 1}..${preStart + leftSize}], inorder[${inStart}..${inIndex - 1}]`,
          preorder,
          inorder,
          preIndex: preStart + 1,
          inStart,
          inEnd: inIndex - 1,
          currentRoot: rootVal,
          processingNode: null,
          tree: JSON.parse(JSON.stringify(rootNode)),
          line: 10,
          callStack: [...callStack],
          depth: depth + 1,
          side: 'left'
        });
      }

      const leftTree = buildTree(preStart + 1, preStart + leftSize, inStart, inIndex - 1, depth + 1, 'left');
      rootNode.left = leftTree;

      // Show tree with left subtree added
      if (leftTree) {
        newHistory.push({
          step: stepCount++,
          explanation: `Completed left subtree of ${rootVal}`,
          preorder,
          inorder,
          preIndex: preStart + leftSize + 1,
          inStart: inIndex + 1,
          inEnd,
          currentRoot: rootVal,
          processingNode: rootVal,
          tree: JSON.parse(JSON.stringify(rootNode)),
          line: 11,
          callStack: [...callStack],
          depth,
          side
        });
      }

      // Build right subtree with visualization of partial tree
      if (inEnd - inIndex > 0) {
        newHistory.push({
          step: stepCount++,
          explanation: `Building right subtree: preorder[${preStart + leftSize + 1}..${preEnd}], inorder[${inIndex + 1}..${inEnd}]`,
          preorder,
          inorder,
          preIndex: preStart + leftSize + 1,
          inStart: inIndex + 1,
          inEnd,
          currentRoot: rootVal,
          processingNode: null,
          tree: JSON.parse(JSON.stringify(rootNode)),
          line: 11,
          callStack: [...callStack],
          depth: depth + 1,
          side: 'right'
        });
      }

      const rightTree = buildTree(preStart + leftSize + 1, preEnd, inIndex + 1, inEnd, depth + 1, 'right');
      rootNode.right = rightTree;

      // Show complete subtree
      newHistory.push({
        step: stepCount++,
        explanation: `Completed subtree rooted at ${rootVal}`,
        preorder,
        inorder,
        preIndex: preStart,
        inStart,
        inEnd,
        currentRoot: rootVal,
        processingNode: rootVal,
        tree: JSON.parse(JSON.stringify(rootNode)),
        line: 12,
        callStack: [...callStack],
        depth,
        side
      });

      callStack.pop();
      return rootNode;
    };

    const root = buildTree(0, preorder.length - 1, 0, inorder.length - 1);

    newHistory.push({
      step: stepCount++,
      explanation: `🎉 Tree construction complete! Built binary tree with root ${root.val}`,
      preorder,
      inorder,
      tree: root,
      line: 14,
      isComplete: true,
      callStack: []
    });

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [preorderInput, inorderInput]);

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

  const generateRandomArrays = () => {
    const size = Math.floor(Math.random() * 6) + 4; // 4-9 nodes
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    // Create a balanced BST to ensure valid traversals
    const balancedTree = createBalancedBST([...values].sort((a, b) => a - b));
    
    // Generate valid traversals from the tree
    const preorder = generatePreorder(balancedTree);
    const inorder = generateInorder(balancedTree);

    setPreorderInput(preorder.join(','));
    setInorderInput(inorder.join(','));
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
    preorder = [],
    inorder = [],
    tree = null,
    explanation = "",
    line,
    preIndex,
    inStart,
    inEnd,
    inIndex,
    leftSize,
    currentRoot,
    processingNode,
    callStack = [],
    depth = 0,
    side = 'root',
    isComplete = false
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

  const buildTreeCode = [
    { line: 1, content: "TreeNode* buildTree(vector<int>& preorder," },
    { line: 2, content: "                  vector<int>& inorder) {" },
    { line: 3, content: "    return build(preorder, inorder, 0," },
    { line: 4, content: "                   preorder.size()-1, 0," },
    { line: 5, content: "                   inorder.size()-1);" },
    { line: 6, content: "}" },
    { line: 7, content: "" },
    { line: 8, content: "TreeNode* build(vector<int>& preorder," },
    { line: 9, content: "                vector<int>& inorder," },
    { line: 10, content: "                int preStart, int preEnd," },
    { line: 11, content: "                int inStart, int inEnd) {" },
    { line: 12, content: "    if (preStart > preEnd ||" },
    { line: 13, content: "        inStart > inEnd) return nullptr;" },
    { line: 14, content: "" },
    { line: 15, content: "    // Root is first element in preorder" },
    { line: 16, content: "    int rootVal = preorder[preStart];" },
    { line: 17, content: "    TreeNode* root = new TreeNode(rootVal);" },
    { line: 18, content: "" },
    { line: 19, content: "    // Find root in inorder" },
    { line: 20, content: "    int inIndex = find(inorder, rootVal);" },
    { line: 21, content: "    int leftSize = inIndex - inStart;" },
    { line: 22, content: "" },
    { line: 23, content: "    // Recursively build subtrees" },
    { line: 24, content: "    root->left = build(preorder, inorder," },
    { line: 25, content: "                     preStart+1, preStart+leftSize," },
    { line: 26, content: "                     inStart, inIndex-1);" },
    { line: 27, content: "    root->right = build(preorder, inorder," },
    { line: 28, content: "                      preStart+leftSize+1, preEnd," },
    { line: 29, content: "                      inIndex+1, inEnd);" },
    { line: 30, content: "" },
    { line: 31, content: "    return root;" },
    { line: 32, content: "}" },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-5xl font-bold text-emerald-400 flex items-center justify-center gap-3">
          <GitMerge size={28} />
          Construct Tree from Traversal
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Build binary tree from preorder and inorder traversal sequences (LeetCode #105)
        </p>
      </header>

      {/* Enhanced Controls Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="preorder-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Preorder:
            </label>
            <input
              id="preorder-input"
              type="text"
              value={preorderInput}
              onChange={(e) => setPreorderInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 3,9,20,15,7"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-4 flex-grow">
            <label htmlFor="inorder-input" className="font-medium text-gray-300 font-mono">
              Inorder:
            </label>
            <input
              id="inorder-input"
              type="text"
              value={inorderInput}
              onChange={(e) => setInorderInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 9,3,15,20,7"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          {!isLoaded ? (
            <>
              <button
                onClick={generateHistory}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Load & Visualize
              </button>
              <button
                onClick={generateRandomArrays}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg cursor-pointer"
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
            <h3 className="font-bold text-xl text-emerald-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Code size={20} />
              Recursive Algorithm
            </h3>
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm">
                <code className="font-mono leading-relaxed block">
                  {buildTreeCode.map((codeLine) => (
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
                      {call.side}: pre[{call.preStart}..{call.preEnd}], in[{call.inStart}..{call.inEnd}]
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
              currentStep={currentStep}
              traversalState={{
                currentNode: currentRoot,
                processingNode,
                preIndex,
                inStart,
                inEnd,
                inIndex
              }}
            />

            {/* Array Visualization */}
            <ArrayVisualization
              preorder={preorder}
              inorder={inorder}
              currentStep={currentStep}
              traversalState={{
                preIndex,
                inStart,
                inEnd,
                inIndex,
                currentRoot,
                processingNode
              }}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center gap-2">
                  <Gauge size={20} />
                  Current Root
                </h3>
                <div className="text-center">
                  <span className="font-mono text-4xl font-bold text-blue-300">
                    {currentRoot || "null"}
                  </span>
                </div>
                <div className="text-xs text-gray-400 text-center mt-2">
                  {side} subtree
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center gap-2">
                  <Split size={20} />
                  Subtree Range
                </h3>
                <div className="font-mono text-lg text-center text-purple-300 space-y-1">
                  <div>Inorder: [{inStart}, {inEnd}]</div>
                  {leftSize !== undefined && (
                    <div className="text-sm text-gray-400">Left size: {leftSize}</div>
                  )}
                </div>
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
                  Recursion depth: {depth}
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
                {explanation || "Starting tree construction algorithm..."}
              </div>
            </div>
          </div>

          {/* Enhanced Complexity Analysis */}
          <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-emerald-400 mb-4 border-b border-gray-600/50 pb-3 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                  <Zap size={16} />
                  Time Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      Each node is processed exactly once. The recursive function visits 
                      every node and performs constant-time operations for each.
                    </p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">Optimization</strong>
                    <p className="text-gray-400 text-sm">
                      Using a hash map to store inorder indices reduces 
                      the root search from O(N) to O(1) per node.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                  <Cpu size={16} />
                  Space Complexity
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <strong className="text-teal-300 font-mono block mb-1">O(N)</strong>
                    <p className="text-gray-400 text-sm">
                      The recursion stack uses O(H) space where H is the tree height, 
                      and the hash map uses O(N) space for storing indices.
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
            Enter preorder and inorder traversals to start the visualization
          </div>
          <div className="text-gray-600 text-sm max-w-2xl mx-auto space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs mb-4">
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">Preorder: Root → Left → Right</span>
              <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">Inorder: Left → Root → Right</span>
            </div>
            <p>
              <strong>Example:</strong> Preorder: "3,9,20,15,7", Inorder: "9,3,15,20,7"
            </p>
            <p className="text-gray-500">
              The algorithm recursively builds the tree by using preorder to find roots 
              and inorder to determine left/right subtree boundaries.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructTree;