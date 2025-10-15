import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
      <App />
  )
} catch (error) {
  console.error('Error mounting app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Error Loading App</h2>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
} 