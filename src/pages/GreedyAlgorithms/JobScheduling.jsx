import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  TrendingUp,
  DollarSign,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  SkipBack,
  SkipForward,
  Clock,
} from "lucide-react";

const JobScheduling = ({ navigate }) => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [jobsInput, setJobsInput] = useState("1,3,50,2,5,20,4,6,70,6,7,60,5,8,30,7,9,40");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // C++ code lines for highlighting
  const codeLines = [
    { line: 1, code: "int maxProfit(vector<Job>& jobs) {", type: "declaration" },
    { line: 2, code: "  sort(jobs by end time);", type: "sort" },
    { line: 3, code: "  vector<int> dp(n);", type: "dp" },
    { line: 4, code: "  dp[0] = jobs[0].profit;", type: "init" },
    { line: 5, code: "  for (int i = 1; i < n; i++) {", type: "loop" },
    { line: 6, code: "    int inclProfit = jobs[i].profit;", type: "incl" },
    { line: 7, code: "    int l = findLastNonConflict(jobs, i);", type: "find" },
    { line: 8, code: "    if (l != -1) inclProfit += dp[l];", type: "add" },
    { line: 9, code: "    dp[i] = max(inclProfit, dp[i-1]);", type: "max" },
    { line: 10, code: "  }", type: "close" },
    { line: 11, code: "  return dp[n-1];", type: "return" },
    { line: 12, code: "}", type: "close" }
  ];

  // History generation for step-by-step visualization
  const generateHistory = useCallback((jobs) => {
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
      line: 4,
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
        line: 6,
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
          line: 8,
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
        line: 9,
        finished: false,
        currentJob: i,
      });
    }

    // Find selected jobs
    let res = [];
    let i = n - 1;
    while (i >= 0) {
      let inclProfit = sortedJobs[i].profit;
      let l = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (sortedJobs[j].end <= sortedJobs[i].start) {
          l = j;
          break;
        }
      }
      if (l !== -1) inclProfit += dp[l];
      if (inclProfit > (i > 0 ? dp[i - 1] : 0)) {
        res.unshift(sortedJobs[i]);
        i = l;
      } else {
        i--;
      }
    }
    steps.push({
      jobs: [...sortedJobs],
      dp: [...dp],
      selectedJobs: [...res],
      explanation: `Selected jobs for max profit: ${res.map(j => `[${j.start},${j.end},${j.profit}]`).join(", ")}`,
      line: 11,
      finished: true,
      currentJob: null,
    });

    setHistory(steps);
    setCurrentStep(0);
  }, []);

  const loadJobs = () => {
    try {
      const arr = jobsInput.split(",").map(Number);
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
      setIsLoaded(true);
      generateHistory(jobs);
    } catch (error) {
      alert("Invalid input format");
    }
  };

  const reset = () => {
  setIsLoaded(false);
  setHistory([]);
  setCurrentStep(0);
  setIsPlaying(false);
};

// Insert here!
const generateNewJobs = () => {
  // Generate 4-7 random jobs
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

// ...existing code...

  const stepForward = () => {
    setCurrentStep(prev => Math.min(prev + 1, history.length - 1));
  };

  const stepBackward = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const playAnimation = () => {
    if (currentStep >= history.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < history.length - 1) {
      timer = setTimeout(stepForward, speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, history.length, speed]);

  // Get current state safely
  const state = history[currentStep] || {};
  const {
    jobs = [],
    dp = [],
    selectedJobs = [],
    explanation = "Ready to start...",
    line = 1,
    finished = false,
    currentJob,
  } = state;

  // Chart rendering
  const renderJobChart = () => {
    if (jobs.length === 0) {
      return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data to display
          </div>
        </div>
      );
    }
    const maxProfit = Math.max(...jobs.map(j => j.profit));
    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Job Chart
        </h3>
        <div className="relative" style={{ height: 180 }}>
          <div className="flex items-end justify-center gap-2 h-full">
            {jobs.map((job, idx) => {
              const height = ((job.profit) / (maxProfit || 1)) * 120;
              const isSelected = selectedJobs.some(
                sj => sj.start === job.start && sj.end === job.end && sj.profit === job.profit
              );
              const isCurrent = currentJob === idx;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-8 ${isSelected ? "bg-green-500" : isCurrent ? "bg-yellow-500" : "bg-gray-600"} border-2 ${isSelected ? "border-green-400" : isCurrent ? "border-yellow-400" : "border-gray-500"} rounded-t transition-all duration-300`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-gray-400 mt-2">Job {idx + 1}</div>
                  <div className="text-sm font-semibold text-gray-300">${job.profit}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Current</span>
          </div>
        </div>
      </div>
    );
  };

  // Code panel rendering
  const renderCodePanel = () => (
    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
      <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600 pb-3 flex items-center gap-2">
        <Code className="w-5 h-5" />
        C++ Solution
      </h3>
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          {codeLines.map((item) => (
            <div
              key={item.line}
              className={`flex transition-all duration-300 py-1 px-2 rounded ${
                line === item.line
                  ? "bg-green-500/20 border-l-4 border-green-400 shadow-lg"
                  : "hover:bg-gray-800/50"
              }`}
            >
              <span className={`w-8 text-right pr-3 select-none ${
                line === item.line ? "text-green-300 font-bold" : "text-gray-500"
              }`}>
                {item.line}
              </span>
              <span className={`flex-1 ${
                line === item.line 
                  ? "text-green-300 font-semibold" 
                  : "text-gray-300"
              }`}>
                {item.code}
              </span>
            </div>
          ))}
        </pre>
      </div>
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">Current Execution:</h4>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/20 border-l-4 border-green-400 rounded"></div>
          <span className="text-xs text-gray-300">Executing this line</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-green-300">
                Job Scheduling
              </h1>
              <p className="text-lg text-gray-400 mt-2">
                LeetCode 1235 - Maximum Profit in Job Scheduling
              </p>
            </div>
          </div>
        </header>

      
        {/* Controls */}
<div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
  <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-grow">
      <label className="font-medium text-gray-300 min-w-16">Jobs:</label>
      <input
        type="text"
        value={jobsInput}
        onChange={(e) => setJobsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
        placeholder="Enter jobs as start,end,profit (e.g., 1,3,50,2,5,20)"
        aria-label="Enter jobs as start,end,profit (e.g., 1,3,50,2,5,20)"
      />
      <button
	  onClick={generateNewJobs}
	  disabled={isLoaded}
	  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
    New Jobs
        </button>
    </div>
    {!isLoaded ? (
      <button
        onClick={loadJobs}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
      >
        Load & Visualize
      </button>
    ) : (
      <div className="flex items-center gap-3">
        {/* Step controls here */}
        <button
          onClick={stepBackward}
          disabled={currentStep <= 0}
          className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors disabled:opacity-50"
        >
          <SkipBack className="h-5 w-5" />
        </button>
        {!isPlaying ? (
          <button
            onClick={playAnimation}
            disabled={currentStep >= history.length - 1}
            className="bg-green-500 hover:bg-green-600 p-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={pauseAnimation}
            className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg transition-colors"
          >
            <Pause className="h-5 w-5" />
          </button>
        )}
        <span className="text-lg text-gray-300 min-w-24 text-center">
          {currentStep + 1}/{history.length}
        </span>
        <button
          onClick={stepForward}
          disabled={currentStep >= history.length - 1}
          className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors disabled:opacity-50"
        >
          <SkipForward className="h-5 w-5" />
        </button>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
        >
          <option value={1500}>Slow</option>
          <option value={1000}>Medium</option>
          <option value={500}>Fast</option>
        </select>
        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    )}
  </div>
  <div className="mt-2 text-gray-400 text-sm">
    <span>
      Format: <b>start,end,profit</b> for each job, separated by commas.<br />
      Example: <code>1,3,50,2,5,20,4,6,70</code>
    </span>
	</div>
	</div>

        {isLoaded && history.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="xl:col-span-1 space-y-6">
              {renderCodePanel()}
              {/* Statistics */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Max Profit:</span>
                    <span className="text-2xl font-bold text-green-400">${dp[dp.length - 1] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs Selected:</span>
                    <span className="text-lg text-blue-400">{selectedJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Step:</span>
                    <span className="text-lg text-yellow-400">{currentStep + 1}/{history.length}</span>
                  </div>
                </div>
              </div>
              {/* Selected Jobs */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Selected Jobs
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedJobs.map((j, i) => (
                    <div key={i} className="bg-gray-700/50 p-3 rounded border border-gray-600">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-blue-400 font-semibold">Job {i + 1}</span>
                        <span className="text-green-400 font-bold">${j.profit}</span>
                      </div>
                      <div className="text-xs text-gray-300">
                        <div>Start: {j.start}</div>
                        <div>End: {j.end}</div>
                        <div>Profit: {j.profit}</div>
                      </div>
                    </div>
                  ))}
                  {selectedJobs.length === 0 && (
                    <div className="text-gray-500 text-center py-4">No jobs selected yet</div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="xl:col-span-2 space-y-6">
              {renderJobChart()}
              {/* Explanation */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-orange-300 mb-4">Step Explanation</h3>
                <div className={`p-4 rounded-lg border-l-4 ${
                  finished ? 'border-green-400 bg-green-400/10' : 'border-orange-400 bg-orange-400/10'
                }`}>
                  {explanation}
                </div>
              </div>
              {/* Complexity */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-blue-400 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Complexity Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2">Time: O(n log n)</h4>
                    <p className="text-gray-300 text-sm">Sort jobs + DP with binary search</p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2">Space: O(n)</h4>
                    <p className="text-gray-300 text-sm">DP array for profits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              {isLoaded ? "Loading..." : null}
            </div>
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate && navigate("home")}
            className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-700 mx-auto"
          >
            <ArrowLeft size={20} />
            Back to Problems
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobScheduling;