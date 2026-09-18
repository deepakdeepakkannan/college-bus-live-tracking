import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>Loading app...</div>}>
        <App />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
