/**
 * RegistrationFlow.jsx
 * Sistema de registro con aprobación manual - VERSION MEJORADA
 * 
 * Flujo:
 * 1. Usuario se registra -> Estado PENDIENTE
 * 2. No puede salir de la pantalla de espera
 * 3. Si actualiza la página, sigue bloqueado
 * 4. Admin aprueba -> Usuario puede usar la app
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Check, Clock, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../lib/auth.jsx';

/**
 * Pantalla de espera - Versión mejorada con mensajes claros
 */
function PantallaEspera({ nombre, telefono, onRefresh }) {
    const [countdown, setCountdown] = useState(30);
    const [checking, setChecking] = useState(false);

    // Auto-refresh every 30 seconds to check if approved
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(30);
            if (onRefresh) onRefresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [onRefresh]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            {/* Icono animado */}
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
            </div>
            
            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                ⏳ Esperando Aprobación
            </h1>
            
            <p className="text-xl text-gray-600 text-center mb-6">
                Hola <strong>{nombre}</strong> 👋
            </p>
            
            {/* Explicación clara */}
            <div className="max-w-md text-center mb-6">
                <div className="bg-yellow-50 rounded-2xl p-6 text-left border-2 border-yellow-200">
                    <p className="text-lg text-yellow-800 font-semibold mb-4">
                        📋 Tu solicitud está siendo revisada
                    </p>
                    <ul className="text-lg text-yellow-700 space-y-3">
                        <li>✓ Un administrador debe aprobarte</li>
                        <li>✓ Esto suele tomar solo unos minutos</li>
                        <li>✓ <strong>NO cierres esta página</strong></li>
                        <li>✓ <strong>NO actualices ni recargues</strong></li>
                    </ul>
                </div>
            </div>

            {/* Advertencia importante */}
            <div className="bg-red-50 rounded-xl p-4 mb-6 max-w-md">
                <p className="text-lg text-red-700 font-bold text-center">
                    ⚠️ IMPORTANTE
                </p>
                <p className="text-base text-red-600 text-center">
                    Si cierras o actualizas esta página,<br/>
                    perderás el acceso y tendrás que registrarte de nuevo.
                </p>
            </div>

            {/* Teléfono de ayuda */}
            <div className="text-center">
                <p className="text-lg text-gray-500">
                    ¿Tienes dudas? Llama al:
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                    600 300 4040
                </p>
            </div>

            {/* Contador y botón de revisar */}
            <div className="mt-8 flex items-center gap-4">
                <span className="text-sm text-gray-400">
                    Revisando automáticamente en {countdown}s...
                </span>
                <button 
                    onClick={() => { setChecking(true); if (onRefresh) onRefresh(); setTimeout(() => setChecking(false), 1000); }}
                    disabled={checking}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                >
                    <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                    Revisar ahora
                </button>
            </div>
        </div>
    );
}

/**
 * Pantalla de rechazo
 */
function PantallaRechazado({ motivo }) {
    return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-red-800 text-center mb-4">
                ❌ Solicitud Rechazada
            </h1>
            
            <div className="max-w-md text-center">
                {motivo && (
                    <div className="bg-red-100 rounded-2xl p-4 text-left mb-6">
                        <p className="text-lg text-red-800"><strong>Motivo:</strong> {motivo}</p>
                    </div>
                )}
                
                <p className="text-xl text-gray-600 mb-6">
                    Comunícate con nosotros para más información:
                </p>
                <p className="text-2xl font-bold text-red-600">600 300 4040</p>
            </div>
        </div>
    );
}

/**
 * Componente principal de registro
 */
export default function RegistrationFlow() {
    const navigate = useNavigate();
    const { user, userData, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: ''
    });
    const [registered, setRegistered] = useState(false);

    // Check if user is approved - runs on every render
    useEffect(() => {
        if (user && userData?.estado === 'ACTIVO') {
            // User is approved - redirect to home
            navigate('/');
        }
    }, [user, userData, navigate]);

    // Check if previously registered user is now approved
    const checkApproval = async () => {
        if (!userData) return;

        // Fetch latest status
        const { data } = await supabase
            .from('usuarios')
            .select('estado')
            .eq('id', user.id)
            .single();

        if (data?.estado === 'ACTIVO') {
            login(user.id, { ...userData, estado: 'ACTIVO' });
            navigate('/');
        }
    };

    const validarTelefono = (telefono) => {
        const limpio = telefono.replace(/\s/g, '').replace(/[^\d]/g, '');
        return /^(\+?56|0)?9[0-9]{8}$/.test(limpio);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.nombre.trim()) {
            setError('Por favor ingresa tu nombre');
            setLoading(false);
            return;
        }

        if (!validarTelefono(formData.telefono)) {
            setError('Por favor ingresa un número de 9 dígitos');
            setLoading(false);
            return;
        }

        try {
            // Create user in database first
            const tempEmail = `user_${Date.now()}@feria-segura.app`;
            const tempPassword = `temp_${Math.random().toString(36).substring(7)}`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: tempEmail,
                password: tempPassword,
                options: {
                    data: {
                        telefono: formData.telefono,
                        nombre: formData.nombre
                    }
                }
            });

            if (authError) throw authError;

            // Create notification for admin
            await supabase.from('notificaciones_admin').insert({
                tipo: 'NUEVO_USUARIO',
                titulo: '📝 Nuevo registro pendiente',
                mensaje: `${formData.nombre} - Tel: ${formData.telefono}`,
                usuario_id: authData.user.id
            });

            // Save to localStorage to persist across refreshes
            localStorage.setItem('feria_registrado', 'true');
            localStorage.setItem('feria_nombre', formData.nombre);
            localStorage.setItem('feria_telefono', formData.telefono);
            
            setRegistered(true);
            
        } catch (err) {
            console.error('Error:', err);
            setError('Hubo un problema. Intenta de nuevo o llama al 600 300 4040');
        } finally {
            setLoading(false);
        }
    };

    // If user just registered, show waiting screen
    if (registered || (user && userData?.estado === 'PENDIENTE')) {
        return (
            <PantallaEspera 
                nombre={userData?.nombre || localStorage.getItem('feria_nombre') || formData.nombre}
                telefono={userData?.telefono || localStorage.getItem('feria_telefono') || formData.telefono}
                onRefresh={checkApproval}
            />
        );
    }

    // If rejected
    if (user && userData?.estado === 'RECHAZADO') {
        return <PantallaRechazado motivo={userData?.motivo_rechazo} />;
    }

    // Registration form
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 text-center">
                <h1 className="text-2xl font-bold">🛡️ Feria Segura</h1>
                <p className="text-red-100 mt-1">Registro de Usuario</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-800 p-4 rounded-xl mb-6">
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                {/* Campo: Nombre */}
                <div className="mb-6">
                    <label htmlFor="nombre" className="block text-xl font-bold text-gray-800 mb-2">
                        👤 ¿Cómo te llamas?
                    </label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                        placeholder="Escribe tu nombre completo"
                        autoComplete="name"
                    />
                </div>

                {/* Campo: Teléfono */}
                <div className="mb-8">
                    <label htmlFor="telefono" className="block text-xl font-bold text-gray-800 mb-2">
                        📱 ¿Cuál es tu número de celular?
                    </label>
                    <input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                        placeholder="Ej: 912345678"
                        autoComplete="tel"
                    />
                    <p className="text-sm text-gray-500 mt-1">9 dígitos sin espacios</p>
                </div>

                {/* Botón submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xl font-bold py-5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader className="w-6 h-6 animate-spin" />
                            Registrando...
                        </>
                    ) : (
                        <>
                            Registrarse
                        </>
                    )}
                </button>

                {/* Link to login */}
                <p className="text-center mt-6 text-lg text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-red-600 font-bold underline"
                    >
                        Iniciar sesión
                    </button>
                </p>
            </form>

            {/* Información de ayuda */}
            <div className="p-6 bg-blue-50 m-6 rounded-2xl">
                <p className="text-lg text-blue-800 font-bold mb-2">💡 ¿Necesitas ayuda?</p>
                <p className="text-lg text-blue-700">Llama al <span className="font-bold">600 300 4040</span></p>
            </div>
        </div>
    );
}
