import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Plus, Trash2, User, Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function EmergencyContacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newContact, setNewContact] = useState({ nombre: '', telefono: '', parentesco: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        setUser({ id: savedUserId });
        if (savedUserId) {
            loadContacts(savedUserId);
        }
    }, []);

    const loadContacts = async (userId) => {
        const { data } = await supabase
            .from('contactos_emergencia')
            .select('*')
            .eq('usuario_id', userId);
        
        if (data) setContacts(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!newContact.nombre || !newContact.telefono) {
            alert('Nombre y teléfono son obligatorios');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('contactos_emergencia')
                .insert({
                    usuario_id: user.id,
                    nombre: newContact.nombre,
                    telefono: newContact.telefono,
                    parentesco: newContact.parentesco
                });

            if (error) throw error;
            
            await loadContacts(user.id);
            setShowAdd(false);
            setNewContact({ nombre: '', telefono: '', parentesco: '' });
            alert('Contacto guardado');
        } catch (err) {
            console.error(err);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar contacto?')) return;
        
        try {
            await supabase.from('contactos_emergencia').delete().eq('id', id);
            setContacts(contacts.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
            alert('Error al eliminar');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 p-4">
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white">Contactos de Emergencia</h1>
            </div>

            {/* Info */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-blue-300">
                    Estos contactos serán notificados automáticamente cuando envíes una alerta de emergencia.
                </p>
            </div>

            {/* Contact List */}
            {contacts.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No hay contactos de emergencia</p>
                    <p className="text-sm text-slate-500">Agrega al menos uno</p>
                </div>
            ) : (
                <div className="space-y-3 mb-4">
                    {contacts.map(contact => (
                        <div key={contact.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                <User className="text-red-400" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white">{contact.nombre}</p>
                                <p className="text-sm text-slate-400">{contact.parentesco || 'Familiar'}</p>
                                <p className="text-sm text-slate-300 flex items-center gap-1">
                                    <Phone size={14} /> {contact.telefono}
                                </p>
                            </div>
                            <button onClick={() => handleDelete(contact.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Button / Form */}
            {showAdd ? (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <h3 className="font-bold text-white mb-4">Nuevo Contacto</h3>
                    
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={newContact.nombre}
                            onChange={(e) => setNewContact({...newContact, nombre: e.target.value})}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                        />
                        
                        <input
                            type="tel"
                            placeholder="Teléfono"
                            value={newContact.telefono}
                            onChange={(e) => setNewContact({...newContact, telefono: e.target.value})}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                        />
                        
                        <input
                            type="text"
                            placeholder="Parentesco (ej: Esposa, Hijo)"
                            value={newContact.parentesco}
                            onChange={(e) => setNewContact({...newContact, parentesco: e.target.value})}
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500"
                        />
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/10 text-white py-3 rounded-xl font-medium">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowAdd(true)} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                    <Plus size={24} /> Agregar Contacto
                </button>
            )}
        </div>
    );
}
