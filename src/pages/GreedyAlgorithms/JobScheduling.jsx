import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const JobScheduling = () => {
  const [jobsInput, setJobsInput] = useState("1,3,50,2,5,20,4,6,70,6,7,60,5,8,30,7,9,40");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const reset = () => {
    visualizer.reset();
  };

  const generateNewJobs = () => {
    const jobCount = Math.floor(Math.random() * 4) + 4; // 4 to 7 jobs
    const jobs = [];
    for (let i = 0; i < jobCount; i++) {
      const start = Math.floor(Math.random() * 8) + 1;
      const duration = Math.floor(Math.random() * 3) + 1;
      const end = start + duration;
      const profit = Math.floor(Math.random() * 90) + 10;
      jobs.push(`${start},${end},${profit}`);
    }
    setJobsInput(jobs.join(","));
    reset();
  };

  const handleLoad = useCallback((customJobsInput) => {
    const rawInput = customJobsInput !== undefined ? customJobsInput : jobsInput;
    const arr = rawInput.split(",").map(Number);
    const jobs = [];
    for (let i = 0; i < arr.length; i += 3) {
      if (!isNaN(arr[i]) && !isNaN(arr[i + 1]) && !isNaN(arr[i + 2])) {
        jobs.push({ start: arr[i], end: arr[i + 1], profit: arr[i + 2] });
      }
    }
    if (jobs.length < 1) {
      alert("Please enter at least one valid job (start,end,profit)");
      return;
    }
    setJobsInput(rawInput);

    const n = jobs.length;
    const sortedJobs = [...jobs].sort((a, b) => a.end - b.end);
    const dp = Array(n).fill(0);
    const steps = [];

    dp[0] = sortedJobs[0].profit;
    steps.push({
      jobs: [...sortedJobs],
      dp: [...dp],
      selectedJobs: [],
      explanation: `Initialize dp[0] with first job's profit: ${sortedJobs[0].profit}`,
      line: 9,
      finished: false,
      currentJob: 0,
    });

    for (let i = 1; i < n; i++) {
      let inclProfit = sortedJobs[i].profit;
      let l = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (sortedJobs[j].end <= sortedJobs[i].start) {
          l = j;
          break;
        }
      }
      steps.push({
        jobs: [...sortedJobs],
        dp: [...dp],
        selectedJobs: [],
        explanation: `Checking job ${i + 1}: start=${sortedJobs[i].start}, end=${sortedJobs[i].end}, profit=${sortedJobs[i].profit}`,
        line: 11,
        finished: false,
        currentJob: i,
      });
      if (l !== -1) {
        inclProfit += dp[l];
        steps.push({
          jobs: [...sortedJobs],
          dp: [...dp],
          selectedJobs: [],
          explanation: `Found last non-conflicting job at index ${l + 1}, add its dp (${dp[l]}) to current profit.`,
          line: 13,
          finished: false,
          currentJob: i,
        });
      }
      dp[i] = Math.max(inclProfit, dp[i - 1]);
      steps.push({
        jobs: [...sortedJobs],
        dp: [...dp],
        selectedJobs: [],
        explanation: `Set dp[${i}] = max(${inclProfit}, ${dp[i - 1]}) = ${dp[i]}`,
        line: 14,
        finished: false,
        currentJob: i,
      });
    }

    let res = [];
    let iIdx = n - 1;
    while (iIdx >= 0) {
      let inclProfit = sortedJobs[iIdx].profit;
      let l = -1;
      for (let j = iIdx - 1; j >= 0; j--) {
        if (sortedJobs[j].end <= sortedJobs[iIdx].start) {
          l = j;
          break;
        }
      }
      if (l !== -1) inclProfit += dp[l];
      if (inclProfit > (iIdx > 0 ? dp[iIdx - 1] : 0)) {
        res.unshift(sortedJobs[iIdx]);
        iIdx = l;
      } else {
        iIdx--;
      }
    }
    steps.push({
      jobs: [...sortedJobs],
      dp: [...dp],
      selectedJobs: [...res],
      explanation: `Selected jobs for max profit: ${res.map(j => `[${j.start},${j.end},${j.profit}]`).join(", ")}`,
      line: 16,
      finished: true,
      currentJob: null,
    });

    load(steps);
  }, [jobsInput, load]);

  const {
    jobs = [],
    dp = [],
    selectedJobs = [],
    line = 1,
    currentJob
  } = currentState;

  const codeContent = {
    1: `struct Job { int start, end, profit; };`,
    2: `bool compare(Job a, Job b) { return a.end < b.end; }`,
    3: `int jobScheduling(vector<int>& startTime, vector<int>& endTime, vector<int>& profit) {`,
    4: `    int n = startTime.size();`,
    5: `    vector<Job> jobs(n);`,
    6: `    for (int i = 0; i < n; i++) jobs[i] = {startTime[i], endTime[i], profit[i]};`,
    7: `    sort(jobs.begin(), jobs.end(), compare);`,
    8: `    vector<int> dp(n);`,
    9: `    dp[0] = jobs[0].profit;`,
    10: `    for (int i = 1; i < n; i++) {`,
    11: `        int inclProfit = jobs[i].profit;`,
    12: `        int l = findLastNonConflict(jobs, i);`,
    13: `        if (l != -1) inclProfit += dp[l];`,
    14: `        dp[i] = max(inclProfit, dp[i - 1]);`,
    15: `    }`,
    16: `    return dp[n - 1];`,
    17: `}`
  };

  const inputSection = (
    <>
      <input
        type="text"
        value={jobsInput}
        onChange={(e) => setJobsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
        placeholder="Jobs (e.g. 1,3,50,2,5,20)"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={generateNewJobs}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Random
          </button>
        </>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Max Profit
        </h4>
        <div className="text-3xl font-mono text-green-300">
          ${dp[dp.length - 1] || 0}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Jobs Selected
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {selectedJobs.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none">
          Current Job Index
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          {currentJob !== undefined && currentJob !== null ? currentJob + 1 : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N log N)</span> - sorting end times + DP transitions.
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(N)</span> - DP table size.
          </div>
        </div>
      </div>
    </>
  );

  const maxProfitVal = jobs.length > 0 ? Math.max(...jobs.map(j => j.profit)) : 1;

  return (
    <VisualizerLayout
      title="Job Scheduling"
      description="Select a non-conflicting subset of jobs to maximize total profit using dynamic programming and greedy sorting."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter jobs with start, end, and profit values."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
          <div className="flex items-end justify-center gap-3 h-[200px] pt-4">
            {jobs.map((job, idx) => {
              const height = (job.profit / maxProfitVal) * 120 + 20;
              const isSelected = selectedJobs.some(
                sj => sj.start === job.start && sj.end === job.end && sj.profit === job.profit
              );
              const isCurrent = currentJob === idx;
              
              let barColor = "bg-gray-750 border-gray-650";
              if (isSelected) {
                barColor = "bg-green-500/40 border-green-400 scale-105 shadow-lg shadow-green-500/20 text-white";
              } else if (isCurrent) {
                barColor = "bg-yellow-500/40 border-yellow-400 scale-105";
              }

              return (
                <div key={idx} className="flex flex-col items-center gap-1 font-mono">
                  <div className="text-xs text-gray-500">${job.profit}</div>
                  <div
                    className={`w-10 rounded-lg border-2 transition-all duration-300 ${barColor}`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-gray-400 mt-1">J{idx + 1}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 max-w-lg mx-auto">
          <h4 className="text-sm font-bold text-gray-300 mb-3 select-none">
            Selected Jobs:
          </h4>
          {selectedJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No jobs selected yet...</p>
          ) : (
            <div className="space-y-2">
              {selectedJobs.map((j, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-green-500/10 border border-green-500/30 rounded-lg p-2 font-mono text-sm text-green-400"
                >
                  <span>
                    Job: [{j.start} → {j.end}]
                  </span>
                  <span className="font-bold">${j.profit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default JobScheduling;