import React, { useState } from "react";
import {
  ArrowLeft,
  Network,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Route,
  GitBranch,
  Share2,
  GitMerge,
} from "lucide-react";

// --- Import your specific graph algorithm visualizer components ---
import BFS from "./BFS.jsx";
import DFS from "./DFS.jsx";
import Dijkstra from "./Dijkstra.jsx";
import TopologicalSort from "./TopologicalSort.jsx";
import Kruskal from "./Kruskal.jsx";
import NetworkFlow from "./NetworkFlow.jsx";

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Network,
  gradient: "from-gray-700 to-gray-800",
  borderColor: "border-gray-600",
  iconBg: "bg-gray-700/20",
  iconColor: "text-gray-300",
};

// ✅ Keep maintainer's Placeholder Component
const PlaceholderVisualizer = ({ name, navigate }) => (
  <div className="bg-gray-950 text-white min-h-screen flex flex-col">
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
          <Network className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">
            Graph Algorithms
          </span>
        </div>
      </div>
    </nav>
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Network className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-400 mb-2">{name} Visualizer</h1>
        <p className="text-lg text-gray-500">Coming soon!</p>
      </div>
    </div>
  </div>
);


const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // ✅ Get Graph problems directly from the master catalog
  const graphAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'Graphs');
  
  // ❌ The local 'algorithms' array has been DELETED.

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Network className="h-14 sm:h-16 w-14 sm:w-16 text-blue-400 animated-icon" />
              <Zap className="h-5 w-5 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 animated-gradient">
              Graph Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master the art of graph traversal and pathfinding. Visualize complex
            problems involving{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              connections
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              networks
            </span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-medium text-gray-300">
                  {graphAlgorithms.length} Algorithm(s)
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-medium text-gray-300">
                  Traversal & Pathfinding
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {graphAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon;
          return (
            <div
              key={algo.subpage} // ✅ Use subpage
              onClick={() => navigate(algo.subpage)} // ✅ Use subpage
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}/>
              <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor || defaultVisuals.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${algo.iconBg || defaultVisuals.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className={`h-10 w-10 ${isHovered ? "text-white" : (algo.iconColor || defaultVisuals.iconColor)} transition-colors duration-300`}/>
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
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-200"}`}>
                        {algo.label} {/* ✅ Use label */}
                      </h2>
                    </div>
                  </div>

                  {/* ✅ Add the StarButton here */}
                  <div onClick={(e) => e.stopPropagation()}>
                      <StarButton problemId={algo.subpage} />
                  </div>

                </div>
                <p className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-gray-300" : "text-gray-400"}`}>{algo.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-medium text-gray-400">{algo.technique}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-mono text-gray-400">{algo.timeComplexity}</span>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-400">Explore</span>
                      <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-400">More graph algorithms coming soon</span>
        </div>
      </div>
    </div>
  );
};

const GraphsPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);
  const renderPage = () => {
    switch (page) {
      case "BFS": return <BFS navigate={navigate} />;
      case "DFS": return <DFS navigate={navigate} />;
      case "Dijkstra": return <Dijkstra navigate={navigate} />;
      case "Kruskal": return <Kruskal navigate={navigate} />;
      case "TopologicalSort": return <TopologicalSort navigate={navigate} />;
      case "NetworkFlow": return <NetworkFlow navigate={navigate} />;
      case "UnionFind": return <PlaceholderVisualizer name="Union-Find" navigate={navigate} />; // ✅ Keep maintainer's placeholder
      case "MST": return <PlaceholderVisualizer name="Minimum Spanning Tree" navigate={navigate} />; // ✅ Keep maintainer's placeholder
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };
  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      {children}
    </div>
  );
  return (
    <PageWrapper>
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => parentNavigate ? parentNavigate("home") : null}
            className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-700 hover:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Problems
          </button>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-gray-300">Graph Algorithms</span>
          </div>
        </div>
      </nav>
      {renderPage()}
    </PageWrapper>
  );
};

export default GraphsPage;