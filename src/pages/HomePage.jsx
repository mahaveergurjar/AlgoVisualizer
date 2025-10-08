import React, { useState } from "react";
import {
  ArrowLeft,
  Shapes,
  Brackets,
  GitBranch,
  Layers,
  ArrowRightLeft,
  RectangleHorizontal,
  SearchCode,
  Repeat,
  Binary,
  Network,
  Filter,
  Share2,
  Workflow,
  Sparkles,
  Zap,
  Trophy,
} from "lucide-react";

// --- Import your page components ---
import ArrayPage from "./Arrays/Arrays.jsx";
import SlidingWindowsPage from "./SlidingWindows/SlidingWindows.jsx";
import LinkedListPage from "./LinkedList/LinkedList.jsx";
import StackPage from "./Stack/Stack.jsx";
import TreesPage from "./Trees/Trees.jsx";

const AlgorithmCategories = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const categories = [
    {
      name: "Arrays",
      icon: Brackets,
      description: "Contiguous data, two-pointers, and traversals.",
      page: "Arrays",
      gradient: "from-sky-500 to-blue-600",
      iconBg: "bg-sky-500/20",
      borderColor: "border-sky-500/30",
      iconColor: "text-sky-400",
    },
    {
      name: "Linked List",
      icon: GitBranch,
      description: "Nodes, pointers, cycle detection, and list manipulation.",
      page: "LinkedList",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      name: "Stack",
      icon: Layers,
      description:
        "LIFO-based problems, expression evaluation, and histograms.",
      page: "Stack",
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/20",
      borderColor: "border-violet-500/30",
      iconColor: "text-violet-400",
    },
    {
      name: "Queue",
      icon: ArrowRightLeft,
      description: "FIFO principle, breadth-first search, and schedulers.",
      page: "placeholder",
      gradient: "from-rose-500 to-pink-600",
      iconBg: "bg-rose-500/20",
      borderColor: "border-rose-500/30",
      iconColor: "text-rose-400",
    },
    {
      name: "Sliding Window",
      icon: RectangleHorizontal,
      description: "Efficiently process subarrays, substrings, and ranges.",
      page: "SlidingWindows",
      gradient: "from-cyan-500 to-teal-600",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
    },
    {
      name: "Binary Search",
      icon: SearchCode,
      description: "Logarithmic time search in sorted data.",
      page: "placeholder",
      gradient: "from-teal-500 to-emerald-600",
      iconBg: "bg-teal-500/20",
      borderColor: "border-teal-500/30",
      iconColor: "text-teal-400",
    },
    {
      name: "Recursion",
      icon: Repeat,
      description: "Solve problems by breaking them into smaller instances.",
      page: "placeholder",
      gradient: "from-indigo-500 to-blue-600",
      iconBg: "bg-indigo-500/20",
      borderColor: "border-indigo-500/30",
      iconColor: "text-indigo-400",
    },
    {
      name: "Bit Manipulation",
      icon: Binary,
      description:
        "Work with data at the binary level for ultimate efficiency.",
      page: "placeholder",
      gradient: "from-slate-500 to-gray-600",
      iconBg: "bg-slate-500/20",
      borderColor: "border-slate-500/30",
      iconColor: "text-slate-400",
    },
    {
      name: "Trees",
      icon: Network,
      description:
        "Hierarchical data, traversals (BFS, DFS), and binary trees.",
      page: "Trees",
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    {
      name: "Heaps",
      icon: Filter,
      description: "Priority queues and finding min/max elements efficiently.",
      page: "placeholder",
      gradient: "from-orange-500 to-amber-600",
      iconBg: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
    },
    {
      name: "Graphs",
      icon: Share2,
      description: "Networks of nodes, pathfinding, and connectivity.",
      page: "placeholder",
      gradient: "from-lime-500 to-green-600",
      iconBg: "bg-lime-500/20",
      borderColor: "border-lime-500/30",
      iconColor: "text-lime-400",
    },
    {
      name: "Dynamic Programming",
      icon: Workflow,
      description: "Optimization by solving and caching sub-problems.",
      page: "placeholder",
      gradient: "from-fuchsia-500 to-purple-600",
      iconBg: "bg-fuchsia-500/20",
      borderColor: "border-fuchsia-500/30",
      iconColor: "text-fuchsia-400",
    },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-20 mt-12 relative">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow-delayed" />

        <div className="relative z-10">
          <div className="flex justify-center items-center gap-x-6 mb-8">
            <div className="relative">
              <Shapes className="h-20 w-20 text-blue-500 animated-icon" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-spin-slow" />
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animated-gradient">
              AlgoVisualizer
            </h1>
          </div>

          <div className="space-y-4 mb-10">
            <p className="text-xl sm:text-2xl md:text-3xl font-light text-gray-200 max-w-4xl mx-auto leading-relaxed px-4">
              Master algorithms through{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-text-shimmer">
                interactive visualizations
              </span>
            </p>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              See complex algorithms come to life with stunning step-by-step
              demonstrations
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
            <div className="group px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  Interactive Learning
                </span>
              </div>
            </div>
            <div className="group px-5 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">
                  Visual Demos
                </span>
              </div>
            </div>
            <div className="group px-5 py-2.5 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full border border-pink-500/30 backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-medium text-gray-300">
                  Master Topics
                </span>
              </div>
            </div>
          </div>

          <div className="inline-block animate-bounce-subtle">
            <p className="text-gray-500 text-sm font-medium">
              Choose a category below to start learning ↓
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map((cat, index) => {
          const isPlaceholder = cat.page === "placeholder";
          const isHovered = hoveredIndex === index;
          const Icon = cat.icon;

          return (
            <div
              key={cat.name}
              onClick={() => !isPlaceholder && navigate(cat.page)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative rounded-2xl p-6 transition-all duration-500 transform animate-fade-in-up ${
                isPlaceholder
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer hover:-translate-y-2 hover:scale-105"
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                background:
                  isHovered && !isPlaceholder
                    ? "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))"
                    : "linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.8))",
              }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
              />

              <div
                className={`relative bg-gray-900/90 backdrop-blur-sm rounded-xl p-5 border ${cat.borderColor} transition-all duration-300`}
              >
                {isPlaceholder && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 text-xs font-bold rounded-full border border-gray-600 animate-pulse-subtle">
                      COMING SOON
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 ${
                        cat.iconBg
                      } rounded-xl transition-all duration-300 ${
                        !isPlaceholder &&
                        "group-hover:scale-110 group-hover:rotate-6"
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 ${
                          isHovered && !isPlaceholder
                            ? "text-white"
                            : cat.iconColor
                        } transition-colors duration-300`}
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 ${
                          isHovered && !isPlaceholder
                            ? "text-white"
                            : "text-gray-200"
                        }`}
                      >
                        {cat.name}
                      </h2>
                    </div>
                  </div>

                  <p
                    className={`text-sm leading-relaxed transition-colors duration-300 ${
                      isHovered && !isPlaceholder
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {cat.description}
                  </p>

                  {!isPlaceholder && (
                    <div
                      className={`pt-3 mt-2 border-t border-gray-800 flex items-center justify-between transition-all duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span className="text-xs text-gray-400 font-medium">
                        Click to explore
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse" />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-600 text-sm">
          More categories coming soon • Built with React & Tailwind CSS
        </p>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [page, setPage] = useState("home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "Arrays":
        return <ArrayPage navigate={navigate} />;
      case "SlidingWindows":
        return <SlidingWindowsPage navigate={navigate} />;
      case "LinkedList":
        return <LinkedListPage navigate={navigate} />;
      case "Stack":
        return <StackPage navigate={navigate} />;
      case "Trees":
        return <TreesPage navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmCategories navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" />
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

        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s ease-in-out infinite;
        }
        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animated-icon {
          animation: float-rotate 8s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
        }
        @keyframes float-rotate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(-5px) rotate(240deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slow-delayed {
          animation: pulse-slow 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
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

  return <PageWrapper>{renderPage()}</PageWrapper>;
};

export default HomePage;
