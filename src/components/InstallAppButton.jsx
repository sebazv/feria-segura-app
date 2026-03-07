import { useState, useEffect } from 'react';
import { Download, Smartphone, X, Clock } from 'lucide-react';

const DISMISS_KEY = 'feria_segura_install_dismissed';
const DISMISS_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

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

        // Check if user dismissed recently
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
            const timePassed = Date.now() - parseInt(dismissedAt);
            if (timePassed < DISMISS_TIMEOUT) {
                // Still within 24 hours, don't show
                return;
            }
            // 24 hours passed, clear the flag
            localStorage.removeItem(DISMISS_KEY);
        }

        // Listen for install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        
        // Show button after delay if PWA install is available
        setTimeout(() => {
            setShowButton(true);
        }, 5000);

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

    const handleDismiss = () => {
        // Store dismissal time
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        setShowButton(false);
    };

    const handleShowAgain = () => {
        // Clear dismissal and show
        localStorage.removeItem(DISMISS_KEY);
        setShowButton(true);
    };

    if (installed || !showButton) {
        // Show "Install" option in settings if dismissed
        return null;
    }

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50">
            <div className="bg-slate-800 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-3 bg-green-600/20 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white">
                        <Download size={20} />
                        <span className="font-bold">📲 Instalar App</span>
                    </div>
                    <button 
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4">
                    <p className="text-white/80 text-sm mb-3">
                        Instala la app en tu celular para acceso rápido y notificaciones.
                    </p>
                    
                    <button
                        onClick={handleInstall}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
                    >
                        <Download size={20} />
                        Instalar Ahora
                    </button>
                    
                    {/* Show again option */}
                    <button
                        onClick={handleShowAgain}
                        className="w-full mt-2 text-slate-400 text-xs hover:text-white flex items-center justify-center gap-1 transition-colors"
                    >
                        <Clock size={14} />
                        Mostrar de nuevo
                    </button>
                </div>
            </div>
        </div>
    );
}
