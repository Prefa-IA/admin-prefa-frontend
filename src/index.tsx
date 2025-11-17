import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { Buffer } from 'buffer';

import App from './App';

import './index.css';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.baseURL = process.env['REACT_APP_API_URL'] || 'http://localhost:4000/api';

interface WindowWithBuffer extends Window {
  Buffer?: typeof Buffer;
}

// Polyfill para librerías que esperan Buffer (shpjs)
const windowWithBuffer = window as WindowWithBuffer;
if (!windowWithBuffer.Buffer) {
  windowWithBuffer.Buffer = Buffer;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        limit={3}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  </React.StrictMode>
);
