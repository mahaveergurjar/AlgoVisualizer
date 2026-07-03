import React, { useState, useCallback } from "react";
import {
  Clock,
  Hash,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const DesignHashMap = () => {
  const [mode, setMode] = useState("optimal");
  const [operationsInput, setOperationsInput] = useState(
    `HashMap()\nput("apple", 5)\nput("banana", 3)\nget("apple")\nput("cherry", 8)\nremove("banana")\nget("banana")\nget("cherry")`
  );
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

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
    let buckets = Array.from({ length: BUCKETS }, () => []);
    let outputLog = [];

    const hashString = (s) => {
      let h = 5381;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
      }
      return h >>> 0;
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
          const val = buckets[idx][pos].value;
          outputLog.push(val);
          addState({ line: 11, commandIndex, getResult: val, explanation: `Found in bucket ${idx}. Return ${val}.` });
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
    load(newHistory);
  }, [load]);

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
    load(newHistory);
  }, [load]);

  const loadOps = () => {
    const { commands } = parseOperations(operationsInput);
    if (commands.length === 0) {
      alert("Please provide at least one operation.");
      return;
    }
    if (mode === "optimal") {
      generateOptimalHistory(commands);
    } else {
      generateBruteForceHistory(commands);
    }
  };

  const optimalCodeContent = {
    1: "class MyHashMap {",
    2: "    unordered_map<string, int> map;",
    3: "public:",
    4: "    MyHashMap() {}",
    5: "    ",
    6: "    // Returns value or -1 if not exists",
    7: "    int get(string key) {",
    8: "        auto it = map.find(key);",
    9: "        if (it == map.end()) {",
    10: "            return -1;",
    11: "        }",
    12: "        return it->second;",
    13: "    }",
    14: "    ",
    15: "    // Inserts/Updates key-value pair",
    16: "    void put(string key, int value) {",
    17: "        map[key] = value;",
    18: "    }",
    19: "    ",
    20: "    // Removes key if exists",
    21: "    void remove(string key) {",
    22: "        map.erase(key);",
    23: "    }",
    24: "};"
  };

  const bruteForceCodeContent = {
    1: "// Using array of pairs for representation",
    2: "vector<pair<string, int>> entries;",
    3: "",
    4: "int get(string key) {",
    5: "    for (auto& p : entries) {",
    6: "        if (p.first == key) return p.second;",
    7: "    }",
    8: "    return -1;",
    9: "}",
    10: "",
    11: "void put(string key, int value) {",
    12: "    for (auto& p : entries) {",
    13: "        if (p.first == key) { p.second = value; return; }",
    14: "    }",
    15: "    entries.push_back({key, value});",
    16: "}",
    17: "",
    18: "void remove(string key) {",
    19: "    for (auto it = entries.begin(); it != entries.end(); ++it) {",
    20: "        if (it->first == key) { entries.erase(it); return; }",
    21: "    }",
    22: "}"
  };

  const codeContent = mode === "optimal" ? optimalCodeContent : bruteForceCodeContent;

  const inputSection = (
    <>
      <div className="flex flex-col gap-2 flex-grow w-full">
        <label htmlFor="ops-input" className="font-medium text-gray-300 font-mono text-sm">
          HashMap Operations:
        </label>
        <textarea
          id="ops-input"
          value={operationsInput}
          onChange={(e) => setOperationsInput(e.target.value)}
          disabled={isLoaded}
          rows={3}
          className="font-mono bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none w-full text-sm"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={loadOps}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-650 hover:to-red-655 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer self-end flex items-center gap-2 text-sm"
        >
          <CheckCircle size={16} /> Visualize
        </button>
      )}
    </>
  );

  const state = currentState || {};
  const {
    hashMap = {},
    outputLog = [],
    explanation = "",
    line = null,
    commandIndex = -1,
    getResult = undefined,
    newKey = null,
    removedKey = null,
  } = state;

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2 select-none text-xs">
          <Clock size={14} /> Output Log (get results)
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
              <p className="text-gray-400">O(1) average. Custom hash table hashes keys to constant buckets.</p>
            ) : (
              <p className="text-gray-400">O(N) search. Requires linear scan through array of pairs.</p>
            )}
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(N) to store key-value mappings.</p>
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
      title="Design HashMap"
      description="Design a HashMap without using any built-in hash table libraries"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter operations to begin visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="space-y-6">
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
          <div className="bg-gray-950/40 p-6 rounded-xl border border-gray-800 min-h-[200px]">
            <h4 className="text-sm font-semibold text-gray-305 mb-4 flex items-center gap-2 select-none">
              <Hash size={16} className="text-purple-400" />
              Hash Table Contents
            </h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(hashMap).length === 0 ? (
                <p className="text-gray-500 text-xs italic">HashMap is empty</p>
              ) : (
                Object.entries(hashMap).map(([k, v]) => (
                  <div
                    key={k}
                    className={`p-2 rounded-lg bg-gray-950 border shadow-md transform transition-all duration-300 flex items-center gap-2 ${
                      newKey === k ? "border-orange-400 scale-105" : "border-gray-800"
                    }`}
                  >
                    <div className="px-2 h-8 flex items-center justify-center bg-orange-500 text-white rounded font-mono text-xs font-bold max-w-[120px] truncate" title={k}>
                      {k}
                    </div>
                    <ArrowRight size={14} className="text-gray-650" />
                    <div className="w-10 h-8 flex items-center justify-center bg-blue-500 text-white rounded font-mono text-sm font-bold">
                      {v}
                    </div>
                  </div>
                ))
              )}
              {removedKey && (
                <div className="p-2 rounded-lg bg-red-900/30 border border-red-500 shadow-md animate-pulse">
                  <div className="px-2 h-8 flex items-center justify-center bg-red-800 text-white rounded font-mono text-xs font-bold max-w-[120px] truncate" title={removedKey}>
                    {removedKey} (removed)
                  </div>
                </div>
              )}
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

export default DesignHashMap;
