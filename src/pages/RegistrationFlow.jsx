/**
 * RegistrationFlow.jsx
 * 
 * Sistema de registro SIMPLIFICADO para usuarios con bajo alfabetismo digital.
 * 
 * SOLO pide: Nombre + Teléfono
 * 
 * Flujo:
 * 1. Usuario ingresa nombre y teléfono
 * 2. Queda注册auto-logueado automáticamente
 * 3. Admin recibe notificación
 * 4. Admin aprueba → usuario puede usar la app
 * 5. Sesión PERMANECE activa (no necesita login de nuevo)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Check, Clock, AlertCircle, ArrowRight, Loader, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../lib/auth';

/**
 * Pantalla de espera - Reduce ansiedad del usuario
 */
function PantallaEspera({ nombre }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
        ⏳ Estamos verificando tu información
      </h1>
      
      <div className="max-w-md text-center">
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          Hola <strong>{nombre}</strong>, para tu seguridad un administrador debe revisar tu solicitud.
        </p>
        
        <div className="bg-blue-50 rounded-2xl p-6 text-left">
          <p className="text-lg text-blue-800 font-semibold mb-2">📋 ¿Qué sigue?</p>
          <ul className="text-lg text-blue-700 space-y-2">
            <li>✓ Te notificaremos cuando estés aprobado</li>
            <li>✓ Usually toma solo unos minutos</li>
            <li>✓ ¡No necesitas hacer nada más!</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-lg text-gray-500">¿Tienes dudas?</p>
        <p className="text-xl font-bold text-red-600 mt-1">600 300 4040</p>
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
        ❌ Solicitud no aprobada
      </h1>
      
      <div className="max-w-md text-center">
        <p className="text-xl text-gray-600 mb-6">
          Tu solicitud no pudo ser aprobada.
        </p>
        
        {motivo && (
          <div className="bg-red-100 rounded-2xl p-4 text-left mb-6">
            <p className="text-lg text-red-800"><strong>Motivo:</strong> {motivo}</p>
          </div>
        )}
        
        <p className="text-lg text-gray-500">Comunícate con nosotros:</p>
        <p className="text-xl font-bold text-red-600 mt-2">600 300 4040</p>
      </div>
    </div>
  );
}

/**
 * Componente principal de registro
 */
export default function RegistrationFlow() {
  const navigate = useNavigate();
  const { user, userData, loading: authLoading } = useAuth();
  const [step, setStep] = useState('register'); // register | waiting | rejected
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });

  // Si ya está logueado y aprobado, ir al home
  useEffect(() => {
    if (!authLoading && user && userData?.estado === 'ACTIVO') {
      navigate('/');
    } else if (!authLoading && user && userData?.estado === 'PENDIENTE') {
      setStep('waiting');
    } else if (!authLoading && user && userData?.estado === 'RECHAZADO') {
      setStep('rejected');
    }
  }, [user, userData, authLoading, navigate]);

  // Validar teléfono chileno
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

    // Validaciones
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
      // 1. Crear usuario anónimo en Auth
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

      // 2. Auto-confirmar email (el trigger lo hace)
      // 3. Crear notificación para admin
      await supabase.from('notificaciones_admin').insert({
        tipo: 'NUEVO_USUARIO',
        titulo: '📝 Nuevo registro pendiente',
        mensaje: `${formData.nombre} - Tel: ${formData.telefono}`,
        usuario_id: authData.user.id
      });

      // 4. Ir a pantalla de espera
      setStep('waiting');
      
    } catch (err) {
      console.error('Error:', err);
      setError('Hubo un problema. Intenta de nuevo o llama al 600 300 4040');
    } finally {
      setLoading(false);
    }
  };

  // Si está esperando aprobación
  if (step === 'waiting') {
    return <PantallaEspera nombre={formData.nombre || userData?.nombre} />;
  }

  // Si fue rechazado
  if (step === 'rejected') {
    return <PantallaRechazado motivo={userData?.motivo_rechazo} />;
  }

  // Formulario de registro
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
            <p className="font-bold">⚠️ {error}</p>
          </div>
        )}

        {/* Campo: Nombre */}
        <div className="mb-6">
          <label 
            htmlFor="nombre" 
            className="block text-xl font-bold text-gray-800 mb-2"
          >
            👤 ¿Cómo te llamas?
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
            placeholder="Escribe tu nombre"
            autoComplete="name"
          />
        </div>

        {/* Campo: Teléfono */}
        <div className="mb-8">
          <label 
            htmlFor="telefono" 
            className="block text-xl font-bold text-gray-800 mb-2"
          >
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
              Registrarme
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>

        {/* Información de ayuda */}
        <div className="p-6 bg-blue-50 m-6 rounded-2xl">
          <p className="text-lg text-blue-800 font-bold mb-2">💡 ¿Necesitas ayuda?</p>
          <p className="text-lg text-blue-700">Llama al <span className="font-bold">600 300 4040</span></p>
        </div>
      </form>
    </div>
  );
}
