import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Plus, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store';

export default function Home() {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useStore();

    const [loading, setLoading] = useState(false);

    const handleAlert = async (type) => {
        if (loading) return;
        setLoading(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLoading(false);
                    navigate(`/loading?type=${type}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
                },
                (err) => {
                    setLoading(false);
                    navigate(`/loading?type=${type}&lat=0&lng=0`);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            setLoading(false);
            navigate(`/loading?type=${type}&lat=0&lng=0`);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-6rem)] w-full max-w-lg mx-auto p-4 sm:p-6 pb-8">
            {/* Header */}
            <header className="flex flex-col items-center justify-center w-full mt-4 mb-8 relative">
                <h1 className="text-4xl sm:text-5xl font-black text-center mb-4 tracking-tight dark:text-white">
                    Feria Segura
                </h1>
                <div className="bg-[var(--color-brand-green)] bg-opacity-10 rounded-full px-6 py-2 flex items-center shadow-sm border border-[var(--color-brand-green)] dark:border-2">
                    <div className="w-4 h-4 rounded-full bg-[var(--color-brand-green)] animate-pulse shadow-[0_0_8px_#13ec5b] mr-3"></div>
                    <span className="text-[var(--color-brand-green)] dark:text-[#13ec5b] text-xl font-bold tracking-wide">
                        Ubicación GPS: Activa
                    </span>
                </div>


            </header>

            {/* Main Action Buttons */}
            <div className="flex flex-col w-full gap-6 flex-1 justify-center relative z-10">

                {/* Inseguridad Button */}
                <button
                    onClick={() => handleAlert('insecurity')}
                    className="relative w-full aspect-square max-h-[40vh] bg-[#ec1313] hover:bg-red-700 active:bg-red-800 rounded-[2rem] sm:rounded-[3rem] shadow-[0_8px_30px_rgba(236,19,19,0.5)] dark:border-4 dark:border-white transition-transform active:scale-95 flex flex-col items-center justify-center gap-4 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-[2rem] sm:rounded-[3rem]"></div>
                    <ShieldAlert size={100} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                    <span className="text-white text-3xl sm:text-4xl font-black text-center w-full uppercase tracking-wider drop-shadow-md">
                        Inseguridad
                    </span>
                </button>

                {/* Emergencia Médica Button */}
                <button
                    onClick={() => handleAlert('medical')}
                    className="relative w-full bg-[var(--color-brand-blue)] hover:bg-blue-800 active:bg-blue-900 rounded-[2rem] sm:rounded-[3rem] shadow-[0_8px_30px_rgba(29,78,216,0.5)] dark:border-4 dark:border-white transition-transform active:scale-95 flex flex-col items-center justify-center p-8 sm:p-10 gap-3 group"
                >
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-[2rem] sm:rounded-[3rem]"></div>
                    <Plus size={64} className="text-white drop-shadow-lg" strokeWidth={3.5} />
                    <span className="text-white text-2xl sm:text-3xl font-black text-center w-full uppercase tracking-wider">
                        Emergencia<br />Médica
                    </span>
                </button>
            </div>
        </div>
    );
}
