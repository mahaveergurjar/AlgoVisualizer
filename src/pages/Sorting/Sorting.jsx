import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowDownUp,
  GitMerge,
  Shuffle,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Layers,
  BarChart3,
  Trees,
  Target,
} from "lucide-react";

// --- Import your specific sorting algorithm visualizer components here ---
// For now, these are placeholders. Replace with actual components when built.
const PlaceholderVisualizer = ({ name }) => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold text-gray-400">{name} Visualizer</h1>
    <p className="text-lg text-gray-500 mt-4">Coming soon!</p>
  </div>
);

import BubbleSortVisualizer from "./BubbleSort";
import MergeSortVisualizer from "./MergeSort";
import QuickSortVisualizer from "./QuickSort";
import InsertionSortVisualizer from "./InsertionSort";
import RadixSortVisualizer from  "./RadixSort";
import CountingSortVisualizer from "./CountingSort";
import HeapSortVisualizer from "./HeapSort";
import  SelectionSortVisualizer from "./SelectionSort";
const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const algorithms = [
    {
      name: "Bubble Sort",
      number: "N/A",
      icon: ArrowDownUp,
      description:
        "A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
      page: "BubbleSort",
      difficulty: "Easy",
      difficultyColor: "text-green-400",
      difficultyBg: "bg-green-400/10",
      difficultyBorder: "border-green-400/30",
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "Swapping",
      timeComplexity: "O(n²)",
    },
    {
      name: "Merge Sort",
      number: "N/A",
      icon: GitMerge,
      description:
        "An efficient, stable, comparison-based sorting algorithm using the divide and conquer paradigm.",
      page: "MergeSort",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-yellow-500 to-amber-500",
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
      technique: "Divide & Conquer",
      timeComplexity: "O(n log n)",
    },
    {
      name: "Quick Sort",
      number: "N/A",
      icon: Shuffle,
      description:
        "An efficient sorting algorithm that uses partitioning to repeatedly divide the array into smaller sub-arrays.",
      page: "QuickSort",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-orange-500 to-red-500",
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      technique: "Partitioning",
      timeComplexity: "O(n log n)",
    },
    {
    name: "Insertion Sort",
    number: "N/A",
    icon: Code2,
    description:
      "A simple sorting algorithm that builds the final sorted array one element at a time by comparing and inserting elements at the correct position.",
    page: "InsertionSort",
    difficulty: "Easy",
    difficultyColor: "text-green-400",
    difficultyBg: "bg-green-400/10",
    difficultyBorder: "border-green-400/30",
    gradient: "from-green-500 to-lime-500",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/20",
    borderColor: "border-green-500/30",
    technique: "Insertion",
    timeComplexity: "O(n²)",
  },
  {
  name: "Radix Sort",
  number: "N/A",
  icon: Layers, // you can replace with another icon if you want
  description:
    "A non-comparative, digit-based sorting algorithm that sorts numbers by processing individual digits from least significant to most significant.",
  page: "RadixSort",
  difficulty: "Medium",
  difficultyColor: "text-yellow-400",
  difficultyBg: "bg-yellow-400/10",
  difficultyBorder: "border-yellow-400/30",
  gradient: "from-blue-500 to-cyan-500",
  iconColor: "text-cyan-400",
  iconBg: "bg-cyan-500/20",
  borderColor: "border-cyan-500/30",
  technique: "Digit-wise Sorting",
  timeComplexity: "O(d * (n + k))", // d = number of digits, k = base (10)
},
{
  name: "Counting Sort",
  number: "N/A",
  icon: BarChart3, // a good visual representation for counts
  description:
    "A non-comparative sorting algorithm that counts the frequency of each element and uses it to place elements in sorted order.",
  page: "CountingSort",
  difficulty: "Medium",
  difficultyColor: "text-yellow-400",
  difficultyBg: "bg-yellow-400/10",
  difficultyBorder: "border-yellow-400/30",
  gradient: "from-amber-500 to-yellow-500",
  iconColor: "text-amber-400",
  iconBg: "bg-amber-500/20",
  borderColor: "border-amber-500/30",
  technique: "Counting & Placement",
  timeComplexity: "O(n + k)", // n = number of elements, k = range of elements
},{
  name: "Heap Sort",
  number: "N/A",
  icon: Trees, // you can replace with another icon if desired
  description:
    "A comparison-based sorting technique based on a binary heap data structure. It builds a heap from the array and repeatedly extracts the maximum element to sort the array.",
  page: "HeapSort",
  difficulty: "Medium",
  difficultyColor: "text-yellow-400",
  difficultyBg: "bg-yellow-400/10",
  difficultyBorder: "border-yellow-400/30",
  gradient: "from-purple-500 to-indigo-500",
  iconColor: "text-indigo-400",
  iconBg: "bg-indigo-500/20",
  borderColor: "border-indigo-500/30",
  technique: "Heap-based Sorting",
  timeComplexity: "O(n log n)",
},
{
  name: "Selection Sort",
  number: "N/A",
  icon: Target,
  description:
    "A simple comparison-based sorting algorithm that repeatedly selects the minimum element from the unsorted part and moves it to the sorted part.",
  page: "SelectionSort",
  difficulty: "Easy",
  difficultyColor: "text-green-400",
  difficultyBg: "bg-green-400/10",
  difficultyBorder: "border-green-400/30",
  gradient: "from-green-500 to-emerald-500",
  iconColor: "text-green-400",
  iconBg: "bg-green-500/20",
  borderColor: "border-green-500/30",
  technique: "Selection",
  timeComplexity: "O(n²)",
},
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative">
              <ArrowDownUp className="h-14 sm:h-16 w-14 sm:w-16 text-green-400 animated-icon" />
              <Zap className="h-5 w-5 text-teal-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 animated-gradient">
              Sorting Algorithms
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">
            Understand how different sorting algorithms work step-by-step. From
            simple swaps to complex divide-and-conquer strategies.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-medium text-gray-300">
                  {algorithms.length} Algorithms
                </span>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-medium text-gray-300">
                  Varying Complexities
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

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
    </div>
  );
};

const SortingPage = ({ navigate: parentNavigate, initialPage = null }) => {
  const [page, setPage] = useState(initialPage || "home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "BubbleSort":
        return <BubbleSortVisualizer navigate={navigate} />;
      case "MergeSort":
        return <MergeSortVisualizer navigate={navigate} />;
      case "QuickSort":
        return <QuickSortVisualizer navigate={navigate} />;
      case "InsertionSort":
        return <InsertionSortVisualizer navigate={navigate} />;
      case "RadixSort":
        return <RadixSortVisualizer navigate={navigate} />;
      case "CountingSort":
        return <CountingSortVisualizer navigate={navigate} />
      case "HeapSort":
        return <HeapSortVisualizer navigate={navigate} />; 
      case "SelectionSort":
        return <SelectionSortVisualizer navigate={navigate} />;  
      
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animated-icon { animation: float-icon 6s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.6)); }
        @keyframes float-icon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
        @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.1); } }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate("home")}
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </button>
            <div className="flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-green-400" />
              <span className="text-sm font-semibold text-gray-300">
                Sorting Algorithms
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
              className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"
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

export default SortingPage;
