import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Clock } from 'lucide-react';

export default function StitchHome() {
    const navigate = useNavigate();
    const [scheduleStatus, setScheduleStatus] = useState({ activo: true, checking: true });

    useEffect(() => {
        const checkSchedule = () => {
            const ahora = new Date();
            const diaSemana = ahora.getDay();
            
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
            const horaInicio = 6 * 60;
            const horaFin = 17 * 60;
            
            if (horaActual < horaInicio) {
                const minutosRestantes = horaInicio - horaActual;
                const horas = Math.floor(minutosRestantes / 60);
                const mins = minutosRestantes % 60;
                setScheduleStatus({ 
                    activo: false, 
                    razon: `Se activa en ${horas}h ${mins}min`,
                    checking: false 
                });
                return;
            }
            
            if (horaActual > horaFin) {
                setScheduleStatus({ 
                    activo: false, 
                    razon: 'Fuera de horario',
                    checking: false 
                });
                return;
            }
            
            setScheduleStatus({ activo: true, checking: false });
        };

        checkSchedule();
        const interval = setInterval(checkSchedule, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleEmergency = (type) => {
        if (!scheduleStatus.activo) {
            return;
        }
        
        navigate(`/loading?type=${type}`);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="p-6 pb-4">
                <h1 className="text-4xl font-bold text-gray-800 text-center">
                    🛡️ Feria Segura
                </h1>
                
                {/* Status */}
                {scheduleStatus.checking ? (
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <p className="text-gray-500">Verificando...</p>
                    </div>
                ) : scheduleStatus.activo ? (
                    <div className="flex items-center justify-center gap-2 mt-4 bg-green-100 px-4 py-2 rounded-full">
                        <Shield className="w-5 h-5 text-green-600" />
                        <p className="text-green-700 font-medium">Activo • 06:00-17:00</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 mt-4 bg-red-100 px-4 py-2 rounded-full">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        <p className="text-red-700 font-medium">Desactivado</p>
                    </div>
                )}
            </header>

            {/* Horario info */}
            {!scheduleStatus.activo && !scheduleStatus.checking && (
                <div className="mx-6 mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-800 text-center font-medium">{scheduleStatus.razon}</p>
                    <p className="text-red-600 text-center text-sm mt-1">Martes a Domingo, 06:00 - 17:00</p>
                </div>
            )}

            {/* Botones de emergencia */}
            <main className="flex-1 flex flex-col gap-4 p-6 justify-center">
                {/* Inseguridad */}
                <button
                    onClick={() => handleEmergency('insecurity')}
                    disabled={!scheduleStatus.activo}
                    className={`w-full h-40 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 ${
                        scheduleStatus.activo 
                            ? 'bg-red-600 hover:bg-red-700 cursor-pointer' 
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    <span className="text-white text-4xl">🛡️</span>
                    <span className="text-white text-2xl font-bold">
                        {scheduleStatus.activo ? 'INSEGURIDAD' : 'FUERA DE HORARIO'}
                    </span>
                </button>

                {/* Emergencia Médica */}
                <button
                    onClick={() => handleEmergency('medical')}
                    disabled={!scheduleStatus.activo}
                    className={`w-full h-40 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 ${
                        scheduleStatus.activo 
                            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    <span className="text-white text-4xl">🏥</span>
                    <span className="text-white text-2xl font-bold">
                        {scheduleStatus.activo ? 'EMERGENCIA MÉDICA' : 'FUERA DE HORARIO'}
                    </span>
                </button>
            </main>

            {/* Footer */}
            <footer className="text-center p-6">
                <p className="text-gray-400">Feria Segura</p>
            </footer>
        </div>
    );
}
