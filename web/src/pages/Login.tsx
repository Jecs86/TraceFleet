import { Link } from 'react-router-dom';
import logoHorizontal from '../assets/images/logo-horizontal.png';
import logoVertical from '../assets/images/logo-vertical.png'; // Importamos el logo de la TF

export default function Login() {
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
        
        <Link
          to="/login"
          className="bg-[#3779CB] text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-[#2c62a6] transition-all duration-200"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* CAJA DE INICIO DE SESIÓN */}
        <div className="bg-white px-8 py-10 md:px-12 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg">
          
          {/* Logo Pequeño y Título */}
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
          
          {/* Línea Separadora */}
          <hr className="border-gray-300 mb-8" />

          {/* Formulario */}
          <form className="flex flex-col gap-5">
            
            {/* Fila: Nombre */}
            <div className="flex items-center gap-4">
              <label className="w-28 text-right font-bold text-black text-lg">
                Nombre:
              </label>
              <input 
                type="text" 
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
                className="flex-1 bg-gray-200 shadow-inner rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3779CB] transition-all"
              />
            </div>

            {/* Enlace de recuperación */}
            <div className="flex justify-end mt-2 mb-4">
              <a 
                href="#" 
                className="text-[#3779CB] underline text-sm font-semibold hover:text-[#2c62a6] transition-colors"
              >
                ¿No recuerdas tu contraseña?
              </a>
            </div>

            {/* Botón Ingresar */}
            <div className="flex justify-center">
              <button 
                type="button" 
                className="bg-[#3779CB] text-white text-lg font-bold py-2.5 px-12 rounded-lg shadow-md hover:shadow-lg hover:bg-[#2c62a6] transition-all duration-200 hover:-translate-y-1"
              >
                Ingresar
              </button>
            </div>

          </form>
        </div>
        
      </main>
    </div>
  );
}