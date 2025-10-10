import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, Code, CheckCircle, Clock, Hash } from "lucide-react";

// Pointer Component
const VisualizerPointer = ({ nodeId, containerId, color, label, yOffset = 0 }) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0, top: 0 });

  useEffect(() => {
    if (nodeId === null) {
      setPosition((p) => ({ ...p, opacity: 0 }));
      return;
    }
    const container = document.getElementById(containerId);
    const element = document.getElementById(`node-${nodeId}`);
    if (container && element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      // Compute position centered above the node and clamp within container
      let left = elementRect.left - containerRect.left + elementRect.width / 2 - 20;
      let top = elementRect.top - containerRect.top - 48 + yOffset; // slightly higher
      // Clamp to container bounds so labels/arrows don't get clipped
      left = Math.max(8, Math.min(left, containerRect.width - 36));
      top = Math.max(8, Math.min(top, containerRect.height - 36));
      setPosition({ opacity: 1, left, top });
    } else {
      setPosition((p) => ({ ...p, opacity: 0 }));
    }
  }, [nodeId, containerId, yOffset]);

  const colorClasses = {
    amber: "text-amber-400",
    green: "text-green-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };

  const pillBg = {
    amber: "bg-amber-900/70 border-amber-500/50 text-amber-200",
    green: "bg-green-900/70 border-green-500/50 text-green-200",
    blue: "bg-blue-900/70 border-blue-500/50 text-blue-200",
    red: "bg-red-900/70 border-red-500/50 text-red-200",
  };

  return (
    <div
      className="absolute text-center transition-all duration-300 ease-out pointer-events-none z-10"
      style={position}
    >
      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${pillBg[color]}`}>
        {label}
      </div>
      <ArrowUp className={`w-8 h-8 mx-auto mt-1 filter drop-shadow-[0_0_6px_rgba(0,0,0,0.6)] ${colorClasses[color]}`} strokeWidth={2.5} />
    </div>
  );
};

// Token-based code block renderer
const CodeBlock = ({ codeLines, highlightLines = [] }) => {
  const colorClass = (c) => {
    switch (c) {
      case "cyan":
        return "text-cyan-300";
      case "purple":
        return "text-purple-300";
      case "light-blue":
        return "text-sky-300";
      case "light-gray":
        return "text-gray-400";
      case "amber":
        return "text-amber-300";
      case "green":
        return "text-green-300";
      default:
        return "text-gray-200";
    }
  };

  return (
    <div className="font-mono text-sm bg-gray-900 rounded-lg border border-gray-700 overflow-auto max-h-[40rem]">
      <div className="min-w-max p-4">
        {codeLines.map((line) => (
          <div
            key={line.l}
            className={`flex items-start gap-3 leading-6 ${
              highlightLines.includes(line.l) ? "bg-gray-800" : ""
            }`}
          >
            <span className="w-10 pr-2 text-right select-none text-gray-500">
              {line.l}
            </span>
            <div className="whitespace-pre">
              {line.c.map((tok, idx) => (
                <span key={idx} className={colorClass(tok.c)}>
                  {tok.t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// C++ mergeTwoLists, tokenized for styled display
const mergeCppCode = [
  { l: 1, c: [{ t: "public", c: "purple" }, { t: ":\n", c: "light-gray" }] },
  {
    l: 2,
    c: [
      { t: "ListNode", c: "cyan" },
      { t: "* mergeTwoLists(", c: "" },
      { t: "ListNode", c: "cyan" },
      { t: "* list1, ", c: "" },
      { t: "ListNode", c: "cyan" },
      { t: "* list2) {\n", c: "" },
    ],
  },
  {
    l: 3,
    c: [
      { t: "  ", c: "" },
      { t: "if", c: "purple" },
      { t: "(list1 == nullptr && list2 == nullptr) ", c: "" },
      { t: "return", c: "purple" },
      { t: " nullptr;\n", c: "light-blue" },
    ],
  },
  {
    l: 5,
    c: [
      { t: "  ", c: "" },
      { t: "ListNode", c: "cyan" },
      { t: "* dummy = ", c: "" },
      { t: "new", c: "purple" },
      { t: " ListNode(0);\n", c: "" },
    ],
  },
  {
    l: 6,
    c: [
      { t: "  ", c: "" },
      { t: "ListNode", c: "cyan" },
      { t: "* curr = dummy;\n", c: "" },
    ],
  },
  {
    l: 8,
    c: [
      { t: "  ", c: "" },
      { t: "while", c: "purple" },
      { t: "(list1 != nullptr && list2 != nullptr) {\n", c: "" },
    ],
  },
  {
    l: 9,
    c: [
      { t: "    ", c: "" },
      { t: "if", c: "purple" },
      { t: "(list1->val < list2->val) {\n", c: "" },
    ],
  },
  {
    l: 10,
    c: [{ t: "      curr->next = list1;\n", c: "" }],
  },
  { l: 11, c: [{ t: "      list1 = list1->next;\n", c: "" }] },
  { l: 12, c: [{ t: "    } ", c: "light-gray" }, { t: "else", c: "purple" }, { t: " {\n", c: "" }] },
  { l: 13, c: [{ t: "      curr->next = list2;\n", c: "" }] },
  { l: 14, c: [{ t: "      list2 = list2->next;\n", c: "" }] },
  { l: 15, c: [{ t: "    }\n", c: "light-gray" }] },
  { l: 17, c: [{ t: "    curr = curr->next;\n", c: "" }] },
  { l: 18, c: [{ t: "  }\n", c: "light-gray" }] },
  {
    l: 20,
    c: [
      { t: "  ", c: "" },
      { t: "if", c: "purple" },
      { t: " (list1 != nullptr) curr->next = list1;\n", c: "" },
    ],
  },
  { l: 21, c: [{ t: "  else curr->next = list2;\n", c: "" }] },
  { l: 23, c: [{ t: "  ListNode* mergedHead = dummy->next;\n", c: "" }] },
  { l: 24, c: [{ t: "  delete dummy;\n", c: "" }] },
  {
    l: 25,
    c: [
      { t: "  ", c: "" },
      { t: "return", c: "purple" },
      { t: " mergedHead;\n", c: "" },
    ],
  },
  { l: 26, c: [{ t: "}\n", c: "light-gray" }] },
];

// Lane row for rendering nodes with connectors
const LaneRow = ({
  idPrefix,
  label,
  color,
  nodes,
  consumedCount = 0,
  pickedDomId = null,
}) => {
  const colorMap = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    slate: "bg-slate-500",
  };

  return (
    <div className="w-full flex items-center gap-4">
      <div className="w-24 text-right pr-2 text-sm text-gray-400 select-none">{label}</div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-center gap-3 py-2">
          {nodes.map((node, idx) => (
            <React.Fragment key={`${idPrefix}-${node.domId}`}>
              <div
                id={`node-${node.domId}`}
                className={`rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${colorMap[color]}`}
                style={{
                  width: 44,
                  height: 44,
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  opacity: idx < consumedCount ? 0.3 : 1,
                  transform: node.domId === pickedDomId ? "scale(1.08)" : "scale(1)",
                  boxShadow: node.domId === pickedDomId ? "0 0 0 3px rgba(56,189,248,0.5)" : undefined,
                }}
                title={`Value: ${node.val}`}
              >
                {node.val}
              </div>
              {idx < nodes.length - 1 && (
                <span className="text-gray-500 select-none">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Visualizer Component
const MergeTwoListsVisualizer = () => {
  const [list1Input, setList1Input] = useState("1,2,4");
  const [list2Input, setList2Input] = useState("1,3,4");
  const [nodes1, setNodes1] = useState([]);
  const [nodes2, setNodes2] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  const buildAndGenerateHistory = () => {
    const parseList = (input, src) =>
      input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((v, i) => ({
          idx: i,
          domId: `${src}-${i}`,
          src,
          val: Number(v),
        }));

    const list1Nodes = parseList(list1Input, "l1");
    const list2Nodes = parseList(list2Input, "l2");

    if (
      list1Nodes.some((n) => isNaN(n.val)) ||
      list2Nodes.some((n) => isNaN(n.val))
    ) {
      alert("Invalid input. Use comma-separated numbers.");
      return;
    }

    generateMergeHistory(list1Nodes, list2Nodes);
    setNodes1(list1Nodes);
    setNodes2(list2Nodes);
    setIsLoaded(true);
  };

  const generateMergeHistory = (list1Nodes, list2Nodes) => {
    const newHistory = [];
    let i = 0,
      j = 0;
    const merged = [];

    const snapshot = (pickedFrom, message = "") => {
      newHistory.push({
        curr1: i < list1Nodes.length ? i : null,
        curr2: j < list2Nodes.length ? j : null,
        l1Id: i < list1Nodes.length ? list1Nodes[i]?.domId : null,
        l2Id: j < list2Nodes.length ? list2Nodes[j]?.domId : null,
        pickedFrom,
        pickedDomId:
          pickedFrom === "l1"
            ? merged[merged.length - 1]?.domId || null
            : pickedFrom === "l2"
            ? merged[merged.length - 1]?.domId || null
            : null,
        merged: [...merged],
        explanation: message ||
          (pickedFrom === "l1"
            ? `Pick list1[${i - 1}] → ${merged[merged.length - 1]?.val}`
            : pickedFrom === "l2"
            ? `Pick list2[${j - 1}] → ${merged[merged.length - 1]?.val}`
            : ""),
      });
    };

    while (i < list1Nodes.length && j < list2Nodes.length) {
      if (list1Nodes[i].val < list2Nodes[j].val) {
        const picked = list1Nodes[i];
        const other = list2Nodes[j];
        merged.push({ ...picked });
        i++;
        snapshot(
          "l1",
          `list1[${i - 1}](${picked.val}) < list2[${j}](${other.val}) → take list1`
        );
      } else {
        const picked = list2Nodes[j];
        const other = list1Nodes[i];
        merged.push({ ...picked });
        j++;
        snapshot(
          "l2",
          `list2[${j - 1}](${picked.val}) <= list1[${i}](${other.val}) → take list2`
        );
      }
    }

    while (i < list1Nodes.length) {
      const picked = list1Nodes[i];
      merged.push({ ...picked });
      i++;
      snapshot("l1", `append remaining list1[${i - 1}](${picked.val})`);
    }

    while (j < list2Nodes.length) {
      const picked = list2Nodes[j];
      merged.push({ ...picked });
      j++;
      snapshot("l2", `append remaining list2[${j - 1}](${picked.val})`);
    }

    setHistory(newHistory);
    setCurrentStep(0);
  };

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setNodes1([]);
    setNodes2([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoaded) {
        if (e.key === "ArrowLeft") stepBackward();
        if (e.key === "ArrowRight") stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, stepForward, stepBackward]);

  const state = history[currentStep] || {};
  const l1Consumed = (state.merged || []).filter((n) => n.src === "l1").length;
  const l2Consumed = (state.merged || []).filter((n) => n.src === "l2").length;
  const mergedSoFar = state.merged || [];
  const n = nodes1.length;
  const m = nodes2.length;
  const visited = mergedSoFar.length;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
          Merge Two Sorted Lists
        </h1>
        <p className="text-xl text-gray-400 mt-3">Step-by-Step Visualization</p>
      </header>

      {/* Input Controls */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
              List 1:
            </label>
            <input
              type="text"
              value={list1Input}
              onChange={(e) => setList1Input(e.target.value)}
              disabled={isLoaded}
              className="font-mono flex-grow sm:w-48 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
              placeholder="e.g., 1,2,4"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
              List 2:
            </label>
            <input
              type="text"
              value={list2Input}
              onChange={(e) => setList2Input(e.target.value)}
              disabled={isLoaded}
              className="font-mono w-48 bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-sky-500 focus:outline-none transition-colors"
              placeholder="e.g., 1,3,4"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <button
              onClick={buildAndGenerateHistory}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ◀
              </button>
              <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ▶
              </button>
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 ml-4"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {isLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code / Explanation */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-sky-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
              <Code size={22} />
              C++ Merge Logic
            </h3>
            <CodeBlock codeLines={mergeCppCode} />
          </div>

          {/* Visualizer */}
          <div className="lg:col-span-2 bg-gray-900 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-sky-400 mb-4">
              Visualization
            </h3>
            <div
              id="visualizer-container"
              className="relative w-full h-[32rem] border-2 border-gray-700 rounded-lg overflow-visible"
            >
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <LaneRow
                  idPrefix="l1"
                  label="List 1"
                  color="green"
                  nodes={nodes1}
                  consumedCount={l1Consumed}
                  pickedDomId={state.pickedFrom === "l1" ? state.pickedDomId : null}
                />
                <LaneRow
                  idPrefix="l2"
                  label="List 2"
                  color="blue"
                  nodes={nodes2}
                  consumedCount={l2Consumed}
                  pickedDomId={state.pickedFrom === "l2" ? state.pickedDomId : null}
                />
                <LaneRow
                  idPrefix="m"
                  label="Merged"
                  color="amber"
                  nodes={mergedSoFar}
                  consumedCount={0}
                  pickedDomId={mergedSoFar[mergedSoFar.length - 1]?.domId || null}
                />
              </div>

              {currentStep >= 0 && (
                <VisualizerPointer
                  nodeId={nodes1[state.curr1]?.domId ?? null}
                  containerId="visualizer-container"
                  color="green"
                  label="List 1"
                  yOffset={-16}
                />
              )}
              {currentStep >= 0 && (
                <VisualizerPointer
                  nodeId={nodes2[state.curr2]?.domId ?? null}
                  containerId="visualizer-container"
                  color="blue"
                  label="List 2"
                  yOffset={-16}
                />
              )}
              {currentStep >= 0 && mergedSoFar.length > 0 && (
                <VisualizerPointer
                  nodeId={mergedSoFar[mergedSoFar.length - 1]?.domId}
                  containerId="visualizer-container"
                  color="amber"
                  label="Tail"
                  yOffset={-16}
                />
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-2">
                {currentStep >= 0 && state.explanation}
              </p>
              <button
                onClick={() => {
                  const explanationBox = document.getElementById(
                    "explanation-box"
                  );
                  if (explanationBox) {
                    explanationBox.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs text-sky-400 hover:underline"
              >
                Scroll to Explanation
              </button>
            </div>
          </div>

          {/* Explanation / Steps */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-sky-400 mb-4">
              Step-by-Step Explanation
            </h3>
            <div
              id="explanation-box"
              className="max-h-[32rem] overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            >
              {history.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  No steps to display. Load lists to visualize the merging steps.
                </p>
              )}
              {history.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg mb-2 transition-all ${
                    currentStep === index
                      ? "bg-gray-700 shadow-lg"
                      : "bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          currentStep === index
                            ? "bg-sky-400"
                            : "bg-gray-600"
                        }`}
                      ></div>
                      <span className="font-mono text-xs text-gray-400">
                        Step {index + 1}
                      </span>
                    </div>
                    {currentStep === index && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300">
                          Current Step
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {step.explanation}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {step.merged.map((node) => (
                      <div
                        key={node.domId}
                        className="flex items-center gap-1"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              node.src === "l1"
                                ? "rgb(34 197 94)"
                                : "rgb(59 130 246)",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.875rem",
                          }}
                        >
                          {node.val}
                        </div>
                        <span className="text-xs text-gray-400">
                          {node.src === "l1" ? "List 1" : "List 2"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complexity Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-sky-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
              <Clock size={22} />
              Time & Space Complexity
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <Hash className="text-sky-400" size={18} />
                <div>
                  <div className="text-sm">Input sizes</div>
                  <div className="text-xs text-gray-400">n = |list1|, m = |list2|</div>
                </div>
                <div className="ml-auto font-mono text-sm bg-gray-900 px-3 py-1 rounded border border-gray-700">n = {n}</div>
                <div className="font-mono text-sm bg-gray-900 px-3 py-1 rounded border border-gray-700">m = {m}</div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-amber-400" size={18} />
                <div>
                  <div className="text-sm">Time complexity</div>
                  <div className="text-xs text-gray-400">O(n + m)</div>
                </div>
                <div className="ml-auto font-mono text-sm bg-gray-900 px-3 py-1 rounded border border-gray-700">visited = {visited}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-emerald-500/60 border border-emerald-400"></div>
                <div>
                  <div className="text-sm">Space complexity</div>
                  <div className="text-xs text-gray-400">O(1) extra (ignoring output list nodes)</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                We create a dummy node and move pointers; no additional data structures proportional to n or m are used.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Notes */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>
          Visualization of the merging process of two sorted linked lists.
        </p>
        <p>
          <a
            href="https://github.com/yourusername/merge-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            View Source Code
          </a>
        </p>
      </div>
    </div>
  );
};

export default MergeTwoListsVisualizer;
