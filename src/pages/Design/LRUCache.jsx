import React, { useState, useCallback } from "react";
import {
  Clock,
  Hash,
  Link2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const LRUCacheVisualizer = () => {
  const [mode, setMode] = useState("optimal");
  const [operationsInput, setOperationsInput] = useState(
    `LRUCache(2)\nput(1, 1)\nput(2, 2)\nget(1)\nput(3, 3)\nget(2)\nput(4, 4)\nget(1)\nget(3)\nget(4)`
  );
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

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

    addState({ commandIndex: -1, explanation: `LRU Cache initialized with capacity ${capacity}.`, line: 6 });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists in hash map.`, line: 16 });

        if (cache.has(key)) {
          const node = cache.get(key);
          const oldVal = node.val;
          addState({ commandIndex, explanation: `Key ${key} found in hash map. Updating its value.`, line: 18 });
          node.val = value;
          addState({ commandIndex, explanation: `Value for key ${key} updated from ${oldVal} to ${value}. Now moving node to front.`, line: 19 });
          
          node.prev.next = node.next;
          node.next.prev = node.prev;
          addState({ commandIndex, movedKey: key, explanation: `Unlinked node from its current position in the list.`, line: 19 });

          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({ commandIndex, movedKey: key, explanation: `Moved node to the front of the list to mark it as most recently used.`, line: 19 });

        } else {
          addState({ commandIndex, explanation: `Key ${key} not in hash map. Checking if cache is full.`, line: 22 });
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache is full (size=${capacity}). Eviction is necessary.`, line: 22 });
            const lru = tail.prev;
            addState({ commandIndex, explanation: `Identified least recently used item: key ${lru.key}.`, line: 23 });
            
            cache.delete(lru.key);
            addState({ commandIndex, evictedKey: lru.key, explanation: `Removed key ${lru.key} from the hash map.`, line: 25 });
            
            lru.prev.next = tail;
            tail.prev = lru.prev;
            addState({ commandIndex, evictedKey: lru.key, explanation: `Removed the LRU node from the end of the linked list.`, line: 24 });
          }
          const newNode = { key, val: value, prev: head, next: head.next };
          addState({ commandIndex, explanation: `Creating new node for key ${key} with value ${value}.`, line: 27 });

          head.next.prev = newNode;
          head.next = newNode;
          addState({ commandIndex, newKey: key, explanation: `Inserted new node at the front of the linked list.`, line: 27 });
          
          cache.set(key, newNode);
          addState({ commandIndex, newKey: key, explanation: `Added key ${key} with its node reference to the hash map.`, line: 28 });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key in hash map.`, line: 10 });
        if (cache.has(key)) {
          const node = cache.get(key);
          outputLog.push(node.val);
          addState({ commandIndex, getResult: node.val, explanation: `Key ${key} found. Returning value ${node.val}. Now moving node to front.`, line: 13 });

          node.prev.next = node.next;
          node.next.prev = node.prev;
          addState({ commandIndex, movedKey: key, getResult: node.val, explanation: `Unlinked node from its current position in the list.`, line: 12 });
          
          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({ commandIndex, movedKey: key, getResult: node.val, explanation: `Moved node to the front of the list to mark it as most recently used.`, line: 12 });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found in hash map. Returning -1.`, line: 11 });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    load(newHistory);
  }, [load]);

  const generateBruteForceHistory = useCallback((capacity, commands) => {
    if (capacity <= 0) return;
    const newHistory = [];
    let cache = new Map();
    let usage = [];
    let outputLog = [];

    const getList = () => usage.map((key) => ({ key, val: cache.get(key) }));
    const getMap = () => Object.fromEntries(cache.entries());
    const addState = (props) => newHistory.push({ cache: getMap(), list: getList(), outputLog: [...outputLog], explanation: "", ...props });

    addState({ commandIndex: -1, explanation: `Cache initialized with capacity ${capacity} using a vector.`, line: 6 });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists.`, line: 14 });
        if (cache.has(key)) {
          addState({ commandIndex, explanation: `Key ${key} exists. Updating its value in the hash map.`, line: 15 });
          cache.set(key, value);
          addState({ commandIndex, explanation: `Value updated. Now updating recency in the usage vector.`, line: 17 });
          usage = usage.filter((k) => k !== key);
          addState({ commandIndex, movedKey: key, explanation: `Removed key ${key} from its current position in the vector (O(N) search).`, line: 17 });
          usage.unshift(key);
          addState({ commandIndex, movedKey: key, explanation: `Added key ${key} to the front of the vector to mark it as most recent.`, line: 17 });
        } else {
          addState({ commandIndex, explanation: `Key ${key} is new. Checking if cache is full.`, line: 20 });
          if (cache.size === capacity) {
            addState({ commandIndex, explanation: `Cache is full. Evicting the LRU item.`, line: 20 });
            const lruKey = usage.pop();
            addState({ commandIndex, evictedKey: lruKey, explanation: `Removed LRU key ${lruKey} from the back of the usage vector.`, line: 22 });
            cache.delete(lruKey);
            addState({ commandIndex, evictedKey: lruKey, explanation: `Removed evicted key ${lruKey} from the hash map.`, line: 23 });
          }
          cache.set(key, value);
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} with value ${value} to the hash map.`, line: 25 });
          usage.unshift(key);
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key} to the front of the usage vector.`, line: 26 });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}). Checking for key.`, line: 8 });
        if (cache.has(key)) {
          const val = cache.get(key);
          outputLog.push(val);
          addState({ commandIndex, getResult: val, explanation: `Key ${key} found, returning ${val}. Now updating recency.`, line: 11 });
          usage = usage.filter((k) => k !== key);
          addState({ commandIndex, getResult: val, movedKey: key, explanation: `Removed key ${key} from the usage vector (O(N) search).`, line: 10 });
          usage.unshift(key);
          addState({ commandIndex, getResult: val, movedKey: key, explanation: `Added key ${key} to the front of the vector.`, line: 10 });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found. Returning -1.`, line: 9 });
        }
      }
    });
    addState({ finished: true, explanation: "All operations completed." });
    load(newHistory);
  }, [load]);

  const loadOps = () => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (capacity <= 0 || commands.length === 0) {
      alert("Please provide a valid capacity and at least one operation.");
      return;
    }
    if (mode === "optimal") generateOptimalHistory(capacity, commands);
    else generateBruteForceHistory(capacity, commands);
  };

  const optimalCodeContent = {
    1: "class LRUCache {",
    2: "    int cap;",
    3: "    list<pair<int, int>> l;",
    4: "    unordered_map<int, list<pair<int, int>>::iterator> m;",
    5: "public:",
    6: "    LRUCache(int capacity) {",
    7: "        cap = capacity;",
    8: "    }",
    9: "    ",
    10: "    int get(int key) {",
    11: "        if (m.find(key) == m.end()) return -1;",
    12: "        l.splice(l.begin(), l, m[key]);",
    13: "        return m[key]->second;",
    14: "    }",
    15: "    ",
    16: "    void put(int key, int value) {",
    17: "        if (m.find(key) != m.end()) {",
    18: "            m[key]->second = value;",
    19: "            l.splice(l.begin(), l, m[key]);",
    20: "            return;",
    21: "        }",
    22: "        if (l.size() == cap) {",
    23: "            auto d_key = l.back().first;",
    24: "            l.pop_back();",
    25: "            m.erase(d_key);",
    26: "        }",
    27: "        l.push_front({key, value});",
    28: "        m[key] = l.begin();",
    29: "    }",
    30: "};"
  };

  const bruteForceCodeContent = {
    1: "class LRUCache {",
    2: "    int cap;",
    3: "    vector<int> usage;",
    4: "    unordered_map<int, int> cache;",
    5: "public:",
    6: "    LRUCache(int capacity) : cap(capacity) {}",
    7: "    ",
    8: "    int get(int key) {",
    9: "        if (cache.find(key) == cache.end()) return -1;",
    10: "        updateRecency(key);",
    11: "        return cache[key];",
    12: "    }",
    13: "    ",
    14: "    void put(int key, int value) {",
    15: "        if (cache.find(key) != cache.end()) {",
    16: "            cache[key] = value;",
    17: "            updateRecency(key);",
    18: "            return;",
    19: "        }",
    20: "        if (cache.size() == cap) {",
    21: "            int lru = usage.back();",
    22: "            usage.pop_back();",
    23: "            cache.erase(lru);",
    24: "        }",
    25: "        cache[key] = value;",
    26: "        usage.insert(usage.begin(), key);",
    27: "    }",
    28: "};"
  };

  const codeContent = mode === "optimal" ? optimalCodeContent : bruteForceCodeContent;

  const inputSection = (
    <>
      <div className="flex flex-col gap-2 flex-grow w-full">
        <label htmlFor="ops-input" className="font-medium text-gray-300 font-mono text-sm">
          LRU Cache Operations:
        </label>
        <textarea
          id="ops-input"
          value={operationsInput}
          onChange={(e) => setOperationsInput(e.target.value)}
          disabled={isLoaded}
          rows={3}
          placeholder="LRUCache(2)\nput(1, 1)\nput(2, 2)\nget(1)"
          className="font-mono bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none w-full text-sm"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={loadOps}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer self-end flex items-center gap-2 text-sm"
        >
          <CheckCircle size={16} /> Visualize
        </button>
      )}
    </>
  );

  const state = currentState || {};
  const {
    cache = {},
    list = [],
    outputLog = [],
    explanation = "",
    line = null,
    commandIndex = -1,
    getResult = undefined,
    newKey = null,
    movedKey = null,
    evictedKey = null,
  } = state;

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2 select-none text-xs">
          <CheckCircle size={14} /> Output Log (get results)
        </h3>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
          {outputLog.length === 0 ? (
            <span className="text-gray-500 italic text-xs">No output yet</span>
          ) : (
            outputLog.map((out, i) => (
              <div
                key={i}
                className={`font-mono px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                  commandIndex === i && getResult !== undefined
                    ? "bg-orange-500/30 border-orange-400 scale-110"
                    : out === -1
                    ? "bg-red-900/30 border-red-600 text-red-300"
                    : "bg-green-900/30 border-green-600 text-green-300"
                }`}
              >
                {out}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sm:col-span-2 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-xs">
          Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity</span>
            {mode === "optimal" ? (
              <p className="text-gray-400">O(1) average. HashMap and Doubly Linked List updates are constant time.</p>
            ) : (
              <p className="text-gray-400">O(N) search. Usage list shifts elements during get/put.</p>
            )}
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(capacity) space proportional to LRU cache capacity.</p>
          </div>
        </div>
      </div>
    </>
  );

  const handleModeChange = (newMode) => {
    setMode(newMode);
    visualizer.reset();
  };

  return (
    <VisualizerLayout
      title="LRU Cache Visualizer"
      description="Design and implement a Least Recently Used (LRU) cache (LeetCode #146)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter operations to begin LRU cache visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="space-y-6 select-none">
        {/* Mode Tabs */}
        <div className="flex border-b border-gray-800 select-none">
          <button
            onClick={() => handleModeChange("brute-force")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "brute-force"
                ? "border-orange-500 text-orange-355 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-250"
            }`}
          >
            Brute Force O(N)
          </button>
          <button
            onClick={() => handleModeChange("optimal")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "optimal"
                ? "border-orange-500 text-orange-355 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-250"
            }`}
          >
            Optimal O(1)
          </button>
        </div>

        {isLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hash Map View */}
            <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800 min-h-[150px]">
              <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2 select-none">
                <Hash size={16} className="text-purple-400" />
                Hash Map Storage
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(cache).length === 0 ? (
                  <p className="text-gray-500 text-xs italic">Cache is empty</p>
                ) : (
                  Object.entries(cache).map(([key, value]) => (
                    <div
                      key={key}
                      className={`p-2 rounded-lg bg-gray-950 border shadow-md transform transition-all duration-300 flex items-center gap-2 ${
                        newKey == key || movedKey == key ? "border-orange-400 scale-105" : "border-gray-800"
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded font-mono text-sm font-bold">
                        {key}
                      </div>
                      <ArrowRight size={14} className="text-gray-650" />
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded font-mono text-sm font-bold">
                        {value}
                      </div>
                    </div>
                  ))
                )}
                {evictedKey && (
                  <div className="p-2 rounded-lg bg-red-900/30 border border-red-500 shadow-md animate-pulse">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-800 text-white rounded font-mono text-sm font-bold">
                      {evictedKey} (evicted)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Order View */}
            <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800 min-h-[150px]">
              <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2 select-none">
                <Link2 size={16} className="text-green-400" />
                Usage Order
              </h4>
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-green-400 select-none">
                {mode === "optimal" && (
                  <span className="bg-green-900/30 px-2 py-0.5 rounded border border-green-600">HEAD</span>
                )}
                MOST RECENT →
              </div>
              <div className="flex gap-2 items-center overflow-x-auto pb-2">
                {list.length === 0 ? (
                  <p className="text-gray-500 text-xs italic">No items in cache</p>
                ) : (
                  list.map((node, idx) => (
                    <div key={`${node.key}-${idx}`} className="flex items-center gap-2">
                      <div
                        className={`flex-shrink-0 w-20 p-2 rounded-lg flex flex-col justify-center items-center font-mono border transition-all duration-300 shadow-md ${
                          movedKey == node.key || newKey == node.key
                            ? "bg-orange-500/20 border-orange-400 scale-105"
                            : "bg-gray-800 border-gray-700"
                        }`}
                      >
                        <span className="text-[10px] text-gray-400">
                          Key: <span className="font-bold text-sm text-orange-300">{node.key}</span>
                        </span>
                        <div className="w-full h-px bg-gray-700 my-1"></div>
                        <span className="text-[10px] text-gray-400">
                          Val: <span className="font-bold text-sm text-blue-300">{node.val}</span>
                        </span>
                      </div>
                      {idx < list.length - 1 && (
                        <ArrowRight size={14} className="text-gray-700 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs font-bold text-red-400 select-none">
                ← LEAST RECENT
                {mode === "optimal" && (
                  <span className="bg-red-900/30 px-2 py-0.5 rounded border border-red-600">TAIL</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
            <p className="text-gray-400 text-sm">Enter operations above and click "Visualize" to begin.</p>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default LRUCacheVisualizer;