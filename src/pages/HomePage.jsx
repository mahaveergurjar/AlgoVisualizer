import React, { useMemo, useRef, useState } from "react";
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
  Navigation,
  Target,
  CheckCircle,
  Type,
  ScanLine,
  Search,
  Calculator,
  Hash,
  Star,
} from "lucide-react";

import ArrayPage from "./Arrays/Arrays.jsx";
import SlidingWindowsPage from "./SlidingWindows/SlidingWindows.jsx";
import LinkedListPage from "./LinkedList/LinkedList.jsx";
import StackPage from "./Stack/Stack.jsx";
import TreesPage from "./Trees/Trees.jsx";
import HeapsPage from "./Heaps/Heaps.jsx";
import SearchingPage from "./Searching/Searching.jsx";
import DesignPage from "./Design/Design.jsx";
import RecursionPage from "./Recursion/Recursion.jsx";
import SortingPage from "./Sorting/Sorting.jsx";
import PathfindingPage from "./Pathfinding/Pathfinding.jsx";
import { problems as PROBLEM_CATALOG } from "../search/catalog";
import QueuePage from "./Queue/Queue.jsx";
import BinarySearchPage from "./BinarySearch/BinarySearch.jsx";
import DPPage from "./DynamicProgramming/DynamicProgramming.jsx";
import ScrollToTop from "../components/ScrollToTop";
import GraphsPage from "./Graphs/Graphs.jsx";
import GreedyPage from "./GreedyAlgorithms/Greedy.jsx";
import BacktrackingPage from "./Backtracking/Backtracking.jsx";
import StringPage from "./Strings/Strings.jsx";
import BitPage from "./BitManipulation/BitManipulation.jsx";
import HashingPage from "./Hashing/Hashing.jsx";
import MathsMiscPage from "./MathematicalMiscellaneous/MathematicalMiscellaneous.jsx";
import StarredProblems from "./Starred/StarredProblems.jsx";

const AlgorithmCategories = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const categories = useMemo(
    () => [
      {
        name: "Starred Topics",
        icon: Star,
        description: "Review your saved problems and topics for easy access.",
        page: "Starred", // This is the key we'll use for routing
        gradient: "from-yellow-400 to-amber-500",
        iconBg: "bg-yellow-400/20",
        borderColor: "border-yellow-400/30",
        iconColor: "text-yellow-300",
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
        name: "BinarySearch",
        icon: SearchCode,
        description: "Logarithmic time search in sorted data.",
        page: "BinarySearch",
        gradient: "from-teal-500 to-emerald-600",
        iconBg: "bg-teal-500/20",
        borderColor: "border-teal-500/30",
        iconColor: "text-teal-400",
      },
      {
        name: "Strings",
        icon: Type,
        description:
          "Text manipulation, pattern matching, and character operations.",
        page: "Strings",
        gradient: "from-purple-500 to-pink-600",
        iconBg: "bg-purple-500/20",
        borderColor: "border-purple-500/30",
        iconColor: "text-purple-400",
      },
      {
        name: "Searching",
        icon: Search,
        description: "Find elements using efficient search logic.",
        page: "Searching",
        gradient: "from-teal-500 to-emerald-600",
        iconBg: "bg-teal-500/20",
        borderColor: "border-teal-500/30",
        iconColor: "text-teal-400",
      },
      {
        name: "Hashing",
        icon: Hash,
        description: "Key-value pairs, hash maps, and collision resolution.",
        page: "Hashing",
        gradient: "from-red-500 to-orange-600",
        iconBg: "bg-red-500/20",
        borderColor: "border-red-500/30",
        iconColor: "text-red-400",
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
        name: "Recursion",
        icon: Repeat,
        description: "Solve problems by breaking them into smaller instances.",
        page: "Recursion",
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
        page: "BitManipulation",
        gradient: "from-slate-500 to-gray-600",
        iconBg: "bg-slate-500/20",
        borderColor: "border-slate-500/30",
        iconColor: "text-slate-400",
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
        page: "Queue",
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
        name: "Heaps",
        icon: Filter,
        description:
          "Priority queues and finding min/max elements efficiently.",
        page: "Heaps",
        gradient: "from-orange-500 to-amber-600",
        iconBg: "bg-orange-500/20",
        borderColor: "border-orange-500/30",
        iconColor: "text-orange-400",
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
        name: "Graphs",
        icon: Network,
        description:
          "Networks of nodes, traversal algorithms, and pathfinding.",
        page: "Graphs",
        gradient: "from-blue-500 to-cyan-600",
        iconBg: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        iconColor: "text-blue-400",
      },
      {
        name: "Pathfinding",
        icon: Navigation,
        description:
          "Navigate through mazes using BFS, DFS, and advanced pathfinding algorithms.",
        page: "Pathfinding",
        gradient: "from-purple-500 to-pink-600",
        iconBg: "bg-purple-500/20",
        borderColor: "border-purple-500/30",
        iconColor: "text-purple-400",
      },
      {
        name: "Greedy Algorithms",
        icon: CheckCircle,
        description:
          "Make locally optimal choices in the hope of finding a global optimum.",
        page: "GreedyPage",
        gradient: "from-rose-500 to-pink-600",
        iconBg: "bg-rose-500/20",
        borderColor: "border-rose-500/30",
        iconColor: "text-rose-400",
      },
      {
        name: "Backtracking",
        icon: ArrowLeft,
        description:
          "Exploring all possible solutions by trying and undoing choices efficiently.",
        page: "BacktrackingPage",
        gradient: "from-orange-500 to-amber-600",
        iconBg: "bg-purple-400/20",
        borderColor: "border-purple-400/30",
        iconColor: "text-purple-400",
      },
      {
        name: "Dynamic Programming",
        icon: Workflow,
        description: "Optimization by solving and caching sub-problems.",
        page: "DynamicProgramming",
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
      {
        name: "Mathematical & Miscellaneous",
        icon: Calculator,
        description:
          "Master the numerical foundations and essential utilities for efficient problem-solving.",
        page: "MathsMiscPage",
        gradient: "from-blue-500 to-cyan-600",
        iconBg: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        iconColor: "text-blue-400",
      },
    ],
    []
  );

  // Build a lightweight search index for categories and problems
  const SEARCH_INDEX = useMemo(() => {
    const categoryItems = categories.map((c) => ({
      type: "category",
      label: c.name,
      category: c.page,
      keywords: [c.name.toLowerCase()],
    }));
    const problemItems = PROBLEM_CATALOG.map((p) => ({
      type: "problem",
      ...p,
    })).filter((p) => p.category && p.subpage); // Ensure items are valid
    return [...categoryItems, ...problemItems];
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/);
    const match = (item) => {
      const hay = [
        item.label.toLowerCase(),
        item.category?.toLowerCase(),
        ...(item.keywords || []),
      ].join(" ");
      return tokens.every((t) => hay.includes(t));
    };
    const results = SEARCH_INDEX.filter(match);
    // Sort: exact prefix matches first, then by type (problem over category), then alphabetically
    results.sort((a, b) => {
      const ap = a.label.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      const bp = b.label.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      if (a.type !== b.type) return a.type === "problem" ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
    return results.slice(0, 10);
  }, [SEARCH_INDEX, query]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const target = filtered[0];
    if (!target) return;
    if (target.type === "category") {
      navigate(target.category);
    } else {
      navigate({ page: target.category, subpage: target.subpage });
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      <header className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24 mt-8 sm:mt-12 md:mt-16 relative">
        <div className="hidden md:block absolute top-0 left-1/4 w-56 h-56 lg:w-72 lg:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="hidden md:block absolute top-20 right-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow-delayed" />

        <div className="relative z-10">
          {/* Main Logo and Title */}
          <div className="flex justify-center items-center gap-x-4 sm:gap-x-6 md:gap-x-8 mb-8 sm:mb-10 md:mb-12">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 animated-icon animate-color-shift"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  color="currentColor"
                >
                  <path d="M11.5 6C7.022 6 4.782 6 3.391 7.172S2 10.229 2 14s0 5.657 1.391 6.828S7.021 22 11.5 22c4.478 0 6.718 0 8.109-1.172S21 17.771 21 14c0-1.17 0-2.158-.041-3M18.5 2l.258.697c.338.914.507 1.371.84 1.704c.334.334.791.503 1.705.841L22 5.5l-.697.258c-.914.338-1.371.507-1.704.84c-.334.334-.503.791-.841 1.705L18.5 9l-.258-.697c-.338-.914-.507-1.371-.84-1.704c-.334-.334-.503-.791-.841 1.705L15 5.5l.697-.258c.914-.338 1.371-.507 1.704-.84c.334-.334.503-.791.841-1.705z" />
                  <path d="m15.5 12l1.227 1.057c.515.445.773.667.773.943s-.258.498-.773.943L15.5 16m-8-4l-1.227 1.057c-.515.445-.773.667-.773.943s.258.498.773.943L7.5 16m5-5l-2 6" />
                </g>
              </svg>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-7 md:w-7 text-white absolute -top-2 -right-2 sm:-top-3 sm:-right-3" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.15] md:leading-[1.1] pb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animated-gradient">
              AlgoVisualizer
            </h1>
          </div>

          {/* Hero Description */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10 md:mb-12">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-gray-100 max-w-5xl mx-auto leading-tight px-4">
              Master algorithms through{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-text-shimmer">
                interactive visualizations
              </span>
            </p>
            {/* Global Search */}
            <div className="max-w-2xl mx-auto px-4">
              <form onSubmit={handleSubmit} className="relative z-50">
                <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 rounded-2xl px-4 py-3 shadow-lg focus-within:border-blue-500/50">
                  <SearchCode className="h-5 w-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search problems or topics (e.g., LRU Cache, sliding window)"
                    className="w-full bg-transparent outline-none text-gray-200 placeholder:text-gray-500"
                    aria-label="Search problems or topics"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition cursor-pointer"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>

                {open && query && (
                  <>
                    {/* screen overlay to block background interactions */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpen(false)}
                    />
                    <div
                      className="absolute left-0 right-0 mt-2 bg-gray-900/95 border border-gray-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl z-50"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No matches
                        </div>
                      ) : (
                        <ul className="max-h-72 overflow-auto divide-y divide-gray-800">
                          {filtered.map((item, idx) => (
                            <li key={`${item.type}-${item.label}-${idx}`}>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-gray-800/80 transition flex items-center gap-3"
                                onClick={() => {
                                  if (item.type === "category") {
                                    navigate(item.category);
                                  } else {
                                    navigate({
                                      page: item.category,
                                      subpage: item.subpage,
                                    });
                                  }
                                  setOpen(false);
                                  setQuery("");
                                }}
                              >
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                                    item.type === "problem"
                                      ? "text-purple-300 bg-purple-400/10 border-purple-400/30"
                                      : "text-blue-300 bg-blue-400/10 border-blue-400/30"
                                  }`}
                                >
                                  {item.type === "problem"
                                    ? "Problem"
                                    : "Topic"}
                                </span>
                                <span className="text-gray-200 font-semibold">
                                  {/* ✅ ADD PROBLEM NUMBER AND PLATFORM DISPLAY */}
                                  {item.type === "problem" && item.number && (
                                    <span className="text-gray-500 font-mono mr-2">
                                      #{item.number}
                                    </span>
                                  )}
                                  {item.label}
                                  {item.type === "problem" && (
                                    <span className="text-gray-500 font-normal ml-2">
                                      — {item.category}
                                      {item.platforms &&
                                        item.platforms.length > 0 && (
                                          <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-gray-700/50 border border-gray-600">
                                            {item.platforms.join(", ")}
                                          </span>
                                        )}
                                    </span>
                                  )}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </form>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed">
              Clear, step-by-step demonstrations that bring algorithms to life.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12 px-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
              className={`group relative h-40 sm:h-48 transition-all duration-500 transform animate-fade-in-up ${
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
                className={`relative bg-gray-900/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border ${
                  cat.borderColor
                } transition-all duration-500 ${
                  isHovered && !isPlaceholder
                    ? "shadow-2xl shadow-gray-900/60"
                    : "shadow-xl shadow-gray-900/40"
                } w-full h-full flex flex-col justify-between card-shadow card-glow`}
              >
                {/* Header */}
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div
                    className={`p-3 ${
                      cat.iconBg
                    } rounded-2xl transition-all duration-300 ${
                      !isPlaceholder &&
                      "group-hover:scale-110 group-hover:rotate-6"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${
                        isHovered && !isPlaceholder
                          ? "text-white"
                          : cat.iconColor
                      } transition-colors duration-300`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className={`text-lg sm:text-xl font-bold transition-colors duration-300 leading-tight ${
                        isHovered && !isPlaceholder
                          ? "text-white"
                          : "text-gray-200"
                      }`}
                    >
                      {cat.name}
                    </h2>
                  </div>
                </div>

                {/* COMING SOON badge */}
                {isPlaceholder && (
                  <div className="absolute -top-1 -right-1 z-20">
                    <div className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 text-xs font-bold rounded-full border border-gray-600 animate-pulse-subtle shadow-lg">
                      COMING SOON
                    </div>
                  </div>
                )}

                {/* Description + Footer */}
                <div className="flex flex-col flex-grow justify-between">
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
                      className={`pt-4 mt-6 border-t border-gray-800/50 flex items-center justify-between transition-all duration-300 ${
                        isHovered
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
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
  const [initialSubPage, setInitialSubPage] = useState(null);
  const navigate = (newPage) => {
    if (typeof newPage === "string") {
      setPage(newPage);
      setInitialSubPage(null);
      return;
    }
    if (newPage && typeof newPage === "object" && newPage.page) {
      setPage(newPage.page);
      setInitialSubPage(newPage.subpage || null);
    }
  };

  const renderPage = () => {
    switch (page) {
      // ADD THE NEW CASE HERE
      case "Starred":
        return <StarredProblems navigate={navigate} />;
      case "Arrays":
        return <ArrayPage navigate={navigate} initialPage={initialSubPage} />;
      case "Strings":
        return <StringPage navigate={navigate} initialPage={initialSubPage} />;
      case "Hashing":
        return <HashingPage navigate={navigate} initialPage={initialSubPage} />;
      case "SlidingWindows":
        return (
          <SlidingWindowsPage
            navigate={navigate}
            initialPage={initialSubPage}
          />
        );
      case "LinkedList":
        return (
          <LinkedListPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "Stack":
        return <StackPage navigate={navigate} initialPage={initialSubPage} />;
      case "Sorting":
        return <SortingPage navigate={navigate} initialPage={initialSubPage} />;
      case "Searching":
        return (
          <SearchingPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "Trees":
        return <TreesPage navigate={navigate} initialPage={initialSubPage} />;
      case "Design":
        return <DesignPage navigate={navigate} initialPage={initialSubPage} />;
      case "Queue":
        return <QueuePage navigate={navigate} initialPage={initialSubPage} />;
      case "BinarySearch":
        return (
          <BinarySearchPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "Heaps":
        return <HeapsPage navigate={navigate} initialPage={initialSubPage} />;
      case "Recursion":
        return (
          <RecursionPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "Pathfinding":
        return (
          <PathfindingPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "Graphs":
        return <GraphsPage navigate={navigate} initialPage={initialSubPage} />;
      case "GreedyPage":
        return <GreedyPage navigate={navigate} initialPage={initialSubPage} />;
      case "BacktrackingPage":
        return (
          <BacktrackingPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "DynamicProgramming":
        return <DPPage navigate={navigate} initialPage={initialSubPage} />;
      case "MathsMiscPage":
        return (
          <MathsMiscPage navigate={navigate} initialPage={initialSubPage} />
        );
      case "BitManipulation":
        return <BitPage navigate={navigate} initialPage={initialSubPage} />;
      case "home":
      default:
        return <AlgorithmCategories navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <>
      <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative z-10">{children}</div>
        <ScrollToTop />

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

        /* Animate icon color through heading gradient hues */
        .animate-color-shift {
          animation: color-shift 6s linear infinite;
        }
        @keyframes color-shift {
          0% { color: #60a5fa; } /* blue-400 */
          33% { color: #a78bfa; } /* purple-400 */
          66% { color: #f472b6; } /* pink-400 */
          100% { color: #60a5fa; }
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

        /* Enhanced card hover glow effect */
        .group:hover .card-glow {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }
      `}</style>
      </div>
    </>
  );
  return <PageWrapper>{renderPage()}</PageWrapper>;
};

export default HomePage;
