import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  GitMerge,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Code,
  Layers,
  TreeDeciduous,
  Check,
  X,
  CheckCircle,
  LocateFixed,
} from "lucide-react";


// ====================================================================================
// SHARED HELPER COMPONENT
// ====================================================================================
const CodeLine = ({ line, content, colorMapping, activeLine }) => (
    <div className={`block rounded-md transition-colors px-2 py-1 ${ activeLine === line ? "bg-emerald-500/20 border-l-4 border-emerald-400" : "" }`}>
        <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">{line}</span>
        {content.map((token, index) => (<span key={index} className={colorMapping[token.c]}>{token.t}</span>))}
    </div>
);


// ====================================================================================
// VISUALIZER COMPONENTS
// ====================================================================================

// --- Placeholder for ConstructBinaryTree ---
const ConstructBinaryTree = ({ navigate }) => (
    <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-emerald-400 mt-8">Construct Tree from Traversal</h1>
        <p className="text-lg text-gray-400 mt-4">Visualizer for LeetCode 105 goes here.</p>
    </div>
);

// --- Placeholder for ValidateBST ---
const ValidateBST = ({ navigate }) => (
     <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-teal-400 mt-8">Validate Binary Search Tree</h1>
        <p className="text-lg text-gray-400 mt-4">Visualizer for LeetCode 98 goes here.</p>
    </div>
);

// --- Placeholder for LCAofDeepestLeaves ---
const LCAofDeepestLeaves = ({ navigate }) => (
    <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mt-8">LCA of Deepest Leaves</h1>
        <p className="text-lg text-gray-400 mt-4">Visualizer for LeetCode 1123 goes here.</p>
    </div>
);

// --- Placeholder for AVLTree ---
const AVLTree = ({ navigate }) => (
    <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-purple-400 mt-8">AVL Tree Visualizer</h1>
        <p className="text-lg text-gray-400 mt-4">Visualizer for LeetCode 110 goes here.</p>
    </div>
);

// --- VISUALIZER COMPONENT: LCAofBinaryTree (Your New Component) ---
const LCAofBinaryTree = ({ navigate }) => {
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [treeInput, setTreeInput] = useState("3,5,1,6,2,0,8,null,null,7,4");
    const [pInput, setPInput] = useState("5");
    const [qInput, setQInput] = useState("4");
    const [isLoaded, setIsLoaded] = useState(false);

    const buildTreeFromInput = (arr) => {
        if (!arr || arr.length === 0 || arr[0] === null) return { nodes: [], edges: [] };
        const nodes = []; let nodeCounter = 0;
        const root = { id: nodeCounter++, data: arr[0], x: 450, y: 50, left: null, right: null };
        nodes.push(root);
        const queue = [root]; let i = 1; let yPos = 150; let xOffset = 200;
        while (queue.length > 0 && i < arr.length) {
            let levelSize = queue.length;
            for(let j = 0; j < levelSize; j++) {
                const parent = queue.shift();
                if (i < arr.length && arr[i] !== null) {
                    const leftChild = { id: nodeCounter++, data: arr[i], x: parent.x - xOffset, y: yPos, left: null, right: null };
                    parent.left = leftChild.id; nodes.push(leftChild); queue.push(leftChild);
                } i++;
                if (i < arr.length && arr[i] !== null) {
                    const rightChild = { id: nodeCounter++, data: arr[i], x: parent.x + xOffset, y: yPos, left: null, right: null };
                    parent.right = rightChild.id; nodes.push(rightChild); queue.push(rightChild);
                } i++;
            }
            yPos += 100; xOffset /= 2;
        }
        const edges = [];
        nodes.forEach(node => { if(node.left !== null) edges.push({from: node.id, to: node.left}); if(node.right !== null) edges.push({from: node.id, to: node.right}); });
        return { nodes, edges };
    };

    const generateHistory = useCallback((nodes, edges, p, q) => {
        const newHistory = [];
        const addState = (props) => newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), callStack: [], explanation: "", ...props });
        function findLCA(nodeId, callStack) {
            const node = nodes.find(n => n.id === nodeId);
            const call = { nodeId, id: Math.random() };
            const newCallStack = [...callStack, call];
            addState({ callStack: newCallStack, line: 4, explanation: `Recursive call on node ${node?.data ?? 'null'}.`, highlightNode: nodeId, p, q });
            if (nodeId === null) {
                addState({ callStack: newCallStack, line: 5, explanation: "Base case: Node is null. Returning null.", highlightNode: null, p, q });
                return null;
            }
            if (node.data === p || node.data === q) {
                addState({ callStack: newCallStack, line: 8, explanation: `Base case: Found one of the target nodes (${node.data}). Returning this node.`, highlightNode: nodeId, p, q });
                return nodeId;
            }
            addState({ callStack: newCallStack, line: 11, explanation: `Recursively searching in the left subtree of node ${node.data}.`, highlightNode: nodeId, p, q });
            const leftLCA = findLCA(node.left, newCallStack);
            addState({ callStack: newCallStack, line: 12, explanation: `Left subtree returned ${nodes.find(n=>n.id===leftLCA)?.data ?? 'null'}. Now searching in the right subtree.`, highlightNode: nodeId, p, q, leftResult: leftLCA });
            const rightLCA = findLCA(node.right, newCallStack);
            addState({ callStack: newCallStack, line: 14, explanation: `Right subtree returned ${nodes.find(n=>n.id===rightLCA)?.data ?? 'null'}. Analyzing results for node ${node.data}.`, highlightNode: nodeId, p, q, leftResult: leftLCA, rightResult: rightLCA });
            if (leftLCA !== null && rightLCA !== null) {
                addState({ callStack: newCallStack, line: 15, explanation: `Both left and right subtrees returned non-null. This means node ${node.data} is the LCA! Returning it.`, highlightNode: nodeId, lcaNode: nodeId, p, q });
                return nodeId;
            }
            const result = leftLCA !== null ? leftLCA : rightLCA;
            const currentState = newHistory[newHistory.length -1] || {};
            addState({ callStack: newCallStack, line: 18, explanation: `One subtree returned null, the other returned ${nodes.find(n=>n.id===result)?.data ?? 'null'}. Propagating this result up.`, highlightNode: nodeId, lcaNode: currentState.lcaNode, p, q });
            return result;
        }
        addState({ line: 0, explanation: "Starting search for Lowest Common Ancestor.", p, q });
        const finalLCA = findLCA(0, []);
        addState({ finished: true, lcaNode: finalLCA, explanation: `Algorithm complete. The Lowest Common Ancestor is node ${nodes.find(n=>n.id===finalLCA)?.data}.`, highlightNode: finalLCA, p, q });
        setHistory(newHistory);
        setCurrentStep(0);
    }, []);

    const loadTree = () => {
        try { const arr = JSON.parse(`[${treeInput}]`); const pNum = parseInt(pInput, 10); const qNum = parseInt(qInput, 10);
            if (isNaN(pNum) || isNaN(qNum)) { alert("Please enter valid numbers for p and q."); return; }
            const { nodes, edges } = buildTreeFromInput(arr); setIsLoaded(true); generateHistory(nodes, edges, pNum, qNum);
        } catch (e) { alert("Invalid array format. Please use comma-separated numbers and 'null'."); }
    };

    const reset = () => { setIsLoaded(false); setHistory([]); setCurrentStep(-1); };
    const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
    const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
    useEffect(() => {
        const handleKeyDown = (e) => { if (isLoaded) { if (e.key === "ArrowLeft") stepBackward(); if (e.key === "ArrowRight") stepForward(); } };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepForward, stepBackward]);

    const state = history[currentStep] || {};
    const code = [ { l: 3, c: [{t: "TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {"}]}, { l: 4, c: [{t: "  if (root == NULL) return NULL;"}] }, { l: 7, c: [{t: "  if (root == p || root == q) {"}] }, { l: 8, c: [{t: "    return root;"}] }, { l: 9, c: [{t: "  }"}] }, { l: 11, c: [{t: "  TreeNode* left = lowestCommonAncestor(root->left, p, q);"}] }, { l: 12, c: [{t: "  TreeNode* right = lowestCommonAncestor(root->right, p, q);"}] }, { l: 14, c: [{t: "  if (left != NULL && right != NULL) {"}] }, { l: 15, c: [{t: "    return root;"}] }, { l: 16, c: [{t: "  }"}] }, { l: 18, c: [{t: "  return left != NULL ? left : right;"}] }, { l: 19, c: [{t: "}"}] } ];
    const colorMapping = { purple: "text-purple-400", cyan: "text-cyan-400", "": "text-gray-200" };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-8"><h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Lowest Common Ancestor of a Binary Tree</h1><p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 236</p></header>
            <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6"><div className="flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full"><div className="flex items-center gap-3 w-full"><label className="font-mono text-sm text-gray-300 whitespace-nowrap">Tree Array:</label><input type="text" value={treeInput} onChange={(e) => setTreeInput(e.target.value)} disabled={isLoaded} className="font-mono flex-grow bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-purple-500 focus:outline-none" /></div><div className="flex items-center gap-3"><label className="font-mono text-sm text-gray-300">p:</label><input type="text" value={pInput} onChange={(e) => setPInput(e.target.value)} disabled={isLoaded} className="font-mono w-16 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-purple-500 focus:outline-none" /></div><div className="flex items-center gap-3"><label className="font-mono text-sm text-gray-300">q:</label><input type="text" value={qInput} onChange={(e) => setQInput(e.target.value)} disabled={isLoaded} className="font-mono w-16 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-purple-500 focus:outline-none" /></div></div><div className="flex items-center gap-3">{!isLoaded ? (<button onClick={loadTree} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Load & Visualize</button>) : (<><button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 p-3 rounded-lg disabled:opacity-30"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button><span className="font-mono text-lg w-28 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span><button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 p-3 rounded-lg disabled:opacity-30"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button></>)}<button onClick={reset} className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg">Reset</button></div></div></div>
            {isLoaded ? (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-1 space-y-6"><div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700"><h3 className="font-bold text-2xl text-purple-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2"><Code size={22} /> C++ Solution</h3><pre className="text-sm"><code className="font-mono leading-relaxed">{code.map((l) => <CodeLine key={l.l} line={l.l} content={l.c} colorMapping={colorMapping} activeLine={state.line} />)}</code></pre></div><div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600"><h4 className="font-mono text-sm text-cyan-300 mb-3 flex items-center gap-2"><Layers size={18} /> Recursion Call Stack</h4><div className="flex flex-col-reverse gap-2 max-h-48 overflow-y-auto">{state.callStack?.length > 0 ? (state.callStack.map((call, index) => (<div key={call.id} className={`p-3 rounded-lg border-2 text-xs ${index === state.callStack.length - 1 ? "bg-purple-500/30 border-purple-400" : "bg-gray-700/50 border-gray-600"}`}><p className="font-bold text-purple-300">findLCA(node: {state.nodes.find(n=>n.id===call.nodeId)?.data ?? 'null'})</p></div>))) : (<span className="text-gray-500 italic text-sm">No active calls</span>)}</div></div></div><div className="lg:col-span-2 space-y-6"><div className="relative bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px]"><h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2"><TreeDeciduous size={24} /> Binary Tree Visualization</h3><div className="relative bg-gray-900/30 rounded-xl" style={{ width: "100%", height: "450px", overflow: "auto" }}><svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}><defs><linearGradient id="edge-gradient"><stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>{state.edges?.map((edge, i) => { const from = state.nodes.find(n => n.id === edge.from); const to = state.nodes.find(n => n.id === edge.to); if (!from || !to) return null; return (<line key={i} x1={from.x} y1={from.y+28} x2={to.x} y2={to.y-28} stroke="url(#edge-gradient)" strokeWidth="3" />); })}</svg><div className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>{state.nodes?.map(node => { const isP = node.data === state.p; const isQ = node.data === state.q; const isLCA = state.lcaNode === node.id; const isHighlight = state.highlightNode === node.id; return (<div key={node.id} style={{ left: `${node.x - 32}px`, top: `${node.y - 32}px` }} className="absolute"><div className={`w-16 h-16 flex items-center justify-center rounded-full font-mono text-xl font-bold border-4 transition-all duration-300 shadow-2xl ${ isLCA ? "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-200 text-black scale-110 shadow-yellow-500/70" : isHighlight ? "bg-gradient-to-br from-purple-400 to-pink-500 text-white border-white scale-110" : isP ? "bg-gradient-to-br from-sky-400 to-blue-500 border-sky-200" : isQ ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-200" : "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 text-white"}`}>{node.data}</div>{(isP || isQ || isLCA) && <span className={`absolute top-full mt-1 text-sm font-bold px-2 py-0.5 rounded ${isLCA ? 'bg-yellow-400 text-black' : isP ? 'bg-sky-400 text-black' : 'bg-green-400 text-black'}`}>{isLCA ? 'LCA' : isP ? 'p' : 'q'}</span>}</div>); })}</div></div></div><div className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${state.finished ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500" : "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700"}`}><h3 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${state.finished ? "text-green-300" : "text-gray-400"}`}><LocateFixed size={18} /> Final Result</h3><p className={`font-mono text-4xl font-bold ${state.finished ? "text-green-400" : "text-gray-400"}`}>{state.finished ? `LCA: ${state.nodes.find(n=>n.id===state.lcaNode)?.data}` : "Processing..."}</p></div><div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]"><h3 className="text-gray-400 text-sm font-semibold mb-2">Step Explanation</h3><p className="text-gray-200">{state.explanation || 'Click "Load & Visualize" to begin'}</p></div><div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700"><h3 className="font-bold text-2xl text-purple-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2"><Clock size={24} /> Complexity Analysis</h3><div className="space-y-5 text-base"><div className="bg-gray-900/50 p-4 rounded-xl"><h4 className="font-semibold text-purple-300 text-lg mb-2">Time Complexity: <span className="font-mono text-cyan-300">O(N)</span></h4><p className="text-gray-300">The algorithm visits each node in the tree exactly once in the worst case.</p></div><div className="bg-gray-900/50 p-4 rounded-xl"><h4 className="font-semibold text-purple-300 text-lg mb-2">Space Complexity: <span className="font-mono text-cyan-300">O(H)</span></h4><p className="text-gray-300">The space is determined by the recursion call stack depth, which is equal to the height (H) of the tree. In a skewed tree, this can be O(N).</p></div></div></div></div></div>) : (<div className="text-center py-20"><TreeDeciduous size={64} className="mx-auto text-gray-600 mb-4" /><p className="text-gray-400 text-xl">Load a tree to begin visualization.</p></div>)}
        </div>
    );
};


// ====================================================================================
// MAIN PAGE COMPONENT
// ====================================================================================
const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const algorithms = [
    {
      name: "Construct Tree from Traversal",
      number: "105",
      icon: GitMerge,
      description: "Build a binary tree from its preorder and inorder traversal arrays.",
      page: "ConstructBinaryTree",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-emerald-500 to-green-500",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      technique: "Recursion & Hashing",
      timeComplexity: "O(n)",
    },
    {
      name: "Validate Binary Search Tree",
      number: "98",
      icon: CheckCircle,
      description: "Determine if a given binary tree is a valid Binary Search Tree (BST).",
      page: "ValidateBST",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-teal-500 to-cyan-500",
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/20",
      borderColor: "border-teal-500/30",
      technique: "DFS & Boundaries",
      timeComplexity: "O(n)",
    },
    {
      name: "LCA of Deepest Leaves",
      number: "1123",
      icon: GitMerge,
      description:
        "Find the lowest common ancestor node of a binary tree's deepest leaves.",
      page: "LCAofDeepestLeaves",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      technique: "Depth-First Search (DFS)",
      timeComplexity: "O(n)",
    },
    {
      name: "AVL Tree Visualizer",
      number: "110",
      icon: GitMerge,
      description: "Visualize AVL tree insertions and rotations.",
      page: "AVLTree",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Balanced Binary Search Tree",
      timeComplexity: "O(log n)",
    },
    {
      name: "Lowest Common Ancestor",
      number: "236",
      icon: LocateFixed,
      description: "Find the lowest common ancestor of two given nodes in a binary tree.",
      page: "LCAofBinaryTree",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Recursion / DFS",
      timeComplexity: "O(n)",
    },
  ].sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <GitMerge className="h-14 sm:h-16 w-14 sm:w-16 text-emerald-400 animated-icon" />
              <Zap className="h-5 w-5 text-green-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 animated-gradient">
              Tree Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Explore the elegance of tree data structures. Visualize complex problems involving{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">recursion</span> and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">traversals</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full border border-emerald-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2"><Code2 className="h-3.5 w-3.5 text-emerald-400" /><span className="text-xs font-medium text-gray-300">{algorithms.length} Problem(s)</span></div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-blue-400" /><span className="text-xs font-medium text-gray-300">Recursive Solutions</span></div>
            </div>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {algorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon;
          return (
            <div key={algo.name} onClick={() => navigate(algo.page)} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="group relative cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${algo.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}><Icon className={`h-10 w-10 ${ isHovered ? "text-white" : algo.iconColor } transition-colors duration-300`} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-gray-500">#{algo.number}</span><div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>{algo.difficulty}</div></div>
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${ isHovered ? "text-white" : "text-gray-200" }`}>{algo.name}</h2>
                    </div>
                  </div>
                </div>
                <p className="h-14 text-sm leading-relaxed mb-5 transition-colors duration-300">{algo.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" /><span className="text-xs font-medium text-gray-400">{algo.technique}</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-400" /><span className="text-xs font-mono text-gray-400">{algo.timeComplexity}</span></div>
                  </div>
                  <div className={`transition-all duration-300 ${ isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2" }`}><div className="flex items-center gap-1"><span className="text-xs font-medium text-gray-400">Solve</span><ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" /></div></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">More tree problems coming soon</span>
        </div>
      </div>
    </div>
  );
};

const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>
      <style>{`.animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; } @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.6)); } @keyframes float-rotate { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(120deg); } 66% { transform: translateY(-4px) rotate(240deg); } } .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); } @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } } .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); } @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.1); } }`}</style>
      <div className="relative z-10">{children}</div>
    </div>
);

const TreesPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "ConstructBinaryTree":
        return <ConstructBinaryTree navigate={navigate} />;
      case "ValidateBST":
        return <ValidateBST navigate={navigate} />;
      case "LCAofDeepestLeaves":
        return <LCAofDeepestLeaves navigate={navigate} />
      case "AVLTree":
        return <AVLTree navigate={navigate} />;
      case "LCAofBinaryTree":
        return <LCAofBinaryTree navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-semibold text-gray-300">Tree Algorithms</span>
            </div>
          </div>
        </nav>
      )}
      {page === "home" && parentNavigate && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button
              onClick={() => parentNavigate("home")}
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 cursor-pointer hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </nav>
      )}
      {renderPage()}
    </PageWrapper>
  );
};

export default TreesPage;

