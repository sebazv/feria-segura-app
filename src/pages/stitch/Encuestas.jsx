import { useState, useEffect } from 'react';
import { Vote, Plus, Loader, Check, BarChart3 } from 'lucide-react';
import { getEncuestas, getEncuestaConVotos, voteEncuesta, createEncuesta } from '../../lib/comunidad';
import { useAuth } from '../../lib/auth';

export default function EncuestasPage() {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newEncuesta, setNewEncuesta] = useState({ pregunta: '', opciones: '' });
    const [saving, setSaving] = useState(false);
    const [votedIds, setVotedIds] = useState(new Set());
    const { user, userData } = useAuth();

    useEffect(() => {
        loadEncuestas();
        if (userData?.role === 'admin') {
            setIsAdmin(true);
        }
    }, [userData]);

    const getOpciones = (encuesta) => {
        // Handle both string and array formats
        if (Array.isArray(encuesta.opciones)) {
            return encuesta.opciones;
        }
        if (typeof encuesta.opciones === 'string') {
            try {
                return JSON.parse(encuesta.opciones);
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const getVotos = (encuesta) => {
        // Handle both string and object formats
        if (Array.isArray(encuesta.votos)) {
            return encuesta.votos;
        }
        if (typeof encuesta.votos === 'string') {
            try {
                return JSON.parse(encuesta.votos);
            } catch (e) {
                return [];
            }
        }
        if (typeof encuesta.votos === 'object') {
            return Object.entries(encuesta.votos || {}).map(([key, value]) => ({ opcion: key, votos: value }));
        }
        return [];
    };

    const loadEncuestas = async () => {
        const result = await getEncuestas();
        if (result.success) {
            // Load votes for each survey
            const encuestasConVotos = await Promise.all(
                result.encuestas.map(async (encuesta) => {
                    const voteResult = await getEncuestaConVotos(encuesta.id);
                    return {
                        ...encuesta,
                        opciones: getOpciones(encuesta),
                        votos: voteResult.success ? getVotos(voteResult) : []
                    };
                })
            );
                        ...encuesta,
                        opciones: typeof encuesta.opciones === 'string' 
                            ? JSON.parse(encuesta.opciones) 
                            : encuesta.opciones,
                        votos: voteResult.success ? voteResult.votos : []
                    };
                })
            );
            setEncuestas(encuestasConVotos);
            
            // Check which surveys user has voted on
            if (user) {
                const voted = new Set();
                encuestasConVotos.forEach(encuesta => {
                    const userVoted = encuesta.votos?.some(v => v.user_id === user.id);
                    if (userVoted) voted.add(encuesta.id);
                });
                setVotedIds(voted);
            }
        }
        setLoading(false);
    };

    const handleVote = async (encuestaId, opcion) => {
        if (!user) return;
        
        const result = await voteEncuesta({
            encuestaId,
            userId: user.id,
            opcion
        });

        if (result.success) {
            setVotedIds(new Set([...votedIds, encuestaId]));
            loadEncuestas(); // Reload to show updated votes
        } else {
            alert(result.error || 'Error al votar');
        }
    };

    const handleCreateEncuesta = async (e) => {
        e.preventDefault();
        if (!newEncuesta.pregunta.trim() || !newEncuesta.opciones.trim()) return;

        const opciones = newEncuesta.opciones
            .split('\n')
            .map(o => o.trim())
            .filter(o => o.length > 0);

        if (opciones.length < 2) {
            alert('Agrega al menos 2 opciones');
            return;
        }

        setSaving(true);
        const result = await createEncuesta({
            pregunta: newEncuesta.pregunta.trim(),
            opciones,
            autorId: user.id
        });

        if (result.success) {
            loadEncuestas();
            setNewEncuesta({ pregunta: '', opciones: '' });
            setShowForm(false);
        }
        setSaving(false);
    };

    const getTotalVotos = (votos) => {
        return votos?.length || 0;
    };

    const getOpcionVotos = (votos, opcion) => {
        return votos?.filter(v => v.opcion === opcion).length || 0;
    };

    const getPorcentaje = (votos, opcion) => {
        const total = getTotalVotos(votos);
        if (total === 0) return 0;
        return Math.round((getOpcionVotos(votos, opcion) / total) * 100);
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
                        🗳️ Encuestas
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Vota y participa
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

            {/* Admin: Create Poll Form */}
            {showForm && isAdmin && (
                <div className="bg-white rounded-xl p-4 mb-4 shadow-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Nueva Encuesta</h3>
                    <form onSubmit={handleCreateEncuesta} className="space-y-3">
                        <input
                            type="text"
                            value={newEncuesta.pregunta}
                            onChange={(e) => setNewEncuesta({ ...newEncuesta, pregunta: e.target.value })}
                            placeholder="Pregunta de la encuesta"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <textarea
                            value={newEncuesta.opciones}
                            onChange={(e) => setNewEncuesta({ ...newEncuesta, opciones: e.target.value })}
                            placeholder="Opciones (una por línea)"
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
                            >
                                {saving ? 'Creando...' : 'Crear Encuesta'}
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

            {/* Polls List */}
            <div className="space-y-4">
                {encuestas.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <Vote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay encuestas activas</p>
                        {isAdmin && (
                            <button 
                                onClick={() => setShowForm(true)}
                                className="text-red-600 font-medium mt-2"
                            >
                                Crear primera encuesta
                            </button>
                        )}
                    </div>
                ) : (
                    encuestas.map((encuesta) => {
                        const hasVoted = votedIds.has(encuesta.id);
                        const totalVotos = getTotalVotos(encuesta.votos);
                        
                        return (
                            <div 
                                key={encuesta.id} 
                                className="bg-white rounded-xl p-4 shadow-md"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-bold text-lg text-gray-800 flex-1">
                                        {encuesta.pregunta}
                                    </h2>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <BarChart3 size={12} />
                                        {totalVotos} voto{totalVotos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    {getOpciones(encuesta).map((opcion, index) => {
                                        const porcentaje = getPorcentaje(encuesta.votos, opcion);
                                        const userVotedOption = encuesta.votos?.find(
                                            v => v.user_id === user?.id && v.opcion === opcion
                                        );
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => !hasVoted && handleVote(encuesta.id, opcion)}
                                                disabled={hasVoted}
                                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                    hasVoted 
                                                        ? userVotedOption 
                                                            ? 'border-green-500 bg-green-50' 
                                                            : 'border-gray-200'
                                                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-800">
                                                        {opcion}
                                                        {userVotedOption && (
                                                            <Check size={16} className="inline ml-2 text-green-600" />
                                                        )}
                                                    </span>
                                                    {hasVoted && (
                                                        <span className="text-sm font-bold text-gray-600">
                                                            {porcentaje}%
                                                        </span>
                                                    )}
                                                </div>
                                                {hasVoted && (
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-red-500 rounded-full transition-all"
                                                            style={{ width: `${porcentaje}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {hasVoted && (
                                    <p className="text-center text-green-600 text-sm mt-3 font-medium">
                                        ✓ Ya has votado en esta encuesta
                                    </p>
                                )}
                                {!user && !hasVoted && (
                                    <p className="text-center text-gray-500 text-sm mt-3">
                                        Inicia sesión para votar
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
