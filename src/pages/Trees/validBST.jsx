import React, { useState, useCallback } from "react";
import {
  Clock,
  GitMerge,
  Layers,
  TreeDeciduous,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const ValidateBST = () => {
  const [treeInput, setTreeInput] = useState("5,1,7,null,null,6,8");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  // Function to build a tree from LeetCode-style array
  const buildTreeFromInput = (arr) => {
    if (!arr || arr.length === 0 || arr[0] === null) return { nodes: [], edges: [] };

    const nodes = [];
    let nodeCounter = 0;

    const root = { id: nodeCounter++, data: arr[0], x: 450, y: 50, left: null, right: null };
    nodes.push(root);

    const queue = [root];
    let i = 1;
    let yPos = 150;
    let xOffset = 200;

    while (queue.length > 0 && i < arr.length) {
      let levelSize = queue.length;
      for (let j = 0; j < levelSize; j++) {
        const parent = queue.shift();

        // Left child
        if (i < arr.length && arr[i] !== null) {
          const leftChild = { id: nodeCounter++, data: arr[i], x: parent.x - xOffset, y: yPos, left: null, right: null };
          parent.left = leftChild.id;
          nodes.push(leftChild);
          queue.push(leftChild);
        }
        i++;

        // Right child
        if (i < arr.length && arr[i] !== null) {
          const rightChild = { id: nodeCounter++, data: arr[i], x: parent.x + xOffset, y: yPos, left: null, right: null };
          parent.right = rightChild.id;
          nodes.push(rightChild);
          queue.push(rightChild);
        }
        i++;
      }
      yPos += 100;
      xOffset /= 2;
    }

    const edges = [];
    nodes.forEach(node => {
      if (node.left !== null) edges.push({ from: node.id, to: node.left });
      if (node.right !== null) edges.push({ from: node.id, to: node.right });
    });

    return { nodes, edges };
  };

  const generateHistory = useCallback(() => {
    let arr;
    try {
      arr = JSON.parse(`[${treeInput}]`);
    } catch {
      alert("Invalid array format. Please use comma-separated numbers and 'null' for empty nodes.");
      return;
    }
    const { nodes, edges } = buildTreeFromInput(arr);
    if (nodes.length === 0) {
      load([{ finished: true, result: true, explanation: "An empty tree is a valid BST." }]);
      return;
    }

    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        callStack: [],
        explanation: "",
        ...props,
      });

    function isValid(nodeId, min, max, callStack) {
      const call = { nodeId, min, max, id: Math.random() };
      const newCallStack = [...callStack, call];
      const node = nodes.find(n => n.id === nodeId);

      addState({
        callStack: newCallStack,
        line: 7,
        explanation: `Recursive call on node ${node?.data ?? 'null'} with range [${min ?? "-∞"}, ${max ?? "+∞"}]`,
        highlightNode: nodeId,
        min,
        max
      });

      if (nodeId === null) {
        addState({
          callStack: newCallStack,
          line: 8,
          explanation: "Base case: Node is null, which is valid. Returning true.",
          highlightNode: null,
          min,
          max
        });
        return true;
      }

      const isMinValid = min === null || node.data > min;
      const isMaxValid = max === null || node.data < max;

      addState({
        callStack: newCallStack,
        line: 9,
        explanation: `Checking if node ${node.data} is within range [${min ?? "-∞"}, ${max ?? "+∞"}].`,
        highlightNode: nodeId,
        min,
        max
      });

      if (!isMinValid || !isMaxValid) {
        addState({
          callStack: newCallStack,
          line: 10,
          explanation: `Node ${node.data} violates the BST property. It's not in the valid range. Returning false.`,
          highlightNode: nodeId,
          validationResult: 'fail',
          min,
          max
        });
        return false;
      }

      addState({
        callStack: newCallStack,
        line: 9,
        explanation: `Node ${node.data} is valid within its range.`,
        highlightNode: nodeId,
        validationResult: 'pass',
        min,
        max
      });

      // Recurse left
      addState({
        callStack: newCallStack,
        line: 12,
        explanation: `Recursively checking left subtree with updated upper bound: [${min ?? "-∞"}, ${node.data}].`,
        highlightNode: nodeId,
        min,
        max
      });
      const leftIsValid = isValid(node.left, min, node.data, newCallStack);

      if (!leftIsValid) {
        addState({
          callStack: newCallStack,
          line: 12,
          explanation: `Left subtree of ${node.data} is invalid. Propagating false up the call stack.`,
          highlightNode: nodeId,
          min,
          max
        });
        return false;
      }

      // Recurse right
      addState({
        callStack: newCallStack,
        line: 13,
        explanation: `Left subtree was valid. Now recursively checking right subtree with updated lower bound: [${node.data}, ${max ?? "+∞"}].`,
        highlightNode: nodeId,
        min,
        max
      });
      const rightIsValid = isValid(node.right, node.data, max, newCallStack);

      if (!rightIsValid) {
        addState({
          callStack: newCallStack,
          line: 13,
          explanation: `Right subtree of ${node.data} is invalid. Propagating false up the call stack.`,
          highlightNode: nodeId,
          min,
          max
        });
        return false;
      }

      addState({
        callStack: newCallStack,
        line: 14,
        explanation: `Both left and right subtrees of ${node.data} are valid. Returning true.`,
        highlightNode: nodeId,
        min,
        max
      });

      return true;
    }

    addState({
      line: 3,
      explanation: "Starting validation from the root node.",
      highlightNode: null,
    });

    const finalResult = isValid(0, null, null, []);

    addState({
      finished: true,
      result: finalResult,
      explanation: `Validation complete. The tree is ${finalResult ? 'a valid' : 'an invalid'} Binary Search Tree.`,
      highlightNode: null,
    });

    load(newHistory);
  }, [treeInput, load]);

  const codeContent = {
    3: "bool isValidBST(TreeNode* root) {",
    4: "  return validate(root, NULL, NULL);",
    5: "}",
    6: "",
    7: "bool validate(TreeNode* node, long min, long max) {",
    8: "  if (node == NULL) return true;",
    9: "  if ((min != NULL && node->val <= min) || (max != NULL && node->val >= max)) {",
    10: "    return false;",
    11: "  }",
    12: "  return validate(node->left, min, node->val) &&",
    13: "         validate(node->right, node->val, max);",
    14: "}"
  };

  const inputSection = (
    <>
      <div className="flex items-center gap-2 flex-grow">
        <label htmlFor="tree-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          Tree Array:
        </label>
        <input
          id="tree-input"
          type="text"
          value={treeInput}
          onChange={(e) => setTreeInput(e.target.value)}
          disabled={isLoaded}
          placeholder="e.g., 5,1,7,null,null,6,8"
          className="font-mono flex-grow bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={generateHistory}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const state = currentState || {};

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center justify-center gap-2 select-none text-sm">
          <GitMerge size={16} /> Constraints
        </h3>
        <div className="font-mono text-xl font-bold text-blue-300">
          [{state.min ?? '-∞'}, {state.max ?? '+∞'}]
        </div>
      </div>

      <div className={`p-4 rounded-xl border border-gray-700/50 text-center ${state.finished ? state.result ? "bg-gradient-to-br from-green-950/40 to-green-900/40 border-green-500" : "bg-gradient-to-br from-red-950/40 to-red-900/40 border-red-500" : "bg-gray-800/40"}`}>
        <h3 className="font-semibold text-gray-300 mb-2 flex items-center justify-center gap-2 select-none text-sm">
          <CheckCircle size={16} /> Final Result
        </h3>
        <div className={`font-mono text-xl font-bold ${state.finished ? state.result ? "text-green-400" : "text-red-400" : "text-gray-400"}`}>
          {state.finished ? (state.result ? "Valid BST" : "Invalid BST") : "Processing..."}
        </div>
      </div>

      {state.callStack?.length > 0 && (
        <div className="sm:col-span-2 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2 select-none">
            <Layers size={16} /> Recursion Call Stack
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {state.callStack.map((call) => (
              <div key={call.id} className="text-xs font-mono bg-gray-850 p-1.5 rounded text-gray-300">
                validate(node: {state.nodes?.find(n => n.id === call.nodeId)?.data ?? 'null'}, min: {call.min ?? '-∞'}, max: {call.max ?? '+∞'})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sm:col-span-2 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 select-none">
          <Clock size={16} /> Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity: O(N)</span>
            <p className="text-gray-400">Visits every node exactly once.</p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity: O(H)</span>
            <p className="text-gray-400">Depends on recursion depth. O(N) worst case, O(log N) average.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Validate Binary Search Tree"
      description="Determine if a given binary tree is a valid Binary Search Tree (BST)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={state.line}
      message={state.explanation || "Enter tree array to begin visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      {state.nodes && (
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px]">
          <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2"><TreeDeciduous size={24} /> Binary Tree Visualization</h3>
          <div className="relative bg-gray-900/30 rounded-xl" style={{ width: "100%", height: "450px", overflow: "auto" }}>
            <svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
              <defs>
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              {state.edges?.map((edge, i) => {
                const fromNode = state.nodes.find((n) => n.id === edge.from);
                const toNode = state.nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                return (<line key={i} x1={fromNode.x} y1={fromNode.y + 28} x2={toNode.x} y2={toNode.y - 28} stroke="url(#edge-gradient)" strokeWidth="3" className="drop-shadow-lg" />);
              })}
            </svg>
            <div className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
              {state.nodes?.map((node) => {
                const isHighlighted = state.highlightNode === node.id;
                let validationClass = '';
                if (isHighlighted && state.validationResult) {
                  validationClass = state.validationResult === 'pass' ? 'shadow-green-500/70 border-green-400' : 'shadow-red-500/70 border-red-400';
                }
                return (
                  <div key={node.id} style={{ left: `${node.x - 32}px`, top: `${node.y - 32}px` }} className="absolute transition-all duration-500">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full font-mono text-xl font-bold text-white border-4 transition-all duration-300 shadow-2xl ${isHighlighted ? `bg-gradient-to-br from-teal-400 to-cyan-500 scale-110 ${validationClass}` : "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500"}`}>
                      {node.data}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default ValidateBST;
