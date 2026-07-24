import logoHorizontal from '../assets/images/logo-horizontal.png';
import logoVertical from '../assets/images/logo-vertical.png';
import Button from '../components/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg relative">
      
      {/* HEADER FLOTANTE (No empuja el contenido central hacia abajo) */}
      <header className="absolute top-0 w-full flex justify-between items-center px-8 py-6 z-10">
        
        {/* Marca horizontal más grande */}
        <img 
          src={logoHorizontal} 
          alt="TraceFleet Logo" 
          className="h-16 md:h-20 object-contain drop-shadow-sm" 
        />
        
        {/* Botón Iniciar Sesión */}
        <Button
          to="/login"
          className="py-2 px-6"
        >
          Iniciar Sesión
        </Button>
      </header>

      {/* CONTENIDO CENTRAL (Perfectamente alineado al medio de la pantalla) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Caja central con sombra para el Logo y el H1 */}
        <div className="bg-surface px-16 py-12 rounded-2xl shadow-lg border border-border flex flex-col items-center justify-center mb-8">
          <img
            src={logoVertical}
            alt="TF Logo"
            className="w-36 md:w-48 mb-4 object-contain"
          />
          {/* Texto TraceFleet en Azul Navy Oscuro */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-text-heading tracking-tight">
            TraceFleet
          </h1>
        </div>

        {/* Botón Iniciar Central */}
        <Button
          to="/login"
          className="text-xl py-3.5 px-20"
        >
          Iniciar
        </Button>
        
      </main>
    </div>
  );
}