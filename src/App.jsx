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
import PortalVacante from './pages/portal/PortalVacante'
import PlantillasCompetencias from './pages/herramientas/PlantillasCompetencias'
import Levantamiento from './pages/herramientas/Levantamiento'
import Cobro from './pages/herramientas/Cobro'
import Metricas from './pages/herramientas/Metricas'
import LevantamientoPublico from './pages/levantamiento/LevantamientoPublico'
import CareersApplyEspontanea from './pages/careers/CareersApplyEspontanea'
import BancoTalento from './pages/BancoTalento'
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
          <Route path="/careers/espontanea" element={<CareersApplyEspontanea />} />
          <Route path="/careers/:vacanteId" element={<CareersDetail />} />
          <Route path="/careers/:vacanteId/apply" element={<CareersApply />} />
          <Route path="/portal/:token" element={<Portal />} />
          <Route path="/portal-vacante/:token" element={<PortalVacante />} />
          <Route path="/levantamiento/:token" element={<LevantamientoPublico />} />

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
                  <Route path="/herramientas/plantillas" element={<PlantillasCompetencias />} />
                  <Route path="/herramientas/levantamiento" element={<Levantamiento />} />
                  <Route path="/herramientas/cobro" element={<Cobro />} />
                  <Route path="/herramientas/metricas" element={<Metricas />} />
                  <Route path="/banco-talento" element={<BancoTalento />} />
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
