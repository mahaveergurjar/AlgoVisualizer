import React, { useState } from "react";
import {
  ArrowLeft,
  RectangleHorizontal,
  ToggleRight,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  BarChart3,
  ArrowRight,
  Hash, // Added from HEAD
  ShoppingBasket,
  Target, // Added from HEAD
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import MaxConsecutiveOnesIII from "./MaxConsecutiveOnesIII.jsx";
import SlidingWindowMaximum from "./SlidingWindowMaximum.jsx";
import FruitIntoBaskets from "./FruitsIntoBaskets.jsx";
import LongestSubstring from "./LongestSubstring.jsx"; // ✅ Maintainer's new import
import MinimumWindow from "./MinimumWindow.jsx"; // ✅ Maintainer's new import

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: RectangleHorizontal,
  gradient: "from-gray-700 to-gray-800",
  borderColor: "border-gray-600",
  iconBg: "bg-gray-700/20",
  iconColor: "text-gray-300",
};


const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all"); // ✅ Keep maintainer's filter state

  // ✅ Get Sliding Window problems directly from the master catalog
  const slidingWindowAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'SlidingWindows');

  // ❌ The local 'algorithms' array is gone.

  // ✅ Keep maintainer's filter logic, using the catalog data
  const filteredAlgorithms = slidingWindowAlgorithms.filter((algo) => {
    // Note: Add 'tier' property to catalog.js items for this filter to work fully
    if (filter === "all") return true;
    if (filter === "medium") return algo.tier === "Tier 2"; // Assuming "easy" filter was meant for Medium/Tier 2
    if (filter === "hard") return algo.tier === "Tier 3";
    return true;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <RectangleHorizontal className="h-14 sm:h-16 w-14 sm:w-16 text-cyan-400 animated-icon" />
              <Zap className="h-5 w-5 text-sky-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 animated-gradient">
              Sliding Window
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master the art of efficiently processing{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">contiguous subarrays</span>{" "}
            by maintaining a{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">dynamic window</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-sky-500/10 rounded-full border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-gray-300">{slidingWindowAlgorithms.length} Problem{slidingWindowAlgorithms.length > 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-gray-300">Optimal Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Keep maintainer's filter buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "all"
              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          All Problems
        </button>
        <button
          onClick={() => setFilter("medium")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "medium"
              ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          Medium (Tier 2)
        </button>
        <button
          onClick={() => setFilter("hard")}
          className={`px-4 py-2 rounded-full border backdrop-blur-sm transition-all ${
            filter === "hard"
              ? "bg-red-500/20 border-red-500/50 text-red-300"
              : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          Hard (Tier 3)
        </button>
      </div>

      {/* ✅ Keep your card rendering logic using catalog data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlgorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon || defaultVisuals.icon;
          return (
            <div
              key={algo.subpage}
              onClick={() => navigate(algo.subpage)}
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
                        <span className="text-xs font-mono text-gray-500">#{algo.number}</span>
                        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>
                          {algo.difficulty}
                        </div>
                        <div className="px-2 py-0.5 bg-gray-700/50 rounded-md text-xs text-gray-300 border border-gray-600">
                          {algo.tier}
                        </div>
                      </div>
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-200"}`}>{algo.label}</h2>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-gray-300" : "text-gray-400"}`}>{algo.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(algo.tags || []).map((tag, tagIndex) => ( <span key={tagIndex} className="..."> {tag} </span> ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-400" /><span className="text-xs font-medium text-gray-400">{algo.technique}</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-400" /><span className="text-xs font-mono text-gray-400">{algo.timeComplexity}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex flex-wrap gap-1">
                      {(algo.platforms || []).map((platform, platformIndex) => ( <span key={platformIndex} className="..."> {platform} </span> ))}
                    </div>
                    <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                      <div className="flex items-center gap-1"><span className="text-xs font-medium text-gray-400">Solve</span><ArrowRight className="h-4 w-4 text-gray-400" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filteredAlgorithms.length === 0 && ( <div className="...">...</div> )}
      <div className="mt-12 text-center"> ... </div>
    </div>
  );
};

const SlidingWindowsPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "MaxConsecutiveOnesIII": return <MaxConsecutiveOnesIII navigate={navigate} />;
      case "SlidingWindowMaximum": return <SlidingWindowMaximum navigate={navigate} />;
      case "LongestSubstring": return <LongestSubstring navigate={navigate} />; // ✅ Keep maintainer's route
      case "MinimumWindow": return <MinimumWindow navigate={navigate} />; // ✅ Keep maintainer's route
      case "FruitIntoBaskets": return <FruitIntoBaskets navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
        {/* ... Styles and background elements remain the same ... */}
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
        {/* ... Navigation remains the same ... */}
      {renderPage()}
    </PageWrapper>
  );
};

export default SlidingWindowsPage;