import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage starred/bookmarked items
 * Stores data in localStorage for persistence across sessions
 */
export function useStarredItems() {
  const STORAGE_KEY = 'algovisualizer_starred_items';

  // Initialize state from localStorage
  const [starredItems, setStarredItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading starred items:', error);
      return [];
    }
  });

  // Persist to localStorage whenever starredItems changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starredItems));
    } catch (error) {
      console.error('Error saving starred items:', error);
    }
  }, [starredItems]);

  /**
   * Toggle star status for a category or problem
   * @param {Object} item - The item to star/unstar
   * @param {string} item.type - 'category' or 'problem'
   * @param {string} item.id - Unique identifier
   * @param {string} item.label - Display name
   * @param {string} [item.category] - For problems, which category they belong to
   * @param {string} [item.subpage] - For problems, the subpage identifier
   */
  const toggleStar = useCallback((item) => {
    setStarredItems((prev) => {
      const exists = prev.some((starred) => 
        starred.id === item.id && starred.type === item.type
      );

      if (exists) {
        // Remove from starred
        return prev.filter((starred) => 
          !(starred.id === item.id && starred.type === item.type)
        );
      } else {
        // Add to starred with timestamp
        return [...prev, { ...item, starredAt: Date.now() }];
      }
    });
  }, []);

  /**
   * Check if an item is starred
   * @param {string} id - Item identifier
   * @param {string} type - 'category' or 'problem'
   * @returns {boolean}
   */
  const isStarred = useCallback((id, type) => {
    return starredItems.some((item) => item.id === id && item.type === type);
  }, [starredItems]);

  /**
   * Remove a starred item
   * @param {string} id - Item identifier
   * @param {string} type - 'category' or 'problem'
   */
  const removeStar = useCallback((id, type) => {
    setStarredItems((prev) =>
      prev.filter((item) => !(item.id === id && item.type === type))
    );
  }, []);

  /**
   * Clear all starred items
   */
  const clearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to remove all starred items?')) {
      setStarredItems([]);
    }
  }, []);

  /**
   * Get starred items by type
   * @param {string} type - 'category' or 'problem'
   * @returns {Array}
   */
  const getStarredByType = useCallback((type) => {
    return starredItems.filter((item) => item.type === type);
  }, [starredItems]);

  /**
   * Get count of starred items
   * @returns {number}
   */
  const getStarredCount = useCallback(() => {
    return starredItems.length;
  }, [starredItems]);

  return {
    starredItems,
    toggleStar,
    isStarred,
    removeStar,
    clearAll,
    getStarredByType,
    getStarredCount,
  };
}

export default useStarredItems;

