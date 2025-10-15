import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Code,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

function App() {
  const [array, setArray] = useState([1, 0, -1, 0, -2, 2]);
  const [sortedArray, setSortedArray] = useState([]);
  const [target, setTarget] = useState(0);
  const [i, setI] = useState(-1);
  const [j, setJ] = useState(-1);
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentSum, setCurrentSum] = useState(null);
  const [foundQuadruplets, setFoundQuadruplets] = useState([]);
  const [, setCurrentStep] = useState("");
  const [phase, setPhase] = useState("sorting");
  const [stepNumber, setStepNumber] = useState(1);
  const [totalSteps] = useState(92);
  const [explanation, setExplanation] = useState(
    "Initialize sorted array and start 4Sum algorithm"
  );
  const [activeLineCode, setActiveLineCode] = useState(1);

  const resetAnimation = () => {
    const sorted = [...array].sort((a, b) => a - b);
    setSortedArray(sorted);
    setI(-1);
    setJ(-1);
    setLeft(-1);
    setRight(-1);
    setIsPlaying(false);
    setCurrentSum(null);
    setFoundQuadruplets([]);
    setCurrentStep("Ready to start");
    setPhase("sorting");
    setStepNumber(1);
    setExplanation("Initialize sorted array and start 4Sum algorithm");
    setActiveLineCode(1);
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
    setPhase("sorting");
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "sorting") {
        const sorted = [...array].sort((a, b) => a - b);
        setSortedArray(sorted);
        setCurrentStep("Array sorted, starting 4Sum algorithm");
        setExplanation(
          "Array sorted. Now we'll use nested loops with two pointers."
        );
        setPhase("finding");
        setI(0);
        setJ(1);
        setLeft(2);
        setRight(sorted.length - 1);
        setActiveLineCode(2);
        return;
      }

      if (phase === "finding") {
        const arr = sortedArray;

        if (i >= arr.length - 3) {
          setIsPlaying(false);
          setCurrentStep(
            `Complete! Found ${foundQuadruplets.length} unique quadruplet(s)`
          );
          setExplanation(
            `Algorithm completed. Total quadruplets found: ${foundQuadruplets.length}`
          );
          setI(-1);
          setJ(-1);
          setLeft(-1);
          setRight(-1);
          setActiveLineCode(16);
          return;
        }

        if (i > 0 && arr[i] === arr[i - 1]) {
          setCurrentStep(`Skipping duplicate value at index i=${i}`);
          setExplanation(`Skipping duplicate to avoid repeated quadruplets`);
          setI(i + 1);
          setJ(i + 2);
          setLeft(i + 3);
          setRight(arr.length - 1);
          setActiveLineCode(5);
          setStepNumber(stepNumber + 1);
          return;
        }

        if (j >= arr.length - 2) {
          setCurrentStep(`Moving to next i position`);
          setExplanation(
            `Completed all j iterations for current i, moving i forward`
          );
          setI(i + 1);
          setJ(i + 2);
          setLeft(i + 3);
          setRight(arr.length - 1);
          setActiveLineCode(4);
          setStepNumber(stepNumber + 1);
          return;
        }

        if (j > i + 1 && arr[j] === arr[j - 1]) {
          setCurrentStep(`Skipping duplicate value at index j=${j}`);
          setExplanation(`Skipping duplicate j value`);
          setJ(j + 1);
          setLeft(j + 2);
          setRight(arr.length - 1);
          setActiveLineCode(7);
          setStepNumber(stepNumber + 1);
          return;
        }

        if (left >= right) {
          setCurrentStep(`Moving to next j position`);
          setExplanation(`Two pointers met, moving to next j`);
          setJ(j + 1);
          setLeft(j + 2);
          setRight(arr.length - 1);
          setActiveLineCode(6);
          setStepNumber(stepNumber + 1);
          return;
        }

        const sum = arr[i] + arr[j] + arr[left] + arr[right];
        setCurrentSum(sum);

        if (sum === target) {
          const newQuadruplet = {
            indices: [i, j, left, right],
            values: [arr[i], arr[j], arr[left], arr[right]],
          };

          const isDuplicate = foundQuadruplets.some(
            (q) =>
              q.values[0] === newQuadruplet.values[0] &&
              q.values[1] === newQuadruplet.values[1] &&
              q.values[2] === newQuadruplet.values[2] &&
              q.values[3] === newQuadruplet.values[3]
          );

          if (!isDuplicate) {
            setFoundQuadruplets([...foundQuadruplets, newQuadruplet]);
            setCurrentStep(
              `Found quadruplet: [${arr[i]}, ${arr[j]}, ${arr[left]}, ${arr[right]}]`
            );
            setExplanation(`Sum equals target! Found valid quadruplet.`);
          }

          let newLeft = left + 1;
          let newRight = right - 1;

          while (newLeft < newRight && arr[newLeft] === arr[newLeft - 1])
            newLeft++;
          while (newLeft < newRight && arr[newRight] === arr[newRight + 1])
            newRight--;

          setLeft(newLeft);
          setRight(newRight);
          setActiveLineCode(11);
        } else if (sum < target) {
          setCurrentStep(`Sum ${sum} < ${target}, move left pointer right`);
          setExplanation(
            `Current sum is too small, increase it by moving left pointer`
          );
          setLeft(left + 1);
          setActiveLineCode(13);
        } else {
          setCurrentStep(`Sum ${sum} > ${target}, move right pointer left`);
          setExplanation(
            `Current sum is too large, decrease it by moving right pointer`
          );
          setRight(right - 1);
          setActiveLineCode(15);
        }
        setStepNumber(stepNumber + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    i,
    j,
    left,
    right,
    sortedArray,
    array,
    speed,
    foundQuadruplets,
    target,
    stepNumber,
  ]);

  const displayArray = phase === "sorting" ? array : sortedArray;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0d1117]">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Problems
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div className="text-center py-8 bg-gradient-to-b from-[#0d1117] to-[#0a0e1a]">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-pink-600 mb-2">
          4Sum Visualizer
        </h1>
        <p className="text-gray-400">
          Find all unique quadruplets that sum to target
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 pb-8">
        {/* Control Panel */}
        <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={array.join(", ")}
                onChange={(e) => {
                  const values = e.target.value
                    .split(",")
                    .map((v) => parseInt(v.trim()))
                    .filter((v) => !isNaN(v));
                  if (values.length > 0) {
                    setArray(values);
                    resetAnimation();
                  }
                }}
                className="bg-[#161b22] border border-gray-700 rounded px-4 py-2 text-white font-mono text-sm w-48"
                placeholder="Array"
              />
              <input
                type="number"
                value={target}
                onChange={(e) => {
                  setTarget(Number(e.target.value));
                  resetAnimation();
                }}
                className="bg-[#161b22] border border-gray-700 rounded px-4 py-2 text-white font-mono text-sm w-20"
                placeholder="Target"
              />

              <select className="bg-[#c1185b] hover:bg-[#d81b60] text-white px-3 py-2 rounded text-sm font-medium cursor-pointer border-none">
                <option>C++</option>
                <option>Python</option>
                <option>Java</option>
              </select>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStepNumber(Math.max(1, stepNumber - 1))}
                className="p-2 bg-[#161b22] hover:bg-[#1f2937] border border-gray-700 rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={isPlaying ? () => setIsPlaying(false) : startAnimation}
                className="p-2 bg-[#161b22] hover:bg-[#1f2937] border border-gray-700 rounded transition-colors"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setStepNumber(Math.min(totalSteps, stepNumber + 1))
                }
                className="p-2 bg-[#161b22] hover:bg-[#1f2937] border border-gray-700 rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="bg-[#161b22] border border-gray-700 rounded px-3 py-2 font-mono text-sm">
                {stepNumber}/{totalSteps}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Speed</span>
                <input
                  type="range"
                  min="250"
                  max="2000"
                  value={2250 - speed}
                  onChange={(e) => setSpeed(2250 - Number(e.target.value))}
                  className="w-32 accent-blue-500"
                />
              </div>
            </div>

            {/* Right Controls */}
            <button
              onClick={resetAnimation}
              className="px-6 py-2 bg-[#dc2626] hover:bg-[#ef4444] rounded font-medium transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <Info className="h-4 w-4" />
            <span>
              Approach: Sorting + Two nested loops with two-pointer technique
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Code Section */}
          <div className="lg:col-span-5 bg-[#0d1117] rounded-lg border border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <Code className="h-4 w-4 text-green-400" />
              <span className="font-medium">Code</span>
              <span className="ml-auto text-xs text-gray-500">
                Language: C++
              </span>
            </div>
            <div className="p-4 font-mono text-xs overflow-auto max-h-[600px]">
              <pre className="text-gray-300">
                {`  1  vector<vector<int>> fourSum(vector<int>& nums, int target) {
  2    vector<vector<int>> result;
  3    sort(nums.begin(), nums.end());
  4    int n = nums.size();
  5
  6    for (int i = 0; i < n - 3; i++) {
  7      if (i > 0 && nums[i] == nums[i-1]) continue;
  8
  9      for (int j = i + 1; j < n - 2; j++) {
 10        if (j > i + 1 && nums[j] == nums[j-1]) continue;
 11
 12        int left = j + 1, right = n - 1;
 13
 14        while (left < right) {
 15          long sum = (long)nums[i] + nums[j] +
 16                     nums[left] + nums[right];
 17
 18          if (sum == target) {
 19            result.push_back({nums[i], nums[j],
 20                             nums[left], nums[right]});
 21            while (left < right && nums[left] == nums[left+1])
 22              left++;
 23            while (left < right && nums[right] == nums[right-1])
 24              right--;
 25            left++; right--;
 26          } else if (sum < target) {
 27            left++;
 28          } else {
 29            right--;
 30          }
 31        }
 32      }
 33    }
 34    return result;
 35  }`}
              </pre>
            </div>
            <div className="px-4 py-2 border-t border-gray-800 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Current active line highlighted in green. Lines map to steps in
                the algorithm.
              </div>
            </div>
          </div>

          {/* Right Side - Visualization */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items Visualization */}
            <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <span className="text-gray-400">≡</span> Array Elements
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-400">i={i >= 0 ? i : "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-400">j={j >= 0 ? j : "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-400">
                      left={left >= 0 ? left : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-400">
                      right={right >= 0 ? right : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-8 gap-3">
                {displayArray.map((value, index) => {
                  const isI = phase === "finding" && index === i;
                  const isJ = phase === "finding" && index === j;
                  const isLeft = phase === "finding" && index === left;
                  const isRight = phase === "finding" && index === right;

                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                        isI
                          ? "bg-red-500/20 border-red-500"
                          : isJ
                          ? "bg-blue-500/20 border-blue-500"
                          : isLeft
                          ? "bg-green-500/20 border-green-500"
                          : isRight
                          ? "bg-yellow-500/20 border-yellow-500"
                          : "bg-[#161b22] border-gray-700"
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">#{index}</div>
                      <div className="font-bold">W: {value}</div>
                      <div className="text-xs text-gray-400">
                        V: {Math.abs(value) * 10}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Structures */}
            <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">▷</span>
                <h3 className="font-medium">Found Quadruplets</h3>
              </div>

              <div className="bg-[#161b22] rounded p-4 font-mono text-sm min-h-[100px]">
                {foundQuadruplets.length === 0 ? (
                  <div className="text-gray-600 grid grid-cols-10 gap-1">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="text-center">
                        0
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {foundQuadruplets.map((quad, idx) => (
                      <div key={idx} className="text-green-400">
                        [{quad.values.join(", ")}]
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-400">
                <div>
                  Active cell: {i >= 0 && j >= 0 ? `[${i}][${j}]` : "-, -"}
                </div>
                <div>
                  Selected items:{" "}
                  {foundQuadruplets.length > 0
                    ? `[${foundQuadruplets[
                        foundQuadruplets.length - 1
                      ]?.indices.join(", ")}]`
                    : "[]"}
                </div>
              </div>
            </div>

            {/* Explanation & Output */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-400">≡</span>
                  <h3 className="font-medium">Explanation</h3>
                </div>
                <div className="text-sm text-gray-300 mb-4">{explanation}</div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    Decision:{" "}
                    {currentSum !== null
                      ? currentSum === target
                        ? "Found match"
                        : currentSum < target
                        ? "Increase sum"
                        : "Decrease sum"
                      : "-"}
                  </div>
                  <div>Active line: {activeLineCode}</div>
                  <div className="text-gray-400">
                    Current sum: {currentSum !== null ? currentSum : "-"}
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-400">○</span>
                  <h3 className="font-medium">Output</h3>
                </div>
                <div className="text-4xl font-bold text-green-400 mb-4">
                  {foundQuadruplets.length}
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Quadruplets found for target: {target}</div>
                  <div className="mt-2 font-bold text-white">Result:</div>
                  {foundQuadruplets.length > 0 ? (
                    foundQuadruplets.map((quad, idx) => (
                      <div key={idx} className="text-green-400 font-mono">
                        [{quad.values.join(", ")}]
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600">None yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Complexity & Notes */}
            <div className="bg-[#0d1117] rounded-lg border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-400">○</span>
                <h3 className="font-medium">Complexity & Notes</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Time:</span>{" "}
                  <span className="text-green-400 font-mono">O(N³)</span> — we
                  fill N × W DP table.
                </div>
                <div>
                  <span className="text-gray-400">Space:</span>{" "}
                  <span className="text-green-400 font-mono">O(1)</span> —
                  constant extra space excluding output.
                </div>
                <div className="text-gray-400 text-xs mt-3">
                  <span className="font-bold text-white">Optimization:</span>{" "}
                  Can reduce space by not storing all intermediate sums, but
                  sorting is required for duplicate handling.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
