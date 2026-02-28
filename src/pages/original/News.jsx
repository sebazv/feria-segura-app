import { useState, useEffect } from 'react';
import { Newspaper, Plus, Loader, Bell } from 'lucide-react';
import { getNoticias, createNoticia } from '../../lib/comunidad';
import { useAuth } from '../../App';

export default function NewsPage() {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newNoticia, setNewNoticia] = useState({ titulo: '', contenido: '' });
    const [saving, setSaving] = useState(false);
    const { user, userData } = useAuth();

    useEffect(() => {
        loadNoticias();
        if (userData?.role === 'admin') {
            setIsAdmin(true);
        }
    }, [userData]);

    const loadNoticias = async () => {
        const result = await getNoticias();
        if (result.success) {
            setNoticias(result.noticias);
        }
        setLoading(false);
    };

    const handleCreateNoticia = async (e) => {
        e.preventDefault();
        if (!newNoticia.titulo.trim() || !newNoticia.contenido.trim()) return;

        setSaving(true);
        const result = await createNoticia({
            titulo: newNoticia.titulo.trim(),
            contenido: newNoticia.contenido.trim(),
            autorId: user.id
        });

        if (result.success) {
            setNoticias([result.noticia, ...noticias]);
            setNewNoticia({ titulo: '', contenido: '' });
            setShowForm(false);
        }
        setSaving(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (loading) {
        return (
            <div className="p-4 pb-24 bg-gray-50 min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
            <header className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                        📰 Noticias
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Novedades del Sindicato
                    </p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-red-600 text-white p-2 rounded-full shadow-lg"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </header>

            {/* Admin: Create News Form */}
            {showForm && isAdmin && (
                <div className="bg-white rounded-xl p-4 mb-4 shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Nueva Noticia</h3>
                    <form onSubmit={handleCreateNoticia} className="space-y-3">
                        <input
                            type="text"
                            value={newNoticia.titulo}
                            onChange={(e) => setNewNoticia({ ...newNoticia, titulo: e.target.value })}
                            placeholder="Título de la noticia"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <textarea
                            value={newNoticia.contenido}
                            onChange={(e) => setNewNoticia({ ...newNoticia, contenido: e.target.value })}
                            placeholder="Contenido de la noticia..."
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
                            >
                                {saving ? 'Publicando...' : 'Publicar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* News List */}
            <div className="space-y-4">
                {noticias.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay noticias publicadas</p>
                        {isAdmin && (
                            <button 
                                onClick={() => setShowForm(true)}
                                className="text-red-600 font-medium mt-2"
                            >
                                Publicar primera noticia
                            </button>
                        )}
                    </div>
                ) : (
                    noticias.map((noticia) => (
                        <article 
                            key={noticia.id} 
                            className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="font-bold text-lg text-gray-800 flex-1">
                                    {noticia.titulo}
                                </h2>
                                {noticia.autor_id && (
                                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                                {noticia.contenido}
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                <Bell size={14} className="text-gray-400" />
                                <span className="text-gray-400 text-xs">
                                    {formatDate(noticia.created_at)}
                                </span>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
