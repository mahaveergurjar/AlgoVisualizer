import React, { useState } from "react";
import {
  ArrowLeft,
  Droplets,
  Container,
  ToggleRight,
  ArrowUpDown,
  FileText,
  Coins,
  Edit3,
  Brackets,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";

// --- Import your specific algorithm visualizer components here ---
import KnapsackVisualizer from "./KnapSack.jsx";
import LCSVisualizer from "./LongestCommonSubsequence.jsx";
import CoinChangeVisualizer from "./CoinChange.jsx";
import EditDistanceVisualizer from "./EditDistance.jsx";
import LISVisualizer from "./LISubsequence.jsx";

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const algorithms = [
    {
      name: "0/1 Knapsack",
      number: "416", // LeetCode problem: Partition Equal Subset Sum
      icon: TrendingUp,
      description:
        "Given weights and values of N items, and a maximum capacity W, determine the maximum value that can be put in a knapsack of capacity W. Each item can be selected at most once.",
      page: "KnapSack",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-yellow-400 to-orange-500",
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
      technique: "Dynamic Programming",
      timeComplexity: "O(N × W)"
    },
    {
    name: "Longest Common Subsequence",
    number: "1143",
    icon: FileText,
    description:
    "Given two strings, find the length of their longest common subsequence. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.",
    page: "LCS",
    difficulty: "Medium",
    difficultyColor: "text-cyan-400",
    difficultyBg: "bg-cyan-400/10",
    difficultyBorder: "border-cyan-400/30",
    gradient: "from-cyan-400 to-blue-400",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30",
    technique: "Dynamic Programming",
    timeComplexity: "O(M × N)"
    },
    {
    name: "Coin Change",
    number: "322",
    icon: Coins,
    description:
    "Given an array of coin denominations and a target amount, find the minimum number of coins needed to make up that amount. If impossible, return -1.",
    page: "CoinChange",
    difficulty: "Medium",
    difficultyColor: "text-amber-400",
    difficultyBg: "bg-amber-400/10",
    difficultyBorder: "border-amber-400/30",
    gradient: "from-amber-400 to-orange-400",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
    technique: "Dynamic Programming",
    timeComplexity: "O(Amount × Coins)"
    },
    {
    name: "Edit Distance",
    number: "72",
    icon: Edit3,
    description:
    "Given two strings, find the minimum number of operations (insert, delete, replace) required to convert one string into another. Also known as Levenshtein Distance.",
    page: "EditDistance",
    difficulty: "Hard",
    difficultyColor: "text-red-400",
    difficultyBg: "bg-red-400/10",
    difficultyBorder: "border-red-400/30",
    gradient: "from-purple-400 to-pink-400",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    technique: "Dynamic Programming",
    timeComplexity: "O(M × N)"
   },
   {
    name: "Longest Increasing Subsequence",
    number: "300",
    icon: TrendingUp,
    description:
    "Given an integer array, find the length of the longest strictly increasing subsequence. Elements don't need to be contiguous but must maintain their relative order.",
    page: "LIS",
    difficulty: "Medium",
    difficultyColor: "text-green-400",
    difficultyBg: "bg-green-400/10",
    difficultyBorder: "border-green-400/30",
    gradient: "from-green-400 to-teal-400",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/20",
    borderColor: "border-green-500/30",
    technique: "Dynamic Programming",
    timeComplexity: "O(N²)"
    }

  ].sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Brackets className="h-14 sm:h-16 w-14 sm:w-16 text-amber-400 animated-icon" />
              <Zap className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 animated-gradient">
              DP Algorithms
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master classic dynamic programming problems with techniques like{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              0/1 Knapsack DP
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              subset sum optimization
            </span>
            , and visualize how the DP table fills step by step.
          </p>


          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-medium text-gray-300">
                  {algorithms.length} Problems
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-gray-300">
                  Multiple Techniques
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
                        className={`h-10 w-10 ${isHovered ? "text-white" : algo.iconColor
                          } transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">
                          #{algo.number}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}
                        >
                          {algo.difficulty}
                        </div>
                      </div>
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-200"
                          }`}
                      >
                        {algo.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-gray-300" : "text-gray-400"
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
                    className={`transition-all duration-300 ${isHovered
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                      }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-400">
                        Solve
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
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">
            More DP problems coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

const DPPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "KnapSack":
        return <KnapsackVisualizer navigate={navigate} />;
      case "LCS":
        return <LCSVisualizer navigate={navigate} />;
      case "CoinChange":
        return <CoinChangeVisualizer navigate={navigate} />;
      case "EditDistance":
        return <EditDistanceVisualizer navigate={navigate} />;
      case "LIS":
        return <LISVisualizer navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <style>{`
        .animated-gradient {
          background-size: 200% auto;
          animation: gradient-animation 4s ease-in-out infinite;
        }
        @keyframes gradient-animation {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-icon {
          animation: float-rotate 8s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(-4px) rotate(240deg); }
        }
        .animate-pulse-slow, .animate-pulse-slow-delayed {
          animation: pulse-slow 4s ease-in-out infinite;
          animation-delay: var(--animation-delay, 0s);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float, .animate-float-delayed {
          animation: float 20s ease-in-out infinite;
          animation-delay: var(--animation-delay, 0s);
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
      {/* Navigation to go back to the problem list within this category */}
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
              <Brackets className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-semibold text-gray-300">
                DP Algorithms
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* Navigation to go back to the main category homepage */}
      {page === "home" && parentNavigate && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto">
            <button
              onClick={() => parentNavigate("home")}
              className="flex items-center gap-2 text-gray-300 cursor-pointer bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
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

export default DPPage;
