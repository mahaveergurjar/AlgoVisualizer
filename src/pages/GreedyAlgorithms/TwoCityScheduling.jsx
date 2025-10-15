import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Users,
  DollarSign,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  SkipBack,
  SkipForward,
  Clock,
  Plane,
  Building,
} from "lucide-react";

const TwoCityScheduling = ({ navigate }) => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [costsInput, setCostsInput] = useState("10,20,30,200,400,50,30,20");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // Simple and reliable history generation for greedy approach
  const generateGreedyHistory = useCallback((costs) => {
    const newHistory = [];
    const n = costs.length / 2;
    let totalCost = 0;
    let cityA = [];
    let cityB = [];

    // Initial state
    newHistory.push({
      costs: [...costs],
      totalCost: 0,
      cityA: [],
      cityB: [],
      explanation: "Starting greedy algorithm - Sort by cost difference",
      line: 1,
      finished: false,
    });

    // Create array with differences and sort
    const differences = costs.map((cost, index) => ({
      index,
      costA: cost[0],
      costB: cost[1],
      difference: cost[0] - cost[1],
      absDifference: Math.abs(cost[0] - cost[1]),
    }));

    newHistory.push({
      costs: [...costs],
      totalCost,
      cityA: [...cityA],
      cityB: [...cityB],
      differences: differences.map((d) => ({ ...d })),
      explanation: "Calculating cost differences (City A - City B)",
      line: 2,
      finished: false,
    });

    // Sort by absolute difference (greedy approach)
    differences.sort((a, b) => b.absDifference - a.absDifference);

    newHistory.push({
      costs: [...costs],
      totalCost,
      cityA: [...cityA],
      cityB: [...cityB],
      differences: differences.map((d) => ({ ...d })),
      explanation: "Sorting by absolute cost difference (largest first)",
      line: 3,
      finished: false,
      isSorted: true,
    });

    // Assign to cities
    let aCount = 0;
    let bCount = 0;

    for (let i = 0; i < differences.length; i++) {
      const diff = differences[i];

      newHistory.push({
        costs: [...costs],
        totalCost,
        cityA: [...cityA],
        cityB: [...cityB],
        differences: differences.map((d) => ({ ...d })),
        currentPerson: diff.index,
        explanation: `Person ${diff.index + 1}: City A = $${
          diff.costA
        }, City B = $${diff.costB}, Difference = $${diff.difference}`,
        line: 4,
        finished: false,
        isProcessing: true,
      });

      if (diff.difference <= 0) {
        // Prefer City A (cheaper or same)
        if (aCount < n) {
          totalCost += diff.costA;
          cityA.push(diff.index);
          aCount++;

          newHistory.push({
            costs: [...costs],
            totalCost,
            cityA: [...cityA],
            cityB: [...cityB],
            differences: differences.map((d) => ({ ...d })),
            currentPerson: diff.index,
            explanation: `Sent to City A (cheaper) - Cost: $${diff.costA}, Total: $${totalCost}`,
            line: 5,
            finished: false,
            assignedToA: true,
          });
        } else {
          totalCost += diff.costB;
          cityB.push(diff.index);
          bCount++;

          newHistory.push({
            costs: [...costs],
            totalCost,
            cityA: [...cityA],
            cityB: [...cityB],
            differences: differences.map((d) => ({ ...d })),
            currentPerson: diff.index,
            explanation: `Sent to City B (City A full) - Cost: $${diff.costB}, Total: $${totalCost}`,
            line: 6,
            finished: false,
            assignedToB: true,
          });
        }
      } else {
        // Prefer City B (cheaper)
        if (bCount < n) {
          totalCost += diff.costB;
          cityB.push(diff.index);
          bCount++;

          newHistory.push({
            costs: [...costs],
            totalCost,
            cityA: [...cityA],
            cityB: [...cityB],
            differences: differences.map((d) => ({ ...d })),
            currentPerson: diff.index,
            explanation: `Sent to City B (cheaper) - Cost: $${diff.costB}, Total: $${totalCost}`,
            line: 7,
            finished: false,
            assignedToB: true,
          });
        } else {
          totalCost += diff.costA;
          cityA.push(diff.index);
          aCount++;

          newHistory.push({
            costs: [...costs],
            totalCost,
            cityA: [...cityA],
            cityB: [...cityB],
            differences: differences.map((d) => ({ ...d })),
            currentPerson: diff.index,
            explanation: `Sent to City A (City B full) - Cost: $${diff.costA}, Total: $${totalCost}`,
            line: 8,
            finished: false,
            assignedToA: true,
          });
        }
      }
    }

    // Final state
    newHistory.push({
      costs: [...costs],
      totalCost,
      cityA: [...cityA],
      cityB: [...cityB],
      differences: differences.map((d) => ({ ...d })),
      explanation: `Complete! Total cost: $${totalCost} | City A: ${cityA.length}, City B: ${cityB.length}`,
      line: 9,
      finished: true,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadCosts = () => {
    try {
      const costsArray = costsInput
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      if (costsArray.length % 2 !== 0 || costsArray.length < 4) {
        alert(
          "Please enter costs for an even number of people (at least 4 values)"
        );
        return;
      }

      // Convert to [costA, costB] pairs
      const costs = [];
      for (let i = 0; i < costsArray.length; i += 2) {
        costs.push([costsArray[i], costsArray[i + 1]]);
      }

      setIsLoaded(true);
      setCurrentStep(0);
      generateGreedyHistory(costs);
    } catch (error) {
      alert("Invalid input format. Use: costA1,costB1,costA2,costB2,...");
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const stepForward = () => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  };

  const stepBackward = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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

  const generateNewCosts = () => {
    const pairs = 4; // Generate 4 people
    const costs = [];
    for (let i = 0; i < pairs; i++) {
      const costA = Math.floor(Math.random() * 100) + 10;
      const costB = Math.floor(Math.random() * 100) + 10;
      costs.push(costA, costB);
    }
    setCostsInput(costs.join(","));
    reset();
  };

  // Get current state safely
  const state = history[currentStep] || {};
  const {
    costs = [],
    totalCost = 0,
    cityA = [],
    cityB = [],
    differences = [],
    explanation = "Ready to start...",
    line = 1,
    finished = false,
    currentPerson,
    isSorted = false,
    isProcessing = false,
    assignedToA = false,
    assignedToB = false,
  } = state;

  // Render visualization
  const renderVisualization = () => {
    if (costs.length === 0) {
      return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data to display
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          City Assignment Visualization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City A */}
          <div className="bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-blue-400">City A</h4>
              <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">
                {cityA.length} people
              </span>
            </div>
            <div className="space-y-2 min-h-32">
              {cityA.map((personIndex, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded ${
                    currentPerson === personIndex && assignedToA
                      ? "bg-blue-500/30 border-2 border-blue-400"
                      : "bg-blue-500/10"
                  }`}
                >
                  <span className="text-sm text-blue-300">
                    Person {personIndex + 1}
                  </span>
                  <span className="text-sm font-bold text-blue-200">
                    ${costs[personIndex]?.[0] || 0}
                  </span>
                </div>
              ))}
              {cityA.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No assignments yet
                </div>
              )}
            </div>
          </div>

          {/* City B */}
          <div className="bg-red-900/20 p-4 rounded-lg border-2 border-red-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Plane className="w-5 h-5 text-red-400" />
              <h4 className="font-bold text-red-400">City B</h4>
              <span className="text-xs bg-red-500/30 text-red-300 px-2 py-1 rounded">
                {cityB.length} people
              </span>
            </div>
            <div className="space-y-2 min-h-32">
              {cityB.map((personIndex, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded ${
                    currentPerson === personIndex && assignedToB
                      ? "bg-red-500/30 border-2 border-red-400"
                      : "bg-red-500/10"
                  }`}
                >
                  <span className="text-sm text-red-300">
                    Person {personIndex + 1}
                  </span>
                  <span className="text-sm font-bold text-red-200">
                    ${costs[personIndex]?.[1] || 0}
                  </span>
                </div>
              ))}
              {cityB.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No assignments yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Person Being Processed */}
        {isProcessing && currentPerson !== undefined && (
          <div className="mt-4 p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentPerson + 1}
                  </span>
                </div>
                <div>
                  <div className="text-yellow-300 font-semibold">
                    Processing Person {currentPerson + 1}
                  </div>
                  <div className="text-yellow-200 text-sm">
                    City A: ${costs[currentPerson]?.[0] || 0} | City B: $
                    {costs[currentPerson]?.[1] || 0}
                  </div>
                </div>
              </div>
              {differences[currentPerson] && (
                <div className="text-yellow-200 text-sm">
                  Difference: ${differences[currentPerson].difference}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cost Differences Table */}
        {differences.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-300 mb-3">
              Cost Differences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {differences.map((diff, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border ${
                    currentPerson === diff.index
                      ? "bg-yellow-500/20 border-yellow-400"
                      : isSorted
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-gray-700/50 border-gray-600"
                  }`}
                >
                  <div className="text-xs text-gray-400">
                    Person {diff.index + 1}
                  </div>
                  <div className="text-sm">A: ${diff.costA}</div>
                  <div className="text-sm">B: ${diff.costB}</div>
                  <div
                    className={`text-xs font-bold ${
                      diff.difference < 0
                        ? "text-blue-400"
                        : diff.difference > 0
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    Diff: ${diff.difference}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCodePanel = () => {
    const greedyCodeLines = [
      {
        line: 1,
        code: "int twoCitySchedCost(vector<vector<int>>& costs) {",
        type: "declaration",
      },
      {
        line: 2,
        code: "  sort(costs.begin(), costs.end(), [](auto& a, auto& b) {",
        type: "sort",
      },
      {
        line: 3,
        code: "    return (a[0]-a[1]) < (b[0]-b[1]);",
        type: "comparison",
      },
      { line: 4, code: "  });", type: "closing" },
      {
        line: 5,
        code: "  int total = 0, n = costs.size()/2;",
        type: "initialization",
      },
      { line: 6, code: "  for (int i = 0; i < n; i++) {", type: "loop" },
      {
        line: 7,
        code: "    total += costs[i][0] + costs[i+n][1];",
        type: "calculation",
      },
      { line: 8, code: "  }", type: "closing" },
      { line: 9, code: "  return total;", type: "return" },
      { line: 10, code: "}", type: "closing" },
    ];

    return (
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
        <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600 pb-3 flex items-center gap-2">
          <Code className="w-5 h-5" />
          C++ Solution
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm font-mono">
            {greedyCodeLines.map((item) => (
              <div
                key={item.line}
                className={`flex transition-all duration-300 py-1 px-2 rounded ${
                  state.line === item.line
                    ? "bg-green-500/20 border-l-4 border-green-400 shadow-lg"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <span
                  className={`w-8 text-right pr-3 select-none ${
                    state.line === item.line
                      ? "text-green-300 font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {item.line}
                </span>
                <span
                  className={`flex-1 ${
                    state.line === item.line
                      ? "text-green-300 font-semibold"
                      : item.type === "comment"
                      ? "text-gray-500 italic"
                      : "text-gray-300"
                  }`}
                >
                  {item.code}
                </span>
              </div>
            ))}
          </pre>
        </div>

        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">
            Current Execution:
          </h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/20 border-l-4 border-green-400 rounded"></div>
            <span className="text-xs text-gray-300">Executing this line</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-green-300">
                Two City Scheduling
              </h1>
              <p className="text-lg text-gray-400 mt-2">
                LeetCode 1029 - Minimize costs for balanced city assignment
              </p>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-grow">
              <label className="font-medium text-gray-300 min-w-20">
                Costs:
              </label>
              <input
                type="text"
                value={costsInput}
                onChange={(e) => setCostsInput(e.target.value)}
                disabled={isLoaded}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="e.g., 10,20,30,200,400,50,30,20"
              />
              <button
                onClick={generateNewCosts}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                New Costs
              </button>
            </div>

            {!isLoaded ? (
              <button
                onClick={loadCosts}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Load & Visualize
              </button>
            ) : (
              <div className="flex items-center gap-3">
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
                    <span>Total Cost:</span>
                    <span className="text-2xl font-bold text-green-400">
                      ${totalCost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>City A:</span>
                    <span className="text-lg text-blue-400">
                      {cityA.length} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>City B:</span>
                    <span className="text-lg text-red-400">
                      {cityB.length} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Step:</span>
                    <span className="text-lg text-yellow-400">
                      {currentStep + 1}/{history.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Cost Breakdown
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {costs.map((cost, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        currentPerson === index
                          ? "bg-yellow-500/20 border-yellow-400"
                          : "bg-gray-700/50 border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-400 font-semibold">
                          Person {index + 1}
                        </span>
                        <span
                          className={`text-sm ${
                            cityA.includes(index)
                              ? "text-blue-300"
                              : cityB.includes(index)
                              ? "text-red-300"
                              : "text-gray-400"
                          }`}
                        >
                          {cityA.includes(index)
                            ? "City A"
                            : cityB.includes(index)
                            ? "City B"
                            : "Not assigned"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 grid grid-cols-2 gap-1">
                        <div>City A: ${cost[0]}</div>
                        <div>City B: ${cost[1]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-2 space-y-6">
              {renderVisualization()}

              {/* Explanation */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-orange-300 mb-4">
                  Step Explanation
                </h3>
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    finished
                      ? "border-green-400 bg-green-400/10"
                      : "border-orange-400 bg-orange-400/10"
                  }`}
                >
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
                    <h4 className="font-semibold text-blue-300 mb-2">
                      Time: O(n log n)
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Sorting + linear pass through costs
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2">
                      Space: O(n)
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Storage for cost differences
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    💡 Key Insight
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Sort by cost difference (City A - City B) to prioritize
                    assignments where one city is significantly cheaper. This
                    greedy approach ensures optimal cost minimization while
                    maintaining balanced city assignments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">
              {isLoaded
                ? "Loading..."
                : "Enter costs and click 'Load & Visualize'"}
            </div>
            <div className="text-gray-600 text-sm">
              Format: costA1,costB1,costA2,costB2,... (even number of values)
            </div>
            <div className="text-gray-600 text-sm mt-2">
              Example: "10,20,30,200,400,50,30,20" or click "New Costs"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoCityScheduling;
