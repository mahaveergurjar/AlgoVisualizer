import React, { useState, useCallback } from "react";
import { Code, Clock, Cpu, Terminal, CheckCircle, TrendingUp } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const BestTimeToBuyAndSellStock = () => {
  const [arrInput, setArrInput] = useState("7,1,5,3,6,4");
  const [array, setArray] = useState([7, 1, 5, 3, 6, 4]);
  const [algo, setAlgo] = useState("optimal"); // optimal or brute

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;
  const state = currentState || {};

  const generateOptimalHistory = (prices) => {
    const history = [];
    let minPrice = Infinity;
    let minIndex = -1;
    let maxProfit = 0;
    let buyIndex = null;
    let sellIndex = null;

    const add = (props) =>
      history.push({
        prices: [...prices],
        minPrice,
        minIndex,
        maxProfit,
        buyIndex,
        sellIndex,
        ...props,
      });

    add({
      line: 2,
      explanation: "Initialize minPrice = Infinity and maxProfit = 0.",
    });

    for (let i = 0; i < prices.length; i++) {
      const p = prices[i];
      add({
        line: 3,
        currentIndex: i,
        profit: p - minPrice,
        isLessThanMin: p < minPrice,
        profitUpdated: false,
        explanation: `Checking price at index ${i}: ${p}`,
      });

      if (p < minPrice) {
        minPrice = p;
        minIndex = i;
        add({
          line: 4,
          currentIndex: i,
          isLessThanMin: true,
          explanation: `New minimum price seen so far: ${p} (index ${i})`,
        });
      }

      const profit = p - minPrice;
      if (profit > maxProfit) {
        maxProfit = profit;
        buyIndex = minIndex;
        sellIndex = i;
        add({
          line: 5,
          currentIndex: i,
          profit,
          profitUpdated: true,
          explanation: `Found higher profit: ${p} - ${minPrice} = ${profit}. Updating buy index to ${buyIndex} and sell index to ${sellIndex}.`,
        });
      } else {
        add({
          line: 5,
          currentIndex: i,
          profit,
          profitUpdated: false,
          explanation: `Profit with current price: ${p} - ${minPrice} = ${profit}. No update to max profit.`,
        });
      }
    }

    add({
      line: 7,
      explanation: `Algorithm finished. Maximum profit that can be achieved is ${maxProfit}.`,
    });
    return history;
  };

  const generateBruteForceHistory = (prices) => {
    const history = [];
    let maxProfit = 0;
    let buyIndex = null;
    let sellIndex = null;

    const add = (props) =>
      history.push({
        prices: [...prices],
        maxProfit,
        buyIndex,
        sellIndex,
        minPrice: null,
        minIndex: null,
        ...props,
      });

    add({
      line: 2,
      explanation: "Initialize maxProfit = 0.",
    });

    for (let i = 0; i < prices.length; i++) {
      add({
        line: 3,
        currentIndex: i,
        explanation: `Outer loop: i = ${i}, buy price = ${prices[i]}`,
      });

      for (let j = i + 1; j < prices.length; j++) {
        const profit = prices[j] - prices[i];
        add({
          line: 4,
          currentIndex: i,
          j,
          explanation: `Inner loop: j = ${j}, sell price = ${prices[j]}. Checking profit: ${prices[j]} - ${prices[i]} = ${profit}`,
        });

        if (profit > maxProfit) {
          maxProfit = profit;
          buyIndex = i;
          sellIndex = j;
          add({
            line: 5,
            currentIndex: i,
            j,
            profit,
            profitUpdated: true,
            explanation: `Found higher profit: ${profit}. Updating buy/sell indices to ${buyIndex}/${sellIndex}.`,
          });
        }
      }
    }

    add({
      line: 8,
      explanation: `Algorithm finished. Maximum profit that can be achieved is ${maxProfit}.`,
    });
    return history;
  };

  const parsePrices = (str) =>
    str
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));

  const handleLoad = useCallback((customArr, currentAlgo = algo) => {
    let arr = customArr;
    if (!arr) {
      arr = parsePrices(arrInput);
    }
    if (arr.some(isNaN) || arr.length === 0) {
      alert("Invalid input");
      return;
    }
    setArray(arr);
    setArrInput(arr.join(", "));

    const h =
      currentAlgo === "brute"
        ? generateBruteForceHistory(arr)
        : generateOptimalHistory(arr);
    load(h);
  }, [arrInput, algo, load]);

  const handleAlgoChange = (nextAlgo) => {
    if (nextAlgo === algo) return;
    setAlgo(nextAlgo);
    if (isLoaded) {
      handleLoad(array, nextAlgo);
    }
  };

  const optimalCode = {
    1: `int maxProfit(vector<int>& prices) {`,
    2: `    int minPrice = INT_MAX, maxProfit = 0;`,
    3: `    for (int i = 0; i < prices.size(); i++) {`,
    4: `        minPrice = min(minPrice, prices[i]);`,
    5: `        maxProfit = max(maxProfit, prices[i] - minPrice);`,
    6: `    }`,
    7: `    return maxProfit;`,
    8: `}`
  };

  const bruteCode = {
    1: `int maxProfitBrute(vector<int>& prices) {`,
    2: `    int maxProfit = 0;`,
    3: `    for (int i = 0; i < prices.size(); ++i) {`,
    4: `        for (int j = i+1; j < prices.size(); ++j) {`,
    5: `            maxProfit = max(maxProfit, prices[j] - prices[i]);`,
    6: `        }`,
    7: `    }`,
    8: `    return maxProfit;`,
    9: `}`
  };

  const {
    prices = array,
    minPrice,
    maxProfit = 0,
    buyIndex = null,
    sellIndex = null,
    currentIndex,
    line
  } = state;

  const maxVal = Math.max(...prices, 1);

  const inputSection = (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={arrInput}
          onChange={(e) => setArrInput(e.target.value)}
          disabled={isLoaded}
          className="flex-1 min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-emerald-400 shadow-sm text-sm"
          placeholder="Prices (e.g. 7,1,5,3,6,4)"
        />
        {!isLoaded && (
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-white font-bold transition shadow-lg cursor-pointer text-sm"
          >
            Load & Visualize
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAlgoChange("optimal")}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-xs ${
            algo === "optimal"
              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400"
              : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
          }`}
        >
          Optimal (One pass) O(N)
        </button>
        <button
          onClick={() => handleAlgoChange("brute")}
          className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-xs ${
            algo === "brute"
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none text-sm">
          <Terminal size={14} /> Min Price Seen
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {minPrice !== null && minPrice !== undefined && minPrice !== Infinity ? minPrice : "-"}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none text-sm">
          <TrendingUp size={14} /> Max Profit
        </h4>
        <div className="text-3xl font-mono text-purple-300 font-bold">
          {maxProfit}
        </div>
      </div>

      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none text-sm">
          <CheckCircle size={14} /> Buy / Sell Index
        </h4>
        <div className="text-3xl font-bold text-emerald-300">
          {buyIndex !== null ? buyIndex : "-"} / {sellIndex !== null ? sellIndex : "-"}
        </div>
      </div>

      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-emerald-300 font-semibold flex items-center gap-2 mb-2 select-none text-sm">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-cyan-300">
              {algo === "optimal" ? "O(N)" : "O(N²)"}
            </span>{" "}
            — {algo === "optimal" ? "Single pass greedy scan." : "All pairs checking."}
          </div>
          <div>
            <strong>Space:</strong> <span className="font-mono text-cyan-300">O(1)</span> — Only utilizes pointers/minPrice tracker.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Best Time to Buy and Sell Stock"
      description="Find the maximum profit you can achieve by buying and selling a stock."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={algo === "optimal" ? optimalCode : bruteCode}
      activeLine={line}
      message={state.explanation || "Enter stock prices to begin visualization."}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter stock prices to begin the visualization."
    >
      <div className="w-full space-y-8">
        <div className="relative min-h-[12rem] flex items-end justify-center gap-2 px-2 py-6 bg-gray-900/40 rounded-xl border border-gray-800">
          {prices.map((p, idx) => {
            const isBuy = idx === buyIndex;
            const isSell = idx === sellIndex;
            const isCurr = idx === currentIndex;
            const barColor = isBuy ? "bg-green-400 shadow-lg" : isSell ? "bg-red-400 shadow-lg" : isCurr ? "bg-yellow-400" : "bg-gray-600";

            return (
              <div
                key={idx}
                id={`prices-container-element-${idx}`}
                className="flex flex-col items-center mx-1 transition-all duration-300"
              >
                <div
                  className={`w-12 rounded-t transition-all duration-300 ${barColor}`}
                  style={{ height: `${Math.round((p / maxVal) * 140)}px` }}
                />
                <div className="text-xs text-gray-300 mt-2 font-mono">{p}</div>
                <div className="text-[10px] text-gray-500 font-mono">[{idx}]</div>
              </div>
            );
          })}

          {buyIndex !== null && (
            <VisualizerPointer
              index={buyIndex}
              containerId="prices-container"
              color="green"
              label={`Buy (${buyIndex})`}
              direction="up"
            />
          )}
          {sellIndex !== null && (
            <VisualizerPointer
              index={sellIndex}
              containerId="prices-container"
              color="red"
              label={`Sell (${sellIndex})`}
              direction="up"
            />
          )}
          {currentIndex !== undefined && (
            <VisualizerPointer
              index={currentIndex}
              containerId="prices-container"
              color="yellow"
              label={`Curr (${currentIndex})`}
              direction="up"
            />
          )}
          {state.minIndex !== undefined && state.minIndex !== -1 && (
            <VisualizerPointer
              index={state.minIndex}
              containerId="prices-container"
              color="indigo"
              label={`Min (${state.minIndex})`}
              direction="up"
            />
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default BestTimeToBuyAndSellStock;
