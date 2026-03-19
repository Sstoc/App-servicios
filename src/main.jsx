import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AppProvider } from './context/AppContext'

// NUCLEAR: Clear EVERYTHING (Caches, SW, Storage) on version bump to fix white screens permanently
const APP_CLEAN_VERSION = 'v5'; // Update to trigger a total wipe
if (localStorage.getItem('app_root_version') !== APP_CLEAN_VERSION) {
  // 1. Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      for (const reg of regs) reg.unregister();
    });
  }
  // 2. Clear all Caches
  if ('caches' in window) {
    caches.keys().then(names => {
      for (const name of names) caches.delete(name);
    });
  }
  // 3. Clear Storage
  localStorage.clear();
  sessionStorage.clear();
  
  // 4. Set new version and FORCE RELOAD
  localStorage.setItem('app_root_version', APP_CLEAN_VERSION);
  window.location.reload();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed:', error));
  });

  // Reload page when new service worker takes over
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
