import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Shield, Clock, Bell, Moon, Sun, Trash2, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase/client';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, userData, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getNivelInfo = (nivel) => {
        const niveles = {
            1: { nombre: 'Bronce', color: 'text-amber-600', bg: 'bg-amber-100' },
            2: { nombre: 'Plata', color: 'text-gray-500', bg: 'bg-gray-200' },
            3: { nombre: 'Oro', color: 'text-yellow-500', bg: 'bg-yellow-100' },
            4: { nombre: 'Platino', color: 'text-purple-500', bg: 'bg-purple-100' },
            5: { nombre: 'Diamante', color: 'text-cyan-500', bg: 'bg-cyan-100' }
        };
        return niveles[nivel] || niveles[1];
    };

    const nivel = userData?.nivel || 1;
    const nivelInfo = getNivelInfo(nivel);
    const isAdmin = userData?.role === 'admin';

    const handleDeleteAccount = async () => {
        try {
            // Mark user as eliminated
            await supabase
                .from('usuarios')
                .update({ estado: 'ELIMINADO' })
                .eq('id', user.id);
            
            // Clear local storage
            logout();
            
            // Redirect to home
            window.location.href = '/';
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar cuenta');
        }
    };

    return (
        <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                            {userData?.nombre || 'Usuario'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {userData?.telefono || 'Sin teléfono'}
                        </p>
                        {isAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                👑 Administrador
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Estado de cuenta</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">✓ Activa</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData?.alertas_enviadas || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Alertas</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData?.puntos || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Puntos</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData?.alertas_resueltas || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Awards</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-4">
                {isAdmin && (
                    <>
                        <button onClick={() => navigate('/users')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                            <Users className="w-5 h-5 text-purple-600" />
                            <span className="text-gray-800 dark:text-white font-medium">👥 Gestionar Usuarios</span>
                        </button>
                        <button onClick={() => navigate('/admin/notifications')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                            <Bell className="w-5 h-5 text-purple-600" />
                            <span className="text-gray-800 dark:text-white font-medium">🔔 Notificaciones</span>
                        </button>
                    </>
                )}
                
                <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
                    <span className="text-gray-800 dark:text-white">Modo Oscuro</span>
                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${darkMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {darkMode ? 'ON' : 'OFF'}
                    </span>
                </button>
                
                <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-800 dark:text-white">Historial</span>
                </button>
            </div>

            {showDeleteConfirm && (
                <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 shadow-md mb-4 border-2 border-red-300">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="text-red-600" size={20} />
                        <p className="font-bold text-red-800 dark:text-red-400">¿Eliminar mi cuenta?</p>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        Perderás acceso a la app.
                    </p>
                    <div className="flex gap-2">
                        <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">
                            Sí, eliminar
                        </button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 p-4 rounded-xl font-medium">
                <Trash2 size={20} />
                Eliminar mi cuenta
            </button>

            <div className="text-center mt-6 text-gray-400 dark:text-gray-500 text-xs">
                <p>Feria Segura v1.0.0</p>
            </div>
        </div>
    );
}
