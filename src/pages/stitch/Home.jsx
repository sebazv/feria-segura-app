import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function StitchHome() {
    const navigate = useNavigate();
    const [emergencyCount] = useState(12); // Demo counter

    const handleEmergency = (type) => {
        if (navigator.geolocation) {
            navigate(`/loading?type=${type}`);
        } else {
            // Fallback if no GPS
            navigate(`/confirmation?type=${type}&lat=0&lng=0`);
        }
    };

    return (
        <div className="relative flex h-[calc(100vh-6rem)] w-full flex-col overflow-hidden pb-safe font-display select-none">
            {/* Header Section */}
            <header className="flex flex-col items-center pt-12 pb-6 px-6 bg-white dark:bg-[#221010]">
                <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-bold tracking-tight mb-3">
                    Feria Segura
                </h1>
                {/* GPS Status Badge */}
                <div className="flex items-center gap-2 rounded-full bg-[#16a34a] px-6 py-2 border border-[#16a34a] bg-opacity-10">
                    <span className="material-symbols-outlined text-[#16a34a] !text-xl" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                        location_on
                    </span>
                    <p className="text-[#16a34a] text-lg font-semibold leading-none text-opacity-100 opacity-100 mix-blend-normal backdrop-blur-none">
                        Ubicación GPS: Activa
                    </p>
                </div>
            </header>

            {/* Emergency Counter */}
            <div className="mx-6 mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Emergencias reportadas hoy: <span className="font-bold text-red-600">{emergencyCount}</span>
                </p>
            </div>

            {/* Main Emergency Buttons Area */}
            <main className="flex flex-1 flex-col gap-6 px-6 pb-12 justify-center">
                {/* Inseguridad Button (SOS) */}
                <button
                    onClick={() => handleEmergency('insecurity')}
                    className="flex flex-col items-center justify-center gap-4 w-full h-full max-h-[42%] bg-[#ec1313] active:scale-95 transition-transform duration-100 rounded-xl shadow-2xl border-b-8 border-[#ec1313] border-opacity-40"
                >
                    <div className="flex items-center justify-center text-white">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700", fontSize: '80px' }}>
                            shield
                        </span>
                    </div>
                    <span className="text-white text-3xl font-extrabold tracking-wider uppercase">
                        INSEGURIDAD
                    </span>
                </button>

                {/* Emergencia Médica Button */}
                <button
                    onClick={() => handleEmergency('medical')}
                    className="flex flex-col items-center justify-center gap-4 w-full h-full max-h-[42%] bg-[#1b64da] active:scale-95 transition-transform duration-100 rounded-xl shadow-2xl border-b-8 border-[#1b64da] border-opacity-40"
                >
                    <div className="flex items-center justify-center text-white">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700", fontSize: '80px' }}>
                            medical_services
                        </span>
                    </div>
                    <span className="text-white text-3xl font-extrabold tracking-wider uppercase">
                        EMERGENCIA MÉDICA
                    </span>
                </button>
            </main>
        </div>
    );
}
