import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { Users, Calendar, Building, Plane } from "lucide-react";

const TwoCityScheduling = () => {
  const [costsInput, setCostsInput] = useState("10,20,30,200,400,50,30,20");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customCosts) => {
    const raw = customCosts !== undefined ? customCosts : costsInput;
    try {
      const costsArray = raw
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

      setCostsInput(raw);

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

      load(newHistory);
    } catch {
      alert("Invalid input format. Use: costA1,costB1,costA2,costB2,...");
    }
  }, [costsInput, load]);

  const generateNewCosts = () => {
    const pairs = 4; // Generate 4 people
    const costs = [];
    for (let i = 0; i < pairs; i++) {
      const costA = Math.floor(Math.random() * 100) + 10;
      const costB = Math.floor(Math.random() * 100) + 10;
      costs.push(costA, costB);
    }
    const val = costs.join(",");
    setCostsInput(val);
    visualizer.reset();
  };

  const {
    costs = [],
    totalCost = 0,
    cityA = [],
    cityB = [],
    differences = [],
    explanation = "Ready to start...",
    line = 1,
    currentPerson,
    isSorted = false,
    isProcessing = false,
    assignedToA = false,
    assignedToB = false,
  } = currentState;

  const codeContent = {
    1: "int twoCitySchedCost(vector<vector<int>>& costs) {",
    2: "  sort(costs.begin(), costs.end(), [](auto& a, auto& b) {",
    3: "    return (a[0]-a[1]) < (b[0]-b[1]);",
    4: "  });",
    5: "  int total = 0, n = costs.size()/2;",
    6: "  for (int i = 0; i < n; i++) {",
    7: "    total += costs[i][0] + costs[i+n][1];",
    8: "  }",
    9: "  return total;",
    10: "}"
  };

  const inputSection = (
    <>
      <input
        value={costsInput}
        onChange={(e) => setCostsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-450 shadow-sm"
        placeholder="e.g. 10,20,30,200,400,50,30,20"
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
            onClick={generateNewCosts}
            className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-xl font-medium transition-all cursor-pointer"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none font-sans">
          Total Cost
        </h4>
        <div className="text-3xl font-mono text-green-300 font-bold">
          ${totalCost}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none font-sans">
          City A
        </h4>
        <div className="text-3xl font-mono text-blue-300 font-bold font-sans">
          {cityA.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-red-300 select-none font-sans">
          City B
        </h4>
        <div className="text-3xl font-mono text-red-300 font-bold font-sans">
          {cityB.length}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-sans">
        <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2 select-none">
          <Calendar className="w-5 h-5 text-gray-400" />
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
              <div className="text-xs text-gray-300 grid grid-cols-2 gap-1 font-mono">
                <div>City A: ${cost[0]}</div>
                <div>City B: ${cost[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-sans">
        <h4 className="text-blue-400 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(n log n)</span> - Sorting + linear pass through costs.
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(n)</span> - Storage for cost differences.
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
    </>
  );

  return (
    <VisualizerLayout
      title="Two City Scheduling"
      description="LeetCode 1029 - Minimize costs for balanced city assignment"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter costs and click 'Load & Visualize'"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      {costs.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="h-64 flex items-center justify-center text-gray-500 font-sans">
            No data to display
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 font-sans">
          <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2 select-none">
            <Users className="w-5 h-5 text-gray-400" />
            City Assignment Visualization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City A */}
            <div className="bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-blue-400">City A</h4>
                <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded font-mono">
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
                <span className="text-xs bg-red-500/30 text-red-300 px-2 py-1 rounded font-mono">
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
                  <div className="text-yellow-200 text-sm font-mono">
                    Difference: ${differences[currentPerson].difference}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cost Differences Table */}
          {differences.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-300 mb-3 select-none">
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
                    <div className="text-xs text-gray-400 font-mono">
                      Person {diff.index + 1}
                    </div>
                    <div className="text-sm font-mono text-gray-200">A: ${diff.costA}</div>
                    <div className="text-sm font-mono text-gray-200">B: ${diff.costB}</div>
                    <div
                      className={`text-xs font-bold font-mono ${
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
      )}
    </VisualizerLayout>
  );
};

export default TwoCityScheduling;
