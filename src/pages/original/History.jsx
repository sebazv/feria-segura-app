import { useState, useEffect } from 'react';
import { History as HistoryIcon, Loader, AlertTriangle, Shield, MapPin, CheckCircle, Clock } from 'lucide-react';
import { getUserAlerts } from '../../lib/alerts';
import { useAuth } from '../../App';

export default function HistoryPage() {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadAlerts = async () => {
            if (user) {
                const result = await getUserAlerts(user.id);
                if (result.success) {
                    setAlertas(result.alertas);
                }
            }
            setLoading(false);
        };

        loadAlerts();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getTypeInfo = (tipo) => {
        if (tipo === 'insecurity') {
            return { 
                icon: Shield, 
                label: 'Inseguridad', 
                color: 'red', 
                bgColor: 'bg-red-100',
                textColor: 'text-red-600'
            };
        }
        return { 
            icon: AlertTriangle, 
            label: 'Emergencia Médica', 
            color: 'blue', 
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600'
        };
    };

    const getStatusInfo = (status) => {
        if (status === 'resolved') {
            return { 
                icon: CheckCircle, 
                label: 'Resuelta', 
                color: 'green' 
            };
        }
        return { 
            icon: Clock, 
            label: 'Activa', 
            color: 'amber' 
        };
    };

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
                <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <HistoryIcon size={24} />
                    Historial
                </h1>
                <p className="text-gray-500 text-sm">
                    Tus alertas enviadas
                </p>
            </header>

            {/* Alerts List */}
            <div className="space-y-3">
                {alertas.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No has enviado alertas</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Usa el botón SOS en caso de emergencia
                        </p>
                    </div>
                ) : (
                    alertas.map((alerta) => {
                        const typeInfo = getTypeInfo(alerta.tipo);
                        const statusInfo = getStatusInfo(alerta.status);
                        const TypeIcon = typeInfo.icon;
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div 
                                key={alerta.id} 
                                className="bg-white rounded-xl p-4 shadow-md"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                                            <TypeIcon className={`w-5 h-5 ${typeInfo.textColor}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">
                                                {typeInfo.label}
                                            </h3>
                                            <p className="text-gray-500 text-xs">
                                                {formatDate(alerta.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                        statusInfo.color === 'green' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        <StatusIcon size={12} />
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <MapPin size={14} />
                                    <span>
                                        {alerta.lat?.toFixed(5)}, {alerta.lng?.toFixed(5)}
                                    </span>
                                </div>

                                {alerta.puesto_numero && (
                                    <div className="mt-2 text-gray-500 text-sm">
                                        📍 Puesto #{alerta.puesto_numero}
                                    </div>
                                )}

                                {alerta.user_phone && (
                                    <div className="mt-1 text-gray-500 text-sm">
                                        📞 {alerta.user_phone}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
