import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const KthMissingNumber = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("2,3,4,7,11");
  const [kInput, setKInput] = useState("5");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((array, targetK) => {
    const newHistory = [];

    const addState = (props) =>
      newHistory.push({
        arr: [...array],
        k: targetK,
        current: 1,
        i: 0,
        missing: 0,
        line: 2,
        explanation: "",
        missingNumbers: [],
        result: null,
        ...props,
      });

    addState({
      line: 2,
      explanation: `Initialize: current=1, i=0, missing=0. Looking for ${targetK}th missing positive number.`,
    });

    let missing = 0;
    let current = 1;
    let i = 0;
    const missingNumbers = [];

    while (missing < targetK) {
      addState({
        current,
        i,
        missing,
        line: 3,
        missingNumbers: [...missingNumbers],
        explanation: `Check: current=${current}. Missing count=${missing}, need ${targetK}.`,
      });

      if (i < array.length && array[i] === current) {
        addState({
          current,
          i,
          missing,
          line: 4,
          missingNumbers: [...missingNumbers],
          explanation: `${current} is in array at index ${i}. Skip it.`,
        });

        i++;

        addState({
          current,
          i,
          missing,
          line: 5,
          missingNumbers: [...missingNumbers],
          explanation: `Move array pointer: i=${i}.`,
        });
      } else {
        addState({
          current,
          i,
          missing,
          line: 6,
          missingNumbers: [...missingNumbers],
          explanation: `${current} is NOT in array. It's missing!`,
        });

        missing++;
        missingNumbers.push(current);

        addState({
          current,
          i,
          missing,
          line: 7,
          missingNumbers: [...missingNumbers],
          explanation: `Missing count increased to ${missing}. Found missing: [${missingNumbers.join(
            ", "
          )}]`,
        });

        if (missing === targetK) {
          addState({
            current,
            i,
            missing,
            line: 8,
            missingNumbers: [...missingNumbers],
            result: current,
            explanation: `🎉 Found ${targetK}th missing number: ${current}!`,
          });
          load(newHistory);
          return;
        }
      }

      current++;

      addState({
        current,
        i,
        missing,
        line: 10,
        missingNumbers: [...missingNumbers],
        explanation: `Move to next number: current=${current}.`,
      });
    }

    addState({
      current: current - 1,
      i,
      missing,
      line: 12,
      missingNumbers: [...missingNumbers],
      result: current - 1,
      explanation: `Done! ${targetK}th missing positive: ${current - 1}.`,
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const array = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10));
    const kVal = parseInt(kInput, 10);

    if (array.length === 0 || array.some(isNaN) || isNaN(kVal) || kVal < 1) {
      return alert(
        "Invalid input. Enter comma-separated positive integers and k >= 1."
      );
    }

    generateHistory(array, kVal);
  };

  const {
    arr = [],
    k = 0,
    current = 1,
    i = 0,
    missing = 0,
    line = 2,
    explanation = "",
    missingNumbers = [],
    result = null
  } = currentState;

  const codeContent = {
    1: "int findKthPositive(vector<int>& arr, int k) {",
    2: "    int missing = 0, current = 1, i = 0;",
    3: "    while (missing < k) {",
    4: "        if (i < arr.size() && arr[i] == current) {",
    5: "            i++;",
    6: "        } else {",
    7: "            missing++;",
    8: "            if (missing == k) return current;",
    9: "        }",
    10: "        current++;",
    11: "    }",
    12: "    return current - 1;",
    13: "}"
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 font-mono shadow-sm"
        placeholder="sorted array (comma-separated)"
      />
      <input
        id="k-input"
        type="number"
        value={kInput}
        onChange={(e) => setKInput(e.target.value)}
        disabled={isLoaded}
        className="w-full md:w-24 p-3 bg-gray-950 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 font-mono shadow-sm"
        placeholder="k value"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-405 select-none">
          Current Positive
        </h4>
        <div className="text-3xl font-mono text-cyan-400 font-bold">
          {current}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-amber-300 select-none">
          Missing Count
        </h4>
        <div className="text-3xl font-mono text-amber-305 font-bold">
          {missing} / {k}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-pink-300 select-none">
          Result
        </h4>
        <div className={`text-3xl font-mono font-bold ${result !== null ? "text-green-400 animate-pulse" : "text-gray-400"}`}>
          {result !== null ? result : "..."}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-cyan-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n + k)</span> - linear scan of array and counting missing positive integers.
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
      title="Kth Missing Positive Number"
      description="Given a sorted array of positive integers, find the kth positive integer that is missing from this array."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter sorted array and k value, then click Load & Visualize to begin."
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
        <div className="space-y-4">
          <div className="text-gray-300 font-semibold mb-2">Sorted Input Array:</div>
          <div className="flex gap-3 flex-wrap justify-center">
            {arr.map((num, idx) => (
              <div
                key={idx}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl font-mono font-bold text-white transition-all duration-300 ${
                  i === idx
                    ? "bg-blue-500 ring-2 ring-blue-300 scale-110 shadow-lg shadow-blue-500/25"
                    : i > idx
                    ? "bg-gray-600 border border-gray-500 text-gray-350"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                <div className="text-[10px] text-gray-300">[{idx}]</div>
                <div className="text-lg">{num}</div>
              </div>
            ))}
          </div>

          <div className="text-gray-300 font-semibold mt-4 mb-2">Missing Numbers List:</div>
          <div className="flex gap-2 flex-wrap min-h-[3rem] items-center justify-center bg-gray-900/40 p-4 rounded-xl border border-gray-700/50">
            {missingNumbers.map((num, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded-lg font-mono text-sm ${
                  idx === missingNumbers.length - 1 && result === null
                    ? "bg-amber-500 text-white font-bold scale-105"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {num}
              </div>
            ))}
            {missingNumbers.length === 0 && (
              <div className="text-gray-500 italic text-sm">No missing numbers recorded yet...</div>
            )}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default KthMissingNumber;
