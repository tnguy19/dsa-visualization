import React, { useState, useEffect, useCallback } from 'react';
import Visualizer from './Visualizer';

const FloydWarshallVisualization = () => {
  //graph def based on homework
  const [graph] = useState({
    vertices: [
      { id: 1, x: 100, y: 300 },
      { id: 2, x: 300, y: 100 },
      { id: 3, x: 300, y: 350 },
      { id: 4, x: 500, y: 200 }
    ],
    edges: [
      { from: 1, to: 2, weight: 3 },
      { from: 1, to: 3, weight: 12 },
      { from: 2, to: 3, weight: 12 },
      { from: 2, to: 4, weight: 5 },
      { from: 3, to: 1, weight: 5 },
      { from: 3, to: 2, weight: 7 },
      { from: 4, to: 3, weight: 3 }
    ]
  });

  // matrix step by step
  const [predefinedMatrices] = useState([
    //initial matrix
    [
      [0, 3, 12, Infinity],
      [Infinity, 0, 12, 5],
      [5, 7, 0, Infinity],
      [Infinity, Infinity, 3, 0]
    ],
    //at k=1 (vertex 1 as intermediate)
    [
      [0, 3, 12, Infinity],
      [Infinity, 0, 12, 5],
      [5, 7, 0, Infinity],
      [Infinity, Infinity, 3, 0]
    ],
    //at k=2 (vertex 2 as intermediate)
    [
      [0, 3, 12, 8],
      [Infinity, 0, 12, 5],
      [5, 7, 0, 12],
      [Infinity, Infinity, 3, 0]
    ],
    //at k=3 (vertex 3 as intermediate)
    [
      [0, 3, 12, 8],
      [17, 0, 12, 5],
      [5, 7, 0, 12],
      [8, 10, 3, 0]
    ],
    // at k=4 (vertex 4 as intermediate)
    [
      [0, 3, 11, 8],
      [13, 0, 8, 5],
      [5, 7, 0, 12],
      [8, 10, 3, 0]
    ]
  ]);

  const [distances, setDistances] = useState([]);
  const [step, setStep] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [processLog, setProcessLog] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [pathHighlight, setPathHighlight] = useState(null);
  
  //animation speed state for slider, state
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const getTimeoutValue = () => 2100 - animationSpeed;
  const [animation, setAnimation] = useState({
    isRunning: false,
    isCompleted: false
  });


  const initializeAlgorithm = useCallback(() => {

    const initialDistances = JSON.parse(JSON.stringify(predefinedMatrices[0]));
    const initialLog = {
      title: 'Initial distances',
      distances: JSON.parse(JSON.stringify(initialDistances)),
      highlighted: [],
      pathHighlight: null
    };
    
    setDistances(initialDistances);
    setStep(0);
    setIteration(0);
    setProcessLog([initialLog]);
    setHighlightedCells([]);
    setPathHighlight(null);
    
    //reset state for animation 
    setAnimation({
      isRunning: false,
      isCompleted: false
    });
    
  }, [predefinedMatrices]);

  //step by step process
  const processNextStep = useCallback(() => {
    const n = graph.vertices.length;
    
    //if complete 
    if (iteration >= n) {
      setAnimation(prev => ({...prev, isCompleted: true, isRunning: false}));
      return false;
    }

    const k = iteration; 
    const nextMatrix = predefinedMatrices[k + 1];
    const currentMatrix = predefinedMatrices[k];
    
    const updatedCells = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (nextMatrix[i][j] !== currentMatrix[i][j]) {
          updatedCells.push([i, j]);
          
          const updateLog = {
            title: `Step ${step + 1}: Updated D(${i+1},${j+1}) through vertex ${k+1}`,
            distances: JSON.parse(JSON.stringify(nextMatrix)),
            highlighted: [[i, j]],
            pathHighlight: {
              from: i,
              through: k,
              to: j
            }
          };
          
          setProcessLog(prev => [...prev, updateLog]);
          setStep(prev => prev + 1);
        }
      }
    }
    
    if (updatedCells.length === 0) {
      const noUpdateLog = {
        title: `Iteration k=${k+1} completed, no updates`,
        distances: JSON.parse(JSON.stringify(nextMatrix)),
        highlighted: [],
        pathHighlight: null
      };
      
      setProcessLog(prev => [...prev, noUpdateLog]);
    }

    const iterationLog = {
      title: `Iteration k=${k+1} completed`,
      distances: JSON.parse(JSON.stringify(nextMatrix)),
      highlighted: updatedCells,
      pathHighlight: null
    };
    
    setDistances(nextMatrix);
    setIteration(prev => prev + 1);
    setProcessLog(prev => [...prev, iterationLog]);
    setHighlightedCells(updatedCells);
    setPathHighlight(null);
    
    return iteration < n - 1; 
  }, [iteration, step, predefinedMatrices, graph.vertices.length]);

  //control functions
  const handleStepClick = () => {
    if (animation.isCompleted) return;
    processNextStep();
  };
  
  const handleRunClick = () => {
    if (animation.isCompleted) return;
    
    //set running state
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
    
    //schedule next step
    const timeoutId = setTimeout(() => {
      const hasMoreSteps = processNextStep();
      
      //autostop when complete
      if (!hasMoreSteps) {
        setAnimation(prev => ({...prev, isRunning: false, isCompleted: true}));
      }
    }, getTimeoutValue());
    
    return () => clearTimeout(timeoutId);
  }, [animation.isRunning, processNextStep, getTimeoutValue]);

  useEffect(() => {
    initializeAlgorithm();
  }, [initializeAlgorithm]);

  //format distance value for display
  const formatDistance = (distance) => {
    return distance === Infinity ? 'inf' : distance;
  };

  //render the graph visualization
  const renderGraph = (ctx, data, dimensions) => {
    if (!ctx || !data || !dimensions) return;
    
    const { vertices, edges } = data || {};
    if (!vertices || !edges) return;
    

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    edges.forEach(edge => {
      if (!edge || edge.from === undefined || edge.to === undefined) return;
      
      const fromVertex = vertices.find(v => v && v.id === edge.from);
      const toVertex = vertices.find(v => v && v.id === edge.to);
      
      //skip if vertices don't exist
      if (!fromVertex || !toVertex) return;
      
      const isHighlighted = pathHighlight && 
                          ((pathHighlight.from === edge.from - 1 && pathHighlight.through === edge.to - 1) ||
                           (pathHighlight.through === edge.from - 1 && pathHighlight.to === edge.to - 1));
      
      //set edge styling
      if (isHighlighted) {
        ctx.strokeStyle = '#ff6b6b'; //red for highlighted path
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#2c3e50'; //blue for all nodes
        ctx.lineWidth = 2.5;
      }
      
      const reciprocalEdge = edges.find(e => e.from === edge.to && e.to === edge.from);
      const hasBidirectionalEdge = !!reciprocalEdge;
      const offset = hasBidirectionalEdge ? 15 : 0;
      
      drawOffsetEdge(ctx, fromVertex, toVertex, edge.weight, offset, hasBidirectionalEdge);
    });
    
    //offeset tio avoid edge overlap
    function drawOffsetEdge(ctx, fromVertex, toVertex, weight, offset, isBidirectional) {
      // Calculate the direction vector
      const dx = toVertex.x - fromVertex.x;
      const dy = toVertex.y - fromVertex.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      const nx = dx / length;
      const ny = dy / length;
      
      const perpX = -ny;
      const perpY = nx;
      
      let startX = fromVertex.x;
      let startY = fromVertex.y;
      let endX = toVertex.x;
      let endY = toVertex.y;
      
      if (isBidirectional) {
        startX += perpX * offset;
        startY += perpY * offset;
        endX += perpX * offset;
        endY += perpY * offset;
      }
    
      const vertexRadius = 20;
      const adjustedStartX = startX + nx * vertexRadius;
      const adjustedStartY = startY + ny * vertexRadius;
      const adjustedEndX = endX - nx * vertexRadius;
      const adjustedEndY = endY - ny * vertexRadius;
      
      ctx.beginPath();
      ctx.moveTo(adjustedStartX, adjustedStartY);
      ctx.lineTo(adjustedEndX, adjustedEndY);
      ctx.stroke();
      
      drawArrowhead(ctx, adjustedEndX, adjustedEndY, nx, ny);
      
      if (weight !== undefined && weight !== null) {
        let weightOffsetX = 0;
        let weightOffsetY = 0;
        
        if (isBidirectional) {
          weightOffsetX = perpX * 10;
          weightOffsetY = perpY * 10;
        } else {
          weightOffsetX = perpX * 15;
          weightOffsetY = perpY * 15;
        }
        
        const weightX = adjustedStartX + (adjustedEndX - adjustedStartX) * 0.5 + weightOffsetX;
        const weightY = adjustedStartY + (adjustedEndY - adjustedStartY) * 0.5 + weightOffsetY;
    
        ctx.font = 'bold 16px Arial';
        const textWidth = ctx.measureText(String(weight)).width;
        const padding = 6;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          weightX - textWidth/2 - padding/2, 
          weightY - 8 - padding/2, 
          textWidth + padding, 
          20 + padding
        );
        
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          weightX - textWidth/2 - padding/2, 
          weightY - 8 - padding/2, 
          textWidth + padding, 
          20 + padding
        );
        
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(weight), weightX, weightY);
      }
    }
    
    function drawArrowhead(ctx, x, y, dirX, dirY) {
      const arrowSize = 12; 
      const angle = Math.atan2(dirY, dirX);
      const sideAngle = Math.PI / 5; 
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x - arrowSize * Math.cos(angle - sideAngle),
        y - arrowSize * Math.sin(angle - sideAngle)
      );
      ctx.lineTo(
        x - arrowSize * Math.cos(angle + sideAngle),
        y - arrowSize * Math.sin(angle + sideAngle)
      );
      ctx.closePath();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    //function for drawing vertics
    vertices.forEach(vertex => {
      if (!vertex || vertex.id === undefined || 
          vertex.x === undefined || vertex.y === undefined) return;
      
      const isHighlighted = pathHighlight && 
                          (pathHighlight.from === vertex.id - 1 || 
                           pathHighlight.through === vertex.id - 1 || 
                           pathHighlight.to === vertex.id - 1);
      const isIntermediate = iteration > 0 && (vertex.id - 1) === (iteration - 1);
      
      if (isHighlighted) {
        ctx.fillStyle = '#ff6b6b'; //red for highlighted vertices
      } else if (isIntermediate) {
        ctx.fillStyle = '#ffbe76'; //orange for the current intermediate vertex
      } else {
        ctx.fillStyle = '#74b9ff'; //blue for regular vertics
      }
      
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = 'black';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(vertex.id), vertex.x, vertex.y);
    });
    
    //draw algorithm state information
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Iteration: k=${iteration > 0 ? iteration : 'initial'} (vertex ${iteration > 0 ? iteration : '-'} as intermediate)`, 20, 30);
    
    //make completion message if algorithm is complete
    if (animation.isCompleted) {
      ctx.fillStyle = '#27ae60'; 
      ctx.fillText('Algorithm completed! Final distances computed.', 20, dimensions.height - 30);
    }
    
    // draw legend
    drawLegend(ctx, dimensions.width - 200, 20, 180, 110);
    
    function drawLegend(ctx, x, y, width, height) {
      // Draw legend background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 1;
      
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Vertex Colors', x + width / 2, y + 15);
      
      const itemX = x + 25;
      let itemY = y + 40;
      const itemSpacing = 25;
      
      drawLegendItem(itemX, itemY, '#74b9ff', 'Regular vertex');
      
      itemY += itemSpacing;
      drawLegendItem(itemX, itemY, '#ffbe76', 'Current intermediate vertex');
      
      function drawLegendItem(x, y, color, text) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + 15, y);
      }
    }
  };

  return (
    <div className="floyd-warshall-container">
      <h2>Floyd-Warshall All-Pairs Shortest Path Algorithm</h2>
      <p>Finding shortest paths between all pairs of vertices in a directed weighted graph.</p>
      
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
      
      <div className="content-wrapper">
        <div className="visualization-panel">
          <h3>Graph Visualization</h3>
          <div className="visualization">
            <Visualizer 
              renderFunction={renderGraph} 
              data={graph} 
              width={650} 
              height={400} 
            />
          </div>
        </div>
        
        <div className="distance-matrix-panel">
          <h3>Distance Matrix (D[i,j])</h3>
          <div className="distance-matrix">
            <table>
              <thead>
                <tr>
                  <th>D[i,j]</th>
                  {graph.vertices.map(v => (
                    <th key={`header-${v.id}`}>j={v.id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {distances.map((row, i) => (
                  <tr key={`row-${i}`}>
                    <th>i={i+1}</th>
                    {row.map((distance, j) => {
                      const isHighlighted = highlightedCells.some(cell => cell[0] === i && cell[1] === j);
                      return (
                        <td 
                          key={`cell-${i}-${j}`}
                          className={isHighlighted ? 'highlighted-cell' : ''}
                        >
                          {formatDistance(distance)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="iteration-log">
        <h3>Algorithm Progress</h3>
        <div className="log-entries">
          {processLog.map((entry, index) => (
            <div key={index} className="log-entry">
              <div className="log-title">{entry.title}</div>
              <table className="log-matrix">
                <thead>
                  <tr>
                    <th>D[i,j]</th>
                    {graph.vertices.map(v => (
                      <th key={`log-header-${index}-${v.id}`}>j={v.id}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entry.distances.map((row, i) => (
                    <tr key={`log-row-${index}-${i}`}>
                      <th>i={i+1}</th>
                      {row.map((distance, j) => {
                        const isHighlighted = entry.highlighted && 
                                            entry.highlighted.some(cell => cell[0] === i && cell[1] === j);
                        return (
                          <td 
                            key={`log-cell-${index}-${i}-${j}`}
                            className={isHighlighted ? 'highlighted-cell' : ''}
                          >
                            {formatDistance(distance)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default FloydWarshallVisualization;