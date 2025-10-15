import React, { useState, useEffect, useCallback } from "react";
import { useModeHistorySwitch } from "../../hooks/useModeHistorySwitch";
import {
  Code,
  Clock,
  Hash,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Search,
} from "lucide-react";

const DesignLinkedList = () => {
    const [mode, setMode] = useState("optimal");
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [operationsInput, setOperationsInput] = useState(
        `MyLinkedList()\naddAtHead(1)\naddAtTail(3)\naddAtIndex(1,2)\nget(1)\ndeleteAtIndex(1)\nget(1)`
    );
    const [isLoaded, setIsLoaded] = useState(false);

    const parseOperations = (input) => {
        const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);
        const commands = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Parse different operations
            const addAtHeadMatch = line.match(/addAtHead\((\d+)\)/);
            const addAtTailMatch = line.match(/addAtTail\((\d+)\)/);
            const addAtIndexMatch = line.match(/addAtIndex\((\d+),(\d+)\)/);
            const getMatch = line.match(/get\((\d+)\)/);
            const deleteAtIndexMatch = line.match(/deleteAtIndex\((\d+)\)/);
            
            if (addAtHeadMatch) {
                commands.push({ op: "addAtHead", value: parseInt(addAtHeadMatch[1], 10) });
            } else if (addAtTailMatch) {
                commands.push({ op: "addAtTail", value: parseInt(addAtTailMatch[1], 10) });
            } else if (addAtIndexMatch) {
                commands.push({ 
                    op: "addAtIndex", 
                    index: parseInt(addAtIndexMatch[1], 10),
                    value: parseInt(addAtIndexMatch[2], 10) 
                });
            } else if (getMatch) {
                commands.push({ op: "get", index: parseInt(getMatch[1], 10) });
            } else if (deleteAtIndexMatch) {
                commands.push({ op: "deleteAtIndex", index: parseInt(deleteAtIndexMatch[1], 10) });
            }
        }
        return { commands };
    };

    const generateOptimalHistory = useCallback((commands) => {
        const newHistory = [];
        let outputLog = [];
        let linkedList = [];

        const addState = (props) => {
            newHistory.push({ 
                outputLog: [...outputLog], 
                explanation: "", 
                linkedList: [...linkedList],
                ...props 
            });
        };

        addState({ 
            line: 5,
            commandIndex: -1,
            explanation: "Initialize an empty linked list with head pointer set to nullptr.",
            linkedList: []
        });

        commands.forEach((command, commandIndex) => {
            if (command.op === "addAtHead") {
                outputLog.push(`addAtHead(${command.value})`);
                addState({
                    line: 15,
                    commandIndex,
                    explanation: `addAtHead(${command.value}): Create new node and set it as head.`,
                    linkedList: [command.value, ...linkedList]
                });
            } else if (command.op === "addAtTail") {
                outputLog.push(`addAtTail(${command.value})`);
                addState({
                    line: 20,
                    commandIndex,
                    explanation: `addAtTail(${command.value}): Traverse to end and append new node.`,
                    linkedList: [...linkedList, command.value]
                });
            } else if (command.op === "addAtIndex") {
                outputLog.push(`addAtIndex(${command.index}, ${command.value})`);
                if (command.index === 0) {
                    addState({
                        line: 15,
                        commandIndex,
                        explanation: `addAtIndex(${command.index}, ${command.value}): Insert at head position.`,
                        linkedList: [command.value, ...linkedList]
                    });
                } else if (command.index <= linkedList.length) {
                    const newList = [...linkedList];
                    newList.splice(command.index, 0, command.value);
                    addState({
                        line: 25,
                        commandIndex,
                        explanation: `addAtIndex(${command.index}, ${command.value}): Insert at position ${command.index}.`,
                        linkedList: newList
                    });
                } else {
                    addState({
                        line: 25,
                        commandIndex,
                        explanation: `Cannot add at index ${command.index} - index out of bounds.`,
                        linkedList: [...linkedList]
                    });
                }
            } else if (command.op === "get") {
                outputLog.push(`get(${command.index})`);
                if (command.index >= 0 && command.index < linkedList.length) {
                    const value = linkedList[command.index];
                    addState({
                        line: 9,
                        commandIndex,
                        explanation: `get(${command.index}): Traverse to index ${command.index}, return ${value}.`,
                        linkedList: [...linkedList],
                        highlightedIndex: command.index
                    });
                } else {
                    addState({
                        line: 10,
                        commandIndex,
                        explanation: `get(${command.index}): Index out of bounds, return -1.`,
                        linkedList: [...linkedList]
                    });
                }
            } else if (command.op === "deleteAtIndex") {
                outputLog.push(`deleteAtIndex(${command.index})`);
                if (command.index >= 0 && command.index < linkedList.length) {
                    const deletedValue = linkedList[command.index];
                    const newList = [...linkedList];
                    newList.splice(command.index, 1);
                    addState({
                        line: 30,
                        commandIndex,
                        explanation: `deleteAtIndex(${command.index}): Remove node at index ${command.index} (value: ${deletedValue}).`,
                        linkedList: newList
                    });
                } else {
                    addState({
                        line: 30,
                        commandIndex,
                        explanation: `Cannot delete at index ${command.index} - index out of bounds.`,
                        linkedList: [...linkedList]
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
        let outputLog = [];
        let array = [];

        const addState = (props) => {
            newHistory.push({ 
                outputLog: [...outputLog], 
                explanation: "", 
                linkedList: [...array],
                ...props 
            });
        };

        addState({ 
            line: 5,
            commandIndex: -1,
            explanation: "Initialize an empty array-based linked list. This is inefficient but simple to understand.",
            linkedList: []
        });

        commands.forEach((command, commandIndex) => {
            if (command.op === "addAtHead") {
                outputLog.push(`addAtHead(${command.value})`);
                addState({
                    line: 15,
                    commandIndex,
                    explanation: `addAtHead(${command.value}): Insert at beginning of array using unshift() - O(n) operation.`,
                    linkedList: [command.value, ...array]
                });
                array = [command.value, ...array];
            } else if (command.op === "addAtTail") {
                outputLog.push(`addAtTail(${command.value})`);
                addState({
                    line: 20,
                    commandIndex,
                    explanation: `addAtTail(${command.value}): Append to end of array using push() - O(1) operation.`,
                    linkedList: [...array, command.value]
                });
                array = [...array, command.value];
            } else if (command.op === "addAtIndex") {
                outputLog.push(`addAtIndex(${command.index}, ${command.value})`);
                if (command.index === 0) {
                    addState({
                        line: 15,
                        commandIndex,
                        explanation: `addAtIndex(${command.index}, ${command.value}): Insert at beginning using unshift() - O(n) operation.`,
                        linkedList: [command.value, ...array]
                    });
                    array = [command.value, ...array];
                } else if (command.index <= array.length) {
                    const newArray = [...array];
                    newArray.splice(command.index, 0, command.value);
                    addState({
                        line: 25,
                        commandIndex,
                        explanation: `addAtIndex(${command.index}, ${command.value}): Insert at position ${command.index} using splice() - O(n) operation.`,
                        linkedList: newArray
                    });
                    array = newArray;
                } else {
                    addState({
                        line: 25,
                        commandIndex,
                        explanation: `Cannot add at index ${command.index} - index out of bounds.`,
                        linkedList: [...array]
                    });
                }
            } else if (command.op === "get") {
                outputLog.push(`get(${command.index})`);
                if (command.index >= 0 && command.index < array.length) {
                    const value = array[command.index];
                    addState({
                        line: 9,
                        commandIndex,
                        explanation: `get(${command.index}): Direct array access - O(1) operation. Return ${value}.`,
                        linkedList: [...array],
                        highlightedIndex: command.index
                    });
                } else {
                    addState({
                        line: 10,
                        commandIndex,
                        explanation: `get(${command.index}): Index out of bounds, return -1.`,
                        linkedList: [...array]
                    });
                }
            } else if (command.op === "deleteAtIndex") {
                outputLog.push(`deleteAtIndex(${command.index})`);
                if (command.index >= 0 && command.index < array.length) {
                    const deletedValue = array[command.index];
                    const newArray = [...array];
                    newArray.splice(command.index, 1);
                    addState({
                        line: 30,
                        commandIndex,
                        explanation: `deleteAtIndex(${command.index}): Remove element at index ${command.index} using splice() - O(n) operation. Deleted value: ${deletedValue}.`,
                        linkedList: newArray
                    });
                    array = newArray;
                } else {
                    addState({
                        line: 30,
                        commandIndex,
                        explanation: `Cannot delete at index ${command.index} - index out of bounds.`,
                        linkedList: [...array]
                    });
                }
            }
        });

        addState({ finished: true, explanation: "All operations complete. Array-based approach is simpler but less efficient for insertions/deletions." });
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
        generateOptimalHistory(commands);
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
            optimal: ({ commands }) => generateOptimalHistory(commands),
            bruteForce: ({ commands }) => generateBruteForceHistory(commands),
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
                { t: "struct", c: "purple" },
                { t: " Node{", c: "" },
            ],
        },
        { l: 2, c: [{ t: "  int val;", c: "cyan" }] },
        { l: 3, c: [{ t: "  unique_ptr<Node> next;", c: "cyan" }] },
        { l: 4, c: [{ t: "  Node(int val) : val(val){}", c: "light-gray" }] },
        { l: 5, c: [{ t: "};", c: "light-gray" }] },
        {
            l: 7,
            c: [
                { t: "class", c: "purple" },
                { t: " MyLinkedList {", c: "" },
            ],
        },
        { l: 8, c: [{ t: "  unique_ptr<Node> head = nullptr;", c: "cyan" }] },
        {
            l: 10,
            c: [
                { t: "  int", c: "cyan" },
                { t: " get(", c: "" },
                { t: "int", c: "cyan" },
                { t: " index) {", c: "" },
            ],
        },
        {
            l: 11,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index < 0) return -1;", c: "" },
            ],
        },
        {
            l: 12,
            c: [
                { t: "    Node* current = head.get();", c: "" },
            ],
        },
        {
            l: 13,
            c: [
                { t: "    int count = 0;", c: "" },
            ],
        },
        {
            l: 14,
            c: [
                { t: "    while", c: "purple" },
                { t: " (current != nullptr) {", c: "" },
            ],
        },
        {
            l: 15,
            c: [
                { t: "      if", c: "purple" },
                { t: " (count == index) return current->val;", c: "" },
            ],
        },
        {
            l: 16,
            c: [
                { t: "      current = current->next.get();", c: "" },
            ],
        },
        {
            l: 17,
            c: [
                { t: "      count++;", c: "" },
            ],
        },
        {
            l: 18,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 19,
            c: [
                { t: "    return", c: "purple" },
                { t: " -1;", c: "orange" },
            ],
        },
        {
            l: 20,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 22,
            c: [
                { t: "  void", c: "purple" },
                { t: " addAtHead(", c: "" },
                { t: "int", c: "cyan" },
                { t: " val) {", c: "" },
            ],
        },
        {
            l: 23,
            c: [
                { t: "    unique_ptr<Node> newHead = make_unique<Node>(val);", c: "" },
            ],
        },
        {
            l: 24,
            c: [
                { t: "    newHead->next = move(head);", c: "" },
            ],
        },
        {
            l: 25,
            c: [
                { t: "    head = move(newHead);", c: "" },
            ],
        },
        {
            l: 26,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 28,
            c: [
                { t: "  void", c: "purple" },
                { t: " addAtTail(", c: "" },
                { t: "int", c: "cyan" },
                { t: " val) {", c: "" },
            ],
        },
        {
            l: 29,
            c: [
                { t: "    Node* current = head.get();", c: "" },
            ],
        },
        {
            l: 30,
            c: [
                { t: "    if", c: "purple" },
                { t: " (current == nullptr) {", c: "" },
            ],
        },
        {
            l: 31,
            c: [
                { t: "      addAtHead(val);", c: "" },
            ],
        },
        {
            l: 32,
            c: [
                { t: "      return", c: "purple" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 33,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 34,
            c: [
                { t: "    unique_ptr<Node> newTail = make_unique<Node>(val);", c: "" },
            ],
        },
        {
            l: 35,
            c: [
                { t: "    while", c: "purple" },
                { t: " (current->next != nullptr) {", c: "" },
            ],
        },
        {
            l: 36,
            c: [
                { t: "      current = current->next.get();", c: "" },
            ],
        },
        {
            l: 37,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 38,
            c: [
                { t: "    current->next = move(newTail);", c: "" },
            ],
        },
        {
            l: 39,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 41,
            c: [
                { t: "  void", c: "purple" },
                { t: " addAtIndex(", c: "" },
                { t: "int", c: "cyan" },
                { t: " index, ", c: "" },
                { t: "int", c: "cyan" },
                { t: " val) {", c: "" },
            ],
        },
        {
            l: 42,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index < 0) return", c: "" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 43,
            c: [
                { t: "    Node* current = head.get();", c: "" },
            ],
        },
        {
            l: 44,
            c: [
                { t: "    int count = 0;", c: "" },
            ],
        },
        {
            l: 45,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index == 0) {", c: "" },
            ],
        },
        {
            l: 46,
            c: [
                { t: "      addAtHead(val);", c: "" },
            ],
        },
        {
            l: 47,
            c: [
                { t: "      return", c: "purple" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 48,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 49,
            c: [
                { t: "    unique_ptr<Node> newNode = make_unique<Node>(val);", c: "" },
            ],
        },
        {
            l: 50,
            c: [
                { t: "    while", c: "purple" },
                { t: " (count < index - 1 && current != nullptr) {", c: "" },
            ],
        },
        {
            l: 51,
            c: [
                { t: "      current = current->next.get();", c: "" },
            ],
        },
        {
            l: 52,
            c: [
                { t: "      count++;", c: "" },
            ],
        },
        {
            l: 53,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 54,
            c: [
                { t: "    if", c: "purple" },
                { t: " (current != nullptr) {", c: "" },
            ],
        },
        {
            l: 55,
            c: [
                { t: "      newNode->next = move(current->next);", c: "" },
            ],
        },
        {
            l: 56,
            c: [
                { t: "      current->next = move(newNode);", c: "" },
            ],
        },
        {
            l: 57,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 58,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 60,
            c: [
                { t: "  void", c: "purple" },
                { t: " deleteAtIndex(", c: "" },
                { t: "int", c: "cyan" },
                { t: " index) {", c: "" },
            ],
        },
        {
            l: 61,
            c: [
                { t: "    Node* current = head.get();", c: "" },
            ],
        },
        {
            l: 62,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index < 0 || current == nullptr) return", c: "" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 63,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index == 0) {", c: "" },
            ],
        },
        {
            l: 64,
            c: [
                { t: "      Node* temp = head.get();", c: "" },
            ],
        },
        {
            l: 65,
            c: [
                { t: "      head = move(head->next);", c: "" },
            ],
        },
        {
            l: 66,
            c: [
                { t: "      return", c: "purple" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 67,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 68,
            c: [
                { t: "    int count = 0;", c: "" },
            ],
        },
        {
            l: 69,
            c: [
                { t: "    while", c: "purple" },
                { t: " (count != index - 1 && current != nullptr) {", c: "" },
            ],
        },
        {
            l: 70,
            c: [
                { t: "      current = current->next.get();", c: "" },
            ],
        },
        {
            l: 71,
            c: [
                { t: "      count++;", c: "" },
            ],
        },
        {
            l: 72,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 73,
            c: [
                { t: "    if", c: "purple" },
                { t: " (current != nullptr && current->next != nullptr) {", c: "" },
            ],
        },
        {
            l: 74,
            c: [
                { t: "      unique_ptr<Node> tempToDelete = move(current->next);", c: "" },
            ],
        },
        {
            l: 75,
            c: [
                { t: "      current->next = move(tempToDelete->next);", c: "" },
            ],
        },
        {
            l: 76,
            c: [
                { t: "    }", c: "light-gray" },
            ],
        },
        {
            l: 77,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 78,
            c: [
                { t: "};", c: "" },
            ],
        },
    ];

    const bruteForceCode = [
        {
            l: 1,
            c: [
                { t: "class", c: "purple" },
                { t: " ArrayBasedLinkedList {", c: "" },
            ],
        },
        { l: 2, c: [{ t: "  vector<int> data;", c: "cyan" }] },
        { l: 3, c: [{ t: "  int size = 0;", c: "cyan" }] },
        { l: 4, c: [{ t: "", c: "" }] },
        {
            l: 6,
            c: [
                { t: "  int", c: "cyan" },
                { t: " get(", c: "" },
                { t: "int", c: "cyan" },
                { t: " index) {", c: "" },
            ],
        },
        {
            l: 7,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index < 0 || index >= size) return -1;", c: "" },
            ],
        },
        {
            l: 8,
            c: [
                { t: "    return", c: "purple" },
                { t: " data[index];", c: "orange" },
            ],
        },
        {
            l: 9,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 11,
            c: [
                { t: "  void", c: "purple" },
                { t: " addAtHead(", c: "" },
                { t: "int", c: "cyan" },
                { t: " val) {", c: "" },
            ],
        },
        {
            l: 12,
            c: [
                { t: "    data.insert(data.begin(), val);", c: "" },
            ],
        },
        {
            l: 13,
            c: [
                { t: "    size++;", c: "" },
            ],
        },
        {
            l: 14,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 16,
            c: [
                { t: "  void", c: "purple" },
                { t: " addAtTail(", c: "" },
                { t: "int", c: "cyan" },
                { t: " val) {", c: "" },
            ],
        },
        {
            l: 17,
            c: [
                { t: "    data.push_back(val);", c: "" },
            ],
        },
        {
            l: 18,
            c: [
                { t: "    size++;", c: "" },
            ],
        },
        {
            l: 19,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 21,
            c: [
                { t: "  void", c: "purple" },
                { t: " addAtIndex(", c: "" },
                { t: "int", c: "cyan" },
                { t: " index, ", c: "" },
                { t: "int", c: "cyan" },
                { t: " val) {", c: "" },
            ],
        },
        {
            l: 22,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index < 0 || index > size) return", c: "" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 23,
            c: [
                { t: "    data.insert(data.begin() + index, val);", c: "" },
            ],
        },
        {
            l: 24,
            c: [
                { t: "    size++;", c: "" },
            ],
        },
        {
            l: 25,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 27,
            c: [
                { t: "  void", c: "purple" },
                { t: " deleteAtIndex(", c: "" },
                { t: "int", c: "cyan" },
                { t: " index) {", c: "" },
            ],
        },
        {
            l: 28,
            c: [
                { t: "    if", c: "purple" },
                { t: " (index < 0 || index >= size) return", c: "" },
                { t: ";", c: "" },
            ],
        },
        {
            l: 29,
            c: [
                { t: "    data.erase(data.begin() + index);", c: "" },
            ],
        },
        {
            l: 30,
            c: [
                { t: "    size--;", c: "" },
            ],
        },
        {
            l: 31,
            c: [
                { t: "  }", c: "light-gray" },
            ],
        },
        {
            l: 32,
            c: [
                { t: "};", c: "" },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <header className="text-center">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
                        Linked List Visualizer
                    </h1>
                    <p className="text-sm text-gray-400">Visualizing LeetCode 707: Design Linked List operations</p>
                </header>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
                    <div className="flex flex-col gap-3">
                        <div className="w-full">
                            <label className="block text-xs font-semibold text-gray-300 mb-2">Enter Operations (one per line or comma-separated):</label>
                            <div className="bg-gray-900 rounded-lg border border-gray-600 focus-within:border-orange-500 transition-colors p-3 max-h-32 overflow-y-auto">
                                <input
                                    type="text"
                                    placeholder='MyLinkedList(), addAtHead(1), addAtTail(3), get(1), deleteAtIndex(1)'
                                    value={operationsInput.replace(/\n/g, ', ')}
                                    onChange={(e) => setOperationsInput(e.target.value.replace(/, /g, '\n').replace(/,/g, '\n'))}
                                    disabled={isLoaded}
                                    className="w-full bg-transparent font-mono text-xs text-gray-200 focus:outline-none disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-semibold">Mode:</span>
                                <div className="flex gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                                    <button onClick={() => handleModeChange("bruteForce")} className={`px-4 py-1.5 rounded-md font-semibold transition-all text-xs ${mode === "bruteForce" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>
                                        Brute Force O(n)
                                    </button>
                                    <button onClick={() => handleModeChange("optimal")} className={`px-4 py-1.5 rounded-md font-semibold transition-all text-xs ${mode === "optimal" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"}`}>
                                        Optimal O(n)
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isLoaded ? (
                                    <button onClick={loadOps} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-md shadow-md transform hover:scale-105 transition-all flex items-center gap-2">
                                        <CheckCircle size={16} /> Visualize
                                    </button>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 bg-gray-900/50 p-1.5 rounded-md border border-gray-600">
                                            <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-30 transition-all" title="Previous Step (←)">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <div className="bg-gray-800 px-3 py-1 rounded border border-gray-600">
                                                <span className="font-mono text-sm font-bold text-orange-400">{currentStep >= 0 ? currentStep + 1 : 0}</span>
                                                <span className="text-gray-500 mx-1">/</span>
                                                <span className="font-mono text-xs text-gray-400">{history.length}</span>
                                            </div>
                                            <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 hover:bg-gray-600 p-2 rounded disabled:opacity-30 transition-all" title="Next Step (→)">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                        <button onClick={reset} className="bg-red-600/80 hover:bg-red-600 font-bold py-2 px-4 rounded-md shadow-md transition-all text-sm">
                                            Reset
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isLoaded ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock size={18} className="text-blue-400" />
                                <h3 className="font-bold text-md text-blue-300">Current Step Explanation</h3>
                            </div>
                            <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[50px]">
                                <p className="text-sm text-gray-200">{state.explanation}</p>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle size={18} className="text-cyan-400" />
                                <div>
                                    <h3 className="font-bold text-md text-cyan-300">Output Log</h3>
                                    <p className="text-xs text-gray-500">Results from get() operations</p>
                                </div>
                            </div>
                            <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[50px]">
                                <div className="flex flex-wrap gap-2">
                                    {(state.outputLog || []).length === 0 ? <p className="text-gray-500 text-xs italic">No output yet</p>
                                        : state.outputLog.map((out, i) => (
                                            <div key={i} className={`font-mono px-3 py-1 rounded-md font-bold text-md border transition-all ${state.commandIndex === i && state.getResult !== undefined ? "bg-orange-500/30 border-orange-400 scale-110" : out === -1 ? "bg-red-900/30 border-red-600 text-red-300" : "bg-green-900/30 border-green-600 text-green-300"}`}>{out}</div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Hash size={18} className="text-purple-400" />
                                <div>
                                    <h3 className="font-bold text-md text-purple-300">Linked List</h3>
                                    <p className="text-xs text-gray-500 font-mono">Nodes with values and next pointers</p>
                                </div>
                            </div>
                            <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[150px]">
                                <div className="flex flex-wrap gap-3 items-center">
                                    {(state.linkedList || []).length === 0 ? <p className="text-gray-500 text-xs italic">Linked list is empty</p>
                                        : (
                                            <div className="flex items-center space-x-2">
                                                <div className="text-sm text-gray-500">head →</div>
                                                {(state.linkedList || []).map((value, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <div 
                                                            className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                                                                state.highlightedIndex === index 
                                                                    ? 'bg-orange-500/30 border-orange-400 scale-110' 
                                                                    : 'bg-blue-500/20 border-blue-400'
                                                            }`}
                                                        >
                                                            {value}
                                                        </div>
                                                        {index < (state.linkedList || []).length - 1 && (
                                                            <ArrowRight size={16} className="text-gray-400 mx-2" />
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="text-sm text-gray-500">→ null</div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Code size={18} className="text-green-400" />
                                <div>
                                    <h3 className="font-bold text-md text-green-300">Code Execution</h3>
                                    <p className="text-xs text-gray-500 font-mono">Current line highlighted</p>
                                </div>
                            </div>
                            <div className="bg-gray-900/70 p-3 rounded-md border border-gray-700 min-h-[200px] max-h-[300px] overflow-y-auto">
                                <div className="font-mono text-xs">
                                    {(mode === "bruteForce" ? bruteForceCode : optimalCode).map((line) => (
                                        <CodeLine key={line.l} line={line.l} content={line.c} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-md text-purple-300 mb-3 pb-2 border-b border-gray-700 flex items-center gap-3"><Clock size={18} /> Complexity Analysis</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                {mode === "bruteForce" ? (
                                    <>
                                        <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                                            <h4 className="font-bold text-red-400 mb-1">Time: <span className="font-mono text-cyan-300">O(n)</span> for insertions/deletions</h4>
                                            <p className="text-gray-400 text-xs"><code className="text-orange-300">addAtHead(val)</code> and <code className="text-orange-300">addAtIndex(index, val)</code> use <code className="text-red-300">vector.insert()</code> which shifts all elements, costing <span className="font-mono">O(n)</span>. <code className="text-orange-300">get(index)</code> is <span className="font-mono">O(1)</span> with direct array access. <code className="text-orange-300">addAtTail(val)</code> is <span className="font-mono">O(1)</span> with <code className="text-green-300">push_back()</code>.</p>
                                        </div>
                                        <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                                            <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(n)</span></h4>
                                            <p className="text-gray-400 text-xs">Uses a dynamic array (vector) to store elements. Simpler implementation but less efficient for frequent insertions at the beginning.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                                            <h4 className="font-bold text-green-400 mb-1">Time: <span className="font-mono text-cyan-300">O(n)</span> for most operations</h4>
                                            <p className="text-gray-400 text-xs"><code className="text-orange-300">get(index)</code>, <code className="text-orange-300">addAtIndex(index, val)</code>, and <code className="text-orange-300">deleteAtIndex(index)</code> require traversing the list to reach the target position, costing <span className="font-mono">O(n)</span> in the worst case. <code className="text-orange-300">addAtHead(val)</code> is <span className="font-mono">O(1)</span> since we only need to update the head pointer.</p>
                                        </div>
                                        <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                                            <h4 className="font-bold text-blue-400 mb-1">Space: <span className="font-mono text-cyan-300">O(n)</span></h4>
                                            <p className="text-gray-400 text-xs">Each node stores a value and a pointer to the next node. The space grows linearly with the number of elements in the linked list.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="bg-gray-800 p-8 rounded-lg border border-dashed border-gray-600 max-w-md mx-auto">
                            <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code size={32} className="text-orange-400" /></div>
                            <h2 className="text-xl font-bold text-gray-300 mb-2">Ready to Visualize</h2>
                            <p className="text-gray-400 text-sm">Enter operations above and click "Visualize" to see how the Linked List works.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignLinkedList;