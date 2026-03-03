import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader, Lock, Unlock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth';

export default function ChatPage() {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMensaje, setNewMensaje] = useState('');
    const [sending, setSending] = useState(false);
    const [chatActivo, setChatActivo] = useState(true);
    const [esAdmin, setEsAdmin] = useState(false);
    const { user, userData } = useAuth();
    const messagesEndRef = useRef(null);
    const channelRef = useRef(null);
    const subscribedRef = useRef(false);

    useEffect(() => {
        const loadData = async () => {
            if (userData?.role === 'admin') {
                setEsAdmin(true);
            }

            const { data: config } = await supabase
                .from('chat_config')
                .select('chat_activo')
                .eq('id', 'global')
                .single();
            
            if (config) {
                setChatActivo(config.chat_activo);
            }

            const result = await supabase
                .from('mensajes')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(200);

            if (result.data) {
                setMensajes(result.data);
            }
            setLoading(false);
        };

        loadData();

        if (!subscribedRef.current) {
            subscribedRef.current = true;
            channelRef.current = supabase
                .channel('mensajes-global')
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'mensajes' 
                }, (payload) => {
                    setMensajes(prev => {
                        if (prev.some(m => m.id === payload.new.id)) {
                            return prev;
                        }
                        return [...prev, payload.new];
                    });
                })
                .subscribe();
        }
    }, [userData?.role]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const toggleChat = async () => {
        const nuevoEstado = !chatActivo;
        await supabase
            .from('chat_config')
            .update({ chat_activo: nuevoEstado, updated_at: new Date().toISOString() })
            .eq('id', 'global');
        
        setChatActivo(nuevoEstado);
    };

    const borrarTodosMensajes = async () => {
        if (!confirm('¿Borrar todos los mensajes?')) return;
        
        const { error } = await supabase
            .from('mensajes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (!error) {
            setMensajes([]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMensaje.trim() || !user || !userData || !chatActivo) return;

        setSending(true);
        
        const result = await supabase
            .from('mensajes')
            .insert({
                user_id: user.id,
                user_name: userData.nombre,
                puesto_numero: userData.puesto_numero,
                contenido: newMensaje.trim()
            })
            .select()
            .single();

        if (result.error) {
            console.error('Error:', result.error);
        }
        
        setNewMensaje('');
        setSending(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center">
                <Loader className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (!chatActivo && !esAdmin) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-12 h-12 text-gray-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-700 text-center mb-4">
                    🔒 Chat Desactivado
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-red-50 flex flex-col">
            <header className="bg-red-600 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Chat</h1>
                            <p className="text-sm text-red-200">{mensajes.length} mensajes</p>
                        </div>
                    </div>

                    {esAdmin && (
                        <div className="flex gap-2">
                            <button onClick={toggleChat} className="p-3 bg-white/20 rounded-xl">
                                {chatActivo ? <Lock size={20} className="text-white" /> : <Unlock size={20} className="text-white" />}
                            </button>
                            <button onClick={borrarTodosMensajes} className="p-3 bg-white/20 rounded-xl">
                                <Trash2 size={20} className="text-white" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {mensajes.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <p className="text-xl text-red-400">No hay mensajes</p>
                    </div>
                ) : (
                    mensajes.map((msg) => {
                        const isOwn = msg.user_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${
                                    isOwn ? 'bg-red-600 text-white' : 'bg-white shadow-md text-gray-800'
                                }`}>
                                    {!isOwn && (
                                        <p className={`text-sm font-bold mb-1 ${
                                            isOwn ? 'text-red-200' : 'text-red-600'
                                        }`}>
                                            {msg.user_name}
                                        </p>
                                    )}
                                    <p className="text-lg">{msg.contenido}</p>
                                    <p className={`text-xs mt-1 ${
                                        isOwn ? 'text-red-200' : 'text-gray-400'
                                    }`}>
                                        {new Date(msg.created_at).toLocaleTimeString('es-CL', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t p-4 pb-24">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        value={newMensaje}
                        onChange={(e) => setNewMensaje(e.target.value)}
                        placeholder="Escribe..."
                        className="flex-1 text-lg p-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:outline-none"
                        disabled={sending || !chatActivo}
                    />
                    <button
                        type="submit"
                        disabled={!newMensaje.trim() || sending || !chatActivo}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-4 rounded-2xl"
                    >
                        <Send size={24} />
                    </button>
                </form>
            </div>
        </div>
    );
}
