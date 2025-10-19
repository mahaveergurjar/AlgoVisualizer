import React from "react";

interface VisualizerPointerProps {
  className?: string;
}

const VisualizerPointer: React.FC<VisualizerPointerProps> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-400 animate-bounce" />
    </div>
  );
};

export default VisualizerPointer;