import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Mountain, Code, Star as StarIcon } from 'lucide-react';

// Pointer Component with corrected arrow directions
const Pointer = ({ index, total, label, color, position = 'bottom', isStaggered = false }) => {
    const leftPosition = `${((index + 0.5) / total) * 100}%`;
    const colors = {
        red: { text: "text-red-400", borderB: "border-b-red-400", bg: "bg-red-400/50" },
        blue: { text: "text-blue-400", borderT: "border-t-blue-400", bg: "bg-blue-400/50" },
        green: { text: "text-green-400", borderT: "border-t-green-400", bg: "bg-green-400/50" },
    };
    const c = colors[color];

    let topStyle = 'calc(100% + 4px)';
    if (position === 'top') topStyle = 'auto';
    else if (isStaggered) topStyle = 'calc(100% + 45px)';
    
    const containerStyle = {
        left: leftPosition,
        transform: 'translateX(-50%)',
        top: topStyle,
        bottom: position === 'top' ? 'calc(100% + 4px)' : 'auto',
    };

    return (
        <div className="absolute transition-all duration-300 ease-out flex flex-col items-center z-10" style={containerStyle}>
            {position === 'top' ? (
                <div className="mb-1 flex flex-col items-center">
                    <span className={`text-sm font-bold ${c.text}`}>{label}</span>
                    {/* Downward pointing arrow */}
                    <div className={`mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${c.borderT}`} />
                </div>
            ) : (
                <div className="mt-1 flex flex-col items-center relative">
                     {isStaggered && ( <div className={`absolute bottom-full h-10 w-0.5 ${c.bg}`} /> )}
                    {/* CORRECTED: Upward pointing arrow */}
                    <div className={`w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent ${c.borderB}`} />
                    <span className={`text-sm font-bold ${c.text} mt-1`}>{label}</span>
                </div>
            )}
        </div>
    );
};


// Main Component
const PeakIndexInMountainArray = () => {
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [arrInput, setArrInput] = useState("18,29,38,59,98,100,99,98,90");
    const [isLoaded, setIsLoaded] = useState(false);

    const codeContent = {
        1: `int peakIndexInMountainArray(vector<int>& arr) {`,
        2: `    int n = arr.size();`,
        3: `    int low = 1, high = n - 2;`,
        4: `    while (low <= high) {`,
        5: `        int mid = low + (high - low) / 2;`,
        6: `        if (arr[mid] > arr[mid+1] && arr[mid] > arr[mid-1])`,
        7: `            return mid;`,
        8: `        else if (arr[mid] > arr[mid+1])`,
        9: `            high = mid - 1;`,
        10: `        else`,
        11: `            low = mid + 1;`,
        12: `    }`,
        13: `    return 0; // Should not be reached`,
        14: `}`,
    };
    
    const generateHistory = useCallback(() => {
        const localArr = arrInput.split(",").map(s => parseInt(s.trim(), 10));
        if (localArr.some(isNaN) || localArr.length < 3) { alert("Invalid input. Please provide a comma-separated list of at least 3 numbers."); return; }
        const n = localArr.length; const newHistory = [];
        const addState = (props) => newHistory.push({ arr: localArr, ...props });
        let low = 1, high = n - 2, peakIndex = -1;
        addState({ line: 3, low, high, mid: null, message: "Initialize search space. Peak cannot be at the ends." });
        while (low <= high) {
            let mid = Math.floor(low + (high - low) / 2);
            addState({ line: 5, low, high, mid, message: `Calculate mid index: ${mid}.` });
            if (localArr[mid] > localArr[mid + 1] && localArr[mid] > localArr[mid - 1]) {
                peakIndex = mid;
                addState({ line: 6, low, high, mid, peakIndex, message: `arr[${mid}] (${localArr[mid]}) is greater than its neighbors. It's the peak!` });
                addState({ line: 7, low, high, mid, peakIndex, message: `Return peak index ${mid}.` });
                break;
            } else if (localArr[mid] > localArr[mid + 1]) {
                addState({ line: 8, low, high, mid, message: `${localArr[mid]} > ${localArr[mid+1]}. On descending slope.` });
                const prevHigh = high; high = mid - 1;
                addState({ line: 9, low, high: prevHigh, mid, message: `Peak must be to the left. Update high = ${high}.` });
            } else {
                addState({ line: 10, low, high, mid, message: `${localArr[mid]} < ${localArr[mid+1]}. On ascending slope.` });
                const prevLow = low; low = mid + 1;
                addState({ line: 11, low: prevLow, high, mid, message: `Peak must be to the right. Update low = ${low}.` });
            }
        }
        if (peakIndex === -1 && low > high) addState({ line: 4, low, high, mid: null, message: `Search complete.` });
        setHistory(newHistory); setCurrentStep(0); setIsLoaded(true);
    }, [arrInput]);

    const resetVisualization = () => { setHistory([]); setCurrentStep(-1); setIsLoaded(false); };
    const stepForward = useCallback(() => setCurrentStep(prev => Math.min(prev + 1, history.length - 1)), [history.length]);
    const stepBackward = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 0)), []);

    useEffect(() => {
        const handleKeyDown = (e) => { if (isLoaded) { if (e.key === "ArrowLeft") { e.preventDefault(); stepBackward(); } else if (e.key === "ArrowRight") { e.preventDefault(); stepForward(); } } };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepBackward, stepForward]);

    const state = history[currentStep] || {};
    const { line, arr, low, high, mid, peakIndex, message } = state;

    const { minValue, maxValue } = useMemo(() => {
        if (!isLoaded || !arr || arr.length === 0) return { minValue: 0, maxValue: 1 };
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        return { minValue: min, maxValue: max === min ? min + 1 : max };
    }, [isLoaded, arr]);
    
    let arePointersClose = false;
    if (isLoaded && arr) {
        const lowPos = ((low + 0.5) / arr.length) * 100;
        const highPos = ((high + 0.5) / arr.length) * 100;
        if (Math.abs(highPos - lowPos) < 10) arePointersClose = true;
    }
    
    const CodeLine = ({ text }) => {
        const KEYWORDS = ['return', 'while', 'if', 'else']; const TYPES = ['int', 'vector<int>&'];
        const FUNCTIONS = ['peakIndexInMountainArray']; const tokens = text.split(/(\s+|[&,;<>(){}[\]=+\-!])/g);
        return (<>{tokens.map((token, index) => {
                if (KEYWORDS.includes(token)) return <span key={index} className="text-purple-400">{token}</span>;
                if (TYPES.includes(token)) return <span key={index} className="text-cyan-400">{token}</span>;
                if (FUNCTIONS.includes(token)) return <span key={index} className="text-yellow-400">{token}</span>;
                if (/^-?\d+$/.test(token)) return <span key={index} className="text-orange-400">{token}</span>;
                if (/([&,;<>(){}[\]=+\-!/])/.test(token)) return <span key={index} className="text-gray-500">{token}</span>;
                return <span key={index} className="text-gray-300">{token}</span>;
            })}</>);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <style>{`.custom-scrollbar::-webkit-scrollbar { height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #1a202c; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; }`}</style>
            <div className="p-4 max-w-7xl mx-auto">
                <header className="text-center mb-8 pt-6">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent mb-3"> Peak Index in a Mountain Array </h1>
                    <p className="text-lg text-gray-400"> Visualizing LeetCode 852 - Binary Search </p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-2"> <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd> <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd> Navigate </span>
                    </div>
                </header>
                 
                <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-700/50 mb-8">
                    {/* Controls section */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <label htmlFor="arr-input" className="font-semibold text-gray-300 text-sm whitespace-nowrap">Array:</label>
                            <input id="arr-input" type="text" value={arrInput} onChange={(e) => setArrInput(e.target.value)} disabled={isLoaded} className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50 font-mono text-sm" placeholder="e.g., 0,10,5,2"/>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isLoaded ? ( <button onClick={generateHistory} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"> Load & Visualize </button> ) : (
                                <>
                                    <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all disabled:opacity-30" title="Previous (←)"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg> </button>
                                    <span className="font-mono text-base text-gray-300 min-w-[100px] text-center bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700"> Step <span className="text-teal-400 font-bold">{currentStep + 1}</span>/{history.length} </span>
                                    <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 font-bold p-2.5 rounded-lg transition-all disabled:opacity-30" title="Next (→)"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg> </button>
                                </>
                            )}
                            <button onClick={resetVisualization} className="ml-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"> Reset </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gray-900/70 p-5 rounded-xl shadow-2xl border border-gray-700/50">
                        <h3 className="font-bold text-xl text-teal-400 mb-4 border-b border-gray-700 pb-3 flex items-center gap-2"> <Code className="w-5 h-5"/> C++ Solution </h3>
                        <div className="overflow-x-auto custom-scrollbar">
                             <pre className="text-sm font-mono leading-relaxed w-max">
                                {Object.entries(codeContent).map(([lineNum, text]) => (
                                    <div key={lineNum} className={`flex items-start transition-all duration-300 ${line === parseInt(lineNum) ? "bg-teal-500/20" : ""}`}>
                                        <span className="text-gray-600 select-none text-right inline-block w-8 mr-3 pt-0.5">{lineNum}</span>
                                        <div className="flex-1 pt-0.5 whitespace-pre-wrap"> <CodeLine text={text} /> </div>
                                    </div>
                                ))}
                            </pre>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative bg-gray-900/70 px-6 pt-12 pb-16 rounded-xl border border-gray-700/50 shadow-2xl">
                           <h3 className="font-bold text-lg text-gray-300 mb-4 text-center">Array Visualization</h3>
                           <div className="relative h-64 w-full">
                                {isLoaded && (
                                    <>
                                        <svg width="100%" height="100%" viewBox={`0 0 ${arr.length} 100`} preserveAspectRatio="none" className="absolute bottom-0 left-0">
                                            <defs> <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stopColor="#0d9488" stopOpacity="0.6"/> <stop offset="100%" stopColor="#134e4a" stopOpacity="0.2"/> </linearGradient> </defs>
                                            <path 
                                                d={`M -1 100 L ${arr.map((val, i) => { const range = maxValue - minValue; const normalizedHeight = range > 0 ? (val - minValue) / range : 1; return `${i + 0.5} ${100 - (normalizedHeight * 85 + 5)}`; }).join(' L ')} L ${arr.length + 1} 100 Z`} 
                                                fill="url(#mountainGradient)" stroke="#0d9488" strokeWidth="0.2" 
                                            />
                                        </svg>
                                        <div className="absolute bottom-0 left-0 w-full h-full">
                                            {arr.map((val, index) => {
                                                const isInSearchSpace = index >= low && index <= high; const isMid = index === mid; const isPeak = index === peakIndex;
                                                let dotColor = "bg-gray-700/50";
                                                if (isInSearchSpace) dotColor = "bg-teal-500/50"; if (isMid) dotColor = "bg-blue-400"; if (isPeak) dotColor = "bg-green-400";
                                                const range = maxValue - minValue; const normalizedHeight = range > 0 ? (val - minValue) / range : 1;
                                                const bottomPercent = `${normalizedHeight * 85 + 5}%`;
                                                return (
                                                    <div key={index} className="absolute" style={{ left: `${((index + 0.5) / arr.length) * 100}%`, transform: 'translateX(-50%)', bottom: bottomPercent }}>
                                                        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} border-2 border-gray-950 transition-all duration-300 ${isMid || isPeak ? 'scale-150' : ''}`}></div>
                                                        <div className="text-xs mt-2 text-gray-400 absolute left-1/2 -translate-x-1/2 top-full">{val}</div>
                                                         {isPeak && <StarIcon className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 text-yellow-300 fill-current animate-pulse" />}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="absolute -bottom-1 w-full h-px bg-gray-700">
                                            {low !== null && <Pointer index={low} total={arr.length} label="low" color="red" />}
                                            {high !== null && <Pointer index={high} total={arr.length} label="high" color="red" isStaggered={arePointersClose} />}
                                            {mid !== null && peakIndex === -1 && <Pointer index={mid} total={arr.length} label="mid" color="blue" position="top"/>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-gray-900/70 p-6 rounded-xl shadow-xl border border-gray-700/50 text-center">
                            <h3 className="font-bold text-lg text-gray-300 mb-3">Algorithm State</h3>
                            <p className="text-lg text-teal-300 h-6">{message || "Load an array to begin."}</p>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-center">
                                <div><p className="text-sm text-gray-400">low</p><p className="text-2xl font-bold">{low ?? '-'}</p></div>
                                <div><p className="text-sm text-gray-400">high</p><p className="text-2xl font-bold">{high ?? '-'}</p></div>
                                <div><p className="text-sm text-gray-400">mid</p><p className="text-2xl font-bold">{mid ?? '-'}</p></div>
                                {peakIndex !== -1 && peakIndex !== null ?
                                    <div className="text-green-400"><p className="text-sm">Peak Found</p><p className="text-2xl font-bold">{peakIndex}</p></div> :
                                    <div className="text-gray-500"><p className="text-sm">Peak</p><p className="text-2xl font-bold">-</p></div>
                                }
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

export default PeakIndexInMountainArray;