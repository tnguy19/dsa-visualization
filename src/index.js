import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/components/App';
import './styles.css';
import reportWebVitals from '../src/reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();