import React, { useState } from "react";
import {
  ArrowLeft,
  RectangleHorizontal, // The perfect icon for Sliding Window
  ToggleRight, // A better icon for this specific problem
} from "lucide-react";

import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";

const AlgorithmList = ({ navigate }) => {
  const algorithms = [
    {
      name: "1004. Max Consecutive Ones III",
      icon: <ToggleRight className="h-12 w-12 text-amber-500" />,
      description: "Find the longest subarray of 1s with at most K flips.",
      page: "MaxConsecutiveOnesIII",
    },
    // Add more sliding window algorithms here in the future
  ].sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Sort by problem number

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8">
        <div className="flex justify-center items-center gap-x-5 mb-4">
          <RectangleHorizontal className="h-16 w-16 text-cyan-400" />
          <h1 className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-400">
            Sliding Window
          </h1>
        </div>
        <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed">
          Master the technique of efficiently processing contiguous subarrays or
          substrings by maintaining a dynamic "window" over the data.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {algorithms.map((algo, index) => (
          <div
            key={algo.name}
            onClick={() => navigate(algo.page)}
            className="group bg-gray-800 rounded-xl p-7 border border-gray-700 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:border-cyan-500 hover:shadow-cyan-500/20 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="transition-transform duration-300 group-hover:scale-110">
                {algo.icon}
              </div>
              <h2 className="text-2xl font-semibold text-gray-100">
                {algo.name}
              </h2>
            </div>
            <p className="text-gray-400 text-base leading-relaxed">
              {algo.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// This is the main component that controls all page navigation.
const SlidingWindowsPage = () => {
  const [page, setPage] = useState("home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "MaxConsecutiveOnesIII":
        return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  // A wrapper to inject background styles and CSS animations
  const PageWrapper = ({ children }) => (
    <div
      className="bg-gray-900 text-white min-h-screen"
      style={{
        backgroundImage: `radial-gradient(circle at top, rgba(31, 41, 55, 0.8), transparent), 
                       radial-gradient(circle at bottom, rgba(17, 24, 39, 0.9), transparent)`,
      }}
    >
      <style>{`
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fade-in-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {children}
    </div>
  );

  return (
    <PageWrapper>
      {/* I've added back the consistent navigation bar for when you're viewing a specific algorithm */}
      {page !== "home" && (
        <nav className="bg-gray-900/70 backdrop-blur-md border-b border-gray-700 sticky top-0 z-20 h-[64px] flex items-center shadow-lg">
          <div className="max-w-7xl px-4 w-full">
            <button
              onClick={() => navigate("home")}
              className="flex items-center text-gray-300 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
        </nav>
      )}
      {renderPage()}
    </PageWrapper>
  );
};

export default SlidingWindowsPage;
