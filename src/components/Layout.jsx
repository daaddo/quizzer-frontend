import React, { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { authService } from '../services/auth.js'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  // Keep-alive ping ogni 20 minuti allo status della sessione
  useEffect(() => {
    let isCancelled = false;
    const ping = async () => {
      try {
        await authService.checkServerSessionStatus();
      } catch {}
    };

    // ping immediato
    ping();
    // ogni 10 minuti
    const intervalId = setInterval(ping, 10 * 60 * 1000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const location = useLocation();
  const hideChrome = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App">
      {!hideChrome && <Header />}
      <main className="main-content">
        {children}
      </main>
      {!hideChrome && <Footer />}
    </div>
  )
}

export default Layout 