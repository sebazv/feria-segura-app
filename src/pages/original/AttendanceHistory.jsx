import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, CheckCircle, Clock, X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

export default function AttendanceHistoryPage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, puntos: 0 });

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            const data = JSON.parse(savedUserData);
            setUser({ id: savedUserId });
            loadAttendance(savedUserId, data);
        }
    }, []);

    const loadAttendance = async (userId, userData) => {
        const { data } = await supabase
            .from('asistencia')
            .select('*')
            .eq('usuario_id', userId)
            .order('fecha', { ascending: false })
            .limit(30);
        
        if (data) {
            setAttendance(data);
            
            // Calculate stats
            const now = new Date();
            const thisMonth = data.filter(a => {
                const d = new Date(a.fecha);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length;
            
            setStats({
                total: data.length,
                thisMonth,
                puntos: userData?.puntos || 0
            });
        }
        setLoading(false);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', { 
            weekday: 'short', day: 'numeric', month: 'short' 
        });
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleTimeString('es-CL', { 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    const exportCSV = () => {
        const headers = ['Fecha', 'Hora', 'Estado', 'Latitud', 'Longitud'];
        const rows = attendance.map(a => [
            a.fecha,
            formatTime(a.hora_llegada),
            a.estado,
            a.lat,
            a.lng
        ]);
        
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi_asistencia_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Group by month
    const grouped = {};
    attendance.forEach(a => {
        const month = new Date(a.fecha).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        if (!grouped[month]) grouped[month] = [];
        grouped[month].push(a);
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white">📅 Mi Asistencia</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-slate-400">Total Días</p>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats.thisMonth}</p>
                    <p className="text-xs text-emerald-300">Este Mes</p>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{stats.puntos}</p>
                    <p className="text-xs text-amber-300">Puntos</p>
                </div>
            </div>

            {/* Export Button */}
            {attendance.length > 0 && (
                <button 
                    onClick={exportCSV}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center justify-center gap-2 mb-4"
                >
                    <Download size={18} className="text-slate-400" />
                    <span className="text-white text-sm">Exportar a CSV</span>
                </button>
            )}

            {/* Attendance List */}
            {attendance.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No hay registros de asistencia</p>
                    <p className="text-sm text-slate-500">Registra tu primera asistencia</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([month, records]) => (
                        <div key={month}>
                            <h3 className="text-slate-400 text-sm font-medium mb-2 capitalize">{month}</h3>
                            <div className="space-y-2">
                                {records.map((record) => (
                                    <div 
                                        key={record.id} 
                                        className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="text-emerald-400" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{formatDate(record.fecha)}</p>
                                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                                <Clock size={14} />
                                                {formatTime(record.hora_llegada)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs">
                                                {record.estado}
                                            </span>
                                            {record.precision_gps && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    ±{Math.round(record.precision_gps)}m
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
