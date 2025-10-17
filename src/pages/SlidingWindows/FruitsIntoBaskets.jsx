import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import { Code, Clock, Maximize2, TrendingUp, ShoppingBasket } from "lucide-react";

// The navigate prop is passed by the parent, so we accept it here for consistency.
const FruitsIntoBaskets = ({ navigate }) => {
    const [mode, setMode] = useState("optimal");
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [numsInput, setNumsInput] = useState("1,2,3,2,2");
    const [isLoaded, setIsLoaded] = useState(false);
    const [windowStyle, setWindowStyle] = useState({});

    const colorMapping = {
        purple: "text-purple-400",
        cyan: "text-cyan-400",
        yellow: "text-yellow-300",
        red: "text-red-400",
        "light-gray": "text-gray-400",
        "": "text-gray-200",
    };

    const CodeLine = ({ line, content }) => (
        <div
            className={`block rounded-md transition-colors px-2 py-1 ${
                state.line === line ? "bg-blue-500/20 border-l-4 border-blue-400" : ""
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

        addState({ line: 1, explanation: "Initializing brute-force approach. Max length is 0." });

        for (let i = 0; i < fruits.length; i++) {
            addState({
                line: 2,
                windowStart: i,
                explanation: `Starting a new potential subarray from outer loop index i = ${i}.`,
            });

            for (let j = i; j < fruits.length; j++) {
                const currentSubarray = fruits.slice(i, j + 1);
                const currentBaskets = new Set(currentSubarray);

                addState({
                    line: 3,
                    windowStart: i,
                    windowEnd: j,
                    currentBaskets,
                    explanation: `Inner loop j = ${j}. Checking subarray from index ${i} to ${j}. It has ${currentBaskets.size} fruit types.`,
                });

                if (currentBaskets.size <= 2) {
                    addState({
                        line: 6,
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        explanation: `Subarray is valid (${currentBaskets.size} types <= 2).`,
                    });
                    maxLength = Math.max(maxLength, j - i + 1);
                    addState({
                        line: 7,
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        maxLength,
                        updatedMaxLength: true,
                        explanation: `Updated max length to ${maxLength}.`,
                    });
                } else {
                    addState({
                        line: 8,
                        windowStart: i,
                        windowEnd: j,
                        currentBaskets,
                        isInvalid: true,
                        explanation: `Invalid subarray with ${currentBaskets.size} fruit types. Breaking inner loop.`,
                    });
                    break;
                }
            }
        }
        addState({
            line: 11,
            finished: true,
            maxLength,
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
                updatedMaxLength: false,
                isInvalid: false,
                removingIndex: null,
                ...props,
            });

        addState({ line: 1, explanation: "Initializing variables. Window is empty." });

        for (let windowEnd = 0; windowEnd < fruits.length; windowEnd++) {
            const rightFruit = fruits[windowEnd];
            addState({
                line: 4,
                windowEnd,
                explanation: `Processing element at windowEnd = ${windowEnd} (fruit type ${rightFruit}).`,
            });

            fruitFrequency.set(rightFruit, (fruitFrequency.get(rightFruit) || 0) + 1);
            addState({
                line: 6,
                windowEnd,
                explanation: `Added fruit ${rightFruit} to basket. Basket now has ${fruitFrequency.size} fruit types.`,
            });
            
            if (fruitFrequency.size > 2) {
                 addState({
                    line: 8,
                    windowEnd,
                    isInvalid: true,
                    explanation: `Window is invalid! More than 2 fruit types (${fruitFrequency.size}). Need to shrink from the left.`,
                });
            }

            while (fruitFrequency.size > 2) {
                const leftFruit = fruits[windowStart];
                addState({
                    line: 9,
                    windowEnd,
                    isInvalid: true,
                    removingIndex: windowStart,
                    explanation: `Shrinking window. Element at windowStart = ${windowStart} (fruit type ${leftFruit}) will be removed.`,
                });

                fruitFrequency.set(leftFruit, fruitFrequency.get(leftFruit) - 1);
                if (fruitFrequency.get(leftFruit) === 0) {
                    fruitFrequency.delete(leftFruit);
                }
                
                windowStart++;
                 addState({
                    line: 12,
                    windowEnd,
                    explanation: `Removed fruit ${leftFruit}. Window start is now at index ${windowStart}. Baskets are valid again.`,
                });
            }

            maxLength = Math.max(maxLength, windowEnd - windowStart + 1);
            addState({
                line: 15,
                windowEnd,
                maxLength,
                updatedMaxLength: true,
                explanation: `Window is valid. Current length is ${windowEnd - windowStart + 1}. Max length is ${maxLength}.`,
            });
        }

        addState({
            line: 18,
            windowEnd: fruits.length - 1,
            finished: true,
            maxLength,
            explanation: `Finished! The maximum number of fruits we can pick is ${maxLength}.`,
        });
        setHistory(newHistory);
        setCurrentStep(0);
    }, []);

    const loadArray = () => {
        const fruits = numsInput.split(",").map(s => s.trim()).filter(Boolean).map(Number);
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
        const nums = numsInput.split(",").map(s => s.trim()).filter(Boolean).map(Number);
        if (nums.some(isNaN)) throw new Error("Invalid input");
        return { nums };
    }, [numsInput]);

    const handleModeChange = useModeHistorySwitch({
        mode, setMode, isLoaded, parseInput,
        generators: {
            "brute-force": ({ nums }) => generateBruteForceHistory(nums),
            optimal: ({ nums }) => generateOptimalHistory(nums),
        },
        setCurrentStep,
        onError: () => {},
    });

    const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, history.length - 1)), [history.length]);
    const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);
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
        if (isLoaded && state.windowStart !== null && state.windowEnd !== null) {
            const container = document.getElementById("array-container");
            const startEl = document.getElementById(`array-container-element-${state.windowStart}`);
            const endEl = document.getElementById(`array-container-element-${state.windowEnd}`);
            if (container && startEl && endEl) {
                const containerRect = container.getBoundingClientRect();
                const startRect = startEl.getBoundingClientRect();
                const endRect = endEl.getBoundingClientRect();
                setWindowStyle({
                    opacity: 1,
                    left: `${startRect.left - containerRect.left - 8}px`,
                    width: `${endRect.right - startRect.left + 16}px`,
                });
            }
        } else {
            setWindowStyle({ opacity: 0 });
        }
    }, [currentStep, isLoaded, state.windowStart, state.windowEnd]);

    const bruteForceCode = [
        { l: 1, c: [{ t: "maxLength = 0", c: "" }] },
        { l: 2, c: [{ t: "for (i = 0; i < n; i++)", c: "purple" }] },
        { l: 3, c: [{ t: "  for (j = i; j < n; j++)", c: "purple" }] },
        { l: 5, c: [{ t: "    baskets = new Set(subarray)", c: "cyan" }] },
        { l: 6, c: [{ t: "    if (baskets.size <= 2)", c: "purple" }] },
        { l: 7, c: [{ t: "      maxLength = max(maxLength, ...)", c: "" }] },
        { l: 8, c: [{ t: "    else break", c: "red" }] },
        { l: 11, c: [{ t: "return maxLength", c: "purple" }] },
    ];
    
    const optimalCode = [
        { l: 1, c: [{ t: "windowStart = 0, maxLength = 0", c: "" }] },
        { l: 2, c: [{ t: "fruitFrequency = new Map()", c: "cyan" }] },
        { l: 4, c: [{ t: "for (windowEnd = 0; windowEnd < n; windowEnd++)", c: "purple" }] },
        { l: 6, c: [{ t: "  fruitFrequency.add(fruits[windowEnd])", c: "" }] },
        { l: 8, c: [{ t: "  while (fruitFrequency.size > 2)", c: "purple" }] },
        { l: 9, c: [{ t: "    leftFruit = fruits[windowStart]", c: "" }] },
        { l: 10, c: [{ t: "   fruitFrequency.remove(leftFruit)", c: "" }] },
        { l: 12, c: [{ t: "   windowStart++", c: "" }] },
        { l: 13, c: [{ t: "  }", c: "light-gray" }] },
        { l: 15, c: [{ t: "  maxLength = max(maxLength, windowEnd - windowStart + 1)", c: "" }] },
        { l: 16, c: [{ t: "}", c: "light-gray" }] },
        { l: 18, c: [{ t: "return maxLength", c: "purple" }] },
    ];
    

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Fruit Into Baskets
                </h1>
                <p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 904</p>
            </header>

            <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto flex-grow">
                      <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                          Fruits:
                      </label>
                      <input
                          type="text" value={numsInput} onChange={(e) => setNumsInput(e.target.value)} disabled={isLoaded}
                          className="font-mono flex-grow bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none transition-colors text-white"
                          placeholder="1,2,3,2,2"
                      />
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
                                <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                                </button>
                                <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                                    {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                                </span>
                                <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
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
                <div onClick={() => handleModeChange("brute-force")} className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${mode === "brute-force" ? "border-blue-400 text-blue-400 bg-blue-500/10" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
                    Brute Force O(n²)
                </div>
                <div onClick={() => handleModeChange("optimal")} className={`cursor-pointer p-4 px-8 border-b-4 transition-all font-semibold ${mode === "optimal" ? "border-blue-400 text-blue-400 bg-blue-500/10" : "border-transparent text-gray-400 hover:text-gray-300"}`}>
                    Optimal O(n)
                </div>
            </div>

            {isLoaded ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
                        <h3 className="font-bold text-2xl text-blue-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                            <Code size={22} />
                            Algorithm Pseudocode
                        </h3>
                        <pre className="text-sm overflow-auto">
                            <code className="font-mono leading-relaxed">
                                {(mode === 'brute-force' ? bruteForceCode : optimalCode).map(l => (
                                    <CodeLine key={l.l} line={l.l} content={l.c} />
                                ))}
                            </code>
                        </pre>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl">
                            <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2">
                                <TrendingUp size={22} /> Array Visualization
                            </h3>
                            <div className="bg-gray-900/50 p-4 rounded-xl min-h-[12rem] flex items-center">
                                <div id="array-container" className="relative flex gap-2 justify-center w-full">
                                    <div style={{
                                        ...windowStyle,
                                        position: 'absolute', top: '-8px', bottom: '-8px',
                                        backgroundColor: state.isInvalid ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                        border: `2px solid ${state.isInvalid ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.5)'}`,
                                        borderRadius: '12px',
                                        transition: 'all 300ms ease-out'
                                    }} />
                                    {state.nums?.map((num, index) => {
                                        const isInWindow = index >= state.windowStart && index <= state.windowEnd;
                                        const isWindowStart = index === state.windowStart && isInWindow;
                                        const isWindowEnd = index === state.windowEnd && isInWindow;
                                        const isRemoving = index === state.removingIndex;

                                        let bgColor = "bg-gray-600/80 border-gray-500";
                                        if (isRemoving) {
                                            bgColor = "bg-purple-500/80 border-purple-300 scale-110";
                                        } else if (isWindowStart) {
                                            bgColor = "bg-sky-500/80 border-sky-300";
                                        } else if (isWindowEnd) {
                                            bgColor = "bg-yellow-500/80 border-yellow-300";
                                        } else if (isInWindow) {
                                            bgColor = "bg-gray-700/80 border-gray-600";
                                        }

                                        return (
                                            <div key={index} id={`array-container-element-${index}`} className="flex flex-col items-center">
                                                <div className={`w-16 h-16 flex items-center justify-center font-bold text-xl rounded-lg shadow-lg border-2 transition-all duration-300 ${bgColor}`}>
                                                    {num}
                                                </div>
                                                <span className="text-xs text-gray-400 mt-2 font-mono">[{index}]</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-blue-400 bg-blue-500/10"></div><span>Window</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-sky-300 bg-sky-500/80"></div><span>Win Start</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-yellow-300 bg-yellow-500/80"></div><span>Win End</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-red-400 bg-red-500/30"></div><span>Invalid</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                             <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                                <ShoppingBasket size={18} /> Baskets (Fruit Types)
                            </h3>
                            <div className="flex gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg flex-wrap items-center">
                                {mode === 'optimal' && state.fruitFrequency?.size > 0 && Array.from(state.fruitFrequency.entries()).map(([fruit, count]) => (
                                    <div key={fruit} className="flex flex-col items-center"><div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange-600 to-amber-700 border-orange-400"><span className="text-xs text-gray-300">Type</span><span className="text-lg text-white">{fruit}</span></div><span className="text-xs text-gray-400 mt-1">count: {count}</span></div>
                                ))}
                                {mode === 'brute-force' && state.currentBaskets?.size > 0 && Array.from(state.currentBaskets.values()).map((fruit) => (
                                    <div key={fruit} className="flex flex-col items-center"><div className="w-16 h-16 flex flex-col items-center justify-center font-mono font-bold rounded-lg shadow-lg border-2 bg-gradient-to-br from-orange-600 to-amber-700 border-orange-400"><span className="text-xs text-gray-300">Type</span><span className="text-lg text-white">{fruit}</span></div></div>
                                ))}
                                {(!state.fruitFrequency || state.fruitFrequency.size === 0) && (!state.currentBaskets || state.currentBaskets.size === 0) && (<span className="text-gray-500 italic text-sm">Baskets are empty</span>)}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
                            <h3 className="text-gray-300 text-base font-semibold mb-3 flex items-center gap-2">
                                <Maximize2 size={18} /> Maximum Fruits Picked
                            </h3>
                            <div className="flex justify-center items-center min-h-[4rem] bg-gray-900/50 p-4 rounded-lg">
                                <span className={`font-mono text-4xl font-bold transition-all duration-300 ${state.updatedMaxLength ? 'text-green-400 scale-125' : 'text-white'}`}>{state.maxLength || 0}</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
                            <h3 className="text-gray-400 text-sm font-semibold mb-2">Step Explanation</h3>
                            <p className="text-gray-200 text-base leading-relaxed">{state.explanation || 'Click "Load & Visualize" to begin'}</p>
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
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">Time Complexity: <span className="font-mono text-teal-300">O(n²)</span></h4>
                                    <p className="text-gray-300">We use nested loops. The outer loop iterates through all possible start points (n), and the inner loop checks all possible end points (n). This results in an O(n²) complexity.</p>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">Space Complexity: <span className="font-mono text-teal-300">O(1)</span></h4>
                                    <p className="text-gray-300">The space for the baskets (a Set) is constant because it can hold at most 3 fruit types before the inner loop breaks. Thus, space is O(1).</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 text-base">
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">Time Complexity: <span className="font-mono text-teal-300">O(n)</span></h4>
                                    <p className="text-gray-300">We iterate through the array once with the `windowEnd` pointer. The `windowStart` pointer also only moves forward. Each element is visited at most twice, resulting in a linear time complexity.</p>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-blue-300 text-lg mb-2">Space Complexity: <span className="font-mono text-teal-300">O(1)</span></h4>
                                    <p className="text-gray-300">The space for the `fruitFrequency` map is constant because it stores at most 3 fruit types. Therefore, the space complexity is O(1) (or O(k) where k=3).</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-center py-12 text-gray-500">
                    Load an array to begin visualization.
                </p>
            )}
        </div>
    );
};

export default FruitsIntoBaskets;