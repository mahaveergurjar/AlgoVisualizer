import React, { useState, useEffect } from "react";
import { ArrowLeft, Hash, Zap, Cpu, Clock } from "lucide-react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const codeContent = {
  1: "bool isPalindrome(string s) {",
  2: "    int left = 0;",
  3: "    int right = s.length() - 1;",
  4: "    while (left < right) {",
  5: "        if (s[left] != s[right]) {",
  6: "            return false;",
  7: "        }",
  8: "        left++;",
  9: "        right--;",
  10: "    }",
  11: "    return true;",
  12: "}"
};

const generateHistory = (str) => {
  const steps = [];
  const charArray = str.toLowerCase().split('');
  
  let left = 0;
  let right = charArray.length - 1;
  let comparisons = [];
  
  // Step 1: Initialize left = 0
  steps.push({
    line: 2,
    leftPointer: left,
    rightPointer: right,
    currentComparison: null,
    comparisonHistory: [...comparisons],
    isPalindrome: null,
    explanation: "Initialize left pointer at the beginning of the string (index 0)."
  });

  // Step 2: Initialize right = s.length() - 1
  steps.push({
    line: 3,
    leftPointer: left,
    rightPointer: right,
    currentComparison: null,
    comparisonHistory: [...comparisons],
    isPalindrome: null,
    explanation: `Initialize right pointer at the end of the string (index ${right}).`
  });

  let loopCheck = true;
  while (left < right) {
    // Step 3a: loop header
    steps.push({
      line: 4,
      leftPointer: left,
      rightPointer: right,
      currentComparison: null,
      comparisonHistory: [...comparisons],
      isPalindrome: null,
      explanation: `Check loop condition: left (${left}) < right (${right}) is true.`
    });

    const isMatch = charArray[left] === charArray[right];
    const comparisonObj = {
      left,
      right,
      leftChar: charArray[left],
      rightChar: charArray[right],
      match: isMatch
    };
    
    // Step 3b: condition check
    steps.push({
      line: 5,
      leftPointer: left,
      rightPointer: right,
      currentComparison: comparisonObj,
      comparisonHistory: [...comparisons],
      isPalindrome: null,
      explanation: `Compare character at left index s[${left}] ('${charArray[left]}') with right index s[${right}] ('${charArray[right]}').`
    });

    comparisons.push(comparisonObj);

    if (!isMatch) {
      // Step 3c: return false
      steps.push({
        line: 6,
        leftPointer: left,
        rightPointer: right,
        currentComparison: comparisonObj,
        comparisonHistory: [...comparisons],
        isPalindrome: false,
        explanation: `Characters mismatch: '${charArray[left]}' !== '${charArray[right]}'. The string is NOT a palindrome. Return false.`
      });
      loopCheck = false;
      break;
    }

    // Step 3d: left++
    left++;
    steps.push({
      line: 8,
      leftPointer: left,
      rightPointer: right,
      currentComparison: comparisonObj,
      comparisonHistory: [...comparisons],
      isPalindrome: null,
      explanation: `Characters matched. Increment left pointer to ${left}.`
    });

    // Step 3e: right--
    right--;
    steps.push({
      line: 9,
      leftPointer: left,
      rightPointer: right,
      currentComparison: comparisonObj,
      comparisonHistory: [...comparisons],
      isPalindrome: null,
      explanation: `Decrement right pointer to ${right}.`
    });
  }

  if (loopCheck) {
    // Final loop check: left < right is false
    steps.push({
      line: 4,
      leftPointer: left,
      rightPointer: right,
      currentComparison: null,
      comparisonHistory: [...comparisons],
      isPalindrome: null,
      explanation: `Loop check: left (${left}) < right (${right}) is now false (pointers met or crossed).`
    });

    // Step 4: return true
    steps.push({
      line: 11,
      leftPointer: left,
      rightPointer: right,
      currentComparison: null,
      comparisonHistory: [...comparisons],
      isPalindrome: true,
      explanation: `Pointers met/crossed with no mismatch. The string is a palindrome! Return true.`
    });
  }

  return steps;
};

const PalindromeCheck = ({ navigate }) => {
  const [inputString, setInputString] = useState("racecar");
  const [loadedString, setLoadedString] = useState("racecar");
  const visualizerState = useVisualizer({ defaultSpeed: 1000 });
  const { isLoaded, currentState } = visualizerState;

  const handleLoad = () => {
    if (!inputString.trim()) return;
    setLoadedString(inputString);
    visualizerState.load(generateHistory(inputString));
  };

  const loadExamples = (example) => {
    const examples = {
      palindrome1: "racecar",
      palindrome2: "madam",
      palindrome3: "noon",
      notPalindrome1: "hello",
      notPalindrome2: "world",
      notPalindrome3: "algorithm"
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
    currentComparison = null, 
    comparisonHistory = [], 
    isPalindrome = null 
  } = currentState;

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm focus:border-green-500 focus:outline-none w-48"
          placeholder="Enter a string..."
        />
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm transition-all text-white cursor-pointer"
        >
          Load & Visualize
        </button>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => loadExamples("palindrome1")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">racecar</button>
        <button onClick={() => loadExamples("palindrome2")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">madam</button>
        <button onClick={() => loadExamples("palindrome3")} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs hover:bg-green-500/20 transition-all cursor-pointer">noon</button>
        <button onClick={() => loadExamples("notPalindrome1")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">hello</button>
        <button onClick={() => loadExamples("notPalindrome2")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">world</button>
        <button onClick={() => loadExamples("notPalindrome3")} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs hover:bg-red-500/20 transition-all cursor-pointer">algorithm</button>
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
              {leftPointer < loadedString.length ? `[${leftPointer}] = '${loadedString[leftPointer]}'` : "Out of bounds"}
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-purple-400 text-xs font-bold mb-1">Right Pointer (right)</div>
            <div className="text-white text-lg font-mono">
              {rightPointer >= 0 && rightPointer < loadedString.length ? `[${rightPointer}] = '${loadedString[rightPointer]}'` : "Out of bounds"}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Panel */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Comparison</h3>
        <div className="h-full flex flex-col justify-center">
          {currentComparison ? (
            <div className={`p-4 rounded-lg border ${
              currentComparison.match
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="text-center font-mono">
                <div className="text-xl">
                  <span className="text-blue-400">'{currentComparison.leftChar}'</span>
                  <span className="text-gray-400 mx-2">
                    {currentComparison.match ? "==" : "!="}
                  </span>
                  <span className="text-purple-400">'{currentComparison.rightChar}'</span>
                </div>
                <div className="mt-2 text-xs font-semibold">
                  {currentComparison.match ? (
                    <span className="text-green-400">MATCH</span>
                  ) : (
                    <span className="text-red-400">MISMATCH</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center text-sm font-medium">
              No comparison active
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
              <div className="text-gray-400">O(n) - Checks half of characters</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Cpu className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <div className="font-bold text-white">Space Complexity</div>
              <div className="text-gray-400">O(1) - Constant auxiliary space</div>
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
            <Hash className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold text-gray-300">
              String Problems
            </span>
          </div>
        </div>
      </div>

      <VisualizerLayout
        title="Check Palindrome"
        description="Verify if a string reads the same backward as forward using two pointers."
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
          {/* Two-Pointer Character Blocks */}
          <div className="flex justify-center items-center gap-3 flex-wrap min-h-[120px]">
            {loadedString.split("").map((char, index) => {
              const isLeft = index === leftPointer;
              const isRight = index === rightPointer;
              const isMatchedHist = comparisonHistory.some(h => h.left === index || h.right === index);
              
              let charColorClass = "bg-gray-800 border-gray-600";
              if (isPalindrome === false && (isLeft || isRight)) {
                charColorClass = "bg-red-500/30 border-red-400";
              } else if (isLeft) {
                charColorClass = "bg-blue-500/30 border-blue-400 scale-110 shadow-lg shadow-blue-500/25";
              } else if (isRight) {
                charColorClass = "bg-purple-500/30 border-purple-400 scale-110 shadow-lg shadow-purple-500/25";
              } else if (isPalindrome === true) {
                charColorClass = "bg-green-500/20 border-green-400";
              } else if (isMatchedHist) {
                charColorClass = "bg-gray-700 border-gray-500 opacity-60";
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

          {/* Comparison History List */}
          {comparisonHistory.length > 0 && (
            <div className="bg-gray-950/30 rounded-xl p-4 border border-gray-800/60 max-h-40 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Comparison History</h4>
              <div className="space-y-1">
                {comparisonHistory.map((comp, idx) => (
                  <div key={idx} className={`p-2 rounded border text-xs font-mono ${comp.match ? "bg-green-500/10 border-green-500/20 text-green-450" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    Step {idx + 1}: s[{comp.left}]='{comp.leftChar}' {comp.match ? "==" : "!="} s[{comp.right}]='{comp.rightChar}' → {comp.match ? "Match ✓" : "Mismatch ✗"}
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

export default PalindromeCheck;