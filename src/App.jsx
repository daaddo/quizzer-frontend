import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import EmailVerification from './pages/EmailVerification'
import Dashboard from './pages/Dashboard'
import QuizDetails from './pages/QuizDetails'
import TestExecution from './pages/TestExecution'
import TestResults from './pages/TestResults'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<EmailVerification />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:quizId" 
              element={
                <ProtectedRoute>
                  <QuizDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test/:quizId" 
              element={
                <ProtectedRoute>
                  <TestExecution />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test/:quizId/results" 
              element={
                <ProtectedRoute>
                  <TestResults />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App 