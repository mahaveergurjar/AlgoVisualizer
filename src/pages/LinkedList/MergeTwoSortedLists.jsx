import React, { useState, useEffect } from "react";
import { useVisualizer } from "../../hooks/useVisualizer";
import VisualizerLayout from "../../components/VisualizerLayout";
import { ArrowUp } from "lucide-react";

// Pointer Component
const VisualizerPointer = ({ nodeId, containerId, color, label, yOffset = 0 }) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0, top: 0 });

  useEffect(() => {
    if (nodeId === null || nodeId === undefined) {
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
      <div className="w-20 text-right pr-2 text-sm text-gray-400 select-none">{label}</div>
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

  const visualizerState = useVisualizer();
  const {
    currentStep,
    currentState,
    isLoaded,
    load,
    reset: hookReset,
  } = visualizerState;

  const reset = () => {
    hookReset();
    setNodes1([]);
    setNodes2([]);
  };

  const generateMergeHistory = (list1Nodes, list2Nodes) => {
    const newHistory = [];
    let i = 0,
      j = 0;
    const merged = [];

    const addState = (line, pickedFrom, message, extraProps = {}) => {
      newHistory.push({
        line,
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
        explanation: message,
        ...extraProps
      });
    };

    // Initial state
    addState(
      5,
      null,
      "Initialize dummy node to start the merged list."
    );

    while (i < list1Nodes.length && j < list2Nodes.length) {
      addState(
        8,
        null,
        `Compare elements from both lists: list1[${i}] (${list1Nodes[i].val}) and list2[${j}] (${list2Nodes[j].val}).`
      );

      if (list1Nodes[i].val < list2Nodes[j].val) {
        const picked = list1Nodes[i];
        const other = list2Nodes[j];
        addState(
          9,
          null,
          `Since list1[${i}] (${picked.val}) < list2[${j}] (${other.val}), we choose the node from list1.`
        );
        merged.push({ ...picked });
        i++;
        addState(
          10,
          "l1",
          `Connect current node to list1's node (${picked.val}) and advance list1 pointer.`,
          { finished: false }
        );
      } else {
        const picked = list2Nodes[j];
        const other = list1Nodes[i];
        addState(
          9,
          null,
          `Since list2[${j}] (${picked.val}) <= list1[${i}] (${other.val}), we choose the node from list2.`
        );
        merged.push({ ...picked });
        j++;
        addState(
          13,
          "l2",
          `Connect current node to list2's node (${picked.val}) and advance list2 pointer.`,
          { finished: false }
        );
      }
      addState(
        17,
        null,
        "Move the current pointer of the merged list forward."
      );
    }

    // Append remaining
    if (i < list1Nodes.length) {
      addState(
        20,
        null,
        "List 2 is empty. Append all remaining nodes of List 1."
      );
      while (i < list1Nodes.length) {
        const picked = list1Nodes[i];
        merged.push({ ...picked });
        i++;
        addState(
          20,
          "l1",
          `Append remaining node list1[${i - 1}] (${picked.val}) to the merged list.`
        );
      }
    } else if (j < list2Nodes.length) {
      addState(
        21,
        null,
        "List 1 is empty. Append all remaining nodes of List 2."
      );
      while (j < list2Nodes.length) {
        const picked = list2Nodes[j];
        merged.push({ ...picked });
        j++;
        addState(
          21,
          "l2",
          `Append remaining node list2[${j - 1}] (${picked.val}) to the merged list.`
        );
      }
    }

    addState(
      25,
      null,
      "Merging complete. Return the head of the merged list (dummy->next).",
      { finished: true }
    );

    return newHistory;
  };

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

    const newHistory = generateMergeHistory(list1Nodes, list2Nodes);
    setNodes1(list1Nodes);
    setNodes2(list2Nodes);
    if (newHistory) {
      load(newHistory);
    }
  };

  const codeContent = {
    1: "public:",
    2: "ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {",
    3: "  if (list1 == nullptr && list2 == nullptr) return nullptr;",
    5: "  ListNode* dummy = new ListNode(0);",
    6: "  ListNode* curr = dummy;",
    8: "  while (list1 != nullptr && list2 != nullptr) {",
    9: "    if (list1->val < list2->val) {",
    10: "      curr->next = list1;",
    11: "      list1 = list1->next;",
    12: "    } else {",
    13: "      curr->next = list2;",
    14: "      list2 = list2->next;",
    15: "    }",
    17: "    curr = curr->next;",
    18: "  }",
    20: "  if (list1 != nullptr) curr->next = list1;",
    21: "  else curr->next = list2;",
    23: "  ListNode* mergedHead = dummy->next;",
    24: "  delete dummy;",
    25: "  return mergedHead;",
    26: "}"
  };

  const inputSection = (
    <div className="flex flex-wrap items-center gap-4 w-full">
      <div className="flex items-center gap-2 flex-grow min-w-[150px]">
        <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
          List 1:
        </label>
        <input
          type="text"
          value={list1Input}
          onChange={(e) => setList1Input(e.target.value)}
          disabled={isLoaded}
          className="font-mono w-full bg-gray-955/50 p-2 rounded-xl border border-gray-800 focus:border-cyan-500 focus:outline-none text-white text-sm"
          placeholder="e.g. 1,2,4"
        />
      </div>
      <div className="flex items-center gap-2 flex-grow min-w-[150px]">
        <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
          List 2:
        </label>
        <input
          type="text"
          value={list2Input}
          onChange={(e) => setList2Input(e.target.value)}
          disabled={isLoaded}
          className="font-mono w-full bg-gray-955/50 p-2 rounded-xl border border-gray-800 focus:border-cyan-500 focus:outline-none text-white text-sm"
          placeholder="e.g. 1,3,4"
        />
      </div>
      {!isLoaded && (
        <button
          onClick={buildAndGenerateHistory}
          className="bg-cyan-500 hover:bg-cyan-400 text-gray-955 font-bold py-2 px-5 rounded-xl transition-all shadow-lg text-sm"
        >
          Load & Visualize
        </button>
      )}
    </div>
  );

  const statsSection = (
    <>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Time Complexity</h4>
        <p className="text-xl font-bold text-cyan-300 font-mono">O(N + M)</p>
        <p className="text-xs text-gray-400 mt-1">
          We traverse both lists at most once. Linear scan takes time proportional to the sum of lengths.
        </p>
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Space Complexity</h4>
        <p className="text-xl font-bold text-teal-300 font-mono">O(1)</p>
        <p className="text-xs text-gray-400 mt-1">
          No extra nodes are created. We only adjust pointers to link existing nodes.
        </p>
      </div>
      <div className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Merge Stats</h4>
        <p className="text-lg font-bold text-gray-200 font-mono">
          N = {nodes1.length}, M = {nodes2.length}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Merged so far: <span className="text-cyan-400 font-bold font-mono">{(currentState.merged || []).length}</span> nodes.
        </p>
      </div>
    </>
  );

  const overriddenVisualizerState = {
    ...visualizerState,
    reset,
  };

  return (
    <VisualizerLayout
      title="Merge Two Sorted Lists"
      description="Visualizing LeetCode 21"
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={currentState.line}
      message={currentState.explanation}
      visualizerState={overriddenVisualizerState}
      statsSection={statsSection}
    >
      {isLoaded && (
        <div
          id="visualizer-container"
          className="relative w-full h-[32rem] rounded-lg overflow-visible flex flex-col justify-between p-4"
        >
          <LaneRow
            idPrefix="l1"
            label="List 1"
            color="green"
            nodes={nodes1}
            consumedCount={(currentState.merged || []).filter((n) => n.src === "l1").length}
            pickedDomId={currentState.pickedFrom === "l1" ? currentState.pickedDomId : null}
          />
          <LaneRow
            idPrefix="l2"
            label="List 2"
            color="blue"
            nodes={nodes2}
            consumedCount={(currentState.merged || []).filter((n) => n.src === "l2").length}
            pickedDomId={currentState.pickedFrom === "l2" ? currentState.pickedDomId : null}
          />
          <LaneRow
            idPrefix="m"
            label="Merged"
            color="amber"
            nodes={currentState.merged || []}
            consumedCount={0}
            pickedDomId={(currentState.merged || [])[(currentState.merged || []).length - 1]?.domId || null}
          />

          {currentStep >= 0 && (
            <VisualizerPointer
              nodeId={nodes1[currentState.curr1]?.domId ?? null}
              containerId="visualizer-container"
              color="green"
              label="List 1"
              yOffset={-16}
            />
          )}
          {currentStep >= 0 && (
            <VisualizerPointer
              nodeId={nodes2[currentState.curr2]?.domId ?? null}
              containerId="visualizer-container"
              color="blue"
              label="List 2"
              yOffset={-16}
            />
          )}
          {currentStep >= 0 && (currentState.merged || []).length > 0 && (
            <VisualizerPointer
              nodeId={(currentState.merged || [])[(currentState.merged || []).length - 1]?.domId}
              containerId="visualizer-container"
              color="amber"
              label="Tail"
              yOffset={-16}
            />
          )}
        </div>
      )}
    </VisualizerLayout>
  );
};

export default MergeTwoListsVisualizer;
