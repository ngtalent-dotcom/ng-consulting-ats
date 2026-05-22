import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Vacantes from './pages/Vacantes'
import Pipeline from './pages/Pipeline'
import Candidato from './pages/Candidato'
import CareersList from './pages/careers/CareersList'
import CareersDetail from './pages/careers/CareersDetail'
import CareersApply from './pages/careers/CareersApply'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/careers" element={<CareersList />} />
        <Route path="/careers/:vacanteId" element={<CareersDetail />} />
        <Route path="/careers/:vacanteId/apply" element={<CareersApply />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:clienteId/vacantes" element={<Vacantes />} />
              <Route path="/vacantes/:vacanteId/pipeline" element={<Pipeline />} />
              <Route path="/candidatos/:candidatoId" element={<Candidato />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
