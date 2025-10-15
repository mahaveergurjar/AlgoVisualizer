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

// --- Import your specific graph algorithm visualizer components here ---
import BFS from "./BFS.jsx";
import DFS from "./DFS.jsx";
import Dijkstra from "./Dijkstra.jsx";
import TopologicalSort from "./TopologicalSort.jsx";
import Kruskal from "./Kruskal.jsx";
import Prims from "./Prims.jsx";

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

  const algorithms = [
    {
      name: "Breadth-First Search (BFS)",
      number: "N/A",
      icon: Share2,
      description:
        "Explore nodes level by level, finding the shortest path in unweighted graphs.",
      page: "BFS",
      difficulty: "Easy",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Queue & Level Order",
      timeComplexity: "O(V + E)",
    },
    {
      name: "Depth-First Search (DFS)",
      number: "N/A",
      icon: GitBranch,
      description:
        "Explore as far as possible along each branch before backtracking.",
      page: "DFS",
      difficulty: "Easy",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-purple-500 to-indigo-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Stack & Recursion",
      timeComplexity: "O(V + E)",
    },
    {
      name: "Dijkstra's Algorithm",
      number: "N/A",
      icon: Route,
      description:
        "Find the shortest path from a source vertex to all other vertices in a weighted graph.",
      page: "Dijkstra",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-orange-500 to-red-500",
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      technique: "Priority Queue",
      timeComplexity: "O((V + E) log V)",
    },
    {
      name: "Kruskal's Algorithm",
      number: "N/A",
      icon: GitMerge,
      description:
      "Find Minimum Spanning Tree by selecting minimum weight edges using Union-Find.",
      page: "Kruskal",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "Union-Find & Greedy",
      timeComplexity: "O(E log E)",
    },
    {
      name: "Prim's Algorithm",
      number: "N/A",
      icon: Network,
      description:
      "Build Minimum Spanning Tree by growing from start node with minimum edge weights.",
      page: "Prims",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Priority Queue & Greedy",
      timeComplexity: "O((V + E) log V)",
    },
    {
      name: "Topological Sort",
      number: "207",
      icon: Network,
      description:
        "Linear ordering of vertices in a directed acyclic graph (DAG).",
      page: "TopologicalSort",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      technique: "DFS & Indegree",
      timeComplexity: "O(V + E)",
    },
  ].sort((a, b) => {
    // Sort by number if both have numbers, otherwise keep original order
    if (a.number !== "N/A" && b.number !== "N/A") {
      return parseInt(a.number) - parseInt(b.number);
    }
    return 0;
  });

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
            </span>
            .
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-medium text-gray-300">
                  {algorithms.length} Algorithm(s)
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
        {algorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon;

          return (
            <div
              key={algo.name}
              onClick={() => navigate(algo.page)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />

              <div
                className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${algo.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon
                        className={`h-10 w-10 ${
                          isHovered ? "text-white" : algo.iconColor
                        } transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {algo.number !== "N/A" && (
                          <span className="text-xs font-mono text-gray-500">
                            #{algo.number}
                          </span>
                        )}
                        <div
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}
                        >
                          {algo.difficulty}
                        </div>
                      </div>
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${
                          isHovered ? "text-white" : "text-gray-200"
                        }`}
                      >
                        {algo.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${
                    isHovered ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {algo.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-medium text-gray-400">
                        {algo.technique}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-mono text-gray-400">
                        {algo.timeComplexity}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-300 ${
                      isHovered
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-400">
                        Explore
                      </span>
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
          <span className="text-sm text-gray-400">
            More graph algorithms coming soon
          </span>
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
      case "BFS":
        return <BFS navigate={navigate} />;
      case "DFS":
        return <DFS navigate={navigate} />;
      case "Dijkstra":
        return <Dijkstra navigate={navigate} />;
      case "Kruskal":
        return <Kruskal navigate={navigate} />;
      case "Prims":
        return <Prims navigate={navigate} />;
      case "TopologicalSort":
        return <TopologicalSort navigate={navigate} />;
      case "UnionFind":
        return <PlaceholderVisualizer name="Union-Find" navigate={navigate} />;
      case "MST":
        return <PlaceholderVisualizer name="Minimum Spanning Tree" navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)); }
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
              <Network className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-semibold text-gray-300">
                Graph Algorithms
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

export default GraphsPage;
