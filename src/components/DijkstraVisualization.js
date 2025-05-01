import React, { useState, useEffect, useCallback } from 'react';
import Visualizer from './Visualizer';

const DijkstraVisualization = () => {
  const [graph] = useState({
    vertices: [
      { id: 'O', label: 'O', x: 100, y: 300 },
      { id: '1', label: '1', x: 230, y: 200 },
      { id: '2', label: '2', x: 230, y: 400 },
      { id: '3', label: '3', x: 350, y: 100 },
      { id: '4', label: '4', x: 350, y: 300 },
      { id: '5', label: '5', x: 450, y: 400 },
      { id: '6', label: '6', x: 550, y: 350 },
      { id: '7', label: '7', x: 450, y: 150 },
      { id: '8', label: '8', x: 650, y: 200 },
      { id: '9', label: '9', x: 650, y: 400 },
      { id: 'D', label: 'D', x: 800, y: 300 }
    ],

    edges: [
      { from: 'O', to: '1', weight: 3 },
      { from: '1', to: 'O', weight: 3 },
      { from: 'O', to: '2', weight: 4 },
      { from: '2', to: 'O', weight: 4 },
      { from: 'O', to: '4', weight: 7 },
      { from: '4', to: 'O', weight: 7 },
      { from: '1', to: '3', weight: 3 },
      { from: '3', to: '1', weight: 3 },
      { from: '1', to: '4', weight: 3 },
      { from: '4', to: '1', weight: 3 },
      { from: '1', to: '7', weight: 6 },
      { from: '7', to: '1', weight: 6 },
      { from: '2', to: '4', weight: 5 },
      { from: '4', to: '2', weight: 5 },
      { from: '2', to: '5', weight: 3 },
      { from: '5', to: '2', weight: 3 },
      { from: '3', to: '7', weight: 4 },
      { from: '7', to: '3', weight: 4 },
      { from: '4', to: '5', weight: 4 },
      { from: '5', to: '4', weight: 4 },
      { from: '4', to: '6', weight: 2 },
      { from: '6', to: '4', weight: 2 },
      { from: '4', to: '7', weight: 4 },
      { from: '7', to: '4', weight: 4 },
      { from: '4', to: '8', weight: 7 },
      { from: '8', to: '4', weight: 7 },
      { from: '5', to: '6', weight: 3 },
      { from: '6', to: '5', weight: 3 },
      { from: '5', to: '9', weight: 4 },
      { from: '9', to: '5', weight: 4 },
      { from: '6', to: '8', weight: 5 },
      { from: '8', to: '6', weight: 5 },
      { from: '6', to: '9', weight: 3 },
      { from: '9', to: '6', weight: 3 },
      { from: '7', to: '8', weight: 5 },
      { from: '8', to: '7', weight: 5 },
      // Removed edges between nodes 8 and 9
      // { from: '8', to: '9', weight: 5 },
      // { from: '9', to: '8', weight: 5 },
      { from: '8', to: 'D', weight: 4 },
      { from: 'D', to: '8', weight: 4 },
      { from: '9', to: 'D', weight: 5 },
      { from: 'D', to: '9', weight: 5 }
    ]
  });

  const [distances, setDistances] = useState({});
  const [visited, setVisited] = useState([]);
  const [unvisited, setUnvisited] = useState([]);
  const [currentVertex, setCurrentVertex] = useState(null);
  const [step, setStep] = useState(0);
  const [shortestPath, setShortestPath] = useState([]);
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
    const initialUnvisited = [];
    
    graph.vertices.forEach(vertex => {
      initialDistances[vertex.id] = vertex.id === 'O' ? 0 : Infinity;
      initialPredecessors[vertex.id] = null;
      initialNewlyUpdated[vertex.id] = false;
      initialUnvisited.push(vertex.id);
    });
    
    setDistances(initialDistances);
    setPredecessors(initialPredecessors);
    setNewlyUpdated(initialNewlyUpdated);
    setUnvisited(initialUnvisited);
    setVisited([]);
    setCurrentVertex(null);
    setStep(0);
    setShortestPath([]);
    setProcessLog([{
      step: 0,
      vertex: null,
      distances: { ...initialDistances },
      visited: [],
      unvisited: [...initialUnvisited],
      newlyUpdated: { ...initialNewlyUpdated },
      description: 'Initial: D(O)=0, all others=∞'
    }]);
    
    setAnimation({
      isRunning: false,
      isCompleted: false
    });
  }, [graph]);

  const findMinDistanceVertex = useCallback((unvisitedVertices, distances) => {
    let minDistance = Infinity;
    let minVertex = null;
    
    unvisitedVertices.forEach(vertexId => {
      if (distances[vertexId] < minDistance) {
        minDistance = distances[vertexId];
        minVertex = vertexId;
      }
    });
    
    return minVertex;
  }, []);


  const buildShortestPath = useCallback(() => {
    const path = [];
    let currentVertex = 'D';
    
    while (currentVertex !== 'O' && predecessors[currentVertex] !== null) {
      path.unshift({
        from: predecessors[currentVertex],
        to: currentVertex
      });
      currentVertex = predecessors[currentVertex];
    }
    
    setShortestPath(path);
  }, [predecessors]);


  const processNextStep = useCallback(() => {
    const nextVertex = findMinDistanceVertex(unvisited, distances);
    if (nextVertex === null) {
      setAnimation(prev => ({...prev, isCompleted: true, isRunning: false}));
      buildShortestPath();
      return false;
    }
    
    const newVisited = [...visited, nextVertex];
    const newUnvisited = unvisited.filter(v => v !== nextVertex);
    const neighbors = graph.edges
      .filter(edge => edge.from === nextVertex)
      .map(edge => ({ 
        id: edge.to, 
        weight: edge.weight 
      }));
    
    const resetNewlyUpdated = {};
    graph.vertices.forEach(v => {
      resetNewlyUpdated[v.id] = false;
    });
    
    const currentDistances = {...distances};
    const currentPredecessors = {...predecessors};
    
    neighbors.forEach(neighbor => {
      if (newVisited.includes(neighbor.id)) return;
      
      const newDistance = currentDistances[nextVertex] + neighbor.weight;
      
      if (newDistance < currentDistances[neighbor.id]) {
        currentDistances[neighbor.id] = newDistance;
        currentPredecessors[neighbor.id] = nextVertex;
        resetNewlyUpdated[neighbor.id] = true;
      }
    });

    if (nextVertex === 'D') {
      setAnimation(prev => ({...prev, isCompleted: true, isRunning: false}));
      buildShortestPath();
    }

    const newStepCount = step + 1;
    const newLog = {
      step: newStepCount,
      vertex: nextVertex,
      distances: {...currentDistances},
      visited: [...newVisited],
      unvisited: [...newUnvisited],
      newlyUpdated: {...resetNewlyUpdated},
      description: `Scan vertex ${nextVertex}`
    };
    
    setCurrentVertex(nextVertex);
    setVisited(newVisited);
    setUnvisited(newUnvisited);
    setDistances(currentDistances);
    setPredecessors(currentPredecessors);
    setNewlyUpdated(resetNewlyUpdated);
    setStep(newStepCount);
    setProcessLog(prevLog => [...prevLog, newLog]);
    
    return newUnvisited.length > 0 && !newVisited.includes('D');
  }, [unvisited, visited, distances, predecessors, step, graph.edges, graph.vertices, findMinDistanceVertex, buildShortestPath]);

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
      .filter(v => v !== 'D') 
      .sort((a, b) => {
        if (a === 'O') return -1;
        if (b === 'O') return 1;
        return parseInt(a) - parseInt(b);
      })
      .map(v => {
        const val = distances[v] === Infinity ? 'inf' : distances[v];
        return newlyUpdated && newlyUpdated[v] 
          ? `D(${v})=[${val}]` 
          : `D(${v})=${val}`;
      })
      .concat(`D(D)=${distances['D'] === Infinity ? 'inf' : distances['D']}`)
      .join('; ');
  };

  //draw graph
  const renderGraph = (ctx, data, dimensions) => {
    if (!ctx || !data || !dimensions) return;
    
    const { vertices, edges } = data || {};
    if (!vertices || !edges) return;
    

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    const drawnEdges = new Set();
    
    edges.forEach(edge => {
      if (!edge || edge.from === undefined || edge.to === undefined) return;

      const edgeKey = edge.from < edge.to ? `${edge.from}-${edge.to}` : `${edge.to}-${edge.from}`;
      if (drawnEdges.has(edgeKey)) return;
      drawnEdges.add(edgeKey);
      
      const fromVertex = vertices.find(v => v && v.id === edge.from);
      const toVertex = vertices.find(v => v && v.id === edge.to);
      
      if (!fromVertex || !toVertex || 
          fromVertex.x === undefined || fromVertex.y === undefined ||
          toVertex.x === undefined || toVertex.y === undefined) return;
      if (animation.isCompleted && shortestPath.some(e => 
            (e.from === edge.from && e.to === edge.to) || 
            (e.from === edge.to && e.to === edge.from))) {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#5588dd';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(fromVertex.x, fromVertex.y);
      
      const dx = toVertex.x - fromVertex.x;
      const dy = toVertex.y - fromVertex.y;

      ctx.lineTo(toVertex.x, toVertex.y);
      ctx.stroke();
      
      if (edge.weight !== undefined && edge.weight !== null) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
    
        const weightX = fromVertex.x + dx * 0.5;
        const weightY = fromVertex.y + dy * 0.5;
        const textWidth = ctx.measureText(String(edge.weight)).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(weightX - textWidth/2 - 2, weightY - 12, textWidth + 4, 18);
        
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(edge.weight), weightX, weightY);
      }
    });
    

    vertices.forEach(vertex => {
      if (!vertex || vertex.id === undefined || 
          vertex.x === undefined || vertex.y === undefined) return;

      if (vertex.id === currentVertex) {
        ctx.fillStyle = 'red'; //red for current vertex
      } else if (visited.includes(vertex.id)) {
        ctx.fillStyle = 'orange'; //orange for  vertices already visited
      } else if (unvisited.includes(vertex.id) && distances[vertex.id] < Infinity) {
        ctx.fillStyle = 'yellow'; //yellow vertices in queue
      } else {
        ctx.fillStyle = '#cccccc'; //unreachable vertices
      }
      
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(vertex.label, vertex.x, vertex.y);
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
    ctx.fillText(`Step: ${step}`, 20, 30);
    
    if (animation.isCompleted) {
      ctx.fillStyle = '#27ae60'; // Green
      ctx.fillText('Algorithm completed! Shortest path is highlighted in green.', 20, dimensions.height - 30);
      
      const legendX = dimensions.width - 220;
      const legendY = 30; 
      const lineHeight = 25;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(legendX - 10, legendY - 10, 210, 115);
      ctx.strokeStyle = '#ddd';
      ctx.strokeRect(legendX - 10, legendY - 10, 210, 115);
      
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
      
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.arc(legendX + 20, legendY + 3*lineHeight, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText('Visited Vertex', legendX + 50, legendY + 3*lineHeight + 4);
    }
  };

  return (
    <div className="dijkstra-container">
      <h2>Dijkstra's Shortest Path Algorithm</h2>
      <p>Finding the shortest path from vertex O to vertex D in an undirected weighted graph.</p>
      
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
                  <td>{vertex.label}</td>
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
          width={900} 
          height={500} 
        />
      </div>
      
      {animation.isCompleted && (
        <div className="shortest-path">
          <h3>Final Shortest Path</h3>
          <p>The shortest path from O to D:</p>
          <div className="path-display">
            {shortestPath.length > 0 ? (
              <span>O → {shortestPath.map(edge => edge.to).join(' → ')} (total distance: {distances['D']})</span>
            ) : (
              <span>No path found.</span>
            )}
          </div>
        </div>
      )}
      
      <div className="operation-log">
        <h3>Algorithm Progress</h3>
        <div className="log-entries">
          {processLog.map((logEntry, index) => (
            <div className="log-entry" key={index} style={{fontFamily: 'monospace', fontSize: '14px'}}>
              <strong>{index === 0 ? 'Initial' : `Scan vertex ${logEntry.vertex}`}:</strong>{' '}
              {formatDistances(logEntry.distances, logEntry.newlyUpdated)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DijkstraVisualization;