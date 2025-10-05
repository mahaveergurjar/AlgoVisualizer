import React, { useState } from "react";
import {
  // Navigation
  Home,
  ArrowLeft,
  // Hero Icon
  Shapes,
  // Category Icons
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
} from "lucide-react";

// --- Import your page components ---
import ArrayPage from "./Arrays/Arrays.jsx";
import SlidingWindowsPage from "./SlidingWindows/SlidingWindows.jsx";
import LinkedListPage from "./LinkedList/LinkedList.jsx";
import StackPage from "./Stack/Stack.jsx";

// This component shows the main categories on the homepage.
const AlgorithmCategories = ({ navigate }) => {
  const categories = [
    // ... (category data remains the same as before)
    {
      name: "Arrays",
      icon: <Brackets className="h-9 w-9 text-sky-400" />,
      description: "Contiguous data, two-pointers, and traversals.",
      page: "Arrays",
      hoverColor: "hover:border-sky-500 hover:shadow-sky-500/20",
    },
    {
      name: "Linked List",
      icon: <GitBranch className="h-9 w-9 text-blue-400" />,
      description: "Nodes, pointers, cycle detection, and list manipulation.",
      page: "LinkedList",
      hoverColor: "hover:border-blue-500 hover:shadow-blue-500/20",
    },
    {
      name: "Stack",
      icon: <Layers className="h-9 w-9 text-violet-400" />,
      description:
        "LIFO-based problems, expression evaluation, and histograms.",
      page: "Stack",
      hoverColor: "hover:border-violet-500 hover:shadow-violet-500/20",
    },
    {
      name: "Queue",
      icon: <ArrowRightLeft className="h-9 w-9 text-rose-400" />,
      description: "FIFO principle, breadth-first search, and schedulers.",
      page: "placeholder",
      hoverColor: "hover:border-rose-500 hover:shadow-rose-500/20",
    },
    {
      name: "Sliding Window",
      icon: <RectangleHorizontal className="h-9 w-9 text-cyan-400" />,
      description: "Efficiently process subarrays, substrings, and ranges.",
      page: "SlidingWindows",
      hoverColor: "hover:border-cyan-500 hover:shadow-cyan-500/20",
    },
    {
      name: "Binary Search",
      icon: <SearchCode className="h-9 w-9 text-teal-400" />,
      description: "Logarithmic time search in sorted data.",
      page: "placeholder",
      hoverColor: "hover:border-teal-500 hover:shadow-teal-500/20",
    },
    {
      name: "Recursion",
      icon: <Repeat className="h-9 w-9 text-indigo-400" />,
      description: "Solve problems by breaking them into smaller instances.",
      page: "placeholder",
      hoverColor: "hover:border-indigo-500 hover:shadow-indigo-500/20",
    },
    {
      name: "Bit Manipulation",
      icon: <Binary className="h-9 w-9 text-gray-400" />,
      description:
        "Work with data at the binary level for ultimate efficiency.",
      page: "placeholder",
      hoverColor: "hover:border-gray-500 hover:shadow-gray-500/20",
    },
    {
      name: "Trees",
      icon: <Network className="h-9 w-9 text-emerald-400" />,
      description:
        "Hierarchical data, traversals (BFS, DFS), and binary trees.",
      page: "placeholder",
      hoverColor: "hover:border-emerald-500 hover:shadow-emerald-500/20",
    },
    {
      name: "Heaps",
      icon: <Filter className="h-9 w-9 text-orange-400" />,
      description: "Priority queues and finding min/max elements efficiently.",
      page: "placeholder",
      hoverColor: "hover:border-orange-500 hover:shadow-orange-500/20",
    },
    {
      name: "Graphs",
      icon: <Share2 className="h-9 w-9 text-lime-400" />,
      description: "Networks of nodes, pathfinding, and connectivity.",
      page: "placeholder",
      hoverColor: "hover:border-lime-500 hover:shadow-lime-500/20",
    },
    {
      name: "Dynamic Programming",
      icon: <Workflow className="h-9 w-9 text-fuchsia-400" />,
      description: "Optimization by solving and caching sub-problems.",
      page: "placeholder",
      hoverColor: "hover:border-fuchsia-500 hover:shadow-fuchsia-500/20",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="text-center mb-20 mt-12">
        <div className="flex justify-center items-center gap-x-6 mb-4">
          <Shapes className="h-20 w-20 text-gray-600 animated-icon" />
          <h1 className="text-8xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 animated-gradient">
            AlgoVisualizer
          </h1>
        </div>
        <p className="text-2xl text-gray-400 mt-6 max-w-3xl mx-auto leading-relaxed">
          The best way to understand complex algorithms is to see them in
          action.
          <br />
          <span className="font-semibold text-gray-300">
            Choose a category to begin your journey.
          </span>
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((cat, index) => {
          const isPlaceholder = cat.page === "placeholder";
          return (
            <div
              key={cat.name}
              onClick={() => !isPlaceholder && navigate(cat.page)}
              className={`group relative bg-gray-900 rounded-xl p-6 border border-gray-700 transition-all duration-300 transform flex flex-col justify-between animate-fade-in-up
                ${
                  isPlaceholder
                    ? "opacity-60 cursor-not-allowed"
                    : `cursor-pointer hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl ${cat.hoverColor}`
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isPlaceholder && (
                <div className="absolute top-3 right-3 bg-gray-600 text-gray-200 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  SOON
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {cat.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-100">
                    {cat.name}
                  </h2>
                </div>
                <p className="text-gray-400 text-base leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// This is the main component that controls all page navigation.
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
      case "home":
      default:
        return <AlgorithmCategories navigate={navigate} />;
    }
  };

  // This is a wrapper to inject the background style and CSS animations
  const PageWrapper = ({ children }) => (
    <div
      className="bg-gray-900 text-white min-h-screen"
      style={{
        backgroundImage: `radial-gradient(circle at top, rgba(31, 41, 55, 0.8), transparent), 
                       radial-gradient(circle at bottom, rgba(17, 24, 39, 0.9), transparent)`,
      }}
    >
      <style>{`
        .animated-gradient {
          background-size: 200% auto;
          animation: gradient-animation 5s ease-in-out infinite;
        }
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fade-in-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* --- New Animation for the Icon --- */
        .animated-icon {
          animation: float-rotate 12s ease-in-out infinite;
        }
        @keyframes float-rotate {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
      `}</style>
      {children}
    </div>
  );

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-gray-900/70 backdrop-blur-md border-b border-gray-700 sticky top-0 z-20 h-[64px] flex items-center shadow-lg">
          <div className="max-w-7xl px-4 w-full">
            <button
              onClick={() => navigate("home")}
              className="flex items-center text-gray-300 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
          </div>
        </nav>
      )}
      {renderPage()}
    </PageWrapper>
  );
};

export default HomePage;
