import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, Phone, MapPin, Info, Clock, Bell } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const timerRef = useRef(null);

    const startHold = (emergencyType) => {
        setIsHolding(emergencyType);
        setHoldProgress(0);
        
        let progress = 0;
        timerRef.current = setInterval(() => {
            progress += 2;
            setHoldProgress(progress);
            
            if (progress >= 100) {
                clearInterval(timerRef.current);
                navigate(`/loading?type=${emergencyType}`);
            }
        }, 30);
    };

    const cancelHold = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsHolding(null);
        setHoldProgress(0);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const buttons = [
        { 
            type: 'insecurity', 
            label: 'INSEGURIDAD', 
            icon: Shield,
            bgColor: '#dc2626',
            hoverColor: '#b91c1c',
            description: 'Peleas, asalto, personas sospechosas'
        },
        { 
            type: 'medical', 
            label: 'EMERGENCIA MÉDICA', 
            icon: Phone,
            bgColor: '#2563eb',
            hoverColor: '#1d4ed8',
            description: 'Desmayos, accidentes, problemas de salud'
        }
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 Buenos días';
        if (hour < 18) return '☀️ Buena tarde';
        return '🌙 Buena noche';
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-color, #f3f4f6)', minHeight: '100vh', paddingBottom: '80px' }} className="dark:bg-gray-900">
            {/* Header */}
            <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>🛡️ Feria Segura</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>Sindicato de Peñaflor</p>
            </div>
            
            {/* Status & Greeting */}
            <div style={{ padding: '15px', textAlign: 'center' }} className="dark:bg-gray-800">
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    backgroundColor: '#16a34a', 
                    color: 'white', 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    fontSize: '14px' 
                }}>
                    <span style={{ animation: 'pulse 2s infinite' }}>●</span> 
                    {getGreeting()} • Activo 06:00 - 17:00
                </div>
            </div>

            {/* Info Button */}
            <div style={{ padding: '0 16px 10px' }}>
                <button 
                    onClick={() => setShowInfo(!showInfo)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        color: '#6b7280',
                        fontSize: '14px',
                        cursor: 'pointer'
                    }}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                    <Info size={18} />
                    ¿Cómo funciona el botón de emergencia?
                </button>

                {showInfo && (
                    <div style={{ 
                        marginTop: '10px', 
                        padding: '16px', 
                        backgroundColor: 'white', 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }} className="dark:bg-gray-800">
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }} className="dark:text-white">
                            📖 Instrucciones
                        </h3>
                        <ol style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }} className="dark:text-gray-300">
                            <li>Mantén presionado el botón rojo por <strong>3 segundos</strong></li>
                            <li>Confirma tu ubicación en el mapa</li>
                            <li>Envía la alerta de emergencia</li>
                            <li>El personal de seguridad recibirá tu ubicación exacta</li>
                        </ol>
                        <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                                ⚠️ <strong>Importante:</strong> Solo usa en emergencias reales. alertas falsas pueden multar.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Instructions */}
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }} className="dark:text-gray-400">
                    Mantén presionado el botón por 3 segundos para activar
                </p>
            </div>
            
            {/* SOS Buttons */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {buttons.map(({ type, label, icon: Icon, bgColor, hoverColor, description }) => (
                    <div key={type} style={{ position: 'relative' }}>
                        <button 
                            onMouseDown={() => startHold(type)}
                            onMouseUp={cancelHold}
                            onMouseLeave={cancelHold}
                            onTouchStart={() => startHold(type)}
                            onTouchEnd={cancelHold}
                            style={{ 
                                width: '100%',
                                padding: '50px 20px', 
                                border: 'none', 
                                borderRadius: '20px', 
                                backgroundColor: isHolding === type ? hoverColor : bgColor, 
                                color: 'white', 
                                fontSize: '22px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                transform: isHolding === type ? 'scale(0.98)' : 'scale(1)',
                                boxShadow: isHolding === type ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <Icon size={40} />
                            {label}
                            <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'normal' }}>
                                {description}
                            </span>
                        </button>
                        
                        {/* Progress bar */}
                        {isHolding === type && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '8px',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '0 0 20px 20px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${holdProgress}%`,
                                    backgroundColor: 'white',
                                    transition: 'width 0.03s linear'
                                }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Quick Contact */}
            <div style={{ 
                padding: '20px', 
                margin: '16px', 
                backgroundColor: 'white', 
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }} className="dark:bg-gray-800">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }} className="dark:text-white">
                    📞 Contacto de Emergencia
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }} className="dark:border-gray-700">
                        <span style={{ color: '#6b7280' }} className="dark:text-gray-400">Seguridad Feria</span>
                        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>600 300 4040</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }} className="dark:border-gray-700">
                        <span style={{ color: '#6b7280' }} className="dark:text-gray-400">Emergencias</span>
                        <span style={{ fontWeight: 'bold', color: '#dc2626' }}>133 PDI</span>
                    </div>
                </div>
            </div>
            
            {/* Login Button */}
            <div style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                backgroundColor: 'white', 
                borderTop: '1px solid #e5e7eb', 
                padding: '16px',
                textAlign: 'center'
            }} className="dark:bg-gray-800 dark:border-gray-700">
                <button 
                    onClick={() => navigate('/login')} 
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#6b7280', 
                        fontSize: '14px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%'
                    }}
                    className="dark:text-gray-300"
                >
                    <Clock size={16} />
                    Ingresar / Registrarse para más funciones
                </button>
            </div>
            
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
