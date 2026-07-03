import React, { useState, useCallback } from "react";
import { Clock, Layers } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const MergeIntervals = () => {
  const [intervalsInput, setIntervalsInput] = useState("[[1,3],[2,6],[8,10],[15,18]]");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateMergeHistory = useCallback((intervals) => {
    const newHistory = [];
    const merged = [];

    const addState = (props) =>
      newHistory.push({
        intervals: intervals.map(iv => [...iv]),
        merged: merged.map(iv => [...iv]),
        explanation: "",
        ...props,
      });

    addState({ line: 2, explanation: `Sort intervals by start time: ${JSON.stringify(intervals)}.` });

    intervals.sort((a, b) => a[0] - b[0]);

    addState({ 
      line: 2, 
      sorted: true,
      explanation: `After sorting: ${JSON.stringify(intervals)}.` 
    });

    if (intervals.length === 0) {
      addState({ line: 11, finished: true, explanation: `No intervals to merge.` });
      load(newHistory);
      return;
    }

    merged.push(intervals[0]);
    addState({ 
      line: 3, 
      currentIndex: 0,
      explanation: `Initialize: Add first interval [${intervals[0]}] to result.` 
    });

    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      const lastMerged = merged[merged.length - 1];

      addState({
        line: 4,
        currentIndex: i,
        comparing: true,
        explanation: `Compare current [${current}] with last merged [${lastMerged}].`,
      });

      if (current[0] <= lastMerged[1]) {
        const newEnd = Math.max(lastMerged[1], current[1]);
        lastMerged[1] = newEnd;
        
        addState({
          line: 8,
          currentIndex: i,
          merging: true,
          explanation: `Overlap detected! Merge [${current}] with [${merged[merged.length - 1][0]}, ${merged[merged.length - 1][1] - (newEnd - merged[merged.length - 1][1])}] → [${lastMerged}].`,
        });
      } else {
        merged.push([...current]);
        addState({
          line: 6,
          currentIndex: i,
          addingNew: true,
          explanation: `No overlap. Add [${current}] as new interval to result.`,
        });
      }
    }

    addState({
      line: 11,
      finished: true,
      explanation: `Complete! Merged intervals: ${JSON.stringify(merged)}.`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    try {
      const parsed = JSON.parse(intervalsInput);
      if (!Array.isArray(parsed) || parsed.some(iv => !Array.isArray(iv) || iv.length !== 2)) {
        alert("Please enter valid intervals in format: [[1,3],[2,6],[8,10]]");
        return;
      }
      generateMergeHistory(parsed);
    } catch {
      alert("Invalid JSON format. Use: [[1,3],[2,6],[8,10]]");
    }
  };

  const {
    intervals = [],
    merged = [],
    currentIndex = -1,
    explanation = "",
    finished = false,
    sorted = false,
    merging = false,
    addingNew = false,
    line = 2
  } = currentState;

  const codeContent = {
    1: `vector<vector<int>> merge(vector<vector<int>>& intervals) {`,
    2: `    sort(intervals.begin(), intervals.end());`,
    3: `    vector<vector<int>> merged;`,
    4: `    for (auto interval : intervals) {`,
    5: `        if (merged.empty() || merged.back()[1] < interval[0]) {`,
    6: `            merged.push_back(interval);`,
    7: `        } else {`,
    8: `            merged.back()[1] = max(merged.back()[1], interval[1]);`,
    9: `        }`,
    10: `    }`,
    11: `    return merged;`,
    12: `}`
  };

  const inputSection = (
    <>
      <input 
        id="intervals-input" 
        type="text" 
        value={intervalsInput} 
        onChange={(e) => setIntervalsInput(e.target.value)} 
        disabled={isLoaded} 
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="[[1,3],[2,6],[8,10]]"
      />
      {!isLoaded && (
        <button 
          onClick={loadProblem} 
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Input Count
        </h4>
        <div className="text-3xl font-mono text-cyan-400">
          {intervals.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Merged Count
        </h4>
        <div className="text-3xl font-mono text-purple-400">
          {merged.length}
        </div>
      </div>
      <div className="sm:col-span-2 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n log n)</span> - Dominantly sorting.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(n)</span> - Output array storage.
          </div>
        </div>
      </div>
    </>
  );

  const renderInterval = (interval, index, isCurrent, isMerged = false) => {
    let bgColor = "bg-gray-700";
    let borderColor = "border-gray-600";

    if (isCurrent) {
      bgColor = "bg-purple-600/50";
      borderColor = "border-purple-500";
    }

    if (merging && isCurrent) {
      bgColor = "bg-amber-600/50";
      borderColor = "border-amber-500";
    }

    if (addingNew && isCurrent) {
      bgColor = "bg-green-600/50";
      borderColor = "border-green-500";
    }

    if (isMerged && finished) {
      bgColor = "bg-green-600/30";
      borderColor = "border-green-500/50";
    }

    return (
      <div 
        key={index} 
        className={`${bgColor} ${borderColor} border-2 rounded-lg px-4 py-3 font-mono font-bold transition-all duration-300`}
      >
        <span className="text-gray-200">[{interval[0]}, {interval[1]}]</span>
      </div>
    );
  };

  return (
    <VisualizerLayout
      title="Merge Intervals"
      description="LeetCode #56 - Merge overlapping intervals."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter intervals to begin visualization."
    >
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-6">
        {intervals.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-400 font-mono mb-3">
              {sorted ? "Sorted Intervals" : "Original Intervals"}
            </h4>
            <div className="flex gap-3 flex-wrap">
              {intervals.map((interval, index) => (
                <div key={index} className="flex flex-col items-center relative min-w-[80px]">
                  {index === currentIndex && (
                    <div className="absolute bottom-full mb-1 flex flex-col items-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400 animate-bounce" />
                      <span className="text-rose-400 text-xs font-bold font-mono">curr</span>
                    </div>
                  )}
                  {renderInterval(interval, index, index === currentIndex, false)}
                </div>
              ))}
            </div>
          </div>
        )}

        {merged.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-400 font-mono mb-3">Merged Result</h4>
            <div className="flex gap-3 flex-wrap">
              {merged.map((interval, index) => 
                renderInterval(interval, `merged-${index}`, false, true)
              )}
            </div>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default MergeIntervals;
