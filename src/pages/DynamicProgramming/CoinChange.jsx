import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Cpu,
  FileText,
  Terminal,
  CheckCircle,
  Clock,
  Coins,
} from "lucide-react";

const LANG_TABS = ["C++", "Python", "Java"];

const CODE_SNIPPETS = {
  "C++": [
    { l: 1, t: "#include <bits/stdc++.h>" },
    { l: 2, t: "using namespace std;" },
    { l: 4, t: "int coinChange(vector<int>& coins, int amount) {" },
    { l: 5, t: "    vector<int> dp(amount + 1, INT_MAX);" },
    { l: 6, t: "    dp[0] = 0;" },
    { l: 7, t: "    for (int i = 1; i <= amount; ++i) {" },
    { l: 8, t: "        for (int coin : coins) {" },
    { l: 9, t: "            if (i >= coin && dp[i - coin] != INT_MAX) {" },
    { l: 10, t: "                dp[i] = min(dp[i], dp[i - coin] + 1);" },
    { l: 11, t: "            }" },
    { l: 12, t: "        }" },
    { l: 13, t: "    }" },
    { l: 14, t: "    return dp[amount] == INT_MAX ? -1 : dp[amount];" },
    { l: 15, t: "}" },
  ],
  Python: [
    { l: 1, t: "def coinChange(coins, amount):" },
    { l: 2, t: "    dp = [float('inf')] * (amount + 1)" },
    { l: 3, t: "    dp[0] = 0" },
    { l: 4, t: "    for i in range(1, amount + 1):" },
    { l: 5, t: "        for coin in coins:" },
    { l: 6, t: "            if i >= coin and dp[i - coin] != float('inf'):" },
    { l: 7, t: "                dp[i] = min(dp[i], dp[i - coin] + 1)" },
    { l: 8, t: "    return -1 if dp[amount] == float('inf') else dp[amount]" },
  ],
  Java: [
    { l: 1, t: "public static int coinChange(int[] coins, int amount) {" },
    { l: 2, t: "    int[] dp = new int[amount + 1];" },
    { l: 3, t: "    Arrays.fill(dp, Integer.MAX_VALUE);" },
    { l: 4, t: "    dp[0] = 0;" },
    { l: 5, t: "    for (int i = 1; i <= amount; ++i) {" },
    { l: 6, t: "        for (int coin : coins) {" },
    { l: 7, t: "            if (i >= coin && dp[i - coin] != Integer.MAX_VALUE) {" },
    { l: 8, t: "                dp[i] = Math.min(dp[i], dp[i - coin] + 1);" },
    { l: 9, t: "            }" },
    { l: 10, t: "        }" },
    { l: 11, t: "    }" },
    { l: 12, t: "    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];" },
    { l: 13, t: "}" },
  ],
};

const CoinChangeVisualizer = () => {
  const [coinsInput, setCoinsInput] = useState("1,2,5");
  const [amountInput, setAmountInput] = useState("11");
  const [coins, setCoins] = useState([]);
  const [amount, setAmount] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const playRef = useRef(null);
  const [activeLang, setActiveLang] = useState("C++");
  const state = history[currentStep] || {};

  const generateHistory = useCallback((coinArr, amt) => {
    const dp = Array(amt + 1).fill(Infinity);
    const usedCoins = Array(amt + 1).fill(null).map(() => []);
    dp[0] = 0;
    
    const newHistory = [];
    const addState = (props) =>
      newHistory.push({
        dp: [...dp],
        usedCoins: usedCoins.map(arr => [...arr]),
        i: null,
        coin: null,
        line: null,
        decision: null,
        explanation: "",
        result: dp[amt] === Infinity ? -1 : dp[amt],
        ...props,
      });

    addState({ explanation: "Initialize dp array. dp[0] = 0, rest = ∞", line: 5 });

    for (let i = 1; i <= amt; i++) {
      addState({
        i,
        line: 7,
        decision: "amount",
        explanation: `Processing amount ${i}. Try each coin.`,
        result: dp[amt] === Infinity ? -1 : dp[amt],
      });

      for (let coin of coinArr) {
        addState({
          i,
          coin,
          line: 8,
          decision: "consider-coin",
          explanation: `Considering coin ${coin} for amount ${i}.`,
          result: dp[amt] === Infinity ? -1 : dp[amt],
        });

        if (i >= coin && dp[i - coin] !== Infinity) {
          const newVal = dp[i - coin] + 1;
          
          if (newVal < dp[i]) {
            dp[i] = newVal;
            usedCoins[i] = [...usedCoins[i - coin], coin];
            
            addState({
              i,
              coin,
              line: 10,
              decision: "update",
              explanation: `Using coin ${coin}: dp[${i}] = dp[${i - coin}] + 1 = ${dp[i]}. Coins: [${usedCoins[i].join(", ")}]`,
              result: dp[amt] === Infinity ? -1 : dp[amt],
            });
          } else {
            addState({
              i,
              coin,
              line: 10,
              decision: "skip",
              explanation: `Coin ${coin} doesn't improve dp[${i}] (current: ${dp[i] === Infinity ? "∞" : dp[i]}, new: ${newVal})`,
              result: dp[amt] === Infinity ? -1 : dp[amt],
            });
          }
        } else {
          addState({
            i,
            coin,
            line: 9,
            decision: "invalid",
            explanation: `Coin ${coin} ${i < coin ? "too large" : "has no valid path"} for amount ${i}.`,
            result: dp[amt] === Infinity ? -1 : dp[amt],
          });
        }
      }
    }

    addState({
      i: amt,
      line: 14,
      decision: "done",
      explanation: `DP complete. Minimum coins needed: ${dp[amt] === Infinity ? "impossible (-1)" : dp[amt]}`,
      result: dp[amt] === Infinity ? -1 : dp[amt],
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const load = () => {
    const coinArr = coinsInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    const amt = parseInt(amountInput, 10);

    if (coinArr.length === 0 || isNaN(amt) || amt < 0) {
      return alert("Invalid input. Ensure coins are positive integers and amount is non-negative.");
    }

    setCoins(coinArr);
    setAmount(amt);
    setIsLoaded(true);
    generateHistory(coinArr, amt);
  };

  const resetAll = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setPlaying(false);
    clearInterval(playRef.current);
  };

  const stepForward = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, history.length - 1));
  }, [history.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoaded, stepForward, stepBackward]);

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

  const dpBarClass = (idx) => {
    if (!state.dp) return "bg-gray-700";
    if (idx === state.i) return "bg-blue-500/80 shadow-lg";
    if (idx < (state.i || 0)) return "bg-green-700/60";
    return "bg-gray-700";
  };

  const coinClass = (coin) => {
    return `w-16 h-16 flex items-center justify-center rounded-full font-mono font-bold text-white ${
      state.coin === coin ? "bg-amber-500 ring-2 ring-amber-300 shadow-lg" : "bg-gradient-to-br from-yellow-600 to-yellow-700"
    }`;
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto relative">
      <div className="absolute top-8 right-12 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
          Coin Change Problem
        </h1>
        <p className="text-gray-300 mt-2 text-lg">Minimum coins needed to make amount</p>
      </header>

      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={coinsInput}
            onChange={(e) => setCoinsInput(e.target.value)}
            disabled={isLoaded}
            className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400"
            placeholder="Coins (comma-separated)"
          />
          <input
            type="text"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            disabled={isLoaded}
            className="w-36 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400"
            placeholder="Amount"
          />

          {!isLoaded ? (
            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 transition text-white font-bold shadow-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-amber-600 disabled:opacity-40 transition"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-amber-600 transition"
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="px-3 py-2 rounded-full bg-gray-800 hover:bg-amber-600 disabled:opacity-40 transition"
                >
                  <ArrowRight />
                </button>
              </div>

              <div className="px-4 py-2 font-mono text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200">
                {Math.max(0, currentStep + 1)}/{history.length}
              </div>

              <div className="flex items-center gap-2">
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
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </section>

      <section className="mb-4 z-10">
        <div className="flex items-center gap-2">
          {LANG_TABS.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                activeLang === lang
                  ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400"
                  : "bg-gray-800/40 text-gray-300 hover:bg-gray-800/60"
              }`}
            >
              {lang}
            </button>
          ))}
          <div className="ml-auto text-sm text-gray-400 flex items-center gap-2">
            <Cpu size={16} /> <span>Approach: Iterative DP</span>
          </div>
        </div>
      </section>

      {!isLoaded ? (
        <div className="mt-10 text-center text-gray-400 italic">
          Enter coins and amount, then click <span className="text-amber-400 font-semibold">Load & Visualize</span>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <aside className="lg:col-span-1 p-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-300 flex items-center gap-2 font-semibold">
                <FileText size={18} /> Code
              </h3>
              <div className="text-sm text-gray-400">{activeLang}</div>
            </div>
            <div className="bg-[#0b1020] rounded-lg border border-gray-700/80 max-h-[640px] overflow-auto p-3">
              {CODE_SNIPPETS[activeLang].map((line) => (
                <div
                  key={line.l}
                  className={`flex font-mono text-sm ${state.line === line.l ? "bg-green-500/10" : ""}`}
                >
                  <div className="w-10 text-right text-gray-500 pr-3">{line.l}</div>
                  <pre className="flex-1 text-gray-200">{line.t}</pre>
                </div>
              ))}
            </div>
          </aside>

          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <Coins size={16} /> Available Coins
              </h4>
              <div className="flex gap-3 flex-wrap">
                {coins.map((coin, idx) => (
                  <div key={idx} className={coinClass(coin)}>
                    {coin}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-400">
                Target Amount: <span className="text-white font-bold">{amount}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                <Terminal size={14} /> DP Array (min coins for each amount)
              </h4>
              <div className="overflow-auto">
                <div className="flex gap-1 flex-wrap">
                  {state.dp &&
                    state.dp.map((val, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${dpBarClass(i)} border border-gray-800 transition-all`}
                      >
                        <div className="text-xs text-gray-400">{i}</div>
                        <div className="text-sm font-mono text-white font-bold">
                          {val === Infinity ? "∞" : val}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <FileText size={14} /> Explanation
                </h4>
                <p className="text-gray-200">{state.explanation}</p>
                <div className="mt-3 text-sm text-gray-400">
                  <div><strong>Decision:</strong> <span className="text-gray-200">{state.decision || "-"}</span></div>
                  <div className="mt-1"><strong>Processing:</strong> <span className="text-gray-200">
                    {state.i !== null ? `Amount ${state.i}` : "-"}
                    {state.coin !== null ? ` with coin ${state.coin}` : ""}
                  </span></div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
                <h4 className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Result
                </h4>
                <div className="text-3xl font-mono text-green-400">{state.result ?? 0}</div>
                <div className="mt-2 text-xs text-gray-400">
                  {state.result === -1 ? "Impossible" : `Minimum coins: ${state.result}`}
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-300 mb-1">Coins Used:</div>
                  <div className="flex gap-1 flex-wrap">
                    {state.i !== null && state.usedCoins && state.usedCoins[state.i] && state.usedCoins[state.i].length > 0 ? (
                      state.usedCoins[state.i].map((c, idx) => (
                        <div key={idx} className="bg-amber-600/80 text-white px-2 py-1 rounded-md font-mono text-xs">
                          {c}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic text-xs">None yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/60">
              <h4 className="text-green-300 font-semibold flex items-center gap-2">
                <Clock size={16} /> Complexity
              </h4>
              <div className="mt-3 text-sm text-gray-300 space-y-2">
                <div><strong>Time:</strong> <span className="font-mono text-teal-300">O(Amount × Coins)</span></div>
                <div><strong>Space:</strong> <span className="font-mono text-teal-300">O(Amount)</span></div>
                <div className="text-xs text-gray-400 mt-2">
                  We iterate through each amount from 1 to target, and for each amount we try all coins.
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default CoinChangeVisualizer;