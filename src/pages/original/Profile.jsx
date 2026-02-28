import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, Award, Clock, Bell, Moon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { logoutFeriante } from '../../lib/auth';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, userData, setUserData } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (confirm('¿Cerrar sesión?')) {
            setLoading(true);
            await logoutFeriante();
            navigate('/login');
        }
    };

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

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
            {/* Profile Header */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-800">
                            {userData?.nombre || user?.email?.split('@')[0]}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {userData?.puesto_numero ? `Puesto #${userData.puesto_numero}` : 'Feriante'}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${nivelInfo.bg} ${nivelInfo.color}`}>
                            🏆 Nivel {nivel} - {nivelInfo.nombre}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800">
                        {userData?.alertas_enviadas || 0}
                    </p>
                    <p className="text-xs text-gray-500">Alertas</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800">
                        {userData?.puntos || 0}
                    </p>
                    <p className="text-xs text-gray-500">Puntos</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800">
                        {userData?.alertas_resueltas || 0}
                    </p>
                    <p className="text-xs text-gray-500">Awards</p>
                </div>
            </div>

            {/* Menu */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
                {userData?.role === 'admin' && (
                    <>
                        <button 
                            onClick={() => navigate('/admin')}
                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                        >
                            <Settings className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-800">Panel de Admin</span>
                        </button>
                        <button 
                            onClick={() => navigate('/admin/alerts')}
                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                        >
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-800">Ver Alertas</span>
                        </button>
                    </>
                )}
                
                <button 
                    onClick={() => navigate('/history')}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                >
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-800">Historial</span>
                </button>
                
                <button 
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                >
                    <Moon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-800">Modo Oscuro</span>
                    <span className="ml-auto text-xs text-gray-400">Próximamente</span>
                </button>
            </div>

            {/* Logout */}
            <button 
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 p-4 rounded-xl font-medium"
            >
                <LogOut size={20} />
                {loading ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>

            {/* App Info */}
            <div className="text-center mt-6 text-gray-400 text-xs">
                <p>Feria Segura v1.0.0</p>
                <p>Desarrollado por SZV</p>
            </div>
        </div>
    );
}
