import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Shield, Plus, Edit, Send, ZoomIn, ZoomOut, Loader, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { sendAlert } from '../../lib/alerts';
import { useAuth } from '../../lib/auth';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapControls({ setZoom }) {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button onClick={() => { map.zoomIn(); setZoom(map.getZoom()); }} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <ZoomIn size={20} />
      </button>
      <button onClick={() => { map.zoomOut(); setZoom(map.getZoom()); }} className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <ZoomOut size={20} />
      </button>
    </div>
  );
}

export default function Confirmation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, userData } = useAuth();
    
    const type = searchParams.get('type') || 'insecurity';
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [zoom, setZoom] = useState(16);

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const TypeIcon = type === 'insecurity' ? Shield : Plus;
    const bgColorClass = type === 'insecurity' ? 'bg-red-600' : 'bg-blue-600';

    const handleSendAlert = async () => {
        // Verificar que el usuario esté logueado
        if (!user || !userData) {
            setError('Debes iniciar sesión para enviar alertas');
            return;
        }
        
        setSending(true);
        setError('');

        try {
            const result = await sendAlert({
                tipo: type,
                lat,
                lng,
                userId: user.id,
                userName: userData?.nombre || userData?.email?.split('@')[0] || 'Usuario',
                userPhone: userData?.telefono || '',
                puestoNumero: userData?.puesto_numero || '',
                accuracy: 0
            });

            if (result.success) {
                setSent(true);
            } else {
                setError(result.error || 'Error al enviar alerta');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error al enviar alerta');
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-green-50 dark:bg-green-900 flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-6">
                    <Check className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">✅ Alerta Enviada</h1>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
                    📍 {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    {typeLabel} - El personal de seguridad ha sido notificado
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    // Si no está logueado, mostrar mensaje
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">🔐 Inicia Sesión</h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    Debes iniciar sesión para poder enviar alertas de emergencia
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium"
                >
                    Iniciar Sesión
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Map */}
            <div className="h-48 relative">
                <MapContainer
                    center={[lat || -33.4489, lng || -70.6693]}
                    zoom={zoom}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {lat && lng && <Marker position={[lat, lng]} />}
                    <MapControls zoom={zoom} setZoom={setZoom} />
                </MapContainer>

                <div className="absolute bottom-3 left-3 right-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg z-[1000]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${type === 'insecurity' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <TypeIcon className={`w-4 h-4 ${type === 'insecurity' ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium dark:text-white">{typeLabel}</p>
                                <p className="text-xs text-gray-500">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                            </div>
                        </div>
                        <button onClick={() => navigate(`/loading?type=${type}`)} className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Edit size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Confirmar Alerta</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">¿La ubicación es correcta?</p>

                {error && (
                    <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* User Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">📋 Enviando como:</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p><span className="font-medium">Usuario:</span> {userData?.nombre || user?.email}</p>
                        <p><span className="font-medium">Puesto:</span> {userData?.puesto_numero || 'No asignado'}</p>
                        <p><span className="font-medium">Teléfono:</span> {userData?.telefono || 'No registrado'}</p>
                    </div>
                </div>

                <div className="flex-1"></div>

                <div className="space-y-2">
                    <button
                        onClick={handleSendAlert}
                        disabled={sending}
                        className={`w-full ${bgColorClass} hover:${bgColorClass.replace('600', '700')} disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2`}
                    >
                        {sending ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send size={20} />
                                🚨 ENVIAR ALERTA DE EMERGENCIA
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => navigate(`/loading?type=${type}`)}
                        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl font-medium"
                    >
                        Cambiar ubicación
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full text-gray-500 dark:text-gray-400 py-2"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
