import React, { useState } from "react";
import {
  ArrowLeft,
  Navigation,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  MapPin,
  Grid
} from "lucide-react";

import RatInMaze from "./RatInMaze.jsx";
import BFSVisualizer from "./BFS";
import { FloodFill } from "./FloodFill.jsx";
import { ColorIslands } from "./ColorIslands.jsx";

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const algorithms = [
    {
      name: "Rat in Maze",
      number: "N/A",
      icon: MapPin,
      description:
        "Find the path for a rat to reach from source to destination in a maze using BFS and DFS.",
      page: "RatInMaze",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "BFS & DFS",
      timeComplexity: "O(4^(N*M))",
    },
    {
      name: "Flood Fill",
      number: "N/A",
      icon: Zap,
      description:
        "Fill an area with a color starting from a seed point. Implemented using BFS.",
      page: "FloodFill",
      difficulty: "Easy",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-green-500 to-cyan-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "BFS",
      timeComplexity: "O(N*M)",
    },
    {
      name: "Color Islands",
      number: "200",
      icon: Grid,
      description:
        "Identify and color each island in a 2D grid with a unique color using Flood Fill.",
      page: "ColorIslands",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-blue-500 to-indigo-500",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Flood Fill (BFS)",
      timeComplexity: "O(N*M)",
    },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Navigation className="h-14 sm:h-16 w-14 sm:w-16 text-purple-400 animated-icon" />
              <Zap className="h-5 w-5 text-pink-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 animated-gradient">
              Pathfinding Algorithms
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Navigate through complex mazes and grids. Visualize different
            pathfinding strategies using{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              BFS (Breadth-First Search)
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
              DFS (Depth-First Search)
            </span>
            .
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-medium text-gray-300">
                  {algorithms.length} Problem(s)
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-medium text-gray-300">
                  Graph Traversal
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {algorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon;

          return (
            <div
              key={algo.name}
              onClick={() => navigate(algo.page)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                group relative overflow-hidden rounded-2xl border cursor-pointer 
                transition-all duration-300 hover:scale-105 hover:shadow-2xl
                ${algo.borderColor} ${isHovered ? "border-opacity-60" : "border-opacity-30"}
                ${isHovered ? "shadow-2xl shadow-purple-500/25" : ""}
              `}
              style={{
                background: `linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/80 backdrop-blur-sm" />
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${algo.iconBg} ${algo.borderColor} border transition-all duration-300 ${isHovered ? "scale-110" : ""}`}>
                    <Icon className={`h-6 w-6 ${algo.iconColor}`} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${algo.difficultyBg} ${algo.difficultyColor} ${algo.difficultyBorder} border`}>
                      {algo.difficulty}
                    </span>
                    {algo.number !== "N/A" && (
                      <span className="text-xs text-gray-400">#{algo.number}</span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {algo.name}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {algo.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs text-gray-400">{algo.technique}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-pink-400" />
                    <span className="text-xs text-gray-400">{algo.timeComplexity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < 2 ? "text-yellow-400 fill-current" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-purple-400 font-medium group-hover:text-purple-300">
                    Visualize →
                  </span>
                </div>
              </div>

              <div className={`absolute inset-0 bg-gradient-to-br ${algo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/30 backdrop-blur-sm">
          <Navigation className="h-4 w-4 text-purple-400" />
          <span className="text-sm text-gray-300">
            More pathfinding algorithms coming soon!
          </span>
        </div>
      </div>
    </div>
  );
};

const PathfindingPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "RatInMaze":
        return <RatInMaze navigate={navigate} />;
      case "BFS":
        return <BFSVisualizer navigate={navigate} />;
      case "FloodFill":
        return <FloodFill navigate={navigate} />;
      case "ColorIslands":
        return <ColorIslands navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.6)); }
        @keyframes float-rotate { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(120deg); } 66% { transform: translateY(-4px) rotate(240deg); } }
        .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
        @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.1); } }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-gray-300">
                Pathfinding Algorithms
              </span>
            </div>
          </div>
        </nav>
      )}

      {page === "home" && parentNavigate && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button
              onClick={() => parentNavigate("home")}
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 cursor-pointer hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </nav>
      )}

      {renderPage()}
    </PageWrapper>
  );
};

export default PathfindingPage;