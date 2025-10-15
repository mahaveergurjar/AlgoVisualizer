import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Binary } from "lucide-react";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const CountingBits = () => {
  const defaultN = 5;

  const [n, setN] = useState(defaultN);
  const [inputN, setInputN] = useState(defaultN);

  const [animSpeed, setAnimSpeed] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    mode,
    history,
    currentStep,
    setMode,
    setHistory,
    setCurrentStep,
    goToPrevStep,
    goToNextStep,
  } = useModeHistorySwitch();

  const countBits = (num) => {
    let count = 0;
    while (num) {
      count += num & 1;
      num >>>= 1;
    }
    return count;
  };

  const generateCountingHistory = useCallback((maxN) => {
    const hist = [];
    const results = [];

    hist.push({
      currentNum: null,
      results: [],
      message: `Counting bits for all numbers from 0 to ${maxN}`,
      phase: "init"
    });

    for (let i = 0; i <= maxN; i++) {
      const binary = i.toString(2);
      const bitCount = countBits(i);
      
      hist.push({
        currentNum: i,
        binary,
        bitCount,
        results: [...results],
        message: `Number ${i} (binary: ${binary}) has ${bitCount} set bits`,
        phase: "counting"
      });

      results.push({ num: i, binary, count: bitCount });
    }

    hist.push({
      currentNum: null,
      results: [...results],
      message: `Completed! Generated array: [${results.map(r => r.count).join(', ')}]`,
      phase: "complete"
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateCountingHistory(n);
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNChange = (e) => {
    setInputN(e.target.value);
  };

  const handleApply = () => {
    const newN = parseInt(inputN, 10);
    if (!isNaN(newN) && newN >= 0 && newN <= 20) {
      setN(newN);
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying && mode === "visualizing") {
      interval = setInterval(() => {
        if (currentStep < history.length - 1) {
          goToNextStep();
        } else {
          setIsPlaying(false);
        }
      }, animSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, history.length, animSpeed, mode, goToNextStep]);

  const step = history[currentStep] || {};
  const { currentNum = null, results = [], message = "", phase = "init", binary = "", bitCount = 0 } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Bit Manipulation
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Binary className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Counting Bits</h1>
            <p className="text-purple-200 mt-1">LeetCode #338 - Easy</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Given an integer <code className="px-2 py-1 bg-gray-800 rounded">n</code>, return an array{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">ans</code> of length <code className="px-2 py-1 bg-gray-800 rounded">n + 1</code>{" "}
          such that for each <code className="px-2 py-1 bg-gray-800 rounded">i</code> (0 ≤ i ≤ n),{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">ans[i]</code> is the number of <strong>1's</strong> in the binary representation of <code className="px-2 py-1 bg-gray-800 rounded">i</code>.
        </p>
      </header>

      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Input Configuration</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              N (max 20 for visualization):
            </label>
            <input
              type="number"
              value={inputN}
              onChange={handleNChange}
              min="0"
              max="20"
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 5"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleApply} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
              Apply
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 rounded-lg font-semibold transition-all shadow-lg shadow-purple-500/30"
            >
              <Play className="h-4 w-4" />
              Start Visualization
            </button>
          </div>
        </section>
      )}

      {mode === "visualizing" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={goToPrevStep} disabled={currentStep === 0} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipBack className="h-5 w-5" />
              </button>
              <button onClick={goToNextStep} disabled={currentStep >= history.length - 1} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipForward className="h-5 w-5" />
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <RotateCw className="h-5 w-5" />
                Reset
              </button>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Step</div>
              <div className="text-2xl font-bold text-purple-300">{currentStep + 1} / {history.length}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
              <select value={animSpeed} onChange={(e) => setAnimSpeed(Number(e.target.value))} className="px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white">
                <option value={1500}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {mode === "visualizing" && message && (
        <div className={`mb-6 p-4 rounded-xl border ${phase === "complete" ? "bg-green-900/30 border-green-500 text-green-200" : "bg-purple-900/30 border-purple-500 text-purple-200"}`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          {currentNum !== null && (
            <div className="mb-6 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
              <div className="text-center">
                <div className="text-sm text-purple-300 mb-2">Current Number</div>
                <div className="text-3xl font-bold text-white mb-2">{currentNum}</div>
                <div className="text-lg font-mono text-purple-200">Binary: {binary}</div>
                <div className="text-lg text-purple-300 mt-2">Bit Count: {bitCount}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((result) => (
              <div
                key={result.num}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  result.num === currentNum
                    ? "bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400 scale-105 shadow-lg shadow-purple-500/50"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{result.num}</div>
                  <div className="text-xs font-mono text-gray-400 mb-2">{result.binary}</div>
                  <div className="text-sm text-gray-300">→ {result.count}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CountingBits;
