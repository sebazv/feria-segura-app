import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    // MODO PRUEBA: siempre activo
    const scheduleStatus = { activo: true, checking: false };

    const handleEmergency = (type) => {
        navigate(`/loading?type=${type}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-red-600 p-6">
                <h1 className="text-3xl font-bold text-white text-center">
                    🛡️ Feria Segura
                </h1>
                
                <div className="flex justify-center mt-3">
                    <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium">
                        MODO PRUEBA
                    </span>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-6 gap-4">
                <button
                    onClick={() => handleEmergency('insecurity')}
                    className="flex-1 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 bg-red-600 hover:bg-red-700"
                >
                    <span className="text-5xl">🛡️</span>
                    <span className="text-2xl font-bold text-white">INSEGURIDAD</span>
                </button>

                <button
                    onClick={() => handleEmergency('medical')}
                    className="flex-1 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 bg-blue-600 hover:bg-blue-700"
                >
                    <span className="text-5xl">🏥</span>
                    <span className="text-2xl font-bold text-white">EMERGENCIA</span>
                </button>
            </main>
        </div>
    );
}
