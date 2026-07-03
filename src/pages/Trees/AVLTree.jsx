import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Zap,
  Cpu,
  GitBranch,
  Scale,
  Target,
  Gauge,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

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
      const isRotationTarget = avlState?.currentNode === node.val;

      edges.push(
        <line
          key={`edge-${node.val}`}
          x1={parentX}
          y1={parentY + 20}
          x2={x}
          y2={y - 20}
          stroke={isRotationTarget ? "#f59e0b" : "#4b5563"}
          strokeWidth={isRotationTarget ? 3 : 2}
          strokeDasharray={isRotationTarget ? "4,4" : "none"}
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
        className="border border-gray-800 rounded-2xl bg-gray-950/40 backdrop-blur-sm"
      >
        {/* Render edges first */}
        {tree && renderEdges(tree)}
        
        {/* Render nodes on top */}
        {nodes.map((nodeData, index) => (
          <Tree key={`node-${index}`} {...nodeData} />
        ))}
        
        {!tree && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-500 font-mono text-sm"
          >
            Empty Tree
          </text>
        )}
      </svg>
    </div>
  );
};

// Array Visualization Component
const ArrayVisualization = ({ inorder, avlState }) => {
  const { start, end, pivotIndex } = avlState;

  return (
    <div className="w-full bg-gray-900/40 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
      <h4 className="text-gray-400 text-xs font-mono mb-3 uppercase tracking-wider select-none text-center">
        Inorder array (Sorted)
      </h4>
      <div className="flex justify-center items-center gap-1.5 overflow-x-auto py-2">
        {inorder.map((val, idx) => {
          const isPivot = idx === pivotIndex;
          const isSelected = idx >= start && idx <= end;
          
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 flex items-center justify-center font-mono font-bold rounded-lg border text-sm transition-all duration-300 ${
                  isPivot
                    ? "bg-purple-500/30 border-purple-400 text-purple-300 scale-110 shadow-lg shadow-purple-500/25"
                    : isSelected
                    ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                    : "bg-gray-800/40 border-gray-700/50 text-gray-500"
                }`}
              >
                {val}
              </div>
              <span className="text-[10px] text-gray-600 font-mono">
                {idx}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Rotation Animation Component (Simulated)
const RotationVisualization = ({ rotationState }) => {
  const { type, node, balanceFactor, case: rotationCase } = rotationState;

  return (
    <div className="w-full bg-gradient-to-r from-red-900/20 via-yellow-900/10 to-red-900/20 p-4 rounded-xl border border-red-900/30 text-center animate-pulse">
      <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
        <span className="font-bold text-sm uppercase tracking-wide">
          ⚠️ Unbalanced detected at node {node} (BF: {balanceFactor})
        </span>
      </div>
      <p className="text-xs text-gray-300">
        Triggering <span className="font-mono text-yellow-300 font-bold">{rotationCase}</span>. Performing a <span className="font-bold text-purple-300 capitalize">{type}</span> rotation.
      </p>
    </div>
  );
};

// Main Component
const AVLTree = () => {
  const [treeInput, setTreeInput] = useState("1,2,3,4,5,6,7");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState, currentStep, history } = visualizer;

  // Generate history for AVL tree construction
  const generateHistory = useCallback(() => {
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
          line: 10,
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
        line: 13,
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
          line: 15,
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
          line: 17,
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
          line: 17,
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
        line: 23,
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
          line: 26,
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
          line: 39,
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
      line: 39,
      isComplete: true,
      phase: "complete",
      balanceFactors: { [root.val]: getBalance(root) }
    });

    load(newHistory);
  }, [treeInput, load]);

  const generateRandomTree = () => {
    const size = Math.floor(Math.random() * 8) + 5; // 5-12 nodes
    const values = Array.from({ length: size }, (_, i) => i + 1);
    
    // Shuffle array to create unbalanced tree
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    setTreeInput(values.join(','));
    visualizer.reset();
  };

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
  } = currentState;

  const codeContent = {
    1: "TreeNode* balanceBST(TreeNode* root) {",
    2: "    vector<int> inorder;",
    3: "    inOrderTraversal(root, inorder);",
    4: "    return buildBalancedBST(inorder, 0,",
    5: "                            inorder.size()-1);",
    6: "}",
    7: "",
    8: "TreeNode* buildBalancedBST(vector<int>& arr,",
    9: "                          int start, int end) {",
    10: "    if (start > end) return nullptr;",
    11: "",
    12: "    int mid = start + (end - start) / 2;",
    13: "    TreeNode* root = new TreeNode(arr[mid]);",
    14: "",
    15: "    root->left = buildBalancedBST(arr,",
    16: "                               start, mid-1);",
    17: "    root->right = buildBalancedBST(arr,",
    18: "                                mid+1, end);",
    19: "",
    20: "    root->height = 1 + max(height(root->left),",
    21: "                           height(root->right));",
    22: "",
    23: "    int balance = getBalance(root);",
    24: "",
    25: "    // AVL Rotations if needed",
    26: "    if (balance > 1) {",
    27: "        if (getBalance(root->left) >= 0)",
    28: "            return rightRotate(root);  // LL",
    29: "        else",
    30: "            return leftRightRotate(root);// LR",
    31: "    }",
    32: "    if (balance < -1) {",
    33: "        if (getBalance(root->right) <= 0)",
    34: "            return leftRotate(root);   // RR",
    35: "        else",
    36: "            return rightLeftRotate(root);// RL",
    37: "    }",
    38: "",
    39: "    return root;",
    40: "}"
  };

  const inputSection = (
    <>
      <div className="flex items-center gap-2 flex-grow">
        <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          Tree Values:
        </label>
        <input
          id="tree-input"
          type="text"
          value={treeInput}
          onChange={(e) => setTreeInput(e.target.value)}
          disabled={isLoaded}
          placeholder="e.g., 1,2,3,4,5,6,7"
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
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg cursor-pointer"
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
          <Gauge size={16} /> Current Phase
        </h4>
        <div className="text-2xl font-mono font-bold text-blue-300 capitalize">
          {phase}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {side} subtree • Depth: {depth}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Target size={16} /> Current Root
        </h4>
        <div className="font-mono text-2xl font-bold text-center text-purple-400">
          {currentRoot || "null"}
        </div>
        {balanceFactors[currentRoot] !== undefined && (
          <div className="text-xs text-gray-400 mt-1">
            Balance: {balanceFactors[currentRoot]}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={16} /> Progress
        </h4>
        <div className="font-mono text-2xl font-bold text-center text-green-400">
          {isComplete ? "Complete!" : "Building..."}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {history.length > 0 ? Math.round((currentStep / history.length) * 100) : 0}% Complete
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
                {call.side}: [{call.start}, {call.end}]
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
            <p className="text-gray-400">Inorder traversal is O(N), building balanced BST is also O(N).</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(N)</span>
            <p className="text-gray-400">The inorder array takes O(N) space; recursion stack uses O(log N) space.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Balance BST (AVL Tree)"
      description="Convert any Binary Search Tree to a balanced AVL Tree (LeetCode #1382)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter tree values to visualize AVL tree balancing"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6 flex flex-col items-center">
        {rotationState && <RotationVisualization rotationState={rotationState} />}
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
      </div>
    </VisualizerLayout>
  );
};

export default AVLTree;