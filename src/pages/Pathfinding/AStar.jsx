/**
 * A* Pathfinding Algorithm Visualizer
 * Purpose: Interactive visualization of A* pathfinding algorithm with heuristic-based optimal pathfinding
 * Features:
 * - Interactive grid with obstacles
 * - Real-time pathfinding visualization
 * - Heuristic function visualization
 * - Step-by-step algorithm execution
 * - Performance metrics display
 * @version 1.0
 * @package AlgoVisualizer
 */

import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  MapPin, 
  Zap,
  Clock,
  BarChart3,
  Brain,
  Settings,
  Info
} from "lucide-react";

const ROWS = 15;
const COLS = 30;

// Node class for A* algorithm
class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.g = Infinity; // Distance from start
    this.h = 0; // Heuristic distance to end
    this.f = Infinity; // Total cost (g + h)
    this.parent = null;
    this.isVisited = false;
    this.isPath = false;
    this.isWall = false;
    this.isStart = false;
    this.isEnd = false;
  }

  get fCost() {
    return this.g + this.h;
  }
}

const GridNode = ({
  node,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  isAnimating,
}) => {
  const getNodeColor = () => {
    if (node.isEnd) return "bg-red-500";
    if (node.isStart) return "bg-green-500";
    if (node.isPath) return "bg-blue-400";
    if (node.isVisited) return "bg-cyan-400";
    if (node.isWall) return "bg-gray-700";
    return "bg-gray-900";
  };

  const getNodeText = () => {
    if (node.isStart) return "S";
    if (node.isEnd) return "E";
    if (node.isPath) return "P";
    if (node.isVisited && node.f !== Infinity) return node.f;
    return "";
  };

  return (
    <div
      className={`w-6 h-6 border border-gray-700 ${getNodeColor()} transition-all duration-300 flex items-center justify-center text-xs font-bold text-white cursor-pointer ${
        isAnimating ? "animate-pulse" : ""
      }`}
      onMouseDown={() => onMouseDown(node.row, node.col)}
      onMouseEnter={() => onMouseEnter(node.row, node.col)}
      onMouseUp={() => onMouseUp()}
      title={`Row: ${node.row}, Col: ${node.col}, F: ${node.f}, G: ${node.g}, H: ${node.h}`}
      style={{ minWidth: '24px', minHeight: '24px' }}
    >
      {getNodeText()}
    </div>
  );
};

const AStarVisualizer = ({ navigate }) => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [placingNode, setPlacingNode] = useState("wall");
  const [startNode, setStartNode] = useState({ row: 7, col: 3 });
  const [endNode, setEndNode] = useState({ row: 7, col: 27 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState({
    nodesVisited: 0,
    pathLength: 0,
    timeComplexity: "O(b^d)",
    spaceComplexity: "O(b^d)"
  });
  const [currentExplanation, setCurrentExplanation] = useState("Click 'Start' to begin the A* pathfinding algorithm!");
  const [showTutorial, setShowTutorial] = useState(true);
  const [showGridModal, setShowGridModal] = useState(false);

  // Initialize grid
  useEffect(() => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        const node = new Node(row, col);
        if (row === startNode.row && col === startNode.col) {
          node.isStart = true;
          node.g = 0;
        }
        if (row === endNode.row && col === endNode.col) {
          node.isEnd = true;
        }
        currentRow.push(node);
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
  }, [startNode, endNode]);

  // Heuristic function (Manhattan distance)
  const heuristic = (node1, node2) => {
    return Math.abs(node1.row - node2.row) + Math.abs(node1.col - node2.col);
  };

  // Get neighbors of a node
  const getNeighbors = (node, grid) => {
    const neighbors = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // 4-directional
      [-1, -1], [-1, 1], [1, -1], [1, 1] // 8-directional
    ];

    for (const [dr, dc] of directions) {
      const newRow = node.row + dr;
      const newCol = node.col + dc;
      
      if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
        const neighbor = grid[newRow][newCol];
        if (!neighbor.isWall) {
          neighbors.push(neighbor);
        }
      }
    }
    return neighbors;
  };

  // A* Algorithm implementation
  const aStarAlgorithm = useCallback(() => {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    const openSet = [];
    const closedSet = new Set();
    const steps = [];
    
    const start = newGrid[startNode.row][startNode.col];
    const end = newGrid[endNode.row][endNode.col];
    
    start.g = 0;
    start.h = heuristic(start, end);
    start.f = start.g + start.h;
    
    // Initial explanation
    steps.push({
      type: 'explanation',
      explanation: `🚀 Starting A* Algorithm!\n\n📊 Initial Setup:\n• Start node: F=${start.f} (G=${start.g} + H=${start.h})\n• End node: Target destination\n• Open Set: Nodes to explore\n• Closed Set: Already explored nodes\n\n🎯 Goal: Find shortest path from start to end!`
    });
    
    openSet.push(start);
    let nodesVisited = 0;
    
    while (openSet.length > 0) {
      // Find node with lowest f cost
      let current = openSet[0];
      let currentIndex = 0;
      
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }
      
      // Add explanation for node selection
      steps.push({
        type: 'explanation',
        explanation: `🔍 Step ${nodesVisited + 1}: Selecting Next Node\n\n📊 Current Open Set: ${openSet.length} nodes\n🎯 Selected: Node at (${current.row}, ${current.col})\n💰 F-Cost: ${current.f} (G=${current.g} + H=${current.h})\n\n💡 Why this node? It has the LOWEST F-cost!\nF = G (distance from start) + H (estimated distance to end)`
      });
      
      // Remove current from openSet and add to closedSet
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.row}-${current.col}`);
      current.isVisited = true;
      nodesVisited++;
      
      // Add step for visualization
      steps.push({
        type: 'visit',
        node: { ...current },
        openSet: [...openSet],
        closedSet: new Set(closedSet),
        nodesVisited
      });
      
      // Check if we reached the end
      if (current.row === end.row && current.col === end.col) {
        // Add success explanation
        steps.push({
          type: 'explanation',
          explanation: `🎉 SUCCESS! Found the end!\n\n📍 Reached destination at (${current.row}, ${current.col})\n📊 Total nodes visited: ${nodesVisited}\n💰 Final F-cost: ${current.f}\n\n🛤️ Now reconstructing the optimal path by following parent pointers back to start...`
        });
        
        // Reconstruct path
        const path = [];
        let pathNode = current;
        while (pathNode) {
          pathNode.isPath = true;
          path.unshift(pathNode);
          pathNode = pathNode.parent;
        }
        
        steps.push({
          type: 'path',
          path: [...path],
          nodesVisited,
          pathLength: path.length
        });
        
        // Final success explanation
        steps.push({
          type: 'explanation',
          explanation: `🏆 ALGORITHM COMPLETE!\n\n✅ Found optimal path!\n📏 Path length: ${path.length} steps\n🔍 Nodes explored: ${nodesVisited}\n⚡ Efficiency: ${((path.length / nodesVisited) * 100).toFixed(1)}%\n\n🎯 A* guarantees the shortest path when using admissible heuristics!`
        });
        
        setStats(prev => ({
          ...prev,
          nodesVisited,
          pathLength: path.length
        }));
        
        setAlgorithmSteps(steps);
        return;
      }
      
      // Check neighbors
      const neighbors = getNeighbors(current, newGrid);
      
      if (neighbors.length > 0) {
        steps.push({
          type: 'explanation',
          explanation: `🔍 Checking ${neighbors.length} neighbors of current node\n\n📍 Current: (${current.row}, ${current.col})\n🎯 Checking neighbors for better paths...\n\n💡 For each neighbor:\n• Skip if already in closed set\n• Calculate tentative G-cost\n• Update if we found a better path`
        });
      }
      
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.row}-${neighbor.col}`)) {
          continue;
        }
        
        const tentativeG = current.g + 1;
        
        if (tentativeG < neighbor.g) {
          neighbor.parent = current;
          neighbor.g = tentativeG;
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          
          if (!openSet.find(n => n.row === neighbor.row && n.col === neighbor.col)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    // No path found
    steps.push({
      type: 'no-path',
      nodesVisited
    });
    
    setAlgorithmSteps(steps);
  }, [grid, startNode, endNode]);

  // Animation controls
  const startAnimation = () => {
    if (algorithmSteps.length === 0) {
      aStarAlgorithm();
    } else {
      setIsPlaying(true);
      setCurrentStep(0);
    }
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const resetGrid = () => {
    const newGrid = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < COLS; col++) {
        const node = new Node(row, col);
        if (row === startNode.row && col === startNode.col) {
          node.isStart = true;
          node.g = 0;
        }
        if (row === endNode.row && col === endNode.col) {
          node.isEnd = true;
        }
        currentRow.push(node);
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
    setAlgorithmSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setStats({
      nodesVisited: 0,
      pathLength: 0,
      timeComplexity: "O(b^d)",
      spaceComplexity: "O(b^d)"
    });
  };

  // Mouse event handlers
  const handleMouseDown = (row, col) => {
    if (placingNode === "start") {
      setStartNode({ row, col });
    } else if (placingNode === "end") {
      setEndNode({ row, col });
    } else if (placingNode === "wall") {
      setGrid(prev => {
        const newGrid = prev.map(row => row.map(node => ({ ...node })));
        newGrid[row][col].isWall = !newGrid[row][col].isWall;
        return newGrid;
      });
    }
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    
    if (placingNode === "wall") {
      setGrid(prev => {
        const newGrid = prev.map(row => row.map(node => ({ ...node })));
        newGrid[row][col].isWall = !newGrid[row][col].isWall;
        return newGrid;
      });
    }
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  // Helper functions for modal
  const getNodeColor = (node) => {
    if (node.isEnd) return "bg-red-500";
    if (node.isStart) return "bg-green-500";
    if (node.isPath) return "bg-blue-400";
    if (node.isVisited) return "bg-cyan-400";
    if (node.isWall) return "bg-gray-700";
    return "bg-gray-900";
  };

  const getNodeText = (node) => {
    if (node.isStart) return "S";
    if (node.isEnd) return "E";
    if (node.isPath) return "P";
    if (node.isVisited && node.f !== Infinity) return node.f;
    return "";
  };

  // Step through animation
  useEffect(() => {
    if (isPlaying && algorithmSteps.length > 0) {
      const timer = setTimeout(() => {
        if (currentStep < algorithmSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, animationSpeed);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, algorithmSteps.length, animationSpeed]);

  // Update grid based on current step
  useEffect(() => {
    if (algorithmSteps.length > 0 && currentStep < algorithmSteps.length) {
      const step = algorithmSteps[currentStep];
      
      // Update explanation
      if (step.type === 'explanation') {
        setCurrentExplanation(step.explanation);
      }
      
      setGrid(prev => {
        const newGrid = prev.map(row => row.map(node => ({ ...node })));
        
        if (step.type === 'visit') {
          newGrid[step.node.row][step.node.col].isVisited = true;
          newGrid[step.node.row][step.node.col].f = step.node.f;
          newGrid[step.node.row][step.node.col].g = step.node.g;
          newGrid[step.node.row][step.node.col].h = step.node.h;
        } else if (step.type === 'path') {
          step.path.forEach(pathNode => {
            newGrid[pathNode.row][pathNode.col].isPath = true;
          });
        }
        
        return newGrid;
      });
      
      if (step.type === 'visit') {
        setStats(prev => ({
          ...prev,
          nodesVisited: step.nodesVisited
        }));
      } else if (step.type === 'path') {
        setStats(prev => ({
          ...prev,
          pathLength: step.pathLength
        }));
      }
    }
  }, [currentStep, algorithmSteps]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showGridModal) {
        setShowGridModal(false);
      }
    };

    if (showGridModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showGridModal]);

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("home")}
                className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Pathfinding
              </button>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-bold">A* Pathfinding Algorithm</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  Step {currentStep + 1} / {algorithmSteps.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Info */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                Algorithm Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Time Complexity:</span>
                  <span className="text-green-400 ml-2">O(b^d)</span>
                </div>
                <div>
                  <span className="text-gray-400">Space Complexity:</span>
                  <span className="text-blue-400 ml-2">O(b^d)</span>
                </div>
                <div>
                  <span className="text-gray-400">Optimal:</span>
                  <span className="text-yellow-400 ml-2">Yes</span>
                </div>
                <div>
                  <span className="text-gray-400">Complete:</span>
                  <span className="text-green-400 ml-2">Yes</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Controls
              </h3>
              
              <div className="space-y-4">
                {/* Node Placement */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Place Nodes</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPlacingNode("start")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        placingNode === "start"
                          ? "bg-green-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Start
                    </button>
                    <button
                      onClick={() => setPlacingNode("end")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        placingNode === "end"
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      End
                    </button>
                    <button
                      onClick={() => setPlacingNode("wall")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        placingNode === "wall"
                          ? "bg-gray-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Wall
                    </button>
                  </div>
                </div>

                {/* Animation Controls */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Animation</label>
                  <div className="flex gap-2">
                    <button
                      onClick={startAnimation}
                      disabled={isPlaying}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      {algorithmSteps.length === 0 ? "Start" : "Play"}
                    </button>
                    <button
                      onClick={pauseAnimation}
                      disabled={!isPlaying}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                    <button
                      onClick={resetGrid}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Speed Control */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Speed: {animationSpeed}ms
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Statistics
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Nodes Visited:</span>
                  <span className="text-cyan-400 ml-2">{stats.nodesVisited}</span>
                </div>
                <div>
                  <span className="text-gray-400">Path Length:</span>
                  <span className="text-blue-400 ml-2">{stats.pathLength}</span>
                </div>
                <div>
                  <span className="text-gray-400">Efficiency:</span>
                  <span className="text-green-400 ml-2">
                    {stats.nodesVisited > 0 && stats.pathLength > 0 
                      ? ((stats.pathLength / stats.nodesVisited) * 100).toFixed(1) + "%"
                      : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Tutorial */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                How A* Works
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="font-semibold text-blue-400 mb-1">F = G + H</div>
                  <div className="text-gray-300">
                    <div>• <strong>G</strong> = Distance from start</div>
                    <div>• <strong>H</strong> = Estimated distance to end</div>
                    <div>• <strong>F</strong> = Total estimated cost</div>
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="font-semibold text-green-400 mb-1">Algorithm Steps</div>
                  <div className="text-gray-300">
                    <div>1. Start with start node</div>
                    <div>2. Always pick lowest F-cost</div>
                    <div>3. Check all neighbors</div>
                    <div>4. Update costs if better</div>
                    <div>5. Repeat until goal found</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Grid */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  Interactive Grid
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>End</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-700 rounded"></div>
                    <span>Wall</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span>Path</span>
                  </div>
                </div>
              </div>

              <div 
                className="overflow-auto max-h-96 border border-gray-700 rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setShowGridModal(true)}
                title="Click to open full-screen grid"
              >
                <div 
                  className="grid gap-1 mx-auto" 
                  style={{ 
                    gridTemplateColumns: `repeat(${COLS}, 24px)`,
                    gridTemplateRows: `repeat(${ROWS}, 24px)`,
                    width: 'fit-content'
                  }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((node, colIndex) => (
                      <GridNode
                        key={`${rowIndex}-${colIndex}`}
                        node={node}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                        onMouseUp={handleMouseUp}
                        isAnimating={isAnimating}
                      />
                    ))
                  )}
                </div>
                <div className="text-center mt-2 text-xs text-gray-500">
                  Click grid to open full-screen view
                </div>
              </div>

              {/* Current Step Explanation */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Current Step Explanation
                </h4>
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {currentExplanation}
                </div>
              </div>

              {/* Detailed Tutorial */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">📚 Detailed A* Tutorial</h4>
                <div className="text-xs text-gray-400 space-y-3">
                  <div>
                    <div className="font-semibold text-blue-400 mb-1">🎯 What is A*?</div>
                    <div>A* is a pathfinding algorithm that finds the shortest path between two points by using heuristics to guide its search.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-400 mb-1">🧮 The F = G + H Formula</div>
                    <div>
                      • <strong>G-cost</strong>: Actual distance from start to current node<br/>
                      • <strong>H-cost</strong>: Estimated distance from current node to end (heuristic)<br/>
                      • <strong>F-cost</strong>: Total estimated cost (G + H)
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-400 mb-1">🔄 How It Works</div>
                    <div>
                      1. Start with the start node in "open set"<br/>
                      2. Pick the node with lowest F-cost from open set<br/>
                      3. Move it to "closed set" (already explored)<br/>
                      4. Check all neighbors and update their costs<br/>
                      5. Repeat until end node is reached<br/>
                      6. Reconstruct path by following parent pointers
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-400 mb-1">💡 Why It's Smart</div>
                    <div>
                      • Uses heuristics to avoid exploring unnecessary areas<br/>
                      • Guarantees optimal path when heuristic is admissible<br/>
                      • More efficient than Dijkstra's algorithm<br/>
                      • Balances exploration vs exploitation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Grid Modal */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-bold">Full-Screen Grid Editor</h2>
              </div>
              <button
                onClick={() => setShowGridModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            {/* Modal Tutorial Section */}
            <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* F = G + H Formula */}
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="font-semibold text-blue-400 mb-2 text-sm">🧮 F = G + H Formula</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>• <strong>G</strong> = Distance from start</div>
                    <div>• <strong>H</strong> = Estimated distance to end</div>
                    <div>• <strong>F</strong> = Total estimated cost</div>
                  </div>
                </div>

                {/* Algorithm Steps */}
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="font-semibold text-green-400 mb-2 text-sm">🔄 Algorithm Steps</div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>1. Start with start node</div>
                    <div>2. Always pick lowest F-cost</div>
                    <div>3. Check all neighbors</div>
                    <div>4. Update costs if better</div>
                    <div>5. Repeat until goal found</div>
                  </div>
                </div>

                {/* Current Step Explanation */}
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="font-semibold text-purple-400 mb-2 text-sm flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    Current Step
                  </div>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {currentExplanation}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Place:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlacingNode("start")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        placingNode === "start"
                          ? "bg-green-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Start
                    </button>
                    <button
                      onClick={() => setPlacingNode("end")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        placingNode === "end"
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      End
                    </button>
                    <button
                      onClick={() => setPlacingNode("wall")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        placingNode === "wall"
                          ? "bg-gray-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Wall
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>End</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-700 rounded"></div>
                    <span>Wall</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span>Path</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Grid */}
            <div className="flex-1 overflow-auto p-6">
              <div className="flex justify-center">
                <div 
                  className="grid gap-1" 
                  style={{ 
                    gridTemplateColumns: `repeat(${COLS}, 32px)`,
                    gridTemplateRows: `repeat(${ROWS}, 32px)`,
                  }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((node, colIndex) => (
                      <div
                        key={`modal-${rowIndex}-${colIndex}`}
                        className={`w-8 h-8 border border-gray-600 ${getNodeColor(node)} transition-all duration-300 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110`}
                        onMouseDown={() => handleMouseDown(node.row, node.col)}
                        onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                        onMouseUp={() => handleMouseUp()}
                        title={`Row: ${node.row}, Col: ${node.col}, F: ${node.f}, G: ${node.g}, H: ${node.h}`}
                      >
                        {getNodeText(node)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              {/* Detailed Tutorial */}
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">📚 A* Algorithm Details</h4>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <div className="font-semibold text-blue-400 mb-1">🎯 What is A*?</div>
                    <div>A* finds the shortest path by using heuristics to guide its search efficiently.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-400 mb-1">💡 Why It's Smart</div>
                    <div>• Uses heuristics to avoid exploring unnecessary areas<br/>
                    • Guarantees optimal path when heuristic is admissible<br/>
                    • More efficient than Dijkstra's algorithm</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Click and drag to place nodes • ESC to close
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetGrid}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Reset Grid
                  </button>
                  <button
                    onClick={() => setShowGridModal(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AStarVisualizer;

