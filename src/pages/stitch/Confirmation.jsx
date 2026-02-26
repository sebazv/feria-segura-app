import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Shield, Plus, Edit, Send, Home as HomeIcon, ZoomIn, ZoomOut, Navigation } from 'lucide-react';
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
      <button
        onClick={() => { map.zoomIn(); setZoom(map.getZoom()); }}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={() => { map.zoomOut(); setZoom(map.getZoom()); }}
        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300"
      >
        <ZoomOut size={20} />
      </button>
    </div>
  );
}

export default function StitchConfirmation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [address, setAddress] = useState('');
    const [zoom, setZoom] = useState(16);

    useEffect(() => {
        if (lat !== 0 && lng !== 0) {
            setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        } else {
            setAddress('Ubicación por defecto');
        }
    }, [lat, lng]);

    const handleSendAlert = async () => {
        setSending(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSending(false);
        setSent(true);
    };

    const handleEditLocation = () => {
        navigate(`/loading?type=${type}`);
    };

    const typeLabel = type === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica';
    const TypeIcon = type === 'insecurity' ? Shield : Plus;
    const bgColor = type === 'insecurity' ? 'red' : 'blue';

    if (sent) {
        return (
            <div className="font-display text-slate-900 dark:text-slate-100 min-h-[calc(100vh-6rem)] flex flex-col bg-[#f6f8f6] dark:bg-[#102216]">
                <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#13ec5b]/30 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#13ec5b]/20 rounded-full blur-[100px]"></div>
                </div>

                <main className="flex-1 flex flex-col items-center justify-between p-6 max-w-md mx-auto w-full relative z-10">
                    <div className="w-full flex flex-col items-center pt-8">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute w-32 h-32 bg-[#13ec5b]/20 rounded-full animate-pulse blur-sm"></div>
                            <div className="relative bg-[#13ec5b] text-slate-900 w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(19,236,91,0.6)]">
                                <span className="material-symbols-outlined text-[64px] font-bold">check</span>
                            </div>
                        </div>

                        <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[40px] font-extrabold leading-tight text-center px-2 mb-4 uppercase">
                            ALERTA ENVIADA
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xl font-normal leading-relaxed text-center px-4">
                            Su ubicación ha sido compartida con seguridad y su familia.
                        </p>
                    </div>

                    <div className="w-full py-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col items-center gap-6">
                            <div className="text-center">
                                <p className="text-[#13ec5b] text-sm font-bold tracking-[0.2em] mb-1 uppercase">ESTADO ACTIVO</p>
                                <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold leading-tight mb-2">Ayuda en camino</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">
                                    {type === 'insecurity' ? 'Personal de seguridad alertado' : 'Asistencia médica alertada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full pb-8">
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-20 px-5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xl font-bold leading-normal tracking-wide transition-colors active:bg-slate-300 dark:active:bg-slate-700 border-2 border-slate-300 dark:border-slate-600"
                            >
                                <HomeIcon className="mr-3" size={24} />
                                <span className="truncate">VOLVER AL INICIO</span>
                            </button>
                            <p className="text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                                Emergencia notificada silenciosamente.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="font-display text-slate-900 dark:text-slate-100 min-h-[calc(100vh-6rem)] flex flex-col bg-[#f6f8f6] dark:bg-[#102216]">
            {/* Map Preview with OpenStreetMap */}
            <div className="relative h-56 w-full">
                <MapContainer
                    center={[lat || -33.4489, lng || -70.6693]}
                    zoom={zoom}
                    style={{ width: "100%", height: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {lat && lng && <Marker position={[lat, lng]} />}
                    <MapControls zoom={zoom} setZoom={setZoom} />
                </MapContainer>

                {/* Location info overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full bg-${bgColor}-100 dark:bg-${bgColor}-900/30`}>
                                <TypeIcon className={`w-4 h-4 text-${bgColor}-600`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-800 dark:text-white">Ubicación detectada</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{address}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleEditLocation}
                            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                            <Edit size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-between p-6 max-w-md mx-auto w-full">
                <div className="w-full flex flex-col items-center pt-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${bgColor}-100 dark:bg-${bgColor}-900/30 mb-3`}>
                        <TypeIcon className={`w-4 h-4 text-${bgColor}-600`} />
                        <span className={`text-sm font-semibold text-${bgColor}-700 dark:text-${bgColor}-400`}>
                            {typeLabel}
                        </span>
                    </div>

                    <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[28px] font-extrabold leading-tight text-center px-2 mb-3 uppercase">
                        Confirmar Alerta
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-base text-center px-4 mb-4">
                        ¿La ubicación es correcta? Presione enviar para notificar a seguridad.
                    </p>

                    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Su ubicación se compartirá con el personal de seguridad</span>
                        </div>
                    </div>
                </div>

                <div className="w-full pb-4">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleSendAlert}
                            disabled={sending}
                            className={`w-full bg-${bgColor}-600 hover:bg-${bgColor}-700 disabled:bg-${bgColor}-400 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-colors`}
                        >
                            {sending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={24} />
                                    ENVIAR ALERTA
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleEditLocation}
                            className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2"
                        >
                            <Edit size={20} />
                            Cambiar ubicación
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
