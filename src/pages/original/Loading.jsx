import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, ZoomIn, ZoomOut, Loader, Crosshair } from 'lucide-react';
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

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'insecurity';
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchingPosition, setWatchingPosition] = useState(false);
    const [accuracyText, setAccuracyText] = useState('');
    const watchIdRef = useRef(null);

    // Función para iniciar monitoreo de GPS continuo
    const startWatchingPosition = () => {
        if (!navigator.geolocation) return;
        if (watchIdRef.current !== null) return;

        setWatchingPosition(true);

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                setLocation(newLocation);
                setLoading(false);

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
            (err) => {
                console.log('GPS error:', err.message);
                setAccuracyText('⚠️ GPS no disponible');
            },
            { 
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
                distanceFilter: 1
            }
        );

        watchIdRef.current = watchId;
    };

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
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
                        console.log('GPS error, using default:', err);
                        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                        setLoading(false);
                        setAccuracyText('⚠️ Usando ubicación por defecto');
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                );
            } else {
                setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                setLoading(false);
            }
        };

        getLocation();

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
            { enableHighAccuracy: true, timeout: 15000 }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <Loader className="w-16 h-16 animate-spin text-green-600 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Obteniendo ubicación GPS...
                </h2>
                <p className="text-gray-500 text-center">
                    Por favor permita el acceso a su ubicación
                </p>
                <p className="text-sm text-green-600 mt-2">
                    📡 Usando GPS de alta precisión
                </p>
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
                        <h1 className="text-lg font-bold text-gray-800">
                            Confirmar Ubicación
                        </h1>
                        <p className="text-sm text-gray-500">
                            {typeLabel}
                        </p>
                    </div>
                </div>
            </header>

            {/* GPS Status */}
            <div className="bg-green-50 p-3 mx-4 mt-3 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
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
                    <p className="text-xs mt-1 ml-7 text-green-700">
                        {accuracyText}
                    </p>
                )}
            </div>

            {location?.accuracy && (
                <div className="mx-4 mt-2 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                        Precisión: ±{Math.round(location.accuracy)}m
                    </span>
                </div>
            )}

            <div className="flex-1 relative mt-2 mx-2 rounded-2xl overflow-hidden shadow-xl">
                {location && (
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker location={location} setLocation={setLocation} />
                        <MapControls zoom={16} setZoom={() => {}} />
                    </MapContainer>
                )}
            </div>

            <div className="p-4 pb-24 bg-white">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>Toque el mapa para ajustar si es necesario</span>
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
