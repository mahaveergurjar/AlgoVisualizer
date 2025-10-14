import React, { useState, useEffect, useCallback } from "react";
import { List } from "lucide-react";
import SortingVisualizerLayout from "./SortingVisualizerLayout";
import VisualizerPointer from "../../components/VisualizerPointer";

// Helper function to generate a random array
const generateRandomArray = (size) => {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 100) + 1);
  }
  return arr.join(",");
};

const BubbleSortVisualizer = () => {
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [arrayInput, setArrayInput] = useState("8,5,2,9,5,6,3");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("js");
  const [arraySize, setArraySize] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const generateBubbleSortHistory = useCallback((initialArray) => {
    const arr = JSON.parse(JSON.stringify(initialArray));
    const n = arr.length;
    const newHistory = [];
    let totalSwaps = 0;
    let totalComparisons = 0;
    let sortedIndices = [];

    const addState = (props) =>
      newHistory.push({
        array: JSON.parse(JSON.stringify(arr)),
        i: null,
        j: null,
        sortedIndices: [...sortedIndices],
        explanation: "",
        totalSwaps,
        totalComparisons,
        ...props,
      });

    addState({ line: 2, explanation: "Initialize Bubble Sort algorithm." });

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      addState({
        line: 3,
        i,
        explanation: `Start Pass ${
          i + 1
        }. The largest unsorted element will bubble to the end.`,
      });

      for (let j = 0; j < n - i - 1; j++) {
        totalComparisons++;
        addState({
          line: 4,
          i,
          j,
          explanation: `Comparing adjacent elements at index ${j} (${
            arr[j].value
          }) and ${j + 1} (${arr[j + 1].value}).`,
        });

        if (arr[j].value > arr[j + 1].value) {
          swappedInPass = true;
          totalSwaps++;
          addState({
            line: 5,
            i,
            j,
            explanation: `${arr[j].value} > ${
              arr[j + 1].value
            }, so they need to be swapped.`,
          });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          addState({
            line: 6,
            i,
            j,
            explanation: `Elements swapped.`,
          });
        }
      }

      sortedIndices.push(n - 1 - i);
      addState({
        line: 8,
        i,
        explanation: `End of Pass ${i + 1}. Element ${
          arr[n - 1 - i].value
        } is now in its correct sorted position.`,
      });

      if (!swappedInPass) {
        addState({
          line: 9,
          i,
          explanation:
            "No swaps occurred in this pass. The array is already sorted. Breaking early.",
        });
        const remainingUnsorted = Array.from(
          { length: n - sortedIndices.length },
          (_, k) => k
        );
        sortedIndices.push(...remainingUnsorted);
        break;
      }
    }

    const finalSorted = Array.from({ length: n }, (_, k) => k);
    addState({
      line: 13,
      sortedIndices: finalSorted,
      finished: true,
      explanation: "Algorithm finished. The array is fully sorted.",
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

    const initialObjects = localArray.map((value, id) => ({ value, id }));
    setIsLoaded(true);
    generateBubbleSortHistory(initialObjects);
  };

  const reset = () => {
    setIsLoaded(false);
    setHistory([]);
    setCurrentStep(-1);
    setArrayInput("");
    setIsPlaying(false);
  };

  const stepForward = useCallback(
    () => setCurrentStep((prev) => Math.min(prev + 1, history.length - 1)),
    [history.length]
  );
  const stepBackward = useCallback(
    () => setCurrentStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  const togglePlayPause = () => {
    if (currentStep >= history.length - 1) {
      // If at the end, reset and play
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleGenerateRandom = () => {
    setArrayInput(generateRandomArray(arraySize));
  };

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < history.length - 1) {
      interval = setInterval(() => {
        stepForward();
      }, 2100 - speed);
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, history.length, stepForward, speed]);

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

  const bubbleSortCodeJS = [
    { l: 2, c: [{ t: "function bubbleSort(arr) {", c: "" }] },
    {
      l: 3,
      c: [
        { t: "  for", c: "purple" },
        { t: " (let i = 0; i < n - 1; i++) {", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "    for", c: "purple" },
        { t: " (let j = 0; j < n - i - 1; j++) {", c: "" },
      ],
    },
    {
      l: 5,
      c: [
        { t: "      if", c: "purple" },
        { t: " (arr[j] > arr[j + 1]) {", c: "" },
      ],
    },
    { l: 6, c: [{ t: "        swap(arr[j], arr[j + 1]);", c: "" }] },
    { l: 7, c: [{ t: "      }", c: "light-gray" }] },
    { l: 8, c: [{ t: "    }", c: "light-gray" }] },
    {
      l: 9,
      c: [
        { t: "    if", c: "purple" },
        { t: " (!swappedInPass) ", c: "" },
        { t: "break", c: "purple" },
        { t: ";", c: "light-gray" },
      ],
    },
    { l: 12, c: [{ t: "  }", c: "light-gray" }] },
    {
      l: 13,
      c: [
        { t: "  return", c: "purple" },
        { t: " arr;", c: "" },
      ],
    },
  ];

  const bubbleSortCodeJava = [
    {
      l: 1,
      c: [{ t: "public static void sorting(int arr[]) {", c: "" }],
    },
    {
      l: 2,
      c: [
        { t: "    for ", c: "purple" },
        { t: "(int i = 0; i < arr.length - 1; i++) {", c: "" },
      ],
    },
    {
      l: 3,
      c: [
        { t: "        for ", c: "purple" },
        { t: "(int j = 0; j < arr.length - 1 - i; j++) {", c: "" },
      ],
    },
    {
      l: 4,
      c: [
        { t: "            if", c: "purple" },
        { t: " (arr[j] > arr[j + 1]) {", c: "" },
      ],
    },
    { l: 5, c: [{ t: "                int temp = arr[j + 1];", c: "" }] },
    { l: 6, c: [{ t: "                arr[j + 1] = arr[j];", c: "" }] },
    { l: 7, c: [{ t: "                arr[j] = temp;", c: "" }] },
    { l: 8, c: [{ t: "            }", c: "" }] },
    { l: 9, c: [{ t: "        }", c: "" }] },
    { l: 10, c: [{ t: "    }", c: "" }] },
    { l: 11, c: [{ t: "}", c: "" }] },
  ];

  const pseudocode = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xl text-blue-400 flex items-center gap-2">
          Pseudocode
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedLanguage("js")}
            className={`py-1 px-3 rounded-md font-mono text-sm ${
              selectedLanguage === "js"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            JS
          </button>
          <button
            onClick={() => setSelectedLanguage("java")}
            className={`py-1 px-3 rounded-md font-mono text-sm ${
              selectedLanguage === "java"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            Java
          </button>
        </div>
      </div>
      <pre className="text-sm overflow-auto">
        <code className="font-mono leading-relaxed">
          {(selectedLanguage === "js"
            ? bubbleSortCodeJS
            : bubbleSortCodeJava
          ).map((line) => (
            <CodeLine key={line.l} line={line.l} content={line.c} />
          ))}
        </code>
      </pre>
    </>
  );

  const visualization = (
    <div className="flex justify-center items-center min-h-[150px] py-4">
      <div
        id="array-container"
        className="relative transition-all"
        style={{ width: `${array.length * 4.5}rem`, height: "4rem" }}
      >
        {array.map((item, index) => {
          const isComparing =
            state.j === index || state.j + 1 === index;
          const isSorted = state.sortedIndices?.includes(index);
          let boxStyles = "bg-gray-700 border-gray-600";
          if (state.finished || isSorted)
            boxStyles = "bg-green-700 border-green-500 text-white";
          else if (isComparing)
            boxStyles = "bg-amber-600 border-amber-400 text-white";

          return (
            <div
              key={item.id}
              className={`absolute w-16 h-16 flex items-center justify-center rounded-lg shadow-md border-2 font-bold text-2xl transition-all duration-500 ease-in-out ${boxStyles}`}
              style={{ left: `${index * 4.5}rem` }}
            >
              {item.value}
            </div>
          );
        })}
        {isLoaded && (
          <>
            <VisualizerPointer
              index={state.j}
              containerId="array-container"
              color="amber"
              label="j"
            />
            <VisualizerPointer
              index={state.j !== null ? state.j + 1 : null}
              containerId="array-container"
              color="amber"
              label="j+1"
            />
          </>
        )}
      </div>
    </div>
  );

  const complexityAnalysis = (
    <div className="grid md:grid-cols-2 gap-6 text-sm">
      <div className="space-y-4">
        <h4 className="font-semibold text-blue-300">Time Complexity</h4>
        <p className="text-gray-400">
          <strong className="text-teal-300 font-mono">
            Worst Case: O(N²)
          </strong>
          <br />
          Occurs when the array is in reverse order. We must make N-1 passes,
          and each pass compares and swaps through the unsorted portion of the
          array.
        </p>
        <p className="text-gray-400">
          <strong className="text-teal-300 font-mono">
            Average Case: O(N²)
          </strong>
          <br />
          For a random array, the number of comparisons and swaps is also
          proportional to N².
        </p>
        <p className="text-gray-400">
          <strong className="text-teal-300 font-mono">
            Best Case: O(N)
          </strong>
          <br />
          Occurs when the array is already sorted. The algorithm makes a single
          pass through the array to check if any swaps are needed. Finding
          none, it terminates early.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-blue-300">Space Complexity</h4>
        <p className="text-gray-400">
          <strong className="text-teal-300 font-mono">O(1)</strong>
          <br />
          Bubble sort is an in-place sorting algorithm. It only requires a
          constant amount of extra memory for variables like loop counters,
          regardless of the input size. (Note: Our visualizer's history adds
          O(N²) space for demonstration, but the algorithm itself is O(1)).
        </p>
      </div>
    </div>
  );

  return (
    <SortingVisualizerLayout
      title="Bubble Sort"
      description="Visualizing the classic comparison sorting algorithm"
      Icon={List}
      arrayInput={arrayInput}
      setArrayInput={setArrayInput}
      isLoaded={isLoaded}
      loadArray={loadArray}
      reset={reset}
      stepBackward={stepBackward}
      stepForward={stepForward}
      currentStep={currentStep}
      history={history}
      arraySize={arraySize}
      setArraySize={setArraySize}
      generateRandomArray={handleGenerateRandom}
      isPlaying={isPlaying}
      togglePlayPause={togglePlayPause}
      speed={speed}
      setSpeed={setSpeed}
      pseudocode={pseudocode}
      visualization={visualization}
      complexityAnalysis={complexityAnalysis}
    />
  );
};

export default BubbleSortVisualizer;