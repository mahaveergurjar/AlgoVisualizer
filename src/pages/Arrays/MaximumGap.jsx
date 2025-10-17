import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, TrendingUp } from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer.jsx";

const MaximumGap = () => {
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [arrayInput, setArrayInput] = useState("-2,1,-3,4,-1,2,1,-5,4");
    const [isLoaded, setIsLoaded] = useState(false);

    const generateMaxGapHistory = useCallback((arr) => {
        const newHistory = [];

        if (arr.length < 2) {
            alert("Array must have at least two elements.");
            return;
        }

        const sorted = [...arr].sort((a, b) => a - b);
        let maxGap = 0;
        let currentGap = 0;

        const addState = (props) =>
            newHistory.push({
                arr: [...sorted],
                maxGap,
                currentGap,
                explanation: "",
                ...props,
            });

        addState({
            line: 1,
            currentIndex: 0,
            explanation: `Sort the array: [${sorted.join(", ")}].`,
        });

        for (let i = 1; i < sorted.length; i++) {
            currentGap = sorted[i] - sorted[i - 1];
            addState({
                line: 2,
                currentIndex: i,
                explanation: `Gap between arr[${i - 1}] = ${sorted[i - 1]
                    } and arr[${i}] = ${sorted[i]} is ${currentGap}.`,
            });

            if (currentGap > maxGap) {
                maxGap = currentGap;
                addState({
                    line: 3,
                    currentIndex: i,
                    newMax: true,
                    explanation: `New maximum gap found: ${maxGap}.`,
                });
            }
        }

        addState({
            line: 4,
            finished: true,
            explanation: `Maximum gap = ${maxGap}.`,
        });

        setHistory(newHistory);
        setCurrentStep(0);
    }, []);

    const loadProblem = () => {
        const arr = arrayInput
            .split(",")
            .map((x) => parseInt(x.trim()))
            .filter((x) => !isNaN(x));
        if (arr.length === 0) {
            alert("Please enter a valid array.");
            return;
        }
        setIsLoaded(true);
        generateMaxGapHistory(arr);
    };

    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setCurrentStep(-1);
    };

    const stepForward = useCallback(
        () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
        [history.length]
    );
    const stepBackward = useCallback(
        () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
        []
    );

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!isLoaded) return;
            if (e.key === "ArrowRight") stepForward();
            else if (e.key === "ArrowLeft") stepBackward();
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isLoaded, stepForward, stepBackward]);

    const state = history[currentStep] || {};
    const {
        arr = [],
        currentIndex = -1,
        maxSum = 0,
        currentSum = 0,
        subarrayStart = -1,
        subarrayEnd = -1,
        explanation = "",
        finished = false,
        newMax = false,
    } = state;

    const colorMapping = {
        purple: "text-purple-400",
        cyan: "text-cyan-400",
        yellow: "text-yellow-300",
        green: "text-green-400",
        "light-gray": "text-gray-400",
        "": "text-gray-200",
    };

    const CodeLine = ({ line, content }) => (
        <div
            className={`block rounded-md transition-colors ${state.line === line ? "bg-blue-500/20" : ""
                }`}
        >
            <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">
                {line}
            </span>
            {content.map((token, index) => (
                <span key={index} className={colorMapping[token.c]}>
                    {token.t}
                </span>
            ))}
        </div>
    );

    const maxGapCode = [
        { l: 1, c: [{ t: "sort(nums)", c: "" }] },
        { l: 2, c: [{ t: "for i in range(1, n):", c: "purple" }] },
        { l: 3, c: [{ t: "  gap = nums[i] - nums[i-1]", c: "" }] },
        { l: 4, c: [{ t: "  maxGap = max(maxGap, gap)", c: "" }] },
        { l: 5, c: [{ t: "return maxGap", c: "purple" }] },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-6">
                <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
                    <TrendingUp /> Maximum Gap
                </h1>
                <p className="text-lg text-gray-400 mt-2">
                    LeetCode #164 - Find the maximum difference between two successive
                    elements in a given array.
                </p>
            </header>

            <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-grow w-full">
                        <label
                            htmlFor="array-input"
                            className="font-medium text-gray-300 font-mono"
                        >
                            Array:
                        </label>
                        <input
                            id="array-input"
                            type="text"
                            value={arrayInput}
                            onChange={(e) => setArrayInput(e.target.value)}
                            disabled={isLoaded}
                            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., -2,1,-3,4,-1,2,1,-5,4"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {!isLoaded ? (
                            <button
                                onClick={loadProblem}
                                className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Load & Visualize
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={stepBackward}
                                    disabled={currentStep <= 0}
                                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="font-mono w-24 text-center">
                                    {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                                </span>
                                <button
                                    onClick={stepForward}
                                    disabled={currentStep >= history.length - 1}
                                    className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={reset}
                            className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {isLoaded ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
                        <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
                            <Code size={20} />
                            Pseudocode
                        </h3>
                        <pre className="text-sm overflow-auto">
                            <code className="font-mono leading-relaxed">
                                {maxGapCode.map((line) => (
                                    <CodeLine key={line.l} line={line.l} content={line.c} />
                                ))}
                            </code>
                        </pre>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
                            <h3 className="font-bold text-lg text-gray-300 mb-4">
                                Array Visualization
                            </h3>
                            <div className="flex gap-2 flex-wrap">
                                {arr.map((value, index) => {
                                    const isActive = index === currentIndex;
                                    const inSubarray =
                                        index >= subarrayStart && index <= subarrayEnd;

                                    let bgColor = "bg-gray-700";
                                    let borderColor = "border-gray-600";
                                    let textColor = "text-gray-200";

                                    if (inSubarray && !finished) {
                                        bgColor = "bg-cyan-600/30";
                                        borderColor = "border-cyan-500/50";
                                    }

                                    if (isActive) {
                                        bgColor = "bg-purple-600/50";
                                        borderColor = "border-purple-500";
                                        textColor = "text-purple-100";
                                    }

                                    if (newMax && inSubarray) {
                                        bgColor = "bg-amber-600/50";
                                        borderColor = "border-amber-500";
                                    }

                                    if (finished && inSubarray) {
                                        bgColor = "bg-green-600/50";
                                        borderColor = "border-green-500";
                                        textColor = "text-green-100";
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center relative"
                                        >
                                            {isActive && <VisualizerPointer />}
                                            <div
                                                className={`${bgColor} ${borderColor} border-2 rounded-lg w-16 h-16 flex flex-col items-center justify-center font-mono font-bold transition-all duration-300 ${textColor}`}
                                            >
                                                <span className="text-lg">{value}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1">
                                                {index}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-8 justify-center mt-6 mb-4">
                            {/* Current Gap */}
                            <div className="bg-slate-700/80 px-8 py-4 rounded-xl shadow-lg text-center border border-gray-700">
                                <p className="text-2xl font-mono text-gray-300">
                                    Current Gap:{" "}
                                    <span className="text-blue-400 font-bold">
                                        {history[currentStep]?.currentGap ?? 0}
                                    </span>
                                </p>
                            </div>

                            {/* Max Gap */}
                            <div className="bg-slate-700/80 px-8 py-4 rounded-xl shadow-lg text-center border border-gray-700">
                                <p className="text-2xl font-mono text-gray-300">
                                    Max Gap:{" "}
                                    <span className="text-green-400 font-bold">
                                        {history[currentStep]?.maxGap ?? 0}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
                            <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
                            <p className="text-gray-300">{explanation}</p>
                            {finished && (
                                <div className="mt-2 flex items-center gap-2">
                                    <CheckCircle className="text-green-400" />
                                    <span className="text-green-400 font-bold">
                                        Algorithm Complete!
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
                        <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
                            <Clock size={20} /> Complexity Analysis
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-blue-300">Time Complexity</h4>
                                <p className="text-gray-400">
                                    <strong className="text-teal-300 font-mono">
                                        O(n log n)
                                    </strong>
                                    <br />
                                    Sorting takes O(n log n), then a single pass O(n) to find the
                                    max gap.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-blue-300">
                                    Space Complexity
                                </h4>
                                <p className="text-gray-400">
                                    <strong className="text-teal-300 font-mono">O(1)</strong>
                                    <br />
                                    We only use two variables (currentGap and maxGap) regardless
                                    of input size, making this solution extremely space-efficient.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">
                    Enter an array to begin visualization.
                </p>
            )}
        </div>
    );
};

export default MaximumGap;
