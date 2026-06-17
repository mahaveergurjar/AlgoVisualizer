import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, Droplets, BarChart3, Calculator } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const ContainerWithMostWater = () => {
  const [mode, setMode] = useState("optimal"); // default to optimal
  const [heightsInput, setHeightsInput] = useState("1,8,6,2,5,4,8,3,7");
  const [heights, setHeights] = useState([1, 8, 6, 2, 5, 4, 8, 3, 7]);
  const [maxHeight, setMaxHeight] = useState(8);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;
  const state = currentState || {};

  const generateBruteForceHistory = useCallback((h) => {
    const n = h.length;
    const newHistory = [];
    let maxArea = 0;
    let maxHighlight = { i: -1, j: -1 };

    const addState = (props) =>
      newHistory.push({
        heights: [...h],
        maxArea,
        maxHighlight: { ...maxHighlight },
        i: null,
        j: null,
        currentArea: 0,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize maxArea to 0." });
    for (let i = 0; i < n; i++) {
      addState({ line: 3, i, explanation: `Outer loop starts. i = ${i}.` });
      for (let j = i + 1; j < n; j++) {
        addState({ line: 4, i, j, explanation: `Inner loop. j = ${j}.` });
        const currentArea = Math.min(h[i], h[j]) * (j - i);
        if (currentArea > maxArea) {
          maxArea = currentArea;
          maxHighlight = { i, j };
        }
        addState({
          line: 5,
          i,
          j,
          currentArea,
          explanation: `Area between lines ${i} and ${j} is ${currentArea}.`,
        });
        addState({
          line: 6,
          i,
          j,
          currentArea,
          maxArea,
          explanation: `Update maxArea to ${maxArea}.`,
        });
      }
    }
    addState({
      line: 9,
      finished: true,
      explanation: `Finished all pairs. Max area found: ${maxArea}`,
    });

    load(newHistory);
  }, [load]);

  const generateOptimalHistory = useCallback((h) => {
    const n = h.length;
    const newHistory = [];
    let maxArea = 0;
    let maxHighlight = { left: -1, right: -1 };
    let left = 0;
    let right = n - 1;

    const addState = (props) =>
      newHistory.push({
        heights: [...h],
        maxArea,
        maxHighlight: { ...maxHighlight },
        left,
        right,
        currentArea: 0,
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: "Initialize maxArea to 0." });
    addState({
      line: 3,
      explanation: `Initialize left pointer to 0 and right pointer to ${n - 1}.`,
    });

    while (left < right) {
      addState({
        line: 4,
        explanation: "Check while loop condition (left < right).",
      });
      const currentArea = Math.min(h[left], h[right]) * (right - left);
      if (currentArea > maxArea) {
        maxArea = currentArea;
        maxHighlight = { left, right };
      }
      addState({
        line: 5,
        currentArea,
        explanation: `Area between lines ${left} and ${right} is ${currentArea}.`,
      });
      addState({
        line: 6,
        currentArea,
        maxArea,
        explanation: `Update maxArea to ${maxArea}.`,
      });

      if (h[left] < h[right]) {
        addState({
          line: 7,
          explanation: `height[left] < height[right] (${h[left]} < ${h[right]}). Increment left pointer.`,
        });
        left++;
        addState({ line: 8, explanation: `New left pointer is ${left}.` });
      } else {
        addState({
          line: 10,
          explanation: `height[left] >= height[right] (${h[left]} >= ${h[right]}). Decrement right pointer.`,
        });
        right--;
        addState({ line: 12, explanation: `New right pointer is ${right}.` });
      }
    }
    addState({
      line: 4,
      explanation: `Loop condition false (${left} is not < ${right}).`,
    });
    addState({
      line: 15,
      finished: true,
      explanation: `Finished. Returning maxArea = ${maxArea}`,
    });

    load(newHistory);
  }, [load]);

  const handleLoad = (customHeights, currentMode = mode) => {
    let targetHeights = customHeights;
    if (!targetHeights) {
      targetHeights = heightsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);
    }
    if (targetHeights.some(isNaN) || targetHeights.length < 2) {
      alert("Invalid input. Please use at least two comma-separated numbers.");
      return;
    }
    setHeights(targetHeights);
    setHeightsInput(targetHeights.join(", "));
    setMaxHeight(Math.max(...targetHeights, 1));

    if (currentMode === "brute-force") {
      generateBruteForceHistory(targetHeights);
    } else {
      generateOptimalHistory(targetHeights);
    }
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (isLoaded) {
      handleLoad(heights, nextMode);
    }
  };

  const bruteForceCode = {
    2: `int maxArea = 0;`,
    3: `for (int i = 0; i < n; i++) {`,
    4: `    for (int j = i + 1; j < n; j++) {`,
    5: `        int currentArea = min(height[i], height[j]) * (j - i);`,
    6: `        maxArea = max(maxArea, currentArea);`,
    7: `    }`,
    8: `}`,
    9: `return maxArea;`
  };

  const optimalCode = {
    2: `int maxArea = 0;`,
    3: `int left = 0, right = n - 1;`,
    4: `while (left < right) {`,
    5: `    int currentArea = min(height[left], height[right]) * (right - left);`,
    6: `    maxArea = max(maxArea, currentArea);`,
    7: `    if (height[left] < height[right]) {`,
    8: `        left++;`,
    9: `    } else {`,
    10: `        right--;`,
    11: `    }`,
    12: `}`,
    15: `return maxArea;`
  };

  const currentHeights = isLoaded ? (state.heights || heights) : heights;
  const leftIndex = mode === "brute-force" ? state.i : state.left;
  const rightIndex = mode === "brute-force" ? state.j : state.right;

  let waterStyle = {};
  if (
    isLoaded &&
    leftIndex !== null &&
    rightIndex !== null &&
    leftIndex >= 0 &&
    rightIndex < currentHeights.length
  ) {
    const waterHeight = Math.min(currentHeights[leftIndex], currentHeights[rightIndex]);
    waterStyle = {
      position: "absolute",
      bottom: "2rem",
      height: `${(waterHeight / maxHeight) * 100}%`,
      left: `calc(${leftIndex} * (1rem + 0.5rem) + 0.25rem)`,
      width: `calc(${rightIndex - leftIndex} * 1.5rem)`,
      backgroundColor: "rgba(56, 189, 248, 0.2)",
      border: "1px solid rgba(56, 189, 248, 0.5)",
      transition: "all 300ms ease-out",
      pointerEvents: "none",
    };
  }

  const inputSection = (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={heightsInput}
          onChange={(e) => setHeightsInput(e.target.value)}
          disabled={isLoaded}
          className="flex-1 min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-sky-400 shadow-sm text-sm"
          placeholder="Heights (e.g. 1,8,6,2,5,4,8,3,7)"
        />
        {!isLoaded && (
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
          >
            Load & Visualize
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleModeChange("optimal")}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-xs ${
            mode === "optimal"
              ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400"
              : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
          }`}
        >
          Optimal Two-Pointer O(N)
        </button>
        <button
          onClick={() => handleModeChange("brute-force")}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-xs ${
            mode === "brute-force"
              ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400"
              : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
          }`}
        >
          Brute Force O(N²)
        </button>
      </div>
    </div>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none text-sm">
          <Terminal size={14} /> Pointers
        </h4>
        <div className="text-3xl font-mono text-red-300">
          {mode === "brute-force" ? (
            `i=${state.i ?? "-"} | j=${state.j ?? "-"}`
          ) : (
            `L=${state.left ?? "-"} | R=${state.right ?? "-"}`
          )}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-sky-300 select-none text-sm">
          <Calculator size={14} /> Current Area
        </h4>
        <div className="text-3xl font-mono text-sky-300 font-bold">
          {state.currentArea ?? 0}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Max Area
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {state.maxArea ?? 0}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-sky-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-cyan-300">
              {mode === "optimal" ? "O(N)" : "O(N²)"}
            </span>{" "}
            — {mode === "optimal" ? "Shrink range from both sides." : "Evaluate all possible pairs."}
          </div>
          <div>
            <strong>Space:</strong> <span className="font-mono text-cyan-300">O(1)</span> — Only uses pointers.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Container With Most Water"
      description="Find two lines that together with the x-axis form a container, such that the container contains the most water."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={mode === "brute-force" ? bruteForceCode : optimalCode}
      activeLine={state.line}
      message={state.explanation || "Enter heights to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter height list to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="p-6 bg-gray-900/40 rounded-xl border border-gray-800">
          <h4 className="text-gray-300 text-sm mb-4 flex items-center gap-2 select-none">
            <BarChart3 size={16} /> Container Bars
          </h4>
          <div
            id="container-lines"
            className="relative flex justify-center items-end h-64 border-b-2 border-gray-600 pb-8 gap-0"
          >
            {currentHeights.map((h, index) => {
              const isLeft =
                (mode === "brute-force" && state.i === index) ||
                (mode === "optimal" && state.left === index);
              const isRight =
                (mode === "brute-force" && state.j === index) ||
                (mode === "optimal" && state.right === index);

              return (
                <div
                  key={index}
                  id={`container-lines-element-${index}`}
                  className="w-4 mx-1 flex flex-col justify-end items-center h-full z-10"
                >
                  <div
                    className={`w-full transition-all duration-300 rounded-t ${
                      isLeft
                        ? "bg-amber-400 shadow"
                        : isRight
                        ? "bg-cyan-400 shadow"
                        : "bg-gray-600"
                    }`}
                    style={{ height: `${(h / maxHeight) * 100}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-400 mt-1 font-mono">{h}</span>
                </div>
              );
            })}
            <div style={waterStyle} />
          </div>

          {isLoaded && mode === "brute-force" && (
            <>
              {state.i !== null && (
                <VisualizerPointer
                  index={state.i}
                  containerId="container-lines"
                  color="amber"
                  label="i"
                  direction="up"
                />
              )}
              {state.j !== null && (
                <VisualizerPointer
                  index={state.j}
                  containerId="container-lines"
                  color="cyan"
                  label="j"
                  direction="up"
                />
              )}
            </>
          )}

          {isLoaded && mode === "optimal" && (
            <>
              {state.left !== null && (
                <VisualizerPointer
                  index={state.left}
                  containerId="container-lines"
                  color="amber"
                  label="L"
                  direction="up"
                />
              )}
              {state.right !== null && (
                <VisualizerPointer
                  index={state.right}
                  containerId="container-lines"
                  color="cyan"
                  label="R"
                  direction="up"
                />
              )}
            </>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default ContainerWithMostWater;
