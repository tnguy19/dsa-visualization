import React, { useState, useCallback, useEffect, useRef } from 'react';
import FibHeap, { deepCopyHeap } from '../utils/fibonacciHeap';
import Visualizer from './Visualizer';

const FibonacciHeap = () => {
  const [heap, setHeap] = useState(new FibHeap());
  const [nodeValue, setNodeValue] = useState('');
  const [decreaseKey, setDecreaseKey] = useState({ id: '', newKey: '' });
  const [operationLog, setOperationLog] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const getTimeoutValue = () => 2100 - animationSpeed;
  const [isAnimating, setIsAnimating] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [nodeSpacing, setNodeSpacing] = useState(250);
  const [levelSpacing, setLevelSpacing] = useState(100);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  
  const [visualState, setVisualState] = useState({
    heap: heap,
    highlight: null,
    operation: null
  });
  
  useEffect(() => {
    setVisualState({
      heap: heap,
      highlight: null,
      operation: null
    });
    
    calculateLayout(heap);
  }, [heap, nodeSpacing, levelSpacing]);
  
  const calculateLayout = (heap) => {
    if (!heap || !heap.min) return;
    
    const roots = [];
    let current = heap.min;
    do {
      roots.push(current);
      current = current.right;
    } while (current !== heap.min);
    
    const rootSpacing = nodeSpacing;
    const totalWidth = (roots.length - 1) * rootSpacing;
    const startX = canvasSize.width / 2 - totalWidth / 2;
    
    roots.forEach((root, index) => {
      const x = startX + index * rootSpacing;
      
      positionTree(root, x, 80, rootSpacing * 0.8);
    });
  };
  
  const positionTree = (node, x, y, horizontalSpacing) => {
    node.targetX = x;
    node.targetY = y;
    
    if (node.x === 0 && node.y === 0) {
      node.x = x;
      node.y = y;
    }
    
    if (node.child) {
      const children = [];
      let childNode = node.child;
      do {
        children.push(childNode);
        childNode = childNode.right;
      } while (childNode !== node.child);
      
      const scaledSpacing = nodeSpacing * 0.8;
      const childrenWidth = (children.length - 1) * scaledSpacing;
      const childStartX = x - childrenWidth / 2;
      const childY = y + levelSpacing;
      
      children.forEach((child, index) => {
        const childX = childStartX + index * scaledSpacing;
        positionTree(child, childX, childY, scaledSpacing * 0.8);
      });
    }
  };
  
  const updateNodePositions = () => {
    if (!heap || !heap.min) return false;
    
    let needsUpdate = false;
    
    const updateNode = (node) => {
      if (!node) return false;
      
      let hasUpdated = false;
      const visited = new Set();
      
      const processNode = (currentNode) => {
        if (visited.has(currentNode)) return false;
        visited.add(currentNode);
        
        const dx = currentNode.targetX - currentNode.x;
        const dy = currentNode.targetY - currentNode.y;
        
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          currentNode.x += dx * 0.1;
          currentNode.y += dy * 0.1;
          hasUpdated = true;
        }
        
        if (currentNode.child) {
          processNode(currentNode.child);
        }
        
        let sibling = currentNode.right;
        while (sibling !== currentNode) {
          processNode(sibling);
          sibling = sibling.right;
        }
      };
      
      processNode(node);
      return hasUpdated;
    };
    
    needsUpdate = updateNode(heap.min);
    return needsUpdate;
  };
  
  useEffect(() => {
    let animationFrameId = null;
    
    const animate = () => {
      const needsUpdate = updateNodePositions();
      
      if (needsUpdate) {
        setVisualState(prevState => ({...prevState}));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationFrameId = null;
      }
    };
    
    if (heap && heap.min) {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [heap, visualState]);
  
  const renderHeap = useCallback((ctx, state, { width, height }) => {
    const { heap, highlight, operation } = state;
    
    ctx.clearRect(0, 0, width, height);
    
    if (heap && heap.min) {
      const drawnNodes = new Set();
      let current = heap.min;
      
      do {
        drawTree(ctx, current, drawnNodes, highlight);
        current = current.right;
      } while (current !== heap.min);
      
      if (heap.min) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#2e7d32';
        ctx.textAlign = 'center';
        ctx.fillText('Min element', heap.min.x, heap.min.y - 40);
        
        const arrowX = heap.min.x;
        const arrowY = heap.min.y - 35;
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX, heap.min.y - 25);
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(arrowX, heap.min.y - 25);
        ctx.lineTo(arrowX - 5, heap.min.y - 30);
        ctx.lineTo(arrowX + 5, heap.min.y - 30);
        ctx.closePath();
        ctx.fillStyle = '#2e7d32';
        ctx.fill();
      }
      
      const legendY = height - 50;
      const legendX = 150;
      
      ctx.beginPath();
      ctx.moveTo(legendX - 40, legendY);
      ctx.lineTo(legendX + 40, legendY);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(legendX + 40, legendY);
      ctx.lineTo(legendX + 30, legendY - 5);
      ctx.lineTo(legendX + 30, legendY + 5);
      ctx.closePath();
      ctx.fillStyle = '#333';
      ctx.fill();
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('Parent → Child', legendX, legendY - 15);
    } else {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('Empty Heap', width / 2, height / 2);
    }
  }, []);
  
  const drawTree = (ctx, node, drawnNodes, highlight) => {
    if (!node || drawnNodes.has(node)) return;
    drawnNodes.add(node);
    
    drawNode(ctx, node, highlight);
    
    if (node.child) {
      const children = [];
      let childNode = node.child;
      do {
        children.push(childNode);
        childNode = childNode.right;
      } while (childNode !== node.child);
      
      for (const child of children) {
        drawParentChildEdge(ctx, node, child);
        
        drawTree(ctx, child, drawnNodes, highlight);
      }
    }
  };
  
  const drawParentChildEdge = (ctx, fromNode, toNode) => {
    const radius = 25;
    const fromX = fromNode.x;
    const fromY = fromNode.y;
    const toX = toNode.x;
    const toY = toNode.y;
    
    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    const ndx = dx / length;
    const ndy = dy / length;
    
    const startX = fromX + ndx * radius;
    const startY = fromY + ndy * radius;
    const endX = toX - ndx * radius;
    const endY = toY - ndy * radius;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    const arrowSize = 8;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI/6),
      endY - arrowSize * Math.sin(angle - Math.PI/6)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI/6),
      endY - arrowSize * Math.sin(angle + Math.PI/6)
    );
    ctx.closePath();
    ctx.fillStyle = '#333';
    ctx.fill();
  };
  
  const drawNode = (ctx, node, highlight) => {
    const radius = 25;
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    
    if (highlight && highlight.id === node.id) {
      ctx.fillStyle = '#ffcc00';
    } else if (node === heap.min) {
      ctx.fillStyle = '#90ee90';
    } else if (node.marked) {
      ctx.fillStyle = '#ffb6c1';
    } else {
      ctx.fillStyle = '#f0f0f0';
    }
    
    ctx.fill();
    
    const gradient = ctx.createRadialGradient(
      node.x - 5, node.y - 5, 0,
      node.x, node.y, radius
    );
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#aaa');
    
    if (node.marked) {
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
    }
    ctx.stroke();
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.key.toString(), node.x, node.y);
    
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`ID:${node.id}`, node.x, node.y - radius - 5);
    
    ctx.font = '11px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`D:${node.degree}`, node.x, node.y + radius + 15);
    
    if (node.child) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#555';
      ctx.fillText('(parent)', node.x, node.y + 10);
    }
  };
  
  const handleInsert = () => {
    if (nodeValue.trim() === '' || isAnimating) return;
    
    const value = parseInt(nodeValue, 10);
    if (isNaN(value)) return;
    
    setIsAnimating(true);
    
    const newHeap = deepCopyHeap(heap);
    
    const newNode = newHeap.insert(value);
    
    calculateLayout(newHeap);
    
    setVisualState({
      heap: newHeap,
      highlight: newNode,
      operation: 'insert'
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
    }, getTimeoutValue());
  };
  
  const handleExtractMin = () => {
    if (!heap.min || isAnimating) return;
    
    setIsAnimating(true);
    
    const newHeap = deepCopyHeap(heap);
    
    setVisualState({
      heap: newHeap,
      highlight: newHeap.min,
      operation: 'extractMin'
    });
    
    const minValue = newHeap.min.key;
    setOperationLog(prev => [...prev, `Extracting minimum node with key ${minValue}`]);
    
    setTimeout(() => {
      try {
        const extractedMin = newHeap.extractMin();
        
        calculateLayout(newHeap);
        
        setVisualState({
          heap: newHeap,
          highlight: null,
          operation: 'extractMin-done'
        });
        
        setTimeout(() => {
          setHeap(newHeap);
          setIsAnimating(false);
          
          setVisualState({
            heap: newHeap,
            highlight: null,
            operation: null
          });
        }, getTimeoutValue());
      } catch (error) {
        console.error("Error in extractMin:", error);
        setIsAnimating(false);
        setOperationLog(prev => [...prev, `Error: Extract Min operation failed - ${error.message}`]);
      }
    }, getTimeoutValue());
  };
  
  const handleDecreaseKey = () => {
    const { id, newKey } = decreaseKey;
    if (id.trim() === '' || newKey.trim() === '' || isAnimating) return;
    
    const nodeId = parseInt(id, 10);
    const key = parseInt(newKey, 10);
    
    if (isNaN(nodeId) || isNaN(key)) return;
    
    const targetNode = heap.findNodeById(nodeId);
    
    if (!targetNode) {
      setOperationLog(prev => [...prev, `Node with ID ${nodeId} not found`]);
      return;
    }
    
    if (key >= targetNode.key) {
      setOperationLog(prev => [...prev, `New key must be less than current key (${targetNode.key})`]);
      return;
    }
    
    setIsAnimating(true);
    
    const newHeap = deepCopyHeap(heap);
    
    const newTargetNode = newHeap.findNodeById(nodeId);
    
    setVisualState({
      heap: newHeap,
      highlight: newTargetNode,
      operation: 'decreaseKey'
    });
    
    setOperationLog(prev => [
      ...prev,
      `Decreasing key of node ${nodeId} from ${newTargetNode.key} to ${key}`
    ]);
    
    setTimeout(() => {
      try {
        newHeap.decreaseKey(newTargetNode, key);
        
        calculateLayout(newHeap);
        
        setVisualState({
          heap: newHeap,
          highlight: newTargetNode,
          operation: 'decreaseKey-done'
        });
        
        setTimeout(() => {
          setHeap(newHeap);
          setIsAnimating(false);
          setDecreaseKey({ id: '', newKey: '' });
          
          setVisualState({
            heap: newHeap,
            highlight: null,
            operation: null
          });
        }, getTimeoutValue());
      } catch (error) {
        console.error("Error in decreaseKey:", error);
        setIsAnimating(false);
        setOperationLog(prev => [...prev, `Error: Decrease Key operation failed - ${error.message}`]);
      }
    }, getTimeoutValue());
  };
  
  const handleClearHeap = () => {
    setHeap(new FibHeap());
    setOperationLog(prev => [...prev, 'Heap cleared']);
    setVisualState({
      heap: new FibHeap(),
      highlight: null,
      operation: null
    });
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
    <div className="fibonacci-heap-container">
      <h2>Fibonacci Heap Visualization</h2>
      
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
            <button onClick={handleExtractMin} disabled={!heap.min || isAnimating}>
              Extract Min
            </button>
          </div>
          
          <div className="control-group">
            <input
              type="number"
              value={decreaseKey.id}
              onChange={(e) => setDecreaseKey({ ...decreaseKey, id: e.target.value })}
              placeholder="Node ID"
              disabled={isAnimating}
            />
            <input
              type="number"
              value={decreaseKey.newKey}
              onChange={(e) => setDecreaseKey({ ...decreaseKey, newKey: e.target.value })}
              placeholder="New key"
              disabled={isAnimating}
            />
            <button onClick={handleDecreaseKey} disabled={isAnimating}>
              Decrease Key
            </button>
          </div>
          
          <div className="control-group">
            <button onClick={handleClearHeap} disabled={isAnimating}>
              Clear Heap
            </button>
            
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
                  min="150"
                  max="400"
                  step="10"
                  value={nodeSpacing}
                  onChange={(e) => setNodeSpacing(parseInt(e.target.value, 10))}
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
                  max="200"
                  step="10"
                  value={levelSpacing}
                  onChange={(e) => setLevelSpacing(parseInt(e.target.value, 10))}
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
          </div>
        )}
      </div>
      
      <div className="visualization">
        <Visualizer 
          renderFunction={renderHeap} 
          data={visualState} 
          width={canvasSize.width} 
          height={canvasSize.height}
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
      
      <div className="heap-info">
        <h3>Legend</h3>
        <ul>
          <li><strong>Green node</strong>: Minimum key in the heap</li>
          <li><strong>Pink fill</strong>: Marked nodes (have lost a child)</li>
          <li><strong>D:x</strong>: Degree of the node (number of children)</li>
          <li><strong>ID:x</strong>: Unique identifier for the node (for decreaseKey operation)</li>
          <li><strong>Arrows</strong>: Parent-child relationships</li>
        </ul>
      </div>
    </div>
  );
};

export default FibonacciHeap;