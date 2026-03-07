import { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Download, Share2, Shield, Bell, User, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function SettingsPage() {
    const [userData, setUserData] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            const data = JSON.parse(savedUserData);
            setUser({ id: savedUserId });
            setUserData({ id: savedUserId, ...data });
            setDarkMode(data.modo_oscuro || false);
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleSaveDarkMode = async () => {
        setSaving(true);
        try {
            await supabase.from('usuarios').update({ modo_oscuro: darkMode }).eq('id', user.id);
            const updatedData = { ...userData, modo_oscuro: darkMode };
            localStorage.setItem('feria_user_data', JSON.stringify(updatedData));
            setUserData(updatedData);
            alert('Configuración guardada');
        } catch (err) {
            console.error(err);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const [userDataQ, alertsQ, contactsQ] = await Promise.all([
                supabase.from('usuarios').select('*').eq('id', user.id).single(),
                supabase.from('alertas').select('*').eq('user_id', user.id),
                supabase.from('contactos_emergencia').select('*').eq('usuario_id', user.id)
            ]);

            const exportData = {
                usuario: userDataQ.data,
                alertas: alertsQ.data || [],
                contactos_emergencia: contactsQ.data || [],
                fecha_exportacion: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mis_datos_feria_segura_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            alert('Datos exportados');
        } catch (err) {
            console.error(err);
            alert('Error al exportar');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white">Configuración</h1>
            </div>

            {/* Dark Mode */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="text-purple-400" size={24} /> : <Sun className="text-yellow-400" size={24} />}
                        <div>
                            <p className="font-bold text-white">Modo Oscuro</p>
                            <p className="text-sm text-slate-400">Cambiar tema de la app</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setDarkMode(!darkMode); handleSaveDarkMode(); }}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${darkMode ? 'bg-purple-600' : 'bg-slate-600'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <Bell className="text-blue-400" size={24} />
                    <div className="flex-1">
                        <p className="font-bold text-white">Notificaciones Push</p>
                        <p className="text-sm text-slate-400">Recibir alertas de emergencia</p>
                    </div>
                    <span className="text-sm text-slate-500">Próximamente</span>
                </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <Shield className="text-red-400" size={24} />
                    <div className="flex-1">
                        <p className="font-bold text-white">Contactos de Emergencia</p>
                        <p className="text-sm text-slate-400">Administrar contactos a notificar</p>
                    </div>
                </div>
            </div>

            {/* Export Data */}
            <button onClick={handleExportData} className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <Download className="text-green-400" size={24} />
                    <div className="text-left">
                        <p className="font-bold text-white">Exportar Mis Datos</p>
                        <p className="text-sm text-slate-400">Descargar todos tus datos (GDPR)</p>
                    </div>
                </div>
            </button>

            {/* Share App */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <Share2 className="text-blue-400" size={24} />
                    <div className="flex-1">
                        <p className="font-bold text-white">Invitar Feriantes</p>
                        <p className="text-sm text-slate-400">Compartir app con otros comerciantes</p>
                    </div>
                    <span className="text-sm text-slate-500">Próximamente</span>
                </div>
            </div>

            <p className="text-center text-slate-500 text-xs mt-6">Feria Segura v1.1.0</p>
        </div>
    );
}
