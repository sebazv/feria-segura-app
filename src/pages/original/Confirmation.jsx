import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Shield, Plus, Edit, Send, Home as HomeIcon, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapControls({ zoom, setZoom }) {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button onClick={() => { map.zoomIn(); setZoom(map.getZoom()); }} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
        <ZoomIn size={20} />
      </button>
      <button onClick={() => { map.zoomOut(); setZoom(map.getZoom()); }} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
        <ZoomOut size={20} />
      </button>
    </div>
  );
}

export default function Confirmation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [zoom, setZoom] = useState(16);

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const TypeIcon = type === 'insecurity' ? Shield : Plus;
    const bgColor = type === 'insecurity' ? 'red' : 'blue';

    const handleSendAlert = async () => {
        setSending(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSending(false);
        setSent(true);
    };

    if (sent) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-between bg-white dark:bg-black p-6 py-12">
                <div className="flex flex-col items-center mt-10 text-center space-y-6">
                    <div className="animate-bounce">
                        <CheckCircle2 size={120} className="text-[#13ec5b] drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white uppercase tracking-tight">
                        Alerta<br />Enviada
                    </h1>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 max-w-sm">
                        Su ubicación ha sido compartida con seguridad y su familia.
                    </p>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-2xl font-bold text-xl"
                    >
                        VOLVER AL INICIO
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Map */}
            <div className="relative h-48 w-full">
                <MapContainer
                    center={[lat || -33.4489, lng || -70.6693]}
                    zoom={zoom}
                    style={{ width: "100%", height: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {lat && lng && <Marker position={[lat, lng]} />}
                    <MapControls zoom={zoom} setZoom={setZoom} />
                </MapContainer>

                <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-gray-800/95 rounded-xl p-3 shadow-lg z-[1000]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full bg-${bgColor}-100`}>
                                <TypeIcon className={`w-4 h-4 text-${bgColor}-600`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium">{typeLabel}</p>
                                <p className="text-xs text-gray-500">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
                            </div>
                        </div>
                        <button onClick={() => navigate(`/loading?type=${type}`)} className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Edit size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="text-center">
                    <h1 className="text-2xl font-black uppercase mb-2">Confirmar Alerta</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">¿La ubicación es correcta?</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleSendAlert}
                        disabled={sending}
                        className={`w-full bg-${bgColor}-600 hover:bg-${bgColor}-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2`}
                    >
                        {sending ? 'Enviando...' : 'ENVIAR ALERTA'}
                    </button>
                    <button
                        onClick={() => navigate(`/loading?type=${type}`)}
                        className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium"
                    >
                        Cambiar ubicación
                    </button>
                </div>
            </div>
        </div>
    );
}
