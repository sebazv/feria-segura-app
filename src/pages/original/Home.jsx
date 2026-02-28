import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Shield, AlertTriangle, Phone, MapPin } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(null);
    const timerRef = useRef(null);
    const type = 'insecurity'; // Default type

    const startHold = (emergencyType) => {
        setIsHolding(emergencyType);
        setHoldProgress(0);
        
        // Progress bar animation
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
            color: 'red',
            bgColor: '#dc2626',
            hoverColor: '#b91c1c'
        },
        { 
            type: 'medical', 
            label: 'EMERGENCIA MÉDICA', 
            icon: Phone,
            color: 'blue',
            bgColor: '#2563eb',
            hoverColor: '#1d4ed8'
        }
    ];

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>🛡️ Feria Segura</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>Sindicato de Peñaflor</p>
            </div>
            
            {/* Status */}
            <div style={{ padding: '15px', textAlign: 'center' }}>
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
                    Activo • 06:00 - 17:00
                </div>
            </div>
            
            {/* Instructions */}
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                    Mantén presionado el botón por 3 segundos para activar
                </p>
            </div>
            
            {/* SOS Buttons */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {buttons.map(({ type, label, icon: Icon, color, bgColor, hoverColor }) => (
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
                                Mantener presionado 3s
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
            
            {/* Quick Info */}
            <div style={{ 
                padding: '20px', 
                margin: '16px', 
                backgroundColor: 'white', 
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                    📍 ¿Cómo funciona?
                </h3>
                <ol style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
                    <li>Mantén presionado el botón por 3 segundos</li>
                    <li>Confirma tu ubicación en el mapa</li>
                    <li>Envía la alerta de emergencia</li>
                    <li>El personal de seguridad recibirá tu ubicación</li>
                </ol>
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
            }}>
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
                >
                    👤 Ingresar / Registrarse
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
