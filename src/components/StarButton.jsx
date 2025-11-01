import React, { useState, useEffect } from 'react';
import { isProblemStarred, addStarredProblem, removeStarredProblem } from '../utils/starredManager';

// You can use an SVG for the star icon for better quality
const StarIcon = ({ isFilled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 transition-colors duration-200 ${
      isFilled ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-gray-500'
    }`}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
      clipRule="evenodd"
    />
  </svg>
);

const StarButton = ({ problemId }) => {
  const [isStarred, setIsStarred] = useState(false);

  // Set the initial state when the component mounts
  useEffect(() => {
    setIsStarred(isProblemStarred(problemId));
  }, [problemId]);

  const handleStarClick = (e) => {
    // Stop the click from bubbling up to a parent link/element
    e.preventDefault(); 
    e.stopPropagation();

    if (isStarred) {
      removeStarredProblem(problemId);
      setIsStarred(false);
    } else {
      addStarredProblem(problemId);
      setIsStarred(true);
    }
  };

  return (
    <button onClick={handleStarClick} aria-label="Star this problem" className="focus:outline-none">
      <StarIcon isFilled={isStarred} />
    </button>
  );
};

export default StarButton;