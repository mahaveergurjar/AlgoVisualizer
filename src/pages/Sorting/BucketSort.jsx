import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  List,
  PackageOpen,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// ---------------------- Helpers ----------------------
function deepCloneObjects(arr) {
  return JSON.parse(JSON.stringify(arr));
}

// Insertion Sort estable (para cada bucket) con conteo de comparaciones/movimientos
function insertionSortStable(arr, counts) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j].value > key.value) {
      counts.totalComparisons++;
      arr[j + 1] = arr[j];
      counts.totalMoves++;
      j--;
    }
    // una comparación adicional cuando falla la condición (si el while corrió al menos una vez)
    if (i - 1 >= 0) counts.totalComparisons++;
    arr[j + 1] = key;
    counts.totalMoves++;
  }
  return arr;
}

// ---------------------- Main Visualizer ----------------------
const BucketSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("0.42,0.32,0.33,0.52,0.37,0.47,0.51");
  const [isLoaded, setIsLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const visualizerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const generateBucketSortHistory = useCallback((initialArrayObjects) => {
    const arr = deepCloneObjects(initialArrayObjects); // [{id,value}]
    const n = arr.length;
    const newHistory = [];
    const counts = { totalMoves: 0, totalComparisons: 0 };
    let sortedIndices = []; // se llenará al final
    let finished = false;

    const addState = (props = {}) => {
      newHistory.push({
        array: deepCloneObjects(arr),
        i: null,
        j: null,
        bucketIndex: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps: counts.totalMoves,       // usamos "moves" como equivalente visual
        totalComparisons: counts.totalComparisons,
        finished,
        ...props,
      });
    };

    // Paso 0: inicial
    addState({
      line: 1,
      explanation: "Initialize Bucket Sort. Choose number of buckets (≈ √n).",
    });

    if (n <= 1) {
      finished = true;
      sortedIndices = Array.from({ length: n }, (_, k) => k);
      addState({
        line: 20,
        sortedIndices,
        finished: true,
        explanation: "Trivial input (n ≤ 1). Already sorted.",
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    // Preparar buckets
    const min = Math.min(...arr.map((o) => o.value));
    const max = Math.max(...arr.map((o) => o.value));
    const range = Math.max(1e-9, max - min); // evita div. por cero
    const b = Math.max(1, Math.floor(Math.sqrt(n)));
    const buckets = Array.from({ length: b }, () => []); // cada bucket es array de objetos {id,value}

    addState({
      line: 2,
      explanation: `Create ${b} buckets. Normalize values to [0,1) using (x-min)/(max-min).`,
    });

    // Distribución en buckets (registramos un snapshot por cada push)
    for (let i = 0; i < n; i++) {
      const x = arr[i];
      const norm = (x.value - min) / range;
      let idx = Math.floor(norm * b);
      if (idx >= b) idx = b - 1;
      buckets[idx].push(x);

      addState({
        line: 4,
        i,
        bucketIndex: idx,
        explanation: `Place value ${x.value} into bucket ${idx}.`,
      });
    }

    // Ordenar cada bucket con insertion sort estable (contamos comparaciones/movimientos)
    for (let bi = 0; bi < b; bi++) {
      const before = buckets[bi].map((o) => o.value).join(", ");
      insertionSortStable(buckets[bi], counts);
      const after = buckets[bi].map((o) => o.value).join(", ");
      addState({
        line: 7,
        bucketIndex: bi,
        explanation: `Sort bucket ${bi} with insertion sort. ${before} → ${after}`,
      });
    }

    // Concatenar buckets de vuelta a arr, marcando placements como "swaps"
    let k = 0;
    for (let bi = 0; bi < b; bi++) {
      for (let j = 0; j < buckets[bi].length; j++) {
        arr[k] = buckets[bi][j];
        counts.totalMoves++;
        addState({
          line: 10,
          j,
          bucketIndex: bi,
          explanation: `Place ${buckets[bi][j].value} back into array at position ${k}.`,
        });
        k++;
      }
    }

    // Final
    finished = true;
    sortedIndices = Array.from({ length: n }, (_, idx) => idx);
    addState({
      line: 20,
      sortedIndices,
      finished: true,
      explanation: "Array fully sorted by concatenating sorted buckets.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (localArray.some(isNaN) || localArray.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    // Estable: usar objetos con id estable
    const initialObjects = localArray.map((value, id) => ({ value, id }));

    setIsLoaded(true);
    generateBucketSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const btn = document.getElementById("load-button");
      if (btn) btn.click();
    }
  };

  const handleSpeedChange = (e) => setSpeed(parseFloat(e.target.value));
  const playhead = useCallback(() => setIsPlaying((prev) => !prev), []);
  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  // Keyboard control
  useEffect(() => {
    if (!active || !isLoaded) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBackward();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, isLoaded, stepForward, stepBackward]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (visualizerRef.current && !visualizerRef.current.contains(e.target)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || history.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= history.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, history.length]);

  const state = history[currentStep] || {};
  const { array = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-blue-500/20" : ""}`}>
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  // Pseudocode estilo Bucket Sort
  const bucketSortCode = [
    { l: 1,  c: [{ t: "function bucketSort(A) {", c: "" }] },
    { l: 2,  c: [{ t: "  b =", c: "" }, { t: " floor(sqrt(n))", c: "orange" }, { t: "; create", c: "" }, { t: " b ", c: "yellow" }, { t: "buckets", c: "" }] },
    { l: 3,  c: [{ t: "  for", c: "purple" }, { t: " each x in A:", c: "" }] },
    { l: 4,  c: [{ t: "    i =", c: "" }, { t: " floor( (x - min)/(max - min) * b )", c: "orange" }, { t: "; push x to bucket[i]", c: "" }] },
    { l: 7,  c: [{ t: "  for", c: "purple" }, { t: " i in 0..b-1:", c: "" }] },
    { l: 8,  c: [{ t: "    insertionSort(bucket[i])", c: "" }] },
    { l: 10, c: [{ t: "  concat buckets back to A", c: "" }] },
    { l: 20, c: [{ t: "  return", c: "purple" }, { t: " A", c: "" }, { t: ";", c: "light-gray" }] },
    { l: 21, c: [{ t: "}", c: "" }] },
  ];

  return (
    <div
      ref={visualizerRef}
      tabIndex={0}
      onClick={() => setActive(true)}
      className="p-4 max-w-7xl mx-auto focus:outline-none"
    >
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <PackageOpen /> Bucket Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Distribution-based, non-comparative sorting (stable if bucket sort uses a stable sub-sort).
        </p>
      </header>

      {/* Controls */}
      <div className="w-full flex justify-center">
        <div className="shadow-2xl border border-gray-700/50 bg-gray-800/50 p-4 rounded-lg  flex flex-col md:flex-row items-center justify-between gap-2 mb-6 w-full">
          <div className={`flex items-center gap-4 ${isLoaded ? "w-full" : "w-full md:w-950"}`}>
            <label htmlFor="array-input" className="font-medium text-gray-300 font-mono hidden md:block">
              Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              onKeyDown={handleEnterKey}
              disabled={isLoaded}
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 0.42,0.32,0.33,0.52,0.37,0.47,0.51"
            />
          </div>
          <div className="flex items-center flex-wrap gap-4 md:flex-nowrap w-full md:w-150">
            {!isLoaded ? (
              <button
                id="load-button"
                onClick={loadArray}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                Load & Visualize
              </button>
            ) : (
              <>
                <div className="flex gap-2 w-full md:w-40 justify-center">
                  <button
                    onClick={stepBackward}
                    disabled={currentStep <= 0}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
                  >
                    {/* back */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={playhead}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
                  >
                    {isPlaying ? (
                      // Pause
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="white" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                      </svg>
                    ) : (
                      // Play
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="white" viewBox="0 0 448 512">
                        <path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72v368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1L91.2 36.9z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={stepForward}
                    disabled={currentStep >= history.length - 1}
                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50 w-full md:w-10 flex justify-center"
                  >
                    {/* next */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-2 w-full lg:w-72 justify-center ">
                  <div className="flex items-center gap-2 rounded-lg flex-shrink-0 lg:w-72 w-full">
                    <span className="text-sm font-semibold">Speed</span>
                    <input
                      type="range"
                      className="w-full h-1.5 bg-gray-600 rounded-lg outline-none cursor-pointer"
                      min="0.25"
                      max="2"
                      step="0.25"
                      value={speed}
                      onChange={handleSpeedChange}
                    />
                    <span className="text-sm min-w-8 font-mono text-gray-300 text-right">
                      {speed}x
                    </span>
                    <span className="font-mono w-18 px-4 py-2 flex items-center justify-center text-center bg-gray-900 border border-gray-600 rounded-md">
                      {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                    </span>
                    {/* Array size display - showing current number of elements */}
                    {isLoaded && arrayInput && (
                      <span className="text-sm text-gray-400 font-medium ml-4">
                        Array Size: {arrayInput.split(',').filter(item => item.trim() !== '').length}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="flex w-full md:w-20">
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg whitespace-nowrap text-sm sm:text-base flex-shrink-0 mx-auto w-full"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualización principal (cajas) */}
      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {bucketSortCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Distribution & Concatenation Visualization
              </h3>

              <div className="flex justify-center items-center min-h-[170px] py-4 overflow-x-auto">
                <div
                  id="array-container"
                  className="relative transition-all"
                  style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}
                >
                  {array.map((item, index) => {
                    const isPlacing = state.j === index; // cuando colocamos de vuelta
                    const isSorted = state.sortedIndices?.includes(index);

                    let boxStyles = "bg-gray-700 border-gray-600";
                    if (state.finished || isSorted) {
                      boxStyles = "bg-green-700 border-green-500 text-white";
                    } else if (isPlacing) {
                      boxStyles = "bg-cyan-700 border-cyan-400 text-white";
                    }

                    return (
                      <div
                        key={item.id}
                        id={`array-container-element-${index}`}
                        className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                        style={{ left: `${index * 4.5}rem` }}
                        title={String(item.value)}
                      >
                        {item.value}
                      </div>
                    );
                  })}
                  {isLoaded && (
                    <>
                      {/* Pointer para posición j (colocación) */}
                      <VisualizerPointer
                        index={state.j}
                        containerId="array-container"
                        color="cyan"
                        label="pos"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Total Comparisons
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">
                  {state.totalComparisons ?? 0}
                </p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2">
                  <Repeat size={16} /> Total Moves
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">
                  {state.totalSwaps ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-green-400" />
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Time Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">Average: O(n + k)</strong><br />
                  Distribution to k buckets plus sorting inside (using insertion sort).
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">Worst: O(n²)</strong><br />
                  All elements land in the same bucket and insertion sort dominates.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">Best: O(n)</strong><br />
                  With good distribution and small bucket sizes, concatenation is near-linear.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(n + k)</strong><br />
                  Additional memory for buckets. Stable if the sub-sort is stable; not in-place.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Load an array to begin visualization.
        </p>
      )}
    </div>
  );
};

export default BucketSortVisualizer;
