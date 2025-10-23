import React, { useState } from "react";
import {
  ArrowLeft,
  Brackets,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  ArrowRight,
  Layers, // Keep Layers for 4-Sum icon or fallback
  // Add any other icons needed by algorithms in catalog.js for Arrays
  Container, Droplets, ToggleRight, ArrowUpDown, Target, Calculator, Merge, Maximize2, Minus, Plus, MoveRight, BarChart3, RotateCcw, RefreshCw, Hash
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
import FourSum from "./4-sum.jsx"; // ✅ Maintainer's new import is kept
import SplitArrayLargestSum from "./SplitArrayLargestSum.jsx";
import SquaresOfSortedArray from "./SquaresOfSortedArray.tsx";
import ProductOfArrayExceptSelf from "./ProductOfArrayExceptSelf.jsx";
import MaximumSubarray from "./MaximumSubarray.jsx";
import MergeIntervals from "./MergeIntervals.jsx";
import RotateArray from "./RotateArray.jsx";
import MaximumGap from "./MaximumGap.jsx";

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Brackets,
  gradient: "from-gray-700 to-gray-800",
  borderColor: "border-gray-600",
  iconBg: "bg-gray-700/20",
  iconColor: "text-gray-300",
  difficulty: "N/A",
  tier: "N/A",
  difficultyColor: "text-gray-400",
  difficultyBg: "bg-gray-400/10",
  difficultyBorder: "border-gray-400/30",
  description: "An array-based algorithm.",
  tags: [],
  technique: "Array Logic",
  timeComplexity: "N/A",
  platforms: [],
};

function AlgorithmList({ navigate }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  // ✅ Get Array problems directly from the master catalog
  const arrayProblems = PROBLEM_CATALOG.filter(p => p.category === 'Arrays');

  // ❌ The old local 'algorithms' array is gone.

  // ✅ Use the filtered list derived from the master catalog
  const filteredAlgorithms = arrayProblems.filter((algo) => {
    // Note: Add 'tier' property to catalog.js items for this filter to work fully
    if (filter === "all") return true;
    if (filter === "beginner") return algo.tier === "Tier 1";
    if (filter === "easy") return algo.tier === "Tier 2";
    if (filter === "intermediate") return algo.tier === "Tier 3";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        {/* Header content remains the same */}
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
                  {arrayProblems.length} Problems {/* ✅ Use arrayProblems.length */}
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
      {/* Filter buttons remain the same */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button onClick={() => setFilter("all")} className={`...`}>All Problems</button>
        <button onClick={() => setFilter("beginner")} className={`...`}>Beginner (Tier 1)</button>
        <button onClick={() => setFilter("easy")} className={`...`}>Easy (Tier 2)</button>
        <button onClick={() => setFilter("intermediate")} className={`...`}>Intermediate+ (Tier 3)</button>
      </div>
      {/* Card rendering uses the filtered list from catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon; // Use default icon if needed
          return (
            <div
              key={algo.subpage} // Use unique subpage from catalog
              onClick={() => navigate(algo.subpage)} // Navigate using subpage
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor || defaultVisuals.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${algo.iconBg || defaultVisuals.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className={`h-10 w-10 ${isHovered ? "text-white" : (algo.iconColor || defaultVisuals.iconColor)} transition-colors duration-300`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">#{algo.number || 'N/A'}</span>
                        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg || defaultVisuals.difficultyBg} ${algo.difficultyColor || defaultVisuals.difficultyColor} border ${algo.difficultyBorder || defaultVisuals.difficultyBorder}`}>
                          {algo.difficulty || defaultVisuals.difficulty}
                        </div>
                        <div className="px-2 py-0.5 bg-gray-700/50 rounded-md text-xs text-gray-300 border border-gray-600">
                          {algo.tier || defaultVisuals.tier}
                        </div>
                      </div>
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-200"}`}>
                        {algo.label} {/* ✅ Use label from catalog */}
                      </h2>
                    </div>
                  </div>
                  {/* ✅ StarButton included */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-gray-300" : "text-gray-400"}`}>
                  {algo.description || defaultVisuals.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(algo.tags || defaultVisuals.tags).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-gray-700/30 rounded text-xs text-gray-300 border border-gray-600">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-medium text-gray-400">{algo.technique || defaultVisuals.technique}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-mono text-gray-400">{algo.timeComplexity || defaultVisuals.timeComplexity}</span>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-400">Solve</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer remains the same */}
      {filteredAlgorithms.length === 0 && ( <div className="...">...</div> )}
      <div className="mt-12 text-center"> ... </div>
    </div>
  );
}

const ArrayPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);
  const renderPage = () => {
    switch (page) {
      // Basic problems
      case "FindMaxElement": return <FindMaxElement navigate={navigate} />;
      case "FindMinElement": return <FindMinElement navigate={navigate} />;
      case "ArraySum": return <ArraySum navigate={navigate} />;
      case "ReverseArray": return <ReverseArray navigate={navigate} />;
      case "TwoSum": return <TwoSum navigate={navigate} />;
      case "RotateArray": return <RotateArray navigate={navigate} />;
      case "MoveZeros": return <MoveZeros navigate={navigate} />;
      case "CountZeros": return <CountZeros navigate={navigate} />;
      case "SquaresOfSortedArray": return <SquaresOfSortedArray navigate={navigate} />;
      case "MaximumGap": return <MaximumGap navigate={navigate} />;
      case "4-Sum": return <FourSum navigate={navigate} />; // ✅ Maintainer's new route is kept

      // Existing problems from catalog
      case "TrappingRainWater": return <TrappingRainWater navigate={navigate} />;
      case "ContainerWithMostWater": return <ContainerWithMostWater navigate={navigate} />;
      case "MaxConsecutiveOnesIII": return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "SubarrayRanges": return <SubarrayRanges navigate={navigate} />;
      case "BestTimeToBuyAndSellStock": /* This case might be needed if it exists in catalog.js */ break; // Assuming it doesn't exist or handled elsewhere
      case "SplitArrayLargestSum": return <SplitArrayLargestSum navigate={navigate} />;
      case "ThreeSum": return <ThreeSum navigate={navigate} />;
      case "ProductOfArrayExceptSelf": return <ProductOfArrayExceptSelf navigate={navigate} />;
      case "MaximumSubarray": return <MaximumSubarray navigate={navigate} />;
      case "MergeIntervals": return <MergeIntervals navigate={navigate} />;

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

export default ArrayPage;