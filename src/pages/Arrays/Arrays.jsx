import React, { useState } from "react";
import {
  ArrowLeft,
  Droplets,
  Container,
  ToggleRight,
  ArrowUpDown,
  Brackets,
} from "lucide-react";

import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";
import SubarrayRanges from "./SubarrayRanges.jsx";
import TrappingRainWater from "./TrappingRainWater.jsx";
import ContainerWithMostWater from "./ContainerWithMostWater.jsx";

const AlgorithmList = ({ navigate }) => {
  const algorithms = [
    {
      name: "11. Container With Most Water",
      icon: <Container className="h-12 w-12 text-amber-500" />,
      description:
        "Find two vertical lines that, with the x-axis, form a container holding the most water.",
      page: "ContainerWithMostWater",
    },
    {
      name: "42. Trapping Rain Water",
      icon: <Droplets className="h-12 w-12 text-red-500" />,
      description:
        "Given an elevation map, compute how much water it can trap after raining.",
      page: "TrappingRainWater",
    },
    {
      name: "1004. Max Consecutive Ones III",
      icon: <ToggleRight className="h-12 w-12 text-amber-500" />,
      description:
        "Find the longest subarray of 1s after flipping at most K zeros to ones.",
      page: "MaxConsecutiveOnesIII",
    },
    {
      name: "2104. Sum of Subarray Ranges",
      icon: <ArrowUpDown className="h-12 w-12 text-amber-500" />,
      description:
        "Calculate the sum of the differences between the largest and smallest elements over all subarrays.",
      page: "SubarrayRanges",
    },
  ].sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Sort by problem number

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8">
        <div className="flex justify-center items-center gap-x-5 mb-4">
          <Brackets className="h-16 w-16 text-sky-400" />
          <h1 className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
            Array Algorithms
          </h1>
        </div>
        <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed">
          Dive into problems that showcase the power of arrays, often solved
          with techniques like two-pointers and sliding windows.
        </p>
      </header>
      {/* A responsive grid that works well for 4 items (2x2 on medium screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {algorithms.map((algo, index) => (
          <div
            key={algo.name}
            onClick={() => navigate(algo.page)}
            className="group bg-gray-800 rounded-xl p-7 border border-gray-700 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:border-sky-500 hover:shadow-sky-500/20 animate-fade-in-up"
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
const ArrayPage = () => {
  const [page, setPage] = useState("home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "TrappingRainWater":
        return <TrappingRainWater navigate={navigate} />;
      case "ContainerWithMostWater":
        return <ContainerWithMostWater navigate={navigate} />;
      case "MaxConsecutiveOnesIII":
        return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "SubarrayRanges":
        return <SubarrayRanges navigate={navigate} />;
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
      {page !== "home" && (
        <nav className="bg-gray-900/70 backdrop-blur-md border-b border-gray-700 sticky top-0 z-20 h-[64px] flex items-center shadow-lg">
          <div className="max-w-7xl px-4 w-full">
            <button
              onClick={() => navigate("home")}
              className="flex items-center text-gray-300 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Categories
            </button>
          </div>
        </nav>
      )}
      {renderPage()}
    </PageWrapper>
  );
};

export default ArrayPage;
