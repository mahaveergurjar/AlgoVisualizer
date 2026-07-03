import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu, ArrowLeftRight } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "void reverseString(vector<char>& s) {",
  2: "    int left = 0;",
  3: "    int right = s.size() - 1;",
  4: "    while (left < right) {",
  5: "        swap(s[left], s[right]);",
  6: "        left++;",
  7: "        right--;",
  8: "    }",
  9: "}"
};

const generateHistory = (str) => {
  const steps = [];
  const charArray = str.split('');
  
  let left = 0;
  let right = charArray.length - 1;
  let swaps = [];
  
  // Step 1: Initialize left = 0
  steps.push({
    line: 2,
    leftPointer: left,
    rightPointer: right,
    chars: [...charArray],
    currentSwap: null,
    swapHistory: [...swaps],
    explanation: "Initialize left pointer to 0 (start of string)."
  });

  // Step 2: Initialize right = s.size() - 1
  steps.push({
    line: 3,
    leftPointer: left,
    rightPointer: right,
    chars: [...charArray],
    currentSwap: null,
    swapHistory: [...swaps],
    explanation: `Initialize right pointer to ${right} (last index of string).`
  });

  let loopCheck = true;
  while (left < right) {
    // Step 3a: loop header (while (left < right))
    steps.push({
      line: 4,
      leftPointer: left,
      rightPointer: right,
      chars: [...charArray],
      currentSwap: null,
      swapHistory: [...swaps],
      explanation: `Check loop condition: left (${left}) < right (${right}) is true.`
    });

    const swapObj = {
      left,
      right,
      leftChar: charArray[left],
      rightChar: charArray[right]
    };
    
    // Step 3b: swap
    const temp = charArray[left];
    charArray[left] = charArray[right];
    charArray[right] = temp;
    swaps.push(swapObj);

    steps.push({
      line: 5,
      leftPointer: left,
      rightPointer: right,
      chars: [...charArray],
      currentSwap: swapObj,
      swapHistory: [...swaps],
      explanation: `Swap character at left index s[${left}] ('${swapObj.leftChar}') with right index s[${right}] ('${swapObj.rightChar}').`
    });

    // Step 3c: left++
    left++;
    steps.push({
      line: 6,
      leftPointer: left,
      rightPointer: right,
      chars: [...charArray],
      currentSwap: swapObj,
      swapHistory: [...swaps],
      explanation: `Increment left pointer to ${left}.`
    });

    // Step 3d: right--
    right--;
    steps.push({
      line: 7,
      leftPointer: left,
      rightPointer: right,
      chars: [...charArray],
      currentSwap: swapObj,
      swapHistory: [...swaps],
      explanation: `Decrement right pointer to ${right}.`
    });
  }

  if (loopCheck) {
    // Final loop check: left < right is false
    steps.push({
      line: 4,
      leftPointer: left,
      rightPointer: right,
      chars: [...charArray],
      currentSwap: null,
      swapHistory: [...swaps],
      explanation: `Loop check: left (${left}) < right (${right}) is now false (pointers met or crossed).`
    });

    // Step 4: finished
    steps.push({
      line: 9,
      leftPointer: left,
      rightPointer: right,
      chars: [...charArray],
      currentSwap: null,
      swapHistory: [...swaps],
      explanation: `Algorithm finished. String has been reversed in-place.`
    });
  }

  return steps;
};

const ReverseString = ({ navigate }) => {
  const [inputString, setInputString] = useState("hello");
  const [loadedString, setLoadedString] = useState("hello");
  const visualizerState = useVisualizer({ defaultSpeed: 1000 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    if (!inputString.trim()) return;
    setLoadedString(inputString);
    visualizerState.load(generateHistory(inputString));
  };

  const loadExamples = (example) => {
    const examples = {
      example1: "hello",
      example2: "world",
      example3: "algorithm",
      example4: "racecar",
      example5: "javascript",
      example6: "react"
    };
    const val = examples[example];
    setInputString(val);
    setLoadedString(val);
    visualizerState.load(generateHistory(val));
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    leftPointer = 0,
    rightPointer = 0,
    chars = loadedString.split(''),
    currentSwap = null,
    swapHistory = []
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none w-48"
          placeholder="Enter a string..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-blue-650 hover:bg-blue-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("example1")} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs hover:bg-blue-500/20 transition-all cursor-pointer">hello</button>
        <button onClick={() => loadExamples("example2")} className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-xs hover:bg-cyan-500/20 transition-all cursor-pointer">world</button>
        <button onClick={() => loadExamples("example3")} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs hover:bg-purple-500/20 transition-all cursor-pointer">algorithm</button>
        <button onClick={() => loadExamples("example4")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">racecar</button>
        <button onClick={() => loadExamples("example5")} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400 text-xs hover:bg-orange-500/20 transition-all cursor-pointer">javascript</button>
        <button onClick={() => loadExamples("example6")} className="px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 rounded text-pink-400 text-xs hover:bg-pink-500/20 transition-all cursor-pointer">react</button>
      </div>
    </div>
  );

  const statsSection = (
    <>
      {/* Pointers Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Pointers</h3>
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 text-xs font-bold mb-1">Left Pointer (left)</div>
            <div className="text-white text-lg font-mono">
              {leftPointer < chars.length ? `[${leftPointer}] = '${chars[leftPointer]}'` : "Out of bounds"}
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-purple-400 text-xs font-bold mb-1">Right Pointer (right)</div>
            <div className="text-white text-lg font-mono">
              {rightPointer >= 0 && rightPointer < chars.length ? `[${rightPointer}] = '${chars[rightPointer]}'` : "Out of bounds"}
            </div>
          </div>
        </div>
      </div>

      {/* Current Swap Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Current Swap</h3>
        <div className="h-full flex flex-col justify-center">
          {currentSwap ? (
            <div className="p-4 rounded-lg border bg-cyan-500/10 border-cyan-500/30">
              <div className="text-center font-mono">
                <div className="text-lg flex items-center justify-center gap-3">
                  <span className="text-blue-400">'{currentSwap.leftChar}'</span>
                  <ArrowLeftRight className="h-5 w-5 text-cyan-400 animate-pulse" />
                  <span className="text-purple-400">'{currentSwap.rightChar}'</span>
                </div>
                <div className="text-xs text-gray-450 mt-2">
                  Position {currentSwap.left} ↔ {currentSwap.right}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center text-sm font-medium">
              No swap active
            </div>
          )}
        </div>
      </div>

      {/* Complexity & Details Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Complexity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-green-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Time Complexity</div>
              <div className="text-gray-400">O(n) - Swap half of characters</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(1) - Reversed in place</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
        <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Problems
          </button>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Problems
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="Reverse String"
        description="Reverse characters in a string in-place using two pointers."
        isLoaded={isLoaded}
        inputSection={inputSection}
        codeContent={codeContent}
        activeLine={currentState.line || 0}
        message={currentState.explanation || ""}
        visualizerState={visualizerState}
        statsSection={statsSection}
      >
        {/* Children: String visualization content */}
        <div className="flex flex-col w-full gap-6">
          {/* Character Grids */}
          <div className="flex justify-center items-center gap-3 flex-wrap min-h-[120px]">
            {chars.map((char, index) => {
              const isLeft = index === leftPointer;
              const isRight = index === rightPointer;
              const isSwapped = swapHistory.some(h => h.left === index || h.right === index);
              
              let charColorClass = "bg-gray-800 border-gray-600";
              if (isLeft) {
                charColorClass = "bg-blue-500/30 border-blue-400 scale-110 shadow-lg shadow-blue-500/25 animate-pulse";
              } else if (isRight) {
                charColorClass = "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25 animate-pulse";
              } else if (isLoaded && (leftPointer >= rightPointer)) {
                charColorClass = "bg-green-500/20 border-green-400";
              } else if (isSwapped) {
                charColorClass = "bg-cyan-500/20 border-cyan-400";
              }

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-gray-400 text-xs font-mono">[{index}]</div>
                  <div className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${charColorClass}`}>
                    <span className="text-white font-bold text-xl font-mono">{char}</span>
                  </div>
                  <div className="text-[10px] font-bold h-4">
                    {isLeft && <span className="text-blue-400">LEFT</span>}
                    {isRight && <span className="text-purple-400">RIGHT</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Original vs Reversed Display */}
          <div className="bg-gray-950/45 rounded-xl border border-gray-800/40 p-4">
            <div className="grid grid-cols-2 gap-4 text-center font-mono">
              <div>
                <div className="text-gray-400 text-xs mb-1">Original:</div>
                <div className="text-gray-250 text-base">{loadedString}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Reversed:</div>
                <div className={`text-base transition-colors ${
                  leftPointer >= rightPointer ? "text-green-400 font-bold" : "text-gray-250"
                }`}>
                  {chars.join('')}
                </div>
              </div>
            </div>
          </div>

          {/* Swap History */}
          {swapHistory.length > 0 && (
            <div className="bg-gray-950/30 rounded-xl p-4 border border-gray-800/60 max-h-40 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Swap History</h4>
              <div className="space-y-1">
                {swapHistory.map((swap, idx) => (
                  <div key={idx} className="p-2 rounded border bg-cyan-500/10 border-cyan-500/20 text-xs font-mono flex items-center justify-between">
                    <span>
                      Step {idx + 1}: swap s[{swap.left}]='{swap.leftChar}' ↔ s[{swap.right}]='{swap.rightChar}'
                    </span>
                    <span className="text-cyan-400">Swapped ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </VisualizerLayout>
    </div>
  );
};

export default ReverseString;