import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import axios from 'axios';
import App from './App';
import { Buffer } from 'buffer';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Polyfill para librerías que esperan Buffer (shpjs)
if (!(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 