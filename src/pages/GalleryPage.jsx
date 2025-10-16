import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import problemsData from '../data/problems.json';

// Sub-component for search bar
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search problems by title or description..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// Sub-component for filter panel
function FilterPanel({ difficulties, selectedDifficulties, onDifficultyChange, tags, selectedTags, onTagChange, onClearFilters }) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h3 className="font-semibold mb-2">Difficulty</h3>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <label key={diff} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDifficulties.includes(diff)}
                  onChange={() => onDifficultyChange(diff)}
                  className="mr-1"
                />
                <span className={`px-2 py-1 rounded text-sm ${
                  diff === 'Easy' ? 'bg-green-100 text-green-800' :
                  diff === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {diff}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onTagChange(tag)}
                  className="mr-1"
                />
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

// Sub-component for tag chip
function TagChip({ tag }) {
  return (
    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-1 mb-1">
      {tag}
    </span>
  );
}

// Sub-component for problem card
function ProblemCard({ problem }) {
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800',
  }[problem.difficulty];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
      <p className="text-gray-600 mb-3">{problem.description}</p>
      <div className="mb-3">
        <span className={`inline-block px-2 py-1 rounded ${difficultyColor}`}>
          {problem.difficulty}
        </span>
      </div>
      <div className="mb-3">
        {problem.tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </div>
      <Link
        to={problem.route}
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        View Visualization
      </Link>
    </div>
  );
}

// Main GalleryPage component
export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [problems, setProblems] = useState([]);

  // Extract unique difficulties and tags from data
  const difficulties = [...new Set(problemsData.map(p => p.difficulty))];
  const tags = [...new Set(problemsData.flatMap(p => p.tags))];

  useEffect(() => {
    setProblems(problemsData);
  }, []);

  // Filter problems based on search and filters
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(problem.difficulty);
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => problem.tags.includes(tag));

    return matchesSearch && matchesDifficulty && matchesTags;
  });

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleTagChange = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulties([]);
    setSelectedTags([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Algorithm Gallery</h1>
      <p className="text-gray-600 mb-8">
        Explore and discover various algorithms and data structures with interactive visualizations.
      </p>

      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <FilterPanel
        difficulties={difficulties}
        selectedDifficulties={selectedDifficulties}
        onDifficultyChange={handleDifficultyChange}
        tags={tags}
        selectedTags={selectedTags}
        onTagChange={handleTagChange}
        onClearFilters={handleClearFilters}
      />

      {filteredProblems.length === 0 ? (
        <p className="text-center text-gray-500">No problems match your filters. Try adjusting your search or filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
}
