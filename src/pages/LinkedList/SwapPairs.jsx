import {
  ArrowUp,
  GitBranch,
  Hash,
  Merge,
  Split
} from "lucide-react";
import { useEffect, useState } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

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
    if (nodeId === null || nodeId === undefined || nodeId === -99) { 
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
    purple: "text-purple-400",
    cyan: "text-cyan-400",
  };

  return (
    <div
      className="absolute text-center transition-all duration-300 ease-out pointer-events-none"
      style={position}
    >
      <div
        className={`font-bold text-lg font-mono ${colorClasses[color]} flex items-center gap-1`}
      >
        {label === "head" && <Hash size={20} />}
        {label === "second" && <Merge size={20} />}
        {label === "swappedRest" && <Split size={20} />}
        <span>{label}</span>
      </div>
      <ArrowUp className={`w-6 h-6 mx-auto ${colorClasses[color]}`} />
    </div>
  );
};

const generateSwapPairsHistory = (initialNodes) => {
  const newHistory = [];
  let stepCounter = 0;
  let nodes = initialNodes.map(n => ({ ...n })); 

  const getNodeById = (id) => nodes.find(n => n.id === id);

  const addState = (props) => {
    const currentStateNodes = nodes.map(n => ({...n}));
    newHistory.push({
      step: stepCounter++,
      explanation: "",
      nodes: currentStateNodes, 
      ...props,
    });
  };
  
  const reorderNodesByPointers = (currentNodes, startNodeId) => {
    let currentNode = getNodeById(startNodeId);
    let orderedIds = [];
    let tempNodes = [...currentNodes]; 
    
    while (currentNode) {
      orderedIds.push(currentNode.id);
      currentNode = getNodeById(currentNode.next);
    }

    const newOrderedNodes = orderedIds.map((id, index) => {
      const node = tempNodes.find(n => n.id === id);
      return {
        ...node,
        x: 80 + index * 140, 
        y: 200,
      };
    });

    nodes = newOrderedNodes;
  };

  const swapPairsRecursive = (headId, depth) => {
    const head = getNodeById(headId);
    const second = head && getNodeById(head.next);
    const nextPairHeadId = second ? second.next : null;
    
    if (!head || !second) {
      addState({
        line: 2,
        explanation: `Base case reached: List is empty or single node (${head ? head.data : 'NULL'}). Returning head.`,
        head: headId, 
        second: null, 
        swappedRest: null,
        depth,
        returning: true,
      });
      return headId; 
    }

    addState({
      line: 5,
      explanation: `Recursively calling swapPairs for the rest of the list starting at ${nextPairHeadId !== null ? getNodeById(nextPairHeadId)?.data : 'NULL'}.`,
      head: headId, 
      second: second.id, 
      swappedRest: nextPairHeadId,
      depth,
      recursionCall: true,
    });

    const swappedRestHeadId = swapPairsRecursive(nextPairHeadId, depth + 1);

    second.next = headId;      
    head.next = swappedRestHeadId; 

    reorderNodesByPointers(nodes, second.id); 

    addState({
      line: 9,
      explanation: `Pointers for (${head.data}, ${second.data}) swapped. The new local head is ${second.data}. Returning this head up the stack.`,
      head: headId, 
      second: second.id, 
      swappedRest: swappedRestHeadId,
      depth,
      returning: true,
      swapped: true,
    });

    return second.id; 
  };

  const initialHeadId = nodes[0]?.id || null;
  const finalHeadId = swapPairsRecursive(initialHeadId, 0);

  reorderNodesByPointers(nodes, finalHeadId);

  addState({
    line: 10,
    explanation: "Recursion finished! The final list is now fully swapped.",
    nodes: nodes.map(n => ({...n})), 
    head: finalHeadId,
    second: null,
    swappedRest: null,
    depth: 0,
    finished: true,
  });

  return newHistory;
};

// Main Component
const SwapPairs = () => {
  const [listInput, setListInput] = useState("1,2,3,4,5");

  const visualizerState = useVisualizer();
  const {
    currentState,
    isLoaded,
    load,
  } = visualizerState;

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

    const newNodes = data.map((d, i) => ({
      id: i,
      data: d,
      next: i + 1 < data.length ? i + 1 : null,
      x: 80 + i * 140,
      y: 200,
    }));

    const newHistory = generateSwapPairsHistory(newNodes);
    if (newHistory) {
      load(newHistory);
    }
  };

  const swapPairsCodeContent = {
    1: "ListNode* swapPairs(ListNode* head) {",
    2: "  if (!head || !head->next) return head;",
    4: "  ListNode* second = head->next;",
    5: "  ListNode* swappedRest = swapPairs(second->next);",
    7: "  second->next = head;",
    8: "  head->next = swappedRest;",
    9: "  return second; // New head of this pair",
    10: "}"
  };

  const currentEdges = [];
  if (currentState.nodes && currentState.nodes.length > 0) {
    currentState.nodes.forEach((node) => {
      if (node.next !== null && node.next !== -99) { 
        const nextNodeExists = currentState.nodes.some(n => n.id === node.next);
        if (nextNodeExists) {
          currentEdges.push({ from: node.id, to: node.next, isCycle: false });
        }
      }
    });
  }

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
          Each pair of nodes is visited exactly once during recursion descent and once during swap phase.
        </p>
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Space Complexity</h4>
        <p className="text-xl font-bold text-teal-300 font-mono">O(N)</p>
        <p className="text-xs text-gray-400 mt-1">
          The recursion stack depth is proportional to the number of pairs, requiring O(N) memory.
        </p>
      </div>
      <div
        className={`p-4 rounded-2xl border transition-all shadow-2xl ${
          currentState.finished
            ? "bg-green-950/30 border-green-500/50 text-green-300"
            : currentState.returning
            ? "bg-yellow-950/30 border-yellow-500/50 text-yellow-300"
            : "bg-purple-950/30 border-purple-500/50 text-purple-300"
        }`}
      >
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Process Status</h4>
        <p className="text-xl font-bold font-mono">
          {currentState.finished ? "✓ Completed" : (currentState.returning ? "↩️ Unwinding" : "⬇️ Recursing")}
        </p>
        <p className="text-xs opacity-80 mt-1">
          {currentState.finished
            ? "Nodes have been fully swapped in pairs."
            : `Currently at stack depth: ${currentState.depth || 0}`}
        </p>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Swap Nodes in Pairs"
      description="Visualizing LeetCode 24"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={swapPairsCodeContent}
      activeLine={currentState.line}
      message={currentState.explanation}
      visualizerState={visualizerState}
      statsSection={statsSection}
    >
      {isLoaded && currentState.nodes && (
        <div className="w-full overflow-x-auto py-4 flex justify-center">
          <div
            className="relative"
            id="linked-list-container"
            style={{
              height: "280px",
              width: `${currentState.nodes.length * 140 + 100}px`,
            }}
          >
            <svg
              id="linked-list-svg"
              className="w-full h-full absolute top-0 left-0"
            >
              <defs>
                <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
              </defs>
              
              {currentEdges.map((edge, i) => {
                const fromNode = currentState.nodes.find((n) => n.id === edge.from);
                const toNode = currentState.nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

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
            </svg>
            <div className="absolute top-0 left-0 w-full h-full">
              {currentState.nodes.map((node) => {
                const isHead = currentState.head === node.id;
                const isSecond = currentState.second === node.id;
                const isRest = currentState.swappedRest === node.id;

                const isActive = isHead || isSecond || isRest;
                
                let baseClasses = "bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500";
                if (isActive) {
                  if (isHead) baseClasses = "bg-gradient-to-br from-blue-500 to-blue-600 border-3 border-blue-300 scale-110";
                  else if (isSecond) baseClasses = "bg-gradient-to-br from-red-500 to-rose-600 border-3 border-red-300 scale-110";
                  else if (isRest) baseClasses = "bg-gradient-to-br from-green-500 to-emerald-600 border-3 border-green-300 scale-110";
                }

                return (
                  <div
                    key={node.id}
                    id={`node-${node.id}`}
                    className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl text-white font-bold transition-all duration-500 shadow-xl ${baseClasses} ${currentState.finished ? "animate-pulse" : ""}`}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y - 28}px`,
                      transition: "left 0.5s ease-in-out, top 0.5s ease-in-out"
                    }}
                  >
                    {node.data}
                  </div>
                );
              })}
              
              <VisualizerPointer
                nodeId={currentState.head}
                containerId="linked-list-container"
                color="blue"
                label="head"
                yOffset={-30}
              />
              <VisualizerPointer
                nodeId={currentState.second}
                containerId="linked-list-container"
                color="red"
                label="second"
                yOffset={0}
              />
              <VisualizerPointer
                nodeId={currentState.swappedRest}
                containerId="linked-list-container"
                color="green"
                label="swappedRest"
                yOffset={30}
              />
            </div>
          </div>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default SwapPairs;