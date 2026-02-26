import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '60px' }}>
            <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Feria Segura</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.9 }}>Sindicato de Peñaflor</p>
            </div>
            
            <div style={{ padding: '15px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#16a34a', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' }}>
                    <span>●</span> Activo • 06:00 - 17:00
                </div>
            </div>
            
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                    onClick={() => navigate('/loading?type=insecurity')} 
                    style={{ 
                        padding: '40px 20px', 
                        border: 'none', 
                        borderRadius: '16px', 
                        backgroundColor: '#dc2626', 
                        color: 'white', 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                    }}
                >
                    🛡️ INSEGURIDAD
                </button>
                <button 
                    onClick={() => navigate('/loading?type=medical')} 
                    style={{ 
                        padding: '40px 20px', 
                        border: 'none', 
                        borderRadius: '16px', 
                        backgroundColor: '#2563eb', 
                        color: 'white', 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                    }}
                >
                    🏥 EMERGENCIA MÉDICA
                </button>
            </div>
            
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '16px', textAlign: 'center' }}>
                <button 
                    onClick={() => navigate('/login')} 
                    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}
                >
                    👤 Ingresar / Registrarse
                </button>
            </div>
        </div>
    );
}
