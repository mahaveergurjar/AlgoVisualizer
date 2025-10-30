/**
 * Network Flow Visualizer (Edmonds–Karp)
 * Purpose: Interactive visualization of Max-Flow using BFS-based augmenting paths
 * Features:
 * - Add/remove nodes and directed edges with capacities
 * - Visualize residual graph, augmenting paths, and bottleneck capacity per iteration
 * - Step/play controls with speed adjustment and stats pane
 * @version 1.0
 * @package AlgoVisualizer
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Cpu, Gauge, GitMerge, Info, StepForward } from "lucide-react";

const DEFAULT_SPEED_MS = 600;
const MAX_NODES = 10;

/**
 * Runs one Edmonds–Karp BFS on residual graph, returns parent map and bottleneck.
 * @param {number} n number of nodes
 * @param {number[][]} capacity capacity[u][v]
 * @param {number[][]} flow flow[u][v]
 * @param {number} s source index
 * @param {number} t sink index
 * @return {{parent:number[], bottleneck:number}|null} BFS path result or null if none
 */
function bfsAugmentingPath(n, capacity, flow, s, t) {
  const residual = (u, v) => capacity[u][v] - flow[u][v];
  const parent = Array(n).fill(-1);
  parent[s] = s;
  const q = [s];
  const bottleneck = Array(n).fill(0);
  bottleneck[s] = Infinity;

  while (q.length) {
    const u = q.shift();
    for (let v = 0; v < n; v++) {
      if (parent[v] === -1 && residual(u, v) > 0) {
        parent[v] = u;
        bottleneck[v] = Math.min(bottleneck[u], residual(u, v));
        if (v === t) {
          return { parent, bottleneck: bottleneck[v] };
        }
        q.push(v);
      }
    }
  }
  return null;
}

const NetworkFlow = ({ navigate }) => {
  const [nodeCount, setNodeCount] = useState(4);
  const [source, setSource] = useState(0);
  const [sink, setSink] = useState(3);
  const [capacity, setCapacity] = useState(() => createMatrix(4));
  const [flow, setFlow] = useState(() => createMatrix(4));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(DEFAULT_SPEED_MS);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalMaxFlow, setTotalMaxFlow] = useState(0);
  const timerRef = useRef(null);
  const [lastPath, setLastPath] = useState([]);
  const [message, setMessage] = useState("Click Play or Step to find an augmenting path using BFS.");
  const [preset, setPreset] = useState("simple");
  const [viewMode, setViewMode] = useState("graph"); // "graph" | "matrix"
  const [selectedEdge, setSelectedEdge] = useState(null); // {u,v}

  // Initialize a simple demo graph
  useEffect(() => {
    const n = nodeCount;
    const cap = createMatrix(n);
    // Example: 0->1(3), 0->2(2), 1->2(1), 1->3(2), 2->3(4)
    if (n >= 4) {
      cap[0][1] = 3; cap[0][2] = 2; cap[1][2] = 1; cap[1][3] = 2; cap[2][3] = 4;
    }
    setCapacity(cap);
    setFlow(createMatrix(n));
    setTotalMaxFlow(0);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
  }, [nodeCount]);

  const residual = useCallback((u, v) => capacity[u][v] - flow[u][v], [capacity, flow]);

  const runOneIteration = useCallback(() => {
    const bfs = bfsAugmentingPath(nodeCount, capacity, flow, source, sink);
    if (!bfs) return { done: true };
    const { parent, bottleneck } = bfs;
    const pathNodes = [];
    let v = sink;
    while (v !== source) {
      pathNodes.push(v);
      v = parent[v];
    }
    pathNodes.push(source);
    pathNodes.reverse();

    // Apply augmentation
    const newFlow = flow.map(row => row.slice());
    let u = sink;
    while (u !== source) {
      const p = parent[u];
      newFlow[p][u] += bottleneck;
      newFlow[u][p] -= bottleneck; // reverse edge in residual
      u = p;
    }

    return { done: false, parent, bottleneck, pathNodes, newFlow };
  }, [nodeCount, capacity, flow, source, sink]);

  const startOrContinue = useCallback(() => {
    const result = runOneIteration();
    if (!result || result.done) {
      setIsPlaying(false);
      setMessage("No more augmenting paths. Max flow reached.");
      return;
    }
    const { bottleneck, pathNodes, newFlow } = result;
    setFlow(newFlow);
    setTotalMaxFlow(prev => prev + bottleneck);
    setLastPath(pathNodes);
    setMessage(`Augmented along path ${pathNodes.join(" → ")} with Δ = ${bottleneck}.`);
    setSteps(prev => ([
      ...prev,
      {
        type: "augment",
        path: pathNodes,
        add: bottleneck,
      },
    ]));
  }, [runOneIteration]);

  // animation loop
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setTimeout(() => {
      startOrContinue();
    }, speedMs);
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, speedMs, startOrContinue, flow]);

  const resetAll = () => {
    setFlow(createMatrix(nodeCount));
    setTotalMaxFlow(0);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
    setLastPath([]);
    setMessage("Reset done. Click Play or Step.");
  };

  const addNode = () => {
    if (nodeCount >= MAX_NODES) return;
    setNodeCount(n => n + 1);
  };

  const removeNode = () => {
    if (nodeCount <= 2) return;
    setNodeCount(n => n - 1);
    setSource(0);
    setSink(prev => Math.max(1, Math.min(prev, nodeCount - 2)));
  };

  const setCap = (u, v, val) => {
    if (u === v) return;
    const n = nodeCount;
    if (u < 0 || v < 0 || u >= n || v >= n) return;
    setCapacity(prev => {
      const next = prev.map(row => row.slice());
      next[u][v] = Math.max(0, Number.isFinite(val) ? val : 0);
      return next;
    });
  };

  const loadPreset = (name) => {
    const n = 6;
    const cap = createMatrix(n);
    let s = 0, t = n - 1;
    if (name === "simple") {
      // 0->1(3), 0->2(2), 1->2(1), 1->3(2), 2->3(4)
      const m = 4;
      setNodeCount(m);
      const c2 = createMatrix(m);
      c2[0][1] = 3; c2[0][2] = 2; c2[1][2] = 1; c2[1][3] = 2; c2[2][3] = 4;
      setCapacity(c2);
      setSource(0); setSink(3);
      setFlow(createMatrix(m));
    } else if (name === "parallel") {
      // Two parallel disjoint paths: 0->1->5 and 0->2->5
      cap[0][1] = 4; cap[1][5] = 4; cap[0][2] = 3; cap[2][5] = 3; cap[1][2] = 1;
      setNodeCount(n);
      setCapacity(cap);
      setSource(s); setSink(t);
      setFlow(createMatrix(n));
    } else if (name === "bipartite") {
      // Small bipartite matching: S->L1,L2 ; L->R ; R->T
      // S=0, L={1,2}, R={3,4}, T=5
      cap[0][1] = 1; cap[0][2] = 1;
      cap[1][3] = 1; cap[1][4] = 1;
      cap[2][3] = 1;
      cap[3][5] = 1; cap[4][5] = 1;
      setNodeCount(n);
      setCapacity(cap);
      setSource(s); setSink(t);
      setFlow(createMatrix(n));
    }
    setPreset(name);
    setLastPath([]);
    setSteps([]);
    setTotalMaxFlow(0);
    setMessage("Preset loaded. Click Play or Step.");
  };

  const edges = useMemo(() => {
    const list = [];
    for (let u = 0; u < nodeCount; u++) {
      for (let v = 0; v < nodeCount; v++) {
        if (capacity[u][v] > 0 || flow[u][v] !== 0) {
          list.push({ u, v, cap: capacity[u][v], f: flow[u][v] });
        }
      }
    }
    return list;
  }, [capacity, flow, nodeCount]);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Graphs
          </button>
          <div className="flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold">Max Flow (Edmonds–Karp)</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" /> Controls
            </h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setViewMode("graph")} className={`px-3 py-2 rounded border ${viewMode==='graph' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 text-gray-300 border-gray-700'}`}>Graph</button>
                <button onClick={() => setViewMode("matrix")} className={`px-3 py-2 rounded border ${viewMode==='matrix' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 text-gray-300 border-gray-700'}`}>Matrix</button>
              </div>
              <label className="block">Preset
                <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded p-2"
                        value={preset}
                        onChange={e => loadPreset(e.target.value)}>
                  <option value="simple">Simple (max flow 5)</option>
                  <option value="parallel">Parallel Paths</option>
                  <option value="bipartite">Small Bipartite Matching</option>
                </select>
              </label>
              <div className="flex items-center justify-between">
                <span>Nodes: {nodeCount}</span>
                <div className="flex gap-2">
                  <button onClick={removeNode} className="px-2 py-1 bg-gray-700 rounded">-</button>
                  <button onClick={addNode} className="px-2 py-1 bg-gray-700 rounded">+</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-gray-400">Source
                  <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded p-1"
                          value={source}
                          onChange={e => setSource(Number(e.target.value))}>
                    {Array.from({ length: nodeCount }, (_, i) => (
                      <option key={`s-${i}`} value={i}>{i}</option>
                    ))}
                  </select>
                </label>
                <label className="text-gray-400">Sink
                  <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded p-1"
                          value={sink}
                          onChange={e => setSink(Number(e.target.value))}>
                    {Array.from({ length: nodeCount }, (_, i) => (
                      <option key={`t-${i}`} value={i}>{i}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <div className="mb-2">Speed: {speedMs} ms</div>
                <input type="range" min="150" max="1200" value={speedMs}
                       onChange={e => setSpeedMs(Number(e.target.value))}
                       className="w-full"/>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setIsPlaying(true)} disabled={isPlaying}
                        className="w-full h-10 flex items-center justify-center text-center whitespace-nowrap gap-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium">
                  <Play className="h-4 w-4"/> Play
                </button>
                <button onClick={() => setIsPlaying(false)} disabled={!isPlaying}
                        className="w-full h-10 flex items-center justify-center text-center whitespace-nowrap gap-2 px-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium">
                  <Pause className="h-4 w-4"/> Pause
                </button>
                <button onClick={() => { setIsPlaying(false); startOrContinue(); }}
                        className="w-full h-10 flex items-center justify-center text-center whitespace-nowrap gap-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">
                  <StepForward className="h-4 w-4"/> Step
                </button>
                <button onClick={resetAll}
                        className="w-full h-10 flex items-center justify-center text-center whitespace-nowrap gap-2 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">
                  <RotateCcw className="h-4 w-4"/> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-green-400" /> Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Max Flow</span><span className="text-green-400">{totalMaxFlow}</span></div>
              <div className="text-xs text-gray-400">Augmentations: {steps.length}</div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-400" /> Algorithm Info
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>Edmonds–Karp = BFS-based Ford–Fulkerson.</div>
              <div>Time Complexity: O(V·E²)</div>
              <div>Residual Graph shows unused capacity; reverse edges allow cancellation.</div>
            </div>
            <div className="mt-4 p-3 bg-purple-500/10 rounded border border-purple-500/30 text-xs text-gray-300">
              <div className="font-semibold text-purple-300 mb-1">How to use</div>
              <div>1) Pick a preset or edit the capacity table.</div>
              <div>2) Set Source/Sink.</div>
              <div>3) Press Step to see one augmenting path, or Play to run continuously.</div>
              <div>4) Watch the last path and max flow update.</div>
            </div>
            {selectedEdge && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/30 text-xs text-gray-300">
                <div className="font-semibold text-blue-300 mb-1">Edit Edge</div>
                <div className="flex items-center gap-2">
                  <span>u={selectedEdge.u} → v={selectedEdge.v}</span>
                  <input type="number" min="0" className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-right"
                         value={capacity[selectedEdge.u][selectedEdge.v]}
                         onChange={e => setCap(selectedEdge.u, selectedEdge.v, parseInt(e.target.value, 10))} />
                  <button className="px-2 py-1 bg-gray-700 rounded border border-gray-600" onClick={()=>setSelectedEdge(null)}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">{viewMode === 'graph' ? 'Graph Editor' : 'Capacity Matrix'}</h3>

            {viewMode === 'graph' ? (
              <div className="w-full overflow-hidden">
                <GraphCanvas
                  nodeCount={nodeCount}
                  capacity={capacity}
                  flow={flow}
                  lastPath={lastPath}
                  onSelectEdge={(u,v)=>setSelectedEdge({u,v})}
                />
              </div>
            ) : (
              <div className="overflow-auto max-h-[60vh]">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="text-left p-2">u→v</th>
                      {Array.from({ length: nodeCount }, (_, v) => (
                        <th key={`h-${v}`} className="p-2 text-center">{v}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: nodeCount }, (_, u) => (
                      <tr key={`r-${u}`} className="border-t border-gray-800">
                        <td className="p-2 font-mono text-gray-400">{u}</td>
                        {Array.from({ length: nodeCount }, (_, v) => (
                          <td key={`c-${u}-${v}`} className={`p-1 ${isEdgeOnLastPath(u, v, lastPath) ? "bg-blue-500/10 border border-blue-500/30" : ""}`}>
                            <input
                              type="number"
                              min="0"
                              className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-right"
                              value={capacity[u][v]}
                              onChange={e => setCap(u, v, parseInt(e.target.value, 10))}
                            />
                            <div className="text-[10px] text-gray-400 mt-1">
                              f {flow[u][v]} / r {Math.max(0, capacity[u][v] - flow[u][v])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {steps.length > 0 && (
              <div className="mt-6 p-3 bg-blue-500/10 rounded border border-blue-500/30 text-sm">
                <div className="font-semibold text-blue-300 mb-1">Last Augmenting Path</div>
                <div className="text-gray-300">{steps[steps.length - 1].path.join(" → ")} (Δ = {steps[steps.length - 1].add})</div>
              </div>
            )}
            <div className="mt-4 text-sm text-gray-300 p-3 bg-gray-800/40 rounded border border-gray-700">
              {message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function createMatrix(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

export default NetworkFlow;

function isEdgeOnLastPath(u, v, path) {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i] === u && path[i + 1] === v) return true;
  }
  return false;
}

function GraphCanvas({ nodeCount, capacity, flow, lastPath, onSelectEdge }) {
  const width = 900;
  const height = 520;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 70;
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    return {
      i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const isOnPath = (u, v) => isEdgeOnLastPath(u, v, lastPath);

  return (
    <div className="w-full overflow-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[60vh] rounded border border-gray-800 bg-gray-950">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* edges */}
        {nodes.map((nu) => (
          nodes.map((nv) => {
            if (nu.i === nv.i) return null;
            if (capacity[nu.i][nv.i] <= 0 && flow[nu.i][nv.i] === 0) return null;
            const dx = nv.x - nu.x;
            const dy = nv.y - nu.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len;
            const startX = nu.x + 20 * ux;
            const startY = nu.y + 20 * uy;
            const endX = nv.x - 20 * ux;
            const endY = nv.y - 20 * uy;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const onPath = isOnPath(nu.i, nv.i);
            return (
              <g key={`e-${nu.i}-${nv.i}`}>
                <line x1={startX} y1={startY} x2={endX} y2={endY}
                      stroke={onPath ? "#60a5fa" : "#475569"}
                      strokeWidth={onPath ? 3 : 2}
                      markerEnd="url(#arrow)"
                />
                <rect x={midX-28} y={midY-16} width="56" height="22" rx="4" ry="4"
                      fill={onPath ? "#1e293b" : "#0f172a"} stroke="#334155"/>
                <text x={midX} y={midY} textAnchor="middle" dominantBaseline="middle"
                      className="fill-gray-300 text-[11px] cursor-pointer"
                      onClick={() => onSelectEdge(nu.i, nv.i)}>
                  {flow[nu.i][nv.i]} / {capacity[nu.i][nv.i]}
                </text>
              </g>
            );
          })
        ))}

        {/* nodes */}
        {nodes.map((n) => (
          <g key={`n-${n.i}`}>
            <circle cx={n.x} cy={n.y} r={18} fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" className="fill-gray-200 text-[12px] font-semibold">{n.i}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}


