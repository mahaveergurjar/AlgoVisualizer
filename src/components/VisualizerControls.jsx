import React from "react";
import { ArrowLeft, ArrowRight, Play, Pause, RotateCw } from "lucide-react";

/**
 * Reusable controls bar for visualizers.
 */
export default function VisualizerControls({
  currentStep,
  totalSteps,
  isPlaying,
  togglePlay,
  stepForward,
  stepBackward,
  reset,
  speed,
  setSpeed,
  minSpeed = 100,
  maxSpeed = 1500
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 bg-gray-900/40 p-3 rounded-2xl border border-gray-800 backdrop-blur-md">
      {/* Player Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={stepBackward}
          disabled={currentStep <= 0}
          className="p-2.5 rounded-xl bg-gray-950 hover:bg-cyan-600 disabled:opacity-40 transition text-white hover:text-white cursor-pointer"
          title="Step Backward (ArrowLeft)"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-xl bg-gray-950 hover:bg-cyan-600 transition text-white hover:text-white cursor-pointer"
          title="Play / Pause (Spacebar)"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStep >= totalSteps - 1}
          className="p-2.5 rounded-xl bg-gray-950 hover:bg-cyan-600 disabled:opacity-40 transition text-white hover:text-white cursor-pointer"
          title="Step Forward (ArrowRight)"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Step Counter Badge */}
      <div className="px-4 py-2 font-mono text-sm bg-gray-950 border border-gray-800 rounded-xl text-gray-200 shadow-inner">
        {currentStep + 1} / {totalSteps}
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-950 border border-gray-800 rounded-xl">
        <span className="text-xs text-gray-400 font-bold select-none uppercase tracking-wider">Speed</span>
        <input
          type="range"
          min={minSpeed}
          max={maxSpeed}
          step={50}
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
          className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg appearance-none"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={reset}
        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-950/20 cursor-pointer"
      >
        <RotateCw size={12} />
        Reset
      </button>
    </div>
  );
}
