import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../lib/auth';
import InstallAppButton from '../components/InstallAppButton';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [telefono, setTelefono] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!telefono.trim()) {
            setError('Ingresa tu número de teléfono');
            setLoading(false);
            return;
        }

        try {
            const telefonoLimpio = telefono.replace(/\s/g, '').replace(/^\+56/, '');
            
            const { data: usuarios } = await supabase
                .from('usuarios')
                .select('*')
                .or(`telefono.eq.${telefonoLimpio},telefono.eq.+56${telefonoLimpio}`)
                .limit(1);

            const usuario = usuarios?.[0];

            if (!usuario) {
                setError('No encontramos ese número. Regístrate primero.');
                setLoading(false);
                return;
            }

            if (usuario.estado !== 'ACTIVO') {
                setError('Tu cuenta está pendiente de aprobación.');
                setLoading(false);
                return;
            }

            // Save user to localStorage and state
            login(usuario.id, usuario);
            
            // Navigate based on role
            if (usuario.role === 'vigilante') {
                navigate('/vigilante');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error('Login error:', err);
            setError('Error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-red-600 text-white p-6 text-center">
                <h1 className="text-2xl font-bold">🛡️ Feria Segura</h1>
                <p className="text-red-100 mt-1">Iniciar Sesión</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-800 p-4 rounded-xl mb-6">
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                <div className="mb-8">
                    <label htmlFor="telefono" className="block text-xl font-bold text-gray-800 mb-2">
                        📱 Ingresa tu número de celular
                    </label>
                    <input
                        id="telefono"
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
                        placeholder="Ej: 912345678"
                        autoComplete="tel"
                    />
                    <p className="text-sm text-gray-500 mt-1">9 dígitos sin espacios</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xl font-bold py-5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader className="w-6 h-6 animate-spin" />
                            Verificando...
                        </>
                    ) : (
                        <>
                            Ingresar
                            <ArrowRight className="w-6 h-6" />
                        </>
                    )}
                </button>

                <p className="text-center mt-6 text-lg text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={() => navigate('/registro')} className="text-red-600 font-bold underline">
                        Regístrate aquí
                    </button>
                </p>
            </form>

            <div className="p-6 bg-blue-50 m-6 rounded-2xl">
                <p className="text-lg text-blue-800 font-bold mb-2">💡 ¿Necesitas ayuda?</p>
                <p className="text-lg text-blue-700">Llama al <span className="font-bold">600 300 4040</span></p>
            </div>

            <InstallAppButton />
        </div>
    );
}
