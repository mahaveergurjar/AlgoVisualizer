import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  FileText,
  Grid3x3,
  Hash,
  CheckCircle,
  Clock,
  Cpu,
  TrendingUp,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <map>" },
    { l: 2, t: "#include <vector>" },
    { l: 3, t: "using namespace std;" },
    { l: 4, t: "" },
    { l: 5, t: "int equalPairs(vector<vector<int>>& grid) {" },
    { l: 6, t: "    int ans = 0;" },
    { l: 7, t: "    map<vector<int>, int> freq;" },
    { l: 8, t: "" },
    { l: 9, t: "    for (int i = 0; i < grid.size(); i++) {" },
    { l: 10, t: "        freq[grid[i]]++;" },
    { l: 11, t: "    }" },
    { l: 12, t: "" },
    { l: 13, t: "    for (int i = 0; i < grid[0].size(); i++) {" },
    { l: 14, t: "        vector<int> v;" },
    { l: 15, t: "        for (int j = 0; j < grid.size(); j++) {" },
    { l: 16, t: "            v.push_back(grid[j][i]);" },
    { l: 17, t: "        }" },
    { l: 18, t: "        ans += freq[v];" },
    { l: 19, t: "    }" },
    { l: 20, t: "" },
    { l: 21, t: "    return ans;" },
    { l: 22, t: "}" },
  ],
  Python: [
    { l: 1, t: "def equalPairs(grid):" },
    { l: 2, t: "    ans = 0" },
    { l: 3, t: "    freq = {}" },
    { l: 4, t: "" },
    { l: 5, t: "    for row in grid:" },
    { l: 6, t: "        row_tuple = tuple(row)" },
    { l: 7, t: "        freq[row_tuple] = freq.get(row_tuple, 0) + 1" },
    { l: 8, t: "" },
    { l: 9, t: "    for col in range(len(grid[0])):" },
    { l: 10, t: "        column = tuple(grid[row][col] for row in range(len(grid)))" },
    { l: 11, t: "        ans += freq.get(column, 0)" },
    { l: 12, t: "" },
    { l: 13, t: "    return ans" },
  ],
  Java: [
    { l: 1, t: "import java.util.HashMap;" },
    { l: 2, t: "import java.util.Arrays;" },
    { l: 3, t: "" },
    { l: 4, t: "public int equalPairs(int[][] grid) {" },
    { l: 5, t: "    int ans = 0;" },
    { l: 6, t: "    HashMap<String, Integer> freq = new HashMap<>();" },
    { l: 7, t: "" },
    { l: 8, t: "    for (int i = 0; i < grid.length; i++) {" },
    { l: 9, t: "        String row = Arrays.toString(grid[i]);" },
    { l: 10, t: "        freq.put(row, freq.getOrDefault(row, 0) + 1);" },
    { l: 11, t: "    }" },
    { l: 12, t: "" },
    { l: 13, t: "    for (int i = 0; i < grid[0].length; i++) {" },
    { l: 14, t: "        int[] col = new int[grid.length];" },
    { l: 15, t: "        for (int j = 0; j < grid.length; j++) {" },
    { l: 16, t: "            col[j] = grid[j][i];" },
    { l: 17, t: "        }" },
    { l: 18, t: "        ans += freq.getOrDefault(Arrays.toString(col), 0);" },
    { l: 19, t: "    }" },
    { l: 20, t: "" },
    { l: 21, t: "    return ans;" },
    { l: 22, t: "}" },
  ],
};

const EqualRowsColumnPairs = () => {
  const [gridInput, setGridInput] = useState("3,2,1;1,7,6;2,7,7");
  const [grid, setGrid] = useState([]);

  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [activeLang, setActiveLang] = useState("C++");

  const playRef = useRef(null);

  // Generate simulation history
  const generateHistory = useCallback((gridArray) => {
    const newHistory = [];
    const freq = new Map();
    let ans = 0;
    const matches = [];

    const addState = (props) => {
      newHistory.push({
        freq: new Map(freq),
        ans,
        currentRow: null,
        currentCol: null,
        currentVector: [],
        phase: "init",
        line: null,
        explanation: "",
        highlightedRow: null,
        highlightedCol: null,
        matches: [...matches],
        ...props,
      });
    };

    // Initial state
    addState({
      line: 7,
      explanation: "Creating a map to store frequency of each row as a vector.",
      phase: "init",
    });

    // Process rows and build frequency map
    for (let i = 0; i < gridArray.length; i++) {
      const row = gridArray[i];
      const rowKey = JSON.stringify(row);

      addState({
        line: 9,
        explanation: `Processing row ${i}: [${row.join(", ")}]`,
        currentRow: i,
        highlightedRow: i,
        currentVector: row,
        phase: "processing-row",
      });

      freq.set(rowKey, (freq.get(rowKey) || 0) + 1);

      addState({
        line: 10,
        explanation: `Added row [${row.join(", ")}] to frequency map. Count: ${freq.get(rowKey)}`,
        currentRow: i,
        highlightedRow: i,
        currentVector: row,
        phase: "row-added",
      });
    }

    addState({
      line: 11,
      explanation: `Completed building frequency map with ${freq.size} unique row(s).`,
      phase: "rows-complete",
    });

    // Process columns and count matches
    for (let i = 0; i < gridArray[0].length; i++) {
      const col = [];
      
      addState({
        line: 13,
        explanation: `Starting to process column ${i}`,
        currentCol: i,
        highlightedCol: i,
        phase: "col-start",
      });

      for (let j = 0; j < gridArray.length; j++) {
        col.push(gridArray[j][i]);

        addState({
          line: 16,
          explanation: `Extracting element at row ${j}, col ${i}: value = ${gridArray[j][i]}`,
          currentCol: i,
          highlightedCol: i,
          currentVector: [...col],
          phase: "building-col",
        });
      }

      const colKey = JSON.stringify(col);
      const matchCount = freq.get(colKey) || 0;

      if (matchCount > 0) {
        // Find matching rows
        for (let r = 0; r < gridArray.length; r++) {
          if (JSON.stringify(gridArray[r]) === colKey) {
            matches.push({ row: r, col: i });
          }
        }
      }

      addState({
        line: 18,
        explanation: `Column ${i}: [${col.join(", ")}] matches ${matchCount} row(s). Adding ${matchCount} to answer.`,
        currentCol: i,
        highlightedCol: i,
        currentVector: col,
        ans: ans + matchCount,
        phase: matchCount > 0 ? "match-found" : "no-match",
      });

      ans += matchCount;
    }

    // Final result
    addState({
      line: 21,
      explanation: `Algorithm complete! Total equal row-column pairs: ${ans}`,
      ans,
      phase: "done",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // Load and validate inputs
  const load = () => {
    const input = gridInput.trim();
    if (!input) {
      alert("Please enter a grid.");
      return;
    }

    try {
      const rows = input.split(";").map((row) => {
        const nums = row.split(",").map((s) => {
          const num = parseInt(s.trim(), 10);
          if (isNaN(num)) throw new Error(`Invalid number: ${s.trim()}`);
          return num;
        });
        return nums;
      });

      if (rows.length === 0) {
        alert("Please enter at least one row.");
        return;
      }

      const colCount = rows[0].length;
      if (!rows.every((row) => row.length === colCount)) {
        alert("All rows must have the same number of columns.");
        return;
      }

      setGrid(rows);
      setIsLoaded(true);
      generateHistory(rows);
    } catch (e) {
      alert("Please enter valid grid format (e.g., 3,2,1;1,7,6;2,7,7)");
    }
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  // Step controls
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  // Keyboard navigation
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

  // Auto-play functionality
  useEffect(() => {
    if (playing) {
      if (currentStep >= history.length - 1) {
        setPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            clearInterval(playRef.current);
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, history.length, currentStep]);

  // Stop playing when reaching the end
  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      clearInterval(playRef.current);
    }
  }, [currentStep, history.length]);

  const state = history[currentStep] || {};

  const formattedStep = () => {
    if (!isLoaded) return "0/0";
    return `${Math.max(0, currentStep + 1)}/${history.length}`;
  };

  const renderCodeLine = (lang, lineObj) => {
    const text = lineObj.t;
    const ln = lineObj.l;
    const active = state.line === ln;

    return (
      <div
        key={ln}
        className={`relative flex font-mono text-sm ${
          active ? "bg-cyan-500/10 border-l-4 border-cyan-400" : ""
        }`}
      >
        <div className="flex-none w-8 text-right text-gray-500 select-none pr-3">
          {text ? ln : ""}
        </div>
        <pre className="flex-1 m-0 p-1 text-gray-200 whitespace-pre">
          {text}
        </pre>
      </div>
    );
  };

  const getCellClass = (rowIdx, colIdx) => {
    const { highlightedRow, highlightedCol, phase, matches } = state;

    // Check if this cell is part of a match
    const isMatch = matches && matches.some(m => m.row === rowIdx && m.col === colIdx);
    
    if (isMatch) {
      return "bg-green-500/80 text-white shadow-lg border-2 border-green-300";
    }

    if (highlightedRow === rowIdx && phase.includes("row")) {
      return "bg-blue-500/80 text-white shadow-md border-2 border-blue-300";
    }

    if (highlightedCol === colIdx && phase.includes("col")) {
      return "bg-yellow-500/80 text-white shadow-md border-2 border-yellow-300";
    }

    return "bg-gray-700/60 text-gray-200 border border-gray-600";
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      {/* Background effects */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-cyan-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
          🔢 Equal Row and Column Pairs
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Count pairs where a row and column contain the same values in same order
        </p>
      </header>

      {/* Input Controls */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={gridInput}
            onChange={(e) => setGridInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
            placeholder="Enter grid (rows separated by ;, values by comma, e.g., 3,2,1;1,7,6;2,7,7)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-cyan-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <label className="text-sm text-gray-300">Speed</label>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={100}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  className="w-36"
                />
              </div>

              <button
                onClick={resetAll}
                className="ml-3 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      {/* Algorithm Tabs */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeLang === lang
                  ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Hash Map Frequency Count</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter a grid then click{" "}
          <span className="text-cyan-400 font-semibold">Load & Visualize</span>{" "}
          to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Code Panel */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">
                Language: {activeLang}
              </div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) =>
                renderCodeLine(activeLang, line)
              )}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Current active line highlighted in cyan.</div>
              <div>Tip: Use ← → keys to navigate, Space to play/pause.</div>
            </div>
          </aside>

          {/* Visualization Panel */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            {/* Grid Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Grid3x3 size={16} /> Grid Visualization
              </h4>

              <div className="inline-block">
                {grid.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-2 mb-2">
                    {row.map((val, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-300 ${getCellClass(
                          rowIdx,
                          colIdx
                        )}`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/80 rounded border-2 border-blue-300"></div>
                  <span>Currently processing row</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/80 rounded border-2 border-yellow-300"></div>
                  <span>Currently processing column</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/80 rounded border-2 border-green-300"></div>
                  <span>Matching pair found</span>
                </div>
              </div>
            </div>

            {/* Current Vector Display */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={16} /> Current Vector
              </h4>

              {state.currentVector && state.currentVector.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {state.currentVector.map((num, idx) => (
                    <div
                      key={`vec-${num}-${idx}`}
                      className={`px-3 py-2 rounded-lg font-mono text-sm font-bold ${
                        state.phase.includes("row")
                          ? "bg-blue-500/60 text-white"
                          : "bg-yellow-500/60 text-white"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  No vector being processed
                </div>
              )}

              <div className="mt-2 text-sm text-gray-400">
                Type:{" "}
                <span className="text-cyan-400 font-bold">
                  {state.phase.includes("row") ? "Row" : state.phase.includes("col") ? "Column" : "-"}
                </span>
              </div>
            </div>

            {/* Frequency Map */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Hash size={16} /> Row Frequency Map
              </h4>

              <div className="space-y-2 max-h-40 overflow-auto">
                {state.freq && state.freq.size > 0 ? (
                  Array.from(state.freq.entries()).map(([key, count], idx) => {
                    const vec = JSON.parse(key);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-gray-700/40 rounded-lg"
                      >
                        <div className="flex gap-1">
                          {vec.map((num, i) => (
                            <div
                              key={i}
                              className="px-2 py-1 bg-gray-600 rounded text-xs font-mono text-gray-200"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-400">→</div>
                        <div className="text-sm font-bold text-cyan-400">
                          Count: {count}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 italic">
                    Frequency map will appear here
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Answer
                </h4>
                <div className="text-4xl font-bold text-green-400">
                  {state.ans || 0}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Total equal pairs found
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Grid3x3 size={14} /> Grid Size
                </h4>
                <div className="text-2xl font-bold text-cyan-400">
                  {grid.length} × {grid[0]?.length || 0}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {grid.length} rows, {grid[0]?.length || 0} columns
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <FileText size={14} /> Explanation
              </h4>
              <p className="text-gray-200">
                {state.explanation ||
                  "Load a grid and press 'Load & Visualize' to begin."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>
                  <strong>Phase:</strong>{" "}
                  <span className="text-gray-200">{state.phase || "-"}</span>
                </div>
                <div className="col-span-2 mt-2">
                  <strong>Key Insight:</strong>{" "}
                  <span className="text-gray-200">
                    Store all rows in a hash map, then check each column against the map
                  </span>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-cyan-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity & Notes
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div>
                  <strong>Time:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n² × n)</span> — n² to iterate grid, n for hashing vectors
                </div>
                <div>
                  <strong>Space:</strong>{" "}
                  <span className="font-mono text-teal-300">O(n² × n)</span> — storing all rows as vectors in map
                </div>
                <div>
                  <strong>Key Optimization:</strong> Using vectors as map keys allows direct comparison
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
        .animate-float { animation: float 18s ease-in-out infinite; }
        .animate-float-delayed { animation: float 20s ease-in-out 8s infinite; }
        @keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
      `}</style>
    </div>
  );
};

export default EqualRowsColumnPairs;