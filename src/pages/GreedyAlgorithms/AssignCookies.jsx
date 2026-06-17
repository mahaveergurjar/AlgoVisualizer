import React, { useState, useCallback } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";

const AssignCookies = () => {
  const [greedsInput, setGreedsInput] = useState("1,2,3");
  const [cookiesInput, setCookiesInput] = useState("1,1");

  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const handleLoad = useCallback((customGreeds, customCookies) => {
    const rawG = customGreeds !== undefined ? customGreeds : greedsInput;
    const rawC = customCookies !== undefined ? customCookies : cookiesInput;

    const g = rawG
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    const s = rawC
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

    if (g.length === 0 || s.length === 0) {
      alert("Please enter valid greed and cookie sizes!");
      return;
    }

    setGreedsInput(rawG);
    setCookiesInput(rawC);

    const newHistory = [];
    let i = 0,
        j = 0,
        satisfied = 0;

    newHistory.push({
      greeds: [...g],
      cookies: [...s],
      satisfied,
      explanation: "Starting child and cookie assignment.",
      line: 4,
    });

    const sortedG = [...g].sort((a, b) => a - b);
    const sortedS = [...s].sort((a, b) => a - b);

    newHistory.push({
      greeds: sortedG,
      cookies: sortedS,
      satisfied,
      explanation: "Sort both child greed and cookie size arrays in ascending order.",
      line: 2,
    });

    while (i < sortedG.length && j < sortedS.length) {
      newHistory.push({
        greeds: sortedG,
        cookies: sortedS,
        satisfied,
        currentChild: i,
        currentCookie: j,
        explanation: `Checking: Child ${i + 1} (greed g = ${sortedG[i]}) with Cookie ${j + 1} (size s = ${sortedS[j]})`,
        line: 5,
      });

      if (sortedS[j] >= sortedG[i]) {
        satisfied++;
        i++;
        j++;
        newHistory.push({
          greeds: sortedG,
          cookies: sortedS,
          satisfied,
          currentChild: i - 1,
          currentCookie: j - 1,
          explanation: `✅ Cookie ${j} (size ${sortedS[j - 1]}) satisfies Child ${i} (greed ${sortedG[i - 1]}).`,
          line: 6,
          matched: true,
        });
      } else {
        j++;
        newHistory.push({
          greeds: sortedG,
          cookies: sortedS,
          satisfied,
          currentChild: i,
          currentCookie: j - 1,
          explanation: `❌ Cookie ${j} (size ${sortedS[j - 1]}) is too small for Child ${i + 1} (greed ${sortedG[i]}). Trying next cookie.`,
          line: 7,
          matched: false,
        });
      }
    }

    newHistory.push({
      greeds: sortedG,
      cookies: sortedS,
      satisfied,
      explanation: `🎉 Finished! Total satisfied children: ${satisfied}`,
      line: 9,
      finished: true,
    });

    load(newHistory);
  }, [greedsInput, cookiesInput, load]);

  const GenerateNewGreedAndCookies = () => {
    const sizeofCookies = 4;
    const newGreed = [];
    const newCookies = [];
    for (let i = 0; i < sizeofCookies; i++) {
      const greed = Math.floor(Math.random() * 10) + 1;
      const cookie = Math.floor(Math.random() * 10) + 1;
      newCookies.push(cookie);
      newGreed.push(greed);
    }
    setGreedsInput(newGreed.join(","));
    setCookiesInput(newCookies.join(","));
    visualizer.reset();
  };

  const {
    greeds = [],
    cookies = [],
    satisfied = 0,
    currentChild,
    currentCookie,
    line = 1
  } = currentState;

  const codeContent = {
    1: `int findContentChildren(vector<int>& g, vector<int>& s) {`,
    2: `    sort(g.begin(), g.end()); sort(s.begin(), s.end());`,
    3: `    int i = 0, j = 0;`,
    4: `    while (i < g.size() && j < s.size()) {`,
    5: `        if (s[j] >= g[i]) {`,
    6: `            i++;`,
    7: `        }`,
    8: `        j++;`,
    9: `    }`,
    10: `    return i;`,
    11: `}`
  };

  const inputSection = (
    <>
      <input
        value={greedsInput}
        onChange={(e) => setGreedsInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-yellow-450 shadow-sm"
        placeholder="Greeds (e.g. 1,2,3)"
      />
      <input
        value={cookiesInput}
        onChange={(e) => setCookiesInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow min-w-[150px] p-3 rounded-xl bg-gray-950 border border-gray-700 text-white font-mono focus:ring-2 focus:ring-yellow-450 shadow-sm"
        placeholder="Cookies (e.g. 1,1)"
      />
      {!isLoaded && (
        <>
          <button
            onClick={() => handleLoad()}
            className="px-5 py-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 transition text-white font-bold shadow-lg cursor-pointer"
          >
            Load & Visualize
          </button>
          <button
            onClick={GenerateNewGreedAndCookies}
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
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-yellow-300 select-none">
          Satisfied Children
        </h4>
        <div className="text-3xl font-mono text-yellow-300">
          {satisfied}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Child index i
        </h4>
        <div className="text-3xl font-mono text-cyan-300">
          {currentChild !== undefined ? currentChild : "-"}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Cookie index j
        </h4>
        <div className="text-3xl font-mono text-purple-300">
          {currentCookie !== undefined ? currentCookie : "-"}
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-indigo-300 font-semibold flex items-center gap-2 mb-2 select-none">
          Complexity Analysis
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O(N log N + M log M)</span> - sorting both arrays.
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
      title="Assign Cookies"
      description="Maximize the number of children that can be content with cookies of varying sizes."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={currentState.explanation || "Enter child greeds and cookie sizes."}
      visualizerState={visualizer}
      statsSection={statsSection}
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="p-4 bg-blue-950/45 border border-blue-900 rounded-xl">
          <h4 className="text-blue-400 font-semibold mb-3 select-none">Children (Greed)</h4>
          <div className="flex flex-wrap gap-2">
            {greeds.map((g, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded text-sm font-mono border transition-all duration-300 ${
                  idx === currentChild
                    ? "border-yellow-400 bg-yellow-400/20 scale-105"
                    : "border-blue-500/30 bg-blue-500/10 text-gray-305"
                }`}
              >
                Child {idx + 1}: g={g}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-purple-950/45 border border-purple-900 rounded-xl">
          <h4 className="text-purple-400 font-semibold mb-3 select-none">Cookies (Size)</h4>
          <div className="flex flex-wrap gap-2">
            {cookies.map((s, idx) => (
              <div
                key={idx}
                className={`px-3 py-2 rounded text-sm font-mono border transition-all duration-300 ${
                  idx === currentCookie
                    ? "border-yellow-400 bg-yellow-400/20 scale-105"
                    : "border-purple-500/30 bg-purple-500/10 text-gray-305"
                }`}
              >
                Cookie {idx + 1}: s={s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default AssignCookies;