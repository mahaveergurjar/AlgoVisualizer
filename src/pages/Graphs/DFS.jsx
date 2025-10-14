import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Code, Clock, Network, Layers, ListOrdered } from "lucide-react";

// Helper to parse inputs safely
const parseGraphInput = (nodesStr, edgesStr, directed) => {
  // nodes can be comma separated labels like: 0,1,2,3 or A,B,C
  const nodes = nodesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // edges as u-v pairs: 0-1,0-2,1-3
  const edges = edgesStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const [a, b] = pair.split(/[-:>]/).map((s) => s.trim());
      if (a === undefined || b === undefined) throw new Error("Invalid edge: " + pair);
      return [a, b];
    });

  // Build adjacency list preserving input node order
  const adj = new Map(nodes.map((n) => [n, []]));
  edges.forEach(([u, v]) => {
    if (!adj.has(u)) adj.set(u, []);
    if (!adj.has(v)) adj.set(v, []);
    adj.get(u).push(v);
    if (!directed) adj.get(v).push(u);
  });

  // Sort neighbor lists by input order for deterministic traversal
  const order = new Map(nodes.map((n, i) => [n, i]));
  adj.forEach((nbrs, key) => nbrs.sort((a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9)));

  return { nodes, edges, adj };
};

const DFS = ({ navigate }) => {
  const [nodesStr, setNodesStr] = useState("0,1,2,3,4");
  const [edgesStr, setEdgesStr] = useState("0-1,0-2,1-3,1-4,2-4");
  const [startNode, setStartNode] = useState("0");
  const [directed, setDirected] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoInterval, setDemoInterval] = useState(null);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  const radius = 175;
  const center = { x: 500, y: 240 };

  const layoutPositions = useCallback((nodes) => {
    const n = nodes.length;
    const pos = new Map();
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(n, 1);
      pos.set(node, {
        x: Math.round(center.x + radius * Math.cos(angle)),
        y: Math.round(center.y + radius * Math.sin(angle)),
      });
    });
    return pos;
  }, []);

  const generateHistory = useCallback(() => {
    let parsed;
    try {
      parsed = parseGraphInput(nodesStr, edgesStr, directed);
    } catch (e) {
      alert(e.message);
      return;
    }

    const { nodes, edges, adj } = parsed;
    if (!nodes.includes(startNode)) {
      alert("Start node must exist in the node list.");
      return;
    }

    const positions = layoutPositions(nodes);
    const newHistory = [];

    const addState = (s) =>
      newHistory.push({
        nodes,
        edges,
        adj,
        positions,
        ...s,
      });

    // DFS structures
    const visited = new Set();
    const parent = new Map();
    const stack = [];

    // code line refs
    // 1: init
    // 2: push start
    // 3: while
    // 4: u = pop
    // 5: if not visited
    // 6: mark visited
    // 7: for v of adj[u]
    // 8: if not visited, push to stack

    addState({
      line: 1,
      explanation: "Initialize visited set, stack, and parent map",
      stack: [...stack],
      visited: [...visited],
      parent: Object.fromEntries(parent),
      current: null,
      exploringEdge: null,
      discovered: [],
      order: [],
    });

    stack.push(startNode);
    addState({
      line: 2,
      explanation: `Push ${startNode} to stack as start`,
      stack: [...stack],
      visited: [...visited],
      parent: Object.fromEntries(parent),
      current: startNode,
      exploringEdge: null,
      discovered: [startNode],
      order: [],
    });

    const order = [];
    while (stack.length) {
      addState({
        line: 3,
        explanation: "Stack not empty → continue DFS",
        stack: [...stack],
        visited: [...visited],
        parent: Object.fromEntries(parent),
        current: stack[stack.length - 1],
        exploringEdge: null,
        discovered: [],
        order: [...order],
      });

      const u = stack.pop();
      addState({
        line: 4,
        explanation: `Pop ${u} from stack`,
        stack: [...stack],
        visited: [...visited],
        parent: Object.fromEntries(parent),
        current: u,
        exploringEdge: null,
        discovered: [],
        order: [...order],
      });

      if (!visited.has(u)) {
        addState({
          line: 5,
          explanation: `${u} not visited → check condition`,
          stack: [...stack],
          visited: [...visited],
          parent: Object.fromEntries(parent),
          current: u,
          exploringEdge: null,
          discovered: [],
          order: [...order],
        });

        visited.add(u);
        order.push(u);
        addState({
          line: 6,
          explanation: `Mark ${u} as visited and add to DFS order`,
          stack: [...stack],
          visited: [...visited],
          parent: Object.fromEntries(parent),
          current: u,
          exploringEdge: null,
          discovered: [u],
          order: [...order],
        });

        // Add neighbors to stack (in reverse order for consistent traversal)
        const neighbors = adj.get(u) || [];
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const v = neighbors[i];
          addState({
            line: 7,
            explanation: `Inspect neighbor ${v} of ${u}`,
            stack: [...stack],
            visited: [...visited],
            parent: Object.fromEntries(parent),
            current: u,
            exploringEdge: [u, v],
            discovered: [],
            order: [...order],
          });

          if (!visited.has(v)) {
            parent.set(v, u);
            stack.push(v);
            addState({
              line: 8,
              explanation: `${v} not visited → push to stack; parent[${v}] = ${u}`,
              stack: [...stack],
              visited: [...visited],
              parent: Object.fromEntries(parent),
              current: u,
              exploringEdge: [u, v],
              discovered: [v],
              order: [...order],
            });
          }
        }
      }
    }

    addState({
      finished: true,
      line: 0,
      explanation: "DFS complete!",
      stack: [],
      visited: [...visited],
      parent: Object.fromEntries(parent),
      current: null,
      exploringEdge: null,
      discovered: [],
      order: [...order],
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, [nodesStr, edgesStr, directed, startNode, layoutPositions]);

  const load = () => {
    setIsLoaded(true);
    generateHistory();
    setIsDemo(false);
  };

  // Demo: auto-fill a sample graph and animate DFS
  const runDemo = () => {
    setNodesStr("0,1,2,3,4");
    setEdgesStr("0-1,0-2,1-3,1-4,2-4");
    setStartNode("0");
    setDirected(false);
    setTimeout(() => {
      setIsLoaded(true);
      generateHistory();
      setIsDemo(true);
    }, 100); // allow state to update
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsDemo(false);
    if (demoInterval) clearInterval(demoInterval);
    setDemoInterval(null);
  };

  const stepForward = useCallback(
    () => setCurrentStep((p) => Math.min(p + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((p) => Math.max(p - 1, 0)),
    []
  );

  useEffect(() => {
    const h = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === "ArrowRight") stepForward();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isLoaded, stepBackward, stepForward]);

  // Demo animation: auto-step through DFS
  useEffect(() => {
    if (isDemo && isLoaded && history.length > 0) {
      if (demoInterval) clearInterval(demoInterval);
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep((step) => {
          if (step < history.length - 1) {
            return step + 1;
          } else {
            clearInterval(interval);
            setIsDemo(false);
            setDemoInterval(null);
            return step;
          }
        });
      }, 900);
      setDemoInterval(interval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [isDemo, isLoaded, history.length]);

  const state = history[currentStep] || {};

  const code = useMemo(
    () => [
      { l: 1, c: [
        { t: "unordered_set<node> ", c: "light" },
        { t: "visited; stack<node> s; map<node,node> parent;", c: "" },
      ]},
      { l: 2, c: [
        { t: "s.push(start);", c: "" },
      ]},
      { l: 3, c: [
        { t: "while (!s.empty()) {", c: "purple" },
      ]},
      { l: 4, c: [
        { t: "  node u = s.top(); s.pop();", c: "" },
      ]},
      { l: 5, c: [
        { t: "  if (!visited.count(u)) {", c: "purple" },
      ]},
      { l: 6, c: [
        { t: "    visited.insert(u);", c: "" },
      ]},
      { l: 7, c: [
        { t: "    for (node v : adj[u]) {", c: "purple" },
      ]},
      { l: 8, c: [
        { t: "      if (!visited.count(v)) { parent[v]=u; s.push(v); }", c: "" },
      ]},
      { l: 9, c: [ { t: "  }", c: "light" } ]},
      { l: 10, c: [ { t: "}", c: "light" } ]},
    ],
    []
  );

  const colorMap = {
    purple: "text-purple-400",
    light: "text-gray-300",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors px-2 py-1 ${
        state.line === line ? "bg-blue-500/20 border-l-4 border-blue-400" : ""
      }`}
    >
      <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, i) => (
        <span key={i} className={colorMap[token.c]}> {token.t} </span>
      ))}
    </div>
  );

  const isVisited = (n) => (state.visited || []).includes(n);
  const isInStack = (n) => (state.stack || []).includes(n);
  const isCurrent = (n) => state.current === n;
  const isDiscovered = (n) => (state.discovered || []).includes(n);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <style>{`
        .custom-scrollbar-purple {
          scrollbar-width: thin;
          scrollbar-color: #A855F7 #1F2937;
        }
        .custom-scrollbar-purple::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-purple::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .custom-scrollbar-purple::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #A855F7, #EC4899);
          border-radius: 4px;
          border: 1px solid #7C3AED;
        }
        .custom-scrollbar-purple::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9333EA, #DB2777);
        }
      `}</style>
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Depth-First Search (DFS)
        </h1>
        <p className="text-xl text-gray-400 mt-3">Graph traversal using a stack</p>
      </header>

      {/* Controls */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex items-center justify-center gap-3">
            {!isLoaded ? (
              <>
                <button
                  onClick={load}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 cursor-pointer hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                >
                  Load & Visualize
                </button>
                <button
                  onClick={runDemo}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 cursor-pointer hover:from-orange-600 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                  disabled={isDemo}
                >
                  Demo
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0 || isDemo}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                  {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                </span>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1 || isDemo}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={runDemo}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                  disabled={isDemo}
                >
                  Demo
                </button>
              </>
            )}
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 cursor-pointer rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Reset
            </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code + Stack Panel */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
            <div>
              <h3 className="font-bold text-2xl text-purple-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                <Code size={22} />
                C++ Solution
              </h3>
              <pre className="text-sm overflow-auto max-h-80 custom-scrollbar-purple">
                <code className="font-mono leading-relaxed">
                  {code.map((line) => (
                    <CodeLine key={line.l} line={line.l} content={line.c} />
                  ))}
                </code>
              </pre>
            </div>

            {/* Stack */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-purple-300 mb-3 flex items-center gap-2">
                <Layers size={18} />
                Stack State
              </h4>
              <div className="flex flex-col gap-2 items-center">
                {(state.stack || []).length === 0 && (
                  <span className="text-gray-500 italic text-sm">Stack is empty</span>
                )}
                {(state.stack || []).slice().reverse().map((s, i) => (
                  <div key={`${s}-${i}`} className="flex flex-col items-center">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono text-base font-bold border-2 transition-all ${
                      i === 0 ? "bg-purple-500 text-white border-purple-300 scale-110 shadow-lg shadow-purple-500/50" : "bg-gray-700 border-gray-600 text-gray-300"
                    }`}>
                      {s}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{i === 0 ? "top" : ""}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visited order */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-purple-300 mb-3 flex items-center gap-2">
                <ListOrdered size={18} />
                DFS Order
              </h4>
              <div className="flex gap-2 flex-wrap">
                {(state.order || []).map((n, i) => (
                  <div key={`${n}-${i}`} className="px-3 py-1 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/50 font-mono text-sm">
                    {n}
                  </div>
                ))}
                {(state.order || []).length === 0 && (
                  <span className="text-gray-500 italic text-sm">No nodes visited yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Graph + Explanation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-200 flex items-center gap-2">
                  <Network size={24} />
                  Graph Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-700/50 px-3 py-1 rounded-lg">
                  {state.visited?.length || 0} visited
                </div>
              </div>

              <div className="relative bg-gray-900/30 rounded-xl p-4 custom-scrollbar-purple" style={{ width: "100%", height: "450px", overflow: "auto" }}>
                <svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                  {/** Edges **/}
                  {(state.edges || []).map(([u, v], idx) => {
                    const p1 = state.positions?.get(u);
                    const p2 = state.positions?.get(v);
                    if (!p1 || !p2) return null;
                    const isExploring = state.exploringEdge && ((state.exploringEdge[0] === u && state.exploringEdge[1] === v) || (!directed && state.exploringEdge[0] === v && state.exploringEdge[1] === u));
                    const color = isExploring ? "#a855f7" : "#4ade80"; // purple or green
                    const width = isExploring ? 4 : 2.5;
                    return (
                      <g key={idx}>
                        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={width} className="drop-shadow" />
                        {directed && (
                          <polygon
                            points={`${p2.x},${p2.y} ${p2.x - 6},${p2.y - 12} ${p2.x + 6},${p2.y - 12}`}
                            fill={color}
                            transform={`rotate(${Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)} ${p2.x} ${p2.y})`}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                <div className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                  {(state.nodes || []).map((n) => {
                    const p = state.positions?.get(n);
                    const visited = isVisited(n);
                    const inStack = isInStack(n);
                    const current = isCurrent(n);
                    const discovered = isDiscovered(n);
                    return (
                      <div key={n} className="absolute" style={{ left: `${(p?.x || 0) - 26}px`, top: `${(p?.y || 0) - 26}px` }}>
                        <div
                          className={`w-[52px] h-[52px] flex items-center justify-center rounded-full font-mono text-base font-bold text-white border-4 transition-all duration-300 shadow-2xl ${
                            current
                              ? "bg-gradient-to-br from-purple-400 to-pink-500 border-white scale-110 shadow-purple-500/50"
                              : discovered
                              ? "bg-gradient-to-br from-violet-500 to-purple-600 border-purple-300"
                              : visited
                              ? "bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-400"
                              : inStack
                              ? "bg-gradient-to-br from-orange-600 to-red-600 border-orange-400"
                              : "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-400"
                          }`}
                        >
                          {n}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white" /> <span className="text-gray-300 font-semibold">Current</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-purple-300" /> <span className="text-gray-300 font-semibold">Discovered</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-purple-400" /> <span className="text-gray-300 font-semibold">Visited</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-purple-400" /> <span className="text-gray-300 font-semibold">Exploring Edge</span></div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem] max-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-400 text-sm font-semibold">Step Explanation</h3>
                {isDemo && (
                  <span className="text-orange-300 font-semibold text-xs">Demo mode: Auto-running</span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar-purple">
                {history.length === 0 ? (
                  <p className="text-gray-200 text-base leading-relaxed">
                    Click "Load & Visualize" to begin
                  </p>
                ) : (
                  history.slice(0, currentStep + 1).map((step, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border-l-4 transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-purple-500/20 border-purple-400 text-purple-100' 
                          : 'bg-gray-800/50 border-gray-600 text-gray-300'
                      }`}
                      ref={index === currentStep ? (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) : null}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          index === currentStep 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          #{index + 1}
                        </span>
                        <p className="text-sm leading-relaxed flex-1">
                          {step.explanation}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Complexity */}
          <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-purple-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
              <Clock size={24} />
              Complexity Analysis
            </h3>
            <div className="space-y-5 text-base">
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-300 text-lg mb-2">
                  Time Complexity: <span className="font-mono text-pink-300">O(V + E)</span>
                </h4>
                <p className="text-gray-300">
                  Each vertex is pushed and popped at most once, and each edge is explored at most once.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-300 text-lg mb-2">
                  Space Complexity: <span className="font-mono text-pink-300">O(V)</span>
                </h4>
                <p className="text-gray-300">The stack, visited set, and parent map store up to O(V) items.</p>
              </div>
              <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                <h4 className="font-semibold text-purple-300 text-lg mb-2">💡 Key Insights</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>DFS explores as far as possible along each branch before backtracking.</li>
                  <li>Use a stack (or recursion) to remember which vertices to visit next.</li>
                  <li>Parent pointers can reconstruct paths in the DFS tree.</li>
                  <li>DFS can be used to find connected components, cycles, and topological ordering.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Network size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-xl">Click "Load & Visualize" or "Demo" to begin DFS visualization</p>
        </div>
      )}
    </div>
  );
};

export default DFS;