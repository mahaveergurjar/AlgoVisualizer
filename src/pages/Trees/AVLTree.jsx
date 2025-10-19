import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react";

// Single-file AVL page: includes algorithm, history generation, UI and SVG renderer

let _id = 1;
const nextId = () => String(_id++);

function updateHeight(node) {
  node.height = Math.max(node.left ? node.left.height : 0, node.right ? node.right.height : 0) + 1;
}

function nodeHeight(node) {
  return node ? node.height : 0;
}

function balanceFactor(node) {
  return node ? nodeHeight(node.left) - nodeHeight(node.right) : 0;
}

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function pushState(history, root, props = {}) {
  const nodes = [];
  function walk(n) {
    if (!n) return;
    nodes.push({ id: n.id, value: n.value, left: n.left ? n.left.id : null, right: n.right ? n.right.id : null, height: n.height });
    walk(n.left);
    walk(n.right);
  }
  walk(root);
  history.push({ tree: { rootId: root ? root.id : null, nodes }, explanation: props.explanation || "", action: props.action || null, codeLine: props.codeLine || null, counters: props.counters || {}, highlight: props.highlight || { nodes: [] }, finished: !!props.finished });
}

function generateInsertHistory(valuesArray = []) {
  _id = 1;
  let root = null;
  const history = [];
  const counters = { rotations: 0, comparisons: 0 };

  function newNode(val) {
    return { id: nextId(), value: val, left: null, right: null, height: 1 };
  }

  function insert(node, key) {
    if (!node) {
      const n = newNode(key);
      if (!root) root = n;
      pushState(history, root, { explanation: `Inserted ${key} as new node`, action: 'insert', highlight: { nodes: [n.id] } });
      return n;
    }
    counters.comparisons++;
    if (key < node.value) {
      node.left = insert(node.left, key);
      pushState(history, root, { explanation: `Going left from ${node.value}`, codeLine: 4, highlight: { nodes: [node.id] } });
    } else {
      node.right = insert(node.right, key);
      pushState(history, root, { explanation: `Going right from ${node.value}`, codeLine: 6, highlight: { nodes: [node.id] } });
    }

    updateHeight(node);
    const balance = balanceFactor(node);

    if (balance > 1 && key < node.left.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Left case at ${node.value}, rotate right`, action: 'rotate-right', codeLine: 11, highlight: { nodes: [node.id, node.left.id] } });
      const res = rotateRight(node);
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }

    if (balance < -1 && key > node.right.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Right case at ${node.value}, rotate left`, action: 'rotate-left', codeLine: 13, highlight: { nodes: [node.id, node.right.id] } });
      const res = rotateLeft(node);
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }

    if (balance > 1 && key > node.left.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Right case at ${node.value}, rotate left then right`, action: 'rotate-left-right', highlight: { nodes: [node.id, node.left.id] } });
      node.left = rotateLeft(node.left);
      const res = rotateRight(node);
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }

    if (balance < -1 && key < node.right.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Left case at ${node.value}, rotate right then left`, action: 'rotate-right-left', highlight: { nodes: [node.id, node.right.id] } });
      node.right = rotateRight(node.right);
      const res = rotateLeft(node);
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }

    return node;
  }

  pushState(history, root, { explanation: 'Initial empty tree', codeLine: 1 });
  for (const v of valuesArray) {
    const key = Number(v);
    if (Number.isNaN(key)) { pushState(history, root, { explanation: `Skipping invalid input: ${v}` }); continue; }
    root = insert(root, key);
    pushState(history, root, { explanation: `Inserted ${key}. Updated heights and balances.`, counters: { ...counters } });
  }
  pushState(history, root, { explanation: 'All inserts complete', finished: true, counters: { ...counters } });
  return history;
}

function buildMap(nodes) { const map = new Map(); nodes.forEach((n) => map.set(n.id, { ...n })); return map; }
function buildTree(rootId, map) { if (!rootId) return null; const node = map.get(rootId); if (!node) return null; return { ...node, left: node.left ? buildTree(node.left, map) : null, right: node.right ? buildTree(node.right, map) : null }; }
function assignCoords(root) {
  let x = 0;
  function dfs(node, depth = 0) {
    if (!node) return;
    dfs(node.left, depth + 1);
    node._x = x++;
    node._y = depth;
    dfs(node.right, depth + 1);
  }
  dfs(root, 0);
}
function renderNodes(root, width, height = 400, orientation = 'top') {
  if (!root) return { nodes: [], edges: [] };

  // assign inorder indices (node._x) and depths (node._y)
  assignCoords(root);

  // collect all nodes and edges
  const all = [];
  const edges = [];
  function collect(n) {
    if (!n) return;
    all.push(n);
    if (n.left) edges.push({ from: n.id, to: n.left.id });
    if (n.right) edges.push({ from: n.id, to: n.right.id });
    collect(n.left);
    collect(n.right);
  }
  collect(root);

  // compute maximum inorder index and max depth
  const maxInorder = all.reduce((m, v) => Math.max(m, (v._x || 0)), 0);
  const maxDepth = all.reduce((m, v) => Math.max(m, (v._y || 0)), 0);
  const denom = Math.max(3, maxInorder + 2);

  // spacing parameters
  const verticalGap = 80;
  const horizontalGap = Math.max(60, width / (Math.max(3, maxDepth + 2)));

  let nodes = [];
  if (orientation === 'top') {
    nodes = all.map((n) => ({
      id: n.id,
      x: (n._x + 1) * (width / denom),
      y: 40 + (n._y || 0) * verticalGap,
      value: n.value,
      height: n.height,
    }));
    // mirror option removed — keep default behavior
  } else {
    // left orientation: x ~ depth, y ~ inorder index
    nodes = all.map((n) => ({
      id: n.id,
      x: 40 + (n._y || 0) * horizontalGap,
      y: (n._x + 1) * (height / denom),
      value: n.value,
      height: n.height,
    }));
    // mirror option removed — keep default behavior
  }

  return { nodes, edges };
}

// Generate history for inserts followed by an optional deletion operation
function generateHistoryWithDeletion(insertValues = [], deleteValue = null) {
  // First generate the insert history
  const history = generateInsertHistory(insertValues.map(String));

  if (deleteValue === null || history.length === 0) return history;

  // Reconstruct the latest root from the last snapshot
  const last = history[history.length - 1];
  const map = buildMap(last.tree.nodes || []);
  let root = buildTree(last.tree.rootId, map);

  const counters = { rotations: 0, comparisons: 0 };

  function deleteNode(node, key) {
    if (!node) {
      pushState(history, root, { explanation: `Value ${key} not found`, action: 'not-found' });
      return null;
    }
    counters.comparisons++;
    if (key < node.value) {
      node.left = deleteNode(node.left, key);
      pushState(history, root, { explanation: `Going left from ${node.value} to delete ${key}`, highlight: { nodes: [node.id] } });
    } else if (key > node.value) {
      node.right = deleteNode(node.right, key);
      pushState(history, root, { explanation: `Going right from ${node.value} to delete ${key}`, highlight: { nodes: [node.id] } });
    } else {
      // found node to delete
      pushState(history, root, { explanation: `Found ${key} at ${node.value}`, action: 'delete', highlight: { nodes: [node.id] } });
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right;
        if (!temp) {
          // no child
          if (node === root) root = null;
          pushState(history, root, { explanation: `Deleted leaf ${key}`, action: 'deleted' });
          return null;
        }
        // one child
        if (node === root) root = temp;
        pushState(history, root, { explanation: `Replace ${node.value} with child ${temp.value}`, action: 'deleted', highlight: { nodes: [temp.id] } });
        return temp;
      }

      // two children: get inorder successor (smallest in right subtree)
      let succ = node.right;
      while (succ.left) succ = succ.left;
      pushState(history, root, { explanation: `Replace ${node.value} with successor ${succ.value}`, action: 'replace', highlight: { nodes: [node.id, succ.id] } });
      node.value = succ.value;
      node.right = deleteNode(node.right, succ.value);
    }

    // update and rebalance
    updateHeight(node);
    const balance = balanceFactor(node);

    if (balance > 1 && balanceFactor(node.left) >= 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Left at ${node.value}, rotate right`, action: 'rotate-right', highlight: { nodes: [node.id, node.left.id] } });
      const res = rotateRight(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    if (balance > 1 && balanceFactor(node.left) < 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Right at ${node.value}, rotate left then right`, action: 'rotate-left-right', highlight: { nodes: [node.id, node.left.id] } });
      node.left = rotateLeft(node.left);
      const res = rotateRight(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    if (balance < -1 && balanceFactor(node.right) <= 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Right at ${node.value}, rotate left`, action: 'rotate-left', highlight: { nodes: [node.id, node.right.id] } });
      const res = rotateLeft(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    if (balance < -1 && balanceFactor(node.right) > 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Left at ${node.value}, rotate right then left`, action: 'rotate-right-left', highlight: { nodes: [node.id, node.right.id] } });
      node.right = rotateRight(node.right);
      const res = rotateLeft(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    return node;
  }

  // perform deletion
  root = deleteNode(root, Number(deleteValue));
  pushState(history, root, { explanation: `Deletion complete`, finished: true, counters: { ...counters } });
  return history;
}

// Generate insert steps starting from an existing tree snapshot (preserves existing node ids)
function generateInsertDiffFromSnapshot(treeSnapshot, key) {
  const map = buildMap(treeSnapshot.nodes || []);
  let root = buildTree(treeSnapshot.rootId, map);
  // ensure nextId doesn't collide
  const maxId = (treeSnapshot.nodes || []).reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);
  _id = Math.max(_id, maxId + 1);
  const history = [];

  function newNode(val) { return { id: nextId(), value: val, left: null, right: null, height: 1 }; }

  const counters = { rotations: 0, comparisons: 0 };

  function insert(node, key) {
    if (!node) {
      const n = newNode(key);
      if (!root) root = n;
      pushState(history, root, { explanation: `Inserted ${key} as new node`, action: 'insert', highlight: { nodes: [n.id] } });
      return n;
    }
    counters.comparisons++;
    if (key < node.value) {
      node.left = insert(node.left, key);
      pushState(history, root, { explanation: `Going left from ${node.value}`, highlight: { nodes: [node.id] } });
    } else {
      node.right = insert(node.right, key);
      pushState(history, root, { explanation: `Going right from ${node.value}`, highlight: { nodes: [node.id] } });
    }

    updateHeight(node);
    const balance = balanceFactor(node);
    if (balance > 1 && key < node.left.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Left case at ${node.value}, rotate right`, action: 'rotate-right', highlight: { nodes: [node.id, node.left.id] } });
      const res = rotateRight(node);
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }
    if (balance < -1 && key > node.right.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Right case at ${node.value}, rotate left`, action: 'rotate-left', highlight: { nodes: [node.id, node.right.id] } });
      const res = rotateLeft(node);
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }
    if (balance > 1 && key > node.left.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Right case at ${node.value}, rotate left then right`, action: 'rotate-left-right', highlight: { nodes: [node.id, node.left.id] } });
      node.left = rotateLeft(node.left);
      const res = rotateRight(node);
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }
    if (balance < -1 && key < node.right.value) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Left case at ${node.value}, rotate right then left`, action: 'rotate-right-left', highlight: { nodes: [node.id, node.right.id] } });
      node.right = rotateRight(node.right);
      const res = rotateLeft(node);
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      if (node === root) root = res;
      return res;
    }
    return node;
  }

  pushState(history, root, { explanation: 'Preview before insert' });
  insert(root, key);
  pushState(history, root, { explanation: `Inserted ${key}`, finished: true, counters: { ...counters } });
  return history;
}

// Generate deletion steps starting from existing snapshot (preserves ids)
function generateDeleteDiffFromSnapshot(treeSnapshot, key) {
  const map = buildMap(treeSnapshot.nodes || []);
  let root = buildTree(treeSnapshot.rootId, map);
  const maxId = (treeSnapshot.nodes || []).reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);
  _id = Math.max(_id, maxId + 1);
  const history = [];
  const counters = { rotations: 0, comparisons: 0 };

  function deleteNode(node, key) {
    if (!node) {
      pushState(history, root, { explanation: `Value ${key} not found`, action: 'not-found' });
      return null;
    }
    counters.comparisons++;
    if (key < node.value) {
      node.left = deleteNode(node.left, key);
      pushState(history, root, { explanation: `Going left from ${node.value} to delete ${key}`, highlight: { nodes: [node.id] } });
    } else if (key > node.value) {
      node.right = deleteNode(node.right, key);
      pushState(history, root, { explanation: `Going right from ${node.value} to delete ${key}`, highlight: { nodes: [node.id] } });
    } else {
      pushState(history, root, { explanation: `Found ${key} at ${node.value}`, action: 'delete', highlight: { nodes: [node.id] } });
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right;
        if (!temp) {
          if (node === root) root = null;
          pushState(history, root, { explanation: `Deleted leaf ${key}`, action: 'deleted' });
          return null;
        }
        if (node === root) root = temp;
        pushState(history, root, { explanation: `Replace ${node.value} with child ${temp.value}`, action: 'deleted', highlight: { nodes: [temp.id] } });
        return temp;
      }

      let succ = node.right;
      while (succ.left) succ = succ.left;
      pushState(history, root, { explanation: `Replace ${node.value} with successor ${succ.value}`, action: 'replace', highlight: { nodes: [node.id, succ.id] } });
      node.value = succ.value;
      node.right = deleteNode(node.right, succ.value);
    }

    updateHeight(node);
    const balance = balanceFactor(node);

    if (balance > 1 && balanceFactor(node.left) >= 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Left at ${node.value}, rotate right`, action: 'rotate-right', highlight: { nodes: [node.id, node.left.id] } });
      const res = rotateRight(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    if (balance > 1 && balanceFactor(node.left) < 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Left-Right at ${node.value}, rotate left then right`, action: 'rotate-left-right', highlight: { nodes: [node.id, node.left.id] } });
      node.left = rotateLeft(node.left);
      const res = rotateRight(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    if (balance < -1 && balanceFactor(node.right) <= 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Right at ${node.value}, rotate left`, action: 'rotate-left', highlight: { nodes: [node.id, node.right.id] } });
      const res = rotateLeft(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    if (balance < -1 && balanceFactor(node.right) > 0) {
      counters.rotations++;
      pushState(history, root, { explanation: `Right-Left at ${node.value}, rotate right then left`, action: 'rotate-right-left', highlight: { nodes: [node.id, node.right.id] } });
      node.right = rotateRight(node.right);
      const res = rotateLeft(node);
      if (node === root) root = res;
      pushState(history, res, { explanation: `Double rotation complete`, action: 'rotated', highlight: { nodes: [res.id] } });
      return res;
    }

    return node;
  }

  pushState(history, root, { explanation: 'Preview before delete' });
  root = deleteNode(root, Number(key));
  pushState(history, root, { explanation: `Deletion complete`, finished: true, counters: { ...counters } });
  return history;
}

const pseudocode = [
  { l: 1, text: 'function insert(node, key) {' },
  { l: 2, text: '  if node == null: return new Node(key)' },
  { l: 3, text: '  if key < node.value: node.left = insert(node.left, key)' },
  { l: 4, text: '  else: node.right = insert(node.right, key)' },
  { l: 5, text: '  updateHeight(node)' },
  { l: 6, text: '  balance = height(left) - height(right)' },
  { l: 7, text: '  if balance > 1 and key < node.left.value: return rotateRight(node)' },
  { l: 8, text: '  if balance < -1 and key > node.right.value: return rotateLeft(node)' },
  { l: 9, text: '  if balance > 1 and key > node.left.value: node.left = rotateLeft(node.left); return rotateRight(node)' },
  { l: 10, text: '  if balance < -1 and key < node.right.value: node.right = rotateRight(node.right); return rotateLeft(node)' },
  { l: 11, text: '  return node' },
  { l: 12, text: '}' },
];

const DEFAULT_SPEED = 600;

const AVLTreePage = () => {
  const [input, setInput] = useState("30,20,40,10,25,35,50");
  const [values, setValues] = useState(input.split(",").map((s) => Number(s.trim())).filter(Boolean));
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [insertValue, setInsertValue] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  
  const [orientation, setOrientation] = useState('top');
  const [speed] = useState(DEFAULT_SPEED);
  const autoPlayTimer = React.useRef(null);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [traversalIndex, setTraversalIndex] = useState(-1);
  const traversalTimerRef = React.useRef(null);
  const [traversalType, setTraversalType] = useState('inorder');
  const [traversalExplanation, setTraversalExplanation] = useState("");

  const regenerate = (vals) => {
    const arr = vals.map(String);
    const h = generateInsertHistory(arr);
    setHistory(h);
    // show the final completed snapshot immediately
    setCurrentStep(h.length > 0 ? h.length - 1 : -1);
    setIsPlaying(false);
  };

  // helper to autoplay from startIndex to endIndex once, then stop (paused at endIndex)
  const runAutoPlayOnce = (startIndex, endIndex) => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
    setCurrentStep(startIndex);
    let idx = startIndex;
    autoPlayTimer.current = setInterval(() => {
      idx += 1;
      setCurrentStep(idx);
      if (idx >= endIndex) {
        clearInterval(autoPlayTimer.current);
        autoPlayTimer.current = null;
        setIsPlaying(false);
      }
    }, Math.max(50, speed));
  };

  const load = () => {
    const arr = input.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    setValues(arr);
    regenerate(arr);
  };

  const handleInsert = () => {
    const n = Number(insertValue);
    if (Number.isNaN(n)) return;
    const next = [...values, n];
    // pre-change snapshot so UI doesn't flicker when jumping
    // build histories: prefer diff from current snapshot if available to preserve ids
    let pre = [];
    let h = [];
    if (currentStep >= 0 && history[currentStep] && history[currentStep].tree) {
      pre = [history[currentStep]];
      h = generateInsertDiffFromSnapshot(history[currentStep].tree, n);
    } else {
      pre = generateInsertHistory(values.map(String));
      h = generateInsertHistory(next.map(String));
    }
    const previewTree = pre.length ? pre[pre.length - 1].tree : (h[0] ? h[0].tree : { rootId: null, nodes: [] });
    const combined = [...pre, { tree: previewTree, explanation: 'Preview before insert', action: 'pre-insert' }, ...h];
    setValues(next);
    setInput(next.join(','));
  setHistory(combined);
    // autoplay from preview index up to final, then pause at final
    const startIndex = pre.length; // preview index in combined
    const endIndex = combined.length - 1;
    // show preview immediately
    setCurrentStep(startIndex);
    setIsPlaying(false);
    // delay starting autoplay one tick so history state is settled, then run
    setTimeout(() => runAutoPlayOnce(startIndex, endIndex), 20);
    setInsertValue('');
  };

  const handleDelete = () => {
    const n = Number(deleteValue);
    if (Number.isNaN(n)) return;
    const idx = values.indexOf(n);
    let pre = [];
    let h = [];
    if (currentStep >= 0 && history[currentStep] && history[currentStep].tree) {
      pre = [history[currentStep]];
      h = generateDeleteDiffFromSnapshot(history[currentStep].tree, n);
    } else {
      pre = generateInsertHistory(values.map(String));
      h = generateHistoryWithDeletion(values, n);
    }
    if (idx === -1) {
      // not found — show a message snapshot
      const nf = [...pre, { tree: pre[pre.length - 1].tree, explanation: `Value ${n} not found in tree`, action: 'not-found', finished: true }];
      setHistory(nf);
      setCurrentStep(nf.length - 1);
      setIsPlaying(false);
      setDeleteValue('');
      return;
    }
    const next = values.slice(0, idx).concat(values.slice(idx + 1));
    // prepend a small pre-change snapshot to avoid flicker
    const previewTree = pre.length ? pre[pre.length - 1].tree : (h[0] ? h[0].tree : { rootId: null, nodes: [] });
    const combined = [...pre, { tree: previewTree, explanation: 'Preview before delete', action: 'pre-delete' }, ...h];
    setValues(next);
    setInput(next.join(','));
    setHistory(combined);
    if (h.length > 0) {
      // start from preview (pre.length) and autoplay to final
      const startIndex = pre.length; // index of preview in combined
      const endIndex = combined.length - 1;
      // show preview immediately
      setCurrentStep(startIndex);
      setIsPlaying(false);
      // delay run so history is visible immediately
      setTimeout(() => runAutoPlayOnce(startIndex, endIndex), 20);
    } else {
      setCurrentStep(-1);
      setIsPlaying(false);
    }
    setDeleteValue('');
  };

  

  const reset = () => {
    setHistory([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setInput("");
    setValues([]);
    // stop any running traversal timers
    if (traversalTimerRef.current) { clearInterval(traversalTimerRef.current); traversalTimerRef.current = null; }
    if (autoPlayTimer.current) { clearInterval(autoPlayTimer.current); autoPlayTimer.current = null; }
    setTraversalIndex(-1);
    setTraversalOrder([]);
  };

  const stepForward = useCallback(() => setCurrentStep((p) => Math.min(p + 1, history.length - 1)), [history.length]);
  const stepBackward = useCallback(() => setCurrentStep((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentStep((p) => {
        if (p >= history.length - 1) { setIsPlaying(false); return p; }
        return p + 1;
      });
    }, Math.max(50, speed));
    return () => clearInterval(id);
  }, [isPlaying, speed, history.length]);

  useEffect(() => {
    const handleKey = (e) => { if (history.length === 0) return; if (e.key === "ArrowRight") stepForward(); if (e.key === "ArrowLeft") stepBackward(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [history.length, stepForward, stepBackward]);

  useEffect(() => {
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
        autoPlayTimer.current = null;
      }
    };
  }, []);

  // inorder traversal helper
  function computeInorderOrder(tree) {
    const map = buildMap(tree.nodes || []);
    const root = buildTree(tree.rootId, map);
    const out = [];
    function dfs(n) { if (!n) return; dfs(n.left); out.push(n.id); dfs(n.right); }
    dfs(root);
    return out;
  }

  function computePreorderOrder(tree) {
    const map = buildMap(tree.nodes || []);
    const root = buildTree(tree.rootId, map);
    const out = [];
    function dfs(n) { if (!n) return; out.push(n.id); dfs(n.left); dfs(n.right); }
    dfs(root);
    return out;
  }

  function computePostorderOrder(tree) {
    const map = buildMap(tree.nodes || []);
    const root = buildTree(tree.rootId, map);
    const out = [];
    function dfs(n) { if (!n) return; dfs(n.left); dfs(n.right); out.push(n.id); }
    dfs(root);
    return out;
  }

  function computeLevelOrder(tree) {
    const map = buildMap(tree.nodes || []);
    const root = buildTree(tree.rootId, map);
    const out = [];
    if (!root) return out;
    const q = [root];
    while (q.length) {
      const cur = q.shift();
      out.push(cur.id);
      if (cur.left) q.push(cur.left);
      if (cur.right) q.push(cur.right);
    }
    return out;
  }

  function computeTraversal(tree, type = 'inorder') {
    if (!tree) return [];
    if (type === 'preorder') return computePreorderOrder(tree);
    if (type === 'postorder') return computePostorderOrder(tree);
    if (type === 'level') return computeLevelOrder(tree);
    return computeInorderOrder(tree);
  }

  function startTraversalFrom(nodeId) {
    if (!state || !state.tree) return;
    const order = computeTraversal(state.tree, traversalType);
    // rotate order so it starts from nodeId
    const idx = order.indexOf(nodeId);
    if (idx === -1) return;
    const rotated = [...order.slice(idx), ...order.slice(0, idx)];
    setTraversalOrder(rotated);
    setTraversalIndex(0);
  // slightly slower traversal interval for readability
  const interval = Math.max(500, Math.floor(speed * 0.8));
    if (traversalTimerRef.current) { clearInterval(traversalTimerRef.current); traversalTimerRef.current = null; }
    traversalTimerRef.current = setInterval(() => {
      setTraversalIndex((i) => {
        if (i >= rotated.length - 1) {
          clearInterval(traversalTimerRef.current);
          traversalTimerRef.current = null;
          // clear highlights shortly after finishing
          setTimeout(() => { setTraversalIndex(-1); setTraversalOrder([]); setTraversalExplanation(""); }, 400);
          return i;
        }
        return i + 1;
      });
    }, interval);
  }

  function stopTraversal() {
    if (traversalTimerRef.current) { clearInterval(traversalTimerRef.current); traversalTimerRef.current = null; }
    setTraversalIndex(-1);
    setTraversalOrder([]);
  }

  // start traversal over the whole tree (from root) using selected traversal type
  function startFullTraversal() {
    if (!state || !state.tree || !state.tree.nodes || state.tree.nodes.length === 0) {
      // no tree loaded — show a short explanatory snapshot
      const msg = [{ tree: { rootId: null, nodes: [] }, explanation: 'No tree to traverse. Please Load or click Visualize to build a tree first.', finished: true }];
      setHistory(msg);
      setCurrentStep(0);
      return;
    }
    const order = computeTraversal(state.tree, traversalType);
    if (!order || order.length === 0) return;
    // set a helpful explanation for the chosen traversal
    const traversalDescriptions = {
      inorder: 'Inorder traversal: Left → Root → Right. Visits nodes in ascending order for BSTs.',
      preorder: 'Preorder traversal: Root → Left → Right. Useful for copying the tree structure.',
      postorder: 'Postorder traversal: Left → Right → Root. Useful for deleting or freeing the tree.',
      level: 'Level-order traversal: Visits nodes level by level (breadth-first).'
    };
    setTraversalExplanation(traversalDescriptions[traversalType] || 'Traversal running...');
    setTraversalOrder(order);
    setTraversalIndex(0);
  const interval = Math.max(500, Math.floor(speed * 0.8));
    if (traversalTimerRef.current) { clearInterval(traversalTimerRef.current); traversalTimerRef.current = null; }
    traversalTimerRef.current = setInterval(() => {
      setTraversalIndex((i) => {
        if (i >= order.length - 1) {
          clearInterval(traversalTimerRef.current);
          traversalTimerRef.current = null;
          setTimeout(() => { setTraversalIndex(-1); setTraversalOrder([]); setTraversalExplanation(""); }, 400);
          return i;
        }
        return i + 1;
      });
    }, interval);
  }

  // Auto-load the default input on first mount so the page isn't blank
  useEffect(() => {
    try {
      load();
    } catch (e) {
      // swallow errors to avoid breaking render
      // console.error('AVL load error', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = history[currentStep] || null;

  const svgWidth = 900; const svgHeight = 480;
  let svgContent = <div className="flex items-center justify-center text-gray-400 h-64">No tree to display</div>;
  if (state && state.tree && state.tree.nodes) {
    const map = buildMap(state.tree.nodes);
    const rootId = state.tree.rootId;
    const root = buildTree(rootId, map);
    const { nodes, edges } = renderNodes(root, svgWidth - 40, svgHeight - 40, orientation);
    const coords = new Map(nodes.map((n) => [n.id, n]));

    // compute previous coordinates to animate movements along arcs for rotation steps
    const prevCoords = new Map();
    if (currentStep > 0 && history[currentStep - 1] && history[currentStep - 1].tree) {
      const prevMap = buildMap(history[currentStep - 1].tree.nodes || []);
      const prevRoot = buildTree(history[currentStep - 1].tree.rootId, prevMap);
      const prevRender = renderNodes(prevRoot, svgWidth - 40, svgHeight - 40, orientation);
      (prevRender.nodes || []).forEach((n) => prevCoords.set(n.id, n));
    }

    svgContent = (
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="bg-gray-900 rounded">
        <g transform="translate(20,0)">
          {edges.map((e) => {
            const a = coords.get(e.from); const b = coords.get(e.to); if (!a || !b) return null;
            // quadratic curve: control point halfway, offset in y (for top orientation) or x (for left)
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const ctrlX = orientation === 'top' ? mx : mx - 30;
            const ctrlY = orientation === 'top' ? my - 20 : my;
            const d = `M ${a.x} ${a.y} Q ${ctrlX} ${ctrlY} ${b.x} ${b.y}`;
            return <path key={`${e.from}-${e.to}`} d={d} fill="none" stroke="#4b5563" strokeWidth={2} strokeLinecap="round" />;
          })}

          {nodes.map((n) => {
            const prev = prevCoords.get(n.id);
            // if previous exists and position changed, render an invisible path and animate via CSS translate of a marker
            const isTraversed = traversalOrder && traversalIndex >= 0 && traversalOrder[traversalIndex] === n.id;
            if (prev && (prev.x !== n.x || prev.y !== n.y) && (state.action && state.action.startsWith('rotate'))) {
              // compute a quadratic path
              const mx = (prev.x + n.x) / 2;
              const my = (prev.y + n.y) / 2 - 30; // arc upwards
              const d = `M ${prev.x} ${prev.y} Q ${mx} ${my} ${n.x} ${n.y}`;
              return (
                <g key={n.id}>
                    <path d={d} fill="none" stroke="transparent" />
                    <g style={{ transform: `translate(${prev.x}px, ${prev.y}px)`, transition: `transform ${Math.max(200, speed)}ms ease` }}>
                      <circle r={18} fill={isTraversed ? '#1f2937' : '#111827'} stroke={isTraversed ? '#f97316' : '#7c3aed'} strokeWidth={2} />
                      <text x={-8} y={6} className="fill-current text-white font-mono" style={{ fontSize: 12 }}>{n.value}</text>
                      <text x={20} y={6} className="fill-current text-gray-400" style={{ fontSize: 10 }}>{n.height}</text>
                    </g>
                  </g>
              );
            }
            return (
              <g key={n.id} style={{ transform: `translate(${n.x}px, ${n.y}px)`, transition: `transform ${Math.max(200, speed)}ms ease` }}>
                <circle r={18} fill={isTraversed ? '#1f2937' : '#111827'} stroke={isTraversed ? '#f97316' : '#7c3aed'} strokeWidth={2} />
                <text x={-8} y={6} className="fill-current text-white font-mono" style={{ fontSize: 12 }}>{n.value}</text>
                <text x={20} y={6} className="fill-current text-gray-400" style={{ fontSize: 10 }}>{n.height}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-purple-400 flex items-center justify-center gap-3">AVL Tree Visualizer</h1>
  <p className="text-lg text-gray-400 mt-2">Interactive AVL visualizer — insertions, deletions, automatic rotations (LL, RR, LR, RL), and traversal walkthroughs.</p>
      </header>

      <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/4 bg-gray-800 p-3 rounded">
            <div className="flex gap-2 mb-3">
              <input id="avl-input" value={input} onChange={(e) => setInput(e.target.value)} className="bg-gray-700 px-3 py-2 rounded flex-grow text-sm text-gray-200" />
              <button onClick={load} className="px-3 py-2 bg-purple-600 rounded text-sm">Load</button>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              <div className="flex gap-2">
                <input placeholder="Insert value" value={insertValue} onChange={(e) => setInsertValue(e.target.value)} className="bg-gray-700 px-3 py-2 rounded text-sm text-gray-200 flex-1" />
                <button onClick={handleInsert} className="px-3 py-2 bg-emerald-600 rounded text-sm">Insert</button>
              </div>
              <div className="flex gap-2">
                <input placeholder="Delete value" value={deleteValue} onChange={(e) => setDeleteValue(e.target.value)} className="bg-gray-700 px-3 py-2 rounded text-sm text-gray-200 flex-1" />
                <button onClick={handleDelete} className="px-3 py-2 bg-red-600 rounded text-sm">Delete</button>
              </div>
              <div className="flex gap-2">
                <select value={traversalType} onChange={(e) => setTraversalType(e.target.value)} className="bg-gray-700 px-3 py-2 rounded text-sm flex-1">
                  <option value="inorder">Inorder</option>
                  <option value="preorder">Preorder</option>
                  <option value="postorder">Postorder</option>
                  <option value="level">Level-order</option>
                </select>
                <button onClick={startFullTraversal} className="px-3 py-2 bg-blue-600 rounded text-sm">Start</button>
              </div>
                {traversalExplanation ? <div className="text-xs text-gray-400 mt-1">{traversalExplanation}</div> : null}
            </div>

            <div className="flex flex-col gap-2 mb-3">
              <button
                onClick={() => {
                  // parse input and generate a fresh insert history, then autoplay from start
                  const arr = input.split(",").map((s) => s.trim()).filter((s) => s !== "").map((s) => Number(s)).filter((n) => !Number.isNaN(n)).map(String);
                  if (!arr || arr.length === 0) {
                    const msg = [{ tree: { rootId: null, nodes: [] }, explanation: 'Input is empty or invalid. Enter numbers separated by commas, then click Visualize or Load.', finished: true }];
                    setHistory(msg);
                    setCurrentStep(0);
                    return;
                  }
                  // clear any running timers
                  if (autoPlayTimer.current) { clearInterval(autoPlayTimer.current); autoPlayTimer.current = null; }
                  if (traversalTimerRef.current) { clearInterval(traversalTimerRef.current); traversalTimerRef.current = null; }
                  const h = generateInsertHistory(arr);
                  setHistory(h);
                  // autoplay from 0 to final snapshot
                  if (h.length > 0) {
                    setCurrentStep(0);
                    setIsPlaying(false);
                    // start autoplay once from start to end
                    setTimeout(() => runAutoPlayOnce(0, h.length - 1), 30);
                  }
                }}
                className="w-full px-3 py-2 bg-indigo-600 rounded text-sm"
              >
                Visualize
              </button>
            </div>

            {/* Speed selector removed — using normal/default speed */}

            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs text-gray-400">Orientation</label>
              <select value={orientation} onChange={(e) => setOrientation(e.target.value)} className="bg-gray-700 px-2 py-1 rounded text-sm">
                <option value="top">Root at Top</option>
                <option value="left">Root at Left</option>
              </select>
              <div className="ml-3 flex items-center gap-2">
                <button onClick={reset} className="px-2 py-1 bg-gray-700 rounded text-sm"><RefreshCcw /></button>
                <div className="text-xs text-gray-300">{history && history.length > 0 ? `${currentStep >= 0 ? currentStep + 1 : 0}/${history.length}` : `0/0`}</div>
              </div>
            </div>

            <div className="bg-gray-900 p-3 rounded text-sm text-gray-300">
              <div className="font-mono text-xs text-gray-400 mb-2">Explanation</div>
              <div className="min-h-[80px] max-h-28 overflow-auto text-sm">{state ? state.explanation : 'Load data to start visualization.'}</div>
            </div>

            <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 mt-3">
              <div className="font-mono text-xs text-gray-400 mb-2">Pseudocode</div>
              <div className="text-xs font-mono text-gray-200">
                {pseudocode.map((line) => (
                  <div key={line.l} className={`${state && state.codeLine === line.l ? 'bg-blue-500/20' : ''} px-2 py-0.5`}>{line.l}. {line.text}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:flex-1 bg-gray-800 p-3 rounded flex flex-col">
            <div className="mb-2 text-sm text-gray-400">AVL Tree</div>
            <div className="flex-1 overflow-auto">{svgContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AVLTreePage;
