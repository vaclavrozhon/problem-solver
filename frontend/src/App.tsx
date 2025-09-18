import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import OverviewPage from './pages/OverviewPage'
import SolvingPage from './pages/SolvingPage'
import WritingPage from './pages/WritingPage'
import TaskCreationPage from './pages/TaskCreationPage'

function AppContent() {
  const { user, signOut } = useAuth()

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title">
          <span>🔬</span>
          <span>Automatic Researcher Dashboard</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Overview
          </NavLink>
          <NavLink to="/solve" className={({ isActive }) => isActive ? 'active' : ''}>
            Problem Solving
          </NavLink>
          <NavLink to="/write" className={({ isActive }) => isActive ? 'active' : ''}>
            Paper Writing
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => isActive ? 'active' : ''}>
            Create Task
          </NavLink>
        </nav>
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
          <button onClick={signOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/solve" element={<SolvingPage />} />
        <Route path="/write" element={<WritingPage />} />
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
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </BrowserRouter>
  )
}