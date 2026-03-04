import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                setUserData({ id: savedUserId, ...data });
            } catch (e) {
                setUserData(null);
            }
        }
    }, []);

    const handleEmergency = (type) => {
        if (!userData) {
            const wantsLogin = confirm('¿Ya tienes cuenta? Acepta para iniciar sesión, o cancela para registrarte.');
            if (wantsLogin) {
                navigate('/login');
            } else {
                navigate('/register');
            }
            return;
        }
        navigate(`/loading?type=${type}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-red-600 p-6">
                <h1 className="text-3xl font-bold text-white text-center">🛡️ Feria Segura</h1>
                
                <div className="flex justify-center mt-3">
                    {userData ? (
                        <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium">
                            👤 {userData.nombre}
                        </span>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => navigate('/login')} className="bg-white text-red-600 px-4 py-1 rounded-full text-sm font-medium">
                                🔑 Iniciar Sesión
                            </button>
                            <button onClick={() => navigate('/register')} className="bg-red-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                                📝 Registrarse
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="bg-yellow-100 text-yellow-800 text-center py-1 text-sm font-medium">
                MODO PRUEBA
            </div>

            <main className="flex-1 flex flex-col p-6 gap-4">
                <button onClick={() => handleEmergency('insecurity')} className="flex-1 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 bg-red-600 hover:bg-red-700">
                    <span className="text-5xl">🛡️</span>
                    <span className="text-2xl font-bold text-white">INSEGURIDAD</span>
                </button>

                <button onClick={() => handleEmergency('medical')} className="flex-1 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 bg-blue-600 hover:bg-blue-700">
                    <span className="text-5xl">🏥</span>
                    <span className="text-2xl font-bold text-white">EMERGENCIA MÉDICA</span>
                </button>
            </main>
        </div>
    );
}
