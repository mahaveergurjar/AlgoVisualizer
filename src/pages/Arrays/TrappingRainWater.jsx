import React, { useState, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  BarChart3,
  Clock,
  Droplets,
} from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const TrappingRainWater = () => {
  const [mode, setMode] = useState("brute-force");
  const [heightsInput, setHeightsInput] = useState("0,1,0,2,1,0,1,3,2,1,2,1");
  const [maxHeight, setMaxHeight] = useState(1);
  const [codeLang, setCodeLang] = useState("cpp");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

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
    load(newHistory);
  }, [load]);

  const generateOptimalHistory = useCallback((heights) => {
    const n = heights.length;
    if (n === 0) {
      load([]);
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
    load(newHistory);
  }, [load]);

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
    if (mode === "brute-force") {
      generateBruteForceHistory(localHeights);
    } else {
      generateOptimalHistory(localHeights);
    }
  };

  const parseInput = useCallback(() => {
    const localHeights = heightsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localHeights.some(isNaN) || localHeights.length < 2)
      throw new Error("Invalid input");
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
    setCurrentStep: () => {},
    onError: () => {},
  });

  const state = currentState || {};
  const { heights = [], waterLevels = [], line = 4 } = state;

  const bruteForceCode = {
    4: `int totalWater = 0;`,
    5: `for (int i = 1; i < n - 1; i++) {`,
    6: `    int lmax = 0;`,
    7: `    for (int j = i; j >= 0; j--) lmax = max(lmax, height[j]);`,
    10: `    int rmax = 0;`,
    11: `    for (int j = i; j < n; j++) rmax = max(rmax, height[j]);`,
    14: `    int water = min(lmax, rmax) - height[i];`,
    15: `    if (water > 0) totalWater += water;`,
    18: `}`
  };

  const optimalCode = {
    3: `int n = height.size();`,
    4: `vector<int> lmax(n, 0), rmax(n, 0);`,
    7: `lmax[0] = height[0];`,
    9: `for (int i = 1; i < n; i++) {`,
    10: `    lmax[i] = max(lmax[i-1], height[i]);`,
    11: `}`,
    13: `rmax[n-1] = height[n-1];`,
    15: `for (int i = n - 2; i >= 0; i--) {`,
    16: `    rmax[i] = max(rmax[i+1], height[i]);`,
    17: `}`,
    19: `int ans = 0;`,
    20: `for (int i = 0; i < n; i++) ans += min(lmax[i], rmax[i]) - height[i];`,
    23: `return ans;`
  };

  const javaOptimalCode = {
    1: `public int trap(int[] height) {`,
    2: `    int n = height.length;`,
    4: `    int[] leftMax = new int[n];`,
    5: `    leftMax[0] = height[0];`,
    7: `    for (int i = 1; i < n; i++) leftMax[i] = Math.max(height[i], leftMax[i-1]);`,
    10: `    int[] rightMax = new int[n];`,
    11: `    rightMax[n-1] = height[n-1];`,
    13: `    for (int i = n - 2; i >= 0; i--) rightMax[i] = Math.max(height[i], rightMax[i+1]);`,
    16: `    int trappedWater = 0;`,
    18: `    for (int i = 0; i < n; i++) {`,
    19: `        int waterLevel = Math.min(leftMax[i], rightMax[i]);`,
    20: `        trappedWater += waterLevel - height[i];`,
    22: `    }`,
    24: `    return trappedWater;`,
    25: `}`
  };

  const getActiveCode = () => {
    if (mode === "brute-force") return bruteForceCode;
    return codeLang === "cpp" ? optimalCode : javaOptimalCode;
  };

  const inputSection = (
    <>
      <input
        id="heights-input"
        type="text"
        value={heightsInput}
        onChange={(e) => setHeightsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., 0,1,0,2,1,0,1,3,2,1,2,1"
      />
      {!isLoaded && (
        <button
          onClick={loadArray}
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Total Water
        </h4>
        <div className="text-3xl font-mono text-blue-400">
          {state.totalWater ?? 0}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-amber-300 select-none">
          Left Max
        </h4>
        <div className="text-3xl font-mono text-amber-400">
          {mode === "brute-force" ? (state.lmax ?? 0) : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Right Max
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {mode === "brute-force" ? (state.rmax ?? 0) : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity ({mode === "brute-force" ? "Brute" : "Optimal"})
        </h4>
        {mode === "brute-force" ? (
          <div className="text-sm text-gray-300 space-y-1">
            <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(n²)</span> - Scanning left & right for each index.</div>
            <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(1)</span> - Constant extra variables.</div>
          </div>
        ) : (
          <div className="text-sm text-gray-300 space-y-1">
            <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(n)</span> - Precalculating max bounds.</div>
            <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(n)</span> - Storage of prefix/suffix bounds.</div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Trapping Rain Water"
      description="LeetCode #42 - Compute the total amount of water trapped between heights of building structures."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={getActiveCode()}
      activeLine={line}
      message={state.explanation || ""}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter height bars to begin visualization."
    >
      <div className="flex border-b border-gray-700 mb-6 items-center justify-between">
        <div className="flex">
          <button
            onClick={() => handleModeChange("brute-force")}
            className={`cursor-pointer p-3 px-6 border-b-4 transition-all font-bold ${
              mode === "brute-force"
                ? "border-blue-400 text-blue-400"
                : "border-transparent text-gray-400"
            }`}
          >
            Brute Force O(n²)
          </button>
          <button
            onClick={() => handleModeChange("optimal")}
            className={`cursor-pointer p-3 px-6 border-b-4 transition-all font-bold ${
              mode === "optimal"
                ? "border-blue-400 text-blue-400"
                : "border-transparent text-gray-400"
            }`}
          >
            Optimal O(n)
          </button>
        </div>

        {mode === "optimal" && (
          <div className="flex gap-2 mr-2">
            <button
              onClick={() => setCodeLang("cpp")}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                codeLang === "cpp"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              C++
            </button>
            <button
              onClick={() => setCodeLang("java")}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                codeLang === "java"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Java
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[340px]">
          <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Elevation Map
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
                    className={`w-10 h-10 flex items-center justify-center rounded-md font-mono transition-colors duration-300 text-white ${
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
                    className={`w-10 h-10 flex items-center justify-center rounded-md font-mono transition-colors duration-300 text-white ${
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

        <div className="bg-green-850/20 p-4 rounded-xl border border-green-700/50">
          <h3 className="text-green-300 text-sm flex items-center gap-2">
            <Droplets size={16} /> Total Trapped Water
          </h3>
          <p className="font-mono text-4xl text-green-400 mt-2">
            {state.totalWater ?? 0}
          </p>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default TrappingRainWater;
