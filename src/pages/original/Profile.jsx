import { User, Shield } from 'lucide-react';
import { useStore } from '../../store';

export default function Profile() {
    const { darkMode, toggleDarkMode, useStitchUI, toggleUI } = useStore();

    return (
        <div className="flex flex-col min-h-[calc(100vh-6rem)] relative w-full max-w-lg mx-auto p-4 sm:p-6 bg-white dark:bg-black pb-12">

            {/* Header */}
            <header className="flex flex-col w-full mt-4 mb-6">
                <h1 className="text-4xl sm:text-5xl font-black text-left mb-2 tracking-tight dark:text-white uppercase flex items-center gap-4">
                    <User size={40} className="text-[#1d4ed8]" />
                    Mi Perfil
                </h1>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
            </header>

            {/* User Info */}
            <div className="flex flex-col gap-6 w-full mb-8">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 border-[3px] border-gray-300 dark:border-gray-700 rounded-3xl text-center">
                    <div className="mx-auto bg-gray-200 w-32 h-32 rounded-full mb-4 flex items-center justify-center dark:bg-gray-800">
                        <User size={64} className="text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-black uppercase text-black dark:text-white">Juan Pérez</h2>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-2">Puesto #42</p>
                </div>
            </div>

            {/* Settings */}
            <div className="flex flex-col gap-4 w-full">
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-2xl font-bold text-black dark:text-white transition-colors"
                >
                    <span>Modo Alto Contraste</span>
                    <div className={`w-16 h-8 rounded-full transition-colors flex items-center px-1 ${darkMode ? 'bg-[var(--color-brand-green)]' : 'bg-gray-400'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-8' : 'translate-x-0'}`}></div>
                    </div>
                </button>
                <button
                    onClick={toggleUI}
                    className="w-full flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl transition-colors"
                >
                    <span className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-3">
                        Diseño Actual
                    </span>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded font-bold text-sm">
                        {useStitchUI ? 'Versión Stitch' : 'Versión Original'}
                    </span>
                </button>

                <button className="w-full flex items-center justify-start p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-2xl font-bold text-black dark:text-white mt-4 gap-4">
                    <Shield size={32} className="text-[#ec1313]" />
                    Contactos de Emergencia
                </button>
            </div>

        </div>
    );
}
