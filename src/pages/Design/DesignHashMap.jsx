import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  Clock,
  Hash,
  Link2,
  ArrowRight,
  CheckCircle,
  Database,
  Key,
  FileText,
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
    let hashMap = new Map();
    let outputLog = [];

    const getMap = () => {
      const mapObject = {};
      for (let [key, value] of hashMap.entries()) {
        mapObject[key] = value;
      }
      return mapObject;
    };

    const addState = (props) =>
      newHistory.push({
        hashMap: getMap(),
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      line: 5,
      commandIndex: -1,
      explanation: "HashMap initialized.",
    });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({
          line: 17,
          commandIndex,
          explanation: `Executing put("${key}", ${value}).`,
        });

        hashMap.set(key, value);
        addState({
          line: 18,
          commandIndex,
          newKey: key,
          explanation: `Added key "${key}" with value ${value} to the HashMap.`,
        });
      } else if (command.op === "get") {
        const { key } = command;
        addState({
          line: 9,
          commandIndex,
          explanation: `Executing get("${key}").`,
        });

        if (hashMap.has(key)) {
          const value = hashMap.get(key);
          outputLog.push(value);
          addState({
            line: 11,
            commandIndex,
            getResult: value,
            explanation: `Key "${key}" found. FileText is ${value}.`,
          });
        } else {
          outputLog.push(-1);
          addState({
            line: 10,
            commandIndex,
            getResult: -1,
            explanation: `Key "${key}" not found. Returning -1.`,
          });
        }
      } else if (command.op === "remove") {
        const { key } = command;
        addState({
          line: 20,
          commandIndex,
          explanation: `Executing remove("${key}").`,
        });

        if (hashMap.has(key)) {
          hashMap.delete(key);
          addState({
            line: 22,
            commandIndex,
            removedKey: key,
            explanation: `Key "${key}" removed from HashMap.`,
          });
        } else {
          addState({
            line: 21,
            commandIndex,
            explanation: `Key "${key}" not found. Nothing to remove.`,
          });
        }
      }
    });

    addState({ finished: true, explanation: "All operations complete." });
    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateBruteForceHistory = useCallback((commands) => {
    const newHistory = [];
    let hashMap = {};
    let outputLog = [];

    const addState = (props) =>
      newHistory.push({
        hashMap: { ...hashMap },
        outputLog: [...outputLog],
        explanation: "",
        ...props,
      });

    addState({
      commandIndex: -1,
      explanation: "HashMap initialized using object.",
    });

    commands.forEach((command, commandIndex) => {
      if (command.op === "put") {
        const { key, value } = command;
        addState({
          line: 13,
          commandIndex,
          explanation: `Executing put("${key}", ${value}).`,
        });

        hashMap[key] = value;
        addState({
          line: 14,
          commandIndex,
          newKey: key,
          explanation: `Added key "${key}" with value ${value}.`,
        });
      } else if (command.op === "get") {
        const { key } = command;
        addState({
          line: 5,
          commandIndex,
          explanation: `Executing get("${key}").`,
        });

        if (key in hashMap) {
          const value = hashMap[key];
          outputLog.push(value);
          addState({
            line: 7,
            commandIndex,
            getResult: value,
            explanation: `Key "${key}" found. FileText is ${value}.`,
          });
        } else {
          outputLog.push(-1);
          addState({
            line: 6,
            commandIndex,
            getResult: -1,
            explanation: `Key "${key}" not found. Returning -1.`,
          });
        }
      } else if (command.op === "remove") {
        const { key } = command;
        addState({
          line: 16,
          commandIndex,
          explanation: `Executing remove("${key}").`,
        });

        if (key in hashMap) {
          delete hashMap[key];
          addState({
            line: 18,
            commandIndex,
            removedKey: key,
            explanation: `Key "${key}" removed.`,
          });
        } else {
          addState({
            line: 17,
            commandIndex,
            explanation: `Key "${key}" not found. Nothing to remove.`,
          });
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
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-orange-400">
          Design HashMap Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing HashMap Implementation</p>
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
          Object-based O(1)
        </div>
        <div
          onClick={() => handleModeChange("optimal")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "optimal"
              ? "border-orange-400 text-orange-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Map-based O(1)
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
                HashMap
              </h3>
              <div className="flex flex-wrap gap-6 min-h-[8rem]">
                {Object.entries(state.hashMap || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-4 rounded-xl bg-gray-700 border-2 shadow-lg ${
                      state.newKey === key
                        ? "border-orange-400 animate-pulse"
                        : "border-gray-600"
                    }`}
                  >
                    <div className="w-20 h-12 flex items-center justify-center bg-gray-800 rounded-lg font-mono text-orange-300 text-sm font-semibold border border-gray-600 px-2">
                      {key}
                    </div>
                    <ArrowRight size={20} className="text-gray-500" />
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg font-mono text-white text-lg font-bold border border-gray-600">
                      {value}
                    </div>
                  </div>
                ))}
                {state.removedKey && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/50 border-2 border-red-500 shadow-lg">
                    <div className="w-20 h-12 flex items-center justify-center bg-gray-800 rounded-lg font-mono text-red-400 text-sm font-semibold border border-gray-600 px-2">
                      {state.removedKey}
                    </div>
                    <span className="text-red-400 text-sm font-semibold">Removed</span>
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

          <div className="lg:col-span-2 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50 mt-6">
            <h3 className="font-bold text-xl text-orange-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-orange-300">
                  Time Complexity:{" "}
                  <span className="font-mono text-teal-300">O(1)</span> for
                  get, put, and remove
                </h4>
                <p className="text-gray-400 mt-1">
                  All operations (get, put, remove) have an average time
                  complexity of O(1). Hash map operations are designed to be
                  constant time on average.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-300">
                  Space Complexity:{" "}
                  <span className="font-mono text-teal-300">O(n)</span>
                </h4>
                <p className="text-gray-400 mt-1">
                  The space used is proportional to the number of key-value
                  pairs stored in the HashMap.
                </p>
              </div>
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
              put("key", value)
            </code>
            ,<br />
            <code className="bg-gray-900/50 p-1 rounded-md font-mono">
              get("key")
            </code>
            ,<br />
            <code className="bg-gray-900/50 p-1 rounded-md font-mono">
              remove("key")
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default DesignHashMap;
