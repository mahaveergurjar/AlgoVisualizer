// A key to store our starred problems array in localStorage
const STARRED_KEY = 'algoVisualizerStarred';

// Returns an array of starred problem IDs from localStorage
export const getStarredProblems = () => {
  const starred = localStorage.getItem(STARRED_KEY);
  return starred ? JSON.parse(starred) : [];
};

// Adds a problem ID to the starred list
export const addStarredProblem = (problemId) => {
  const starred = getStarredProblems();
  if (!starred.includes(problemId)) {
    const newStarred = [...starred, problemId];
    localStorage.setItem(STARRED_KEY, JSON.stringify(newStarred));
  }
};

// Removes a problem ID from the starred list
export const removeStarredProblem = (problemId) => {
  const starred = getStarredProblems();
  const newStarred = starred.filter((id) => id !== problemId);
  localStorage.setItem(STARRED_KEY, JSON.stringify(newStarred));
};

// Checks if a specific problem is starred
export const isProblemStarred = (problemId) => {
  const starred = getStarredProblems();
  return starred.includes(problemId);
};