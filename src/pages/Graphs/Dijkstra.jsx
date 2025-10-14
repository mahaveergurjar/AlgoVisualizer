import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Code, Clock, Network, Layers, ListOrdered } from "lucide-react";

// Helper to parse inputs safely
const parseGraphInput = (nodesStr, edgesStr, directed) => {
  // nodes can be comma separated labels like: 0,1,2,3 or A,B,C
  const nodes = nodesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // edges as u-v-w triplets: 0-1-5,0-2-3,1-3-2 (node-node-weight)
  const edges = edgesStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((triplet) => {
      const parts = triplet.split(/[-:]/).map((s) => s.trim());
      if (parts.length === 2) {
        // Default weight of 1 if not specified
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

  // Build adjacency list with weights
  const adj = new Map(nodes.map((n) => [n, []]));
  edges.forEach(([u, v, w]) => {
    if (!adj.has(u)) adj.set(u, []);
    if (!adj.has(v)) adj.set(v, []);
    adj.get(u).push({ node: v, weight: w });
    if (!directed) adj.get(v).push({ node: u, weight: w });
  });

  return { nodes, edges, adj };
};

const Dijkstra = ({ navigate }) => {
  const [nodesStr, setNodesStr] = useState("0,1,2,3,4");
  const [edgesStr, setEdgesStr] = useState("0-1-4,0-2-1,1-3-1,2-1-2,2-3-5,3-4-3");
  const [startNode, setStartNode] = useState("0");
  const [endNode, setEndNode] = useState("4");
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
    if (!nodes.includes(endNode)) {
      alert("End node must exist in the node list.");
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

    // Dijkstra's algorithm structures
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const pq = []; // Priority queue (min-heap simulation)

    // Initialize distances
    nodes.forEach((node) => {
      distances.set(node, node === startNode ? 0 : Infinity);
      previous.set(node, null);
    });

    // code line refs
    // 1: init distances
    // 2: add start to pq
    // 3: while pq not empty
    // 4: u = extract min
    // 5: if u visited, continue
    // 6: mark u visited
    // 7: if u is target, done
    // 8: for each neighbor v
    // 9: calculate new distance
    // 10: if shorter, update

    addState({
      line: 1,
      explanation: "Initialize distances: start=0, others=∞",
      distances: Object.fromEntries(distances),
      previous: Object.fromEntries(previous),
      visited: [...visited],
      pq: [...pq],
      current: null,
      exploringEdge: null,
      relaxingEdge: null,
      finalPath: [],
    });

    pq.push({ node: startNode, dist: 0 });
    addState({
      line: 2,
      explanation: `Add ${startNode} to priority queue with distance 0`,
      distances: Object.fromEntries(distances),
      previous: Object.fromEntries(previous),
      visited: [...visited],
      pq: [...pq],
      current: startNode,
      exploringEdge: null,
      relaxingEdge: null,
      finalPath: [],
    });

    while (pq.length > 0) {
      addState({
        line: 3,
        explanation: "Priority queue not empty → continue Dijkstra",
        distances: Object.fromEntries(distances),
        previous: Object.fromEntries(previous),
        visited: [...visited],
        pq: [...pq],
        current: pq[0]?.node,
        exploringEdge: null,
        relaxingEdge: null,
        finalPath: [],
      });

      // Extract minimum (simulate priority queue)
      pq.sort((a, b) => a.dist - b.dist);
      const { node: u, dist } = pq.shift();

      addState({
        line: 4,
        explanation: `Extract ${u} with distance ${dist} from priority queue`,
        distances: Object.fromEntries(distances),
        previous: Object.fromEntries(previous),
        visited: [...visited],
        pq: [...pq],
        current: u,
        exploringEdge: null,
        relaxingEdge: null,
        finalPath: [],
      });

      if (visited.has(u)) {
        addState({
          line: 5,
          explanation: `${u} already visited → skip`,
          distances: Object.fromEntries(distances),
          previous: Object.fromEntries(previous),
          visited: [...visited],
          pq: [...pq],
          current: u,
          exploringEdge: null,
          relaxingEdge: null,
          finalPath: [],
        });
        continue;
      }

      visited.add(u);
      addState({
        line: 6,
        explanation: `Mark ${u} as visited`,
        distances: Object.fromEntries(distances),
        previous: Object.fromEntries(previous),
        visited: [...visited],
        pq: [...pq],
        current: u,
        exploringEdge: null,
        relaxingEdge: null,
        finalPath: [],
      });

      if (u === endNode) {
        // Build path
        const path = [];
        let curr = endNode;
        while (curr !== null) {
          path.unshift(curr);
          curr = previous.get(curr);
        }
        
        addState({
          line: 7,
          explanation: `Reached target ${endNode}! Shortest path found with distance ${distances.get(endNode)}`,
          distances: Object.fromEntries(distances),
          previous: Object.fromEntries(previous),
          visited: [...visited],
          pq: [...pq],
          current: u,
          exploringEdge: null,
          relaxingEdge: null,
          finalPath: path,
        });
        break;
      }

      // Process neighbors
      for (const { node: v, weight } of adj.get(u) || []) {
        addState({
          line: 8,
          explanation: `Examine neighbor ${v} with edge weight ${weight}`,
          distances: Object.fromEntries(distances),
          previous: Object.fromEntries(previous),
          visited: [...visited],
          pq: [...pq],
          current: u,
          exploringEdge: [u, v],
          relaxingEdge: null,
          finalPath: [],
        });

        const newDist = distances.get(u) + weight;
        addState({
          line: 9,
          explanation: `Calculate new distance: ${distances.get(u)} + ${weight} = ${newDist}`,
          distances: Object.fromEntries(distances),
          previous: Object.fromEntries(previous),
          visited: [...visited],
          pq: [...pq],
          current: u,
          exploringEdge: [u, v],
          relaxingEdge: null,
          finalPath: [],
        });

        if (newDist < distances.get(v)) {
          distances.set(v, newDist);
          previous.set(v, u);
          pq.push({ node: v, dist: newDist });
          
          addState({
            line: 10,
            explanation: `${newDist} < ${distances.get(v) === newDist ? "∞" : distances.get(v)} → Update distance and add ${v} to queue`,
            distances: Object.fromEntries(distances),
            previous: Object.fromEntries(previous),
            visited: [...visited],
            pq: [...pq],
            current: u,
            exploringEdge: [u, v],
            relaxingEdge: [u, v],
            finalPath: [],
          });
        }
      }
    }

    // Final state
    const finalPath = [];
    let curr = endNode;
    while (curr !== null && previous.get(curr) !== undefined) {
      finalPath.unshift(curr);
      curr = previous.get(curr);
    }
    if (curr === startNode) finalPath.unshift(startNode);

    addState({
      finished: true,
      line: 0,
      explanation: visited.has(endNode) 
        ? `Dijkstra complete! Shortest path: ${finalPath.join(" → ")} with distance ${distances.get(endNode)}`
        : `Dijkstra complete! No path found from ${startNode} to ${endNode}`,
      distances: Object.fromEntries(distances),
      previous: Object.fromEntries(previous),
      visited: [...visited],
      pq: [],
      current: null,
      exploringEdge: null,
      relaxingEdge: null,
      finalPath: visited.has(endNode) ? finalPath : [],
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, [nodesStr, edgesStr, directed, startNode, endNode, layoutPositions]);

  const load = () => {
    setIsLoaded(true);
    generateHistory();
    setIsDemo(false);
  };

  // Demo: auto-fill a sample graph and animate Dijkstra
  const runDemo = () => {
    setNodesStr("0,1,2,3,4");
    setEdgesStr("0-1-4,0-2-1,1-3-1,2-1-2,2-3-5,3-4-3");
    setStartNode("0");
    setEndNode("4");
    setDirected(false);
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

  // Demo animation: auto-step through Dijkstra
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
      }, 1200); // Slightly slower for Dijkstra complexity
      setDemoInterval(interval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [isDemo, isLoaded, history.length]);

  const state = history[currentStep] || {};

  const code = useMemo(
    () => [
      { l: 1, c: [
        { t: "map<node,int> dist; map<node,node> prev; set<node> visited;", c: "" },
      ]},
      { l: 2, c: [
        { t: "priority_queue<pair<int,node>> pq; pq.push({0, start});", c: "" },
      ]},
      { l: 3, c: [
        { t: "while (!pq.empty()) {", c: "purple" },
      ]},
      { l: 4, c: [
        { t: "  auto [d, u] = pq.top(); pq.pop();", c: "" },
      ]},
      { l: 5, c: [
        { t: "  if (visited.count(u)) continue;", c: "purple" },
      ]},
      { l: 6, c: [
        { t: "  visited.insert(u);", c: "" },
      ]},
      { l: 7, c: [
        { t: "  if (u == target) break;", c: "purple" },
      ]},
      { l: 8, c: [
        { t: "  for (auto [v, w] : adj[u]) {", c: "purple" },
      ]},
      { l: 9, c: [
        { t: "    int newDist = dist[u] + w;", c: "" },
      ]},
      { l: 10, c: [
        { t: "    if (newDist < dist[v]) { dist[v]=newDist; prev[v]=u; pq.push({-newDist,v}); }", c: "" },
      ]},
      { l: 11, c: [ { t: "  }", c: "light" } ]},
      { l: 12, c: [ { t: "}", c: "light" } ]},
    ],
    []
  );

  const colorMap = {
    purple: "text-orange-400",
    light: "text-gray-300",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors px-2 py-1 ${
        state.line === line ? "bg-orange-500/20 border-l-4 border-orange-400" : ""
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
  const isInPQ = (n) => (state.pq || []).some(item => item.node === n);
  const isCurrent = (n) => state.current === n;
  const isInFinalPath = (n) => (state.finalPath || []).includes(n);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <style>{`
        .custom-scrollbar-orange {
          scrollbar-width: thin;
          scrollbar-color: #F97316 #1F2937;
        }
        .custom-scrollbar-orange::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-orange::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .custom-scrollbar-orange::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #F97316, #EF4444);
          border-radius: 4px;
          border: 1px solid #EA580C;
        }
        .custom-scrollbar-orange::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #EA580C, #DC2626);
        }
      `}</style>
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Dijkstra's Algorithm
        </h1>
        <p className="text-xl text-gray-400 mt-3">Shortest path in weighted graphs</p>
      </header>

      {/* Controls */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-col gap-4 items-center">
          {/* Node Selection */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">Start:</label>
              <select
                value={startNode}
                onChange={(e) => {
                  setStartNode(e.target.value);
                  if (isLoaded) {
                    // Regenerate algorithm with new start node
                    setTimeout(() => {
                      generateHistory();
                    }, 50);
                  }
                }}
                className="font-mono bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-orange-500 focus:outline-none transition-colors text-white"
              >
                {nodesStr.split(",").map((node) => (
                  <option key={node.trim()} value={node.trim()}>
                    {node.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">End:</label>
              <select
                value={endNode}
                onChange={(e) => {
                  setEndNode(e.target.value);
                  if (isLoaded) {
                    // Regenerate algorithm with new end node
                    setTimeout(() => {
                      generateHistory();
                    }, 50);
                  }
                }}
                className="font-mono bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-orange-500 focus:outline-none transition-colors text-white"
              >
                {nodesStr.split(",").map((node) => (
                  <option key={node.trim()} value={node.trim()}>
                    {node.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!isLoaded ? (
              <>
                <button
                  onClick={load}
                  className="bg-gradient-to-r from-orange-500 to-red-600 cursor-pointer hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                >
                  Load & Visualize
                </button>
                <button
                  onClick={runDemo}
                  className="bg-gradient-to-r from-yellow-500 to-orange-400 hover:from-yellow-600 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
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
                  className="bg-gradient-to-r from-yellow-500 to-orange-400 cursor-pointer hover:from-yellow-600 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                  disabled={isDemo}
                >
                  Demo
                </button>
              </>
            )}
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 font-bold cursor-pointer py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code + Priority Queue Panel */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
            <div>
              <h3 className="font-bold text-2xl text-orange-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                <Code size={22} />
                C++ Solution
              </h3>
              <pre className="text-sm overflow-auto max-h-80 custom-scrollbar-orange">
                <code className="font-mono leading-relaxed">
                  {code.map((line) => (
                    <CodeLine key={line.l} line={line.l} content={line.c} />
                  ))}
                </code>
              </pre>
            </div>

            {/* Priority Queue */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-orange-300 mb-3 flex items-center gap-2">
                <Layers size={18} />
                Priority Queue
              </h4>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar-orange">
                {(state.pq || []).length === 0 && (
                  <span className="text-gray-500 italic text-sm">Priority queue is empty</span>
                )}
                {(state.pq || []).sort((a, b) => a.dist - b.dist).map((item, i) => (
                  <div key={`${item.node}-${item.dist}-${i}`} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                    <span className="font-mono text-sm text-gray-300">{item.node}</span>
                    <span className="font-mono text-xs text-orange-300">dist: {item.dist}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distances */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-orange-300 mb-3 flex items-center gap-2">
                <ListOrdered size={18} />
                Distances
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(state.distances || {}).map(([node, dist]) => (
                  <div key={node} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600">
                    <span className="font-mono text-sm text-gray-300">{node}:</span>
                    <span className="font-mono text-xs text-orange-300">
                      {dist === Infinity ? "∞" : dist}
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
                  Weighted Graph Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-700/50 px-3 py-1 rounded-lg">
                  {state.visited?.length || 0} visited
                </div>
              </div>

              <div className="relative bg-gray-900/30 rounded-xl p-4 custom-scrollbar-orange" style={{ width: "100%", height: "450px", overflow: "auto" }}>
                <svg className="absolute top-0 left-0" style={{ width: "1000px", height: "450px" }}>
                  {/** Edges **/}
                  {(state.edges || []).map(([u, v, weight], idx) => {
                    const p1 = state.positions?.get(u);
                    const p2 = state.positions?.get(v);
                    if (!p1 || !p2) return null;
                    const isExploring = state.exploringEdge && ((state.exploringEdge[0] === u && state.exploringEdge[1] === v) || (!directed && state.exploringEdge[0] === v && state.exploringEdge[1] === u));
                    const isRelaxing = state.relaxingEdge && ((state.relaxingEdge[0] === u && state.relaxingEdge[1] === v) || (!directed && state.relaxingEdge[0] === v && state.relaxingEdge[1] === u));
                    const isInPath = (state.finalPath || []).length > 0 && state.finalPath.some((node, i) => 
                      i < state.finalPath.length - 1 && 
                      ((state.finalPath[i] === u && state.finalPath[i + 1] === v) || 
                       (state.finalPath[i] === v && state.finalPath[i + 1] === u))
                    );
                    
                    let color = "#4ade80"; // default green
                    let width = 2.5;
                    
                    if (isInPath) {
                      color = "#F59E0B"; // amber for final path
                      width = 4;
                    } else if (isRelaxing) {
                      color = "#EF4444"; // red for relaxing
                      width = 4;
                    } else if (isExploring) {
                      color = "#F97316"; // orange for exploring
                      width = 3;
                    }

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;
                    
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
                        {/* Weight label */}
                        <circle cx={midX} cy={midY} r="12" fill="#1F2937" stroke={color} strokeWidth="2" />
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
                    const visited = isVisited(n);
                    const inPQ = isInPQ(n);
                    const current = isCurrent(n);
                    const inPath = isInFinalPath(n);
                    const isStart = n === startNode;
                    const isEnd = n === endNode;
                    return (
                      <div key={n} className="absolute" style={{ left: `${(p?.x || 0) - 26}px`, top: `${(p?.y || 0) - 26}px` }}>
                        <div
                          className={`w-[52px] h-[52px] flex items-center justify-center rounded-full font-mono text-base font-bold text-white border-4 transition-all duration-300 shadow-2xl ${
                            current
                              ? "bg-gradient-to-br from-orange-400 to-red-500 border-white scale-110 shadow-orange-500/50"
                              : inPath
                              ? "bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-300"
                              : isStart
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-300"
                              : isEnd
                              ? "bg-gradient-to-br from-red-500 to-rose-600 border-red-300"
                              : visited
                              ? "bg-gradient-to-br from-orange-600 to-red-600 border-orange-400"
                              : inPQ
                              ? "bg-gradient-to-br from-yellow-600 to-orange-600 border-yellow-400"
                              : "bg-gradient-to-br from-gray-700 to-gray-600 border-gray-400"
                          }`}
                        >
                          {n}
                        </div>
                        {/* Distance label */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                          <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded border border-gray-600 text-orange-300">
                            {state.distances?.[n] === Infinity ? "∞" : state.distances?.[n] || "0"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white" /> <span className="text-gray-300 font-semibold">Current</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-300" /> <span className="text-gray-300 font-semibold">Start</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 border-2 border-red-300" /> <span className="text-gray-300 font-semibold">End</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 border-2 border-yellow-300" /> <span className="text-gray-300 font-semibold">Final Path</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-600 to-red-600 border-2 border-orange-400" /> <span className="text-gray-300 font-semibold">Visited</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-orange-400" /> <span className="text-gray-300 font-semibold">Exploring Edge</span></div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem] max-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-400 text-sm font-semibold">Step Explanation</h3>
                {isDemo && (
                  <span className="text-yellow-300 font-semibold text-xs">Demo mode: Auto-running</span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 custom-scrollbar-orange">
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
                          ? 'bg-orange-500/20 border-orange-400 text-orange-100' 
                          : 'bg-gray-800/50 border-gray-600 text-gray-300'
                      }`}
                      ref={index === currentStep ? (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) : null}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          index === currentStep 
                            ? 'bg-orange-500 text-white' 
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
            <h3 className="font-bold text-2xl text-orange-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
              <Clock size={24} />
              Complexity Analysis
            </h3>
            <div className="space-y-5 text-base">
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-orange-300 text-lg mb-2">
                  Time Complexity: <span className="font-mono text-red-300">O((V + E) log V)</span>
                </h4>
                <p className="text-gray-300">
                  Using a priority queue: O(V) for extraction and O(E log V) for edge relaxations.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-orange-300 text-lg mb-2">
                  Space Complexity: <span className="font-mono text-red-300">O(V)</span>
                </h4>
                <p className="text-gray-300">The priority queue, distance array, and predecessor map store up to O(V) items.</p>
              </div>
              <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/30">
                <h4 className="font-semibold text-orange-300 text-lg mb-2">💡 Key Insights</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Dijkstra finds the shortest path from a source to all other vertices.</li>
                  <li>Uses a greedy approach: always process the vertex with minimum distance.</li>
                  <li>Cannot handle negative edge weights (use Bellman-Ford for that).</li>
                  <li>Priority queue ensures we always process vertices in optimal order.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Network size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-xl">Select start and end nodes, then click "Load & Visualize" to begin</p>
        </div>
      )}
    </div>
  );
};

export default Dijkstra;