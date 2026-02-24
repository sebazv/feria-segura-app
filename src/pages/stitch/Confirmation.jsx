import { useNavigate, useSearchParams } from 'react-router-dom';

export default function StitchConfirmation() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');

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
                            <span className="material-symbols-outlined mr-3">close</span>
                            <span className="truncate">CANCELAR POR ERROR</span>
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
