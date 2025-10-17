import React, { useState, useEffect, useCallback } from "react";
import { Search, Map, Target, Play, Pause, X, RotateCcw } from "lucide-react";

const ROWS = 20;
const COLS = 50;

const Node = ({
  row,
  col,
  isStart,
  isEnd,
  isWall,
  isVisited,
  isPath,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) => {
  const extraClassName = isEnd
    ? "bg-red-500"
    : isStart
    ? "bg-green-500"
    : isPath
    ? "bg-blue-400"
    : isVisited
    ? "bg-cyan-400"
    : isWall
    ? "bg-gray-700"
    : "bg-gray-900";

  return (
    <div
      id={`node-${row}-${col}`}
      className={`w-6 h-6 border border-gray-700 ${extraClassName} transition-colors duration-300`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    ></div>
  );
};

const BFSVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [placingNode, setPlacingNode] = useState("wall"); // 'start', 'end', 'wall'
  const [startNode, setStartNode] = useState({ row: 10, col: 5 });
  const [endNode, setEndNode] = useState({ row: 10, col: 45 });

  const createNode = (row, col) => {
    return {
      row,
      col,
      isStart: row === startNode.row && col === startNode.col,
      isEnd: row === endNode.row && col === endNode.col,
      isWall: false,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null,
    };
  };

  const createInitialGrid = useCallback(() => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  }, [startNode, endNode]);

  useEffect(() => {
    setGrid(createInitialGrid());
  }, [createInitialGrid]);

  const handleMouseDown = (row, col) => {
    if (placingNode === "start") {
      const newGrid = grid.map((r, ri) =>
        r.map((node, ci) => {
          if (ri === startNode.row && ci === startNode.col) node.isStart = false;
          if (ri === row && ci === col) node.isStart = true;
          return node;
        })
      );
      setStartNode({ row, col });
      setGrid(newGrid);
    } else if (placingNode === "end") {
      const newGrid = grid.map((r, ri) =>
        r.map((node, ci) => {
          if (ri === endNode.row && ci === endNode.col) node.isEnd = false;
          if (ri === row && ci === col) node.isEnd = true;
          return node;
        })
      );
      setEndNode({ row, col });
      setGrid(newGrid);
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
      setMouseIsPressed(true);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    if (placingNode === "wall") {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  const visualizeBFS = () => {
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];
    const visitedNodesInOrder = bfs(grid, start, end);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(end);
    animateBFS(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const animateBFS = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const newGrid = grid.slice();
        const newNode = {
            ...node,
            isVisited: true,
        };
        newGrid[node.row][node.col] = newNode;
        setGrid(newGrid);
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const newGrid = grid.slice();
        const newNode = {
            ...node,
            isPath: true,
        };
        newGrid[node.row][node.col] = newNode;
        setGrid(newGrid);
      }, 50 * i);
    }
  };

  const resetGrid = () => {
    setGrid(createInitialGrid());
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Search /> BFS Pathfinding Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Find the shortest path using Breadth-First Search
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlacingNode("start")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              placingNode === "start" ? "bg-green-600 text-white" : "bg-gray-700"
            }`}
          >
            Place Start
          </button>
          <button
            onClick={() => setPlacingNode("end")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              placingNode === "end" ? "bg-red-600 text-white" : "bg-gray-700"
            }`}
          >
            Place End
          </button>
          <button
            onClick={() => setPlacingNode("wall")}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              placingNode === "wall" ? "bg-gray-600 text-white" : "bg-gray-700"
            }`}
          >
            Place Walls
          </button>
        </div>
        <button
          onClick={visualizeBFS}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <Play /> Visualize BFS
        </button>
        <button
            onClick={resetGrid}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
            <RotateCcw /> Reset Grid
        </button>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-50">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((node, nodeIdx) => (
                <Node
                  key={nodeIdx}
                  {...node}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onMouseUp={handleMouseUp}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function bfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const queue = [startNode];
  startNode.distance = 0;
  while (queue.length) {
    const currentNode = queue.shift();
    // If we encounter a wall, we skip it.
    if (currentNode.isWall) continue;
    // If we've been here, we skip it.
    if (currentNode.isVisited) continue;
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) return visitedNodesInOrder;
    updateUnvisitedNeighbors(currentNode, grid);
    const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of unvisitedNeighbors) {
      queue.push(neighbor);
    }
  }
  return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function updateUnvisitedNeighbors(node, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the bfs method above.
function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

export default BFSVisualizer;