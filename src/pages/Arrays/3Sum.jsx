import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Code,
  Clock,
  Cpu,
  Hash,
} from "lucide-react";

const ThreeSum = ({ navigate }) => {
  const [array, setArray] = useState([-1, 0, 1, 2, -1, -4]);
  const [sortedArray, setSortedArray] = useState([]);
  const [originalArray] = useState([-1, 0, 1, 2, -1, -4]);
  const [i, setI] = useState(-1);
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [, setIsComplete] = useState(false);
  const [currentSum, setCurrentSum] = useState(null);
  const [foundTriplets, setFoundTriplets] = useState([]);
  const [currentStep, setCurrentStep] = useState("");
  const [phase, setPhase] = useState("sorting");

  const resetAnimation = () => {
    const sorted = [...array].sort((a, b) => a - b);
    setSortedArray(sorted);
    setI(-1);
    setLeft(-1);
    setRight(-1);
    setIsPlaying(false);
    setIsComplete(false);
    setCurrentSum(null);
    setFoundTriplets([]);
    setCurrentStep("Ready to start");
    setPhase("sorting");
  };

  const startAnimation = () => {
    resetAnimation();
    setIsPlaying(true);
    setPhase("sorting");
  };

  const generateNewArray = () => {
    const newArray = [];
    const size = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < size; i++) {
      newArray.push(Math.floor(Math.random() * 11) - 5);
    }
    setArray(newArray);
    resetAnimation();
  };

  const loadDefaultArray = () => {
    setArray([...originalArray]);
    resetAnimation();
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "sorting") {
        const sorted = [...array].sort((a, b) => a - b);
        setSortedArray(sorted);
        setCurrentStep("Array sorted, starting 3Sum algorithm");
        setPhase("finding");
        setI(0);
        setLeft(1);
        setRight(sorted.length - 1);
        return;
      }

      if (phase === "finding") {
        const arr = sortedArray;

        if (i >= arr.length - 2) {
          setIsPlaying(false);
          setIsComplete(true);
          setCurrentStep(
            `Complete! Found ${foundTriplets.length} unique triplet(s)`
          );
          setI(-1);
          setLeft(-1);
          setRight(-1);
          return;
        }

        if (i > 0 && arr[i] === arr[i - 1]) {
          setCurrentStep(`Skipping duplicate value at index ${i}`);
          setI(i + 1);
          setLeft(i + 2);
          setRight(arr.length - 1);
          return;
        }

        if (left >= right) {
          setCurrentStep(`Moving to next i position`);
          setI(i + 1);
          setLeft(i + 2);
          setRight(arr.length - 1);
          return;
        }

        const sum = arr[i] + arr[left] + arr[right];
        setCurrentSum(sum);

        if (sum === 0) {
          const newTriplet = {
            indices: [i, left, right],
            values: [arr[i], arr[left], arr[right]],
          };

          const isDuplicate = foundTriplets.some(
            (t) =>
              t.values[0] === newTriplet.values[0] &&
              t.values[1] === newTriplet.values[1] &&
              t.values[2] === newTriplet.values[2]
          );

          if (!isDuplicate) {
            setFoundTriplets([...foundTriplets, newTriplet]);
            setCurrentStep(
              `Found triplet: [${arr[i]}, ${arr[left]}, ${arr[right]}]`
            );
          }

          let newLeft = left + 1;
          let newRight = right - 1;

          while (newLeft < newRight && arr[newLeft] === arr[newLeft - 1])
            newLeft++;
          while (newLeft < newRight && arr[newRight] === arr[newRight + 1])
            newRight--;

          setLeft(newLeft);
          setRight(newRight);
        } else if (sum < 0) {
          setCurrentStep(`Sum ${sum} < 0, move left pointer right`);
          setLeft(left + 1);
        } else {
          setCurrentStep(`Sum ${sum} > 0, move right pointer left`);
          setRight(right - 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    i,
    left,
    right,
    sortedArray,
    array,
    speed,
    foundTriplets,
  ]);

  const displayArray = phase === "sorting" ? array : sortedArray;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Problems
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Hash className="h-12 w-12 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              3Sum Problem
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Find all unique triplets in the array that sum to zero using the
            two-pointer technique
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={loadDefaultArray}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-all"
                  >
                    Load Default
                  </button>
                  <button
                    onClick={startAnimation}
                    disabled={isPlaying}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" />
                    {isPlaying ? "Running..." : "Start Animation"}
                  </button>
                  <button
                    onClick={resetAnimation}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
                <button
                  onClick={generateNewArray}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-medium transition-all"
                >
                  New Array
                </button>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-400 text-sm">Speed:</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={1500}>Slow</option>
                  <option value={1000}>Medium</option>
                  <option value={500}>Fast</option>
                  <option value={250}>Very Fast</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                {phase === "sorting"
                  ? "Step 1: Sort Array"
                  : "Step 2: Find Triplets"}
              </h3>
              <p className="text-center text-gray-400 mb-6 text-sm">
                {currentStep}
              </p>

              {phase === "finding" && (
                <div className="flex justify-center gap-8 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-gray-400">
                      i = {i >= 0 ? i : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400">
                      left = {left >= 0 ? left : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-400">
                      right = {right >= 0 ? right : "-"}
                    </span>
                  </div>
                  {currentSum !== null && (
                    <div className="flex items-center gap-2 ml-4 font-bold">
                      <span
                        className={`${
                          currentSum === 0
                            ? "text-green-400"
                            : currentSum < 0
                            ? "text-blue-400"
                            : "text-orange-400"
                        }`}
                      >
                        sum = {currentSum}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center items-end gap-3 mb-8 min-h-[200px]">
                {displayArray.map((value, index) => {
                  const isI = phase === "finding" && index === i;
                  const isLeft = phase === "finding" && index === left;
                  const isRight = phase === "finding" && index === right;
                  const isInRange =
                    phase === "finding" &&
                    index > i &&
                    index >= left &&
                    index <= right;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="text-gray-400 text-xs font-mono">
                        [{index}]
                      </div>
                      <div
                        className={`w-14 flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-300 ${
                          isI
                            ? "bg-red-500/30 border-red-400 scale-110 shadow-lg shadow-red-500/25"
                            : isLeft
                            ? "bg-green-500/30 border-green-400 scale-110 shadow-lg shadow-green-500/25"
                            : isRight
                            ? "bg-yellow-500/30 border-yellow-400 scale-110 shadow-lg shadow-yellow-500/25"
                            : isInRange
                            ? "bg-blue-500/20 border-blue-400"
                            : "bg-gray-700/30 border-gray-600"
                        }`}
                        style={{ height: `${Math.abs(value) * 15 + 60}px` }}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-white font-bold text-base">
                            {value}
                          </span>
                        </div>
                        <div
                          className={`w-full text-center py-1 text-xs font-bold ${
                            isI
                              ? "bg-red-500 text-white"
                              : isLeft
                              ? "bg-green-500 text-white"
                              : isRight
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {isI ? "i" : isLeft ? "L" : isRight ? "R" : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <h4 className="text-sm font-bold text-gray-300 mb-3">
                  Found Triplets ({foundTriplets.length}):
                </h4>
                {foundTriplets.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No triplets found yet...
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {foundTriplets.map((triplet, idx) => (
                      <div
                        key={idx}
                        className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center"
                      >
                        <span className="text-green-400 font-mono text-sm">
                          [{triplet.values.join(", ")}]
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Problem Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <Code className="h-5 w-5 text-cyan-400" />
                  <div>
                    <div className="font-bold text-white">LeetCode #15</div>
                    <div className="text-sm text-gray-400">Medium</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                Algorithm Steps
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    1
                  </div>
                  <p className="text-gray-300">
                    Sort the array in ascending order
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    2
                  </div>
                  <p className="text-gray-300">
                    Fix pointer i, use two pointers (left, right) for remaining
                    array
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    3
                  </div>
                  <p className="text-gray-300">
                    If sum = 0: found triplet, skip duplicates
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    4
                  </div>
                  <p className="text-gray-300">
                    If sum &lt; 0: move left pointer right
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    5
                  </div>
                  <p className="text-gray-300">
                    If sum &gt; 0: move right pointer left
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">
                C++ Solution
              </h3>
              <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-gray-300">
                  {`vector<vector<int>> threeSum(vector<int>& nums) {
  vector<vector<int>> result;
  sort(nums.begin(), nums.end());

  for (int i = 0; i < nums.size() - 2; i++) {
    if (i > 0 && nums[i] == nums[i-1]) continue;

    int left = i + 1, right = nums.size() - 1;

    while (left < right) {
      int sum = nums[i] + nums[left] + nums[right];

      if (sum == 0) {
        result.push_back({nums[i], nums[left], nums[right]});
        while (left < right && nums[left] == nums[left+1]) left++;
        while (left < right && nums[right] == nums[right-1]) right--;
        left++; right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`}
                </pre>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Complexity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-400 mt-1" />
                  <div>
                    <div className="font-bold text-white">Time: O(N²)</div>
                    <div className="text-sm text-gray-400">
                      Sorting O(N log N) + nested loops O(N²)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cpu className="h-5 w-5 text-green-400 mt-1" />
                  <div>
                    <div className="font-bold text-white">Space: O(1)</div>
                    <div className="text-sm text-gray-400">
                      Excluding output array, constant extra space
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeSum;
