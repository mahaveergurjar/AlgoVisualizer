import React, { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Zap, 
  ArrowRight, 
  TrendingUp,
  Code2,
  Users,
  Target,
  Circle,
} from "lucide-react";

// --- Import your specific algorithm visualizer components ---
import BestTimeStockII from "./BestTimeStockII";
import TwoCityScheduling from "./TwoCityScheduling";
import JobScheduling from "./JobScheduling.jsx"; // ✅ Maintainer's new import

// --- ✅ Import the master catalog and your StarButton ---
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton';

// ✅ (Optional but Recommended) Default values for visual properties
const defaultVisuals = {
  icon: Zap,
  gradient: "from-gray-700 to-gray-800",
  borderColor: "border-gray-600",
  iconBg: "bg-gray-700/20",
  iconColor: "text-gray-300",
};

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [filter, setFilter] = useState("all"); // ✅ Keep maintainer's filter state

  // ✅ Get Greedy problems directly from the master catalog
  const greedyAlgorithms = PROBLEM_CATALOG.filter(p => p.category === 'GreedyAlgorithms');

  // ❌ The local 'algorithms' array has been DELETED.

  // ✅ Keep maintainer's filter logic, using the catalog data
  const filteredAlgorithms = greedyAlgorithms.filter(algo => {
    if (filter === "all") return true;
    if (filter === "beginner") return algo.tier === "Tier 1";
    if (filter === "medium") return algo.tier === "Tier 2"; // Changed from 'easy' to 'medium' to match button text
    if (filter === "hard") return algo.tier === "Tier 3";
    return true; // Changed from false to true to include all items if no filter matches (though 'all' covers this)
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        {/* ... Header content ... */}
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Zap className="h-14 sm:h-16 w-14 sm:w-16 text-pink-300 animated-icon" />
              <Zap className="h-5 w-5 text-pink-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 animated-gradient">
              Greedy Algorithms
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master greedy optimization with powerful techniques like{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-300">
              local optimal choices
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              profit maximization
            </span>.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full border border-amber-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-medium text-gray-300">
                  {greedyAlgorithms.length} Problems
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-gray-300">
                  Optimal Solutions
                </span>
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
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredAlgorithms.map((algo, index) => {
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
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient || defaultVisuals.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />
              <div
                className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor || defaultVisuals.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 ${algo.iconBg || defaultVisuals.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <Icon
                        className={`h-10 w-10 ${isHovered ? "text-white" : (algo.iconColor || defaultVisuals.iconColor)} transition-colors duration-300`}
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
                        {algo.label} {/* ✅ Use label */}
                      </h2>
                    </div>
                  </div>
                  {/* ✅ Add the StarButton here */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <StarButton problemId={algo.subpage} />
                  </div>
                </div>
                <p
                  className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${isHovered ? "text-gray-300" : "text-gray-400"}`}
                >
                  {algo.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(algo.tags || []).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-gray-700/30 rounded text-xs text-gray-300 border border-gray-600">{tag}</span>
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
                      {(algo.platforms || []).map((platform, platformIndex) => (
                        <span key={platformIndex} className="px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-400 border border-gray-700">{platform}</span>
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
      <div className="mt-12 text-center"> ... </div>
    </div>
  );
};

// Placeholder components for algorithm visualizers
const JumpGameIIPlaceholder = ({ navigate }) => (
  <div className="text-center py-20">
    <div className="text-2xl text-gray-400">Jump Game II Visualizer - Coming Soon</div>
    <button onClick={() => navigate("home")} className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
      Back to Problems
    </button>
  </div>
);

const GasStationPlaceholder = ({ navigate }) => (
  <div className="text-center py-20">
    <div className="text-2xl text-gray-400">Gas Station Visualizer - Coming Soon</div>
    <button onClick={() => navigate("home")} className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">
      Back to Problems
    </button>
  </div>
);

const GreedyPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "BestTimeStockII": return <BestTimeStockII navigate={navigate} />;
      case "TwoCityScheduling": return <TwoCityScheduling navigate={navigate} />;
      case "JumpGameII": return <JumpGameIIPlaceholder navigate={navigate} />;
      case "GasStation": return <GasStationPlaceholder navigate={navigate} />;
      case "JobScheduling": return <JobScheduling navigate={navigate} />; // ✅ Keep maintainer's route
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      {/* ... Page wrapper styles ... */}
    </div>
  );

  return (
    <PageWrapper>
      {/* ... Navigation logic ... */}
      {renderPage()}
    </PageWrapper>
  );
};

export default GreedyPage;