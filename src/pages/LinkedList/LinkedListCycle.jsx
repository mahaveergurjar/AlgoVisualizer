import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";
import {
  ArrowUp,
  GitBranch,
  Hash,
  Rabbit,
  Turtle,
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
  };

  return (
    <div
      className="absolute text-center transition-all duration-300 ease-out pointer-events-none"
      style={position}
    >
      <div
        className={`font-bold text-lg font-mono ${colorClasses[color]} flex items-center gap-1`}
      >
        {label === "slow" && <Turtle size={20} />}
        {label === "fast" && <Rabbit size={20} />}
        <span>{label}</span>
      </div>
      <ArrowUp className={`w-6 h-6 mx-auto ${colorClasses[color]}`} />
    </div>
  );
};

// Main Visualizer Component
const LinkedListCycle = () => {
  const [mode, setMode] = useState("optimal");
  const [listInput, setListInput] = useState("3,2,0,-4");
  const [cycleInput, setCycleInput] = useState("1");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const visualizerState = useVisualizer();
  const {
    currentState,
    isLoaded,
    load,
    setCurrentStep,
    reset: hookReset,
  } = visualizerState;

  const reset = () => {
    hookReset();
    setNodes([]);
    setEdges([]);
  };

  const generateBruteForceHistory = (currentNodes) => {
    const newHistory = [];
    let temp = currentNodes.length > 0 ? 0 : null;
    let nodeMap = new Set();
    const addState = (props) =>
      newHistory.push({
        temp,
        nodeMap: new Set(nodeMap),
        explanation: "",
        ...props,
      });

    addState({
      line: 26,
      explanation:
        "Initialize a temporary pointer and a hash map to track visited nodes.",
    });

    while (temp !== null) {
      addState({
        line: 29,
        temp,
        explanation: `Checking node at position ${temp} with value ${currentNodes[temp].data}.`,
      });

      if (nodeMap.has(temp)) {
        addState({
          line: 32,
          temp,
          finished: true,
          result: true,
          explanation: `Node ${temp} is already in the map. Cycle detected at this node!`,
        });
        return newHistory;
      }

      nodeMap.add(temp);
      addState({
        line: 36,
        temp,
        explanation: `Adding node ${temp} to the visited map. Map now contains: [${Array.from(
          nodeMap
        ).join(", ")}]`,
      });

      const currentNode = currentNodes.find((n) => n.id === temp);
      temp = currentNode.next;
      addState({
        line: 39,
        temp,
        explanation: `Moving to the next node${
          temp !== null ? ` (position ${temp})` : " (null - end of list)"
        }.`,
      });
    }

    addState({
      line: 43,
      finished: true,
      result: false,
      explanation: "Reached the end of the list (null). No cycle detected.",
    });
    return newHistory;
  };

  const generateOptimalHistory = (currentNodes) => {
    const newHistory = [];
    if (currentNodes.length === 0) {
      return [];
    }

    let slow = 0,
      fast = 0;
    const addState = (props) =>
      newHistory.push({ slow, fast, explanation: "", ...props });

    addState({
      line: 9,
      explanation:
        "Initialize both slow and fast pointers to the head of the list.",
    });

    while (true) {
      addState({
        line: 13,
        explanation: "Check if fast pointer can move two steps ahead.",
      });

      const fastNode = currentNodes.find((n) => n.id === fast);
      if (!fastNode || fastNode.next === null) {
        addState({
          line: 26,
          finished: true,
          result: false,
          explanation: "Fast pointer reached end (null). No cycle exists.",
        });
        break;
      }

      const nextFastNode = currentNodes.find((n) => n.id === fastNode.next);
      if (!nextFastNode || nextFastNode.next === null) {
        addState({
          line: 26,
          finished: true,
          result: false,
          explanation:
            "Fast pointer's next step would be null. No cycle exists.",
        });
        break;
      }

      const slowNode = currentNodes.find((n) => n.id === slow);
      slow = slowNode.next;
      addState({
        line: 15,
        explanation: `Slow pointer moves one step: ${slowNode.id} → ${slow} (value: ${currentNodes[slow].data})`,
      });

      fast = nextFastNode.next;
      addState({
        line: 17,
        explanation: `Fast pointer moves two steps: ${fastNode.id} → ${nextFastNode.id} → ${fast} (value: ${currentNodes[fast].data})`,
      });

      addState({
        line: 20,
        explanation: `Checking if pointers meet: slow=${slow}, fast=${fast}`,
      });

      if (slow === fast) {
        addState({
          line: 21,
          finished: true,
          result: true,
          explanation: `Pointers met at position ${slow}! Cycle detected.`,
        });
        break;
      }
    }

    return newHistory;
  };

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
    const cycleIndex = parseInt(cycleInput, 10);
    if (isNaN(cycleIndex) && cycleInput !== "") {
      alert(
        "Invalid cycle index. Please enter a number or leave empty for no cycle."
      );
      return;
    }

    const newNodes = data.map((d, i) => ({
      id: i,
      data: d,
      next: i + 1,
      x: 80 + i * 140,
      y: 200,
    }));

    if (newNodes.length > 0) newNodes[newNodes.length - 1].next = null;

    const newEdges = [];
    newNodes.forEach((node, i) => {
      if (node.next !== null) {
        newEdges.push({ from: i, to: node.next, isCycle: false });
      }
    });

    if (cycleInput !== "" && cycleIndex >= 0 && cycleIndex < newNodes.length) {
      const lastNode = newNodes[newNodes.length - 1];
      lastNode.next = cycleIndex;
      if (newEdges.length > 0 && newEdges[newEdges.length - 1].to !== null)
        newEdges.pop();
      newEdges.push({ from: lastNode.id, to: cycleIndex, isCycle: true });
    }

    setNodes(newNodes);
    setEdges(newEdges);

    const newHistory = mode === "brute-force"
      ? generateBruteForceHistory(newNodes)
      : generateOptimalHistory(newNodes);

    if (newHistory) {
      load(newHistory);
    }
  };

  const parseInput = useCallback(() => {
    if (nodes.length === 0) throw new Error("No list loaded");
    return nodes;
  }, [nodes]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "brute-force": (n) => load(generateBruteForceHistory(n)),
      optimal: (n) => load(generateOptimalHistory(n)),
    },
    setCurrentStep,
    onError: () => {},
  });

  const bruteForceCodeContent = {
    26: "Node* temp = head;",
    27: "unordered_map<Node*, int> nodeMap;",
    29: "while (temp != nullptr) {",
    31: "  if (nodeMap.find(temp) != nodeMap.end()) {",
    32: "    return true;",
    33: "  }",
    36: "  nodeMap[temp] = 1;",
    39: "  temp = temp->next;",
    40: "}",
    43: "return false;"
  };

  const optimalCodeContent = {
    9: "Node *slow = head, *fast = head;",
    13: "while (fast != nullptr && fast->next != nullptr) {",
    15: "  slow = slow->next;",
    17: "  fast = fast->next->next;",
    20: "  if (slow == fast) {",
    21: "    return true;",
    22: "  }",
    23: "}",
    26: "return false;"
  };

  const codeContent = mode === "brute-force" ? bruteForceCodeContent : optimalCodeContent;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-2 flex-grow min-w-[150px]">
        <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
          List Values:
        </label>
        <input
          type="text"
          value={listInput}
          onChange={(e) => setListInput(e.target.value)}
          disabled={isLoaded}
          className="font-mono w-full bg-gray-955/50 p-2 rounded-xl border border-gray-800 focus:border-cyan-500 focus:outline-none text-white text-sm"
          placeholder="e.g. 3,2,0,-4"
        />
      </div>
      <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 min-w-[100px]">
        <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
          Cycle at Index:
        </label>
        <input
          type="text"
          value={cycleInput}
          onChange={(e) => setCycleInput(e.target.value)}
          disabled={isLoaded}
          className="font-mono w-20 bg-gray-955/50 p-2 rounded-xl border border-gray-800 focus:border-cyan-500 focus:outline-none text-white text-sm"
          placeholder="1"
        />
      </div>
      <div className="flex bg-gray-950/40 p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => handleModeChange("brute-force")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            mode === "brute-force"
              ? "bg-cyan-500 text-gray-955 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Brute Force
        </button>
        <button
          onClick={() => handleModeChange("optimal")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            mode === "optimal"
              ? "bg-cyan-500 text-gray-955 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Optimal
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
          {mode === "brute-force"
            ? "We traverse the list, visiting each node. Map lookups/inserts are O(1) on average."
            : "Slow moves N nodes, fast moves 2N. They meet within linear steps if there is a cycle."}
        </p>
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Space Complexity</h4>
        <p className="text-xl font-bold text-teal-300 font-mono">
          {mode === "brute-force" ? "O(N)" : "O(1)"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {mode === "brute-force"
            ? "Requires storing all nodes in the map in the worst case."
            : "Only slow and fast pointer variables are stored."}
        </p>
      </div>
      
      {currentState.finished ? (
        <div
          className={`p-4 rounded-2xl border transition-all shadow-2xl ${
            currentState.result
              ? "bg-green-950/30 border-green-500/50 text-green-300"
              : "bg-red-950/30 border-red-500/50 text-red-300"
          }`}
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2">Detection Result</h4>
          <p className="text-xl font-bold font-mono">
            {currentState.result ? "✓ Cycle Detected" : "✗ No Cycle"}
          </p>
          <p className="text-xs opacity-80 mt-1">
            {currentState.result ? "Pointers met or revisited a node." : "Reached end of list (null)."}
          </p>
        </div>
      ) : mode === "brute-force" && currentState.nodeMap ? (
        <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl col-span-1 sm:col-span-3">
          <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Hash size={14} /> Visited Nodes (Hash Map)
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[3.5rem] bg-gray-955/40 p-3 rounded-xl border border-gray-800">
            {Array.from(currentState.nodeMap).length > 0 ? (
              Array.from(currentState.nodeMap).map((nodeId) => (
                <div
                  key={nodeId}
                  className="bg-purple-600/20 text-purple-300 w-10 h-10 flex items-center justify-center font-mono text-sm font-bold rounded-lg border border-purple-500/40 shadow-md"
                >
                  {nodeId}
                </div>
              ))
            ) : (
              <span className="text-gray-500 italic text-xs flex items-center">
                No nodes visited yet
              </span>
            )}
          </div>
        </div>
      ) : null}
    </>
  );

  const overriddenVisualizerState = {
    ...visualizerState,
    reset,
  };

  return (
    <VisualizerLayout
      title="Linked List Cycle Detection"
      description="Visualizing LeetCode 141"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={currentState.line}
      message={currentState.explanation}
      visualizerState={overriddenVisualizerState}
      statsSection={statsSection}
    >
      {isLoaded && nodes.length > 0 && (
        <div className="w-full overflow-x-auto py-4 flex justify-center">
          <div
            className="relative"
            style={{
              height: "280px",
              width: `${nodes.length * 140 + 100}px`,
            }}
          >
            <svg
              id="linked-list-svg"
              className="w-full h-full absolute top-0 left-0"
            >
              {edges.map((edge, i) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                if (edge.isCycle) {
                  const controlX = (fromNode.x + toNode.x) / 2 + 60;
                  const controlY = fromNode.y + 100;
                  const pathD = `M ${fromNode.x + 50} ${
                    fromNode.y + 28
                  } Q ${controlX} ${controlY} ${toNode.x + 50} ${
                    toNode.y - 28
                  }`;
                  return (
                    <g key={i}>
                      <path
                        d={pathD}
                        stroke="url(#cycle-gradient)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#arrow-cycle)"
                        className="drop-shadow-lg"
                      />
                    </g>
                  );
                }
                return (
                  <line
                    key={i}
                    x1={fromNode.x + 100}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="url(#arrow-gradient)"
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                    className="drop-shadow-md"
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
                <linearGradient
                  id="cycle-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker
                  id="arrow-cycle"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
                </marker>
              </defs>
            </svg>
            <div
              id="linked-list-container"
              className="absolute top-0 left-0 w-full h-full"
            >
              {nodes.map((node) => {
                const isActive =
                  currentState.temp === node.id ||
                  currentState.slow === node.id ||
                  currentState.fast === node.id;
                const isSlow = currentState.slow === node.id;
                const isFast = currentState.fast === node.id;

                return (
                  <div
                    key={node.id}
                    id={`node-${node.id}`}
                    className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl font-bold transition-all duration-300 shadow-xl ${
                      isActive
                        ? isSlow
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 border-3 border-green-300 scale-110"
                          : isFast
                          ? "bg-gradient-to-br from-red-500 to-rose-600 border-3 border-red-300 scale-110"
                          : "bg-gradient-to-br from-sky-500 to-blue-600 border-3 border-sky-300 scale-110"
                        : "bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500"
                    }`}
                    style={{ left: `${node.x}px`, top: `${node.y - 28}px` }}
                  >
                    {node.data}
                  </div>
                );
              })}
              {mode === "brute-force" && (
                <VisualizerPointer
                  nodeId={currentState.temp}
                  containerId="linked-list-container"
                  color="amber"
                  label="temp"
                />
              )}
              {mode === "optimal" && (
                <>
                  <VisualizerPointer
                    nodeId={currentState.slow}
                    containerId="linked-list-container"
                    color="green"
                    label="slow"
                    yOffset={-15}
                  />
                  <VisualizerPointer
                    nodeId={currentState.fast}
                    containerId="linked-list-container"
                    color="red"
                    label="fast"
                    yOffset={15}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default LinkedListCycle;
