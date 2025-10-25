import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const StarButton = ({ algorithmId, algorithmName, category, onToggle }) => {
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    // Check if algorithm is already starred
    const starredAlgorithms = JSON.parse(localStorage.getItem('starredAlgorithms') || '[]');
    const isAlreadyStarred = starredAlgorithms.some(
      (algo) => algo.id === algorithmId
    );
    setIsStarred(isAlreadyStarred);
  }, [algorithmId]);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking star
    const starredAlgorithms = JSON.parse(localStorage.getItem('starredAlgorithms') || '[]');
    
    if (isStarred) {
      // Remove from starred list
      const updatedList = starredAlgorithms.filter(
        (algo) => algo.id !== algorithmId
      );
      localStorage.setItem('starredAlgorithms', JSON.stringify(updatedList));
      setIsStarred(false);
    } else {
      // Add to starred list
      const newAlgorithm = {
        id: algorithmId,
        name: algorithmName,
        category: category,
        timestamp: new Date().toISOString()
      };
      const updatedList = [...starredAlgorithms, newAlgorithm];
      localStorage.setItem('starredAlgorithms', JSON.stringify(updatedList));
      setIsStarred(true);
    }
    
    // Notify parent component if callback provided
    if (onToggle) {
      onToggle(!isStarred);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
        isStarred
          ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20'
          : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
      }`}
      title={isStarred ? 'Remove from Review Later' : 'Mark to Review Later'}
      aria-label={isStarred ? 'Remove from Review Later' : 'Mark to Review Later'}
    >
      <Star
        className={`h-5 w-5 transition-all duration-200 ${
          isStarred ? 'fill-current' : ''
        }`}
      />
    </button>
  );
};

export default StarButton;