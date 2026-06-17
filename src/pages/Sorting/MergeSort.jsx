import React, { useState, useCallback } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import VisualizerLayout from "../../components/VisualizerLayout";
import { useVisualizer } from "../../hooks/useVisualizer";

const MergeSortVisualizer = ({ navigate }) => {
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const visualizer = useVisualizer();
  const { isLoaded, load, currentState } = visualizer;

  const generateHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalComparisons = 0;
    let totalMerges = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
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
        line: 18,
        ...props,
      });

    addState({ line: 18, explanation: "Initialize Merge Sort algorithm." });

    const merge = (arr, left, mid, right) => {
      const leftArr = [];
      const rightArr = [];

      for (let i = left; i <= mid; i++) {
        leftArr.push(arr[i]);
      }
      for (let j = mid + 1; j <= right; j++) {
        rightArr.push(arr[j]);
      }

      addState({
        line: 4,
        left: left,
        right: right,
        mid: mid,
        leftArray: leftArr,
        rightArray: rightArr,
        i: left,
        j: mid + 1,
        k: left,
        explanation: `Splitting and preparing to merge left array [${leftArr.map((x) => x.value).join(", ")}] and right array [${rightArr.map((x) => x.value).join(", ")}]`,
      });

      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        totalComparisons++;
        addState({
          line: 7,
          left: left,
          right: right,
          mid: mid,
          leftArray: leftArr,
          rightArray: rightArr,
          i: left + i,
          j: mid + 1 + j,
          k: k,
          explanation: `Comparing left element (${leftArr[i].value}) and right element (${rightArr[j].value}).`,
        });

        if (leftArr[i].value <= rightArr[j].value) {
          arr[k] = leftArr[i];
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
            explanation: `${leftArr[i].value} <= ${rightArr[j].value}, copy from left array to merged array.`,
          });
          i++;
        } else {
          arr[k] = rightArr[j];
          addState({
            line: 11,
            left: left,
            right: right,
            mid: mid,
            leftArray: leftArr,
            rightArray: rightArr,
            i: left + i,
            j: mid + 1 + j,
            k: k,
            explanation: `${leftArr[i].value} > ${rightArr[j].value}, copy from right array to merged array.`,
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
          explanation: `Copying remaining element ${leftArr[i].value} from left array.`,
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        addState({
          line: 16,
          left: left,
          right: right,
          mid: mid,
          leftArray: leftArr,
          rightArray: rightArr,
          i: left + i,
          j: mid + 1 + j,
          k: k,
          explanation: `Copying remaining element ${rightArr[j].value} from right array.`,
        });
        j++;
        k++;
      }

      totalMerges++;
      addState({
        line: 17,
        left: left,
        right: right,
        mid: mid,
        leftArray: leftArr,
        rightArray: rightArr,
        i: left + i,
        j: mid + 1 + j,
        k: k,
        explanation: `Subarray from index ${left} to ${right} merged successfully.`,
      });
    };

    const mergeSort = (arr, left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        addState({
          line: 20,
          left: left,
          right: right,
          mid: mid,
          explanation: `Divide array at index ${mid} into two halves.`,
        });

        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
      } else {
        addState({
          line: 19,
          left: left,
          right: right,
          explanation: `Base case reached for single element at index ${left} (${arr[left].value}).`,
        });
      }
    };

    mergeSort(arr, 0, n - 1);

    const finalSorted = Array.from({ length: n }, (_, k) => k);

    addState({
      line: 25,
      sortedIndices: finalSorted,
      finished: true,
      explanation: "Merge Sort completed. Array is fully sorted.",
    });

    load(newHistory);
  }, [load]);

  const loadProblem = () => {
    const localArray = arrayInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (localArray.some(isNaN) || localArray.length === 0) {
      alert("Invalid input. Please use comma-separated numbers.");
      return;
    }

    const initialObjects = localArray.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const generateRandomArray = () => {
    const length = Math.floor(Math.random() * 4) + 6;
    const array = Array.from({ length }, () => Math.floor(Math.random() * 15) + 1);
    setArrayInput(array.join(","));
    const initialObjects = array.map((value, id) => ({ value, id }));
    generateHistory(initialObjects);
  };

  const {
    array = [],
    left = null,
    right = null,
    mid = null,
    k = null,
    sortedIndices = [],
    explanation = "",
    totalComparisons = 0,
    totalMerges = 0,
    line = 18
  } = currentState;

  const codeContent = {
    1: "void merge(vector<int>& arr, int l, int m, int r) {",
    2: "    int n1 = m - l + 1, n2 = r - m;",
    3: "    vector<int> L(n1), R(n2);",
    4: "    for (int i = 0; i < n1; i++) L[i] = arr[l + i];",
    5: "    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];",
    6: "    int i = 0, j = 0, k = l;",
    7: "    while (i < n1 && j < n2) {",
    8: "        if (L[i] <= R[j]) {",
    9: "            arr[k] = L[i]; i++;",
    10: "        } else {",
    11: "            arr[k] = R[j]; j++;",
    12: "        }",
    13: "        k++;",
    14: "    }",
    15: "    while (i < n1) { arr[k] = L[i]; i++; k++; }",
    16: "    while (j < n2) { arr[k] = R[j]; j++; k++; }",
    17: "}",
    18: "void mergeSort(vector<int>& arr, int l, int r) {",
    19: "    if (l < r) {",
    20: "        int m = l + (r - l) / 2;",
    21: "        mergeSort(arr, l, m);",
    22: "        mergeSort(arr, m + 1, r);",
    23: "        merge(arr, l, m, r);",
    24: "    }",
    25: "}"
  };

  const inputSection = (
    <>
      <input
        id="array-input"
        type="text"
        value={arrayInput}
        onChange={(e) => setArrayInput(e.target.value)}
        disabled={isLoaded}
        className="flex-grow bg-gray-950 border border-gray-700 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 font-mono shadow-sm"
        placeholder="e.g., 8,5,2,9,5,6,3"
      />
      {!isLoaded && (
        <button
          onClick={loadProblem}
          className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 transition text-white font-bold shadow-lg cursor-pointer"
        >
          Load & Visualize
        </button>
      )}
      <button
        onClick={generateRandomArray}
        className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/40 rounded-xl font-bold transition-all text-white shadow-lg cursor-pointer"
      >
        Random
      </button>
    </>
  );

  const statsSection = (
    <>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-blue-300 select-none">
          Comparisons
        </h4>
        <div className="text-3xl font-mono text-blue-305 font-bold">
          {totalComparisons}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-purple-300 select-none">
          Merges
        </h4>
        <div className="text-3xl font-mono text-purple-305 font-bold">
          {totalMerges}
        </div>
      </div>
      <div className="p-4 text-center bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl font-semibold">
        <h4 className="font-semibold flex items-center justify-center gap-2 mb-2 text-cyan-300 select-none">
          Complexity
        </h4>
        <div className="text-sm font-mono text-gray-300 space-y-1">
          <div>Time: O(n log n)</div>
          <div>Space: O(n)</div>
        </div>
      </div>
      <div className="sm:col-span-3 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl">
        <h4 className="text-blue-300 font-semibold flex items-center gap-2 mb-2 select-none">
          <Clock size={16} /> Complexity Details
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            <strong>Worst/Average/Best Case Time:</strong>{" "}
            <span className="font-mono text-teal-300">O(n log n)</span> - consistently splits and merges.
          </div>
          <div>
            <strong>Space Complexity:</strong>{" "}
            <span className="font-mono text-teal-305">O(n)</span> - temporary vectors are created during merge.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <VisualizerLayout
      title="Merge Sort"
      description="Visualizes the divide-and-conquer Merge Sort algorithm by recursively splitting the array, sorting subarrays, and merging them back together."
      isLoaded={isLoaded}
      inputSection={inputSection}
      codeContent={codeContent}
      activeLine={line}
      message={explanation}
      visualizerState={visualizer}
      statsSection={statsSection}
      placeholderText="Enter array, then click Load & Visualize to begin."
    >
      <div className="w-full space-y-6">
        {navigate && (
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Sorting Algorithms
          </button>
        )}
        <div className="flex justify-center items-end gap-3 min-h-[220px]">
          {array.map((item, index) => {
            const isInLeftRange = left !== null && right !== null && index >= left && index <= mid;
            const isInRightRange = left !== null && right !== null && index > mid && index <= right;
            const isComparing = k === index;
            const isSorted = sortedIndices.includes(index);

            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                    isSorted
                      ? "bg-green-500/30 border-green-400 text-white"
                      : isComparing
                      ? "bg-amber-500/30 border-amber-400 text-white scale-110"
                      : isInLeftRange
                      ? "bg-blue-500/30 border-blue-400 text-white"
                      : isInRightRange
                      ? "bg-purple-500/30 border-purple-400 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-350"
                  }`}
                  style={{ height: `${item.value * 12 + 60}px` }}
                >
                  {item.value}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  {left === index ? "L" : right === index ? "R" : mid === index ? "M" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VisualizerLayout>
  );
};

export default MergeSortVisualizer;
