import { useState, useEffect } from 'react';
import { Vote, CheckCircle, Loader, Circle } from 'lucide-react';
import { getEncuestas, getEncuestaConVotos, voteEncuesta } from '../../lib/comunidad';
import { useAuth } from '../../lib/auth';

export default function EncuestasPage() {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEncuesta, setSelectedEncuesta] = useState(null);
    const [votos, setVotos] = useState([]);
    const [voting, setVoting] = useState(null);
    const [voted, setVoted] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        const loadEncuestas = async () => {
            const result = await getEncuestas();
            if (result.success) {
                setEncuestas(result.encuestas);
                
                // Check which ones user has voted
                const votedMap = {};
                for (const enc of result.encuestas) {
                    const detalle = await getEncuestaConVotos(enc.id);
                    if (detalle.success) {
                        const userVote = detalle.votos.find(v => v.user_id === user?.id);
                        if (userVote) votedMap[enc.id] = userVote.opcion;
                    }
                }
                setVoted(votedMap);
            }
            setLoading(false);
        };

        loadEncuestas();
    }, [user]);

    const handleVerVotos = async (encuestaId) => {
        if (selectedEncuesta === encuestaId) {
            setSelectedEncuesta(null);
            return;
        }
        
        const result = await getEncuestaConVotos(encuestaId);
        if (result.success) {
            setVotos(result.votos);
            setSelectedEncuesta(encuestaId);
        }
    };

    const handleVotar = async (encuestaId, opcion) => {
        if (!user) {
            alert('Debes iniciar sesión para votar');
            return;
        }

        if (voted[encuestaId]) {
            alert('Ya has votado en esta encuesta');
            return;
        }

        setVoting(opcion);
        const result = await voteEncuesta({
            encuestaId,
            userId: user.id,
            opcion
        });

        if (result.success) {
            setVoted({ ...voted, [encuestaId]: opcion });
            handleVerVotos(encuestaId);
        } else {
            alert(result.error || 'Error al votar');
        }
        setVoting(null);
    };

    const getResultados = (opciones) => {
        if (!selectedEncuesta || votos.length === 0) return null;
        
        const opts = typeof opciones === 'string' ? JSON.parse(opciones) : opciones;
        const total = votos.length;
        
        return opts.map(opcion => {
            const count = votos.filter(v => v.opcion === opcion).length;
            const porcentaje = total > 0 ? Math.round((count / total) * 100) : 0;
            return { opcion, count, porcentaje };
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
                    Encuestas
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Votaciones y consultas al gremio
                </p>
            </header>

            <div className="space-y-4">
                {encuestas.map((encuesta) => {
                    const opciones = typeof encuesta.opciones === 'string' ? JSON.parse(encuesta.opciones) : encuesta.opciones;
                    const yaVotado = voted[encuesta.id];
                    const resultados = selectedEncuesta === encuesta.id ? getResultados(encuesta.opciones) : null;

                    return (
                        <div 
                            key={encuesta.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="bg-purple-600 px-4 py-2 flex items-center gap-2">
                                <Vote className="w-4 h-4 text-white" />
                                <span className="text-white font-semibold text-sm">ENCUESTA</span>
                            </div>
                            
                            <div className="p-4">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                                    {encuesta.pregunta}
                                </h2>

                                {yaVotado ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                            <CheckCircle size={16} />
                                            <span>Ya has votado: {yaVotado}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleVerVotos(encuesta.id)}
                                            className="text-purple-600 text-sm underline"
                                        >
                                            {selectedEncuesta === encuesta.id ? 'Ocultar' : 'Ver'} resultados
                                        </button>

                                        {resultados && (
                                            <div className="mt-3 space-y-2">
                                                {resultados.map((r, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600 dark:text-gray-300">{r.opcion}</span>
                                                            <span className="font-medium">{r.porcentaje}% ({r.count})</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-purple-500 rounded-full"
                                                                style={{ width: `${r.porcentaje}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <p className="text-xs text-gray-400 text-right mt-1">{votos.length} votos totales</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {opciones.map((opcion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleVotar(encuesta.id, opcion)}
                                                disabled={voting}
                                                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 transition-colors flex items-center justify-between"
                                            >
                                                <span>{opcion}</span>
                                                {voting === opcion && (
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {encuestas.length === 0 && (
                    <div className="text-center py-12">
                        <Vote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No hay encuestas activas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
