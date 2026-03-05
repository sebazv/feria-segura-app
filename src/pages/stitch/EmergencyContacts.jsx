import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, User, Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function EmergencyContacts({ userId, onClose }) {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newContact, setNewContact] = useState({ nombre: '', telefono: '', parentesco: '' });

    useEffect(() => {
        loadContacts();
    }, [userId]);

    const loadContacts = async () => {
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
                    usuario_id: userId,
                    nombre: newContact.nombre,
                    telefono: newContact.telefono,
                    parentesco: newContact.parentesco
                });

            if (error) throw error;
            
            await loadContacts();
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
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Contactos de Emergencia</h1>
                <button onClick={onClose} className="p-2 bg-gray-200 rounded-lg">
                    <X size={20} />
                </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-blue-700">
                    Estos contactos serán notificados automáticamente cuando envíes una alerta de emergencia.
                </p>
            </div>

            {/* Contact List */}
            {contacts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay contactos de emergencia</p>
                    <p className="text-sm text-gray-400">Agrega al menos uno</p>
                </div>
            ) : (
                <div className="space-y-3 mb-4">
                    {contacts.map(contact => (
                        <div key={contact.id} className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <User className="text-red-600" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">{contact.nombre}</p>
                                <p className="text-sm text-gray-500">{contact.parentesco || 'Familiar'}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Phone size={14} /> {contact.telefono}
                                </p>
                            </div>
                            <button onClick={() => handleDelete(contact.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Button / Form */}
            {showAdd ? (
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <h3 className="font-bold text-gray-800 mb-4">Nuevo Contacto</h3>
                    
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={newContact.nombre}
                            onChange={(e) => setNewContact({...newContact, nombre: e.target.value})}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl"
                        />
                        
                        <input
                            type="tel"
                            placeholder="Teléfono"
                            value={newContact.telefono}
                            onChange={(e) => setNewContact({...newContact, telefono: e.target.value})}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl"
                        />
                        
                        <input
                            type="text"
                            placeholder="Parentesco (ej: Esposa, Hijo, Hermano)"
                            value={newContact.parentesco}
                            onChange={(e) => setNewContact({...newContact, parentesco: e.target.value})}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl"
                        />
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium disabled:bg-gray-300">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowAdd(true)} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Plus size={24} /> Agregar Contacto de Emergencia
                </button>
            )}
        </div>
    );
}
