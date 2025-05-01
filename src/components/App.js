import React, { useState } from 'react';
import FibonacciHeap from './FibonacciHeap';
import RankPairingHeap from './RankPairingHeap';
import DijkstraVisualization from './DijkstraVisualization';
import FloydWarshallVisualization from './FloydWarshallVisualization'; 
import BellmanFordVisualization from './BellmanFordVisualization';

function App() {
  const [currentVisualization, setCurrentVisualization] = useState('fibonacci');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Algorithm & Data Structure Visualizer</h1>
        <nav>
          <button 
            className={currentVisualization === 'fibonacci' ? 'active' : ''}
            onClick={() => setCurrentVisualization('fibonacci')}
          >
            Fibonacci Heap
          </button>
          <button 
            className={currentVisualization === 'rankpairing' ? 'active' : ''}
            onClick={() => setCurrentVisualization('rankpairing')}
          >
            Rank-Pairing Heap
          </button>
          <button 
            className={currentVisualization === 'bellmanford' ? 'active' : ''}
            onClick={() => setCurrentVisualization('bellmanford')}
          >
            Bellman-Ford Algorithm
          </button>
          <button 
            className={currentVisualization === 'dijkstra' ? 'active' : ''}
            onClick={() => setCurrentVisualization('dijkstra')}
          >
            Dijkstra's Algorithm
          </button>
          <button 
            className={currentVisualization === 'floydwarshall' ? 'active' : ''}
            onClick={() => setCurrentVisualization('floydwarshall')}
          >
            Floyd-Warshall Algorithm
          </button>
        </nav>
      </header>
      
      <main className="visualization-container">
        {currentVisualization === 'fibonacci' && <FibonacciHeap />}
        {currentVisualization === 'rankpairing' && <RankPairingHeap />}
        {currentVisualization === 'bellmanford' && <BellmanFordVisualization />}
        {currentVisualization === 'dijkstra' && <DijkstraVisualization />}
        {currentVisualization === 'floydwarshall' && <FloydWarshallVisualization />}
      </main>
      
      <footer>
        <p>EC504 Final project</p>
      </footer>
    </div>
  );
};

export default App;