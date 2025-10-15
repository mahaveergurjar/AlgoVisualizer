import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, Layers } from "lucide-react";

const MergeIntervals = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [intervalsInput, setIntervalsInput] = useState("[[1,3],[2,6],[8,10],[15,18]]");
  const [isLoaded, setIsLoaded] = useState(false);

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

    addState({ line: 1, explanation: `Sort intervals by start time: ${JSON.stringify(intervals)}.` });

    intervals.sort((a, b) => a[0] - b[0]);

    addState({ 
      line: 2, 
      sorted: true,
      explanation: `After sorting: ${JSON.stringify(intervals)}.` 
    });

    if (intervals.length === 0) {
      addState({ line: 3, finished: true, explanation: `No intervals to merge.` });
      setHistory(newHistory);
      setCurrentStep(0);
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
          line: 5,
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
      line: 7,
      finished: true,
      explanation: `Complete! Merged intervals: ${JSON.stringify(merged)}.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    try {
      const parsed = JSON.parse(intervalsInput);
      if (!Array.isArray(parsed) || parsed.some(iv => !Array.isArray(iv) || iv.length !== 2)) {
        alert("Please enter valid intervals in format: [[1,3],[2,6],[8,10]]");
        return;
      }
      setIsLoaded(true);
      generateMergeHistory(parsed);
    } catch {
      alert("Invalid JSON format. Use: [[1,3],[2,6],[8,10]]");
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      else if (e.key === "ArrowLeft") stepBackward();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { intervals = [], merged = [], currentIndex = -1, explanation = "", finished = false, sorted = false, merging = false, addingNew = false } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    green: "text-green-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-blue-500/20" : ""}`}>
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">{line}</span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>{token.t}</span>
      ))}
    </div>
  );

  const mergeCode = [
    { l: 1, c: [{ t: "function merge(intervals) {", c: "" }] },
    { l: 2, c: [{ t: "  intervals.sort((a,b) => a[0] - b[0]);", c: "" }] },
    { l: 3, c: [{ t: "  merged = [intervals[0]];", c: "" }] },
    { l: 4, c: [{ t: "  for", c: "purple" }, { t: " (i = 1; i < n; i++) {", c: "" }] },
    { l: 5, c: [{ t: "    if", c: "purple" }, { t: " (intervals[i][0] <= merged.last[1]) {", c: "" }] },
    { l: 6, c: [{ t: "      merged.last[1] = max(merged.last[1], intervals[i][1]);", c: "" }] },
    { l: 7, c: [{ t: "    } else", c: "purple" }, { t: " {", c: "" }] },
    { l: 8, c: [{ t: "      merged.push(intervals[i]);", c: "" }] },
    { l: 9, c: [{ t: "    }", c: "light-gray" }] },
    { l: 10, c: [{ t: "  }", c: "light-gray" }] },
    { l: 11, c: [{ t: "  return", c: "purple" }, { t: " merged;", c: "" }] },
    { l: 12, c: [{ t: "}", c: "light-gray" }] },
  ];

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
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Layers /> Merge Intervals
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          LeetCode #56 - Merge overlapping intervals
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-grow w-full">
            <label htmlFor="intervals-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">Intervals:</label>
            <input 
              id="intervals-input" 
              type="text" 
              value={intervalsInput} 
              onChange={(e) => setIntervalsInput(e.target.value)} 
              disabled={isLoaded} 
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="[[1,3],[2,6],[8,10]]"
            />
          </div>
          <div className="flex items-center gap-2">
            {!isLoaded ? (
              <button onClick={loadProblem} className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded-lg">Load & Visualize</button>
            ) : (
              <>
                <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
                <span className="font-mono w-24 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
                <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
            <button onClick={reset} className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg">Reset</button>
          </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {mergeCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl space-y-6">
              {intervals.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-400 font-mono mb-3">
                    {sorted ? "Sorted Intervals" : "Original Intervals"}
                  </h4>
                  <div className="flex gap-3 flex-wrap">
                    {intervals.map((interval, index) => 
                      renderInterval(interval, index, index === currentIndex, false)
                    )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm">Input Intervals</h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">{intervals.length}</p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm">Merged Intervals</h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">{merged.length}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{explanation}</p>
              {finished && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  <span className="text-green-400 font-bold">Algorithm Complete!</span>
                </div>
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
                  <strong className="text-teal-300 font-mono">O(n log n)</strong>
                  <br />
                  Sorting the intervals takes O(n log n), and the single pass to merge them takes O(n). Overall complexity is dominated by the sorting step.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(n)</strong>
                  <br />
                  In the worst case (no overlaps), the merged array will contain all n intervals. Some sorting algorithms may also use O(log n) stack space.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Enter intervals to begin visualization.</p>
      )}
    </div>
  );
};

export default MergeIntervals;
