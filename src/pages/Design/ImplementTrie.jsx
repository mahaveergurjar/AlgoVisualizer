import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Play, RotateCw, Pause, SkipBack, SkipForward, Search } from "lucide-react";
import useModeHistorySwitch from "../../hooks/useModeHistorySwitch";

const ImplementTrie = () => {
  const [animSpeed, setAnimSpeed] = useState(1200);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    mode,
    history,
    currentStep,
    setMode,
    setHistory,
    setCurrentStep,
    goToPrevStep,
    goToNextStep,
  } = useModeHistorySwitch();

  const generateTrieHistory = useCallback(() => {
    const hist = [];

    hist.push({
      trie: {},
      operation: "init",
      message: "Trie (Prefix Tree) initialized",
      phase: "init"
    });

    // Example operations
    const operations = [
      { op: "insert", word: "apple" },
      { op: "search", word: "apple" },
      { op: "search", word: "app" },
      { op: "startsWith", prefix: "app" },
      { op: "insert", word: "app" },
      { op: "search", word: "app" },
    ];

    const trie = {};

    operations.forEach(({ op, word, prefix }) => {
      if (op === "insert") {
        let node = trie;
        for (const char of word) {
          if (!node[char]) node[char] = {};
          node = node[char];
        }
        node.isEnd = true;

        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "insert",
          word,
          message: `insert("${word}"): Added word to trie`,
          phase: "insert"
        });
      } else if (op === "search") {
        let node = trie;
        let found = true;
        for (const char of word) {
          if (!node[char]) {
            found = false;
            break;
          }
          node = node[char];
        }
        found = found && node.isEnd === true;

        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "search",
          word,
          result: found,
          message: `search("${word}"): ${found ? "Found!" : "Not found"}`,
          phase: found ? "found" : "not-found"
        });
      } else if (op === "startsWith") {
        let node = trie;
        let found = true;
        for (const char of prefix) {
          if (!node[char]) {
            found = false;
            break;
          }
          node = node[char];
        }

        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "startsWith",
          prefix,
          result: found,
          message: `startsWith("${prefix}"): ${found ? "Prefix exists!" : "Prefix not found"}`,
          phase: found ? "found" : "not-found"
        });
      }
    });

    return hist;
  }, []);

  const handleStart = () => {
    setMode("visualizing");
    const hist = generateTrieHistory();
    setHistory(hist);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setMode("input");
    setHistory([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && mode === "visualizing") {
      interval = setInterval(() => {
        if (currentStep < history.length - 1) {
          goToNextStep();
        } else {
          setIsPlaying(false);
        }
      }, animSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, history.length, animSpeed, mode, goToNextStep]);

  const step = history[currentStep] || {};
  const { trie = {}, message = "", phase = "init", word, prefix, result } = step;

  const renderTrie = (node, level = 0) => {
    return Object.keys(node).map((key) => {
      if (key === "isEnd") return null;
      return (
        <div key={key} className="ml-6">
          <div className={`inline-block px-3 py-2 rounded-lg font-bold ${
            node[key].isEnd ? "bg-green-600 text-white" : "bg-blue-600 text-white"
          }`}>
            {key}
          </div>
          {renderTrie(node[key], level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white p-8">
      <header className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-green-300 hover:text-green-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Design
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
            <Search className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Implement Trie (Prefix Tree)</h1>
            <p className="text-green-200 mt-1">LeetCode #208 - Medium</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
          A <strong>trie</strong> (pronounced as "try") or <strong>prefix tree</strong> is a tree data structure used to efficiently store 
          and retrieve keys in a dataset of strings. Implement the Trie class with <code className="px-2 py-1 bg-gray-800 rounded">insert()</code>,{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">search()</code>, and{" "}
          <code className="px-2 py-1 bg-gray-800 rounded">startsWith()</code> methods.
        </p>
      </header>

      {mode === "input" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-green-300">Demo Operations</h2>
          <p className="text-gray-300 mb-4">
            Click Start to see a demonstration of Trie operations with insert, search, and startsWith.
          </p>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
          >
            <Play className="h-4 w-4" />
            Start Visualization
          </button>
        </section>
      )}

      {mode === "visualizing" && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={goToPrevStep} disabled={currentStep === 0} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipBack className="h-5 w-5" />
              </button>
              <button onClick={goToNextStep} disabled={currentStep >= history.length - 1} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <SkipForward className="h-5 w-5" />
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <RotateCw className="h-5 w-5" />
                Reset
              </button>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Step</div>
              <div className="text-2xl font-bold text-green-300">{currentStep + 1} / {history.length}</div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
              <select value={animSpeed} onChange={(e) => setAnimSpeed(Number(e.target.value))} className="px-4 py-2 bg-gray-900/80 border border-gray-600 rounded-lg text-white">
                <option value={1800}>Slow</option>
                <option value={1200}>Normal</option>
                <option value={600}>Fast</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {mode === "visualizing" && message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          phase === "found" 
            ? "bg-green-900/30 border-green-500 text-green-200"
            : phase === "not-found"
            ? "bg-red-900/30 border-red-500 text-red-200"
            : "bg-green-900/30 border-green-500 text-green-200"
        }`}>
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {mode === "visualizing" && history.length > 0 && (
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-green-300 mb-6 text-center">Trie Structure</h3>
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-600 min-h-[300px]">
            {Object.keys(trie).length === 0 ? (
              <div className="text-gray-500 text-center py-8">Empty Trie</div>
            ) : (
              <div className="text-lg">
                <div className="font-bold text-gray-400 mb-4">Root</div>
                {renderTrie(trie)}
              </div>
            )}
          </div>

          {/* Current Operation */}
          {(word || prefix) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                <div className="text-sm text-blue-300 mb-2">Query</div>
                <div className="text-2xl font-bold text-white">{word || prefix}</div>
              </div>
              {result !== undefined && (
                <div className={`p-4 rounded-xl border ${
                  result ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"
                }`}>
                  <div className={`text-sm mb-2 ${result ? "text-green-300" : "text-red-300"}`}>Result</div>
                  <div className={`text-2xl font-bold ${result ? "text-green-200" : "text-red-200"}`}>
                    {result ? "✓ Found" : "✗ Not Found"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-600">
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-600"></div>
                <span className="text-sm text-gray-300">Character Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600"></div>
                <span className="text-sm text-gray-300">Word End</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ImplementTrie;
