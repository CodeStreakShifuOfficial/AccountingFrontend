import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import DocumentCategory from './pages/DocumentCategory.jsx'
import DocumentList from './pages/DocumentList.jsx'
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/documents/:clientId/:category" element={<DocumentCategory />} />
          <Route path="/documents/:clientId/:category/list" element={<DocumentList />} />
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
