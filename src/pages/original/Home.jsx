import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, User, Clock, Bell, MapPin, AlertTriangle, Download } from 'lucide-react';
import InstallAppButton from '../../components/InstallAppButton';

export default function Home() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                setUserData({ id: savedUserId, ...data });
            } catch (e) {
                setUserData(null);
            }
        }
    }, []);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleEmergency = (type) => {
        if (!userData) {
            const wantsLogin = confirm('¿Ya tienes cuenta? Acepta para iniciar sesión, o cancela para registrarte.');
            if (wantsLogin) {
                navigate('/login');
            } else {
                navigate('/registro');
            }
            return;
        }
        navigate(`/loading?type=${type}`);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Feria Segura</h1>
                            <p className="text-xs text-slate-400">{formatDate(currentTime)}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {userData ? (
                            <button 
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-white font-medium text-sm hidden sm:block">{userData.nombre}</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => navigate('/login')}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Time display */}
                <div className="text-center mt-3">
                    <p className="text-4xl font-bold text-white tracking-wider">{formatTime(currentTime)}</p>
                </div>
            </header>

            {/* Test mode banner */}
            <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-medium text-sm">MODO PRUEBA ACTIVADO</span>
                </div>
            </div>

            {/* User Info Card (if logged in) */}
            {userData && (
                <div className="p-4">
                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Puesto #{userData.puesto_numero || 'Sin asignar'}</p>
                                    <p className="text-emerald-400 text-sm">Ubicación registrada</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">{userData.puntos || 0}</p>
                                <p className="text-xs text-slate-400">puntos</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 pb-24">
                <p className="text-center text-slate-400 mb-4 font-medium">
                    Selecciona el tipo de emergencia
                </p>

                {/* Emergency Buttons */}
                <div className="space-y-4">
                    {/* Insecurity Button */}
                    <button 
                        onClick={() => handleEmergency('insecurity')}
                        className="w-full relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10 flex items-center justify-center gap-6 py-10">
                            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Shield className="w-14 h-14 text-white" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl font-black text-white tracking-wide">INSEGURIDAD</h2>
                                <p className="text-red-200 text-sm font-medium mt-1">Robo, agresión, peligro</p>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/80 text-sm font-medium">
                            <span>Toca para reportar</span>
                            <span className="text-2xl">→</span>
                        </div>
                    </button>

                    {/* Medical Emergency Button */}
                    <button 
                        onClick={() => handleEmergency('medical')}
                        className="w-full relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10 flex items-center justify-center gap-6 py-10">
                            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Heart className="w-14 h-14 text-white" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl font-black text-white tracking-wide">EMERGENCIA</h2>
                                <p className="text-blue-200 text-sm font-medium mt-1">Médica, accidente, salud</p>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/80 text-sm font-medium">
                            <span>Toca para reportar</span>
                            <span className="text-2xl">→</span>
                        </div>
                    </button>
                </div>

                {/* Quick Actions */}
                {userData && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => navigate('/history')}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors"
                        >
                            <Clock className="w-6 h-6 text-slate-300" />
                            <span className="text-white font-medium text-sm">Historial</span>
                        </button>
                        <button 
                            onClick={() => navigate('/contacts')}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors"
                        >
                            <Bell className="w-6 h-6 text-slate-300" />
                            <span className="text-white font-medium text-sm">Contactos</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Install App Button */}
            <InstallAppButton />

            {/* Decorative elements */}
            <div className="fixed top-20 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2"></div>
            <div className="fixed bottom-40 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2"></div>
        </div>
    );
}
