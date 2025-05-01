import React, { useState, useCallback, useEffect } from 'react';
import Visualizer from './Visualizer';
import { RankPairingHeap } from '../utils/rankPairingHeap';

const RankPairingHeapVisualizer = () => {
  const [heap, setHeap] = useState(new RankPairingHeap());
  const [nodeValue, setNodeValue] = useState('');
  const [decreaseKeyNode, setDecreaseKeyNode] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [operationLog, setOperationLog] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nodeSpacing, setNodeSpacing] = useState(180); 
  const [levelSpacing, setLevelSpacing] = useState(140); 
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 800 }); 
  const [showAdvancedControls, setShowAdvancedControls] = useState(false); 
  
  const getTimeoutValue = () => 2100 - animationSpeed;
  
  const [treeDimensions, setTreeDimensions] = useState({
    maxWidth: 0,
    maxDepth: 0,
    nodeCount: 0
  });
  
  const [visualState, setVisualState] = useState({
    heap: heap,
    highlight: null,
    step: 0,
    totalSteps: 0,
    operation: null,
    mergeSteps: []
  });
  
  const keyExistsInHeap = (heap, key) => {
    const checkNode = (node) => {
      if (!node) return false;
      
      if (node.key === key) return true;
      
      if (node.left) {
        let current = node.left;
        while (current) {
          if (current.key === key || checkNode(current)) return true;
          current = current.right;
        }
      }
      
      return false;
    };
    
    for (const root of heap.roots) {
      if (checkNode(root)) return true;
    }
    
    return false;
  };
  
  useEffect(() => {
    const dimensions = calculateTreeDimensions(heap);
    setTreeDimensions(dimensions);
    
    if (dimensions.maxWidth > 0) {
      const minSpacing = 120;
      const calculatedSpacing = Math.max(minSpacing, 
        Math.min(300, Math.floor(canvasSize.width / (dimensions.maxWidth + 1))));
      
      if (Math.abs(calculatedSpacing - nodeSpacing) > 30) {
        setNodeSpacing(calculatedSpacing);
      }
    }
  }, [heap, canvasSize.width]);
  
  const calculateTreeDimensions = (heap) => {
    const dimensions = {
      maxWidth: 0,
      maxDepth: 0,
      nodeCount: 0
    };
    
    if (!heap || !heap.roots || heap.roots.length === 0) {
      return dimensions;
    }
    
    dimensions.nodeCount = heap.roots.length;
    dimensions.maxWidth = heap.roots.length;
    
    const levelWidths = [heap.roots.length];
    
    heap.roots.forEach(root => {
      calculateSubtreeDimensions(root, 1, levelWidths, dimensions);
    });
    
    dimensions.maxDepth = levelWidths.length - 1;
    
    dimensions.maxWidth = Math.max(...levelWidths);
    
    return dimensions;
  };
  
  const calculateSubtreeDimensions = (node, depth, levelWidths, dimensions) => {
    if (!node) return;
    
    dimensions.nodeCount++;
    
    while (levelWidths.length <= depth) {
      levelWidths.push(0);
    }
    
    levelWidths[depth]++;
    
    if (node.left) {
      calculateSubtreeDimensions(node.left, depth + 1, levelWidths, dimensions);
      
      let sibling = node.left.right;
      while (sibling) {
        calculateSubtreeDimensions(sibling, depth + 1, levelWidths, dimensions);
        sibling = sibling.right;
      }
    }
  };
  
  const renderHeap = useCallback((ctx, state, { width, height, scale = 1 }) => {
    const { heap, highlight, step, operation, mergeSteps } = state;
    
    ctx.clearRect(0, 0, width / scale, height / scale);
    
    if ((operation === 'removeMin' || operation === 'decreaseKey') && 
        mergeSteps.length > 0 && 
        step < mergeSteps.length) {
      const currentStep = mergeSteps[step];
      drawMergeStep(ctx, currentStep, width / scale, height / scale, highlight);
      return;
    }
    
    if (heap && heap.roots.length > 0) {
      drawRoots(ctx, heap.roots, width / (2 * scale), 100, highlight);
    } else {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('Empty Heap', width / (2 * scale), height / (2 * scale));
    }
  }, [nodeSpacing, levelSpacing, treeDimensions]);
  
  const drawRoots = (ctx, roots, centerX, centerY, highlight, radius = 30) => {
    if (!roots || roots.length === 0) return;
    
    const rootSpacing = nodeSpacing * 1.2;
    const totalWidth = (roots.length - 1) * rootSpacing;
    const startX = centerX - totalWidth / 2;
    
    const childCounts = roots.map(root => countDirectChildren(root));
    const maxChildren = Math.max(...childCounts, 1);
    
    const spacingMultipliers = childCounts.map(count => 
      Math.max(0.7, Math.min(1.5, count / maxChildren)));
    
    let accumulatedPosition = 0;
    const rootPositions = [];
    
    for (let i = 0; i < roots.length; i++) {
      const currentSpacing = rootSpacing * spacingMultipliers[i];
      rootPositions.push(startX + accumulatedPosition);
      
      if (i < roots.length - 1) {
        accumulatedPosition += currentSpacing;
      }
    }
    
    roots.forEach((node, index) => {
      if (!node) return;
      
      const x = rootPositions[index];
      const y = centerY;
      
      drawNode(ctx, node, x, y, radius, highlight);
      
      if (node.left) {
        const childCount = childCounts[index];
        const widthMultiplier = Math.max(0.7, Math.min(1.5, childCount / Math.max(1, maxChildren)));
        drawHalfTree(ctx, node.left, x, y, highlight, radius * 0.9, widthMultiplier);
      }
    });
  };
  
  const countDirectChildren = (node) => {
    if (!node || !node.left) return 0;
    
    let count = 0;
    let current = node.left;
    
    while (current) {
      count++;
      current = current.right;
    }
    
    return count;
  };
  
  const calculateSubtreeWidth = (node, depth = 0) => {
    if (!node) return 0;
    
    if (!node.left) return 1;
    
    let width = 0;
    let current = node.left;
    
    while (current) {
      width += calculateSubtreeWidth(current, depth + 1);
      current = current.right;
    }
    
    return Math.max(1, width);
  };
  
  const drawHalfTree = (ctx, node, parentX, parentY, highlight, radius = 25, widthMultiplier = 1) => {
    if (!node) return;
    
    const siblings = [node];
    let current = node.right;
    while (current) {
      siblings.push(current);
      current = current.right;
    }
    
    const totalSiblingWidth = (siblings.length - 1) * (nodeSpacing * widthMultiplier);
    
    const startX = parentX - totalSiblingWidth / 2;
    
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      
      const siblingX = startX + i * (nodeSpacing * widthMultiplier);
      const siblingY = parentY + levelSpacing;
      
      drawNode(ctx, sibling, siblingX, siblingY, radius * 0.9, highlight);
      
      if (i === 0) {
        drawArrow(ctx, parentX, parentY + radius, siblingX, siblingY - radius);
      } else {
        const prevX = startX + (i - 1) * (nodeSpacing * widthMultiplier);
        drawArrow(ctx, prevX + radius, siblingY, siblingX - radius, siblingY);
      }
      
      if (sibling.left) {
        const subtreeWidth = calculateSubtreeWidth(sibling);
        const childWidthMultiplier = Math.max(0.7, Math.min(1.3, subtreeWidth / 2));
        drawHalfTree(ctx, sibling.left, siblingX, siblingY, highlight, radius * 0.9, childWidthMultiplier);
      }
    }
  };
  
  const drawNode = (ctx, node, x, y, radius, highlight) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (highlight && highlight.id === node.id) {
      ctx.fillStyle = '#ffcc00';
    } else if (node === heap.findMin()) {
      ctx.fillStyle = '#90ee90';
    } else {
      ctx.fillStyle = '#f0f0f0';
    }
    
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.key.toString(), x, y);
    
    ctx.font = '12px Arial';
    ctx.fillText(`R:${node.rank}`, x, y + radius + 12);
    
    ctx.font = '10px Arial';
    ctx.fillText(`ID:${node.id}`, x, y - radius - 8);
  };
  
  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI/6),
      toY - headLength * Math.sin(angle - Math.PI/6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI/6),
      toY - headLength * Math.sin(angle + Math.PI/6)
    );
    ctx.closePath();
    ctx.fillStyle = '#333';
    ctx.fill();
  };
  
  const drawMergeStep = (ctx, step, width, height, highlight) => {
    const { trees } = step;
    
    if (trees && trees.length > 0) {
      drawRoots(ctx, trees, width / 2, 100, highlight);
    }
  };
  
  const handleInsert = () => {
    if (nodeValue.trim() === '' || isAnimating) return;
    
    const value = parseInt(nodeValue, 10);
    if (isNaN(value)) return;
    
    if (keyExistsInHeap(heap, value)) {
      setOperationLog(prev => [...prev, `Cannot insert: value ${value} already exists in the heap`]);
      setNodeValue('');
      return;
    }
    
    setIsAnimating(true);
    
    const newHeap = new RankPairingHeap();
    Object.assign(newHeap, heap);
    
    const newNode = newHeap.insert(value);
    
    setVisualState({
      heap: newHeap,
      highlight: newNode,
      step: 0,
      totalSteps: 3,
      operation: 'insert',
      mergeSteps: []
    });
    
    setOperationLog(prev => [...prev, `Inserted node with key ${value}`]);
    
    setTimeout(() => {
      setHeap(newHeap);
      setIsAnimating(false);
      setNodeValue('');
      
      setVisualState(prev => ({
        ...prev,
        highlight: null,
        operation: null
      }));
    }, getTimeoutValue() * 3);
  };
  
  const handleRemoveMin = () => {
    if (heap.roots.length === 0 || isAnimating) return;
    
    setIsAnimating(true);
    
    const newHeap = new RankPairingHeap();
    Object.assign(newHeap, heap);
    
    const minNode = newHeap.findMin();
    
    const mergeSteps = newHeap.createRemoveMinSteps();
    
    setVisualState({
      heap: newHeap,
      highlight: minNode,
      step: 0,
      totalSteps: mergeSteps.length,
      operation: 'removeMin',
      mergeSteps
    });
    
    setOperationLog(prev => [...prev, `Removing minimum node with key ${minNode.key}`]);
    
    let currentStep = 0;
    
    const animateStep = () => {
      if (currentStep >= mergeSteps.length) {
        setHeap(newHeap);
        setIsAnimating(false);
        
        setVisualState(prev => ({
          ...prev,
          highlight: null,
          step: 0,
          operation: null,
          mergeSteps: []
        }));
        return;
      }
      
      setVisualState(prev => ({
        ...prev,
        step: currentStep
      }));
      
      currentStep++;
      setTimeout(animateStep, getTimeoutValue());
    };
    
    animateStep();
  };
  
  const handleDecreaseKey = () => {
    if (isAnimating || !decreaseKeyNode || !newKeyValue) return;
    
    const oldKey = parseInt(decreaseKeyNode, 10);
    const newKey = parseInt(newKeyValue, 10);
    
    if (newKey >= oldKey) {
      setOperationLog(prev => [...prev, `New key must be smaller than current key`]);
      return;
    }
    
    setIsAnimating(true);
    
    const newHeap = new RankPairingHeap();
    Object.assign(newHeap, heap);
    
    const decreaseKeySteps = newHeap.createDecreaseKeySteps(oldKey, newKey);
    
    setVisualState({
      heap: newHeap,
      highlight: null,
      step: 0,
      totalSteps: decreaseKeySteps.length,
      operation: 'decreaseKey',
      mergeSteps: decreaseKeySteps
    });
    
    setOperationLog(prev => [...prev, `Decreasing key ${oldKey} to ${newKey}`]);
    
    let currentStep = 0;
    
    const animateStep = () => {
      if (currentStep >= decreaseKeySteps.length) {
        setHeap(newHeap);
        setIsAnimating(false);
        setDecreaseKeyNode('');
        setNewKeyValue('');
        
        setVisualState(prev => ({
          ...prev,
          highlight: null,
          step: 0,
          operation: null,
          mergeSteps: []
        }));
        return;
      }
      
      const currentStepData = decreaseKeySteps[currentStep];
      setVisualState(prev => ({
        ...prev,
        step: currentStep,
        highlight: currentStepData.highlight || null
      }));
      
      currentStep++;
      setTimeout(animateStep, getTimeoutValue());
    };
    
    animateStep();
  };
  
  const handleClearHeap = () => {
    setHeap(new RankPairingHeap());
    setOperationLog(prev => [...prev, 'Heap cleared']);
    setVisualState({
      heap: new RankPairingHeap(),
      highlight: null,
      step: 0,
      totalSteps: 0,
      operation: null,
      mergeSteps: []
    });
  };
  
  const handleNodeSpacingChange = (e) => {
    setNodeSpacing(parseInt(e.target.value, 10));
  };
  
  const handleLevelSpacingChange = (e) => {
    setLevelSpacing(parseInt(e.target.value, 10));
  };
  
  const handleCanvasWidthChange = (e) => {
    setCanvasSize(prev => ({
      ...prev,
      width: parseInt(e.target.value, 10)
    }));
  };
  
  const handleCanvasHeightChange = (e) => {
    setCanvasSize(prev => ({
      ...prev,
      height: parseInt(e.target.value, 10)
    }));
  };
  
  const toggleAdvancedControls = () => {
    setShowAdvancedControls(prev => !prev);
  };
  
  return (
    <div className="rank-pairing-heap-container">
      <h2>Rank-Pairing Heap Visualization</h2>
      
      <div className="controls-wrapper">
        <div className="controls">
          <div className="control-group">
            <input
              type="number"
              value={nodeValue}
              onChange={(e) => setNodeValue(e.target.value)}
              placeholder="Enter value"
              disabled={isAnimating}
            />
            <button onClick={handleInsert} disabled={isAnimating}>Insert</button>
          </div>
          
          <div className="control-group">
            <input
              type="number"
              value={decreaseKeyNode}
              onChange={(e) => setDecreaseKeyNode(e.target.value)}
              placeholder="Key to decrease"
              disabled={isAnimating}
            />
            <input
              type="number"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="New value"
              disabled={isAnimating}
            />
            <button 
              onClick={handleDecreaseKey} 
              disabled={isAnimating || !decreaseKeyNode || !newKeyValue || parseInt(newKeyValue) >= parseInt(decreaseKeyNode)}
            >
              Decrease Key
            </button>
          </div>
          
          <div className="control-group">
            <button 
              onClick={handleRemoveMin} 
              disabled={heap.roots.length === 0 || isAnimating}
            >
              Remove Min
            </button>
            
            <button onClick={handleClearHeap} disabled={isAnimating}>
              Clear Heap
            </button>
          </div>
          
          <div className="control-group">
            <button 
              className={showAdvancedControls ? 'active' : ''}
              onClick={toggleAdvancedControls}
              disabled={isAnimating}
            >
              {showAdvancedControls ? 'Hide Visualization Settings' : 'Show Visualization Settings'}
            </button>
          </div>
        </div>
        
        <div className="animation-speed-control setting-row">
          <label>
            Animation Speed:
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value, 10))}
              disabled={isAnimating}
              style={{ width: "100%" }}
            />
          </label>
        </div>
        
        {showAdvancedControls && (
          <div className="advanced-settings">
            <div className="setting-row">
              <label>
                Horizontal Spacing:
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="10"
                  value={nodeSpacing}
                  onChange={handleNodeSpacingChange}
                  disabled={isAnimating}
                />
                <span className="setting-value">{nodeSpacing}px</span>
              </label>
            </div>
            
            <div className="setting-row">
              <label>
                Vertical Spacing:
                <input
                  type="range"
                  min="80"
                  max="220"
                  step="10"
                  value={levelSpacing}
                  onChange={handleLevelSpacingChange}
                  disabled={isAnimating}
                />
                <span className="setting-value">{levelSpacing}px</span>
              </label>
            </div>
            
            <div className="setting-row">
              <label>
                Canvas Width:
                <input
                  type="range"
                  min="800"
                  max="2000"
                  step="100"
                  value={canvasSize.width}
                  onChange={handleCanvasWidthChange}
                  disabled={isAnimating}
                />
                <span className="setting-value">{canvasSize.width}px</span>
              </label>
            </div>
            
            <div className="setting-row">
              <label>
                Canvas Height:
                <input
                  type="range"
                  min="600"
                  max="1600"
                  step="100"
                  value={canvasSize.height}
                  onChange={handleCanvasHeightChange}
                  disabled={isAnimating}
                />
                <span className="setting-value">{canvasSize.height}px</span>
              </label>
            </div>
            
            <div className="heap-info">
              <div>Nodes: {treeDimensions.nodeCount}</div>
              <div>Max Width: {treeDimensions.maxWidth}</div>
              <div>Max Depth: {treeDimensions.maxDepth}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="visualization">
        <Visualizer 
          renderFunction={renderHeap} 
          data={visualState} 
          width={canvasSize.width} 
          height={canvasSize.height} 
          className="visualization-canvas"
        />
      </div>
      
      <div className="operation-log">
        <h3>Operation Log</h3>
        <div className="log-entries">
          {operationLog.slice(-10).map((entry, index) => (
            <div key={index} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankPairingHeapVisualizer;