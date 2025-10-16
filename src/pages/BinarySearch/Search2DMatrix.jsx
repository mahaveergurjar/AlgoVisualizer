import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code,
  Play,
  Pause,
  RotateCw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Terminal,
  Move,
  Search,
  Target,
} from "lucide-react";

// Component to correctly tokenize and highlight a line of code
const CodeLine = ({ text }) => {
  const KEYWORDS = ["return", "while", "if", "else", "public", "boolean"];
  const TYPES = ["int", "int[][]", "vector<vector<int>>&"];
  const FUNCTIONS = ["searchMatrix"];
  const tokens = text.split(/(\s+|[&,;<>(){}[\]=+\-!/])/g);

  return (
    <>
      {tokens.map((token, index) => {
        if (KEYWORDS.includes(token))
          return (
            <span key={index} className="text-purple-400">
              {token}
            </span>
          );
        if (TYPES.includes(token))
          return (
            <span key={index} className="text-cyan-400">
              {token}
            </span>
          );
        if (FUNCTIONS.includes(token))
          return (
            <span key={index} className="text-yellow-400">
              {token}
            </span>
          );
        if (/^-?\d+$/.test(token))
          return (
            <span key={index} className="text-orange-400">
              {token}
            </span>
          );
        if (/([&,;<>(){}[\]=+\-!/])/.test(token))
          return (
            <span key={index} className="text-gray-500">
              {token}
            </span>
          );
        return (
          <span key={index} className="text-gray-300">
            {token}
          </span>
        );
      })}
    </>
  );
};

const Search2DMatrix = () => {
  const [activeAlgorithm, setActiveAlgorithm] = useState("intuitive");
  const [activeLanguage, setActiveLanguage] = useState("cpp");

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const [matrixInput, setMatrixInput] = useState(
    "[[1,3,5,7],[10,11,16,20],[23,30,34,60]]"
  );
  const [targetInput, setTargetInput] = useState("13");

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const playRef = useRef(null);

  const state = history[currentStep] || {};

  const codeContent = {
    intuitive: {
      cpp: {
        1: `bool searchMatrix(vector<vector<int>>& matrix, int target) {`,
        2: `    int m = matrix.size(), n = matrix[0].size();`,
        3: `    int i = 0, j = n - 1;`,
        4: `    while (i < m && j >= 0) {`,
        5: `        if (matrix[i][j] == target) return true;`,
        6: `        if (matrix[i][j] > target) {`,
        7: `            j--;`,
        8: `        } else {`,
        9: `            i++;`,
        10: `       }`,
        11: `   }`,
        12: `   return false;`,
        13: `}`,
      },
      java: {
        1: `public boolean searchMatrix(int[][] matrix, int target) {`,
        2: `    int row = 0;`,
        3: `    int col = matrix[0].length - 1;`,
        4: `    while(row < matrix.length && col >= 0){`,
        5: `        if(matrix[row][col] == target){`,
        6: `            return true;`,
        7: `        } else if(target < matrix[row][col]){`,
        8: `            col--;`,
        9: `        } else {`,
        10: `           row++;`,
        11: `       }`,
        12: `   }`,
        13: `   return false;`,
        14: `}`,
      },
    },
    optimal: {
      cpp: {
        1: `bool searchMatrix(vector<vector<int>>& matrix, int target) {`,
        2: `    int m = matrix.size(), n = matrix[0].size();`,
        3: `    int left = 0, right = m * n - 1;`,
        4: `    while (left <= right) {`,
        5: `        int mid = left + (right - left) / 2;`,
        6: `        int row = mid / n, col = mid % n;`,
        7: `        int val = matrix[row][col];`,
        8: `        if (val == target) return true;`,
        9: `        if (val < target) left = mid + 1;`,
        10: `       else right = mid - 1;`,
        11: `   }`,
        12: `   return false;`,
        13: `}`,
      },
    },
  };

  const generateHistoryForIntuitive = (matrix, target, m, n) => {
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({ matrix, target, m, n, ...props });
    let i = 0,
      j = n - 1,
      found = false;
    addState({
      line: 3,
      i,
      j,
      message: `Start search at top-right corner [${i}, ${j}].`,
    });
    while (i < m && j >= 0) {
      const val = matrix[i][j];
      addState({
        line: 4,
        i,
        j,
        val,
        message: `Checking value at [${i}, ${j}]: ${val}.`,
      });
      if (val === target) {
        addState({
          line: 5,
          i,
          j,
          val,
          found: true,
          message: `Target found at [${i},${j}]!`,
        });
        found = true;
        break;
      }
      if (val > target) {
        addState({
          line: 7,
          i,
          j,
          val,
          message: `${val} > ${target}. Value too large, moving left.`,
        });
        j--;
      } else {
        addState({
          line: 9,
          i,
          j,
          val,
          message: `${val} < ${target}. Value too small, moving down.`,
        });
        i++;
      }
    }
    if (!found)
      addState({
        line: 12,
        i,
        j,
        found: false,
        message: `Search space exhausted. Target not found.`,
      });
    return newHistory;
  };

  const generateHistoryForOptimal = (matrix, target, m, n) => {
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({ matrix, target, m, n, ...props });
    let left = 0,
      right = m * n - 1,
      found = false;
    addState({
      line: 3,
      left,
      right,
      message: `Initialize 1D search space [${left}, ${right}].`,
    });
    while (left <= right) {
      const mid = Math.floor(left + (right - left) / 2);
      const row = Math.floor(mid / n);
      const col = mid % n;
      const val = matrix[row][col];
      addState({
        line: 5,
        left,
        right,
        mid,
        row,
        col,
        val,
        message: `Calculated mid-point index: ${mid} -> [${row}, ${col}].`,
      });
      if (val === target) {
        addState({
          line: 8,
          left,
          right,
          mid,
          row,
          col,
          val,
          found: true,
          message: `Target found at [${row},${col}]!`,
        });
        found = true;
        break;
      }
      if (val < target) {
        addState({
          line: 9,
          left,
          right,
          mid,
          row,
          col,
          val,
          message: `${val} < ${target}. Searching right half.`,
        });
        left = mid + 1;
      } else {
        addState({
          line: 10,
          left,
          right,
          mid,
          row,
          col,
          val,
          message: `${val} > ${target}. Searching left half.`,
        });
        right = mid - 1;
      }
    }
    if (!found)
      addState({
        line: 12,
        left,
        right,
        found: false,
        message: `Search complete. Target not found.`,
      });
    return newHistory;
  };

  const load = useCallback(() => {
    let localMatrix;
    try {
      localMatrix = JSON.parse(matrixInput.replace(/'/g, '"'));
      if (!Array.isArray(localMatrix) || !localMatrix.every(Array.isArray))
        throw new Error();
    } catch (e) {
      alert("Invalid matrix format.");
      return;
    }
    const localTarget = parseInt(targetInput, 10);
    if (isNaN(localTarget)) {
      alert("Invalid target.");
      return;
    }
    const m = localMatrix.length,
      n = m > 0 ? localMatrix[0].length : 0;
    if (m === 0 || n === 0) {
      alert("Matrix cannot be empty.");
      return;
    }

    const newHistory =
      activeAlgorithm === "intuitive"
        ? generateHistoryForIntuitive(localMatrix, localTarget, m, n)
        : generateHistoryForOptimal(localMatrix, localTarget, m, n);

    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [matrixInput, targetInput, activeAlgorithm]);

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
  };
  const stepForward = useCallback(
    () => currentStep < history.length - 1 && setCurrentStep((s) => s + 1),
    [currentStep, history.length]
  );
  const stepBackward = useCallback(
    () => currentStep > 0 && setCurrentStep((s) => s - 1),
    [currentStep]
  );
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  useEffect(() => {
    if (isPlaying) {
      if (currentStep >= history.length - 1) {
        setIsPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            clearInterval(playRef.current);
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [isPlaying, speed, history.length, currentStep]);

  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward, togglePlay]);

  const currentCode =
    activeAlgorithm === "optimal"
      ? codeContent.optimal.cpp
      : codeContent.intuitive[activeLanguage];
  const {
    line,
    matrix,
    target,
    left,
    right,
    mid,
    row,
    col,
    i,
    j,
    found,
    message,
    m,
    n,
  } = state;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="px-6 py-8 max-w-7xl mx-auto relative">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-sky-500/10 rounded-full blur-3xl -z-0" />

        <header className="relative z-10 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
            Search a 2D Matrix
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Visualizing two common approaches for LeetCode #74.
          </p>
        </header>

        {/* --- CONTROLS SECTION --- */}
        <section className="mb-6 z-10 relative p-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              type="text"
              value={matrixInput}
              onChange={(e) => setMatrixInput(e.target.value)}
              disabled={isLoaded}
              className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-sky-400"
              placeholder="Matrix, e.g., [[1,2],[3,4]]"
            />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              disabled={isLoaded}
              className="w-48 p-3 rounded-xl bg-gray-900 border border-gray-700 font-mono focus:ring-2 focus:ring-sky-400"
              placeholder="Target"
            />

            {!isLoaded ? (
              <button
                onClick={load}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:opacity-90 transition text-white font-bold shadow-lg"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="p-3 rounded-full bg-gray-700 hover:bg-sky-600 disabled:opacity-40 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-gray-700 hover:bg-sky-600 transition"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="p-3 rounded-full bg-gray-700 hover:bg-sky-600 disabled:opacity-40 transition"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200">
                  {currentStep + 1}/{history.length}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">Speed</label>
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={speed}
                    onChange={(e) =>
                      setSpeed(2100 - parseInt(e.target.value, 10))
                    }
                    className="w-24"
                  />
                </div>
                <button
                  onClick={resetAll}
                  className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
                >
                  <RotateCw size={16} /> Reset
                </button>
              </>
            )}
          </div>
        </section>

        {/* TABS */}
        <div className="z-10 relative mb-4">
          <div className="border-b border-gray-700 flex items-center">
            <button
              onClick={() => {
                setActiveAlgorithm("intuitive");
                resetAll();
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeAlgorithm === "intuitive"
                  ? "border-b-2 border-sky-400 text-sky-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Intuitive O(m+n)
            </button>
            <button
              onClick={() => {
                setActiveAlgorithm("optimal");
                resetAll();
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeAlgorithm === "optimal"
                  ? "border-b-2 border-sky-400 text-sky-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Optimal O(log(mn))
            </button>
          </div>
          {activeAlgorithm === "intuitive" && (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setActiveLanguage("cpp")}
                className={`px-3 py-1 rounded text-xs ${
                  activeLanguage === "cpp"
                    ? "bg-sky-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                C++
              </button>
              <button
                onClick={() => setActiveLanguage("java")}
                className={`px-3 py-1 rounded text-xs ${
                  activeLanguage === "java"
                    ? "bg-sky-500 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Java
              </button>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        {!isLoaded ? (
          <div className="mt-10 text-center text-gray-400">
            Enter a matrix and target, then click{" "}
            <span className="font-semibold text-sky-400">Load & Visualize</span>
            .
          </div>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            <aside className="lg:col-span-1 p-4 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
              <h3 className="text-sky-300 flex items-center gap-2 font-semibold mb-3">
                <FileText size={18} /> Algorithm Steps
              </h3>
              <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 p-3 font-mono text-sm">
                {Object.entries(currentCode).map(([ln, txt]) => (
                  <div
                    key={ln}
                    className={`flex items-start ${
                      line === parseInt(ln, 10) ? "bg-sky-500/10" : ""
                    }`}
                  >
                    <span className="text-gray-600 w-8 mr-3 text-right select-none">
                      {ln}
                    </span>
                    <div className="flex-1 whitespace-pre-wrap">
                      <CodeLine text={txt} />
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section className="lg:col-span-2 flex flex-col gap-6">
              <div className="p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
                <h3 className="text-lg font-semibold text-sky-300 mb-4 text-center">
                  Matrix Visualization
                </h3>
                <div className="flex justify-center items-center">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${n || 1}, minmax(0, 1fr))`,
                    }}
                  >
                    {matrix.map((r_val, r_idx) =>
                      r_val.map((cell_val, c_idx) => {
                        let cellStyle =
                          "bg-gray-800/50 border-gray-700/50 opacity-40";
                        if (activeAlgorithm === "intuitive") {
                          const isCurrent = r_idx === i && c_idx === j,
                            isEliminated = r_idx < i || c_idx > j,
                            isFoundCell = found && isCurrent;
                          if (isFoundCell)
                            cellStyle =
                              "bg-green-500 border-green-400 scale-110 shadow-lg shadow-green-500/50";
                          else if (isCurrent)
                            cellStyle =
                              "bg-sky-500 border-sky-400 scale-110 shadow-lg shadow-sky-500/50";
                          else if (!isEliminated)
                            cellStyle = "bg-gray-700 border-gray-600";
                        } else {
                          const flat_idx = r_idx * n + c_idx,
                            isInSearchSpace =
                              flat_idx >= left && flat_idx <= right,
                            isMid = r_idx === row && c_idx === col,
                            isFoundCell = found && isMid;
                          if (isFoundCell)
                            cellStyle =
                              "bg-green-500 border-green-400 scale-110 shadow-lg shadow-green-500/50";
                          else if (isMid)
                            cellStyle =
                              "bg-sky-500 border-sky-400 scale-110 shadow-lg shadow-sky-500/50";
                          else if (isInSearchSpace)
                            cellStyle = "bg-gray-700 border-gray-600";
                        }
                        return (
                          <div
                            key={`${r_idx}-${c_idx}`}
                            className={`w-14 h-14 flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-300 transform ${cellStyle}`}
                          >
                            {cell_val}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 font-semibold">
                  Explanation
                </h4>
                <p className="text-gray-200 min-h-[2rem]">{message || "..."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-gray-300 text-sm mb-2 font-semibold flex items-center gap-2">
                    <Terminal size={16} /> State Variables
                  </h4>
                  {activeAlgorithm === "intuitive" ? (
                    <div className="text-lg">
                      <span className="text-gray-400">Current [i, j]:</span>{" "}
                      <span className="font-mono text-sky-300">
                        [{i ?? "-"}, {j ?? "-"}]
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm">
                        <span className="text-gray-400">Range [L, R]:</span>{" "}
                        <span className="font-mono text-sky-300">
                          [{left ?? "-"}, {right ?? "-"}]
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Mid Index:</span>{" "}
                        <span className="font-mono text-sky-300">
                          {mid ?? "-"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Mid Coords:</span>{" "}
                        <span className="font-mono text-sky-300">
                          [{row ?? "-"}, {col ?? "-"}]
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2 text-green-300">
                    <CheckCircle size={16} /> Result for{" "}
                    <span className="font-mono text-orange-300">
                      {target ?? "?"}
                    </span>
                  </h4>
                  <div
                    className={`text-2xl font-bold ${
                      found ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isLoaded
                      ? found
                        ? "Found"
                        : currentStep === history.length - 1
                        ? "Not Found"
                        : "Searching..."
                      : "-"}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                  <h4 className="text-sky-300 font-semibold flex items-center gap-2 mb-2">
                    <Clock size={16} /> Complexity
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>
                      <strong>Time:</strong>{" "}
                      <span className="font-mono text-cyan-300">
                        {activeAlgorithm === "intuitive"
                          ? "O(m + n)"
                          : "O(log(m*n))"}
                      </span>
                    </div>
                    <div>
                      <strong>Space:</strong>{" "}
                      <span className="font-mono text-cyan-300">O(1)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default Search2DMatrix;
