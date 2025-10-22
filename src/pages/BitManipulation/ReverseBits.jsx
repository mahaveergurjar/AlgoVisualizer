import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, FlipHorizontal } from "lucide-react";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const ReverseBits = () => {
  const defaultNumber = 43261596; // Binary: 00000010100101000001111010011100

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

  const generateReverseHistory = useCallback((num) => {
    const hist = [];
    const n = num >>> 0;
    const originalBinary = n.toString(2).padStart(32, '0');
    
    hist.push({
      original: n,
      originalBinary,
      result: 0,
      resultBinary: '0'.repeat(32),
      currentBit: null,
      message: `Reversing bits of ${num}`,
      phase: "init"
    });

    let result = 0;
    let tempN = n;

    for (let i = 0; i < 32; i++) {
      const bit = tempN & 1;
      
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Reading bit ${i} from right: ${bit}`,
        phase: "reading"
      });

      result = (result << 1) | bit;
      
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Shifted result left and added bit ${bit}`,
        phase: "shifting"
      });

      tempN >>>= 1;
    }

    hist.push({
      original: n,
      originalBinary,
      result,
      resultBinary: result.toString(2).padStart(32, '0'),
      currentBit: null,
      message: `Reversed: ${result} (binary: ${result.toString(2).padStart(32, '0')})`,
      phase: "complete"
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateReverseHistory(number);
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
  const { originalBinary = "", resultBinary = "", currentBit = null, message = "", phase = "init", result = 0 } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white p-8">
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-indigo-300 hover:text-indigo-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Bit Manipulation
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg">
            <FlipHorizontal className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Reverse Bits</h1>
            <p className="text-indigo-200 mt-1">LeetCode #190 - Easy</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Reverse the bits of a given 32-bit unsigned integer. For example, the 32-bit integer{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">43261596</code> (represented in binary as{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">00000010100101000001111010011100</code>) should return{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">964176192</code> (represented in binary as{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">00111001011110000010100101000000</code>).
        </p>
      </header>

      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-indigo-300">Input Configuration</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Number:</label>
            <input
              type="number"
              value={inputNumber}
              onChange={handleNumberChange}
              min="0"
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 43261596"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleApply} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors">
              Apply
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/30"
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
                className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg transition-all shadow-lg"
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
              <div className="text-2xl font-bold text-indigo-300">{currentStep + 1} / {history.length}</div>
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
        <div className={`mb-6 p-4 rounded-xl border ${phase === "complete" ? "bg-green-900/30 border-green-500 text-green-200" : "bg-indigo-900/30 border-indigo-500 text-indigo-200"}`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Original</h3>
              <div className="flex gap-1 flex-wrap justify-center">
                {originalBinary.split('').map((bit, index) => {
                  const isCurrentBit = currentBit !== null && index === (31 - currentBit);
                  return (
                    <div
                      key={index}
                      className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                        isCurrentBit ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg scale-110" : bit === '1' ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {bit}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <FlipHorizontal className="h-8 w-8 text-indigo-400" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-violet-300 mb-3">Result</h3>
              <div className="flex gap-1 flex-wrap justify-center">
                {resultBinary.split('').map((bit, index) => (
                  <div
                    key={index}
                    className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                      bit === '1' ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
            </div>

            {phase === "complete" && (
              <div className="mt-8 p-6 bg-green-900/30 rounded-xl border-2 border-green-500">
                <div className="text-center">
                  <div className="text-sm text-green-300 mb-2">Reversed Value</div>
                  <div className="text-4xl font-black text-green-200">{result}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ReverseBits;
