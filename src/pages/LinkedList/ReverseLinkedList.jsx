import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { ArrowUp, Layers } from "lucide-react";

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
  const [listInput, setListInput] = useState("1,2,3,4,5");

  const visualizerState = useVisualizer();
  const {
    currentState,
    isLoaded,
    load,
    setCurrentStep,
  } = visualizerState;

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

    return newHistory;
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

    return newHistory;
  }, []);

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

    const newHistory = mode === "iterative"
      ? generateIterativeHistory(data)
      : generateRecursiveHistory(data);
    
    if (newHistory) {
      load(newHistory);
    }
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
      iterative: (d) => load(generateIterativeHistory(d)),
      recursive: (d) => load(generateRecursiveHistory(d)),
    },
    setCurrentStep,
    onError: (m) => console.warn(m),
  });

  const iterativeCodeContent = {
    4: "ListNode *prev = NULL, *curr = head;",
    5: "while(curr != NULL) {",
    6: "  ListNode* nextTemp = curr->next;",
    7: "  curr->next = prev;",
    9: "  prev = curr;",
    10: "  curr = nextTemp;",
    11: "}",
    12: "return prev;"
  };

  const recursiveCodeContent = {
    4: "if (head == NULL || head->next == NULL)",
    5: "  return head;",
    7: "ListNode* newHead = reverseList(head->next);",
    8: "head->next->next = head;",
    9: "head->next = NULL;",
    10: "return newHead;"
  };

  const codeContent = mode === "iterative" ? iterativeCodeContent : recursiveCodeContent;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-2 flex-grow min-w-[200px]">
        <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
          List Values:
        </label>
        <input
          type="text"
          value={listInput}
          onChange={(e) => setListInput(e.target.value)}
          disabled={isLoaded}
          className="font-mono w-full bg-gray-955/50 p-2 rounded-xl border border-gray-800 focus:border-cyan-500 focus:outline-none text-white text-sm"
          placeholder="e.g. 1,2,3,4,5"
        />
      </div>
      <div className="flex bg-gray-950/40 p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => handleModeChange("iterative")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            mode === "iterative"
              ? "bg-cyan-500 text-gray-955 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Iterative
        </button>
        <button
          onClick={() => handleModeChange("recursive")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            mode === "recursive"
              ? "bg-cyan-500 text-gray-955 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Recursive
        </button>
      </div>
      {!isLoaded && (
        <button
          onClick={buildAndGenerateHistory}
          className="bg-cyan-500 hover:bg-cyan-400 text-gray-955 font-bold py-2 px-5 rounded-xl transition-all shadow-lg text-sm"
        >
          Load & Visualize
        </button>
      )}
    </div>
  );

  const statsSection = (
    <>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Time Complexity</h4>
        <p className="text-xl font-bold text-cyan-300 font-mono">O(N)</p>
        <p className="text-xs text-gray-400 mt-1">
          {mode === "iterative"
            ? "We traverse the list once, visiting each node exactly one time."
            : "Each node is visited once as recursion goes down, and once as stack unwinds."}
        </p>
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Space Complexity</h4>
        <p className="text-xl font-bold text-teal-300 font-mono">
          {mode === "iterative" ? "O(1)" : "O(N)"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {mode === "iterative"
            ? "Only a constant number of pointers are used."
            : "Determined by the recursion depth, which is O(N) in the worst case."}
        </p>
      </div>
      {mode === "recursive" && currentState.callStack && (
        <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl col-span-1 sm:col-span-3">
          <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers size={14} /> Call Stack
          </h4>
          <div className="flex flex-col-reverse gap-1.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {currentState.callStack.map((call, index) => (
              <div
                key={index}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  index === currentState.callStack.length - 1
                    ? "bg-cyan-500/10 border-cyan-400/50 text-cyan-300"
                    : "bg-gray-800/40 border-gray-800 text-gray-400"
                }`}
              >
                <span className="font-mono font-bold">
                  reverse(head = {call.id ?? call})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <VisualizerLayout
      title="Reverse Linked List"
      description="Visualizing LeetCode 206"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={currentState.line}
      message={currentState.explanation}
      visualizerState={visualizerState}
      statsSection={statsSection}
    >
      {isLoaded && currentState.nodes && (
        <div className="w-full overflow-x-auto py-4 flex justify-center">
          <div
            className="relative"
            style={{
              height: "280px",
              width: `${currentState.nodes.length * 140 + 100}px`,
            }}
          >
            <svg className="w-full h-full absolute top-0 left-0">
              {currentState.edges?.map((edge, i) => {
                const fromNode = currentState.nodes.find(
                  (n) => n.id === edge.from
                );
                const toNode = currentState.nodes.find((n) => n.id === edge.to);
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
              {currentState.nodes.map((node) => (
                <div
                  key={node.id}
                  id={`node-${node.id}`}
                  className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl font-bold transition-all duration-300 shadow-xl border-2 ${
                    currentState.curr === node.id
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
                  nodeId={currentState.prev}
                  containerId="linked-list-container"
                  color="green"
                  label="prev"
                  yOffset={-15}
                />
              )}
              {mode === "iterative" && (
                <VisualizerPointer
                  nodeId={currentState.curr}
                  containerId="linked-list-container"
                  color="amber"
                  label="curr"
                  yOffset={0}
                />
              )}
              {mode === "iterative" && (
                <VisualizerPointer
                  nodeId={currentState.nextTemp}
                  containerId="linked-list-container"
                  color="red"
                  label="next"
                  yOffset={15}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default ReverseLinkedList;
