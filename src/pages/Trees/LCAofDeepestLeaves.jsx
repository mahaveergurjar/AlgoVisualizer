import React, { useState, useCallback, useEffect } from 'react';
import { Play, SkipBack, SkipForward, RotateCcw, TreeDeciduous, Code } from 'lucide-react';

// Code Display Component with Syntax Highlighting for C++
const CodeDisplay = ({ currentLine }) => {
    const codeLines = [
        `pair<TreeNode*, int> dfs(TreeNode* node) {`,
        `  // Base case: if it's a leaf node`,
        `  if (!node->left && !node->right) {`,
        `    return {node, 0};`,
        `  }`,
        `  // Recurse on left and right children`,
        `  auto leftResult = make_pair(nullptr, -1);`,
        `  if (node->left) leftResult = dfs(node->left);`,
        ``,
        `  auto rightResult = make_pair(nullptr, -1);`,
        `  if (node->right) rightResult = dfs(node->right);`,
        ``,
        `  // Compare depths and determine the new LCA`,
        `  int leftDepth = leftResult.second + 1;`,
        `  int rightDepth = rightResult.second + 1;`,
        ``,
        `  if (leftDepth > rightDepth) {`,
        `    return {leftResult.first, leftDepth};`,
        `  }`,
        `  if (rightDepth > leftDepth) {`,
        `    return {rightResult.first, rightDepth};`,
        `  }`,
        `  // Depths are equal, current node is the LCA`,
        `  return {node, leftDepth};`,
        `}`
    ];

    const highlightSyntax = (line) => {
        const tokens = [
            { type: 'comment', regex: /(\/\/.*)/g },
            { type: 'keyword', regex: /\b(if|return|auto|int|pair|struct)\b/g },
            { type: 'function', regex: /\b(dfs|make_pair)\b/g },
            { type: 'literal', regex: /\b(nullptr)\b/g },
            { type: 'punctuation', regex: /(\{|\}|\(|\)|\[|\]|;|<|>|->|\.)/g },
            { type: 'number', regex: /\b\d+\b/g },
            { type: 'operator', regex: /(=|!|>|&&)/g },
        ];
        const classMap = {
            comment: 'text-slate-500 italic',
            keyword: 'text-teal-400',
            function: 'text-green-400',
            literal: 'text-sky-400',
            punctuation: 'text-slate-400',
            number: 'text-yellow-400',
            operator: 'text-red-400',
        };

        let lastIndex = 0;
        const elements = [];
        const combinedRegex = new RegExp(tokens.map(t => t.regex.source).join('|'), 'g');
        
        line.replace(combinedRegex, (match, ...args) => {
            const offset = args[args.length - 2];
            const token = tokens.find(t => new RegExp(`^${t.regex.source}$`).test(match));

            if (offset > lastIndex) {
                elements.push(line.substring(lastIndex, offset));
            }
            if (token) {
                elements.push(<span key={offset} className={classMap[token.type]}>{match}</span>);
            } else {
                 elements.push(match);
            }
            lastIndex = offset + match.length;
            return match; // necessary for replace to work
        });

        if (lastIndex < line.length) {
            elements.push(line.substring(lastIndex));
        }
        
        return elements;
    };

    return (
        <pre className="bg-slate-900/70 text-xs rounded-lg p-3 font-mono overflow-auto border border-slate-700 shadow-inner h-full">
            {codeLines.map((line, index) => (
                <div 
                    key={index} 
                    className={`transition-colors duration-300 px-2 -mx-2 border-l-4 ${currentLine === index + 1 ? 'bg-green-500/10 border-green-400' : 'border-transparent'}`}
                >
                    <span className="text-slate-600 mr-3 select-none">{String(index + 1).padStart(2, ' ')}</span>
                    <code className="text-slate-300">{highlightSyntax(line)}</code>
                </div>
            ))}
        </pre>
    );
};

// Main Visualizer Component
const LCAofDeepestLeavesVisualizer = () => {
    const [treeInput, setTreeInput] = useState('3,5,1,6,2,0,8,null,null,7,4');
    const [root, setRoot] = useState(null);
    const [nodePositions, setNodePositions] = useState({});
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisualizing, setIsVisualizing] = useState(false);

    const buildTree = (nodes) => {
        if (!nodes || nodes.length === 0 || nodes[0] === 'null' || nodes[0] === '') return null;
        const treeRoot = { val: parseInt(nodes[0]), left: null, right: null, id: `node-0` };
        const queue = [treeRoot];
        let i = 1, idCounter = 1;
        while (queue.length > 0 && i < nodes.length) {
            const currentNode = queue.shift();
            if (nodes[i] !== 'null' && nodes[i] !== undefined && nodes[i] !== '') {
                const leftChild = { val: parseInt(nodes[i]), left: null, right: null, id: `node-${idCounter++}` };
                currentNode.left = leftChild;
                queue.push(leftChild);
            }
            i++;
            if (i < nodes.length && nodes[i] !== 'null' && nodes[i] !== undefined && nodes[i] !== '') {
                const rightChild = { val: parseInt(nodes[i]), left: null, right: null, id: `node-${idCounter++}` };
                currentNode.right = rightChild;
                queue.push(rightChild);
            }
            i++;
        }
        return treeRoot;
    };

    const calculatePositions = (node, depth = 0, left = 0, right = 1, positions = {}) => {
        if (!node) return positions;
        const x = (left + right) / 2;
        const y = depth;
        positions[node.id] = { x, y };
        if (node.left) calculatePositions(node.left, depth + 1, left, x, positions);
        if (node.right) calculatePositions(node.right, depth + 1, x, right, positions);
        return positions;
    };

    const generateHistory = useCallback((treeRoot) => {
        if (!treeRoot) return [];
        const newHistory = [];
        const addHistory = (state) => newHistory.push(state);

        function dfs(node) {
            addHistory({ currentNodeId: node.id, lcaNodeId: null, leftSubtreeResult: { lca: null, depth: -1 }, rightSubtreeResult: { lca: null, depth: -1 }, explanation: `DFS visiting Node ${node.val}.`, codeLine: 1 });
            if (!node.left && !node.right) {
                addHistory({ currentNodeId: node.id, lcaNodeId: node.id, explanation: `Node ${node.val} is a leaf. It is the LCA of its own subtree with depth 0.`, codeLine: 3 });
                addHistory({ currentNodeId: node.id, lcaNodeId: node.id, explanation: `Returning { lca: Node ${node.val}, depth: 0 }`, codeLine: 4 });
                return { lca: node, depth: 0 };
            }
            let leftResult = { lca: null, depth: -1 };
            if (node.left) {
                addHistory({ currentNodeId: node.left.id, leftSubtreeResult: leftResult, explanation: `Recursing into LEFT subtree of ${node.val}.`, codeLine: 8 });
                leftResult = dfs(node.left);
                addHistory({ currentNodeId: node.id, leftSubtreeResult: leftResult, explanation: `Returned from LEFT. Received {LCA: ${leftResult.lca?.val}, Depth: ${leftResult.depth}}.`, codeLine: 8 });
            }
            let rightResult = { lca: null, depth: -1 };
            if (node.right) {
                addHistory({ currentNodeId: node.right.id, leftSubtreeResult: leftResult, rightSubtreeResult: rightResult, explanation: `Recursing into RIGHT subtree of ${node.val}.`, codeLine: 11 });
                rightResult = dfs(node.right);
                addHistory({ currentNodeId: node.id, leftSubtreeResult: leftResult, rightSubtreeResult: rightResult, explanation: `Returned from RIGHT. Received {LCA: ${rightResult.lca?.val}, Depth: ${rightResult.depth}}.`, codeLine: 11 });
            }
            const leftDepth = leftResult.depth === -1 ? -1 : leftResult.depth + 1;
            const rightDepth = rightResult.depth === -1 ? -1 : rightResult.depth + 1;
            addHistory({ currentNodeId: node.id, leftSubtreeResult: leftResult, rightSubtreeResult: rightResult, explanation: `At Node ${node.val}, comparing depths: Left=${leftDepth}, Right=${rightDepth}.`, codeLine: 14 });
            if (leftDepth > rightDepth) {
                addHistory({ currentNodeId: node.id, lcaNodeId: leftResult.lca.id, leftSubtreeResult: leftResult, rightSubtreeResult: rightResult, explanation: `Left is deeper. Pass up LCA from left: Node ${leftResult.lca.val}.`, codeLine: 17 });
                return { lca: leftResult.lca, depth: leftDepth };
            }
            if (rightDepth > leftDepth) {
                 addHistory({ currentNodeId: node.id, lcaNodeId: rightResult.lca.id, leftSubtreeResult: leftResult, rightSubtreeResult: rightResult, explanation: `Right is deeper. Pass up LCA from right: Node ${rightResult.lca.val}.`, codeLine: 20 });
                return { lca: rightResult.lca, depth: rightDepth };
            }
            addHistory({ currentNodeId: node.id, lcaNodeId: node.id, leftSubtreeResult: leftResult, rightSubtreeResult: rightResult, explanation: `Depths are equal. Node ${node.val} is the new LCA.`, codeLine: 24 });
            return { lca: node, depth: leftDepth };
        }
        addHistory({ explanation: "Starting DFS from the root.", codeLine: 0 });
        const finalResult = dfs(treeRoot);
        addHistory({ lcaNodeId: finalResult.lca.id, explanation: `Traversal complete! Final LCA is Node ${finalResult.lca.val}.`, codeLine: 25 });
        return newHistory;
    }, []);

    const handleVisualize = () => {
        const nodes = treeInput.split(',').map(n => n.trim());
        const treeRoot = buildTree(nodes);
        if (treeRoot) {
            setRoot(treeRoot);
            setNodePositions(calculatePositions(treeRoot));
            setHistory(generateHistory(treeRoot));
            setCurrentStep(0);
            setIsVisualizing(true);
        } else alert("Invalid tree input.");
    };

    const handleReset = () => { setIsVisualizing(false); setRoot(null); setHistory([]); setCurrentStep(0); setNodePositions({}); };
    const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, history.length - 1)), [history.length]);
    const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isVisualizing) return;
            if (e.key === 'ArrowLeft') stepBackward(); else if (e.key === 'ArrowRight') stepForward();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisualizing, stepBackward, stepForward]);
    
    const currentState = history[currentStep] || {};
    
    const TreeDisplay = ({ treeRoot, positions }) => {
        if (!treeRoot) return null;
        const nodes = [], edges = [], queue = [treeRoot];
        while(queue.length > 0) {
            const node = queue.shift();
            nodes.push(node);
            if (node.left) { edges.push({ from: node, to: node.left }); queue.push(node.left); }
            if (node.right) { edges.push({ from: node, to: node.right }); queue.push(node.right); }
        }
        const maxDepth = Math.max(0, ...Object.values(positions).map(p => p.y));
        const containerWidth = 500, containerHeight = (maxDepth + 1) * 70, nodeSize = 40;
        const verticalSpacing = maxDepth > 0 ? containerHeight / (maxDepth + 1) : containerHeight / 2;
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <svg className="absolute" width={containerWidth} height={containerHeight}>
                    {edges.map(edge => {
                        const fromPos = positions[edge.from.id], toPos = positions[edge.to.id];
                        const isCurrent = edge.from.id === currentState.currentNodeId || edge.to.id === currentState.currentNodeId;
                        const isLcaPath = edge.from.id === currentState.lcaNodeId || edge.to.id === currentState.lcaNodeId;
                        const x1 = fromPos.x * containerWidth, y1 = fromPos.y * verticalSpacing + nodeSize / 2;
                        const x2 = toPos.x * containerWidth, y2 = toPos.y * verticalSpacing + nodeSize / 2;
                        return <line key={`${edge.from.id}-${edge.to.id}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isLcaPath ? 'rgb(250 204 21)' : isCurrent ? 'rgb(16 185 129)' : 'rgb(71 85 105)'} strokeWidth={isLcaPath || isCurrent ? '2.5' : '1.5'} opacity={isLcaPath || isCurrent ? '1' : '0.5'} className="transition-all duration-300" />;
                    })}
                </svg>
                <div className="relative" style={{ width: containerWidth, height: containerHeight }}>
                    {nodes.map(node => {
                        const pos = positions[node.id];
                        const isCurrent = node.id === currentState.currentNodeId, isLca = node.id === currentState.lcaNodeId, isLeaf = !node.left && !node.right;
                        const x = pos.x * containerWidth - nodeSize / 2, y = pos.y * verticalSpacing;
                        return (
                            <div key={node.id} className="absolute transition-all duration-300" style={{ top: `${y}px`, left: `${x}px` }}>
                                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 transition-all duration-300 ${ isLca ? 'bg-yellow-500 border-yellow-300 shadow-lg shadow-yellow-500/30 scale-110 z-20' : isCurrent ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/30 scale-105 z-10 ring-2 ring-green-400/20' : isLeaf ? 'bg-teal-600 border-teal-400' : 'bg-slate-700 border-slate-600' }`}>
                                    {node.val}
                                    {isLca && (<div className="absolute -top-5 text-[9px] left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 font-bold px-1 py-0.5 rounded">LCA</div>)}
                                    {isCurrent && !isLca && (<div className="absolute -top-5 text-[9px] left-1/2 -translate-x-1/2 bg-green-400 text-slate-900 font-bold px-1 py-0.5 rounded">Current</div>)}
                                    {isLeaf && (<div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-teal-300 rounded-full border border-slate-900"></div>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-gray-100 font-sans p-2">
            <div className="max-w-[90rem] mx-auto">
                <header className="text-center mb-4">
                    <div className="flex items-center justify-center gap-3"><TreeDeciduous className="text-green-400" size={38} /><h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">LCA of Deepest Leaves</h1></div>
                </header>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl mb-3">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-grow min-w-[300px]"><label htmlFor="tree-input" className="block text-xs font-semibold text-gray-300 mb-1">Tree Input</label><input id="tree-input" type="text" value={treeInput} onChange={(e) => setTreeInput(e.target.value)} className="w-full bg-slate-900/70 text-gray-100 text-sm rounded-md p-2 border border-slate-700 focus:ring-1 focus:ring-green-500 focus:outline-none font-mono" disabled={isVisualizing} /></div>
                        <div className="flex gap-2"><button onClick={handleVisualize} disabled={isVisualizing} className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold px-4 py-2 text-sm rounded-md disabled:opacity-50 flex items-center gap-2"><Play size={16} /> Visualize</button><button onClick={handleReset} disabled={!isVisualizing} className="bg-slate-700 text-white font-semibold px-4 py-2 text-sm rounded-md disabled:opacity-50 flex items-center gap-2"><RotateCcw size={16} /> Reset</button></div>
                    </div>
                </div>
                {isVisualizing && (
                    <div className="flex flex-col gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl">
                             <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-green-400">Algorithm Steps</h2><div className="flex items-center justify-center gap-3 bg-slate-900/50 p-1.5 rounded-lg"><button onClick={stepBackward} disabled={currentStep === 0} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-30"><SkipBack size={16} /></button><span className="font-mono text-base font-bold text-teal-300">{currentStep + 1} / {history.length}</span><button onClick={stepForward} disabled={currentStep === history.length - 1} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-30"><SkipForward size={16} /></button></div></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{minHeight: "65vh"}}>
                            {/* TOP ROW in the grid - Sibling Panels */}
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 h-full flex flex-col">
                                    <h3 className="font-bold text-sm mb-2 text-teal-400">Current State & Explanation</h3>
                                    <p className="text-gray-300 text-xs leading-relaxed mb-2 flex-grow">{currentState.explanation}</p>
                                    <div className="space-y-1 pt-2 border-t border-slate-700">
                                        <p className="text-xs flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span><span className="font-semibold text-green-400">Visiting:</span><span className="font-mono">{root && currentState.currentNodeId ? findNodeById(root, currentState.currentNodeId)?.val : 'N/A'}</span></p>
                                        <p className="text-xs flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span><span className="font-semibold text-yellow-400">LCA Pointer:</span><span className="font-mono">{root && currentState.lcaNodeId ? findNodeById(root, currentState.lcaNodeId)?.val : 'N/A'}</span></p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 h-full">
                                    <h3 className="font-bold text-sm mb-2 text-purple-400">Subtree Results</h3>
                                    <div className="space-y-2">
                                        <div className="bg-slate-800/50 p-2 rounded-lg border border-blue-500/30"><p className="text-[10px] font-bold text-blue-400">LEFT</p><p className="text-xs text-gray-300 font-mono">{currentState.leftSubtreeResult?.lca ? `{LCA: ${currentState.leftSubtreeResult.lca.val}, Depth: ${currentState.leftSubtreeResult.depth}}` : 'N/A'}</p></div>
                                        <div className="bg-slate-800/50 p-2 rounded-lg border border-purple-500/30"><p className="text-[10px] font-bold text-purple-400">RIGHT</p><p className="text-xs text-gray-300 font-mono">{currentState.rightSubtreeResult?.lca ? `{LCA: ${currentState.rightSubtreeResult.lca.val}, Depth: ${currentState.rightSubtreeResult.depth}}` : 'N/A'}</p></div>
                                    </div>
                                </div>
                            </div>
                            {/* BOTTOM ROW in the grid - Sibling Panels */}
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl">
                                <CodeDisplay currentLine={currentState.codeLine} />
                            </div>
                             <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 shadow-xl flex justify-center items-center overflow-auto">
                                <TreeDisplay treeRoot={root} positions={nodePositions} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const findNodeById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    return findNodeById(node.left, id) || findNodeById(node.right, id);
};

export default LCAofDeepestLeavesVisualizer;

