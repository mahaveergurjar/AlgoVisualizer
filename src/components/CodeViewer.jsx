import React from "react";
import { FileText } from "lucide-react";

/**
 * Reusable side-by-side C++ code panel with active line highlighting.
 */
export default function CodeViewer({ codeContent, activeLine, title = "Algorithm Steps" }) {
  return (
    <aside className="p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl h-full flex flex-col">
      <h3 className="text-cyan-300 flex items-center gap-2 font-semibold mb-3 text-lg select-none">
        <FileText size={18} /> {title}
      </h3>
      <pre className="bg-gray-950/70 rounded-lg border border-gray-800 p-3 font-mono text-sm max-h-[60vh] overflow-y-auto flex-1 custom-scrollbar">
        {Object.entries(codeContent).map(([ln, txt]) => {
          const isHighlighted = activeLine === parseInt(ln, 10);
          return (
            <div
              key={ln}
              className={`flex items-start rounded-sm transition-colors duration-200 py-0.5 ${
                isHighlighted ? "bg-cyan-500/10 border-l-2 border-cyan-400 pl-1 -ml-1.5" : ""
              }`}
            >
              <span className={`w-8 mr-3 text-right select-none pt-0.5 text-xs font-bold ${
                isHighlighted ? "text-cyan-400" : "text-gray-600"
              }`}>
                {ln}
              </span>
              <div className={`flex-1 whitespace-pre-wrap pt-0.5 text-xs font-medium leading-relaxed ${
                isHighlighted ? "text-cyan-300 font-bold" : "text-gray-300"
              }`}>
                {txt}
              </div>
            </div>
          );
        })}
      </pre>
    </aside>
  );
}
