import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Loader, Megaphone, Info } from 'lucide-react';
import { getNoticias } from '../../lib/comunidad';

export default function NewsPage() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNoticias = async () => {
            const result = await getNoticias();
            if (result.success) {
                setNoticias(result.noticias);
            }
            setLoading(false);
        };

        loadNoticias();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (loading) {
        return (
            <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    Muro de Noticias
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Noticias y anuncios oficiales
                </p>
            </header>

            <div className="space-y-4">
                {noticias.map((noticia) => (
                    <div 
                        key={noticia.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="bg-red-600 px-4 py-2 flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-white" />
                            <span className="text-white font-semibold text-sm">NOTICIA OFICIAL</span>
                        </div>
                        
                        <div className="p-4">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                {noticia.titulo}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {noticia.contenido}
                            </p>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-400">
                                <Clock size={12} />
                                <span>{formatDate(noticia.created_at)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {noticias.length === 0 && (
                    <div className="text-center py-12">
                        <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No hay noticias publicadas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
