import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  Clock,
  Hash,
  Link2,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Zap,
} from "lucide-react";

// Main Visualizer Component
const LFUCache = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [operationsInput, setOperationsInput] = useState(
    `LFUCache(2)\nput(1, 1)\nput(2, 2)\nget(1)\nput(3, 3)\nget(2)\nput(4, 4)\nget(1)\nget(3)\nget(4)`
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const parseOperations = (input) => {
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    let capacity = 0;
    const commands = [];
    const capMatch = lines[0].match(/LFUCache\((\d+)\)/);
    if (capMatch) capacity = parseInt(capMatch[1], 10);

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

  const generateHistory = useCallback((capacity, commands) => {
    if (capacity <= 0) return;

    let keyNodeMap = new Map();
    let freqListMap = new Map();
    let minFreq = 0;
    let outputLog = [];
    const newHistory = [];

    class ListNode {
      constructor(key, val) {
        this.key = key;
        this.val = val;
        this.freq = 1;
        this.prev = this.next = null;
      }
    }

    class DoublyLinkedList {
      constructor() {
        this.head = new ListNode(-1, -1);
        this.tail = new ListNode(-1, -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
      }
      addNode(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
        this.size++;
      }
      removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        this.size--;
      }
    }

    const getFreqMapState = () => {
      const state = {};
      for (let [freq, list] of freqListMap.entries()) {
        const nodes = [];
        let current = list.head.next;
        while (current !== list.tail) {
          nodes.push({ key: current.key, val: current.val });
          current = current.next;
        }
        state[freq] = nodes;
      }
      return state;
    };

    const addState = (props) =>
      newHistory.push({
        keyNodeMap: Object.fromEntries(
          Array.from(keyNodeMap.keys()).map((k) => [
            k,
            { val: keyNodeMap.get(k).val, freq: keyNodeMap.get(k).freq },
          ])
        ),
        freqListMap: getFreqMapState(),
        minFreq,
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      commandIndex: -1,
      explanation: `Cache initialized with capacity ${capacity}.`,
    });

    const updateNode = (node) => {
      const oldList = freqListMap.get(node.freq);
      oldList.removeNode(node);
      if (node.freq === minFreq && oldList.size === 0) {
        minFreq++;
      }
      node.freq++;
      if (!freqListMap.has(node.freq)) {
        freqListMap.set(node.freq, new DoublyLinkedList());
      }
      const newList = freqListMap.get(node.freq);
      newList.addNode(node);
    };

    commands.forEach((command, commandIndex) => {
      if (command.op === "get") {
        const { key } = command;
        addState({ commandIndex, explanation: `Executing get(${key}).` });
        if (keyNodeMap.has(key)) {
          const node = keyNodeMap.get(key);
          outputLog.push(node.val);
          addState({
            commandIndex,
            getResult: node.val,
            explanation: `Key ${key} found, value is ${node.val}. Updating its frequency.`,
          });
          updateNode(node);
          addState({
            commandIndex,
            getResult: node.val,
            movedKey: key,
            explanation: `Key ${key} moved to freq ${node.freq} list.`,
          });
        } else {
          outputLog.push(-1);
          addState({
            commandIndex,
            getResult: -1,
            explanation: `Key ${key} not found.`,
          });
        }
      } else if (command.op === "put") {
        const { key, value } = command;
        addState({
          commandIndex,
          explanation: `Executing put(${key}, ${value}).`,
        });
        if (keyNodeMap.has(key)) {
          const node = keyNodeMap.get(key);
          node.val = value;
          addState({
            commandIndex,
            explanation: `Key ${key} exists. Updating value to ${value}.`,
          });
          updateNode(node);
          addState({
            commandIndex,
            movedKey: key,
            explanation: `Key ${key} moved to freq ${node.freq} list.`,
          });
        } else {
          if (keyNodeMap.size === capacity) {
            const lfuList = freqListMap.get(minFreq);
            const lruNode = lfuList.tail.prev;
            addState({
              commandIndex,
              evictedKey: lruNode.key,
              explanation: `Cache is full. Evicting LFU key ${lruNode.key} from freq ${minFreq}.`,
            });
            keyNodeMap.delete(lruNode.key);
            lfuList.removeNode(lruNode);
          }
          const newNode = new ListNode(key, value);
          keyNodeMap.set(key, newNode);
          minFreq = 1;
          if (!freqListMap.has(1)) {
            freqListMap.set(1, new DoublyLinkedList());
          }
          freqListMap.get(1).addNode(newNode);
          addState({
            commandIndex,
            newKey: key,
            explanation: `Added new key ${key}. Setting freq to 1 and resetting minFreq to 1.`,
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
    generateHistory(capacity, commands);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };
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
  const { commands } = parseOperations(operationsInput);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-orange-400">
          LFU Cache Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 460</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
          <div className="flex items-center gap-2 w-full">
            <label className="font-mono text-sm whitespace-nowrap">
              Operations:
            </label>
            <textarea
              value={operationsInput}
              onChange={(e) => setOperationsInput(e.target.value)}
              disabled={isLoaded}
              rows="5"
              className="font-mono flex-grow bg-gray-900 p-2 rounded-md border border-gray-600 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadOps}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
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
            className="ml-4 bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Hash size={20} />
                Key-Node Map
              </h3>
              <div className="flex flex-wrap gap-4 min-h-[6rem]">
                {Object.entries(state.keyNodeMap || {}).map(([key, node]) => (
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
                    <div className="flex flex-col text-xs">
                      <span>val: {node.val}</span>
                      <span>freq: {node.freq}</span>
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

          <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Link2 size={20} />
                Frequency Map
              </h3>
              <div className="space-y-4">
                {Object.keys(state.freqListMap || {})
                  .sort((a, b) => a - b)
                  .map((freq) => (
                    <div
                      key={freq}
                      className={`p-2 rounded-lg border-2 ${
                        state.minFreq == freq
                          ? "bg-orange-900/30 border-orange-500"
                          : "bg-gray-900/30 border-gray-700"
                      }`}
                    >
                      <h4 className="font-mono text-sm text-orange-300 mb-2">
                        Freq: {freq}{" "}
                        {state.minFreq == freq && (
                          <span className="text-xs font-bold text-orange-400">
                            (MIN)
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">
                          MRU
                        </span>
                        <ArrowRight size={12} className="text-gray-500" />
                        <div className="flex-grow bg-gray-900/50 p-1 rounded-lg flex gap-2 items-center h-20 overflow-x-auto">
                          {state.freqListMap[freq]?.map((node) => (
                            <div
                              key={node.key}
                              className={`flex-shrink-0 w-16 h-14 p-1 rounded-lg flex flex-col justify-center items-center font-mono border-2 transition-all duration-300 ${
                                state.movedKey == node.key ||
                                state.newKey == node.key
                                  ? "bg-orange-500/30 border-orange-400"
                                  : "bg-gray-700 border-gray-600"
                              }`}
                            >
                              <span className="text-xs text-gray-400">
                                K:{node.key}
                              </span>
                              <span className="font-bold text-md">
                                V:{node.val}
                              </span>
                            </div>
                          ))}
                        </div>
                        <ArrowRight size={12} className="text-gray-500" />
                        <span className="text-xs font-mono text-gray-400">
                          LRU
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50 mt-6">
            <h3 className="font-bold text-xl text-orange-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-orange-300">
                  Time Complexity:{" "}
                  <span className="font-mono text-teal-300">O(1)</span> for get
                  and put
                </h4>
                <p className="text-gray-400 mt-1">
                  Both `get` and `put` operations have an average time
                  complexity of O(1). Accessing elements in both hash maps is
                  O(1). All linked list operations (adding to head, removing
                  from tail, removing an arbitrary node) are O(1) because we
                  have direct access to nodes via the `keyNodeMap`.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-300">
                  Space Complexity:{" "}
                  <span className="font-mono text-teal-300">O(capacity)</span>
                </h4>
                <p className="text-gray-400 mt-1">
                  The space is proportional to the capacity of the cache. We
                  store up to `capacity` key-value pairs in the `keyNodeMap` and
                  the same number of nodes distributed across the linked lists
                  in the `freqListMap`.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LFUCache;
