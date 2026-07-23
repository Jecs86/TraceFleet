import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Importa el Dashboard
import Vehiculos from './pages/Vehiculos';
import VehiculoDetalle from './pages/VehiculoDetalle';
import Combustible from './pages/Combustible';
import CombustibleDetalle from './pages/CombustibleDetalle';
import Conductores from './pages/Conductores';
import NuevoVehiculo from './pages/NuevoVehiculo';
import NuevoConductor from './pages/NuevoConductor';
import AsignarRuta from './pages/AsignarRuta';
import Reportes from './pages/Reportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Nueva ruta del Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />
        <Route path="/combustible" element={<Combustible />} />
        <Route path="/combustible/:id" element={<CombustibleDetalle />} />
        <Route path="/conductores" element={<Conductores />} />
        
        <Route path="/vehiculos/nuevo" element={<NuevoVehiculo />} />
        <Route path="/conductores/nuevo" element={<NuevoConductor />} />
        <Route path="/rutas/asignar" element={<AsignarRuta />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;