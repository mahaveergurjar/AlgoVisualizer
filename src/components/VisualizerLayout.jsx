import React from "react";
import { Activity } from "lucide-react";
import CodeViewer from "./CodeViewer";
import VisualizerControls from "./VisualizerControls";

/**
 * Reusable blueprint layout for all algorithms.
 */
export default function VisualizerLayout({
  title,
  description,
  isLoaded,
  inputSection,
  codeContent,
  activeLine,
  message,
  visualizerState,
  statsSection,
  placeholderText = "Enter inputs and click Load to begin the visualization.",
  children
}) {
  const {
    currentStep,
    history,
    isPlaying,
    speed,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    togglePlay
  } = visualizerState;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto relative z-10">
      {/* Header */}
      <header className="relative z-10 mb-8 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300">
          {title}
        </h1>
        <p className="text-gray-400 mt-3 text-base max-w-2xl mx-auto">
          {description}
        </p>
      </header>

      {/* Input & Control Section */}
      <section className="mb-6 z-10 relative">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/25 p-4 rounded-3xl border border-gray-800 backdrop-blur-sm">
          {/* Inputs Section */}
          <div className="flex flex-1 flex-wrap gap-3 w-full items-center">
            {inputSection}
          </div>

          {/* Controls Section (only visible when loaded) */}
          {isLoaded && (
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <VisualizerControls
                currentStep={currentStep}
                totalSteps={history.length}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                stepForward={stepForward}
                stepBackward={stepBackward}
                reset={reset}
                speed={speed}
                setSpeed={setSpeed}
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content (Split Screen) */}
      {!isLoaded ? (
        <div className="mt-16 text-center text-gray-500 animate-pulse text-base border border-dashed border-gray-800 rounded-3xl py-24 bg-gray-900/10">
          {placeholderText}
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10 animate-fade-in-up">
          {/* Left Panel: Code Steps */}
          <div className="lg:col-span-2">
            <CodeViewer 
              codeContent={codeContent} 
              activeLine={activeLine} 
            />
          </div>

          {/* Right Panel: Visualization & Explanations */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Visualizer Canvas */}
            <div className="relative p-6 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl min-h-[16rem] flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-cyan-300 mb-6 text-center select-none">
                Visualization Canvas
              </h3>
              <div className="flex-1 flex items-center justify-center">
                {children}
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
              <h4 className="text-gray-300 text-sm mb-2 font-semibold flex items-center gap-2 select-none">
                <Activity size={16} /> Explanation
              </h4>
              <p className="text-gray-200 min-h-[2.5rem] flex items-center justify-center text-center font-medium leading-relaxed">
                {message || "Processing..."}
              </p>
            </div>

            {/* Stats section (pointers, variables, state flags) */}
            {statsSection && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsSection}
              </div>
            )}

          </section>
        </main>
      )}
    </div>
  );
}
