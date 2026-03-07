import { useState, useEffect } from 'react';
import { Clock, Shield, X, Monitor, Smartphone, Globe, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function SessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        if (savedUserId) {
            setUser({ id: savedUserId });
            loadSessions(savedUserId);
        }
    }, []);

    const loadSessions = async (userId) => {
        const { data } = await supabase
            .from('sesiones')
            .select('*')
            .eq('usuario_id', userId)
            .order('iniciar', { ascending: false })
            .limit(20);
        
        if (data) setSessions(data);
        setLoading(false);
    };

    const getDeviceIcon = (userAgent) => {
        if (!userAgent) return <Globe size={20} />;
        if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
            return <Smartphone size={20} />;
        }
        return <Monitor size={20} />;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('es-CL', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white">Mis Sesiones</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No hay sesiones registradas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map(session => (
                        <div key={session.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                {getDeviceIcon(session.user_agent)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-white text-sm">
                                    {session.user_agent ? session.user_agent.substring(0, 40) + '...' : 'Dispositivo desconocido'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Inicio: {formatDate(session.iniciar)}
                                </p>
                                {session.cerrar && (
                                    <p className="text-xs text-slate-500">
                                        Cierre: {formatDate(session.cerrar)}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <span className={`px-2 py-1 rounded-full text-xs ${session.cerrar ? 'bg-slate-500/20 text-slate-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {session.cerrar ? 'Cerrada' : 'Activa'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4">
                <Shield className="text-blue-400 mb-2" size={20} />
                <p className="text-sm text-blue-300">
                    Este historial muestra los dispositivos desde los que has iniciado sesión.
                </p>
            </div>
        </div>
    );
}
