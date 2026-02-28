import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, MapPin, Clock, Search, CheckCircle, Phone, Loader } from 'lucide-react';
import { getAllAlerts, resolveAlert } from '../../lib/alerts';
import { useAuth } from '../../lib/auth';

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const result = await getAllAlerts();
        if (result.success) {
          setAlerts(result.alertas || []);
        }
      } catch (err) {
        console.error('Error loading alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const handleResolve = async (alertId) => {
    if (!confirm('¿Marcar esta alerta como resuelta?')) return;
    
    setResolving(alertId);
    try {
      const result = await resolveAlert(alertId, user.id);
      if (result.success) {
        setAlerts(alerts.map(a => 
          a.id === alertId ? { ...a, status: 'resolved' } : a
        ));
      }
    } catch (err) {
      alert('Error al resolver alerta');
    } finally {
      setResolving(null);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && alert.status === 'active') ||
      (filter === 'resolved' && alert.status === 'resolved') ||
      (filter === 'insecurity' && alert.tipo === 'insecurity') ||
      (filter === 'medical' && alert.tipo === 'medical');
    
    const matchesSearch = 
      (alert.puesto_numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.user_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours} h atrás`;
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Alertas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {filteredAlerts.length} alertas encontradas
        </p>
      </header>

      <div className="mb-4 space-y-3">
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

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'active', 'resolved', 'insecurity', 'medical'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? f === 'insecurity' ? 'bg-red-600 text-white' 
                  : f === 'medical' ? 'bg-blue-600 text-white'
                  : f === 'active' ? 'bg-red-600 text-white'
                  : f === 'resolved' ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'insecurity' ? 'Inseguridad' : f === 'medical' ? 'Médicas' : f === 'active' ? 'Activas' : 'Resueltas'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 p-4 ${
              alert.tipo === 'insecurity' ? 'border-l-red-500' : 'border-l-blue-500'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  alert.tipo === 'insecurity' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {alert.tipo === 'insecurity' ? (
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white capitalize">
                    {alert.tipo === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {alert.user_name || 'Usuario'}
                  </p>
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
                Puesto: {alert.puesto_numero || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                {formatDate(alert.created_at)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {alert.user_phone || 'Sin teléfono'}
              </p>
            </div>

            {alert.status === 'active' && (
              <button 
                onClick={() => handleResolve(alert.id)}
                disabled={resolving === alert.id}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {resolving === alert.id ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                {resolving === alert.id ? 'Resolviendo...' : 'Marcar Resuelta'}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No se encontraron alertas</p>
        </div>
      )}
    </div>
  );
}
