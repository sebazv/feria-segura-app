import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Shield, Clock } from 'lucide-react';

export default function StitchHome() {
    const navigate = useNavigate();
    const [scheduleStatus, setScheduleStatus] = useState({ activo: true, checking: true });

    useEffect(() => {
        const checkSchedule = () => {
            const ahora = new Date();
            const diaSemana = ahora.getDay();
            
            const diasActivos = [true, false, true, true, true, true, true];
            
            if (!diasActivos[diaSemana]) {
                setScheduleStatus({ activo: false, razon: 'Hoy no hay feria', checking: false });
                return;
            }
            
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            const horaInicio = 6 * 60;
            const horaFin = 17 * 60;
            
            if (horaActual < horaInicio) {
                setScheduleStatus({ activo: false, razon: 'Abre a las 06:00', checking: false });
                return;
            }
            
            if (horaActual > horaFin) {
                setScheduleStatus({ activo: false, razon: 'Cerrado', checking: false });
                return;
            }
            
            setScheduleStatus({ activo: true, checking: false });
        };

        checkSchedule();
        const interval = setInterval(checkSchedule, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleEmergency = (type) => {
        if (!scheduleStatus.activo) return;
        navigate(`/loading?type=${type}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-red-600 p-6">
                <h1 className="text-3xl font-bold text-white text-center">
                    🛡️ Feria Segura
                </h1>
                
                <div className="flex justify-center mt-3">
                    {scheduleStatus.activo ? (
                        <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Activo
                        </span>
                    ) : (
                        <span className="bg-red-800 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Cerrado
                        </span>
                    )}
                </div>
            </header>

            {/* Botones */}
            <main className="flex-1 flex flex-col p-6 gap-4">
                {/* Inseguridad - ROJO */}
                <button
                    onClick={() => handleEmergency('insecurity')}
                    disabled={!scheduleStatus.activo}
                    className={`flex-1 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 ${
                        scheduleStatus.activo 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-gray-400'
                    }`}
                >
                    <span className="text-5xl">🛡️</span>
                    <span className="text-2xl font-bold text-white">
                        {scheduleStatus.activo ? 'INSEGURIDAD' : 'CERRADO'}
                    </span>
                </button>

                {/* Médica - AZUL */}
                <button
                    onClick={() => handleEmergency('medical')}
                    disabled={!scheduleStatus.activo}
                    className={`flex-1 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 ${
                        scheduleStatus.activo 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-400'
                    }`}
                >
                    <span className="text-5xl">🏥</span>
                    <span className="text-2xl font-bold text-white">
                        {scheduleStatus.activo ? 'EMERGENCIA' : 'CERRADO'}
                    </span>
                </button>
            </main>
        </div>
    );
}
