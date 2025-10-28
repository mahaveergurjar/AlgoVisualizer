import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  CheckCircle,
  List,
  Clock,
  Plus,
  Minus,
  Activity,
  RotateCw,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

import { useAlertContext } from "../../context/AlertContext";

// Main Visualizer Component
const CircularQueueVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [capacityInput, setCapacityInput] = useState("6");
  const [operationsInput, setOperationsInput] = useState("enqueue 5, enqueue 3, enqueue 7, dequeue, enqueue 9, dequeue, enqueue 2, enqueue 8");
  const [isLoaded, setIsLoaded] = useState(false);
  const { showAlert } = useAlertContext();

  const generateCircularQueueHistory = useCallback((capacity, operations) => {
    const queue = new Array(capacity).fill(null);
    const newHistory = [];
    let front = -1;
    let rear = -1;
    let size = 0;
    let totalEnqueues = 0;
    let totalDequeues = 0;

    const addState = (props) =>
      newHistory.push({
        queue: JSON.parse(JSON.stringify(queue)),
        front,
        rear,
        size,
        capacity,
        totalEnqueues,
        totalDequeues,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Initialize circular queue with capacity ${capacity}. Front and rear are -1 (empty).` });

    operations.forEach((op, opIndex) => {
      const [action, value] = op;

      if (action === "enqueue") {
        if (size === capacity) {
          addState({
            line: 4,
            operation: "enqueue",
            error: true,
            explanation: `Cannot enqueue ${value}: Queue is full! (Size: ${size}/${capacity})`,
          });
        } else {
          totalEnqueues++;
          addState({
            line: 4,
            operation: "enqueue",
            highlightValue: value,
            explanation: `Enqueue operation: Adding element ${value} to the queue.`,
          });

          if (front === -1) {
            front = 0;
          }
          rear = (rear + 1) % capacity;
          queue[rear] = { value, id: Date.now() + opIndex };
          size++;

          addState({
            line: 5,
            operation: "enqueue",
            highlightValue: value,
            highlightIndex: rear,
            explanation: `Element ${value} added at index ${rear}. Rear moved to ${rear}. Size: ${size}/${capacity}`,
          });
        }
      } else if (action === "dequeue") {
        if (size === 0) {
          addState({
            line: 9,
            operation: "dequeue",
            error: true,
            explanation: "Cannot dequeue: Queue is empty!",
          });
        } else {
          totalDequeues++;
          const removedValue = queue[front].value;
          const removedIndex = front;

          addState({
            line: 9,
            operation: "dequeue",
            highlightValue: removedValue,
            highlightIndex: front,
            explanation: `Dequeue operation: Removing element ${removedValue} from front (index ${front}).`,
          });

          queue[front] = null;
          size--;

          if (size === 0) {
            front = -1;
            rear = -1;
          } else {
            front = (front + 1) % capacity;
          }

          addState({
            line: 10,
            operation: "dequeue",
            explanation: `Element ${removedValue} removed from index ${removedIndex}. Front moved to ${front >= 0 ? front : 'null'}. Size: ${size}/${capacity}`,
          });
        }
      }
    });

    addState({
      line: 15,
      finished: true,
      explanation: "All operations completed. Final circular queue state shown.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadOperations = () => {
    const cap = parseInt(capacityInput, 10);
    if (isNaN(cap) || cap < 1 || cap > 20) {
      alert("Please enter a valid capacity between 1 and 20.");
      return;
    }

    const opsString = operationsInput.trim();
    if (!opsString) {
      alert("Please enter at least one operation.");
      return;
    }

    const operations = opsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((op) => {
        const parts = op.split(/\s+/);
        const action = parts[0].toLowerCase();
        if (action === "enqueue") {
          const val = parseInt(parts[1], 10);
          if (isNaN(val)) {
            alert(`Invalid enqueue value: ${parts[1]}`);
            return null;
          }
          return ["enqueue", val];
        } else if (action === "dequeue") {
          return ["dequeue", null];
        } else {
          showAlert("Invalid operation", `Unknown operation: ${action}`);
          return null;
        }
      })
      .filter(Boolean);

    if (operations.length === 0) {
      alert("No valid operations found.");
      return;
    }

    setIsLoaded(true);
    generateCircularQueueHistory(cap, operations);
  };

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
  const { queue = [], capacity = 0 } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    "light-gray": "text-gray-400",
    green: "text-green-400",
    red: "text-red-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-pink-500/20" : ""
      }`}
    >
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  const circularQueueCode = [
    { l: 1, c: [{ t: "class CircularQueue {", c: "" }] },
    { l: 2, c: [{ t: "  queue = new Array(capacity);", c: "" }] },
    { l: 3, c: [{ t: "  front = -1, rear = -1;", c: "" }] },
    { l: 4, c: [{ t: "  enqueue(value) {", c: "purple" }] },
    { l: 5, c: [{ t: "    rear = (rear + 1) % capacity;", c: "" }] },
    { l: 6, c: [{ t: "    queue[rear] = value;", c: "" }] },
    { l: 7, c: [{ t: "  }", c: "light-gray" }] },
    { l: 8, c: [{ t: "", c: "" }] },
    { l: 9, c: [{ t: "  dequeue() {", c: "purple" }] },
    { l: 10, c: [{ t: "    value = queue[front];", c: "" }] },
    { l: 11, c: [{ t: "    front = (front + 1) % capacity;", c: "" }] },
    { l: 12, c: [{ t: "    ", c: "" }, { t: "return", c: "purple" }, { t: " value;", c: "" }] },
    { l: 13, c: [{ t: "  }", c: "light-gray" }] },
    { l: 14, c: [{ t: "", c: "" }] },
    { l: 15, c: [{ t: "  isFull() {", c: "purple" }] },
    { l: 16, c: [{ t: "    ", c: "" }, { t: "return", c: "purple" }, { t: " (rear+1)%capacity === front;", c: "" }] },
    { l: 17, c: [{ t: "  }", c: "light-gray" }] },
    { l: 18, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-pink-400 flex items-center justify-center gap-3">
          <List /> Circular Queue Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Efficient space utilization with wrap-around indexing
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label htmlFor="capacity-input" className="font-medium text-gray-300 font-mono whitespace-nowrap">
            Capacity:
          </label>
          <input
            id="capacity-input"
            type="number"
            value={capacityInput}
            onChange={(e) => setCapacityInput(e.target.value)}
            disabled={isLoaded}
            min="1"
            max="20"
            className="font-mono w-24 bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-pink-500"
          />
          <label htmlFor="ops-input" className="font-medium text-gray-300 font-mono whitespace-nowrap md:ml-4">
            Operations:
          </label>
          <input
            id="ops-input"
            type="text"
            value={operationsInput}
            onChange={(e) => setOperationsInput(e.target.value)}
            disabled={isLoaded}
            placeholder="enqueue 5, dequeue, enqueue 7"
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          {!isLoaded ? (
            <button
              onClick={loadOperations}
              className="bg-pink-500 hover:bg-pink-600 text-white cursor-pointer font-bold py-2 px-4 rounded-lg"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-pink-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {circularQueueCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Activity size={20} />
                Circular Queue Visualization
                <RotateCw className="h-4 w-4 text-pink-400 ml-2" />
              </h3>

              <div className="mb-4 flex items-center justify-between text-sm flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    <span className="font-semibold text-rose-400">Front:</span>{" "}
                    {state.front >= 0 ? state.front : "null"}
                  </span>
                  <span className="text-gray-400">
                    <span className="font-semibold text-pink-400">Rear:</span>{" "}
                    {state.rear >= 0 ? state.rear : "null"}
                  </span>
                </div>
                <span className="text-gray-400">
                  Size: <span className="font-bold text-white">{state.size || 0}</span> /{" "}
                  <span className="text-gray-500">{capacity}</span>
                </span>
              </div>

              <div className="flex justify-center items-center min-h-[200px] py-4">
                <div
                  id="circular-queue-container"
                  className="relative transition-all"
                  style={{ width: `${capacity * 4.5}rem`, height: "4rem" }}
                >
                  {queue.map((item, index) => {
                    const isFront = index === state.front;
                    const isRear = index === state.rear;
                    const isHighlighted = state.highlightIndex === index;
                    const isEmpty = item === null;

                    let boxStyles = "bg-gray-800/50 border-gray-700";
                    if (state.error) {
                      boxStyles = "bg-red-700/30 border-red-600";
                    } else if (isHighlighted && state.operation === "enqueue") {
                      boxStyles = "bg-green-600 border-green-400 text-white";
                    } else if (isHighlighted && state.operation === "dequeue") {
                      boxStyles = "bg-red-600 border-red-400 text-white";
                    } else if (!isEmpty) {
                      if (isFront && isRear) {
                        boxStyles = "bg-gradient-to-r from-rose-700/70 to-pink-700/70 border-purple-500";
                      } else if (isFront) {
                        boxStyles = "bg-rose-700/70 border-rose-500";
                      } else if (isRear) {
                        boxStyles = "bg-pink-700/70 border-pink-500";
                      } else {
                        boxStyles = "bg-gray-700 border-gray-600";
                      }
                    }

                    return (
                      <div
                        key={index}
                        id={`circular-queue-container-element-${index}`}
                        className={`absolute w-16 h-16 flex flex-col items-center justify-center rounded-lg shadow-md border-2 transition-all duration-500 ease-in-out ${boxStyles}`}
                        style={{ left: `${index * 4.5}rem` }}
                      >
                        <span className="text-xs text-gray-400 font-mono">[{index}]</span>
                        <span className="font-bold text-xl">
                          {isEmpty ? "—" : item.value}
                        </span>
                      </div>
                    );
                  })}
                  {isLoaded && state.front >= 0 && (
                    <>
                      <VisualizerPointer
                        index={state.front}
                        containerId="circular-queue-container"
                        color="rose"
                        label="Front"
                      />
                      {state.rear >= 0 && (
                        <VisualizerPointer
                          index={state.rear}
                          containerId="circular-queue-container"
                          color="pink"
                          label="Rear"
                          direction="up"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                <p className="text-sm text-purple-300 flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  <span className="font-semibold">Circular Property:</span>
                  When rear or front reaches the end, it wraps around to index 0, reusing empty spaces.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-800/30 p-4 rounded-xl border border-green-700/50">
                <h3 className="text-green-300 text-sm flex items-center gap-2">
                  <Plus size={16} /> Total Enqueues
                </h3>
                <p className="font-mono text-4xl text-green-400 mt-2">
                  {state.totalEnqueues ?? 0}
                </p>
              </div>
              <div className="bg-red-800/30 p-4 rounded-xl border border-red-700/50">
                <h3 className="text-red-300 text-sm flex items-center gap-2">
                  <Minus size={16} /> Total Dequeues
                </h3>
                <p className="font-mono text-4xl text-red-400 mt-2">
                  {state.totalDequeues ?? 0}
                </p>
              </div>
            </div>

            <div className={`bg-gray-800/50 p-4 rounded-xl border ${state.error ? 'border-red-700/50' : 'border-gray-700/50'} min-h-[5rem]`}>
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className={state.error ? "text-red-400" : "text-gray-300"}>
                {state.explanation}
              </p>
              {state.finished && <CheckCircle className="inline-block ml-2 text-green-400" />}
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-pink-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-pink-300">Time Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">Enqueue: O(1)</strong>
                  <br />
                  Adding an element takes constant time. We calculate the next position using modulo: (rear + 1) % capacity.
                </p>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">Dequeue: O(1)</strong>
                  <br />
                  Removing an element takes constant time. Front pointer moves forward using: (front + 1) % capacity.
                </p>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">isFull/isEmpty: O(1)</strong>
                  <br />
                  Checking queue status takes constant time by comparing front and rear pointers.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-pink-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">O(K)</strong>
                  <br />
                  The queue uses fixed space equal to its capacity K, regardless of how many elements are actually stored. This is more efficient than a basic queue that grows unbounded.
                </p>
                <h4 className="font-semibold text-pink-300 mt-4">Advantages</h4>
                <p className="text-gray-400">
                  <strong className="text-pink-300">Space Efficiency:</strong> Reuses empty slots that appear at the front after dequeue operations, unlike basic queues.
                </p>
                <p className="text-gray-400">
                  <strong className="text-pink-300">Use Cases:</strong> Buffering data streams, memory management, CPU scheduling, traffic systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Set capacity and enter operations to begin visualization.
        </p>
      )}
    </div>
  );
};

export default CircularQueueVisualizer;