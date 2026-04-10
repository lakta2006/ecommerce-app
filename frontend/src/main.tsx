import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ToastProvider } from './components/ui'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
