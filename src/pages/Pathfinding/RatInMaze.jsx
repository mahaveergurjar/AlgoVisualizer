import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Activity,
  Terminal,
} from "lucide-react";

const RatInMaze = () => {
  const [maze, setMaze] = useState("");
  const [n, setN] = useState(4);
  const [isVisualizationStarted, setIsVisualizationStarted] = useState(false);
  const [algorithm, setAlgorithm] = useState("DFS");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // DFS
  const generateDFSHistory = useCallback((grid, n) => {
    const newHistory = [];
    const visited = Array(n)
      .fill()
      .map(() => Array(n).fill(false));
    const solutions = [];

    const addState = (props) =>
      newHistory.push({
        grid,
        visited: visited.map((row) => [...row]),
        solutions: [...solutions],
        currentPos: null,
        explanation: "",
        algorithm: "DFS",
        ...props,
      });

    addState({
      line: 1,
      explanation:
        "Starting DFS from source (0,0). Explore deeply before backtracking.",
    });

    const dfs = (row, col, path) => {
      addState({
        line: 2,
        currentPos: { row, col },
        explanation: `Visiting cell (${row}, ${col}). Current path: ${
          path || "START"
        }`,
      });

      if (
        row < 0 ||
        row >= n ||
        col < 0 ||
        col >= n ||
        grid[row][col] === 0 ||
        visited[row][col]
      ) {
        addState({
          line: 3,
          currentPos: { row, col },
          explanation: `Cell (${row}, ${col}) is invalid or already visited. Backtracking.`,
        });
        return false;
      }

      visited[row][col] = true;
      addState({
        line: 4,
        currentPos: { row, col },
        explanation: `Marked (${row}, ${col}) as visited. Exploring from here.`,
      });

      if (row === n - 1 && col === n - 1) {
        solutions.push(path || "START");
        addState({
          line: 5,
          currentPos: { row, col },
          explanation: `🎉 Reached destination! Path found: ${path || "START"}`,
          foundSolution: true,
        });
        return true;
      }

      const directions = [
        [1, 0, "D"], // Down
        [0, 1, "R"], // Right
        [-1, 0, "U"], // Up
        [0, -1, "L"], // Left
      ];

      for (let [dr, dc, dir] of directions) {
        addState({
          line: 6,
          currentPos: { row, col },
          explanation: `Trying direction ${dir} from (${row}, ${col}) -> (${
            row + dr
          }, ${col + dc})`,
        });

        if (dfs(row + dr, col + dc, path + dir)) {
          return true; // sol found, stop exploring other paths
        }
      }

      visited[row][col] = false;
      addState({
        line: 7,
        currentPos: { row, col },
        explanation: `Backtracking from (${row}, ${col}). Unmarking cell and trying other paths.`,
      });

      return false;
    };

    dfs(0, 0, "");

    addState({
      line: 8,
      explanation: `DFS complete! Found ${
        solutions.length
      } solution(s): ${solutions.join(", ")}`,
      finished: true,
    });

    return newHistory;
  }, []);

  // BFS
  const generateBFSHistory = useCallback((grid, n) => {
    const newHistory = [];
    const visited = Array(n)
      .fill()
      .map(() => Array(n).fill(false));
    const queue = [{ row: 0, col: 0, path: "" }];

    const addState = (props) =>
      newHistory.push({
        grid,
        visited: visited.map((row) => [...row]),
        queue: [...queue],
        solutions: [],
        currentPos: null,
        explanation: "",
        algorithm: "BFS",
        ...props,
      });

    addState({
      line: 1,
      explanation:
        "Starting BFS from source (0,0). Exploring level by level using queue.",
    });

    visited[0][0] = true;
    addState({
      line: 2,
      currentPos: { row: 0, col: 0 },
      explanation:
        "Marked starting position (0,0) as visited and added to queue.",
    });

    const directions = [
      [1, 0, "D"], // Down
      [0, 1, "R"], // Right
      [-1, 0, "U"], // Up
      [0, -1, "L"], // Left
    ];

    while (queue.length > 0) {
      const queueSize = queue.length;

      addState({
        line: 3,
        explanation: `Processing current level with ${queueSize} node(s) in queue.`,
      });

      for (let i = 0; i < queueSize; i++) {
        const { row, col, path } = queue.shift();

        addState({
          line: 4,
          currentPos: { row, col },
          explanation: `Processing cell (${row}, ${col}) from queue. Path so far: ${
            path || "START"
          }`,
        });

        if (row === n - 1 && col === n - 1) {
          addState({
            line: 5,
            currentPos: { row, col },
            explanation: `🎉 Reached destination! Shortest path found: ${
              path || "START"
            }`,
            foundSolution: true,
            solutions: [path || "START"],
          });

          addState({
            line: 6,
            explanation: `BFS complete! Found shortest path: ${
              path || "START"
            }`,
            finished: true,
          });

          return newHistory;
        }

        let neighborsAdded = 0;
        for (let [dr, dc, dir] of directions) {
          const newRow = row + dr;
          const newCol = col + dc;

          if (
            newRow >= 0 &&
            newRow < n &&
            newCol >= 0 &&
            newCol < n &&
            grid[newRow][newCol] === 1 &&
            !visited[newRow][newCol]
          ) {
            visited[newRow][newCol] = true;
            queue.push({ row: newRow, col: newCol, path: path + dir });
            neighborsAdded++;

            addState({
              line: 7,
              currentPos: { row, col },
              explanation: `Added neighbor (${newRow}, ${newCol}) to queue via direction ${dir}. New path: ${
                path + dir
              }`,
            });
          }
        }

        if (neighborsAdded === 0) {
          addState({
            line: 8,
            currentPos: { row, col },
            explanation: `No valid unvisited neighbors from (${row}, ${col}). Moving to next cell in queue.`,
          });
        }
      }
    }

    addState({
      line: 9,
      explanation: `BFS complete! No path found to destination.`,
      finished: true,
    });

    return newHistory;
  }, []);

  // parsing the input maze
  const parseMaze = useCallback((mazeStr, size) => {
    const lines = mazeStr.trim().split("\n");
    const grid = [];
    for (let i = 0; i < size; i++) {
      if (lines[i]) {
        grid.push(lines[i].split(" ").map((num) => parseInt(num)));
      } else {
        grid.push(Array(size).fill(0));
      }
    }
    return grid;
  }, []);

  const generateHistory = useCallback(() => {
    if (!maze.trim()) return [];

    const grid = parseMaze(maze, n);

    if (algorithm === "DFS") {
      return generateDFSHistory(grid, n);
    } else {
      return generateBFSHistory(grid, n);
    }
  }, [maze, n, algorithm, parseMaze, generateDFSHistory, generateBFSHistory]);

  useEffect(() => {
    if (isVisualizationStarted && maze.trim()) {
      const newHistory = generateHistory();
      setHistory(newHistory);
      setCurrentStep(0);
    }
  }, [algorithm, generateHistory, isVisualizationStarted, maze]);

  const loadDefaultMaze = () => {
    const defaultMaze = `1 0 0 0
1 1 0 1
0 1 0 0
1 1 1 1`;
    setMaze(defaultMaze);
    setN(4);
  };

  const handleVisualize = () => {
    if (!maze.trim()) {
      loadDefaultMaze();
    }
    setIsVisualizationStarted(true);
    const newHistory = generateHistory();
    setHistory(newHistory);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setIsVisualizationStarted(false);
    setMaze("");
    setHistory([]);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };



  const currentState = history[currentStep] || {};
  const {
    grid,
    visited = [],
    currentPos,
    explanation = "",
    foundSolution = false,
  } = currentState;

  // DFS Code
  const dfsCode = `bool solveMazeUtil(int maze[N][N], int x, int y, int sol[N][N]) {
    if (x == N - 1 && y == N - 1 && maze[x][y] == 1) {
        sol[x][y] = 1;
        return true;
    }
    
    if (isSafe(maze, x, y) == true) {
        if (sol[x][y] == 1)
            return false;
        
        sol[x][y] = 1;
        
        if (solveMazeUtil(maze, x + 1, y, sol) == true)
            return true;
        
        if (solveMazeUtil(maze, x, y + 1, sol) == true)
            return true;
        
        if (solveMazeUtil(maze, x - 1, y, sol) == true)
            return true;
        
        if (solveMazeUtil(maze, x, y - 1, sol) == true)
            return true;
        
        sol[x][y] = 0;
        return false;
    }
    
    return false;
}`;

  // BFS Code
  const bfsCode = `bool solveMaze(int maze[N][N]) {
    queue<Node> q;
    bool visited[N][N] = {false};
    
    q.push({0, 0, ""});
    visited[0][0] = true;
    
    int rowNum[] = {-1, 0, 0, 1};
    int colNum[] = {0, -1, 1, 0};
    
    while (!q.empty()) {
        Node pt = q.front();
        q.pop();
        
        if (pt.x == N-1 && pt.y == N-1) {
            cout << "Path: " << pt.path << endl;
            return true;
        }
        
        for (int i = 0; i < 4; i++) {
            int row = pt.x + rowNum[i];
            int col = pt.y + colNum[i];
            
            if (isValid(row, col) && maze[row][col] && !visited[row][col]) {
                visited[row][col] = true;
                q.push({row, col, pt.path + directions[i]});
            }
        }
    }
    return false;
}`;

  const renderMaze = () => {
    if (!grid) return null;

    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 shadow-2xl">
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            maxWidth: `${n * 2.5}rem`,
          }}
        >
          {grid.map((row, i) =>
            row.map((cell, j) => {
              const isVisited = visited[i] && visited[i][j];
              const isCurrent =
                currentPos && currentPos.row === i && currentPos.col === j;
              const isStart = i === 0 && j === 0;
              const isEnd = i === n - 1 && j === n - 1;

              let cellClass =
                "w-8 h-8 flex items-center justify-center text-xs font-bold transition-all duration-500 transform hover:scale-110 border border-opacity-30";
              let content = "";
              let glowClass = "";

              if (cell === 0) {
                // Wall
                cellClass +=
                  " bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 text-gray-500 shadow-inner relative";
                content = "▓";
              } else if (isCurrent) {
                // Current position
                cellClass +=
                  " bg-cyan-400 border-cyan-300 text-gray-900 animate-pulse shadow-lg font-bold";
                glowClass = "shadow-cyan-400/50";
                content = "●";
              } else if (isStart) {
                // Start
                cellClass +=
                  " bg-emerald-500 border-emerald-400 text-white shadow-lg font-bold";
                glowClass = "shadow-emerald-500/50";
                content = "S";
              } else if (isEnd && foundSolution) {
                // End (reached)
                cellClass +=
                  " bg-yellow-500 border-yellow-400 text-gray-900 shadow-lg animate-bounce font-bold";
                glowClass = "shadow-yellow-500/50";
                content = "D";
              } else if (isEnd) {
                // End (not reached)
                cellClass +=
                  " bg-yellow-600 border-yellow-500 text-yellow-200 shadow-md font-bold";
                content = "D";
              } else if (isVisited) {
                // Visited cells
                if (algorithm === "DFS") {
                  cellClass +=
                    " bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-blue-200 shadow-md";
                  glowClass = "shadow-blue-600/30";
                } else {
                  cellClass +=
                    " bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500 text-purple-200 shadow-md";
                  glowClass = "shadow-purple-600/30";
                }
                content = "·";
              } else {
                // Unvisited cells
                cellClass +=
                  " bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600";
                content = "·";
              }

              return (
                <div
                  key={`${i}-${j}`}
                  className={`${cellClass} ${glowClass}`}
                  style={{
                    boxShadow: glowClass
                      ? `0 0 20px ${
                          glowClass.includes("cyan")
                            ? "#22d3ee"
                            : glowClass.includes("emerald")
                            ? "#10b981"
                            : glowClass.includes("yellow")
                            ? "#eab308"
                            : glowClass.includes("blue")
                            ? "#2563eb"
                            : "#9333ea"
                        }40`
                      : "none",
                  }}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 text-center">
          <div className="text-gray-400 text-xs">
            Grid: {n}×{n} | Algorithm:
            <span
              className={`ml-1 font-semibold ${
                algorithm === "DFS" ? "text-blue-400" : "text-purple-400"
              }`}
            >
              {algorithm}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCodeWithHighlight = (code, currentLine) => {
    const lines = code.split("\n");

    const getTokenColor = (token) => {
      // Keywords
      if (
        /^(bool|int|if|return|true|false|queue|while|for|struct|Node|vector|string)$/.test(
          token
        )
      ) {
        return "text-purple-400 font-semibold";
      }
      // Functions
      if (
        /^(solveMazeUtil|solveMaze|isSafe|isValid|cout|endl|push|pop|front|empty|size)$/.test(
          token
        )
      ) {
        return "text-blue-400";
      }
      // Numbers
      if (/^\d+$/.test(token)) {
        return "text-red-400";
      }
      // Operators
      if (/^(==|!=|&&|\|\||<=|>=|<|>|\+|-|\*|\/|=)$/.test(token)) {
        return "text-orange-400";
      }
      // Brackets and punctuation
      if (/^[()[\]{};.,]$/.test(token)) {
        return "text-cyan-400";
      }
      return "text-gray-300";
    };

    const tokenizeLine = (line) => {
      const tokens = [];
      let current = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (/\s/.test(char)) {
          if (current) {
            tokens.push({ text: current, type: "token" });
            current = "";
          }
          tokens.push({ text: char, type: "whitespace" });
        } else if (/[()[\]{};.,]/.test(char)) {
          if (current) {
            tokens.push({ text: current, type: "token" });
            current = "";
          }
          tokens.push({ text: char, type: "punctuation" });
        } else if (/[=<>!&|+\-*/]/.test(char)) {
          if (current) {
            tokens.push({ text: current, type: "token" });
            current = "";
          }
          // Handle multi-character operators
          let operator = char;
          if (i + 1 < line.length && /[=<>!&|+]/.test(line[i + 1])) {
            operator += line[i + 1];
            i++;
          }
          tokens.push({ text: operator, type: "operator" });
        } else {
          current += char;
        }
      }

      if (current) {
        tokens.push({ text: current, type: "token" });
      }

      return tokens;
    };

    return (
      <pre className="text-sm overflow-x-auto font-mono">
        <code>
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex ${
                currentLine === index + 1
                  ? "bg-cyan-600 bg-opacity-20 border-l-2 border-cyan-400"
                  : ""
              } px-3 py-1`}
            >
              <span className="text-gray-500 mr-4 select-none min-w-[2ch] text-right">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="flex">
                {tokenizeLine(line).map((token, tokenIndex) => (
                  <span
                    key={tokenIndex}
                    className={
                      token.type === "whitespace"
                        ? ""
                        : token.type === "punctuation"
                        ? "text-cyan-400"
                        : token.type === "operator"
                        ? "text-orange-400"
                        : getTokenColor(token.text)
                    }
                  >
                    {token.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Rat in Maze Problem
          </h1>
          <p className="text-gray-400 text-sm">
            Visualizing Pathfinding Algorithms
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 font-medium">Maze Input:</label>
                <div className="text-xs text-gray-400">
                  Enter size and maze data
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex gap-2 mb-2">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">Size:</label>
                    <input
                      type="number"
                      min="2"
                      max="8"
                      value={n}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value) || 4;
                        setN(newSize);
                        const emptyMaze = [];
                        for (let i = 0; i < newSize; i++) {
                          const row = [];
                          for (let j = 0; j < newSize; j++) {
                            if (
                              (i === 0 && j === 0) ||
                              (i === newSize - 1 && j === newSize - 1)
                            ) {
                              row.push(1);
                            } else {
                              row.push(0);
                            }
                          }
                          emptyMaze.push(row.join(" "));
                        }
                        setMaze(emptyMaze.join("\n"));
                      }}
                      className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-cyan-400 w-16 font-mono text-sm"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-xs text-gray-400 mb-1">
                      Maze (1=path, 0=wall):
                    </label>
                    <textarea
                      value={maze || "1 0 0 0\n1 1 0 1\n0 1 0 0\n1 1 1 1"}
                      onChange={(e) => setMaze(e.target.value)}
                      className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-cyan-400 w-full font-mono text-sm resize-none"
                      placeholder="1 0 0 0&#10;1 1 0 1&#10;0 1 0 0&#10;1 1 1 1"
                      rows="5"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setN(4);
                      setMaze("1 0 0 0\n1 1 0 1\n0 1 0 0\n1 1 1 1");
                    }}
                    className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={() => {
                      setMaze("");
                    }}
                    className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                  >
                    Clear Maze
                  </button>
                  <button
                    onClick={() => {
                      const size = n;
                      const emptyMaze = [];
                      for (let i = 0; i < size; i++) {
                        const row = [];
                        for (let j = 0; j < size; j++) {
                          if (
                            (i === 0 && j === 0) ||
                            (i === size - 1 && j === size - 1)
                          ) {
                            row.push(1);
                          } else {
                            row.push(0);
                          }
                        }
                        emptyMaze.push(row.join(" "));
                      }
                      setMaze(emptyMaze.join("\n"));
                    }}
                    className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                  >
                    Generate Empty
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isVisualizationStarted && (
                <>
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-gray-400 text-sm font-mono min-w-[60px] text-center">
                    {currentStep + 1}/{history.length}
                  </span>
                  <button
                    onClick={nextStep}
                    disabled={currentStep === history.length - 1}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              <button
                onClick={handleVisualize}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
              >
                Load & Visualize
              </button>
              <button
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Algorithm Toggle */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setAlgorithm("DFS")}
              className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                algorithm === "DFS"
                  ? "bg-cyan-600 text-white border-b-2 border-cyan-400"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              DFS O(NxN)
            </button>
            <button
              onClick={() => setAlgorithm("BFS")}
              className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                algorithm === "BFS"
                  ? "bg-cyan-600 text-white border-b-2 border-cyan-400"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              BFS O(NxN)
            </button>
          </div>
        </div>

        {!isVisualizationStarted ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
            <div className="text-gray-400 text-lg">
              Load maze to begin visualization.
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold text-cyan-400">
                  C++ {algorithm} Solution
                </h3>
              </div>
              <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96 text-sm">
                {renderCodeWithHighlight(
                  algorithm === "DFS" ? dfsCode : bfsCode,
                  currentState.line
                )}
              </div>
            </div>
            {/* Maze */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold text-cyan-400">
                  Maze Visualization
                </h3>
              </div>

              <div className="bg-gray-900 rounded p-4 mb-4">
                <div className="flex justify-center">{renderMaze()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-gray-400 text-xs mb-1">Current Step</div>
                  <div className="text-2xl font-bold text-white">
                    {currentStep + 1}
                  </div>
                </div>
                <div className="bg-green-900 rounded p-3">
                  <div className="text-green-400 text-xs mb-1 flex items-center gap-1">
                    <Terminal size={12} />
                    Path Found
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {foundSolution ? "✓" : "?"}
                  </div>
                </div>
              </div>

              {explanation && (
                <div className="mt-4 bg-gray-700 rounded p-3">
                  <div className="text-gray-400 text-xs mb-1">Explanation</div>
                  <div className="text-gray-200 text-sm">{explanation}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatInMaze;
