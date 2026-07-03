import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Clock,
  Zap,
  Cpu,
  Target,
  Layers,
  GitMerge,
  Eye,
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
    <div className="w-full flex flex-col items-center">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-800 rounded-xl bg-gray-950/40 backdrop-blur-sm"
      >
        {/* Render edges first */}
        {tree && renderEdges(tree)}

        {/* Render nodes on top */}
        {nodes.map((nodeData, index) => (
          <TreeNode key={`node-${index}`} {...nodeData} />
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

// Main Component
const BinaryTreeRightSideView = () => {
  const [treeInput, setTreeInput] = useState("1,2,3,null,5,null,4");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  // Build tree from level order input
  const buildTreeFromLevelOrder = (values) => {
    if (values.length === 0 || values[0] === null) return null;

    const nodes = values.map((val) =>
      val === null ? null : new BinaryTreeNode(val)
    );

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] !== null) {
        const leftIndex = 2 * i + 1;
        const rightIndex = 2 * i + 2;

        if (leftIndex < nodes.length) {
          nodes[i].left = nodes[leftIndex];
        }
        if (rightIndex < nodes.length) {
          nodes[i].right = nodes[rightIndex];
        }
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
      alert("Tree input is empty. Please enter values.");
      return;
    }

    const root = buildTreeFromLevelOrder([...values]);
    
    if (!root) {
      alert("Invalid tree input. Please provide valid comma-separated values.");
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
      line: 3,
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
        line: 2,
        queue: [],
        currentLevelNodes: [],
        rightSideViewNodes: [],
        processingNode: null,
        isComplete: true,
      });
      load(newHistory);
      return;
    }
    
    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevelNodesForVis = queue.map(n => n.val);

      newHistory.push({
        step: stepCount++,
        explanation: `Starting new level. Level size: ${levelSize}.`,
        tree: root,
        line: 6,
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
          line: 8,
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
          line: 9,
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
            line: 10,
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
            line: 11,
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
            line: 12,
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
        line: 5,
        queue: queue.map(n => n.val),
        currentLevelNodes: [],
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
      line: 13,
      queue: [],
      currentLevelNodes: [],
      rightSideViewNodes: [...result],
      processingNode: null,
      isComplete: true,
    });

    load(newHistory);
  }, [treeInput, load]);

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
    visualizer.reset();
  };

  const {
    tree = null,
    explanation = "Load a tree to begin visualization.",
    line,
    processingNode,
    queue = [],
    currentLevelNodes = [],
    rightSideViewNodes = [],
    isComplete = false
  } = currentState;

  const codeContent = {
    1: "vector<int> rightSideView(TreeNode* root) {",
    2: "    if (!root) return {};",
    3: "    queue<TreeNode*> q;",
    4: "    q.push(root);",
    5: "    vector<int> result;",
    6: "    while (!q.empty()) {",
    7: "        int levelSize = q.size();",
    8: "        for (int i = 0; i < levelSize; i++) {",
    9: "            TreeNode* curr = q.front(); q.pop();",
    10: "            if (i == levelSize - 1) result.push_back(curr->val);",
    11: "            if (curr->left) q.push(curr->left);",
    12: "            if (curr->right) q.push(curr->right);",
    13: "        }",
    14: "    }",
    15: "    return result;",
    16: "}"
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
          placeholder="e.g., 1,2,3,null,5,null,4"
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
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center justify-center gap-2 select-none">
          <Layers size={20} /> Queue Size
        </h4>
        <div className="font-mono text-3xl font-bold text-purple-300">
          {queue.length}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h4 className="font-semibold text-green-300 mb-2 flex items-center justify-center gap-2 select-none">
          <CheckCircle size={20} /> Progress
        </h4>
        <div className="font-mono text-2xl font-bold text-green-400">
          {isComplete ? "Complete!" : "Traversing..."}
        </div>
      </div>

      <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 select-none">
          <List className="w-4 h-4 text-purple-400" /> Current Queue
        </h4>
        {queue.length === 0 ? (
          <span className="text-gray-500 italic text-sm">Queue is empty</span>
        ) : (
          <div className="flex gap-2 overflow-x-auto py-1">
            {queue.map((nodeVal, idx) => (
              <div key={idx} className="bg-purple-500/20 border border-purple-500/40 rounded-lg px-3 py-1 text-sm font-mono text-purple-300 font-bold">
                {nodeVal}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sm:col-span-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 select-none">
          <Eye className="w-4 h-4 text-red-400" /> Right Side View Result
        </h4>
        {rightSideViewNodes.length === 0 ? (
          <span className="text-gray-500 italic text-sm">No nodes added yet</span>
        ) : (
          <div className="flex gap-2 overflow-x-auto py-1">
            {rightSideViewNodes.map((nodeVal, idx) => (
              <div key={idx} className="bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-1 text-sm font-mono text-red-300 font-bold">
                {nodeVal}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 select-none">
          <Clock size={16} /> Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Time Complexity: O(N)</span>
            <p className="text-gray-400">We visit every node in the tree exactly once using level-order traversal (BFS).</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-mono font-bold block mb-1">Space Complexity: O(W)</span>
            <p className="text-gray-400">W is the maximum width of the tree, which is the maximum queue size (O(N) in the worst case).</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Binary Tree Right Side View"
      description="Find nodes visible from the right side, top to bottom (LeetCode #199)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <TreeVisualization
        tree={tree}
        traversalState={{
          processingNode,
          rightSideViewNodes,
          currentLevelNodes,
        }}
      />
    </VisualizerLayout>
  );
};

export default BinaryTreeRightSideView;
