import { useState, useEffect } from 'react';
import { ArrowLeft, Vote, Send, Trash2, CheckCircle, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

function X({ size }) {
    return <span style={{ fontSize: size }}>✕</span>;
}

export default function PollManagerPage() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    useEffect(() => {
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            try {
                setUserData(JSON.parse(savedUserData));
            } catch (e) {}
        }
        loadPolls();
    }, []);

    const loadPolls = async () => {
        const { data } = await supabase
            .from('encuestas')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (data) setPolls(data);
        setLoading(false);
    };

    const handleAddOption = () => {
        if (options.length < 6) {
            setOptions([...options, '']);
        }
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    // Helper to parse opciones
    const getOpciones = (poll) => {
        if (Array.isArray(poll.opciones)) return poll.opciones;
        if (typeof poll.opciones === 'string') {
            try { return JSON.parse(poll.opciones); } catch { return []; }
        }
        return [];
    };

    // Helper to get votes
    const getPollVotes = (poll) => {
        if (!poll.votes) return {};
        if (typeof poll.votes === 'object') return poll.votes;
        if (typeof poll.votes === 'string') {
            try { return JSON.parse(poll.votes); } catch { return {}; }
        }
        return {};
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!question.trim()) {
            alert('Ingresa una pregunta');
            return;
        }

        const validOptions = options.filter(o => o.trim());
        if (validOptions.length < 2) {
            alert('Agrega al menos 2 opciones');
            return;
        }

        setSaving(true);

        try {
            const opciones = validOptions.map(o => ({ opcion: o, votos: 0 }));
            
            const { error } = await supabase
                .from('encuestas')
                .insert({
                    pregunta: question,
                    opciones: opciones,
                    activa: true,
                    autor_id: userData?.id
                });

            if (error) throw error;

            alert('✅ Encuesta creada');
            
            setQuestion('');
            setOptions(['', '']);
            setShowForm(false);
            loadPolls();
            
        } catch (err) {
            console.error(err);
            alert('Error al crear');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta encuesta?')) return;
        
        try {
            await supabase.from('encuestas').delete().eq('id', id);
            setPolls(polls.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    const handleToggleActive = async (poll) => {
        try {
            await supabase
                .from('encuestas')
                .update({ activa: !poll.activa })
                .eq('id', poll.id);
            
            setPolls(polls.map(p => p.id === poll.id ? { ...p, activa: !p.activa } : p));
        } catch (err) {
            console.error(err);
        }
    };

    const getTotalVotes = (poll) => {
        const votes = getPollVotes(poll);
        if (!votes) return 0;
        return Object.values(votes).reduce((a, b) => a + (Number(b) || 0), 0);
    };

    if (!userData?.role || userData.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <Vote className="w-16 h-16 text-slate-600 mx-auto mb-4" />
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
                <h1 className="text-2xl font-bold text-white">📊 Gestión de Encuestas</h1>
            </div>

            {/* Add Poll Button */}
            {!showForm && (
                <button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-bold mb-4 flex items-center justify-center gap-2"
                >
                    <Vote size={20} />
                    Nueva Encuesta
                </button>
            )}

            {/* Poll Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                    <h3 className="text-white font-bold mb-4">Crear Nueva Encuesta</h3>
                    
                    <input
                        type="text"
                        placeholder="¿Cuál es tu pregunta?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 mb-4"
                    />
                    
                    <div className="space-y-2 mb-4">
                        <p className="text-slate-400 text-sm">Opciones de respuesta:</p>
                        {options.map((opt, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Opción ${index + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                                />
                                {options.length > 2 && (
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveOption(index)}
                                        className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        {options.length < 6 && (
                            <button 
                                type="button"
                                onClick={handleAddOption}
                                className="text-blue-400 text-sm hover:underline"
                            >
                                + Agregar opción
                            </button>
                        )}
                    </div>
                    
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
                            className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                        >
                            {saving ? 'Creando...' : 'Crear'}
                        </button>
                    </div>
                </form>
            )}

            {/* Polls List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : polls.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <Vote className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No hay encuestas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {polls.map((poll) => {
                        const totalVotes = getTotalVotes(poll);
                        return (
                            <div 
                                key={poll.id} 
                                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold">{poll.pregunta}</h3>
                                        <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                                            <Users size={14} />
                                            {totalVotes} votos
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleToggleActive(poll)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                                poll.activa 
                                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                                    : 'bg-slate-500/20 text-slate-400'
                                            }`}
                                        >
                                            {poll.activa ? 'Activa' : 'Cerrada'}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(poll.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Options with votes */}
                                <div className="space-y-2">
                                    {getOpciones(poll).map((opt, idx) => {
                                        const votes = getPollVotes(poll)[idx] || 0;
                                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                                        
                                        return (
                                            <div key={idx} className="relative">
                                                <div 
                                                    className="absolute inset-0 bg-amber-500/20 rounded-lg"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                                <div className="relative flex items-center justify-between p-2 rounded-lg">
                                                    <span className="text-white text-sm">{opt.opcion}</span>
                                                    <span className="text-amber-400 text-sm font-medium">{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <p className="text-xs text-slate-500 mt-2">
                                    {new Date(poll.created_at).toLocaleDateString('es-CL')}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
