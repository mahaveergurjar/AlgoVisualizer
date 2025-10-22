import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Play,
    RotateCcw,
    Code,
    Zap,
    Clock,
    Cpu,
    Trophy,
} from "lucide-react";

const FindSecondLargestElement = ({ navigate }) => {
    const [array, setArray] = useState([7, 3, 9, 2, 8, 1, 6, 4]);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [maxIndex, setMaxIndex] = useState(0);
    const [secondMaxIndex, setSecondMaxIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [isComplete, setIsComplete] = useState(false);
    const [comparisons, setComparisons] = useState(0);

    const resetAnimation = () => {
        setCurrentIndex(1);
        setMaxIndex(0);
        setSecondMaxIndex(null);
        setIsPlaying(false);
        setIsComplete(false);
        setComparisons(0);
    };

    const startAnimation = () => {
        resetAnimation();
        setIsPlaying(true);
    };

    const generateNewArray = () => {
        const newArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 1);
        setArray(newArray);
        resetAnimation();
    };

    const loadDefaultArray = () => {
        setArray([7, 3, 9, 2, 8, 1, 6, 4]);
        resetAnimation();
    };

    useEffect(() => {
        let interval;
        if (isPlaying && currentIndex < array.length) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => {
                    const nextIndex = prev + 1;
                    setComparisons((c) => c + 1);

                    if (array[prev] > array[maxIndex]) {
                        setSecondMaxIndex(maxIndex);
                        setMaxIndex(prev);
                    } else if (
                        array[prev] < array[maxIndex] &&
                        (secondMaxIndex === null || array[prev] > array[secondMaxIndex])
                    ) {
                        setSecondMaxIndex(prev);
                    }

                    if (nextIndex >= array.length) {
                        setIsPlaying(false);
                        setIsComplete(true);
                        return prev;
                    }
                    return nextIndex;
                });
            }, speed);
        }

        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, array, maxIndex, secondMaxIndex, speed]);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <button
                    onClick={() => navigate("home")}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Array Problems
                </button>

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Trophy className="h-12 w-12 text-yellow-400" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                            Find Second Largest Element
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Visualizing how to find the second largest element in an array
                    </p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Controls */}
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={loadDefaultArray}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-all cursor-pointer"
                                >
                                    Load & Visualize
                                </button>
                                <button
                                    onClick={startAnimation}
                                    disabled={isPlaying}
                                    className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                                >
                                    <Play className="h-4 w-4" />
                                    {isPlaying ? "Running..." : "Start Animation"}
                                </button>
                                <button
                                    onClick={resetAnimation}
                                    className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                            <button
                                onClick={generateNewArray}
                                className="px-4 py-2 bg-purple-500 cursor-pointer hover:bg-purple-600 rounded-xl font-medium transition-all"
                            >
                                New Array
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-gray-400 text-sm">Speed:</label>
                            <select
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="bg-gray-800 border border-gray-700 cursor-pointer rounded-lg px-3 py-2 text-white"
                            >
                                <option value={1500}>Slow</option>
                                <option value={1000}>Medium</option>
                                <option value={500}>Fast</option>
                                <option value={250}>Very Fast</option>
                            </select>
                            <div className="flex items-center gap-2 ml-4">
                                <Code className="h-4 w-4 text-blue-400" />
                                <span className="text-sm text-gray-300">
                                    Comparisons: {comparisons}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-6 text-center">
                            Array Visualization
                        </h3>
                        <div className="flex justify-center items-end gap-4 mb-8 min-h-[200px]">
                            {array.map((value, index) => (
                                <div key={index} className="flex flex-col items-center gap-3">
                                    <div className="text-gray-400 text-sm font-mono">[{index}]</div>
                                    <div
                                        className={`w-16 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300
                      ${index === currentIndex && !isComplete
                                                ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                                                : index === maxIndex
                                                    ? "bg-red-500/30 border-red-400 scale-105 shadow-lg shadow-red-500/25"
                                                    : index === secondMaxIndex
                                                        ? "bg-blue-500/30 border-blue-400 scale-105 shadow-lg shadow-blue-500/25"
                                                        : index < currentIndex
                                                            ? "bg-green-500/20 border-green-400"
                                                            : "bg-gray-800 border-gray-700"
                                            }`}
                                        style={{ height: `${value * 20 + 60}px` }}
                                    >
                                        <div className="flex-1 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">{value}</span>
                                        </div>
                                        <div
                                            className={`w-full text-center py-1 text-xs font-bold ${index === maxIndex
                                                    ? "bg-red-500 text-white"
                                                    : index === secondMaxIndex
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-700 text-gray-300"
                                                }`}
                                        >
                                            {index === maxIndex
                                                ? "MAX"
                                                : index === secondMaxIndex
                                                    ? "2ND MAX"
                                                    : ""}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Status */}
                        <div className="text-center">
                            {isComplete ? (
                                <div className="flex flex-col items-center justify-center gap-3 text-xl font-bold text-blue-400 animate-pulse">
                                    <Trophy className="h-8 w-8 text-yellow-400" />
                                    Second Largest Element: {array[secondMaxIndex]} (index{" "}
                                    {secondMaxIndex})
                                </div>
                            ) : isPlaying ? (
                                <div className="flex items-center justify-center gap-3 text-lg text-yellow-400">
                                    <Zap className="h-5 w-5" />
                                    Checking element at index {currentIndex}...
                                </div>
                            ) : (
                                <div className="text-gray-400">
                                    Click "Start Animation" to begin visualization
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    {/* Platform Info */}
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-4">Platform</h3>
                        <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <Code className="h-5 w-5 text-orange-400" />
                            <div>
                                <div className="font-bold text-white">GfG Problem</div>
                                <div className="text-sm text-gray-400">
                                    Find the Second Largest Element
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* C++ Code Block */}
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 font-mono text-sm">
                        <h3 className="text-xl font-bold text-white mb-4">C++ Solution</h3>
                        <div className="text-blue-400">int secondLargest(vector&lt;int&gt;& arr) {'{'}</div>
                        <div className="text-green-400 ml-4">int first = INT_MIN, second = INT_MIN;</div>
                        <div className="text-green-400 ml-4">for (int x : arr) {'{'}</div>
                        <div className="text-yellow-400 ml-8">
                            if (x &gt; first) {'{'} second = first; first = x; {'}'}
                        </div>
                        <div className="text-yellow-400 ml-8">
                            else if (x &gt; second &amp;&amp; x != first) second = x;
                        </div>
                        <div className="text-green-400 ml-4">{'}'}</div>
                        <div className="text-green-400 ml-4">return second;</div>
                        <div className="text-blue-400">{'}'}</div>
                    </div>

                    {/* Complexity */}
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Complexity Analysis
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-blue-400 mt-1" />
                                <div>
                                    <div className="font-bold text-white">
                                        Time Complexity: O(N)
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Single traversal of the array to find both largest and second largest.
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Cpu className="h-5 w-5 text-green-400 mt-1" />
                                <div>
                                    <div className="font-bold text-white">
                                        Space Complexity: O(1)
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Uses only two variables to track largest values.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FindSecondLargestElement;
