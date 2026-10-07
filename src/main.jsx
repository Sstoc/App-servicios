import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AppProvider } from './context/AppContext'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { initSentry, captureError } from './lib/sentry'

// Inicializar Sentry antes de renderizar (solo en producción con VITE_SENTRY_DSN)
initSentry();

class RootErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application startup error:', error)
    captureError(error, { componentStack: errorInfo?.componentStack })
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-dvh grid place-items-center bg-slate-50 p-6 text-slate-800">
          <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
            <h1 className="mb-2 text-lg font-bold text-red-600">No se pudo iniciar la aplicación</h1>
            <p className="break-words font-mono text-sm">{this.state.error.message}</p>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

// A service worker caches JavaScript files and can conflict with Vite's dev server.
// Remove any old registration while developing; it stays enabled in production builds.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister())
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AppProvider>
        <App />
        <SpeedInsights />
        <Analytics />
      </AppProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
)

// Register Service Worker for PWA
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        registration.update();
      })
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
