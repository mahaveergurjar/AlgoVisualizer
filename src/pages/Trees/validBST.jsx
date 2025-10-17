import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Clock,
  GitMerge,
  Layers,
  TreeDeciduous,
  Check,
  X,
} from "lucide-react";

// ====================================================================================
// Main Visualizer Component
// ====================================================================================
const ValidateBST = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [treeInput, setTreeInput] = useState("5,1,7,null,null,6,8");
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to build a tree from LeetCode-style array
  const buildTreeFromInput = (arr) => {
    if (!arr || arr.length === 0 || arr[0] === null) return { nodes: [], edges: [] };

    const nodes = [];
    let nodeCounter = 0;

    const root = { id: nodeCounter++, data: arr[0], x: 450, y: 50, left: null, right: null };
    nodes.push(root);

    const queue = [root];
    let i = 1;
    let currentLevel = [root];
    let yPos = 150;
    let xOffset = 200;

    while (queue.length > 0 && i < arr.length) {
        let levelSize = queue.length;
        let newLevel = [];
        for(let j = 0; j < levelSize; j++) {
            const parent = queue.shift();
            
            // Left child
            if (i < arr.length && arr[i] !== null) {
                const leftChild = { id: nodeCounter++, data: arr[i], x: parent.x - xOffset, y: yPos, left: null, right: null };
                parent.left = leftChild.id;
                nodes.push(leftChild);
                queue.push(leftChild);
                newLevel.push(leftChild);
            }
            i++;

            // Right child
            if (i < arr.length && arr[i] !== null) {
                const rightChild = { id: nodeCounter++, data: arr[i], x: parent.x + xOffset, y: yPos, left: null, right: null };
                parent.right = rightChild.id;
                nodes.push(rightChild);
                queue.push(rightChild);
                newLevel.push(rightChild);
            }
            i++;
        }
        currentLevel = newLevel;
        yPos += 100;
        xOffset /= 2;
    }

    const edges = [];
    nodes.forEach(node => {
        if(node.left !== null) edges.push({from: node.id, to: node.left});
        if(node.right !== null) edges.push({from: node.id, to: node.right});
    });
    
    return { nodes, edges };
  };


  const generateHistory = useCallback((nodes, edges) => {
    if(nodes.length === 0) {
      setHistory([{ finished: true, result: true, explanation: "An empty tree is a valid BST." }]);
      setCurrentStep(0);
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
        line: 4,
        explanation: `Recursive call on node ${node?.data ?? 'null'} with range [${min ?? "-∞"}, ${max ?? "+∞"}]`,
        highlightNode: nodeId,
        min, max
      });

      if (nodeId === null) {
        addState({
          callStack: newCallStack,
          line: 5,
          explanation: "Base case: Node is null, which is valid. Returning true.",
          highlightNode: null,
          min, max
        });
        return true;
      }
      
      const isMinValid = min === null || node.data > min;
      const isMaxValid = max === null || node.data < max;

      addState({
        callStack: newCallStack,
        line: 8,
        explanation: `Checking if node ${node.data} is within range [${min ?? "-∞"}, ${max ?? "+∞"}].`,
        highlightNode: nodeId,
        min, max
      });

      if (!isMinValid || !isMaxValid) {
        addState({
          callStack: newCallStack,
          line: 9,
          explanation: `Node ${node.data} violates the BST property. It's not in the valid range. Returning false.`,
          highlightNode: nodeId,
          validationResult: 'fail',
          min, max
        });
        return false;
      }

      addState({
        callStack: newCallStack,
        line: 8,
        explanation: `Node ${node.data} is valid within its range.`,
        highlightNode: nodeId,
        validationResult: 'pass',
        min, max
      });

      // Recurse left
      addState({
        callStack: newCallStack,
        line: 11,
        explanation: `Recursively checking left subtree with updated upper bound: [${min ?? "-∞"}, ${node.data}].`,
        highlightNode: nodeId,
        min, max
      });
      const leftIsValid = isValid(node.left, min, node.data, newCallStack);

      if (!leftIsValid) {
        addState({
          callStack: newCallStack,
          line: 11,
          explanation: `Left subtree of ${node.data} is invalid. Propagating false up the call stack.`,
          highlightNode: nodeId,
          min, max
        });
        return false;
      }

      // Recurse right
      addState({
        callStack: newCallStack,
        line: 12,
        explanation: `Left subtree was valid. Now recursively checking right subtree with updated lower bound: [${node.data}, ${max ?? "+∞"}].`,
        highlightNode: nodeId,
        min, max
      });
      const rightIsValid = isValid(node.right, node.data, max, newCallStack);

      if(!rightIsValid) {
         addState({
          callStack: newCallStack,
          line: 12,
          explanation: `Right subtree of ${node.data} is invalid. Propagating false up the call stack.`,
          highlightNode: nodeId,
          min, max
        });
        return false;
      }

       addState({
          callStack: newCallStack,
          line: 14,
          explanation: `Both left and right subtrees of ${node.data} are valid. Returning true.`,
          highlightNode: nodeId,
          min, max
        });

      return true;
    }

    addState({
      line: 0,
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

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadTree = () => {
    try {
        const arr = JSON.parse(`[${treeInput}]`);
        const { nodes, edges } = buildTreeFromInput(arr);
        setIsLoaded(true);
        generateHistory(nodes, edges);
    } catch(e) {
        alert("Invalid array format. Please use comma-separated numbers and 'null' for empty nodes.");
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};

  const code = [
    { l: 3, c: [{ t: "bool", c: "cyan" }, {t: " isValidBST(TreeNode* root) {", c: ""}] },
    { l: 4, c: [{ t: "  return", c: "purple" }, {t: " validate(root, NULL, NULL);", c: ""}] },
    { l: 5, c: [{ t: "}", c: "light-gray"}] },
    { l: 7, c: [{ t: "bool", c: "cyan" }, {t: " validate(TreeNode* node, long min, long max) {", c: ""}]},
    { l: 8, c: [{ t: "  if", c: "purple" }, {t: " (node == NULL) ", c: ""}, {t: "return", c: "purple"}, {t: " true;", c: ""}]},
    { l: 9, c: [{ t: "  if", c: "purple" }, {t: " ((min != NULL && node->val <= min) || (max != NULL && node->val >= max)) {", c: ""}]},
    { l: 10, c: [{ t: "    return", c: "purple" }, {t: " false;", c: ""}]},
    { l: 11, c: [{ t: "  }", c: "light-gray"}]},
    { l: 12, c: [{ t: "  return", c: "purple" }, {t: " validate(node->left, min, node->val) &&", c: ""}]},
    { l: 13, c: [{ t: "         validate(node->right, node->val, max);", c: ""}]},
    { l: 14, c: [{ t: "}", c: "light-gray"}]},
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
          Validate Binary Search Tree
        </h1>
        <p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 98</p>
      </header>
      
      {/* Controls */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
                <label className="font-mono text-sm text-gray-300 whitespace-nowrap">Tree Array:</label>
                <input type="text" value={treeInput} onChange={(e) => setTreeInput(e.target.value)} disabled={isLoaded} className="font-mono flex-grow bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-teal-500 focus:outline-none transition-colors text-white" placeholder="e.g., 5,1,4,null,null,3,6" />
            </div>
            <div className="flex items-center gap-3">
                {!isLoaded ? (<button onClick={loadTree} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Load & Visualize</button>) : (<>
                    <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
                    <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
                    <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                </>)}
                <button onClick={reset} className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Reset</button>
            </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
                <h3 className="font-bold text-2xl text-teal-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2"><Code size={22} /> C++ Solution</h3>
                <pre className="text-sm overflow-auto"><code className="font-mono leading-relaxed">{code.map((l) => <CodeLine key={l.l} line={l.l} content={l.c} colorMapping={colorMapping} activeLine={state.line} />)}</code></pre>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
                <h4 className="font-mono text-sm text-cyan-300 mb-3 flex items-center gap-2"><Layers size={18} /> Recursion Call Stack</h4>
                <div className="flex flex-col-reverse gap-2 max-h-48 overflow-y-auto">
                    {state.callStack?.length > 0 ? (state.callStack.map((call, index) => (
                        <div key={call.id} className={`p-3 rounded-lg border-2 text-xs transition-all ${index === state.callStack.length - 1 ? "bg-teal-500/30 border-teal-400" : "bg-gray-700/50 border-gray-600"}`}>
                            <p className="font-bold text-teal-300">validate(node: {state.nodes.find(n=>n.id===call.nodeId)?.data ?? 'null'}, min: {call.min ?? '-∞'}, max: {call.max ?? '+∞'})</p>
                        </div>
                    ))) : (<span className="text-gray-500 italic text-sm">No active calls</span>)}
                </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
             <div className="relative bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px]">
                <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2"><TreeDeciduous size={24} /> Binary Tree Visualization</h3>
                <div className="relative bg-gray-900/30 rounded-xl" style={{ width: "100%", height: "450px", overflow: "auto" }}>
                    <svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                        <defs><linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2dd4bf" /><stop offset="100%" stopColor="#14b8a6" /></linearGradient></defs>
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
                                    <div className={`w-16 h-16 flex items-center justify-center rounded-full font-mono text-xl font-bold text-white border-4 transition-all duration-300 shadow-2xl ${isHighlighted ? `bg-gradient-to-br from-teal-400 to-cyan-500 scale-110 ${validationClass}` : "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500"}`}>{node.data}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                 <h3 className="font-mono text-base text-cyan-300 mb-3 flex items-center gap-2"><GitMerge size={18} /> Current Node's Constraints</h3>
                 <div className="text-center font-mono text-2xl bg-gray-900/50 p-4 rounded-lg">
                    <span className="text-gray-400">Range: [ </span>
                    <span className="font-bold text-amber-400">{state.min ?? '-∞'}</span>
                    <span className="text-gray-400">, </span>
                    <span className="font-bold text-amber-400">{state.max ?? '+∞'}</span>
                    <span className="text-gray-400"> ]</span>
                 </div>
            </div>
            
            <div className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${state.finished ? state.result ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500" : "bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-500" : "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700"}`}>
                <h3 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${state.finished ? state.result ? "text-green-300" : "text-red-300" : "text-gray-400"}`}><CheckCircle size={18} /> Final Result</h3>
                <p className={`font-mono text-4xl font-bold ${state.finished ? state.result ? "text-green-400" : "text-red-400" : "text-gray-400"}`}>{state.finished ? (state.result ? <span className="flex items-center gap-3"><Check/> Valid BST</span> : <span className="flex items-center gap-3"><X/> Invalid BST</span>) : "Processing..."}</p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
                <h3 className="text-gray-400 text-sm font-semibold mb-2">Step Explanation</h3>
                <p className="text-gray-200 text-base leading-relaxed">{state.explanation || 'Click "Load & Visualize" to begin'}</p>
            </div>
            
             <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
                <h3 className="font-bold text-2xl text-teal-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2"><Clock size={24} /> Complexity Analysis</h3>
                <div className="space-y-5 text-base">
                    <div className="bg-gray-900/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-teal-300 text-lg mb-2">Time Complexity: <span className="font-mono text-cyan-300">O(N)</span></h4>
                        <p className="text-gray-300">The algorithm must visit every node in the tree exactly once to validate its properties, resulting in a time complexity that is linear to the number of nodes (N).</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-xl">
                        <h4 className="font-semibold text-teal-300 text-lg mb-2">Space Complexity: <span className="font-mono text-cyan-300">O(H)</span></h4>
                        <p className="text-gray-300">The space complexity is determined by the depth of the recursion call stack. In the worst case (a skewed tree), this can be O(N). For a balanced tree, it is O(log N). H represents the height of the tree.</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
            <TreeDeciduous size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-xl">Load a tree array to begin visualization.</p>
        </div>
      )}
    </div>
  );
};

export default ValidateBST;
