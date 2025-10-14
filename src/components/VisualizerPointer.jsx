import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

/**
 * Reusable pointer component for visualizers
 * Shows an animated arrow pointing to specific elements in visualizations
 * 
 * @param {number|null} index - Index of the element to point to (null hides pointer)
 * @param {string} containerId - ID of the container element
 * @param {string} color - Color name for the pointer (amber, purple, cyan, green, etc.)
 * @param {string} label - Label text to display
 * @param {string} [direction='down'] - Arrow direction: 'up' or 'down'
 * @param {boolean} [isEnd=false] - Special positioning for end of container
 */
const VisualizerPointer = ({ 
  index, 
  containerId, 
  color, 
  label, 
  direction = 'down',
  isEnd = false 
}) => {
  const [position, setPosition] = useState({ opacity: 0, left: 0 });

  useEffect(() => {
    // Hide pointer if index is invalid
    if (index === null || index < -1) {
      setPosition({ opacity: 0 });
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      setPosition({ opacity: 0 });
      return;
    }

    let offset = 0;

    // Special case: position at the end of container
    if (isEnd) {
      const lastEl = container.lastChild;
      if (lastEl) {
        const containerRect = container.getBoundingClientRect();
        const lastElRect = lastEl.getBoundingClientRect();
        offset = lastElRect.right - containerRect.left + 16;
      }
    } 
    // Special case: negative index (position before first element)
    else if (index === -1) {
      const firstEl = container.firstChild;
      if (firstEl) {
        const containerRect = container.getBoundingClientRect();
        const firstElRect = firstEl.getBoundingClientRect();
        offset = firstElRect.left - containerRect.left - 80;
      }
    } 
    // Normal case: position at specific element
    else {
      const element = document.getElementById(`${containerId}-element-${index}`);
      if (container && element) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        // Center the pointer (12 is half of pointer width: 24px / 2)
        offset = elementRect.left - containerRect.left + elementRect.width / 2 - 12;
      } else {
        setPosition({ opacity: 0 });
        return;
      }
    }

    setPosition({ opacity: 1, left: offset });
  }, [index, containerId, isEnd]);

  // Color mapping for Tailwind classes (fixes dynamic class generation issue)
  const colorClasses = {
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
    gray: 'text-gray-400',
    indigo: 'text-indigo-400',
    violet: 'text-violet-400',
  };
  const textColor = colorClasses[color] || 'text-gray-400';

  // Choose arrow component based on direction
  const ArrowIcon = direction === 'up' ? ArrowUp : ArrowDown;
  
  // Position class based on direction
  const positionClass = direction === 'up' ? 'top-full mt-0' : 'bottom-full mb-2';

  return (
    <div
      className={`absolute ${positionClass} text-center transition-all duration-300 ease-out`}
      style={position}
    >
      {direction === 'up' ? (
        <>
          <ArrowIcon className={`w-6 h-6 mx-auto ${textColor}`} />
          <span className={`font-bold text-lg font-mono ${textColor}`}>
            {label}
          </span>
        </>
      ) : (
        <>
          <span className={`font-bold text-lg font-mono ${textColor}`}>
            {label}
          </span>
          <ArrowIcon className={`w-6 h-6 mx-auto ${textColor}`} />
        </>
      )}
    </div>
  );
};

export default VisualizerPointer;
