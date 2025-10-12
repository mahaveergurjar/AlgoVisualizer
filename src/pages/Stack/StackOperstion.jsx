import React, { useState } from "react";
import {
  Code,
  CheckCircle,
  LogIn,
  LogOut,
  Eye,
  RefreshCw,
  Layers,
  XCircle,
} from "lucide-react";

// ====================================================================================
// SHARED HELPER COMPONENTS
// ====================================================================================

const CodeLine = ({ line, content, activeLine }) => {
  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "": "text-gray-200",
  };
  return (
    <div
      className={`block rounded-md transition-colors px-2 py-1 ${
        activeLine === line ? "bg-sky-500/20 border-l-4 border-sky-400" : ""
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
};
stackoperation.jsx;

// ====================================================================================
// MAIN VISUALIZER COMPONENT
// ====================================================================================
const StackOperations = ({ navigate }) => {
  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [lastOperation, setLastOperation] = useState(null);
  const [peekedValue, setPeekedValue] = useState(null);
  const [poppedValue, setPoppedValue] = useState(null);
  const [error, setError] = useState(null);

  const handlePush = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      setError("Please enter a valid number.");
      return;
    }
    if (stack.length >= 8) {
      setError("Stack is full! (Max 8 elements)");
      return;
    }
    setStack([...stack, num]);
    setLastOperation({ op: "push", value: num });
    setPeekedValue(null);
    setPoppedValue(null);
    setError(null);
    setInputValue("");
  };

  const handlePop = () => {
    if (stack.length === 0) {
      setError("Stack is empty. Cannot pop.");
      return;
    }
    const popped = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    setLastOperation({ op: "pop" });
    setPoppedValue(popped);
    setPeekedValue(null);
    setError(null);
  };

  const handlePeek = () => {
    if (stack.length === 0) {
      setError("Stack is empty. Cannot peek.");
      return;
    }
    const top = stack[stack.length - 1];
    setLastOperation({ op: "peek" });
    setPeekedValue(top);
    setPoppedValue(null);
    setError(null);
  };

  const handleReset = () => {
    setStack([]);
    setInputValue("");
    setLastOperation(null);
    setPeekedValue(null);
    setPoppedValue(null);
    setError(null);
  };

  const getCodeLine = () => {
    if (!lastOperation) return 0;
    switch (lastOperation.op) {
      case "push":
        return 2;
      case "pop":
        return 3;
      case "peek":
        return 4;
      default:
        return 0;
    }
  };

  const code = [
    {
      l: 1,
      c: [
        { t: "class", c: "purple" },
        { t: " Stack {", c: "" },
      ],
    },
    { l: 2, c: [{ t: "  push(element)", c: "" }] },
    { l: 3, c: [{ t: "  pop()", c: "" }] },
    { l: 4, c: [{ t: "  peek()", c: "" }] },
    { l: 5, c: [{ t: "  isEmpty()", c: "" }] },
    { l: 6, c: [{ t: "}", c: "" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Stack Operations
        </h1>
        <p className="text-xl text-gray-400 mt-3">
          Visualizing a LIFO Data Structure
        </p>
      </header>
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePush()}
              className="font-mono w-28 bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="e.g., 42"
            />
            <button
              onClick={handlePush}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <LogIn size={18} /> Push
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePop}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <LogOut size={18} /> Pop
            </button>
            <button
              onClick={handlePeek}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <Eye size={18} /> Peek
            </button>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            <RefreshCw size={18} /> Reset
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-green-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
              <Code size={22} /> Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {code.map((line) => (
                  <CodeLine
                    key={line.l}
                    line={line.l}
                    content={line.c}
                    activeLine={getCodeLine()}
                  />
                ))}
              </code>
            </pre>
          </div>
          <div
            className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${
              error
                ? "bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-500"
                : lastOperation?.op === "push"
                ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500"
                : "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700"
            }`}
          >
            <h3
              className={`text-sm font-semibold flex items-center gap-2 mb-2 ${
                error
                  ? "text-red-300"
                  : lastOperation?.op === "push"
                  ? "text-green-300"
                  : "text-gray-400"
              }`}
            >
              <CheckCircle size={18} /> Operation Result
            </h3>
            <p
              className={`font-mono text-2xl font-bold ${
                error
                  ? "text-red-400"
                  : lastOperation?.op === "push"
                  ? "text-green-400"
                  : "text-gray-400"
              }`}
            >
              {error ? (
                <span className="flex items-center gap-2">
                  <XCircle size={24} /> {error}
                </span>
              ) : !lastOperation ? (
                "No operation yet"
              ) : lastOperation.op === "push" ? (
                `Pushed ${lastOperation.value}`
              ) : lastOperation.op === "pop" ? (
                `Popped ${poppedValue}`
              ) : lastOperation.op === "peek" ? (
                `Peeked ${peekedValue}`
              ) : (
                "Ready"
              )}
            </p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px] flex flex-col justify-end">
            <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2 self-start">
              <Layers size={22} /> Stack Visualization
            </h3>
            <div className="flex flex-col-reverse items-center gap-2 w-full h-full">
              {stack.map((val, i) => (
                <div
                  key={i}
                  className={`w-3/4 max-w-sm flex items-center justify-center h-16 rounded-lg text-2xl font-bold shadow-lg border-2 transition-all duration-300 animate-fade-in-up ${
                    i === stack.length - 1
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400"
                      : "bg-gradient-to-br from-sky-500 to-blue-600 border-sky-400"
                  }`}
                >
                  {val}
                </div>
              ))}
              {stack.length === 0 && (
                <div className="flex-grow flex items-center justify-center">
                  <span className="text-gray-500 italic">Stack is empty</span>
                </div>
              )}
            </div>
            <div className="text-center text-gray-400 font-semibold mt-2 border-t-4 border-gray-600 pt-2 w-3/4 max-w-sm mx-auto">
              Base
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Top Element
              </h3>
              <p className="font-mono text-3xl font-bold text-sky-400">
                {stack.length > 0 ? stack[stack.length - 1] : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Is Empty?
              </h3>
              <p
                className={`font-mono text-3xl font-bold ${
                  stack.length === 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {stack.length === 0 ? "true" : "false"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackOperations;
