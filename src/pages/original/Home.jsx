import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
    const navigate = useNavigate();
    const [scheduleStatus, setScheduleStatus] = useState({ activo: true, checking: true });

    useEffect(() => {
        const checkSchedule = () => {
            const ahora = new Date();
            const diaSemana = ahora.getDay();
            const diasActivos = [true, false, true, true, true, true, true];
            
            if (!diasActivos[diaSemana]) {
                setScheduleStatus({ activo: false, razon: 'La feria no opera hoy', checking: false });
                return;
            }
            
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
            if (horaActual < 360 || horaActual > 1020) {
                setScheduleStatus({ activo: false, razon: 'Fuera de horario', checking: false });
                return;
            }
            
            setScheduleStatus({ activo: true, checking: false });
        };

        checkSchedule();
    }, []);

    const handleEmergency = (type) => {
        if (!scheduleStatus.activo) {
            alert(scheduleStatus.razon);
            return;
        }
        navigate('/loading?type=' + type);
    };

    return (
        <div style={{ backgroundColor: '#e5e7eb', minHeight: '100vh', fontFamily: 'system-ui,sans-serif' }}>
            {/* Header */}
            <header style={{ padding: '24px', textAlign: 'center', backgroundColor: '#dc2626', color: 'white' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Feria Segura</h1>
                <p style={{ fontSize: '14px', color: 'white', marginTop: '4px', opacity: 0.9 }}>Sindicato de Peñaflor</p>
            </header>

            {/* Status */}
            <div style={{ padding: '16px' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    padding: '12px 16px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: scheduleStatus.activo ? '#16a34a' : '#6b7280',
                    color: 'white'
                }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: scheduleStatus.activo ? '#16a34a' : '#9ca3af' }}></span>
                    {scheduleStatus.activo ? 'Activo • 06:00 - 17:00' : 'Inactivo'}
                </div>
            </div>

            {/* Buttons */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    onClick={() => handleEmergency('insecurity')}
                    disabled={!scheduleStatus.activo}
                    style={{
                        flex: 1,
                        padding: '40px 20px',
                        borderRadius: '16px',
                        border: 'none',
                        cursor: scheduleStatus.activo ? 'pointer' : 'not-allowed',
                        opacity: scheduleStatus.activo ? 1 : 0.6,
                        backgroundColor: scheduleStatus.activo ? '#dc2626' : '#9ca3af',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <span style={{ fontSize: '40px' }}>🛡️</span>
                    <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                        {scheduleStatus.activo ? 'INSEGURIDAD' : 'FUERA DE HORARIO'}
                    </span>
                </button>

                <button
                    onClick={() => handleEmergency('medical')}
                    disabled={!scheduleStatus.activo}
                    style={{
                        flex: 1,
                        padding: '40px 20px',
                        borderRadius: '16px',
                        border: 'none',
                        cursor: scheduleStatus.activo ? 'pointer' : 'not-allowed',
                        opacity: scheduleStatus.activo ? 1 : 0.6,
                        backgroundColor: scheduleStatus.activo ? '#2563eb' : '#9ca3af',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <span style={{ fontSize: '40px' }}>🏥</span>
                    <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                        {scheduleStatus.activo ? 'EMERGENCIA MÉDICA' : 'FUERA DE HORARIO'}
                    </span>
                </button>
            </div>

            {/* Bottom Nav */}
            <nav style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                backgroundColor: 'white', 
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '12px 0'
            }}>
                <button onClick={() => navigate('/login')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span>👤</span>
                    <span>Ingresar</span>
                </button>
            </nav>
        </div>
    );
}
