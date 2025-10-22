// Centralized catalog for problems across the site
// Add new entries here as you build new visualizers.

/**
 * Problem catalog entry contract
 * - label: User-facing problem name
 * - category: One of: Arrays | SlidingWindows | LinkedList | Stack | Sorting | Trees | Design
 * - subpage: The string used by the category page switch to render the visualizer
 * - keywords: Inclusive keywords/synonyms/IDs for search matching
 */
export const problems = [
  // Arrays
  { label: "Container With Most Water", category: "Arrays", subpage: "ContainerWithMostWater", keywords: ["array", "two pointers", "container", "water", "11"] },
  { label: "Trapping Rain Water", category: "Arrays", subpage: "TrappingRainWater", keywords: ["array", "two pointers", "rain", "water", "42"] },
  { label: "Max Consecutive Ones III", category: "Arrays", subpage: "MaxConsecutiveOnesIII", keywords: ["array", "sliding window", "ones", "1004"] },
  { label: "Sum of Subarray Ranges", category: "Arrays", subpage: "SubarrayRanges", keywords: ["array", "ranges", "subarray", "2104"] },
  { label: "Best Time to Buy and Sell Stock", category: "Arrays", subpage: "BestTimeToBuyAndSellStock", keywords: ["array", "stock", "profit", "buy", "sell", "121"] },
  { label: "3Sum", category: "Arrays", subpage: "ThreeSum", keywords: ["array", "two pointers", "three sum", "3sum", "triplet", "15"] },
  { label: "Product of Array Except Self", category: "Arrays", subpage: "ProductOfArrayExceptSelf", keywords: ["array", "product", "prefix", "suffix", "238", "except self", "division"] },
  { label: "Maximum Subarray", category: "Arrays", subpage: "MaximumSubarray", keywords: ["array", "kadane", "maximum subarray", "53", "subarray sum", "dynamic programming"] },
  { label: "Merge Intervals", category: "Arrays", subpage: "MergeIntervals", keywords: ["array", "intervals", "merge", "56", "overlapping", "sorting"] },
  { label: "Array Sum ", category: "Arrays", subpage: "ArraySum", keywords:["array","Sum","traversal"]},
  { label: "Count Zeroes",category: "Arrays", subpage: "CountZeros", keywords:["array","count","zeroes","traversal","counting"]},
  { label: "Find Max Element",category: "Arrays", subpage: "FindMaxElement", keywords:["array","find","max","element","traversal","searching"]},
  { label: "Find Min Element",category: "Arrays", subpage: "FindMinElement", keywords:["array","find","min","element","traversal","searching"]},
  { label: "Move Zeroes to the end",category: "Arrays", subpage: "MoveZeros", keywords:["array","move","zeroes","end","traversal","rearranging"]},
  { label: "Rotate array by k",category: "Arrays", subpage: "RotateArray", keywords:[""]},
  {label:"4-sum", category:"Arrays", subpage:"FourSum", keywords:["array", "two pointers", "four sum", "4sum", "quadruplet", "18"]},

  // Sliding Window
  { label: "Max Consecutive Ones III", category: "SlidingWindows", subpage: "MaxConsecutiveOnesIII", keywords: ["sliding window", "ones", "1004"] },
  { label: "Sliding Window Maximum", category: "SlidingWindows", subpage: "SlidingWindowMaximum", keywords: ["sliding window", "deque", "maximum", "239"] },
  { label: "Fruits Into Baskets", category: "SlidingWindows", subpage: "FruitsIntoBaskets", keywords: ["sliding window", "fruits", "baskets", "904"] },
  
  // Linked List
  { label: "Linked List Cycle", category: "LinkedList", subpage: "LinkedListCycle", keywords: ["linked list", "cycle", "floyd", "141"] },
  { label: "Reverse Linked List", category: "LinkedList", subpage: "ReverseLinkedList", keywords: ["linked list", "reverse", "206"] },

  // Stack
  { label: "Largest Rectangle in Histogram", category: "Stack", subpage: "LargestRectangleHistogram", keywords: ["stack", "monotonic", "histogram", "84"] },
  { label: "Remove K Digits", category: "Stack", subpage: "RemoveKDigits", keywords: ["stack", "greedy", "402"] },
  { label: "Sum of Subarray Ranges", category: "Stack", subpage: "SubarrayRanges", keywords: ["stack", "monotonic", "ranges", "2104"] },
  {label: "Next Greater Element I", category: "Stack", subpage: "NextGreaterElementVisualizer", keywords: ["stack", "monotonic", "next greater", "496"] },
  // Queue
  { label: "Implement Queue using Stacks", category: "Queue", subpage: "QueuePage", keywords: ["queue", "stack", "design", "232"] },
  { label: "Circular Queue", category: "Queue", subpage: "CircularQueueVisualizer", keywords: ["queue","circular queue","ring buffer","circular array","queue optimization","wrap around","modulo"]},

  // Sorting
  { label: "Bubble Sort", category: "Sorting", subpage: "BubbleSort", keywords: ["sorting", "bubble sort", "swap"] },
  { label: "Merge Sort", category: "Sorting", subpage: "MergeSort", keywords: ["sorting", "merge sort", "divide and conquer"] },
  { label: "Quick Sort", category: "Sorting", subpage: "QuickSort", keywords: ["sorting", "quick sort", "partition"] },
  { label: "Heap Sort", category: "Sorting", subpage: "HeapSort", keywords: ["sorting", "heap sort", "binary heap", "priority queue"] },
  { label: "Counting Sort", category: "Sorting", subpage: "CountingSort", keywords: ["sorting", "counting sort", "frequency", "non-comparative"] },
  { label: "Radix Sort", category: "Sorting", subpage: "RadixSort", keywords: ["sorting", "radix sort", "digit-wise", "LSD", "MSD"] }, 
  { label: "Insertion Sort", category: "Sorting", subpage: "InsertionSort", keywords: ["sorting", "insertion sort", "insert", "stable"] },
  { label: "Selection Sort", category: "Sorting", subpage: "SelectionSort", keywords: ["sorting", "selection sort", "select min", "in-place"] },
  { label: "Shell Sort", category: "Sorting", subpage: "ShellSort", keywords: ["sorting", "shell sort", "gap sequence", "insertion", "optimization"] },


  // Trees
  { label: "Construct Tree from Traversal", category: "Trees", subpage: "ConstructBinaryTree", keywords: ["tree", "binary tree", "preorder", "inorder", "105"] },
  { label: "AVL Tree", category: "Trees", subpage: "AVLTree", keywords: ["tree", "AVL","Tree Traversal","Balanced Binary Search Tree"] },
  { label: "LCA of Deepest leaves", category: "Trees", subpage: "LCAofDeepestLeaves", keywords: ["tree", "DFS","LCA","leaf","deepest"]},

  // Design
  { label: "LRU Cache", category: "Design", subpage: "LRUCache", keywords: ["design", "cache", "lru", "146", "hashmap", "linked list"] },
  { label: "LFU Cache", category: "Design", subpage: "LFUCache", keywords: ["design", "cache", "lfu", "460", "frequency", "linked list"] },
  { label: "Design Hash Map", category: "Design", subpage: "DesignHashMap", keywords: ["design", "hash map", "put", "get", "remove", "706"] },
  { label: "Design Linked List", category: "Design", subpage: "DesignLinkedList", keywords: ["design","Linked List","List","707"]},
  { label: "Implement Trie (Prefix Tree)", category: "Design", subpage: "ImplementTrie", keywords: ["design", "trie", "prefix tree", "208"] },
  { label: "Min Stack", category: "Design", subpage: "MinStack", keywords: ["design", "stack", "min", "155"] },
  // Queue problems
  { label: "Basic Queue (FIFO)", category: "Queue", subpage: "BasicQueue", keywords: ["queue", "fifo", "first in first out", "enqueue", "dequeue", "linear queue", "basic queue"]},
  { label: "Circular Queue", category: "Queue", subpage: "CircularQueue", keywords: ["circular queue", "ring buffer", "circular array", "queue optimization", "wrap around", "modulo"]},
  
  // Pathfinding problems
  { label: "Rat in Maze", category: "Pathfinding", subpage: "RatInMaze", keywords: ["pathfinding", "maze", "rat", "bfs", "dfs", "backtracking", "graph traversal"]},
  { label: "Flood Fill", category: "Pathfinding", subpage: "FloodFill", keywords: ["pathfinding", "flood fill", "bucket tool", "bfs", "graph traversal"]},
  { label: "Color Islands", category: "Pathfinding", subpage: "ColorIslands", keywords: ["pathfinding", "color islands", "flood fill", "200"] },
  
  // Recursion problems
  { label: "Subset Sum", category: "Recursion", subpage: "SubsetSumVisualizer", keywords: ["recursion", "subset", "sum", "backtracking", "dynamic programming"] },
  { label: "Tower of Hanoi", category: "Recursion", subpage: "TowerOfHanoiVisualizer", keywords: ["recursion", "tower", "hanoi", "divide and conquer", "puzzle", "rods", "disks"] },
  { label: "Fibonacci", category: "Recursion", subpage: "FibonacciVisualizer", keywords: ["recursion", "fibonacci", "tree recursion", "memoization", "dynamic programming", "exponential"] },
  { label: "Factorial", category: "Recursion", subpage: "FactorialVisualizer", keywords: ["recursion", "factorial", "linear recursion", "call stack", "base case"] },
  { label: "N-Queens", category: "Recursion", subpage: "NQueensVisualizer", keywords: ["recursion", "n-queens", "backtracking", "chess", "constraint satisfaction", "queens"] },
  { label: "Binary Search (Recursive)", category: "Recursion", subpage: "BinarySearchRecursiveVisualizer", keywords: ["recursion", "binary search", "divide and conquer", "sorted array", "logarithmic", "search"] },

  // String 
  { label: "Count Vowels", category: "Strings", subpage: "CountVowels", keywords:["String","Vowels","Count","CountVowels","count vowels","Traversal","Counting"]},
  { label: "Reverse String", category: "Strings", subpage: "ReverseString", keywords:["String","Reversal","344","Reverse","ReverseString","Two pointers"]},
  { label: "Pallindromic String", category: "Strings", subpage: "PalindromeCheck", keywords:["String","Pallindromic","Pallindrome","Check","Two Pointers","PalindromeCheck"]},

  { 
    label: "Min Speed to Arrive on Time", 
    category: "BinarySearch", 
    subpage: "MinSpeedToArriveOnTime", 
    keywords: ["binary search", "binary search on answer", "speed", "time", "optimization", "monotonic", "arrive on time", "1870"]
  },
  { 
    label: "Search a 2D Matrix", 
    category: "BinarySearch", 
    subpage: "Search2DMatrix", 
    keywords: ["binary search", "2d matrix", "sorted matrix", "staircase search", "logarithmic", "74"]
  },
  { 
    label: "Peak Index in a Mountain Array", 
    category: "BinarySearch", 
    subpage: "PeakIndexInMountainArray", 
    keywords: ["binary search", "peak", "mountain array", "logarithmic", "852"]
  },
  { 
    label: "Median of Two Sorted Arrays", 
    category: "BinarySearch", 
    subpage: "MedianOfTwoSortedArrays", 
    keywords: ["binary search", "median", "two sorted arrays", "partition", "hard", "4"]
  },
  { 
    label: "Search in Rotated Sorted Array", 
    category: "BinarySearch", 
    subpage: "SearchInRotatedSortedArray", 
    keywords: ["binary search", "rotated", "sorted array", "pivot", "33"]
  },
  { 
    label: "Find Peak Element", 
    category: "BinarySearch", 
    subpage: "FindPeakElement", 
    keywords: ["binary search", "peak", "peak element", "neighbors", "162"]
  },
  { 
    label: "Binary Search", 
    category: "BinarySearch", 
    subpage: "BinarySearchBasic", 
    keywords: ["binary search", "search", "sorted array", "fundamental", "basic", "704"]
  },

  // Bit Manipulation
  { 
    label: "Single Number", 
    category: "BitManipulation", 
    subpage: "SingleNumber", 
    keywords: ["bit manipulation", "xor", "single", "136"]
  },
  { 
    label: "Reverse Bits", 
    category: "BitManipulation", 
    subpage: "ReverseBits", 
    keywords: ["bit manipulation", "reverse", "bits", "190"]
  },
  { 
    label: "Number of 1 Bits", 
    category: "BitManipulation", 
    subpage: "NumberOf1Bits", 
    keywords: ["bit manipulation", "hamming weight", "count bits", "191"]
  },
  { 
    label: "Power of Two", 
    category: "BitManipulation", 
    subpage: "PowerOfTwo", 
    keywords: ["bit manipulation", "power of two", "bit trick", "231"]
  },
  { 
    label: "Counting Bits", 
    category: "BitManipulation", 
    subpage: "CountingBits", 
    keywords: ["bit manipulation", "counting", "bits", "dp", "338"]
  },
  // Dynamic Programming 
  { 
    label: "Knapsack Problem", 
    category: "DynamicProgramming", 
    subpage: "KnapsackVisualizer", 
    keywords: ["dynamic programming", "knapsack", "dp", "dynamic"]
  },
  

];
