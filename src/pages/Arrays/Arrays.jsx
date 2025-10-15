import React, { useState } from "react";
import {
  ArrowLeft,
  Droplets,
  Container,
  ToggleRight,
  ArrowUpDown,
  Brackets,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  RefreshCw,
  Search,
  Maximize2,
  Minus,
  Plus,
  Target,
  RotateCcw,
  BarChart3,
  Hash,
  MoveRight,
  Eye,
  ArrowRight,
  Calculator,
  Merge,
  Layers,
  RotateCw,
} from "lucide-react";

// --- Import your specific algorithm visualizer components here ---
import TrappingRainWater from "./TrappingRainWater.jsx";
import ContainerWithMostWater from "./ContainerWithMostWater.jsx";
import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";
import SubarrayRanges from "./SubarrayRanges.jsx";
import FindMaxElement from "./FindMaxElement.jsx";
import FindMinElement from "./FindMinElement.jsx";
import MoveZeros from "./MoveZeros.jsx";
import CountZeros from "./CountZeros.jsx";
import ArraySum from "./ArraySum.jsx";
import ReverseArray from "./ReverseArray.jsx";
import TwoSum from "./TwoSum.jsx";
import ThreeSum from "./3Sum.jsx";
import SplitArrayLargestSum from "./SplitArrayLargestSum.jsx";
import ProductOfArrayExceptSelf from "./ProductOfArrayExceptSelf.jsx";
import MaximumSubarray from "./MaximumSubarray.jsx";
import MergeIntervals from "./MergeIntervals.jsx";
import RotateArray from "./RotateArray.jsx";

function AlgorithmList({ navigate }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  const algorithms = [
    {
      name: "Find Maximum Element",
      number: "1",
      icon: Maximize2,
      description: "Find the largest element in an array.",
      page: "FindMaxElement",
      difficulty: "Basic",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "Traversal",
      timeComplexity: "O(n)",
      platforms: ["All Platforms"],
      tags: ["Beginner", "Traversal"],
    },
    {
      name: "Find Minimum Element",
      number: "2",
      icon: Minus,
      description: "Find the smallest element in an array.",
      page: "FindMinElement",
      difficulty: "Basic",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      technique: "Traversal",
      timeComplexity: "O(n)",
      platforms: ["All Platforms"],
      tags: ["Beginner", "Traversal"],
    },
    {
      name: "Array Sum",
      number: "3",
      icon: Plus,
      description: "Calculate the sum of all elements in an array.",
      page: "ArraySum",
      difficulty: "Basic",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      technique: "Traversal",
      timeComplexity: "O(n)",
      platforms: ["All Platforms"],
      tags: ["Beginner", "Sum"],
    },
    {
      name: "Reverse Array",
      number: "4",
      icon: RefreshCw,
      description: "Reverse the elements of an array in place.",
      page: "ReverseArray",
      difficulty: "Basic",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-purple-500 to-indigo-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Two Pointers",
      timeComplexity: "O(n)",
      platforms: ["All Platforms"],
      tags: ["Beginner", "Two Pointers"],
    },
    // // ===== TIER 2: BEGINNER+ =====
    {
      name: "Two Sum",
      number: "5",
      icon: Target,
      description: "Find two numbers that add up to the target value.",
      page: "TwoSum",
      difficulty: "Easy",
      tier: "Tier 2",
      difficultyColor: "text-blue-400",
      difficultyBg: "bg-blue-400/10",
      difficultyBorder: "border-blue-400/30",
      gradient: "from-orange-500 to-amber-500",
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      technique: "Hashing",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #1", "GfG"],
      tags: ["Hashing", "Pairs"],
    },

    {
      name: "Move Zeros",
      number: "8",
      icon: MoveRight,
      description: "Move all zeros to the end while maintaining order.",
      page: "MoveZeros",
      difficulty: "Easy",
      tier: "Tier 2",
      difficultyColor: "text-blue-400",
      difficultyBg: "bg-blue-400/10",
      difficultyBorder: "border-blue-400/30",
      gradient: "from-violet-500 to-purple-500",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/20",
      borderColor: "border-violet-500/30",
      technique: "Two Pointers",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #283", "GfG"],
      tags: ["Two Pointers", "Partitioning"],
    },
    {
      name: "Move Zeros to End",
      number: "283",
      icon: MoveRight,
      description: "Move all zeros to the end while maintaining order.",
      page: "MoveZeros",
      difficulty: "Easy",
      tier: "Tier 2",
      difficultyColor: "text-blue-400",
      difficultyBg: "bg-blue-400/10",
      difficultyBorder: "border-blue-400/30",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Two Pointers",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #283"],
      tags: ["Two Pointers", "In-place"],
    },
    {
      name: "Count Zeros in Array",
      number: "3",
      icon: Hash,
      description: "Count the number of zero elements in an array.",
      page: "CountZeros",
      difficulty: "Basic",
      tier: "Tier 1",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      technique: "Traversal",
      timeComplexity: "O(n)",
      platforms: ["GfG"],
      tags: ["Beginner", "Counting"],
    },

    {
      name: "Container With Most Water",
      number: "11",
      icon: Container,
      description: "Find two lines that form container with most water.",
      page: "ContainerWithMostWater",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-amber-500 to-orange-500",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      technique: "Two Pointers",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #11", "GfG"],
      tags: ["Two Pointers", "Area"],
    },
    {
      name: "Trapping Rain Water",
      number: "42",
      icon: Droplets,
      description: "Compute how much water can be trapped after raining.",
      page: "TrappingRainWater",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-red-500 to-rose-500",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      borderColor: "border-red-500/30",
      technique: "Two Pointers",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #42", "GfG"],
      tags: ["Two Pointers", "DP", "Water"],
    },
    {
      name: "Max Consecutive Ones III",
      number: "1004",
      icon: ToggleRight,
      description: "Longest subarray of 1s after flipping at most K zeros.",
      page: "MaxConsecutiveOnesIII",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      technique: "Sliding Window",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #1004", "GfG"],
      tags: ["Sliding Window", "Ones"],
    },
    {
      name: "Sum of Subarray Ranges",
      number: "2104",
      icon: ArrowUpDown,
      description: "Sum of differences between max and min in all subarrays.",
      page: "SubarrayRanges",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      technique: "Array",
      timeComplexity: "O(n²)",
      platforms: ["LeetCode #2104", "GfG"],
      tags: ["Subarrays", "Stack"],
    },
    {
      name: "Split Array Largest Sum",
      number: "410",
      icon: BarChart3,
      description:
        "Split array into k parts such that the largest subarray sum is minimized.",
      page: "SplitArrayLargestSum",
      difficulty: "Hard",
      tier: "Tier 3",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-pink-500 to-rose-600",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/20",
      borderColor: "border-pink-500/30",
      technique: "Binary Search + Greedy",
      timeComplexity: "O(n log(sum(nums)))",
      platforms: ["LeetCode #410"],
      tags: ["Binary Search", "Greedy"],
    },
    {
      name: "3Sum",
      number: "6",
      icon: Target,
      description:
        "Find all unique triplets in the array which give the sum of zero.",
      page: "ThreeSum",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-emerald-500 to-green-500",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      technique: "Two Pointers",
      timeComplexity: "O(n²)",
      platforms: ["LeetCode #15", "GfG"],
      tags: ["Two Pointers", "Sorting", "Triplets"],
    },
    {
      name: "Product of Array Except Self",
      number: "238",
      icon: Calculator,
      description:
        "Return an array where each element is the product of all elements except itself, without using division.",
      page: "ProductOfArrayExceptSelf",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-indigo-500 to-purple-500",
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/20",
      borderColor: "border-indigo-500/30",
      technique: "Prefix & Suffix Products",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #238", "GfG"],
      tags: ["Array", "Prefix Sum", "Important"],
    },
    {
      name: "Maximum Subarray",
      number: "53",
      icon: TrendingUp,
      description:
        "Find the contiguous subarray with the largest sum using Kadane's Algorithm.",
      page: "MaximumSubarray",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-green-500 to-teal-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "Kadane's Algorithm",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #53", "GfG"],
      tags: ["DP", "Kadane", "Classic"],
    },
    {
      name: "Merge Intervals",
      number: "56",
      icon: Merge,
      description:
        "Merge all overlapping intervals and return an array of non-overlapping intervals.",
      page: "MergeIntervals",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-orange-500 to-red-500",
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      technique: "Sorting + Greedy",
      timeComplexity: "O(n log n)",
      platforms: ["LeetCode #56", "GfG"],
      tags: ["Intervals", "Sorting", "Important"],
    },
    {
      name: "Rotate Array",
      number: "189",
      icon: RotateCcw,
      description:
        "Rotate the array to the right by k steps in-place with O(1) extra space.",
      page: "RotateArray",
      difficulty: "Medium",
      tier: "Tier 3",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      technique: "Reverse Algorithm",
      timeComplexity: "O(n)",
      platforms: ["LeetCode #189", "GfG"],
      tags: ["Array", "In-place", "Rotation"],
    },
  ];

  const filteredAlgorithms = algorithms.filter((algo) => {
    if (filter === "all") return true;
    if (filter === "beginner") return algo.tier === "Tier 1";
    if (filter === "easy") return algo.tier === "Tier 2";
    if (filter === "intermediate") return algo.tier === "Tier 3";
    return true;
  });

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
              Array Algorithms
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master array problems with powerful techniques like{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              two-pointers
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              sliding windows
            </span>
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

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "all"
              ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
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
              ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          Easy (Tier 2)
        </button>
        <button
          onClick={() => setFilter("intermediate")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "intermediate"
              ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          Intermediate+ (Tier 3)
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
            More array problems coming soon
          </span>
        </div>
      </div>
    </div>
  );
}

const ArrayPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      // Basic problems
      case "FindMaxElement":
        return <FindMaxElement navigate={navigate} />;
      case "FindMinElement":
        return <FindMinElement navigate={navigate} />;
      case "ArraySum":
        return <ArraySum navigate={navigate} />;
      case "ReverseArray":
        return <ReverseArray navigate={navigate} />;
      case "TwoSum":
        return <TwoSum navigate={navigate} />;
      case "RotateArray":
        return <RotateArray navigate={navigate} />;
      case "RemoveDuplicates":
        return <RemoveDuplicates navigate={navigate} />;
      case "MoveZeros":
        return <MoveZeros navigate={navigate} />;
      case "CountZeros":
        return <CountZeros navigate={navigate} />;

      // Existing problems
      case "TrappingRainWater":
        return <TrappingRainWater navigate={navigate} />;
      case "ContainerWithMostWater":
        return <ContainerWithMostWater navigate={navigate} />;
      case "MaxConsecutiveOnesIII":
        return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "SubarrayRanges":
        return <SubarrayRanges navigate={navigate} />;
      case "BestTimeToBuyAndSellStock":
        return <BestTimeToBuyAndSellStock navigate={navigate} />;
      case "SplitArrayLargestSum":
        return <SplitArrayLargestSum navigate={navigate} />;
      case "ThreeSum":
        return <ThreeSum navigate={navigate} />;
      case "ProductOfArrayExceptSelf":
        return <ProductOfArrayExceptSelf navigate={navigate} />;
      case "MaximumSubarray":
        return <MaximumSubarray navigate={navigate} />;
      case "MergeIntervals":
        return <MergeIntervals navigate={navigate} />;

     
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
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <Brackets className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-semibold text-gray-300">
                Array Algorithms
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
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600 cursor-pointer"
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

export default ArrayPage;
