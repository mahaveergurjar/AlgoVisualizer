import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  Plus,
  Minus,
  List,
  Zap,
  Code2,
  TrendingUp,
  Container,
  Star,
  Clock,
} from "lucide-react";

// Import all queue visualizers
import BasicQueueVisualizer from "./BasicQueue";
import CircularQueueVisualizer from "./CircularQueue";
import QueueUsingStacks from "./QueueUsingStacks";

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const algorithms = [
    // EDUCATIONAL VISUALIZATIONS
    {
      name: "Basic Queue (FIFO)",
      number: "N/A",
      icon: ArrowRightLeft,
      description:
        "First-In-First-Out data structure. Elements are added at the rear and removed from the front, like a waiting line.",
      page: "BasicQueue",
      difficulty: "Easy",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-rose-500 to-pink-600",
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/20",
      borderColor: "border-rose-500/30",
      technique: "Linear Structure",
      operations: "Enqueue, Dequeue",
      category: "Data Structure",
    },
    {
      name: "Circular Queue",
      number: "N/A",
      icon: List,
      description:
        "Optimized queue using circular array to reuse space. The rear connects back to the front, eliminating wasted space.",
      page: "CircularQueue",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-pink-500 to-rose-600",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/20",
      borderColor: "border-pink-500/30",
      technique: "Circular Array",
      operations: "Enqueue, Dequeue",
      category: "Data Structure",
    },
    // LEETCODE PROBLEMS
    {
      name: "Implement Queue using Stacks",
      number: "232",
      icon: Container,
      description:
        "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue.",
      page: "QueueUsingStacks",
      difficulty: "Easy",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-blue-500 to-indigo-600",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Stack",
      timeComplexity: "O(n)",
      category: "LeetCode Problem",
    },
  ];

  // Group algorithms by category
  const dataStructures = algorithms.filter(a => a.category === "Data Structure");
  const leetCodeProblems = algorithms.filter(a => a.category === "LeetCode Problem");

  const AlgorithmCard = ({ algo, index }) => {
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
                {algo.operations ? (
                  <>
                    <Plus className="h-4 w-4 text-green-400" />
                    <Minus className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-medium text-gray-400">
                      {algo.operations}
                    </span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-medium text-gray-400">
                      {algo.technique}
                    </span>
                  </>
                )}
              </div>
              {algo.timeComplexity && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-gray-400">
                    {algo.timeComplexity}
                  </span>
                </div>
              )}
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
                  {algo.category === "LeetCode Problem" ? "Solve" : "Visualize"}
                </span>
                <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <ArrowRightLeft className="h-14 sm:h-16 w-14 sm:w-16 text-rose-400 animated-icon" />
              <Zap className="h-5 w-5 text-pink-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 animated-gradient">
              Queue Algorithms
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master the First-In-First-Out principle through interactive
            visualizations and solve real-world problems.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-full border border-rose-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-medium text-gray-300">
                  {algorithms.length} Algorithms
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 rounded-full border border-pink-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-pink-400" />
                <span className="text-xs font-medium text-gray-300">
                  Data Structures & Problems
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Data Structures Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded"></div>
          Queue Data Structures
          <div className="h-1 flex-1 bg-gradient-to-r from-pink-500/50 to-transparent rounded"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataStructures.map((algo, index) => (
            <AlgorithmCard key={algo.name} algo={algo} index={index} />
          ))}
        </div>
      </div>

      {/* LeetCode Problems Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-3">
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
          Problems
          <div className="h-1 flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent rounded"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leetCodeProblems.map((algo, index) => (
            <AlgorithmCard key={algo.name} algo={algo} index={index + dataStructures.length} />
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">
            More queue problems coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

const QueuePage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "BasicQueue":
        return <BasicQueueVisualizer navigate={navigate} />;
      case "CircularQueue":
        return <CircularQueueVisualizer navigate={navigate} />;
      case "QueueUsingStacks":
        return <QueueUsingStacks navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-icon 6s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(251, 113, 133, 0.6)); }
        @keyframes float-icon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; }
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
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-rose-400" />
              <span className="text-sm font-semibold text-gray-300">
                Queue Algorithms
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
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
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

export default QueuePage;