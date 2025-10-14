import React, { useState, useEffect, useCallback } from "react";
import { GaugeCircle, Clock, CheckCircle, Code, XCircle } from 'lucide-react';

// Pointer Component with anti-collision logic
const SearchPointer = ({ value, rangeMin, rangeMax, containerId, color, label, placement = 'bottom' }) => {
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const container = document.getElementById(containerId);
        if (container && value >= rangeMin && rangeMax > rangeMin) {
            // Use a logarithmic scale for better visualization of wide-ranging numbers
            const logMin = Math.log10(rangeMin);
            const logMax = Math.log10(rangeMax);
            const logVal = Math.log10(value);
            
            const logRange = logMax - logMin;
            const percent = logRange > 0 ? ((logVal - logMin) / logRange) * 100 : 0;
            
            setPosition(Math.min(100, Math.max(0, percent)));
        } else if (value < rangeMin) {
            setPosition(0);
        }
    }, [value, rangeMin, rangeMax, containerId]);

    const colors = {
        red: { text: "text-red-400", borderB: "border-b-red-400", borderT: "border-t-red-400", bg: "bg-red-400/50" },
        blue: { text: "text-blue-400", borderB: "border-b-blue-400", borderT: "border-t-blue-400", bg: "bg-blue-400/50" },
        green: { text: "text-green-400", borderB: "border-b-green-400", borderT: "border-t-green-400", bg: "bg-green-400/50" },
    };
    const c = colors[color];

    let topStyle = 'calc(100% + 4px)';
    if (placement === 'top') topStyle = 'auto';
    else if (placement === 'bottom-staggered') topStyle = 'calc(100% + 50px)';
    
    const containerStyle = {
        left: `${position}%`,
        transform: "translateX(-50%)",
        top: topStyle,
        bottom: placement === 'top' ? 'calc(100% + 4px)' : 'auto',
    };

    return (
        <div className="absolute transition-all duration-500 ease-out flex flex-col items-center z-10" style={containerStyle}>
            {placement === 'top' ? (
                <div className="mb-2 flex flex-col items-center">
                    <div className={`text-xs font-bold ${c.text}`}>{label}</div>
                    <div className={`text-sm font-mono font-bold ${c.text}`}>{value.toLocaleString()}</div>
                    <div className={`w-0 h-0 mt-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${c.borderT}`} />
                </div>
            ) : (
                <div className="mt-2 flex flex-col items-center relative">
                     {placement === 'bottom-staggered' && (
                        <div className={`absolute bottom-full h-10 w-0.5 ${c.bg}`} />
                    )}
                    <div className={`w-0 h-0 mb-1 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent ${c.borderB}`} />
                    <div className={`text-sm font-mono font-bold ${c.text}`}>{value.toLocaleString()}</div>
                    <div className={`text-xs font-bold ${c.text}`}>{label}</div>
                </div>
            )}
        </div>
    );
};


// Component to correctly tokenize and highlight a line of code
const CodeLine = ({ text }) => {
    const KEYWORDS = ['return', 'while', 'if', 'else', 'for'];
    const TYPES = ['int', 'double', 'vector<int>&', 'auto', 'bool'];
    const FUNCTIONS = ['minSpeedOnTime', 'helper', 'max', 'ceil'];

    const tokens = text.split(/(\s+|[&,;<>(){}[\]=+\-!/])/g);

    return (
        <>
            {tokens.map((token, index) => {
                if (KEYWORDS.includes(token)) return <span key={index} className="text-purple-400">{token}</span>;
                if (TYPES.includes(token)) return <span key={index} className="text-cyan-400">{token}</span>;
                if (FUNCTIONS.includes(token)) return <span key={index} className="text-yellow-400">{token}</span>;
                if (/^-?\d+(\.\d+)?(e\d+)?$/.test(token) || token === '1e7') return <span key={index} className="text-orange-400">{token}</span>;
                if (/([&,;<>(){}[\]=+\-!/])/.test(token)) return <span key={index} className="text-gray-500">{token}</span>;
                return <span key={index} className="text-gray-300">{token}</span>;
            })}
        </>
    );
};


const MinSpeedToArriveOnTime = () => {
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [distInput, setDistInput] = useState("1,3,2");
    const [hourInput, setHourInput] = useState("2.7");
    const [isLoaded, setIsLoaded] = useState(false);
    
    const userCodeContent = {
        1: `int minSpeedOnTime(vector<int>& dist, double hour) {`,
        2: `    int distance = 0;`,
        3: `    for(int i=0; i<dist.size(); i++) distance = max(distance, dist[i]);`,
        4: `    int left = 1, right = distance * 100, ans = -1;`,
        5: `    while (left <= right) {`,
        6: `        int mid = left + (right - left) / 2;`,
        7: `        if (helper(dist, mid, hour)) {`,
        8: `            ans = mid;`,
        9: `            right = mid - 1;`,
        10: `        } else {`,
        11: `            left = mid + 1;`,
        12: `        }`,
        13: `    }`,
        14: `    return ans;`,
        15: `}`,
        16: ``,
        17: `bool helper(vector<int> &dist, double speed, double hour) {`,
        18: `    double time = 0;`,
        19: `    for(int i = 0; i < dist.size(); i++) {`,
        20: `        if (i == dist.size() - 1) time += dist[i] / speed;`,
        21: `        else time += ceil(dist[i] / speed);`,
        22: `    }`,
        23: `    return time <= hour;`,
        24: `}`,
    };

    const generateHistory = useCallback(() => {
        const localDist = distInput.split(",").map(s => parseInt(s.trim(), 10));
        const localHour = parseFloat(hourInput);
        if (localDist.some(isNaN) || isNaN(localHour) || localDist.length === 0 || localHour <= 0) { alert("Invalid input."); return; }
        
        const newHistory = [];
        const leftBound = 1;
        const maxDist = Math.max(...localDist);
        const rightBound = Math.max(maxDist * 100, leftBound);
        const searchBounds = { min: leftBound, max: rightBound };
        
        const addState = (props) => newHistory.push({ dist: [...localDist], hour: localHour, searchBounds, ...props });
        const calculateTime = (speed) => { let time = 0; for (let i = 0; i < localDist.length - 1; i++) { time += Math.ceil(localDist[i] / speed); } time += localDist[localDist.length - 1] / speed; return time; };
        
        let left = searchBounds.min; let right = searchBounds.max; let minSpeed = -1;
        
        addState({ line: 4, left, right, mid: null, minSpeed, message: "Initialize search space for speed." });
        
        while (left <= right) {
            const mid = Math.floor(left + (right - left) / 2);
            if (mid === 0) { left = 1; continue; }
            addState({ line: 6, left, right, mid, minSpeed, message: `Calculate middle speed: ${mid.toLocaleString()}.` });
            
            const timeRequired = calculateTime(mid);
            const isPossible = timeRequired <= localHour;
            
            if (isPossible) {
                addState({ line: 7, left, right, mid, minSpeed, timeRequired, message: `helper is true (${timeRequired.toFixed(2)} <= ${localHour}). Speed is valid.` });
                minSpeed = mid;
                addState({ line: 8, left, right, mid, minSpeed, timeRequired, message: `Store this valid speed: ${mid.toLocaleString()}.` });
                const nextRight = mid - 1;
                addState({ line: 9, left, right: nextRight, mid, minSpeed, timeRequired, message: "Search left for an even smaller speed." });
                right = nextRight;
            } else {
                addState({ line: 7, left, right, mid, minSpeed, timeRequired, message: `helper is false (${timeRequired.toFixed(2)} > ${localHour}). Speed is too slow.` });
                addState({ line: 10, left, right, mid, minSpeed, timeRequired, message: `Entering else block.` });
                const nextLeft = mid + 1;
                addState({ line: 11, left: nextLeft, right, mid, minSpeed, timeRequired, message: "Search right for a higher speed." });
                left = nextLeft;
            }
        }
        addState({ line: 14, left, right, mid: null, minSpeed, message: `Search complete. The minimum valid speed is ${minSpeed === -1 ? 'not found' : minSpeed.toLocaleString()}.` });
        
        setHistory(newHistory); setCurrentStep(0); setIsLoaded(true);
    }, [distInput, hourInput]);

    const resetVisualization = () => { setHistory([]); setCurrentStep(-1); setIsLoaded(false); };
    const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, history.length - 1)), [history.length]);
    const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

    useEffect(() => {
        const handleKeyDown = (e) => { if (isLoaded) { if (e.key === "ArrowLeft") { e.preventDefault(); stepBackward(); } else if (e.key === "ArrowRight") { e.preventDefault(); stepForward(); } } };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepBackward, stepForward]);

    const state = history[currentStep] || {};
    const { line, left, right, mid, minSpeed, message, timeRequired, hour, searchBounds } = state;

    // Logic to detect pointer collision
    let arePointersClose = false;
    if (isLoaded && searchBounds && searchBounds.max > searchBounds.min) {
        const logMin = Math.log10(searchBounds.min);
        const logMax = Math.log10(searchBounds.max);
        const logRange = logMax - logMin;
        
        const leftPos = ((Math.log10(left) - logMin) / logRange) * 100;
        const rightPos = ((Math.log10(right) - logMin) / logRange) * 100;

        if (Math.abs(rightPos - leftPos) < 6) { // 6% is a good visual threshold
            arePointersClose = true;
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a202c; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
            `}</style>
            <div className="p-4 max-w-7xl mx-auto">
                 <header className="text-center mb-8 pt-6">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent mb-3">
                        Minimum Speed to Arrive on Time
                    </h1>
                    <p className="text-lg text-gray-400">
                        Visualizing LeetCode 1870 - Binary Search on the Answer
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd>
                            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>
                            Navigate
                        </span>
                    </div>
                </header>
                 
                <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 mb-8">
                    {/* Controls section remains the same */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <label htmlFor="dist-input" className="font-semibold text-gray-300 text-sm whitespace-nowrap">Distances:</label>
                                <input id="dist-input" type="text" value={distInput} onChange={(e) => setDistInput(e.target.value)} disabled={isLoaded}
                                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 w-full sm:w-72 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                                    placeholder="e.g., 1,3,2"/>
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="hour-input" className="font-semibold text-gray-300 text-sm">Hour:</label>
                                <input id="hour-input" type="number" value={hourInput} onChange={(e) => setHourInput(e.target.value)} disabled={isLoaded}
                                    className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 w-24 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"/>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isLoaded ? (
                                <button onClick={generateHistory} className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-2.5 px-8 rounded-lg cursor-pointer shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                                    Load & Visualize
                                </button>
                            ) : (
                                <>
                                    <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95" title="Previous step (←)">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                                    </button>
                                    <span className="font-mono text-base text-gray-300 min-w-[100px] text-center bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700">
                                        Step <span className="text-cyan-400 font-bold">{currentStep + 1}</span>/{history.length}
                                    </span>
                                    <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 active:scale-95" title="Next step (→)">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            )}
                            <button onClick={resetVisualization} className="ml-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gray-900/70 p-5 rounded-xl shadow-2xl border border-gray-700/50">
                        <h3 className="font-bold text-xl text-cyan-400 mb-4 border-b border-gray-700 pb-3 flex items-center gap-2">
                           <Code className="w-5 h-5"/> C++ Optimal Solution
                        </h3>
                        <div className="overflow-x-auto custom-scrollbar">
                             <pre className="text-sm font-mono leading-relaxed w-max">
                                {Object.entries(userCodeContent).map(([lineNum, text]) => (
                                    <div key={lineNum} className={`flex items-start transition-all duration-300 ${line === parseInt(lineNum) ? "bg-cyan-500/20" : ""}`}>
                                        <span className="text-gray-600 select-none text-right inline-block w-8 mr-3 pt-0.5">{lineNum}</span>
                                        <div className="flex-1 pt-0.5">
                                            <CodeLine text={text} />
                                        </div>
                                    </div>
                                ))}
                            </pre>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative bg-gray-900/70 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
                            <h3 className="font-bold text-lg text-gray-300 mb-4 text-center">Search Space: Speed (km/h)</h3>
                             <p className="text-sm text-gray-400 mb-4 text-center h-5">{message || "Load data to begin visualization."}</p>
                            
                            <div id="search-space-container" className="relative h-2 bg-gray-700 rounded-full my-20 mx-4">
                                {isLoaded && searchBounds && (
                                    <>
                                        <SearchPointer value={left} rangeMin={searchBounds.min} rangeMax={searchBounds.max} containerId="search-space-container" color="red" label="left" placement="bottom" />
                                        <SearchPointer value={right} rangeMin={searchBounds.min} rangeMax={searchBounds.max} containerId="search-space-container" color="blue" label="right" placement={arePointersClose ? "bottom-staggered" : "bottom"} />
                                        {mid !== null && <SearchPointer value={mid} rangeMin={searchBounds.min} rangeMax={searchBounds.max} containerId="search-space-container" color="green" label="mid" placement="top" />}
                                    </>
                                )}
                            </div>
                             <div className="flex justify-between text-xs text-gray-500 -mt-16 px-1 font-mono">
                                <span>{isLoaded && searchBounds ? searchBounds.min.toLocaleString() : '1'}</span>
                                <span>{isLoaded && searchBounds ? searchBounds.max.toLocaleString() : '...'}</span>
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-1">(Logarithmic Scale)</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 p-6 rounded-xl shadow-xl border border-red-700/50 text-center">
                                <h3 className="font-bold text-lg text-red-300 mb-3 flex items-center justify-center gap-2"><GaugeCircle className="w-5 h-5"/> Time Required</h3>
                                <div className="font-mono text-5xl font-bold text-red-300">{timeRequired ? timeRequired.toFixed(2) : '-'}</div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-6 rounded-xl shadow-xl border border-blue-700/50 text-center">
                                <h3 className="font-bold text-lg text-blue-300 mb-3 flex items-center justify-center gap-2"><Clock className="w-5 h-5"/> Hour Deadline</h3>
                                <div className="font-mono text-5xl font-bold text-blue-300">{isLoaded ? hour.toFixed(2) : '-'}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-6 rounded-xl shadow-xl border border-green-700/50 text-center">
                                <h3 className="font-bold text-lg text-green-300 mb-3 flex items-center justify-center gap-2">
                                    {minSpeed === -1 && currentStep > 0 ? <XCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>} Min Speed Found
                                </h3>
                                <div className="font-mono text-5xl font-bold text-green-400">{minSpeed ? minSpeed.toLocaleString() : '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="text-center mt-12 pb-6 text-gray-500 text-sm">
                    <p>Use arrow keys ← → to navigate through steps</p>
                </footer>
            </div>
        </div>
    );
};

export default MinSpeedToArriveOnTime;