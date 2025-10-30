// Searching.jsx
import React, { useState } from "react";
import { 
  ArrowLeft, 
  Search,
  Zap, 
  ArrowRight, 
  TrendingUp,
  Code2,
  Brackets,
  Filter,
  Clock,
  Star,
  Scan,
  Navigation
} from "lucide-react";

import LinearSearch from "./LinearSearch.jsx";
import ExponentialSearch from "./ExponentialSearch.jsx";
import SmallestLetter from "./SmallestLetter.jsx";
import UnknownSizeSearch from "./UnknownSizeSearch.jsx";
import KthMissing from "./kthMissingNumber.jsx";
import SpecialArray from "./specialArray.jsx";

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  const algorithms = [
    {
      name: "Linear Search",
      number: "101",
      icon: Scan,
      description: "Sequentially check each element until the target is found. Simple but effective for small datasets.",
      page: "LinearSearch",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "Sequential Scan",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      platforms: ["All Platforms", "Basic DS"],
      tags: ["Beginner", "Unsorted Arrays", "Simple"]
    },
    {
      name: "Exponential Search",
      number: "102",
      icon: Zap,
      description: "Find range exponentially and then perform binary search. Great for unbounded or infinite arrays.",
      page: "ExponentialSearch",
      difficulty: "Medium",
      tier: "Tier 2",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-teal-500 to-cyan-500",
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/20",
      borderColor: "border-teal-500/30",
      technique: "Range Finding + Binary Search",
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      platforms: ["GfG", "Interview Questions"],
      tags: ["Unbounded Search", "Sorted Arrays", "Efficient"]
    },
    {
      name: "Find Smallest Letter Greater Than Target",
      number: "744",
      icon: Search,
      description: "Find the smallest character in letters that is lexicographically greater than target.",
      page: "SmallestLetter",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-emerald-500 to-green-500",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      technique: "Linear Search",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      platforms: ["LeetCode #744"],
      tags: ["Character Array", "Linear Scan", "Lexicographical"]
    },
    {
      name: "Search in Sorted Array of Unknown Size",
      number: "702",
      icon: Navigation,
      description: "Search target in a sorted array of unknown size using exponential search approach.",
      page: "UnknownSizeSearch",
      difficulty: "Medium",
      tier: "Tier 2",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      technique: "Exponential Search",
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      platforms: ["LeetCode #702"],
      tags: ["Unbounded Array", "Exponential Range", "Interview"]
    },
    {
      name: "Kth Missing Positive Number",
      number: "1539",
      icon: Filter,
      description: "Find the kth positive integer that is missing from a sorted array.",
      page: "KthMissing",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-blue-500 to-indigo-500",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Linear Search",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      platforms: ["LeetCode #1539"],
      tags: ["Missing Numbers", "Linear Scan", "Sorted Array"]
    },
    {
      name: "Special Array With X Elements",
      number: "1608",
      icon: Zap,
      description: "Find if there exists a number x where exactly x elements are greater than or equal to x.",
      page: "SpecialArray",
      difficulty: "Easy",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Linear Search",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      platforms: ["LeetCode #1608"],
      tags: ["Special Array", "Linear Check", "Counting"]
    }
  ];

  const filteredAlgorithms = algorithms.filter(algo => {
    if (filter === "all") return true;
    if (filter === "beginner") return algo.tier === "Tier 1";
    if (filter === "easy") return algo.tier === "Tier 2";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Search className="h-14 sm:h-16 w-14 sm:w-16 text-teal-400 animated-icon" />
              <Zap className="h-5 w-5 text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 animated-gradient">
              Search Algorithms
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master essential search techniques with focus on{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Linear and Exponential Search
            </span>{" "}
            through practical LeetCode problems
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-full border border-teal-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-xs font-medium text-gray-300">
                  {algorithms.length} Problems
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-lime-500/10 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-gray-300">
                  4 LeetCode Problems
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "all"
              ? "bg-teal-500/20 border-teal-500/50 text-teal-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          All Problems
        </button>
        <button
          onClick={() => setFilter("beginner")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "beginner"
              ? "bg-green-500/20 border-green-500/50 text-green-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          Beginner (Tier 1)
        </button>
        <button
          onClick={() => setFilter("easy")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "easy"
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          Easy+ (Tier 2)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredAlgorithms.map((algo, index) => {
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
                        className={`h-10 w-10 ${isHovered ? "text-white" : algo.iconColor} transition-colors duration-300`}
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
                        <div className="px-2 py-0.5 bg-gray-700/50 rounded-md text-xs text-gray-300 border border-gray-600">
                          {algo.tier}
                        </div>
                      </div>
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-200"}`}
                      >
                        {algo.name}
                      </h2>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-gray-300" : "text-gray-400"}`}
                >
                  {algo.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {algo.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-700/30 rounded text-xs text-gray-300 border border-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

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

                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {algo.platforms.map((platform, platformIndex) => (
                        <span
                          key={platformIndex}
                          className="px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-400 border border-gray-700"
                        >
                          {platform}
                        </span>
                      ))}
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
                          Solve
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlgorithms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No problems found for the selected filter.
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">
            Focused on Linear and Exponential Search with LeetCode problems
          </span>
        </div>
      </div>
    </div>
  );
};

const SearchingPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "LinearSearch":
        return <LinearSearch navigate={navigate} />;
      case "ExponentialSearch":
        return <ExponentialSearch navigate={navigate} />;
      case "SmallestLetter":
        return <SmallestLetter navigate={navigate} />;
      case "UnknownSizeSearch":
        return <UnknownSizeSearch navigate={navigate} />;
      case "KthMissing":
        return <KthMissing navigate={navigate} />;
      case "SpecialArray":
        return <SpecialArray navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow" />
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
          filter: drop-shadow(0 0 20px rgba(45, 212, 191, 0.6));
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(120deg); }
          66% { transform: translateY(-4px) rotate(240deg); }
        }
        .animate-pulse-slow, .animate-pulse-slow-delayed {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slow-delayed {
          animation-delay: 2s;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 20s ease-in-out infinite;
          animation-delay: 10s;
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
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <Brackets className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-semibold text-gray-300">
                Search Algorithms
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

export default SearchingPage;