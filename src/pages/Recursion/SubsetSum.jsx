import React, { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Code2,
    Zap,
    List,
    CheckCircle,
    Calculator,
    Clock,
    Search,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

const SubsetSumVisualizer = () => {
    const [arrayInput, setArrayInput] = useState("3,34,4,12,5,2");
    const [targetInput, setTargetInput] = useState("9");
    const [parsedArr, setParsedArr] = useState([]);
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isLoaded, setIsLoaded] = useState(false);
    const [foundCount, setFoundCount] = useState(0);

    // ---------------- Backtracking Logic ----------------
    const generateHistory = useCallback((arr, target) => {
        const newHistory = [];
        let results = [];

        const addState = (props) =>
            newHistory.push({
                arr,
                target,
                results: [...results],
                callStack: [],
                currentPath: [],
                currentSum: 0,
                i: null,
                depth: 0,
                decision: null,
                found: false,
                explanation: "",
                line: null,
                finished: false,
                ...props,
            });

        const dfs = (i, path, sum, depth) => {
            addState({
                line: 5,
                i,
                depth,
                currentPath: [...path],
                currentSum: sum,
                decision: "enter",
                explanation: `Enter recursion: index=${i}, path=[${path.join(",")}], sum=${sum}`,
            });

            if (sum === target) {
                results.push([...path]);
                addState({
                    line: 7,
                    i,
                    depth,
                    currentPath: [...path],
                    currentSum: sum,
                    decision: "found",
                    found: true,
                    explanation: `Found valid subset! path=[${path.join(",")}], sum=${sum}`,
                });
            }

            if (i >= arr.length) {
                addState({
                    line: 11,
                    i,
                    depth,
                    currentPath: [...path],
                    currentSum: sum,
                    decision: "return",
                    explanation: `Reached end at index ${i}. Returning.`,
                });
                return;
            }

            // include arr[i]
            addState({
                line: 15,
                i,
                depth,
                currentPath: [...path],
                currentSum: sum,
                decision: "decide-include",
                explanation: `Try including arr[${i}] = ${arr[i]}`,
            });
            path.push(arr[i]);
            addState({
                line: 16,
                i,
                depth: depth + 1,
                currentPath: [...path],
                currentSum: sum + arr[i],
                decision: "include",
                explanation: `Include arr[${i}]. New path=[${path.join(",")}], sum=${sum + arr[i]}`,
            });
            dfs(i + 1, path, sum + arr[i], depth + 1);

            // Backtrack
            const removed = path.pop();
            addState({
                line: 18,
                i,
                depth,
                currentPath: [...path],
                currentSum: sum,
                decision: "backtrack-include",
                explanation: `Backtrack after including ${removed}. Path restored to [${path.join(",")}], sum=${sum}`,
            });

            // exclude arr[i]
            addState({
                line: 21,
                i,
                depth,
                currentPath: [...path],
                currentSum: sum,
                decision: "decide-exclude",
                explanation: `Try excluding arr[${i}] = ${arr[i]}`,
            });
            dfs(i + 1, path, sum, depth + 1);

            addState({
                line: 23,
                i,
                depth,
                currentPath: [...path],
                currentSum: sum,
                decision: "return",
                explanation: `Return from recursion at index ${i}`,
            });
        };

        addState({ line: 2, explanation: `Start recursion with target = ${target}.` });
        dfs(0, [], 0, 0);
        addState({ line: 99, finished: true, explanation: `Finished. Found ${results.length} solution(s).` });

        // callstack
        const enriched = newHistory.map((s) => ({ ...s }));
        const stackMap = [];
        enriched.forEach((s) => {
            if (s.decision === "enter") stackMap.push({ i: s.i, depth: s.depth });
            else if (s.decision === "return" && stackMap.length) stackMap.pop();
            s.callStack = stackMap.map((x) => x.i);
        });

        setHistory(enriched);
        setCurrentStep(0);
        setFoundCount(results.length);
    }, []);

    const load = () => {
        const arr = arrayInput.split(",").map((s) => parseInt(s.trim(), 10));
        const t = parseInt(targetInput, 10);
        if (arr.some(isNaN) || isNaN(t) || arr.length === 0) return alert("Invalid input.");
        setParsedArr(arr);
        setIsLoaded(true);
        generateHistory(arr, t);
    };

    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setCurrentStep(-1);
        setFoundCount(0);
    };

    const stepForward = () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
    const stepBackward = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const state = history[currentStep] || {};

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLoaded) return;
            if (e.key === "ArrowLeft") stepBackward();
            if (e.key === "ArrowRight") stepForward();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepForward, stepBackward]);

    const CodeLine = ({ line, content }) => (
        <div className={`block rounded-md transition-colors ${state.line === line ? "bg-green-500/20" : ""}`}>
            <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">{line}</span>
            {content.map((token, index) => (
                <span key={index} className={`text-${token.c}-400`}>{token.t}</span>
            ))}
        </div>
    );

    const pseudocode = [
        { l: 1, c: [{ t: "#include <bits/stdc++.h>", c: "gray" }] },
        { l: 2, c: [{ t: "using namespace std;", c: "gray" }] },
        { l: 4, c: [{ t: "void subsetSum(vector<int>& arr, int i, int sum, int target, vector<int>& path, vector<vector<int>>& results) {", c: "cyan" }] },
        { l: 5, c: [{ t: "    if (sum == target) {", c: "green" }] },
        { l: 6, c: [{ t: "        results.push_back(path);", c: "orange" }] },
        { l: 7, c: [{ t: "    }", c: "gray" }] },
        { l: 9, c: [{ t: "    if (i >= arr.size()) return;", c: "orange" }] },
        { l: 11, c: [{ t: "    path.push_back(arr[i]);", c: "orange" }] },
        { l: 12, c: [{ t: "    subsetSum(arr, i + 1, sum + arr[i], target, path, results);", c: "orange" }] },
        { l: 14, c: [{ t: "    path.pop_back();", c: "orange" }] },
        { l: 16, c: [{ t: "    subsetSum(arr, i + 1, sum, target, path, results);", c: "orange" }] },
        { l: 17, c: [{ t: "}", c: "gray" }] },
        { l: 20, c: [{ t: "int main() {", c: "cyan" }] },
        { l: 21, c: [{ t: "    vector<int> arr = {3, 34, 4, 12, 5, 2};", c: "orange" }] },
        { l: 22, c: [{ t: "    int target = 9;", c: "orange" }] },
        { l: 23, c: [{ t: "    vector<int> path;", c: "orange" }] },
        { l: 24, c: [{ t: "    vector<vector<int>> results;", c: "orange" }] },
        { l: 25, c: [{ t: "    subsetSum(arr, 0, 0, target, path, results);", c: "orange" }] },
        { l: 26, c: [{ t: "    for (auto& subset : results) {", c: "cyan" }] },
        { l: 27, c: [{ t: "        for (int x : subset) cout << x << ' ';", c: "orange" }] },
        { l: 28, c: [{ t: "        cout << '\\n';", c: "orange" }] },
        { l: 29, c: [{ t: "    }", c: "gray" }] },
        { l: 30, c: [{ t: "}", c: "gray" }] },
    ];

    return (
        <div className="px-6 py-8 max-w-7xl mx-auto relative">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

            <header className="text-center mb-12 relative z-10">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Code2 className="h-12 w-12 text-rose-400" />
                    <h1 className="text-5xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 animate-gradient">
                        Subset Sum Visualizer
                    </h1>
                    <Zap className="h-6 w-6 text-pink-300 animate-pulse" />
                </div>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                    Visualize recursion & backtracking to find all subsets summing to a target value
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
                <input
                    type="text"
                    value={arrayInput}
                    onChange={(e) => setArrayInput(e.target.value)}
                    disabled={isLoaded}
                    className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400"
                    placeholder="Array (comma-separated)"
                />
                <input
                    type="text"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    disabled={isLoaded}
                    className="w-36 p-3 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-rose-400"
                    placeholder="Target"
                />
                {!isLoaded ? (
                    <button
                        onClick={load}
                        className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 transition text-white font-bold"
                    >
                        Load & Visualize
                    </button>
                ) : (
                    <>
                        <button
                            onClick={stepBackward}
                            disabled={currentStep <= 0}
                            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition"
                        >
                            <ArrowLeft />
                        </button>
                        <span className="px-3 font-mono text-gray-200">{currentStep + 1}/{history.length}</span>
                        <button
                            onClick={stepForward}
                            disabled={currentStep >= history.length - 1}
                            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-pink-600 disabled:opacity-40 transition"
                        >
                            <ArrowRight />
                        </button>
                        <button
                            onClick={reset}
                            className="ml-4 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold"
                        >
                            Reset
                        </button>
                    </>
                )}
            </div>

            {isLoaded && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                    {/* c++ code*/}
                    <div className="lg:col-span-1 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 shadow-lg">
                        <h3 className="flex items-center gap-2 text-green-400 mb-4">
                            <Code2 size={18} /> C++ Code
                        </h3>
                        <pre className="font-mono text-sm overflow-auto">
                            {pseudocode.map((line) => (
                                <CodeLine key={line.l} line={line.l} content={line.c} />
                            ))}
                        </pre>
                    </div>

            
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex gap-2 items-center">
                            {parsedArr.map((v, idx) => {
                                const isInPath = (state.currentPath || []).includes(v);
                                const isCurrent = state.i === idx; 
                                return (
                                    <div
                                        key={idx}
                                        className={`relative w-20 h-20 flex flex-col items-center justify-center rounded-lg font-mono font-bold text-white 
              ${isInPath ? "bg-amber-500/70" : "bg-gradient-to-br from-slate-700 to-slate-600"} 
              transition-colors duration-300`}
                                    >
                                        {isCurrent && <VisualizerPointer className="absolute -top-4" />}
                                        <div>{v}</div>
                                        <div className="text-xs text-gray-300">{idx}</div>
                                    </div>
                                );
                            })}

                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                <h4 className="text-gray-400 text-sm flex items-center gap-2"><List size={14} /> Current Path</h4>
                                <p className="font-mono text-2xl mt-2">[{(state.currentPath || []).join(", ")}]</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                <h4 className="text-gray-400 text-sm flex items-center gap-2"><Calculator size={14} /> Current Sum</h4>
                                <p className="font-mono text-2xl mt-2">{state.currentSum ?? 0}</p>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                <h4 className="text-gray-400 text-sm flex items-center gap-2"><CheckCircle size={14} /> Solutions Found</h4>
                                <p className="font-mono text-2xl mt-2 text-green-400">{state.results?.length ?? 0}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900/40 rounded-xl border border-gray-700">
                            <h4 className="text-gray-400 text-sm mb-2">Call Stack (top → bottom)</h4>
                            <div className="flex gap-2 flex-wrap">
                                {state.callStack && state.callStack.length > 0 ? (
                                    state.callStack.slice().reverse().map((c, i) => (
                                        <div key={i} className="bg-cyan-700 px-3 py-1 rounded-md font-mono text-white">{c}</div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 italic">Empty</div>
                                )}
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                            <h4 className="text-gray-400 text-sm mb-1">Explanation</h4>
                            <p className="text-gray-300">{state.explanation}</p>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                            <h4 className="text-gray-400 text-sm mb-2">Recent Solutions (Preview)</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(state.results || []).slice(-6).map((r, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-green-700/60 text-white px-3 py-2 rounded-md font-mono"
                                    >
                                        [{r.join(", ")}]
                                    </div>
                                ))}
                                {(!state.results || state.results.length === 0) && (
                                    <div className="text-gray-500 italic">None yet</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/*complexity*/}
                    <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
                        <h3 className="font-bold text-xl text-green-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2"><Clock size={20} /> Complexity & Notes</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-green-300">Time Complexity: <span className="font-mono text-teal-300">O(2^N)</span></h4>
                                <p className="text-gray-400 mt-1">Backtracking explores include/exclude decisions for each element - exponential in the worst case.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-300">Space Complexity: <span className="font-mono text-teal-300">O(N)</span></h4>
                                <p className="text-gray-400 mt-1">Recursion depth and the current path take linear space.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-300">Tips</h4>
                                <p className="text-gray-400 mt-1">Use pruning (sum &gt target) or sort + branch-and-bound to cut branches. You can also stop at first solution if you only need one.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .animate-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:0.4;}50%{opacity:0.8;} }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float 20s ease-in-out 10s infinite; }
        @keyframes float { 0%,100%{transform:translate(0,0);}50%{transform:translate(30px,-30px);} }
      `}</style>
        </div>
    );
};

export default SubsetSumVisualizer;
