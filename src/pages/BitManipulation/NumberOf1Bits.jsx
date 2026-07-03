import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const NumberOf1Bits = () => {
  const defaultNumber = 11; // Binary: 1011
  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber.toString());

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateCountHistory = useCallback((num) => {
    const hist = [];
    let n = num >>> 0; // Convert to 32-bit unsigned integer
    const binaryStr = n.toString(2).padStart(32, '0');
    let stepCount = 0;

    const addState = (props) => {
      hist.push({
        step: stepCount++,
        ...props
      });
    };

    addState({
      number: n,
      binary: binaryStr,
      count: 0,
      currentBit: null,
      tempN: n,
      message: `Starting Hamming Weight calculation for number: ${num}\nBinary: ${binaryStr}\nUsing Brian Kernighan's algorithm`,
      phase: "init",
      line: 2
    });

    let count = 0;
    let tempN = n;
    let iterations = 0;

    const initialOnes = binaryStr.split('1').length - 1;
    addState({
      number: n,
      binary: binaryStr,
      count: 0,
      currentBit: null,
      tempN,
      message: `Initial analysis: Binary has ${initialOnes} '1' bits\nNow proving algorithmically using n & (n-1) trick`,
      phase: "analysis",
      line: 3
    });

    while (tempN !== 0) {
      iterations++;
      
      const bitPosition = 31 - Math.clz32(tempN & -tempN);
      
      addState({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitPosition,
        tempN: tempN,
        message: `Iteration ${iterations}: Current value = ${tempN}\nRightmost set bit at position ${bitPosition}\nReady to clear this bit`,
        phase: "checking",
        line: 4
      });

      count++;
      addState({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitPosition,
        tempN: tempN,
        message: `Found set bit! Incrementing count: ${count - 1} → ${count}\nBit position: ${bitPosition}`,
        phase: "counting",
        line: 4
      });

      const nextTempN = tempN & (tempN - 1);
      addState({
        number: n,
        binary: binaryStr,
        count,
        currentBit: bitPosition,
        tempN: tempN,
        nextTempN,
        message: `Clearing rightmost set bit:\n${tempN} & (${tempN} - 1) = ${nextTempN}`,
        phase: "operation",
        line: 5
      });

      tempN = nextTempN;

      if (tempN !== 0) {
        addState({
          number: n,
          binary: binaryStr,
          count,
          currentBit: null,
          tempN,
          message: `Continuing... Remaining value: ${tempN}\nBinary: ${tempN.toString(2).padStart(32, '0')}`,
          phase: "shift",
          line: 3
        });
      }
    }

    addState({
      number: n,
      binary: binaryStr,
      count,
      currentBit: null,
      tempN: 0,
      message: `Algorithm Complete! Final count: ${count} '1' bits\nTotal iterations: ${iterations}`,
      phase: "complete",
      line: 7,
      isFinal: true
    });

    return hist;
  }, []);

  const handleLoad = useCallback((customNum) => {
    const num = customNum !== undefined ? customNum : parseInt(inputNumber, 10);
    if (isNaN(num) || num < 0 || num > 2147483647) {
      alert("Please enter a valid number between 0 and 2,147,483,647");
      return;
    }
    setNumber(num);
    setInputNumber(num.toString());
    const hist = generateCountHistory(num);
    load(hist);
  }, [inputNumber, generateCountHistory, load]);

  const handleNumberChange = (e) => {
    setInputNumber(e.target.value);
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    setInputNumber(randomNum.toString());
  };

  const { 
    binary = "", 
    count = 0, 
    currentBit = null, 
    tempN = 0,
    line
  } = currentState;

  const codeContent = {
    1: `int hammingWeight(uint32_t n) {`,
    2: `    int count = 0;`,
    3: `    while (n) {`,
    4: `        count++;`,
    5: `        n &= (n - 1);`,
    6: `    }`,
    7: `    return count;`,
    8: `}`
  };

  const inputSection = (
    <>
      <input
        type="number"
        value={inputNumber}
        onChange={handleNumberChange}
        disabled={isLoaded}
        min="0"
        max="2147483647"
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-cyan-400 shadow-sm"
        placeholder="Enter a positive integer..."
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Count
          </button>
          <button
            onClick={generateRandomNumber}
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
          Current Value
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {tempN}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Set Bits Count
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {count}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-amber-300 select-none">
          Active Bit
        </h4>
        <div className="text-3xl font-mono text-amber-300">
          {currentBit !== null ? currentBit : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(K)</span> - where K is the number of set bits (Hamming weight).
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
      title="Number of 1 Bits"
      description="Count the number of set bits (1s) in an unsigned integer's binary representation using Brian Kernighan's algorithm."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.message || "Enter a number to count its 1 bits."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg text-gray-300 mb-4 text-center select-none">
            32-Bit Binary Representation of {number}
          </h4>
          <div className="flex gap-2 flex-wrap justify-center mb-4">
            {binary.split('').map((bit, index) => {
              const position = 31 - index;
              const isActive = currentBit === position;
              const isSet = bit === '1';
              
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500 font-mono h-4">
                    {position % 4 === 0 ? position : ""}
                  </div>
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-mono font-bold text-sm transition-all duration-300 ${
                      isActive && isSet
                        ? "bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg shadow-green-500/50 scale-110"
                        : isActive
                        ? "bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/50 scale-105"
                        : isSet
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {bit}
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

export default NumberOf1Bits;