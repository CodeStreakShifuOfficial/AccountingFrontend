import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import DocumentCategory from './pages/DocumentCategory.jsx'
import DocumentList from './pages/DocumentList.jsx'
import Pending from './pages/Pending.jsx'
import Urgent from './pages/Urgent.jsx'
import AddTask from './pages/AddTask.jsx'
import AddClient from './pages/AddClient.jsx'
import './App.css'

function AppContent() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="pb-12">
        <Routes>
          <Route
            path="/"
            element={
              <Login
                onForgotPassword={() => navigate('/forgot')}
                onLoginSuccess={() => navigate('/dashboard')}
              />
            }
          />
          <Route path="/forgot" element={<ForgotPassword onBack={() => navigate('/')} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:clientId/:category"
            element={
              <ProtectedRoute>
                <DocumentCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:clientId/:category/list"
            element={
              <ProtectedRoute>
                <DocumentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent"
            element={
              <ProtectedRoute>
                <Urgent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <Pending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-task"
            element={
              <ProtectedRoute>
                <AddTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-client"
            element={
              <ProtectedRoute>
                <AddClient />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login onForgotPassword={() => navigate('/forgot')} onLoginSuccess={() => navigate('/dashboard')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
