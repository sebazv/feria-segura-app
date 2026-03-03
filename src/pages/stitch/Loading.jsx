import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, Loader, Crosshair, WifiOff, Settings } from 'lucide-react';
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
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accuracyText, setAccuracyText] = useState('');
    const [gpsEnabled, setGpsEnabled] = useState(null);
    const watchIdRef = useRef(null);

    const startWatchingPosition = () => {
        if (!navigator.geolocation) {
            setGpsEnabled(false);
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
                setGpsEnabled(true);

                const acc = position.coords.accuracy;
                if (acc < 10) setAccuracyText('🟢 Excelente (±' + Math.round(acc) + 'm)');
                else if (acc < 25) setAccuracyText('🟡 Buena (±' + Math.round(acc) + 'm)');
                else if (acc < 50) setAccuracyText('🟠 Moderada (±' + Math.round(acc) + 'm)');
                else setAccuracyText('🔴 Baja (±' + Math.round(acc) + 'm)');
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) setGpsEnabled(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0, distanceFilter: 5 }
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
                    setGpsEnabled(true);
                    startWatchingPosition();
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
                        setGpsEnabled(false);
                    } else {
                        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                        setGpsEnabled(true);
                    }
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
            );
        } else {
            setGpsEnabled(false);
            setLoading(false);
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
        setGpsEnabled(null);
        
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
                setGpsEnabled(true);
                startWatchingPosition();
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) setGpsEnabled(false);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
    };

    const handleRefreshGPS = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setLoading(true);
        startWatchingPosition();
    };

    // GPS Desactivado
    if (gpsEnabled === false) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        const openSettings = () => {
            if (isIOS) window.location.href = 'App-Prefs:Privacy&path=LOCATION';
            else if (isAndroid) window.location.href = 'android.settings.LOCATION_SOURCE_SETTINGS';
            else window.location.reload();
        };

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <WifiOff className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">📍 GPS Desactivado</h2>
                <div className="bg-white rounded-2xl p-6 max-w-md shadow-lg mb-6">
                    <p className="text-lg text-gray-600 text-center mb-4">Necesitamos tu ubicación para enviar alertas.</p>
                    <div className="space-y-2 text-left">
                        <p>1. Ve a <strong>Configuración</strong></p>
                        <p>2. Busca <strong>Ubicación</strong></p>
                        <p>3. <strong>Actívalo</strong></p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-md">
                    <button onClick={openSettings} className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 rounded-xl">Abrir Configuración</button>
                    <button onClick={handleRetry} className="w-full bg-gray-200 text-gray-800 text-lg font-bold py-4 rounded-xl">Reintentar</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Loader className="w-16 h-16 animate-spin text-green-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800">Obteniendo GPS...</h2>
                <p className="text-gray-500">Permite el acceso a tu ubicación</p>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const typeColor = type === 'insecurity' ? 'red' : 'blue';
    const TypeIcon = type === 'insecurity' ? AlertTriangle : Plus;
    const mapCenter = location ? [location.lat, location.lng] : [-33.4489, -70.6693];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
            <header className="bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-${typeColor}-100`}>
                        <TypeIcon className={`w-5 h-5 text-${typeColor}-600`} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Confirmar Ubicación</h1>
                        <p className="text-sm text-gray-500">{typeLabel}</p>
                    </div>
                </div>
            </header>

            <div className="bg-green-50 p-3 mx-4 mt-3 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">GPS Activo</span>
                    {accuracyText && <span className="text-xs text-green-700 ml-2">{accuracyText}</span>}
                </div>
            </div>

            {location && (
                <div className="bg-blue-50 p-3 mx-4 mt-2 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-mono">📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>
            )}

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
                <button onClick={handleConfirmLocation} disabled={!location} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xl font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                    <MapPin size={24} />Confirmar
                </button>
            </div>
        </div>
    );
}
