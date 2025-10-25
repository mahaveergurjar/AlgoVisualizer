import React, { useState } from 'react';
import { ArrowLeft, Star, Trash2, Clock, Tag, ExternalLink } from 'lucide-react';
import { useStarredAlgorithms } from '../hooks/useStarredAlgorithms';

const ReviewLater = ({ navigate }) => {
  const { starredAlgorithms, removeFromStarred, clearAllStarred } = useStarredAlgorithms();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleRemoveAlgorithm = (algorithmId, e) => {
    e.stopPropagation();
    removeFromStarred(algorithmId);
  };

  const handleNavigateToAlgorithm = (algorithm) => {
    navigate({ page: algorithm.category, subpage: algorithm.name });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('home')}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700"
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-400 fill-current" />
              Review Later
            </h1>
            <p className="text-gray-400 mt-2">
              {starredAlgorithms.length} algorithm{starredAlgorithms.length !== 1 ? 's' : ''} marked for review
            </p>
          </div>
        </div>
        
        {starredAlgorithms.length > 0 && (
          <button
            onClick={clearAllStarred}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      {starredAlgorithms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
            <Star className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No algorithms marked yet</h3>
          <p className="text-gray-500 mb-6">
            Start exploring algorithms and mark them with the ⭐ button to review later
          </p>
          <button
            onClick={() => navigate('home')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Browse Algorithms
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {starredAlgorithms.map((algorithm, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={algorithm.id}
                onClick={() => handleNavigateToAlgorithm(algorithm)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
              >
                {/* Star button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => handleRemoveAlgorithm(algorithm.id, e)}
                    className="p-2 rounded-full text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all duration-200 hover:scale-110"
                    title="Remove from Review Later"
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                </div>

                {/* Algorithm info */}
                <div className="pr-12">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-medium">
                      {algorithm.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    {algorithm.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Added {formatDate(algorithm.timestamp)}</span>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <span>View Algorithm</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-gray-600 text-sm">
          Keep track of algorithms you want to revisit • All data stored locally
        </p>
      </div>
    </div>
  );
};

export default ReviewLater;