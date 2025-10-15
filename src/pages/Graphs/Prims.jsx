import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Code, Clock, Network, Layers, ListOrdered } from "lucide-react";

// Helper to parse inputs safely
const parseGraphInput = (nodesStr, edgesStr) => {
  const nodes = nodesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const edges = edgesStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((triplet) => {
      const parts = triplet.split(/[-:]/).map((s) => s.trim());
      if (parts.length === 2) {
        const [a, b] = parts;
        return [a, b, 1];
      } else if (parts.length === 3) {
        const [a, b, w] = parts;
        const weight = parseInt(w);
        if (isNaN(weight)) throw new Error("Invalid weight in edge: " + triplet);
        return [a, b, weight];
      } else {
        throw new Error("Invalid edge format: " + triplet);
      }
    });

  // Build adjacency list
  const adj = new Map(nodes.map((n) => [n, []]));
  edges.forEach(([u, v, w]) => {
    if (!adj.has(u)) adj.set(u, []);
    if (!adj.has(v)) adj.set(v, []);
    adj.get(u).push({ node: v, weight: w });
    adj.get(v).push({ node: u, weight: w });
  });

  return { nodes, edges, adj };
};

const Prims = ({ navigate }) => {
  const [nodesStr, setNodesStr] = useState("0,1,2,3,4");
  const [edgesStr, setEdgesStr] = useState("0-1-4,0-2-1,1-2-2,1-3-1,2-3-5,3-4-3");
  const [startNode, setStartNode] = useState("0");
  const [isDemo, setIsDemo] = useState(false);
  const [demoInterval, setDemoInterval] = useState(null);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-scroll toggle
  const [autoScroll, setAutoScroll] = useState(true);
  const explanationRef = useRef(null);

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
      parsed = parseGraphInput(nodesStr, edgesStr);
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

    // Stop demo mode if running
    if (isDemo) {
      setIsDemo(false);
      if (demoInterval) {
        clearInterval(demoInterval);
        setDemoInterval(null);
      }
    }

    // Prim's algorithm structures
    const inMST = new Set();
    const mst = [];
    let totalWeight = 0;
    const key = new Map();
    const parent = new Map();
    const pq = []; // Priority queue (min-heap simulation)

    // Initialize
    nodes.forEach((node) => {
      key.set(node, node === startNode ? 0 : Infinity);
      parent.set(node, null);
    });

    addState({
      line: 1,
      explanation: `Initialize all keys to ∞, start node ${startNode} to 0`,
      inMST: new Set(inMST),
      mst: [...mst],
      totalWeight,
      key: Object.fromEntries(key),
      parent: Object.fromEntries(parent),
      pq: [...pq],
      current: null,
      exploringEdge: null,
      consideringEdge: null,
    });

    pq.push({ node: startNode, key: 0 });

    addState({
      line: 2,
      explanation: `Add start node ${startNode} to priority queue`,
      inMST: new Set(inMST),
      mst: [...mst],
      totalWeight,
      key: Object.fromEntries(key),
      parent: Object.fromEntries(parent),
      pq: [...pq],
      current: startNode,
      exploringEdge: null,
      consideringEdge: null,
    });

    while (pq.length > 0) {
      addState({
        line: 3,
        explanation: `Priority queue not empty → continue Prim's`,
        inMST: new Set(inMST),
        mst: [...mst],
        totalWeight,
        key: Object.fromEntries(key),
        parent: Object.fromEntries(parent),
        pq: [...pq],
        current: pq[0]?.node,
        exploringEdge: null,
        consideringEdge: null,
      });

      // Extract minimum
      pq.sort((a, b) => a.key - b.key);
      const { node: u } = pq.shift();

      addState({
        line: 4,
        explanation: `Extract node ${u} with key ${key.get(u)} from priority queue`,
        inMST: new Set(inMST),
        mst: [...mst],
        totalWeight,
        key: Object.fromEntries(key),
        parent: Object.fromEntries(parent),
        pq: [...pq],
        current: u,
        exploringEdge: null,
        consideringEdge: null,
      });

      if (inMST.has(u)) {
        addState({
          line: 5,
          explanation: `Node ${u} already in MST → skip`,
          inMST: new Set(inMST),
          mst: [...mst],
          totalWeight,
          key: Object.fromEntries(key),
          parent: Object.fromEntries(parent),
          pq: [...pq],
          current: u,
          exploringEdge: null,
          consideringEdge: null,
        });
        continue;
      }

      inMST.add(u);
      const currentKey = key.get(u);
      totalWeight += currentKey;

      if (parent.get(u) !== null) {
        mst.push([parent.get(u), u, currentKey]);
      }

      addState({
        line: 6,
        explanation: `Add node ${u} to MST${parent.get(u) ? ` via edge ${parent.get(u)}-${u} (weight ${currentKey})` : ' (start node)'}. Total weight: ${totalWeight}`,
        inMST: new Set(inMST),
        mst: [...mst],
        totalWeight,
        key: Object.fromEntries(key),
        parent: Object.fromEntries(parent),
        pq: [...pq],
        current: u,
        exploringEdge: null,
        consideringEdge: null,
      });

      // Process neighbors
      for (const { node: v, weight: w } of adj.get(u) || []) {
        addState({
          line: 7,
          explanation: `Examine neighbor ${v} with edge weight ${w}`,
          inMST: new Set(inMST),
          mst: [...mst],
          totalWeight,
          key: Object.fromEntries(key),
          parent: Object.fromEntries(parent),
          pq: [...pq],
          current: u,
          exploringEdge: [u, v],
          consideringEdge: null,
        });

        if (!inMST.has(v)) {
          addState({
            line: 8,
            explanation: `${v} not in MST, check if we can improve its key`,
            inMST: new Set(inMST),
            mst: [...mst],
            totalWeight,
            key: Object.fromEntries(key),
            parent: Object.fromEntries(parent),
            pq: [...pq],
            current: u,
            exploringEdge: [u, v],
            consideringEdge: [u, v],
          });

          if (w < key.get(v)) {
            const oldKey = key.get(v);
            key.set(v, w);
            parent.set(v, u);
            pq.push({ node: v, key: w });

            addState({
              line: 9,
              explanation: `Update key[${v}]: ${oldKey === Infinity ? '∞' : oldKey} → ${w}, set parent[${v}] = ${u}`,
              inMST: new Set(inMST),
              mst: [...mst],
              totalWeight,
              key: Object.fromEntries(key),
              parent: Object.fromEntries(parent),
              pq: [...pq],
              current: u,
              exploringEdge: [u, v],
              consideringEdge: [u, v],
            });
          } else {
            addState({
              line: 10,
              explanation: `Weight ${w} ≥ key[${v}] (${key.get(v) === Infinity ? '∞' : key.get(v)}) → no update`,
              inMST: new Set(inMST),
              mst: [...mst],
              totalWeight,
              key: Object.fromEntries(key),
              parent: Object.fromEntries(parent),
              pq: [...pq],
              current: u,
              exploringEdge: [u, v],
              consideringEdge: null,
            });
          }
        } else {
          addState({
            line: 11,
            explanation: `${v} already in MST → skip`,
            inMST: new Set(inMST),
            mst: [...mst],
            totalWeight,
            key: Object.fromEntries(key),
            parent: Object.fromEntries(parent),
            pq: [...pq],
            current: u,
            exploringEdge: [u, v],
            consideringEdge: null,
          });
        }
      }
    }

    // Final state
    addState({
      finished: true,
      line: 12,
      explanation: `Prim's algorithm complete! MST has ${mst.length} edges with total weight ${totalWeight}`,
      inMST: new Set(inMST),
      mst: [...mst],
      totalWeight,
      key: Object.fromEntries(key),
      parent: Object.fromEntries(parent),
      pq: [],
      current: null,
      exploringEdge: null,
      consideringEdge: null,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, [nodesStr, edgesStr, startNode, layoutPositions, isDemo, demoInterval]);

  const load = () => {
    setIsLoaded(true);
    generateHistory();
    setIsDemo(false);
  };

  const runDemo = () => {
    setNodesStr("0,1,2,3,4");
    setEdgesStr("0-1-4,0-2-1,1-2-2,1-3-1,2-3-5,3-4-3");
    setStartNode("0");
    setTimeout(() => {
      setIsLoaded(true);
      generateHistory();
      setIsDemo(true);
    }, 100);
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
      }, 1400);
      setDemoInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isDemo, isLoaded, history.length]);

  const state = history[currentStep] || {};

  const code = useMemo(
    () => [
      { l: 1, c: [{ t: "map<node, int> key; map<node, node> parent;", c: "" }] },
      { l: 2, c: [{ t: "priority_queue<pair<int,node>> pq; pq.push({0, start});", c: "" }] },
      { l: 3, c: [{ t: "while (!pq.empty()) {", c: "purple" }] },
      { l: 4, c: [{ t: "  auto [k, u] = pq.top(); pq.pop();", c: "" }] },
      { l: 5, c: [{ t: "  if (inMST[u]) continue;", c: "purple" }] },
      { l: 6, c: [{ t: "  inMST[u] = true; totalWeight += k;", c: "" }] },
      { l: 7, c: [{ t: "  for (auto [v, w] : adj[u]) {", c: "purple" }] },
      { l: 8, c: [{ t: "    if (!inMST[v] && w < key[v]) {", c: "purple" }] },
      { l: 9, c: [{ t: "      key[v] = w; parent[v] = u; pq.push({w, v});", c: "" }] },
      { l: 10, c: [{ t: "    }", c: "light" }] },
      { l: 11, c: [{ t: "  }", c: "light" }] },
      { l: 12, c: [{ t: "}", c: "light" }] },
    ],
    []
  );

  const colorMap = {
    purple: "text-blue-400",
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

  const isInMST = (u, v) => {
    return (state.mst || []).some(
      ([a, b]) => (a === u && b === v) || (a === v && b === u)
    );
  };

  const isExploringEdge = (u, v) => {
    if (!state.exploringEdge) return false;
    const [a, b] = state.exploringEdge;
    return (a === u && b === v) || (a === v && b === u);
  };

  const isConsideringEdge = (u, v) => {
    if (!state.consideringEdge) return false;
    const [a, b] = state.consideringEdge;
    return (a === u && b === v) || (a === v && b === u);
  };

  const isNodeInMST = (n) => {
    return (state.inMST || new Set()).has(n);
  };

  const isCurrent = (n) => state.current === n;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <style>{`
        .custom-scrollbar-blue {
          scrollbar-width: thin;
          scrollbar-color: #3B82F6 #1F2937;
        }
        .custom-scrollbar-blue::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-blue::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .custom-scrollbar-blue::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3B82F6, #2563EB);
          border-radius: 4px;
          border: 1px solid #1D4ED8;
        }
        .custom-scrollbar-blue::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563EB, #1D4ED8);
        }
      `}</style>

      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          Prim's Algorithm
        </h1>
        <p className="text-xl text-gray-400 mt-3">Minimum Spanning Tree using Priority Queue</p>
      </header>

      {/* Input Controls */}
      {!isLoaded && (
        <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nodes (comma-separated):
              </label>
              <input
                type="text"
                value={nodesStr}
                onChange={(e) => setNodesStr(e.target.value)}
                className="w-full font-mono bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
                placeholder="0,1,2,3,4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Edges (format: u-v-weight):
              </label>
              <input
                type="text"
                value={edgesStr}
                onChange={(e) => setEdgesStr(e.target.value)}
                className="w-full font-mono bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
                placeholder="0-1-4,0-2-1,1-3-1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Start Node:
              </label>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                className="w-full font-mono bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
              >
                {nodesStr.split(",").map((node) => (
                  <option key={node.trim()} value={node.trim()}>
                    {node.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={load}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Load & Visualize
            </button>
            <button
              onClick={runDemo}
              className="bg-gradient-to-r from-yellow-500 to-blue-400 hover:from-yellow-600 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Demo
            </button>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      {isLoaded && (
        <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
          <div className="flex items-center justify-center gap-3">
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
              className="bg-gradient-to-r from-yellow-500 to-blue-400 hover:from-yellow-600 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
              disabled={isDemo}
            >
              Demo
            </button>
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code + Data Structures Panel */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
            <div>
              <h3 className="font-bold text-2xl text-blue-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                <Code size={22} />
                C++ Solution
              </h3>
              <pre className="text-sm overflow-auto max-h-64 custom-scrollbar-blue">
                <code className="font-mono leading-relaxed">
                  {code.map((line) => (
                    <CodeLine key={line.l} line={line.l} content={line.c} />
                  ))}
                </code>
              </pre>
            </div>

            {/* Priority Queue */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-blue-300 mb-3 flex items-center gap-2">
                <Layers size={18} />
                Priority Queue
              </h4>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar-blue">
                {(state.pq || []).length === 0 && (
                  <span className="text-gray-500 italic text-sm">Priority queue is empty</span>
                )}
                {(state.pq || []).sort((a, b) => a.key - b.key).map((item, i) => (
                  <div key={`${item.node}-${item.key}-${i}`} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                    <span className="font-mono text-sm text-gray-300">{item.node}</span>
                    <span className="font-mono text-xs text-blue-300">key: {item.key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MST Info */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-blue-300 mb-3 flex items-center gap-2">
                <ListOrdered size={18} />
                MST Progress
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Edges in MST:</span>
                  <span className="font-mono text-blue-300 font-bold">
                    {state.mst?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Weight:</span>
                  <span className="font-mono text-blue-300 font-bold">
                    {state.totalWeight || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nodes in MST:</span>
                  <span className="font-mono text-gray-300">
                    {state.inMST?.size || 0} / {state.nodes?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Values */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-blue-300 mb-3">Key Values</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar-blue">
                {Object.entries(state.key || {}).map(([node, keyVal]) => (
                  <div key={node} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                    <span className="font-mono text-xs text-gray-300">{node}:</span>
                    <span className="font-mono text-xs text-blue-300">
                      {keyVal === Infinity ? "∞" : keyVal}
                    </span>
                  </div>
                ))}
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
                  MST Weight: {state.totalWeight || 0}
                </div>
              </div>

              <div className="relative bg-gray-900/30 rounded-xl p-4 custom-scrollbar-blue" style={{ width: "100%", height: "450px", overflow: "auto" }}>
                <svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                  {/* Edges */}
                  {(state.edges || []).map(([u, v, weight], idx) => {
                    const p1 = state.positions?.get(u);
                    const p2 = state.positions?.get(v);
                    if (!p1 || !p2) return null;

                    const inMST = isInMST(u, v);
                    const exploring = isExploringEdge(u, v);
                    const considering = isConsideringEdge(u, v);

                    let color = "#4B5563"; // gray
                    let width = 2;

                    if (inMST) {
                      color = "#3B82F6"; // blue for MST
                      width = 5;
                    } else if (considering) {
                      color = "#22C55E"; // green for considering
                      width = 4;
                    } else if (exploring) {
                      color = "#FBBF24"; // yellow for exploring
                      width = 3;
                    }

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    return (
                      <g key={idx}>
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={color}
                          strokeWidth={width}
                          className="transition-all duration-300 drop-shadow"
                        />
                        {/* Weight label */}
                        <circle cx={midX} cy={midY} r="14" fill="#1F2937" stroke={color} strokeWidth="2" />
                        <text x={midX} y={midY + 4} textAnchor="middle" className="fill-white text-xs font-mono font-bold">
                          {weight}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Nodes */}
                <div className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                  {(state.nodes || []).map((n) => {
                    const p = state.positions?.get(n);
                    const inMST = isNodeInMST(n);
                    const current = isCurrent(n);
                    const isStart = n === startNode;

                    return (
                      <div key={n} className="absolute" style={{ left: `${(p?.x || 0) - 26}px`, top: `${(p?.y || 0) - 26}px` }}>
                        <div
                          className={`w-[52px] h-[52px] flex items-center justify-center rounded-full font-mono text-base font-bold text-white border-4 transition-all duration-300 shadow-2xl ${
                            current
                              ? "bg-gradient-to-br from-blue-400 to-cyan-500 border-white scale-110 shadow-blue-500/50"
                              : inMST
                              ? "bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-400"
                              : isStart
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-300"
                              : "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-400"
                          }`}
                        >
                          {n}
                        </div>
                        {/* Key label */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                          <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded border border-gray-600 text-blue-300">
                            {state.key?.[n] === Infinity ? "∞" : state.key?.[n] || "0"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 border-2 border-white" />
                    <span className="text-gray-300 font-semibold">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-300" />
                    <span className="text-gray-300 font-semibold">Start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 border-2 border-blue-400" />
                    <span className="text-gray-300 font-semibold">In MST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-blue-400" />
                    <span className="text-gray-300 font-semibold">MST Edge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-yellow-400" />
                    <span className="text-gray-300 font-semibold">Exploring</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation - WITH TOGGLE BUTTON */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem] max-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-400 text-sm font-semibold">Step Explanation</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all font-semibold ${
                      autoScroll
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                        : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    {autoScroll ? '🔽 Auto-scroll ON' : '⏸️ Auto-scroll OFF'}
                  </button>
                  {isDemo && (
                    <span className="text-yellow-300 font-semibold text-xs">Demo mode: Auto-running</span>
                  )}
                </div>
              </div>
              <div
                ref={explanationRef}
                className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar-blue"
              >
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
                          ? "bg-blue-500/20 border-blue-400 text-blue-100"
                          : "bg-gray-800/50 border-gray-600 text-gray-300"
                      }`}
                      ref={index === currentStep && autoScroll ? (el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest" }) : null}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-xs font-mono px-2 py-1 rounded ${
                            index === currentStep
                              ? "bg-blue-500 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
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

          {/* Complexity Analysis */}
          <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-blue-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
              <Clock size={24} />
              Complexity Analysis
            </h3>
            <div className="space-y-5 text-base">
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-300 text-lg mb-2">
                  Time Complexity: <span className="font-mono text-cyan-300">O((V + E) log V)</span>
                </h4>
                <p className="text-gray-300">
                  Using a priority queue: O(V) for extraction and O(E log V) for edge relaxations.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-300 text-lg mb-2">
                  Space Complexity: <span className="font-mono text-cyan-300">O(V)</span>
                </h4>
                <p className="text-gray-300">
                  Space for key array, parent array, MST set, and priority queue.
                </p>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                <h4 className="font-semibold text-blue-300 text-lg mb-2">💡 Key Insights</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Prim's algorithm grows the MST from a starting node, adding the minimum weight edge at each step.</li>
                  <li>Uses a greedy approach: always pick the edge with minimum weight connecting MST to a non-MST node.</li>
                  <li>Priority queue efficiently finds the next minimum edge to add.</li>
                  <li>Key array tracks the minimum weight edge connecting each node to the current MST.</li>
                  <li>Works best on dense graphs; Kruskal's is better for sparse graphs.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Network size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-xl">Configure your graph and click "Load & Visualize" to begin</p>
        </div>
      )}
    </div>
  );
};

export default Prims;
