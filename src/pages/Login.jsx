import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { registerFeriante, loginFeriante, validarEmail, validarTelefono } from '../lib/auth';

export default function Login() {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        telefono: '',
        puestoNumero: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                if (!validarEmail(formData.email)) throw new Error('Correo inválido');
                if (!validarTelefono(formData.telefono)) throw new Error('Teléfono inválido (9 dígitos)');
                if (!formData.puestoNumero.trim()) throw new Error('Ingresa tu puesto');
                if (formData.password.length < 6) throw new Error('Mínimo 6 caracteres');
                if (formData.password !== formData.confirmPassword) throw new Error('Las contraseñas no coinciden');

                const result = await registerFeriante({
                    email: formData.email.toLowerCase().trim(),
                    telefono: formData.telefono.trim(),
                    puestoNumero: formData.puestoNumero.trim(),
                    password: formData.password
                });

                if (!result.success) throw new Error(result.error);
                navigate('/');
            } else {
                if (!validarEmail(formData.email)) throw new Error('Correo inválido');
                if (!formData.password) throw new Error('Ingresa tu contraseña');

                const result = await loginFeriante(
                    formData.email.toLowerCase().trim(),
                    formData.password
                );

                if (!result.success) throw new Error('Credenciales incorrectas');
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Feria Segura</h1>
                        <p className="text-gray-500 text-sm mt-1">Sindicato de Peñaflor</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Correo electrónico"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Teléfono (9 dígitos)"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="puestoNumero"
                                        value={formData.puestoNumero}
                                        onChange={handleChange}
                                        placeholder="Número de puesto"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </>
                        )}

                        {!isRegister && (
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Correo electrónico"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Contraseña"
                                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {isRegister && (
                            <div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirmar contraseña"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isRegister ? 'Registrarse' : 'Ingresar'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="text-center mt-6 text-sm text-gray-500">
                        {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                        <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-red-600 font-medium">
                            {isRegister ? 'Ingresa' : 'Regístrate'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-gray-400 text-xs">
                Desarrollado por SZV
            </footer>
        </div>
    );
}
