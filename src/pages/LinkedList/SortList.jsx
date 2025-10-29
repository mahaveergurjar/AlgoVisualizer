import {
    ArrowUp,
    CheckCircle,
    Clock,
    Code,
    GitBranch,
    Merge,
    Rabbit,
    Split,
    Turtle
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";

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
        if (nodeId === null) {
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
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [listInput, setListInput] = useState("4,2,1,3");
    const [isLoaded, setIsLoaded] = useState(false);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

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

        const newEdges = [];
        newNodes.forEach((node, i) => {
            if (node.next !== null) {
                newEdges.push({ from: i, to: node.next, isCycle: false });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);

        if (mode === "merge-sort") {
            generateMergeSortHistory(newNodes);
        } else if (mode === "bubble-sort") {
            generateBubbleSortHistory(newNodes);
        }
        setIsLoaded(true);
    };

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
            // Create a copy of original nodes
            const updatedNodes = [...originalNodes];

            // Update the data values based on merged order
            const mergedValues = [
                ...merged,
                ...left.slice(i),
                ...right.slice(j)
            ];

            // Update node data to reflect current merged state
            mergedValues.forEach((node, index) => {
                const originalNode = updatedNodes.find(n => n.id === node.id);
                if (originalNode) {
                    originalNode.data = node.data;
                }
            });

            return updatedNodes;
        };

        const sortedNodes = mergeSort([...initialNodes]);

        // Final sorted state with correct order
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

        setHistory(newHistory);
        setCurrentStep(0);
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
                    // Swap data values (not the actual nodes, to maintain IDs)
                    [nodes[j].data, nodes[j + 1].data] = [nodes[j + 1].data, nodes[j].data];

                    addState({
                        line: 11,
                        explanation: `Swapped values: ${nodes[j + 1].data} and ${nodes[j].data}`,
                        nodes: [...nodes],
                        current: nodes[j].id,
                        comparing: nodes[j + 1].id,
                        swapped: true,
                    });
                    swapped = true;
                } else {
                    addState({
                        line: 13,
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
                    line: 17,
                    explanation: "No swaps in this pass - list is already sorted",
                    nodes: [...nodes],
                    current: null,
                    comparing: null,
                    finished: true,
                    sorted: true,
                });
                break;
            }

            // Show progress after each pass
            if (i < n - 2) {
                addState({
                    line: 19,
                    explanation: `Pass ${i + 1} completed. ${i + 1} largest element(s) are in their final positions`,
                    nodes: [...nodes],
                    current: null,
                    comparing: null,
                    passComplete: true,
                });
            }
        }

        // Final sorted state
        addState({
            line: 20,
            explanation: "Bubble sort completed! The list is now fully sorted in ascending order",
            nodes: [...nodes],
            current: null,
            comparing: null,
            finished: true,
            sorted: true,
        });

        setHistory(newHistory);
        setCurrentStep(0);
    };

    const reset = () => {
        setIsLoaded(false);
        setHistory([]);
        setCurrentStep(-1);
        setNodes([]);
        setEdges([]);
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
            "merge-sort": (n) => generateMergeSortHistory(n),
            "bubble-sort": (n) => generateBubbleSortHistory(n),
        },
        setCurrentStep,
        onError: () => { },
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
            className={`block rounded-md transition-colors px-2 py-1 ${state.line === line ? "bg-sky-500/20 border-l-4 border-sky-400" : ""
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

    const mergeSortCode = [
        {
            l: 1,
            c: [
                { t: "ListNode*", c: "cyan" },
                { t: " mergeSort(", c: "" },
                { t: "ListNode*", c: "cyan" },
                { t: " head) {", c: "" },
            ],
        },
        {
            l: 2,
            c: [
                { t: "  if", c: "purple" },
                { t: " (!head || !head->next) ", c: "" },
                { t: "return", c: "purple" },
                { t: " head;", c: "" },
            ],
        },
        { l: 3, c: [{ t: "", c: "" }] },
        {
            l: 4,
            c: [
                { t: "  ", c: "" },
                { t: "ListNode", c: "cyan" },
                { t: "* slow = head, *fast = head->next;", c: "" },
            ],
        },
        {
            l: 5,
            c: [
                { t: "  while", c: "purple" },
                { t: " (fast && fast->next) {", c: "" },
            ],
        },
        {
            l: 6,
            c: [
                { t: "    slow = slow->next;", c: "" },
            ],
        },
        {
            l: 7,
            c: [
                { t: "    fast = fast->next->next;", c: "" },
            ],
        },
        {
            l: 8,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        { l: 9, c: [{ t: "", c: "" }] },
        {
            l: 10,
            c: [
                { t: "  ", c: "" },
                { t: "ListNode", c: "cyan" },
                { t: "* mid = slow->next;", c: "" },
            ],
        },
        {
            l: 11,
            c: [
                { t: "  slow->next = nullptr;", c: "" },
            ],
        },
        { l: 12, c: [{ t: "", c: "" }] },
        {
            l: 13,
            c: [
                { t: "  ", c: "" },
                { t: "ListNode", c: "cyan" },
                { t: "* left = mergeSort(head);", c: "" },
            ],
        },
        {
            l: 14,
            c: [
                { t: "  ", c: "" },
                { t: "ListNode", c: "cyan" },
                { t: "* right = mergeSort(mid);", c: "" },
            ],
        },
        { l: 15, c: [{ t: "", c: "" }] },
        {
            l: 16,
            c: [
                { t: "  ", c: "" },
                { t: "return", c: "purple" },
                { t: " merge(left, right);", c: "" },
            ],
        },
        {
            l: 17,
            c: [
                { t: "}", c: "light-gray" },
            ],
        },
    ];

    const bubbleSortCode = [
        {
            l: 1,
            c: [
                { t: "void", c: "cyan" },
                { t: " bubbleSort(", c: "" },
                { t: "ListNode*", c: "cyan" },
                { t: " head) {", c: "" },
            ],
        },
        {
            l: 2,
            c: [
                { t: "  if", c: "purple" },
                { t: " (!head) ", c: "" },
                { t: "return", c: "purple" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 3,
            c: [
                { t: "  ", c: "" },
                { t: "bool", c: "cyan" },
                { t: " swapped = true;", c: "" },
            ],
        },
        {
            l: 4,
            c: [
                { t: "  while", c: "purple" },
                { t: " (swapped) {", c: "" },
            ],
        },
        {
            l: 5,
            c: [
                { t: "    swapped = false;", c: "" },
            ],
        },
        {
            l: 6,
            c: [
                { t: "    ", c: "" },
                { t: "ListNode", c: "cyan" },
                { t: "* current = head;", c: "" },
            ],
        },
        {
            l: 7,
            c: [
                { t: "    while", c: "purple" },
                { t: " (current->next) {", c: "" },
            ],
        },
        {
            l: 8,
            c: [
                { t: "      if", c: "purple" },
                { t: " (current->val > current->next->val) {", c: "" },
            ],
        },
        {
            l: 9,
            c: [
                { t: "        swap(current->val, current->next->val);", c: "" },
            ],
        },
        {
            l: 10,
            c: [
                { t: "        swapped = true;", c: "" },
            ],
        },
        {
            l: 11,
            c: [
                { t: "      }", c: "light-gray" },
            ],
        },
        {
            l: 12,
            c: [
                { t: "      current = current->next;", c: "" },
            ],
        },
        {
            l: 13,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 14,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 15,
            c: [
                { t: "}", c: "light-gray" },
            ],
        },
    ];

    // Update edges based on current node state
    const currentEdges = [];
    if (state.nodes && state.nodes.length > 0) {
        state.nodes.forEach((node, i) => {
            if (node.next !== null && state.nodes.find(n => n.id === node.next)) {
                currentEdges.push({ from: node.id, to: node.next, isCycle: false });
            }
        });
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    Linked List Sort Visualization
                </h1>
                <p className="text-xl text-gray-400 mt-3">Visualizing Sorting Algorithms on Linked Lists</p>
            </header>

            <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                                List Values:
                            </label>
                            <input
                                type="text"
                                value={listInput}
                                onChange={(e) => setListInput(e.target.value)}
                                disabled={isLoaded}
                                className="font-mono flex-grow sm:w-48 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
                                placeholder="e.g., 4,2,1,3"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isLoaded ? (
                            <button
                                onClick={buildAndGenerateHistory}
                                className="bg-gradient-to-r from-sky-500 to-blue-600 cursor-pointer hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                            >
                                Load & Visualize
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={stepBackward}
                                    disabled={currentStep <= 0}
                                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                                            strokeWidth={2}
                                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                                    {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                                </span>
                                <button
                                    onClick={stepForward}
                                    disabled={currentStep >= history.length - 1}
                                    className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                                            strokeWidth={2}
                                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}
                        <button
                            onClick={reset}
                            className="bg-red-600 hover:bg-red-700 font-bold py-3 cursor-pointer px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-gray-700 mb-6">
                <div
                    onClick={() => handleModeChange("merge-sort")}
                    className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "merge-sort"
                            ? "border-sky-400 text-sky-400"
                            : "border-transparent text-gray-400"
                        }`}
                >
                    Merge Sort
                </div>
                <div
                    onClick={() => handleModeChange("bubble-sort")}
                    className={`cursor-pointer p-3 px-6 border-b-4 transition-all ${mode === "bubble-sort"
                            ? "border-sky-400 text-sky-400"
                            : "border-transparent text-gray-400"
                        }`}
                >
                    Bubble Sort
                </div>
            </div>

            {isLoaded ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
                        <h3 className="font-bold text-2xl text-sky-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                            <Code size={22} />
                            C++ Solution
                        </h3>
                        <pre className="text-sm overflow-auto max-h-96">
                            <code className="font-mono leading-relaxed">
                                {mode === "merge-sort"
                                    ? mergeSortCode.map((line) => (
                                        <CodeLine key={line.l} line={line.l} content={line.c} />
                                    ))
                                    : bubbleSortCode.map((line) => (
                                        <CodeLine key={line.l} line={line.l} content={line.c} />
                                    ))}
                            </code>
                        </pre>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[360px] overflow-x-auto">
                            <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2">
                                <GitBranch size={22} />
                                Linked List Visualization
                            </h3>
                            <div
                                className="relative"
                                style={{
                                    height: "280px",
                                    width: `${Math.max(nodes.length, state.nodes?.length || 0) * 140 + 100}px`,
                                }}
                            >
                                <svg
                                    id="linked-list-svg"
                                    className="w-full h-full absolute top-0 left-0"
                                >
                                    {currentEdges.map((edge, i) => {
                                        const fromNode = state.nodes?.find((n) => n.id === edge.from);
                                        const toNode = state.nodes?.find((n) => n.id === edge.to);
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
                                    {state.nodes?.map((node, index) => {
                                        const isActive =
                                            state.current === node.id ||
                                            state.slow === node.id ||
                                            state.fast === node.id ||
                                            state.left === node.id ||
                                            state.right === node.id ||
                                            state.comparing === node.id;

                                        const isCurrent = state.current === node.id;
                                        const isSlow = state.slow === node.id;
                                        const isFast = state.fast === node.id;
                                        const isLeft = state.left === node.id;
                                        const isRight = state.right === node.id;
                                        const isComparing = state.comparing === node.id;

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
                                                    } ${state.finished ? "animate-pulse" : ""}`}
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
                                                nodeId={state.slow}
                                                containerId="linked-list-container"
                                                color="green"
                                                label="slow"
                                                yOffset={-20}
                                            />
                                            <VisualizerPointer
                                                nodeId={state.fast}
                                                containerId="linked-list-container"
                                                color="red"
                                                label="fast"
                                                yOffset={20}
                                            />
                                            <VisualizerPointer
                                                nodeId={state.left}
                                                containerId="linked-list-container"
                                                color="purple"
                                                label="left"
                                                yOffset={-15}
                                            />
                                            <VisualizerPointer
                                                nodeId={state.right}
                                                containerId="linked-list-container"
                                                color="cyan"
                                                label="right"
                                                yOffset={15}
                                            />
                                            <VisualizerPointer
                                                nodeId={state.current}
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
                                                nodeId={state.current}
                                                containerId="linked-list-container"
                                                color="blue"
                                                label="current"
                                                yOffset={-15}
                                            />
                                            <VisualizerPointer
                                                nodeId={state.comparing}
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

                        <div
                            className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${state.finished
                                    ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500"
                                    : state.sorted
                                        ? "bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-500"
                                        : "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700"
                                }`}
                        >
                            <h3
                                className={`text-sm font-semibold flex items-center gap-2 mb-2 ${state.finished
                                        ? "text-green-300"
                                        : state.sorted
                                            ? "text-yellow-300"
                                            : "text-gray-400"
                                    }`}
                            >
                                <CheckCircle size={18} />
                                Sorting Status
                            </h3>
                            <p
                                className={`font-mono text-4xl font-bold ${state.finished
                                        ? "text-green-400"
                                        : state.sorted
                                            ? "text-yellow-400"
                                            : "text-gray-400"
                                    }`}
                            >
                                {state.finished
                                    ? "✓ Fully Sorted"
                                    : state.sorted
                                        ? "↻ Partially Sorted"
                                        : "Processing..."}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
                            <h3 className="text-gray-400 text-sm font-semibold mb-2">
                                Step Explanation
                            </h3>
                            <p className="text-gray-200 text-base leading-relaxed">
                                {state.explanation || 'Click "Load & Visualize" to begin'}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
                        <h3 className="font-bold text-2xl text-sky-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
                            <Clock size={24} />
                            Complexity Analysis
                        </h3>
                        {mode === "merge-sort" ? (
                            <div className="space-y-5 text-base">
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-sky-300 text-lg mb-2">
                                        Time Complexity:{" "}
                                        <span className="font-mono text-teal-300">O(N log N)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        Merge sort divides the list into halves recursively (log N divisions)
                                        and then merges them in linear time. Each level of recursion processes
                                        all N elements, resulting in O(N log N) time complexity in all cases (best, average, worst).
                                    </p>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-sky-300 text-lg mb-2">
                                        Space Complexity:{" "}
                                        <span className="font-mono text-teal-300">O(log N)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        The space complexity is O(log N) due to the recursion stack depth.
                                        For linked list implementation, we can achieve O(1) extra space
                                        by rearranging pointers instead of creating new arrays.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 text-base">
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-sky-300 text-lg mb-2">
                                        Time Complexity:{" "}
                                        <span className="font-mono text-teal-300">O(N²)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        In the worst and average cases, bubble sort makes O(N²) comparisons and swaps.
                                        In the best case (already sorted), it makes O(N) comparisons with O(1) swaps,
                                        but we still consider it O(N²) due to the nested loop structure.
                                    </p>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-xl">
                                    <h4 className="font-semibold text-sky-300 text-lg mb-2">
                                        Space Complexity:{" "}
                                        <span className="font-mono text-teal-300">O(1)</span>
                                    </h4>
                                    <p className="text-gray-300">
                                        Bubble sort is an in-place sorting algorithm that only requires
                                        a constant amount of additional memory for temporary variables
                                        during swaps, regardless of the input size.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        Load a linked list to begin visualization.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SortList;