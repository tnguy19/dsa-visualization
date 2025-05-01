import React, { useState, useEffect, useCallback } from 'react';
import Visualizer from './Visualizer';

const BellmanFordVisualization = () => {
  //initialize graph 
  const [graph] = useState({
    vertices: [
      { id: 1, x: 100, y: 200 },
      { id: 2, x: 200, y: 100 },
      { id: 3, x: 200, y: 300 },
      { id: 4, x: 300, y: 200 },
      { id: 5, x: 400, y: 100 },
      { id: 6, x: 400, y: 300 },
      { id: 7, x: 500, y: 200 },
      { id: 8, x: 600, y: 300 },
      { id: 9, x: 600, y: 100 }
    ],
   
    vertexOutEdges: {
      1: [
        { from: 1, to: 2, weight: 8 },
        { from: 1, to: 3, weight: 12 }
      ],
      2: [
        { from: 2, to: 4, weight: 6 },
        { from: 2, to: 5, weight: 5 },
        { from: 2, to: 7, weight: 7 }
      ],
      3: [
        { from: 3, to: 4, weight: 5 },
        { from: 3, to: 6, weight: 2 }
      ],
      4: [
        { from: 4, to: 6, weight: 2 }
      ],
      5: [
        { from: 5, to: 6, weight: 5 },
        { from: 5, to: 9, weight: 9 }
      ],
      6: [
        { from: 6, to: 8, weight: 8 }
      ],
      7: [
        { from: 7, to: 6, weight: -5 },
        { from: 7, to: 8, weight: 6 }
      ],
      8: [
        { from: 8, to: 9, weight: -3 }
      ],
      9: [
        { from: 9, to: 7, weight: 3 }
      ]
    },

    edges: [
      { from: 1, to: 2, weight: 8 },
      { from: 1, to: 3, weight: 12 },
      { from: 2, to: 4, weight: 6 },
      { from: 2, to: 5, weight: 5 },
      { from: 2, to: 7, weight: 7 },
      { from: 3, to: 4, weight: 5 },
      { from: 3, to: 6, weight: 2 },
      { from: 4, to: 6, weight: 2 },
      { from: 5, to: 6, weight: 5 },
      { from: 5, to: 9, weight: 9 },
      { from: 6, to: 8, weight: 8 },
      { from: 7, to: 6, weight: -5 },
      { from: 7, to: 8, weight: 6 },
      { from: 8, to: 9, weight: -3 },
      { from: 9, to: 7, weight: 3 }
    ]
  });

  const [distances, setDistances] = useState({});
  const [queue, setQueue] = useState([]);
  const [currentVertex, setCurrentVertex] = useState(null);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [previousVertices, setPreviousVertices] = useState([]);
  const [step, setStep] = useState(0);
  const [shortestPathTree, setShortestPathTree] = useState([]);
  const [predecessors, setPredecessors] = useState({});
  const [processLog, setProcessLog] = useState([]);
  const [newlyUpdated, setNewlyUpdated] = useState({});
  
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const getTimeoutValue = () => 2100 - animationSpeed;
  
  const [animation, setAnimation] = useState({
    isRunning: false,
    isCompleted: false
  });

  const initializeAlgorithm = useCallback(() => {
    const initialDistances = {};
    const initialPredecessors = {};
    const initialNewlyUpdated = {};
    
    graph.vertices.forEach(vertex => {
      initialDistances[vertex.id] = vertex.id === 1 ? 0 : Infinity;
      initialPredecessors[vertex.id] = null;
      initialNewlyUpdated[vertex.id] = false;
    });
    
    setDistances(initialDistances);
    setPredecessors(initialPredecessors);
    setNewlyUpdated(initialNewlyUpdated);
    setQueue([1]); //algo start at vertex 1
    setCurrentVertex(null);
    setCurrentEdge(null);
    setPreviousVertices([]);
    setStep(0);
    setShortestPathTree([]);
    setProcessLog([{
      step: 0,
      vertex: null,
      distances: { ...initialDistances },
      queue: [1],
      newlyUpdated: { ...initialNewlyUpdated },
      description: 'Initial: D(1)=0, all others=∞, Queue=[1]'
    }]);
    
    setAnimation({
      isRunning: false,
      isCompleted: false
    });
  }, [graph]);


  const buildShortestPathTree = useCallback(() => {
    const tree = [];

    graph.vertices.forEach(vertex => {
      if (vertex.id !== 1 && predecessors[vertex.id] !== null) {
        tree.push({
          from: predecessors[vertex.id],
          to: vertex.id
        });
      }
    });
    
    setShortestPathTree(tree);
  }, [graph, predecessors]);

  //step by step proces
  const processNextStep = useCallback(() => {
    // Create a local copy of current state
    const currentQueue = [...queue];
    const currentDistancesState = {...distances};
    const currentPredecessorsState = {...predecessors};
    const currentPreviousVerticesState = [...previousVertices];
    
    //if algorithm complete
    if (currentQueue.length === 0) {
      setAnimation(prev => ({...prev, isCompleted: true, isRunning: false}));
      buildShortestPathTree();
      return false; //no more step to process
    }
    //get the next vertex from queue
    const nextVertex = currentQueue.shift();
    
    //add current vertex to processed vertics
    const newPreviousVertices = [...currentPreviousVerticesState, nextVertex];
    
    const resetNewlyUpdated = {};
    graph.vertices.forEach(v => {
      resetNewlyUpdated[v.id] = false;
    });
    
    const outgoingEdges = graph.vertexOutEdges[nextVertex] || [];
    const verticesToAdd = [];
    
    outgoingEdges.forEach(edge => {
      if (currentDistancesState[nextVertex] !== Infinity && 
          currentDistancesState[nextVertex] + edge.weight < currentDistancesState[edge.to]) {
        
        currentDistancesState[edge.to] = currentDistancesState[nextVertex] + edge.weight;
        currentPredecessorsState[edge.to] = nextVertex;
        resetNewlyUpdated[edge.to] = true;
        
        if (!currentQueue.includes(edge.to) && 
            !currentPreviousVerticesState.includes(edge.to) && 
            !verticesToAdd.includes(edge.to) &&
            !newPreviousVertices.includes(edge.to)) {
          verticesToAdd.push(edge.to);
        }
      }
    });
    
    const updatedQueue = [...currentQueue, ...verticesToAdd];
    const newStepCount = step + 1;
    
    const newLog = {
      step: newStepCount,
      vertex: nextVertex,
      distances: {...currentDistancesState},
      queue: [...updatedQueue],
      newlyUpdated: {...resetNewlyUpdated},
      description: `Scan vertex ${nextVertex}`
    };
    
    setCurrentVertex(nextVertex);
    setPreviousVertices(newPreviousVertices);
    setDistances(currentDistancesState);
    setPredecessors(currentPredecessorsState);
    setQueue(updatedQueue);
    setNewlyUpdated(resetNewlyUpdated);
    setStep(newStepCount);
    setProcessLog(prevLog => [...prevLog, newLog]);
    
    return true; //more steps to process, not done!
  }, [queue, distances, predecessors, previousVertices, step, graph, buildShortestPathTree]);

  const handleStepClick = () => {
    if (animation.isCompleted) return;
    processNextStep();
  };
  
  const handleRunClick = () => {
    if (animation.isCompleted) return;
    
    setAnimation(prev => ({...prev, isRunning: !prev.isRunning}));
  };
  
  const handleResetClick = () => {
    if (animation.isRunning) {
      setAnimation(prev => ({...prev, isRunning: false}));
    }
    initializeAlgorithm();
  };

  //usefffect for animation loop
  useEffect(() => {
    if (!animation.isRunning) return;
    
    const timeoutId = setTimeout(() => {
      const hasMoreSteps = processNextStep();
 
      if (!hasMoreSteps) {
        setAnimation(prev => ({...prev, isRunning: false, isCompleted: true}));
      }
    }, getTimeoutValue());
    
    return () => clearTimeout(timeoutId);
  }, [animation.isRunning, processNextStep]);


  useEffect(() => {
    initializeAlgorithm();
  }, [initializeAlgorithm]);

  const formatDistances = (distances, newlyUpdated) => {
    return Object.keys(distances)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(v => {
        const val = distances[v] === Infinity ? 'inf' : distances[v];
        return newlyUpdated && newlyUpdated[v] 
          ? `D(${v})=[${val}]` 
          : `D(${v})=${val}`;
      })
      .join('; ');
  };

//draw graph
  const renderGraph = (ctx, data, dimensions) => {
    if (!ctx || !data || !dimensions) return;
    
    const { vertices, edges } = data || {};
    if (!vertices || !edges) return;
    
    edges.forEach(edge => {
      if (!edge || edge.from === undefined || edge.to === undefined) return;
      
      const fromVertex = vertices.find(v => v && v.id === edge.from);
      const toVertex = vertices.find(v => v && v.id === edge.to);
      
      if (!fromVertex || !toVertex || 
          fromVertex.x === undefined || fromVertex.y === undefined ||
          toVertex.x === undefined || toVertex.y === undefined) return;
      
      if (currentEdge && edge.from === currentEdge.from && edge.to === currentEdge.to) {
        ctx.strokeStyle = 'red'; //highlight current edge
        ctx.lineWidth = 3;
      } else if (animation.isCompleted && shortestPathTree.some(e => e && e.from === edge.from && e.to === edge.to)) {
        ctx.strokeStyle = '#2ecc71'; //highlight edges in the shortest path green
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#5588dd';
        ctx.lineWidth = 2;
      }
      
      ctx.beginPath();
      ctx.moveTo(fromVertex.x, fromVertex.y);
      
      const dx = toVertex.x - fromVertex.x;
      const dy = toVertex.y - fromVertex.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / length;
      const ny = dy / length;
      
      const vertexRadius = 20;
      const endX = toVertex.x - nx * vertexRadius;
      const endY = toVertex.y - ny * vertexRadius;
      
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      const arrowSize = 10;
      const angle = Math.atan2(dy, dx);
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      
      // Draw the weight
      if (edge.weight !== undefined && edge.weight !== null) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
        const weightX = fromVertex.x + dx * 0.5;
        const weightY = fromVertex.y + dy * 0.5 - 10;
        ctx.fillText(String(edge.weight), weightX, weightY);
      }
    });
    
    vertices.forEach(vertex => {
      if (!vertex || vertex.id === undefined || 
          vertex.x === undefined || vertex.y === undefined) return;
      
      if (vertex.id === currentVertex) {
        ctx.fillStyle = 'red'; 
      } else if (previousVertices.includes(vertex.id)) {
        ctx.fillStyle = 'orange'; 
      } else if (queue.includes(vertex.id)) {
        ctx.fillStyle = 'yellow'; 
      } else if (distances[vertex.id] < Infinity) {
        if (animation.isCompleted && vertex.id !== 1 && 
            shortestPathTree.some(e => e.to === vertex.id)) {
          ctx.fillStyle = '#27ae60'; //green for vertices in the shortest path
        } else {
          ctx.fillStyle = '#5588dd'; //blue for vertices with known distance
        }
      } else {
        ctx.fillStyle = '#cccccc'; //unreachable vertices
      }
      
      //draw vetex
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(vertex.id), vertex.x, vertex.y);

      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
    
      const distance = distances[vertex.id];
      let distanceText = distance === Infinity ? '∞' : String(distance);
      
      if (newlyUpdated[vertex.id]) {
        ctx.fillStyle = 'red';
        distanceText = `[${distanceText}]`;
      }
      
      ctx.fillText(`D: ${distanceText}`, vertex.x, vertex.y - 30);
    });
    

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Queue: [${queue.join(', ')}]`, 20, 30);
    ctx.fillText(`Step: ${step}`, 20, 60);
    
    if (animation.isCompleted) {
      ctx.fillStyle = '#27ae60'; // Green
      ctx.fillText('Algorithm completed! Shortest path tree is highlighted in green.', 20, dimensions.height - 60);
      

      const legendX = dimensions.width - 220;
      const legendY = dimensions.height - 170; 
      const lineHeight = 25;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(legendX - 10, legendY - 10, 210, 150);
      ctx.strokeStyle = '#ddd';
      ctx.strokeRect(legendX - 10, legendY - 10, 210, 150);
      
      // Legend title
      ctx.fillStyle = 'black';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Legend:', legendX, legendY);
      
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + lineHeight);
      ctx.lineTo(legendX + 40, legendY + lineHeight);
      ctx.stroke();
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText('Shortest Path Edge', legendX + 50, legendY + lineHeight + 4);
      

      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(legendX + 20, legendY + 2*lineHeight, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText('Current Vertex', legendX + 50, legendY + 2*lineHeight + 4);
      
      // Processed vertex
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.arc(legendX + 20, legendY + 3*lineHeight, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText('Processed Vertex', legendX + 50, legendY + 3*lineHeight + 4);
      

      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(legendX + 20, legendY + 4*lineHeight, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText('Vertex in Queue', legendX + 50, legendY + 4*lineHeight + 4);
    }
  };

  return (
    <div className="bellman-ford-container">
      <h2>Bellman-Ford Shortest Path Algorithm</h2>
      <p>Finding shortest paths from vertex 1 to all other vertices using a work queue approach.</p>
      
      <div className="controls-wrapper">
        <div className="controls">
          <div className="control-group">
            <button onClick={handleResetClick} disabled={animation.isRunning}>
              Reset
            </button>
            <button onClick={handleStepClick} disabled={animation.isRunning || animation.isCompleted}>
              Step
            </button>
            <button onClick={handleRunClick} disabled={animation.isCompleted}>
              {animation.isRunning ? "Stop" : "Run"}
            </button>
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
                disabled={animation.isRunning}
                style={{ width: "100%" }}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div className="algorithm-state">
        <div className="distance-table">
          <h3>Distance Estimates</h3>
          <table>
            <thead>
              <tr>
                <th>Vertex</th>
                <th>Distance</th>
                <th>Predecessor</th>
              </tr>
            </thead>
            <tbody>
              {graph.vertices.map(vertex => (
                <tr key={vertex.id} className={
                  vertex.id === currentVertex ? 'current-vertex' : (
                    newlyUpdated[vertex.id] ? 'updated-vertex' : ''
                  )
                }>
                  <td>{vertex.id}</td>
                  <td style={{ color: newlyUpdated[vertex.id] ? 'red' : 'black' }}>
                    {distances[vertex.id] === Infinity ? '∞' : distances[vertex.id]}
                    {newlyUpdated[vertex.id] && ' [new]'}
                  </td>
                  <td>{predecessors[vertex.id] === null ? '-' : predecessors[vertex.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="visualization">
        <Visualizer 
          renderFunction={renderGraph} 
          data={graph} 
          width={800} 
          height={500} 
        />
      </div>
      
      {animation.isCompleted && (
        <div className="shortest-path-tree">
          <h3>Final Shortest Path Tree</h3>
          <p>The final shortest path tree from vertex 1 to all reachable vertices:</p>
          <ul className="tree-edges">
            {shortestPathTree.map((edge, index) => (
              <li key={index}>
                {edge.from} → {edge.to} (distance: {distances[edge.to]})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="operation-log">
        <h3>Algorithm Progress</h3>
        <div className="log-entries">
          {processLog.map((logEntry, index) => (
            <div className="log-entry" key={index} style={{fontFamily: 'monospace', fontSize: '14px'}}>
              <strong>{index === 0 ? 'Initial' : `Scan vertex ${logEntry.vertex}`}:</strong>{' '}
              {formatDistances(logEntry.distances, logEntry.newlyUpdated)}{'; '}
              Q={'{' + logEntry.queue.join(',') + '}'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BellmanFordVisualization;