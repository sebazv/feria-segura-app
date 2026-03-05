import { useState, useEffect } from 'react';
import { History as HistoryIcon, AlertTriangle, Shield, MapPin, CheckCircle, Clock, X, Phone, User } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BackButton from '../../components/BackButton';

// Fix leaflet marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const customIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function HistoryPage() {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserId && savedUserData) {
            try {
                setUserData({ id: savedUserId, ...JSON.parse(savedUserData) });
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        const loadAlerts = async () => {
            if (userData?.role === 'admin') {
                const { data } = await supabase
                    .from('alertas')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (data) setAlertas(data);
            } else if (userData?.id) {
                const { data } = await supabase
                    .from('alertas')
                    .select('*')
                    .eq('user_id', userData.id)
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (data) setAlertas(data);
            }
            setLoading(false);
        };
        loadAlerts();
    }, [userData]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    const getTipoIcon = (tipo) => {
        return tipo === 'insecurity' ? '🛡️' : '🏥';
    };

    const getTipoColor = (tipo) => {
        return tipo === 'insecurity' ? 'bg-red-600' : 'bg-blue-600';
    };

    const getStatusBadge = (status) => {
        if (status === 'active') {
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Activa</span>;
        } else if (status === 'resolved') {
            return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Resuelta</span>;
        }
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    };

    // Delete alert (admin only)
    const handleDeleteAlert = async () => {
        if (!confirm('¿Eliminar esta alerta?')) return;
        
        setDeleting(true);
        
        try {
            await supabase.from('alertas').delete().eq('id', selectedAlert.id);
            
            // Remove from local list
            setAlertas(alertas.filter(a => a.id !== selectedAlert.id));
            setSelectedAlert(null);
            alert('✅ Alerta eliminada');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar');
        } finally {
            setDeleting(false);
        }
    };

    // Resolve alert (admin only)
    const handleResolveAlert = async () => {
        if (!confirm('¿Marcar como resuelta?')) return;
        
        setDeleting(true);
        
        try {
            await supabase.from('alertas').update({ 
                status: 'resolved',
                resolved_at: new Date().toISOString()
            }).eq('id', selectedAlert.id);
            
            // Update local list
            setAlertas(alertas.map(a => 
                a.id === selectedAlert.id 
                    ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() }
                    : a
            ));
            
            // Update selected alert
            setSelectedAlert({ 
                ...selectedAlert, 
                status: 'resolved', 
                resolved_at: new Date().toISOString() 
            });
            
            alert('✅ Alerta resuelta');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al resolver');
        } finally {
            setDeleting(false);
        }
    };

    // Modal de detalles
    if (selectedAlert) {
        const isInsecurity = selectedAlert.tipo === 'insecurity';
        const headerColor = isInsecurity ? '#dc2626' : '#2563eb';
        
        return (
            <div className="min-h-screen bg-gray-100">
                {/* Header del modal */}
                <div style={{ backgroundColor: headerColor }} className="p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-white">
                            {isInsecurity ? '🛡️ ALERTA DE INSEGURIDAD' : '🏥 EMERGENCIA MÉDICA'}
                        </h1>
                        <button onClick={() => setSelectedAlert(null)} className="p-2 bg-white/20 rounded-lg">
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* Estado */}
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-gray-500 mb-1">Estado</p>
                        {getStatusBadge(selectedAlert.status)}
                    </div>
                    
                    {/* Datos del usuario */}
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-gray-500 mb-3">👤 Datos del Reportante</p>
                        <div className="space-y-2">
                            <p><strong>Nombre:</strong> {selectedAlert.user_name || 'No disponible'}</p>
                            <p><strong>Teléfono:</strong> {selectedAlert.user_phone || 'No disponible'}</p>
                            {selectedAlert.puesto_numero && <p><strong>Puesto:</strong> {selectedAlert.puesto_numero}</p>}
                            <p><strong>Fecha:</strong> {formatDate(selectedAlert.created_at)}</p>
                        </div>
                    </div>
                    
                    {/* Mapa */}
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-gray-500 mb-2">📍 Ubicación</p>
                        <p className="text-xs font-mono text-gray-600 mb-2">
                            {selectedAlert.lat?.toFixed(6)}, {selectedAlert.lng?.toFixed(6)}
                        </p>
                        <div className="h-64 rounded-xl overflow-hidden">
                            <MapContainer 
                                center={[selectedAlert.lat, selectedAlert.lng]} 
                                zoom={16} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[selectedAlert.lat, selectedAlert.lng]} icon={customIcon} />
                            </MapContainer>
                        </div>
                    </div>
                    
                    {/* Precisión GPS */}
                    {selectedAlert.accuracy && (
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-sm text-gray-500 mb-1">Precisión GPS</p>
                            <p className="text-lg font-bold">±{Math.round(selectedAlert.accuracy)}m</p>
                        </div>
                    )}
                    
                    {/* Resuelta */}
                    {selectedAlert.resolved_at && (
                        <div className="bg-green-100 rounded-xl p-4 shadow-md">
                            <p className="text-green-700 font-bold">✓ Resuelta el {formatDate(selectedAlert.resolved_at)}</p>
                        </div>
                    )}
                </div>
                
                {/* Botón cerrar */}
                <div className="p-4 space-y-3">
                    {/* Botones de admin */}
                    {userData?.role === 'admin' && selectedAlert.status === 'active' && (
                        <>
                            <button 
                                onClick={handleResolveAlert}
                                disabled={deleting}
                                className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-medium disabled:bg-gray-200"
                            >
                                ✓ Marcar como Resuelta
                            </button>
                            <button 
                                onClick={handleDeleteAlert}
                                disabled={deleting}
                                className="w-full bg-red-100 text-red-700 py-3 rounded-xl font-medium disabled:bg-gray-200"
                            >
                                🗑️ Eliminar Alerta
                            </button>
                        </>
                    )}
                    
                    <button 
                        onClick={() => setSelectedAlert(null)}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <HistoryIcon size={24} />
                    Historial
                </h1>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : alertas.length === 0 ? (
                <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay alertas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alertas.map((alerta) => {
                        const isInsecurity = alerta.tipo === 'insecurity';
                        return (
                            <button
                                key={alerta.id}
                                onClick={() => setSelectedAlert(alerta)}
                                className="w-full bg-white rounded-xl p-4 shadow-md text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-12 h-12 ${getTipoColor(alerta.tipo)} rounded-full flex items-center justify-center text-white text-xl`}>
                                        {getTipoIcon(alerta.tipo)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800">
                                                {isInsecurity ? 'Inseguridad' : 'Emergencia Médica'}
                                            </span>
                                            {getStatusBadge(alerta.status)}
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock size={14} />
                                            {formatDate(alerta.created_at)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <MapPin size={12} />
                                            {alerta.lat?.toFixed(4)}, {alerta.lng?.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
