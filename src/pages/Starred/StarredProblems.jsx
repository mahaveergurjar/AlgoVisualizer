import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getStarredProblems } from '../../utils/starredManager';
import { problems as PROBLEM_CATALOG } from '../../search/catalog';
import StarButton from '../../components/StarButton'; // Make sure you have this component

const StarredProblems = ({ navigate }) => {
  const [starred, setStarred] = useState([]);

  // This function will refetch the starred problems when one is unstarred from this page
  const refreshStarred = () => {
    const starredIds = getStarredProblems();
    const starredProblems = PROBLEM_CATALOG.filter(problem => starredIds.includes(problem.subpage));
    setStarred(starredProblems);
  };

  useEffect(() => {
    refreshStarred();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-8 animate-fade-in-up">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("home")}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Starred Topics</h1>
      </header>
      
      {starred.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {starred.map(problem => (
            <div
              key={problem.subpage}
              className="group relative p-4 bg-gray-900/80 border border-gray-800 rounded-lg transition-all hover:border-blue-500/50 hover:scale-[1.02]"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-200">{problem.label}</h2>
                  <p className="text-sm text-gray-500">{problem.category}</p>
                </div>
                {/* We wrap the StarButton to refresh the list on click */}
                <div onClick={refreshStarred}>
                  <StarButton problemId={problem.subpage} />
                </div>
              </div>
              <button
                onClick={() => navigate({ page: problem.category, subpage: problem.subpage })}
                className="mt-4 text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                View Visualization →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-8 bg-gray-900/50 border border-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-2">No Starred Problems Yet</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Click the star icon ★ next to any problem to save it here for later review.
            </p>
        </div>
      )}
    </div>
  );
};

export default StarredProblems;