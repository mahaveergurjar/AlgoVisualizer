import React, { useState, useCallback } from "react";
import {
  Zap,
  Clock,
  Cpu,
  Layers,
  Calculator,
  CheckCircle,
} from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";
import VisualizerPointer from "../../components/VisualizerPointer";

const HeapifyVisualizer = () => {
  const [numsInput, setNumsInput] = useState("5,3,8,1,2,7");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHeapifyHistory = useCallback((nums) => {
    const newHistory = [];
    const arr = nums.slice();
    const n = arr.length;

    const addState = (props) =>
      newHistory.push({
        nums: arr.slice(),
        line: null,
        i: null,
        largest: null,
        left: null,
        right: null,
        comparing: [],
        swapped: [],
        focus: [],
        note: "",
        heapSize: n,
        finished: false,
        ...props,
      });

    addState({ line: 17, note: "Start building max heap" });

    const siftDown = (startIndex) => {
      let cur = startIndex;
      while (true) {
        const left = 2 * cur + 1;
        const right = 2 * cur + 2;
        let largest = cur;

        addState({
          line: 3,
          i: cur,
          largest,
          left,
          right,
          focus: [cur],
          comparing: [],
          note: `Sift-down at index ${cur}, value ${arr[cur]}`,
        });

        if (left < n) {
          addState({
            line: 6,
            i: cur,
            largest,
            left,
            right,
            focus: [cur],
            comparing: [cur, left],
            note: `Compare ${arr[cur]} and left child ${arr[left]}`,
          });
          if (arr[left] > arr[largest]) {
            largest = left;
            addState({
              line: 7,
              i: cur,
              largest,
              left,
              right,
              focus: [cur],
              comparing: [cur, left],
              note: `Left child ${arr[left]} is larger, update largest to ${largest}`,
            });
          }
        }

        if (right < n) {
          addState({
            line: 8,
            i: cur,
            largest,
            left,
            right,
            focus: [cur],
            comparing: [largest, right],
            note: `Compare largest ${arr[largest]} and right child ${arr[right]}`,
          });
          if (arr[right] > arr[largest]) {
            largest = right;
            addState({
              line: 9,
              i: cur,
              largest,
              left,
              right,
              focus: [cur],
              comparing: [largest, right],
              note: `Right child ${arr[right]} is larger, update largest to ${largest}`,
            });
          }
        }

        if (largest !== cur) {
          addState({
            line: 11,
            i: cur,
            largest,
            left,
            right,
            focus: [cur],
            comparing: [cur, largest],
            note: `Largest index is ${largest} (value ${arr[largest]}), which is different from current index ${cur}. Swap needed.`,
          });

          [arr[cur], arr[largest]] = [arr[largest], arr[cur]];
          addState({
            line: 12,
            i: cur,
            largest,
            left,
            right,
            focus: [cur],
            swapped: [cur, largest],
            note: `Swapped ${arr[largest]} and ${arr[cur]}`,
          });

          addState({
            line: 13,
            i: largest,
            largest,
            left,
            right,
            focus: [largest],
            note: `Recursively heapify subtree at index ${largest}`,
          });

          cur = largest;
        } else {
          addState({
            line: 11,
            i: cur,
            largest,
            left,
            right,
            focus: [cur],
            note: `Largest is current index ${cur}. Subtree is already a valid max heap.`,
          });
          break;
        }
      }
    };

    for (let index = Math.floor(n / 2) - 1; index >= 0; index--) {
      addState({
        line: 18,
        i: index,
        note: `Processing non-leaf node at index ${index} (value ${arr[index]})`,
        focus: [index],
      });
      siftDown(index);
    }

    addState({
      line: 20,
      note: "Max heap built successfully!",
      finished: true,
    });

    load(newHistory);
  }, [load]);

  const loadArray = () => {
    const localNums = numsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    if (localNums.some(isNaN) || localNums.length === 0) {
      alert("Invalid array input. Please use comma-separated numbers.");
      return;
    }
    generateHeapifyHistory(localNums);
  };

  const generateNewArray = () => {
    const n = Math.floor(Math.random() * 4) + 5;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 1);
    setNumsInput(arr.join(","));
    visualizer.reset();
  };

  const codeContent = {
    1: "void heapify(vector<int>& a, int n, int i) {",
    2: "    int largest = i;",
    3: "    int l = 2*i + 1;",
    4: "    int r = 2*i + 2;",
    5: "",
    6: "    if (l < n && a[l] > a[largest])",
    7: "        largest = l;",
    8: "    if (r < n && a[r] > a[largest])",
    9: "        largest = r;",
    10: "",
    11: "    if (largest != i) {",
    12: "        swap(a[i], a[largest]);",
    13: "        heapify(a, n, largest);",
    14: "    }",
    15: "}",
    16: "",
    17: "void buildHeap(vector<int>& a, int n) {",
    18: "    for (int i = n/2 - 1; i >= 0; i--)",
    19: "        heapify(a, n, i);",
    20: "}"
  };

  const inputSection = (
    <>
      <div className="flex items-center gap-4 flex-grow">
        <label htmlFor="array-input" className="font-medium text-gray-300 font-mono text-sm whitespace-nowrap">
          Array:
        </label>
        <input
          id="array-input"
          type="text"
          value={numsInput}
          onChange={(e) => setNumsInput(e.target.value)}
          disabled={isLoaded}
          className="font-mono flex-grow bg-gray-950 border border-gray-750 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </div>
      {!isLoaded && (
        <div className="flex items-center gap-2">
          <button
            onClick={loadArray}
            className="bg-teal-550 hover:bg-teal-650 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={generateNewArray}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
          >
            New Array
          </button>
        </div>
      )}
    </>
  );

  const state = currentState || {};
  const { nums = [], line, note, comparing = [], swapped = [], focus = [], i, largest, left, right, finished } = state;

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center justify-center gap-2 select-none text-sm">
          <Calculator size={16} /> Current State
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-left text-gray-300">
          <div>i: <span className="font-bold text-yellow-400">{i ?? "N/A"}</span></div>
          <div>largest: <span className="font-bold text-yellow-400">{largest ?? "N/A"}</span></div>
          <div>left: <span className="font-bold text-yellow-400">{left ?? "N/A"}</span></div>
          <div>right: <span className="font-bold text-yellow-400">{right ?? "N/A"}</span></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50">
        <h3 className="font-semibold text-purple-300 mb-1 flex items-center gap-2 select-none text-sm">
          <Layers size={16} /> Operation Detail
        </h3>
        <div className="text-gray-300 text-xs h-12 overflow-y-auto font-mono">
          {note || "Waiting for visualization..."}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center flex flex-col justify-center">
        <h3 className="font-semibold text-green-300 mb-1 flex items-center justify-center gap-2 select-none text-sm">
          <CheckCircle size={16} /> Status
        </h3>
        <div className="font-mono text-lg font-bold text-green-400">
          {finished ? "Max Heap Built!" : "Building Heap..."}
        </div>
      </div>

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-sm">
          Complexity & Approach
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-green-400 font-bold block mb-1">Time Complexity</span>
            <p className="text-gray-400">O(N) to build the heap.</p>
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-blue-400 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(1) in-place auxiliary space.</p>
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-purple-400 font-bold block mb-1">Approach</span>
            <p className="text-gray-400">Bottom-up heapify construction.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Heapify (Build Heap)"
      description="Construct a Binary Max Heap from an array of integers"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={note || "Load an array to begin heapify visualization"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-8 bg-gray-900/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-800">
        {/* Array Representation */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-4 select-none">Array Representation:</h4>
          <div id="heap-array-container" className="w-full flex justify-center items-center gap-2 flex-wrap min-h-20 pb-4">
            {nums.map((num, index) => (
              <div
                key={index}
                id={`heap-array-container-element-${index}`}
                className={`w-14 h-14 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all duration-300 ${
                  swapped.includes(index)
                    ? "bg-green-600/40 border-green-400 scale-105 shadow-lg shadow-green-500/30"
                    : comparing.includes(index)
                    ? "bg-yellow-600/40 border-yellow-400 scale-105 shadow-lg shadow-yellow-500/30"
                    : focus.includes(index)
                    ? "bg-blue-600/40 border-blue-400 scale-105 shadow-lg shadow-blue-500/30"
                    : "bg-gray-800 border-gray-700"
                } ${finished ? "!border-green-500" : ""}`}
              >
                {num}
              </div>
            ))}
          </div>
          {isLoaded && (
            <div className="relative h-6 mt-1 select-none">
              <VisualizerPointer index={i} containerId="heap-array-container" color="amber" label="i" direction="up" />
              <VisualizerPointer index={largest} containerId="heap-array-container" color="cyan" label="largest" direction="up" />
              <VisualizerPointer index={left} containerId="heap-array-container" color="violet" label="left" direction="up" />
              <VisualizerPointer index={right} containerId="heap-array-container" color="rose" label="right" direction="up" />
            </div>
          )}
        </div>

        {/* Tree/Bar Chart Structure Representation */}
        <div className="text-center pt-4 border-t border-gray-800/60">
          <h4 className="text-sm font-semibold text-gray-400 mb-6 select-none text-left">Visual Tree/Bar Representation:</h4>
          <div className="flex justify-center items-end gap-6 min-h-[220px]">
            {nums.map((value, index) => {
              const isComparing = comparing.includes(index);
              const isSwapped = swapped.includes(index);
              const isFocus = focus.includes(index);

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-gray-500 text-xs font-mono select-none">[{index}]</div>
                  <div
                    className={`w-10 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                      isSwapped
                        ? "bg-green-500/30 border-green-400 scale-110 shadow-lg shadow-green-500/25"
                        : isComparing
                        ? "bg-yellow-500/30 border-yellow-400 scale-105 shadow-lg shadow-yellow-500/25"
                        : isFocus
                        ? "bg-blue-500/30 border-blue-400 scale-105 shadow-lg shadow-blue-500/25"
                        : "bg-gray-800 border-gray-750"
                    }`}
                    style={{ height: `${value * 8 + 30}px` }}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default HeapifyVisualizer;