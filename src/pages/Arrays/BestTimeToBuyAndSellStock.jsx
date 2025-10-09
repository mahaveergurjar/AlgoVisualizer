import React, { useState, useEffect, useCallback } from "react";

// Pointer Component (reused pattern)
const Pointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const container = document.getElementById(containerId);
    const element = document.getElementById(`${containerId}-element-${index}`);

    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      setPosition({
        left: elementRect.left - containerRect.left + elementRect.width / 2,
        top: elementRect.top - containerRect.top - 24,
      });
    }
  }, [index, containerId]);

  const colors = {
    buy: { bg: "bg-green-500", text: "text-green-400" },
    sell: { bg: "bg-red-500", text: "text-red-400" },
    current: { bg: "bg-yellow-500", text: "text-yellow-400" },
    min: { bg: "bg-indigo-500", text: "text-indigo-300" },
  };

  if (index === null || index === undefined) return null;

  return (
    <div
      className="absolute transition-all duration-500 ease-out pointer-events-none"
      style={{ left: `${position.left}px`, top: `${position.top}px`, transform: "translateX(-50%)" }}
    >
      <div
        className={`px-2 py-1 rounded-md text-xs font-bold ${colors[color].bg} text-white`}
      >
        {label}
      </div>
    </div>
  );
};

const parseInput = (str) =>
  str
    .split(/[,\s]+/)
    .map((s) => Number(s))
    .filter((n) => !Number.isNaN(n));

// Generate step-by-step history for the single-pass greedy algorithm
const generateSteps = (prices) => {
  const history = [];
  let minPrice = Infinity;
  let minIndex = -1;
  let maxProfit = 0;
  let buyIndex = null;
  let sellIndex = null;

  const add = (props) =>
    history.push({ prices: [...prices], minPrice, minIndex, maxProfit, buyIndex, sellIndex, ...props });

  add({ line: 1 });

  for (let i = 0; i < prices.length; i++) {
    const p = prices[i];
    // mark current index
    add({ line: 2, i, currentIndex: i, profit: p - minPrice, isLessThanMin: p < minPrice, profitUpdated: false });
    if (p < minPrice) {
      minPrice = p;
      minIndex = i;
      add({ line: 3, i, currentIndex: i, isLessThanMin: true });
    }
    const profit = p - minPrice;
    // check profit and update
    if (profit > maxProfit) {
      maxProfit = profit;
      buyIndex = minIndex;
      sellIndex = i;
      add({ line: 5, i, currentIndex: i, profit, profitUpdated: true });
    } else {
      add({ line: 4, i, currentIndex: i, profit, profitUpdated: false });
    }
  }

  add({ line: 6 });
  return history;
};

const Bar = ({ value, max, highlight }) => {
  const height = max > 0 ? Math.round((value / max) * 120) : 0;
  const base = "w-12 mx-1 flex flex-col items-center";
  const barColor = highlight ? "bg-amber-400" : "bg-gray-600";
  return (
    <div className={base}>
      <div className={`w-full rounded-t ${barColor}`} style={{ height: `${height}px` }} />
      <div className="text-xs text-gray-300 mt-2">{value}</div>
    </div>
  );
};

const BestTimeToBuyAndSellStock = ({ navigate }) => {
  const [input, setInput] = useState("7,1,5,3,6,4");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lang, setLang] = useState("js");

  const snippets = {
  js: `let minPrice = Infinity;
let maxProfit = 0;
for (let i = 0; i < prices.length; i++) {
  if (prices[i] < minPrice) minPrice = prices[i];
  const profit = prices[i] - minPrice;
  if (profit > maxProfit) maxProfit = profit;
}
return maxProfit;`,
  python: `def max_profit(prices):
  min_price = float('inf')
  max_profit = 0
  for p in prices:
    if p < min_price:
      min_price = p
    profit = p - min_price
    if profit > max_profit:
      max_profit = profit
  return max_profit`,
  cpp: `int maxProfit(vector<int>& prices) {
  int minPrice = INT_MAX, maxProfit = 0;
  for (int p : prices) {
    minPrice = min(minPrice, p);
    maxProfit = max(maxProfit, p - minPrice);
  }
  return maxProfit;
}`,
  c: `int maxProfit(int* prices, int n) {
  int minPrice = INT_MAX, maxProfit = 0;
  for (int i = 0; i < n; ++i) {
    if (prices[i] < minPrice) minPrice = prices[i];
    int profit = prices[i] - minPrice;
    if (profit > maxProfit) maxProfit = profit;
  }
  return maxProfit;
}`,
  java: `public int maxProfit(int[] prices) {
  int minPrice = Integer.MAX_VALUE, maxProfit = 0;
  for (int p : prices) {
    if (p < minPrice) minPrice = p;
    int profit = p - minPrice;
    if (profit > maxProfit) maxProfit = profit;
  }
  return maxProfit;
}`,
  };

  const run = useCallback(() => {
    const arr = parseInput(input);
    const h = generateSteps(arr);
    setHistory(h);
    setCurrentStep(0);
    setIsLoaded(true);
  }, [input]);

  const reset = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsLoaded(false);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isLoaded, stepBackward, stepForward]);

  const state = history[currentStep] || {};
  const { prices = [], minPrice, minIndex, maxProfit, buyIndex, sellIndex, line } = state;
  const max = Math.max(...prices, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="p-4 max-w-5xl mx-auto">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-3">
            Best Time to Buy and Sell Stock
          </h1>
          <p className="text-lg text-gray-400">Visualizing LeetCode 121 - Greedy / One pass</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>
              Navigate
            </span>
          </div>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label htmlFor="prices-input" className="font-semibold text-gray-300 text-sm whitespace-nowrap">Prices:</label>
                <input
                  id="prices-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoaded}
                  className="bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 w-full sm:w-96 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                  placeholder="e.g., 7,1,5,3,6,4"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={run}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-gray-900 font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Load & Visualize
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isLoaded ? (
                <>
                  <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed">
                    ◀
                  </button>
                  <span className="font-mono text-base text-gray-300 min-w-[100px] text-center bg-gray-900/50 px-4 py-2 rounded-lg">Step <span className="text-emerald-400 font-bold">{currentStep + 1}</span>/{history.length}</span>
                  <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed">▶</button>
                </>
              ) : null}

              <button onClick={reset} className="ml-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">Reset</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl text-emerald-400 border-b border-gray-600/50 pb-3 flex items-center gap-2">Solution</h3>
              <div className="flex gap-2">
                {['js','python','cpp','c','java'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 text-xs rounded ${lang===l ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto max-h-[420px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {snippets[lang]}
              </pre>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[240px]">
              <h3 className="font-bold text-lg text-gray-300 mb-4">Prices Visualization</h3>
              <div id="prices-container" className="w-full h-44 flex items-end justify-center gap-2 relative overflow-x-auto px-2 py-4">
                {isLoaded ? (
                  prices.map((p, idx) => {
                    const highlight = idx === buyIndex || idx === sellIndex;
                    return (
                      <div key={idx} id={`prices-container-element-${idx}`} className={`flex flex-col items-center mx-1`}> 
                        <div className={`w-12 rounded-t ${highlight ? (idx===buyIndex? 'bg-green-400':'bg-red-400') : 'bg-gray-600'}`} style={{ height: `${max>0? Math.round((p/max)*140):0 }px` }} />
                        <div className="text-xs text-gray-300 mt-2">{p}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-center py-8 w-full">Load prices to start visualizing</div>
                )}
                {isLoaded && buyIndex !== null && (
                  <Pointer index={buyIndex} containerId="prices-container" color="buy" label={`Buy (${buyIndex})`} />
                )}
                {isLoaded && sellIndex !== null && (
                  <Pointer index={sellIndex} containerId="prices-container" color="sell" label={`Sell (${sellIndex})`} />
                )}
                {isLoaded && state.currentIndex !== undefined && (
                  <Pointer index={state.currentIndex} containerId="prices-container" color="current" label={`Curr (${state.currentIndex})`} />
                )}
                {isLoaded && state.minIndex !== undefined && state.minIndex !== -1 && (
                  <Pointer index={state.minIndex} containerId="prices-container" color="min" label={`Min (${state.minIndex})`} />
                )}
              </div>
              {/* Status bar showing comparisons */}
              <div className="mt-3 text-sm text-gray-300 flex items-center justify-center gap-6">
                <div>Current: <span className="font-mono text-amber-300">{state.currentIndex !== undefined ? prices[state.currentIndex] : '-'}</span></div>
                <div>Min: <span className="font-mono text-emerald-300">{state.minIndex !== undefined && state.minIndex !== -1 ? prices[state.minIndex] : '-'}</span></div>
                <div>Profit: <span className="font-mono text-purple-300">{state.profit ?? '-'}</span></div>
                <div className={`${state.profitUpdated ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>{state.profitUpdated ? 'Profit Updated' : 'No Update'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-blue-700/50">
                <h3 className="font-bold text-lg text-blue-300 mb-3">Min Price Seen</h3>
                <div className="text-center font-mono text-4xl text-blue-300">{minPrice ?? '-'}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-700/50">
                <h3 className="font-bold text-lg text-purple-300 mb-3">Max Profit</h3>
                <div className="text-center font-mono text-4xl text-purple-300">{maxProfit ?? 0}</div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-green-700/50">
                <h3 className="font-bold text-lg text-green-300 mb-3">Buy / Sell Index</h3>
                <div className="text-center font-mono text-4xl text-green-300">{buyIndex ?? '-'} / {sellIndex ?? '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-12 pb-6 text-gray-500 text-sm">Use arrow keys ← → to navigate through steps</footer>
      </div>
    </div>
  );
};

export default BestTimeToBuyAndSellStock;
