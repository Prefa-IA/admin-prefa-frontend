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

// Hook para detectar si es mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

// Componente wrapper para ToastContainer con detección de mobile
const ResponsiveToastContainer: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <ToastContainer
      position={isMobile ? 'bottom-center' : 'top-right'}
      autoClose={4000}
      hideProgressBar={false}
      limit={3}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
      className="mobile-toast-container"
    />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <>
      <App />
      <ResponsiveToastContainer />
    </>
  </React.StrictMode>
);
