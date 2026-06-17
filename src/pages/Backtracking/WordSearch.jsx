import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const WordSearch = () => {
  const [boardInput, setBoardInput] = useState("ABCE,SFCS,ADEE");
  const [wordInput, setWordInput] = useState("SEE");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customBoard, customWord) => {
    const rawBoard = customBoard !== undefined ? customBoard : boardInput;
    const rawWord = customWord !== undefined ? customWord : wordInput;

    const rows = rawBoard.split(',').map(row => row.trim().toUpperCase());
    if (rows.length === 0 || rows.some(row => row.length !== rows[0].length)) {
      alert("Invalid board. Please ensure all rows have the same length.");
      return;
    }

    const word = rawWord.trim().toUpperCase();
    if (!word) {
      alert("Please enter a word to search.");
      return;
    }

    if (rows.length > 6 || rows[0].length > 6) {
      alert("For optimal visualization, please use boards up to 6x6.");
      return;
    }

    const parsedBoard = rows.map(row => row.split(''));
    setBoardInput(rawBoard);
    setWordInput(word);

    const newHistory = [];
    const numRows = parsedBoard.length;
    const numCols = parsedBoard[0].length;
    let stepCount = 0;
    let result = false;

    const addState = (props) => {
      newHistory.push({
        board: parsedBoard.map(row => [...row]),
        visited: props.visited ? props.visited.map(row => [...row]) : Array(numRows).fill().map(() => Array(numCols).fill(false)),
        currentPath: [...(props.currentPath || [])],
        currentWord: props.currentWord || "",
        row: props.row,
        col: props.col,
        index: props.index || 0,
        explanation: props.explanation || "",
        step: stepCount++,
        found: props.found || false,
        ...props,
      });
    };

    const backtrack = (row, col, index, visited, path) => {
      if (index === word.length) {
        result = true;
        addState({
          row,
          col,
          index,
          visited,
          currentPath: path,
          currentWord: word,
          explanation: `✓ Found the word "${word}"! Path: ${path.map(p => `(${p[0]},${p[1]})`).join(' → ')}`,
          found: true,
          line: 2,
        });
        return true;
      }

      if (row < 0 || row >= numRows || col < 0 || col >= numCols || visited[row][col]) {
        return false;
      }

      if (parsedBoard[row][col] !== word[index]) {
        addState({
          row,
          col,
          index,
          visited,
          currentPath: path,
          currentWord: word.substring(0, index),
          explanation: `Character mismatch: board[${row}][${col}] = '${parsedBoard[row][col]}' ≠ '${word[index]}' (position ${index})`,
          line: 4,
          mismatch: true,
        });
        return false;
      }

      visited[row][col] = true;
      const newPath = [...path, [row, col]];
      const newWord = word.substring(0, index + 1);

      addState({
        row,
        col,
        index,
        visited,
        currentPath: newPath,
        currentWord: newWord,
        explanation: `Match found: '${parsedBoard[row][col]}' = '${word[index]}'. Exploring neighbors... Current: "${newWord}"`,
        line: 6,
        match: true,
      });

      const directions = [
        [-1, 0, '↑'], // up
        [0, 1, '→'],  // right
        [1, 0, '↓'],  // down
        [0, -1, '←']  // left
      ];

      for (const [dr, dc, symbol] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        addState({
          row,
          col,
          index,
          visited,
          currentPath: newPath,
          currentWord: newWord,
          explanation: `Trying direction ${symbol} to (${newRow}, ${newCol})`,
          line: 10,
          exploring: [newRow, newCol],
        });

        if (backtrack(newRow, newCol, index + 1, visited, newPath)) {
          return true;
        }

        addState({
          row,
          col,
          index,
          visited,
          currentPath: newPath,
          currentWord: newWord,
          explanation: `Backtracking from (${newRow}, ${newCol}) - no valid path found`,
          line: 11,
          backtracking: true,
        });
      }

      visited[row][col] = false;
      addState({
        row,
        col,
        index,
        visited,
        currentPath: path,
        currentWord: word.substring(0, index),
        explanation: `All directions exhausted from (${row}, ${col}). Backtracking...`,
        line: 11,
        backtracking: true,
      });

      return false;
    };

    addState({
      explanation: `Starting word search for "${word}" in ${numRows}×${numCols} board`,
      line: 15,
    });

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        addState({
          row: i,
          col: j,
          explanation: `Trying starting position (${i}, ${j}) - '${parsedBoard[i][j]}'`,
          line: 18,
          starting: true,
        });

        const visited = Array(numRows).fill().map(() => Array(numCols).fill(false));
        if (backtrack(i, j, 0, visited, [])) {
          break;
        }

        if (result) break;
      }
      if (result) break;
    }

    if (!result) {
      addState({
        explanation: `✗ Word "${word}" not found in the board`,
        line: 21,
        finished: true,
      });
    }

    load(newHistory);
  }, [boardInput, wordInput, load]);

  const {
    line,
    board = [],
    visited = [],
    currentPath = [],
    currentWord = "",
    row,
    col,
    found: stepFound,
    finished,
    mismatch,
    match,
    exploring
  } = currentState;

  const getCellColor = (r, c) => {
    if (currentPath.some(([pr, pc]) => pr === r && pc === c)) {
      return "bg-green-500/40 border-green-400 text-white";
    }
    if (visited[r]?.[c]) {
      return "bg-yellow-500/30 border-yellow-400 text-yellow-350";
    }
    if (r === row && c === col) {
      if (mismatch) return "bg-red-500/40 border-red-400 text-white";
      if (match) return "bg-blue-500/40 border-blue-400 text-white";
      return "bg-purple-500/40 border-purple-400 text-white";
    }
    if (exploring && exploring[0] === r && exploring[1] === c) {
      return "bg-cyan-500/30 border-cyan-400 text-cyan-300";
    }
    return "bg-gray-700/50 border-gray-600 text-gray-305 hover:bg-gray-600/50";
  };

  const codeContent = {
    1: `bool dfs(vector<vector<char>>& board, string word, int i, int j, int k) {`,
    2: `    if (k == word.length()) return true;`,
    3: `    if (i < 0 || i >= board.size() || j < 0 || j >= board[0].size() || board[i][j] != word[k])`,
    4: `        return false;`,
    5: `    char temp = board[i][j];`,
    6: `    board[i][j] = '\\0'; // mark as visited`,
    7: `    bool found = dfs(board, word, i + 1, j, k + 1) ||`,
    8: `                 dfs(board, word, i - 1, j, k + 1) ||`,
    9: `                 dfs(board, word, i, j + 1, k + 1) ||`,
    10: `                 dfs(board, word, i, j - 1, k + 1);`,
    11: `    board[i][j] = temp; // backtrack`,
    12: `    return found;`,
    13: `}`,
    14: ``,
    15: `bool exist(vector<vector<char>>& board, string word) {`,
    16: `    for (int i = 0; i < board.size(); i++) {`,
    17: `        for (int j = 0; j < board[0].size(); j++) {`,
    18: `            if (dfs(board, word, i, j, 0)) return true;`,
    19: `        }`,
    20: `    }`,
    21: `    return false;`,
    22: `}`
  };

  const inputSection = (
    <>
      <input
        type="text"
        value={boardInput}
        onChange={(e) => setBoardInput(e.target.value)}
        disabled={isLoaded}
        placeholder="e.g., ABCE,SFCS,ADEE"
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
      />
      <input
        type="text"
        value={wordInput}
        onChange={(e) => setWordInput(e.target.value)}
        disabled={isLoaded}
        placeholder="e.g., SEE"
        className="w-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-blue-400 shadow-sm"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Search
          </button>
          <button
            onClick={() => handleLoad("ABCE,SFCS,ADEE", "SEE")}
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Cell Position
        </h4>
        <div className="text-3xl font-mono text-blue-300">
          {row !== undefined && col !== undefined ? `(${row}, ${col})` : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Word Progress
        </h4>
        <div className="text-2xl font-mono text-cyan-300">
          {currentWord.length}/{wordInput.length}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-emerald-300 select-none">
          Status
        </h4>
        <div className="text-xl font-mono text-emerald-300 pt-1">
          {stepFound ? "Found" : finished ? "Not Found" : mismatch ? "Mismatch" : match ? "Match" : "Searching"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(M × N × 4^L)</span>
          </div>
          <div>
            <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(L)</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Word Search"
      description="Search if a word exists in a 2D board of characters by exploring neighboring cells recursively."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter board input and word to search."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative bg-gray-950 p-4 rounded-xl border border-gray-800">
          <div className="flex flex-col gap-2">
            {board.map((row, r) => (
              <div key={r} className="flex gap-2 justify-center">
                {row.map((cell, c) => (
                  <div
                    key={c}
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center font-bold text-lg font-mono transition-all duration-300 ${getCellColor(r, c)}`}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default WordSearch;