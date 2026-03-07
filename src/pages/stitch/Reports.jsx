import { useState, useEffect } from 'react';
import { ArrowLeft, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Download, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function ReportsPage() {
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
            const { data: usersData } = await supabase
                .from('usuarios')
                .select('*')
                .neq('estado', 'ELIMINADO')
                .order('created_at', { ascending: false });
            
            if (usersData) {
                setUsers(usersData);
                const activos = usersData.filter(u => u.estado === 'ACTIVO').length;
                const pendientes = usersData.filter(u => u.estado === 'PENDIENTE').length;
                const admins = usersData.filter(u => u.role === 'admin').length;
                const conAlertas = usersData.filter(u => (u.alertas_enviadas || 0) > 0).length;
                
                setStats({ total: usersData.length, activos, pendientes, admins, conAlertas });
            }
            
            const { data: alertsData } = await supabase
                .from('alertas')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            
            if (alertsData) setAlerts(alertsData);
            setLoading(false);
        };
        
        loadData();
    }, []);

    const exportUsersCSV = () => {
        const headers = ['Nombre', 'Teléfono', 'Estado', 'Rol', 'Alertas Enviadas', 'Fecha Registro'];
        const rows = users.map(u => [
            u.nombre || '',
            u.telefono || '',
            u.estado || '',
            u.role || 'feriante',
            u.alertas_enviadas || 0,
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
        const headers = ['Tipo', 'Usuario', 'Estado', 'Fecha'];
        const rows = alerts.map(a => [
            a.tipo,
            a.user_name || '',
            a.status,
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">Acceso Restringido</h2>
                    <p className="text-slate-400 mt-2">Solo administradores pueden ver reportes</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 size={24} />
                    Reportes
                </h1>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-slate-400">Total Usuarios</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total || 0}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm text-slate-400">Activos</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{stats.activos || 0}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-slate-400">Pendientes</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">{stats.pendientes || 0}</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-slate-400">Total Alertas</span>
                    </div>
                    <p className="text-3xl font-bold text-red-400">{alerts.length || 0}</p>
                </div>
            </div>
            
            {/* Users Report */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl mb-6 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold text-white">👥 Usuarios</h2>
                    <button onClick={exportUsersCSV} className="flex items-center gap-2 text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">
                        <Download size={16} />
                        CSV
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="p-3 text-left text-slate-400">Nombre</th>
                                <th className="p-3 text-left text-slate-400">Teléfono</th>
                                <th className="p-3 text-left text-slate-400">Estado</th>
                                <th className="p-3 text-right text-slate-400">Alertas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-t border-white/10">
                                    <td className="p-3 text-white">{u.nombre || '-'}</td>
                                    <td className="p-3 text-slate-300">{u.telefono || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            u.estado === 'ACTIVO' ? 'bg-emerald-500/20 text-emerald-400' : 
                                            u.estado === 'PENDIENTE' ? 'bg-yellow-500/20 text-yellow-400' : 
                                            'bg-slate-500/20 text-slate-400'
                                        }`}>
                                            {u.estado}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-white font-medium">{u.alertas_enviadas || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Alerts Report */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-bold text-white">🚨 Alertas</h2>
                    <button onClick={exportAlertsCSV} className="flex items-center gap-2 text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">
                        <Download size={16} />
                        CSV
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="p-3 text-left text-slate-400">Tipo</th>
                                <th className="p-3 text-left text-slate-400">Usuario</th>
                                <th className="p-3 text-left text-slate-400">Estado</th>
                                <th className="p-3 text-right text-slate-400">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map(a => (
                                <tr key={a.id} className="border-t border-white/10">
                                    <td className="p-3">
                                        {a.tipo === 'insecurity' ? '🛡️ Inseguridad' : '🏥 Médica'}
                                    </td>
                                    <td className="p-3 text-white">{a.user_name || '-'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            a.status === 'active' ? 'bg-red-500/20 text-red-400' : 
                                            'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {a.status === 'active' ? 'Activa' : 'Resuelta'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-slate-400">
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
