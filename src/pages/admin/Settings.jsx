import { useState } from 'react';
import { Settings, Bell, MapPin, Shield, Users, Database, Save, RotateCcw } from 'lucide-react';

const sectors = [
  { id: 1, name: 'Sector A', active: true, guardCount: 5 },
  { id: 2, name: 'Sector B', active: true, guardCount: 4 },
  { id: 3, name: 'Sector C', active: true, guardCount: 3 },
  { id: 4, name: 'Sector D', active: false, guardCount: 0 },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    appName: 'Feria Segura',
    emergencyTimeout: 3, // seconds to hold
    gpsEnabled: true,
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    autoResolveTime: 30, // minutes
    maxActiveAlerts: 50,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('¿Restablecer configuración默认值?')) {
      setSettings({
        appName: 'Feria Segura',
        emergencyTimeout: 3,
        gpsEnabled: true,
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        autoResolveTime: 30,
        maxActiveAlerts: 50,
      });
    }
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Configuración
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Ajustes de la aplicación
        </p>
      </header>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* General Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">General</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la App
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiempo de activación SOS (segundos)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.emergencyTimeout}
                onChange={(e) => setSettings({ ...settings, emergencyTimeout: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Location Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Ubicación</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">GPS Activo</p>
                <p className="text-sm text-gray-500">Rastrear ubicación en emergencias</p>
              </div>
              <Toggle 
                checked={settings.gpsEnabled} 
                onChange={(v) => setSettings({ ...settings, gpsEnabled: v })} 
              />
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Notificaciones</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Recibir alertas en tiempo real</p>
              </div>
              <Toggle 
                checked={settings.notificationsEnabled} 
                onChange={(v) => setSettings({ ...settings, notificationsEnabled: v })} 
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Sonido</p>
                <p className="text-sm text-gray-500">Sonido en alertas</p>
              </div>
              <Toggle 
                checked={settings.soundEnabled} 
                onChange={(v) => setSettings({ ...settings, soundEnabled: v })} 
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Vibración</p>
                <p className="text-sm text-gray-500">Vibración en alertas</p>
              </div>
              <Toggle 
                checked={settings.vibrationEnabled} 
                onChange={(v) => setSettings({ ...settings, vibrationEnabled: v })} 
              />
            </div>
          </div>
        </section>

        {/* Alert Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Alertas</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiempo auto-resolución (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.autoResolveTime}
                onChange={(e) => setSettings({ ...settings, autoResolveTime: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Máximo de alertas activas
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={settings.maxActiveAlerts}
                onChange={(e) => setSettings({ ...settings, maxActiveAlerts: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Sectors */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Sectores</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sectors.map((sector) => (
              <div key={sector.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${sector.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="font-medium text-gray-800 dark:text-white">{sector.name}</span>
                </div>
                <span className="text-sm text-gray-500">{sector.guardCount} guardias</span>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium"
          >
            <RotateCcw size={18} />
            Restablecer
          </button>
          <button 
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save size={18} />
            {saved ? 'Guardado!' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
