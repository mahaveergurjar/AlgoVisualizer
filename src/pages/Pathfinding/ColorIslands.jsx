import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Activity,
  Terminal,
  Play,
  Pause,
} from "lucide-react";

const islandColors = [
  "bg-gray-400", // Light gray as default
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-fuchsia-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-lightBlue-500",
  "bg-warmGray-500",
  "bg-trueGray-500",
  "bg-coolGray-500",
  "bg-blueGray-500",
  "bg-darkBlue-500",
  "bg-darkGreen-500",
  "bg-darkPurple-500",
  "bg-darkRed-500",
  "bg-darkYellow-500",
  "bg-darkOrange-500",
  "bg-darkPink-500",
  "bg-darkTeal-500",
];

const GRID_SIZE = 10;

export const ColorIslands = () => {
  const [grid, setGrid] = useState([]);
  const [isVisualizationStarted, setIsVisualizationStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateGrid = useCallback(() => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        row.push(Math.random() > 0.6 ? 1 : 0);
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setIsVisualizationStarted(false);
  }, []);

  const generateHistory = useCallback((grid) => {
    const newHistory = [];
    let islandCount = 0;

    const addState = (props) => newHistory.push({
        grid: grid.map((row) => [...row]),
        islandCount,
        explanation: "",
        ...props,
    });

    addState({ line: 1, explanation: "Starting colorIslands function." });
    if (grid == null || grid.length === 0) {
        addState({ line: 2, explanation: "Grid is invalid, returning." });
        return newHistory;
    }

    addState({ line: 6, explanation: "Initializing islandCount to 0." });
    
    for (let i = 0; i < GRID_SIZE; i++) {
        addState({ line: 7, currentPos: { row: i, col: -1 }, explanation: `Scanning row ${i}.` });
        for (let j = 0; j < GRID_SIZE; j++) {
            addState({ line: 8, currentPos: { row: i, col: j }, explanation: `Scanning cell (${i}, ${j}).` });
            
            if (grid[i][j] === 1) {
                islandCount++;
                addState({ line: 10, currentPos: { row: i, col: j }, explanation: `Found a new island. Incrementing islandCount to ${islandCount}.` });
                
                const newColor = islandCount + 1;
                addState({ line: 11, currentPos: { row: i, col: j }, explanation: `Calling floodFill for the new island with color ${newColor}.` });
                
                // BFS floodFill implementation
                const queue = [];
                addState({ line: 16, currentPos: { row: i, col: j }, explanation: `Initializing queue for flood fill.` });

                queue.push([i, j]);
                addState({ line: 17, currentPos: { row: i, col: j }, explanation: `Adding start cell (${i},${j}) to queue.` });
                
                grid[i][j] = newColor;
                addState({ line: 18, currentPos: { row: i, col: j }, explanation: `Coloring cell (${i},${j}).` });

                addState({ line: 20, explanation: `Starting to process the queue for island ${islandCount}.` });
                while (queue.length > 0) {
                    const [r, c] = queue.shift();
                    addState({ line: 21, currentPos: { row: r, col: c }, explanation: `Polling cell (${r},${c}) from queue.` });

                    const dr = [-1, 1, 0, 0];
                    const dc = [0, 0, -1, 1];

                    addState({ line: 27, currentPos: { row: r, col: c }, explanation: `Iterating through neighbors of (${r},${c}).` });
                    for (let k = 0; k < 4; k++) {
                        const nr = r + dr[k];
                        const nc = c + dc[k];
                        
                        addState({ line: 31, currentPos: { row: nr, col: nc, noRing: true }, explanation: `Checking neighbor (${nr},${nc}).` });
                        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc] === 1) {
                            grid[nr][nc] = newColor;
                            addState({ line: 32, currentPos: { row: nr, col: nc }, explanation: `Coloring neighbor (${nr},${nc}).` });
                            
                            queue.push([nr, nc]);
                            addState({ line: 33, currentPos: { row: nr, col: nc }, explanation: `Adding neighbor (${nr},${nc}) to queue.` });
                        }
                    }
                    addState({ line: 20, explanation: `Queue length is now ${queue.length}. Checking while condition.` });
                }
                addState({ line: 11, currentPos: { row: i, col: j }, explanation: `Finished floodFill for island ${islandCount}.` });
            }
        }
    }

    addState({ line: 14, explanation: `Finished scanning grid. Total islands found: ${islandCount}.`, finished: true });

    return newHistory;
  }, []);

  const handleVisualize = useCallback(() => {
    setIsVisualizationStarted(true);
    const newHistory = generateHistory(grid.map((row) => [...row]));
    setHistory(newHistory);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [grid, generateHistory]);

  const handleReset = () => {
    setIsVisualizationStarted(false);
    generateGrid();
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const nextStep = useCallback(() => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, history.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        nextStep();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isPlaying, nextStep]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        prevStep();
      } else if (e.key === "ArrowRight") {
        nextStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prevStep, nextStep]);

  const currentState = history[currentStep] || {};
  const {
    grid: currentGrid,
    currentPos,
    explanation = "",
    finished = false,
    islandCount: currentIslandCount,
  } = currentState;

  const colorIslandsCode = `void colorIslands(int[][] grid) {
    if (grid == null || grid.length == 0) {
        return;
    }
    
    int islandCount = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == 1) {
                islandCount++;
                floodFill(grid, i, j, islandCount + 1);
            }
        }
    }
}

void floodFill(int[][] grid, int r, int c, int color) {
    Queue<int[]> queue = new LinkedList<>();
    queue.add(new int[]{r, c});
    grid[r][c] = color;

    while (!queue.isEmpty()) {
        int[] curr = queue.poll();
        int row = curr[0];
        int col = curr[1];

        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int i = 0; i < 4; i++) {
            int nr = row + dr[i];
            int nc = col + dc[i];

            if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] == 1) {
                grid[nr][nc] = color;
                queue.add(new int[]{nr, nc});
            }
        }
    }
}`;

  const renderCodeWithHighlight = (code, currentLine) => {
    const lines = code.split("\n");

    const getWordColor = (token) => {
      if (/^(void|int|if|return|true|false|for|new|while)$/.test(token)) {
        return "text-purple-400 font-semibold";
      }
      if (/^(Queue|LinkedList)$/.test(token)) {
        return "text-teal-300";
      }
      if (/^(colorIslands|floodFill|add|poll|isEmpty)$/.test(token)) {
        return "text-blue-400";
      }
      return "text-gray-300";
    };

    const tokenizeLine = (line) => {
      const tokens = [];
      let i = 0;
      while (i < line.length) {
        const char = line[i];

        if (/\s/.test(char)) {
          let whitespace = char;
          i++;
          while (i < line.length && /\s/.test(line[i])) {
            whitespace += line[i];
            i++;
          }
          tokens.push({ text: whitespace, type: "whitespace" });
          continue;
        }

        if (char === '"') {
          let str = char;
          i++;
          while (i < line.length && line[i] !== '"') {
            str += line[i];
            i++;
          }
          if (i < line.length) {
            str += line[i];
            i++;
          }
          tokens.push({ text: str, type: "string" });
          continue;
        }
        
        if (/[()[\\]{};.,]/.test(char)) {
          tokens.push({ text: char, type: "punctuation" });
          i++;
          continue;
        }

        if (/[=<>!&|+-/]/.test(char)) {
          let operator = char;
          if (i + 1 < line.length && /[=<>!&|+]/.test(line[i + 1])) {
            operator += line[i + 1];
            i++;
          }
          tokens.push({ text: operator, type: "operator" });
          i++;
          continue;
        }

        if (/[a-zA-Z_]/.test(char)) {
          let word = char;
          i++;
          while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
            word += line[i];
            i++;
          }
          tokens.push({ text: word, type: "token" });
          continue;
        }
        
        if (/\d/.test(char)) {
            let num = char;
            i++;
            while (i < line.length && /\d/.test(line[i])) {
                num += line[i];
                i++;
            }
            tokens.push({ text: num, type: "number" });
            continue;
        }

        i++;
      }
      return tokens;
    };

    return (
      <pre className="text-sm overflow-x-auto font-mono">
        <code>
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex ${currentLine === index + 1
                  ? "bg-cyan-600 bg-opacity-20 border-l-2 border-cyan-400"
                  : ""}
              px-3 py-1`}
            >
              <span className="text-gray-500 mr-4 select-none min-w-[2ch] text-right">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="flex flex-wrap">
                {tokenizeLine(line).map((token, tokenIndex) => {
                  let colorClass = "";
                  switch (token.type) {
                    case "whitespace":
                      break;
                    case "punctuation":
                      colorClass = "text-cyan-400";
                      break;
                    case "operator":
                      colorClass = "text-orange-400";
                      break;
                    case "string":
                      colorClass = "text-green-400";
                      break;
                    case "number":
                      colorClass = "text-red-400";
                      break;
                    case "token":
                      colorClass = getWordColor(token.text);
                      break;
                    default:
                      colorClass = "text-gray-300";
                  }
                  return (
                    <span key={tokenIndex} className={colorClass}>
                      {token.text}
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </code>
      </pre>
    );
  };

  const renderGrid = () => {
    const displayGrid = isVisualizationStarted ? currentGrid : grid;
    if (!displayGrid) return null;

    return (
      <div className="flex justify-center">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {displayGrid.map((row, i) =>
            row.map((cell, j) => {
              const isCurrent = 
                currentPos && currentPos.row === i && currentPos.col === j && !currentPos.noRing;

              let cellClass =
                "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold transition-all duration-300 transform hover:scale-110 border border-opacity-30";

              if (cell === 0) {
                cellClass += " bg-gray-700 border-gray-600"; // Water
              } else if (cell >= 1) {
                const colorIndex = (cell - 1) % islandColors.length;
                cellClass += ` ${islandColors[colorIndex]} border-gray-600`; // Land
              }

              if (isCurrent) {
                cellClass += " animate-pulse ring-2 ring-white";
              }

              return <div key={`${i}-${j}`} className={cellClass}></div>;
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Color Islands
          </h1>
          <p className="text-gray-400 text-sm">
            Visualizing Island Coloring with Flood Fill (BFS)
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset} 
              className="text-sm px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
              title="Generates a new random grid"
            >
              New Grid
            </button>
          </div>
          <div className="flex items-center gap-3">
            {isVisualizationStarted && history.length > 0 && (
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
                  disabled={currentStep >= history.length - 1}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={currentStep >= history.length - 1}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </>
            )}
            <button
              onClick={handleVisualize}
              disabled={isVisualizationStarted}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              Visualize
            </button>
          </div>
        </div>

        {!isVisualizationStarted ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
            <div className="text-gray-400 text-lg">
              Click Visualize to start the algorithm.
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold text-cyan-400">
                  Java Color Islands (BFS) Solution
                </h3>
              </div>
              <div className="bg-gray-900 rounded p-4 overflow-auto max-h-[450px] text-sm">
                {renderCodeWithHighlight(colorIslandsCode, currentState.line)}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold text-cyan-400">
                  Grid Visualization
                </h3>
              </div>

              <div className="bg-gray-900 rounded p-4 mb-4">
                <div className="flex justify-center">{renderGrid()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded p-3">
                  <div className="text-gray-400 text-xs mb-1">Island Count</div>
                  <div className="text-2xl font-bold text-white">
                    {currentIslandCount || 0}
                  </div>
                </div>
                <div className="bg-green-900 rounded p-3">
                  <div className="text-green-400 text-xs mb-1 flex items-center gap-1">
                    <Terminal size={12} />
                    Finished
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {finished ? "✓" : "..."}
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