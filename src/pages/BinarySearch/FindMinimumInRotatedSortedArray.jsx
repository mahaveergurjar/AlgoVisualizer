import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Code } from 'lucide-react';

const Pointer = ({ index, total, label, color='green' }) => {
    const left = `${((index + 0.5) / total) * 100}%`;
    const colors = { green: 'text-green-400', red: 'text-red-400' };
    return (
        <div className="absolute flex flex-col items-center" style={{ left, transform: 'translateX(-50%)', top: 'calc(100% + 6px)' }}>
            <div className={`w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent ${colors[color]}`} />
            <span className={`text-sm font-bold ${colors[color]} mt-1`}>{label}</span>
        </div>
    );
};

const FindMinimumInRotatedSortedArray = () => {
    const [arrInput, setArrInput] = useState('4,5,6,7,0,1,2');
    const [history, setHistory] = useState([]);
    const [step, setStep] = useState(-1);
    const [loaded, setLoaded] = useState(false);

    const generate = useCallback(() => {
        const arr = arrInput.split(',').map(s => parseInt(s.trim(), 10));
        if (arr.some(isNaN) || arr.length===0) { alert('Invalid input'); return; }
        const newHistory = [];
        const add = s => newHistory.push(s);

        let l = 0, r = arr.length - 1;
        add({ l, r, mid: null, message: 'Initialize search for min', line: 1 });
        while (l < r) {
            const mid = Math.floor((l + r) / 2);
            add({ l, r, mid, message: `Check mid=${mid}, arr[mid]=${arr[mid]}, arr[r]=${arr[r]}`, line: 4 });
            if (arr[mid] > arr[r]) { l = mid + 1; add({ l, r, mid, message: 'Minimum is to the right', line: 5 }); }
            else { r = mid; add({ l, r, mid, message: 'Minimum is at mid or to the left', line: 6 }); }
        }
        add({ l, r, mid: l, message: `Found minimum at index ${l}`, line: 8 });
        setHistory(newHistory); setStep(0); setLoaded(true);
    }, [arrInput]);

    const reset = () => { setHistory([]); setStep(-1); setLoaded(false); };
    const forward = () => setStep(s => Math.min(s + 1, history.length - 1));
    const back = () => setStep(s => Math.max(s - 1, 0));

    useEffect(() => {
        const h = (e) => { if (!loaded) return; if (e.key === 'ArrowLeft') back(); else if (e.key === 'ArrowRight') forward(); };
        window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
    }, [loaded, back, forward]);

    const state = history[step] || {};

    const codeContent = useMemo(() => ({
        1: `int findMin(vector<int>& nums) {`,
        2: `    int l = 0, r = nums.size() - 1;`,
        3: `    while (l < r) {`,
        4: `        int mid = l + (r - l) / 2;`,
        5: `        if (nums[mid] > nums[r]) l = mid + 1;`,
        6: `        else r = mid;`,
        7: `    }`,
        8: `    return nums[l];`,
        9: `}`,
    }), []);

    const CodeLine = ({ text }) => {
        const KEYWORDS = ['return', 'while', 'if', 'else', 'int', 'vector<int>&', 'vector<int>'];
        const tokens = text.split(/(\s+|[&,;<>(){}[\]=+\-!\/])/g);
        return (<>{tokens.map((token, index) => {
            if (KEYWORDS.includes(token)) return <span key={index} className="text-purple-300">{token}</span>;
            if (/^-?\d+$/.test(token)) return <span key={index} className="text-orange-300">{token}</span>;
            if (/([&,;<>(){}[\]=+\-!/])/.test(token)) return <span key={index} className="text-gray-400">{token}</span>;
            return <span key={index} className="text-gray-100">{token}</span>;
        })}</>);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
            <style>{`.animate-highlight { animation: highlight-anim 700ms ease forwards; } @keyframes highlight-anim { 0% { background-color: rgba(16,185,129,0.0); } 30% { background-color: rgba(16,185,129,0.12); } 100% { background-color: rgba(16,185,129,0.06); } }`}</style>
            <h1 className="text-3xl font-bold mb-4">Find Minimum in Rotated Sorted Array - Visualizer</h1>
            <div className="space-y-4 bg-gray-900/70 p-4 rounded-lg">
                <div className="flex gap-3 items-center">
                    <label className="font-semibold">Array:</label>
                    <input value={arrInput} onChange={e => setArrInput(e.target.value)} className="bg-gray-800 px-3 py-2 rounded text-sm w-full" disabled={loaded} />
                    {!loaded ? <button onClick={generate} className="ml-2 bg-teal-500 px-4 py-2 rounded">Load</button> : <>
                        <button onClick={back} disabled={step<=0} className="bg-gray-700 px-3 py-2 rounded">Prev</button>
                        <span className="font-mono px-3">{step+1}/{history.length}</span>
                        <button onClick={forward} disabled={step>=history.length-1} className="bg-gray-700 px-3 py-2 rounded">Next</button>
                    </>}
                    <button onClick={reset} className="ml-auto bg-red-600 px-4 py-2 rounded">Reset</button>
                </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1 bg-gray-900/80 p-4 rounded relative">
                            <div className="flex items-center justify-between">
                                <h3 className="text-teal-400 font-bold flex items-center gap-2"><Code className="w-4 h-4"/> C++ Solution</h3>
                                <button onClick={() => { const full = Object.values(codeContent).join('\n'); navigator.clipboard?.writeText(full); }} className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">Copy</button>
                            </div>
                            <pre className="text-sm font-mono mt-3 text-gray-100">
                                {Object.entries(codeContent).map(([ln, txt]) => {
                                    const lnNum = parseInt(ln, 10);
                                    const isActive = state.line === lnNum;
                                    return (
                                        <div key={ln} className={`flex items-start ${isActive ? 'bg-teal-500/10 animate-highlight' : 'transition-colors duration-300'}`}>
                                            <span className="text-gray-600 w-8 mr-3 text-right select-none">{ln}</span>
                                            <div className={`flex-1 whitespace-pre-wrap ${isActive ? 'text-teal-300' : ''}`}><CodeLine text={txt} /></div>
                                        </div>
                                    )
                                })}
                            </pre>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="relative h-48 bg-gray-800 rounded mt-2 p-4">
                                <div className="absolute left-4 top-4 text-sm text-gray-300">{state.message}</div>
                                <div className="absolute bottom-4 left-0 right-0 h-1 bg-gray-700">
                                    {(arrInput.split(',').map(s=>parseInt(s.trim(),10))).map((v,i,arr)=> (
                                        <div key={i} className="absolute" style={{ left: `${((i+0.5)/arr.length)*100}%`, transform: 'translateX(-50%)', bottom: 0 }}>
                                            <div className={`w-3 h-3 rounded-full bg-gray-600 border-2 border-gray-900 ${i===state.mid? 'scale-125':''}`}></div>
                                            <div className="text-xs text-gray-400 mt-2">{v}</div>
                                        </div>
                                    ))}
                                    {state.mid !== null && <Pointer index={state.mid} total={arrInput.split(',').length} label={`mid`} color='green' />}
                                    {state.l != null && <Pointer index={state.l ?? 0} total={arrInput.split(',').length} label={'l'} color='red' />}
                                    {state.r != null && <Pointer index={state.r ?? (arrInput.split(',').length-1)} total={arrInput.split(',').length} label={'r'} color='red' />}
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default FindMinimumInRotatedSortedArray;
