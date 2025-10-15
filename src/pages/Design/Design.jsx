import React, { useState } from "react";
import {
  ArrowLeft,
  Wrench,
  Layers,
  Settings,
  ArrowUpDown,
  Hash,
  Code2,
  Clock,
  Star,
  TrendingUp,
  Zap,
  Search,
  Twitter,
} from "lucide-react";

// --- Import your specific design problems here ---
import LRUCache from "./LRUCache.jsx";
import LFUCache from "./LFUCache.jsx";
import DesignHashMap from "./DesignHashMap.jsx";
import DesignLinkedList from "./DesignLinkedList.jsx";
import MinStack from "./MinStack.jsx";
import ImplementTrie from "./ImplementTrie.jsx";

const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const algorithms = [
    {
      name: "LRU Cache",
      number: "146",
      icon: Settings,
      description:
        "Implement an LRU (Least Recently Used) cache supporting get and put operations in O(1) time using HashMap and Doubly Linked List.",
      page: "LRUCache",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-teal-500 to-emerald-500",
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/20",
      borderColor: "border-teal-500/30",
      technique: "Design (HashMap + Linked List)",
      timeComplexity: "O(1)",
    },
    {
      name: "LFU Cache",
      number: "460",
      icon: Settings, // you can replace with any suitable icon
      description:
        "Implement an LFU (Least Frequently Used) cache supporting get and put operations. When capacity is reached, it evicts the least frequently used key. Ties are broken by least recently used key.",
      page: "LFUCache",
      difficulty: "Hard",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-pink-500 to-rose-500",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/20",
      borderColor: "border-pink-500/30",
      technique: "Design (HashMap + Doubly Linked List + Frequency Map)",
      timeComplexity: "O(1) average per operation",
    },
    {
        name : "Design HashMap",
        number : "706",
        icon : Settings,
        description : "Design a HashMap that supports put, get, and remove operations in O(1) time.",
        page : "DesignHashMap",
        difficulty : "Easy",
        difficultyColor : "text-green-400",
        difficultyBg : "bg-green-400/10",
        difficultyBorder : "border-green-400/30",
        gradient : "from-green-500 to-lime-500",
        iconColor : "text-lime-400",
        iconBg : "bg-lime-500/20",
        borderColor : "border-lime-500/30",
        technique : "Design (Array, HashTable, HashFunction)",
        timeComplexity : "O(1)",
      },
      {
        name : "Design Linked List",
        number : "707",
        icon : Settings,
        description : "Design a Linked List that supports insert, delete, and get operations in O(n) time.",
        page : "DesignLinkedList",
        difficulty : "Medium",
        difficultyColor : "text-yellow-400",
        difficultyBg : "bg-yellow-400/10",
        difficultyBorder : "border-yellow-400/30",
        gradient : "from-yellow-500 to-amber-500",
        iconColor : "text-amber-400",
        iconBg : "bg-amber-500/20",
        borderColor : "border-amber-500/30",
        technique : "Design (Array, Pointer)",
        timeComplexity : "O(n)",
      },
      {
        name: "Min Stack",
        number: "155",
        icon: Layers,
        description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
        page: "MinStack",
        difficulty: "Medium",
        difficultyColor: "text-yellow-400",
        difficultyBg: "bg-yellow-400/10",
        difficultyBorder: "border-yellow-400/30",
        gradient: "from-blue-500 to-indigo-500",
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        technique: "Design (Stack + Min Tracking)",
        timeComplexity: "O(1)",
      },
      {
        name: "Implement Trie (Prefix Tree)",
        number: "208",
        icon: Search,
        description: "Implement a trie with insert, search, and startsWith methods for efficient string operations.",
        page: "ImplementTrie",
        difficulty: "Medium",
        difficultyColor: "text-yellow-400",
        difficultyBg: "bg-yellow-400/10",
        difficultyBorder: "border-yellow-400/30",
        gradient: "from-green-500 to-teal-500",
        iconColor: "text-green-400",
        iconBg: "bg-green-500/20",
        borderColor: "border-green-500/30",
        technique: "Design (Trie, Tree)",
        timeComplexity: "O(m)",
      },
  ].sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* --- Header --- */}
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <Wrench className="h-14 sm:h-16 w-14 sm:w-16 text-teal-400 animated-icon" />
              <Zap className="h-5 w-5 text-emerald-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-green-400 animated-gradient">
              Design Patterns
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Master system design problems that combine{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              data structures
            </span>{" "}
            and{" "}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
              algorithms
            </span>{" "}
            for optimized performance.
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
                  Hash + Linked List Design
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Algorithm Cards --- */}
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-teal-400" />
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
                      <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Footer --- */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm">
          <TrendingUp className="h-4 w-4 text-teal-400" />
          <span className="text-sm text-gray-400">
            More design problems coming soon
          </span>
        </div>
      </div>
    </div>
  );
};

const DesignPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "LRUCache":
        return <LRUCache navigate={navigate} />;
      case "LFUCache":
        return <LFUCache navigate={navigate} />;
      case "DesignHashMap":
        return <DesignHashMap navigate={navigate} />;
      case "DesignLinkedList":
        return <DesignLinkedList navigate={navigate} />;
      case "MinStack":
        return <MinStack navigate={navigate} />;
      case "ImplementTrie":
        return <ImplementTrie navigate={navigate} />;
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
      `}</style>

      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
      {/* Navigation */}
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
              <Layers className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-semibold text-gray-300">
                Design Problems
              </span>
            </div>
          </div>
        </nav>
      )}

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

export default DesignPage;
