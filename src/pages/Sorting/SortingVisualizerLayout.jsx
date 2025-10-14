import React from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const SortingVisualizerLayout = ({
  // Props for algorithm-specific details
  title,
  description,
  Icon,
  // State and handlers from the specific visualizer
  arrayInput,
  setArrayInput,
  isLoaded,
  loadArray,
  reset,
  stepBackward,
  stepForward,
  currentStep,
  history,
  // New controls for future features
  arraySize,
  setArraySize,
  generateRandomArray,
  isPlaying,
  togglePlayPause,
  speed,
  setSpeed,
  // Algorithm-specific content
  pseudocode,
  visualization,
  complexityAnalysis,
}) => {
  const state = history[currentStep] || {};

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          {Icon && <Icon />} {title}
        </h1>
        <p className="text-lg text-gray-400 mt-2">{description}</p>
      </header>

      {/* Control Panel */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col gap-4 mb-6">
        {/* Top row for array input and generation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-grow w-full">
            <label htmlFor="array-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">
              Manual Array:
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              disabled={isLoaded}
              placeholder="e.g., 8,5,2,9,5"
              className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="array-size" className="font-medium text-gray-300 font-mono whitespace-nowrap">
              Size:
            </label>
            <input
              id="array-size"
              type="number"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isLoaded}
              min="1"
              max="20"
              className="font-mono w-20 bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={generateRandomArray}
              disabled={isLoaded}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Generate Random
            </button>
          </div>
        </div>

        {/* Bottom row for controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto"
            >
              Load & Visualize
            </button>
          ) : (
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="bg-gray-700 p-2 rounded-md"
                >
                  {isPlaying ? "❚❚" : "►"}
                </button>
                <button
                  onClick={stepBackward}
                  disabled={currentStep <= 0}
                  className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-mono w-24 text-center">
                  {currentStep + 1}/{history.length}
                </span>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-grow">
                <label htmlFor="speed-slider" className="font-medium text-gray-300 font-mono whitespace-nowrap">Speed:</label>
                <input
                  id="speed-slider"
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full md:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pseudocode Section */}
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            {pseudocode}
          </div>

          {/* Right Side Boxes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visualization Area */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} /> Visualization
              </h3>
              {visualization}
            </div>

            {/* Comparisons & Swaps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Total Comparisons
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">
                  {state.totalComparisons ?? 0}
                </p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2">
                  <Repeat size={16} /> Total Swaps
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">
                  {state.totalSwaps ?? 0}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-green-400" />
              )}
            </div>
          </div>

          {/* Complexity Analysis Full Width */}
          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            {complexityAnalysis}
          </div>
        </div>
      )}
      {!isLoaded && (
        <p className="text-center text-gray-500 py-10">
          Load an array to begin visualization.
        </p>
      )}
    </div>
  );
};

export default SortingVisualizerLayout;