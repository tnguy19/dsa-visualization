// server.js - Node.js backend server for the algorithm visualization app

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API endpoints

// Get algorithm information
app.get('/api/algorithms', (req, res) => {
  const algorithms = [
    {
      id: 'fibonacci',
      name: 'Fibonacci Heap',
      description: 'A collection of trees with min-heap ordering. Offers O(1) amortized time for many operations.',
      operations: ['insert', 'extract-min', 'decrease-key']
    },
    {
      id: 'rankpairing',
      name: 'Rank-Pairing Heap',
      description: 'A self-adjusting heap data structure with good amortized complexity.',
      operations: ['insert', 'remove-min', 'merge']
    },
    {
      id: 'assignment',
      name: 'Assignment Problem',
      description: 'Optimally assigns n workers to n tasks to minimize total cost.',
      operations: ['solve', 'random']
    }
  ];
  
  res.json(algorithms);
});

// Get example datasets for the assignment problem
app.get('/api/assignment/examples', (req, res) => {
  const examples = [
    {
      id: 'small',
      name: 'Small Example (4x4)',
      costMatrix: [
        [11, 20, 13, 15],
        [15, 18, 13, 12],
        [17, 14, 20, 28],
        [21, 14, 15, 25]
      ]
    },
    {
      id: 'medium',
      name: 'Medium Example (5x5)',
      costMatrix: [
        [12, 23, 15, 18, 19],
        [16, 17, 12, 16, 21],
        [14, 26, 18, 14, 16],
        [19, 15, 22, 17, 24],
        [22, 18, 20, 15, 13]
      ]
    },
    {
      id: 'large',
      name: 'Large Example (6x6)',
      costMatrix: [
        [14, 22, 16, 25, 18, 20],
        [12, 16, 14, 21, 16, 19],
        [19, 25, 18, 16, 15, 24],
        [22, 16, 14, 17, 26, 18],
        [15, 23, 19, 18, 21, 16],
        [17, 15, 21, 24, 19, 22]
      ]
    }
  ];
  
  res.json(examples);
});

// Generate a random assignment problem matrix
app.get('/api/assignment/random', (req, res) => {
  const size = parseInt(req.query.size) || 4;
  const min = parseInt(req.query.min) || 10;
  const max = parseInt(req.query.max) || 30;
  
  // Generate random cost matrix
  const costMatrix = Array(size).fill().map(() => 
    Array(size).fill().map(() => Math.floor(Math.random() * (max - min + 1)) + min)
  );
  
  res.json({ costMatrix });
});

// Fallback - serve the React app for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// package.json for the server
/*
{
  "name": "algorithm-visualizer-server",
  "version": "1.0.0",
  "description": "Backend server for algorithm visualization app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "dev-full": "concurrently \"npm run dev\" \"npm run client\""
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "concurrently": "^6.2.0",
    "nodemon": "^2.0.12"
  }
}
*/