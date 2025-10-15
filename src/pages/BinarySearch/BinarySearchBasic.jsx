import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, SearchCode } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const BinarySearchBasic = () => {
  const initialArray = [-1, 0, 3, 5, 9, 12];
  const defaultTarget = 9;

  const [array, setArray] = useState(initialArray);
  const [target, setTarget] = useState(defaultTarget);
  const [inputArray, setInputArray] = useState(initialArray.join(","));
  const [inputTarget, setInputTarget] = useState(defaultTarget);

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

  // Generate history for binary search
  const generateBinarySearchHistory = useCallback((arr, tgt) => {
    const hist = [];
    let left = 0;
    let right = arr.length - 1;

    hist.push({
      array: [...arr],
      target: tgt,
      left,
      right,
      mid: null,
      found: false,
      message: `Searching for ${tgt} in sorted array`,
      phase: "init"
    });

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      hist.push({
        array: [...arr],
        target: tgt,
        left,
        right,
        mid,
        found: false,
        message: `Checking middle element at index ${mid}: ${arr[mid]}`,
        phase: "checking"
      });

      if (arr[mid] === tgt) {
        hist.push({
          array: [...arr],
          target: tgt,
          left,
          right,
          mid,
          found: true,
          foundIndex: mid,
          message: `Found target ${tgt} at index ${mid}!`,
          phase: "found"
        });
        return hist;
      } else if (arr[mid] < tgt) {
        hist.push({
          array: [...arr],
          target: tgt,
          left,
          right,
          mid,
          found: false,
          message: `arr[${mid}] = ${arr[mid]} < ${tgt}, search in right half`,
          phase: "compare"
        });
        left = mid + 1;
        hist.push({
          array: [...arr],
          target: tgt,
          left,
          right,
          mid,
          found: false,
          message: `Moving left pointer to ${left}`,
          phase: "move"
        });
      } else {
        hist.push({
          array: [...arr],
          target: tgt,
          left,
          right,
          mid,
          found: false,
          message: `arr[${mid}] = ${arr[mid]} > ${tgt}, search in left half`,
          phase: "compare"
        });
        right = mid - 1;
        hist.push({
          array: [...arr],
          target: tgt,
          left,
          right,
          mid,
          found: false,
          message: `Moving right pointer to ${right}`,
          phase: "move"
        });
      }
    }

    hist.push({
      array: [...arr],
      target: tgt,
      left,
      right,
      mid: null,
      found: false,
      foundIndex: -1,
      message: `Target ${tgt} not found in array`,
      phase: "not-found"
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateBinarySearchHistory(array, target);
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleArrayChange = (e) => {
    setInputArray(e.target.value);
  };

  const handleTargetChange = (e) => {
    setInputTarget(e.target.value);
  };

  const handleApply = () => {
    const newArray = inputArray.split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
    const newTarget = parseInt(inputTarget, 10);
    if (newArray.length > 0 && !isNaN(newTarget)) {
      setArray(newArray);
      setTarget(newTarget);
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
  const { left = null, right = null, mid = null, found = false, foundIndex = null, message = "", phase = "init" } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 text-white p-8">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Binary Search
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
            <SearchCode className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Binary Search</h1>
            <p className="text-cyan-200 mt-1">LeetCode #704 - Easy</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Given an array of integers <code className="px-2 py-1 bg-gray-800 rounded">nums</code> which is sorted in <strong>ascending order</strong>, 
          and an integer <code className="px-2 py-1 bg-gray-800 rounded">target</code>, write a function to search for{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">target</code> in <code className="px-2 py-1 bg-gray-800 rounded">nums</code>. 
          If <code className="px-2 py-1 bg-gray-800 rounded">target</code> exists, then return its index. Otherwise, return <strong>-1</strong>. 
          You must write an algorithm with <strong>O(log n)</strong> runtime complexity.
        </p>
      </header>

      {/* Input Controls */}
      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Input Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sorted Array (comma-separated):
              </label>
              <input
                type="text"
                value={inputArray}
                onChange={handleArrayChange}
                className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., -1,0,3,5,9,12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Value:
              </label>
              <input
                type="number"
                value={inputTarget}
                onChange={handleTargetChange}
                className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., 9"
              />
            </div>
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
                <option value={2000}>Slow</option>
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
          phase === "found" 
            ? "bg-green-900/30 border-green-500 text-green-200"
            : phase === "not-found"
            ? "bg-red-900/30 border-red-500 text-red-200"
            : "bg-cyan-900/30 border-cyan-500 text-cyan-200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {/* Array Visualization */}
      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="flex justify-center items-end gap-2 flex-wrap">
            {array.map((value, index) => {
              const isLeft = index === left;
              const isRight = index === right;
              const isMid = index === mid;
              const isFound = found && index === foundIndex;
              const inRange = left !== null && right !== null && index >= left && index <= right;

              return (
                <div key={index} className="flex flex-col items-center gap-2 relative">
                  {isMid && <VisualizerPointer label="MID" color="bg-purple-500" />}
                  {isLeft && <VisualizerPointer label="L" color="bg-blue-500" />}
                  {isRight && <VisualizerPointer label="R" color="bg-orange-500" />}
                  
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-300 ${
                      isFound
                        ? "bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/50 scale-110 ring-4 ring-green-400"
                        : isMid
                        ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/50 scale-105"
                        : isLeft || isRight
                        ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/50"
                        : inRange
                        ? "bg-gray-700 text-white border-2 border-cyan-400"
                        : "bg-gray-800 text-gray-400 border border-gray-600"
                    }`}
                  >
                    {value}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    [{index}]
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-700"></div>
              <span className="text-sm text-gray-300">Left/Right Pointer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-purple-700"></div>
              <span className="text-sm text-gray-300">Middle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-700 border-2 border-cyan-400"></div>
              <span className="text-sm text-gray-300">In Search Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-500 to-green-700"></div>
              <span className="text-sm text-gray-300">Target Found</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BinarySearchBasic;
