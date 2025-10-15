import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Clock,
  Hash,
  Link2,
  ArrowRight,
  CheckCircle,
  Code,
} from "lucide-react";

// Main Visualizer Component
const LRUCacheVisualizer = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [operationsInput, setOperationsInput] = useState(
    `LRUCache(2)\nput(1, 1)\nput(2, 2)\nget(1)\nput(3, 3)\nget(2)\nput(4, 4)\nget(1)\nget(3)\nget(4)`
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const parseOperations = (input) => {
    const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);
    let capacity = 0;
    const commands = [];
    const capMatch = lines[0].match(/LRUCache\((\d+)\)/);
    if (capMatch) capacity = parseInt(capMatch[1], 10);

    for (let i = 1; i < lines.length; i++) {
      const putMatch = lines[i].match(/put\((\d+),\s*(\d+)\)/);
      if (putMatch) {
        commands.push({ op: "put", key: parseInt(putMatch[1], 10), value: parseInt(putMatch[2], 10) });
        continue;
      }
      const getMatch = lines[i].match(/get\((\d+)\)/);
      if (getMatch) commands.push({ op: "get", key: parseInt(getMatch[1], 10) });
    }
    return { capacity, commands };
  };

  const generateOptimalHistory = useCallback((capacity, commands) => {
    if (capacity <= 0) return;
    const newHistory = [];
    let cache = new Map();
    let head = { key: -1, val: -1, next: null, prev: null };
    let tail = { key: -1, val: -1, next: null, prev: null };
    head.next = tail;
    tail.prev = head;
    let outputLog = [];

    const getList = () => {
      const list = [];
      let curr = head.next;
      while (curr !== tail) {
        list.push({ key: curr.key, val: curr.val });
        curr = curr.next;
      }
      return list;
    };
    const getMap = () => {
      const mapObject = {};
      for (let [key, node] of cache.entries()) mapObject[key] = node.val;
      return mapObject;
    };
    const addState = (props) => newHistory.push({ cache: getMap(), list: getList(), outputLog: [...outputLog], explanation: "", ...props });

    addState({ commandIndex: -1, explanation: `LRU Cache initialized with capacity ${capacity}.` });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists in hash map.` });

        if (cache.has(key)) {
          const node = cache.get(key);
          const oldVal = node.val;
          addState({ commandIndex, explanation: `Key ${key} found in hash map. Updating its value.` });
          node.val = value;
          addState({ commandIndex, explanation: `Value for key ${key} updated from ${oldVal} to ${value}. Now moving node to front.` });
          
          // Unlink
          node.prev.next = node.next;
          node.next.prev = node.prev;
          addState({ commandIndex, movedKey: key, explanation: `Unlinked node from its current position in the list.` });

          // Move to front
          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({ commandIndex, movedKey: key, explanation: `Moved node to the front of the list to mark it as most recently used.` });

        } else {
          addState({ commandIndex, explanation: `Key ${key} not in hash map. Checking if cache is full.` });
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache is full (size=${capacity}). Eviction is necessary.` });
            const lru = tail.prev;
            addState({ commandIndex, explanation: `Identified least recently used item: key ${lru.key}.` });
            
            // Evict from map
            cache.delete(lru.key);
            addState({ commandIndex, evictedKey: lru.key, explanation: `Removed key ${lru.key} from the hash map.` });
            
            // Evict from list
            lru.prev.next = tail;
            tail.prev = lru.prev;
            addState({ commandIndex, evictedKey: lru.key, explanation: `Removed the LRU node from the end of the linked list.` });
          }
          const newNode = { key, val: value, prev: head, next: head.next };
          addState({ commandIndex, explanation: `Creating new node for key ${key} with value ${value}.` });

          // Add to list
          head.next.prev = newNode;
          head.next = newNode;
          addState({ commandIndex, newKey: key, explanation: `Inserted new node at the front of the linked list.` });
          
          // Add to map
          cache.set(key, newNode);
          addState({ commandIndex, newKey: key, explanation: `Added key ${key} with its node reference to the hash map.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key in hash map.` });
        if (cache.has(key)) {
          const node = cache.get(key);
          outputLog.push(node.val);
          addState({ commandIndex, getResult: node.val, explanation: `Key ${key} found. Returning value ${node.val}. Now moving node to front.` });

          // Unlink
          node.prev.next = node.next;
          node.next.prev = node.prev;
          addState({ commandIndex, movedKey: key, getResult: node.val, explanation: `Unlinked node from its current position in the list.` });
          
          // Move to front
          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({ commandIndex, movedKey: key, getResult: node.val, explanation: `Moved node to the front of the list to mark it as most recently used.` });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found in hash map. Returning -1.` });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateBruteForceHistory = useCallback((capacity, commands) => {
    const newHistory = [];
    let cache = new Map();
    let usage = [];
    let outputLog = [];

    const getList = () => usage.map((key) => ({ key, val: cache.get(key) }));
    const getMap = () => Object.fromEntries(cache.entries());
    const addState = (props) => newHistory.push({ cache: getMap(), list: getList(), outputLog: [...outputLog], explanation: "", ...props });

    addState({ commandIndex: -1, explanation: `Cache initialized with capacity ${capacity} using a vector.` });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists.` });
        if (cache.has(key)) {
          addState({ commandIndex, explanation: `Key ${key} exists. Updating its value in the hash map.` });
          cache.set(key, value);
          addState({ commandIndex, explanation: `Value updated. Now updating recency in the usage vector.` });
          usage = usage.filter((k) => k !== key);
          addState({ commandIndex, movedKey: key, explanation: `Removed key ${key} from its current position in the vector (O(N) search).` });
          usage.unshift(key);
          addState({ commandIndex, movedKey: key, explanation: `Added key ${key} to the front of the vector to mark it as most recent.` });
        } else {
          addState({ commandIndex, explanation: `Key ${key} is new. Checking if cache is full.` });
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache is full. Evicting the LRU item.` });
            const lruKey = usage.pop();
            addState({ commandIndex, evictedKey: lruKey, explanation: `Removed LRU key ${lruKey} from the back of the usage vector.` });
            cache.delete(lruKey);
            addState({ commandIndex, evictedKey: lruKey, explanation: `Removed evicted key ${lruKey} from the hash map.` });
          }
          cache.set(key, value);
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} with value ${value} to the hash map.` });
          usage.unshift(key);
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} to the front of the usage vector.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key.` });
        if (cache.has(key)) {
          const val = cache.get(key);
          outputLog.push(val);
          addState({ commandIndex, getResult: val, explanation: `Key ${key} found, returning ${val}. Now updating recency.` });
          usage = usage.filter((k) => k !== key);
          addState({ commandIndex, getResult: val, movedKey: key, explanation: `Removed key ${key} from the usage vector (O(N) search).` });
          usage.unshift(key);
          addState({ commandIndex, getResult: val, movedKey: key, explanation: `Added key ${key} to the front of the vector.` });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found. Returning -1.` });
        }
      }
    });
    addState({ finished: true, explanation: "All operations completed." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadOps = () => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (capacity <= 0 || commands.length === 0) {
      alert("Please provide a valid capacity and at least one operation.");
      return;
    }
    setIsLoaded(true);
    if (mode === "optimal") generateOptimalHistory(capacity, commands);
    else generateBruteForceHistory(capacity, commands);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const parseInput = useCallback(() => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (capacity <= 0 || commands.length === 0) throw new Error("Invalid operations");
    return { capacity, commands };
  }, [operationsInput]);

  const handleModeChange = useModeHistorySwitch({
    mode, setMode, isLoaded, parseInput,
    generators: {
      "brute-force": ({ capacity, commands }) => generateBruteForceHistory(capacity, commands),
      optimal: ({ capacity, commands }) => generateOptimalHistory(capacity, commands),
    },
    setCurrentStep, onError: () => {},
  });

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

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
  const { cache = {}, list = [], outputLog = [] } = state;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
            LRU Cache Visualizer
          </h1>
          <p className="text-sm text-gray-400">
            Visualizing LeetCode 146: Comparing O(1) and O(N) solutions
          </p>
        </header>

        {/* Top Control Bar */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
          <div className="flex flex-col gap-3">
            {/* Input Section */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Enter Operations (one per line or comma-separated):</label>
              <div className="bg-gray-900 rounded-lg border border-gray-600 focus-within:border-orange-500 transition-colors p-3 max-h-32 overflow-y-auto">
                <input
                  type="text"
                  placeholder="LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)"
                  value={operationsInput.replace(/\n/g, ', ')}
                  onChange={(e) => setOperationsInput(e.target.value.replace(/, /g, '\n').replace(/,/g, '\n'))}
                  disabled={isLoaded}
                  className="w-full bg-transparent font-mono text-xs text-gray-200 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
              {/* Mode Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Mode:</span>
                <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                  <button onClick={() => handleModeChange("brute-force")} className={`px-4 py-1.5 rounded-md font-semibold cursor-pointer transition-all text-xs ${mode === "brute-force" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>
                    Brute Force O(N)
                  </button>
                  <button onClick={() => handleModeChange("optimal")} className={`px-4 py-1.5 rounded-md font-semibold cursor-pointer transition-all text-xs ${mode === "optimal" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>
                    Optimal O(1)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
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
                    <button onClick={reset} className="bg-red-600/80 cursor-pointer hover:bg-red-600 font-bold py-2 px-4 rounded-md shadow-md transition-all text-sm">
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
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
                  {outputLog.length === 0 ? <p className="text-gray-500 text-xs italic">No output yet</p>
                    : outputLog.map((out, i) => (
                      <div key={i} className={`font-mono px-3 py-1 rounded-md font-bold text-md border transition-all ${state.commandIndex === i && state.getResult !== undefined ? "bg-orange-500/30 border-orange-400 scale-110" : out === -1 ? "bg-red-900/30 border-red-600 text-red-300" : "bg-green-900/30 border-green-600 text-green-300"}`}>{out}</div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Hash size={18} className="text-purple-400" />
                <div>
                  <h3 className="font-bold text-md text-purple-300">Hash Map</h3>
                  <p className="text-xs text-gray-500 font-mono">{mode === 'optimal' ? 'Map<Int, Node*>' : 'Map<Int, Int>'}</p>
                </div>
              </div>
              <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[150px]">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(cache).length === 0 ? <p className="text-gray-500 text-xs italic">Cache is empty</p>
                    : Object.entries(cache).map(([key, value]) => (
                      <div key={key} className={`p-2 rounded-lg bg-gray-700/50 border shadow-md transform transition-all flex items-center gap-2 ${state.newKey == key || state.movedKey == key ? "border-orange-400 scale-110" : "border-gray-600"}`}>
                        <div className="w-8 h-8 flex items-center justify-center bg-orange-500 rounded font-mono text-sm font-bold">{key}</div>
                        <ArrowRight size={14} className="text-gray-500" />
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded font-mono text-sm font-bold">{value}</div>
                      </div>
                    ))}
                  {state.evictedKey && (<div className="p-2 rounded-lg bg-red-900/30 border border-red-500 shadow-md"><div className="w-8 h-8 flex items-center justify-center bg-red-800 rounded font-mono text-sm font-bold">{state.evictedKey}</div></div>)}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Link2 size={18} className="text-green-400" />
                <div>
                  <h3 className="font-bold text-md text-green-300">Usage Order</h3>
                  <p className="text-xs text-gray-500">{mode === "optimal" ? "Doubly Linked List: Node {key, val, ...}" : "Vector<Integer>"}</p>
                </div>
              </div>
              <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[150px]">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-green-400">
                  {mode === "optimal" && <span className="bg-green-900/30 px-2 py-1 rounded border border-green-600">HEAD</span>}
                  MOST RECENT →
                </div>
                <div className="flex gap-2 items-center overflow-x-auto pb-2">
                  {list.length === 0 ? <p className="text-gray-500 text-xs italic">No items yet</p>
                    : list.map((node, idx) => (
                      <div key={`${node.key}-${idx}`} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 w-20 p-2 rounded-lg flex flex-col justify-center items-center font-mono border transition-all shadow-md ${state.movedKey == node.key || state.newKey == node.key ? "bg-orange-500/20 border-orange-400 scale-110" : "bg-gray-700/50 border-gray-600"}`}>
                          <span className="text-xs text-gray-400">Key: <span className="font-bold text-lg text-orange-300">{node.key}</span></span>
                          <div className="w-full h-px bg-gray-600 my-1"></div>
                          <span className="text-xs text-gray-400">Val: <span className="font-bold text-md text-blue-300">{node.val}</span></span>
                        </div>
                        {idx < list.length - 1 && <ArrowRight size={14} className="text-gray-600 flex-shrink-0" />}
                      </div>
                   ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs font-bold text-red-400">
                  ← LEAST RECENT
                  {mode === "optimal" && <span className="bg-red-900/30 px-2 py-1 rounded border border-red-600">TAIL</span>}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="font-bold text-md text-purple-300 mb-3 pb-2 border-b border-gray-700 flex items-center gap-3"><Clock size={18} /> Complexity Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {mode === "optimal" ? (<>
                  <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                    <h4 className="font-bold text-green-400 mb-1">Time: <span className="font-mono text-cyan-300">O(1)</span></h4>
                    <p className="text-gray-400 text-xs">Both <code className="text-orange-300">get()</code> and <code className="text-orange-300">put()</code> run in constant time due to hash map lookups and linked list pointer updates.</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                    <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(capacity)</span></h4>
                    <p className="text-gray-400 text-xs">Space is proportional to the cache capacity for storing items in the hash map and linked list.</p>
                  </div>
                </> ) : ( <>
                  <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                    <h4 className="font-bold text-orange-400 mb-1">Time: <span className="font-mono text-red-300">O(N)</span></h4>
                    <p className="text-gray-400 text-xs">Operations take linear time due to searching and moving elements within the usage vector (where N is current cache size).</p>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                    <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(capacity)</span></h4>
                    <p className="text-gray-400 text-xs">Space is proportional to capacity for storing items in the hash map and the usage vector.</p>
                  </div>
                </>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="bg-gray-800 p-8 rounded-lg border border-dashed border-gray-600 max-w-md mx-auto">
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code size={32} className="text-orange-400" /></div>
              <h2 className="text-xl font-bold text-gray-300 mb-2">Ready to Visualize</h2>
              <p className="text-gray-400 text-sm">Enter operations above and click "Visualize" to see how the LRU Cache works.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LRUCacheVisualizer;