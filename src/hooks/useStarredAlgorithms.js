import { useState, useEffect } from 'react';

export const useStarredAlgorithms = () => {
  const [starredAlgorithms, setStarredAlgorithms] = useState([]);

  useEffect(() => {
    // Load starred algorithms from localStorage on mount
    const loadStarredAlgorithms = () => {
      try {
        const stored = localStorage.getItem('starredAlgorithms');
        if (stored) {
          setStarredAlgorithms(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading starred algorithms:', error);
        setStarredAlgorithms([]);
      }
    };

    loadStarredAlgorithms();

    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'starredAlgorithms') {
        loadStarredAlgorithms();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToStarred = (algorithm) => {
    const newAlgorithm = {
      id: algorithm.id,
      name: algorithm.name,
      category: algorithm.category,
      timestamp: new Date().toISOString()
    };
    
    const updatedList = [...starredAlgorithms, newAlgorithm];
    setStarredAlgorithms(updatedList);
    localStorage.setItem('starredAlgorithms', JSON.stringify(updatedList));
  };

  const removeFromStarred = (algorithmId) => {
    const updatedList = starredAlgorithms.filter(
      (algo) => algo.id !== algorithmId
    );
    setStarredAlgorithms(updatedList);
    localStorage.setItem('starredAlgorithms', JSON.stringify(updatedList));
  };

  const isStarred = (algorithmId) => {
    return starredAlgorithms.some((algo) => algo.id === algorithmId);
  };

  const clearAllStarred = () => {
    setStarredAlgorithms([]);
    localStorage.removeItem('starredAlgorithms');
  };

  return {
    starredAlgorithms,
    addToStarred,
    removeFromStarred,
    isStarred,
    clearAllStarred
  };
};