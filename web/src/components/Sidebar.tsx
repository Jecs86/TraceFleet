import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Map, Droplet, 
  Wrench, FileText, Folder, Settings, UserCircle 
} from 'lucide-react';
import logoVertical from '../assets/images/logo-vertical.png';

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehículos', path: '/vehiculos', icon: Truck },
    { name: 'Conductores', path: '/conductores', icon: UserCircle },
    { name: 'Rutas', path: '/rutas/asignar', icon: Map },
    { name: 'Combustible', path: '/combustible', icon: Droplet },
    { name: 'Mantenimiento', path: '/mantenimiento', icon: Wrench },
    { name: 'Reportes', path: '/reportes', icon: FileText },
    { name: 'Documentos', path: '/documentos', icon: Folder },
  ];

  const isActive = (path: string) => {
    // Para rutas específicas como /vehiculos o /conductores, queremos coincidir con sus subrutas también
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    // Removemos la parte final para comparar como prefijo
    const base = path.split('/')[1];
    return currentPath.startsWith(`/${base}`);
  };

  return (
    <aside className="w-64 bg-secondary flex flex-col shadow-lg z-20 shrink-0">
      <div className="flex flex-col items-center pt-8 pb-6 border-b border-white/10">
        <img src={logoVertical} alt="TraceFleet Logo" className="h-12 object-contain mb-2" />
        <h1 className="text-xl font-extrabold text-white tracking-tight mb-6">TraceFleet</h1>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10 w-10/12">
          <UserCircle className="text-primary w-8 h-8" />
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-white">José</span>
            <span className="text-xs text-slate-300">Administrador</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link 
                  to={item.path} 
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                    active 
                      ? 'bg-white/10 border-r-4 border-primary text-primary font-semibold' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white rounded-md transition-colors">
          <Settings className="w-5 h-5" />
          Configuración
        </button>
      </div>
    </aside>
  );
}
