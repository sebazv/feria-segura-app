import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Clock, Star } from 'lucide-react';

export default function StitchHome() {
    const navigate = useNavigate();
    const [emergencyCount] = useState(12);
    const [scheduleStatus, setScheduleStatus] = useState({ activo: true, checking: true });

    useEffect(() => {
        // Check if panic button is active based on schedule
        const checkSchedule = () => {
            const ahora = new Date();
            const diaSemana = ahora.getDay(); // 0 = Domingo
            
            // Ferias operan: Martes(2), Miércoles(3), Jueves(4), Viernes(5), Sábado(6), Domingo(0)
            const diasActivos = [true, false, true, true, true, true, true];
            const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            if (!diasActivos[diaSemana]) {
                setScheduleStatus({ 
                    activo: false, 
                    razon: `La feria no opera los ${diasNombres[diaSemana]}`,
                    checking: false 
                });
                return;
            }
            
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            const horaInicio = 6 * 60; // 6:00 AM
            const horaFin = 17 * 60; // 5:00 PM
            
            if (horaActual < horaInicio) {
                const minutosRestantes = horaInicio - horaActual;
                const horas = Math.floor(minutosRestantes / 60);
                const mins = minutosRestantes % 60;
                setScheduleStatus({ 
                    activo: false, 
                    razon: `Se activa en ${horas}h ${mins}min (06:00)`,
                    checking: false 
                });
                return;
            }
            
            if (horaActual > horaFin) {
                setScheduleStatus({ 
                    activo: false, 
                    razon: 'El botón de pánico está desactivado por hoy',
                    checking: false 
                });
                return;
            }
            
            setScheduleStatus({ activo: true, checking: false });
        };

        checkSchedule();
        
        // Check every minute
        const interval = setInterval(checkSchedule, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleEmergency = (type) => {
        if (!scheduleStatus.activo) {
            alert(scheduleStatus.razon);
            return;
        }
        
        if (navigator.geolocation) {
            navigate(`/loading?type=${type}`);
        } else {
            navigate(`/confirmation?type=${type}&lat=0&lng=0`);
        }
    };

    return (
        <div className="relative flex h-[calc(100vh-6rem)] w-full flex-col overflow-hidden pb-safe font-display select-none">
            {/* Header Section */}
            <header className="flex flex-col items-center pt-8 pb-4 px-6 bg-white dark:bg-[#221010]">
                <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-bold tracking-tight mb-3">
                    Feria Segura
                </h1>
                
                {/* Status Badge */}
                {scheduleStatus.checking ? (
                    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-500 text-sm">Verificando horario...</p>
                    </div>
                ) : scheduleStatus.activo ? (
                    <div className="flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2">
                        <Shield className="w-4 h-4 text-[#16a34a]" />
                        <p className="text-[#16a34a] text-sm font-medium">Botón activo • 06:00-17:00</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <p className="text-red-600 text-sm font-medium">Botón desactivado</p>
                    </div>
                )}
            </header>

            {/* Schedule Info */}
            {!scheduleStatus.activo && !scheduleStatus.checking && (
                <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-red-800 dark:text-red-200 font-medium">{scheduleStatus.razon}</p>
                            <p className="text-red-600 dark:text-red-400 text-sm">Horario de feria: Martes a Domingo, 06:00 - 17:00</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency Counter */}
            <div className="mx-6 mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Emergencias reportadas hoy
                </p>
                <span className="text-2xl font-bold text-red-600">{emergencyCount}</span>
            </div>

            {/* Main Emergency Buttons Area */}
            <main className="flex flex-1 flex-col gap-6 px-6 pb-8 justify-center">
                {/* Inseguridad Button (SOS) */}
                <button
                    onClick={() => handleEmergency('insecurity')}
                    disabled={!scheduleStatus.activo}
                    className={`flex flex-col items-center justify-center gap-4 w-full h-full max-h-[42%] rounded-xl shadow-2xl border-b-8 transition-transform duration-100 ${
                        scheduleStatus.activo 
                            ? 'bg-[#ec1313] hover:bg-red-700 active:scale-95 border-[#ec1313]/40 cursor-pointer' 
                            : 'bg-gray-400 border-gray-300 cursor-not-allowed'
                    }`}
                >
                    <div className="flex items-center justify-center text-white">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700", fontSize: '80px' }}>
                            shield
                        </span>
                    </div>
                    <span className="text-white text-3xl font-extrabold tracking-wider uppercase">
                        {scheduleStatus.activo ? 'INSEGURIDAD' : 'FUERA DE HORARIO'}
                    </span>
                </button>

                {/* Emergencia Médica Button */}
                <button
                    onClick={() => handleEmergency('medical')}
                    disabled={!scheduleStatus.activo}
                    className={`flex flex-col items-center justify-center gap-4 w-full h-full max-h-[42%] rounded-xl shadow-2xl border-b-8 transition-transform duration-100 ${
                        scheduleStatus.activo 
                            ? 'bg-[#1b64da] hover:bg-blue-700 active:scale-95 border-[#1b64da]/40 cursor-pointer' 
                            : 'bg-gray-400 border-gray-300 cursor-not-allowed'
                    }`}
                >
                    <div className="flex items-center justify-center text-white">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700", fontSize: '80px' }}>
                            medical_services
                        </span>
                    </div>
                    <span className="text-white text-3xl font-extrabold tracking-wider uppercase">
                        {scheduleStatus.activo ? 'EMERGENCIA MÉDICA' : 'FUERA DE HORARIO'}
                    </span>
                </button>
            </main>

            {/* Footer */}
            <footer className="text-center pb-4">
                <p className="text-xs text-gray-400">Feria Segura — Sindicato de Peñaflor</p>
            </footer>
        </div>
    );
}
