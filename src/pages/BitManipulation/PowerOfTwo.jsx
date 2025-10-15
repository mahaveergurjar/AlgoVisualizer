import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Zap } from "lucide-react";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const PowerOfTwo = () => {
  const defaultNumber = 16;

  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber);

  const [animSpeed, setAnimSpeed] = useState(1500);
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

  const generatePowerOfTwoHistory = useCallback((num) => {
    const hist = [];
    const binary = num > 0 ? num.toString(2).padStart(Math.ceil(num.toString(2).length / 8) * 8, '0') : '0';
    
    hist.push({
      number: num,
      binary,
      message: `Checking if ${num} is a power of 2`,
      phase: "init",
      result: null
    });

    if (num <= 0) {
      hist.push({
        number: num,
        binary,
        message: `${num} is not positive, so it cannot be a power of 2`,
        phase: "negative",
        result: false
      });
      return hist;
    }

    hist.push({
      number: num,
      binary,
      message: `Binary representation: ${binary}`,
      phase: "show-binary",
      result: null
    });

    const nMinus1 = num - 1;
    const nMinus1Binary = nMinus1.toString(2).padStart(binary.length, '0');

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      message: `n - 1 = ${num} - 1 = ${nMinus1}`,
      phase: "subtract",
      result: null
    });

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      message: `Binary of (n-1): ${nMinus1Binary}`,
      phase: "show-n-minus-1",
      result: null
    });

    const andResult = num & nMinus1;
    const andBinary = andResult.toString(2).padStart(binary.length, '0');

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      andResult,
      andBinary,
      message: `n & (n-1) = ${num} & ${nMinus1} = ${andResult}`,
      phase: "and-operation",
      result: null
    });

    const isPowerOfTwo = andResult === 0;

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      andResult,
      andBinary,
      message: isPowerOfTwo 
        ? `Since ${num} & ${nMinus1} = 0, ${num} IS a power of 2!`
        : `Since ${num} & ${nMinus1} = ${andResult} ≠ 0, ${num} is NOT a power of 2`,
      phase: "complete",
      result: isPowerOfTwo
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generatePowerOfTwoHistory(number);
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
    if (!isNaN(newNumber)) {
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
  const { binary = "", nMinus1Binary = "", andBinary = "", message = "", result = null } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 text-white p-8">
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-yellow-300 hover:text-yellow-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Bit Manipulation
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Power of Two</h1>
            <p className="text-yellow-200 mt-1">LeetCode #231 - Easy</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Given an integer <code className="px-2 py-1 bg-gray-800 rounded">n</code>, return <strong>true</strong> if it is a power of two. 
          Otherwise, return <strong>false</strong>. An integer <code className="px-2 py-1 bg-gray-800 rounded">n</code> is a power of two 
          if there exists an integer <code className="px-2 py-1 bg-gray-800 rounded">x</code> such that{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">n == 2^x</code>.
        </p>
      </header>

      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Input Configuration</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Number:</label>
            <input
              type="number"
              value={inputNumber}
              onChange={handleNumberChange}
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="e.g., 16"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleApply} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors">
              Apply
            </button>
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-700 hover:to-orange-800 rounded-lg font-semibold transition-all shadow-lg shadow-yellow-500/30"
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
                className="p-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg transition-all shadow-lg"
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
              <div className="text-2xl font-bold text-yellow-300">{currentStep + 1} / {history.length}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
              <select value={animSpeed} onChange={(e) => setAnimSpeed(Number(e.target.value))} className="px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white">
                <option value={2000}>Slow</option>
                <option value={1500}>Normal</option>
                <option value={800}>Fast</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {mode === "visualizing" && message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          result === true 
            ? "bg-green-900/30 border-green-500 text-green-200"
            : result === false
            ? "bg-red-900/30 border-red-500 text-red-200"
            : "bg-yellow-900/30 border-yellow-500 text-yellow-200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="space-y-6">
            {binary && (
              <div className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-500/30">
                <div className="text-sm text-yellow-300 mb-2">n (binary)</div>
                <div className="flex gap-1 justify-center flex-wrap">
                  {binary.split('').map((bit, index) => (
                    <div
                      key={index}
                      className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold ${
                        bit === '1' ? "bg-yellow-600 text-white" : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {bit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nMinus1Binary && (
              <div className="p-4 bg-orange-900/20 rounded-xl border border-orange-500/30">
                <div className="text-sm text-orange-300 mb-2">n - 1 (binary)</div>
                <div className="flex gap-1 justify-center flex-wrap">
                  {nMinus1Binary.split('').map((bit, index) => (
                    <div
                      key={index}
                      className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold ${
                        bit === '1' ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {bit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {andBinary && (
              <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                <div className="text-sm text-purple-300 mb-2">n & (n-1) (binary)</div>
                <div className="flex gap-1 justify-center flex-wrap">
                  {andBinary.split('').map((bit, index) => (
                    <div
                      key={index}
                      className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold ${
                        bit === '1' ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {bit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result !== null && (
              <div className={`mt-8 p-6 rounded-xl border-2 ${
                result ? "bg-green-900/30 border-green-500" : "bg-red-900/30 border-red-500"
              }`}>
                <div className="text-center">
                  <div className={`text-sm mb-2 ${result ? "text-green-300" : "text-red-300"}`}>Result</div>
                  <div className={`text-4xl font-black ${result ? "text-green-200" : "text-red-200"}`}>
                    {result ? "✓ Power of 2" : "✗ Not a Power of 2"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-600">
            <div className="text-sm text-gray-300 text-center">
              <strong>Bit Trick:</strong> A number is a power of 2 if and only if <code className="px-2 py-1 bg-gray-800 rounded">{"n & (n-1) == 0"}</code> (and n {"> 0"})
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PowerOfTwo;
