/**
 * AdminNotifications.jsx
 * Panel de notificaciones para el administrador
 */

import { useState, useEffect } from 'react';
import { Bell, Check, X, User, AlertTriangle, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function AdminNotifications() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotificaciones();
    }, []);

    const loadNotificaciones = async () => {
        const { data, error } = await supabase
            .from('notificaciones_admin')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            setNotificaciones(data);
        }
        setLoading(false);
    };

    const marcarLeido = async (id) => {
        await supabase
            .from('notificaciones_admin')
            .update({ leido: true })
            .eq('id', id);
        
        setNotificaciones(prev => 
            prev.map(n => n.id === id ? { ...n, leido: true } : n)
        );
    };

    const eliminarNotificacion = async (id) => {
        await supabase
            .from('notificaciones_admin')
            .delete()
            .eq('id', id);
        
        setNotificaciones(prev => prev.filter(n => n.id !== id));
    };

    const getIcono = (tipo) => {
        switch (tipo) {
            case 'NUEVO_USUARIO':
                return <User className="w-5 h-5 text-blue-600" />;
            case 'ALERTA':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'MENSAJE':
                return <MessageSquare className="w-5 h-5 text-green-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const pendientes = notificaciones.filter(n => !n.leido).length;

    if (loading) {
        return (
            <div className="p-4 pb-24 bg-gray-50 min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell size={24} />
                    Notificaciones
                    {pendientes > 0 && (
                        <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                            {pendientes}
                        </span>
                    )}
                </h1>
            </header>

            {notificaciones.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay notificaciones</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notificaciones.map((notif) => (
                        <div 
                            key={notif.id}
                            className={`bg-white rounded-xl p-4 shadow-md ${
                                !notif.leido ? 'border-l-4 border-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    {getIcono(notif.tipo)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-800">
                                            {notif.titulo}
                                        </h3>
                                        {!notif.leido && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {notif.mensaje}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-2">
                                        {new Date(notif.created_at).toLocaleString('es-CL')}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {!notif.leido && (
                                        <button
                                            onClick={() => marcarLeido(notif.id)}
                                            className="p-2 text-gray-400 hover:text-green-600"
                                            title="Marcar como leído"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => eliminarNotificacion(notif.id)}
                                        className="p-2 text-gray-400 hover:text-red-600"
                                        title="Eliminar"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
