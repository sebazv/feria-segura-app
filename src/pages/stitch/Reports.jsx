import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Download, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function ReportsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            try {
                setUserData(JSON.parse(savedUserData));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            // Get users
            const { data: usersData } = await supabase
                .from('usuarios')
                .select('*')
                .neq('estado', 'ELIMINADO')
                .order('created_at', { ascending: false });
            
            if (usersData) {
                setUsers(usersData);
                
                // Calculate stats
                const activos = usersData.filter(u => u.estado === 'ACTIVO').length;
                const pendientes = usersData.filter(u => u.estado === 'PENDIENTE').length;
                const admins = usersData.filter(u => u.role === 'admin').length;
                const conAlertas = usersData.filter(u => (u.alertas_enviadas || 0) > 0).length;
                
                setStats({
                    total: usersData.length,
                    activos,
                    pendientes,
                    admins,
                    conAlertas
                });
            }
            
            // Get alerts
            const { data: alertsData } = await supabase
                .from('alertas')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (alertsData) {
                setAlerts(alertsData);
            }
            
            setLoading(false);
        };
        
        loadData();
    }, []);

    // Export to CSV
    const exportUsersCSV = () => {
        const headers = ['Nombre', 'Teléfono', 'Estado', 'Rol', 'Alertas Enviadas', 'Puntos', 'Último Acceso', 'Fecha Registro'];
        const rows = users.map(u => [
            u.nombre || '',
            u.telefono || '',
            u.estado || '',
            u.role || 'feriante',
            u.alertas_enviadas || 0,
            u.puntos || 0,
            u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleDateString() : 'Nunca',
            new Date(u.created_at).toLocaleDateString()
        ]);
        
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const exportAlertsCSV = () => {
        const headers = ['Tipo', 'Usuario', 'Teléfono', 'Estado', 'Latitud', 'Longitud', 'Fecha'];
        const rows = alerts.map(a => [
            a.tipo,
            a.user_name || '',
            a.user_phone || '',
            a.status,
            a.lat,
            a.lng,
            new Date(a.created_at).toLocaleString()
        ]);
        
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_alertas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (!userData?.role || userData.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">Acceso Restringido</h2>
                    <p className="text-gray-500 mt-2">Solo administradores pueden ver reportes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 size={24} />
                Reportes
            </h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-500">Total Usuarios</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.total || 0}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-500">Activos</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.activos || 0}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-gray-500">Pendientes</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendientes || 0}</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-500">Total Alertas</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{alerts.length || 0}</p>
                </div>
            </div>
            
            {/* Users Report */}
            <div className="bg-white rounded-xl shadow-md mb-6">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">👥 Usuarios Inscritos</h2>
                    <button 
                        onClick={exportUsersCSV}
                        className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg"
                    >
                        <Download size={16} />
                        Exportar CSV
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Nombre</th>
                                <th className="p-3 text-left">Teléfono</th>
                                <th className="p-3 text-left">Estado</th>
                                <th className="p-3 text-left">Rol</th>
                                <th className="p-3 text-right">Alertas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-t">
                                    <td className="p-3">{u.nombre || '-'}</td>
                                    <td className="p-3">{u.telefono || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            u.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 
                                            u.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {u.estado}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {u.role === 'admin' ? '👑 Admin' : 'Feriante'}
                                    </td>
                                    <td className="p-3 text-right font-medium">{u.alertas_enviadas || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Alerts Report */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">🚨 Alertas</h2>
                    <button 
                        onClick={exportAlertsCSV}
                        className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg"
                    >
                        <Download size={16} />
                        Exportar CSV
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-left">Usuario</th>
                                <th className="p-3 text-left">Estado</th>
                                <th className="p-3 text-right">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map(a => (
                                <tr key={a.id} className="border-t">
                                    <td className="p-3">
                                        {a.tipo === 'insecurity' ? '🛡️ Inseguridad' : '🏥 Médica'}
                                    </td>
                                    <td className="p-3">{a.user_name || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            a.status === 'active' ? 'bg-red-100 text-red-700' : 
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {a.status === 'active' ? 'Activa' : 'Resuelta'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-gray-500">
                                        {new Date(a.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
