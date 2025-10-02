import React, { useState } from "react";
import {
  VenetianMask,
  SquareStack,
  SearchCode,
  GitBranch,
  ArrowRightLeft,
  Layers,
  Home,
  RectangleHorizontal,
} from "lucide-react";

import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";

const AlgorithmCategories = ({ navigate }) => {
  const algorithms = [
    {
      name: "Max Consecutive Ones III",
      icon: <VenetianMask className="h-8 w-8 text-amber-400" />,
      description: "Find the longest subarray of 1s with at most K flips.",
      page: "MaxConsecutiveOnesIII",
    },
  ];

  return (
    <div className="p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-100">AlgoVisualizer</h1>
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
const SlidingWindowsPage = () => {
  // 'page' state determines which view is shown.
  const [page, setPage] = useState("home");

  // The navigate function is passed down to children to allow them to change pages.
  const navigate = (newPage) => setPage(newPage);

  // This function decides which component to render based on the 'page' state.
  const renderPage = () => {
    switch (page) {
      case "MaxConsecutiveOnesIII":
        return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmCategories navigate={navigate} />;
    }
  };

  return <>{renderPage()}</>;
};

export default SlidingWindowsPage;
