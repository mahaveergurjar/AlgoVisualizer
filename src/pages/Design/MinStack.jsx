import React, { useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const MinStack = () => {
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateMinStackHistory = useCallback(() => {
    const hist = [];
    const stack = [];
    const minStack = [];

    hist.push({
      stack: [],
      minStack: [],
      operation: "init",
      message: "MinStack initialized. It supports push, pop, top, and getMin in O(1) time",
      phase: "init",
      line: 5
    });

    const operations = [
      { op: "push", val: 5 },
      { op: "push", val: 3 },
      { op: "push", val: 7 },
      { op: "getMin" },
      { op: "pop" },
      { op: "push", val: 2 },
      { op: "getMin" },
      { op: "push", val: 1 },
      { op: "getMin" },
      { op: "pop" },
      { op: "getMin" },
    ];

    operations.forEach(({ op, val }) => {
      if (op === "push") {
        stack.push(val);
        const currentMin = minStack.length === 0 ? val : Math.min(val, minStack[minStack.length - 1]);
        minStack.push(currentMin);

        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "push",
          value: val,
          currentMin,
          message: `push(${val}): Added ${val} to stack. Current min: ${currentMin}`,
          phase: "push",
          line: 8
        });
      } else if (op === "pop") {
        const popped = stack.pop();
        minStack.pop();

        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "pop",
          poppedValue: popped,
          currentMin: minStack.length > 0 ? minStack[minStack.length - 1] : null,
          message: `pop(): Removed ${popped} from stack. ${minStack.length > 0 ? `Current min: ${minStack[minStack.length - 1]}` : 'Stack is empty'}`,
          phase: "pop",
          line: 17
        });
      } else if (op === "getMin") {
        const min = minStack[minStack.length - 1];
        hist.push({
          stack: [...stack],
          minStack: [...minStack],
          operation: "getMin",
          minValue: min,
          message: `getMin(): Minimum element is ${min}`,
          phase: "getMin",
          line: 26
        });
      }
    });

    load(hist);
  }, [load]);

  const handleStart = () => {
    generateMinStackHistory();
  };

  const step = currentState || {};
  const { stack = [], minStack = [], message = "", currentMin, minValue } = step;

  const codeContent = {
    1: "class MinStack {",
    2: "    stack<int> s;",
    3: "    stack<int> min_s;",
    4: "public:",
    5: "    MinStack() {}",
    6: "    ",
    7: "    void push(int val) {",
    8: "        s.push(val);",
    9: "        if (min_s.empty() || val <= min_s.top()) {",
    10: "            min_s.push(val);",
    11: "        } else {",
    12: "            min_s.push(min_s.top());",
    13: "        }",
    14: "    }",
    15: "    ",
    16: "    void pop() {",
    17: "        s.pop();",
    18: "        min_s.pop();",
    19: "    }",
    20: "    ",
    21: "    int top() {",
    22: "        return s.top();",
    23: "    }",
    24: "    ",
    25: "    int getMin() {",
    26: "        return min_s.top();",
    27: "    }",
    28: "};"
  };

  const inputSection = (
    <>
      <p className="text-gray-300 text-sm flex-grow">
        Click below to load the MinStack operations and visualize the twin stack model.
      </p>
      {!isLoaded && (
        <button
          onClick={handleStart}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer text-sm"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h3 className="font-semibold text-blue-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
          Active Operation
        </h3>
        <div className="font-mono text-lg font-bold text-blue-300 capitalize">
          {step.operation || "N/A"}
        </div>
      </div>

      {(currentMin !== undefined || minValue !== undefined) && (
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center flex flex-col justify-center">
          <h3 className="font-semibold text-green-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
            Current Minimum
          </h3>
          <div className="font-mono text-xl font-bold text-green-400">
            {currentMin !== undefined ? currentMin : minValue}
          </div>
        </div>
      )}

      <div className="sm:col-span-3 bg-gray-805/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-xs">
          Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity</span>
            <p className="text-gray-400">O(1) for push, pop, top, getMin operations.</p>
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(N) to store auxiliary minimum values alongside stack values.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Min Stack"
      description="Design a stack that supports retrieving the minimum element in constant time (LeetCode #155)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={step.line}
      message={message || "Min Stack initialized"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      {isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-955/40 p-6 rounded-xl border border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-blue-300 mb-4 text-center select-none">Main Stack</h3>
            <div className="flex flex-col-reverse items-center gap-2 min-h-[300px] justify-end pt-4">
              {stack.length === 0 ? (
                <div className="text-gray-500 italic py-8 text-xs select-none">Empty Stack</div>
              ) : (
                stack.map((value, index) => (
                  <div
                    key={index}
                    className={`w-40 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-300 ${
                      index === stack.length - 1
                        ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30 scale-105"
                        : "bg-gray-800 text-gray-300 border border-gray-700"
                    }`}
                  >
                    {value}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-green-300 mb-4 text-center select-none">Min Stack (Helper)</h3>
            <div className="flex flex-col-reverse items-center gap-2 min-h-[300px] justify-end pt-4">
              {minStack.length === 0 ? (
                <div className="text-gray-500 italic py-8 text-xs select-none">Empty Stack</div>
              ) : (
                minStack.map((value, index) => (
                  <div
                    key={index}
                    className={`w-40 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-all duration-300 ${
                      index === minStack.length - 1
                        ? "bg-gradient-to-br from-green-500 to-green-700 text-white shadow-md shadow-green-500/30 scale-105"
                        : "bg-gray-800 text-gray-300 border border-gray-700"
                    }`}
                  >
                    {value}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
          <p className="text-gray-400 text-sm">Click "Load & Visualize" to begin.</p>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default MinStack;
