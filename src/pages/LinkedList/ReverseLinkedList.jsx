import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  ArrowUp,
  Code,
  CheckCircle,
  Clock,
  GitBranch,
  Repeat,
  Layers,
} from "lucide-react";

// Pointer Component
const VisualizerPointer = ({
  nodeId,
  containerId,
  color,
  label,
  yOffset = 0,
}) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0, top: 0 });

  useEffect(() => {
    if (nodeId === null || nodeId === undefined) {
      setPosition((p) => ({ ...p, opacity: 0 }));
      return;
    }
    const container = document.getElementById(containerId);
    const element = document.getElementById(`node-${nodeId}`);
    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const left =
        elementRect.left - containerRect.left + elementRect.width / 2 - 20;
      const top = elementRect.top - containerRect.top - 40 + yOffset;
      setPosition({ opacity: 1, left, top });
    } else {
      setPosition((p) => ({ ...p, opacity: 0 }));
    }
  }, [nodeId, containerId, yOffset]);

  const colorClasses = {
    amber: "text-amber-400",
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };

  return (
    <div
      className="absolute text-center transition-all duration-300 ease-out pointer-events-none"
      style={position}
    >
      <div
        className={`font-bold text-lg font-mono ${colorClasses[color]} flex items-center gap-1`}
      >
        <span>{label}</span>
      </div>
      <ArrowUp className={`w-6 h-6 mx-auto ${colorClasses[color]}`} />
    </div>
  );
};

// Main Visualizer Component
const ReverseLinkedList = () => {
  const [mode, setMode] = useState("iterative");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [listInput, setListInput] = useState("1,2,3,4,5");
  const [isLoaded, setIsLoaded] = useState(false);

  const buildAndGenerateHistory = () => {
    const data = listInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (data.some(isNaN) || data.length === 0) {
      alert("Invalid list input. Please use comma-separated numbers.");
      return;
    }

    if (mode === "iterative") {
      generateIterativeHistory(data);
    } else {
      generateRecursiveHistory(data);
    }
    setIsLoaded(true);
  };

  const parseInput = useCallback(() => {
    const data = listInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (data.some(isNaN) || data.length === 0) throw new Error("Invalid list input");
    return data;
  }, [listInput]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      iterative: (d) => generateIterativeHistory(d),
      recursive: (d) => generateRecursiveHistory(d),
    },
    setCurrentStep,
    onError: (m) => console.warn(m),
  });

  const generateIterativeHistory = useCallback((data) => {
    const newHistory = [];
    let nodes = data.map((d, i) => ({
      id: i,
      data: d,
      next: i + 1,
      x: 80 + i * 140,
      y: 150,
    }));
    if (nodes.length > 0) nodes[nodes.length - 1].next = null;

    let prev = null;
    let curr = 0;

    const addState = (props) => {
      const edges = [];
      nodes.forEach((node) => {
        if (node.next !== null) edges.push({ from: node.id, to: node.next });
      });
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges,
        prev,
        curr,
        explanation: "",
        ...props,
      });
    };

    addState({
      line: 4,
      explanation: "Initialize `prev` to null and `curr` to head (node 0).",
    });

    while (curr !== null) {
      addState({
        line: 5,
        curr,
        prev,
        explanation: `Start of loop. Current node is ${curr}.`,
      });

      const currentNode = nodes.find((n) => n.id === curr);
      let nextTemp = currentNode.next;
      addState({
        line: 6,
        curr,
        prev,
        nextTemp,
        explanation: `Store next node (${nextTemp}) in a temporary variable.`,
      });

      currentNode.next = prev;
      addState({
        line: 7,
        curr,
        prev,
        nextTemp,
        explanation: `Reverse current node's pointer to point to previous node (${
          prev === null ? "null" : prev
        }).`,
      });

      prev = curr;
      addState({
        line: 9,
        curr,
        prev,
        nextTemp,
        explanation: `Move 'prev' pointer forward to current node (${curr}).`,
      });

      curr = nextTemp;
      addState({
        line: 10,
        curr,
        prev,
        nextTemp,
        explanation: `Move 'curr' pointer forward to the stored next node (${
          nextTemp === null ? "null" : nextTemp
        }).`,
      });
    }
    addState({
      line: 5,
      finished: true,
      prev,
      explanation: "Current node is null, loop terminates.",
    });
    addState({
      line: 12,
      finished: true,
      prev,
      explanation: `Return the new head of the list, which is 'prev' (${prev}).`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const generateRecursiveHistory = useCallback((data) => {
    const newHistory = [];
    let nodes = data.map((d, i) => ({
      id: i,
      data: d,
      next: i + 1,
      x: 80 + i * 140,
      y: 150,
    }));
    if (nodes.length > 0) nodes[nodes.length - 1].next = null;

    const addState = (props) => {
      const edges = [];
      nodes.forEach((node) => {
        if (node.next !== null) edges.push({ from: node.id, to: node.next });
      });
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges,
        explanation: "",
        callStack: [],
        ...props,
      });
    };

    function reverse(head, callStack) {
      addState({
        callStack,
        line: 4,
        head,
        explanation: `Calling reverse for node ${head}.`,
      });
      if (head === null || nodes.find((n) => n.id === head)?.next === null) {
        addState({
          callStack,
          line: 5,
          head,
          explanation: `Base case: head is null or it's the last node. Returning node ${head}.`,
        });
        return head;
      }

      let nextNodeId = nodes.find((n) => n.id === head).next;
      let newHead = reverse(nextNodeId, [
        ...callStack,
        { id: head, next: nextNodeId },
      ]);

      let nextNode = nodes.find((n) => n.id === nextNodeId);
      nextNode.next = head;
      addState({
        callStack,
        line: 7,
        head,
        newHead,
        explanation: `Unwinding: Node ${nextNode.id}'s next now points to ${head}.`,
      });

      let headNode = nodes.find((n) => n.id === head);
      headNode.next = null;
      addState({
        callStack,
        line: 8,
        head,
        newHead,
        explanation: `Unwinding: Node ${head}'s next points to null.`,
      });

      addState({
        callStack,
        line: 10,
        head,
        newHead,
        explanation: `Returning new head ${newHead} up the call stack.`,
      });
      return newHead;
    }

    addState({ explanation: "Starting recursive reversal." });
    reverse(0, []);
    addState({ finished: true, explanation: "Reversal complete." });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

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
        state.line === line ? "bg-sky-500/20 border-l-4 border-sky-400" : ""
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

  const iterativeCode = [
    { l: 4, c: [{ t: "ListNode *prev = NULL, *curr = head;", c: "" }] },
    { l: 5, c: [{ t: "while(curr != NULL) {", c: "purple" }] },
    { l: 6, c: [{ t: "  ListNode* nextTemp = curr->next;", c: "" }] },
    { l: 7, c: [{ t: "  curr->next = prev;", c: "" }] },
    { l: 9, c: [{ t: "  prev = curr;", c: "" }] },
    { l: 10, c: [{ t: "  curr = nextTemp;", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    { l: 12, c: [{ t: "return prev;", c: "purple" }] },
  ];

  const recursiveCode = [
    { l: 4, c: [{ t: "if (head == NULL || head->next == NULL)", c: "" }] },
    { l: 5, c: [{ t: "  return head;", c: "purple" }] },
    { l: 7, c: [{ t: "ListNode* newHead = reverseList(head->next);", c: "" }] },
    { l: 8, c: [{ t: "head->next->next = head;", c: "" }] },
    { l: 9, c: [{ t: "head->next = NULL;", c: "" }] },
    { l: 10, c: [{ t: "return newHead;", c: "purple" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-sky-400">Reverse Linked List</h1>
        <p className="text-lg text-gray-400 mt-2">Visualizing LeetCode 206</p>
      </header>
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full">
          <label className="font-mono text-sm whitespace-nowrap">
            List Values:
          </label>
          <input
            type="text"
            value={listInput}
            onChange={(e) => setListInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 p-2 rounded-md border border-gray-600"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={buildAndGenerateHistory}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg"
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
      <div className="flex border-b-2 border-gray-700 mb-6">
        <div
          onClick={() => handleModeChange("iterative")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "iterative"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Iterative
        </div>
        <div
          onClick={() => handleModeChange("recursive")}
          className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${
            mode === "recursive"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-gray-400"
          }`}
        >
          Recursive
        </div>
      </div>
      {isLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-sky-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              C++ Solution
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {mode === "iterative"
                  ? iterativeCode.map((l) => (
                      <CodeLine key={l.l} line={l.l} content={l.c} />
                    ))
                  : recursiveCode.map((l) => (
                      <CodeLine key={l.l} line={l.l} content={l.c} />
                    ))}
              </code>
            </pre>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl min-h-[300px] overflow-x-auto">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <GitBranch size={20} />
                Linked List
              </h3>
              <div
                className="relative"
                style={{
                  height: "280px",
                  width: `${state.nodes.length * 140 + 100}px`,
                }}
              >
                <svg className="w-full h-full absolute top-0 left-0">
                  {state.edges?.map((edge, i) => {
                    const fromNode = state.nodes.find(
                      (n) => n.id === edge.from
                    );
                    const toNode = state.nodes.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    const isReversed = toNode.id < fromNode.id;
                    return (
                      <line
                        key={i}
                        x1={isReversed ? fromNode.x : fromNode.x + 100}
                        y1={fromNode.y}
                        x2={isReversed ? toNode.x + 100 : toNode.x}
                        y2={toNode.y}
                        stroke="url(#arrow-gradient)"
                        strokeWidth="3"
                        markerEnd="url(#arrow)"
                      />
                    );
                  })}
                  <defs>
                    <linearGradient
                      id="arrow-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                    </marker>
                  </defs>
                </svg>
                <div
                  id="linked-list-container"
                  className="absolute top-0 left-0 w-full h-full"
                >
                  {state.nodes?.map((node) => (
                    <div
                      key={node.id}
                      id={`node-${node.id}`}
                      className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl font-bold transition-all duration-300 shadow-xl border-2 ${
                        state.curr === node.id
                          ? "bg-sky-500/80 border-sky-300 scale-110"
                          : "bg-gray-700/80 border-gray-500"
                      }`}
                      style={{ left: `${node.x}px`, top: `${node.y - 28}px` }}
                    >
                      {node.data}
                    </div>
                  ))}
                  {mode === "iterative" && (
                    <VisualizerPointer
                      nodeId={state.prev}
                      containerId="linked-list-container"
                      color="green"
                      label="prev"
                      yOffset={-15}
                    />
                  )}
                  {mode === "iterative" && (
                    <VisualizerPointer
                      nodeId={state.curr}
                      containerId="linked-list-container"
                      color="amber"
                      label="curr"
                      yOffset={0}
                    />
                  )}
                  {mode === "iterative" && (
                    <VisualizerPointer
                      nodeId={state.nextTemp}
                      containerId="linked-list-container"
                      color="red"
                      label="next"
                      yOffset={15}
                    />
                  )}
                </div>
              </div>
            </div>
            {mode === "recursive" && (
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <h3 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <Layers size={16} />
                  Call Stack
                </h3>
                <div className="flex flex-col-reverse gap-2">
                  {state.callStack?.map((call, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md border text-xs transition-all ${
                        index === state.callStack.length - 1
                          ? "bg-sky-500/20 border-sky-400"
                          : "bg-gray-700/50 border-gray-600"
                      }`}
                    >
                      <p className="font-bold">
                        reverse(head={call.id ?? call})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
            </div>
          </div>
          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50 mt-6">
            <h3 className="font-bold text-xl text-sky-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} />
              Complexity Analysis
            </h3>
            {mode === "iterative" ? (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    We traverse the list once, visiting each node exactly one
                    time to reverse its pointer. This results in a linear time
                    complexity.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(1)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    The iterative approach only uses a few pointers (`prev`,
                    `curr`, `nextTemp`) to keep track of nodes. The space
                    required is constant and does not depend on the size of the
                    list.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Time Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    Each node is visited once as the recursion goes down to the
                    end of the list, and then once again as the stack unwinds to
                    reverse the pointers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sky-300">
                    Space Complexity:{" "}
                    <span className="font-mono text-teal-300">O(N)</span>
                  </h4>
                  <p className="text-gray-400 mt-1">
                    The space complexity is determined by the recursion depth.
                    In the worst case, the recursion will go N levels deep (for
                    a list of N nodes), so the call stack will require O(N)
                    space.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ReverseLinkedList;
