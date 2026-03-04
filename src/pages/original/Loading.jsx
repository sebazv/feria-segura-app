import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../../lib/supabase/client';

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

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'insecurity';

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gpsStatus, setGpsStatus] = useState('Iniciando GPS...');
    const [accuracyText, setAccuracyText] = useState('');
    const [gpsDenied, setGpsDenied] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const watchIdRef = useRef(null);

    useEffect(() => {
        const getLocation = () => {
            if (!navigator.geolocation) {
                setGpsDenied(true);
                setGpsStatus('GPS no disponible');
                setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy });
                    setGpsStatus('GPS conectado');
                    setLoading(false);
                    const acc = position.coords.accuracy;
                    if (acc < 10) setAccuracyText('🟢 Excelente');
                    else if (acc < 25) setAccuracyText('🟡 Buena');
                    else if (acc < 50) setAccuracyText('🟠 Moderada');
                    else setAccuracyText('🔴 Baja');
                    startWatching();
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) { setGpsDenied(true); setGpsStatus('GPS desactivado'); }
                    setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        };

        const startWatching = () => {
            if (watchIdRef.current !== null) return;
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy });
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
        return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
    }, []);

    const handleSendAlert = async () => {
        if (!location) return;
        setSending(true);

        try {
            const usuarioData = localStorage.getItem('feria_usuario');
            const usuario = usuarioData ? JSON.parse(usuarioData) : null;

            if (!usuario) { alert('Debes iniciar sesión'); setSending(false); return; }

            const { error } = await supabase.from('alertas').insert({
                tipo: type, lat: location.lat, lng: location.lng, accuracy: location.accuracy,
                user_id: usuario.id, user_name: usuario.nombre, user_phone: usuario.telefono,
                puesto_numero: usuario.puesto_numero, status: 'active', created_at: new Date().toISOString()
            });

            if (error) throw error;

            await supabase.from('usuarios').update({ alertas_enviadas: (usuario.alertas_enviadas || 0) + 1, puntos: (usuario.puntos || 0) + 10 }).eq('id', usuario.id);

            setSent(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            alert('Error al enviar. Intenta de nuevo.');
            setSending(false);
        }
    };

    const handleRetryGPS = () => {
        setLoading(true); setGpsDenied(false); setGpsStatus('Reintentando...');
        navigator.geolocation.getCurrentPosition(
            (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }); setGpsStatus('GPS conectado'); setGpsDenied(false); setLoading(false); },
            (err) => { if (err.code === err.PERMISSION_DENIED) { setGpsDenied(true); setGpsStatus('GPS desactivado'); } setLoading(false); },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const isInsecurity = type === 'insecurity';
    const headerColor = isInsecurity ? '#dc2626' : '#2563eb';
    const mapCenter = location ? [location.lat, location.lng] : [-33.4489, -70.6693];

    if (sent) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
                <div style={{ backgroundColor: headerColor, padding: '20px' }}>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>{isInsecurity ? '🛡️ ALERTA ENVIADA' : '🏥 EMERGENCIA ENVIADA'}</h1>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '60px' }}>✓</span>
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>¡Alerta Enviada!</h2>
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '20px' }}>Redirigiendo...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
                <div style={{ backgroundColor: headerColor, padding: '20px' }}><h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>📍 {isInsecurity ? '🛡️ INSEGURIDAD' : '🏥 EMERGENCIA'}</h1></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                    <div style={{ width: '60px', height: '60px', border: '4px solid ' + headerColor, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
                <p style={{ textAlign: 'center', color: '#6b7280' }}>{gpsStatus}</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ backgroundColor: headerColor, padding: '16px' }}><h1 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }}>{isInsecurity ? '🛡️ INSEGURIDAD' : '🏥 EMERGENCIA'}</h1></div>
            <div style={{ backgroundColor: gpsDenied ? '#fee2e2' : '#dcfce7', padding: '12px', margin: '12px', borderRadius: '12px' }}><p style={{ fontSize: '14px', color: gpsDenied ? '#dc2626' : '#166534' }}>{gpsDenied ? '⚠️ ' + gpsStatus : '✅ ' + gpsStatus}{accuracyText && ' - ' + accuracyText}</p></div>
            {gpsDenied && <div style={{ padding: '0 12px' }}><button onClick={handleRetryGPS} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', fontSize: '16px', padding: '12px', borderRadius: '8px', border: 'none' }}>🔄 Activar GPS</button></div>}
            {location && <div style={{ backgroundColor: '#dbeafe', padding: '12px', margin: '12px', borderRadius: '12px' }}><p style={{ fontSize: '14px', color: '#1e40af', fontFamily: 'monospace' }}>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p></div>}
            <div style={{ flex: 1, margin: '8px', borderRadius: '12px', overflow: 'hidden', minHeight: '250px' }}><MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{location && <Marker position={[location.lat, location.lng]} icon={customIcon} />}</MapContainer></div>
            <div style={{ padding: '16px', backgroundColor: 'white', paddingBottom: '100px' }}>
                <button onClick={handleSendAlert} disabled={sending || !location} style={{ width: '100%', backgroundColor: sending ? '#9ca3af' : headerColor, color: 'white', fontSize: '22px', fontWeight: 'bold', padding: '20px', borderRadius: '12px', border: 'none' }}>{sending ? 'Enviando...' : '📤 ENVIAR ALERTA'}</button>
                <button onClick={() => navigate('/')} style={{ width: '100%', marginTop: '12px', backgroundColor: '#e5e7eb', color: '#374151', fontSize: '16px', padding: '14px', borderRadius: '12px', border: 'none' }}>Cancelar</button>
            </div>
        </div>
    );
}
