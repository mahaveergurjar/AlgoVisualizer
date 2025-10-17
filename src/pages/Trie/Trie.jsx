// src/pages/trie/Trie.jsx
import React, { useState, useMemo } from "react";
import { ArrowLeft, Plus, Search, RotateCcw, TreeDeciduous } from "lucide-react";

// Trie Node and Trie classes (unchanged)
class TrieNode {
  constructor(char = "") {
    this.char = char;
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode(char);
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }

  getNodes() {
    const result = [];
    const traverse = (node, level = 0, parentIndex = null) => {
      const currentIndex = result.length;
      result.push({
        char: node.char,
        isEnd: node.isEndOfWord,
        level,
        parentIndex,
      });
      Object.values(node.children).forEach((child) =>
        traverse(child, level + 1, currentIndex)
      );
    };
    traverse(this.root);
    return result;
  }
}

const TriePage = ({ navigate }) => {
  const [trie, setTrie] = useState(new Trie());
  const [input, setInput] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [nodes, setNodes] = useState(trie.getNodes());

  const handleInsert = () => {
    if (!input.trim()) return;
    const newTrie = trie; // Note: In a real app, you might want to avoid direct mutation
    newTrie.insert(input.trim().toLowerCase());
    setTrie(newTrie);
    setNodes(newTrie.getNodes());
    setInput("");
  };

  const handleSearch = () => {
    if (!searchWord.trim()) return;
    setSearchResult(trie.search(searchWord.trim().toLowerCase()));
  };

  const handleReset = () => {
    const newTrie = new Trie();
    setTrie(newTrie);
    setNodes(newTrie.getNodes());
    setInput("");
    setSearchWord("");
    setSearchResult(null);
  };
  
  // ====================================================================
  // ====================== START: REVISED LOGIC ========================
  // ====================================================================

  // New, improved logic to calculate node positions for a proper tree layout
  const { positions, width, height } = useMemo(() => {
    if (nodes.length <= 1) {
      return { positions: [{ x: 64, y: 50 }], width: 200, height: 200 };
    }

    const nodeRadius = 32;
    const verticalSpacing = 120;
    const horizontalSpacing = 80;

    const pos = new Array(nodes.length);
    const childrenPlaced = {}; // Tracks how many children of a parent are placed

    // Pre-calculate the number of direct children for each node
    const childrenCounts = nodes.map(() => 0);
    nodes.forEach((node) => {
      if (node.parentIndex !== null) {
        childrenCounts[node.parentIndex]++;
      }
    });

    let minX = Infinity;
    let maxX = -Infinity;
    
    nodes.forEach((node, idx) => {
      const { level, parentIndex } = node;
      const y = level * verticalSpacing + 50;

      let x;
      if (parentIndex === null) {
        // Root node starts at an arbitrary central position
        x = 0;
      } else {
        const parentPos = pos[parentIndex];
        const numSiblings = childrenCounts[parentIndex];
        const siblingIndex = childrenPlaced[parentIndex] || 0;

        // Calculate the horizontal offset from the parent
        // This formula centers the children block under the parent
        const offset = siblingIndex - (numSiblings - 1) / 2.0;

        // The horizontal spread between siblings can decrease at deeper levels
        const spread = Math.max(horizontalSpacing, 320 / (level + 1));
        x = parentPos.x + offset * spread;
        
        childrenPlaced[parentIndex] = siblingIndex + 1;
      }
      pos[idx] = { x, y };

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    });

    // Normalize X coordinates to shift the tree to the left and add padding
    const finalPositions = pos.map(p => ({
      x: p.x - minX + nodeRadius,
      y: p.y,
    }));
    
    const finalWidth = maxX - minX + nodeRadius * 2 + 50;
    const finalHeight = nodes[nodes.length - 1].level * verticalSpacing + 200;

    return { positions: finalPositions, width: finalWidth, height: finalHeight };
  }, [nodes]);
  
  // ====================================================================
  // ======================= END: REVISED LOGIC =========================
  // ====================================================================

  return (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-y-auto">
      {/* Background and Header (unchanged) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>
      <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto text-center">
        <button
          onClick={() => (navigate ? navigate("home") : window.history.back())}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
          <div className="relative">
            <TreeDeciduous className="h-14 sm:h-16 w-14 sm:w-16 text-green-400 animated-icon" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-green-500 to-green-600 animated-gradient">
            Trie (Prefix Tree)
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed px-4">
          Insert words and visualize the <span className="text-green-400 font-semibold">Trie</span> in real-time!
        </p>
      </div>
      
      {/* Controls and Visualization */}
      <div className="relative z-10 px-6 pb-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl transition-all duration-500 hover:shadow-green-500/30 overflow-x-auto">
             <div className="flex flex-wrap items-center gap-3 mb-6">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter word"
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none w-44 text-gray-200"
              />
              <button
                onClick={handleInsert}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Insert
              </button>
              <input
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Search word"
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none w-44 text-gray-200"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Search className="h-4 w-4" /> Search
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            {searchResult !== null && (
              <div className="text-center text-gray-300 mt-4">
                {searchResult ? (
                  <span className="text-green-400 font-semibold">Word Found ✅</span>
                ) : (
                  <span className="text-red-400 font-semibold">Word Not Found ❌</span>
                )}
              </div>
            )}
            
            {/* Trie Visualization with connections */}
            <div className="relative mt-8" style={{ minWidth: width, height: height }}>
              <svg className="absolute inset-0" width={width} height={height}>
                {nodes.map((node, idx) => {
                  if (node.parentIndex === null) return null;
                  const parent = positions[node.parentIndex];
                  const child = positions[idx];
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={parent.x + 32} y1={parent.y + 32}
                      x2={child.x + 32} y2={child.y + 32}
                      stroke="#22c55e" strokeWidth="2"
                    />
                  );
                })}
              </svg>
              {nodes.map((node, idx) => {
                if (!positions[idx]) return null;
                const pos = positions[idx];
                return (
                  <div
                    key={`node-${idx}`}
                    className={`absolute w-16 h-16 flex flex-col items-center justify-center rounded-full border-2 border-green-400 shadow-md transform transition-all duration-300 hover:scale-110 ${
                      node.isEnd
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-green-700/80 text-white"
                    }`}
                    style={{ left: pos.x, top: pos.y, transition: 'left 0.5s, top 0.5s' }}
                    title={`Level ${node.level}`}
                  >
                    <span className="text-lg font-bold">{node.char || "R"}</span>
                    <span className="text-xs text-green-200 mt-1">L{node.level}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Explanation, Side Panel, and CSS (unchanged) */}
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-3 text-green-400">How it Works</h3>
            <p className="text-gray-300 mb-4">
              Each character is a node. Insertions create paths; searches traverse paths. 
              End-of-word nodes are highlighted in a brighter green.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-green-400 mb-1">Operations Complexity</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Insert(word): O(L)</li>
                  <li>Search(word): O(L)</li>
                </ul>
                <p className="text-xs mt-1 text-gray-400">(L = length of the word)</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-1">Use Cases</h4>
                <p>Autocomplete, spell checkers, and IP routing.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 animate-fade-in-up">
            <h3 className="text-xl font-bold text-green-400 mb-3">Quick Tips</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>Insert words like "apple", "apply", "ape" to see branching.</li>
              <li>End-of-word nodes are highlighted in a brighter green.</li>
              <li>If the tree gets wide, you can scroll horizontally.</li>
              <li>Reset clears the entire Trie structure.</li>
            </ol>
          </div>
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 animate-fade-in-up">
            <h3 className="text-xl font-bold text-green-400 mb-3">Space Complexity</h3>
            <div className="text-gray-300 space-y-1">
              <p><strong>Space:</strong> O(N * M)</p>
              <p className="text-xs text-gray-400">(N = number of words, M = average word length)</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; }
        @keyframes gradient-animation { 0%,100% {background-position:0% 50%} 50% {background-position:100% 50%} }
        .animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        @keyframes fade-in-up { from {opacity:0;transform:translateY(30px);} to {opacity:1;transform:translateY(0);} }
        .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(34,197,94,0.35)); }
        @keyframes float-rotate { 0%,100% {transform:translateY(0) rotate(0deg);} 33% {transform:translateY(-8px) rotate(120deg);} 66% {transform:translateY(-4px) rotate(240deg);} }
        .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); }
        @keyframes float { 0%,100% {transform:translate(0,0) scale(1);} 50% {transform:translate(30px,-30px) scale(1.1);} }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        @keyframes pulse-slow { 0%,100% {opacity:0.3;} 50% {opacity:0.6;} }
      `}</style>
    </div>
  );
};

export default TriePage;