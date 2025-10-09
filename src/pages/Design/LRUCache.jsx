import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  Clock,
  Hash,
  Link2,
  ArrowRight,
  CheckCircle,
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
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    let capacity = 0;
    const commands = [];

    const capMatch = lines[0].match(/LRUCache\((\d+)\)/);
    if (capMatch) {
      capacity = parseInt(capMatch[1], 10);
    }

    for (let i = 1; i < lines.length; i++) {
      const putMatch = lines[i].match(/put\((\d+),\s*(\d+)\)/);
      if (putMatch) {
        commands.push({
          op: "put",
          key: parseInt(putMatch[1], 10),
          value: parseInt(putMatch[2], 10),
        });
        continue;
      }
      const getMatch = lines[i].match(/get\((\d+)\)/);
      if (getMatch) {
        commands.push({ op: "get", key: parseInt(getMatch[1], 10) });
      }
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
      for (let [key, node] of cache.entries()) {
        mapObject[key] = node.val;
      }
      return mapObject;
    };

    const addState = (props) =>
      newHistory.push({
        cache: getMap(),
        list: getList(),
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      line: 5,
      commandIndex: -1,
      explanation: `LRU Cache initialized with capacity ${capacity}.`,
    });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({
          line: 17,
          commandIndex,
          explanation: `Executing put(${key}, ${value}).`,
        });

        if (cache.has(key)) {
          const node = cache.get(key);
          node.val = value;

          addState({
            line: 19,
            commandIndex,
            explanation: `Key ${key} exists. Update value to ${value}.`,
          });

          node.prev.next = node.next;
          node.next.prev = node.prev;

          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({
            line: 20,
            commandIndex,
            movedKey: key,
            explanation: `Key ${key} moved to front (most recently used).`,
          });
        } else {
          if (cache.size === capacity) {
            const lru = tail.prev;
            addState({
              line: 25,
              commandIndex,
              evictedKey: lru.key,
              explanation: `Cache is full. Evicting least recently used key: ${lru.key}.`,
            });
            cache.delete(lru.key);
            lru.prev.next = tail;
            tail.prev = lru.prev;
          }
          const newNode = { key, val: value, prev: head, next: head.next };
          head.next.prev = newNode;
          head.next = newNode;
          cache.set(key, newNode);

          addState({
            line: 32,
            commandIndex,
            newKey: key,
            explanation: `Added new key ${key} with value ${value} to the front.`,
          });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({
          line: 9,
          commandIndex,
          explanation: `Executing get(${key}).`,
        });

        if (cache.has(key)) {
          const node = cache.get(key);
          outputLog.push(node.val);
          addState({
            line: 13,
            commandIndex,
            getResult: node.val,
            explanation: `Key ${key} found. Value is ${node.val}.`,
          });

          node.prev.next = node.next;
          node.next.prev = node.prev;

          node.next = head.next;
          node.prev = head;
          head.next.prev = node;
          head.next = node;
          addState({
            line: 14,
            commandIndex,
            getResult: node.val,
            movedKey: key,
            explanation: `Moving key ${key} to front as it's now most recently used.`,
          });
        } else {
          outputLog.push(-1);
          addState({
            line: 10,
            commandIndex,
            getResult: -1,
            explanation: `Key ${key} not found. Returning -1.`,
          });
        }
      }
    });

    addState({ finished: true, explanation: "All operations complete." });
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

    const addState = (props) =>
      newHistory.push({
        cache: getMap(),
        list: getList(),
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      commandIndex: -1,
      explanation: `Cache initialized with capacity ${capacity}.`,
    });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({
          line: 13,
          commandIndex,
          explanation: `Executing put(${key}, ${value}).`,
        });
        if (cache.has(key)) {
          addState({
            line: 14,
            commandIndex,
            explanation: `Key ${key} exists.`,
          });
          cache.set(key, value);
          addState({
            line: 15,
            commandIndex,
            explanation: `Value updated to ${value}.`,
          });
          usage = usage.filter((k) => k !== key);
          usage.unshift(key);
          addState({
            line: 16,
            commandIndex,
            movedKey: key,
            explanation: `Key ${key} moved to front.`,
          });
        } else {
          addState({
            line: 17,
            commandIndex,
            explanation: `Key ${key} does not exist.`,
          });
          if (cache.size === capacity) {
            addState({
              line: 18,
              commandIndex,
              explanation: `Cache is full (size=${cache.size}).`,
            });
            const lruKey = usage.pop();
            cache.delete(lruKey);
            addState({
              line: 19,
              commandIndex,
              evictedKey: lruKey,
              explanation: `Evicted LRU key ${lruKey}.`,
            });
          }
          cache.set(key, value);
          addState({
            line: 23,
            commandIndex,
            explanation: `Set data for key ${key}.`,
          });
          usage.unshift(key);
          addState({
            line: 24,
            commandIndex,
            newKey: key,
            explanation: `Added new key ${key} to front.`,
          });
        }
      } else if (command.op === "get") {
        const { key } = command;
        addState({
          line: 5,
          commandIndex,
          explanation: `Executing get(${key}).`,
        });
        if (cache.has(key)) {
          addState({ line: 6, commandIndex, explanation: `Key ${key} found.` });
          outputLog.push(cache.get(key));
          usage = usage.filter((k) => k !== key);
          usage.unshift(key);
          addState({
            line: 8,
            commandIndex,
            getResult: cache.get(key),
            movedKey: key,
            explanation: `Moving key ${key} to front.`,
          });
        } else {
          outputLog.push(-1);
          addState({
            line: 6,
            commandIndex,
            getResult: -1,
            explanation: `Key ${key} not found. Returning -1.`,
          });
        }
      }
    });
    addState({ finished: true, explanation: "All operations complete." });
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
    if (mode === "optimal") {
      generateOptimalHistory(capacity, commands);
    } else {
      generateBruteForceHistory(capacity, commands);
    }
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
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": ({ capacity, commands }) => generateBruteForceHistory(capacity, commands),
      optimal: ({ capacity, commands }) => generateOptimalHistory(capacity, commands),
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
  // Commands parsed on demand; avoid unused destructuring here.

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
        { t: " LRUCache {", c: "" },
      ],
    },
    { l: 5, c: [{ t: "LRUCache(int capacity) { ... }", c: "light-gray" }] },
    {
      l: 8,
      c: [
        { t: "int", c: "cyan" },
        { t: " get(", c: "" },
        { t: "int", c: "cyan" },
        { t: " key) {", c: "" },
      ],
    },
    {
      l: 9,
      c: [
        { t: "  if", c: "purple" },
        { t: " (cache.find(key) == cache.end()) {", c: "" },
      ],
    },
    {
      l: 10,
      c: [
        { t: "    return", c: "purple" },
        { t: " -1;", c: "orange" },
      ],
    },
    { l: 11, c: [{ t: "  }", c: "light-gray" }] },
    { l: 13, c: [{ t: "  // move to front", c: "green" }] },
    {
      l: 14,
      c: [
        { t: "  return", c: "purple" },
        { t: " cache[key]->second;", c: "" },
      ],
    },
    { l: 15, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 17,
      c: [
        { t: "void", c: "purple" },
        { t: " put(", c: "" },
        { t: "int", c: "cyan" },
        { t: " key, ", c: "" },
        { t: "int", c: "cyan" },
        { t: " value) {", c: "" },
      ],
    },
    {
      l: 18,
      c: [
        { t: "  if", c: "purple" },
        { t: " (cache.find(key) != cache.end()) {", c: "" },
      ],
    },
    { l: 19, c: [{ t: "    cache[key]->second = value;", c: "" }] },
    { l: 20, c: [{ t: "    // move to front", c: "green" }] },
    { l: 21, c: [{ t: "    return;", c: "purple" }] },
    { l: 22, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 24,
      c: [
        { t: "  if", c: "purple" },
        { t: " (cache.size() == capacity) {", c: "" },
      ],
    },
    { l: 25, c: [{ t: "    // evict LRU", c: "green" }] },
    { l: 28, c: [{ t: "  }", c: "light-gray" }] },
    { l: 31, c: [{ t: "  // add to front", c: "green" }] },
    { l: 32, c: [{ t: "  cache[key] = ...;", c: "" }] },
    { l: 33, c: [{ t: "}", c: "light-gray" }] },
    { l: 34, c: [{ t: "};", c: "" }] },
  ];

  const bruteForceCode = [
    { l: 1, c: [{ t: "// Using vector for usage order", c: "green" }] },
    { l: 2, c: [{ t: "vector<int> usage;", c: "" }] },
    { l: 3, c: [{ t: "unordered_map<int, int> data;", c: "" }] },
    { l: 5, c: [{ t: "int get(int key) {", c: "" }] },
    {
      l: 6,
      c: [{ t: "  if(data.find(key) == data.end()) return -1;", c: "" }],
    },
    { l: 7, c: [{ t: "  // O(N) find and move", c: "green" }] },
    {
      l: 8,
      c: [
        { t: "  usage.erase(find(usage.begin(), usage.end(), key));", c: "" },
      ],
    },
    { l: 9, c: [{ t: "  usage.insert(usage.begin(), key);", c: "" }] },
    { l: 10, c: [{ t: "  return data[key];", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    { l: 13, c: [{ t: "void put(int key, int value) {", c: "" }] },
    { l: 14, c: [{ t: "  if(data.find(key) != data.end()){", c: "" }] },
    { l: 15, c: [{ t: "    data[key] = value;", c: "" }] },
    { l: 16, c: [{ t: "    // O(N) find and move", c: "green" }] },
    { l: 17, c: [{ t: "  } else {", c: "" }] },
    { l: 18, c: [{ t: "    if(usage.size() == capacity){", c: "" }] },
    { l: 19, c: [{ t: "      int lru = usage.back();", c: "" }] },
    { l: 20, c: [{ t: "      usage.pop_back();", c: "" }] },
    { l: 21, c: [{ t: "      data.erase(lru);", c: "" }] },
    { l: 22, c: [{ t: "    }", c: "light-gray" }] },
    { l: 23, c: [{ t: "    data[key] = value;", c: "" }] },
    { l: 24, c: [{ t: "    usage.insert(usage.begin(), key);", c: "" }] },
    { l: 25, c: [{ t: "  }", c: "light-gray" }] },
    { l: 26, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-orange-400">
          LRU Cache Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 146</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full">
          <textarea
            placeholder="Enter operations here..."
            value={operationsInput}
            onChange={(e) => setOperationsInput(e.target.value)}
            disabled={isLoaded}
            rows="4"
            className="w-full p-2 bg-gray-900 rounded-md font-mono text-sm border border-gray-600"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadOps}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-mono w-24 text-center">
                {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-auto bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex border-b-2 border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("brute-force")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "brute-force"
              ? "border-orange-400 text-orange-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Brute Force O(N)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-orange-400 text-orange-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Optimal O(1)
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
              <h3 className="font-bold text-xl text-orange-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
                <Code size={20} />
                C++ Solution
              </h3>
              <pre className="text-sm overflow-auto">
                <code className="font-mono leading-relaxed">
                  {mode === "optimal"
                    ? optimalCode.map((l) => (
                        <CodeLine key={l.l} line={l.l} content={l.c} />
                      ))
                    : bruteForceCode.map((l) => (
                        <CodeLine key={l.l} line={l.l} content={l.c} />
                      ))}
                </code>
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Hash size={20} />
                Hash Map (Cache)
              </h3>
              <div className="flex flex-wrap gap-4 min-h-[6rem]">
                {Object.entries(state.cache || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg bg-gray-700 border-2 ${
                      state.newKey == key || state.movedKey == key
                        ? "border-orange-400 animate-pulse"
                        : "border-gray-600"
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md font-mono text-orange-300">
                      {key}
                    </div>
                    <ArrowRight size={16} className="text-gray-500" />
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md font-mono text-white">
                      {value}
                    </div>
                  </div>
                ))}
                {state.evictedKey && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-900/50 border-2 border-red-500">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md font-mono text-red-400">
                      {state.evictedKey}
                    </div>
                    <span className="text-red-400 text-sm">Evicted</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Link2 size={20} />
                Usage Order (Doubly Linked List / Vector)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-400">MRU</span>
                <ArrowRight size={16} className="text-gray-500" />
                <div className="flex-grow bg-gray-900/50 p-2 rounded-lg flex gap-2 items-center h-24 overflow-x-auto">
                  {state.list?.map((node) => (
                    <div
                      key={node.key}
                      className={`flex-shrink-0 w-20 h-16 p-2 rounded-lg flex flex-col justify-center items-center font-mono border-2 transition-all duration-300 ${
                        state.movedKey == node.key || state.newKey == node.key
                          ? "bg-orange-500/30 border-orange-400"
                          : "bg-gray-700 border-gray-600"
                      }`}
                    >
                      <span className="text-xs text-gray-400">
                        K:{node.key}
                      </span>
                      <span className="font-bold text-lg">V:{node.val}</span>
                    </div>
                  ))}
                </div>
                <ArrowRight size={16} className="text-gray-500" />
                <span className="text-sm font-mono text-gray-400">LRU</span>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Output</h3>
              <div className="flex flex-wrap gap-2">
                {state.outputLog?.map((out, i) => (
                  <div
                    key={i}
                    className={`font-mono px-3 py-1 rounded-md ${
                      state.commandIndex === i && state.getResult !== undefined
                        ? "bg-orange-500/30"
                        : "bg-gray-700"
                    }`}
                  >
                    {out}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
            </div>
          </div>
          <div className="lg:col-span-2 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50 mt-6">
            <h3 className="font-bold text-xl text-orange-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            <div className="space-y-4 text-sm">
              {mode === "optimal" ? (
                <>
                  <div>
                    <h4 className="font-semibold text-orange-300">
                      Time Complexity:{" "}
                      <span className="font-mono text-teal-300">O(1)</span> for
                      get and put
                    </h4>
                    <p className="text-gray-400 mt-1">
                      Both `get` and `put` operations have an average time
                      complexity of O(1). Accessing an element in the hash map
                      is O(1). Moving a node in the doubly linked list (removing
                      and adding to the front) involves updating a few pointers,
                      which is also a constant time operation.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-300">
                      Space Complexity:{" "}
                      <span className="font-mono text-teal-300">
                        O(capacity)
                      </span>
                    </h4>
                    <p className="text-gray-400 mt-1">
                      The space used is proportional to the capacity of the
                      cache, as we store up to `capacity` key-value pairs in the
                      hash map and the same number of nodes in the doubly linked
                      list.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="font-semibold text-orange-300">
                      Time Complexity:{" "}
                      <span className="font-mono text-teal-300">O(N)</span> for
                      get and put
                    </h4>
                    <p className="text-gray-400 mt-1">
                      For both `get` and `put`, finding and moving an element in
                      the usage vector can take O(N) time in the worst case,
                      where N is the current size of the cache.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-300">
                      Space Complexity:{" "}
                      <span className="font-mono text-teal-300">
                        O(capacity)
                      </span>
                    </h4>
                    <p className="text-gray-400 mt-1">
                      The space is proportional to the capacity, used by both
                      the hash map and the usage vector.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg">
            Enter operations and click "Load & Visualize" to start.
          </p>
          <p className="text-sm mt-2">
            Use the format:
            <br />
            <code className="bg-gray-900/50 p-1 rounded-md font-mono">
              LRUCache(capacity)
            </code>
            ,<br />
            <code className="bg-gray-900/50 p-1 rounded-md font-mono">
              put(key, value)
            </code>
            ,<br />
            <code className="bg-gray-900/50 p-1 rounded-md font-mono">
              get(key)
            </code>
          </p>
        </div>
      )}
    </div>
  );
};
export default LRUCacheVisualizer;
