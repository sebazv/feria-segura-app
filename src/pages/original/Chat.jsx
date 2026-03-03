import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader, Settings, Lock, Unlock, Users } from 'lucide-react';
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
                .limit(100);

            if (result.data) {
                setMensajes(result.data);
            }
            setLoading(false);
        };

        loadData();

        channelRef.current = supabase
            .channel('mensajes-chat')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'mensajes' 
            }, (payload) => {
                setMensajes(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
                <p className="text-xl text-gray-500 text-center">
                    El chat está temporalmente deshabilitado<br/>por el administrador
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Chat en Vivo</h1>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {mensajes.length} mensajes
                            </p>
                        </div>
                    </div>

                    {esAdmin && (
                        <button
                            onClick={toggleChat}
                            className={`p-3 rounded-xl ${chatActivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                            {chatActivo ? <Lock size={24} /> : <Unlock size={24} />}
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                {mensajes.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-xl text-gray-500">No hay mensajes aún</p>
                        <p className="text-lg text-gray-400">¡Sé el primero en escribir!</p>
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
                        placeholder="Escribe un mensaje..."
                        className="flex-1 text-lg p-4 border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:outline-none"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMensaje.trim() || sending}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-4 rounded-2xl"
                    >
                        {sending ? (
                            <Loader className="w-6 h-6 animate-spin" />
                        ) : (
                            <Send size={24} />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
