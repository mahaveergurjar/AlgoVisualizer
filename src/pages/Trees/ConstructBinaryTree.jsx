import React, { useState, useEffect, useCallback } from "react";
import { Code, Clock, GitMerge, Layers, TreeDeciduous } from "lucide-react";

const ConstructBinaryTree = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [preorderInput, setPreorderInput] = useState("3,9,20,15,7");
  const [inorderInput, setInorderInput] = useState("9,3,15,20,7");
  const [isLoaded, setIsLoaded] = useState(false);

  const generateHistory = useCallback((preorder, inorder) => {
    const newHistory = [];
    let nodeCounter = 0;
    let nodes = [];
    let edges = [];

    const addState = (props) =>
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        callStack: [],
        explanation: "",
        preorder,
        inorder,
        nodesCreatedSoFar: nodes.length,
        ...props,
      });

    function build(
      prelo,
      prehi,
      inlo,
      inhi,
      parentId,
      callStack,
      x,
      y,
      xOffset
    ) {
      const call = { prelo, prehi, inlo, inhi, id: Math.random() };
      const newCallStack = [...callStack, call];

      addState({
        callStack: newCallStack,
        line: 4,
        explanation: `Recursive call: preorder[${prelo}:${prehi}], inorder[${inlo}:${inhi}]`,
        highlightNode: null,
      });

      if (prelo > prehi) {
        addState({
          callStack: newCallStack,
          line: 5,
          explanation: "Base case reached: range is invalid, returning null.",
          highlightNode: null,
        });
        return null;
      }

      const rootVal = preorder[prelo];
      const nodeId = nodeCounter++;

      addState({
        callStack: newCallStack,
        line: 6,
        currentRootValue: rootVal,
        currentRootIndex: prelo,
        explanation: `Creating node with value ${rootVal} from preorder[${prelo}]`,
        highlightNode: null,
        showNodesUpTo: nodes.length - 1,
      });

      const newNode = {
        id: nodeId,
        data: rootVal,
        x,
        y,
        left: null,
        right: null,
      };
      nodes.push(newNode);

      if (parentId !== null) {
        edges.push({ from: parentId, to: nodeId });
      }

      addState({
        callStack: newCallStack,
        nodes,
        edges,
        line: 6,
        currentRootValue: rootVal,
        currentRootIndex: prelo,
        explanation: `Node ${rootVal} created and added to tree at position (${Math.round(
          x
        )}, ${Math.round(y)})`,
        highlightNode: nodeId,
        justCreatedNode: nodeId,
        showNodesUpTo: nodes.length,
      });

      if (prelo === prehi) {
        addState({
          callStack: newCallStack,
          nodes,
          edges,
          line: 7,
          explanation: `Leaf node detected. Returning node ${rootVal}.`,
          highlightNode: nodeId,
        });
        return newNode;
      }

      let i = inlo;
      addState({
        callStack: newCallStack,
        nodes,
        edges,
        line: 8,
        explanation: `Searching for ${rootVal} in inorder array from index ${inlo} to ${inhi}`,
        highlightNode: nodeId,
      });

      while (i <= inhi) {
        addState({
          callStack: newCallStack,
          nodes,
          edges,
          line: 9,
          i,
          explanation: `Checking inorder[${i}] = ${inorder[i]}`,
          highlightNode: nodeId,
        });

        if (inorder[i] === rootVal) {
          addState({
            callStack: newCallStack,
            nodes,
            edges,
            line: 10,
            i,
            explanation: `Found root ${rootVal} at index ${i} in inorder array!`,
            highlightNode: nodeId,
          });
          break;
        }
        i++;
      }

      let leftCount = i - inlo;
      addState({
        callStack: newCallStack,
        nodes,
        edges,
        line: 14,
        i,
        explanation: `Left subtree size calculated: ${i} - ${inlo} = ${leftCount} nodes`,
        highlightNode: nodeId,
      });

      if (leftCount > 0) {
        addState({
          callStack: newCallStack,
          nodes,
          edges,
          line: 15,
          i,
          explanation: `Building left subtree: preorder[${prelo + 1}:${
            prelo + leftCount
          }], inorder[${inlo}:${i - 1}]`,
          highlightNode: nodeId,
        });

        newNode.left = build(
          prelo + 1,
          prelo + leftCount,
          inlo,
          i - 1,
          nodeId,
          newCallStack,
          x - xOffset,
          y + 100,
          xOffset / 2
        );
      }

      if (i < inhi) {
        addState({
          callStack: newCallStack,
          nodes,
          edges,
          line: 16,
          i,
          explanation: `Building right subtree: preorder[${
            prelo + leftCount + 1
          }:${prehi}], inorder[${i + 1}:${inhi}]`,
          highlightNode: nodeId,
        });

        newNode.right = build(
          prelo + leftCount + 1,
          prehi,
          i + 1,
          inhi,
          nodeId,
          newCallStack,
          x + xOffset,
          y + 100,
          xOffset / 2
        );
      }

      addState({
        callStack: newCallStack,
        nodes,
        edges,
        line: 17,
        i,
        explanation: `Completed building subtree rooted at ${rootVal}`,
        highlightNode: nodeId,
      });

      return newNode;
    }

    addState({
      line: 0,
      explanation:
        "Starting tree construction from preorder and inorder traversals",
      highlightNode: null,
    });

    build(
      0,
      preorder.length - 1,
      0,
      inorder.length - 1,
      null,
      [],
      450,
      80,
      200
    );

    addState({
      finished: true,
      explanation: "Tree construction complete! All nodes have been created.",
      highlightNode: null,
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArrays = () => {
    const pre = preorderInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);
    const ino = inorderInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (
      pre.some(isNaN) ||
      ino.some(isNaN) ||
      pre.length !== ino.length ||
      pre.length === 0
    ) {
      alert(
        "Invalid input. Ensure both are comma-separated numbers of the same length."
      );
      return;
    }

    setIsLoaded(true);
    generateHistory(pre, ino);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
  };

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

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
  const { preorder = [], inorder = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    "light-blue": "text-sky-300",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    red: "text-red-400",
    "light-gray": "text-gray-400",
    green: "text-green-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors px-2 py-1 ${
        state.line === line
          ? "bg-emerald-500/20 border-l-4 border-emerald-400"
          : ""
      }`}
    >
      <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  const code = [
    {
      l: 4,
      c: [
        { t: "if", c: "purple" },
        { t: " (prelo > prehi) ", c: "" },
        { t: "return", c: "purple" },
        { t: " NULL;", c: "" },
      ],
    },
    {
      l: 6,
      c: [
        { t: "TreeNode*", c: "cyan" },
        { t: " root = ", c: "" },
        { t: "new", c: "purple" },
        { t: " TreeNode(pre[prelo]);", c: "" },
      ],
    },
    {
      l: 7,
      c: [
        { t: "if", c: "purple" },
        { t: " (prelo == prehi) ", c: "" },
        { t: "return", c: "purple" },
        { t: " root;", c: "" },
      ],
    },
    {
      l: 8,
      c: [
        { t: "int", c: "cyan" },
        { t: " i = inlo;", c: "" },
      ],
    },
    {
      l: 9,
      c: [
        { t: "while", c: "purple" },
        { t: "(i <= inhi){", c: "" },
      ],
    },
    {
      l: 10,
      c: [
        { t: "  if", c: "purple" },
        { t: "(in[i] == pre[prelo]) ", c: "" },
        { t: "break", c: "purple" },
        { t: ";", c: "light-gray" },
      ],
    },
    { l: 12, c: [{ t: "  i++;", c: "" }] },
    { l: 13, c: [{ t: "}", c: "light-gray" }] },
    {
      l: 14,
      c: [
        { t: "int", c: "cyan" },
        { t: " leftCount = i - inlo;", c: "" },
      ],
    },
    {
      l: 15,
      c: [
        {
          t: "root->left = build(pre, prelo+1, prelo+leftCount, in, inlo, i-1);",
          c: "",
        },
      ],
    },
    {
      l: 16,
      c: [
        {
          t: "root->right = build(pre, prelo+leftCount+1, prehi, in, i+1, inhi);",
          c: "",
        },
      ],
    },
    {
      l: 17,
      c: [
        { t: "return", c: "purple" },
        { t: " root;", c: "" },
      ],
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
          Binary Tree Constructor
        </h1>
        <p className="text-xl text-gray-400 mt-3">
          From Preorder & Inorder Traversal (LeetCode 105)
        </p>
      </header>

      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow w-full">
            <div className="flex items-center gap-3 w-full">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                Preorder:
              </label>
              <input
                type="text"
                value={preorderInput}
                onChange={(e) => setPreorderInput(e.target.value)}
                disabled={isLoaded}
                className="font-mono flex-grow bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-emerald-500 focus:outline-none transition-colors text-white"
                placeholder="3,9,20,15,7"
              />
            </div>
            <div className="flex items-center gap-3 w-full">
              <label className="font-mono text-sm text-gray-300 whitespace-nowrap">
                Inorder:
              </label>
              <input
                type="text"
                value={inorderInput}
                onChange={(e) => setInorderInput(e.target.value)}
                disabled={isLoaded}
                className="font-mono flex-grow bg-gray-900 p-2 rounded-lg border-2 border-gray-600 focus:border-emerald-500 focus:outline-none transition-colors text-white"
                placeholder="9,3,15,20,7"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isLoaded ? (
              <button
                onClick={loadArrays}
                className="bg-gradient-to-r from-emerald-500 to-green-600 cursor-pointer hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="font-mono text-lg w-28 text-center bg-gray-700 px-3 py-2 rounded-lg">
                  {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
                </span>
                <button
                  onClick={stepForward}
                  disabled={currentStep >= history.length - 1}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 font-bold py-3 cursor-pointer px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
            <div>
              <h3 className="font-bold text-2xl text-emerald-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2">
                <Code size={22} />
                C++ Solution
              </h3>
              <pre className="text-sm overflow-auto max-h-80">
                <code className="font-mono leading-relaxed">
                  {code.map((l) => (
                    <CodeLine key={l.l} line={l.l} content={l.c} />
                  ))}
                </code>
              </pre>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-mono text-sm text-cyan-300 mb-3 flex items-center gap-2">
                <Layers size={18} />
                Recursion Call Stack
              </h4>
              <div className="flex flex-col-reverse gap-2 max-h-64 overflow-y-auto">
                {state.callStack?.length > 0 ? (
                  state.callStack.map((call, index) => (
                    <div
                      key={call.id}
                      className={`p-3 rounded-lg border-2 text-xs transition-all ${
                        index === state.callStack.length - 1
                          ? "bg-emerald-500/30 border-emerald-400 scale-105 shadow-lg"
                          : "bg-gray-700/50 border-gray-600"
                      }`}
                    >
                      <p className="font-bold text-emerald-300">
                        build(pre[{call.prelo}:{call.prehi}], in[{call.inlo}:
                        {call.inhi}])
                      </p>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-sm">
                    No active calls
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-200 flex items-center gap-2">
                  <TreeDeciduous size={24} />
                  Binary Tree Visualization
                </h3>
                <div className="text-sm text-gray-400 font-mono bg-gray-700/50 px-3 py-1 rounded-lg">
                  {state.showNodesUpTo ?? state.nodes?.length ?? 0} /{" "}
                  {state.nodes?.length || 0} nodes visible
                </div>
              </div>

              <div
                className="relative bg-gray-900/30 rounded-xl p-4"
                style={{ width: "100%", height: "450px", overflow: "auto" }}
              >
                <svg
                  className="absolute top-0 left-0"
                  style={{ width: "1000px", height: "450px" }}
                >
                  <defs>
                    <linearGradient
                      id="edge-gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  {state.edges?.map((edge, i) => {
                    const fromNode = state.nodes.find(
                      (n) => n.id === edge.from
                    );
                    const toNode = state.nodes.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const showNodesUpTo =
                      state.showNodesUpTo ?? state.nodes.length;
                    const fromIndex = state.nodes.findIndex(
                      (n) => n.id === edge.from
                    );
                    const toIndex = state.nodes.findIndex(
                      (n) => n.id === edge.to
                    );
                    if (fromIndex >= showNodesUpTo || toIndex >= showNodesUpTo)
                      return null;

                    const isLeft = toNode.x < fromNode.x;
                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2;

                    return (
                      <g key={i}>
                        <line
                          x1={fromNode.x}
                          y1={fromNode.y + 28}
                          x2={toNode.x}
                          y2={toNode.y - 28}
                          stroke="#10b981"
                          strokeWidth="3"
                          className="drop-shadow-lg"
                        />
                        <circle
                          cx={midX}
                          cy={midY}
                          r="16"
                          className="fill-gray-800 stroke-emerald-400"
                          strokeWidth="2"
                        />
                        <text
                          x={midX}
                          y={midY + 5}
                          className="fill-emerald-300 text-sm font-bold"
                          textAnchor="middle"
                        >
                          {isLeft ? "L" : "R"}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div
                  className="absolute top-0 left-0"
                  style={{ width: "1000px", height: "450px" }}
                >
                  {state.nodes?.map((node, nodeIndex) => {
                    const showNodesUpTo =
                      state.showNodesUpTo ?? state.nodes.length;
                    if (nodeIndex >= showNodesUpTo) return null;

                    const isHighlighted = state.highlightNode === node.id;
                    const isJustCreated = state.justCreatedNode === node.id;

                    return (
                      <div
                        key={node.id}
                        className={`absolute transition-all duration-500 ${
                          isJustCreated ? "animate-bounce" : ""
                        }`}
                        style={{
                          left: `${node.x - 32}px`,
                          top: `${node.y - 32}px`,
                        }}
                      >
                        <div
                          className={`w-16 h-16 flex items-center justify-center rounded-full font-mono text-xl font-bold text-white border-4 transition-all duration-300 shadow-2xl ${
                            isHighlighted || isJustCreated
                              ? "bg-gradient-to-br from-emerald-400 to-green-500 border-white scale-110 shadow-emerald-500/70"
                              : "bg-gradient-to-br from-teal-600 to-emerald-600 border-emerald-400"
                          }`}
                        >
                          {node.data}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                <div className="flex items-center justify-around text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 border-4 border-white rounded-full shadow-lg"></div>
                    <span className="text-gray-300 font-semibold">
                      Currently Processing
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-600 border-4 border-emerald-400 rounded-full shadow-lg"></div>
                    <span className="text-gray-300 font-semibold">
                      Completed Node
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-mono text-base text-gray-200 font-semibold">
                    Preorder Traversal
                  </h4>
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-500/20 px-2 py-1 rounded">
                    Root → Left → Right
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap bg-gray-900/50 p-3 rounded-lg">
                  {preorder.map((val, index) => {
                    const call = state.callStack?.[state.callStack.length - 1];
                    const isActive =
                      call && index >= call.prelo && index <= call.prehi;
                    const isRoot = call && index === call.prelo;

                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono text-base font-bold border-2 transition-all ${
                            isRoot
                              ? "bg-emerald-500 text-white border-emerald-300 scale-110 shadow-lg shadow-emerald-500/50"
                              : isActive
                              ? "bg-emerald-500/30 border-emerald-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-300"
                          }`}
                        >
                          {val}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          [{index}]
                        </span>
                        {isRoot && (
                          <span className="text-xs text-emerald-400 font-bold mt-1">
                            ROOT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const call = state.callStack?.[state.callStack.length - 1];
                  if (call) {
                    return (
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        Active Range: [{call.prelo}, {call.prehi}]
                      </div>
                    );
                  }
                })()}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-mono text-base text-gray-200 font-semibold">
                    Inorder Traversal
                  </h4>
                  <span className="text-xs text-amber-400 font-mono bg-amber-500/20 px-2 py-1 rounded">
                    Left → Root → Right
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap bg-gray-900/50 p-3 rounded-lg">
                  {inorder.map((val, index) => {
                    const call = state.callStack?.[state.callStack.length - 1];
                    const isActive =
                      call && index >= call.inlo && index <= call.inhi;
                    const isRoot = state.i !== undefined && index === state.i;
                    const isLeftSubtree =
                      state.i !== undefined &&
                      call &&
                      index >= call.inlo &&
                      index < state.i;
                    const isRightSubtree =
                      state.i !== undefined &&
                      call &&
                      index > state.i &&
                      index <= call.inhi;

                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono text-base font-bold border-2 transition-all ${
                            isRoot
                              ? "bg-amber-500 text-white border-amber-300 scale-110 shadow-lg shadow-amber-500/50"
                              : isLeftSubtree
                              ? "bg-blue-500/50 border-blue-400 text-white"
                              : isRightSubtree
                              ? "bg-purple-500/50 border-purple-400 text-white"
                              : isActive
                              ? "bg-emerald-500/30 border-emerald-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-300"
                          }`}
                        >
                          {val}
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          [{index}]
                        </span>
                        {isRoot && (
                          <span className="text-xs text-amber-400 font-bold mt-1">
                            SPLIT
                          </span>
                        )}
                        {isLeftSubtree && (
                          <span className="text-xs text-blue-400 mt-1">
                            LEFT
                          </span>
                        )}
                        {isRightSubtree && (
                          <span className="text-xs text-purple-400 mt-1">
                            RIGHT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const call = state.callStack?.[state.callStack.length - 1];
                  if (call && state.i !== undefined) {
                    const leftCount = state.i - call.inlo;
                    const rightCount = call.inhi - state.i;
                    return (
                      <div className="mt-2 text-xs font-mono space-y-1 bg-gray-700/30 p-2 rounded">
                        <div className="text-gray-400">
                          Range: [{call.inlo}, {call.inhi}] | Split at:{" "}
                          {state.i}
                        </div>
                        <div className="flex gap-4">
                          <span className="text-blue-400">
                            Left: {leftCount} nodes
                          </span>
                          <span className="text-purple-400">
                            Right: {rightCount} nodes
                          </span>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                <h5 className="text-sm font-semibold text-gray-400 mb-3">
                  Color Legend:
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg border-2 border-emerald-300"></div>
                    <span>Current Root</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg border-2 border-amber-300"></div>
                    <span>Split Point</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/50 rounded-lg border-2 border-blue-400"></div>
                    <span>Left Subtree</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/50 rounded-lg border-2 border-purple-400"></div>
                    <span>Right Subtree</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl min-h-[6rem]">
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                Step Explanation
              </h3>
              <p className="text-gray-200 text-base leading-relaxed">
                {state.explanation || 'Click "Load & Visualize" to begin'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-emerald-400 mb-5 pb-3 border-b-2 border-gray-600 flex items-center gap-2">
              <Clock size={24} />
              Complexity Analysis
            </h3>
            <div className="space-y-5 text-base">
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-emerald-300 text-lg mb-2">
                  Time Complexity:{" "}
                  <span className="font-mono text-teal-300">O(N²)</span>
                </h4>
                <p className="text-gray-300">
                  In this implementation, for each node we create, we iterate
                  through the inorder array to find the root's position. In the
                  worst case of a skewed tree, this leads to a total time
                  complexity of N + (N-1) + ... + 1, which is O(N²). This can be
                  optimized to O(N) by using a hash map to store inorder
                  indices.
                </p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <h4 className="font-semibold text-emerald-300 text-lg mb-2">
                  Space Complexity:{" "}
                  <span className="font-mono text-teal-300">O(N)</span>
                </h4>
                <p className="text-gray-300">
                  The space is dominated by the recursion call stack. In the
                  worst case of a skewed tree (like a linked list), the
                  recursion depth can go up to N, leading to O(N) space. For a
                  perfectly balanced tree, the space complexity would be O(log
                  N) for the call stack, plus O(N) for storing the tree nodes.
                </p>
              </div>
              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                <h4 className="font-semibold text-emerald-300 text-lg mb-2">
                  💡 Key Insights
                </h4>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Preorder's first element is always the root</li>
                  <li>
                    Inorder splits into left and right subtrees at the root
                    position
                  </li>
                  <li>
                    The size of the left subtree determines preorder indices for
                    children
                  </li>
                  <li>
                    Recursively apply the same logic to build left and right
                    subtrees
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <TreeDeciduous size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-xl">
            Load preorder and inorder arrays to begin visualization
          </p>
        </div>
      )}
    </div>
  );
};

export default ConstructBinaryTree;
