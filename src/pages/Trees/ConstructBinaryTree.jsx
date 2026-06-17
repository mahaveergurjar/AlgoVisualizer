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
  ArrowRight,
  ArrowLeft,
  Split,
  List,
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
    
    return `${baseStyle} bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700/50 scale-100`;
  };

  return (
    <div className="w-full bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
      <h3 className="font-bold text-lg text-blue-300 mb-4 flex items-center gap-2 select-none">
        <List size={20} />
        Traversal Arrays
      </h3>

      <div className="space-y-6">
        {/* Preorder Array */}
        <div>
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2 select-none">
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
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2 select-none">
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
        <div className="mt-4 bg-gradient-to-br from-gray-950 to-gray-900 rounded-lg p-4 border border-gray-800">
          <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2 select-none">
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
  const [preorderInput, setPreorderInput] = useState("3,9,20,15,7");
  const [inorderInput, setInorderInput] = useState("9,3,15,20,7");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const createBalancedBST = (arr, start = 0, end = arr.length - 1) => {
    if (start > end) return null;
    const mid = Math.floor((start + end) / 2);
    const node = new BinaryTreeNode(arr[mid]);
    node.left = createBalancedBST(arr, start, mid - 1);
    node.right = createBalancedBST(arr, mid + 1, end);
    return node;
  };

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
          line: 12,
          callStack: [...callStack],
          depth,
          side
        });
        callStack.pop();
        return null;
      }

      const rootVal = preorder[preStart];
      const rootNode = new BinaryTreeNode(rootVal);
      
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
        tree: JSON.parse(JSON.stringify(rootNode)),
        line: 16,
        callStack: [...callStack],
        depth,
        side
      });

      let inIndex = -1;
      for (let i = inStart; i <= inEnd; i++) {
        if (inorder[i] === rootVal) {
          inIndex = i;
          break;
        }
      }

      if (inIndex === -1) {
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
        line: 20,
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
        line: 21,
        callStack: [...callStack],
        depth,
        side
      });

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
          line: 24,
          callStack: [...callStack],
          depth: depth + 1,
          side: 'left'
        });
      }

      const leftTree = buildTree(preStart + 1, preStart + leftSize, inStart, inIndex - 1, depth + 1, 'left');
      rootNode.left = leftTree;

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
          line: 27,
          callStack: [...callStack],
          depth,
          side
        });
      }

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
          line: 27,
          callStack: [...callStack],
          depth: depth + 1,
          side: 'right'
        });
      }

      const rightTree = buildTree(preStart + leftSize + 1, preEnd, inIndex + 1, inEnd, depth + 1, 'right');
      rootNode.right = rightTree;

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
        line: 31,
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
      line: 31,
      isComplete: true,
      callStack: []
    });

    load(newHistory);
  }, [preorderInput, inorderInput, load]);

  const generateRandomArrays = () => {
    const size = Math.floor(Math.random() * 6) + 4; // 4-9 nodes
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    const balancedTree = createBalancedBST([...values].sort((a, b) => a - b));
    const preorder = generatePreorder(balancedTree);
    const inorder = generateInorder(balancedTree);

    setPreorderInput(preorder.join(','));
    setInorderInput(inorder.join(','));
    visualizer.reset();
  };

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
  } = currentState;

  const codeContent = {
    1: "TreeNode* buildTree(vector<int>& preorder,",
    2: "                  vector<int>& inorder) {",
    3: "    return build(preorder, inorder, 0,",
    4: "                   preorder.size()-1, 0,",
    5: "                   inorder.size()-1);",
    6: "}",
    7: "",
    8: "TreeNode* build(vector<int>& preorder,",
    9: "                vector<int>& inorder,",
    10: "                int preStart, int preEnd,",
    11: "                int inStart, int inEnd) {",
    12: "    if (preStart > preEnd ||",
    13: "        inStart > inEnd) return nullptr;",
    14: "",
    15: "    // Root is first element in preorder",
    16: "    int rootVal = preorder[preStart];",
    17: "    TreeNode* root = new TreeNode(rootVal);",
    18: "",
    19: "    // Find root in inorder",
    20: "    int inIndex = find(inorder, rootVal);",
    21: "    int leftSize = inIndex - inStart;",
    22: "",
    23: "    // Recursively build subtrees",
    24: "    root->left = build(preorder, inorder,",
    25: "                     preStart+1, preStart+leftSize,",
    26: "                     inStart, inIndex-1);",
    27: "    root->right = build(preorder, inorder,",
    28: "                      preStart+leftSize+1, preEnd,",
    29: "                      inIndex+1, inEnd);",
    30: "",
    31: "    return root;",
    32: "}"
  };

  const inputSection = (
    <>
      <div className="flex flex-col md:flex-row gap-4 flex-grow w-full md:w-auto">
        <div className="flex items-center gap-2 flex-grow">
          <label htmlFor="preorder-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
            Preorder:
          </label>
          <input
            id="preorder-input"
            type="text"
            value={preorderInput}
            onChange={(e) => setPreorderInput(e.target.value)}
            disabled={isLoaded}
            placeholder="e.g., 3,9,20,15,7"
            className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        <div className="flex items-center gap-2 flex-grow">
          <label htmlFor="inorder-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
            Inorder:
          </label>
          <input
            id="inorder-input"
            type="text"
            value={inorderInput}
            onChange={(e) => setInorderInput(e.target.value)}
            disabled={isLoaded}
            placeholder="e.g., 9,3,15,20,7"
            className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2">
          <button
            onClick={generateHistory}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={generateRandomArrays}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
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
          <Gauge size={16} /> Current Root
        </h4>
        <div className="font-mono text-3xl font-bold text-blue-300">
          {currentRoot || "null"}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {side} subtree
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Split size={16} /> Subtree Range
        </h4>
        <div className="font-mono text-sm text-purple-300 space-y-1">
          <div>Inorder: [{inStart}, {inEnd}]</div>
          {leftSize !== undefined && (
            <div className="text-xs text-gray-400">Left size: {leftSize}</div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={16} /> Progress
        </h4>
        <div className="font-mono text-2xl font-bold text-green-400">
          {isComplete ? "Complete!" : "Building..."}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Recursion depth: {depth}
        </div>
      </div>

      {callStack.length > 0 && (
        <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <GitBranch size={16} /> Call Stack (Depth: {depth})
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {callStack.map((call, idx) => (
              <div key={idx} className="text-xs font-mono bg-gray-800/50 p-1.5 rounded text-gray-300">
                {call.side}: pre[{call.preStart}..{call.preEnd}], in[{call.inStart}..{call.inEnd}]
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
            <p className="text-gray-400">Each node is processed once. Root lookup in inorder array takes O(1) if using a hash map.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(N)</span>
            <p className="text-gray-400">The recursion stack uses O(H) space, and storing the hash map coordinates takes O(N) space.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Construct Tree from Traversal"
      description="Build binary tree from preorder and inorder traversal sequences (LeetCode #105)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter preorder and inorder traversals to start the visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6 flex flex-col items-center">
        <TreeVisualization 
          tree={tree}
          traversalState={{
            currentNode: currentRoot,
            processingNode,
            preIndex,
            inStart,
            inEnd,
            inIndex
          }}
        />
        <ArrayVisualization
          preorder={preorder}
          inorder={inorder}
          traversalState={{
            preIndex,
            inStart,
            inEnd,
            inIndex,
            currentRoot,
            processingNode
          }}
        />
      </div>
    </VisualizerLayout>
  );
};

export default ConstructTree;