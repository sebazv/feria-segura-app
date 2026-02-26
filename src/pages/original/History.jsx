import { useState, useEffect } from 'react';
import { Clock, MapPin, Shield, Plus, History, Loader } from 'lucide-react';
import { getUserAlerts } from '../../lib/alerts';
import { useAuth } from '../../App';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadAlerts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const result = await getUserAlerts(user.id);
        if (result.success) {
          setHistory(result.alertas || []);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Error al cargar historial');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [user]);

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.tipo === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const stats = {
    total: history.length,
    insecurity: history.filter(h => h.tipo === 'insecurity').length,
    medical: history.filter(h => h.tipo === 'medical').length,
  };

  if (loading) {
    return (
      <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-red-600 mx-auto mb-2" />
          <p className="text-gray-500">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Mi Historial
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Registro de alertas enviadas
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
          <p className="text-2xl font-bold text-red-600">{stats.insecurity}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inseguridad</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.medical}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Médicas</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
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

      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <div 
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 p-4 ${
              item.tipo === 'insecurity' ? 'border-l-red-500' : 'border-l-blue-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  item.tipo === 'insecurity' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {item.tipo === 'insecurity' ? (
                    <Shield className="w-4 h-4 text-red-600" />
                  ) : (
                    <Plus className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="font-medium text-gray-800 dark:text-white capitalize">
                  {item.tipo === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica'}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.status === 'active' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {item.status === 'active' ? 'Activa' : 'Resuelta'}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                Puesto: {item.puesto_numero || 'N/A'}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No hay alertas en el historial</p>
        </div>
      )}
    </div>
  );
}
