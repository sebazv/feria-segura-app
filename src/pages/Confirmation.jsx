import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function Confirmation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');

    return (
        <div className="flex flex-col min-h-screen items-center justify-between bg-white dark:bg-black p-6 py-12">

            {/* Top Section */}
            <div className="flex flex-col items-center mt-10 text-center space-y-6">
                <div className="animate-bounce">
                    <CheckCircle2 size={120} className="text-[#13ec5b] drop-shadow-lg" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white uppercase tracking-tight">
                    Alerta<br />Enviada
                </h1>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 max-w-sm">
                    Su ubicación ha sido compartida con seguridad.
                </p>
            </div>

            {/* Center Status Card */}
            <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 flex flex-col items-center justify-center my-8 shadow-inner">
                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute w-20 h-20 bg-[#13ec5b] rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-16 h-16 bg-[#13ec5b] rounded-full shadow-[0_0_15px_#13ec5b]"></div>
                </div>
                <h2 className="text-3xl font-black text-center text-black dark:text-white">
                    Ayuda en camino
                </h2>
                <p className="text-xl text-center font-semibold text-gray-600 dark:text-gray-400 mt-2">
                    {type === 'insecurity' ? 'Personal de seguridad alertado' : 'Asistencia médica alertada'}
                </p>
            </div>

            {/* Bottom Cancel Button */}
            <div className="w-full max-w-md mt-auto pb-4">
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-full py-6 text-2xl font-black uppercase tracking-wider transition-colors active:scale-95"
                >
                    Cancelar por error
                </button>
            </div>

        </div>
    );
}
