import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus } from 'lucide-react';

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

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
            <header className="bg-white dark:bg-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-${typeColor}-100 dark:bg-${typeColor}-900/30`}>
                        <TypeIcon className={`w-6 h-6 text-${typeColor}-600`} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                            Confirmar Ubicación
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Alerta de {typeLabel}
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}></div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 bg-green-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="w-20 h-20 bg-green-500/30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 relative z-10">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-50"></div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <div className="flex items-start gap-3">
                        <Navigation className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-white">
                                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {location.accuracy > 0 ? `Precisión: ±${Math.round(location.accuracy)}m` : 'Ubicación por defecto'}
                            </p>
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
