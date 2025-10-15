import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import { Code, Clock, Maximize2, TrendingUp, Layers } from "lucide-react";

const FruitIntoBaskets = () => {
    const [mode, setMode] = useState("optimal");
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [numsInput, setNumsInput] = useState("1,3,-1,-3,5,3,6,7");
    const [kInput, setKInput] = useState("3");
    const [isLoaded, setIsLoaded] = useState(false);
    const [windowStyle, setWindowStyle] = useState({});

    const generateBruteForceHistory = useCallback((fruits) => {
        const newHistory = [];
        let maxLength = 0;

        const addState = (props) =>
            newHistory.push({
                nums: fruits,
                windowStart: null,
                windowEnd: null,
                maxLength,
                currentBaskets: new Set(),
                explanation: "",
                ...props,
            });

        addState({ explanation: "Initializing brute-force approach." });

        for (let i = 0; i < fruits.length; i++) {
            addState({
                windowStart: i,
                explanation: `Starting a new potential subarray from index ${i}.`,
            });

            for (let j = i; j < fruits.length; j++) {
                const currentSubarray = fruits.slice(i, j + 1);
                const currentBaskets = new Set(currentSubarray);

                addState({
                    windowStart: i,
                    windowEnd: j,
                    currentBaskets,
                    explanation: `Checking subarray from index ${i} to ${j}. It has ${currentBaskets.size} fruit types.`,
                });

                if (currentBaskets.size <= 2) {
                    maxLength = Math.max(maxLength, j - i + 1);
                    addState({
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        updatedMaxLength: true,
                        explanation: `Valid subarray. Current max length is now ${maxLength}.`,
                    });
                } else {
                    addState({
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        explanation: `Invalid subarray with ${currentBaskets.size} fruit types. Breaking inner loop.`,
                    });
                    break;
                }
            }
        }

        addState({
            finished: true,
            explanation: `Finished! The maximum number of fruits is ${maxLength}.`,
        });

        setHistory(newHistory);
        setCurrentStep(0);
    }, []);

    const generateOptimalHistory = useCallback((fruits) => {
        const newHistory = [];
        let windowStart = 0;
        let maxLength = 0;
        const fruitFrequency = new Map();

        const addState = (props) =>
            newHistory.push({
                nums: fruits,
                windowStart,
                windowEnd: null,
                maxLength,
                fruitFrequency: new Map(fruitFrequency),
                explanation: "",
                ...props,
            });

        addState({ explanation: "Initializing variables. Window is empty." });

        for (let windowEnd = 0; windowEnd < fruits.length; windowEnd++) {
            const rightFruit = fruits[windowEnd];
            fruitFrequency.set(rightFruit, (fruitFrequency.get(rightFruit) || 0) + 1);

            addState({
                windowEnd,
                justAddedFruit: rightFruit,
                explanation: `Expanding window to the right. Added fruit type ${rightFruit} at index ${windowEnd}.`,
            });

            while (fruitFrequency.size > 2) {
                addState({
                    windowEnd,
                    shrinking: true,
                    explanation: `More than 2 fruit types in baskets (${fruitFrequency.size}). Need to shrink the window from the left.`,
                });

                const leftFruit = fruits[windowStart];
                fruitFrequency.set(leftFruit, fruitFrequency.get(leftFruit) - 1);
                if (fruitFrequency.get(leftFruit) === 0) {
                    fruitFrequency.delete(leftFruit);
                }

                addState({
                    windowEnd,
                    justRemovedFruit: leftFruit,
                    explanation: `Removed fruit type ${leftFruit} from the left of the window (index ${windowStart}).`,
                });

                windowStart++;
            }

            maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
            addState({
                windowEnd,
                updatedMaxLength: true,
                explanation: `Current window size is ${windowEnd - windowStart + 1}. Max length so far is ${maxLength}.`,
            });
        }

        addState({
            windowEnd: fruits.length - 1,
            finished: true,
            explanation: `Finished! The maximum number of fruits we can pick is ${maxLength}.`,
        });

        setHistory(newHistory);
        setCurrentStep(0);
    }, []);


    const loadArray = () => {
        const fruits = numsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map(Number);

        if (fruits.some(isNaN) || fruits.length === 0) {
            alert("Invalid array input. Please use comma-separated numbers.");
            return;
        }

        setIsLoaded(true);
        if (mode === "brute-force") {
            generateBruteForceHistory(fruits);
        } else {
            generateOptimalHistory(fruits);
        }
    };

    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setCurrentStep(-1);
    };
    const parseInput = useCallback(() => {
        const nums = numsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map(Number);
        const k = parseInt(kInput, 10);
        if (nums.some(isNaN) || isNaN(k) || k <= 0) throw new Error("Invalid input");
        return { nums, k };
    }, [numsInput, kInput]);
    const handleModeChange = useModeHistorySwitch({
        mode,
        setMode,
        isLoaded,
        parseInput,
        generators: {
            "brute-force": ({ nums, k }) => generateBruteForceHistory(nums, k),
            optimal: ({ nums, k }) => generateOptimalHistory(nums, k),
        },
        setCurrentStep,
        onError: () => { },
    });

    const stepForward = useCallback(
        () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
        [history.length]
    );
    const stepBackward = useCallback(
        () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
        []
    );

    const state = history[currentStep] || {};

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLoaded) {
                if (e.key === "ArrowLeft") stepBackward();
                if (e.key === "ArrowRight") stepForward();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepForward, stepBackward]);

    useEffect(() => {
        if (isLoaded && state.windowStart !== null) {
            const container = document.getElementById("array-container");
            const startEl = document.getElementById(
                `array-container-element-${state.windowStart}`
            );
            const endEl = document.getElementById(
                `array-container-element-${state.windowEnd}`
            );

            if (container && startEl && endEl) {
                const containerRect = container.getBoundingClientRect();
                const startRect = startEl.getBoundingClientRect();
                const endRect = endEl.getBoundingClientRect();

                setWindowStyle({
                    position: "absolute",
                    top: "-8px",
                    bottom: "-8px",
                    left: `${startRect.left - containerRect.left - 8}px`,
                    width: `${endRect.right - startRect.left + 16}px`,
                    backgroundColor: "rgba(56, 189, 248, 0.1)",
                    border: "2px solid rgba(56, 189, 248, 0.5)",
                    borderRadius: "12px",
                    transition: "all 300ms ease-out",
                    opacity: 1,
                });
            }
        } else {
            setWindowStyle({ opacity: 0 });
        }
    }, [currentStep, isLoaded, state.windowStart, state.windowEnd]);

    const colorMapping = {
        purple: "text-purple-400",
        cyan: "text-cyan-400",
        "light-blue": "text-sky-300",
        yellow: "text-yellow-300",
        orange: "text-orange-400",
        red: "text-red-400",
        "light-gray": "text-gray-400",
        green: "text-green-400",
        "": "text-gray-200",
    };

    const CodeLine = ({ line, content }) => (
        <div
            className={`block rounded-md transition-colors px-2 py-1 ${state.line === line ? "bg-blue-500/20 border-l-4 border-blue-400" : ""
                }`}
        >
            <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">
                {line}
            </span>
            {content.map((token, index) => (
                <span key={index} className={colorMapping[token.c]}>
                    {token.t}
                </span>
            ))}
        </div>
    );

    const bruteForceCode = [
        {
            l: 3,
            c: [
                { t: "vector<int>", c: "cyan" },
                { t: " result;", c: "" },
            ],
        },
        {
            l: 4,
            c: [
                { t: "for", c: "purple" },
                { t: " (int i = 0; i <= n - k; i++) {", c: "" },
            ],
        },
        {
            l: 5,
            c: [
                { t: "  int", c: "cyan" },
                { t: " maxVal = nums[i];", c: "" },
            ],
        },
        {
            l: 6,
            c: [
                { t: "  for", c: "purple" },
                { t: " (int j = i; j < i + k; j++) {", c: "" },
            ],
        },
        { l: 7, c: [{ t: "    maxVal = max(maxVal, nums[j]);", c: "" }] },
        { l: 8, c: [{ t: "  }", c: "light-gray" }] },
        { l: 9, c: [{ t: "  result.push_back(maxVal);", c: "" }] },
        { l: 10, c: [{ t: "}", c: "light-gray" }] },
        {
            l: 11,
            c: [
                { t: "return", c: "purple" },
                { t: " result;", c: "" },
            ],
        },
    ];

    const optimalCode = [
        {
            l: 3,
            c: [
                { t: "vector<int>", c: "cyan" },
                { t: " result;", c: "" },
            ],
        },
        {
            l: 4,
            c: [
                { t: "deque<int>", c: "cyan" },
                { t: " dq;", c: "" },
            ],
        },
        {
            l: 5,
            c: [
                { t: "for", c: "purple" },
                { t: " (int i = 0; i < n; i++) {", c: "" },
            ],
        },
        {
            l: 7,
            c: [
                { t: "  while", c: "purple" },
                { t: " (!dq.empty() && dq.front() < i - k + 1)", c: "" },
            ],
        },
        { l: 8, c: [{ t: "    dq.pop_front();", c: "" }] },
        {
            l: 11,
            c: [
                { t: "  while", c: "purple" },
                { t: " (!dq.empty() && nums[dq.back()] <= nums[i])", c: "" },
            ],
        },
        { l: 12, c: [{ t: "    dq.pop_back();", c: "" }] },
        { l: 15, c: [{ t: "  dq.push_back(i);", c: "" }] },
        {
            l: 18,
            c: [
                { t: "  if", c: "purple" },
                { t: " (i >= k - 1)", c: "" },
            ],
        },
        { l: 19, c: [{ t: "    result.push_back(nums[dq.front()]);", c: "" }] },
        {
            l: 21,
            c: [
                { t: "return", c: "purple" },
                { t: " result;", c: "" },
            ],
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                    Fruit Into Baskets
                </h1>
                <p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 904</p>
            </header>

            <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">

                        <div className="flex items-center gap-3">
                            <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                                k:
                            </label>
                            <input
                                type="text"
                                value={kInput}
                                onChange={(e) => setKInput(e.target.value)}
                                disabled={isLoaded}
                                className="font-mono w-20 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
                                placeholder="3"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isLoaded ? (
                            <button
                                onClick={loadArray}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 cursor-pointer hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                            >
                                Load & Visualize
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={stepBackward}
                                    disabled={currentStep <= 0}
                                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                                    {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                                </span>
                                <button
                                    onClick={stepForward}
                                    disabled={currentStep >= history.length - 1}
                                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={reset}
                            className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 cursor-pointer rounded-xl shadow-lg transition-all transform hover:scale-105"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex border-b-2 border-gray-700 mb-6">
                <div
                    onClick={() => handleModeChange("brute-force")}
                    className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${mode === "brute-force"
                        ? "border-blue-400 text-blue-400 bg-blue-500/10"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                        }`}
                >
                    Brute Force O(n²)
                </div>
                <div
                    onClick={() => handleModeChange("optimal")}
                    className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${mode === "optimal"
                        ? "border-blue-400 text-blue-400 bg-blue-500/10"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                        }`}
                >
                    Optimal O(n)
                </div>
            </div>

            {isLoaded ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
                        <h3 className="font-bold text-2xl text-blue-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                            <Code size={22} />
                            C++ Solution
                        </h3>
                        <pre className="text-sm overflow-auto max-h-96">
                            <code className="font-mono leading-relaxed">
                                {mode === "brute-force"
                                    ? bruteForceCode.map((l) => (
                                        <CodeLine key={l.l} line={l.l} content={l.c} />
                                    ))
                                    : optimalCode.map((l) => (
                                        <CodeLine key={l.l} line={l.l} content={l.c} />
                                    ))}
                            </code>
                        </pre>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl">
                            <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2">
                                <TrendingUp size={22} />
                                Array Visualization
                            </h3>
                            <div className="bg-gray-900/50 p-4 rounded-xl min-h-[12rem] flex items-center">
                                <div
                                    id="array-container"
                                    className="relative flex gap-2 justify-center w-full"
                                >
                                    {state.nums?.map((num, index) => {
                                        const isComparing = state.comparingIndex === index;
                                        const isCurrentMax =
                                            mode === "brute-force" &&
                                            num === state.currentMax &&
                                            index <= state.comparingIndex;
                                        const isDequeIndex =
                                            mode === "optimal" && state.deque?.includes(index);
                                        const isDequeFront =
                                            mode === "optimal" && state.deque?.[0] === index;
                                        const isCurrentIndex = state.currentIndex === index;

                                        return (
                                            <div
                                                key={index}
                                                id={`array-container-element-${index}`}
                                                className="flex flex-col items-center"
                                            >
                                                <div
                                                    className={`w-16 h-16 flex items-center justify-center font-bold text-xl rounded-lg shadow-lg border-2 transition-all duration-300 ${isCurrentIndex
                                                        ? "bg-yellow-500/80 border-yellow-300"
                                                        : isDequeFront
                                                            ? "bg-green-500/80 border-green-300"
                                                            : isDequeIndex
                                                                ? "bg-cyan-500/80 border-cyan-300"
                                                                : isCurrentMax || isComparing
                                                                    ? "bg-pink-500/80 border-pink-300"
                                                                    : "bg-gray-600/80 border-gray-500"
                                                        }`}
                                                >
                                                    {num}
                                                </div>
                                                <span className="text-xs text-gray-400 mt-2 font-mono">
                                                    [{index}]
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div style={windowStyle} />
                                </div>
                            </div>

                            <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded border-2 border-blue-400 bg-blue-500/10"></div>
                                        <span>Window</span>
                                    </div>
                                    {mode === "brute-force" && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-pink-500/80 rounded border-2 border-pink-300"></div>
                                            <span>Current Max</span>
                                        </div>
                                    )}
                                    <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                                        <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                                            <Layers size={18} />
                                            Baskets (Fruit Types)
                                        </h3>
                                        <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap">
                                            {state.fruitFrequency?.size > 0 || state.currentBaskets?.size > 0 ? (
                                                Array.from(state.fruitFrequency || state.currentBaskets).map(([fruit, count], index) => (
                                                    <div key={index} className="flex flex-col items-center">
                                                        <div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange-600 to-amber-700 border-orange-400">
                                                            <span className="text-xs text-gray-300">Type</span>
                                                            <span className="text-lg text-white">{mode === 'optimal' ? fruit : fruit}</span>
                                                        </div>
                                                        {mode === 'optimal' && (
                                                            <span className="text-xs text-gray-400 mt-1">
                                                                count: {count}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 italic text-sm">
                                                    Baskets are empty
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-yellow-500/80 rounded border-2 border-yellow-300"></div>
                                        <span>Current Index</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {mode === "optimal" && (
                            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                                <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                                    <Layers size={18} />
                                    Deque (Front → Back)
                                </h3>
                                <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap">
                                    {state.deque?.length > 0 ? (
                                        state.deque.map((idx, pos) => (
                                            <div key={pos} className="flex flex-col items-center">
                                                <div
                                                    className={`w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 transition-all ${pos === 0
                                                        ? "bg-gradient-to-br from-green-600 to-emerald-700 border-green-400 scale-110"
                                                        : "bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400"
                                                        }`}
                                                >
                                                    <span className="text-xs text-gray-300">idx</span>
                                                    <span className="text-lg text-white">{idx}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 mt-1">
                                                    val: {state.nums[idx]}
                                                </span>
                                                {pos === 0 && (
                                                    <span className="text-xs text-green-400 font-bold mt-1">
                                                        FRONT
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 italic text-sm">
                                            Deque is empty
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                            <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                                <Maximize2 size={18} />
                                Maximum Fruits Picked
                            </h3>
                            <div className="flex justify-center items-center min-h-[4rem] bg-gray-900/50 p-4 rounded-lg">
                                <span className={`font-mono text-4xl font-bold transition-all ${state.updatedMaxLength ? 'text-green-400 scale-110' : 'text-white'}`}>
                                    {state.maxLength || 0}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
                            <h3 className="text-gray-400 text-sm font-semibold mb-2">
                                Step Explanation
                            </h3>
                            <p className="text-gray-200 text-base leading-relaxed">
                                {state.explanation || 'Click "Load & Visualize" to begin'}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h3 className="font-bold text-2xl text-blue-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
                            <Clock size={24} />
                            Complexity Analysis
                        </h3>
                        {mode === 'brute-force' ? (
                            <div className="space-y-5 text-base">
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">
                                        Time Complexity: <span className="font-mono text-teal-300">O(n²)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        We use nested loops. The outer loop iterates through all possible start points (n), and the inner loop checks all possible end points (n). This results in an O(n²) complexity.
                                    </p>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">
                                        Space Complexity: <span className="font-mono text-teal-300">O(1)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        The space for the baskets is constant because it can hold at most 3 fruit types before the inner loop breaks. Thus, space is O(1).
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 text-base">
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">
                                        Time Complexity: <span className="font-mono text-teal-300">O(n)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        We iterate through the array once with the `windowEnd` pointer. The `windowStart` pointer also only moves forward. Each element is visited at most twice, resulting in a linear time complexity.
                                    </p>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">
                                        Space Complexity: <span className="font-mono text-teal-300">O(1)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        The space for the `fruitFrequency` map is constant because it stores at most 3 fruit types. Therefore, the space complexity is O(1).
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-center py-12 text-gray-500">
                    Load an array and window size to begin visualization.
                </p>
            )}
        </div>
    );
};

export default FruitIntoBaskets;
