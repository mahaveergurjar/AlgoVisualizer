import React, { useState, useEffect, useCallback } from "react";
import { Move, Search, Code, CheckCircle, XCircle, Target } from "lucide-react";

// Component to correctly tokenize and highlight a line of code
const CodeLine = ({ text }) => {
  const KEYWORDS = ["return", "while", "if", "else", "for"];
  const TYPES = ["int", "bool", "vector<vector<int>>&"];
  const FUNCTIONS = ["searchMatrix", "helper"];
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
  const [activeAlgorithm, setActiveAlgorithm] = useState("intuitive"); // 'intuitive' or 'optimal'
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [matrixInput, setMatrixInput] = useState(
    "[[1,3,5,7],[10,11,16,20],[23,30,34,60]]"
  );
  const [targetInput, setTargetInput] = useState("13");
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeLanguage, setActiveLanguage] = useState("cpp");

  const intuitiveCodeContent = {
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
    11: `    }`,
    12: `    return false;`,
    13: `}`,
  };

  const intuitiveJavaCodeContent = {
    1: `public boolean searchMatrix(int[][] matrix, int target) {`,
    2: `    int row = 0;`,
    3: `    int col = matrix[0].length - 1;`,
    4: `    while(row <= matrix.length - 1 && col >= 0){`,
    5: `        if(matrix[row][col] == target){`,
    6: `            return true;`,
    7: `        } else if(target < matrix[row][col]){`,
    8: `            col--;`,
    9: `        } else {`,
    10: `            row++;`,
    11: `        }`,
    12: `    }`,
    13: `    return false;`,
    14: `}`,
  };

  const optimalCodeContent = {
    1: `bool searchMatrix(vector<vector<int>>& matrix, int target) {`,
    2: `    int m = matrix.size(), n = matrix[0].size();`,
    3: `    int left = 0, right = m * n - 1;`,
    4: `    while (left <= right) {`,
    5: `        int mid = left + (right - left) / 2;`,
    6: `        int row = mid / n, col = mid % n;`,
    7: `        int val = matrix[row][col];`,
    8: `        if (val == target) return true;`,
    9: `        if (val < target) left = mid + 1;`,
    10: `        else right = mid - 1;`,
    11: `    }`,
    12: `    return false;`,
    13: `}`,
  };

  const generateHistoryForIntuitive = (localMatrix, localTarget, m, n) => {
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        matrix: localMatrix,
        target: localTarget,
        m,
        n,
        ...props,
      });
    let i = 0,
      j = n - 1,
      found = false;
    addState({
      line: 3,
      i,
      j,
      val: null,
      message: `Start search at top-right corner: [${i}, ${j}].`,
    });
    while (i < m && j >= 0) {
      const val = localMatrix[i][j];
      addState({
        line: 4,
        i,
        j,
        val,
        message: `Checking value at [${i}, ${j}]: ${val}.`,
      });
      if (val === localTarget) {
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
      if (val > localTarget) {
        addState({
          line: 6,
          i,
          j,
          val,
          message: `${val} > ${localTarget}. Value is too large.`,
        });
        const prev_j = j;
        j--;
        addState({
          line: 7,
          i,
          j: prev_j,
          val,
          message: `Eliminate column and move left to [${i}, ${j}].`,
        });
      } else {
        addState({
          line: 8,
          i,
          j,
          val,
          message: `${val} < ${localTarget}. Value is too small.`,
        });
        const prev_i = i;
        i++;
        addState({
          line: 9,
          i: prev_i,
          j,
          val,
          message: `Eliminate row and move down to [${i}, ${j}].`,
        });
      }
    }
    if (!found)
      addState({
        line: 12,
        i,
        j,
        val: null,
        found: false,
        message: `Search space exhausted. Target not found.`,
      });
    return newHistory;
  };

  const generateHistoryForOptimal = (localMatrix, localTarget, m, n) => {
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        matrix: localMatrix,
        target: localTarget,
        m,
        n,
        ...props,
      });
    let left = 0,
      right = m * n - 1,
      found = false;
    addState({
      line: 3,
      left,
      right,
      mid: null,
      message: "Initialize search space for the flattened matrix.",
    });
    while (left <= right) {
      const mid = Math.floor(left + (right - left) / 2);
      const row = Math.floor(mid / n);
      const col = mid % n;
      const val = localMatrix[row][col];
      addState({
        line: 5,
        left,
        right,
        mid,
        row,
        col,
        val,
        message: `Calculate mid-point index: ${mid}.`,
      });
      addState({
        line: 6,
        left,
        right,
        mid,
        row,
        col,
        val,
        message: `Convert to 2D coordinates: [${row}, ${col}].`,
      });
      if (val === localTarget) {
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
      if (val < localTarget) {
        addState({
          line: 9,
          left,
          right,
          mid,
          row,
          col,
          val,
          message: `${val} < ${localTarget}. Search right half.`,
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
          message: `${val} > ${localTarget}. Search left half.`,
        });
        right = mid - 1;
      }
    }
    if (!found)
      addState({
        line: 12,
        left,
        right,
        mid: null,
        found: false,
        message: `Search complete. Target not found.`,
      });
    return newHistory;
  };

  const generateHistory = useCallback(() => {
    let localMatrix;
    try {
      localMatrix = JSON.parse(matrixInput.replace(/'/g, '"'));
      if (
        !Array.isArray(localMatrix) ||
        !localMatrix.every((row) => Array.isArray(row))
      )
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
    const m = localMatrix.length;
    if (m === 0) {
      alert("Matrix cannot be empty.");
      return;
    }
    const n = localMatrix[0].length;
    if (n === 0) {
      alert("Matrix rows cannot be empty.");
      return;
    }

    let newHistory = [];
    if (activeAlgorithm === "intuitive") {
      newHistory = generateHistoryForIntuitive(localMatrix, localTarget, m, n);
    } else {
      newHistory = generateHistoryForOptimal(localMatrix, localTarget, m, n);
    }
    setHistory(newHistory);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [matrixInput, targetInput, activeAlgorithm]);

  const resetVisualization = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
  };
  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  const handleTabClick = (algorithm) => {
    setActiveAlgorithm(algorithm);
    resetVisualization();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepBackward();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          stepForward();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepBackward, stepForward]);

  const state = history[currentStep] || {};
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
    val,
    found,
    message,
    m,
    n,
  } = state;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a202c; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
            `}</style>
      <div className="p-4 max-w-7xl mx-auto">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent mb-3">
            {" "}
            Search a 2D Matrix{" "}
          </h1>
          <p className="text-lg text-gray-400"> Visualizing LeetCode 74 </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              {" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                ←
              </kbd>{" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>{" "}
              Navigate{" "}
            </span>
          </div>
        </header>

        <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 mb-8">
          {/* Controls section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto flex-wrap">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label
                  htmlFor="matrix-input"
                  className="font-semibold text-gray-300 text-sm whitespace-nowrap"
                >
                  Matrix:
                </label>
                <input
                  id="matrix-input"
                  type="text"
                  value={matrixInput}
                  onChange={(e) => setMatrixInput(e.target.value)}
                  disabled={isLoaded}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 w-full sm:w-96 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  placeholder="e.g., [[1,3,5],[10,11,16]]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="target-input"
                  className="font-semibold text-gray-300 text-sm"
                >
                  Target:
                </label>
                <input
                  id="target-input"
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  disabled={isLoaded}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 w-24 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isLoaded ? (
                <button
                  onClick={generateHistory}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  {" "}
                  Load & Visualize{" "}
                </button>
              ) : (
                <>
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous step (←)"
                  >
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>{" "}
                  </button>
                  <span className="font-mono text-base text-gray-300 min-w-[100px] text-center bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700">
                    {" "}
                    Step{" "}
                    <span className="text-sky-400 font-bold">
                      {currentStep + 1}
                    </span>
                    /{history.length}{" "}
                  </span>
                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next step (→)"
                  >
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>{" "}
                  </button>
                </>
              )}
              <button
                onClick={resetVisualization}
                className="ml-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {" "}
                Reset{" "}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => handleTabClick("intuitive")}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                activeAlgorithm === "intuitive"
                  ? "border-b-2 border-sky-400 text-sky-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Intuitive O(m+n)
            </button>
            <button
              onClick={() => handleTabClick("optimal")}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                activeAlgorithm === "optimal"
                  ? "border-b-2 border-sky-400 text-sky-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Optimal O(log(m*n))
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-900/70 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-sky-400 mb-4 border-b border-gray-700 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                {activeAlgorithm === "intuitive"
                  ? "O(m+n) Solution"
                  : "C++ O(log(m*n)) Solution"}
              </span>

              {/* LANGUAGE TOGGLE BUTTONS INLINE */}
              {activeAlgorithm === "intuitive" && (
                <span className="flex gap-2">
                  <button
                    onClick={() => setActiveLanguage("cpp")}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeLanguage === "cpp"
                        ? "bg-sky-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    C++
                  </button>
                  <button
                    onClick={() => setActiveLanguage("java")}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeLanguage === "java"
                        ? "bg-sky-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    Java
                  </button>
                </span>
              )}
            </h3>

            <div className="overflow-x-auto custom-scrollbar bg-gray-800 p-3 rounded-lg font-mono text-sm">
              {Object.entries(
                activeAlgorithm === "intuitive"
                  ? activeLanguage === "cpp"
                    ? intuitiveCodeContent
                    : intuitiveJavaCodeContent
                  : optimalCodeContent
              ).map(([lineNum, text]) => (
                <div
                  key={lineNum}
                  className={`flex items-start transition-all duration-300 ${
                    line === parseInt(lineNum) ? "bg-sky-500/20" : ""
                  }`}
                >
                  <span className="text-gray-600 select-none text-right inline-block w-8 mr-3 pt-0.5">
                    {lineNum}
                  </span>
                  <div className="flex-1 pt-0.5">
                    {" "}
                    <CodeLine text={text} />{" "}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-900/70 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 text-center">
                Matrix Visualization
              </h3>
              <p className="text-sm text-gray-400 mb-4 text-center h-5">
                {message || "Load data to begin visualization."}
              </p>

              <div className="flex justify-center items-center">
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${n || 1}, minmax(0, 1fr))`,
                  }}
                >
                  {isLoaded &&
                    matrix.map((r_val, r_idx) =>
                      r_val.map((cell_val, c_idx) => {
                        let cellStyle =
                          "bg-gray-800/50 border-gray-700/50 opacity-40"; // Default: eliminated

                        if (activeAlgorithm === "intuitive") {
                          const isCurrent = r_idx === i && c_idx === j;
                          const isEliminated = r_idx < i || c_idx > j;
                          const isFoundCell = found && isCurrent;

                          if (isFoundCell)
                            cellStyle =
                              "bg-green-500 border-green-400 scale-110 shadow-lg shadow-green-500/50";
                          else if (isCurrent)
                            cellStyle =
                              "bg-sky-500 border-sky-400 scale-110 shadow-lg shadow-sky-500/50";
                          else if (!isEliminated)
                            cellStyle = "bg-gray-700 border-gray-600";
                        } else {
                          // optimal
                          const flat_idx = r_idx * n + c_idx;
                          const isInSearchSpace =
                            flat_idx >= left && flat_idx <= right;
                          const isMid = r_idx === row && c_idx === col;
                          const isFoundCell = found && isMid;

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
                            className={`w-16 h-16 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all duration-300 transform ${cellStyle}`}
                          >
                            {cell_val}
                          </div>
                        );
                      })
                    )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-6 rounded-xl shadow-xl border border-purple-700/50 text-center">
                {activeAlgorithm === "intuitive" ? (
                  <>
                    <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center justify-center gap-2">
                      <Move className="w-5 h-5" /> Pointers [i, j]
                    </h3>
                    <div className="font-mono text-5xl font-bold text-purple-300">
                      {isLoaded ? `[${i}, ${j}]` : "-"}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg text-purple-300 mb-3 flex items-center justify-center gap-2">
                      <Search className="w-5 h-5" /> Linear Index [L, R]
                    </h3>
                    <div className="font-mono text-4xl font-bold text-purple-300">
                      {isLoaded ? `[${left}, ${right}]` : "-"}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 p-6 rounded-xl shadow-xl border border-orange-700/50 text-center">
                <h3 className="font-bold text-lg text-orange-300 mb-3 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5" /> Target
                </h3>
                <div className="font-mono text-5xl font-bold text-orange-300">
                  {isLoaded ? target : "-"}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-6 rounded-xl shadow-xl border border-green-700/50 text-center">
                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center justify-center gap-2">
                  {" "}
                  {found ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}{" "}
                  Result{" "}
                </h3>
                <div className="font-mono text-4xl font-bold text-green-400 mt-4">
                  {isLoaded
                    ? found
                      ? "Found"
                      : currentStep === history.length - 1
                      ? "Not Found"
                      : "Searching..."
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 pb-6 text-gray-500 text-sm">
          <p>Use arrow keys ← → to navigate through steps!</p>
        </footer>
      </div>
    </div>
  );
};

export default Search2DMatrix;
// Doing dummy comment to recreate PR!
