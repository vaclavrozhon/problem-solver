import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Automatic Researcher (React)</h1>
      <p>Backend at /backend (FastAPI). Implementing login and problems next.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

