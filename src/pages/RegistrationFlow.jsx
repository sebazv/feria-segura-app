/**
 * RegistrationFlow.jsx
 * 
 * Sistema de registro diseñado para usuarios con bajo alfabetismo digital.
 * 
 * CARACTERÍSTICAS DE ACCESIBILIDAD (WCAG 2.1 AAA):
 * - Tamaños de fuente masivos (mínimo 18px)
 * - Alto contraste (fondo blanco, texto oscuro)
 * - Botones grandes con sombras que indican "presionabilidad"
 * - Etiquetas visibles siempre (no placeholders)
 * - Mensajes claros sin jerga técnica
 * - Pantalla de espera tranquilizadora
 * 
 * FLUJO:
 * 1. Registro → Estado PENDIENTE
 * 2. Notificación al admin
 * 3. Pantalla de espera
 * 4. Admin aprueba → Estado ACTIVO
 * 5. Usuario puede usar la app
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Building, Check, Clock, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

/**
 * Pantalla de espera - Reduce ansiedad del usuario
 * Muestra mensaje tranquilizador mientras espera aprobación
 */
function PantallaEspera() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Icono animado de espera */}
      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
      </div>
      
      {/* Título principal */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
        ⏳ Estamos verificando tu información
      </h1>
      
      {/* Explicación clara */}
      <div className="max-w-md text-center">
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          Para tu seguridad, un administrador debe revisar tu solicitud personalmente.
        </p>
        
        <div className="bg-blue-50 rounded-2xl p-6 text-left">
          <p className="text-lg text-blue-800 font-semibold mb-2">
            📋 ¿Qué sigue?
          </p>
          <ul className="text-lg text-blue-700 space-y-2">
            <li>✓ Te notificaremos cuando estés aprobado</li>
            <li>✓ Usually toma solo unos minutos</li>
            <li>✓ Mientras tanto, puedes cerrar esta app</li>
          </ul>
        </div>
      </div>
      
      {/* Información de contacto */}
      <div className="mt-8 text-center">
        <p className="text-lg text-gray-500">
          ¿Tienes dudas?
        </p>
        <p className="text-xl font-bold text-red-600 mt-1">
          600 300 4040
        </p>
      </div>
    </div>
  );
}

/**
 * Pantalla de registro rechazado
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
          Tu solicitud no pudo ser aprobada en este momento.
        </p>
        
        {motivo && (
          <div className="bg-red-100 rounded-2xl p-4 text-left mb-6">
            <p className="text-lg text-red-800">
              <strong>Motivo:</strong> {motivo}
            </p>
          </div>
        )}
        
        <p className="text-lg text-gray-500">
          Comunícate con nosotros para más información:
        </p>
        <p className="text-xl font-bold text-red-600 mt-2">
          600 300 4040
        </p>
      </div>
    </div>
  );
}

/**
 * Componente principal de registro
 */
export default function RegistrationFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // register | waiting | rejected | approved
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    puestoNumero: ''
  });

  // Validar teléfono chileno
  const validarTelefono = (telefono) => {
    const limpio = telefono.replace(/\s/g, '').replace(/[^\d]/g, '');
    return /^(\+?56|0)?9[0-9]{8}$/.test(limpio);
  };

  // Manejar cambio en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Enviar registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa tu nombre completo');
      setLoading(false);
      return;
    }

    if (!validarTelefono(formData.telefono)) {
      setError('Por favor ingresa un número de teléfono válido (9 dígitos)');
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar usuario en Supabase Auth
      const tempEmail = `user_${Date.now()}@feria-segura.app`;
      const tempPassword = `temp_${Math.random().toString(36).substring(7)}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            telefono: formData.telefono,
            puesto_numero: formData.puestoNumero,
            nombre: formData.nombre
          }
        }
      });

      if (authError) throw authError;

      // 2. El trigger ya creó el usuario con estado PENDIENTE
      // 3. Crear notificación para admin
      await supabase.from('notificaciones_admin').insert({
        tipo: 'NUEVO_USUARIO',
        titulo: '📝 Nuevo registro pendiente',
        mensaje: `${formData.nombre} - Puesto: ${formData.puestoNumero} - Tel: ${formData.telefono}`,
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

  // Pantalla de espera
  if (step === 'waiting') {
    return <PantallaEspera />;
  }

  // Pantalla de rechazo
  if (step === 'rejected') {
    return <PantallaRechazado motivo={formData.motivoRechazo} />;
  }

  // Pantalla de éxito
  if (step === 'approved') {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-800 text-center mb-4">
          ✅ ¡Bienvenido a Feria Segura!
        </h1>
        <p className="text-xl text-gray-600 text-center mb-8">
          Tu cuenta ha sido aprobada. Ya puedes usar la app.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-12 rounded-2xl shadow-lg"
        >
          Comenzar
        </button>
      </div>
    );
  }

  // Formulario de registro
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">🛡️ Feria Segura</h1>
        <p className="text-red-100 mt-1">Registro de Usuario</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto">
        
        {/* Error */}
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
            placeholder="Escribe tu nombre completo"
            autoComplete="name"
          />
        </div>

        {/* Campo: Teléfono */}
        <div className="mb-6">
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
            placeholder="Ej: 9 1234 5678"
            autoComplete="tel"
          />
          <p className="text-sm text-gray-500 mt-1">
            Necesitamos 9 dígitos (ej: 912345678)
          </p>
        </div>

        {/* Campo: Puesto */}
        <div className="mb-8">
          <label 
            htmlFor="puestoNumero" 
            className="block text-xl font-bold text-gray-800 mb-2"
          >
            🏪 ¿Cuál es tu número de puesto?
          </label>
          <input
            id="puestoNumero"
            name="puestoNumero"
            type="text"
            value={formData.puestoNumero}
            onChange={handleChange}
            className="w-full text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
            placeholder="Ej: 45"
            autoComplete="off"
          />
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
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>

        {/* Enlace a login */}
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
        <p className="text-lg text-blue-800 font-bold mb-2">
          💡 ¿Necesitas ayuda?
        </p>
        <p className="text-lg text-blue-700">
          Llama al <span className="font-bold">600 300 4040</span>
        </p>
      </div>
    </div>
  );
}
