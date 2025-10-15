import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Layers } from "lucide-react";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const MinStack = () => {
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

  const generateMinStackHistory = useCallback(() => {
    const hist = [];
    const stack = [];
    const minStack = [];

    hist.push({
      stack: [],
      minStack: [],
      operation: "init",
      message: "MinStack initialized. It supports push, pop, top, and getMin in O(1) time",
      phase: "init"
    });

    // Example operations
    const operations = [
      { op: "push", val: 5 },
      { op: "push", val: 3 },
      { op: "push", val: 7 },
      { op: "getMin" },
      { op: "pop" },
      { op: "push", val: 2 },
      { op: "getMin" },
      { op: "push", val: 1 },
      { op: "getMin" },
      { op: "pop" },
      { op: "getMin" },
    ];

    operations.forEach(({ op, val }) => {
      if (op === "push") {
        stack.push(val);
        const currentMin = minStack.length === 0 ? val : Math.min(val, minStack[minStack.length - 1]);
        minStack.push(currentMin);

        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "push",
          value: val,
          currentMin,
          message: `push(${val}): Added ${val} to stack. Current min: ${currentMin}`,
          phase: "push"
        });
      } else if (op === "pop") {
        const popped = stack.pop();
        minStack.pop();

        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "pop",
          poppedValue: popped,
          currentMin: minStack.length > 0 ? minStack[minStack.length - 1] : null,
          message: `pop(): Removed ${popped} from stack. ${minStack.length > 0 ? `Current min: ${minStack[minStack.length - 1]}` : 'Stack is empty'}`,
          phase: "pop"
        });
      } else if (op === "getMin") {
        const min = minStack[minStack.length - 1];
        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "getMin",
          minValue: min,
          message: `getMin(): Minimum element is ${min}`,
          phase: "getMin"
        });
      }
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateMinStackHistory();
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
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
  const { stack = [], minStack = [], message = "", phase = "init", currentMin, minValue } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-300 hover:text-blue-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Design
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Min Stack</h1>
            <p className="text-blue-200 mt-1">LeetCode #155 - Medium</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Design a stack that supports push, pop, top, and retrieving the minimum element in <strong>constant time</strong>.
          Implement the MinStack class with <code className="px-2 py-1 bg-gray-800 rounded">push(val)</code>,{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">pop()</code>,{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">top()</code>, and{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">getMin()</code> operations.
        </p>
      </header>

      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">Demo Operations</h2>
          <p className="text-gray-300 mb-4">
            Click Start to see a demonstration of MinStack operations with push, pop, and getMin.
          </p>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            <Play className="h-4 w-4" />
            Start Visualization
          </button>
        </section>
      )}

      {mode === "visualizing" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-lg"
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
              <div className="text-2xl font-bold text-blue-300">{currentStep + 1} / {history.length}</div>
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
        <div className={`mb-6 p-4 rounded-xl border ${
          phase === "getMin" 
            ? "bg-green-900/30 border-green-500 text-green-200"
            : phase === "push"
            ? "bg-blue-900/30 border-blue-500 text-blue-200"
            : "bg-purple-900/30 border-purple-500 text-purple-200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Stack */}
            <div>
              <h3 className="text-2xl font-bold text-blue-300 mb-4 text-center">Main Stack</h3>
              <div className="flex flex-col-reverse items-center gap-2 min-h-[400px] justify-end">
                {stack.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Empty Stack</div>
                ) : (
                  stack.map((value, index) => (
                    <div
                      key={index}
                      className={`w-48 h-16 flex items-center justify-center rounded-xl font-bold text-2xl transition-all duration-300 ${
                        index === stack.length - 1
                          ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Min Stack */}
            <div>
              <h3 className="text-2xl font-bold text-green-300 mb-4 text-center">Min Stack (Helper)</h3>
              <div className="flex flex-col-reverse items-center gap-2 min-h-[400px] justify-end">
                {minStack.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Empty Stack</div>
                ) : (
                  minStack.map((value, index) => (
                    <div
                      key={index}
                      className={`w-48 h-16 flex items-center justify-center rounded-xl font-bold text-2xl transition-all duration-300 ${
                        index === minStack.length - 1
                          ? "bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/50 scale-105"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Current Min Display */}
          {(currentMin !== undefined || minValue !== undefined) && (
            <div className="mt-8 p-6 bg-green-900/30 rounded-xl border-2 border-green-500">
              <div className="text-center">
                <div className="text-sm text-green-300 mb-2">Current Minimum</div>
                <div className="text-5xl font-black text-green-200">{currentMin !== undefined ? currentMin : minValue}</div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-600">
            <div className="text-sm text-gray-300">
              <strong>Algorithm:</strong> We maintain two stacks - the main stack stores all elements, 
              while the min stack stores the minimum element at each level. This allows O(1) getMin() operation.
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MinStack;
