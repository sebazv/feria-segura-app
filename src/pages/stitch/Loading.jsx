import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
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
      <button
        onClick={handleZoomIn}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={handleZoomOut}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
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

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [zoom, setZoom] = useState(16);
    const [watchingPosition, setWatchingPosition] = useState(false);
    const [accuracyText, setAccuracyText] = useState('');
    const watchIdRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Función para iniciar monitoreo de GPS continuo
    const startWatchingPosition = () => {
        if (!navigator.geolocation) return;

        // Si ya está monitoreando, no iniciar otra vez
        if (watchIdRef.current !== null) return;

        setWatchingPosition(true);

        // Usar watchPosition para monitoreo continuo
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                setLocation(newLocation);
                setLoading(false);

                // Actualizar texto de precisión
                const acc = position.coords.accuracy;
                if (acc < 10) {
                    setAccuracyText('🟢 Excelente precisión GPS');
                } else if (acc < 25) {
                    setAccuracyText('🟡 Buena precisión');
                } else if (acc < 50) {
                    setAccuracyText('🟠 Precisión moderada');
                } else {
                    setAccuracyText('🔴 Precisión baja - intente moverse a un lugar abierto');
                }
            },
            (error) => {
                console.log('Error GPS:', error.message);
                setAccuracyText('⚠️ GPS no disponible');
            },
            { 
                enableHighAccuracy: true, // SIEMPRE alta precisión
                timeout: 15000,
                maximumAge: 0, // No usar ubicaciones cached
                distanceFilter: 1 // Actualizar cada 1 metro de movimiento
            }
        );

        watchIdRef.current = watchId;
    };

    // Obtener ubicación inicial
    useEffect(() => {
        if (!isClient) return;
        
        if (navigator.geolocation) {
            // Primera obtención con alta precisión
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    setLoading(false);
                    
                    // Iniciar monitoreo continuo para mejor precisión
                    startWatchingPosition();
                },
                () => {
                    setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                    setLoading(false);
                    setAccuracyText('⚠️ Usando ubicación por defecto');
                },
                { 
                    enableHighAccuracy: true, // SIEMPRE alta precisión
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        } else {
            setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
            setLoading(false);
        }

        // Cleanup al desmontar
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [isClient]);

    const handleConfirmLocation = () => {
        if (location) {
            navigate(`/confirmation?type=${type}&lat=${location.lat}&lng=${location.lng}`);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLoading(false);
            },
            () => {
                setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                setLoading(false);
            },
            { 
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    // Forzar actualización de GPS
    const handleRefreshGPS = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setLoading(true);
        startWatchingPosition();
    };

    if (loading || !isClient) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Obteniendo ubicación GPS...
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    Por favor permita el acceso a su ubicación
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    📡 Usando GPS de alta precisión
                </p>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const typeColor = type === 'insecurity' ? 'red' : 'blue';
    const TypeIcon = type === 'insecurity' ? AlertTriangle : Plus;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <header className="bg-white dark:bg-gray-800 p-4 shadow-sm z-10 relative">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-${typeColor}-100 dark:bg-${typeColor}-900/30`}>
                        <TypeIcon className={`w-5 h-5 text-${typeColor}-600`} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                            Confirmar Ubicación
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {typeLabel}
                        </p>
                    </div>
                </div>
            </header>

            {/* GPS Status Banner */}
            <div className="bg-green-50 dark:bg-green-900/30 p-3 mx-4 mt-3 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            GPS Activado
                        </span>
                    </div>
                    {watchingPosition && (
                        <span className="text-xs text-green-600 animate-pulse">
                            ● Monitoreando
                        </span>
                    )}
                </div>
                {accuracyText && (
                    <p className="text-xs mt-1 ml-7 text-green-700 dark:text-green-400">
                        {accuracyText}
                    </p>
                )}
            </div>

            {/* Accuracy indicator */}
            {location?.accuracy && (
                <div className="mx-4 mt-2 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Precisión: ±{Math.round(location.accuracy)}m
                    </span>
                </div>
            )}

            <div className="flex-1 relative mt-2 mx-2 rounded-2xl overflow-hidden shadow-xl">
                {isClient && location && (
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={zoom}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker location={location} setLocation={setLocation} />
                        <MapControls zoom={zoom} setZoom={setZoom} />
                    </MapContainer>
                )}
            </div>

            {/* Info */}
            <div className="p-4 pb-24 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={16} />
                    <span>Toque el mapa para ajustar si es necesario</span>
                </div>

                {/* Botón actualizar GPS */}
                <button
                    onClick={handleRefreshGPS}
                    className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-3 rounded-xl font-medium mb-3"
                >
                    <RefreshCw size={20} />
                    Actualizar GPS
                </button>

                <button
                    onClick={handleConfirmLocation}
                    disabled={!location}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    <MapPin size={24} />
                    Confirmar Ubicación
                </button>
            </div>
        </div>
    );
}
