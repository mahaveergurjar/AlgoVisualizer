import React, { useState, useEffect } from 'react';

const predefinedGraphs = {
  'Simple': {
    nodes: ['A', 'B', 'C', 'D'],
    edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']],
  },
  'Complex': {
    nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['F', 'A']],
  },
};

const TopologicalSort = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [newNode, setNewNode] = useState('');
  const [sourceNode, setSourceNode] = useState('');
  const [destNode, setDestNode] = useState('');
  const [sortedOrder, setSortedOrder] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [processedNodes, setProcessedNodes] = useState(new Set());

  const addNode = () => {
    if (newNode && !nodes.includes(newNode)) {
      setNodes([...nodes, newNode]);
      setNewNode('');
    }
  };

  const addEdge = () => {
    if (sourceNode && destNode && nodes.includes(sourceNode) && nodes.includes(destNode)) {
      setEdges([...edges, [sourceNode, destNode]]);
      setSourceNode('');
      setDestNode('');
    }
  };

  const loadPredefinedGraph = (graphName) => {
    const graph = predefinedGraphs[graphName];
    setNodes(graph.nodes);
    setEdges(graph.edges);
    resetVisualization();
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    resetVisualization();
  };

  const resetVisualization = () => {
    setSortedOrder([]);
    setQueue([]);
    setCurrentNode(null);
    setProcessedNodes(new Set());
  };

  const startSort = async () => {
    resetVisualization();
    const inDegree = new Map(nodes.map(node => [node, 0]));
    const adj = new Map(nodes.map(node => [node, []]));

    for (const [u, v] of edges) {
      adj.get(u).push(v);
      inDegree.set(v, inDegree.get(v) + 1);
    }

    const initialQueue = nodes.filter(node => inDegree.get(node) === 0);
    setQueue(initialQueue);
    const result = [];

    const q = [...initialQueue];
    while (q.length > 0) {
      const u = q.shift();
      setCurrentNode(u);
      result.push(u);
      setSortedOrder([...result]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const v of adj.get(u)) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) {
          q.push(v);
        }
      }
      setQueue([...q]);
      processedNodes.add(u);
      setProcessedNodes(new Set(processedNodes));
    }
    setCurrentNode(null);

    if (result.length !== nodes.length) {
      setSortedOrder(['Error: Graph contains a cycle']);
    }
  };
  
  const nodePositions = nodes.reduce((acc, node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    acc[node] = {
      x: 200 + 150 * Math.cos(angle),
      y: 200 + 150 * Math.sin(angle),
    };
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Topological Sort</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Create Your Graph</h2>
          <div className="mb-4">
            <input type="text" value={newNode} onChange={(e) => setNewNode(e.target.value)} placeholder="New Node" className="border p-2 mr-2"/>
            <button onClick={addNode} className="bg-blue-500 text-white p-2 rounded">Add Node</button>
          </div>
          <div className="mb-4">
            <input type="text" value={sourceNode} onChange={(e) => setSourceNode(e.target.value)} placeholder="Source" className="border p-2 mr-2"/>
            <input type="text" value={destNode} onChange={(e) => setDestNode(e.target.value)} placeholder="Destination" className="border p-2 mr-2"/>
            <button onClick={addEdge} className="bg-blue-500 text-white p-2 rounded">Add Edge</button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Pre-defined Graphs</h2>
            <select onChange={(e) => loadPredefinedGraph(e.target.value)} className="border p-2 mr-2">
              <option value="">Select</option>
              {Object.keys(predefinedGraphs).map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <button onClick={clearGraph} className="bg-red-500 text-white p-2 rounded">Clear Graph</button>
          </div>
          <div className="mt-4">
            <button onClick={startSort} className="bg-green-500 text-white p-2 rounded mr-2">Start Sort</button>
            <button onClick={resetVisualization} className="bg-gray-500 text-white p-2 rounded">Reset</button>
          </div>
        </div>
        <div className="relative" style={{ height: '400px' }}>
          <svg className="w-full h-full" viewBox="0 0 400 400">
            {edges.map(([u, v], i) => (
              <line key={i} x1={nodePositions[u]?.x} y1={nodePositions[u]?.y} x2={nodePositions[v]?.x} y2={nodePositions[v]?.y} stroke="black" markerEnd="url(#arrow)"/>
            ))}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
              </marker>
            </defs>
          </svg>
          {Object.entries(nodePositions).map(([node, { x, y }]) => (
            <div key={node} className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${processedNodes.has(node) ? 'bg-gray-500' : currentNode === node ? 'bg-green-500' : queue.includes(node) ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ left: x - 20, top: y - 20 }}>
              {node}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mt-4">Topological Sort Order:</h2>
        <p>{sortedOrder.join(' -> ')}</p>
      </div>
    </div>
  );
};

export default TopologicalSort;
