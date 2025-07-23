// =================================================================
// FICHIER : frontend/src/index.js (VERSION CORRIGÉE)
// =================================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// En retirant StrictMode, on s'assure que le composant ne se monte qu'une seule fois
// pendant le développement, ce qui empêche les conflits de useEffect.
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
