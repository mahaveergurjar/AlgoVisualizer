import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUp,
  Code,
  Hash,
  Trash2,
  Layers,
  CheckCircle,
  Clock,
} from "lucide-react";

// Pointer Component
const VisualizerPointer = ({ index, containerId, color, label }) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0 });

  useEffect(() => {
    if (index === null || index < 0) {
      setPosition({ opacity: 0 });
      return;
    }
    const container = document.getElementById(containerId);
    const element = document.getElementById(`${containerId}-element-${index}`);
    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset =
        elementRect.left - containerRect.left + elementRect.width / 2 - 12;
      setPosition({ opacity: 1, left: offset });
    } else {
      setPosition({ opacity: 0 });
    }
  }, [index, containerId]);

  return (
    <div
      className="absolute top-full mt-1 text-center transition-all duration-300 ease-out"
      style={position}
    >
      <ArrowUp className={`w-6 h-6 mx-auto text-${color}-400`} />
      <span className={`font-bold text-lg font-mono text-${color}-400`}>
        {label}
      </span>
    </div>
  );
};

// Main Visualizer Component
const RemoveKDigitsVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [numsInput, setNumsInput] = useState("541892");
  const [kInput, setKInput] = useState("2");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateHistory = useCallback((nums, k) => {
    const newHistory = [];
    let stack = [];
    let kVal = k;

    const addState = (props) =>
      newHistory.push({
        stack: [...stack],
        k: kVal,
        i: null,
        digit: null,
        result: "",
        line: null,
        explanation: "",
        ...props,
      });

    addState({ line: 9, explanation: "Initialize an empty stack." });

    for (let i = 0; i < nums.length; i++) {
      const digit = nums[i];
      addState({
        line: 12,
        i,
        explanation: `Start iterating. Current index i = ${i}.`,
      });
      addState({
        line: 15,
        i,
        digit,
        explanation: `Current digit is '${digit}'.`,
      });

      addState({
        line: 19,
        i,
        digit,
        explanation: "Check while loop condition.",
      });
      while (stack.length > 0 && kVal > 0 && stack[stack.length - 1] > digit) {
        const top = stack.pop();
        kVal--;
        addState({
          line: 22,
          i,
          digit,
          explanation: `Stack top '${top}' > current digit '${digit}'. Popping '${top}'.`,
        });
        addState({
          line: 23,
          i,
          digit,
          explanation: `Decrement k. New k = ${kVal}.`,
        });
        addState({
          line: 19,
          i,
          digit,
          explanation: "Re-check while loop condition.",
        });
      }

      stack.push(digit);
      addState({
        line: 27,
        i,
        digit,
        explanation: `Push current digit '${digit}' onto the stack.`,
      });
    }

    addState({
      line: 31,
      explanation: "Main loop finished. Handle remaining k.",
    });
    while (stack.length > 0 && kVal > 0) {
      const top = stack.pop();
      kVal--;
      addState({
        line: 34,
        explanation: `k > 0. Popping trailing digit '${top}'.`,
      });
      addState({ line: 35, explanation: `Decrement k. New k = ${kVal}.` });
      addState({
        line: 31,
        explanation: "Re-check while loop condition for remaining k.",
      });
    }

    if (stack.length === 0) {
      addState({
        line: 39,
        result: "0",
        explanation: "Stack is empty, result is '0'.",
      });
      setHistory(newHistory);
      setCurrentStep(0);
      return;
    }

    let res = "";
    addState({
      line: 42,
      result: res,
      explanation: "Build result string from stack.",
    });
    while (stack.length > 0) {
      const top = stack.pop();
      res += top;
      addState({
        line: 46,
        result: res,
        explanation: `Pop '${top}' and append to temporary string.`,
      });
    }

    addState({
      line: 51,
      result: res,
      explanation: "Reverse the string to correct order.",
    });
    res = res.split("").reverse().join("");

    // The C++ code trims from the back, but since we reversed, it's now leading zeros
    addState({ line: 51, result: res, explanation: "Trim leading zeros." });
    let firstNonZero = 0;
    while (firstNonZero < res.length - 1 && res[firstNonZero] === "0") {
      firstNonZero++;
    }
    res = res.substring(firstNonZero);

    addState({
      line: 58,
      result: res,
      explanation: "Final result processing.",
    });

    if (res.length === 0) {
      addState({
        line: 61,
        result: "0",
        finished: true,
        explanation: "Result is empty, return '0'.",
      });
    } else {
      addState({
        line: 64,
        result: res,
        finished: true,
        explanation: "Return final result.",
      });
    }

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadData = () => {
    const kNum = parseInt(kInput, 10);
    if (isNaN(kNum) || !/^\d+$/.test(numsInput)) {
      alert("Please enter a valid number string and an integer for k.");
      return;
    }
    setIsLoaded(true);
    generateHistory(numsInput, kNum);
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
      if (!isLoaded) return;
      if (e.key === "ArrowLeft") stepBackward();
      if (e.key === "ArrowRight") stepForward();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepBackward, stepForward]);

  const state = history[currentStep] || {};
  const { stack = [], k, i, result, line, explanation } = state;

  const codeLines = [
    {
      num: 6,
      content: [
        { t: "string", c: "pink" },
        { t: " ", c: "" },
        { t: "removeKdigits", c: "blue" },
        { t: "(", c: "gray" },
        { t: "string", c: "pink" },
        { t: " ", c: "" },
        { t: "nums", c: "sky" },
        { t: ",", c: "gray" },
        { t: " ", c: "" },
        { t: "int", c: "pink" },
        { t: " ", c: "" },
        { t: "k", c: "sky" },
        { t: ") {", c: "gray" },
      ],
    },
    {
      num: 8,
      content: [
        { t: "    stack<", c: "teal" },
        { t: "char", c: "teal" },
        { t: ">", c: "teal" },
        { t: " ", c: "" },
        { t: "st", c: "sky" },
        { t: ";", c: "gray" },
      ],
    },
    {
      num: 12,
      content: [
        { t: "    ", c: "" },
        { t: "for", c: "pink" },
        { t: "(", c: "gray" },
        { t: "int", c: "pink" },
        { t: " i=0; i < ", c: "" },
        { t: "nums", c: "sky" },
        { t: ".size(); i++) {", c: "" },
      ],
    },
    {
      num: 15,
      content: [
        { t: "        ", c: "" },
        { t: "char", c: "teal" },
        { t: " ", c: "" },
        { t: "digit", c: "sky" },
        { t: " = ", c: "pink" },
        { t: "nums", c: "sky" },
        { t: "[i];", c: "" },
      ],
    },
    {
      num: 19,
      content: [
        { t: "        ", c: "" },
        { t: "while", c: "pink" },
        { t: "(!", c: "gray" },
        { t: "st", c: "sky" },
        { t: ".empty() && ", c: "gray" },
        { t: "k", c: "sky" },
        { t: " > ", c: "pink" },
        { t: "0", c: "indigo" },
        { t: " && ", c: "gray" },
        { t: "st", c: "sky" },
        { t: ".top() > ", c: "gray" },
        { t: "digit", c: "sky" },
        { t: ") {", c: "gray" },
      ],
    },
    {
      num: 22,
      content: [
        { t: "            ", c: "" },
        { t: "st", c: "sky" },
        { t: ".pop();", c: "gray" },
      ],
    },
    {
      num: 23,
      content: [
        { t: "            ", c: "" },
        { t: "k", c: "sky" },
        { t: "--;", c: "pink" },
      ],
    },
    {
      num: 24,
      content: [
        { t: "        ", c: "" },
        { t: "}", c: "gray" },
      ],
    },
    {
      num: 27,
      content: [
        { t: "        ", c: "" },
        { t: "st", c: "sky" },
        { t: ".push(", c: "gray" },
        { t: "digit", c: "sky" },
        { t: ");", c: "gray" },
      ],
    },
    {
      num: 28,
      content: [
        { t: "    ", c: "" },
        { t: "}", c: "gray" },
      ],
    },
    {
      num: 31,
      content: [
        { t: "    ", c: "" },
        { t: "while", c: "pink" },
        { t: "(!", c: "gray" },
        { t: "st", c: "sky" },
        { t: ".empty() && ", c: "gray" },
        { t: "k", c: "sky" },
        { t: " > 0) {", c: "gray" },
      ],
    },
    {
      num: 34,
      content: [
        { t: "        ", c: "" },
        { t: "st", c: "sky" },
        { t: ".pop();", c: "gray" },
      ],
    },
    {
      num: 35,
      content: [
        { t: "        ", c: "" },
        { t: "k", c: "sky" },
        { t: "--;", c: "pink" },
      ],
    },
    {
      num: 36,
      content: [
        { t: "    ", c: "" },
        { t: "}", c: "gray" },
      ],
    },
    {
      num: 39,
      content: [
        { t: "    ", c: "" },
        { t: "if", c: "pink" },
        { t: "(", c: "gray" },
        { t: "st", c: "sky" },
        { t: ".empty()) ", c: "gray" },
        { t: "return", c: "pink" },
        { t: " ", c: "" },
        { t: '"0"', c: "amber" },
        { t: ";", c: "gray" },
      ],
    },
    {
      num: 42,
      content: [
        { t: "    ", c: "" },
        { t: "string", c: "pink" },
        { t: " res = ", c: "" },
        { t: '""', c: "amber" },
        { t: ";", c: "gray" },
      ],
    },
    {
      num: 45,
      content: [
        { t: "    ", c: "" },
        { t: "while", c: "pink" },
        { t: "(!", c: "gray" },
        { t: "st", c: "sky" },
        { t: ".empty()) {", c: "gray" },
      ],
    },
    {
      num: 46,
      content: [
        { t: "        ", c: "" },
        { t: "res", c: "sky" },
        { t: ".push_back(", c: "gray" },
        { t: "st", c: "sky" },
        { t: ".top());", c: "gray" },
      ],
    },
    {
      num: 47,
      content: [
        { t: "        ", c: "" },
        { t: "st", c: "sky" },
        { t: ".pop();", c: "gray" },
      ],
    },
    {
      num: 48,
      content: [
        { t: "    ", c: "" },
        { t: "}", c: "gray" },
      ],
    },
    {
      num: 51,
      content: [
        { t: "    ", c: "" },
        { t: "while", c: "pink" },
        { t: "(", c: "gray" },
        { t: "res", c: "sky" },
        { t: ".size() > 0 && ", c: "" },
        { t: "res", c: "sky" },
        { t: ".back() == ", c: "" },
        { t: "'0'", c: "amber" },
        { t: ") {", c: "gray" },
      ],
    },
    {
      num: 54,
      content: [
        { t: "        ", c: "" },
        { t: "res", c: "sky" },
        { t: ".pop_back();", c: "gray" },
      ],
    },
    {
      num: 55,
      content: [
        { t: "    ", c: "" },
        { t: "}", c: "gray" },
      ],
    },
    {
      num: 58,
      content: [
        { t: "    ", c: "" },
        { t: "reverse", c: "blue" },
        { t: "(", c: "gray" },
        { t: "res", c: "sky" },
        { t: ".begin(), ", c: "" },
        { t: "res", c: "sky" },
        { t: ".end());", c: "" },
      ],
    },
    {
      num: 61,
      content: [
        { t: "    ", c: "" },
        { t: "if", c: "pink" },
        { t: "(", c: "gray" },
        { t: "res", c: "sky" },
        { t: ".empty()) ", c: "gray" },
        { t: "return", c: "pink" },
        { t: " ", c: "" },
        { t: '"0"', c: "amber" },
        { t: ";", c: "gray" },
      ],
    },
    {
      num: 64,
      content: [
        { t: "    ", c: "" },
        { t: "return", c: "pink" },
        { t: " ", c: "" },
        { t: "res", c: "sky" },
        { t: ";", c: "gray" },
      ],
    },
    { num: 65, content: [{ t: "}", c: "gray" }] },
  ];

  const colorMapping = {
    pink: "text-pink-400",
    blue: "text-blue-400",
    sky: "text-sky-300",
    teal: "text-teal-300",
    amber: "text-amber-400",
    green: "text-green-500",
    indigo: "text-indigo-300",
    gray: "text-gray-500",
    "": "text-gray-300",
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-violet-400">Remove K Digits</h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 402</p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow">
          <label
            htmlFor="nums-input"
            className="font-medium text-gray-300 font-mono"
          >
            Number:
          </label>
          <input
            id="nums-input"
            type="text"
            value={numsInput}
            onChange={(e) => setNumsInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-violet-500"
          />
          <label
            htmlFor="k-input"
            className="font-medium text-gray-300 font-mono"
          >
            k:
          </label>
          <input
            id="k-input"
            type="number"
            value={kInput}
            onChange={(e) => setKInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono bg-gray-900 border border-gray-600 rounded-md p-2 w-20 focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadData}
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="font-mono text-lg w-24 text-center">
                {currentStep + 1}/{history.length}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
          <h3 className="font-bold text-xl text-violet-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
            <Code size={20} />
            C++ Solution
          </h3>
          <pre className="text-sm overflow-auto">
            <code className="font-mono leading-relaxed">
              {codeLines.map(({ num, content }) => (
                <div
                  key={num}
                  className={`block transition-all duration-300 rounded-md ${
                    line === num ? "bg-violet-500/20" : ""
                  }`}
                >
                  <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">
                    {num}
                  </span>
                  {content.map((token, index) => (
                    <span key={index} className={colorMapping[token.c]}>
                      {token.t}
                    </span>
                  ))}
                </div>
              ))}
            </code>
          </pre>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gray-800/50 p-6 mb-12 rounded-xl border border-gray-700/50 shadow-2xl min-h-[180px]">
            <h3 className="font-bold text-lg text-gray-300 mb-4">
              Input Number
            </h3>
            <div
              id="nums-container"
              className="flex justify-center items-center gap-2 flex-wrap"
            >
              {(numsInput || "").split("").map((num, index) => (
                <div
                  key={index}
                  id={`nums-container-element-${index}`}
                  className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg transition-all duration-300 ${
                    i === index
                      ? "bg-violet-500/40 border-violet-400"
                      : "bg-gray-700/50"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
            {isLoaded && (
              <VisualizerPointer
                index={i}
                containerId="nums-container"
                color="amber"
                label="i"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="font-bold text-lg text-violet-300 mb-3 flex items-center gap-2">
                <Layers size={18} />
                Monotonic Stack
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-3 h-48 flex flex-col-reverse items-center gap-2 overflow-y-auto">
                {stack.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 rounded-lg font-mono text-xl shadow-lg"
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h3 className="font-bold text-lg text-violet-300 mb-3 flex items-center gap-2">
                  <Trash2 size={18} />
                  Digits to Remove (k)
                </h3>
                <div className="font-mono text-5xl text-center font-bold text-amber-400">
                  {k ?? kInput}
                </div>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <h3 className="font-bold text-lg text-violet-300 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Result
                </h3>
                <div className="font-mono text-5xl text-center font-bold text-green-400">
                  {result || "..."}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[6rem]">
            <h3 className="font-bold text-sm text-gray-400 mb-2">
              Explanation
            </h3>
            <p
              className="text-gray-300"
              dangerouslySetInnerHTML={{ __html: explanation }}
            />
          </div>
        </div>
      </div>
      <div className="mt-6 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
        <h3 className="font-bold text-xl text-violet-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
          <Clock size={20} /> Complexity Analysis
        </h3>
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-violet-300">
              Time Complexity:{" "}
              <span className="font-mono text-teal-300">O(N)</span>
            </h4>
            <p className="text-gray-400 mt-1">
              Each digit is pushed onto the stack exactly once. In the while
              loop, each digit can be popped at most once. Therefore, every
              digit is processed a constant number of times, leading to a linear
              time complexity.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-violet-300">
              Space Complexity:{" "}
              <span className="font-mono text-teal-300">O(N)</span>
            </h4>
            <p className="text-gray-400 mt-1">
              In the worst-case scenario (a monotonically increasing string like
              "12345"), no digits are popped in the main loop, and all N digits
              are pushed onto the stack. Thus, the space required is
              proportional to the number of digits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveKDigitsVisualizer;
