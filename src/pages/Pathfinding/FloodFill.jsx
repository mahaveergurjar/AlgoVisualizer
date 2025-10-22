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

const GRID_SIZE = 10;
const NEW_COLOR = 2; // Define new color as a constant

export const FloodFill = () => {
  const [grid, setGrid] = useState([]);
  const [isVisualizationStarted, setIsVisualizationStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [startNode, setStartNode] = useState({ row: 4, col: 4 });
  const [isPlaying, setIsPlaying] = useState(false);

  const generateGrid = useCallback(() => {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        // Create a more interesting pattern
        row.push(Math.random() > 0.6 ? 1 : 0);
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setIsVisualizationStarted(false); // Reset visualization on new grid
  }, []);

  const generateHistory = useCallback((grid, startNode) => {
    const newHistory = [];
    const addState = (props) => newHistory.push({
        grid: grid.map(row => [...row]),
        explanation: "",
        ...props
    });

    const sr = startNode.row;
    const sc = startNode.col;

    if (sr < 0 || sr >= GRID_SIZE || sc < 0 || sc >= GRID_SIZE) return [];

    const prevColor = grid[sr][sc];
    addState({ line: 2, explanation: `Previous color at (${sr}, ${sc}) is ${prevColor}.` });

    addState({ line: 3, explanation: `Checking if previous color is same as new color.` });
    if (prevColor === NEW_COLOR) {
        addState({ line: 4, explanation: `Colors are the same, returning.` });
        return newHistory;
    }

    const queue = [];
    addState({ line: 7, explanation: "Initializing the queue." });
    
    queue.push([sr, sc]);
    addState({ line: 8, explanation: `Adding start node (${sr}, ${sc}) to the queue.` });

    grid[sr][sc] = NEW_COLOR;
    addState({ line: 9, currentPos: {row: sr, col: sc}, explanation: `Coloring start node (${sr}, ${sc}) with new color.` });

    addState({ line: 11, explanation: "Starting to process the queue." });
    while (queue.length > 0) {
        const curr = queue.shift();
        const r = curr[0];
        const c = curr[1];
        addState({ line: 12, currentPos: {row: r, col: c}, explanation: `Polling node (${r}, ${c}) from the queue.` });

        const dr = [-1, 1, 0, 0];
        const dc = [0, 0, -1, 1];

        addState({ line: 19, explanation: `Iterating through neighbors of (${r}, ${c}).` });
        for (let i = 0; i < 4; i++) {
            const nr = r + dr[i];
            const nc = c + dc[i];
            addState({ line: 20, explanation: `Checking neighbor at (${nr}, ${nc}).` });

            addState({ line: 23, explanation: `Checking if neighbor is valid and has the previous color.` });
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc] === prevColor) {
                grid[nr][nc] = NEW_COLOR;
                addState({ line: 24, currentPos: {row: nr, col: nc}, explanation: `Coloring neighbor (${nr}, ${nc}).` });
                
                queue.push([nr, nc]);
                addState({ line: 25, explanation: `Adding neighbor (${nr}, ${nc}) to the queue.` });
            }
        }
        addState({ line: 11, explanation: `Queue length is now ${queue.length}. Checking while condition again.` });
    }

    addState({ line: 29, explanation: "Queue is empty. Flood fill complete.", finished: true });

    return newHistory;
}, []);

  const handleVisualize = useCallback(() => {
    setIsVisualizationStarted(true);
    const newHistory = generateHistory(
      grid.map((row) => [...row]),
      startNode
    );
    setHistory(newHistory);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [grid, startNode, generateHistory]);

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
      }, 500); // Speed up animation
      return () => clearInterval(interval);
    }
  }, [isPlaying, nextStep]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevStep();
      else if (e.key === "ArrowRight") nextStep();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStep, nextStep]);

  const currentState = history[currentStep] || {};
  const {
    grid: currentGrid,
    currentPos,
    explanation = "",
    finished = false,
  } = currentState;

  const floodFillCode = `void floodFill(int[][] screen, int sr, int sc, int newColor) {
    int prevColor = screen[sr][sc];
    if (prevColor == newColor) {
        return;
    }

    Queue<int[]> queue = new LinkedList<>();
    queue.add(new int[]{sr, sc});
    screen[sr][sc] = newColor;

    while (!queue.isEmpty()) {
        int[] curr = queue.poll();
        int r = curr[0];
        int c = curr[1];

        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];

            if (nr >= 0 && nr < screen.length && nc >= 0 && nc < screen[0].length && screen[nr][nc] == prevColor) {
                screen[nr][nc] = newColor;
                queue.add(new int[]{nr, nc});
            }
        }
    }
}`;

  const renderCodeWithHighlight = (code, currentLine) => {
    const lines = code.split("\n");

    const getWordColor = (token) => {
      if (/^(void|int|if|return|for|while|new)$/.test(token)) {
        return "text-purple-400 font-semibold";
      }
      if (/^(Queue|LinkedList)$/.test(token)) {
        return "text-teal-300";
      }
      if (/^(floodFill|add|poll|isEmpty)$/.test(token)) {
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
          
          if (/[()[\]{};.,<>]/.test(char)) {
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
              className={`flex ${ currentLine === index + 1
                  ? "bg-cyan-600 bg-opacity-20 border-l-2 border-cyan-400"
                  : "" } px-3 py-1`}
            >
              <span className="text-gray-500 mr-4 select-none min-w-[2ch] text-right">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="flex flex-wrap">
                {tokenizeLine(line).map((token, tokenIndex) => {
                  let colorClass = "";
                  switch (token.type) {
                    case "whitespace": break;
                    case "punctuation": colorClass = "text-cyan-400"; break;
                    case "operator": colorClass = "text-orange-400"; break;
                    case "string": colorClass = "text-green-400"; break;
                    case "number": colorClass = "text-red-400"; break;
                    case "token": colorClass = getWordColor(token.text); break;
                    default: colorClass = "text-gray-300";
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
    if (!displayGrid || displayGrid.length === 0) return null;

    return (
      <div className="flex justify-center">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {displayGrid.map((row, i) =>
            row.map((cell, j) => {
              const isCurrent = currentPos && currentPos.row === i && currentPos.col === j;
              const isStart = startNode && startNode.row === i && startNode.col === j;

              let cellClass =
                "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold transition-all duration-200 border border-opacity-30 cursor-pointer";

              if (cell === 0) cellClass += " bg-gray-700 border-gray-600 hover:bg-gray-600";
              else if (cell === 1) cellClass += " bg-blue-500 border-blue-400 hover:bg-blue-400";
              else if (cell === NEW_COLOR) cellClass += " bg-green-500 border-green-400";

              if (isStart && !isVisualizationStarted) {
                cellClass += " ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900";
              }
              if (isCurrent) {
                cellClass += " animate-pulse ring-2 ring-white ring-offset-2 ring-offset-gray-900";
              }

              return (
                <div
                  key={`${i}-${j}`}
                  className={cellClass}
                  onClick={() => !isVisualizationStarted && setStartNode({ row: i, col: j })}
                ></div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
            Flood Fill Algorithm
          </h1>
          <p className="text-gray-400 text-sm">
            Visualizing the Flood Fill (Bucket) Tool using BFS
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="text-sm px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-md transition-colors"
              title="Generates a new random grid"
            >
              New Grid
            </button>
            <div className="text-sm text-gray-400">
              Click a cell to choose a start point.
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isVisualizationStarted && history.length > 0 && (
              <>
                <button onClick={prevStep} disabled={currentStep === 0} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-gray-400 text-sm font-mono min-w-[60px] text-center">
                  {currentStep + 1}/{history.length}
                </span>
                <button onClick={nextStep} disabled={currentStep >= history.length - 1} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors">
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} disabled={currentStep >= history.length - 1} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </>
            )}
            <button onClick={handleVisualize} disabled={isVisualizationStarted} className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
              Visualize
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="text-cyan-400" size={20} />
              <h3 className="text-lg font-semibold text-cyan-400">
                Java Flood Fill (BFS)
              </h3>
            </div>
            <div className="bg-gray-900 rounded-md p-4 overflow-auto max-h-[450px] text-sm">
              {renderCodeWithHighlight(floodFillCode, currentState.line)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-cyan-400" size={20} />
              <h3 className="text-lg font-semibold text-cyan-400">
                Visualization
              </h3>
            </div>

            <div className="bg-gray-900 rounded-md p-4 mb-4 min-h-[250px] flex items-center justify-center">
              {renderGrid()}
            </div>

            {isVisualizationStarted && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-md p-3">
                    <div className="text-gray-400 text-xs mb-1">Progress</div>
                    <div className="text-xl font-bold text-white">
                      Step {currentStep + 1} <span className="text-gray-400">/ {history.length}</span>
                    </div>
                  </div>
                  <div className="bg-green-900/50 rounded-md p-3">
                    <div className="text-green-400 text-xs mb-1 flex items-center gap-1">
                      <Terminal size={12} />
                      Finished
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {finished ? "✓" : "In Progress"}
                    </div>
                  </div>
                </div>

                {explanation && (
                  <div className="mt-4 bg-gray-700 rounded-md p-3">
                    <div className="text-gray-400 text-xs mb-1">Explanation</div>
                    <div className="text-gray-200 text-sm">{explanation}</div>
                  </div>
                )}
              </>
            )}
            {!isVisualizationStarted && (
                <div className="text-center text-gray-400 p-8">
                    Click "Visualize" to begin the simulation.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};