import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Vacantes from './pages/Vacantes'
import Pipeline from './pages/Pipeline'
import Candidato from './pages/Candidato'
import CareersList from './pages/careers/CareersList'
import CareersDetail from './pages/careers/CareersDetail'
import CareersApply from './pages/careers/CareersApply'
import Portal from './pages/portal/Portal'
import './index.css'

function Privado({ children }) {
  const { session, cargandoAuth } = useAuth()
  if (cargandoAuth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ color: '#94a3b8', fontSize: 15 }}>Cargando...</div>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Portales públicos — sin auth */}
          <Route path="/careers" element={<CareersList />} />
          <Route path="/careers/:vacanteId" element={<CareersDetail />} />
          <Route path="/careers/:vacanteId/apply" element={<CareersApply />} />
          <Route path="/portal/:token" element={<Portal />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* ATS interno — requiere sesión */}
          <Route path="/*" element={
            <Privado>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/clientes/:clienteId/vacantes" element={<Vacantes />} />
                  <Route path="/vacantes/:vacanteId/pipeline" element={<Pipeline />} />
                  <Route path="/candidatos/:candidatoId" element={<Candidato />} />
                </Routes>
              </Layout>
            </Privado>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
