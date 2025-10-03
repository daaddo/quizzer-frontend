import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { isAuthenticated, username, logout, isLoading } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Errore logout:', error);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/src/assets/logo.svg" alt="Quizzer" width="36" height="36" style={{ display: 'block' }} />
            Quizzer
          </Link>
          
          <div className="nav-content">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              {isAuthenticated && (
                <li><Link to="/dashboard">Dashboard</Link></li>
              )}
            </ul>

            <div className="nav-auth">
              {isLoading ? (
                <div className="auth-loading-indicator">
                  <span className="loading-dot">⏳</span>
                </div>
              ) : isAuthenticated ? (
                <div className="user-menu">
                  <span className="user-greeting">
                    Ciao, <strong>{username}</strong>
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-small btn-logout"
                    title="Esci dall'account"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                location.pathname === '/login' ? null : (
                  <Link to="/login" className="btn btn-small btn-login">
                    Accedi
                  </Link>
                )
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header 