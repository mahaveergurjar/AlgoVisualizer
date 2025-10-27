import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Zap,
  List,
  Calculator,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Cpu,
  FileText,
  Terminal,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <vector>" },
    { l: 2, t: "#include <algorithm>" },
    { l: 3, t: "#include <climits>" },
    { l: 4, t: "using namespace std;" },
    { l: 5, t: "" },
    { l: 6, t: "class Solution {" },
    { l: 7, t: "public:" },
    { l: 8, t: "    int maxProfit(int k, vector<int>& prices) {" },
    { l: 9, t: "        int n = prices.size();" },
    { l: 10, t: "        if (n <= 1) return 0;" },
    { l: 11, t: "" },
    { l: 12, t: "        if (k >= n / 2) {" },
    { l: 13, t: "            int maxP = 0;" },
    { l: 14, t: "            for (int i = 1; i < n; i++) {" },
    { l: 15, t: "                if (prices[i] > prices[i-1]) {" },
    { l: 16, t: "                    maxP += prices[i] - prices[i-1];" },
    { l: 17, t: "                }" },
    { l: 18, t: "            }" },
    { l: 19, t: "            return maxP;" },
    { l: 20, t: "        }" },
    { l: 21, t: "" },
    { l: 22, t: "        vector<int> buy(k + 1, INT_MIN);" },
    { l: 23, t: "        vector<int> sell(k + 1, 0);" },
    { l: 24, t: "" },
    { l: 25, t: "        for (int price : prices) {" },
    { l: 26, t: "            for (int j = 1; j <= k; j++) {" },
    { l: 27, t: "                buy[j] = max(buy[j], sell[j-1] - price);" },
    { l: 28, t: "                sell[j] = max(sell[j], buy[j] + price);" },
    { l: 29, t: "            }" },
    { l: 30, t: "        }" },
    { l: 31, t: "        return sell[k];" },
    { l: 32, t: "    }" },
    { l: 33, t: "};" },
  ],
  Python: [
    { l: 1, t: "class Solution:" },
    { l: 2, t: "    def maxProfit(self, k: int, prices: list[int]) -> int:" },
    { l: 3, t: "        n = len(prices)" },
    { l: 4, t: "        if n <= 1:" },
    { l: 5, t: "            return 0" },
    { l: 6, t: "" },
    { l: 7, t: "        if k >= n // 2:" },
    { l: 8, t: "            max_p = 0" },
    { l: 9, t: "            for i in range(1, n):" },
    { l: 10, t: "                if prices[i] > prices[i-1]:" },
    { l: 11, t: "                    max_p += prices[i] - prices[i-1]" },
    { l: 12, t: "            return max_p" },
    { l: 13, t: "        " },
    { l: 14, t: "        buy = [float('-inf')] * (k + 1)" },
    { l: 15, t: "        sell = [0] * (k + 1)" },
    { l: 16, t: "" },
    { l: 17, t: "        for price in prices:" },
    { l: 18, t: "            for j in range(1, k + 1):" },
    { l: 19, t: "                buy[j] = max(buy[j], sell[j-1] - price)" },
    { l: 20, t: "                sell[j] = max(sell[j], buy[j] + price)" },
    { l: 21, t: "        " },
    { l: 22, t: "        return sell[k]" },
  ],
  Java: [
    { l: 1, t: "import java.util.Arrays;" },
    { l: 2, t: "" },
    { l: 3, t: "class Solution {" },
    { l: 4, t: "    public int maxProfit(int k, int[] prices) {" },
    { l: 5, t: "        int n = prices.length;" },
    { l: 6, t: "        if (n <= 1) return 0;" },
    { l: 7, t: "" },
    { l: 8, t: "        if (k >= n / 2) {" },
    { l: 9, t: "            int maxP = 0;" },
    { l: 10, t: "            for (int i = 1; i < n; i++) {" },
    { l: 11, t: "                if (prices[i] > prices[i-1]) {" },
    { l: 12, t: "                    maxP += prices[i] - prices[i-1];" },
    { l: 13, t: "                }" },
    { l: 14, t: "            }" },
    { l: 15, t: "            return maxP;" },
    { l: 16, t: "        }" },
    { l: 17, t: "" },
    { l: 18, t: "        int[] buy = new int[k + 1];" },
    { l: 19, t: "        int[] sell = new int[k + 1];" },
    { l: 20, t: "        Arrays.fill(buy, Integer.MIN_VALUE);" },
    { l: 21, t: "" },
    { l: 22, t: "        for (int price : prices) {" },
    { l: 23, t: "            for (int j = 1; j <= k; j++) {" },
    { l: 24, t: "                buy[j] = Math.max(buy[j], sell[j-1] - price);" },
    { l: 25, t: "                sell[j] = Math.max(sell[j], buy[j] + price);" },
    { l: 26, t: "            }" },
    { l: 27, t: "        }" },
    { l: 28, t: "        return sell[k];" },
    { l: 29, t: "    }" },
    { l: 30, t: "}" },
  ],
};

// Map code lines to C++ snippet
const LINE_MAP = {
  OPTIMIZE_START: 12,
  OPTIMIZE_LOOP: 14,
  OPTIMIZE_CALC: 16,
  OPTIMIZE_END: 19,
  INIT_BUY: 22,
  INIT_SELL: 23,
  PRICE_LOOP: 25,
  TRANS_LOOP: 26,
  CALC_BUY: 27,
  CALC_SELL: 28,
  RETURN: 31,
}


const SellStockIVVisualizer = () => {
  const [pricesInput, setPricesInput] = useState("3,2,6,5,0,3");
  const [kInput, setKInput] = useState("2");

  const [prices, setPrices] = useState([]);
  const [k, setK] = useState(0);

  // history: each state contains buy/sell snapshots, priceIdx, transIdx, line, explanation, bestValue
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  // UI controls
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const playRef = useRef(null);

  // code tab
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  // ----------------- GENERATE HISTORY -----------------
  const generateHistory = useCallback((pricesArr, kVal) => {
    const n = pricesArr.length;
    const k = kVal;
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        buy: [],
        sell: [],
        priceIdx: null,
        transIdx: null,
        line: null,
        decision: null,
        bestValue: 0,
        explanation: "",
        ...props,
      });

    // --- Optimization Path ---
    if (k >= n / 2) {
      addState({
        line: LINE_MAP.OPTIMIZE_START,
        explanation: `k (${k}) >= n/2 (${n / 2}). Switching to greedy algorithm (Stock II).`,
      });
      let maxP = 0;
      for (let i = 1; i < n; i++) {
        addState({
          priceIdx: i,
          line: LINE_MAP.OPTIMIZE_LOOP,
          bestValue: maxP,
          explanation: `Checking if prices[${i}] (${pricesArr[i]}) > prices[${i - 1}] (${pricesArr[i - 1]}).`,
        });
        if (pricesArr[i] > pricesArr[i - 1]) {
          const profit = pricesArr[i] - pricesArr[i - 1];
          maxP += profit;
          addState({
            priceIdx: i,
            line: LINE_MAP.OPTIMIZE_CALC,
            decision: "buy-sell",
            bestValue: maxP,
            explanation: `Profit found! Add ${profit}. Total profit = ${maxP}.`,
          });
        }
      }
      addState({
        line: LINE_MAP.OPTIMIZE_END,
        bestValue: maxP,
        decision: "done",
        explanation: `Greedy algorithm complete. Final profit: ${maxP}.`,
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    // --- DP Path ---
    let buy = Array(k + 1).fill(-Infinity);
    let sell = Array(k + 1).fill(0);
    // JS representation of INT_MIN for correct 'buy[0]'
    buy[0] = -Infinity; 

    addState({
      buy: [...buy],
      sell: [...sell],
      line: LINE_MAP.INIT_BUY,
      explanation: "Initialize 'sell' array to 0s.",
    });
     addState({
      buy: [...buy],
      sell: [...sell],
      line: LINE_MAP.INIT_SELL,
      explanation: "Initialize 'buy' array to -Infinity (cannot hold stock with 0 transactions).",
    });


    for (let i = 0; i < n; i++) {
      const price = pricesArr[i];
      addState({
        buy: [...buy],
        sell: [...sell],
        priceIdx: i,
        line: LINE_MAP.PRICE_LOOP,
        explanation: `Processing Day ${i} (price = ${price}).`,
      });

      for (let j = 1; j <= k; j++) {
        const oldBuy = buy[j];
        const oldSell = sell[j];

        // Calculate buy
        const buyDecision = sell[j - 1] - price;
        buy[j] = Math.max(oldBuy, buyDecision);
        addState({
          buy: [...buy],
          sell: [...sell],
          priceIdx: i,
          transIdx: j,
          line: LINE_MAP.CALC_BUY,
          decision: `buy[${j}] = max(hold, buy)`,
          explanation: `buy[${j}] = max(${oldBuy}, ${sell[j - 1]} - ${price}) = ${buy[j]}`,
          bestValue: sell[k],
        });

        // Calculate sell
        const sellDecision = buy[j] + price;
        sell[j] = Math.max(oldSell, sellDecision);
        addState({
          buy: [...buy],
          sell: [...sell],
          priceIdx: i,
          transIdx: j,
          line: LINE_MAP.CALC_SELL,
          decision: `sell[${j}] = max(rest, sell)`,
          explanation: `sell[${j}] = max(${oldSell}, ${buy[j]} + ${price}) = ${sell[j]}`,
          bestValue: sell[k],
        });
      }
    }

    addState({
      buy: [...buy],
      sell: [...sell],
      line: LINE_MAP.RETURN,
      decision: "done",
      explanation: `All prices processed. Final max profit is sell[${k}] = ${sell[k]}.`,
      bestValue: sell[k],
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  // ----------------- LOAD / VALIDATE -----------------
  const load = () => {
    const pricesArr = pricesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const kVal = parseInt(kInput, 10);

    if (pricesArr.some(isNaN) || pricesArr.length === 0 || isNaN(kVal)) {
      return alert("Invalid input. Ensure prices are comma-separated numbers and k is a single number.");
    }
    
    if (kVal < 1) {
       return alert("k must be at least 1.");
    }

    setPrices(pricesArr);
    setK(kVal);
    setIsLoaded(true);
    generateHistory(pricesArr, kVal);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  // ----------------- STEP CONTROLS -----------------
  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

  // play/pause with speed
  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (playing) {
      if (currentStep >= history.length - 1) {
        setPlaying(false);
        return;
      }
      playRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= history.length - 1) {
            clearInterval(playRef.current);
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, history.length, currentStep]);

  // update playing state when reaching end
  useEffect(() => {
    if (currentStep >= history.length - 1) {
      setPlaying(false);
      clearInterval(playRef.current);
    }
  }, [currentStep, history.length]);


  // ----------------- RENDER HELPERS -----------------
  const formattedStep = () => {
    if (!isLoaded) return "0/0";
    return `${Math.max(0, currentStep + 1)}/${history.length}`;
  };

  const renderCodeLine = (lang, lineObj) => {
    const text = lineObj.t;
    const ln = lineObj.l;
    const active = state.line === ln;

    return (
      <div
        key={ln}
        className={`relative flex font-mono text-sm ${active ? "bg-green-500/10" : ""}`}
      >
        <div className="flex-none w-10 text-right text-gray-500 select-none pr-3">
          {ln}
        </div>
        <pre className="flex-1 m-0 p-0 text-gray-200 whitespace-pre">{text}</pre>
      </div>
    );
  };

  // color mapping for DP array cells
  const arrayCellClass = (j) => {
    if (j === state.transIdx) return "bg-blue-500/80 shadow-lg scale-110";
    return "bg-gray-700";
  };
  
  const formatValue = (val) => {
      if (val === -Infinity || val < -1e9) return "-∞";
      return val;
  }

  // Item card classes (day)
  const itemClass = (idx) => {
    const active = state.priceIdx === idx;
    return `relative w-20 h-20 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all ${active
      ? "bg-amber-500/80 shadow-[0_8px_30px_rgba(250,204,21,0.18)] ring-2 ring-amber-400 scale-110"
      : "bg-gradient-to-br from-slate-700 to-slate-600 shadow-md"
      }`;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-rose-500/8 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-500/6 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400">
          Best Time to Buy/Sell Stock IV
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
          Visualize the DP (at most k transactions).
        </p>
      </header>

      {/* INPUT CONTROLS ROW */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={pricesInput}
            onChange={(e) => setPricesInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="prices (comma-separated)"
          />
          <input
            type="text"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
            disabled={isLoaded}
            className="w-48 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400 shadow-sm"
            placeholder="k (transactions)"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 transition text-white font-bold shadow-lg cursor-pointer"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowLeft />
                </button>

                <button
                  onClick={togglePlay}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 transition shadow"
                >
                  {playing ? <Pause /> : <Play />}
                </button>

                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition shadow"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 shadow inner">
                {formattedStep()}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <label className="text-sm text-gray-300">Speed</label>
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={50}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  className="w-36"
                />
              </div>

              <button
                onClick={resetAll}
                className="ml-3 px-4 py-2 rounded-xl bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold shadow"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      {/* ALGORITHM TABS */}
      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer text-sm ${activeLang === lang
                  ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
                }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Iterative DP (Space Optimized)</span>
          </div>
        </div>
      </section>

      {/* MAIN GRID: left (code) / right (visualization) */}
      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter prices and k, then click
          <span className="text-rose-400 font-semibold"> Load & Visualize</span> to begin.
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* LEFT PANEL: CODE SECTION */}
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">Language: {activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) => renderCodeLine(activeLang, line))}
            </div>

            <div className="mt-4 text-xs text-gray-400 space-y-2">
              <div>Current active line highlighted in green.</div>
              <div>Tip: Use &lt or &gt keys to navigate, Space to play/pause.</div>
            </div>
          </aside>


          {/* RIGHT PANEL: VISUALIZATION SECTION */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-inner flex flex-col gap-6">
              {/* Days / Prices */}
              <div>
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <List size={16} /> Days (Prices)
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {prices.map((p, idx) => (
                    <div key={idx} className={itemClass(idx)}>
                      {state.priceIdx === idx && <VisualizerPointer className="absolute -top-4" />}
                      <div className="text-xs text-gray-100">Day {idx}</div>
                      <div className="text-sm">${p}</div>
                    </div>
                  ))}
                  {prices.length === 0 && <div className="text-gray-500 italic">No prices loaded</div>}
                </div>
              </div>

              {/* DATA STRUCTURE DISPLAY */}
              <div>
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Terminal size={14} /> Data Structures (Transactions 0 to {k})
                </h4>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 space-y-4">
                  {/* Buy Array */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Buy Array (Max profit holding stock)</div>
                    <div className="flex gap-2 flex-wrap">
                      {(state.buy || []).map((val, j) => (
                         <div key={j} className={`p-2 rounded-lg text-center transition-all duration-300 ${arrayCellClass(j)}`}>
                            <div className="text-xs text-gray-300 border-b border-gray-500 px-2">j = {j}</div>
                            <div className="font-mono text-white text-sm pt-1 px-2">{formatValue(val)}</div>
                         </div>
                      ))}
                    </div>
                  </div>
                   {/* Sell Array */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Sell Array (Max profit not holding)</div>
                     <div className="flex gap-2 flex-wrap">
                      {(state.sell || []).map((val, j) => (
                         <div key={j} className={`p-2 rounded-lg text-center transition-all duration-300 ${arrayCellClass(j)}`}>
                            <div className="text-xs text-gray-300 border-b border-gray-500 px-2">j = {j}</div>
                            <div className="font-mono text-white text-sm pt-1 px-2">{formatValue(val)}</div>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* explanation*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><FileText size={14} /> Explanation</h4>
                <p className="text-gray-200">{state.explanation || "Load inputs to begin."}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div><strong>Decision:</strong> <span className="text-gray-200">{state.decision || "-"}</span></div>
                  <div><strong>Active line:</strong> <span className="text-gray-200">{state.line ?? "-"}</span></div>
                   <div className="col-span-2 mt-2"><strong>buy[j]:</strong> <span className="text-gray-200 font-mono text-xs">max(buy[j], sell[j-1] - price)</span></div>
                   <div className="col-span-2"><strong>sell[j]:</strong> <span className="text-gray-200 font-mono text-xs">max(sell[j], buy[j] + price)</span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-lg">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2"><CheckCircle size={14} /> Output</h4>
                <div className="text-3xl font-mono text-green-400">{state.bestValue ?? 0}</div>
                <div className="mt-2 text-xs text-gray-400">Max profit for {k} transactions.</div>
              </div>
            </div>

            {/* complexixty */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-green-300 font-semibold flex items-center gap-2"><Clock size={16} /> Complexity & Notes</h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(N * K)</span> — We loop N days, and for each day, K transactions.</div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(K)</span> — We only need two arrays of size k+1.</div>
                <div><strong>Optimization:</strong> If k &gt;= N/2, it becomes Stock II, solvable in O(N) time.</div>
              </div>
            </div>
          </section>
        </main>
      )}

      <style>{`
        .animate-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        .animate-float { animation: float 18s ease-in-out infinite; }
        .animate-float-delayed { animation: float 20s ease-in-out 8s infinite; }
        @keyframes float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
       `}</style>
    </div>
  );
};

export default SellStockIVVisualizer;