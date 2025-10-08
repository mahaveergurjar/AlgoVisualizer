import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUp,
  ArrowLeft,
  Code2,
  Code,
  CheckCircle,
  Clock,
  GitBranch,
  Infinity,
  Repeat,
  Star,
  TrendingUp,
  Zap,
  Hash,
  Rabbit,
  Turtle,
  Repeat1,
} from "lucide-react";

// ====================================================================================
// SHARED HELPER COMPONENTS & DATA
// ====================================================================================

class ListNode {
    constructor(val, next = null) {
        this.val = val;
        this.next = next;
    }
}

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
      const left = elementRect.left - containerRect.left + elementRect.width / 2 - 20;
      const top = elementRect.top - containerRect.top - 40 + yOffset;
      setPosition({ opacity: 1, left, top });
    } else {
      setPosition((p) => ({ ...p, opacity: 0 }));
    }
  }, [nodeId, containerId, yOffset]);

  const colorClasses = {
    blue: "text-sky-400",
    red: "text-red-400",
    amber: "text-amber-400",
    green: "text-green-400",
  };

  return (
    <div
      className="absolute text-center transition-all duration-300 ease-out pointer-events-none"
      style={position}
    >
      <div className={`font-bold text-lg font-mono ${colorClasses[color]} flex items-center gap-1`}>
        {label === "slow" && <Turtle size={20} />}
        {label === "fast" && <Rabbit size={20} />}
        <span>{label}</span>
      </div>
      <ArrowUp className={`w-6 h-6 mx-auto ${colorClasses[color]}`} />
    </div>
  );
};

const CodeLine = ({ line, content, colorMapping, activeLine }) => (
    <div className={`block rounded-md transition-colors px-2 py-1 ${ activeLine === line ? "bg-sky-500/20 border-l-4 border-sky-400" : "" }`}>
        <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">{line}</span>
        {content.map((token, index) => (<span key={index} className={colorMapping[token.c]}>{token.t}</span>))}
    </div>
);

const colorMapping = { purple: "text-purple-400", cyan: "text-cyan-400", "light-blue": "text-sky-300", yellow: "text-yellow-300", orange: "text-orange-400", red: "text-red-400", "light-gray": "text-gray-400", green: "text-green-400", "": "text-gray-200" };


// ====================================================================================
// COMPONENT 1: LinkedListCycle
// ====================================================================================
const LinkedListCycle = ({ navigate }) => {
  const [mode, setMode] = useState("optimal");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [listInput, setListInput] = useState("3,2,0,-4");
  const [cycleInput, setCycleInput] = useState("1");
  const [isLoaded, setIsLoaded] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const buildAndGenerateHistory = () => {
    const data = listInput.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
    if (data.some(isNaN) || data.length === 0) {
      alert("Invalid list input. Please use comma-separated numbers.");
      return;
    }
    const cycleIndex = parseInt(cycleInput, 10);
    if (isNaN(cycleIndex) && cycleInput !== "") {
      alert("Invalid cycle index. Please enter a number or leave empty for no cycle.");
      return;
    }

    const newNodes = data.map((d, i) => ({ id: i, data: d, next: i + 1, x: 80 + i * 140, y: 200 }));
    if (newNodes.length > 0) newNodes[newNodes.length - 1].next = null;

    const newEdges = [];
    newNodes.forEach((node, i) => {
      if (node.next !== null) newEdges.push({ from: i, to: node.next, isCycle: false });
    });

    if (cycleInput !== "" && cycleIndex >= 0 && cycleIndex < newNodes.length) {
      const lastNode = newNodes[newNodes.length - 1];
      lastNode.next = cycleIndex;
      if (newEdges.length > 0 && newEdges[newEdges.length - 1].to !== null) newEdges.pop();
      newEdges.push({ from: lastNode.id, to: cycleIndex, isCycle: true });
    }

    setNodes(newNodes);
    setEdges(newEdges);

    if (mode === "brute-force") generateBruteForceHistory(newNodes);
    else generateOptimalHistory(newNodes);
    setIsLoaded(true);
    setCurrentStep(0);
  };

  const generateBruteForceHistory = (currentNodes) => {
    const newHistory = [];
    let temp = currentNodes.length > 0 ? 0 : null;
    let nodeMap = new Set();
    const addState = (props) => newHistory.push({ temp, nodeMap: new Set(nodeMap), explanation: "", ...props });
    addState({ line: 26, explanation: "Initialize a temporary pointer and a hash map to track visited nodes." });
    while (temp !== null) {
      addState({ line: 29, temp, explanation: `Checking node at position ${temp} with value ${currentNodes[temp].data}.` });
      if (nodeMap.has(temp)) {
        addState({ line: 32, temp, finished: true, result: true, explanation: `Node ${temp} is already in the map. Cycle detected at this node!` });
        setHistory(newHistory);
        return;
      }
      nodeMap.add(temp);
      addState({ line: 36, temp, explanation: `Adding node ${temp} to the visited map. Map now contains: [${Array.from(nodeMap).join(", ")}]` });
      const currentNode = currentNodes.find((n) => n.id === temp);
      temp = currentNode.next;
      addState({ line: 39, temp, explanation: `Moving to the next node${temp !== null ? ` (position ${temp})` : " (null - end of list)"}.` });
    }
    addState({ line: 43, finished: true, result: false, explanation: "Reached the end of the list (null). No cycle detected." });
    setHistory(newHistory);
  };

  const generateOptimalHistory = (currentNodes) => {
    const newHistory = [];
    if (currentNodes.length === 0) { setHistory([]); return; }
    let slow = 0, fast = 0;
    const addState = (props) => newHistory.push({ slow, fast, explanation: "", ...props });
    addState({ line: 9, explanation: "Initialize both slow and fast pointers to the head of the list." });
    while (true) {
      addState({ line: 13, explanation: "Check if fast pointer can move two steps ahead." });
      const fastNode = currentNodes.find((n) => n.id === fast);
      if (!fastNode || fastNode.next === null) {
        addState({ line: 26, finished: true, result: false, explanation: "Fast pointer reached end (null). No cycle exists." });
        break;
      }
      const nextFastNode = currentNodes.find((n) => n.id === fastNode.next);
      if (!nextFastNode || nextFastNode.next === null) {
        addState({ line: 26, finished: true, result: false, explanation: "Fast pointer's next step would be null. No cycle exists." });
        break;
      }
      const slowNode = currentNodes.find((n) => n.id === slow);
      slow = slowNode.next;
      addState({ line: 15, explanation: `Slow pointer moves one step: ${slowNode.id} → ${slow} (value: ${currentNodes[slow].data})` });
      fast = nextFastNode.next;
      addState({ line: 17, explanation: `Fast pointer moves two steps: ${fastNode.id} → ${nextFastNode.id} → ${fast} (value: ${currentNodes[fast].data})` });
      addState({ line: 20, explanation: `Checking if pointers meet: slow=${slow}, fast=${fast}` });
      if (slow === fast) {
        addState({ line: 21, finished: true, result: true, explanation: `Pointers met at position ${slow}! Cycle detected.` });
        break;
      }
    }
    setHistory(newHistory);
  };

  const reset = () => { setIsLoaded(false); setHistory([]); setCurrentStep(-1); setNodes([]); setEdges([]); };
  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
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
  const bruteForceCode = [ { l: 26, c: [ { t: "Node*", c: "cyan" }, { t: " temp = head;", c: "" }, ], }, { l: 27, c: [{ t: "unordered_map<Node*, int> nodeMap;", c: "cyan" }] }, { l: 29, c: [ { t: "while", c: "purple" }, { t: " (temp != nullptr) {", c: "" }, ], }, { l: 31, c: [ { t: "  if", c: "purple" }, { t: " (nodeMap.find(temp) != nodeMap.end()) {", c: "" }, ], }, { l: 32, c: [ { t: "    return", c: "purple" }, { t: " true", c: "light-blue" }, { t: ";", c: "light-gray" }, ], }, { l: 33, c: [{ t: "  }", c: "light-gray" }] }, { l: 36, c: [{ t: "  nodeMap[temp] = 1;", c: "" }] }, { l: 39, c: [{ t: "  temp = temp->next;", c: "" }] }, { l: 40, c: [{ t: "}", c: "light-gray" }] }, { l: 43, c: [ { t: "return", c: "purple" }, { t: " false", c: "light-blue" }, { t: ";", c: "light-gray" }, ], }, ];
  const optimalCode = [ { l: 9, c: [ { t: "Node", c: "cyan" }, { t: " *slow = head, *fast = head;", c: "" }, ], }, { l: 13, c: [ { t: "while", c: "purple" }, { t: " (fast != nullptr && fast->next != nullptr) {", c: "" }, ], }, { l: 15, c: [{ t: "  slow = slow->next;", c: "" }] }, { l: 17, c: [{ t: "  fast = fast->next->next;", c: "" }] }, { l: 20, c: [ { t: "  if", c: "purple" }, { t: " (slow == fast) {", c: "" }, ], }, { l: 21, c: [ { t: "    return", c: "purple" }, { t: " true", c: "light-blue" }, { t: ";", c: "light-gray" }, ], }, { l: 22, c: [{ t: "  }", c: "light-gray" }] }, { l: 23, c: [{ t: "}", c: "light-gray" }] }, { l: 26, c: [ { t: "return", c: "purple" }, { t: " false", c: "light-blue" }, { t: ";", c: "light-gray" }, ], }, ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Linked List Cycle Detection</h1>
        <p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 141</p>
      </header>
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">List Values:</label>
              <input type="text" value={listInput} onChange={(e) => setListInput(e.target.value)} disabled={isLoaded} className="font-mono flex-grow sm:w-48 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-sky-500 focus:outline-none transition-colors" placeholder="e.g., 3,2,0,-4" />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">Cycle at Index:</label>
              <input type="text" value={cycleInput} onChange={(e) => setCycleInput(e.target.value)} disabled={isLoaded} className="font-mono w-24 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-sky-500 focus:outline-none transition-colors" placeholder="1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isLoaded ? <button onClick={buildAndGenerateHistory} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Load & Visualize</button> : <>
              <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button>
              <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
              <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
            </>}
            <button onClick={reset} className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Reset</button>
          </div>
        </div>
      </div>
      <div className="flex border-b border-gray-700 mb-6">
        <div onClick={() => { setMode("brute-force"); reset(); }} className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "brute-force" ? "border-sky-400 text-sky-400" : "border-transparent text-gray-400"}`}>Brute Force O(n)</div>
        <div onClick={() => { setMode("optimal"); reset(); }} className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "optimal" ? "border-sky-400 text-sky-400" : "border-transparent text-gray-400"}`}>Optimal O(n) - O(1) Space</div>
      </div>
      {isLoaded ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
          <h3 className="font-bold text-2xl text-sky-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2"><Code size={22} /> C++ Solution</h3>
          <pre className="text-sm overflow-auto max-h-96"><code className="font-mono leading-relaxed">
            {mode === "brute-force" ? bruteForceCode.map((line) => <CodeLine key={line.l} line={line.l} content={line.c} colorMapping={colorMapping} activeLine={state.line} />) : optimalCode.map((line) => <CodeLine key={line.l} line={line.l} content={line.c} colorMapping={colorMapping} activeLine={state.line}/>)}
          </code></pre>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[360px] overflow-x-auto">
            <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2"><GitBranch size={22} /> Linked List Visualization</h3>
            <div className="relative" style={{ height: "280px", width: `${nodes.length * 140 + 100}px` }}>
              <svg id="linked-list-svg" className="w-full h-full absolute top-0 left-0">
                {edges.map((edge, i) => {
                  const fromNode = nodes.find((n) => n.id === edge.from);
                  const toNode = nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  if (edge.isCycle) {
                    const controlX = (fromNode.x + toNode.x) / 2 + 60;
                    const controlY = fromNode.y + 100;
                    const pathD = `M ${fromNode.x + 50} ${fromNode.y + 28} Q ${controlX} ${controlY} ${toNode.x + 50} ${toNode.y - 28}`;
                    return <g key={i}><path d={pathD} stroke="url(#cycle-gradient)" strokeWidth="3" fill="none" markerEnd="url(#arrow-cycle)" className="drop-shadow-lg" /></g>;
                  }
                  return <line key={i} x1={fromNode.x + 100} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="url(#arrow-gradient)" strokeWidth="3" markerEnd="url(#arrow)" className="drop-shadow-md" />;
                })}
                <defs>
                  <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
                  <linearGradient id="cycle-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient>
                  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker>
                  <marker id="arrow-cycle" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" /></marker>
                </defs>
              </svg>
              <div id="linked-list-container" className="absolute top-0 left-0 w-full h-full">
                {nodes.map((node) => {
                  const isActive = state.temp === node.id || state.slow === node.id || state.fast === node.id;
                  const isSlow = state.slow === node.id;
                  const isFast = state.fast === node.id;
                  return <div key={node.id} id={`node-${node.id}`} className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl font-bold transition-all duration-300 shadow-xl ${isActive ? isSlow ? "bg-gradient-to-br from-green-500 to-emerald-600 border-3 border-green-300 scale-110" : isFast ? "bg-gradient-to-br from-red-500 to-rose-600 border-3 border-red-300 scale-110" : "bg-gradient-to-br from-sky-500 to-blue-600 border-3 border-sky-300 scale-110" : "bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500"}`} style={{ left: `${node.x}px`, top: `${node.y - 28}px` }}>{node.data}</div>;
                })}
                {mode === "brute-force" && <VisualizerPointer nodeId={state.temp} containerId="linked-list-container" color="amber" label="temp" />}
                {mode === "optimal" && <>
                  <VisualizerPointer nodeId={state.slow} containerId="linked-list-container" color="green" label="slow" yOffset={-15} />
                  <VisualizerPointer nodeId={state.fast} containerId="linked-list-container" color="red" label="fast" yOffset={15} />
                </>}
              </div>
            </div>
          </div>
          {mode === "brute-force" && <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-gray-300 text-sm font-semibold mb-3 flex items-center gap-2"><Hash size={18} /> Visited Nodes (Hash Map)</h3>
            <div className="flex flex-wrap gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg">
              {Array.from(state.nodeMap || []).length > 0 ? Array.from(state.nodeMap || []).map((nodeId) => <div key={nodeId} className="bg-gradient-to-br from-purple-600 to-purple-700 w-14 h-14 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 border-purple-400">{nodeId}</div>) : <span className="text-gray-500 italic text-sm">No nodes visited yet</span>}
            </div>
          </div>}
          <div className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${state.finished ? state.result ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500" : "bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-500" : "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700"}`}>
            <h3 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${state.finished ? state.result ? "text-green-300" : "text-red-300" : "text-gray-400"}`}><CheckCircle size={18} /> Detection Result</h3>
            <p className={`font-mono text-4xl font-bold ${state.finished ? state.result ? "text-green-400" : "text-red-400" : "text-gray-400"}`}>{state.finished ? state.result ? "✓ Cycle Detected" : "✗ No Cycle" : "Processing..."}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">Step Explanation</h3>
            <p className="text-gray-200 text-base leading-relaxed">{state.explanation || 'Click "Load & Visualize" to begin'}</p>
          </div>
        </div>
        <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
          <h3 className="font-bold text-2xl text-sky-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2"><Clock size={24} /> Complexity Analysis</h3>
          {mode === "brute-force" ? <div className="space-y-5 text-base">
            <div className="bg-gray-900/50 p-4 rounded-xl">
              <h4 className="font-semibold text-sky-300 text-lg mb-2">Time Complexity: <span className="font-mono text-teal-300">O(N)</span></h4>
              <p className="text-gray-300">We traverse the linked list once, visiting each node exactly one time. Hash map operations (insert and lookup) take O(1) average time, so the overall complexity is linear.</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl">
              <h4 className="font-semibold text-sky-300 text-lg mb-2">Space Complexity: <span className="font-mono text-teal-300">O(N)</span></h4>
              <p className="text-gray-300">In the worst-case scenario (a list with no cycle), we must store all N nodes in the hash map before reaching the end. Therefore, the space required is proportional to the number of nodes.</p>
            </div>
          </div> : <div className="space-y-5 text-base">
            <div className="bg-gray-900/50 p-4 rounded-xl">
              <h4 className="font-semibold text-sky-300 text-lg mb-2">Time Complexity: <span className="font-mono text-teal-300">O(N)</span></h4>
              <p className="text-gray-300">The slow pointer will travel at most N nodes. The fast pointer travels at 2N speed. If there is a cycle, they are guaranteed to meet. The total number of steps is proportional to N, making it a linear time algorithm.</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl">
              <h4 className="font-semibold text-sky-300 text-lg mb-2">Space Complexity: <span className="font-mono text-teal-300">O(1)</span></h4>
              <p className="text-gray-300">This algorithm only uses two pointers (`slow` and `fast`) to traverse the list. The amount of memory used does not scale with the size of the linked list, so the space complexity is constant.</p>
            </div>
          </div>}
        </div>
      </div> : <div className="text-center py-12"><p className="text-gray-500">Load a linked list to begin visualization.</p></div>}
    </div>
  );
};


// ====================================================================================
// COMPONENT 2: ReverseLinkedList
// ====================================================================================
const ReverseLinkedList = ({ navigate }) => {
    const [mode, setMode] = useState("iterative"); // iterative vs recursive
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [listInput, setListInput] = useState("1,2,3,4,5");
    const [isLoaded, setIsLoaded] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const buildAndGenerateHistory = () => {
        const data = listInput.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
        if (data.some(isNaN) || data.length === 0) {
            alert("Invalid list input. Please use comma-separated numbers.");
            return;
        }
        const newNodes = data.map((d, i) => ({ id: i, data: d, next: i < data.length - 1 ? i + 1 : null, x: 80 + i * 140, y: 200, }));
        setNodes(newNodes);
        if (mode === "recursive") {
            generateRecursiveHistory(JSON.parse(JSON.stringify(newNodes))); // Use a deep copy
        } else {
            generateIterativeHistory(JSON.parse(JSON.stringify(newNodes))); // Use a deep copy
        }
        setIsLoaded(true);
        setCurrentStep(0);
    };

    const generateIterativeHistory = (currentNodes) => {
        if (currentNodes.length === 0) { setHistory([]); return; }
        const newHistory = [];
        let prev = null, current = 0, next = null;
        let currentEdges = [];
        currentNodes.forEach(node => { if (node.next !== null) currentEdges.push({ from: node.id, to: node.next }); });

        const addState = (props) => newHistory.push({ prev, current, next, edges: [...currentEdges], explanation: "", ...props });
        addState({ line: 2, explanation: "Initialize `prev` pointer to null." });
        addState({ line: 3, explanation: "Initialize `current` pointer to the head of the list (node 0)." });

        while (current !== null) {
            const currentNodeObject = currentNodes.find(n => n.id === current);
            next = currentNodeObject.next;
            addState({ line: 6, explanation: `Store the next node. \`next\` now points to node ${next ?? 'null'}.` });
            
            currentEdges = currentEdges.filter(edge => edge.from !== current);
            if (prev !== null) currentEdges.push({ from: current, to: prev }); 

            addState({ line: 7, explanation: `Reverse the pointer. \`current.next\` now points to ${prev ?? 'null'}.`, });
            prev = current;
            addState({ line: 8, explanation: `Move \`prev\` one step forward to node ${current}.` });
            current = next;
            addState({ line: 9, explanation: `Move \`current\` one step forward to node ${next ?? 'null'}.` });
        }
        addState({ line: 12, finished: true, explanation: `Loop finishes as \`current\` is null. The new head is \`prev\` (node ${prev}).` });
        setHistory(newHistory);
    };

    const generateRecursiveHistory = (initialNodes) => {
        if (initialNodes.length === 0) { setHistory([]); return; }
        const newHistory = [];
        let callStack = [];
        let currentEdges = [];
        initialNodes.forEach(node => { if (node.next !== null) currentEdges.push({ from: node.id, to: node.next }); });

        const addState = (props) => newHistory.push({ callStack: [...callStack], edges: [...currentEdges], explanation: "", ...props });

        function reverse(headId) {
            if (headId === null) {
                 addState({ line: 19, head: headId, explanation: `Base case reached. Head is null.` });
                 return null;
            }
            const headNode = initialNodes.find(n => n.id === headId);
            callStack.push(headId);
            addState({ line: 18, head: headId, explanation: `Recursive call with head at node ${headId}. Pushing ${headId} to call stack.` });

            if (headNode.next === null) {
                addState({ line: 19, head: headId, explanation: `Base case reached. Head's next is null. Returning node ${headId} as the new head.` });
                callStack.pop();
                return headId;
            }

            const newHeadId = reverse(headNode.next);
            addState({ line: 22, head: headId, newHead: newHeadId, explanation: `Returning from call. New head is ${newHeadId}. Now at node ${headId}.` });
            const nextNodeId = headNode.next;
            
            currentEdges = currentEdges.filter(edge => edge.from !== nextNodeId);
            if (headId !== null) currentEdges.push({ from: nextNodeId, to: headId });
            addState({ line: 24, head: headId, newHead: newHeadId, explanation: `Reverse pointer: node ${nextNodeId}'s next now points to node ${headId}.` });
            
            currentEdges = currentEdges.filter(edge => edge.from !== headId);
            addState({ line: 25, head: headId, newHead: newHeadId, explanation: `Set node ${headId}'s next to null to break the old link.` });

            callStack.pop();
            return newHeadId;
        }

        addState({ explanation: "Start the initial recursive call." });
        const finalHead = reverse(0);
        addState({ finished: true, newHead: finalHead, explanation: `All calls returned. The final new head is node ${finalHead}.` });
        setHistory(newHistory);
    };

    const reset = () => { setIsLoaded(false); setHistory([]); setCurrentStep(-1); setNodes([]); setEdges([]); };
    const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
    const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
    useEffect(() => {
        const handleKeyDown = (e) => { if (isLoaded) { if (e.key === "ArrowLeft") stepBackward(); if (e.key === "ArrowRight") stepForward(); } };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLoaded, stepForward, stepBackward]);

    const state = history[currentStep] || {};
    useEffect(() => { if (state.edges) setEdges(state.edges); }, [state.edges]);

    const iterativeCode = [ { l: 2, c: [{ t: "ListNode *prev = ", c: "cyan" }, {t: "NULL", c: "purple"}, {t: ";", c: "light-gray"}] }, { l: 3, c: [{ t: "ListNode *current = head;", c: "cyan" }] }, { l: 5, c: [{ t: "while", c: "purple" }, {t: " (current != NULL) {", c: ""}] }, { l: 6, c: [{ t: "  ListNode *next = current->next;", c: "cyan" }] }, { l: 7, c: [{ t: "  current->next = prev;", c: "" }] }, { l: 8, c: [{ t: "  prev = current;", c: "" }] }, { l: 9, c: [{ t: "  current = next;", c: "" }] }, { l: 10, c: [{ t: "}", c: "light-gray" }] }, { l: 12, c: [{ t: "return", c: "purple" }, {t: " prev;", c: ""}] }, ];
    const recursiveCode = [ { l: 18, c: [{ t: "if", c: "purple"}, {t: " (head == NULL || head->next == NULL) {", c: ""}]}, { l: 19, c: [{ t: "  return", c: "purple"}, {t: " head;", c: ""}]}, { l: 20, c: [{ t: "}", c: "light-gray"}]}, { l: 22, c: [{ t: "ListNode* newHead = ", c: "cyan"}, {t: "reverseList(head->next);", c: ""}]}, { l: 24, c: [{ t: "head->next->next = head;", c: ""}]}, { l: 25, c: [{ t: "head->next = NULL;", c: ""}]}, { l: 27, c: [{ t: "return", c: "purple"}, {t: " newHead;", c: ""}]} ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-8"><h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Reverse a Linked List</h1><p className="text-xl text-gray-400 mt-3">Visualizing LeetCode 206</p></header>
            <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6"><div className="flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3 w-full sm:w-auto"><label className="font-mono text-sm text-gray-300 whitespace-nowrap">List Values:</label><input type="text" value={listInput} onChange={(e) => setListInput(e.target.value)} disabled={isLoaded} className="font-mono flex-grow sm:w-48 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-sky-500 focus:outline-none transition-colors" placeholder="e.g., 1,2,3,4,5" /></div><div className="flex items-center gap-3">{!isLoaded ? (<button onClick={buildAndGenerateHistory} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Load & Visualize</button>) : ( <> <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></button><span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span><button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button> </>)}<button onClick={reset} className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">Reset</button></div></div></div>
            <div className="flex border-b border-gray-700 mb-6"><div onClick={() => { setMode("iterative"); reset(); }} className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "iterative" ? "border-sky-400 text-sky-400" : "border-transparent text-gray-400"}`}>Iterative O(1) Space</div><div onClick={() => { setMode("recursive"); reset(); }} className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "recursive" ? "border-sky-400 text-sky-400" : "border-transparent text-gray-400"}`}>Recursive O(n) Space</div></div>
            {isLoaded ? (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-1 space-y-6"><div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700"><h3 className="font-bold text-2xl text-sky-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2"><Code size={22} /> C++ Solution</h3><pre className="text-sm overflow-auto"><code className="font-mono leading-relaxed">{mode === "iterative" ? iterativeCode.map((line) => <CodeLine key={line.l} line={line.l} content={line.c} colorMapping={colorMapping} activeLine={state.line} />) : recursiveCode.map((line) => <CodeLine key={line.l} line={line.l} content={line.c} colorMapping={colorMapping} activeLine={state.line}/>)}</code></pre></div><div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700"><h3 className="font-bold text-2xl text-sky-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2"><Clock size={24} /> Complexity</h3>{mode === 'iterative' ? (<div className="space-y-4"><div><h4 className="font-semibold text-sky-300 text-lg">Time: <span className="font-mono text-teal-300">O(N)</span></h4><p className="text-gray-300">We traverse the list once.</p></div><div><h4 className="font-semibold text-sky-300 text-lg">Space: <span className="font-mono text-teal-300">O(1)</span></h4><p className="text-gray-300">Only a few pointers are used.</p></div></div>) : ( <div className="space-y-4"><div><h4 className="font-semibold text-sky-300 text-lg">Time: <span className="font-mono text-teal-300">O(N)</span></h4><p className="text-gray-300">We traverse the list once.</p></div><div><h4 className="font-semibold text-sky-300 text-lg">Space: <span className="font-mono text-teal-300">O(N)</span></h4><p className="text-gray-300">Due to recursion call stack.</p></div></div> )}</div></div><div className="lg:col-span-2 space-y-6"><div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[360px] overflow-x-auto"><h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2"><GitBranch size={22} /> Linked List Visualization</h3><div id="linked-list-container" className="relative" style={{ height: "280px", width: `${nodes.length * 140 + 100}px` }}><svg id="linked-list-svg" className="w-full h-full absolute top-0 left-0">{edges.map((edge, i) => { const fromNode = nodes.find((n) => n.id === edge.from); const toNode = nodes.find((n) => n.id === edge.to); if (!fromNode || !toNode) return null; const isReversed = fromNode.x > toNode.x; const pathD = isReversed ? `M ${fromNode.x} ${fromNode.y - 28} Q ${(fromNode.x + toNode.x)/2} ${fromNode.y - 80} ${toNode.x + 100} ${toNode.y - 28}` : `M ${fromNode.x + 100} ${fromNode.y} L ${toNode.x} ${toNode.y}`; return ( <path key={`${edge.from}-${edge.to}`} d={pathD} stroke="url(#arrow-gradient)" strokeWidth="3" fill="none" markerEnd="url(#arrow)" /> ); })}<defs><linearGradient id="arrow-gradient"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker></defs></svg><div id="linked-list-nodes" className="absolute top-0 left-0 w-full h-full">{nodes.map((node) => (<div key={node.id} id={`node-${node.id}`} className="absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl font-bold transition-all duration-300 shadow-xl bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500" style={{ left: `${node.x}px`, top: `${node.y - 28}px` }}>{node.data}</div>))}<VisualizerPointer nodeId={state.prev} containerId="linked-list-container" color="red" label="prev" yOffset={-15} /><VisualizerPointer nodeId={state.current} containerId="linked-list-container" color="blue" label="current" /><VisualizerPointer nodeId={state.next} containerId="linked-list-container" color="amber" label="next" yOffset={15} /></div></div></div>{mode === 'recursive' && (<div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl"><h3 className="text-gray-300 text-sm font-semibold mb-3 flex items-center gap-2"><Repeat1 size={18} /> Recursion Call Stack</h3><div className="flex flex-wrap gap-3 min-h-[4rem] bg-gray-900/50 p-4 rounded-lg">{(state.callStack || []).length > 0 ? ((state.callStack || []).map((nodeId, i) => (<div key={i} className="bg-gradient-to-br from-purple-600 to-purple-700 w-14 h-14 flex items-center justify-center font-mono text-lg font-bold rounded-lg shadow-lg border-2 border-purple-400">{nodeId}</div>))) : (<span className="text-gray-500 italic text-sm">Call stack is empty.</span>)}</div></div>)}<div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]"><h3 className="text-gray-400 text-sm font-semibold mb-2">Step Explanation</h3><p className="text-gray-200 text-base leading-relaxed">{state.explanation || 'Click "Load & Visualize" to begin'}</p></div></div></div>) : (<div className="text-center py-12"><p className="text-gray-500">Load a linked list to begin visualization.</p></div>)}
        </div>
    );
};


// ====================================================================================
// COMPONENT 3: Main Page Component
// ====================================================================================
const LinkedListPage = ({ navigate: parentNavigate }) => {
  const [page, setPage] = useState("home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "LinkedListCycle":
        return <LinkedListCycle navigate={navigate} />;
      case "ReverseLinkedList":
        return <ReverseLinkedList navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button onClick={() => navigate("home")} className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"><ArrowLeft className="h-4 w-4" />Back to Problems</button>
            <div className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-blue-400" /><span className="text-sm font-semibold text-gray-300">Linked List</span></div>
          </div>
        </nav>
      )}
      {page === "home" && parentNavigate && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full">
            <button onClick={() => parentNavigate("home")} className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"><ArrowLeft className="h-4 w-4" />Back to Home</button>
          </div>
        </nav>
      )}
      {renderPage()}
    </PageWrapper>
  );
};

const AlgorithmList = ({ navigate }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const algorithms = [ { name: "Linked List Cycle", number: "141", icon: Infinity, description: "Determine if a given linked list contains a cycle or a loop.", page: "LinkedListCycle", difficulty: "Easy", difficultyColor: "text-green-400", difficultyBg: "bg-green-400/10", difficultyBorder: "border-green-400/30", gradient: "from-emerald-500 to-teal-500", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/20", borderColor: "border-emerald-500/30", technique: "Floyd's Cycle", timeComplexity: "O(n)", }, { name: "Reverse Linked List", number: "206", icon: Repeat, description: "Reverse a singly linked list iteratively and recursively.", page: "ReverseLinkedList", difficulty: "Easy", difficultyColor: "text-green-400", difficultyBg: "bg-green-400/10", difficultyBorder: "border-green-400/30", gradient: "from-sky-500 to-blue-500", iconColor: "text-sky-400", iconBg: "bg-sky-500/20", borderColor: "border-sky-500/30", technique: "Two Pointers", timeComplexity: "O(n)", }, ].sort((a, b) => parseInt(a.number) - parseInt(b.number));
    return (
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <header className="text-center mb-16 mt-8 relative">
          <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
          <div className="absolute top-10 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
              <div className="relative"><GitBranch className="h-14 sm:h-16 w-14 sm:w-16 text-blue-400 animated-icon" /><Zap className="h-5 w-5 text-cyan-300 absolute -top-1 -right-1 animate-pulse" /></div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 animated-gradient">Linked List</h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">Master linked list problems with <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">pointer manipulation</span> and <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">cycle detection</span></p>
            <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full border border-blue-500/30 backdrop-blur-sm"><div className="flex items-center gap-2"><Code2 className="h-3.5 w-3.5 text-blue-400" /><span className="text-xs font-medium text-gray-300">{algorithms.length} Problem{algorithms.length > 1 ? "s" : ""}</span></div></div>
              <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/30 backdrop-blur-sm"><div className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-green-400" /><span className="text-xs font-medium text-gray-300">Pointer Techniques</span></div></div>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algo, index) => {
            const isHovered = hoveredIndex === index;
            const Icon = algo.icon;
            return (
              <div key={algo.name} onClick={() => navigate(algo.page)} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="group relative cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${algo.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}><Icon className={`h-10 w-10 ${isHovered ? "text-white" : algo.iconColor} transition-colors duration-300`} /></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-gray-500">#{algo.number}</span><div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>{algo.difficulty}</div></div>
                        <h2 className={`text-xl font-bold transition-colors duration-300 ${isHovered ? "text-white" : "text-gray-200"}`}>{algo.name}</h2>
                      </div>
                    </div>
                  </div>
                  <p className={`h-14 text-sm leading-relaxed mb-5 transition-colors duration-300 ${
                    isHovered ? "text-gray-300" : "text-gray-400"
                  }`}>
                    {algo.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-blue-400" /><span className="text-xs font-medium text-gray-400">{algo.technique}</span></div>
                      <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-cyan-400" /><span className="text-xs font-mono text-gray-400">{algo.timeComplexity}</span></div>
                    </div>
                    <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}><div className="flex items-center gap-1"><span className="text-xs font-medium text-gray-400">Solve</span><ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" /></div></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm"><TrendingUp className="h-4 w-4 text-green-400" /><span className="text-sm text-gray-400">More linked list problems coming soon</span></div>
        </div>
      </div>
    );
};

const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-1/farthest-corner w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        <style>{`.animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; } @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.6)); } @keyframes float-rotate { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(120deg); } 66% { transform: translateY(-4px) rotate(240deg); } } .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; } .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; animation-delay: 2s; } @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } } .animate-float { animation: float 20s ease-in-out infinite; } .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: 10s; } @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.1); } }`}</style>
        <div className="relative z-10">{children}</div>
    </div>
);

export default LinkedListPage;

