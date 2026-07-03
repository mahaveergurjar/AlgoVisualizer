import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const ReverseBits = () => {
  const defaultNumber = 43261596; // Binary: 00000010100101000001111010011100
  const [number, setNumber] = useState(defaultNumber);
  const [inputNumber, setInputNumber] = useState(defaultNumber.toString());

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateReverseHistory = useCallback((num) => {
    const hist = [];
    const n = num >>> 0;
    const originalBinary = n.toString(2).padStart(32, '0');
    
    // Initial state
    hist.push({
      original: n,
      originalBinary,
      result: 0,
      resultBinary: '0'.repeat(32),
      currentBit: null,
      message: `Starting bit reversal for number: ${num}\nBinary: ${originalBinary}`,
      phase: "init",
      line: 2
    });

    let result = 0;
    let tempN = n;

    for (let i = 0; i < 32; i++) {
      const bit = tempN & 1;
      
      // Reading bit step
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Reading bit ${i} from right → ${bit}`,
        phase: "reading",
        line: 5
      });

      // Shift result left
      result = result << 1;
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Shifted result left`,
        phase: "shifting",
        line: 4
      });

      // Add current bit
      result = result | bit;
      hist.push({
        original: n,
        originalBinary,
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Added bit ${bit} to result`,
        phase: "adding",
        line: 5
      });

      // Shift original right
      tempN = tempN >>> 1;
      hist.push({
        original: n,
        originalBinary: tempN.toString(2).padStart(32, '0'),
        result,
        resultBinary: result.toString(2).padStart(32, '0'),
        currentBit: i,
        bit,
        message: `Step ${i + 1}: Shifted original number right`,
        phase: "shifting_original",
        line: 6
      });
    }

    // Final state
    hist.push({
      original: n,
      originalBinary,
      result,
      resultBinary: result.toString(2).padStart(32, '0'),
      currentBit: null,
      message: `🎉 Bit Reversal Complete!\nOriginal: ${n} → Reversed: ${result}`,
      phase: "complete",
      line: 8
    });

    return hist;
  }, []);

  const handleLoad = useCallback((customNum) => {
    const num = customNum !== undefined ? customNum : parseInt(inputNumber, 10);
    if (isNaN(num) || num < 0 || num > 4294967295) {
      alert("Please enter a valid 32-bit unsigned integer (0 to 4,294,967,295)");
      return;
    }
    setNumber(num);
    setInputNumber(num.toString());
    const hist = generateReverseHistory(num);
    load(hist);
  }, [inputNumber, generateReverseHistory, load]);

  const handleExample = () => {
    const randomNum = Math.floor(Math.random() * 4294967296);
    setInputNumber(randomNum.toString());
  };

  const { 
    originalBinary = "", 
    resultBinary = "", 
    currentBit = null, 
    result = 0,
    line
  } = currentState;

  const codeContent = {
    1: `uint32_t reverseBits(uint32_t n) {`,
    2: `    uint32_t result = 0;`,
    3: `    for (int i = 0; i < 32; i++) {`,
    4: `        result <<= 1;`,
    5: `        result |= (n & 1);`,
    6: `        n >>= 1;`,
    7: `    }`,
    8: `    return result;`,
    9: `}`
  };

  const inputSection = (
    <>
      <input
        type="number"
        value={inputNumber}
        onChange={(e) => setInputNumber(e.target.value)}
        disabled={isLoaded}
        min="0"
        max="4294967295"
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-indigo-500 shadow-sm"
        placeholder="Enter a number..."
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Reverse
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-indigo-300 select-none">
          Original
        </h4>
        <div className="text-3xl font-mono text-indigo-300">
          {number}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Reversed Result
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {result}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Bit Index
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {currentBit !== null ? currentBit : "-"}
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
      title="Reverse Bits"
      description="Reverse bits of a given 32-bit unsigned integer using bitwise operations."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.message || "Enter a number to reverse its bits."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full space-y-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 space-y-6">
          <div>
            <h4 className="text-sm text-gray-400 mb-2 select-none">Original Binary:</h4>
            <div className="flex gap-1 justify-center flex-wrap">
              {originalBinary.split('').map((bit, index) => {
                const position = 31 - index;
                const isCurrentBit = currentBit !== null && position === currentBit;
                return (
                  <div
                    key={index}
                    className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                      isCurrentBit 
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-110 border-2 border-yellow-400" 
                        : bit === '1' 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-700 text-gray-405"
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm text-gray-400 mb-2 select-none">Reversed Binary:</h4>
            <div className="flex gap-1 justify-center flex-wrap">
              {resultBinary.split('').map((bit, index) => (
                <div
                  key={index}
                  className={`w-8 h-10 flex items-center justify-center rounded font-mono text-sm font-bold transition-all duration-300 ${
                    bit === '1' 
                      ? "bg-purple-600 text-white" 
                      : "bg-gray-700 text-gray-405"
                  }`}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default ReverseBits;