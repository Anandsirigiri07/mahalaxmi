import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with automatic prompt reload
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New Mahalaxmi PWA version available.');
  },
  onOfflineReady() {
    console.log('Mahalaxmi PWA offline shell ready.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
