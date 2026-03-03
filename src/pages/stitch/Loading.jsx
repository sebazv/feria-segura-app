import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, Loader, WifiOff } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
    const type = searchParams.get('type');
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accuracyText, setAccuracyText] = useState('');
    const [gpsDenied, setGpsDenied] = useState(false);
    const [gpsStatus, setGpsStatus] = useState('Obteniendo GPS...');
    const watchIdRef = useRef(null);

    const startWatchingPosition = () => {
        if (!navigator.geolocation) {
            setGpsDenied(true);
            setGpsStatus('GPS no disponible');
            return;
        }

        if (watchIdRef.current !== null) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLoading(false);
                setGpsStatus('GPS conectado');

                const acc = position.coords.accuracy;
                if (acc < 10) setAccuracyText('🟢 Excelente precisión');
                else if (acc < 25) setAccuracyText('🟡 Buena precisión');
                else if (acc < 50) setAccuracyText('🟠 Precisión moderada');
                else setAccuracyText('🔴 Precisión baja');
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setGpsDenied(true);
                }
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0, distanceFilter: 10 }
        );

        watchIdRef.current = watchId;
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    setLoading(false);
                    setGpsStatus('GPS conectado');
                    startWatchingPosition();
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        setGpsDenied(true);
                        setGpsStatus('Permiso denegado');
                    } else if (err.code === err.POSITION_UNAVAILABLE) {
                        setGpsStatus('GPS no disponible, usando ubicación por defecto');
                        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                        setLoading(false);
                    } else {
                        setGpsStatus('Buscando señales GPS...');
                        startWatchingPosition();
                    }
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            setGpsDenied(true);
            setGpsStatus('GPS no soportado');
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const handleConfirmLocation = () => {
        if (location) {
            navigate(`/confirmation?type=${type}&lat=${location.lat}&lng=${location.lng}`);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setGpsDenied(false);
        setGpsStatus('Reintentando...');
        
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLoading(false);
                startWatchingPosition();
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) setGpsDenied(true);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
    };

    const handleRefreshGPS = () => {
        setLoading(true);
        setGpsStatus('Actualizando GPS...');
        
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        
        startWatchingPosition();
        
        setTimeout(() => {
            if (location) setLoading(false);
        }, 5000);
    };

    if (gpsDenied) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <div style={{ backgroundColor: '#dc2626', padding: '20px' }}>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>📍 Confirmar Ubicación</h1>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div style={{ width: '100px', height: '100px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '48px' }}>📍</span>
                    </div>
                    
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '16px' }}>GPS Desactivado</h2>
                    
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '12px' }}>Activa el GPS para continuar</p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Configuración → Ubicación</p>
                    </div>

                    <button onClick={handleRetry} style={{ width: '100%', backgroundColor: '#dc2626', color: 'white', fontSize: '18px', fontWeight: 'bold', padding: '16px', borderRadius: '12px', border: 'none', marginBottom: '12px' }}>
                        🔄 Reintentar
                    </button>
                    
                    <button onClick={handleConfirmLocation} style={{ width: '100%', backgroundColor: '#9ca3af', color: 'white', fontSize: '18px', fontWeight: 'bold', padding: '16px', borderRadius: '12px', border: 'none' }}>
                        ⚠️ Continuar sin GPS
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <div style={{ backgroundColor: '#dc2626', padding: '20px' }}>
                    <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>📍 Confirmar Ubicación</h1>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div style={{ width: '64px', height: '64px', border: '4px solid #dc2626', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Obteniendo ubicación...</h2>
                    <p style={{ color: '#6b7280', textAlign: 'center' }}>{gpsStatus}</p>
                </div>
                
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const headerColor = type === 'insecurity' ? '#dc2626' : '#2563eb';
    const mapCenter = location ? [location.lat, location.lng] : [-33.4489, -70.6693];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col" style={{ height: '100vh' }}>
            <div style={{ backgroundColor: headerColor, padding: '16px' }}>
                <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }}>📍 {typeLabel}</h1>
            </div>

            <div style={{ backgroundColor: '#dcfce7', padding: '12px', margin: '12px', borderRadius: '12px', border: '1px solid #86efac' }}>
                <span style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>✅ {gpsStatus}</span>
                {accuracyText && <p style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>{accuracyText}</p>}
            </div>

            {location && (
                <div style={{ backgroundColor: '#dbeafe', padding: '12px', margin: '12px', borderRadius: '12px', border: '1px solid #93c5fd' }}>
                    <p style={{ fontSize: '14px', color: '#1e40af', fontFamily: 'monospace' }}>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>
            )}

            <div style={{ flex: 1, margin: '8px', borderRadius: '12px', overflow: 'hidden', minHeight: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {location && <Marker position={[location.lat, location.lng]} icon={customIcon} />}
                </MapContainer>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'white', paddingBottom: '100px' }}>
                <button onClick={handleRefreshGPS} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', fontSize: '16px', fontWeight: '600', padding: '14px', borderRadius: '12px', border: 'none', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    🔄 Actualizar GPS
                </button>
                <button onClick={handleConfirmLocation} style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', fontSize: '20px', fontWeight: 'bold', padding: '18px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    ✅ Confirmar Ubicación
                </button>
            </div>
        </div>
    );
}
