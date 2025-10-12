import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Scissors,
  ArrowUpDown,
  BarChart4,
  SquareStack,
  Code2,
  Clock,
  TrendingUp,
  Star,
  Zap,
  Code,
  CheckCircle,
  LogIn,
  LogOut,
  Eye,
  RefreshCw,
  Layers,
  XCircle,
} from "lucide-react";

// ====================================================================================
// SHARED HELPER COMPONENTS
// ====================================================================================

const CodeLine = ({ line, content, activeLine }) => {
    const colorMapping = { purple: "text-purple-400", cyan: "text-cyan-400", "": "text-gray-200", pink: "text-pink-400", blue: "text-blue-400", sky: "text-sky-300", teal: "text-teal-300", amber: "text-amber-400", green: "text-green-500", indigo: "text-indigo-300", gray: "text-gray-500" };
    return (
        <div className={`block rounded-md transition-colors px-2 py-1 ${ activeLine === line ? "bg-sky-500/20 border-l-4 border-sky-400" : "" }`}>
            <span className="text-gray-500 w-8 inline-block text-right pr-4 select-none">{line}</span>
            {content.map((token, index) => (
                <span key={index} className={colorMapping[token.c]}>{token.t}</span>
            ))}
        </div>
    );
};

// ====================================================================================
// VISUALIZER COMPONENTS
// ====================================================================================

// --- Placeholder for SubarrayRanges ---
const SubarrayRanges = ({ navigate }) => (
    <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-violet-400">Sum of Subarray Ranges</h1>
        <p className="text-lg text-gray-400 mt-4">This visualizer is not yet implemented.</p>
    </div>
);

// --- Placeholder for LargestRectangleHistogram ---
const LargestRectangleHistogram = ({ navigate }) => (
     <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-red-400">Largest Rectangle in Histogram</h1>
        <p className="text-lg text-gray-400 mt-4">This visualizer is not yet implemented.</p>
    </div>
);

// --- Placeholder for RemoveKDigits ---
const RemoveKDigits = ({ navigate }) => {
    return (
        <div className="p-4 max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-amber-400">Remove K Digits</h1>
            <p className="text-lg text-gray-400 mt-4">This visualizer is a placeholder.</p>
        </div>
    );
};


// --- StackOperations Visualizer ---
const StackOperations = ({ navigate }) => {
  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [lastOperation, setLastOperation] = useState(null);
  const [peekedValue, setPeekedValue] = useState(null);
  const [poppedValue, setPoppedValue] = useState(null);
  const [error, setError] = useState(null);

  const handlePush = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      setError("Please enter a valid number.");
      return;
    }
    if (stack.length >= 8) {
      setError("Stack is full! (Max 8 elements)");
      return;
    }
    setStack([...stack, num]);
    setLastOperation({ op: "push", value: num });
    setPeekedValue(null);
    setPoppedValue(null);
    setError(null);
    setInputValue("");
  };

  const handlePop = () => {
    if (stack.length === 0) {
      setError("Stack is empty. Cannot pop.");
      return;
    }
    const popped = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    setLastOperation({ op: "pop" });
    setPoppedValue(popped);
    setPeekedValue(null);
    setError(null);
  };

  const handlePeek = () => {
    if (stack.length === 0) {
      setError("Stack is empty. Cannot peek.");
      return;
    }
    const top = stack[stack.length - 1];
    setLastOperation({ op: "peek" });
    setPeekedValue(top);
    setPoppedValue(null);
    setError(null);
  };

  const handleReset = () => {
    setStack([]);
    setInputValue("");
    setLastOperation(null);
    setPeekedValue(null);
    setPoppedValue(null);
    setError(null);
  };

  const getCodeLine = () => {
    if (!lastOperation) return 0;
    switch (lastOperation.op) {
      case "push": return 2;
      case "pop": return 3;
      case "peek": return 4;
      default: return 0;
    }
  };

  const code = [ { l: 1, c: [{ t: "class", c: "purple" }, { t: " Stack {", c: "" }] }, { l: 2, c: [{ t: "  push(element)", c: "" }] }, { l: 3, c: [{ t: "  pop()", c: "" }] }, { l: 4, c: [{ t: "  peek()", c: "" }] }, { l: 5, c: [{ t: "  isEmpty()", c: "" }] }, { l: 6, c: [{ t: "}", c: "" }] }, ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Stack Operations
        </h1>
        <p className="text-xl text-gray-400 mt-3">Visualizing a LIFO Data Structure</p>
      </header>
      <div className="bg-gray-800 p-5 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePush()} className="font-mono w-28 bg-gray-900 p-3 rounded-lg border-2 border-gray-600 focus:border-green-500 focus:outline-none transition-colors" placeholder="e.g., 42" />
            <button onClick={handlePush} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"><LogIn size={18} /> Push</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePop} className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"><LogOut size={18} /> Pop</button>
            <button onClick={handlePeek} className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"><Eye size={18} /> Peek</button>
          </div>
          <button onClick={handleReset} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all transform hover:scale-105"><RefreshCw size={18} /> Reset</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="font-bold text-2xl text-green-400 mb-4 pb-3 border-b border-gray-600 flex items-center gap-2"><Code size={22} /> Pseudocode</h3>
            <pre className="text-sm overflow-auto"><code className="font-mono leading-relaxed">
              {code.map((line) => <CodeLine key={line.l} line={line.l} content={line.c} activeLine={getCodeLine()} />)}
            </code></pre>
          </div>
          <div className={`p-5 rounded-2xl border-2 transition-all shadow-xl ${ error ? "bg-gradient-to-br from-red-900/40 to-rose-900/40 border-red-500" : lastOperation?.op === "push" ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500" : "bg-gradient-to-br from-gray-800 to-gray-850 border-gray-700" }`}>
            <h3 className={`text-sm font-semibold flex items-center gap-2 mb-2 ${ error ? "text-red-300" : lastOperation?.op === "push" ? "text-green-300" : "text-gray-400" }`}><CheckCircle size={18} /> Operation Result</h3>
            <p className={`font-mono text-2xl font-bold ${ error ? "text-red-400" : lastOperation?.op === "push" ? "text-green-400" : "text-gray-400" }`}>
              {error ? <span className="flex items-center gap-2"><XCircle size={24} /> {error}</span> : !lastOperation ? "No operation yet" : lastOperation.op === "push" ? `Pushed ${lastOperation.value}` : lastOperation.op === "pop" ? `Popped ${poppedValue}` : lastOperation.op === "peek" ? `Peeked ${peekedValue}` : "Ready"}
            </p>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-6 rounded-2xl border border-gray-700 shadow-2xl min-h-[500px] flex flex-col justify-end">
            <h3 className="font-bold text-xl text-gray-200 mb-4 flex items-center gap-2 self-start"><Layers size={22} /> Stack Visualization</h3>
            <div className="flex flex-col-reverse items-center gap-2 w-full h-full">
              {stack.map((val, i) => (
                <div key={i} className={`w-3/4 max-w-sm flex items-center justify-center h-16 rounded-lg text-2xl font-bold shadow-lg border-2 transition-all duration-300 animate-fade-in-up ${ i === stack.length - 1 ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400" : "bg-gradient-to-br from-sky-500 to-blue-600 border-sky-400" }`}>{val}</div>
              ))}
              {stack.length === 0 && <div className="flex-grow flex items-center justify-center"><span className="text-gray-500 italic">Stack is empty</span></div>}
            </div>
            <div className="text-center text-gray-400 font-semibold mt-2 border-t-4 border-gray-600 pt-2 w-3/4 max-w-sm mx-auto">Base</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 p-5 rounded-2xl border border-gray-700 shadow-xl grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Top Element</h3>
              <p className="font-mono text-3xl font-bold text-sky-400">{stack.length > 0 ? stack[stack.length - 1] : "N/A"}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">Is Empty?</h3>
              <p className={`font-mono text-3xl font-bold ${stack.length === 0 ? "text-red-400" : "text-green-400"}`}>{stack.length === 0 ? "true" : "false"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ====================================================================================
// COMPONENT 3: Algorithm List for Stacks
// ====================================================================================
const AlgorithmList = ({ navigate }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const algorithms = [
     {
      name: "Stack Operations",
      number: "Basic",
      icon: Layers,
      description: "Visualize the core stack operations: Push, Pop, and Peek.",
      page: "StackOperations",
      difficulty: "Fundamental",
      difficultyColor: "text-cyan-400",
      difficultyBg: "bg-cyan-400/10",
      difficultyBorder: "border-cyan-400/30",
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/20",
      borderColor: "border-green-500/30",
      technique: "LIFO",
      timeComplexity: "O(1)",
    },
    {
      name: "Largest Rectangle in Histogram",
      number: "84",
      icon: BarChart4,
      description: "Given a histogram's bar heights, find the area of the largest rectangle that can be formed.",
      page: "LargestRectangleHistogram",
      difficulty: "Hard",
      difficultyColor: "text-red-400",
      difficultyBg: "bg-red-400/10",
      difficultyBorder: "border-red-400/30",
      gradient: "from-red-500 to-rose-500",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/20",
      borderColor: "border-red-500/30",
      technique: "Monotonic Stack",
      timeComplexity: "O(n)",
    },
    {
      name: "Remove K Digits",
      number: "402",
      icon: Scissors,
      description: "Given a number, remove K digits to create the smallest possible new number.",
      page: "RemoveKDigits",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-amber-500 to-orange-500",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      technique: "Greedy + Stack",
      timeComplexity: "O(n)",
    },
    {
      name: "Sum of Subarray Ranges",
      number: "2104",
      icon: ArrowUpDown,
      description: "Calculate the sum of differences between largest and smallest elements over all subarrays.",
      page: "SubarrayRanges",
      difficulty: "Medium",
      difficultyColor: "text-yellow-400",
      difficultyBg: "bg-yellow-400/10",
      difficultyBorder: "border-yellow-400/30",
      gradient: "from-violet-500 to-purple-500",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/20",
      borderColor: "border-violet-500/30",
      technique: "Monotonic Stack",
      timeComplexity: "O(n)",
    },
  ].sort((a, b) => {
      if(a.number === 'Basic') return -1;
      if(b.number === 'Basic') return 1;
      return parseInt(a.number) - parseInt(b.number)
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <header className="text-center mb-16 mt-8 relative">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-slow-delayed pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-6">
            <div className="relative"><SquareStack className="h-14 sm:h-16 w-14 sm:w-16 text-violet-400 animated-icon" /><Zap className="h-5 w-5 text-fuchsia-300 absolute -top-1 -right-1 animate-pulse" /></div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 animated-gradient">Stack Algorithms</h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed px-4">Master stack-based problems using the <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">LIFO principle</span> and <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">monotonic stacks</span></p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <div className="px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full border border-violet-500/30 backdrop-blur-sm"><div className="flex items-center gap-2"><Code2 className="h-3.5 w-3.5 text-violet-400" /><span className="text-xs font-medium text-gray-300">{algorithms.length} Problems</span></div></div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-500/30 backdrop-blur-sm"><div className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-green-400" /><span className="text-xs font-medium text-gray-300">Advanced Techniques</span></div></div>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {algorithms.map((algo, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = algo.icon;
          return (
            <div key={algo.name} onClick={() => navigate(algo.page)} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className="group relative cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${algo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
              <div className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border ${algo.borderColor} transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-2xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${algo.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}><Icon className={`h-10 w-10 ${ isHovered ? "text-white" : algo.iconColor } transition-colors duration-300`} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-gray-500">#{algo.number}</span><div className={`px-2 py-0.5 rounded-md text-xs font-bold ${algo.difficultyBg} ${algo.difficultyColor} border ${algo.difficultyBorder}`}>{algo.difficulty}</div></div>
                      <h2 className={`text-xl font-bold transition-colors duration-300 ${ isHovered ? "text-white" : "text-gray-200" }`}>{algo.name}</h2>
                    </div>
                  </div>
                </div>
                <p className="h-14 text-sm leading-relaxed mb-5 transition-colors duration-300">{algo.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-violet-400" /><span className="text-xs font-medium text-gray-400">{algo.technique}</span></div>
                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-blue-400" /><span className="text-xs font-mono text-gray-400">{algo.timeComplexity}</span></div>
                  </div>
                  <div className={`transition-all duration-300 ${ isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2" }`}><div className="flex items-center gap-1"><span className="text-xs font-medium text-gray-400">Solve</span><ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" /></div></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full border border-gray-700 backdrop-blur-sm"><TrendingUp className="h-4 w-4 text-green-400" /><span className="text-sm text-gray-400">More stack problems coming soon</span></div>
      </div>
    </div>
  );
};

// ====================================================================================
// COMPONENT 4: Page Wrapper
// ====================================================================================
const PageWrapper = ({ children }) => (
    <div className="bg-gray-950 text-white min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>
      <style>{`.animated-gradient { background-size: 200% auto; animation: gradient-animation 4s ease-in-out infinite; } @keyframes gradient-animation { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } } .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } .animated-icon { animation: float-rotate 8s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(167, 139, 250, 0.6)); } @keyframes float-rotate { 0%, 100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-8px) rotate(120deg); } 66% { transform: translateY(-4px) rotate(240deg); } } .animate-pulse-slow, .animate-pulse-slow-delayed { animation: pulse-slow 4s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); } @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } } .animate-float, .animate-float-delayed { animation: float 20s ease-in-out infinite; animation-delay: var(--animation-delay, 0s); } @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.1); } }`}</style>
      <div className="relative z-10">{children}</div>
    </div>
);


// ====================================================================================
// COMPONENT 5: Main Page Component
// ====================================================================================
const StackPage = ({ navigate: parentNavigate }) => {
  const [page, setPage] = useState("home");
  const navigate = (newPage) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case "StackOperations": return <StackOperations navigate={navigate} />;
      case "SubarrayRanges": return <SubarrayRanges navigate={navigate} />;
      case "RemoveKDigits": return <RemoveKDigits navigate={navigate} />;
      case "LargestRectangleHistogram": return <LargestRectangleHistogram navigate={navigate} />;
      case "home":
      default:
        return <AlgorithmList navigate={navigate} />;
    }
  };

  return (
    <PageWrapper>
      {page !== "home" && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full mx-auto flex items-center justify-between">
            <button onClick={() => navigate("home")} className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"><ArrowLeft className="h-4 w-4" />Back to Problems</button>
            <div className="flex items-center gap-2"><SquareStack className="h-5 w-5 text-violet-400" /><span className="text-sm font-semibold text-gray-300">Stack Algorithms</span></div>
          </div>
        </nav>
      )}
      {page === "home" && parentNavigate && (
        <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 h-16 flex items-center shadow-xl">
          <div className="max-w-7xl px-6 w-full ">
            <button onClick={() => parentNavigate("home")} className="flex items-center gap-2 text-gray-300 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-gray-700 hover:border-gray-600"><ArrowLeft className="h-4 w-4" />Back to Home</button>
          </div>
        </nav>
      )}
      {renderPage()}
    </PageWrapper>
  );
};

export default StackPage;

