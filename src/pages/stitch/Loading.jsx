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
    const [gpsStatus, setGpsStatus] = useState('Obteniendo GPS...'); // Status message
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
                const newLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                setLocation(newLoc);
                setLoading(false);
                setGpsStatus('GPS conectado');

                const acc = position.coords.accuracy;
                if (acc < 10) setAccuracyText('🟢 Excelente precisión');
                else if (acc < 25) setAccuracyText('🟡 Buena precisión');
                else if (acc < 50) setAccuracyText('🟠 Precisión moderada');
                else setAccuracyText('🔴 Precisión baja');
            },
            (err) => {
                // Only set denied if it's a permission error
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
            // First try - give it time to get GPS
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
                    // Permission denied - show error
                    if (err.code === err.PERMISSION_DENIED) {
                        setGpsDenied(true);
                        setGpsStatus('Permiso denegado');
                    } else if (err.code === err.POSITION_UNAVAILABLE) {
                        setGpsStatus('GPS no disponible, usando ubicación por defecto');
                        // Use default location but allow continue
                        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                        setLoading(false);
                    } else {
                        // Timeout - wait for watchPosition
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
                if (err.code === err.PERMISSION_DENIED) {
                    setGpsDenied(true);
                }
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
        
        // Force loading to false after 5 seconds even if no response
        setTimeout(() => {
            if (location) setLoading(false);
        }, 5000);
    };

    // GPS explícitamente denegado
    if (gpsDenied) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        return (
            <div className="min-h-screen bg-red-50 flex flex-col">
                <header className="bg-red-600 p-4">
                    <h1 className="text-xl font-bold text-white text-center">📍 Confirmar Ubicación</h1>
                </header>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <WifiOff className="w-12 h-12 text-red-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">GPS Desactivado</h2>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">Activa el GPS para continuar</p>
                        <p className="text-sm text-gray-500">
                            {isIOS ? 'iPhone: Configuración > Privacidad > Ubicación' : 'Android: Configuración > Ubicación'}
                        </p>
                    </div>

                    <button onClick={handleRetry} className="w-full bg-red-600 text-white text-lg font-bold py-4 rounded-xl mb-3">
                        🔄 Reintentar
                    </button>
                    
                    {/* Botón para continuar sin GPS */}
                    <button onClick={handleConfirmLocation} className="w-full bg-gray-200 text-gray-800 text-lg font-bold py-3 rounded-xl">
                        ⚠️ Continuar sin GPS
                    </button>
                </div>
            </div>
        );
    }

    // Cargando - mostrar spinner con status
    if (loading) {
        return (
            <div className="min-h-screen bg-red-50 flex flex-col">
                <header className="bg-red-600 p-4">
                    <h1 className="text-xl font-bold text-white text-center">📍 Confirmar Ubicación</h1>
                </header>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <Loader className="w-16 h-16 animate-spin text-red-600 mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Obteniendo ubicación...</h2>
                    <p className="text-gray-500 text-center">{gpsStatus}</p>
                    <p className="text-sm text-gray-400 mt-4">Por favor espera un momento</p>
                </div>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const typeColor = type === 'insecurity' ? 'red' : 'blue';
    const TypeIcon = type === 'insecurity' ? AlertTriangle : Plus;
    const mapCenter = location ? [location.lat, location.lng] : [-33.4489, -70.6693];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
            <header className={`bg-${typeColor}-600 p-4`}>
                <h1 className="text-xl font-bold text-white text-center">📍 {typeLabel}</h1>
            </header>

            {/* GPS Status */}
            <div className="bg-green-50 p-3 mx-4 mt-3 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{gpsStatus}</span>
                </div>
                {accuracyText && <p className="text-xs text-green-700 mt-1 ml-7">{accuracyText}</p>}
            </div>

            {/* Coordenadas */}
            {location && (
                <div className="bg-blue-50 p-3 mx-4 mt-2 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-mono">📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>
            )}

            {/* Mapa */}
            <div className="flex-1 mx-2 mt-2 rounded-xl overflow-hidden shadow-lg" style={{ minHeight: '300px' }}>
                <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {location && <Marker position={[location.lat, location.lng]} icon={customIcon} />}
                </MapContainer>
            </div>

            <div className="p-4 pb-24 bg-white">
                <button onClick={handleRefreshGPS} className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-3 rounded-xl font-medium mb-3">
                    <RefreshCw size={20} />Actualizar GPS
                </button>
                <button onClick={handleConfirmLocation} className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                    <MapPin size={24} />Confirmar Ubicación
                </button>
            </div>
        </div>
    );
}
