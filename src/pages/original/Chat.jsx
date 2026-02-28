import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Loader, Plus, Send } from 'lucide-react';
import { getMensajes, sendMensaje, subscribeToMensajes } from '../../lib/comunidad';
import { useAuth } from '../../lib/auth';

export default function ChatPage() {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMensaje, setNewMensaje] = useState('');
    const [sending, setSending] = useState(false);
    const { user, userData } = useAuth();
    const messagesEndRef = null;

    useEffect(() => {
        const loadMensajes = async () => {
            const result = await getMensajes();
            if (result.success) {
                setMensajes(result.mensajes);
            }
            setLoading(false);
        };

        loadMensajes();

        // Subscribe to new messages
        const channel = subscribeToMensajes((payload) => {
            setMensajes(prev => [...prev, payload.new]);
        });

        return () => {
            if (channel) channel.unsubscribe();
        };
    }, []);

    useEffect(() => {
        messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMensaje.trim() || !user || !userData) return;

        setSending(true);
        const result = await sendMensaje({
            userId: user.id,
            userName: userData.nombre,
            puestoNumero: userData.puesto_numero,
            contenido: newMensaje.trim()
        });

        if (result.success) {
            setMensajes(prev => [...prev, result.mensaje]);
            setNewMensaje('');
        }
        setSending(false);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    Chat de la Feria
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Comunicación con otros feriantes
                </p>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[calc(100vh-250px)]">
                {mensajes.map((msg) => {
                    const isMe = msg.user_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl p-3 ${
                                isMe 
                                    ? 'bg-red-600 text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-sm'
                            }`}>
                                {!isMe && (
                                    <p className="text-xs font-bold mb-1 opacity-80">
                                        {msg.user_name} {msg.puesto_numero && `#${msg.puesto_numero}`}
                                    </p>
                                )}
                                <p className="text-sm">{msg.contenido}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                    {formatTime(msg.created_at)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                
                {mensajes.length === 0 && (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400">No hay mensajes aún</p>
                        <p className="text-gray-500 text-sm">Sé el primero en escribir</p>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMensaje}
                        onChange={(e) => setNewMensaje(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 text-gray-800 dark:text-white focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMensaje.trim()}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}
