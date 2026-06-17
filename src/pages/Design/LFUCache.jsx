import React, { useState, useCallback } from "react";
import {
  Clock,
  Hash,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const LFUCacheVisualizer = () => {
  const [mode, setMode] = useState("optimal");
  const [operationsInput, setOperationsInput] = useState(
    `LFUCache(2), put(1, 1), put(2, 2), get(1), put(3, 3), get(2), get(3), put(4, 4), get(1), get(3), get(4)`
  );
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const parseOperations = (input) => {
    let capacity = 0;
    const commands = [];

    const capMatch = input.match(/LFUCache\((\d+)\)/);
    if (capMatch) {
      capacity = parseInt(capMatch[1], 10);
    }

    const commandRegex = /(put\(\d+,\s*\d+\)|get\(\d+\))/g;
    const matchedCommands = input.match(commandRegex) || [];

    matchedCommands.forEach(part => {
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

  const generateOptimalHistory = useCallback((capacity, commands) => {
    const newHistory = [];
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

    if (capacity <= 0) {
      addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity 0.` });
      commands.forEach((command, commandIndex) => {
        if (command.op === 'get') {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Executing get(${command.key}). Capacity is 0, returning -1.`, line: 13 });
        } else {
          addState({ commandIndex, explanation: `Executing put(${command.key}, ${command.value}). Capacity is 0, operation ignored.`, line: 19 });
        }
      });
      addState({ finished: true, explanation: "All operations completed." });
      load(newHistory);
      return;
    }

    const cache = new Map();
    const freqMap = new Map();
    let minFreq = 0;

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

    addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity ${capacity}.`, line: 7 });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;

        if (cache.has(key)) {
          const node = cache.get(key);
          addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Key exists, updating value to ${value}.`, line: 18 });
          node.value = value;

          const oldFreq = node.freq;
          const oldList = freqMap.get(oldFreq);
          addState({ commandIndex, updatedKey: key, explanation: `Unlinking node from frequency ${oldFreq} list.`, line: 21 });
          unlinkNode(node);

          if (oldList.head.next === oldList.tail && minFreq === oldFreq) {
            minFreq++;
          }

          const newFreq = oldFreq + 1;
          node.freq = newFreq;
          addState({ commandIndex, updatedKey: key, explanation: `Adding node to frequency ${newFreq} list.`, line: 21 });
          addNodeToFreqList(node, newFreq);
          addState({ commandIndex, updatedKey: key, explanation: `Key ${key} frequency updated to ${newFreq}.`, line: 21 });

        } else {
          addState({ commandIndex, explanation: `Executing put(${key}, ${value}). New key.`, line: 18 });
          if (cache.size === capacity) {
            const minFreqList = freqMap.get(minFreq);
            const nodeToEvict = minFreqList.tail.prev;
            addState({ commandIndex, explanation: `Cache is full. Evicting key ${nodeToEvict.key} from frequency ${minFreq}.`, line: 25 });

            unlinkNode(nodeToEvict);
            addState({ commandIndex, evictedKey: nodeToEvict.key, explanation: `Deleting node for key ${nodeToEvict.key} from cache.`, line: 26 });
            cache.delete(nodeToEvict.key);

            if (minFreqList.head.next === minFreqList.tail) {
              freqMap.delete(minFreq);
            }

            addState({ commandIndex, evictedKey: nodeToEvict.key, explanation: `Evicted key ${nodeToEvict.key}.`, line: 28 });
          }

          addState({ commandIndex, newKey: key, explanation: `Creating new node for key ${key}.`, line: 30 });
          const newNode = { key, value, freq: 1, prev: null, next: null };
          cache.set(key, newNode);

          addState({ commandIndex, newKey: key, explanation: `Adding new node to frequency 1 list.`, line: 31 });
          addNodeToFreqList(newNode, 1);

          minFreq = 1;
          addState({ commandIndex, newKey: key, explanation: `Added new key ${key}. Min frequency is now 1.`, line: 33 });
        }
      } else if (command.op === "get") {
        const { key } = command;
        if (cache.has(key)) {
          const node = cache.get(key);
          outputLog.push(node.value);
          addState({ commandIndex, getResult: node.value, explanation: `Executing get(${key}). Found key ${key}, value ${node.value}.`, line: 12 });

          const oldFreq = node.freq;
          const oldList = freqMap.get(oldFreq);
          addState({ commandIndex, getResult: node.value, updatedKey: key, explanation: `Unlinking node from frequency ${oldFreq} list.`, line: 14 });
          unlinkNode(node);

          if (oldList.head.next === oldList.tail && minFreq === oldFreq) {
            minFreq++;
          }

          const newFreq = oldFreq + 1;
          node.freq = newFreq;
          addState({ commandIndex, getResult: node.value, updatedKey: key, explanation: `Adding node to frequency ${newFreq} list.`, line: 14 });
          addNodeToFreqList(node, newFreq);
          addState({ commandIndex, getResult: node.value, updatedKey: key, explanation: `Accessed key ${key}. Frequency updated to ${newFreq}.`, line: 15 });

        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Executing get(${key}). Key not found.`, line: 13 });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    load(newHistory);
  }, [load]);

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

    if (capacity <= 0) {
      addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity 0.` });
      commands.forEach((command, commandIndex) => {
        if (command.op === 'get') {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Executing get(${command.key}). Capacity is 0, returning -1.`, line: 12 });
        } else {
          addState({ commandIndex, explanation: `Executing put(${command.key}, ${command.value}). Capacity is 0, operation ignored.`, line: 19 });
        }
      });
      addState({ finished: true, explanation: "All operations completed." });
      load(newHistory);
      return;
    }

    addState({ commandIndex: -1, explanation: `LFU Cache initialized with capacity ${capacity}.`, line: 9 });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({ commandIndex, explanation: `Executing put(${key}, ${value}). Checking if key exists.`, line: 18 });

        if (cache.has(key)) {
          const data = cache.get(key);
          data.value = value;
          data.freq++;
          data.lastUsed = ++timestamp;
          addState({ commandIndex, updatedKey: key, explanation: `Key exists. Update value to ${value} and increment freq to ${data.freq}.`, line: 21 });
        } else {
          addState({ commandIndex, explanation: `New key. Check if capacity is reached.`, line: 25 });
          if (cache.size >= capacity) {
            let lfuKey = -1;
            for (let [k, node] of cache.entries()) {
              if (lfuKey === -1 || node.freq < cache.get(lfuKey).freq ||
                 (node.freq === cache.get(lfuKey).freq && node.lastUsed < cache.get(lfuKey).lastUsed)) {
                lfuKey = k;
              }
            }
            addState({ commandIndex, explanation: `Evicting LFU key ${lfuKey} with lowest frequency.`, line: 34 });
            cache.delete(lfuKey);
            addState({ commandIndex, evictedKey: lfuKey, explanation: `Evicted key ${lfuKey}.`, line: 34 });
          }
          cache.set(key, { value, freq: 1, lastUsed: ++timestamp });
          addState({ commandIndex, newKey: key, explanation: `Added key ${key} to cache with frequency 1.`, line: 36 });
        }
      } else if (command.op === "get") {
        const { key } = command;
        if (cache.has(key)) {
          const data = cache.get(key);
          data.freq++;
          data.lastUsed = ++timestamp;
          outputLog.push(data.value);
          addState({ commandIndex, getResult: data.value, updatedKey: key, explanation: `Key found. Return value ${data.value} and increment frequency to ${data.freq}.`, line: 15 });
        } else {
          outputLog.push(-1);
          addState({ commandIndex, getResult: -1, explanation: `Key ${key} not found. Return -1.`, line: 12 });
        }
      }
    });

    addState({ finished: true, explanation: "All operations completed." });
    load(newHistory);
  }, [load]);

  const loadOps = () => {
    const { capacity, commands } = parseOperations(operationsInput);
    if (commands.length === 0) {
      alert("Please provide at least one operation.");
      return;
    }
    if (mode === "optimal") {
      generateOptimalHistory(capacity, commands);
    } else {
      generateBruteForceHistory(capacity, commands);
    }
  };

  const optimalCodeContent = {
    1: "class LFUCache {",
    2: "    int cap, minFreq;",
    3: "    unordered_map<int, pair<int, int>> keyValFreq;",
    4: "    unordered_map<int, list<int>> freqKeys;",
    5: "    unordered_map<int, list<int>::iterator> keyIter;",
    6: "public:",
    7: "    LFUCache(int capacity) {",
    8: "        cap = capacity;",
    9: "        minFreq = 0;",
    10: "    }",
    11: "    ",
    12: "    int get(int key) {",
    13: "        if (keyValFreq.find(key) == keyValFreq.end()) return -1;",
    14: "        updateFrequency(key);",
    15: "        return keyValFreq[key].first;",
    16: "    }",
    17: "    ",
    18: "    void put(int key, int value) {",
    19: "        if (cap <= 0) return;",
    20: "        if (get(key) != -1) {",
    21: "            keyValFreq[key].first = value;",
    22: "            return;",
    23: "        }",
    24: "        if (keyValFreq.size() >= cap) {",
    25: "            int evictKey = freqKeys[minFreq].back();",
    26: "            keyValFreq.erase(evictKey);",
    27: "            keyIter.erase(evictKey);",
    28: "            freqKeys[minFreq].pop_back();",
    29: "        }",
    30: "        keyValFreq[key] = {value, 1};",
    31: "        freqKeys[1].push_front(key);",
    32: "        keyIter[key] = freqKeys[1].begin();",
    33: "        minFreq = 1;",
    34: "    }",
    35: "};"
  };

  const bruteForceCodeContent = {
    1: "struct CacheNode {",
    2: "    int value, freq, lastUsed;",
    3: "};",
    4: "",
    5: "class LFUCache {",
    6: "    int cap, time;",
    7: "    unordered_map<int, CacheNode> cache;",
    8: "public:",
    9: "    LFUCache(int capacity) : cap(capacity), time(0) {}",
    10: "    ",
    11: "    int get(int key) {",
    12: "        if (cache.find(key) == cache.end()) return -1;",
    13: "        cache[key].freq++;",
    14: "        cache[key].lastUsed = ++time;",
    15: "        return cache[key].value;",
    16: "    }",
    17: "    ",
    18: "    void put(int key, int value) {",
    19: "        if (cap <= 0) return;",
    20: "        if (cache.find(key) != cache.end()) {",
    21: "            cache[key].value = value;",
    22: "            get(key);",
    23: "            return;",
    24: "        }",
    25: "        if (cache.size() >= cap) {",
    26: "            int lfuKey = -1;",
    27: "            for (auto& [k, node] : cache) {",
    28: "                if (lfuKey == -1 || node.freq < cache[lfuKey].freq || ",
    29: "                   (node.freq == cache[lfuKey].freq && node.lastUsed < cache[lfuKey].lastUsed)) {",
    30: "                    lfuKey = k;",
    31: "                }",
    32: "            }",
    33: "            cache.erase(lfuKey);",
    34: "        }",
    35: "        cache[key] = {value, 1, ++time};",
    36: "    }",
    37: "};"
  };

  const codeContent = mode === "optimal" ? optimalCodeContent : bruteForceCodeContent;

  const inputSection = (
    <>
      <div className="flex flex-col gap-2 flex-grow w-full">
        <label htmlFor="ops-input" className="font-medium text-gray-300 font-mono text-sm">
          LFU Cache Operations:
        </label>
        <textarea
          id="ops-input"
          value={operationsInput}
          onChange={(e) => setOperationsInput(e.target.value)}
          disabled={isLoaded}
          rows={3}
          placeholder="LFUCache(2), put(1, 1), put(2, 2), get(1)"
          className="font-mono bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-purple-550 focus:outline-none w-full text-sm"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={loadOps}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer self-end flex items-center gap-2 text-sm"
        >
          <CheckCircle size={16} /> Visualize
        </button>
      )}
    </>
  );

  const state = currentState || {};
  const {
    cache = {},
    freqGroups = {},
    outputLog = [],
    minFreq = 0,
    explanation = "",
    line = null,
    commandIndex = -1,
    getResult = undefined,
    newKey = null,
    updatedKey = null,
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
                    ? "bg-purple-500/30 border-purple-400 scale-110"
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
              <p className="text-gray-400">O(1) average. Dual hash maps and doubly-linked list structures.</p>
            ) : (
              <p className="text-gray-400">O(N) search. Scanning all elements for frequency eviction.</p>
            )}
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(capacity) space proportional LFU cache limit.</p>
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
      title="LFU Cache Visualizer"
      description="Design and implement a Least Frequently Used (LFU) cache (LeetCode #460)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter operations to begin LFU cache visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="space-y-6 select-none">
        <div className="flex border-b border-gray-800 select-none">
          <button
            onClick={() => handleModeChange("brute-force")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "brute-force"
                ? "border-purple-500 text-purple-300 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-250"
            }`}
          >
            Brute Force O(N)
          </button>
          <button
            onClick={() => handleModeChange("optimal")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "optimal"
                ? "border-purple-500 text-purple-300 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-250"
            }`}
          >
            Optimal O(1)
          </button>
        </div>

        {isLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800 min-h-[150px]">
              <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2 select-none">
                <Hash size={16} className="text-purple-400" />
                Hash Map Storage
              </h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(cache).length === 0 ? (
                  <p className="text-gray-500 text-xs italic">Cache is empty</p>
                ) : (
                  Object.entries(cache).map(([key, data]) => (
                    <div
                      key={key}
                      className={`p-2 rounded-lg bg-gray-950 border shadow-md transform transition-all duration-300 flex flex-col gap-1 ${
                        newKey === key || updatedKey === key
                          ? "border-purple-400 scale-105"
                          : "border-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded font-mono text-sm font-bold">
                          {key}
                        </div>
                        <ArrowRight size={14} className="text-gray-650" />
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded font-mono text-sm font-bold">
                          {data.value}
                        </div>
                      </div>
                      <div className="text-[10px] text-center text-yellow-400 font-bold">
                        freq: {data.freq}
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

            <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800 min-h-[150px]">
              <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2 select-none">
                <BarChart3 size={16} className="text-green-400" />
                Frequency Groups
                {mode === "optimal" && minFreq > 0 && (
                  <span className="text-xs text-yellow-400 font-bold ml-2">(Min Freq: {minFreq})</span>
                )}
              </h4>
              <div className="space-y-3">
                {Object.entries(freqGroups).length === 0 ? (
                  <p className="text-gray-500 text-xs italic">No items grouped yet</p>
                ) : (
                  Object.entries(freqGroups)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([freq, items]) => (
                      <div key={freq} className="border border-gray-800 rounded-lg p-2.5 bg-gray-900/40">
                        <div className="text-[11px] font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
                          <BarChart3 size={12} /> Freq: {freq}{" "}
                          {mode === "optimal" && parseInt(freq) === minFreq && (
                            <span className="text-red-400 text-[10px] ml-1">(MIN - evicts from tail)</span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center overflow-x-auto pb-1">
                          <span className="text-[10px] text-green-400">MRU →</span>
                          {items.map((node, idx) => (
                            <div key={`${node.key}-${idx}`} className="flex items-center gap-1.5">
                              <div
                                className={`p-1.5 rounded-lg flex flex-col justify-center items-center font-mono border transition-all duration-300 ${
                                  updatedKey == node.key || newKey == node.key
                                    ? "bg-purple-500/20 border-purple-400 scale-105"
                                    : "bg-gray-800 border-gray-700"
                                }`}
                              >
                                <span className="text-[10px]">K: <span className="font-bold text-purple-300">{node.key}</span></span>
                                <span className="text-[10px]">V: <span className="font-bold text-blue-300">{node.value}</span></span>
                              </div>
                              {idx < items.length - 1 && (
                                <ArrowRight size={12} className="text-gray-700" />
                              )}
                            </div>
                          ))}
                          <span className="text-[10px] text-red-400">← LRU</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
            <p className="text-gray-400 text-sm">Enter LFU cache operations above and click "Visualize" to begin.</p>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default LFUCacheVisualizer;
