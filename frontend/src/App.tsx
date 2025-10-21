import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import OverviewPage from './pages/OverviewPage'
import SolvingPage from './pages/SolvingPage'
import TaskCreationPage from './pages/TaskCreationPage'
import AuthCallback from './pages/AuthCallback'
import { getCredits } from './api'

function AppContent() {
  const { user, signOut } = useAuth()
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const d = await getCredits()
        const available = Number(d?.credits_available ?? (Math.max(0, Number(d?.credits_limit || 0) - Number(d?.credits_used || 0))))
        if (mounted) setCreditsLeft(available)
      } catch {
        if (mounted) setCreditsLeft(null)
      }
    }
    load()
    const id = setInterval(load, 30000)
    return () => { mounted = false; clearInterval(id) }
  }, [user?.email])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title">
          <span>🔬</span>
          <span>Automatic Researcher</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Overview
          </NavLink>
          <NavLink to="/solve" className={({ isActive }) => isActive ? 'active' : ''}>
            Problems
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => isActive ? 'active' : ''}>
            Create Problem
          </NavLink>
        </nav>
        <div className="user-info">
          {creditsLeft !== null && (
            <span className="user-email" style={{ marginRight: '12px' }}>
              💳 {creditsLeft.toFixed(2)} credits
            </span>
          )}
          <span className="user-email">{user?.email}</span>
          <button onClick={signOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/solve" element={<SolvingPage />} />
        <Route path="/create" element={<TaskCreationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="app-footer">
        <div className="small-font">
          Automatic Researcher | 
          Last refresh: {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}