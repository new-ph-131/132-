import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PharoahProvider } from './context/PharoahContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PharoahProvider>
      <App />
    </PharoahProvider>
  </React.StrictMode>
);
