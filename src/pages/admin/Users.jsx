/**
 * AdminUsers.jsx
 * Panel de administración de usuarios con aprobar/eliminar
 */

import { useState, useEffect } from 'react';
import { Users, Check, Search, Loader, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function AdminUsers() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setUsuarios(data);
        }
        setLoading(false);
    };

    const aprobarUsuario = async (userId) => {
        await supabase
            .from('usuarios')
            .update({ estado: 'ACTIVO' })
            .eq('id', userId);
        
        // Enviar notificación
        const usuario = usuarios.find(u => u.id === userId);
        if (usuario) {
            await supabase.from('notificaciones_admin').insert({
                tipo: 'USUARIO_APROBADO',
                titulo: '✅ Usuario aprobado',
                mensaje: `${usuario.nombre} ha sido aprobado`,
                usuario_id: userId
            });
        }
        
        setUsuarios(prev => 
            prev.map(u => u.id === userId ? { ...u, estado: 'ACTIVO' } : u)
        );
    };

    const eliminarUsuario = async (userId) => {
        try {
            // 1. Eliminar de auth.users ( hace cascade a usuarios)
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            
            if (authError) throw authError;
            
            setUsuarios(prev => prev.filter(u => u.id !== userId));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Error eliminando usuario:', err);
            alert('Error al eliminar usuario');
        }
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'ACTIVO':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Activo</span>;
            case 'PENDIENTE':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Pendiente</span>;
            case 'RECHAZADO':
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">✗ Rechazado</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{estado}</span>;
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const matchesSearch = !search || 
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            u.telefono?.includes(search);
        
        const matchesEstado = filtroEstado === 'todos' || u.estado === filtroEstado;
        
        return matchesSearch && matchesEstado;
    });

    const pendientes = usuarios.filter(u => u.estado === 'PENDIENTE').length;

    if (loading) {
        return (
            <div className="p-4 pb-24 bg-gray-50 min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-screen">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users size={24} />
                    Usuarios
                    {pendientes > 0 && (
                        <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded-full">
                            {pendientes} pendientes
                        </span>
                    )}
                </h1>
            </header>

            {/* Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-md mb-4">
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {['todos', 'PENDIENTE', 'ACTIVO', 'RECHAZADO'].map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFiltroEstado(estado)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                    filtroEstado === estado 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {estado === 'todos' ? 'Todos' : estado}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista de usuarios */}
            <div className="space-y-3">
                {usuariosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No se encontraron usuarios</p>
                    </div>
                ) : (
                    usuariosFiltrados.map((usuario) => (
                        <div 
                            key={usuario.id} 
                            className="bg-white rounded-xl p-4 shadow-md"
                        >
                            {/* Confirmación de eliminación */}
                            {showDeleteConfirm === usuario.id && (
                                <div className="mb-4 p-4 bg-red-50 rounded-xl border-2 border-red-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="text-red-600" size={20} />
                                        <p className="font-bold text-red-800">¿Confirmar eliminación?</p>
                                    </div>
                                    <p className="text-sm text-red-700 mb-3">
                                        Esta acción no se puede deshacer. El usuario perderá acceso permanentemente.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => eliminarUsuario(usuario.id)}
                                            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold"
                                        >
                                            Sí, eliminar
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(null)}
                                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800">
                                            {usuario.nombre || 'Sin nombre'}
                                        </h3>
                                        {getEstadoBadge(usuario.estado)}
                                    </div>
                                    <p className="text-gray-500 text-sm">📱 {usuario.telefono || 'Sin teléfono'}</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Registrado: {new Date(usuario.created_at).toLocaleDateString('es-CL')}
                                    </p>
                                </div>
                                
                                {/* Botones de acción */}
                                <div className="flex gap-2">
                                    {usuario.estado === 'PENDIENTE' && (
                                        <button
                                            onClick={() => aprobarUsuario(usuario.id)}
                                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg"
                                            title="Aprobar"
                                        >
                                            <Check size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowDeleteConfirm(usuario.id)}
                                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
                    <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-yellow-100 rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-yellow-700">{pendientes}</p>
                    <p className="text-xs text-yellow-600">Pendientes</p>
                </div>
                <div className="bg-green-100 rounded-xl p-3 shadow-md text-center">
                    <p className="text-2xl font-bold text-green-700">{usuarios.filter(u => u.estado === 'ACTIVO').length}</p>
                    <p className="text-xs text-green-600">Activos</p>
                </div>
            </div>
        </div>
    );
}
