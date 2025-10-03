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
import OidcCallback from './pages/OidcCallback'
import { Navigate } from 'react-router-dom'
import TakingQuiz from './pages/TakingQuiz'
import IssuedQuizzesPage from './pages/IssuedQuizzesPage'
import IssuedQuizInfosPage from './pages/IssuedQuizInfosPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Navigate to="/login" replace />} />
            <Route path="/oauth2/callback" element={<Navigate to="/login" replace />} />
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
              path="/quiz/:quizId/issued" 
              element={
              <ProtectedRoute>
                <IssuedQuizzesPage />
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
            <Route 
              path="/takingquiz" 
              element={
                <ProtectedRoute>
                  <TakingQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/issued/:tokenId" 
              element={
                <ProtectedRoute>
                  <IssuedQuizInfosPage />
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