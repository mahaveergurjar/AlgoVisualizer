import React, { useState, useEffect, useCallback } from "react";
import { Code, ArrowUp, Clock } from "lucide-react";

// Visualizer pointer (mirrors TrappingRainWater style)
const VisualizerPointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0 });

  useEffect(() => {
    if (index === null || index === undefined || index < 0) {
      setPosition({ opacity: 0 });
      return;
    }
    const container = document.getElementById(containerId);
    const element = document.getElementById(`${containerId}-element-${index}`);
    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.left - containerRect.left + elementRect.width / 2 - 12;
      setPosition({ opacity: 1, left: offset });
    } else {
      setPosition({ opacity: 0 });
    }
  }, [index, containerId]);

  return (
    <div className="absolute top-full text-center transition-all duration-300 ease-out" style={position}>
      <ArrowUp className={`w-6 h-6 mx-auto text-${color}-400`} />
      <span className={`font-bold text-lg font-mono text-${color}-400`}>{label}</span>
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
  const [algo, setAlgo] = useState("optimal");

  const snippets = {
    optimal: {
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
    },
    brute: {
      js: `let maxProfit = 0;
for (let i = 0; i < prices.length; i++) {
  for (let j = i + 1; j < prices.length; j++) {
    maxProfit = Math.max(maxProfit, prices[j] - prices[i]);
  }
}
return maxProfit;`,
      python: `def max_profit_bruteforce(prices):
    max_profit = 0
    n = len(prices)
    for i in range(n):
        for j in range(i+1, n):
            max_profit = max(max_profit, prices[j] - prices[i])
    return max_profit`,
      cpp: `int maxProfitBrute(vector<int>& prices) {
    int maxProfit = 0;
    for (int i = 0; i < prices.size(); ++i) {
        for (int j = i+1; j < prices.size(); ++j) {
            maxProfit = max(maxProfit, prices[j] - prices[i]);
        }
    }
    return maxProfit;
}`,
      c: `int maxProfitBrute(int* prices, int n) {
    int maxProfit = 0;
    for (int i = 0; i < n; ++i) {
        for (int j = i+1; j < n; ++j) {
            int profit = prices[j] - prices[i];
            if (profit > maxProfit) maxProfit = profit;
        }
    }
    return maxProfit;
}`,
      java: `public int maxProfitBrute(int[] prices) {
    int maxProfit = 0;
    for (int i = 0; i < prices.length; i++) {
        for (int j = i+1; j < prices.length; j++) {
            maxProfit = Math.max(maxProfit, prices[j] - prices[i]);
        }
    }
    return maxProfit;
}`,
    },
  };

  const complexities = {
    optimal: { time: "O(n)", space: "O(1)" },
    brute: { time: "O(n²)", space: "O(1)" },
  };

  // Token rendering helpers (copied style from TrappingRainWater)
  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "light-blue": "text-sky-300",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    "light-gray": "text-gray-400",
    green: "text-green-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-blue-500/20" : ""}`}>
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">{line}</span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  const optimalCodeTokens = [
    { l: 1, c: [{ t: "int", c: "cyan" }, { t: " maxProfit(vector<int>& prices) {", c: "" }] },
    { l: 2, c: [{ t: "  int", c: "cyan" }, { t: " minPrice = INT_MAX, maxProfit = 0;", c: "" }] },
    { l: 3, c: [{ t: "  for", c: "purple" }, { t: " (int i = 0; i < prices.size(); i++) {", c: "" }] },
    { l: 4, c: [{ t: "    minPrice = min(minPrice, prices[i]);", c: "" }] },
    { l: 5, c: [{ t: "    maxProfit = max(maxProfit, prices[i] - minPrice);", c: "" }] },
    { l: 6, c: [{ t: "  }", c: "light-gray" }] },
    { l: 7, c: [{ t: "  return", c: "purple" }, { t: " maxProfit;", c: "" }] },
    { l: 8, c: [{ t: "}", c: "light-gray" }] },
  ];

  const bruteCodeTokens = [
    { l: 1, c: [{ t: "int", c: "cyan" }, { t: " maxProfitBrute(vector<int>& prices) {", c: "" }] },
    { l: 2, c: [{ t: "  int", c: "cyan" }, { t: " maxProfit = 0;", c: "" }] },
    { l: 3, c: [{ t: "  for", c: "purple" }, { t: " (int i = 0; i < prices.size(); ++i) {", c: "" }] },
    { l: 4, c: [{ t: "    for", c: "purple" }, { t: " (int j = i+1; j < prices.size(); ++j) {", c: "" }] },
    { l: 5, c: [{ t: "      maxProfit = max(maxProfit, prices[j] - prices[i]);", c: "" }] },
    { l: 6, c: [{ t: "    }", c: "light-gray" }] },
    { l: 7, c: [{ t: "  }", c: "light-gray" }] },
    { l: 8, c: [{ t: "  return", c: "purple" }, { t: " maxProfit;", c: "" }] },
    { l: 9, c: [{ t: "}", c: "light-gray" }] },
  ];

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
                <div>
                  <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
                    <Code size={20} />
                    {lang === 'cpp' ? 'C++' : lang.toUpperCase()} {algo === 'brute' ? 'Brute Force' : 'Optimal'} Solution
                  </h3>
                  <div className="mt-2 text-xs text-gray-400">Variant:</div>
                  <div className="mt-1 flex gap-2">
                    <button onClick={() => setAlgo('optimal')} className={`px-2 py-1 text-xs rounded ${algo==='optimal' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Optimal</button>
                    <button onClick={() => setAlgo('brute')} className={`px-2 py-1 text-xs rounded ${algo==='brute' ? 'bg-rose-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Brute-force</button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {['js','python','cpp','c','java'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-2 py-1 text-xs rounded ${lang===l ? (algo==='optimal' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-gray-700 text-gray-200'}`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`overflow-x-auto max-h-[420px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 ${algo==='optimal' ? 'bg-gray-900/40' : 'bg-gray-900/20'} p-3 rounded`}>
              {lang === 'cpp' ? (
                <pre className="text-sm font-mono leading-relaxed">
                  <code>
                    {(algo === 'optimal' ? optimalCodeTokens : bruteCodeTokens).map((line) => (
                      <CodeLine key={line.l} line={line.l} content={line.c} />
                    ))}
                  </code>
                </pre>
              ) : (
                <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                  {snippets[algo][lang]}
                </pre>
              )}
              <div className="mt-3 text-sm text-gray-300 flex items-center justify-between">
                <div>Time: <span className="font-mono text-amber-300">{complexities[algo].time}</span></div>
                <div>Space: <span className="font-mono text-emerald-300">{complexities[algo].space}</span></div>
              </div>
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
                  <VisualizerPointer index={buyIndex} containerId="prices-container" color="green" label={`Buy (${buyIndex})`} />
                )}
                {isLoaded && sellIndex !== null && (
                  <VisualizerPointer index={sellIndex} containerId="prices-container" color="red" label={`Sell (${sellIndex})`} />
                )}
                {isLoaded && state.currentIndex !== undefined && (
                  <VisualizerPointer index={state.currentIndex} containerId="prices-container" color="yellow" label={`Curr (${state.currentIndex})`} />
                )}
                {isLoaded && state.minIndex !== undefined && state.minIndex !== -1 && (
                  <VisualizerPointer index={state.minIndex} containerId="prices-container" color="indigo" label={`Min (${state.minIndex})`} />
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

            {/* removed small complexity card to match TrappingRainWater layout; full-width complexity panel added below */}

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
        <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50 mt-6">
          <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
            <Clock size={20} />
            Complexity Analysis
          </h3>
          {algo === 'brute' ? (
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-300">Time Complexity: <span className="font-mono text-teal-300">O(n²)</span></h4>
                <p className="text-gray-400 mt-1">For each price, we try every later sell price to compute profit which leads to nested loops and quadratic time.</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-300">Space Complexity: <span className="font-mono text-teal-300">O(1)</span></h4>
                <p className="text-gray-400 mt-1">Only a few variables are used to track indices and profits; space does not scale with input.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-300">Time Complexity: <span className="font-mono text-teal-300">O(n)</span></h4>
                <p className="text-gray-400 mt-1">Track minimum price seen so far and update max profit in a single pass through the prices array.</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-300">Space Complexity: <span className="font-mono text-teal-300">O(1)</span></h4>
                <p className="text-gray-400 mt-1">Only a constant number of variables are used (minPrice, maxProfit, indices).</p>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-6 pb-6 text-gray-500 text-sm">Use arrow keys ← → to navigate through steps</footer>
      </div>
    </div>
  );
};

export default BestTimeToBuyAndSellStock;
