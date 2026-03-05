import { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setInstalled(true);
            return;
        }

        // Listen for install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        
        // Also check after a delay in case the event fired before load
        setTimeout(() => {
            if (!installed && !deferredPrompt) {
                setShowButton(true);
            }
        }, 3000);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // Fallback: show manual instructions
            alert('Para instalar la app:\n\n1. Abre este sitio en Chrome\n2. Toca el menú (⋮)\n3. Selecciona "Agregar a pantalla de inicio" o "Instalar app"');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setInstalled(true);
            setShowButton(false);
        }
        
        setDeferredPrompt(null);
    };

    if (installed || !showButton) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50">
            <button
                onClick={handleInstall}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 font-bold text-lg animate-bounce"
            >
                <Download size={24} />
                📲 Instalar App
            </button>
        </div>
    );
}
