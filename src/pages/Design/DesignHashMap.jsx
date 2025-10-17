import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  Clock,
  Hash,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// Main Visualizer Component
const DesignHashMap = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [operationsInput, setOperationsInput] = useState(
    `HashMap()\nput("apple", 5)\nput("banana", 3)\nget("apple")\nput("cherry", 8)\nremove("banana")\nget("banana")\nget("cherry")`
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const parseOperations = (input) => {
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const commands = [];

    for (let i = 0; i < lines.length; i++) {
      const putMatch = lines[i].match(/put\("([^"]+)",\s*(\d+)\)/);
      if (putMatch) {
        commands.push({
          op: "put",
          key: putMatch[1],
          value: parseInt(putMatch[2], 10),
        });
        continue;
      }
      const getMatch = lines[i].match(/get\("([^"]+)"\)/);
      if (getMatch) {
        commands.push({ op: "get", key: getMatch[1] });
        continue;
      }
      const removeMatch = lines[i].match(/remove\("([^"]+)"\)/);
      if (removeMatch) {
        commands.push({ op: "remove", key: removeMatch[1] });
      }
    }
    return { commands };
  };

  const generateOptimalHistory = useCallback((commands) => {
    const newHistory = [];
    const BUCKETS = 8;
    let buckets = Array.from({ length: BUCKETS }, () => []); // each bucket: [{key, value}]
    let outputLog = [];

    const hashString = (s) => {
      // djb2 variant for strings
      let h = 5381;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
      }
      return h >>> 0; // ensure positive
    };
    const bucketIndex = (key) => hashString(key) % BUCKETS;
    const findInBucket = (idx, key) => buckets[idx].findIndex((e) => e.key === key);

    const getFlatMap = () => {
      const mapObject = {};
      for (const bucket of buckets) {
        for (const { key, value } of bucket) mapObject[key] = value;
      }
      return mapObject;
    };

    const addState = (props) =>
      newHistory.push({
        hashMap: getFlatMap(),
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      line: 5,
      commandIndex: -1,
      explanation: `Hash table initialized with ${BUCKETS} buckets using a string hash function.`,
    });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        const idx = bucketIndex(key);
        addState({ line: 17, commandIndex, explanation: `put("${key}", ${value}): compute hash → bucket ${idx}.` });
        const pos = findInBucket(idx, key);
        if (pos !== -1) {
          buckets[idx][pos].value = value;
          addState({ line: 18, commandIndex, newKey: key, explanation: `Key exists in bucket ${idx}. Update value to ${value}.` });
        } else {
          buckets[idx].push({ key, value });
          addState({ line: 18, commandIndex, newKey: key, explanation: `Insert new pair into bucket ${idx}.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        const idx = bucketIndex(key);
        addState({ line: 9, commandIndex, explanation: `get("${key}"): compute hash → bucket ${idx}.` });
        const pos = findInBucket(idx, key);
        if (pos !== -1) {
          const value = buckets[idx][pos].value;
          outputLog.push(value);
          addState({ line: 11, commandIndex, getResult: value, explanation: `Found in bucket ${idx}. Return ${value}.` });
        } else {
          outputLog.push(-1);
          addState({ line: 10, commandIndex, getResult: -1, explanation: `Not present in bucket ${idx}. Return -1.` });
        }
      } else if (command.op === "remove") {
        const { key } = command;
        const idx = bucketIndex(key);
        addState({ line: 20, commandIndex, explanation: `remove("${key}"): compute hash → bucket ${idx}.` });
        const pos = findInBucket(idx, key);
        if (pos !== -1) {
          buckets[idx].splice(pos, 1);
          addState({ line: 22, commandIndex, removedKey: key, explanation: `Removed from bucket ${idx}.` });
        } else {
          addState({ line: 21, commandIndex, explanation: `Key not found in bucket ${idx}. Nothing to remove.` });
        }
      }
    });

    addState({ finished: true, explanation: "All operations complete." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateBruteForceHistory = useCallback((commands) => {
    const newHistory = [];
    let entries = [];
    let outputLog = [];

    const getObjectSnapshot = () => {
      const obj = {};
      for (const { key, value } of entries) obj[key] = value;
      return obj;
    };

    const indexOfKey = (k) => entries.findIndex((e) => e.key === k);

    const addState = (props) =>
      newHistory.push({
        hashMap: getObjectSnapshot(),
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      commandIndex: -1,
      explanation: "HashMap initialized using array of pairs (O(N) search).",
    });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put("${key}", ${value}). Linear search for existing key.` });
        const idx = indexOfKey(key);
        if (idx !== -1) {
          entries[idx].value = value;
          addState({ commandIndex, newKey: key, explanation: `Updated existing key after O(N) search.` });
        } else {
          entries.push({ key, value });
          addState({ commandIndex, newKey: key, explanation: `Inserted new key by pushing to the array.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get("${key}"). Linear search for key.` });
        const idx = indexOfKey(key);
        if (idx !== -1) {
          const val = entries[idx].value;
          outputLog.push(val);
          addState({ commandIndex, getResult: val, explanation: `Key found after O(N) search. Returning ${val}.` });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key not found after O(N) search. Returning -1.` });
        }
      } else if (command.op === "remove") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing remove("${key}"). Linear search and splice.` });
        const idx = indexOfKey(key);
        if (idx !== -1) {
          entries.splice(idx, 1);
          addState({ commandIndex, removedKey: key, explanation: `Removed key by splicing the array (O(N)).` });
        } else {
          addState({ commandIndex, explanation: `Key not found. Nothing to remove.` });
        }
      }
    });

    addState({ finished: true, explanation: "All operations complete." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadOps = () => {
    const { commands } = parseOperations(operationsInput);
    if (commands.length === 0) {
      alert("Please provide at least one operation.");
      return;
    }
    setIsLoaded(true);
    if (mode === "optimal") {
      generateOptimalHistory(commands);
    } else {
      generateBruteForceHistory(commands);
    }
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const parseInput = useCallback(() => {
    const { commands } = parseOperations(operationsInput);
    if (commands.length === 0) throw new Error("Invalid operations");
    return { commands };
  }, [operationsInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ commands }) => generateBruteForceHistory(commands),
      optimal: ({ commands }) => generateOptimalHistory(commands),
    },
    setCurrentStep,
    onError: () => {},
  });

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

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

  const state = history[currentStep] || {};

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
      className={`block rounded-md transition-colors px-2 py-1 ${
        state.line === line
          ? "bg-orange-500/20 border-l-4 border-orange-400"
          : ""
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

  const optimalCode = [
    {
      l: 1,
      c: [
        { t: "class", c: "purple" },
        { t: " HashMap {", c: "" },
      ],
    },
    { l: 5, c: [{ t: "HashMap() { ... }", c: "light-gray" }] },
    {
      l: 8,
      c: [
        { t: "int", c: "cyan" },
        { t: " get(", c: "" },
        { t: "string", c: "cyan" },
        { t: " key) {", c: "" },
      ],
    },
    {
      l: 9,
      c: [
        { t: "  if", c: "purple" },
        { t: " (map.find(key) == map.end()) {", c: "" },
      ],
    },
    {
      l: 10,
      c: [
        { t: "    return", c: "purple" },
        { t: " -1;", c: "orange" },
      ],
    },
    { l: 11, c: [{ t: "  return", c: "purple" }, { t: " map[key];", c: "" }] },
    { l: 12, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 14,
      c: [
        { t: "void", c: "purple" },
        { t: " put(", c: "" },
        { t: "string", c: "cyan" },
        { t: " key, ", c: "" },
        { t: "int", c: "cyan" },
        { t: " value) {", c: "" },
      ],
    },
    { l: 15, c: [{ t: "  map[key] = value;", c: "" }] },
    { l: 16, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 18,
      c: [
        { t: "void", c: "purple" },
        { t: " remove(", c: "" },
        { t: "string", c: "cyan" },
        { t: " key) {", c: "" },
      ],
    },
    { l: 19, c: [{ t: "  map.erase(key);", c: "" }] },
    { l: 20, c: [{ t: "}", c: "light-gray" }] },
    { l: 21, c: [{ t: "};", c: "" }] },
  ];

  const bruteForceCode = [
    { l: 1, c: [{ t: "// Using object as HashMap", c: "green" }] },
    { l: 2, c: [{ t: "unordered_map<string, int> data;", c: "" }] },
    { l: 4, c: [{ t: "int get(string key) {", c: "" }] },
    {
      l: 5,
      c: [{ t: "  if(data.find(key) == data.end()) return -1;", c: "" }],
    },
    { l: 6, c: [{ t: "  return data[key];", c: "" }] },
    { l: 7, c: [{ t: "}", c: "light-gray" }] },
    { l: 9, c: [{ t: "void put(string key, int value) {", c: "" }] },
    { l: 10, c: [{ t: "  data[key] = value;", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    { l: 13, c: [{ t: "void remove(string key) {", c: "" }] },
    { l: 14, c: [{ t: "  data.erase(key);", c: "" }] },
    { l: 15, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
            HashMap Visualizer
          </h1>
          <p className="text-sm text-gray-400">Visualizing LeetCode 706: HashMap operations</p>
        </header>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Enter Operations (one per line or comma-separated):</label>
              <div className="bg-gray-900 rounded-lg border border-gray-600 focus-within:border-orange-500 transition-colors p-3 max-h-32 overflow-y-auto">
                <input
                  type="text"
                  placeholder='HashMap(), put("apple",5), get("apple"), remove("banana")'
                  value={operationsInput.replace(/\n/g, ', ')}
                  onChange={(e) => setOperationsInput(e.target.value.replace(/, /g, '\n').replace(/,/g, '\n'))}
                  disabled={isLoaded}
                  className="w-full bg-transparent font-mono text-xs text-gray-200 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Mode:</span>
                <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                  <button onClick={() => handleModeChange("brute-force")} className={`px-4 py-1.5 cursor-pointer rounded-md font-semibold transition-all text-xs ${mode === "brute-force" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>
                    Brute Force O(N)
                  </button>
                  <button onClick={() => handleModeChange("optimal")} className={`px-4 py-1.5 cursor-pointer rounded-md font-semibold transition-all text-xs ${mode === "optimal" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>
                    Optimal O(1)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isLoaded ? (
                  <button onClick={loadOps} className="bg-gradient-to-r from-orange-500 to-red-500 cursor-pointer hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-md shadow-md transform hover:scale-105 transition-all flex items-center gap-2">
                    <CheckCircle size={16} /> Visualize
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-2 bg-gray-900/50 p-1.5 rounded-md border border-gray-600">
                      <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-30 transition-all" title="Previous Step (←)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <div className="bg-gray-800 px-3 py-1 rounded border border-gray-600">
                        <span className="font-mono text-sm font-bold text-orange-400">{currentStep >= 0 ? currentStep + 1 : 0}</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="font-mono text-xs text-gray-400">{history.length}</span>
                      </div>
                      <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-30 transition-all" title="Next Step (→)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <button onClick={reset} className="bg-red-600/80 hover:bg-red-600 cursor-pointer font-bold py-2 px-4 rounded-md shadow-md transition-all text-sm">
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoaded ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-blue-400" />
                <h3 className="font-bold text-md text-blue-300">Current Step Explanation</h3>
              </div>
              <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[50px]">
                <p className="text-sm text-gray-200">{state.explanation}</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={18} className="text-cyan-400" />
                <div>
                  <h3 className="font-bold text-md text-cyan-300">Output Log</h3>
                  <p className="text-xs text-gray-500">Results from get() operations</p>
                </div>
              </div>
              <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[50px]">
                <div className="flex flex-wrap gap-2">
                  {(state.outputLog || []).length === 0 ? <p className="text-gray-500 text-xs italic">No output yet</p>
                    : state.outputLog.map((out, i) => (
                      <div key={i} className={`font-mono px-3 py-1 rounded-md font-bold text-md border transition-all ${state.commandIndex === i && state.getResult !== undefined ? "bg-orange-500/30 border-orange-400 scale-110" : out === -1 ? "bg-red-900/30 border-red-600 text-red-300" : "bg-green-900/30 border-green-600 text-green-300"}`}>{out}</div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Hash size={18} className="text-purple-400" />
                <div>
                  <h3 className="font-bold text-md text-purple-300">Hash Table</h3>
                  <p className="text-xs text-gray-500 font-mono">{mode === 'optimal' ? 'Buckets + Hash(String)' : 'Array of pairs'}</p>
                </div>
              </div>
              <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[150px]">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(state.hashMap || {}).length === 0 ? <p className="text-gray-500 text-xs italic">HashMap is empty</p>
                    : Object.entries(state.hashMap || {}).map(([key, value]) => (
                      <div key={key} className={`p-2 rounded-lg bg-gray-700/50 border shadow-md transform transition-all flex items-center gap-2 ${state.newKey == key ? "border-orange-400 scale-110" : "border-gray-600"}`}>
                        <div className="px-2 h-8 flex items-center justify-center bg-orange-500 rounded font-mono text-xs font-bold max-w-[160px] truncate" title={key}>{key}</div>
                        <ArrowRight size={14} className="text-gray-500" />
                        <div className="w-10 h-8 flex items-center justify-center bg-blue-500 rounded font-mono text-sm font-bold">{value}</div>
                      </div>
                    ))}
                  {state.removedKey && (
                    <div className="p-2 rounded-lg bg-red-900/30 border border-red-500 shadow-md"><div className="px-2 h-8 flex items-center justify-center bg-red-800 rounded font-mono text-xs font-bold max-w-[160px] truncate" title={state.removedKey}>{state.removedKey}</div></div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-bold text-md text-purple-300 mb-3 pb-2 border-b border-gray-700 flex items-center gap-3"><Clock size={18} /> Complexity Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {mode === "optimal" ? (
                  <>
                    <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                      <h4 className="font-bold text-green-400 mb-1">Time: <span className="font-mono text-cyan-300">O(1)</span> average</h4>
                      <p className="text-gray-400 text-xs">Custom hash table with <span className="font-mono">B</span> buckets. <code className="text-orange-300">get/put/remove</code> compute the hash and scan one bucket. With a good hash and load factor, expected bucket length is small, yielding average <span className="font-mono">O(1)</span>. Worst-case is <span className="font-mono">O(n)</span> if everything falls into one bucket.</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                      <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(n + B)</span></h4>
                      <p className="text-gray-400 text-xs">Stores all key–value pairs plus <span className="font-mono">B</span> empty bucket arrays. As <span className="font-mono">n</span> grows, the dominant term is <span className="font-mono">O(n)</span>.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                      <h4 className="font-bold text-green-400 mb-1">Time: <span className="font-mono text-cyan-300">O(n)</span></h4>
                      <p className="text-gray-400 text-xs">Brute force uses an array of pairs; <code className="text-orange-300">get()</code>, <code className="text-orange-300">put()</code> (update), and <code className="text-orange-300">remove()</code> linearly scan to find the key, costing up to <span className="font-mono">O(n)</span>. Inserting a new key is amortized <span className="font-mono">O(1)</span> for the push, but still requires an <span className="font-mono">O(n)</span> scan to check for existence.</p>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                      <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(n)</span></h4>
                      <p className="text-gray-400 text-xs">Array stores each key–value pair once; space grows linearly with the number of entries.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-gray-800 p-8 rounded-lg border border-dashed border-gray-600 max-w-md mx-auto">
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code size={32} className="text-orange-400" /></div>
              <h2 className="text-xl font-bold text-gray-300 mb-2">Ready to Visualize</h2>
              <p className="text-gray-400 text-sm">Enter operations above and click "Visualize" to see how the HashMap works.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignHashMap;
