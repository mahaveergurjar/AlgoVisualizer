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
  Wrench,
  ArrowDownUp,
} from "lucide-react";

// --- Import your page components ---
import ArrayPage from "./Arrays/Arrays.jsx";
import SlidingWindowsPage from "./SlidingWindows/SlidingWindows.jsx";
import LinkedListPage from "./LinkedList/LinkedList.jsx";
import StackPage from "./Stack/Stack.jsx";
import TreesPage from "./Trees/Trees.jsx";
import DesignPage from "./Design/Design.jsx";
import SortingPage from "./Sorting/Sorting.jsx";

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
      name: "Sorting",
      icon: ArrowDownUp,
      description:
        "Arrange data efficiently using algorithms like QuickSort, MergeSort, and BubbleSort.",
      page: "Sorting",
      gradient: "from-amber-500 to-yellow-600",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
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
    {
      name: "Design",
      icon: Wrench,
      description:
        "Implement complex data structures combining HashMap, Linked List, and advanced design patterns.",
      page: "Design",
      gradient: "from-teal-500 to-emerald-600",
      iconBg: "bg-teal-500/20",
      borderColor: "border-teal-500/30",
      iconColor: "text-teal-400",
    },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-24 mt-16 relative">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow-delayed" />

        <div className="relative z-10">
          {/* Main Logo and Title */}
          <div className="flex justify-center items-center gap-x-8 mb-12">
            <div className="relative">
              <Shapes className="h-24 w-24 text-blue-500 animated-icon" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-3 -right-3 animate-spin-slow" />
            </div>
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animated-gradient">
              AlgoVisualizer
            </h1>
          </div>

          {/* Hero Description */}
          <div className="space-y-6 mb-12">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-100 max-w-5xl mx-auto leading-tight px-4">
              Master algorithms through{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-text-shimmer">
                interactive visualizations
              </span>
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto px-4 leading-relaxed">
              See complex algorithms come to life with stunning step-by-step
              demonstrations
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 px-4">
            <div className="group px-6 py-3 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-2xl border border-blue-500/40 backdrop-blur-sm hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-default">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-400" />
                <span className="text-base font-semibold text-gray-200">
                  Interactive Learning
                </span>
              </div>
            </div>
            <div className="group px-6 py-3 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-2xl border border-purple-500/40 backdrop-blur-sm hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-default">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-base font-semibold text-gray-200">
                  Visual Demos
                </span>
              </div>
            </div>
            <div className="group px-6 py-3 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-2xl border border-pink-500/40 backdrop-blur-sm hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 cursor-default">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-pink-400" />
                <span className="text-base font-semibold text-gray-200">
                  Master Topics
                </span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="inline-block animate-bounce-subtle">
            <div className="px-6 py-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600/50 backdrop-blur-sm">
              <p className="text-gray-300 text-base font-medium flex items-center gap-2">
                <span>Choose a category below to start learning</span>
                <span className="text-xl">↓</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
              className={`group relative h-48 transition-all duration-500 transform animate-fade-in-up ${
                isPlaceholder
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer hover:-translate-y-4 hover:scale-[1.03]"
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Enhanced shadow effect */}
              <div
                className={`absolute -inset-2 rounded-3xl bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-25 transition-all duration-500 blur-md`}
              />
              
              {/* Main card container */}
              <div
                className={`relative h-full bg-gray-900/95 backdrop-blur-sm rounded-3xl p-6 border ${cat.borderColor} transition-all duration-500 ${
                  isHovered && !isPlaceholder 
                    ? "shadow-2xl shadow-gray-900/60" 
                    : "shadow-xl shadow-gray-900/40"
                }`}
              >
                <div className="h-full flex flex-col justify-between">
                  {/* Header section with icon and title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`p-4 ${
                        cat.iconBg
                      } rounded-2xl transition-all duration-300 ${
                        !isPlaceholder &&
                        "group-hover:scale-110 group-hover:rotate-6"
                      }`}
                    >
                      <Icon
                        className={`h-10 w-10 ${
                          isHovered && !isPlaceholder
                            ? "text-white"
                            : cat.iconColor
                        } transition-colors duration-300`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className={`text-xl font-bold transition-colors duration-300 leading-tight ${
                          isHovered && !isPlaceholder
                            ? "text-white"
                            : "text-gray-200"
                        }`}
                      >
                        {cat.name}
                      </h2>
                    </div>
                  </div>

                  {/* COMING SOON badge positioned in corner */}
                  {isPlaceholder && (
                    <div className="absolute -top-1 -right-1 z-20">
                      <div className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 text-xs font-bold rounded-full border border-gray-600 animate-pulse-subtle shadow-lg">
                        COMING SOON
                      </div>
                    </div>
                  )}

                  {/* Description section */}
                  <div className="flex-1 flex flex-col justify-between">
                    <p
                      className={`text-sm leading-relaxed transition-colors duration-300 line-clamp-3 ${
                        isHovered && !isPlaceholder
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      {cat.description}
                    </p>

                    {/* Interactive footer */}
                    {!isPlaceholder && (
                      <div
                        className={`pt-4 mt-4 border-t border-gray-800/50 flex items-center justify-between transition-all duration-300 ${
                          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                      >
                        <span className="text-xs text-gray-400 font-medium">
                          Click to explore
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse" />
                          <div
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
      case "Sorting":
        return <SortingPage navigate={navigate} />;
      case "Trees":
        return <TreesPage navigate={navigate} />;
      case "Design":
        return <DesignPage navigate={navigate} />;

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

        /* Enhanced card hover effects */
        .group:hover .card-shadow {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Line clamp utility for text truncation */
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced card hover glow effect */
        .group:hover .card-glow {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }
      `}</style>

      <div className="relative z-10">{children}</div>
    </div>
  );

  return <PageWrapper>{renderPage()}</PageWrapper>;
};

export default HomePage;
