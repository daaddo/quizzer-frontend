import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import { initCsrf } from '../services/csrf.js'


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

  const handleInitCsrf = async () => {
    try {
      const res = await initCsrf(true);
      console.log('CSRF inizializzato:', res);
    } catch (error) {
      console.error('Errore inizializzazione CSRF:', error);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="logo-badge">
              <img src={logo} alt="Quizzer" />
            </span>
            Quizzer
          </Link>
          
          <div className="nav-content">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/public-quizzes">Quiz Pubblici</Link></li>
              {isAuthenticated && (
                <li><Link to="/dashboard">Dashboard</Link></li>
              )}
            </ul>

            <div className="nav-auth">
              <button
                onClick={handleInitCsrf}
                className="btn btn-small"
                title="Inizializza CSRF"
              >
                CSRF
              </button>
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