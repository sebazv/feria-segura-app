import { useStore } from '../../store';

export default function StitchProfile() {
    const { darkMode, toggleDarkMode, useStitchUI, toggleUI } = useStore();

    return (
        <div className="font-display bg-white dark:bg-[#221010] min-h-[calc(100vh-6rem)] p-6 pb-safe">
            <header className="pt-6 pb-6">
                <h1 className="text-slate-900 dark:text-slate-100 text-[32px] font-bold tracking-tight mb-4 flex items-center gap-3 w-full">
                    <span className="material-symbols-outlined !text-4xl text-[#1b64da]">person</span>
                    MI PERFIL
                </h1>
                <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
            </header>

            <main className="flex flex-col gap-6 w-full">
                {/* User Card */}
                <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-[#1a0c0c] border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <span className="material-symbols-outlined !text-5xl">person</span>
                    </div>
                    <h2 className="text-2xl font-bold uppercase text-slate-900 dark:text-white">Juan Pérez</h2>
                    <p className="text-xl font-medium text-slate-500 dark:text-slate-400 mt-1">Puesto #42</p>
                </div>

                {/* System Settings */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="flex items-center justify-between p-6 bg-white dark:bg-[#1a0c0c] border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">{darkMode ? 'dark_mode' : 'light_mode'}</span>
                            Modo Oscuro
                        </span>
                        <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${darkMode ? 'bg-[#16a34a]' : 'bg-slate-300'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </button>

                    <button
                        onClick={toggleUI}
                        className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl transition-colors"
                    >
                        <span className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-400">palette</span>
                            Diseño Actual
                        </span>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded font-bold uppercase text-sm">
                            {useStitchUI ? 'Versión Stitch' : 'Versión Original'}
                        </span>
                    </button>

                    <button className="flex items-center p-6 bg-white dark:bg-[#1a0c0c] border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-800 dark:text-slate-200 mt-2 gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="material-symbols-outlined text-[#ec1313]">emergency</span>
                        Contactos de Emergencia
                    </button>
                </div>
            </main>
        </div>
    );
}
