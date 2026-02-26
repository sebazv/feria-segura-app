import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, MapPin, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { registerFeriante, loginFeriante, validarRUT } from '../lib/auth';

export default function Login() {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
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
                // Validaciones de registro
                if (!formData.nombre.trim()) {
                    throw new Error('Ingresa tu nombre completo');
                }
                if (!validarRUT(formData.rut)) {
                    throw new Error('RUT inválido');
                }
                if (!formData.telefono.trim()) {
                    throw new Error('Ingresa tu número de teléfono');
                }
                if (!formData.puestoNumero.trim()) {
                    throw new Error('Ingresa tu número de puesto');
                }
                if (formData.password.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Las contraseñas no coinciden');
                }

                const result = await registerFeriante({
                    nombre: formData.nombre,
                    rut: formData.rut,
                    telefono: formData.telefono,
                    puestoNumero: formData.puestoNumero,
                    password: formData.password
                });

                if (!result.success) {
                    throw new Error(result.error);
                }

                navigate('/');
            } else {
                // Login
                if (!formData.rut.trim()) {
                    throw new Error('Ingresa tu RUT');
                }
                if (!formData.password.trim()) {
                    throw new Error('Ingresa tu contraseña');
                }

                const result = await loginFeriante(formData.rut, formData.password);

                if (!result.success) {
                    throw new Error(result.error);
                }

                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatRUT = (value) => {
        let rut = value.replace(/[^0-9kK]/g, '');
        if (rut.length > 1) {
            rut = rut.slice(0, -1) + '.' + rut.slice(-1);
        }
        if (rut.length > 5) {
            rut = rut.slice(0, -5) + '.' + rut.slice(-5);
        }
        if (rut.length > 10) {
            rut = rut.slice(0, -10) + '.' + rut.slice(-10);
        }
        return rut;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex flex-col">
            {/* Header */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-800">Feria Segura</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isRegister ? 'Registro de Feriantes' : 'Ingreso al Sistema'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            placeholder="Juan Pérez González"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        RUT
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="rut"
                                            value={formData.rut}
                                            onChange={(e) => handleChange({ target: { name: 'rut', value: formatRUT(e.target.value) } })}
                                            placeholder="12.345.678-5"
                                            maxLength={12}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="+56 9 1234 5678"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Puesto
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="puestoNumero"
                                            value={formData.puestoNumero}
                                            onChange={handleChange}
                                            placeholder="Puesto #45"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {!isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    RUT
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="rut"
                                        value={formData.rut}
                                        onChange={(e) => handleChange({ target: { name: 'rut', value: formatRUT(e.target.value) } })}
                                        placeholder="12.345.678-5"
                                        maxLength={12}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isRegister ? 'Registrarse' : 'Ingresar'}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Login/Register */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                            {isRegister 
                                ? '¿Ya tienes cuenta? Ingresa aquí' 
                                : '¿No tienes cuenta? Regístrate aquí'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center text-white/70 text-xs">
                <p>Feria Segura — Sindicato de Peñaflor</p>
                <p>Desarrollado por SZV</p>
            </footer>
        </div>
    );
}
