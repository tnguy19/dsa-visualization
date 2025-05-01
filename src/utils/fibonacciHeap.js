class FibHeap {
    constructor() {
      this.min = null;
      this.nodeCount = 0;
      this.nextId = 1;
    }
    
    insert(key) {
      const node = {
        key,
        degree: 0,
        parent: null,
        child: null,
        left: null,
        right: null,
        marked: false,
        id: this.nextId++,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
      };
      
      node.left = node;
      node.right = node;
      
      if (this.min === null) {
        this.min = node;
      } else {
        this.insertIntoRootList(node);
        
        if (node.key < this.min.key) {
          this.min = node;
        }
      }
      
      this.nodeCount++;
      return node;
    }
    
    insertIntoRootList(node) {
      if (this.min === null) {
        this.min = node;
        node.left = node;
        node.right = node;
        return;
      }
      
      node.right = this.min.right;
      node.left = this.min;
      this.min.right.left = node;
      this.min.right = node;
    }
    
    extractMin() {
      const extractedMin = this.min;
      
      if (extractedMin === null) {
        return null;
      }
      
      if (extractedMin.child !== null) {
        let child = extractedMin.child;
        
        do {
          const nextChild = child.right;
          
          child.parent = null;
          child.marked = false;
          
          this.insertIntoRootList(child);
          
          child = nextChild;
        } while (child !== extractedMin.child);
        
        extractedMin.child = null;
        extractedMin.degree = 0;
      }
      
      if (extractedMin.right === extractedMin) {
        this.min = null;
      } else {
        this.min = extractedMin.right;
        
        extractedMin.left.right = extractedMin.right;
        extractedMin.right.left = extractedMin.left;
        
        this.consolidate();
      }
      
      this.nodeCount--;
      return extractedMin;
    }
    
    consolidate() {
      if (!this.min) return;
      
      const maxDegree = Math.max(Math.floor(Math.log2(this.nodeCount) * 2), 5);
      const degreeArray = new Array(maxDegree).fill(null);
      
      const roots = [];
      let current = this.min;
      
      let count = 0;
      const maxCount = this.nodeCount + 1;
      
      if (current) {
        do {
          roots.push(current);
          current = current.right;
          count++;
        } while (current !== this.min && count < maxCount);
      }
      
      for (const root of roots) {
        if (root.parent !== null) continue;
        
        let node = root;
        let degree = node.degree;
        
        if (degree >= maxDegree) {
          console.warn("Node degree exceeds maximum:", degree, maxDegree);
          continue;
        }
        
        while (degreeArray[degree] !== null) {
          let sameRankNode = degreeArray[degree];
          
          if (sameRankNode.parent !== null || node === sameRankNode) {
            degreeArray[degree] = null;
            degree++;
            continue;
          }
          
          if (node.key > sameRankNode.key) {
            const temp = node;
            node = sameRankNode;
            sameRankNode = temp;
          }
          
          this.linkNodes(sameRankNode, node);
          
          degreeArray[degree] = null;
          degree++;
          
          if (degree >= maxDegree) {
            break;
          }
        }
        
        degreeArray[degree] = node;
      }
      
      this.min = null;
      
      for (let i = 0; i < maxDegree; i++) {
        if (degreeArray[i] !== null) {
          const node = degreeArray[i];
          
          if (node.parent === null) {
            if (this.min === null) {
              node.left = node;
              node.right = node;
              this.min = node;
            } else {
              this.insertIntoRootList(node);
              
              if (node.key < this.min.key) {
                this.min = node;
              }
            }
          }
        }
      }
    }
    
    linkNodes(childNode, parentNode) {
      childNode.left.right = childNode.right;
      childNode.right.left = childNode.left;
      
      childNode.parent = parentNode;
      
      if (parentNode.child === null) {
        parentNode.child = childNode;
        childNode.left = childNode;
        childNode.right = childNode;
      } else {
        childNode.right = parentNode.child.right;
        childNode.left = parentNode.child;
        parentNode.child.right.left = childNode;
        parentNode.child.right = childNode;
      }
      
      parentNode.degree++;
      childNode.marked = false;
    }
    
    decreaseKey(node, newKey) {
      if (newKey > node.key) {
        throw new Error("New key is greater than current key");
      }
      
      node.key = newKey;
      const parent = node.parent;
      
      if (parent !== null && node.key < parent.key) {
        this.cut(node, parent);
        this.cascadingCut(parent);
      }
      
      if (this.min !== null && node.key < this.min.key) {
        this.min = node;
      }
    }
    
    cut(node, parent) {
      if (node.right === node) {
        parent.child = null;
      } else {
        if (parent.child === node) {
          parent.child = node.right;
        }
        
        node.left.right = node.right;
        node.right.left = node.left;
      }
      
      parent.degree--;
      
      this.insertIntoRootList(node);
      
      node.parent = null;
      node.marked = false;
    }
    
    cascadingCut(node) {
      const parent = node.parent;
      
      if (parent !== null) {
        if (!node.marked) {
          node.marked = true;
        } else {
          this.cut(node, parent);
          this.cascadingCut(parent);
        }
      }
    }
    
    findNodeById(id) {
      if (!this.min) return null;
      
      return this.findNodeInList(this.min, id);
    }
    
    findNodeInList(startNode, id) {
      if (!startNode) return null;
      
      let current = startNode;
      let found = null;
      
      do {
        if (current.id === id) {
          return current;
        }
        
        if (current.child) {
          found = this.findNodeInList(current.child, id);
          if (found) return found;
        }
        
        current = current.right;
      } while (current !== startNode);
      
      return null;
    }
    
    validateHeap() {
      if (!this.min) return true;
      
      let current = this.min;
      let count = 0;
      const maxCount = this.nodeCount;
      
      do {
        if (current.key < this.min.key) {
          console.error("Min property violated in root list");
          return false;
        }
        
        if (current.parent !== null) {
          console.error("Root node has a parent");
          return false;
        }
        
        if (current.right.left !== current || current.left.right !== current) {
          console.error("Circular list integrity violated in root list");
          return false;
        }
        
        if (current.child && !this.validateChildrenList(current)) {
          return false;
        }
        
        current = current.right;
        count++;
      } while (current !== this.min && count < maxCount);
      
      if (current !== this.min) {
        console.error("Root list is not circular");
        return false;
      }
      
      return true;
    }
    
    validateChildrenList(parent) {
      if (!parent.child) return true;
      
      let child = parent.child;
      let count = 0;
      const maxDegree = parent.degree;
      
      do {
        if (child.parent !== parent) {
          console.error("Child's parent reference is incorrect");
          return false;
        }
        
        if (child.right.left !== child || child.left.right !== child) {
          console.error("Circular list integrity violated in child list");
          return false;
        }
        
        if (child.key < parent.key) {
          console.error("Min-heap property violated");
          return false;
        }
        
        if (child.child && !this.validateChildrenList(child)) {
          return false;
        }
        
        child = child.right;
        count++;
      } while (child !== parent.child && count <= maxDegree);
      
      if (child !== parent.child) {
        console.error("Child list is not circular");
        return false;
      }
      
      if (count !== parent.degree) {
        console.error("Degree does not match number of children");
        return false;
      }
      
      return true;
    }
  }
  
  const deepCopyHeap = (originalHeap) => {
    if (!originalHeap || !originalHeap.min) return new FibHeap();
    
    const newHeap = new FibHeap();
    newHeap.nodeCount = originalHeap.nodeCount;
    newHeap.nextId = originalHeap.nextId;
    
    const nodeMap = new Map();
    
    const copyNodes = (startNode) => {
      if (!startNode) return;
      
      let current = startNode;
      let firstTime = true;
      
      do {
        const newNode = {
          key: current.key,
          degree: current.degree,
          marked: current.marked,
          id: current.id,
          x: current.x,
          y: current.y,
          targetX: current.targetX,
          targetY: current.targetY,
          parent: null,
          child: null,
          left: null,
          right: null
        };
        
        nodeMap.set(current, newNode);
        
        if (current.child) {
          copyNodes(current.child);
        }
        
        current = current.right;
        firstTime = false;
      } while (current !== startNode);
    };
    
    copyNodes(originalHeap.min);
    
    const linkNodes = (startNode) => {
      if (!startNode) return;
      
      let current = startNode;
      let firstNode = nodeMap.get(current);
      let prevNode = null;
      let firstTime = true;
      
      do {
        const newNode = nodeMap.get(current);
        
        if (current.parent) {
          newNode.parent = nodeMap.get(current.parent);
        }
        
        if (current.child) {
          newNode.child = nodeMap.get(current.child);
          linkNodes(current.child);
        }
        
        if (firstTime) {
          firstNode = newNode;
          prevNode = newNode;
          firstTime = false;
        } else {
          prevNode.right = newNode;
          newNode.left = prevNode;
          prevNode = newNode;
        }
        
        current = current.right;
      } while (current !== startNode);
      
      if (prevNode) {
        prevNode.right = firstNode;
        firstNode.left = prevNode;
      }
    };
    
    linkNodes(originalHeap.min);
    
    newHeap.min = nodeMap.get(originalHeap.min);
    
    return newHeap;
  };
  
  export default FibHeap;
  export { deepCopyHeap };