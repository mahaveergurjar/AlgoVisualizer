import React, { useState, useEffect, useCallback } from "react";
import {
  Code,
  CheckCircle,
  BarChart3,
  Clock,
  Repeat,
  GitCompareArrows,
  GitMerge,
} from "lucide-react";
import VisualizerPointer from "../../components/VisualizerPointer";

// Main Visualizer Component
const MergeSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("cpp");

  const generateMergeSortHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalComparisons = 0;
    let totalMerges = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)), // Deep copy of objects
        left: null,
        right: null,
        mid: null,
        i: null,
        j: null,
        k: null,
        leftArray: [],
        rightArray: [],
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalComparisons,
        totalMerges,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Merge Sort algorithm." });

    const merge = (arr, left, mid, right) => {
      const leftArr = [];
      const rightArr = [];

      // Create left and right subarrays
      for (let i = left; i <= mid; i++) {
        leftArr.push(arr[i]);
      }
      for (let j = mid + 1; j <= right; j++) {
        rightArr.push(arr[j]);
      }

      addState({
        line: 8,
        left: left,
        right: right,
        mid: mid,
        leftArray: leftArr,
        rightArray: rightArr,
        i: left,
        j: mid + 1,
        k: left,
        explanation: `Merging left array [${leftArr
          .map((x) => x.value)
          .join(", ")}] and right array [${rightArr
          .map((x) => x.value)
          .join(", ")}]`,
      });

      let i = 0,
        j = 0,
        k = left;

      while (i < leftArr.length && j < rightArr.length) {
        totalComparisons++;
        addState({
          line: 9,
          left: left,
          right: right,
          mid: mid,
          leftArray: leftArr,
          rightArray: rightArr,
          i: left + i,
          j: mid + 1 + j,
          k: k,
          explanation: `Comparing left[${i}] (${leftArr[i].value}) with right[${j}] (${rightArr[j].value})`,
        });

        if (leftArr[i].value <= rightArr[j].value) {
          arr[k] = leftArr[i];
          addState({
            line: 10,
            left: left,
            right: right,
            mid: mid,
            leftArray: leftArr,
            rightArray: rightArr,
            i: left + i,
            j: mid + 1 + j,
            k: k,
            explanation: `${leftArr[i].value} <= ${rightArr[j].value}, taking from left array`,
          });
          i++;
        } else {
          arr[k] = rightArr[j];
          addState({
            line: 12,
            left: left,
            right: right,
            mid: mid,
            leftArray: leftArr,
            rightArray: rightArr,
            i: left + i,
            j: mid + 1 + j,
            k: k,
            explanation: `${leftArr[i].value} > ${rightArr[j].value}, taking from right array`,
          });
          j++;
        }
        k++;
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        addState({
          line: 15,
          left: left,
          right: right,
          mid: mid,
          leftArray: leftArr,
          rightArray: rightArr,
          i: left + i,
          j: mid + 1 + j,
          k: k,
          explanation: `Copying remaining elements from left array: ${leftArr[i].value}`,
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        addState({
          line: 18,
          left: left,
          right: right,
          mid: mid,
          leftArray: leftArr,
          rightArray: rightArr,
          i: left + i,
          j: mid + 1 + j,
          k: k,
          explanation: `Copying remaining elements from right array: ${rightArr[j].value}`,
        });
        j++;
        k++;
      }

      totalMerges++;
      addState({
        line: 21,
        left: left,
        right: right,
        mid: mid,
        leftArray: leftArr,
        rightArray: rightArr,
        i: left + i,
        j: mid + 1 + j,
        k: k,
        explanation: `Merge complete. Sorted subarray from index ${left} to ${right}`,
      });
    };

    const mergeSort = (arr, left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        addState({
          line: 4,
          left: left,
          right: right,
          mid: mid,
          explanation: `Dividing array from index ${left} to ${right}. Mid point: ${mid}`,
        });

        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
      } else {
        addState({
          line: 6,
          left: left,
          right: right,
          explanation: `Base case: single element at index ${left} (value: ${arr[left].value})`,
        });
      }
    };

    mergeSort(arr, 0, n - 1);

    // Mark all elements as sorted
    const finalSorted = Array.from({ length: n }, (_, k) => k);

    addState({
      line: 23,
      sortedIndices: finalSorted,
      finished: true,
      explanation:
        "Algorithm finished. The array is fully sorted using divide and conquer approach.",
    });

    setHistory(newHistory);
    setCurrentStep(0);
  }, []);

  const loadArray = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (localArray.some(isNaN) || localArray.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }

    // Convert to array of objects with stable IDs
    const initialObjects = localArray.map((value, id) => ({ value, id }));

    setIsLoaded(true);
    generateMergeSortHistory(initialObjects);
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
  const { array = [] } = state;

  const colorMapping = {
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    orange: "text-orange-400",
    "light-gray": "text-gray-400",
    "": "text-gray-200",
  };

  const CodeLine = ({ line, content }) => (
    <div
      className={`block rounded-md transition-colors ${
        state.line === line ? "bg-blue-500/20" : ""
      }`}
    >
      <span className="text-gray-600 w-8 inline-block text-right pr-4 select-none">
        {line}
      </span>
      {content.map((token, index) => (
        <span key={index} className={colorMapping[token.c]}>
          {token.t}
        </span>
      ))}
    </div>
  );

  const mergeSortCode = [
    { l: 2, c: [{ t: "function mergeSort(arr, left, right) {", c: "" }] },
    {
      l: 3,
      c: [
        { t: "  if", c: "purple" },
        { t: " (left < right) {", c: "" },
      ],
    },
    { l: 4, c: [{ t: "    mid = (left + right) / 2;", c: "" }] },
    { l: 5, c: [{ t: "    mergeSort(arr, left, mid);", c: "" }] },
    { l: 6, c: [{ t: "    mergeSort(arr, mid+1, right);", c: "" }] },
    { l: 7, c: [{ t: "    merge(arr, left, mid, right);", c: "" }] },
    { l: 8, c: [{ t: "  }", c: "light-gray" }] },
    { l: 9, c: [{ t: "}", c: "light-gray" }] },
    { l: 10, c: [{ t: "", c: "" }] },
    { l: 11, c: [{ t: "function merge(arr, left, mid, right) {", c: "" }] },
    {
      l: 12,
      c: [
        { t: "  while", c: "purple" },
        { t: " (i < leftArr.length && j < rightArr.length) {", c: "" },
      ],
    },
    {
      l: 13,
      c: [
        { t: "    if", c: "purple" },
        { t: " (leftArr[i] <= rightArr[j]) {", c: "" },
      ],
    },
    { l: 14, c: [{ t: "      arr[k] = leftArr[i]; i++;", c: "" }] },
    { l: 15, c: [{ t: "    } else {", c: "light-gray" }] },
    { l: 16, c: [{ t: "      arr[k] = rightArr[j]; j++;", c: "" }] },
    { l: 17, c: [{ t: "    }", c: "light-gray" }] },
    { l: 18, c: [{ t: "    k++;", c: "" }] },
    { l: 19, c: [{ t: "  }", c: "light-gray" }] },
    { l: 20, c: [{ t: "  // Copy remaining elements", c: "light-gray" }] },
    { l: 21, c: [{ t: "}", c: "light-gray" }] },
  ];

  const mergeSortCodeJava = [
    { l: 1, c: [{ t: "public static void mergeSort(int arr[]) {", c: "" }] },
    { l: 2, c: [{ t: "    mergeSortHelper(arr, 0, arr.length - 1);", c: "" }] },
    { l: 3, c: [{ t: "}", c: "light-gray" }] },
    { l: 4, c: [{ t: "", c: "" }] },
    {
      l: 5,
      c: [
        {
          t: "private static void mergeSortHelper(int arr[], int si, int ei) {",
          c: "",
        },
      ],
    },
    {
      l: 6,
      c: [
        { t: "    if", c: "purple" },
        { t: " (si >= ei) return;", c: "" },
      ],
    },
    { l: 7, c: [{ t: "    int mid = si + (ei - si) / 2;", c: "" }] },
    { l: 8, c: [{ t: "    mergeSortHelper(arr, si, mid);", c: "" }] },
    { l: 9, c: [{ t: "    mergeSortHelper(arr, mid + 1, ei);", c: "" }] },
    { l: 10, c: [{ t: "    merge(arr, si, mid, ei);", c: "" }] },
    { l: 11, c: [{ t: "}", c: "light-gray" }] },
    { l: 12, c: [{ t: "", c: "" }] },
    {
      l: 13,
      c: [
        {
          t: "private static void merge(int arr[], int si, int mid, int ei) {",
          c: "",
        },
      ],
    },
    { l: 14, c: [{ t: "    int temp[] = new int[ei - si + 1];", c: "" }] },
    { l: 15, c: [{ t: "    int i = si, j = mid + 1, k = 0;", c: "" }] },
    {
      l: 16,
      c: [
        { t: "    while", c: "purple" },
        { t: " (i <= mid && j <= ei) {", c: "" },
      ],
    },
    {
      l: 17,
      c: [
        { t: "        if", c: "purple" },
        { t: " (arr[i] < arr[j]) temp[k++] = arr[i++];", c: "" },
      ],
    },
    { l: 18, c: [{ t: "        else temp[k++] = arr[j++];", c: "" }] },
    { l: 19, c: [{ t: "    }", c: "light-gray" }] },
    {
      l: 20,
      c: [
        { t: "    while", c: "purple" },
        { t: " (i <= mid) temp[k++] = arr[i++];", c: "" },
      ],
    },
    {
      l: 21,
      c: [
        { t: "    while", c: "purple" },
        { t: " (j <= ei) temp[k++] = arr[j++];", c: "" },
      ],
    },
    {
      l: 22,
      c: [
        {
          t: "    for (k = 0, i = si; k < temp.length; k++, i++) arr[i] = temp[k];",
          c: "",
        },
      ],
    },
    { l: 23, c: [{ t: "}", c: "light-gray" }] },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-400 flex items-center justify-center gap-3">
          <GitMerge /> Merge Sort Visualizer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Visualizing the divide and conquer sorting algorithm
        </p>
      </header>

      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-grow w-full">
          <label
            htmlFor="array-input"
            className="font-medium text-gray-300 font-mono"
          >
            Array:
          </label>
          <input
            id="array-input"
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isLoaded}
            className="font-mono flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <button
              onClick={loadArray}
              className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded-lg"
            >
              Load & Visualize
            </button>
          ) : (
            <>
              <button
                onClick={stepBackward}
                disabled={currentStep <= 0}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-mono w-24 text-center">
                {currentStep >= 0 ? currentStep + 1 : 0}/{history.length}
              </span>
              <button
                onClick={stepForward}
                disabled={currentStep >= history.length - 1}
                className="bg-gray-700 p-2 rounded-md disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={reset}
            className="ml-4 bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-800/50 p-5 rounded-xl shadow-2xl border border-gray-700/50">
            <h3 className="font-bold text-xl text-blue-400 mb-4 pb-3 border-b border-gray-600/50 flex items-center gap-2 justify-between">
              <span className="flex items-center gap-2">
                <Code size={20} /> Pseudocode
              </span>

              {/* 👇 Toggle buttons for C++ and Java */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCodeLanguage("cpp")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    codeLanguage === "cpp"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  C++
                </button>

                <button
                  onClick={() => setCodeLanguage("java")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    codeLanguage === "java"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Java
                </button>
              </div>
            </h3>

            <pre className="text-sm overflow-auto">
              <code className="font-mono leading-relaxed">
                {(codeLanguage === "cpp"
                  ? mergeSortCode
                  : mergeSortCodeJava
                ).map((line) => (
                  <CodeLine key={line.l} line={line.l} content={line.c} />
                ))}
              </code>
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-2xl">
              <h3 className="font-bold text-lg text-gray-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Array Visualization
              </h3>
              <div className="flex justify-center items-center min-h-[150px] py-4">
                <div
                  id="array-container"
                  className="relative transition-all"
                  style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}
                >
                  {array.map((item, index) => {
                    const isInLeftRange =
                      state.left !== null &&
                      state.right !== null &&
                      index >= state.left &&
                      index <= state.mid;
                    const isInRightRange =
                      state.left !== null &&
                      state.right !== null &&
                      index > state.mid &&
                      index <= state.right;
                    const isComparing = state.k === index;
                    const isSorted = state.sortedIndices?.includes(index);

                    let boxStyles = "bg-gray-700 border-gray-600";
                    if (state.finished || isSorted) {
                      boxStyles = "bg-green-700 border-green-500 text-white";
                    } else if (isComparing) {
                      boxStyles = "bg-amber-600 border-amber-400 text-white";
                    } else if (isInLeftRange) {
                      boxStyles = "bg-blue-600 border-blue-400 text-white";
                    } else if (isInRightRange) {
                      boxStyles = "bg-purple-600 border-purple-400 text-white";
                    }

                    return (
                      <div
                        key={item.id} // Use stable ID for key
                        id={`array-container-element-${index}`}
                        className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
                        style={{
                          left: `${
                            index * 4.5
                          }rem` /* 4rem width + 0.5rem gap */,
                        }}
                      >
                        {item.value}
                      </div>
                    );
                  })}
                  {isLoaded && state.left !== null && state.right !== null && (
                    <>
                      <VisualizerPointer
                        index={state.left}
                        containerId="array-container"
                        color="blue"
                        label="L"
                      />
                      <VisualizerPointer
                        index={state.right}
                        containerId="array-container"
                        color="purple"
                        label="R"
                      />
                      {state.mid !== null && (
                        <VisualizerPointer
                          index={state.mid}
                          containerId="array-container"
                          color="cyan"
                          label="M"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
                <h3 className="text-cyan-300 text-sm flex items-center gap-2">
                  <GitCompareArrows size={16} /> Total Comparisons
                </h3>
                <p className="font-mono text-4xl text-cyan-400 mt-2">
                  {state.totalComparisons ?? 0}
                </p>
              </div>
              <div className="bg-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <h3 className="text-purple-300 text-sm flex items-center gap-2">
                  <GitMerge size={16} /> Total Merges
                </h3>
                <p className="font-mono text-4xl text-purple-400 mt-2">
                  {state.totalMerges ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 min-h-[5rem]">
              <h3 className="text-gray-400 text-sm mb-1">Explanation</h3>
              <p className="text-gray-300">{state.explanation}</p>
              {state.finished && (
                <CheckCircle className="inline-block ml-2 text-green-400" />
              )}
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
                  <strong className="text-teal-300 font-mono">
                    Worst Case: O(N log N)
                  </strong>
                  <br />
                  Always divides the array in half and merges in O(N) time. The
                  recursion depth is log N, and each level takes O(N) time for
                  merging.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Average Case: O(N log N)
                  </strong>
                  <br />
                  Merge sort consistently divides the array in half regardless
                  of input distribution, making it stable across all cases.
                </p>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">
                    Best Case: O(N log N)
                  </strong>
                  <br />
                  Even for already sorted arrays, merge sort still performs the
                  full divide and conquer process, maintaining O(N log N)
                  complexity.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-300">
                  Space Complexity
                </h4>
                <p className="text-gray-400">
                  <strong className="text-teal-300 font-mono">O(N)</strong>
                  <br />
                  Merge sort requires additional space for temporary arrays
                  during the merge process. The maximum space used is
                  proportional to the input size N. (Note: Our visualizer's
                  history adds O(N log N) space for demonstration, but the
                  algorithm itself is O(N)).
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Load an array to begin visualization.
        </p>
      )}
    </div>
  );
};

export default MergeSortVisualizer;
