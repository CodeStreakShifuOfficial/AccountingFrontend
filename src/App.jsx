import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState('login')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="pb-12">
        {page === 'dashboard' ? (
          <Dashboard />
        ) : page === 'forgot' ? (
          <ForgotPassword onBack={() => setPage('login')} />
        ) : (
          <Login
            onForgotPassword={() => setPage('forgot')}
            onLoginSuccess={() => setPage('dashboard')}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
