import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Hash } from "lucide-react";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const NumberOf1Bits = () => {
  const defaultNumber = 11; // Binary: 1011

  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber);

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

  // Generate history for counting 1 bits
  const generateCountHistory = useCallback((num) => {
    const hist = [];
    let n = num >>> 0; // Convert to 32-bit unsigned integer
    const binaryStr = n.toString(2).padStart(32, '0');
    
    hist.push({
      number: n,
      binary: binaryStr,
      count: 0,
      currentBit: null,
      message: `Counting 1 bits in ${num} (binary: ${binaryStr})`,
      phase: "init"
    });

    let count = 0;
    let tempN = n;
    let bitIndex = 31;

    while (tempN !== 0) {
      const bit = tempN & 1;
      
      hist.push({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitIndex,
        bit,
        tempN,
        message: `Checking bit at position ${bitIndex}: ${bit}`,
        phase: "checking"
      });

      if (bit === 1) {
        count++;
        hist.push({
          number: n,
          binary: binaryStr,
          count,
          currentBit: bitIndex,
          bit,
          tempN,
          message: `Found 1 bit! Count is now ${count}`,
          phase: "found"
        });
      }

      tempN = tempN >>> 1; // Right shift
      bitIndex--;

      hist.push({
        number: n,
        binary: binaryStr,
        count,
        currentBit: null,
        tempN,
        message: `Right shift: remaining bits to check`,
        phase: "shift"
      });
    }

    hist.push({
      number: n,
      binary: binaryStr,
      count,
      currentBit: null,
      message: `Total number of 1 bits: ${count}`,
      phase: "complete"
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateCountHistory(number);
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNumberChange = (e) => {
    setInputNumber(e.target.value);
  };

  const handleApply = () => {
    const newNumber = parseInt(inputNumber, 10);
    if (!isNaN(newNumber) && newNumber >= 0) {
      setNumber(newNumber);
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
  const { binary = "", count = 0, currentBit = null, message = "", phase = "init" } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 text-white p-8">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Bit Manipulation
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
            <Hash className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Number of 1 Bits</h1>
            <p className="text-cyan-200 mt-1">LeetCode #191 - Easy</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Write a function that takes the binary representation of a positive integer and returns the number of <strong>set bits</strong> it has 
          (also known as the <strong>Hamming weight</strong>).
        </p>
      </header>

      {/* Input Controls */}
      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Input Configuration</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number:
            </label>
            <input
              type="number"
              value={inputNumber}
              onChange={handleNumberChange}
              min="0"
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="e.g., 11"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
            >
              Apply
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/30"
            >
              <Play className="h-4 w-4" />
              Start Visualization
            </button>
          </div>
        </section>
      )}

      {/* Visualization Controls */}
      {mode === "visualizing" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={goToNextStep}
                disabled={currentStep >= history.length - 1}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <RotateCw className="h-5 w-5" />
                Reset
              </button>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Step</div>
              <div className="text-2xl font-bold text-cyan-300">
                {currentStep + 1} / {history.length}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
              <select
                value={animSpeed}
                onChange={(e) => setAnimSpeed(Number(e.target.value))}
                className="px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white"
              >
                <option value={1500}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Message Display */}
      {mode === "visualizing" && message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          phase === "complete" 
            ? "bg-green-900/30 border-green-500 text-green-200"
            : "bg-cyan-900/30 border-cyan-500 text-cyan-200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {/* Binary Visualization */}
      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="flex flex-col items-center gap-6">
            {/* Binary representation */}
            <div className="flex gap-1 flex-wrap justify-center">
              {binary.split('').map((bit, index) => {
                const isCurrentBit = currentBit === (31 - index);
                const isSetBit = bit === '1';

                return (
                  <div
                    key={index}
                    className={`w-10 h-12 flex items-center justify-center rounded-lg font-mono text-lg font-bold transition-all duration-300 ${
                      isCurrentBit && isSetBit
                        ? "bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/50 scale-110"
                        : isCurrentBit
                        ? "bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/50 scale-105"
                        : isSetBit
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>

            {/* Bit positions */}
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: 32 }, (_, i) => 31 - i).map((pos) => (
                <div
                  key={pos}
                  className="w-10 text-center text-xs text-gray-500 font-mono"
                >
                  {pos}
                </div>
              ))}
            </div>

            {/* Count display */}
            <div className="mt-8 p-6 bg-cyan-900/30 rounded-xl border-2 border-cyan-500">
              <div className="text-center">
                <div className="text-sm text-cyan-300 mb-2">1 Bits Count</div>
                <div className="text-5xl font-black text-cyan-200">{count}</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-500 to-cyan-700"></div>
              <span className="text-sm text-gray-300">Current Bit (0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-green-700"></div>
              <span className="text-sm text-gray-300">Current Bit (1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-sm text-gray-300">Set Bit (1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-700"></div>
              <span className="text-sm text-gray-300">Unset Bit (0)</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default NumberOf1Bits;
