import React, { useState, useEffect, useCallback } from "react";
import {
    Code,
    DollarSign,
    Calendar,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Clock,
    CheckCircle,
    XCircle,
    Zap,
    TrendingUp,
    Banknote
} from "lucide-react";

const LemonadeChange = ({ navigate }) => {
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [billsInput, setBillsInput] = useState("5,5,5,10,20");
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [mode, setMode] = useState("standard");

    // Generate history for Lemonade Change (standard greedy approach)
    const generateHistory = useCallback((bills) => {
        const newHistory = [];
        let fiveCount = 0;
        let tenCount = 0;
        let success = true;

        newHistory.push({
            bills: [...bills],
            fiveCount,
            tenCount,
            idx: -1,
            explanation: "Starting Lemonade Change simulation",
            line: 1,
            finished: false,
            success: true,
            customer: null,
            action: null,
        });

        for (let i = 0; i < bills.length; i++) {
            const bill = bills[i];

            newHistory.push({
                bills: [...bills],
                fiveCount,
                tenCount,
                idx: i,
                explanation: `Customer ${i + 1} pays $${bill}`,
                line: 3,
                finished: false,
                success,
                customer: bill,
                action: "arrive",
            });

            if (bill === 5) {
                // take $5
                newHistory.push({
                    bills: [...bills],
                    fiveCount,
                    tenCount,
                    idx: i,
                    explanation: `Take $5 bill — increase $5 count`,
                    line: 3,
                    finished: false,
                    success,
                    customer: bill,
                    action: "take5",
                });

                fiveCount += 1;
                newHistory.push({
                    bills: [...bills],
                    fiveCount,
                    tenCount,
                    idx: i,
                    explanation: `Now have ${fiveCount} x $5 and ${tenCount} x $10`,
                    line: 4,
                    finished: false,
                    success,
                    customer: bill,
                    action: "update",
                });
            } else if (bill === 10) {
                // need to give one $5
                newHistory.push({
                    bills: [...bills],
                    fiveCount,
                    tenCount,
                    idx: i,
                    explanation: `Need to give $5 change for $10`,
                    line: 5,
                    finished: false,
                    success,
                    customer: bill,
                    action: "need5",
                });

                if (fiveCount > 0) {
                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Give one $5 as change, take the $10`,
                        line: 7,
                        finished: false,
                        success,
                        customer: bill,
                        action: "give5_take10",
                    });

                    fiveCount -= 1;
                    tenCount += 1;

                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Now have ${fiveCount} x $5 and ${tenCount} x $10`,
                        line: 7,
                        finished: false,
                        success,
                        customer: bill,
                        action: "update",
                    });
                } else {
                    // fail
                    success = false;
                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Cannot give change — no $5 bills available. Simulation fails.`,
                        line: 6,
                        finished: true,
                        success,
                        customer: bill,
                        action: "fail",
                    });
                    setHistory(newHistory);
                    setCurrentStep(newHistory.length - 1);
                    return;
                }
            } else if (bill === 20) {
                // Prefer to give one $10 and one $5 (if available), else three $5
                newHistory.push({
                    bills: [...bills],
                    fiveCount,
                    tenCount,
                    idx: i,
                    explanation: `Need to give $15 change for $20`,
                    line: 8,
                    finished: false,
                    success,
                    customer: bill,
                    action: "need15",
                });

                if (tenCount > 0 && fiveCount > 0) {
                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Give one $10 and one $5 as change`,
                        line: 9,
                        finished: false,
                        success,
                        customer: bill,
                        action: "give10_5",
                    });

                    tenCount -= 1;
                    fiveCount -= 1;
                    // take the $20 but we don't track twenties

                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Now have ${fiveCount} x $5 and ${tenCount} x $10`,
                        line: 9,
                        finished: false,
                        success,
                        customer: bill,
                        action: "update",
                    });
                } else if (fiveCount >= 3) {
                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Give three $5 bills as change`,
                        line: 10,
                        finished: false,
                        success,
                        customer: bill,
                        action: "give5x3",
                    });

                    fiveCount -= 3;

                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Now have ${fiveCount} x $5 and ${tenCount} x $10`,
                        line: 10,
                        finished: false,
                        success,
                        customer: bill,
                        action: "update",
                    });
                } else {
                    success = false;
                    newHistory.push({
                        bills: [...bills],
                        fiveCount,
                        tenCount,
                        idx: i,
                        explanation: `Cannot give $15 change — simulation fails.`,
                        line: 11,
                        finished: true,
                        success,
                        customer: bill,
                        action: "fail",
                    });
                    setHistory(newHistory);
                    setCurrentStep(newHistory.length - 1);
                    return;
                }
            } else {
                newHistory.push({
                    bills: [...bills],
                    fiveCount,
                    tenCount,
                    idx: i,
                    explanation: `Unsupported bill amount: $${bill}. Only 5, 10, 20 supported.`,
                    line: 98,
                    finished: true,
                    success: false,
                    customer: bill,
                    action: "unsupported",
                });
                setHistory(newHistory);
                setCurrentStep(newHistory.length - 1);
                return;
            }
        }

        newHistory.push({
            bills: [...bills],
            fiveCount,
            tenCount,
            idx: bills.length,
            explanation: `Complete! Successfully gave change to all customers. Final: ${fiveCount} x $5, ${tenCount} x $10`,
            line: 14,
            finished: true,
            success: true,
            customer: null,
            action: "done",
        });

        setHistory(newHistory);
        setCurrentStep(0);
    }, []);

    const loadBills = () => {
        try {
            const bills = billsInput
                .split(",")
                .map((s) => parseInt(s.trim()))
                .filter((n) => !isNaN(n));
            if (bills.length === 0) {
                alert("Please enter at least one bill (5,10,20)");
                return;
            }

            setIsLoaded(true);
            setCurrentStep(0);
            generateHistory(bills);
        } catch (err) {
            alert("Invalid input format");
        }
    };

    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const stepForward = () => {
        setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
    };

    const stepBackward = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const playAnimation = () => {
        if (currentStep >= history.length - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(true);
    };

    const pauseAnimation = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        let timer;
        if (isPlaying && currentStep < history.length - 1) {
            timer = setTimeout(stepForward, speed);
        } else {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, history.length, speed]);

    const generateNewBills = () => {
        const options = [5, 10, 20];
        const bills = Array.from({ length: 8 }, () => options[Math.floor(Math.random() * options.length)]);
        setBillsInput(bills.join(","));
        reset();
    };

    const state = history[currentStep] || {};
    const {
        bills = [],
        fiveCount = 0,
        tenCount = 0,
        idx = -1,
        explanation = "Ready to start...",
        line = 1,
        finished = false,
        success = true,
        customer = null,
        action = null,
    } = state;

    const renderBillsTimeline = () => {
        if (bills.length === 0) {
            return (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="h-64 flex items-center justify-center text-gray-500">No customers to display</div>
                </div>
            );
        }

        return (
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Customers Timeline
                </h3>

                <div className="flex items-center gap-3 overflow-x-auto py-2">
                    {bills.map((b, i) => {
                        const isCurrent = i === idx;
                        return (
                            <div key={i} className={`flex flex-col items-center min-w-[90px] p-3 rounded-lg border ${isCurrent ? 'border-green-400 bg-green-400/10' : 'border-gray-700 bg-gray-900'}`}>
                                <div className="text-sm text-gray-400">Customer {i + 1}</div>
                                <div className="text-2xl font-bold mt-2">${b}</div>
                                {isCurrent && (
                                    <div className="text-xs mt-2 text-yellow-300">Processing...</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-400">$5 Bills</div>
                        <div className="text-2xl font-bold text-green-300">{fiveCount}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">$10 Bills</div>
                        <div className="text-2xl font-bold text-blue-300">{tenCount}</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCodePanel = () => {
        const codeLines = [
            { line: 1, code: "bool lemonadeChange(vector<int>& bills) {", type: "declaration" },
            { line: 2, code: "  int five = 0, ten = 0;", type: "initialization" },
            { line: 3, code: "  for (int bill : bills) {", type: "loop" },
            { line: 4, code: "    if (bill == 5) five++;", type: "condition" },
            { line: 5, code: "    else if (bill == 10) {", type: "condition" },
            { line: 6, code: "      if (five == 0) return false;", type: "check" },
            { line: 7, code: "      five--; ten++;", type: "update" },
            { line: 8, code: "    } else { // bill == 20", type: "comment" },
            { line: 9, code: "      if (ten > 0 && five > 0) { ten--; five--; }", type: "check" },
            { line: 10, code: "      else if (five >= 3) five -= 3;", type: "check" },
            { line: 11, code: "      else return false;", type: "check" },
            { line: 12, code: "    }", type: "closing" },
            { line: 13, code: "  }", type: "closing" },
            { line: 14, code: "  return true;", type: "return" },
            { line: 15, code: "}", type: "closing" },
        ];

        return (
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                <h3 className="font-bold text-xl text-green-400 mb-4 border-b border-gray-600 pb-3 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    C++ Solution
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm font-mono">
                        {codeLines.map((item) => (
                            <div
                                key={item.line}
                                className={`flex transition-all duration-300 py-1 px-2 rounded ${state.line === item.line
                                        ? "bg-green-500/20 border-l-4 border-green-400 shadow-lg"
                                        : "hover:bg-gray-800/50"
                                    }`}
                            >
                                <span className={`w-8 text-right pr-3 select-none ${state.line === item.line ? "text-green-300 font-bold" : "text-gray-500"
                                    }`}>
                                    {item.line}
                                </span>
                                <span className={`flex-1 ${state.line === item.line
                                        ? "text-green-300 font-semibold"
                                        : item.type === "comment"
                                            ? "text-gray-500 italic"
                                            : "text-gray-300"
                                    }`}>
                                    {item.code}
                                </span>
                            </div>
                        ))}
                    </pre>
                </div>

                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Current Execution:</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500/20 border-l-4 border-green-400 rounded"></div>
                        <span className="text-xs text-gray-300">Executing this line</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold text-green-300">Lemonade Change Visualizer</h1>
                            <p className="text-lg text-gray-400 mt-2">LeetCode 860 - Can you give correct change to every customer?</p>
                        </div>
                    </div>
                </header>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-grow">
                            <label className="font-medium text-gray-300 min-w-16">Bills:</label>
                            <input
                                type="text"
                                value={billsInput}
                                onChange={(e) => setBillsInput(e.target.value)}
                                disabled={isLoaded}
                                className="flex-grow bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                placeholder="e.g., 5,5,5,10,20"
                            />
                            <button onClick={generateNewBills} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">New Bills</button>
                        </div>

                        {!isLoaded ? (
                            <button onClick={loadBills} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">Load & Visualize</button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors disabled:opacity-50">
                                    <SkipBack className="h-5 w-5" />
                                </button>

                                {!isPlaying ? (
                                    <button onClick={playAnimation} disabled={currentStep >= history.length - 1} className="bg-green-500 hover:bg-green-600 p-3 rounded-lg transition-colors disabled:opacity-50">
                                        <Play className="h-5 w-5" />
                                    </button>
                                ) : (
                                    <button onClick={pauseAnimation} className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg transition-colors">
                                        <Pause className="h-5 w-5" />
                                    </button>
                                )}

                                <span className="text-lg text-gray-300 min-w-24 text-center">{currentStep + 1}/{history.length}</span>

                                <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors disabled:opacity-50">
                                    <SkipForward className="h-5 w-5" />
                                </button>

                                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                                    <option value={1500}>Slow</option>
                                    <option value={1000}>Medium</option>
                                    <option value={500}>Fast</option>
                                </select>

                                <button onClick={reset} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Reset</button>
                            </div>
                        )}
                    </div>
                </div>

                {isLoaded && history.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-1 space-y-6">
                            {renderCodePanel()}

                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Statistics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Final $5 Count:</span>
                                        <span className="text-2xl font-bold text-green-400">{fiveCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Final $10 Count:</span>
                                        <span className="text-lg text-blue-400">{tenCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Current Step:</span>
                                        <span className="text-lg text-yellow-400">{currentStep + 1}/{history.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Recent Actions
                                </h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {history.slice(0, currentStep + 1).reverse().slice(0, 6).map((h, i) => (
                                        <div key={i} className={`p-3 rounded border ${h.success ? 'border-green-600 bg-green-900/10' : 'border-red-600 bg-red-900/10'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold">{h.customer ? `Customer ${h.idx + 1}` : 'Status'}</span>
                                                <span className="text-sm text-gray-300">{h.action}</span>
                                            </div>
                                            <div className="text-xs text-gray-300">{h.explanation}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-2 space-y-6">
                            {renderBillsTimeline()}

                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="font-bold text-lg text-orange-300 mb-4">Step Explanation</h3>
                                <div className={`p-4 rounded-lg border-l-4 ${finished ? 'border-green-400 bg-green-400/10' : 'border-orange-400 bg-orange-400/10'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        {finished ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Zap className="w-5 h-5 text-orange-300" />}
                                        <div>{explanation}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                <h3 className="font-bold text-lg text-blue-400 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Complexity Analysis
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-300 mb-2">Time: O(n)</h4>
                                        <p className="text-gray-300 text-sm">Single pass through customers</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-300 mb-2">Space: O(1)</h4>
                                        <p className="text-gray-300 text-sm">Only counters for $5 and $10</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-500 text-lg mb-4">{isLoaded ? "Loading..." : "Enter bills and click 'Load & Visualize'"}</div>
                        <div className="text-gray-600 text-sm">Example: "5,5,5,10,20" or click "New Bills"</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LemonadeChange;
