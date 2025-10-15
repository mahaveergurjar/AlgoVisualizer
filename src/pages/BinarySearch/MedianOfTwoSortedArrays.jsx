import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Layers } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const MedianOfTwoSortedArrays = () => {
  const initialArray1 = [1, 3];
  const initialArray2 = [2];

  const [array1, setArray1] = useState(initialArray1);
  const [array2, setArray2] = useState(initialArray2);
  const [inputArray1, setInputArray1] = useState(initialArray1.join(","));
  const [inputArray2, setInputArray2] = useState(initialArray2.join(","));

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

  // Generate history for finding median
  const generateMedianHistory = useCallback((nums1, nums2) => {
    const hist = [];
    
    // Ensure nums1 is the smaller array
    if (nums1.length > nums2.length) {
      [nums1, nums2] = [nums2, nums1];
    }

    const m = nums1.length;
    const n = nums2.length;
    
    hist.push({
      array1: [...nums1],
      array2: [...nums2],
      message: `Finding median of two sorted arrays. Total elements: ${m + n}`,
      phase: "init",
      partition1: null,
      partition2: null,
      median: null
    });

    let left = 0;
    let right = m;

    while (left <= right) {
      const partition1 = Math.floor((left + right) / 2);
      const partition2 = Math.floor((m + n + 1) / 2) - partition1;

      hist.push({
        array1: [...nums1],
        array2: [...nums2],
        partition1,
        partition2,
        message: `Trying partition at position ${partition1} in array1 and ${partition2} in array2`,
        phase: "partition",
        median: null
      });

      const maxLeft1 = partition1 === 0 ? -Infinity : nums1[partition1 - 1];
      const minRight1 = partition1 === m ? Infinity : nums1[partition1];
      const maxLeft2 = partition2 === 0 ? -Infinity : nums2[partition2 - 1];
      const minRight2 = partition2 === n ? Infinity : nums2[partition2];

      hist.push({
        array1: [...nums1],
        array2: [...nums2],
        partition1,
        partition2,
        maxLeft1: maxLeft1 === -Infinity ? "−∞" : maxLeft1,
        minRight1: minRight1 === Infinity ? "+∞" : minRight1,
        maxLeft2: maxLeft2 === -Infinity ? "−∞" : maxLeft2,
        minRight2: minRight2 === Infinity ? "+∞" : minRight2,
        message: `maxLeft1=${maxLeft1 === -Infinity ? "−∞" : maxLeft1}, minRight1=${minRight1 === Infinity ? "+∞" : minRight1}, maxLeft2=${maxLeft2 === -Infinity ? "−∞" : maxLeft2}, minRight2=${minRight2 === Infinity ? "+∞" : minRight2}`,
        phase: "compare",
        median: null
      });

      if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
        // Found the correct partition
        let median;
        if ((m + n) % 2 === 0) {
          median = (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
          hist.push({
            array1: [...nums1],
            array2: [...nums2],
            partition1,
            partition2,
            median,
            message: `Found correct partition! Median = (max(${maxLeft1}, ${maxLeft2}) + min(${minRight1}, ${minRight2})) / 2 = ${median}`,
            phase: "found",
            maxLeft1: maxLeft1 === -Infinity ? "−∞" : maxLeft1,
            minRight1: minRight1 === Infinity ? "+∞" : minRight1,
            maxLeft2: maxLeft2 === -Infinity ? "−∞" : maxLeft2,
            minRight2: minRight2 === Infinity ? "+∞" : minRight2
          });
        } else {
          median = Math.max(maxLeft1, maxLeft2);
          hist.push({
            array1: [...nums1],
            array2: [...nums2],
            partition1,
            partition2,
            median,
            message: `Found correct partition! Median = max(${maxLeft1}, ${maxLeft2}) = ${median}`,
            phase: "found",
            maxLeft1: maxLeft1 === -Infinity ? "−∞" : maxLeft1,
            minRight1: minRight1 === Infinity ? "+∞" : minRight1,
            maxLeft2: maxLeft2 === -Infinity ? "−∞" : maxLeft2,
            minRight2: minRight2 === Infinity ? "+∞" : minRight2
          });
        }
        return hist;
      } else if (maxLeft1 > minRight2) {
        hist.push({
          array1: [...nums1],
          array2: [...nums2],
          partition1,
          partition2,
          message: `maxLeft1 (${maxLeft1}) > minRight2 (${minRight2}), moving partition left`,
          phase: "adjust",
          median: null
        });
        right = partition1 - 1;
      } else {
        hist.push({
          array1: [...nums1],
          array2: [...nums2],
          partition1,
          partition2,
          message: `maxLeft2 (${maxLeft2}) > minRight1 (${minRight1}), moving partition right`,
          phase: "adjust",
          median: null
        });
        left = partition1 + 1;
      }
    }

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateMedianHistory(array1, array2);
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleArray1Change = (e) => {
    setInputArray1(e.target.value);
  };

  const handleArray2Change = (e) => {
    setInputArray2(e.target.value);
  };

  const handleApply = () => {
    const newArray1 = inputArray1.split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
    const newArray2 = inputArray2.split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
    if (newArray1.length > 0 && newArray2.length > 0) {
      setArray1(newArray1);
      setArray2(newArray2);
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
  const { partition1 = null, partition2 = null, message = "", phase = "init", median = null, 
          maxLeft1, minRight1, maxLeft2, minRight2 } = step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Binary Search
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Median of Two Sorted Arrays</h1>
            <p className="text-purple-200 mt-1">LeetCode #4 - Hard</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          Given two sorted arrays <code className="px-2 py-1 bg-gray-800 rounded">nums1</code> and{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">nums2</code> of size <code className="px-2 py-1 bg-gray-800 rounded">m</code> and{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">n</code> respectively, return <strong>the median</strong> of the two sorted arrays. 
          The overall run time complexity should be <strong>O(log(min(m,n)))</strong>.
        </p>
      </header>

      {/* Input Controls */}
      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Input Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Array 1 (comma-separated):
              </label>
              <input
                type="text"
                value={inputArray1}
                onChange={handleArray1Change}
                className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 1,3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Array 2 (comma-separated):
              </label>
              <input
                type="text"
                value={inputArray2}
                onChange={handleArray2Change}
                className="w-full px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 2"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
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

      {/* Visualization Controls */}
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
              <div className="text-2xl font-bold text-purple-300">
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
                <option value={2500}>Slow</option>
                <option value={1500}>Normal</option>
                <option value={800}>Fast</option>
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
            : "bg-purple-900/30 border-purple-500 text-purple-200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {/* Array Visualization */}
      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="space-y-8">
            {/* Array 1 */}
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Array 1</h3>
              <div className="flex justify-center items-end gap-2 flex-wrap">
                {array1.map((value, index) => {
                  const isPartition = partition1 !== null && index === partition1;
                  const isLeftPart = partition1 !== null && index < partition1;

                  return (
                    <div key={index} className="flex flex-col items-center gap-2 relative">
                      {isPartition && <VisualizerPointer label="P1" color="bg-purple-500" />}
                      
                      <div
                        className={`w-16 h-16 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-300 ${
                          isPartition
                            ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/50 scale-105 ring-2 ring-purple-400"
                            : isLeftPart
                            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                            : "bg-gray-700 text-white"
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
            </div>

            {/* Array 2 */}
            <div>
              <h3 className="text-lg font-semibold text-pink-300 mb-3">Array 2</h3>
              <div className="flex justify-center items-end gap-2 flex-wrap">
                {array2.map((value, index) => {
                  const isPartition = partition2 !== null && index === partition2;
                  const isLeftPart = partition2 !== null && index < partition2;

                  return (
                    <div key={index} className="flex flex-col items-center gap-2 relative">
                      {isPartition && <VisualizerPointer label="P2" color="bg-pink-500" />}
                      
                      <div
                        className={`w-16 h-16 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-300 ${
                          isPartition
                            ? "bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-lg shadow-pink-500/50 scale-105 ring-2 ring-pink-400"
                            : isLeftPart
                            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                            : "bg-gray-700 text-white"
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
            </div>

            {/* Partition Values */}
            {(maxLeft1 || minRight1 || maxLeft2 || minRight2) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 p-4 bg-gray-900/50 rounded-xl">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">maxLeft1</div>
                  <div className="text-xl font-bold text-purple-300">{maxLeft1}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">minRight1</div>
                  <div className="text-xl font-bold text-purple-300">{minRight1}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">maxLeft2</div>
                  <div className="text-xl font-bold text-pink-300">{maxLeft2}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">minRight2</div>
                  <div className="text-xl font-bold text-pink-300">{minRight2}</div>
                </div>
              </div>
            )}

            {/* Median Result */}
            {median !== null && (
              <div className="text-center p-6 bg-green-900/30 rounded-xl border-2 border-green-500">
                <div className="text-sm text-green-300 mb-2">Median</div>
                <div className="text-4xl font-black text-green-200">{median}</div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-700"></div>
              <span className="text-sm text-gray-300">Left Partition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-700"></div>
              <span className="text-sm text-gray-300">Right Partition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-purple-700 ring-2 ring-purple-400"></div>
              <span className="text-sm text-gray-300">Partition Point</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MedianOfTwoSortedArrays;
