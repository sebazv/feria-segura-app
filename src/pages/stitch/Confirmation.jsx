import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { sendAlert } from '../../lib/alerts';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth';

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

export default function ConfirmationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, userData } = useAuth();
    
    const type = searchParams.get('type');
    const latParam = parseFloat(searchParams.get('lat') || '0');
    const lngParam = parseFloat(searchParams.get('lng') || '0');

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gpsStatus, setGpsStatus] = useState('Verificando GPS...');
    const [accuracyText, setAccuracyText] = useState('');
    const [gpsDenied, setGpsDenied] = useState(false);
    
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    
    const watchIdRef = useRef(null);

    // Get GPS on mount
    useEffect(() => {
        const getLocation = () => {
            if (!navigator.geolocation) {
                setGpsDenied(true);
                setGpsStatus('GPS no disponible');
                setLocation({ lat: latParam || -33.4489, lng: lngParam || -70.6693, accuracy: 0 });
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setLocation(newLoc);
                    setGpsStatus('GPS conectado');
                    setLoading(false);
                    
                    const acc = position.coords.accuracy;
                    if (acc < 10) setAccuracyText('🟢 Excelente precisión');
                    else if (acc < 25) setAccuracyText('🟡 Buena precisión');
                    else if (acc < 50) setAccuracyText('🟠 Precisión moderada');
                    else setAccuracyText('🔴 Precisión baja');
                    
                    // Start watching for updates
                    startWatching();
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        setGpsDenied(true);
                        setGpsStatus('GPS desactivado');
                    }
                    // Use URL params or default
                    setLocation({ lat: latParam || -33.4489, lng: lngParam || -70.6693, accuracy: 0 });
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        };

        const startWatching = () => {
            if (watchIdRef.current !== null) return;
            
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    
                    const acc = position.coords.accuracy;
                    if (acc < 10) setAccuracyText('🟢 Excelente');
                    else if (acc < 25) setAccuracyText('🟡 Buena');
                    else if (acc < 50) setAccuracyText('🟠 Moderada');
                    else setAccuracyText('🔴 Baja');
                },
                () => {},
                { enableHighAccuracy: true, maximumAge: 0, distanceFilter: 5 }
            );
            
            watchIdRef.current = watchId;
        };

        getLocation();

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const handleSendAlert = async () => {
        if (!user || !userData) {
            setError('Debes iniciar sesión');
            return;
        }

        if (!location) {
            setError('Necesitamos tu ubicación');
            return;
        }

        setSending(true);
        setError('');

        const result = await sendAlert({
            tipo: type,
            lat: location.lat,
            lng: location.lng,
            userId: user.id,
            userName: userData.nombre,
            userPhone: userData.telefono,
            puestoNumero: userData.puesto_numero,
            accuracy: location.accuracy
        });

        setSending(false);

        if (result.success) {
            setSent(true);
            
            // Update user stats
            await supabase
                .from('usuarios')
                .update({ 
                    alertas_enviadas: (userData.alertas_enviadas || 0) + 1,
                    puntos: (userData.puntos || 0) + 10
                })
                .eq('id', user.id);
        } else {
            setError('Error al enviar. Intenta de nuevo.');
        }
    };

    const handleRetryGPS = () => {
        setLoading(true);
        setGpsDenied(false);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setGpsStatus('GPS conectado');
                setGpsDenied(false);
                setLoading(false);
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setGpsDenied(true);
                    setGpsStatus('GPS desactivado');
                }
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    // Already sent - show success
    if (sent) {
        const isInsecurity = type === 'insecurity';
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: isInsecurity ? '#dc2626' : '#2563eb', padding: '20px' }}>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                        {isInsecurity ? '🛡️ ALERTA ENVIADA' : '🏥 EMERGENCIA ENVIADA'}
                    </h1>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '60px' }}>✓</span>
                    </div>
                    
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>¡Alerta Enviada!</h2>
                    <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '30px' }}>
                        {isInsecurity ? 'Las autoridades han sido notificadas' : 'Los servicios de emergencia están en camino'}
                    </p>
                    
                    <button 
                        onClick={() => navigate('/')}
                        style={{ backgroundColor: '#374151', color: 'white', fontSize: '18px', fontWeight: 'bold', padding: '16px 40px', borderRadius: '12px', border: 'none' }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    const isInsecurity = type === 'insecurity';
    const headerColor = isInsecurity ? '#dc2626' : '#2563eb';
    const mapCenter = location ? [location.lat, location.lng] : [-33.4489, -70.6693];

    // Loading GPS
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: headerColor, padding: '20px' }}>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                        📍 Obteniendo Ubicación
                    </h1>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                    <div style={{ width: '60px', height: '60px', border: '4px solid ' + headerColor, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                    <p style={{ fontSize: '18px', color: '#6b7280' }}>{gpsStatus}</p>
                </div>
                
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <div style={{ backgroundColor: headerColor, padding: '16px' }}>
                <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }}>
                    {isInsecurity ? '🛡️ INSEGURIDAD' : '🏥 EMERGENCIA MÉDICA'}
                </h1>
            </div>

            {/* GPS Status */}
            <div style={{ backgroundColor: gpsDenied ? '#fee2e2' : '#dcfce7', padding: '12px', margin: '12px', borderRadius: '12px' }}>
                <p style={{ fontSize: '14px', color: gpsDenied ? '#dc2626' : '#166534', fontWeight: '500' }}>
                    {gpsDenied ? '⚠️ ' + gpsStatus : '✅ ' + gpsStatus}
                    {accuracyText && ' - ' + accuracyText}
                </p>
            </div>

            {/* GPS denied - show retry button */}
            {gpsDenied && (
                <div style={{ padding: '0 12px' }}>
                    <button 
                        onClick={handleRetryGPS}
                        style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', fontSize: '16px', fontWeight: '600', padding: '12px', borderRadius: '8px', border: 'none' }}
                    >
                        🔄 Activar GPS
                    </button>
                </div>
            )}

            {/* Coordinates */}
            {location && (
                <div style={{ backgroundColor: '#dbeafe', padding: '12px', margin: '12px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '14px', color: '#1e40af', fontFamily: 'monospace' }}>
                        📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                </div>
            )}

            {/* Map */}
            <div style={{ flex: 1, margin: '8px', borderRadius: '12px', overflow: 'hidden', minHeight: '250px' }}>
                <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {location && <Marker position={[location.lat, location.lng]} icon={customIcon} />}
                </MapContainer>
            </div>

            {/* Error message */}
            {error && (
                <div style={{ backgroundColor: '#fee2e2', padding: '12px', margin: '12px', borderRadius: '8px' }}>
                    <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
                </div>
            )}

            {/* Send Button */}
            <div style={{ padding: '16px', backgroundColor: 'white', paddingBottom: '100px' }}>
                <button 
                    onClick={handleSendAlert}
                    disabled={sending || !location}
                    style={{ 
                        width: '100%', 
                        backgroundColor: sending ? '#9ca3af' : headerColor, 
                        color: 'white', 
                        fontSize: '22px', 
                        fontWeight: 'bold', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {sending ? 'Enviando...' : '📤 ENVIAR ALERTA'}
                </button>
                
                <button 
                    onClick={() => navigate('/')}
                    style={{ width: '100%', marginTop: '12px', backgroundColor: '#e5e7eb', color: '#374151', fontSize: '16px', fontWeight: '600', padding: '14px', borderRadius: '12px', border: 'none' }}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
