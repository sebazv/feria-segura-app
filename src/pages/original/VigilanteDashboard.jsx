import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, MapPin, Phone, User, Clock, CheckCircle, Bell, Eye, Navigation, Car, Users, PhoneCall } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function VigilanteDashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });

    useEffect(() => {
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                if (data.role === 'vigilante' || data.role === 'admin') {
                    setUserData(data);
                    loadAlerts();
                } else {
                    navigate('/');
                }
            } catch (e) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, []);

    const loadAlerts = async () => {
        // Get recent alerts (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data } = await supabase
            .from('alertas')
            .select('*')
            .gte('created_at', yesterday.toISOString())
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            setAlerts(data);
            const active = data.filter(a => a.status === 'active').length;
            setStats({
                total: data.length,
                active,
                resolved: data.length - active
            });
        }
        setLoading(false);
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Ahora mismo';
        if (minutes < 60) return `Hace ${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit' });
    };

    const getAlertColor = (tipo, status) => {
        if (status === 'resolved') return 'border-emerald-500/30';
        return tipo === 'insecurity' ? 'border-red-500/50' : 'border-blue-500/50';
    };

    const getAlertBg = (tipo, status) => {
        if (status === 'resolved') return 'bg-emerald-500/10';
        return tipo === 'insecurity' ? 'bg-red-500/10' : 'bg-blue-500/10';
    };

    if (!userData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">👮 Panel Vigilante</h1>
                        <p className="text-blue-200 text-sm">{userData.nombre}</p>
                    </div>
                </div>
            </div>

            {/* Emergency Contact Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <a 
                    href="tel:133" 
                    className="bg-red-600 hover:bg-red-700 rounded-xl p-3 flex flex-col items-center gap-1 transition-colors"
                >
                    <PhoneCall className="w-6 h-6 text-white" />
                    <span className="text-white text-xs font-bold">133</span>
                    <span className="text-white/80 text-[10px]">Carabineros</span>
                </a>
                <a 
                    href="tel:132" 
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl p-3 flex flex-col items-center gap-1 transition-colors"
                >
                    <Car className="w-6 h-6 text-white" />
                    <span className="text-white text-xs font-bold">132</span>
                    <span className="text-white/80 text-[10px]">Ambulancia</span>
                </a>
                <a 
                    href="tel:131" 
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl p-3 flex flex-col items-center gap-1 transition-colors"
                >
                    <Car className="w-6 h-6 text-white" />
                    <span className="text-white text-xs font-bold">131</span>
                    <span className="text-white/80 text-[10px]">Bomberos</span>
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-slate-400">Total 24h</p>
                </div>
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-400">{stats.active}</p>
                    <p className="text-xs text-red-300">Activas</p>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
                    <p className="text-xs text-emerald-300">Resueltas</p>
                </div>
            </div>

            {/* Live Alerts Title */}
            <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-red-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white">Alertas en Vivo</h2>
            </div>

            {/* Alerts List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : alerts.length === 0 ? (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 font-medium">Sin alertas activas</p>
                    <p className="text-emerald-300/60 text-sm">La feria está tranquila</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div 
                            key={alert.id}
                            className={`rounded-xl p-4 border ${getAlertColor(alert.tipo, alert.status)} ${getAlertBg(alert.tipo, alert.status)}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">
                                        {alert.tipo === 'insecurity' ? '🛡️' : '🏥'}
                                    </span>
                                    <div>
                                        <p className="font-bold text-white">
                                            {alert.tipo === 'insecurity' ? 'INSEGURIDAD' : 'EMERGENCIA MÉDICA'}
                                        </p>
                                        <p className="text-xs text-slate-400">{formatTime(alert.created_at)}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    alert.status === 'active' 
                                        ? 'bg-red-500/30 text-red-400' 
                                        : 'bg-emerald-500/30 text-emerald-400'
                                }`}>
                                    {alert.status === 'active' ? '🟢 ACTIVA' : '✅ RESUELTA'}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-black/20 rounded-lg p-2">
                                    <p className="text-xs text-slate-400">Reportante</p>
                                    <p className="text-white text-sm font-medium">{alert.user_name || 'Anónimo'}</p>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2">
                                    <p className="text-xs text-slate-400">Teléfono</p>
                                    <a href={`tel:${alert.user_phone}`} className="text-blue-400 text-sm font-medium hover:underline">
                                        {alert.user_phone || 'No disponible'}
                                    </a>
                                </div>
                            </div>
                            
                            {/* Location */}
                            {alert.lat && alert.lng && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${alert.lat},${alert.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center justify-center gap-2 bg-black/30 hover:bg-black/40 rounded-lg py-2 transition-colors"
                                >
                                    <Navigation className="w-4 h-4 text-blue-400" />
                                    <span className="text-white text-sm">Ver ubicación en mapa</span>
                                </a>
                            )}
                            
                            {alert.puesto_numero && (
                                <p className="mt-2 text-sm text-slate-300">
                                    📍 Puesto: {alert.puesto_numero}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Info */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Información Útil
                </h3>
                <ul className="text-sm text-blue-300/80 space-y-1">
                    <li>• Las alertas aparecen en tiempo real</li>
                    <li>• Toca el teléfono para llamar al reportante</li>
                    <li>• Usa "Ver ubicación" para导航 al lugar</li>
                    <li>• Coordina con Carabineros (133) si es necesario</li>
                </ul>
            </div>
        </div>
    );
}
