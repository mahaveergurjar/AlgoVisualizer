import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const BestTimeStockII = () => {
  const [mode, setMode] = useState("greedy");
  const [pricesInput, setPricesInput] = useState("7,1,5,3,6,4");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateNewPrices = () => {
    const prices = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
    setPricesInput(prices.join(","));
    visualizer.reset();
  };

  const handleLoad = useCallback((customPrices) => {
    const rawInput = customPrices !== undefined ? customPrices : pricesInput;
    const prices = rawInput.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (prices.length < 2) {
      alert("Please enter at least 2 valid prices");
      return;
    }

    setPricesInput(rawInput);

    if (mode === "greedy") {
      const newHistory = [];
      let totalProfit = 0;
      let transactions = [];

      newHistory.push({
        prices: [...prices],
        totalProfit: 0,
        transactions: [],
        explanation: "Starting greedy algorithm - Buy on every price increase",
        line: 1,
        finished: false,
      });

      for (let i = 1; i < prices.length; i++) {
        const priceDiff = prices[i] - prices[i - 1];
        
        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `Day ${i + 1}: Price = $${prices[i]}, Previous = $${prices[i - 1]}, Difference = $${priceDiff}`,
          line: 3,
          finished: false,
          currentDay: i,
          previousDay: i - 1,
          priceDiff,
        });

        if (priceDiff > 0) {
          newHistory.push({
            prices: [...prices],
            totalProfit,
            transactions: [...transactions],
            explanation: `PROFIT: Buy at day ${i} ($${prices[i - 1]}), Sell at day ${i + 1} ($${prices[i]})`,
            line: 4,
            finished: false,
            currentDay: i,
            previousDay: i - 1,
            priceDiff,
            isTransaction: true,
          });

          totalProfit += priceDiff;
          transactions.push({
            buyDay: i - 1,
            buyPrice: prices[i - 1],
            sellDay: i,
            sellPrice: prices[i],
            profit: priceDiff
          });

          newHistory.push({
            prices: [...prices],
            totalProfit,
            transactions: [...transactions],
            explanation: `Profit: +$${priceDiff}, Total: $${totalProfit}`,
            line: 5,
            finished: false,
            currentDay: i,
            isTransaction: true,
          });
        } else {
          newHistory.push({
            prices: [...prices],
            totalProfit,
            transactions: [...transactions],
            explanation: `No transaction - Price didn't increase`,
            line: 4,
            finished: false,
            currentDay: i,
          });
        }
      }

      newHistory.push({
        prices: [...prices],
        totalProfit,
        transactions: [...transactions],
        explanation: `Complete! Total profit: $${totalProfit} from ${transactions.length} transactions`,
        line: 8,
        finished: true,
      });

      load(newHistory);
    } else {
      const newHistory = [];
      let totalProfit = 0;
      let transactions = [];
      let i = 0;

      newHistory.push({
        prices: [...prices],
        totalProfit: 0,
        transactions: [],
        explanation: "Starting peak-valley algorithm",
        line: 1,
        finished: false,
      });

      while (i < prices.length - 1) {
        let valleyIndex = i;
        let peakIndex = i;

        while (i < prices.length - 1 && prices[i] >= prices[i + 1]) {
          i++;
        }
        valleyIndex = i;

        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `Valley found: Day ${valleyIndex + 1} at $${prices[valleyIndex]}`,
          line: 5,
          finished: false,
          valley: valleyIndex,
          isValleyFound: true,
        });

        while (i < prices.length - 1 && prices[i] <= prices[i + 1]) {
          i++;
        }
        peakIndex = i;

        newHistory.push({
          prices: [...prices],
          totalProfit,
          transactions: [...transactions],
          explanation: `Peak found: Day ${peakIndex + 1} at $${prices[peakIndex]}`,
          line: 7,
          finished: false,
          valley: valleyIndex,
          peak: peakIndex,
          isPeakFound: true,
        });

        if (valleyIndex < peakIndex) {
          const profit = prices[peakIndex] - prices[valleyIndex];
          
          newHistory.push({
            prices: [...prices],
            totalProfit,
            transactions: [...transactions],
            explanation: `Buy at valley (Day ${valleyIndex + 1}), Sell at peak (Day ${peakIndex + 1})`,
            line: 8,
            finished: false,
            valley: valleyIndex,
            peak: peakIndex,
            isTransaction: true,
          });

          totalProfit += profit;
          transactions.push({
            buyDay: valleyIndex,
            buyPrice: prices[valleyIndex],
            sellDay: peakIndex,
            sellPrice: prices[peakIndex],
            profit
          });

          newHistory.push({
            prices: [...prices],
            totalProfit,
            transactions: [...transactions],
            explanation: `Profit: +$${profit}, Total: $${totalProfit}`,
            line: 8,
            finished: false,
            valley: valleyIndex,
            peak: peakIndex,
            isTransaction: true,
          });
        }

        i++;
      }

      newHistory.push({
        prices: [...prices],
        totalProfit,
        transactions: [...transactions],
        explanation: `Complete! Total profit: $${totalProfit} from ${transactions.length} transactions`,
        line: 10,
        finished: true,
      });

      load(newHistory);
    }
  }, [pricesInput, mode, load]);

  const { 
    prices = [], 
    totalProfit = 0, 
    transactions = [], 
    line = 1,
    currentDay,
    previousDay,
    valley,
    peak,
    isTransaction = false,
    isValleyFound = false,
    isPeakFound = false
  } = currentState;

  const greedyCode = {
    1: `int maxProfit(vector<int>& prices) {`,
    2: `    int profit = 0;`,
    3: `    for (int i = 1; i < prices.size(); i++) {`,
    4: `        if (prices[i] > prices[i-1]) {`,
    5: `            profit += prices[i] - prices[i-1];`,
    6: `        }`,
    7: `    }`,
    8: `    return profit;`,
    9: `}`
  };

  const peakValleyCode = {
    1: `int maxProfit(vector<int>& prices) {`,
    2: `    int i = 0, profit = 0;`,
    3: `    while (i < prices.size() - 1) {`,
    4: `        while (i < prices.size()-1 && prices[i] >= prices[i+1]) i++;`,
    5: `        int valley = prices[i];`,
    6: `        while (i < prices.size()-1 && prices[i] <= prices[i+1]) i++;`,
    7: `        int peak = prices[i];`,
    8: `        profit += peak - valley;`,
    9: `    }`,
    10: `    return profit;`,
    11: `}`
  };

  const codeContent = mode === "greedy" ? greedyCode : peakValleyCode;

  const inputSection = (
    <>
      <input
        type="text"
        value={pricesInput}
        onChange={(e) => setPricesInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
        placeholder="Prices (e.g. 7,1,5,3,6,4)"
      />
      <select
        value={mode}
        onChange={(e) => {
          setMode(e.target.value);
          visualizer.reset();
        }}
        disabled={isLoaded}
        className="w-40 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-green-400 shadow-sm"
      >
        <option value="greedy">Greedy Approach</option>
        <option value="peak-valley">Peak-Valley</option>
      </select>
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={generateNewPrices}
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-305 select-none">
          Total Profit
        </h4>
        <div className="text-3xl font-mono text-green-305">
          ${totalProfit}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Transactions Count
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {transactions.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none">
          Current Day
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          {currentDay !== undefined ? currentDay + 1 : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N)</span> - single pass.
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span> auxiliary.
          </div>
        </div>
      </div>
    </>
  );

  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const chartHeight = 200;

  return (
    <VisualizerLayout
      title="Best Time to Buy and Sell Stock II"
      description="Maximize profit from stock price fluctuations using greedy peak-valley detection or consecutive gains accumulation."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter stock prices to begin."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
          <div className="flex items-end justify-center gap-3 h-[220px] pt-4">
            {prices.map((price, index) => {
              const height = ((price - minPrice) / (maxPrice - minPrice || 1)) * (chartHeight - 60) + 40;
              
              let barColor = "bg-gray-750 border-gray-650";
              
              if (mode === "greedy") {
                if (index === currentDay && isTransaction) {
                  barColor = "bg-green-500/40 border-green-400 scale-105 shadow-lg shadow-green-500/20";
                } else if (index === previousDay && isTransaction) {
                  barColor = "bg-red-500/40 border-red-400 scale-105 shadow-lg shadow-red-500/20";
                } else if (index === currentDay) {
                  barColor = "bg-yellow-500/40 border-yellow-400";
                }
              } else {
                if (index === valley && isValleyFound) {
                  barColor = "bg-blue-500/40 border-blue-400 scale-105 shadow-lg shadow-blue-500/20";
                } else if (index === peak && isPeakFound) {
                  barColor = "bg-red-500/40 border-red-400 scale-105 shadow-lg shadow-red-500/20";
                } else if (index === currentDay) {
                  barColor = "bg-yellow-500/40 border-yellow-400";
                }
              }

              return (
                <div key={index} className="flex flex-col items-center gap-1 font-mono">
                  <div className="text-xs text-gray-500">${price}</div>
                  <div
                    className={`w-10 rounded-lg border-2 transition-all duration-300 ${barColor}`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-gray-400 mt-1">D{index + 1}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 max-w-lg mx-auto">
          <h4 className="text-sm font-bold text-gray-300 mb-3 select-none">
            Transactions Executed ({transactions.length}):
          </h4>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet...</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-green-500/10 border border-green-500/30 rounded-lg p-2 font-mono text-sm"
                >
                  <span className="text-gray-300">
                    Buy Day {t.buyDay + 1} (${t.buyPrice}) → Sell Day {t.sellDay + 1} (${t.sellPrice})
                  </span>
                  <span className="text-green-400 font-bold">+${t.profit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default BestTimeStockII;