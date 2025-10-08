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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<EmailVerification/>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Route richiesta esplicitamente per link email */}
            <Route path="/api/v1/users/reset-password" element={<ResetPassword />} />
            {/* Alias comodo in locale (senza /api) */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth2/callback" element={<OidcCallback />} />
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