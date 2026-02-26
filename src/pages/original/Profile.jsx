import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { getUserAlerts } from '../../lib/alerts';
import { User, Phone, MapPin, LogOut, Shield, Settings, Clock, ShieldAlert, Loader } from 'lucide-react';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, userData, logout } = useAuth();
    const [stats, setStats] = useState({ total: 0, insecurity: 0, medical: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const result = await getUserAlerts(user.id, 100);
                if (result.success && result.alertas) {
                    setStats({
                        total: result.alertas.length,
                        insecurity: result.alertas.filter(a => a.tipo === 'insecurity').length,
                        medical: result.alertas.filter(a => a.tipo === 'medical').length
                    });
                }
            } catch (err) {
                console.error('Error loading stats:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            await logout();
            navigate('/login');
        }
    };

    if (!user || !userData) {
        return (
            <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-red-600 mx-auto mb-2" />
                    <p className="text-gray-500">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    Mi Perfil
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Información de tu cuenta
                </p>
            </header>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            {userData.nombre}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            RUT: {userData.rut}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <Phone size={18} className="text-gray-400" />
                        <span>{userData.telefono}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <MapPin size={18} className="text-gray-400" />
                        <span>Puesto: {userData.puesto_numero || 'No asignado'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <Shield size={18} className="text-gray-400" />
                        <span className="capitalize">{userData.role || 'Feriante'}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.insecurity}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Inseguridad</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.medical}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Médicas</p>
                </div>
            </div>

            {/* Menu */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button
                    onClick={() => navigate('/history')}
                    className="w-full flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Clock size={20} className="text-gray-400" />
                    <span>Mi Historial</span>
                </button>
                <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <ShieldAlert size={20} className="text-gray-400" />
                    <span>Panel Admin</span>
                </button>
                <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Settings size={20} className="text-gray-400" />
                    <span>Configuración</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
