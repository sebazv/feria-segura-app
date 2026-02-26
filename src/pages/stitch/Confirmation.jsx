import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Shield, Plus, Check, Edit, Send, Home as HomeIcon } from 'lucide-react';

export default function StitchConfirmation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [address, setAddress] = useState('');

    useEffect(() => {
        // Simulate reverse geocoding
        if (lat !== 0 && lng !== 0) {
            setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        } else {
            setAddress('Ubicación por defecto');
        }
    }, [lat, lng]);

    const handleSendAlert = async () => {
        setSending(true);
        
        // Simulate API call
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
                {/* Visual Polish: Decorative Gradient Background elements */}
                <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#13ec5b]/30 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#13ec5b]/20 rounded-full blur-[100px]"></div>
                </div>

                <main className="flex-1 flex flex-col items-center justify-between p-6 max-w-md mx-auto w-full relative z-10">
                    <div className="w-full flex flex-col items-center pt-8">
                        {/* Large Success Indicator */}
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute w-32 h-32 bg-[#13ec5b]/20 rounded-full animate-pulse blur-sm"></div>
                            <div className="relative bg-[#13ec5b] text-slate-900 w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(19,236,91,0.6)]">
                                <span className="material-symbols-outlined text-[64px] font-bold">check</span>
                            </div>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[40px] font-extrabold leading-tight text-center px-2 mb-4 uppercase">
                            ALERTA ENVIADA
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xl font-normal leading-relaxed text-center px-4">
                            Su ubicación ha sido compartida con seguridad y su familia.
                        </p>
                    </div>

                    {/* Status Card */}
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

                    {/* Footer Action */}
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
            {/* Map Preview */}
            <div className="relative h-64 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                        linear-gradient(to right, #000 1px, transparent 1px),
                        linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: '25px 25px'
                }}></div>

                {/* Location marker */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="w-16 h-16 bg-green-500/30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className={`w-14 h-14 bg-${bgColor}-500 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 relative z-10`}>
                            <MapPin className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Location info overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-${bgColor}-100 dark:bg-${bgColor}-900/30`}>
                                    <TypeIcon className={`w-5 h-5 text-${bgColor}-600`} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Ubicación detectada</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{address}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleEditLocation}
                                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-between p-6 max-w-md mx-auto w-full">
                <div className="w-full flex flex-col items-center pt-6">
                    {/* Emergency Type Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${bgColor}-100 dark:bg-${bgColor}-900/30 mb-4`}>
                        <TypeIcon className={`w-5 h-5 text-${bgColor}-600`} />
                        <span className={`font-semibold text-${bgColor}-700 dark:text-${bgColor}-400`}>
                            {typeLabel}
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-extrabold leading-tight text-center px-2 mb-4 uppercase">
                        Confirmar Alerta
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed text-center px-4 mb-6">
                        ¿La ubicación es correcta? Presione enviar para notificar a seguridad.
                    </p>

                    {/* Status Card */}
                    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-5 h-5 text-green-500" />
                            <span className="text-sm">Su ubicación se compartirá con el personal de seguridad</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
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
