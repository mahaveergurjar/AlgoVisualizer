import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Hash,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Code,
} from "lucide-react";

// Main Visualizer Component
const LFUCacheVisualizer = () => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [operationsInput, setOperationsInput] = useState(
    `LFUCache(2), put(1, 1), put(2, 2), get(1), put(3, 3), get(2), get(3), put(4, 4), get(1), get(3), get(4)`
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // --- START: CORRECTED PARSING LOGIC ---
  const parseOperations = (input) => {
    let capacity = 0;
    const commands = [];

    // First, find and extract the capacity
    const capMatch = input.match(/LFUCache\((\d+)\)/);
    if (capMatch) {
      capacity = parseInt(capMatch[1], 10);
    }

    // Use a robust regex to find all whole commands, preventing splits inside parentheses
    const commandRegex = /(put\(\d+,\s*\d+\)|get\(\d+\))/g;
    const matchedCommands = input.match(commandRegex) || [];

    matchedCommands.forEach(part => {
      // Now, parse each complete, validated command string
      const putMatch = part.match(/put\((\d+),\s*(\d+)\)/);
      if (putMatch) {
        commands.push({ op: "put", key: parseInt(putMatch[1], 10), value: parseInt(putMatch[2], 10) });
      } else {
        const getMatch = part.match(/get\((\d+)\)/);
        if (getMatch) {
          commands.push({ op: "get", key: parseInt(getMatch[1], 10) });
        }
      }
    });

    return { capacity, commands };
  };
  // --- END: CORRECTED PARSING LOGIC ---

  const generateOptimalHistory = useCallback((capacity, commands) => {
    if (capacity <= 0) {
        // Handle capacity 0 case
        const newHistory = [];
        let outputLog = [];
        addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity 0.` });
        commands.forEach((command, commandIndex) => {
            if (command.op === 'get') {
                outputLog.push(-1);
                addState({ commandIndex, getResult: -1, explanation: `Executing get(${command.key}). Capacity is 0, returning -1.` });
            } else {
                 addState({ commandIndex, explanation: `Executing put(${command.key}, ${command.value}). Capacity is 0, operation ignored.` });
            }
        });
        addState({ finished: true, explanation: "All operations completed." });
        setHistory(newHistory);
        setCurrentStep(0);
        return;

        function addState(props) {
            newHistory.push({ cache: {}, freqGroups: {}, minFreq: 0, outputLog: [...outputLog], explanation: "", ...props });
        }
    }

    const newHistory = [];
    const cache = new Map();
    const freqMap = new Map();
    let minFreq = 0;
    let outputLog = [];

    const addState = (props) => {
      const cacheObj = {};
      for (const [key, node] of cache.entries()) {
        cacheObj[key] = { value: node.value, freq: node.freq };
      }
      
      const freqGroups = {};
      for (const [freq, list] of freqMap.entries()) {
        const items = [];
        let curr = list.head.next;
        while (curr !== list.tail) {
          items.push({ 
            key: curr.key, 
            value: curr.value
          });
          curr = curr.next;
        }
        if (items.length > 0) freqGroups[freq] = items;
      }
      
      newHistory.push({ cache: cacheObj, freqGroups, minFreq, outputLog: [...outputLog], explanation: "", ...props });
    };

    const unlinkNode = (node) => {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    };

    const addNodeToFreqList = (node, freq) => {
        if (!freqMap.has(freq)) {
            const head = { key: -1, value: -1, freq: -1, next: null, prev: null };
            const tail = { key: -1, value: -1, freq: -1, next: null, prev: null };
            head.next = tail;
            tail.prev = head;
            freqMap.set(freq, { head, tail });
        }
        const list = freqMap.get(freq);
        node.next = list.head.next;
        node.prev = list.head;
        list.head.next.prev = node;
        list.head.next = node;
    };
    
    addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity ${capacity}.` });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;

        if (cache.has(key)) {
          const node = cache.get(key);
          addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Key exists, updating value to ${value}.` });
          node.value = value;
          
          const oldFreq = node.freq;
          const oldList = freqMap.get(oldFreq);
          addState({ commandIndex, updatedKey: key, explanation: `Unlinking node from frequency ${oldFreq} list.` });
          unlinkNode(node);
          
          if (oldList.head.next === oldList.tail && minFreq === oldFreq) {
            minFreq++;
          }

          const newFreq = oldFreq + 1;
          node.freq = newFreq;
          addState({ commandIndex, updatedKey: key, explanation: `Adding node to frequency ${newFreq} list.` });
          addNodeToFreqList(node, newFreq);
          addState({ commandIndex, updatedKey: key, explanation: `Key ${key} frequency updated to ${newFreq}.` });

        } else {
          addState({ commandIndex, explanation: `Executing put(${key}, ${value}). New key.` });
          if (cache.size === capacity) {
            const minFreqList = freqMap.get(minFreq);
            const nodeToEvict = minFreqList.tail.prev;
            addState({ commandIndex, explanation: `Cache is full. Evicting key ${nodeToEvict.key} from frequency ${minFreq}.` });
            
            unlinkNode(nodeToEvict);
            addState({ commandIndex, evictedKey: nodeToEvict.key, explanation: `Deleting node for key ${nodeToEvict.key} from cache.` });
            cache.delete(nodeToEvict.key);
            
            if (minFreqList.head.next === minFreqList.tail) {
              freqMap.delete(minFreq);
            }

            addState({ commandIndex, evictedKey: nodeToEvict.key, explanation: `Evicted key ${nodeToEvict.key}.` });
          }
          
          addState({ commandIndex, newKey: key, explanation: `Creating new node for key ${key}.` });
          const newNode = { key, value, freq: 1, prev: null, next: null };
          cache.set(key, newNode);
          
          addState({ commandIndex, newKey: key, explanation: `Adding new node to frequency 1 list.` });
          addNodeToFreqList(newNode, 1);
          
          minFreq = 1;
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key}. Min frequency is now 1.` });
        }
      } else if (command.op === "get") {
        const { key } = command;
        if (cache.has(key)) {
          const node = cache.get(key);
          outputLog.push(node.value);
          addState({ commandIndex, getResult: node.value, explanation: `Executing get(${key}). Found key ${key}, value ${node.value}.` });
          
          const oldFreq = node.freq;
          const oldList = freqMap.get(oldFreq);
          addState({ commandIndex, getResult: node.value, updatedKey: key, explanation: `Unlinking node from frequency ${oldFreq} list.` });
          unlinkNode(node);

          if (oldList.head.next === oldList.tail && minFreq === oldFreq) {
            minFreq++;
          }
          
          const newFreq = oldFreq + 1;
          node.freq = newFreq;
          addState({ commandIndex, getResult: node.value, updatedKey: key, explanation: `Adding node to frequency ${newFreq} list.` });
          addNodeToFreqList(node, newFreq);
          addState({ commandIndex, getResult: node.value, updatedKey: key, explanation: `Accessed key ${key}. Frequency updated to ${newFreq}.` });

        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Executing get(${key}). Key not found.` });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateBruteForceHistory = useCallback((capacity, commands) => {
    const newHistory = [];
    
    const cache = new Map();
    let timestamp = 0;
    let outputLog = [];

    const addState = (props) => {
      const cacheObj = {};
      const freqGroups = {};
      
      for (const [key, data] of cache.entries()) {
        cacheObj[key] = { value: data.value, freq: data.freq };
      }
      
      for (const [key, data] of cache.entries()) {
        if (!freqGroups[data.freq]) freqGroups[data.freq] = [];
        freqGroups[data.freq].push({ key, value: data.value });
      }
      
      for (const freq in freqGroups) {
        freqGroups[freq].sort((a, b) => cache.get(b.key).lastUsed - cache.get(a.key).lastUsed);
      }
      
      newHistory.push({ cache: cacheObj, freqGroups, outputLog: [...outputLog], explanation: "", ...props });
    };

    addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity ${capacity}.` });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        if (capacity === 0) {
            addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Capacity is 0, operation ignored.` });
            return;
        }
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists.` });

        if (cache.has(key)) {
          const data = cache.get(key);
          const oldVal = data.value;
          addState({ commandIndex, explanation: `Key ${key} found. Updating value from ${oldVal} to ${value}.` });
          
          data.value = value;
          data.freq++;
          data.lastUsed = timestamp++;
          addState({ commandIndex, updatedKey: key, explanation: `Updated value, incremented frequency to ${data.freq} (O(1)).` });
          
        } else {
          addState({ commandIndex, explanation: `Key ${key} is new. Checking if cache is full.` });
          
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache full. Finding LFU item to evict (O(N) scan).` });
            
            let minFreq = Infinity;
            let evictKey = null;
            let oldestTime = Infinity;
            
            for (const [k, data] of cache.entries()) {
              if (data.freq < minFreq || (data.freq === minFreq && data.lastUsed < oldestTime)) {
                minFreq = data.freq;
                evictKey = k;
                oldestTime = data.lastUsed;
              }
            }
            
            addState({ commandIndex, explanation: `Found LFU item: key ${evictKey} (freq ${minFreq}). Evicting...` });
            cache.delete(evictKey);
            addState({ commandIndex, evictedKey: evictKey, explanation: `Evicted key ${evictKey}.` });
          }
          
          cache.set(key, { value, freq: 1, lastUsed: timestamp++ });
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} with frequency 1.` });
        }
        
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key.` });
        
        if (capacity > 0 && cache.has(key)) {
          const data = cache.get(key);
          outputLog.push(data.value);
          addState({ commandIndex, getResult: data.value, explanation: `Key ${key} found, returning ${data.value}.` });
          
          data.freq++;
          data.lastUsed = timestamp++;
          addState({ commandIndex, getResult: data.value, updatedKey: key, explanation: `Incremented frequency to ${data.freq} (O(1)).` });
          
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found or capacity is 0. Returning -1.` });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadOps = () => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (capacity <= 0 && commands.length > 0 && !operationsInput.startsWith("LFUCache(0)")) {
      alert("Please define cache capacity first, e.g., LFUCache(2).");
      return;
    }
    if ((capacity <= 0 && !operationsInput.startsWith("LFUCache(0)")) || commands.length === 0) {
      if (operationsInput.startsWith("LFUCache(0)")) {
         // Allow capacity 0
      } else {
        alert("Please provide a valid capacity and at least one operation.");
        return;
      }
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

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (isLoaded) {
      const { capacity, commands } = parseOperations(operationsInput);
      if (newMode === "optimal") {
        generateOptimalHistory(capacity, commands);
      } else {
        generateBruteForceHistory(capacity, commands);
      }
    }
  };

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
  const { cache = {}, freqGroups = {}, outputLog = [], minFreq = 0 } = state;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 font-sans">
      <div className="max-w-[1800px] mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-1">
            LFU Cache Visualizer
          </h1>
          <p className="text-sm text-gray-400">
            Visualizing LeetCode 460: Comparing O(1) and O(N) solutions
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {/* Top Section: Controls */}
          <div className="w-full">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Enter Operations (one per line or comma-separated):</label>
                  <input
                    type="text"
                    placeholder="LFUCache(2), put(1, 1), get(1)"
                    value={operationsInput}
                    onChange={(e) => setOperationsInput(e.target.value)}
                    disabled={isLoaded}
                    className="w-full p-2 bg-gray-900 rounded font-mono text-sm border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-300">Mode:</span>
                    <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                      <button onClick={() => handleModeChange("brute-force")} className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all text-xs ${mode === "brute-force" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>Brute Force O(N)</button>
                      <button onClick={() => handleModeChange("optimal")} className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all text-xs ${mode === "optimal" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>Optimal O(1)</button>
                    </div>
                  </div>

                  {!isLoaded ? (
                    <button onClick={loadOps} className="bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-md shadow-md transform hover:scale-105 transition-all flex items-center gap-2 justify-center">
                      <CheckCircle size={16} /> Visualize
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-900/50 p-1.5 rounded-md border border-gray-600">
                        <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-30" title="Previous Step (←)"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                        <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-center">
                          <span className="font-mono text-sm font-bold text-purple-400">{currentStep >= 0 ? currentStep + 1 : 0}</span><span className="text-gray-500 mx-1">/</span><span className="font-mono text-xs text-gray-400">{history.length}</span>
                        </div>
                        <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-30" title="Next Step (→)"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                      </div>
                       <button onClick={reset} className="bg-red-600/80 hover:bg-red-600 cursor-pointer font-bold py-2 px-4 rounded-md shadow-md transition-all text-sm">Reset</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Visualizations */}
          <div className="flex flex-col gap-4">
            {isLoaded ? (
              <>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2"><Clock size={18} className="text-blue-400" /><h3 className="font-bold text-md text-blue-300">Current Step Explanation</h3></div>
                  <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[50px]"><p className="text-sm text-gray-200">{state.explanation}</p></div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2"><CheckCircle size={18} className="text-cyan-400" /><div><h3 className="font-bold text-md text-cyan-300">Output Log</h3><p className="text-xs text-gray-500">Results from get() operations</p></div></div>
                  <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[50px]">
                    <div className="flex flex-wrap gap-2">
                      {outputLog.length === 0 ? <p className="text-gray-500 text-xs italic">No output yet</p>
                        : outputLog.map((out, i) => (<div key={i} className={`font-mono px-3 py-1 rounded-md font-bold text-md border transition-all ${state.commandIndex === i && state.getResult !== undefined ? "bg-purple-500/30 border-purple-400 scale-110" : out === -1 ? "bg-red-900/30 border-red-600 text-red-300" : "bg-green-900/30 border-green-600 text-green-300"}`}>{out}</div>))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-2"><Hash size={18} className="text-purple-400" /><div><h3 className="font-bold text-md text-purple-300">Hash Map</h3><p className="text-xs text-gray-500 font-mono">Map&lt;Int, {mode === 'optimal' ? 'Node*' : '{val, freq}'}&gt;</p></div></div>
                    <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[150px]">
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(cache).length === 0 ? <p className="text-gray-500 text-xs italic">Cache is empty</p>
                          : Object.entries(cache).map(([key, data]) => (<div key={key} className={`p-2 rounded-lg bg-gray-700/50 border shadow-md transform transition-all flex flex-col gap-1 ${state.newKey == key || state.updatedKey == key ? "border-purple-400 scale-110" : "border-gray-600"}`}><div className="flex items-center gap-2"><div className="w-8 h-8 flex items-center justify-center bg-purple-500 rounded font-mono text-sm font-bold">{key}</div><ArrowRight size={14} className="text-gray-500" /><div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded font-mono text-sm font-bold">{data.value}</div></div><div className="text-xs text-center text-yellow-400 font-bold">freq: {data.freq}</div></div>))}
                        {state.evictedKey && (<div className="p-2 rounded-lg bg-red-900/30 border border-red-500 shadow-md"><div className="w-8 h-8 flex items-center justify-center bg-red-800 rounded font-mono text-sm font-bold">{state.evictedKey}</div></div>)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-2"><BarChart3 size={18} className="text-green-400" /><div><h3 className="font-bold text-md text-green-300">Frequency Groups</h3><p className="text-xs text-gray-500">{mode === "optimal" ? "Map<freq, DoublyLinkedList>" : "Sorted by frequency & recency"}</p>{mode === "optimal" && minFreq > 0 && <p className="text-xs text-yellow-400 font-bold mt-1">Min Frequency: {minFreq}</p>}</div></div>
                    <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[150px] max-h-[400px] overflow-y-auto">
                      {Object.keys(freqGroups).length === 0 ? (<p className="text-gray-500 text-xs italic">No items yet</p>) : (<div className="space-y-3">{Object.entries(freqGroups).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([freq, items]) => (<div key={freq} className="border border-gray-700 rounded-lg p-2 bg-gray-800/50"><div className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-2"><BarChart3 size={14} /> Frequency: {freq} {mode === "optimal" && parseInt(freq) === minFreq && (<span className="text-red-400 text-xs">(MIN - evict from here)</span>)}</div>
                      <div className="flex gap-2 items-center overflow-x-auto pb-1 relative">
                        <span className="text-xs text-green-400 flex-shrink-0">MRU →</span>
                        {items.map((node, idx) => (
                          <div key={`${node.key}-${idx}`} className="flex items-center gap-2">
                            <div className={`flex-shrink-0 w-24 p-1.5 rounded-lg flex flex-col justify-center items-center font-mono border transition-all shadow-md ${state.updatedKey == node.key || state.newKey == node.key ? "bg-purple-500/20 border-purple-400 scale-110" : "bg-gray-700/50 border-gray-600"}`}>
                              <span className="text-sm">K: <span className="font-bold text-lg text-purple-300">{node.key}</span></span>
                              <span className="text-xs">V: <span className="font-bold text-md text-blue-300">{node.value}</span></span>
                            </div>
                            {idx < items.length - 1 && <ArrowRight size={12} className="text-gray-600 flex-shrink-0" />}
                          </div>
                        ))}
                        <span className="text-xs text-red-400 flex-shrink-0">← LRU</span>
                      </div>
                    </div>))}
                  </div>)}
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h3 className="font-bold text-md text-purple-300 mb-3 pb-2 border-b border-gray-700 flex items-center gap-3"><Clock size={18} /> Complexity Analysis</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {mode === "optimal" ? (
                        <>
                          <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                            <h4 className="font-bold text-green-400 mb-1">Time: <span className="font-mono text-cyan-300">O(1)</span></h4>
                            <p className="text-gray-400 text-xs">Both <code className="text-purple-300">get()</code> and <code className="text-purple-300">put()</code> are average constant time. Two hash maps and doubly-linked lists allow for direct access and pointer updates.</p>
                          </div>
                          <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                            <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(capacity)</span></h4>
                            <p className="text-gray-400 text-xs">Space is proportional to capacity for storing items in the key cache, frequency map, and linked list nodes.</p>
                          </div>
                        </> 
                      ) : ( 
                        <>
                          <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                            <h4 className="font-bold text-orange-400 mb-1">Time: <span className="font-mono text-red-300">O(N)</span></h4>
                            <p className="text-gray-400 text-xs">Eviction requires an O(N) linear scan through all cache entries to find the least frequently used item (and break ties by recency).</p>
                          </div>
                          <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                            <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(capacity)</span></h4>
                            <p className="text-gray-400 text-xs">Space proportional to capacity for storing items with their frequency and timestamp metadata in the hash map.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="bg-gray-800 p-8 rounded-lg border border-dashed border-gray-600 max-w-md mx-auto">
                  <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code size={32} className="text-purple-400" /></div>
                  <h2 className="text-xl font-bold text-gray-300 mb-2">Ready to Visualize</h2>
                  <p className="text-gray-400 text-sm">Enter operations above and click "Visualize" to see how the LFU Cache works.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LFUCacheVisualizer;

