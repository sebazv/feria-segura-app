import { useState } from 'react';
import { ShieldAlert, Plus, MapPin, Clock, Search, Filter, CheckCircle, XCircle, Phone } from 'lucide-react';

const demoAlerts = [
  { id: 1, type: 'insecurity', location: 'Sector A - Puesto 23', user: 'Juan Pérez', phone: '+56912345678', time: '2 min atrás', status: 'active', description: 'Robo en progreso' },
  { id: 2, type: 'medical', location: 'Sector B - Puesto 45', user: 'María González', phone: '+56987654321', time: '15 min atrás', status: 'active', description: 'Ataque de pánico' },
  { id: 3, type: 'insecurity', location: 'Sector C - Puesto 12', user: 'Carlos López', phone: '+56911223344', time: '32 min atrás', status: 'resolved', description: 'Persona sospechosa' },
  { id: 4, type: 'medical', location: 'Sector A - Puesto 8', user: 'Ana Martínez', phone: '+56955667788', time: '45 min atrás', status: 'resolved', description: 'Desmayo' },
  { id: 5, type: 'insecurity', location: 'Sector B - Puesto 31', user: 'Pedro Sánchez', phone: '+56999887766', time: '1 h atrás', status: 'resolved', description: 'Riña' },
  { id: 6, type: 'medical', location: 'Sector D - Puesto 15', user: 'Laura Torres', phone: '+56944332211', time: '2 h atrás', status: 'resolved', description: 'Golpe en la cabeza' },
  { id: 7, type: 'insecurity', location: 'Sector A - Puesto 42', user: 'Jorge Rivera', phone: '+56966554433', time: '3 h atrás', status: 'resolved', description: 'Acoso' },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = demoAlerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && alert.status === 'active') ||
      (filter === 'resolved' && alert.status === 'resolved') ||
      (filter === 'insecurity' && alert.type === 'insecurity') ||
      (filter === 'medical' && alert.type === 'medical');
    
    const matchesSearch = alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleResolve = (id) => {
    console.log('Resolve alert:', id);
    // Here would go the actual resolve logic
  };

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Alertas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {filteredAlerts.length} alertas encontradas
        </p>
      </header>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ubicación o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all' 
                ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-800' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'active' 
                ? 'bg-red-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'resolved' 
                ? 'bg-green-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Resueltas
          </button>
          <button
            onClick={() => setFilter('insecurity')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'insecurity' 
                ? 'bg-red-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Inseguridad
          </button>
          <button
            onClick={() => setFilter('medical')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'medical' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Médicas
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 p-4 ${
              alert.type === 'insecurity' ? 'border-l-red-500' : 'border-l-blue-500'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  alert.type === 'insecurity' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {alert.type === 'insecurity' ? (
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white capitalize">
                    {alert.type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{alert.description}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                alert.status === 'active' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {alert.status === 'active' ? 'Activa' : 'Resuelta'}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                {alert.location}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                {alert.time}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                👤 {alert.user} • <a href={`tel:${alert.phone}`} className="text-blue-600 flex items-center gap-1"><Phone size={12} />{alert.phone}</a>
              </p>
            </div>

            {alert.status === 'active' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleResolve(alert.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <CheckCircle size={18} />
                  Resolver
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  <XCircle size={18} />
                  Contactar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron alertas</p>
        </div>
      )}
    </div>
  );
}
