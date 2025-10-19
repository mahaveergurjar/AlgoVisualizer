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
  Grid // Added from HEAD
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import RatInMaze from "./RatInMaze.jsx";
import BFSVisualizer from "./BFS"; // Keep BFS if it's used for Pathfinding visualization
import { FloodFill } from "./FloodFill.jsx"; // ✅ Maintainer's new import
import { ColorIslands } from "./ColorIslands.jsx"; // ✅ Maintainer's new import

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Navigation,
  gradient: "from-gray-700 to-gray-800",
  borderColor: "border-gray-600",
  iconBg: "bg-gray-700/20",
  iconColor: "text-gray-300",
};

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // ✅ Get Pathfinding problems directly from the master catalog
  const pathfindingAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'Pathfinding');

  // ❌ The local 'algorithms' array has been DELETED.

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
              BFS
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
              DFS
            </span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-medium text-gray-300">
                  {pathfindingAlgorithms.length} Problem(s)
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
        {pathfindingAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon;
          return (
            <div
              key={algo.subpage}
              onClick={() => navigate(algo.subpage)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${algo.borderColor || defaultVisuals.borderColor} ${isHovered ? "border-opacity-60" : "border-opacity-30"} ${isHovered ? "shadow-2xl shadow-purple-500/25" : ""}`}
              style={{ background: `linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/80 backdrop-blur-sm" />
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${algo.iconBg || defaultVisuals.iconBg} ${algo.borderColor || defaultVisuals.borderColor} border transition-all duration-300 ${isHovered ? "scale-110" : ""}`}>
                      <Icon className={`h-6 w-6 ${algo.iconColor || defaultVisuals.iconColor}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {algo.number !== "N/A" && (
                              <span className="text-xs font-mono text-gray-500">#{algo.number}</span>
                            )}
                            <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>
                              {algo.difficulty}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                            {algo.label}
                        </h3>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {algo.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-xs text-gray-400">{algo.technique}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-pink-400" />
                      <span className="text-xs text-gray-400">{algo.timeComplexity}</span>
                    </div>
                  </div>
                  <span className="text-xs text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                    Visualize →
                  </span>
                </div>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
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
      case "RatInMaze": return <RatInMaze navigate={navigate} />;
      case "BFS": return <BFSVisualizer navigate={navigate} />; // Assuming BFS is still relevant here
      case "FloodFill": return <FloodFill navigate={navigate} />; // ✅ Keep maintainer's route
      case "ColorIslands": return <ColorIslands navigate={navigate} />; // ✅ Keep maintainer's route
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    // PageWrapper remains the same
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden"> ... </div>
  );

  return (
    // Navigation and rendering logic remains the same
    <PageWrapper> ... </PageWrapper>
  );
};

export default PathfindingPage;