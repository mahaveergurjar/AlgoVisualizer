import React, { useState } from "react";
import {
  ArrowLeft,
  Filter,
  Star,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  Code2,
  Brackets,
  Hash,
  Layers,
  Target,
  Grid,
  List,
  Puzzle,
  Map,
  MoveDiagonal,
} from "lucide-react";

import PermutationsVisualizer from "./Permutations.jsx";
import WordSearchVisualizer from "./WordSearch.jsx";
import SudokuSolver from "./SudokuSolver.jsx";
import ExpressionAddOperators from "./ExpressionAddOperators.jsx";
import KnightsTourVisualizer from "./KnightsTour.jsx"; // 🆕 NEW IMPORT

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter] = useState("all");

  const algorithms = [
    {
      name: "Word Search",
      number: "79",
      icon: Map,
      description:
        "Search for a word in a 2D grid of characters using backtracking.",
      page: "WordSearchVisualizer",
      difficulty: "Medium",
      tier: "Tier 2",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-red-500 to-rose-500",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      borderColor: "border-red-500/30",
      technique: "Backtracking",
      timeComplexity: "O(M×N×4^L)",
      platforms: ["LeetCode #79", "GfG"],
      tags: ["Grid", "DFS", "String Matching"],
    },
    {
      name: "Permutations",
      number: "46",
      icon: List,
      description:
        "Generate all possible permutations of a distinct integers array.",
      page: "PermutationsVisualizer",
      difficulty: "Medium",
      tier: "Tier 2",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-green-500 to-teal-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "Backtracking",
      timeComplexity: "O(N×N!)",
      platforms: ["LeetCode #46", "GfG"],
      tags: ["Combinatorics", "Recursion"],
    },
    {
      name: "Sudoku Solver",
      number: "37",
      icon: Puzzle,
      description:
        "Solve a 9x9 Sudoku puzzle by filling empty cells using backtracking.",
      page: "SudokuSolver",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-blue-500 to-indigo-500",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Backtracking",
      timeComplexity: "O(9^(N*N))",
      platforms: ["LeetCode #37", "GfG"],
      tags: ["Grid", "Recursion", "Matrix"],
    },
    {
      name: "Expression Add Operators",
      number: "282",
      icon: Layers,
      description:
        "Insert +, -, * between digits to make expressions evaluate to a target.",
      page: "ExpressionAddOperators",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-purple-500 to-fuchsia-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Backtracking + Expression Parsing",
      timeComplexity: "O(4^N)",
      platforms: ["LeetCode #282", "GfG"],
      tags: ["Strings", "Math", "Recursion", "Operators"],
    },
    // 🆕 NEW ADDITION
    {
      name: "Knight's Tour",
      number: "Backtracking Challenge",
      icon: MoveDiagonal,
      description:
        "Move a knight on a chessboard to visit every square exactly once.",
      page: "KnightsTourVisualizer",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-amber-500 to-orange-500",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      technique: "Backtracking + Graph Traversal",
      timeComplexity: "O(8^(N*N))",
      platforms: ["Classic Backtracking Problem"],
      tags: ["Recursion", "DFS", "Chess", "Matrix"],
    },
  ];

  const filteredAlgorithms = algorithms.filter((algo) => {
    if (filter === "all") return true;
    if (filter === "medium") return algo.tier === "Tier 2";
    if (filter === "hard") return algo.tier === "Tier 3";
    return false;
  });

  // 🔹 Rest of your UI code (no change)
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* ...header and filters stay same... */}

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
                        className={`h-10 w-10 ${
                          isHovered ? "text-white" : algo.iconColor
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
                        <div className="px-2 py-0.5 bg-gray-700/50 rounded-md text-xs text-gray-300 border border-gray-600">
                          {algo.tier}
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
                    <span className="text-xs font-medium text-gray-400">
                      Solve
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BacktrackingPage = ({ navigate: initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "SudokuSolver":
        return <SudokuSolver navigate={navigate} />;
      case "PermutationsVisualizer":
        return <PermutationsVisualizer />;
      case "WordSearchVisualizer":
        return <WordSearchVisualizer />;
      case "ExpressionAddOperators":
        return <ExpressionAddOperators navigate={navigate} />;
      case "KnightsTourVisualizer": // 🆕 NEW CASE
        return <KnightsTourVisualizer navigate={navigate} />;
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      {renderPage()}
    </div>
  );
};

export default BacktrackingPage;
