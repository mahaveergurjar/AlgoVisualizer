import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  CheckCircle,
  ArrowRightLeft,
  Clock,
  Plus,
  Minus,
  Activity,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const BasicQueueVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [operationsInput, setOperationsInput] = useState("enqueue 5, enqueue 3, dequeue, enqueue 7, dequeue, enqueue 9");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateQueueHistory = useCallback((operations) => {
    const queue = [];
    const newHistory = [];
    let front = 0;
    let totalEnqueues = 0;
    let totalDequeues = 0;

    const addState = (props) =>
      newHistory.push({
        queue: JSON.parse(JSON.stringify(queue)),
        front,
        rear: queue.length - 1,
        size: queue.length,
        totalEnqueues,
        totalDequeues,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: "Initialize empty queue. Front and rear pointers start at 0." });

    operations.forEach((op, opIndex) => {
      const [action, value] = op;

      if (action === "enqueue") {
        totalEnqueues++;
        addState({
          line: 3,
          operation: "enqueue",
          highlightValue: value,
          explanation: `Enqueue operation: Adding element ${value} to the rear of the queue.`,
        });

        queue.push({ value, id: Date.now() + opIndex });

        addState({
          line: 4,
          operation: "enqueue",
          highlightValue: value,
          explanation: `Element ${value} added at the rear. Queue size is now ${queue.length}.`,
        });
      } else if (action === "dequeue") {
        if (queue.length === 0) {
          addState({
            line: 7,
            operation: "dequeue",
            error: true,
            explanation: "Cannot dequeue: Queue is empty!",
          });
        } else {
          totalDequeues++;
          const removedValue = queue[0].value;

          addState({
            line: 7,
            operation: "dequeue",
            highlightValue: removedValue,
            explanation: `Dequeue operation: Removing element ${removedValue} from the front.`,
          });

          queue.shift();

          addState({
            line: 8,
            operation: "dequeue",
            explanation: `Element ${removedValue} removed from front. Queue size is now ${queue.length}.`,
          });
        }
      }
    });

    addState({
      line: 12,
      finished: true,
      explanation: "All operations completed. Final queue state shown.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadOperations = () => {
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
          alert(`Unknown operation: ${action}`);
          return null;
        }
      })
      .filter(Boolean);

    if (operations.length === 0) {
      alert("No valid operations found.");
      return;
    }

    setIsLoaded(true);
    generateQueueHistory(operations);
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
  const { queue = [] } = state;

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
        state.line === line ? "bg-rose-500/20" : ""
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

  const queueCode = [
    { l: 1, c: [{ t: "class Queue {", c: "" }] },
    { l: 2, c: [{ t: "  queue = [];", c: "" }] },
    { l: 3, c: [{ t: "  enqueue(value) {", c: "purple" }] },
    { l: 4, c: [{ t: "    queue.push(value);", c: "" }] },
    { l: 5, c: [{ t: "  }", c: "light-gray" }] },
    { l: 6, c: [{ t: "", c: "" }] },
    { l: 7, c: [{ t: "  dequeue() {", c: "purple" }] },
    { l: 8, c: [{ t: "    ", c: "" }, { t: "return", c: "purple" }, { t: " queue.shift();", c: "" }] },
    { l: 9, c: [{ t: "  }", c: "light-gray" }] },
    { l: 10, c: [{ t: "", c: "" }] },
    { l: 11, c: [{ t: "  isEmpty() {", c: "purple" }] },
    { l: 12, c: [{ t: "    ", c: "" }, { t: "return", c: "purple" }, { t: " queue.length === 0;", c: "" }] },
    { l: 13, c: [{ t: "  }", c: "light-gray" }] },
    { l: 14, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-rose-400 flex items-center justify-center gap-3">
          <ArrowRightLeft /> Basic Queue (FIFO) Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          First-In-First-Out: Elements leave in the same order they arrive
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="ops-input" className="font-medium text-gray-300 font-mono">
            Operations:
          </label>
          <input
            id="ops-input"
            type="text"
            value={operationsInput}
            onChange={(e) => setOperationsInput(e.target.value)}
            disabled={isLoaded}
            placeholder="enqueue 5, enqueue 3, dequeue, enqueue 7"
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadOperations}
              className="bg-rose-500 hover:bg-rose-600 text-white cursor-pointer font-bold py-2 px-4 rounded-lg"
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
            <h3 className="font-bold text-xl text-rose-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {queueCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Activity size={20} />
                Queue Visualization
              </h3>

              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    <span className="font-semibold text-rose-400">Front</span> (removes here)
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-400">
                    <span className="font-semibold text-pink-400">Rear</span> (adds here)
                  </span>
                </div>
                <span className="text-gray-400">
                  Size: <span className="font-bold text-white">{state.size || 0}</span>
                </span>
              </div>

              <div className="flex justify-center items-center min-h-[150px] py-4">
                {queue.length === 0 ? (
                  <div className="text-gray-500 text-lg">Queue is empty</div>
                ) : (
                  <div
                    id="queue-container"
                    className="relative transition-all"
                    style={{ width: `${queue.length * 5}rem`, height: "4rem" }}
                  >
                    {queue.map((item, index) => {
                      const isFront = index === 0;
                      const isRear = index === queue.length - 1;
                      const isHighlighted = state.highlightValue === item.value;

                      let boxStyles = "bg-gray-700 border-gray-600";
                      if (state.error) {
                        boxStyles = "bg-red-700/50 border-red-500";
                      } else if (isHighlighted && state.operation === "enqueue") {
                        boxStyles = "bg-green-600 border-green-400 text-white";
                      } else if (isHighlighted && state.operation === "dequeue") {
                        boxStyles = "bg-red-600 border-red-400 text-white";
                      } else if (isFront) {
                        boxStyles = "bg-rose-700/70 border-rose-500";
                      } else if (isRear) {
                        boxStyles = "bg-pink-700/70 border-pink-500";
                      }

                      return (
                        <div
                          key={item.id}
                          id={`queue-container-element-${index}`}
                          className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                          style={{ left: `${index * 5}rem` }}
                        >
                          {item.value}
                        </div>
                      );
                    })}
                    {isLoaded && queue.length > 0 && (
                      <>
                        <VisualizerPointer
                          index={0}
                          containerId="queue-container"
                          color="rose"
                          label="Front"
                        />
                        <VisualizerPointer
                          index={queue.length - 1}
                          containerId="queue-container"
                          color="pink"
                          label="Rear"
                          direction="up"
                        />
                      </>
                    )}
                  </div>
                )}
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
            <h3 className="font-bold text-xl text-rose-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-rose-300">Time Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">Enqueue: O(1)</strong>
                  <br />
                  Adding an element to the rear of the queue takes constant time as we simply append to the end.
                </p>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">Dequeue: O(1)</strong>
                  <br />
                  Removing an element from the front takes constant time (though array.shift() in JavaScript is O(n) - in practice, use a linked list or circular buffer for true O(1)).
                </p>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">Peek: O(1)</strong>
                  <br />
                  Viewing the front element without removing it is a constant time operation.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-rose-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-green-300 font-mono">O(N)</strong>
                  <br />
                  The queue stores N elements where N is the number of elements currently in the queue. This is linear space proportional to the queue size.
                </p>
                <h4 className="font-semibold text-rose-300 mt-4">Key Properties</h4>
                <p className="text-gray-400">
                  <strong className="text-pink-300">FIFO Principle:</strong> First element added is the first one removed, like a real-world waiting line.
                </p>
                <p className="text-gray-400">
                  <strong className="text-pink-300">Use Cases:</strong> Task scheduling, breadth-first search, buffer management, printer queues.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Enter operations to begin visualization.
        </p>
      )}
    </div>
  );
};

export default BasicQueueVisualizer;