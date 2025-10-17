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

const Kruskal = ({ navigate }) => {
  const [nodesStr, setNodesStr] = useState("0,1,2,3,4");
  const [edgesStr, setEdgesStr] = useState("0-1-4,0-2-1,1-2-2,1-3-1,2-3-5,3-4-3");
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

    // Union-Find (Disjoint Set Union) implementation
    class UnionFind {
      constructor(nodes) {
        this.parent = new Map();
        this.rank = new Map();
        nodes.forEach((n) => {
          this.parent.set(n, n);
          this.rank.set(n, 0);
        });
      }

      find(x) {
        if (this.parent.get(x) !== x) {
          this.parent.set(x, this.find(this.parent.get(x)));
        }
        return this.parent.get(x);
      }

      union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX === rootY) return false;

        if (this.rank.get(rootX) < this.rank.get(rootY)) {
          this.parent.set(rootX, rootY);
        } else if (this.rank.get(rootX) > this.rank.get(rootY)) {
          this.parent.set(rootY, rootX);
        } else {
          this.parent.set(rootY, rootX);
          this.rank.set(rootX, this.rank.get(rootX) + 1);
        }
        return true;
      }

      getParentMap() {
        return Object.fromEntries(this.parent);
      }

      getRankMap() {
        return Object.fromEntries(this.rank);
      }
    }

    const uf = new UnionFind(nodes);
    const mst = [];
    let totalWeight = 0;

    // Sort edges by weight
    const sortedEdges = [...edges].sort((a, b) => a[2] - b[2]);

    addState({
      line: 1,
      explanation: "Initialize Union-Find structure for all nodes",
      sortedEdges: sortedEdges,
      currentEdge: null,
      currentEdgeIndex: -1,
      mst: [...mst],
      totalWeight,
      parent: uf.getParentMap(),
      rank: uf.getRankMap(),
      edgeStatus: null,
    });

    addState({
      line: 2,
      explanation: `Sort all ${edges.length} edges by weight in ascending order`,
      sortedEdges: sortedEdges,
      currentEdge: null,
      currentEdgeIndex: -1,
      mst: [...mst],
      totalWeight,
      parent: uf.getParentMap(),
      rank: uf.getRankMap(),
      edgeStatus: null,
    });

    // Process each edge
    sortedEdges.forEach(([u, v, w], idx) => {
      addState({
        line: 3,
        explanation: `Consider edge ${u}-${v} with weight ${w} (${idx + 1}/${sortedEdges.length})`,
        sortedEdges: sortedEdges,
        currentEdge: [u, v],
        currentEdgeIndex: idx,
        mst: [...mst],
        totalWeight,
        parent: uf.getParentMap(),
        rank: uf.getRankMap(),
        edgeStatus: "considering",
      });

      const rootU = uf.find(u);
      const rootV = uf.find(v);

      addState({
        line: 4,
        explanation: `Find roots: ${u} → ${rootU}, ${v} → ${rootV}`,
        sortedEdges: sortedEdges,
        currentEdge: [u, v],
        currentEdgeIndex: idx,
        mst: [...mst],
        totalWeight,
        parent: uf.getParentMap(),
        rank: uf.getRankMap(),
        edgeStatus: "checking",
        highlightNodes: [u, v, rootU, rootV],
      });

      if (rootU !== rootV) {
        // No cycle - add to MST
        uf.union(u, v);
        mst.push([u, v, w]);
        totalWeight += w;

        addState({
          line: 5,
          explanation: `Different components! Add edge ${u}-${v} (weight ${w}) to MST. Total weight: ${totalWeight}`,
          sortedEdges: sortedEdges,
          currentEdge: [u, v],
          currentEdgeIndex: idx,
          mst: [...mst],
          totalWeight,
          parent: uf.getParentMap(),
          rank: uf.getRankMap(),
          edgeStatus: "accepted",
          highlightNodes: [u, v],
        });
      } else {
        // Cycle detected - skip edge
        addState({
          line: 6,
          explanation: `Same component (${rootU})! Skip edge ${u}-${v} to avoid cycle`,
          sortedEdges: sortedEdges,
          currentEdge: [u, v],
          currentEdgeIndex: idx,
          mst: [...mst],
          totalWeight,
          parent: uf.getParentMap(),
          rank: uf.getRankMap(),
          edgeStatus: "rejected",
          highlightNodes: [u, v],
        });
      }
    });

    // Final state
    addState({
      finished: true,
      line: 7,
      explanation: `Kruskal's algorithm complete! MST has ${mst.length} edges with total weight ${totalWeight}`,
      sortedEdges: sortedEdges,
      currentEdge: null,
      currentEdgeIndex: sortedEdges.length,
      mst: [...mst],
      totalWeight,
      parent: uf.getParentMap(),
      rank: uf.getRankMap(),
      edgeStatus: null,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, [nodesStr, edgesStr, layoutPositions, isDemo, demoInterval]);

  const load = () => {
    setIsLoaded(true);
    generateHistory();
    setIsDemo(false);
  };

  const runDemo = () => {
    setNodesStr("0,1,2,3,4");
    setEdgesStr("0-1-4,0-2-1,1-2-2,1-3-1,2-3-5,3-4-3");
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
      { l: 1, c: [{ t: "struct Edge { int u, v, weight; };", c: "" }] },
      { l: 2, c: [{ t: "sort(edges.begin(), edges.end(), [](Edge a, Edge b) { return a.weight < b.weight; });", c: "" }] },
      { l: 3, c: [{ t: "for (auto& edge : edges) {", c: "purple" }] },
      { l: 4, c: [{ t: "  int rootU = find(edge.u);", c: "" }] },
      { l: 5, c: [{ t: "  int rootV = find(edge.v);", c: "" }] },
      { l: 6, c: [{ t: "  if (rootU != rootV) {", c: "purple" }] },
      { l: 7, c: [{ t: "    mst.push_back(edge);", c: "" }] },
      { l: 8, c: [{ t: "    unionSets(rootU, rootV);", c: "" }] },
      { l: 9, c: [{ t: "  }", c: "light" }] },
      { l: 10, c: [{ t: "}", c: "light" }] },
    ],
    []
  );

  const colorMap = {
    purple: "text-green-400",
    light: "text-gray-300",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors px-2 py-1 ${
        state.line === line ? "bg-green-500/20 border-l-4 border-green-400" : ""
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

  const isCurrentEdge = (u, v) => {
    if (!state.currentEdge) return false;
    const [a, b] = state.currentEdge;
    return (a === u && b === v) || (a === v && b === u);
  };

  const isHighlighted = (n) => {
    return (state.highlightNodes || []).includes(n);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <style>{`
        .custom-scrollbar-green {
          scrollbar-width: thin;
          scrollbar-color: #22C55E #1F2937;
        }
        .custom-scrollbar-green::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-green::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .custom-scrollbar-green::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #22C55E, #10B981);
          border-radius: 4px;
          border: 1px solid #16A34A;
        }
        .custom-scrollbar-green::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #16A34A, #059669);
        }
      `}</style>
      
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Kruskal's Algorithm
        </h1>
        <p className="text-xl text-gray-400 mt-3">Minimum Spanning Tree using Union-Find</p>
      </header>

      {/* Input Controls */}
      {!isLoaded && (
        <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nodes (comma-separated):
              </label>
              <input
                type="text"
                value={nodesStr}
                onChange={(e) => setNodesStr(e.target.value)}
                className="w-full font-mono bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-green-500 focus:outline-none transition-colors text-white"
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
                className="w-full font-mono bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-green-500 focus:outline-none transition-colors text-white"
                placeholder="0-1-4,0-2-1,1-3-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={load}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Load & Visualize
            </button>
            <button
              onClick={runDemo}
              className="bg-gradient-to-r from-yellow-500 to-green-400 hover:from-yellow-600 hover:to-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
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
              className="bg-gradient-to-r from-yellow-500 to-green-400 hover:from-yellow-600 hover:to-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
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
              <h3 className="font-bold text-2xl text-green-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                <Code size={22} />
                C++ Solution
              </h3>
              <pre className="text-sm overflow-auto max-h-64 custom-scrollbar-green">
                <code className="font-mono leading-relaxed">
                  {code.map((line) => (
                    <CodeLine key={line.l} line={line.l} content={line.c} />
                  ))}
                </code>
              </pre>
            </div>

            {/* Sorted Edges */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-green-300 mb-3 flex items-center gap-2">
                <ListOrdered size={18} />
                Sorted Edges
              </h4>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar-green">
                {(state.sortedEdges || []).map(([u, v, w], i) => {
                  const processed = i < (state.currentEdgeIndex || -1);
                  const current = i === state.currentEdgeIndex;
                  const inMST = isInMST(u, v);
                  
                  return (
                    <div
                      key={`${u}-${v}-${i}`}
                      className={`flex items-center justify-between p-2 rounded border transition-all ${
                        current
                          ? "bg-yellow-500/20 border-yellow-400"
                          : inMST
                          ? "bg-green-500/20 border-green-400"
                          : processed
                          ? "bg-red-500/10 border-red-400/30"
                          : "bg-gray-800 border-gray-600"
                      }`}
                    >
                      <span className="font-mono text-sm text-gray-300">
                        {u} - {v}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-green-300">w: {w}</span>
                        {inMST && <span className="text-xs bg-green-500 text-white px-1 rounded">✓</span>}
                        {processed && !inMST && <span className="text-xs bg-red-500 text-white px-1 rounded">✗</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MST Info */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-green-300 mb-3 flex items-center gap-2">
                <Layers size={18} />
                MST Progress
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Edges in MST:</span>
                  <span className="font-mono text-green-300 font-bold">
                    {state.mst?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Weight:</span>
                  <span className="font-mono text-green-300 font-bold">
                    {state.totalWeight || 0}
                  </span>
                </div>
               <div className="flex justify-between text-sm">
                <span className="text-gray-400">Edges Processed:</span>
                <span className="font-mono text-gray-300">
                  {state.finished ? state.sortedEdges?.length || 0 
                  : Math.max(0, (state.currentEdgeIndex || -1) + 1)
                  } / {state.sortedEdges?.length || 0}
                </span>
                </div>

              </div>
            </div>

            {/* Union-Find Status */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-green-300 mb-3">Parent Array</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar-green">
                {Object.entries(state.parent || {}).map(([node, parent]) => (
                  <div key={node} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                    <span className="font-mono text-xs text-gray-300">{node}:</span>
                    <span className="font-mono text-xs text-green-300">{parent}</span>
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

              <div className="relative bg-gray-900/30 rounded-xl p-4 custom-scrollbar-green" style={{ width: "100%", height: "450px", overflow: "auto" }}>
                <svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                  {/* Edges */}
                  {(state.edges || []).map(([u, v, weight], idx) => {
                    const p1 = state.positions?.get(u);
                    const p2 = state.positions?.get(v);
                    if (!p1 || !p2) return null;

                    const inMST = isInMST(u, v);
                    const isCurrent = isCurrentEdge(u, v);
                    
                    let color = "#4B5563"; // gray
                    let width = 2;
                    
                    if (inMST) {
                      color = "#22C55E"; // green for MST
                      width = 5;
                    } else if (isCurrent) {
                      if (state.edgeStatus === "accepted") {
                        color = "#22C55E"; // green when accepted
                        width = 5;
                      } else if (state.edgeStatus === "rejected") {
                        color = "#EF4444"; // red when rejected
                        width = 4;
                      } else {
                        color = "#FBBF24"; // yellow when considering
                        width = 4;
                      }
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
                    const highlighted = isHighlighted(n);
                    
                    return (
                      <div key={n} className="absolute" style={{ left: `${(p?.x || 0) - 26}px`, top: `${(p?.y || 0) - 26}px` }}>
                        <div
                          className={`w-[52px] h-[52px] flex items-center justify-center rounded-full font-mono text-base font-bold text-white border-4 transition-all duration-300 shadow-2xl ${
                            highlighted
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 border-white scale-110 shadow-green-500/50"
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-green-500" />
                    <span className="text-gray-300 font-semibold">In MST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-yellow-400" />
                    <span className="text-gray-300 font-semibold">Considering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-red-500" />
                    <span className="text-gray-300 font-semibold">Rejected (Cycle)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-gray-500" />
                    <span className="text-gray-300 font-semibold">Not Processed</span>
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
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
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
                className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar-green"
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
                          ? "bg-green-500/20 border-green-400 text-green-100"
                          : "bg-gray-800/50 border-gray-600 text-gray-300"
                      }`}
                      ref={index === currentStep && autoScroll ? (el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest" }) : null}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-xs font-mono px-2 py-1 rounded ${
                            index === currentStep
                              ? "bg-green-500 text-white"
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
            <h3 className="font-bold text-2xl text-green-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
              <Clock size={24} />
              Complexity Analysis
            </h3>
            <div className="space-y-5 text-base">
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-300 text-lg mb-2">
                  Time Complexity: <span className="font-mono text-emerald-300">O(E log E)</span>
                </h4>
                <p className="text-gray-300">
                  Dominated by sorting edges O(E log E). Union-Find operations are nearly O(1) with path compression.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-300 text-lg mb-2">
                  Space Complexity: <span className="font-mono text-emerald-300">O(V + E)</span>
                </h4>
                <p className="text-gray-300">
                  Space for parent and rank arrays O(V), plus storage for edges O(E).
                </p>
              </div>
              <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                <h4 className="font-semibold text-green-300 text-lg mb-2">💡 Key Insights</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Kruskal's algorithm finds the Minimum Spanning Tree (MST) of a connected, weighted graph.</li>
                  <li>Greedy approach: always pick the smallest weight edge that doesn't form a cycle.</li>
                  <li>Union-Find efficiently detects cycles by checking if two nodes are in the same component.</li>
                  <li>MST has exactly V-1 edges for a graph with V vertices.</li>
                  <li>Works on disconnected graphs too - produces Minimum Spanning Forest.</li>
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

export default Kruskal;
