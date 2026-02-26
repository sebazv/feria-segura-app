import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, MapPin, Users, Settings, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/alerts', icon: AlertTriangle, label: 'Alertas' },
    { path: '/admin/map', icon: MapPin, label: 'Mapa' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/settings', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Bottom Nav for Admin */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Back to app link */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ArrowLeft size={16} />
        App
      </Link>

      <Outlet />
    </div>
  );
}
