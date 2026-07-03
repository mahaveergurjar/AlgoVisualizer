import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const formatBinary = (num, bits) => {
  if (num === null || num === undefined) return "-".repeat(bits);
  const mask = (1n << BigInt(bits)) - 1n;
  const bn = BigInt(num) & mask;
  let s = bn.toString(2);
  if (s.length > bits) s = s.slice(-bits);
  return s.padStart(bits, "0");
};

const SingleNumber = () => {
  const [numsInput, setNumsInput] = useState("2,2,1,3,3,4,4");
  const [bitWidth, setBitWidth] = useState(8);
  const [nums, setNums] = useState([]);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((arr, bits) => {
    const newHistory = [];
    let accumulator = 0;
    let stepCount = 0;

    // Initial state
    newHistory.push({
      index: null,
      before: accumulator,
      current: null,
      after: accumulator,
      explanation: "🚀 Starting XOR Algorithm. Initializing accumulator to 0",
      binBefore: formatBinary(accumulator, bits),
      binCurrent: null,
      binAfter: formatBinary(accumulator, bits),
      line: 2,
      status: "initial",
      step: stepCount++,
    });

    // Process each number
    for (let i = 0; i < arr.length; i++) {
      const currentNum = arr[i];
      
      // Before XOR
      newHistory.push({
        index: i,
        before: accumulator,
        current: currentNum,
        after: null,
        explanation: `Checking element at index ${i} (value: ${currentNum}). Ready to XOR.`,
        binBefore: formatBinary(accumulator, bits),
        binCurrent: formatBinary(currentNum, bits),
        binAfter: null,
        line: 3,
        status: "before",
        step: stepCount++,
      });

      // Perform XOR
      const result = accumulator ^ currentNum;
      newHistory.push({
        index: i,
        before: accumulator,
        current: currentNum,
        after: result,
        explanation: `XOR Operation: ${accumulator} ^ ${currentNum} = ${result}.`,
        binBefore: formatBinary(accumulator, bits),
        binCurrent: formatBinary(currentNum, bits),
        binAfter: formatBinary(result, bits),
        line: 4,
        status: "operation",
        step: stepCount++,
      });

      accumulator = result;

      // Show intermediate result
      if (i < arr.length - 1) {
        newHistory.push({
          index: i,
          before: accumulator,
          current: null,
          after: accumulator,
          explanation: `Accumulator updated to: ${accumulator}. Moving to next element.`,
          binBefore: formatBinary(accumulator, bits),
          binCurrent: null,
          binAfter: formatBinary(accumulator, bits),
          line: 3,
          status: "intermediate",
          step: stepCount++,
        });
      }
    }

    // Final state
    newHistory.push({
      index: arr.length - 1,
      before: accumulator,
      current: null,
      after: accumulator,
      explanation: `🎉 Algorithm Complete! The single number is: ${accumulator}`,
      binBefore: formatBinary(accumulator, bits),
      binCurrent: null,
      binAfter: formatBinary(accumulator, bits),
      line: 6,
      status: "final",
      step: stepCount++,
    });

    load(newHistory);
  }, [load]);

  const handleLoad = useCallback((customArrInput) => {
    const rawInput = customArrInput !== undefined ? customArrInput : numsInput;
    const arr = rawInput
      .split(",")
      .map(s => parseInt(s.trim(), 10))
      .filter(num => !isNaN(num));

    if (arr.length === 0) {
      alert("Please enter valid comma-separated integers");
      return;
    }

    const frequency = {};
    arr.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    
    const singles = Object.keys(frequency).filter(num => frequency[num] === 1);
    if (singles.length !== 1) {
      alert("Please ensure there's exactly one number that appears once, and all others appear twice");
      return;
    }

    setNums(arr);
    setNumsInput(arr.join(', '));
    generateHistory(arr, bitWidth);
  }, [numsInput, bitWidth, generateHistory]);

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 3) + 4; // 4-6 elements
    const pairs = Array.from({ length: Math.floor(length / 2) }, () => Math.floor(Math.random() * 50) + 1);
    
    const array = [];
    pairs.forEach(num => {
      array.push(num, num);
    });
    
    let single;
    do {
      single = Math.floor(Math.random() * 50) + 1;
    } while (pairs.includes(single));
    array.push(single);
    
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    setNumsInput(array.join(', '));
    visualizer.reset();
  };

  const {
    line,
    before = 0,
    current = null,
    after = null,
    index = null,
    binBefore = "",
    binCurrent = "",
    binAfter = ""
  } = currentState;

  const getCellColor = (idx) => {
    if (idx === index) {
      return "bg-gradient-to-br from-amber-500 to-yellow-600 text-white border-amber-500 shadow-lg shadow-amber-500/50 scale-110";
    }
    if (index !== null && idx < index) {
      return "bg-gray-700/80 border-gray-650 text-gray-300";
    }
    return "bg-gray-800 border-gray-700 text-gray-400";
  };

  const codeContent = {
    1: `int singleNumber(vector<int>& nums) {`,
    2: `    int result = 0;`,
    3: `    for (int x : nums) {`,
    4: `        result ^= x;`,
    5: `    }`,
    6: `    return result;`,
    7: `}`
  };

  const inputSection = (
    <>
      <input
        type="text"
        value={numsInput}
        onChange={(e) => setNumsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[200px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
        placeholder="e.g. 2,2,1,3,3"
      />
      <select
        value={bitWidth}
        onChange={(e) => setBitWidth(parseInt(e.target.value))}
        disabled={isLoaded}
        className="w-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
      >
        <option value={8}>8-bit</option>
        <option value={16}>16-bit</option>
        <option value={32}>32-bit</option>
      </select>
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Solve
          </button>
          <button
            onClick={generateRandomArray}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Random
          </button>
        </>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Accumulator
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {after ?? before ?? 0}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Current Element
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {current !== null ? current : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Index
        </h4>
        <div className="text-3xl font-mono text-emerald-300">
          {index !== null ? index : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N)</span> - single pass.
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span> auxiliary.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Single Number"
      description="Find the element that appears only once in an array where every other element appears twice."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter comma-separated numbers to begin."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 space-y-6">
          <div className="flex gap-4 justify-center flex-wrap">
            {nums.map((num, idx) => (
              <div
                key={idx}
                className={`min-w-[96px] p-4 rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-all duration-300 ${getCellColor(idx)}`}
              >
                <div className="text-2xl mb-1">{num}</div>
                <div className="text-xs font-mono opacity-80 break-all text-center">
                  {formatBinary(num, bitWidth)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400 mb-2">Before XOR</div>
              <div className="text-2xl font-mono text-cyan-400 mb-2">
                {before}
              </div>
              <div className="text-xs font-mono text-gray-300 bg-gray-950 p-2 rounded break-all">
                {binBefore}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400 mb-2">Current Element</div>
              <div className="text-2xl font-mono text-amber-400 mb-2">
                {current !== null ? current : "-"}
              </div>
              <div className="text-xs font-mono text-gray-300 bg-gray-950 p-2 rounded break-all">
                {binCurrent || "-"}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400 mb-2">After XOR</div>
              <div className="text-2xl font-mono text-green-400 mb-2">
                {after !== null ? after : before}
              </div>
              <div className="text-xs font-mono text-gray-300 bg-gray-950 p-2 rounded break-all">
                {binAfter || binBefore}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default SingleNumber;