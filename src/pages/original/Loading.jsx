import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, ZoomIn, ZoomOut, Loader } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'insecurity';
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    },
                    (err) => {
                        console.log('GPS error, using default:', err);
                        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                        setLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 15000 }
                );
            } else {
                setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
                setLoading(false);
            }
        };

        getLocation();
    }, []);

    const handleConfirmLocation = () => {
        if (location) {
            navigate(`/confirmation?type=${type}&lat=${location.lat}&lng=${location.lng}`);
        }
    };

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        if (navigator.geolocation) {
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
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader className="w-10 h-10 animate-spin text-red-600 mb-4" />
                <p className="text-gray-600 font-medium">Obteniendo ubicación...</p>
                <p className="text-gray-400 text-sm mt-1">Por favor permite el acceso a tu ubicación</p>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const typeColor = type === 'insecurity' ? 'red' : 'blue';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm">
                <h1 className="text-lg font-bold text-gray-800">Confirmar ubicación</h1>
                <p className="text-gray-500 text-sm">Alerta de {typeLabel}</p>
            </header>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[location?.lat || -33.4489, location?.lng || -70.6693]}
                    zoom={16}
                    style={{ width: '100%', height: '100%', minHeight: '300px' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {location && <Marker position={[location.lat, location.lng]} />}
                    <MapControls zoom={16} setZoom={() => {}} />
                </MapContainer>

                {/* Location info */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-3 z-[1000]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full bg-${typeColor}-100`}>
                                {type === 'insecurity' ? (
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                ) : (
                                    <Plus className="w-4 h-4 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {location?.lat?.toFixed(5)}, {location?.lng?.toFixed(5)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {location?.accuracy > 0 ? `Precisión: ±${Math.round(location.accuracy)}m` : 'Ubicación por defecto'}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleRetry} className="p-2 rounded-full bg-gray-100">
                            <RefreshCw size={16} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white p-4 safe-area-bottom">
                <button
                    onClick={handleConfirmLocation}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                    <MapPin size={20} />
                    Confirmar ubicación
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-2 text-gray-500 py-2"
                >
                    Cancelar
                </button>
            </footer>
        </div>
    );
}
