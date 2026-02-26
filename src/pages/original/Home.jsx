import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, Heart, MessageSquare, Newspaper, Vote, User } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [scheduleStatus, setScheduleStatus] = useState({ activo: true, checking: true });

    useEffect(() => {
        const checkSchedule = () => {
            const ahora = new Date();
            const diaSemana = ahora.getDay();
            const diasActivos = [true, false, true, true, true, true, true];
            const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            if (!diasActivos[diaSemana]) {
                setScheduleStatus({ activo: false, razon: `La feria no opera los ${diasNombres[diaSemana]}`, checking: false });
                return;
            }
            
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            const horaInicio = 6 * 60;
            const horaFin = 17 * 60;
            
            if (horaActual < horaInicio) {
                setScheduleStatus({ activo: false, razon: `Se activa a las 06:00`, checking: false });
                return;
            }
            
            if (horaActual > horaFin) {
                setScheduleStatus({ activo: false, razon: 'Fuera de horario', checking: false });
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
            alert(scheduleStatus.razon);
            return;
        }
        navigate(`/loading?type=${type}`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="p-6 text-center border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Feria Segura
                </h1>
                <p className="text-sm text-gray-500 mt-1">Sindicato de Peñaflor</p>
            </header>

            {/* Status */}
            <div className="px-6 py-4">
                <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-medium ${
                    scheduleStatus.activo 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                    <Clock size={16} />
                    {scheduleStatus.activo ? 'Activo • 06:00 - 17:00' : 'Inactivo'}
                </div>
            </div>

            {/* Emergency Buttons */}
            <main className="flex-1 flex flex-col gap-4 px-6 py-4">
                <button
                    onClick={() => handleEmergency('insecurity')}
                    disabled={!scheduleStatus.activo}
                    className={`flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl transition-all duration-200 ${
                        scheduleStatus.activo 
                            ? 'bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-200 dark:shadow-red-900/30' 
                            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    }`}
                >
                    <Shield size={40} className="text-white" strokeWidth={2} />
                    <span className="text-white text-xl font-bold uppercase tracking-wide">
                        Inseguridad
                    </span>
                </button>

                <button
                    onClick={() => handleEmergency('medical')}
                    disabled={!scheduleStatus.activo}
                    className={`flex-1 flex flex-col items-center justify-center gap-3 rounded-2xl transition-all duration-200 ${
                        scheduleStatus.activo 
                            ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200 dark:shadow-blue-900/30' 
                            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    }`}
                >
                    <Heart size={40} className="text-white" strokeWidth={2} />
                    <span className="text-white text-xl font-bold uppercase tracking-wide">
                        Emergencia Médica
                    </span>
                </button>
            </main>

            {/* Quick Links */}
            <nav className="grid grid-cols-4 gap-2 px-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <button onClick={() => navigate('/chat')} className="flex flex-col items-center gap-1 p-2">
                    <MessageSquare size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-500">Chat</span>
                </button>
                <button onClick={() => navigate('/news')} className="flex flex-col items-center gap-1 p-2">
                    <Newspaper size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-500">Noticias</span>
                </button>
                <button onClick={() => navigate('/encuestas')} className="flex flex-col items-center gap-1 p-2">
                    <Vote size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-500">Votar</span>
                </button>
                <button onClick={() => navigate('/login')} className="flex flex-col items-center gap-1 p-2">
                    <User size={20} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-500">Ingresar</span>
                </button>
            </nav>
        </div>
    );
}
