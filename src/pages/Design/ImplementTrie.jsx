import React, { useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const ImplementTrie = () => {
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateTrieHistory = useCallback(() => {
    const hist = [];

    hist.push({
      trie: {},
      operation: "init",
      message: "Trie (Prefix Tree) initialized",
      phase: "init",
      line: 7
    });

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
        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "insert",
          word,
          message: `insert("${word}"): Start inserting characters`,
          phase: "insert",
          line: 9
        });
        for (const char of word) {
          if (!node[char]) node[char] = {};
          node = node[char];
        }
        node.isEnd = true;

        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "insert",
          word,
          message: `insert("${word}"): Finished adding word to trie`,
          phase: "insert",
          line: 16
        });
      } else if (op === "search") {
        let node = trie;
        let found = true;
        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "search",
          word,
          message: `search("${word}"): Traverse to search key`,
          phase: "search",
          line: 19
        });
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
          phase: found ? "found" : "not-found",
          line: 25
        });
      } else if (op === "startsWith") {
        let node = trie;
        let found = true;
        hist.push({
          trie: JSON.parse(JSON.stringify(trie)),
          operation: "startsWith",
          prefix,
          message: `startsWith("${prefix}"): Traverse prefix characters`,
          phase: "startsWith",
          line: 28
        });
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
          phase: found ? "found" : "not-found",
          line: 34
        });
      }
    });

    load(hist);
  }, [load]);

  const handleStart = () => {
    generateTrieHistory();
  };

  const step = currentState || {};
  const { trie = {}, message = "", word, prefix, result } = step;

  const renderTrie = (node, level = 0) => {
    return Object.keys(node).map((key) => {
      if (key === "isEnd") return null;
      return (
        <div key={key} className="ml-6 mt-2">
          <div className={`inline-block px-3 py-1.5 rounded-lg font-bold text-sm ${
            node[key].isEnd ? "bg-green-600 text-white" : "bg-blue-600 text-white"
          }`}>
            {key}
          </div>
          {renderTrie(node[key], level + 1)}
        </div>
      );
    });
  };

  const codeContent = {
    1: "struct TrieNode {",
    2: "    TrieNode* children[26] = {};",
    3: "    bool isEnd = false;",
    4: "};",
    5: "",
    6: "class Trie {",
    7: "    TrieNode* root = new TrieNode();",
    8: "public:",
    9: "    void insert(string word) {",
    10: "        TrieNode* curr = root;",
    11: "        for (char c : word) {",
    12: "            if (!curr->children[c - 'a'])",
    13: "                curr->children[c - 'a'] = new TrieNode();",
    14: "            curr = curr->children[c - 'a'];",
    15: "        }",
    16: "        curr->isEnd = true;",
    17: "    }",
    18: "    ",
    19: "    bool search(string word) {",
    20: "        TrieNode* curr = root;",
    21: "        for (char c : word) {",
    22: "            if (!curr->children[c - 'a']) return false;",
    23: "            curr = curr->children[c - 'a'];",
    24: "        }",
    25: "        return curr->isEnd;",
    26: "    }",
    27: "    ",
    28: "    bool startsWith(string prefix) {",
    29: "        TrieNode* curr = root;",
    30: "        for (char c : prefix) {",
    31: "            if (!curr->children[c - 'a']) return false;",
    32: "            curr = curr->children[c - 'a'];",
    33: "        }",
    34: "        return true;",
    35: "    }",
    36: "};"
  };

  const inputSection = (
    <>
      <p className="text-gray-300 text-sm flex-grow">
        Click below to load the Trie operations and visualize the prefix tree construction.
      </p>
      {!isLoaded && (
        <button
          onClick={handleStart}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer text-sm"
        >
          Load & Visualize
        </button>
      )}
    </>
  );

  const statsSection = (
    <>
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-4 rounded-xl border border-blue-700/50 text-center">
        <h3 className="font-semibold text-blue-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
          Active Operation
        </h3>
        <div className="font-mono text-lg font-bold text-blue-300 capitalize">
          {step.operation || "N/A"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-4 rounded-xl border border-purple-700/50 text-center">
        <h3 className="font-semibold text-purple-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
          Query String
        </h3>
        <div className="font-mono text-lg font-bold text-purple-300">
          {word || prefix || "N/A"}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-4 rounded-xl border border-green-700/50 text-center">
        <h3 className="font-semibold text-green-300 mb-1 flex items-center justify-center gap-2 select-none text-xs">
          Result
        </h3>
        <div className="font-mono text-lg font-bold text-green-400">
          {result !== undefined ? (result ? "✓ Found / True" : "✗ Not Found / False") : "N/A"}
        </div>
      </div>

      <div className="sm:col-span-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
        <h4 className="font-semibold text-teal-300 mb-2 flex items-center gap-2 select-none text-xs">
          Complexity Analysis
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Time Complexity</span>
            <p className="text-gray-400">O(L) per operation, where L is length of the key/word.</p>
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
            <span className="text-teal-300 font-bold block mb-1">Space Complexity</span>
            <p className="text-gray-400">O(AL * L) worst case, where AL is alphabet size (26).</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Implement Trie (Prefix Tree)"
      description="Efficient storage and search of keys in a dataset of strings (LeetCode #208)"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={step.line}
      message={message || "Trie initialized"}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      {isLoaded ? (
        <div className="bg-gray-950/40 p-6 rounded-xl border border-gray-800 min-h-[300px]">
          <h3 className="text-base font-bold text-green-300 mb-6 select-none">Trie Tree Structure</h3>
          <div className="text-sm">
            <div className="font-bold text-gray-400 mb-4 select-none">root</div>
            {Object.keys(trie).length === 0 ? (
              <div className="text-gray-500 italic py-4 select-none">Trie is empty</div>
            ) : (
              renderTrie(trie)
            )}
          </div>

          <div className="mt-8 p-3 bg-gray-900/50 rounded-xl border border-gray-800 select-none">
            <div className="flex flex-wrap gap-4 justify-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-gray-400">Character Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span className="text-gray-400">Word End</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-950/20 rounded-xl border border-gray-800/40">
          <p className="text-gray-400 text-sm">Click "Load & Visualize" to begin.</p>
        </div>
      )}
    </VisualizerLayout>
  );
};

export default ImplementTrie;
