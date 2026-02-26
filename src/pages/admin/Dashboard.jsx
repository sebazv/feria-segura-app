import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Plus, Users, BarChart3, Settings, MapPin, Clock, AlertTriangle } from 'lucide-react';

// Demo data
const demoStats = {
  totalAlerts: 156,
  todayAlerts: 12,
  insecurityAlerts: 89,
  medicalAlerts: 67,
  activeUsers: 45,
  resolvedAlerts: 142
};

const recentAlerts = [
  { id: 1, type: 'insecurity', location: 'Sector A - Puesto 23', time: '2 min atrás', status: 'active' },
  { id: 2, type: 'medical', location: 'Sector B - Puesto 45', time: '15 min atrás', status: 'active' },
  { id: 3, type: 'insecurity', location: 'Sector C - Puesto 12', time: '32 min atrás', status: 'resolved' },
  { id: 4, type: 'medical', location: 'Sector A - Puesto 8', time: '45 min atrás', status: 'resolved' },
  { id: 5, type: 'insecurity', location: 'Sector B - Puesto 31', time: '1 h atrás', status: 'resolved' },
];

export default function AdminDashboard() {
  const [stats] = useState(demoStats);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Panel de Administración
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Feria Segura — Admin
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard 
          icon={AlertTriangle} 
          label="Alertas Hoy" 
          value={stats.todayAlerts} 
          color="text-red-600" 
          bgColor="bg-red-100 dark:bg-red-900/30" 
        />
        <StatCard 
          icon={ShieldAlert} 
          label="Inseguridad" 
          value={stats.insecurityAlerts} 
          color="text-red-600" 
          bgColor="bg-red-100 dark:bg-red-900/30" 
        />
        <StatCard 
          icon={Plus} 
          label="Emerg. Médicas" 
          value={stats.medicalAlerts} 
          color="text-blue-600" 
          bgColor="bg-blue-100 dark:bg-blue-900/30" 
        />
        <StatCard 
          icon={Users} 
          label="Usuarios Activos" 
          value={stats.activeUsers} 
          color="text-green-600" 
          bgColor="bg-green-100 dark:bg-green-900/30" 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link 
          to="/admin/alerts"
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
        >
          <AlertTriangle size={20} />
          Ver Alertas
        </Link>
        <Link 
          to="/admin/map"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
        >
          <MapPin size={20} />
          Mapa en Vivo
        </Link>
        <Link 
          to="/admin/users"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
        >
          <Users size={20} />
          Usuarios
        </Link>
        <Link 
          to="/admin/settings"
          className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
        >
          <Settings size={20} />
          Configuración
        </Link>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800 dark:text-white">Alertas Recientes</h2>
          <Link to="/admin/alerts" className="text-sm text-blue-600 hover:text-blue-700">
            Ver todas
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${alert.type === 'insecurity' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  {alert.type === 'insecurity' ? (
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white capitalize">
                    {alert.type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={12} />
                    {alert.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${alert.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {alert.status === 'active' ? 'Activa' : 'Resuelta'}
                </span>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
