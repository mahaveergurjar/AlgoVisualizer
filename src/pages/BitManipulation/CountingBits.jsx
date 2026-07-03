import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const BinaryVisualization = ({ number, bitWidth = 8, isActive = false }) => {
  const binary = number.toString(2).padStart(bitWidth, '0');
  const activeBits = number.toString(2).split('').filter(bit => bit === '1').length;

  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400 scale-105 shadow-lg shadow-purple-500/50 text-white" 
        : "bg-gray-800 border-gray-700 text-gray-200"
    }`}>
      <div className="text-center">
        <div className="text-2xl font-bold mb-2">{number}</div>
        <div className="text-xs font-mono text-gray-400 mb-3 break-all">Binary: {binary}</div>
        <div className="flex justify-center gap-1 mb-3 flex-wrap">
          {binary.split('').map((bit, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${
                bit === '1' 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                  : 'bg-gray-650 text-gray-300'
              }`}
            >
              {bit}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-300">
          → <span className="text-green-400 font-bold">{activeBits}</span> set bit{activeBits !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

const CountingBits = () => {
  const [nInput, setNInput] = useState("5");
  const [bitWidth, setBitWidth] = useState(8);

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customN) => {
    const maxN = customN !== undefined ? customN : parseInt(nInput, 10);
    if (isNaN(maxN) || maxN < 0 || maxN > 20) {
      alert("Please enter a valid number between 0 and 20 for visualization.");
      return;
    }
    setNInput(maxN.toString());

    const newHistory = [];
    const results = [];
    let stepCount = 0;

    const countBits = (num) => {
      let count = 0;
      let temp = num;
      while (temp) {
        count += temp & 1;
        temp >>>= 1;
      }
      return count;
    };

    const addState = (currentNum = null, binary = "", bitCount = null, explanation = "", line = null, extraProps = {}) => {
      newHistory.push({
        currentNum,
        binary,
        bitCount,
        results: [...results],
        explanation,
        line,
        step: stepCount++,
        ...extraProps,
      });
    };

    addState(
      null, "", null, 
      "Starting Counting Bits Algorithm. Counting set bits for numbers from 0 to " + maxN,
      1,
      { phase: "init" }
    );

    addState(
      null, "", null,
      `Problem: Generate array ans where ans[i] = number of 1's in binary representation of i. Range: 0 to ${maxN}`,
      2,
      { phase: "problem" }
    );

    for (let i = 0; i <= maxN; i++) {
      const binaryStr = i.toString(2).padStart(bitWidth, '0');
      const bCount = countBits(i);
      
      addState(
        i, binaryStr, bCount,
        `Processing number ${i} (Binary: ${binaryStr}). Starting bit count calculation...`,
        4,
        { phase: "processing" }
      );

      if (i > 0) {
        let temp = i;
        let steps = 0;
        while (temp) {
          const prevTemp = temp;
          temp = temp & (temp - 1);
          steps++;
          
          addState(
            i, binaryStr, bCount,
            `Brian Kernighan's step ${steps}: ${prevTemp} & (${prevTemp} - 1) = ${temp}. Remaining bits: ${temp.toString(2).padStart(bitWidth, '0')}`,
            13,
            { phase: "counting", substep: steps }
          );
        }
      }

      results.push({ num: i, binary: binaryStr, count: bCount });
      
      addState(
        i, binaryStr, bCount,
        `Completed: ${i} → ${bCount} set bits. Binary: ${binaryStr} has ${bCount} '1' bits.`,
        5,
        { phase: "result", isComplete: i === maxN }
      );
    }

    addState(
      null, "", null,
      `Algorithm Complete! Generated array: [${results.map(r => r.count).join(', ')}]`,
      6,
      { phase: "complete", isFinal: true }
    );

    load(newHistory);
  }, [nInput, bitWidth, load]);

  const {
    line,
    currentNum = null,
    binary = "",
    bitCount = null,
    results = []
  } = currentState;

  const codeContent = {
    1: `vector<int> countBits(int n) {`,
    2: `    vector<int> ans(n + 1);`,
    3: `    for (int i = 0; i <= n; i++) {`,
    4: `        ans[i] = countOnes(i);`,
    5: `    }`,
    6: `    return ans;`,
    7: `}`,
    8: ``,
    9: `int countOnes(int x) {`,
    10: `    int count = 0;`,
    11: `    while (x) {`,
    12: `        count++;`,
    13: `        x &= (x - 1); // Brian Kernighan's`,
    14: `    }`,
    15: `    return count;`,
    16: `}`
  };

  const inputSection = (
    <>
      <input
        type="number"
        value={nInput}
        onChange={(e) => setNInput(e.target.value)}
        disabled={isLoaded}
        min="0"
        max="20"
        className="w-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-purple-400 shadow-sm text-center"
        placeholder="n"
      />
      <select
        value={bitWidth}
        onChange={(e) => setBitWidth(parseInt(e.target.value))}
        disabled={isLoaded}
        className="w-28 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-purple-400 shadow-sm"
      >
        <option value={4}>4-bit</option>
        <option value={8}>8-bit</option>
        <option value={16}>16-bit</option>
      </select>
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={() => handleLoad(5)}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl font-medium transition-all cursor-pointer"
          >
            Default
          </button>
        </>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Current Number
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {currentNum !== null ? currentNum : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Set Bits Count
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {bitCount !== null ? bitCount : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Processed
        </h4>
        <div className="text-3xl font-mono text-emerald-300">
          {results.length}/{parseInt(nInput) + 1}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N × log N)</span> - or O(N × K) where K is number of set bits.
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
      title="Counting Bits"
      description="Calculate the number of 1's in the binary representation of all integers from 0 to n."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter a number n and bit-width to begin."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        {currentNum !== null && (
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-750 overflow-x-auto text-center">
            <h4 className="text-lg text-gray-300 mb-4 select-none">
              Current Number: {currentNum} (Binary: {binary})
            </h4>
            <div className="flex justify-center gap-2 mb-4 flex-wrap min-w-fit mx-auto" style={{ maxWidth: 'fit-content' }}>
              {binary.split('').map((bit, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-1 font-mono">2<sup>{bitWidth - 1 - index}</sup></div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                    bit === '1' 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 scale-110' 
                      : 'bg-gray-600 text-gray-350'
                  }`}>
                    {bit}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-400">
              Total set bits: <span className="text-green-400 font-bold">{bitCount}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-750">
          <h4 className="text-lg text-gray-300 mb-4 select-none">
            Results Array
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((result) => (
              <BinaryVisualization
                key={result.num}
                number={result.num}
                bitCount={result.count}
                bitWidth={bitWidth}
                isActive={result.num === currentNum}
              />
            ))}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default CountingBits;