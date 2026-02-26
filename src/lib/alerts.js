import { supabase } from './supabase/client';

// Enviar alerta de emergencia
export const sendAlert = async ({ 
    tipo, // 'insecurity' | 'medical'
    lat, 
    lng, 
    userId, 
    userName,
    userPhone,
    puestoNumero,
    accuracy 
}) => {
    try {
        const alerta = {
            tipo,
            lat,
            lng,
            accuracy,
            user_id: userId,
            user_name: userName,
            user_phone: userPhone,
            puesto_numero: puestoNumero,
            status: 'active',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('alertas')
            .insert(alerta)
            .select()
            .single();

        if (error) throw error;
        
        return { success: true, id: data.id };
    } catch (error) {
        console.error('Error enviando alerta:', error);
        return { success: false, error: error.message };
    }
};

// Obtener alertas del usuario
export const getUserAlerts = async (userId, limitCount = 50) => {
    try {
        const { data, error } = await supabase
            .from('alertas')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limitCount);

        if (error) throw error;

        return { success: true, alertas: data || [] };
    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        return { success: false, error: error.message, alertas: [] };
    }
};

// Obtener todas las alertas (para admin)
export const getAllAlerts = async (status = null, limitCount = 100) => {
    try {
        let query = supabase
            .from('alertas')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limitCount);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, alertas: data || [] };
    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        return { success: false, error: error.message, alertas: [] };
    }
};

// Resolver/cancelar alerta
export const resolveAlert = async (alertId, userId) => {
    try {
        const { error } = await supabase
            .from('alertas')
            .update({ 
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                resolved_by: userId
            })
            .eq('id', alertId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Obtener estadísticas de alertas
export const getAlertStats = async () => {
    try {
        const allAlerts = await getAllAlerts(null, 1000);
        
        if (!allAlerts.success) return allAlerts;

        const alertas = allAlerts.alertas;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const stats = {
            total: alertas.length,
            today: alertas.filter(a => new Date(a.created_at) >= today).length,
            insecurity: alertas.filter(a => a.tipo === 'insecurity').length,
            medical: alertas.filter(a => a.tipo === 'medical').length,
            active: alertas.filter(a => a.status === 'active').length,
            resolved: alertas.filter(a => a.status === 'resolved').length,
            porMes: {},
            porDiaSemana: [0, 0, 0, 0, 0, 0, 0]
        };

        alertas.forEach(alert => {
            const fecha = new Date(alert.created_at);
            const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            stats.porMes[mesKey] = (stats.porMes[mesKey] || 0) + 1;
            stats.porDiaSemana[fecha.getDay()]++;
        });

        return { success: true, stats };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Exportar alertas a formato Excel (CSV)
export const exportAlertsToCSV = async () => {
    try {
        const allAlerts = await getAllAlerts(null, 10000);
        
        if (!allAlerts.success) return allAlerts;

        const headers = ['ID', 'Tipo', 'Estado', 'Fecha', 'Latitud', 'Longitud', 'Usuario', 'Teléfono', 'Puesto'];
        const rows = allAlerts.alertas.map(alert => [
            alert.id,
            alert.tipo === 'insecurity' ? 'Inseguridad' : 'Emergencia Médica',
            alert.status,
            new Date(alert.created_at).toLocaleString('es-CL'),
            alert.lat,
            alert.lng,
            alert.user_name,
            alert.user_phone,
            alert.puesto_numero
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return { success: true, csv };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
