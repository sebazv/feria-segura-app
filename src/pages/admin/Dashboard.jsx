import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Plus, Users, BarChart3, Settings, MapPin, Clock, AlertTriangle, Download, Loader } from 'lucide-react';
import { getAlertStats, exportAlertsToCSV } from '../../lib/alerts';
import { useAuth } from '../../App';

export default function AdminDashboard() {
    const { userData } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const result = await getAlertStats();
                if (result.success) {
                    setStats(result.stats);
                }
            } catch (err) {
                console.error('Error loading stats:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const handleExport = async () => {
        setExporting(true);
        try {
            const result = await exportAlertsToCSV();
            if (result.success) {
                // Create and download CSV
                const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `alertas_feria_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
            }
        } catch (err) {
            alert('Error al exportar');
        } finally {
            setExporting(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value || 0}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    Panel de Administración
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Feria Segura — Admin
                </p>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard 
                    icon={AlertTriangle} 
                    label="Alertas Hoy" 
                    value={stats?.today} 
                    color="text-red-600" 
                    bgColor="bg-red-100 dark:bg-red-900/30" 
                />
                <StatCard 
                    icon={ShieldAlert} 
                    label="Inseguridad" 
                    value={stats?.insecurity} 
                    color="text-red-600" 
                    bgColor="bg-red-100 dark:bg-red-900/30" 
                />
                <StatCard 
                    icon={Plus} 
                    label="Emerg. Médicas" 
                    value={stats?.medical} 
                    color="text-blue-600" 
                    bgColor="bg-blue-100 dark:bg-blue-900/30" 
                />
                <StatCard 
                    icon={Users} 
                    label="Total" 
                    value={stats?.total} 
                    color="text-green-600" 
                    bgColor="bg-green-100 dark:bg-green-900/30" 
                />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <Link 
                    to="/admin/alerts"
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                    <AlertTriangle size={20} />
                    Ver Alertas
                </Link>
                <Link 
                    to="/admin/map"
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                    <MapPin size={20} />
                    Mapa en Vivo
                </Link>
                <Link 
                    to="/admin/users"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                    <Users size={20} />
                    Usuarios
                </Link>
                <button 
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                    <Download size={20} />
                    {exporting ? 'Exportando...' : 'Exportar Excel'}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Estadísticas por Mes</h2>
                <div className="space-y-2">
                    {stats?.porMes && Object.entries(stats.porMes).sort().reverse().slice(0, 6).map(([mes, cantidad]) => (
                        <div key={mes} className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300">{mes}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-red-500 rounded-full" 
                                        style={{ width: `${Math.min(100, (cantidad / (stats.total || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-800 dark:text-white w-8 text-right">{cantidad}</span>
                            </div>
                        </div>
                    ))}
                    {(!stats?.porMes || Object.keys(stats.porMes).length === 0) && (
                        <p className="text-gray-400 text-sm">No hay datos disponibles</p>
                    )}
                </div>
            </div>
        </div>
    );
}
