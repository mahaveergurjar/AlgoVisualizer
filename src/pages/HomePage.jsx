import React, { useState } from "react";
import {
  SquareStack,
  SearchCode,
  GitBranch,
  ArrowRightLeft,
  Layers,
  Home,
  RectangleHorizontal,
} from "lucide-react";

import ArrayPage from "./Arrays/Arrays.jsx";
import SlidingWindowsPage from "./SlidingWindows/SlidingWindows.jsx";
import LinkedListPage from "./LinkedList/LinkedList.jsx";
import StackPage from "./Stack/Stack.jsx";

// This component shows the main categories on the homepage.
const AlgorithmCategories = ({ navigate }) => {
  const algorithms = [
    {
      name: "Arrays",
      icon: <SquareStack className="h-8 w-8 text-amber-400" />,
      description: "Visualizers for array-based problems.",
      page: "Arrays",
    },
    {
      name: "Stack",
      icon: <Layers className="h-8 w-8 text-violet-400" />,
      description: "Understand stack operations visually.",
      page: "Stack",
    },
    {
      name: "Binary Search",
      icon: <SearchCode className="h-8 w-8 text-teal-400" />,
      description: "Step-by-step binary search algorithms.",
      page: "placeholder",
    },
    {
      name: "Sliding Window",
      icon: <RectangleHorizontal className="h-8 w-8 text-cyan-400" />,
      description: "Explore the sliding window technique.",
      page: "SlidingWindows",
    },
    {
      name: "Linked List",
      icon: <GitBranch className="h-8 w-8 text-sky-400" />,
      description: "Animate linked list operations.",
      page: "LinkedList",
    },
    {
      name: "Queue",
      icon: <ArrowRightLeft className="h-8 w-8 text-rose-400" />,
      description: "Explore queue data structures.",
      page: "placeholder",
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
const HomePage = () => {
  // 'page' state determines which view is shown.
  const [page, setPage] = useState("home");

  // The navigate function is passed down to children to allow them to change pages.
  const navigate = (newPage) => setPage(newPage);

  // This function decides which component to render based on the 'page' state.
  const renderPage = () => {
    switch (page) {
      case "Arrays":
        return <ArrayPage navigate={navigate} />;
      case "SlidingWindows":
        return <SlidingWindowsPage navigate={navigate} />;
      case "LinkedList":
        return <LinkedListPage navigate={navigate} />;
      case "Stack":
        return <StackPage />;
      default:
        return <AlgorithmCategories navigate={navigate} />;
    }
  };

  return (
    <>
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10 h-[57px]">
        <div className="max-w-7xl px-4 py-2">
          {/* The "Back to Home" button only shows when we are not on the homepage */}
          {page != "home" && (
            <button
              onClick={() => navigate("home")}
              className="flex items-center text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </button>
          )}
        </div>
      </nav>
      {renderPage()}
    </>
  );
};

export default HomePage;
