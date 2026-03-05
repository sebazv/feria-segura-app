import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trash2, AlertTriangle, Edit2, Check, X, Phone, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Edit mode
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    
    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // Phone verification
    const [showVerifyPhone, setShowVerifyPhone] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const savedUserId = localStorage.getItem('feria_user_id');
            const savedUserData = localStorage.getItem('feria_user_data');
            
            if (savedUserId && savedUserData) {
                try {
                    const data = JSON.parse(savedUserData);
                    setUser({ id: savedUserId });
                    setUserData({ id: savedUserId, ...data });
                    setEditData({ id: savedUserId, ...data });
                } catch (e) {
                    console.error('Error:', e);
                }
            }
            setLoading(false);
        };
        
        loadUser();
    }, []);

    const isAdmin = userData?.role === 'admin';

    // Generate random verification code
    const generateCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Send verification code (simulated - in production use Twilio/WhatsApp API)
    const handleSendVerificationCode = async () => {
        if (!userData?.telefono) {
            setPhoneError('No hay teléfono registrado');
            return;
        }
        
        setSendingCode(true);
        setPhoneError('');
        
        try {
            const code = generateCode();
            
            // Save code to database
            await supabase
                .from('phone_verifications')
                .insert({
                    telefono: userData.telefono,
                    codigo: code,
                    verificado: false
                });
            
            // In production, send via Twilio/WhatsApp API here
            // For now, show the code (in production, never show this)
            alert(`🔐 Tu código de verificación es: ${code}\n\nEn producción, esto se enviará por SMS o WhatsApp.`);
            
            setShowVerifyPhone(true);
        } catch (err) {
            console.error('Error:', err);
            setPhoneError('Error al enviar código');
        } finally {
            setSendingCode(false);
        }
    };

    // Verify code
    const handleVerifyCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setPhoneError('Ingresa el código de 6 dígitos');
            return;
        }
        
        setVerifying(true);
        setPhoneError('');
        
        try {
            // Find matching verification
            const { data } = await supabase
                .from('phone_verifications')
                .select('*')
                .eq('telefono', userData.telefono)
                .eq('codigo', verificationCode)
                .eq('verificado', false)
                .gte('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (data) {
                // Mark as verified
                await supabase
                    .from('phone_verifications')
                    .update({ verificado: true })
                    .eq('id', data.id);
                
                // Update user as verified
                await supabase
                    .from('usuarios')
                    .update({ telefono_verificado: true })
                    .eq('id', user.id);
                
                alert('✅ Teléfono verificado correctamente');
                setShowVerifyPhone(false);
                setVerificationCode('');
                
                // Refresh local data
                const updatedData = { ...userData, telefono_verificado: true };
                localStorage.setItem('feria_user_data', JSON.stringify(updatedData));
                setUserData(updatedData);
            } else {
                setPhoneError('Código inválido o expirado');
            }
        } catch (err) {
            console.error('Error:', err);
            setPhoneError('Error al verificar');
        } finally {
            setVerifying(false);
        }
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        setSaving(true);
        
        try {
            const { error } = await supabase
                .from('usuarios')
                .update({
                    nombre: editData.nombre,
                    puesto_numero: editData.puesto_numero,
                    // telefono NO se puede editar desde aquí
                })
                .eq('id', user.id);
            
            if (error) throw error;
            
            // Update local storage
            localStorage.setItem('feria_user_data', JSON.stringify(editData));
            setUserData(editData);
            setEditing(false);
            alert('✅ Perfil actualizado');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        setDeleting(true);
        
        try {
            await supabase
                .from('usuarios')
                .update({ estado: 'ELIMINADO' })
                .eq('id', user.id);
            
            // Clear local storage
            localStorage.removeItem('feria_user_id');
            localStorage.removeItem('feria_user_data');
            
            // Redirect
            window.location.href = '/';
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar cuenta');
        } finally {
            setDeleting(false);
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('feria_user_id');
        localStorage.removeItem('feria_user_data');
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Pantalla de verificación de teléfono
    if (showVerifyPhone) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">📱 Verificar Teléfono</h1>
                    
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <p className="text-gray-600 mb-4">
                            Ingresa el código de 6 dígitos que te enviamos al {userData?.telefono}
                        </p>
                        
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full text-2xl text-center p-4 border-2 border-gray-300 rounded-xl mb-4"
                            maxLength={6}
                        />
                        
                        {phoneError && (
                            <p className="text-red-600 text-sm mb-4">{phoneError}</p>
                        )}
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowVerifyPhone(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleVerifyCode}
                                disabled={verifying || verificationCode.length !== 6}
                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium disabled:bg-gray-300"
                            >
                                {verifying ? 'Verificando...' : 'Verificar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">👤 Mi Perfil</h1>
            
            {/* Profile Card */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {editing ? editData.nombre : userData?.nombre}
                        </h2>
                        <p className="text-gray-500">{userData?.email}</p>
                    </div>
                    <button
                        onClick={() => editing ? setEditing(false) : setEditData(userData)}
                        className="ml-auto p-2 bg-gray-100 rounded-lg"
                    >
                        {editing ? <X size={20} /> : <Edit2 size={20} />}
                    </button>
                </div>
                
                {/* Datos editables */}
                <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editData.nombre || ''}
                                onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                            />
                        ) : (
                            <p className="text-gray-800">{userData?.nombre || 'Sin nombre'}</p>
                        )}
                    </div>
                    
                    {/* Teléfono - NO editable por usuario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono 📱
                            {userData?.telefono_verificado && <span className="text-green-600 ml-2">✓ Verificado</span>}
                        </label>
                        <div className="flex items-center gap-2">
                            <p className="text-gray-800 flex-1">{userData?.telefono}</p>
                            {!userData?.telefono_verificado && (
                                <button
                                    onClick={handleSendVerificationCode}
                                    disabled={sendingCode}
                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg"
                                >
                                    {sendingCode ? 'Enviando...' : 'Verificar'}
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Para cambiar el teléfono, contacta al administrador
                        </p>
                    </div>
                    
                    {/* Puesto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Puesto</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editData.puesto_numero || ''}
                                onChange={(e) => setEditData({...editData, puesto_numero: e.target.value})}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                            />
                        ) : (
                            <p className="text-gray-800">{userData?.puesto_numero || 'No asignado'}</p>
                        )}
                    </div>
                </div>
                
                {/* Save button */}
                {editing && (
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setEditing(false)}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium disabled:bg-gray-300"
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-xl p-4 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800">{userData?.alertas_enviadas || 0}</p>
                    <p className="text-xs text-gray-500">Alertas</p>
                </div>
                <div className="bg-yellow-100 rounded-xl p-4 shadow-md text-center">
                    <p className="text-2xl font-bold text-yellow-700">{userData?.puntos || 0}</p>
                    <p className="text-xs text-yellow-600">Puntos</p>
                </div>
                <div className="bg-green-100 rounded-xl p-4 shadow-md text-center">
                    <p className="text-2xl font-bold text-green-700">{userData?.alertas_resueltas || 0}</p>
                    <p className="text-xs text-green-600">Resueltas</p>
                </div>
            </div>
            
            {/* Menú de opciones */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-800">Historial</span>
                </button>
                
                {isAdmin && (
                    <>
                        <button onClick={() => navigate('/users')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100">
                            <User className="w-5 h-5 text-purple-600" />
                            <span className="text-gray-800">Gestionar Usuarios</span>
                        </button>
                        <button onClick={() => navigate('/admin/notifications')} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100">
                            <Bell className="w-5 h-5 text-purple-600" />
                            <span className="text-gray-800">Notificaciones</span>
                        </button>
                    </>
                )}
                
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-red-600">
                    <X className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
            
            {/* Delete Account */}
            <div className="mt-6">
                {showDeleteConfirm ? (
                    <div className="bg-red-50 rounded-xl p-4 border-2 border-red-300">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="text-red-600" size={20} />
                            <p className="font-bold text-red-800">¿Eliminar tu cuenta?</p>
                        </div>
                        <p className="text-sm text-red-700 mb-3">
                            Perderás acceso a la app. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold"
                            >
                                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl font-medium"
                    >
                        <Trash2 size={20} />
                        Eliminar mi cuenta
                    </button>
                )}
            </div>
            
            <p className="text-center text-gray-400 text-xs mt-6">Feria Segura v1.0.0</p>
        </div>
    );
}
