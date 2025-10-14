import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  CheckCircle,
  List,
  Calculator,
  Layers,
  BarChart3,
  Clock,
  Droplets,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const TrappingRainWater = () => {
  const [mode, setMode] = useState("brute-force");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [heightsInput, setHeightsInput] = useState("0,1,0,2,1,0,1,3,2,1,2,1");
  const [isLoaded, setIsLoaded] = useState(false);
  const [maxHeight, setMaxHeight] = useState(1);

  const generateBruteForceHistory = useCallback((heights) => {
    const n = heights.length;
    const newHistory = [];
    let totalWater = 0;
    let waterLevels = new Array(n).fill(0);

    const addState = (props) =>
      newHistory.push({
        heights,
        totalWater,
        waterLevels: [...waterLevels],
        i: null,
        j: null,
        lmax: 0,
        rmax: 0,
        explanation: "",
        ...props,
      });

    addState({ line: 4, explanation: "Initialize total trapped water to 0." });
    for (let i = 1; i < n - 1; i++) {
      addState({
        line: 5,
        i,
        explanation: `Start main loop. Evaluating bar at index ${i}.`,
      });
      let lmax = 0;
      addState({
        line: 6,
        i,
        lmax,
        explanation: `Find max height to the left of index ${i}.`,
      });
      for (let j = i; j >= 0; j--) {
        lmax = Math.max(lmax, heights[j]);
        addState({
          line: 7,
          i,
          j,
          lmax,
          explanation: `Scanning left... Current lmax = ${lmax}.`,
        });
      }

      let rmax = 0;
      addState({
        line: 10,
        i,
        lmax,
        rmax,
        explanation: `Find max height to the right of index ${i}.`,
      });
      for (let j = i; j < n; j++) {
        rmax = Math.max(rmax, heights[j]);
        addState({
          line: 11,
          i,
          j,
          lmax,
          rmax,
          explanation: `Scanning right... Current rmax = ${rmax}.`,
        });
      }

      const water = Math.min(lmax, rmax) - heights[i];
      if (water > 0) {
        totalWater += water;
        waterLevels[i] = water;
      }
      addState({
        line: 14,
        i,
        lmax,
        rmax,
        explanation: `Water at index ${i} = min(${lmax}, ${rmax}) - height[${i}] = ${
          water > 0 ? water : 0
        }.`,
      });
      addState({
        line: 15,
        i,
        lmax,
        rmax,
        explanation: `Total trapped water is now ${totalWater}.`,
      });
    }
    addState({
      line: 18,
      finished: true,
      explanation: "Finished calculation. Returning total trapped water.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateOptimalHistory = useCallback((heights) => {
    const n = heights.length;
    if (n === 0) {
      setHistory([]);
      setCurrentStep(-1);
      return;
    }
    const newHistory = [];
    let lmax = new Array(n).fill(0);
    let rmax = new Array(n).fill(0);
    let totalWater = 0;
    let waterLevels = new Array(n).fill(0);

    const addState = (props) =>
      newHistory.push({
        heights,
        totalWater,
        waterLevels: [...waterLevels],
        lmax: [...lmax],
        rmax: [...rmax],
        i: null,
        explanation: "",
        ...props,
      });

    addState({
      line: 4,
      explanation: "Initialize left-max and right-max arrays.",
    });

    lmax[0] = heights[0];
    addState({
      line: 7,
      i: 0,
      explanation: `lmax[0] is set to height[0] = ${lmax[0]}.`,
    });
    for (let i = 1; i < n; i++) {
      lmax[i] = Math.max(lmax[i - 1], heights[i]);
      addState({
        line: 10,
        i,
        explanation: `lmax[${i}] = max(lmax[${i - 1}], height[${i}]) = max(${
          lmax[i - 1]
        }, ${heights[i]}) = ${lmax[i]}.`,
      });
    }

    rmax[n - 1] = heights[n - 1];
    addState({
      line: 13,
      i: n - 1,
      explanation: `rmax[n-1] is set to height[n-1] = ${rmax[n - 1]}.`,
    });
    for (let i = n - 2; i >= 0; i--) {
      rmax[i] = Math.max(rmax[i + 1], heights[i]);
      addState({
        line: 16,
        i,
        explanation: `rmax[${i}] = max(rmax[${i + 1}], height[${i}]) = max(${
          rmax[i + 1]
        }, ${heights[i]}) = ${rmax[i]}.`,
      });
    }

    addState({
      line: 19,
      explanation:
        "All prefix and suffix maxes calculated. Now, find the water.",
    });
    for (let i = 0; i < n; i++) {
      const water = Math.min(lmax[i], rmax[i]) - heights[i];
      if (water > 0) {
        totalWater += water;
        waterLevels[i] = water;
      }
      addState({
        line: 20,
        i,
        explanation: `Water at index ${i} = min(lmax[${i}], rmax[${i}]) - height[${i}] = min(${
          lmax[i]
        }, ${rmax[i]}) - ${heights[i]} = ${
          water > 0 ? water : 0
        }. Total = ${totalWater}`,
      });
    }

    addState({
      line: 23,
      finished: true,
      explanation: "Finished calculation. Returning total trapped water.",
    });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN)) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }
    setMaxHeight(Math.max(...localHeights, 1));
    setIsLoaded(true);
    mode === "brute-force"
      ? generateBruteForceHistory(localHeights)
      : generateOptimalHistory(localHeights);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };
  const parseInput = useCallback(() => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN) || localHeights.length < 2) throw new Error("Invalid input");
    return localHeights;
  }, [heightsInput]);
  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (h) => generateBruteForceHistory(h),
      optimal: (h) => generateOptimalHistory(h),
    },
    setCurrentStep,
    onError: () => {},
  });
  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { heights = [], waterLevels = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "light-blue": "text-sky-300",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    red: "text-red-400",
    "light-gray": "text-gray-400",
    green: "text-green-400",
    "": "text-gray-200",
  };
  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-blue-500/20" : ""
      }`}
    >
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

  const bruteForceCode = [
    {
      l: 4,
      c: [
        { t: "int", c: "cyan" },
        { t: " totalWater = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i = 1; i < n - 1; i++) {", c: "" },
      ],
    },
    {
      l: 6,
      c: [
        { t: "  int", c: "cyan" },
        { t: " lmax = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 7,
      c: [
        { t: "  for", c: "purple" },
        { t: " (int j = i; j >= 0; j--)", c: "" },
        { t: " lmax = max(lmax, height[j]);", c: "" },
      ],
    },
    {
      l: 10,
      c: [
        { t: "  int", c: "cyan" },
        { t: " rmax = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 11,
      c: [
        { t: "  for", c: "purple" },
        { t: " (int j = i; j < n; j++)", c: "" },
        { t: " rmax = max(rmax, height[j]);", c: "" },
      ],
    },
    {
      l: 14,
      c: [
        { t: "  int", c: "cyan" },
        { t: " water = min(lmax, rmax) - height[i];", c: "" },
      ],
    },
    {
      l: 15,
      c: [
        { t: "  if", c: "purple" },
        { t: " (water > 0) totalWater += water;", c: "" },
      ],
    },
    { l: 17, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 18,
      c: [
        { t: "return", c: "purple" },
        { t: " totalWater;", c: "" },
      ],
    },
  ];

  const optimalCode = [
    {
      l: 3,
      c: [
        { t: "int", c: "cyan" },
        { t: " n = height.size();", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "vector<", c: "yellow" },
        { t: "int", c: "cyan" },
        { t: "> lmax(n,0), rmax(n,0);", c: "" },
      ],
    },
    { l: 7, c: [{ t: "lmax[0] = height[0];", c: "" }] },
    {
      l: 9,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i=1; i<n; i++){", c: "" },
      ],
    },
    { l: 10, c: [{ t: "  lmax[i] = max(lmax[i-1], height[i]);", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    { l: 13, c: [{ t: "rmax[n-1] = height[n-1];", c: "" }] },
    {
      l: 15,
      c: [
        { t: "for", c: "purple" },
        { t: " (int i=n-2; i>=0; i--){", c: "" },
      ],
    },
    { l: 16, c: [{ t: "  rmax[i] = max(rmax[i+1], height[i]);", c: "" }] },
    { l: 17, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 19,
      c: [
        { t: "int", c: "cyan" },
        { t: " ans = ", c: "" },
        { t: "0", c: "orange" },
        { t: ";", c: "light-gray" },
      ],
    },
    {
      l: 20,
      c: [
        { t: "for", c: "purple" },
        {
          t: " (int i=0; i<n; i++) ans += min(lmax[i], rmax[i]) - height[i];",
          c: "",
        },
      ],
    },
    {
      l: 23,
      c: [
        { t: "return", c: "purple" },
        { t: " ans;", c: "" },
      ],
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400">
          Trapping Rain Water
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 42</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label
            htmlFor="heights-input"
            className="font-medium text-gray-300 font-mono"
          >
            Heights:
          </label>
          <input
            id="heights-input"
            type="text"
            value={heightsInput}
            onChange={(e) => setHeightsInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-mono w-24 text-center">
                {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 cursor-pointer hover:bg-red-700 font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "brute-force"
              ? "border-blue-400 text-blue-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Brute Force O(n²)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-blue-400 text-blue-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Optimal O(n)
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              C++ {mode === "brute-force" ? "Brute Force" : "Optimal"} Solution
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {mode === "brute-force"
                  ? bruteForceCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))
                  : optimalCode.map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[340px]">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Elevation Map
              </h3>
              <div
                id="elevation-map-container"
                className="flex justify-center items-end gap-1 h-64 border-b-2 border-gray-600 pb-2"
              >
                {heights.map((h, index) => {
                  const isI = state.i === index;
                  const isJ = state.j === index && mode === "brute-force";
                  return (
                    <div
                      key={index}
                      id={`elevation-map-container-element-${index}`}
                      className="flex-1 flex flex-col justify-end items-center h-full relative"
                    >
                      <div
                        className="absolute bottom-0 w-full bg-blue-500/30 transition-all duration-300"
                        style={{
                          height: `${
                            (Math.min(
                              state.lmax?.[index] ?? state.lmax ?? 0,
                              state.rmax?.[index] ?? state.rmax ?? 0
                            ) /
                              maxHeight) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 bg-gray-600 relative z-10 border-x-2 border-t-2 ${
                          isI
                            ? "border-amber-400"
                            : isJ
                            ? "border-cyan-400"
                            : "border-transparent"
                        }`}
                        style={{ height: `${(h / maxHeight) * 100}%` }}
                      ></div>
                      <div
                        className="absolute bottom-0 w-full bg-blue-500 z-20 transition-all duration-300"
                        style={{
                          height: `${
                            ((waterLevels[index] ?? 0) / maxHeight) * 100
                          }%`,
                        }}
                      ></div>
                      <span className="text-xs text-gray-400 mt-1">{h}</span>
                    </div>
                  );
                })}
              </div>
              {isLoaded && (
                <VisualizerPointer
                  index={state.i}
                  containerId="elevation-map-container"
                  color="amber"
                  label="i"
                  direction="up"
                />
              )}
              {isLoaded && mode === "brute-force" && (
                <VisualizerPointer
                  index={state.j}
                  containerId="elevation-map-container"
                  color="cyan"
                  label="j"
                  direction="up"
                />
              )}
            </div>

            {mode === "optimal" && (
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-4">
                <div>
                  <h4 className="font-mono text-sm text-gray-400">
                    Left Max Array (lmax)
                  </h4>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {state.lmax?.map((val, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 flex items-center justify-center rounded-md font-mono transition-colors duration-300 ${
                          state.i === index
                            ? "bg-blue-500/50 border border-blue-400"
                            : "bg-gray-700"
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-mono text-sm text-gray-400">
                    Right Max Array (rmax)
                  </h4>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {state.rmax?.map((val, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 flex items-center justify-center rounded-md font-mono transition-colors duration-300 ${
                          state.i === index
                            ? "bg-blue-500/50 border border-blue-400"
                            : "bg-gray-700"
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-800/30 p-4 rounded-xl border border-green-700/50">
              <h3 className="text-green-300 text-sm flex items-center gap-2">
                <Droplets size={16} />
                Total Trapped Water
              </h3>
              <p className="font-mono text-4xl text-green-400 mt-2">
                {state.totalWater ?? 0}
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
            </div>
          </div>
          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            {mode === "brute-force" ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N²)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    For each element of the array, we iterate to its left to
                    find the maximum height and to its right to find the maximum
                    height. This results in nested loops, leading to a quadratic
                    time complexity.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(1)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    We only use a few variables to store `lmax`, `rmax`, and
                    `totalWater`. The space required does not scale with the
                    size of the input array.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    We make three separate passes through the array: one to
                    compute `lmax` for all elements, one to compute `rmax`, and
                    a final one to calculate the trapped water. Each pass is
                    linear, so the total time complexity is O(N) + O(N) + O(N) =
                    O(N).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    We use two additional arrays, `lmax` and `rmax`, each of
                    size N, to store the pre-calculated maximum heights. This
                    results in a space complexity that is linear with respect to
                    the input size.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Load heights to begin visualization.
        </p>
      )}
    </div>
  );
};

export default TrappingRainWater;
