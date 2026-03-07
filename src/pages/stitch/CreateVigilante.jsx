import { useState, useEffect } from 'react';
import { ArrowLeft, User, Shield, Plus, Trash2, Phone, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function CreateVigilantePage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            try {
                setUserData(JSON.parse(savedUserData));
            } catch (e) {}
        }
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nombre.trim() || !telefono.trim()) {
            setError('Nombre y teléfono son obligatorios');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Limpiar teléfono
            const telefonoLimpio = telefono.replace(/\s/g, '').replace(/^\+56/, '');
            
            // Verificar si ya existe
            const { data: existing } = await supabase
                .from('usuarios')
                .select('id')
                .or(`telefono.eq.${telefonoLimpio},telefono.eq.+56${telefonoLimpio}`)
                .limit(1);

            if (existing && existing.length > 0) {
                // Actualizar rol a vigilante
                await supabase
                    .from('usuarios')
                    .update({ role: 'vigilante', estado: 'ACTIVO' })
                    .eq('id', existing[0].id);
                
                setSuccess('✅ Usuario convertido a vigilante');
            } else {
                // Crear nuevo vigilante
                await supabase
                    .from('usuarios')
                    .insert({
                        nombre: nombre,
                        telefono: telefonoLimpio,
                        email: email || `vigilante_${telefonoLimpio}@feriasegura.cl`,
                        role: 'vigilante',
                        estado: 'ACTIVO',
                        telefono_verificado: true
                    });
                
                setSuccess('✅ Vigilante creado correctamente');
            }

            // Limpiar form
            setNombre('');
            setTelefono('');
            setEmail('');
            
        } catch (err) {
            console.error(err);
            setError('Error al crear vigilante');
        } finally {
            setSaving(false);
        }
    };

    if (!userData || userData.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
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
                <h1 className="text-2xl font-bold text-white">👮 Crear Vigilante</h1>
            </div>

            {/* Info Card */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                    <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-300">
                        <p className="font-bold mb-1">Perfil de Vigilante</p>
                        <p>Los vigilantes son personal de seguridad municipal. Pueden recibir alertas en tiempo real y acceder a un panel especial.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                <h3 className="text-white font-bold mb-4">Datos del Vigilante</h3>
                
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Nombre completo *</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Teléfono *</label>
                        <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ej: 912345678"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email (opcional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="juan@municipalidad.cl"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mt-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 mt-4">
                        <p className="text-emerald-400 text-sm">{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white py-3 rounded-xl font-bold mt-4 transition-colors"
                >
                    {saving ? 'Creando...' : '👮 Crear Vigilante'}
                </button>
            </form>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <h4 className="text-white font-bold mb-2">📱 Instrucciones</h4>
                <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Crea el vigilante desde aquí</li>
                    <li>El vigilante recibirá un SMS con su número de acceso</li>
                    <li>Debe descargar la app y iniciar sesión</li>
                    <li>Tendrá acceso al "Panel de Vigilante"</li>
                </ol>
            </div>
        </div>
    );
}
