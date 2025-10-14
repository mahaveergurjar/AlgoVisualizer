import React, { useState } from 'react';

const MergeSort = () => {
  const [array, setArray] = useState([5, 2, 9, 1, 5, 6]);

  const mergeSort = (arr) => {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
  };

  const merge = (left, right) => {
    let result = [], i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] < right[j]) result.push(left[i++]);
      else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  };

  const handleSort = () => {
    const sortedArray = mergeSort([...array]);
    setArray(sortedArray);
  };

  return (
    <div>
      <h2>Merge Sort Visualization</h2>
      <button onClick={handleSort}>Sort Array</button>
      <div>{array.join(', ')}</div>
    </div>
  );
};

export default MergeSort;
