import React, { useState, useEffect, useCallback } from "react";
import { Code, CheckCircle, Clock, Layers, GitBranch, Activity } from "lucide-react";

const TowerOfHanoiVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [disksInput, setDisksInput] = useState("3");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateTowerOfHanoiHistory = useCallback((n) => {
    const newHistory = [];
    let moveCount = 0;
    const towers = {
      A: Array.from({ length: n }, (_, i) => n - i),
      B: [],
      C: []
    };
    const callStack = [];

    const addState = (props) =>
      newHistory.push({
        towers: JSON.parse(JSON.stringify(towers)),
        callStack: [...callStack],
        moveCount,
        explanation: "",
        ...props,
      });

    addState({ line: 1, explanation: `Initialize Tower of Hanoi with ${n} disks on tower A.` });

    const hanoi = (n, source, target, auxiliary, depth = 0) => {
      callStack.push({ n, source, target, auxiliary, depth });
      addState({
        line: 2,
        explanation: `Call hanoi(${n}, '${source}', '${target}', '${auxiliary}'). Move ${n} disk(s) from ${source} to ${target} using ${auxiliary}.`,
      });

      if (n === 1) {
        addState({
          line: 3,
          explanation: `Base case: n = 1. Move disk 1 from ${source} to ${target}.`,
        });

        const disk = towers[source].pop();
        towers[target].push(disk);
        moveCount++;

        addState({
          line: 4,
          fromTower: source,
          toTower: target,
          disk,
          explanation: `Moved disk ${disk} from tower ${source} to tower ${target}. Total moves: ${moveCount}.`,
        });

        callStack.pop();
        addState({
          line: 5,
          explanation: `Return from hanoi(1, '${source}', '${target}', '${auxiliary}').`,
        });
        return;
      }

      addState({
        line: 6,
        explanation: `Step 1: Move ${n - 1} disk(s) from ${source} to ${auxiliary} using ${target}.`,
      });
      hanoi(n - 1, source, auxiliary, target, depth + 1);

      addState({
        line: 7,
        explanation: `Step 2: Move disk ${n} from ${source} to ${target}.`,
      });

      const disk = towers[source].pop();
      towers[target].push(disk);
      moveCount++;

      addState({
        line: 8,
        fromTower: source,
        toTower: target,
        disk,
        explanation: `Moved disk ${disk} from tower ${source} to tower ${target}. Total moves: ${moveCount}.`,
      });

      addState({
        line: 9,
        explanation: `Step 3: Move ${n - 1} disk(s) from ${auxiliary} to ${target} using ${source}.`,
      });
      hanoi(n - 1, auxiliary, target, source, depth + 1);

      callStack.pop();
      addState({
        line: 10,
        explanation: `Return from hanoi(${n}, '${source}', '${target}', '${auxiliary}').`,
      });
    };

    hanoi(n, 'A', 'C', 'B');

    addState({
      line: 11,
      finished: true,
      explanation: `Tower of Hanoi complete! All ${n} disks moved to tower C in ${moveCount} moves.`,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadProblem = () => {
    const n = parseInt(disksInput);
    if (isNaN(n) || n < 1 || n > 7) {
      alert("Please enter a number between 1 and 7.");
      return;
    }
    setIsLoaded(true);
    generateTowerOfHanoiHistory(n);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(() => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isLoaded) return;
      if (e.key === "ArrowRight") stepForward();
      else if (e.key === "ArrowLeft") stepBackward();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const { towers = { A: [], B: [], C: [] }, callStack = [], moveCount = 0, explanation = "", fromTower = null, toTower = null, finished = false } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div className={`block rounded-md transition-colors ${state.line === line ? "bg-blue-500/20" : ""}`}>
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">{line}</span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>{token.t}</span>
      ))}
    </div>
  );

  const hanoiCode = [
    { l: 1, c: [{ t: "function hanoi(n, source, target, aux) {", c: "" }] },
    { l: 2, c: [{ t: "  if", c: "purple" }, { t: " (n === 1) {", c: "" }] },
    { l: 3, c: [{ t: "    move disk from source to target;", c: "" }] },
    { l: 4, c: [{ t: "    return", c: "purple" }, { t: ";", c: "" }] },
    { l: 5, c: [{ t: "  }", c: "light-gray" }] },
    { l: 6, c: [{ t: "  hanoi(n-1, source, aux, target);", c: "" }] },
    { l: 7, c: [{ t: "  move disk from source to target;", c: "" }] },
    { l: 8, c: [{ t: "  hanoi(n-1, aux, target, source);", c: "" }] },
    { l: 10, c: [{ t: "}", c: "light-gray" }] },
  ];

  const getDiskColor = (size) => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500"];
    return colors[size % colors.length];
  };

  const renderTower = (name, disks) => {
    const isFrom = fromTower === name;
    const isTo = toTower === name;
    
    return (
      <div className="flex flex-col items-center">
        <h4 className={`font-bold text-lg mb-2 transition-colors ${isFrom ? "text-red-400" : isTo ? "text-green-400" : "text-gray-400"}`}>
          Tower {name}
        </h4>
        <div className="relative w-32 h-64 flex flex-col-reverse items-center">
          <div className="absolute bottom-0 w-full h-2 bg-gray-600 rounded"></div>
          <div className="absolute bottom-2 w-1 bg-gray-600" style={{ height: "240px", left: "50%", transform: "translateX(-50%)" }}></div>
          {disks.map((diskSize, index) => {
            const width = 20 + diskSize * 15;
            return (
              <div
                key={`${name}-${index}-${diskSize}`}
                className={`${getDiskColor(diskSize)} rounded transition-all duration-300 h-6 flex items-center justify-center font-bold text-white text-sm border-2 border-gray-800`}
                style={{ width: `${width}px`, marginBottom: index === 0 ? "8px" : "2px" }}
              >
                {diskSize}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <Layers /> Tower of Hanoi Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Classic recursion problem: Move all disks from tower A to tower C
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label htmlFor="disks-input" className="font-medium text-gray-300 font-mono">Number of Disks (1-7):</label>
          <input id="disks-input" type="number" min="1" max="7" value={disksInput} onChange={(e) => setDisksInput(e.target.value)} disabled={isLoaded} className="font-mono w-24 bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button onClick={loadProblem} className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded-lg">Load & Visualize</button>
          ) : (
            <>
              <button onClick={stepBackward} disabled={currentStep <= 0} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
              <span className="font-mono w-24 text-center">{currentStep >= 0 ? currentStep + 1 : 0}/{history.length}</span>
              <button onClick={stepForward} disabled={currentStep >= history.length - 1} className="bg-gray-700 p-2 rounded-md disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
          <button onClick={reset} className="ml-4 bg-red-600 hover:bg-red-700 cursor-pointer font-bold py-2 px-4 rounded-lg">Reset</button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Code size={20} />
              Pseudocode
            </h3>
            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {hanoiCode.map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <Layers size={20} />
                Towers Visualization
              </h3>
              <div className="flex justify-around items-end py-4">
                {renderTower('A', towers.A)}
                {renderTower('B', towers.B)}
                {renderTower('C', towers.C)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <Activity size={16} /> Total Moves
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">{moveCount}</p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2">
                  <GitBranch size={16} /> Call Stack Depth
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">{callStack.length}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <GitBranch size={16} />
                Call Stack
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {callStack.length === 0 ? (
                  <p className="text-gray-500 text-sm">Empty</p>
                ) : (
                  callStack.slice().reverse().map((call, index) => (
                    <div key={index} className="bg-gray-700/50 p-2 rounded text-xs font-mono text-gray-300" style={{ marginLeft: `${call.depth * 12}px` }}>
                      hanoi({call.n}, '{call.source}', '{call.target}', '{call.auxiliary}')
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{explanation}</p>
              {finished && <CheckCircle className="inline-block ml-2 text-green-400" />}
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2">
              <Clock size={20} /> Complexity Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Time Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(2^n)</strong>
                  <br />
                  For n disks, the algorithm makes 2^n - 1 moves. Each disk requires moving all smaller disks twice (once to auxiliary, once to target).
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Recurrence Relation</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">T(n) = 2T(n-1) + 1</strong>
                  <br />
                  T(1) = 1 (base case)
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">Space Complexity</h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(n)</strong>
                  <br />
                  The maximum depth of the recursion call stack is n, where n is the number of disks. Each recursive call adds a frame to the stack.
                </p>
                <h4 className="font-semibold text-blue-300 mt-4">Algorithm Rules</h4>
                <p className="text-gray-400">
                  1. Only one disk can be moved at a time<br />
                  2. A larger disk cannot be placed on a smaller disk<br />
                  3. All disks must be moved from source to target tower
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Enter number of disks to begin visualization.</p>
      )}
    </div>
  );
};

export default TowerOfHanoiVisualizer;
