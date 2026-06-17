import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const SpecialArray = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("3,5,0,8,4");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((arr) => {
    const n = arr.length;
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        nums: [...arr],
        x: null,
        count: 0,
        currentIndex: null,
        line: 2,
        explanation: "",
        result: null,
        checking: [],
        ...props,
      });

    addState({
      line: 2,
      explanation: `Starting search. Array has ${n} elements. We'll check x from 0 to ${n}.`
    });

    for (let x = 0; x <= n; x++) {
      addState({
        x,
        line: 3,
        explanation: `Checking if x = ${x} is special. Need exactly ${x} numbers ≥ ${x}.`,
      });

      let count = 0;
      const checking = [];

      for (let i = 0; i < n; i++) {
        addState({
          x,
          count,
          currentIndex: i,
          line: 5,
          checking: [...checking],
          explanation: `Examining nums[${i}] = ${arr[i]}. Is ${arr[i]} ≥ ${x}?`,
        });

        if (arr[i] >= x) {
          count++;
          checking.push(i);
          addState({
            x,
            count,
            currentIndex: i,
            line: 6,
            checking: [...checking],
            explanation: `Yes! ${arr[i]} ≥ ${x}. Count increases to ${count}.`,
          });
        } else {
          addState({
            x,
            count,
            currentIndex: i,
            line: 6,
            checking: [...checking],
            explanation: `No. ${arr[i]} < ${x}. Count stays ${count}.`,
          });
        }
      }

      addState({
        x,
        count,
        line: 8,
        checking: [...checking],
        explanation: `Finished counting for x = ${x}. Found ${count} elements ≥ ${x}.`,
      });

      if (count === x) {
        addState({
          x,
          count,
          line: 8,
          checking: [...checking],
          result: x,
          explanation: `🎉 Found it! Count (${count}) equals x (${x}). Returning ${x}.`,
        });
        load(newHistory);
        return;
      } else {
        addState({
          x,
          count,
          line: 8,
          checking: [...checking],
          explanation: `Count (${count}) ≠ x (${x}). Continue searching...`,
        });
      }
    }

    addState({
      line: 10,
      result: -1,
      explanation: `No special value found. Returning -1.`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const arr = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));

    if (arr.length === 0 || arr.some(isNaN)) {
      return alert("Invalid input. Enter comma-separated numbers.");
    }

    generateHistory(arr);
  };

  const {
    nums = [],
    x = null,
    count = 0,
    currentIndex = null,
    line = 2,
    explanation = "",
    result = null,
    checking = []
  } = currentState;

  const codeContent = {
    1: "int specialArray(vector<int>& nums) {",
    2: "    int n = nums.size();",
    3: "    for (int x = 0; x <= n; x++) {",
    4: "        int count = 0;",
    5: "        for (int i = 0; i < n; i++) {",
    6: "            if (nums[i] >= x) count++;",
    7: "        }",
    8: "        if (count == x) return x;",
    9: "    }",
    10: "    return -1;",
    11: "}"
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-purple-500 font-mono shadow-sm"
        placeholder="e.g., 3,5,0,8,4"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-400 select-none">
          Testing x
        </h4>
        <div className="text-3xl font-mono text-purple-400 font-bold">
          {x !== null ? x : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-green-300 select-none">
          Count ≥ x
        </h4>
        <div className="text-3xl font-mono text-green-300">
          {count}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-350 select-none">
          Result
        </h4>
        <div className={`text-3xl font-mono font-bold ${result !== null && result !== -1 ? "text-green-400" : result === -1 ? "text-red-400" : "text-gray-400"}`}>
          {result !== null ? result : "..."}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-purple-350 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n²)</span> - check n+1 values, each requires O(n) scan.
          </div>
          <div>
            <strong>Space:</strong>{" "}
            <span className="font-mono text-teal-300">O(1)</span> - constant extra space.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Special Array Visualizer"
      description="Find a value x such that there are exactly x numbers in the array that are greater than or equal to x."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array values then click Load & Visualize to begin."
    >
      <div className="w-full space-y-6">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Searching Algorithms
          </button>
        )}
        <div className="flex gap-3 flex-wrap justify-center">
          {nums.map((num, idx) => (
            <div
              key={idx}
              className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all duration-300 ${
                currentIndex === idx
                  ? "bg-blue-500 ring-2 ring-blue-300 scale-110 shadow-lg shadow-blue-500/25"
                  : checking?.includes(idx)
                  ? "bg-green-600 scale-105"
                  : "bg-gray-700"
              }`}
            >
              <div className="text-[10px] text-gray-300">[{idx}]</div>
              <div className="text-lg">{num}</div>
            </div>
          ))}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SpecialArray;