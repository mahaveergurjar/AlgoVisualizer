import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const PowerOfTwo = () => {
  const defaultNumber = 16;
  const [inputNumber, setInputNumber] = useState(defaultNumber.toString());

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generatePowerOfTwoHistory = useCallback((num) => {
    const hist = [];
    const binary = num > 0 ? num.toString(2).padStart(Math.ceil(Math.log2(num + 1)), '0') : '0';
    
    // Initial state
    hist.push({
      number: num,
      binary,
      message: `Checking if ${num} is a power of 2. A number is a power of 2 if it can be expressed as 2^x for some integer x`,
      phase: "init",
      result: null,
      line: 1
    });

    // Check if number is positive
    if (num <= 0) {
      hist.push({
        number: num,
        binary,
        message: `${num} is not positive. Only positive numbers can be powers of 2`,
        phase: "negative",
        result: false,
        line: 2
      });
      return hist;
    }

    hist.push({
      number: num,
      binary,
      message: `✓ Number is positive. Binary representation: ${binary}`,
      phase: "show-binary",
      result: null,
      line: 3
    });

    const nMinus1 = num - 1;
    const nMinus1Binary = nMinus1.toString(2).padStart(binary.length, '0');

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      message: `Calculate n - 1:\n${num} - 1 = ${nMinus1}`,
      phase: "subtract",
      result: null,
      line: 3
    });

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      message: `Binary of (n-1): ${nMinus1Binary}`,
      phase: "show-n-minus-1",
      result: null,
      line: 3
    });

    const andResult = num & nMinus1;
    const andBinary = andResult.toString(2).padStart(binary.length, '0');

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      andResult,
      andBinary,
      message: `Perform bitwise AND operation:\nn & (n-1) = ${num} & ${nMinus1} = ${andResult}`,
      phase: "and-operation",
      result: null,
      line: 3
    });

    const isPowerOfTwo = andResult === 0;

    hist.push({
      number: num,
      nMinus1,
      binary,
      nMinus1Binary,
      andResult,
      andBinary,
      message: isPowerOfTwo 
        ? `✓ SUCCESS: ${num} & ${nMinus1} = 0\n${num} IS a power of 2! 🎉`
        : `✗ FAILED: ${num} & ${nMinus1} = ${andResult} ≠ 0\n${num} is NOT a power of 2`,
      phase: "complete",
      result: isPowerOfTwo,
      line: 3
    });

    return hist;
  }, []);

  const handleLoad = useCallback((customNum) => {
    const num = customNum !== undefined ? customNum : parseInt(inputNumber, 10);
    if (isNaN(num)) {
      alert("Please enter a valid integer");
      return;
    }
    setInputNumber(num.toString());
    const hist = generatePowerOfTwoHistory(num);
    load(hist);
  }, [inputNumber, generatePowerOfTwoHistory, load]);

  const handleExample = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    setInputNumber(randomNum.toString());
  };

  const { 
    binary = "", 
    nMinus1Binary = "", 
    andBinary = "", 
    line,
    number: currentNum,
    nMinus1,
    andResult
  } = currentState;

  const codeContent = {
    1: `bool isPowerOfTwo(int n) {`,
    2: `    if (n <= 0) return false;`,
    3: `    return (n & (n - 1)) == 0;`,
    4: `}`
  };

  const inputSection = (
    <>
      <input
        type="number"
        value={inputNumber}
        onChange={(e) => setInputNumber(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-amber-400 shadow-sm"
        placeholder="Enter a number..."
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Check
          </button>
          <button
            onClick={handleExample}
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-amber-300 select-none">
          n
        </h4>
        <div className="text-3xl font-mono text-amber-300">
          {currentNum !== undefined ? currentNum : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-orange-300 select-none">
          n - 1
        </h4>
        <div className="text-3xl font-mono text-orange-300">
          {nMinus1 !== undefined ? nMinus1 : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          n & (n - 1)
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {andResult !== undefined ? andResult : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(1)</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Power of Two"
      description="Determine if an integer is a power of two using the bitwise AND trick."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.message || "Enter a number to check."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
          {binary && (
            <div>
              <div className="text-sm text-gray-400 mb-2">n in Binary:</div>
              <div className="flex gap-1 justify-center flex-wrap">
                {binary.split('').map((bit, index) => (
                  <div
                    key={index}
                    className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                      bit === '1' 
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-500/50" 
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {nMinus1Binary && (
            <div>
              <div className="text-sm text-gray-400 mb-2">n - 1 in Binary:</div>
              <div className="flex gap-1 justify-center flex-wrap">
                {nMinus1Binary.split('').map((bit, index) => (
                  <div
                    key={index}
                    className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                      bit === '1' 
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-500/50" 
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {andBinary && (
            <div>
              <div className="text-sm text-gray-400 mb-2">n & (n - 1) in Binary:</div>
              <div className="flex gap-1 justify-center flex-wrap">
                {andBinary.split('').map((bit, index) => (
                  <div
                    key={index}
                    className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                      bit === '1' 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50" 
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default PowerOfTwo;