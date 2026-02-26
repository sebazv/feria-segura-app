import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, RefreshCw, AlertTriangle, Plus } from 'lucide-react';

export default function LoadingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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
                },
                (err) => {
                    setError(err.message);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setError('Geolocalización no soportada');
            setLoading(false);
        }
    }, []);

    const handleConfirmLocation = () => {
        if (location) {
            navigate(`/confirmation?type=${type}&lat=${location.lat}&lng=${location.lng}`);
        }
    };

    const handleRetry = () => {
        setError(null);
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
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleManualLocation = () => {
        // Use default location (can be customized)
        setLocation({ lat: -33.4489, lng: -70.6693, accuracy: 0 });
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Obteniendo ubicación...
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-center">
                    Por favor permita el acceso a su ubicación
                </p>
            </div>
        );
    }

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const typeColor = type === 'insecurity' ? 'red' : 'blue';
    const TypeIcon = type === 'insecurity' ? AlertTriangle : Plus;

    return (
        <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102216] flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-${typeColor}-100 dark:bg-${typeColor}-900/30`}>
                        <TypeIcon className={`w-6 h-6 text-${typeColor}-600`} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            Confirmar Ubicación
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Alerta de {typeLabel}
                        </p>
                    </div>
                </div>
            </header>

            {/* Map Placeholder */}
            <div className="flex-1 relative bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                        linear-gradient(to right, #000 1px, transparent 1px),
                        linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px'
                }}></div>

                {/* Location marker */}
                {location && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Accuracy circle */}
                            <div className="w-32 h-32 bg-green-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="w-20 h-20 bg-green-500/30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            {/* Marker */}
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 relative z-10">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            {/* Pulse effect */}
                            <div className="w-12 h-12 bg-green-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-50"></div>
                        </div>
                    </div>
                )}

                {/* Location info card */}
                {location && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                        <div className="flex items-start gap-3">
                            <Navigation className="w-5 h-5 text-green-500 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-slate-800 dark:text-white">
                                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Precisión: ±{Math.round(location.accuracy)}m
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 m-4 text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                                Error de ubicación
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {error}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRetry}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-lg font-medium"
                                >
                                    <RefreshCw size={18} />
                                    Reintentar
                                </button>
                                <button
                                    onClick={handleManualLocation}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium"
                                >
                                    Usar ubicación por defecto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <footer className="bg-white dark:bg-slate-800 p-4 safe-area-bottom">
                <div className="flex flex-col gap-3">
                    {location && (
                        <button
                            onClick={handleConfirmLocation}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                        >
                            <MapPin size={24} />
                            Confirmar ubicación
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-6 rounded-xl font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </footer>
        </div>
    );
}
