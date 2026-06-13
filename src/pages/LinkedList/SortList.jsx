import {
  ArrowUp,
  GitBranch,
  Merge,
  Rabbit,
  Split,
  Turtle
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
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
        {label === "slow" && <Turtle size={20} />}
        {label === "fast" && <Rabbit size={20} />}
        {label === "left" && <Split size={20} />}
        {label === "right" && <Split size={20} />}
        {label === "current" && <Merge size={20} />}
        <span>{label}</span>
      </div>
      <ArrowUp className={`w-6 h-6 mx-auto ${colorClasses[color]}`} />
    </div>
  );
};

// Main Visualizer Component
const SortList = () => {
  const [mode, setMode] = useState("merge-sort");
  const [listInput, setListInput] = useState("4,2,1,3");

  const visualizerState = useVisualizer();
  const {
    currentState,
    isLoaded,
    load,
    setCurrentStep,
  } = visualizerState;

  const generateMergeSortHistory = (initialNodes) => {
    const newHistory = [];
    let stepCounter = 0;

    const addState = (props) => {
      newHistory.push({
        step: stepCounter++,
        explanation: "",
        ...props,
      });
    };

    // Initial state - show unsorted list
    addState({
      line: 1,
      explanation: "Starting merge sort on the entire linked list",
      nodes: [...initialNodes],
      left: null,
      right: null,
      mid: null,
      current: null,
      sorted: false,
    });

    const mergeSort = (nodes, depth = 0, side = "full") => {
      if (nodes.length <= 1) {
        addState({
          line: 4,
          explanation: `Base case reached: list with ${nodes.length} element(s) is already sorted`,
          nodes: [...initialNodes],
          current: nodes[0]?.id || null,
          subList: nodes.map(n => n.id),
          depth,
          side,
          returning: true,
        });
        return nodes;
      }

      // Find middle using slow and fast pointers
      let slow = 0;
      let fast = 0;

      addState({
        line: 9,
        explanation: "Finding middle of the list using slow and fast pointers",
        nodes: [...initialNodes],
        slow: nodes[slow]?.id || null,
        fast: nodes[fast]?.id || null,
        depth,
        side,
      });

      while (fast + 2 < nodes.length) {
        slow++;
        fast += 2;
        addState({
          line: 11,
          explanation: `Slow pointer at position ${slow}, Fast pointer at position ${fast}`,
          nodes: [...initialNodes],
          slow: nodes[slow]?.id || null,
          fast: nodes[fast]?.id || null,
          depth,
          side,
        });
      }

      const mid = slow + 1;
      const left = nodes.slice(0, mid);
      const right = nodes.slice(mid);

      addState({
        line: 15,
        explanation: `Splitting list at position ${mid}. Left: [${left.map(n => n.data)}], Right: [${right.map(n => n.data)}]`,
        nodes: [...initialNodes],
        left: left[0]?.id || null,
        right: right[0]?.id || null,
        mid: nodes[mid]?.id || null,
        subList: nodes.map(n => n.id),
        depth,
        side,
        splitting: true,
      });

      // Recursively sort both halves
      addState({
        line: 17,
        explanation: `Recursively sorting left half: [${left.map(n => n.data)}]`,
        nodes: [...initialNodes],
        left: left[0]?.id || null,
        right: null,
        depth: depth + 1,
        side: "left",
      });

      const sortedLeft = mergeSort(left, depth + 1, "left");

      addState({
        line: 18,
        explanation: `Recursively sorting right half: [${right.map(n => n.data)}]`,
        nodes: [...initialNodes],
        left: null,
        right: right[0]?.id || null,
        depth: depth + 1,
        side: "right",
      });

      const sortedRight = mergeSort(right, depth + 1, "right");

      // Merge sorted halves
      addState({
        line: 21,
        explanation: `Merging sorted halves: [${sortedLeft.map(n => n.data)}] and [${sortedRight.map(n => n.data)}]`,
        nodes: [...initialNodes],
        left: sortedLeft[0]?.id || null,
        right: sortedRight[0]?.id || null,
        current: null,
        depth,
        side,
        merging: true,
      });

      const merged = [];
      let i = 0, j = 0;

      while (i < sortedLeft.length && j < sortedRight.length) {
        if (sortedLeft[i].data <= sortedRight[j].data) {
          merged.push({ ...sortedLeft[i] });
          addState({
            line: 26,
            explanation: `Adding ${sortedLeft[i].data} from left list to merged result`,
            nodes: updateNodesWithNewOrder(initialNodes, merged, sortedLeft, sortedRight, i, j),
            left: sortedLeft[i]?.id || null,
            right: sortedRight[j]?.id || null,
            current: sortedLeft[i].id,
            depth,
            side,
            merging: true,
          });
          i++;
        } else {
          merged.push({ ...sortedRight[j] });
          addState({
            line: 29,
            explanation: `Adding ${sortedRight[j].data} from right list to merged result`,
            nodes: updateNodesWithNewOrder(initialNodes, merged, sortedLeft, sortedRight, i, j),
            left: sortedLeft[i]?.id || null,
            right: sortedRight[j]?.id || null,
            current: sortedRight[j].id,
            depth,
            side,
            merging: true,
          });
          j++;
        }
      }

      // Add remaining elements
      while (i < sortedLeft.length) {
        merged.push({ ...sortedLeft[i] });
        addState({
          line: 35,
          explanation: `Adding remaining element ${sortedLeft[i].data} from left list`,
          nodes: updateNodesWithNewOrder(initialNodes, merged, sortedLeft, sortedRight, i, j),
          left: sortedLeft[i]?.id || null,
          right: null,
          current: sortedLeft[i].id,
          depth,
          side,
          merging: true,
        });
        i++;
      }

      while (j < sortedRight.length) {
        merged.push({ ...sortedRight[j] });
        addState({
          line: 39,
          explanation: `Adding remaining element ${sortedRight[j].data} from right list`,
          nodes: updateNodesWithNewOrder(initialNodes, merged, sortedLeft, sortedRight, i, j),
          left: null,
          right: sortedRight[j]?.id || null,
          current: sortedRight[j].id,
          depth,
          side,
          merging: true,
        });
        j++;
      }

      // Update the next pointers for the merged list
      for (let k = 0; k < merged.length - 1; k++) {
        merged[k].next = merged[k + 1].id;
      }
      if (merged.length > 0) {
        merged[merged.length - 1].next = null;
      }

      addState({
        line: 42,
        explanation: `Successfully merged: [${merged.map(n => n.data)}]`,
        nodes: updateNodesWithNewOrder(initialNodes, merged, [], [], 0, 0),
        left: null,
        right: null,
        current: merged[0]?.id || null,
        subList: merged.map(n => n.id),
        depth,
        side,
        merged: true,
      });

      return merged;
    };

    const updateNodesWithNewOrder = (originalNodes, merged, left, right, i, j) => {
      const updatedNodes = [...originalNodes];
      const mergedValues = [
        ...merged,
        ...left.slice(i),
        ...right.slice(j)
      ];

      mergedValues.forEach((node) => {
        const originalNode = updatedNodes.find(n => n.id === node.id);
        if (originalNode) {
          originalNode.data = node.data;
        }
      });

      return updatedNodes;
    };

    const sortedNodes = mergeSort([...initialNodes]);

    const finalNodes = sortedNodes.map((node, index) => ({
      ...node,
      x: 80 + index * 140,
      next: index < sortedNodes.length - 1 ? sortedNodes[index + 1].id : null
    }));

    addState({
      line: 45,
      explanation: "Merge sort completed! The list is now fully sorted in ascending order",
      nodes: finalNodes,
      left: null,
      right: null,
      current: null,
      sorted: true,
      finished: true,
    });

    return newHistory;
  };

  const generateBubbleSortHistory = (initialNodes) => {
    const newHistory = [];
    let stepCounter = 0;
    let nodes = [...initialNodes];

    const addState = (props) => {
      newHistory.push({
        step: stepCounter++,
        explanation: "",
        ...props,
      });
    };

    addState({
      line: 1,
      explanation: "Starting bubble sort on the linked list",
      nodes: [...nodes],
      current: null,
      comparing: null,
      swapped: false,
    });

    let n = nodes.length;
    let swapped;

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      addState({
        line: 4,
        explanation: `Outer loop iteration ${i + 1}/${n - 1}`,
        nodes: [...nodes],
        current: null,
        comparing: null,
        pass: i + 1,
      });

      for (let j = 0; j < n - i - 1; j++) {
        addState({
          line: 7,
          explanation: `Comparing nodes at positions ${j} and ${j + 1}: ${nodes[j].data} and ${nodes[j + 1].data}`,
          nodes: [...nodes],
          current: nodes[j].id,
          comparing: nodes[j + 1].id,
          comparingValues: true,
        });

        if (nodes[j].data > nodes[j + 1].data) {
          [nodes[j].data, nodes[j + 1].data] = [nodes[j + 1].data, nodes[j].data];

          addState({
            line: 9,
            explanation: `Swapped values: ${nodes[j + 1].data} and ${nodes[j].data}`,
            nodes: [...nodes],
            current: nodes[j].id,
            comparing: nodes[j + 1].id,
            swapped: true,
          });
          swapped = true;
        } else {
          addState({
            line: 12,
            explanation: `No swap needed - ${nodes[j].data} <= ${nodes[j + 1].data}`,
            nodes: [...nodes],
            current: nodes[j].id,
            comparing: nodes[j + 1].id,
            swapped: false,
          });
        }
      }

      if (!swapped) {
        addState({
          line: 15,
          explanation: "No swaps in this pass - list is already sorted",
          nodes: [...nodes],
          current: null,
          comparing: null,
          finished: true,
          sorted: true,
        });
        break;
      }

      if (i < n - 2) {
        addState({
          line: 14,
          explanation: `Pass ${i + 1} completed. ${i + 1} largest element(s) are in their final positions`,
          nodes: [...nodes],
          current: null,
          comparing: null,
          passComplete: true,
        });
      }
    }

    addState({
      line: 15,
      explanation: "Bubble sort completed! The list is now fully sorted in ascending order",
      nodes: [...nodes],
      current: null,
      comparing: null,
      finished: true,
      sorted: true,
    });

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

    const newNodes = data.map((d, i) => ({
      id: i,
      data: d,
      next: i + 1 < data.length ? i + 1 : null,
      x: 80 + i * 140,
      y: 200,
    }));

    const newHistory = mode === "merge-sort"
      ? generateMergeSortHistory(newNodes)
      : generateBubbleSortHistory(newNodes);

    if (newHistory) {
      load(newHistory);
    }
  };

  const parseInput = useCallback(() => {
    if (!currentState.nodes || currentState.nodes.length === 0) throw new Error("No list loaded");
    return currentState.nodes;
  }, [currentState.nodes]);

  const handleModeChange = useModeHistorySwitch({
    mode,
    setMode,
    isLoaded,
    parseInput,
    generators: {
      "merge-sort": (n) => load(generateMergeSortHistory(n)),
      "bubble-sort": (n) => load(generateBubbleSortHistory(n)),
    },
    setCurrentStep,
    onError: () => { },
  });

  const mergeSortCodeContent = {
    1: "ListNode* mergeSort(ListNode* head) {",
    2: "  if (!head || !head->next) return head;",
    4: "  ListNode* slow = head, *fast = head->next;",
    5: "  while (fast && fast->next) {",
    6: "    slow = slow->next;",
    7: "    fast = fast->next->next;",
    8: "  }",
    10: "  ListNode* mid = slow->next;",
    11: "  slow->next = nullptr;",
    13: "  ListNode* left = mergeSort(head);",
    14: "  ListNode* right = mergeSort(mid);",
    16: "  return merge(left, right);",
    17: "}"
  };

  const bubbleSortCodeContent = {
    1: "void bubbleSort(ListNode* head) {",
    2: "  if (!head) return;",
    3: "  bool swapped = true;",
    4: "  while (swapped) {",
    5: "    swapped = false;",
    6: "    ListNode* current = head;",
    7: "    while (current->next) {",
    8: "      if (current->val > current->next->val) {",
    9: "        swap(current->val, current->next->val);",
    10: "        swapped = true;",
    11: "      }",
    12: "      current = current->next;",
    13: "    }",
    14: "  }",
    15: "}"
  };

  const codeContent = mode === "merge-sort" ? mergeSortCodeContent : bubbleSortCodeContent;

  const currentEdges = [];
  if (currentState.nodes && currentState.nodes.length > 0) {
    currentState.nodes.forEach((node) => {
      if (node.next !== null && currentState.nodes.find(n => n.id === node.next)) {
        currentEdges.push({ from: node.id, to: node.next, isCycle: false });
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
          placeholder="e.g. 4,2,1,3"
        />
      </div>
      <div className="flex bg-gray-950/40 p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => handleModeChange("merge-sort")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            mode === "merge-sort"
              ? "bg-cyan-500 text-gray-955 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Merge Sort
        </button>
        <button
          onClick={() => handleModeChange("bubble-sort")}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
            mode === "bubble-sort"
              ? "bg-cyan-500 text-gray-955 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Bubble Sort
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
        <p className="text-xl font-bold text-cyan-300 font-mono">
          {mode === "merge-sort" ? "O(N log N)" : "O(N²)"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {mode === "merge-sort"
            ? "Divides recursively (log N levels) and merges in linear time. Consistent performance."
            : "Nested loops compare and swap elements. Best case O(N) when already sorted."}
        </p>
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Space Complexity</h4>
        <p className="text-xl font-bold text-teal-300 font-mono">
          {mode === "merge-sort" ? "O(log N)" : "O(1)"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {mode === "merge-sort"
            ? "O(log N) stack space due to recursion depth. Can be O(1) extra space."
            : "In-place sorting algorithm. Only requires constant extra memory."}
        </p>
      </div>
      <div
        className={`p-4 rounded-2xl border transition-all shadow-2xl ${
          currentState.finished
            ? "bg-green-950/30 border-green-500/50 text-green-300"
            : currentState.sorted
            ? "bg-yellow-950/30 border-yellow-500/50 text-yellow-300"
            : "bg-gray-900/50 border-gray-700/60 text-gray-400"
        }`}
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2">Sorting Status</h4>
        <p className="text-xl font-bold font-mono">
          {currentState.finished
            ? "✓ Fully Sorted"
            : currentState.sorted
            ? "↻ Partially Sorted"
            : "Processing..."}
        </p>
        <p className="text-xs opacity-80 mt-1">
          {currentState.finished
            ? "All elements are in sorted order."
            : currentState.sorted
            ? "A sublist or pass has been sorted."
            : "Sorting in progress..."}
        </p>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Linked List Sort"
      description="Visualizing Sorting Algorithms on Linked Lists (LeetCode 148)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={currentState.line}
      message={currentState.explanation}
      visualizerState={visualizerState}
      statsSection={statsSection}
    >
      {isLoaded && currentState.nodes && currentState.nodes.length > 0 && (
        <div className="w-full overflow-x-auto py-4 flex justify-center">
          <div
            className="relative"
            style={{
              height: "280px",
              width: `${currentState.nodes.length * 140 + 100}px`,
            }}
          >
            <svg
              id="linked-list-svg"
              className="w-full h-full absolute top-0 left-0"
            >
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
                  markerWidth="8"
                  markerHeight="8"
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
              {currentState.nodes.map((node, index) => {
                const isActive =
                  currentState.current === node.id ||
                  currentState.slow === node.id ||
                  currentState.fast === node.id ||
                  currentState.left === node.id ||
                  currentState.right === node.id ||
                  currentState.comparing === node.id;

                const isCurrent = currentState.current === node.id;
                const isSlow = currentState.slow === node.id;
                const isFast = currentState.fast === node.id;
                const isLeft = currentState.left === node.id;
                const isRight = currentState.right === node.id;
                const isComparing = currentState.comparing === node.id;

                return (
                  <div
                    key={node.id}
                    id={`node-${node.id}`}
                    className={`absolute w-24 h-14 flex items-center justify-center rounded-xl font-mono text-xl font-bold transition-all duration-300 shadow-xl ${isActive
                        ? isCurrent
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 border-3 border-blue-300 scale-110"
                          : isSlow
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 border-3 border-green-300 scale-110"
                            : isFast
                              ? "bg-gradient-to-br from-red-500 to-rose-600 border-3 border-red-300 scale-110"
                              : isLeft
                                ? "bg-gradient-to-br from-purple-500 to-purple-600 border-3 border-purple-300 scale-110"
                                : isRight
                                  ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-3 border-cyan-300 scale-110"
                                  : isComparing
                                    ? "bg-gradient-to-br from-orange-500 to-orange-600 border-3 border-orange-300 scale-110"
                                    : "bg-gradient-to-br from-sky-500 to-blue-600 border-3 border-sky-300 scale-110"
                        : "bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-gray-500"
                      } ${currentState.finished ? "animate-pulse" : ""}`}
                    style={{
                      left: `${80 + index * 140}px`,
                      top: `${node.y - 28}px`,
                      transition: "left 0.5s ease-in-out"
                    }}
                  >
                    {node.data}
                  </div>
                );
              })}
              {mode === "merge-sort" && (
                <>
                  <VisualizerPointer
                    nodeId={currentState.slow}
                    containerId="linked-list-container"
                    color="green"
                    label="slow"
                    yOffset={-20}
                  />
                  <VisualizerPointer
                    nodeId={currentState.fast}
                    containerId="linked-list-container"
                    color="red"
                    label="fast"
                    yOffset={20}
                  />
                  <VisualizerPointer
                    nodeId={currentState.left}
                    containerId="linked-list-container"
                    color="purple"
                    label="left"
                    yOffset={-15}
                  />
                  <VisualizerPointer
                    nodeId={currentState.right}
                    containerId="linked-list-container"
                    color="cyan"
                    label="right"
                    yOffset={15}
                  />
                  <VisualizerPointer
                    nodeId={currentState.current}
                    containerId="linked-list-container"
                    color="blue"
                    label="current"
                    yOffset={0}
                  />
                </>
              )}
              {mode === "bubble-sort" && (
                <>
                  <VisualizerPointer
                    nodeId={currentState.current}
                    containerId="linked-list-container"
                    color="blue"
                    label="current"
                    yOffset={-15}
                  />
                  <VisualizerPointer
                    nodeId={currentState.comparing}
                    containerId="linked-list-container"
                    color="amber"
                    label="comparing"
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

export default SortList;