import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, MapPin, X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const demoAlertsOnMap = [
  { id: 1, type: 'insecurity', lat: -33.4489, lng: -70.6693, sector: 'Sector A', puesto: 'Puesto 23', time: '2 min' },
  { id: 2, type: 'medical', lat: -33.4495, lng: -70.6680, sector: 'Sector B', puesto: 'Puesto 45', time: '15 min' },
  { id: 3, type: 'insecurity', lat: -33.4500, lng: -70.6700, sector: 'Sector C', puesto: 'Puesto 12', time: '32 min' },
  { id: 4, type: 'medical', lat: -33.4485, lng: -70.6710, sector: 'Sector A', puesto: 'Puesto 8', time: '45 min' },
];

export default function MapPage() {
  const [alerts, setAlerts] = useState(demoAlertsOnMap);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [zoom, setZoom] = useState(16);
  const [center, setCenter] = useState({ lat: -33.4492, lng: -70.6695 });

  const handleRefresh = () => {
    console.log('Refreshing map data...');
    // Here would fetch new data
  };

  return (
    <div className="h-[calc(100vh-6rem)] relative bg-gray-100 dark:bg-gray-900">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-2xl font-bold text-white mb-1">
          Mapa en Vivo
        </h1>
        <p className="text-white/80 text-sm">
          {alerts.length} alertas activas
        </p>
      </div>

      {/* Map placeholder - in production would use Google Maps or Leaflet */}
      <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center relative overflow-hidden">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Simulated sectors */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[90%] h-[90%] border-2 border-dashed border-green-600/30 rounded-xl">
            {/* Grid lines for sectors */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
              <div className="border-r border-b border-green-600/20 flex items-center justify-center">
                <span className="text-green-700/30 font-bold text-2xl">Sector A</span>
              </div>
              <div className="border-b border-green-600/20 flex items-center justify-center">
                <span className="text-green-700/30 font-bold text-2xl">Sector B</span>
              </div>
              <div className="border-r border-green-600/20 flex items-center justify-center">
                <span className="text-green-700/30 font-bold text-2xl">Sector C</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-green-700/30 font-bold text-2xl">Sector D</span>
              </div>
            </div>

            {/* Alert markers */}
            {alerts.map((alert, index) => {
              // Calculate position based on lat/lng (simplified)
              const x = 50 + (alert.lng - center.lng) * 5000 + (index * 10 - 20);
              const y = 50 + (center.lat - alert.lat) * 5000 + (index * 8 - 15);
              
              return (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
                    alert.type === 'insecurity' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  style={{ left: `${Math.max(10, Math.min(90, x))}%`, top: `${Math.max(10, Math.min(90, y))}%` }}
                >
                  {alert.type === 'insecurity' ? (
                    <ShieldAlert className="w-6 h-6 text-white" />
                  ) : (
                    <Plus className="w-6 h-6 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Inseguridad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Emergencia Médica</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-24 right-4 flex flex-col gap-2">
        <button 
          onClick={() => setZoom(z => Math.min(20, z + 1))}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ZoomIn size={20} />
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(10, z - 1))}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ZoomOut size={20} />
        </button>
        <button 
          onClick={handleRefresh}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="absolute inset-0 z-20 bg-black/50 flex items-end">
          <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  selectedAlert.type === 'insecurity' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {selectedAlert.type === 'insecurity' ? (
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                  ) : (
                    <Plus className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white capitalize">
                    {selectedAlert.type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedAlert.time} atrás</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin size={18} className="text-gray-400" />
                <span>{selectedAlert.sector} — {selectedAlert.puesto}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors">
                Marcar Resuelta
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
