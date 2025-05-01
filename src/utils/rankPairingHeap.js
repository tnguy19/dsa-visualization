export class RankPairingHeap {
  constructor() {
    this.roots = [];
    this.nextId = 1;
  }
  
  findMin() {
    if (this.roots.length === 0) return null;
    return this.roots[0];
  }
  
  insert(key) {
    const newNode = {
      key: key,
      left: null,
      right: null,
      rank: 0,
      id: this.nextId++
    };
    
    if (this.roots.length === 0 || key < this.roots[0].key) {
      this.roots.unshift(newNode);
    } else {
      this.roots.push(newNode);
    }
    
    return newNode;
  }
  
  union(otherHeap) {
    if (otherHeap.roots.length === 0) return;
    
    if (this.roots.length === 0) {
      this.roots = [...otherHeap.roots];
      return;
    }
    
    if (otherHeap.roots[0].key < this.roots[0].key) {
      this.roots = [...otherHeap.roots, ...this.roots];
    } else {
      this.roots = [...this.roots, ...otherHeap.roots];
    }
  }
  
  removeMin() {
    if (this.roots.length === 0) return null;
    
    const minNode = this.roots.shift();
    
    if (minNode.left) {
      this.addHalfTreeToRoots(minNode.left);
    }
    
    this.onePassLinking();
    
    return minNode;
  }
  
  decreaseKey(oldKey, newKey) {
    if (newKey >= oldKey) {
      return false;
    }
    
    const result = this.findNodeByKey(oldKey);
    if (!result) {
      return false;
    }
    
    const { node, parent, isLeftChild, prevSibling } = result;
    
    node.key = newKey;
    
    if (!parent) {
      this.roots.sort((a, b) => a.key - b.key);
      return true;
    }
    
    const rightSubtree = node.right;
    node.right = null;
    
    if (isLeftChild) {
      parent.left = rightSubtree;
    } else if (prevSibling) {
      prevSibling.right = rightSubtree;
    }
    
    if (this.roots.length === 0 || newKey < this.roots[0].key) {
      this.roots.unshift(node);
    } else {
      this.roots.push(node);
    }
    
    this.recalculateRanksUpward(parent);
    
    return true;
  }
  
  findNodeByKey(key) {
    for (let i = 0; i < this.roots.length; i++) {
      const root = this.roots[i];
      
      if (root.key === key) {
        return { node: root, parent: null, isLeftChild: false, prevSibling: null };
      }
      
      const result = this.findNodeInSubtree(root, key, null, true, null);
      if (result) {
        return result;
      }
    }
    
    return null;
  }
  
  findNodeInSubtree(node, key, parent, isLeftChild, prevSibling) {
    if (!node) return null;
    
    if (node.key === key) {
      return { node, parent, isLeftChild, prevSibling };
    }
    
    if (node.left) {
      const result = this.findNodeInSubtree(node.left, key, node, true, null);
      if (result) {
        return result;
      }
      
      let current = node.left;
      let prev = null;
      
      while (current.right) {
        prev = current;
        current = current.right;
        
        if (current.key === key) {
          return { node: current, parent: node, isLeftChild: false, prevSibling: prev };
        }
        
        const result = this.findNodeInSubtree(current, key, node, false, prev);
        if (result) {
          return result;
        }
      }
    }
    
    return null;
  }
  
  recalculateRanksUpward(node) {
    if (!node) return;
    
    const oldRank = node.rank;
    this.updateRank(node);
    
    if (oldRank === node.rank) {
      return;
    }
    
    for (const root of this.roots) {
      if (this.findParentInSubtree(root, node)) {
        return;
      }
    }
  }
  
  findParentInSubtree(node, targetChild) {
    if (!node || !targetChild) return false;
    
    if (node.left === targetChild || 
       (node.left && this.isSibling(node.left, targetChild))) {
      const oldRank = node.rank;
      this.updateRank(node);
      
      if (oldRank !== node.rank) {
        this.recalculateRanksUpward(node);
      }
      
      return true;
    }
    
    if (node.left) {
      if (this.findParentInSubtree(node.left, targetChild)) {
        return true;
      }
      
      let current = node.left.right;
      while (current) {
        if (this.findParentInSubtree(current, targetChild)) {
          return true;
        }
        current = current.right;
      }
    }
    
    return false;
  }
  
  isSibling(startNode, targetNode) {
    let current = startNode;
    while (current && current.right) {
      current = current.right;
      if (current === targetNode) {
        return true;
      }
    }
    return false;
  }
  
  addHalfTreeToRoots(node) {
    if (!node) return;
    
    let current = node;
    let next = null;
    
    while (current) {
      next = current.right;
      current.right = null;
      this.roots.push(current);
      current = next;
    }
  }
  
  onePassLinking() {
    if (this.roots.length <= 1) return;
    
    const rankBuckets = new Map();
    const processedRoots = [];
    
    const rootsToProcess = [...this.roots];
    this.roots = [];
    
    for (const root of rootsToProcess) {
      if (!root) continue;
      
      let currentTree = root;
      let currentRank = currentTree.rank;
      
      if (rankBuckets.has(currentRank)) {
        const sameRankTree = rankBuckets.get(currentRank);
        rankBuckets.delete(currentRank);
        
        const linkedTree = this.linkTrees(currentTree, sameRankTree);
        
        processedRoots.push(linkedTree);
      } else {
        rankBuckets.set(currentRank, currentTree);
      }
    }
    
    for (const tree of rankBuckets.values()) {
      processedRoots.push(tree);
    }
    
    processedRoots.sort((a, b) => a.key - b.key);
    this.roots = processedRoots;
  }
  
  linkTrees(tree1, tree2) {
    const [parent, child] = (tree1.key <= tree2.key) ? 
      [tree1, tree2] : [tree2, tree1];
    
    if (!parent.left) {
      parent.left = child;
    } else {
      let rightmost = parent.left;
      while (rightmost.right) {
        rightmost = rightmost.right;
      }
      rightmost.right = child;
    }
    
    child.right = null;
    
    this.updateRank(parent);
    
    return parent;
  }
  
  updateRank(node) {
    if (!node) return 0;
    
    if (!node.left) {
      node.rank = 0;
    } else {
      const childRanks = this.getChildRanks(node);
      
      if (childRanks.length === 0) {
        node.rank = 0;
      } else if (childRanks.length === 1) {
        node.rank = childRanks[0] + 1;
      } else {
        childRanks.sort((a, b) => b - a);
        
        const highestRank = childRanks[0];
        const secondHighestRank = childRanks[1];
        
        const diff = highestRank - secondHighestRank;
        
        if (diff <= 1) {
          node.rank = highestRank + 1;
        } else {
          node.rank = highestRank;
        }
      }
    }
    
    return node.rank;
  }
  
  getChildRanks(node) {
    if (!node || !node.left) return [];
    
    const ranks = [];
    let child = node.left;
    
    while (child) {
      ranks.push(child.rank);
      child = child.right;
    }
    
    return ranks;
  }
  
  getChildren(node) {
    if (!node || !node.left) return [];
    
    const children = [];
    let child = node.left;
    
    while (child) {
      children.push(child);
      child = child.right;
    }
    
    return children;
  }
  
  createRemoveMinSteps() {
    if (this.roots.length === 0) return [];
    
    const steps = [];
    const originalRoots = [...this.roots];
    
    steps.push({
      message: `Found minimum node with key ${originalRoots[0].key}`,
      trees: [...originalRoots]
    });
    
    const minNode = originalRoots[0];
    const rootsAfterRemove = originalRoots.slice(1);
    
    steps.push({
      message: `Removed minimum node with key ${minNode.key}`,
      trees: [...rootsAfterRemove]
    });
    
    const childrenRoots = [];
    if (minNode.left) {
      let current = minNode.left;
      while (current) {
        const nodeCopy = {
          key: current.key,
          left: current.left,
          right: null,
          rank: current.rank,
          id: current.id
        };
        childrenRoots.push(nodeCopy);
        current = current.right;
      }
    }
    
    const combinedRoots = [...childrenRoots, ...rootsAfterRemove];
    steps.push({
      message: `Added ${childrenRoots.length} children to the root list`,
      trees: combinedRoots
    });
    
    const linkingSteps = this.createPairwiseMergeSteps(combinedRoots);
    steps.push(...linkingSteps);
    
    this.removeMin();
    
    return steps;
  }
  
  createPairwiseMergeSteps(roots) {
    if (roots.length <= 1) return [];
    
    const steps = [];
    const rankBuckets = new Map();
    const finalRoots = [];
    
    steps.push({
      message: 'Starting one-pass linking',
      trees: [...roots]
    });
    
    const rootsCopy = roots.map(root => ({
      ...root,
      left: root.left,
      right: root.right
    }));
    
    for (const root of rootsCopy) {
      if (!root) continue;
      
      let currentRank = root.rank;
      
      if (rankBuckets.has(currentRank)) {
        const sameRankRoot = rankBuckets.get(currentRank);
        rankBuckets.delete(currentRank);
        
        const currentTrees = this.getTreesSnapshot(rankBuckets, finalRoots, root, sameRankRoot);
        steps.push({
          message: `Linking trees with rank ${currentRank}: keys ${root.key} and ${sameRankRoot.key}`,
          trees: currentTrees
        });
        
        const linkedRoot = this.simulateLinkTrees(root, sameRankRoot);
        
        finalRoots.push(linkedRoot);
        
        steps.push({
          message: `Linked into new tree with rank ${linkedRoot.rank} and key ${linkedRoot.key}`,
          trees: this.getTreesSnapshot(rankBuckets, finalRoots)
        });
      } else {
        rankBuckets.set(currentRank, root);
        
        steps.push({
          message: `Added tree with key ${root.key} to rank ${currentRank} bucket`,
          trees: this.getTreesSnapshot(rankBuckets, finalRoots)
        });
      }
    }
    
    for (const tree of rankBuckets.values()) {
      finalRoots.push(tree);
    }
    
    finalRoots.sort((a, b) => a.key - b.key);
    
    steps.push({
      message: 'One-pass linking complete',
      trees: [...finalRoots]
    });
    
    return steps;
  }
  
  getTreesSnapshot(buckets, finals, ...additionalTrees) {
    const snapshot = [...finals];
    
    for (const tree of buckets.values()) {
      snapshot.push(tree);
    }
    
    for (const tree of additionalTrees) {
      if (tree) snapshot.push(tree);
    }
    
    return snapshot;
  }
  
  simulateLinkTrees(tree1, tree2) {
    const [parent, child] = (tree1.key <= tree2.key) ? 
      [tree1, tree2] : [tree2, tree1];
    
    const parentCopy = {
      ...parent,
      left: parent.left
    };
    
    if (!parentCopy.left) {
      parentCopy.left = child;
    } else {
      const children = this.getChildren(parentCopy);
      
      parentCopy.left = this.recreateChildrenWithNewChild(parent.left, child);
    }
    
    this.updateRank(parentCopy);
    
    return parentCopy;
  }
  
  recreateChildrenWithNewChild(leftChild, newChild) {
    if (!leftChild) return newChild;
    
    const leftCopy = {
      ...leftChild,
      left: leftChild.left,
      right: null
    };
    
    if (leftChild.right) {
      leftCopy.right = this.recreateChildrenWithNewChild(leftChild.right, newChild);
    } else {
      leftCopy.right = newChild;
    }
    
    return leftCopy;
  }
  
  createDecreaseKeySteps(oldKey, newKey) {
    const steps = [];
    
    const result = this.findNodeByKey(oldKey);
    if (!result) {
      steps.push({
        message: `Node with key ${oldKey} not found`,
        trees: [...this.roots]
      });
      return steps;
    }
    
    const { node, parent, isLeftChild, prevSibling } = result;
    
    steps.push({
      message: `Found node with key ${oldKey}`,
      trees: [...this.roots],
      highlight: node
    });
    
    const originalNode = { ...node };
    node.key = newKey;
    
    steps.push({
      message: `Decreased key from ${oldKey} to ${newKey}`,
      trees: [...this.roots],
      highlight: node
    });
    
    if (!parent) {
      this.roots.sort((a, b) => a.key - b.key);
      
      steps.push({
        message: `Node is already a root, reordered root list`,
        trees: [...this.roots],
        highlight: node
      });
      
      return steps;
    }
    
    const rightSubtree = node.right;
    node.right = null;
    
    steps.push({
      message: `Separated right subtree from the node`,
      trees: [...this.roots],
      highlight: node
    });
    
    if (isLeftChild) {
      parent.left = rightSubtree;
    } else if (prevSibling) {
      prevSibling.right = rightSubtree;
    }
    
    const intermediateRoots = [...this.roots];
    
    steps.push({
      message: `Moved right subtree to node's original position`,
      trees: intermediateRoots
    });
    
    if (this.roots.length === 0 || newKey < this.roots[0].key) {
      this.roots.unshift(node);
    } else {
      this.roots.push(node);
    }
    
    steps.push({
      message: `Added node with its left subtree to the root list`,
      trees: [...this.roots],
      highlight: node
    });
    
    steps.push({
      message: `Recalculated ranks from the parent upward`,
      trees: [...this.roots]
    });
    
    this.decreaseKey(oldKey, newKey);
    
    return steps;
  }
}