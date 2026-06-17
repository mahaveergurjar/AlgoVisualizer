import React, { useState, useCallback } from "react";
import {
  Clock,
  Hash,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const DesignLinkedList = () => {
  const [mode, setMode] = useState("optimal");
  const [operationsInput, setOperationsInput] = useState(
    `MyLinkedList()\naddAtHead(1)\naddAtTail(3)\naddAtIndex(1,2)\nget(1)\ndeleteAtIndex(1)\nget(1)`
  );
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const parseOperations = (input) => {
    const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);
    const commands = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

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
    load(newHistory);
  }, [load]);

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
            explanation: `deleteAtIndex(${command.index}): Remove node at index ${command.index} using erase() - O(n) operation (value: ${deletedValue}).`,
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

    addState({ finished: true, explanation: "All operations complete." });
    load(newHistory);
  }, [load]);

  const loadOps = () => {
    const { commands } = parseOperations(operationsInput);
    if (commands.length === 0) {
      alert("Please provide at least one operation.");
      return;
    }
    if (mode === "optimal") {
      generateOptimalHistory(commands);
    } else {
      generateBruteForceHistory(commands);
    }
  };

  const optimalCodeContent = {
    1: "struct Node {",
    2: "  int val;",
    3: "  unique_ptr<Node> next;",
    4: "  Node(int val) : val(val){}",
    5: "};",
    6: "",
    7: "class MyLinkedList {",
    8: "  unique_ptr<Node> head = nullptr;",
    9: "public:",
    10: "  int get(int index) {",
    11: "    if (index < 0) return -1;",
    12: "    Node* current = head.get();",
    13: "    int count = 0;",
    14: "    while (current != nullptr) {",
    15: "      if (count == index) return current->val;",
    16: "      current = current->next.get();",
    17: "      count++;",
    18: "    }",
    19: "    return -1;",
    20: "  }",
    21: "",
    22: "  void addAtHead(int val) {",
    23: "    unique_ptr<Node> newHead = make_unique<Node>(val);",
    24: "    newHead->next = move(head);",
    25: "    head = move(newHead);",
    26: "  }",
    27: "",
    28: "  void addAtTail(int val) {",
    29: "    Node* current = head.get();",
    30: "    if (current == nullptr) {",
    31: "      addAtHead(val);",
    32: "      return;",
    33: "    }",
    34: "    unique_ptr<Node> newTail = make_unique<Node>(val);",
    35: "    while (current->next != nullptr) {",
    36: "      current = current->next.get();",
    37: "    }",
    38: "    current->next = move(newTail);",
    39: "  }",
    40: "",
    41: "  void addAtIndex(int index, int val) {",
    42: "    if (index < 0) return;",
    43: "    Node* current = head.get();",
    44: "    int count = 0;",
    45: "    if (index == 0) {",
    46: "      addAtHead(val);",
    47: "      return;",
    48: "    }",
    49: "    unique_ptr<Node> newNode = make_unique<Node>(val);",
    50: "    while (count < index - 1 && current != nullptr) {",
    51: "      current = current->next.get();",
    52: "      count++;",
    53: "    }",
    54: "    if (current != nullptr) {",
    55: "      newNode->next = move(current->next);",
    56: "      current->next = move(newNode);",
    57: "    }",
    58: "  }",
    59: "",
    60: "  void deleteAtIndex(int index) {",
    61: "    Node* current = head.get();",
    62: "    if (index < 0 || current == nullptr) return;",
    63: "    if (index == 0) {",
    64: "      head = move(head->next);",
    65: "      return;",
    66: "    }",
    67: "    int count = 0;",
    68: "    while (count != index - 1 && current != nullptr) {",
    69: "      current = current->next.get();",
    70: "      count++;",
    71: "    }",
    72: "    if (current != nullptr && current->next != nullptr) {",
    73: "      unique_ptr<Node> tempToDelete = move(current->next);",
    74: "      current->next = move(tempToDelete->next);",
    75: "    }",
    76: "  }",
    77: "};"
  };

  const bruteForceCodeContent = {
    1: "class ArrayBasedLinkedList {",
    2: "  vector<int> data;",
    3: "  int size = 0;",
    4: "public:",
    5: "  int get(int index) {",
    6: "    if (index < 0 || index >= size) return -1;",
    7: "    return data[index];",
    8: "  }",
    9: "",
    11: "  void addAtHead(int val) {",
    12: "    data.insert(data.begin(), val);",
    13: "    size++;",
    14: "  }",
    15: "",
    16: "  void addAtTail(int val) {",
    17: "    data.push_back(val);",
    18: "    size++;",
    19: "  }",
    20: "",
    21: "  void addAtIndex(int index, int val) {",
    22: "    if (index < 0 || index > size) return;",
    23: "    data.insert(data.begin() + index, val);",
    24: "    size++;",
    25: "  }",
    26: "",
    27: "  void deleteAtIndex(int index) {",
    28: "    if (index < 0 || index >= size) return;",
    29: "    data.erase(data.begin() + index);",
    30: "    size--;",
    31: "  }",
    32: "};"
  };

  const codeContent = mode === "optimal" ? optimalCodeContent : bruteForceCodeContent;

  const inputSection = (
    <>
      <div className="flex flex-col gap-2 flex-grow w-full">
        <label htmlFor="ops-input" className="font-medium text-gray-300 font-mono text-sm">
          Enter Operations (comma or newline separated):
        </label>
        <textarea
          id="ops-input"
          value={operationsInput.replace(/\n/g, ', ')}
          onChange={(e) => setOperationsInput(e.target.value.replace(/, /g, '\n').replace(/,/g, '\n'))}
          disabled={isLoaded}
          rows={3}
          placeholder="e.g., MyLinkedList(), addAtHead(1), addAtTail(3), get(1)"
          className="font-mono bg-gray-950 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-orange-505 focus:outline-none w-full text-sm"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={loadOps}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer self-end flex items-center gap-2 text-sm"
        >
          <CheckCircle size={16} /> Visualize
        </button>
      )}
    </>
  );

  const state = currentState || {};
  const {
    outputLog = [],
    explanation = "",
    linkedList = [],
    highlightedIndex = -1,
    line = null,
    commandIndex = -1,
    getResult = undefined,
  } = state;

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2 select-none text-xs">
          <CheckCircle size={14} /> Output Log (get results)
        </h3>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
          {outputLog.length === 0 ? (
            <span className="text-gray-500 italic text-xs">No output yet</span>
          ) : (
            outputLog.map((out, i) => (
              <div
                key={i}
                className={`font-mono px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                  commandIndex === i && getResult !== undefined
                    ? "bg-orange-500/30 border-orange-400 scale-110"
                    : "bg-gray-800/50 border-gray-700 text-gray-300"
                }`}
              >
                {out}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sm:col-span-2 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-xs">
          Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity</span>
            {mode === "bruteForce" ? (
              <p className="text-gray-400">O(N) for head insertion/middle deletion; O(1) for tail insertion & get.</p>
            ) : (
              <p className="text-gray-400">O(1) for head insertion; O(N) for traversing to tail/middle index.</p>
            )}
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(N) to store nodes in memory.</p>
          </div>
        </div>
      </div>
    </>
  );

  const handleModeChange = (newMode) => {
    setMode(newMode);
    visualizer.reset();
  };

  return (
    <VisualizerLayout
      title="Design Linked List"
      description="Design a singly linked list with standard insertion, deletion, and search functions"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation || "Enter operations to begin visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="space-y-6 select-none">
        {/* Mode Tabs */}
        <div className="flex border-b border-gray-800 select-none">
          <button
            onClick={() => handleModeChange("bruteForce")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "bruteForce"
                ? "border-red-500 text-red-300 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-250"
            }`}
          >
            Brute Force O(n)
          </button>
          <button
            onClick={() => handleModeChange("optimal")}
            className={`flex items-center gap-2 cursor-pointer p-3 px-5 border-b-4 transition-all text-sm ${
              mode === "optimal"
                ? "border-orange-500 text-orange-355 font-semibold"
                : "border-transparent text-gray-400 hover:text-gray-250"
            }`}
          >
            Optimal O(n)
          </button>
        </div>

        {isLoaded ? (
          <div className="bg-gray-950/40 p-6 rounded-xl border border-gray-800 min-h-[200px] flex items-center justify-center">
            <div className="flex flex-wrap gap-3 items-center">
              {linkedList.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Linked list is empty</p>
              ) : (
                <div className="flex items-center space-x-2 flex-wrap">
                  <div className="text-sm text-gray-500 font-mono">head →</div>
                  {linkedList.map((value, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                          highlightedIndex === index
                            ? "bg-orange-500/30 border-orange-400 scale-110 shadow-lg shadow-orange-500/25"
                            : "bg-blue-500/20 border-blue-400"
                        }`}
                      >
                        {value}
                      </div>
                      {index < linkedList.length - 1 && (
                        <ArrowRight size={16} className="text-gray-400 mx-2" />
                      )}
                    </div>
                  ))}
                  <div className="text-sm text-gray-500 font-mono ml-2">→ null</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
            <p className="text-gray-400 text-sm">Enter operations above and click "Visualize" to begin.</p>
          </div>
        )}
      </div>
    </VisualizerLayout>
  );
};

export default DesignLinkedList;