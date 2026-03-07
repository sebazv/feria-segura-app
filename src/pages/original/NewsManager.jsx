import { useState, useEffect } from 'react';
import { ArrowLeft, Newspaper, Send, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function NewsManagerPage() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [urgent, setUrgent] = useState(false);

    useEffect(() => {
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            try {
                setUserData(JSON.parse(savedUserData));
            } catch (e) {}
        }
        loadNews();
    }, []);

    const loadNews = async () => {
        const { data } = await supabase
            .from('noticias')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (data) setNews(data);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            alert('Completa todos los campos');
            return;
        }

        setSaving(true);

        try {
            const { error } = await supabase
                .from('noticias')
                .insert({
                    titulo: title,
                    contenido: content,
                    es_urgente: urgent,
                    autor_id: userData?.id,
                    publicado_por: userData?.nombre
                });

            if (error) throw error;

            alert(urgent ? '📢 ¡Noticia publicada como URGENTE!' : '✅ Noticia publicada');
            
            setTitle('');
            setContent('');
            setUrgent(false);
            setShowForm(false);
            loadNews();
            
        } catch (err) {
            console.error(err);
            alert('Error al publicar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta noticia?')) return;
        
        try {
            await supabase.from('noticias').delete().eq('id', id);
            setNews(news.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    if (!userData?.role || userData.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <Newspaper className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">Acceso Restringido</h2>
                    <p className="text-slate-400 mt-2">Solo administradores</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white">📰 Gestión de Noticias</h1>
            </div>

            {/* Add News Button */}
            {!showForm && (
                <button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold mb-4 flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    Nueva Noticia
                </button>
            )}

            {/* News Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                    <h3 className="text-white font-bold mb-4">Publicar Nueva Noticia</h3>
                    
                    <input
                        type="text"
                        placeholder="Título de la noticia"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 mb-3"
                    />
                    
                    <textarea
                        placeholder="Contenido de la noticia..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 mb-3 resize-none"
                    />
                    
                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={urgent}
                            onChange={(e) => setUrgent(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-400" />
                            Marcar como Urgente
                        </span>
                    </label>
                    
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="flex-1 bg-white/10 text-white py-3 rounded-xl font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                        >
                            {saving ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                </form>
            )}

            {/* News List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : news.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <Newspaper className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No hay noticias publicadas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {news.map((item) => (
                        <div 
                            key={item.id} 
                            className={`bg-white/10 backdrop-blur-sm border rounded-2xl p-4 ${
                                item.es_urgente ? 'border-amber-500/50' : 'border-white/10'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-bold">{item.titulo}</h3>
                                        {item.es_urgente && (
                                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
                                                URGENTE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm">{item.contenido}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                                <span>Por {item.publicado_por || 'Admin'}</span>
                                <span>{new Date(item.created_at).toLocaleDateString('es-CL')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
