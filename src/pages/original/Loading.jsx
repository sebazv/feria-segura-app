import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus, ZoomIn, ZoomOut } from 'lucide-react';
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

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [zoom, setZoom] = useState(16);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
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
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
            setLoading(false);
        }
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
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    if (loading || !isClient) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Obteniendo ubicación...
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    Por favor permita el acceso a su ubicación
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
                            Alerta de {typeLabel}
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative">
                <MapContainer
                    center={[location?.lat || -33.4489, location?.lng || -70.6693]}
                    zoom={zoom}
                    className="w-full h-full"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {location?.lat && location?.lng && (
                        <Marker position={[location.lat, location.lng]} />
                    )}
                    <MapControls zoom={zoom} setZoom={setZoom} />
                </MapContainer>

                <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 z-[1000]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {location.accuracy > 0 ? `Precisión: ±${Math.round(location.accuracy)}m` : 'Toca el mapa para mover'}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleRetry} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                            <RefreshCw size={16} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>

            <footer className="bg-white dark:bg-gray-800 p-4 safe-area-bottom">
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirmLocation}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                    >
                        <MapPin size={24} />
                        Confirmar ubicación
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </footer>
        </div>
    );
}
