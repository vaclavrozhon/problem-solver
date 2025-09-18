import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import GoogleLogin from './components/auth/GoogleLogin'
import UserProfile from './components/auth/UserProfile'
import OverviewPage from './pages/OverviewPage'
import SolvingPage from './pages/SolvingPage'
import UserProblemsPage from './pages/UserProblemsPage'
import WritingPage from './pages/WritingPage'
import TaskCreationPage from './pages/TaskCreationPage'

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <GoogleLogin />;
  }

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
          <NavLink to="/problems" className={({ isActive }) => isActive ? 'active' : ''}>
            My Problems
          </NavLink>
          <NavLink to="/solve" className={({ isActive }) => isActive ? 'active' : ''}>
            Public Problems
          </NavLink>
          <NavLink to="/write" className={({ isActive }) => isActive ? 'active' : ''}>
            Paper Writing
          </NavLink>
        </nav>
        <div className="app-user">
          <UserProfile />
        </div>
      </header>

      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/problems" element={<UserProblemsPage />} />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}