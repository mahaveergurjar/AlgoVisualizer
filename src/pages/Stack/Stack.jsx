import React, { useState } from "react";
import { Scissors, ArrowUpDown, ArrowLeft, BarChart4 } from "lucide-react";

import SubarrayRanges from "./SubarrayRanges.jsx";
import RemoveKDigits from "./RemoveKDigits.jsx";
import LargestRectangleHistogram from "./LargestRectangleHistogram.jsx";

const AlgorithmCategories = ({ navigate }) => {
  const algorithms = [
    {
      name: "2104. Sum Of Subarray Ranges",
      icon: <ArrowUpDown className="h-8 w-8 text-amber-400" />,
      description: "Visualizers for array-based problems.",
      page: "SubarrayRanges",
    },
    {
      name: "402. Remove K Digits",
      icon: <Scissors className="h-8 w-8 text-amber-400" />,
      description: "Visualizers for stack-based problems.",
      page: "RemoveKDigits",
    },
    {
      name: "84. Largest Rectangle in Histogram",
      icon: <BarChart4 className="h-8 w-8 text-red-600" />,
      description: "Visualizers for stack-based problems.",
      page: "LargestRectangleHistogram",
    },
  ];

  return (
    <div className="p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-violet-400">Stack</h1>
        <p className="text-xl text-gray-400 mt-2">
          Choose an algorithm category to get started
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {algorithms.map((algo) => (
          <div
            key={algo.name}
            onClick={() => navigate(algo.page)}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              {algo.icon}
              <h2 className="text-2xl font-bold text-gray-200">{algo.name}</h2>
            </div>
            <p className="text-gray-400">{algo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// This is the main component that controls all page navigation.
const StackPage = () => {
  // 'page' state determines which view is shown.
  const [page, setPage] = useState("home");

  // The navigate function is passed down to children to allow them to change pages.
  const navigate = (newPage) => setPage(newPage);

  // This function decides which component to render based on the 'page' state.
  const renderPage = () => {
    switch (page) {
      case "SubarrayRanges":
        return <SubarrayRanges navigate={navigate} />;
      case "RemoveKDigits":
        return <RemoveKDigits navigate={navigate} />;
      case "LargestRectangleHistogram":
        return <LargestRectangleHistogram />;
      case "home":
        return <AlgorithmCategories navigate={navigate} />;
      default:
    }
  };
  return (
    <>
      {page != "home" && (
        <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10 h-[57px]">
          <div className="max-w-7xl px-4 py-2">
            <button
              onClick={() => navigate("home")}
              className="flex items-center text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
        </nav>
      )}
      {renderPage()}
    </>
  );
};

export default StackPage;
