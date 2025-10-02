import React from "react";
import { VenetianMask } from "lucide-react"; // Using a placeholder icon

const LinkedList = ({ navigate }) => {
  const arrayAlgorithms = [
    {
      name: "Max Consecutive Ones III",
      icon: <VenetianMask className="h-8 w-8 text-amber-400" />,
      description: "Find the longest subarray of 1s with at most K flips.",
      page: "max_consecutive_ones",
    },
    // Future array visualizers will be added here
  ];

  return (
    <div className="p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-400">LinkedList</h1>
        <p className="text-xl text-gray-400 mt-2">
          Select a problem to visualize
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {arrayAlgorithms.map((algo) => (
          <div
            key={algo.name}
            onClick={() => navigate(algo.page)}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              {algo.icon}
              <h2 className="text-2xl font-bold text-gray-200">{algo.name}</h2>
            </div>
            <p className="text-gray-400">{algo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkedList;
