import React, { useState, useEffect, useCallback } from "react";
import {
    Code,
    Cookie,
    Users,
    CheckCircle,
    Clock,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
} from "lucide-react";

const AssignCookies = () => {
    const [greedsInput, setGreedsInput] = useState("1,2,3");
    const [cookiesInput, setCookiesInput] = useState("1,1");
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);

    // Greedy simulation
    const generateGreedyHistory = useCallback((greeds, cookies) => {
        const newHistory = [];
        let i = 0,
            j = 0,
            satisfied = 0;

        

        newHistory.push({
            greeds: [...greeds],
            cookies: [...cookies],
            satisfied,
            explanation: "Starting.....",
            line: 1,
        });
        greeds.sort((a, b) => a - b);
        cookies.sort((a, b) => a - b);
        newHistory.push({
            greeds: [...greeds],
            cookies: [...cookies],
            satisfied,
            explanation: "Sort both arrays in ascending order.",
            line: 2,
        });

        while (i < greeds.length && j < cookies.length) {
            newHistory.push({
                greeds: [...greeds],
                cookies: [...cookies],
                satisfied,
                currentChild: i,
                currentCookie: j,
                explanation: `Checking: child ${i + 1} (g=${greeds[i]}) with cookie ${j + 1} (s=${cookies[j]})`,
                line: 4,
            });

            if (cookies[j] >= greeds[i]) {
                satisfied++;
                i++;
                j++;
                newHistory.push({
                    greeds: [...greeds],
                    cookies: [...cookies],
                    satisfied,
                    currentChild: i - 1,
                    currentCookie: j - 1,
                    explanation: `✅ Cookie ${j} satisfies child ${i}. Total satisfied: ${satisfied}`,
                    line: 5,
                    matched: true,
                });
            } else {
                j++;
                newHistory.push({
                    greeds: [...greeds],
                    cookies: [...cookies],
                    satisfied,
                    currentChild: i,
                    currentCookie: j - 1,
                    explanation: `❌ Cookie ${j} too small for child ${i + 1}. Try next cookie.`,
                    line: 6,
                    matched: false,
                });
            }
        }

        newHistory.push({
            greeds: [...greeds],
            cookies: [...cookies],
            satisfied,
            explanation: `🎉 Finished! Total satisfied children: ${satisfied}`,
            line: 8,
            finished: true,
        });

        setHistory(newHistory);
        setCurrentStep(0);
    }, []);

    const loadData = () => {
        try {
            const g = greedsInput
                .split(",")
                .map((x) => parseInt(x.trim()))
                .filter((x) => !isNaN(x));
            const s = cookiesInput
                .split(",")
                .map((x) => parseInt(x.trim()))
                .filter((x) => !isNaN(x));

            if (g.length === 0 || s.length === 0) {
                alert("Please enter valid greed and cookie sizes!");
                return;
            }

            setIsLoaded(true);
            generateGreedyHistory(g, s);
        } catch {
            alert("Invalid input format. Use comma-separated numbers.");
        }
    };

    const stepForward = () => setCurrentStep((p) => Math.min(p + 1, history.length - 1));
    const stepBackward = () => setCurrentStep((p) => Math.max(p - 1, 0));
    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setIsPlaying(false);
        setCurrentStep(0);
    };

    useEffect(() => {
        let timer;
        if (isPlaying && currentStep < history.length - 1) {
            timer = setTimeout(stepForward, speed);
        } else setIsPlaying(false);
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, speed, history.length]);
    const GenerateNewGreedAndCookies=() =>{
        const sizeofGreed = 4;
        const sizeofCookies = 4;
        const newGreed = [];
        const newCookies = [];
        for(let i =0;i<sizeofCookies;i++){
            const greed = Math.floor(Math.random()*10)+1;
            const cookie = Math.floor(Math.random()*10)+1;
            newCookies.push(cookie);
            newGreed.push(greed);
        }
        setGreedsInput(newGreed.join(","));
        setCookiesInput(newCookies.join(","));
        reset();
    }

    const state = history[currentStep] || {};
    const {
        greeds = [],
        cookies = [],
        satisfied = 0,
        explanation = "Ready...",
        currentChild,
        currentCookie,
        line = 1,
        matched = null,
        finished = false,
    } = state;

    // Render main visualization
    const renderVisualization = () => (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Children & Cookies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Children */}
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-400 font-semibold mb-3">Children (Greed)</h4>
                    <div className="flex flex-wrap gap-2">
                        {greeds.map((g, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-2 rounded text-sm border ${idx === currentChild
                                        ? "border-yellow-400 bg-yellow-400/20"
                                        : "border-blue-500/30 bg-blue-500/10"
                                    }`}
                            >
                                Child {idx + 1}: g={g}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cookies */}
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <h4 className="text-yellow-400 font-semibold mb-3">
                        Cookies (Size)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {cookies.map((s, idx) => (
                            <div
                                key={idx}
                                className={`px-3 py-2 rounded text-sm border ${idx === currentCookie
                                        ? "border-yellow-400 bg-yellow-400/20"
                                        : "border-yellow-500/30 bg-yellow-500/10"
                                    }`}
                            >
                                Cookie {idx + 1}: s={s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Satisfied count */}
            <div className="mt-4 text-center text-green-400 font-bold text-xl">
                Satisfied Children: {satisfied}
            </div>
        </div>
    );

    const renderCodePanel = () => {
        const cppLines = [
            { line: 1, code: "int findContentChildren(vector<int>& g, vector<int>& s) {" },
            { line: 2, code: "  sort(g.begin(), g.end()); sort(s.begin(), s.end());" },
            { line: 3, code: "  int i = 0, j = 0;" },
            { line: 4, code: "  while (i < g.size() && j < s.size()) {" },
            { line: 5, code: "    if (s[j] >= g[i]) i++;" },
            { line: 6, code: "    j++;" },
            { line: 7, code: "  }" },
            { line: 8, code: "  return i;" },
            { line: 9, code: "}" },
        ];

        return (
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-green-400 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5" /> C++ Greedy Solution
                </h3>
                <pre className="text-sm font-mono bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    {cppLines.map((item) => (
                        <div
                            key={item.line}
                            className={`py-1 px-2 rounded ${item.line === line
                                    ? "bg-green-500/20 border-l-4 border-green-400"
                                    : "hover:bg-gray-800/50"
                                }`}
                        >
                            <span
                                className={`inline-block w-8 text-right pr-2 ${item.line === line ? "text-green-300" : "text-gray-500"
                                    }`}
                            >
                                {item.line}
                            </span>
                            <span
                                className={
                                    item.line === line ? "text-green-300 font-semibold" : "text-gray-300"
                                }
                            >
                                {item.code}
                            </span>
                        </div>
                    ))}
                </pre>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-yellow-300">
                        Assign Cookies
                    </h1>
                    <p className="text-gray-400 mt-2">
                        LeetCode 455 — Greedy assignment to maximize satisfied children
                    </p>
                </header>

                {/* Controls */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <label>Greeds:</label>
                        <input
                            value={greedsInput}
                            onChange={(e) => setGreedsInput(e.target.value)}
                            disabled={isLoaded}
                            className="bg-gray-700 border border-gray-600 p-2 rounded-lg flex-1"
                        />
                        <label>Cookies:</label>
                        <input
                            value={cookiesInput}
                            onChange={(e) => setCookiesInput(e.target.value)}
                            disabled={isLoaded}
                            className="bg-gray-700 border border-gray-600 p-2 rounded-lg flex-1"
                        />
                        <button onClick={GenerateNewGreedAndCookies} className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-bold text-white">
                            New Values 
                        </button>

                        {!isLoaded ? (
                            <button
                                onClick={loadData}
                                className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-bold"
                            >
                                Load & Visualize
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={stepBackward}
                                    disabled={currentStep <= 0}
                                    className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
                                >
                                    <SkipBack className="w-5 h-5" />
                                </button>

                                {!isPlaying ? (
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        disabled={currentStep >= history.length - 1}
                                        className="bg-green-500 hover:bg-green-600 p-2 rounded-lg"
                                    >
                                        <Play className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsPlaying(false)}
                                        className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg"
                                    >
                                        <Pause className="w-5 h-5" />
                                    </button>
                                )}

                                <button
                                    onClick={stepForward}
                                    disabled={currentStep >= history.length - 1}
                                    className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
                                >
                                    <SkipForward className="w-5 h-5" />
                                </button>
                                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                                    <option value={1500}>Slow</option>
                                    <option value={1000}>Medium</option>
                                    <option value={500}>Fast</option>
                                </select>
                                <button
                                    onClick={reset}
                                    className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isLoaded && history.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="xl:col-span-1 space-y-6">{renderCodePanel()}</div>
                        <div className="lg:col-span-2 space-y-6">
                            {renderVisualization()}
                            <div
                                className={`p-4 rounded-lg border-l-4 ${finished
                                        ? "border-green-400 bg-green-400/10"
                                        : "border-yellow-400 bg-yellow-400/10"
                                    }`}
                            >
                                {explanation}
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5" /> Complexity
                                </h3>
                                <p className="text-sm text-gray-300">
                                    Time: <span className="text-blue-300 font-semibold">O(n log n)</span> — due to sorting
                                    <br />
                                    Space: <span className="text-blue-300 font-semibold">O(1)</span> — in-place sorting
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-500 text-lg mb-4">
                            {isLoaded?"Loading":"Enter Values and Click 'Load And Visualize '"}

                        </div>
                        <div className="text-gray-600 text-sm">
                            Format: 
                            Greed =: Greed of Child 1, Greed of Child 2 , Greed of Child 3 ...
                            <br />
                            Cookies =: Cookie Size 1, Cookie Size 2,Cookie Size 3....
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignCookies;