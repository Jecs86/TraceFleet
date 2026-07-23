import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoHorizontal from '../assets/images/logo-horizontal.png';
import logoVertical from '../assets/images/logo-vertical.png';
import { usuarioService } from '../services/usuario.service'; // Asegúrate de que la ruta sea la correcta

export default function Login() {
  const navigate = useNavigate();
  
  // Estados para capturar los datos del formulario
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setError(null);
    setCargando(true);

    try {
      // Llamamos a tu servicio ya creado
      await usuarioService.login({ correo, contrasena });
      
      // Si todo sale bien, redirigimos al dashboard
      navigate('/dashboard'); 
    } catch (err) {
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E2E8F0]">
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 bg-white shadow-sm z-10 relative">
        <Link to="/">
          <img 
            src={logoHorizontal} 
            alt="TraceFleet Logo" 
            className="h-10 md:h-12 object-contain drop-shadow-sm" 
          />
        </Link>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="bg-white px-8 py-10 md:px-12 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg">
          
          <div className="flex flex-col items-center justify-center mb-4">
            <img 
              src={logoVertical} 
              alt="Icono TF" 
              className="h-10 mb-2 object-contain" 
            />
            <h2 className="text-xl md:text-2xl font-bold text-center text-[#1A2847]">
              Iniciar Sesión
            </h2>
          </div>
          
          <hr className="border-gray-300 mb-8" />

          {/* Mostrar mensaje de error si existe */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">
              {error}
            </div>
          )}

          {/* Formulario (ahora con evento onSubmit) */}
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            
            {/* Fila: Correo */}
            <div className="flex items-center gap-4">
              <label className="w-28 text-right font-bold text-black text-lg">
                Correo:
              </label>
              <input 
                type="email" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="flex-1 bg-gray-200 shadow-inner rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3779CB] transition-all"
              />
            </div>

            {/* Fila: Contraseña */}
            <div className="flex items-center gap-4">
              <label className="w-28 text-right font-bold text-black text-lg">
                Contraseña:
              </label>
              <input 
                type="password" 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className="flex-1 bg-gray-200 shadow-inner rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3779CB] transition-all"
              />
            </div>

            <div className="flex justify-end mt-2 mb-4">
              <a href="#" className="text-[#3779CB] underline text-sm font-semibold hover:text-[#2c62a6] transition-colors">
                ¿No recuerdas tu contraseña?
              </a>
            </div>

            {/* Botón Ingresar */}
            <div className="flex justify-center">
              <button 
                type="submit" 
                disabled={cargando}
                className="bg-[#3779CB] text-white text-lg font-bold py-2.5 px-12 rounded-lg shadow-md hover:shadow-lg hover:bg-[#2c62a6] transition-all duration-200 hover:-translate-y-1 disabled:opacity-50"
              >
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>

          </form>
        </div>
        
      </main>
    </div>
  );
}