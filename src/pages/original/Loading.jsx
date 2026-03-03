import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, ZoomIn, ZoomOut, Loader, Crosshair, WifiOff, Settings } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapControls({ zoom, setZoom }) {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
    setZoom(map.getZoom());
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
    setZoom(map.getZoom());
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <ZoomIn size={20} />
      </button>
      <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <ZoomOut size={20} />
      </button>
    </div>
  );
}

function LocationMarker({ location, setLocation }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setLocation({ ...location, lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (location.lat && location.lng) {
      map.setView([location.lat, location.lng], map.getZoom());
    }
  }, [location.lat, location.lng, map]);

  return location.lat && location.lng ? (
    <Marker position={[location.lat, location.lng]} />
  ) : null;
}

// GPS Desactivado Prompt
function GPSRequestPrompt({ onRetry }) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const openSettings = () => {
        if (isIOS) {
            window.location.href = 'App-Prefs:Privacy&path=LOCATION';
        } else if (isAndroid) {
            window.location.href = 'android.settings.LOCATION_SOURCE_SETTINGS';
        } else {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="w-12 h-12 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                📍 GPS Desactivado
            </h2>
            
            <div className="bg-white rounded-2xl p-6 max-w-md shadow-lg mb-6">
                <p className="text-lg text-gray-600 text-center mb-4">
                    Para enviar una alerta necesitamos tu ubicación.
                </p>
                
                <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">1.</span>
                        <p className="text-gray-700">Ve a <strong>Configuración</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">2.</span>
                        <p className="text-gray-700">Busca <strong>Ubicación</strong> o <strong>GPS</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">3.</span>
                        <p className="text-gray-700"><strong>Actívalo</strong> y vuelve</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-md">
                <button
                    onClick={openSettings}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    <Settings size={24} />
                    Abrir Configuración
                </button>
                
                <button
                    onClick={onRetry}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                    <RefreshCw size={24} />
                    Reintentar
                </button>
            </div>
        </div>
    );
}

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'insecurity';
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(16);
    const [watchingPosition, setWatchingPosition] = useState(false);
    const [accuracyText, setAccuracyText] = useState('');
    const [gpsEnabled, setGpsEnabled] = useState(null);
    const watchIdRef = useRef(null);

    const startWatchingPosition = () => {
        if (!navigator.geolocation) {
            setGpsEnabled(false);
            return;
        }

        if (watchIdRef.current !== null) return;

        setWatchingPosition(true);

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
                if (acc < 10) setAccuracyText('🟢 Excelente precisión');
                else if (acc < 25) setAccuracyText('🟡 Buena precisión');
                else if (acc < 50) setAccuracyText('🟠 Precisión moderada');
                else setAccuracyText('🔴 Precisión baja');
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) setGpsEnabled(false);
                setAccuracyText('⚠️ GPS no disponible');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, distanceFilter: 1 }
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
                (error) => {
                    if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
                        setGpsEnabled(false);
                    } else {
                        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                    }
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
            (error) => {
                if (error.code === error.PERMISSION_DENIED) setGpsEnabled(false);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
        return <GPSRequestPrompt onRetry={handleRetry} />;
    }

    // Cargando
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Loader className="w-16 h-16 animate-spin text-green-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Obteniendo GPS...
                </h2>
                <p className="text-gray-500">Permite el acceso a tu ubicación</p>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const typeColor = type === 'insecurity' ? 'red' : 'blue';
    const TypeIcon = type === 'insecurity' ? AlertTriangle : Plus;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
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

            {/* GPS Status */}
            <div className="bg-green-50 p-3 mx-4 mt-3 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">GPS Activo</span>
                    </div>
                    {watchingPosition && (
                        <span className="text-xs text-green-600 animate-pulse">● Monitoreando</span>
                    )}
                </div>
                {accuracyText && (
                    <p className="text-xs mt-1 ml-7 text-green-700">{accuracyText}</p>
                )}
            </div>

            {location?.accuracy && (
                <div className="mx-4 mt-2 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Precisión: ±{Math.round(location.accuracy)}m</span>
                </div>
            )}

            {/* Mapa */}
            <div className="flex-1 relative mt-2 mx-2 rounded-2xl overflow-hidden shadow-xl">
                {location && (
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={zoom}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker location={location} setLocation={setLocation} />
                        <MapControls zoom={zoom} setZoom={setZoom} />
                    </MapContainer>
                )}
            </div>

            <div className="p-4 pb-24 bg-white">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>Toca el mapa para ajustar</span>
                </div>

                <button
                    onClick={handleRefreshGPS}
                    className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 rounded-xl font-medium mb-3"
                >
                    <RefreshCw size={20} />
                    Actualizar GPS
                </button>

                <button
                    onClick={handleConfirmLocation}
                    disabled={!location}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xl font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    <MapPin size={24} />
                    Confirmar Ubicación
                </button>
            </div>
        </div>
    );
}
