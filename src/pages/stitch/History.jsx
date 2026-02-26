import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Shield, Plus, AlertTriangle, CheckCircle, XCircle, History } from 'lucide-react';

// Demo history data
const demoHistory = [
  { id: 1, type: 'insecurity', location: 'Sector A - Puesto 23', lat: -33.4489, lng: -70.6693, time: '2026-02-26T02:30:00', status: 'resolved' },
  { id: 2, type: 'medical', location: 'Sector B - Puesto 45', lat: -33.4495, lng: -70.6680, time: '2026-02-26T01:15:00', status: 'resolved' },
  { id: 3, type: 'insecurity', location: 'Sector C - Puesto 12', lat: -33.4500, lng: -70.6700, time: '2026-02-25T22:45:00', status: 'resolved' },
  { id: 4, type: 'medical', location: 'Sector A - Puesto 8', lat: -33.4485, lng: -70.6710, time: '2026-02-25T18:30:00', status: 'resolved' },
  { id: 5, type: 'insecurity', location: 'Sector B - Puesto 31', lat: -33.4492, lng: -70.6698, time: '2026-02-25T14:20:00', status: 'resolved' },
  { id: 6, type: 'insecurity', location: 'Sector A - Puesto 15', lat: -33.4487, lng: -70.6695, time: '2026-02-24T20:10:00', status: 'resolved' },
  { id: 7, type: 'medical', location: 'Sector D - Puesto 7', lat: -33.4510, lng: -70.6720, time: '2026-02-24T16:45:00', status: 'resolved' },
];

export default function HistoryPage() {
  const [history, setHistory] = useState(demoHistory);
  const [filter, setFilter] = useState('all');

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('alertHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const formatDate = (dateString) => {
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
    insecurity: history.filter(h => h.type === 'insecurity').length,
    medical: history.filter(h => h.type === 'medical').length,
  };

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Mi Historial
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Registro de alertas enviadas
        </p>
      </header>

      {/* Stats */}
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

      {/* Filter */}
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

      {/* History List */}
      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <div 
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border-l-4 p-4 ${
              item.type === 'insecurity' ? 'border-l-red-500' : 'border-l-blue-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                  item.type === 'insecurity' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {item.type === 'insecurity' ? (
                    <Shield className="w-4 h-4 text-red-600" />
                  ) : (
                    <Plus className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="font-medium text-gray-800 dark:text-white capitalize">
                  {item.type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica'}
                </span>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                {item.location}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {formatDate(item.time)}
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
