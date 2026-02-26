import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    Timestamp 
} from 'firebase/firestore';
import { db } from './firebase/config';

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
            userId,
            userName,
            userPhone,
            puestoNumero,
            status: 'active', // active | resolved | cancelled
            createdAt: serverTimestamp(),
            resolvedAt: null,
            resolvedBy: null
        };

        const docRef = await addDoc(collection(db, 'alertas'), alerta);
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error enviando alerta:', error);
        return { success: false, error: error.message };
    }
};

// Obtener alertas del usuario
export const getUserAlerts = async (userId, limitCount = 50) => {
    try {
        const q = query(
            collection(db, 'alertas'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const alertas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convertir timestamp a fecha
            createdAt: doc.data().createdAt?.toDate()?.toISOString(),
            resolvedAt: doc.data().resolvedAt?.toDate()?.toISOString()
        }));

        return { success: true, alertas };
    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        return { success: false, error: error.message, alertas: [] };
    }
};

// Obtener todas las alertas (para admin)
export const getAllAlerts = async (status = null, limitCount = 100) => {
    try {
        let q;
        
        if (status) {
            q = query(
                collection(db, 'alertas'),
                where('status', '==', status),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            q = query(
                collection(db, 'alertas'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        const alertas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString(),
            resolvedAt: doc.data().resolvedAt?.toDate()?.toISOString()
        }));

        return { success: true, alertas };
    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        return { success: false, error: error.message, alertas: [] };
    }
};

// Resolver/cancelar alerta
export const resolveAlert = async (alertId, userId) => {
    try {
        await updateDoc(doc(db, 'alertas', alertId), {
            status: 'resolved',
            resolvedAt: serverTimestamp(),
            resolvedBy: userId
        });

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
            today: alertas.filter(a => new Date(a.createdAt) >= today).length,
            insecurity: alertas.filter(a => a.tipo === 'insecurity').length,
            medical: alertas.filter(a => a.tipo === 'medical').length,
            active: alertas.filter(a => a.status === 'active').length,
            resolved: alertas.filter(a => a.status === 'resolved').length,
            // Por mes (últimos 6 meses)
            porMes: {},
            // Por día de la semana
            porDiaSemana: [0, 0, 0, 0, 0, 0, 0]
        };

        // Calcular estadísticas por mes
        alertas.forEach(alert => {
            const fecha = new Date(alert.createdAt);
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
            new Date(alert.createdAt).toLocaleString('es-CL'),
            alert.lat,
            alert.lng,
            alert.userName,
            alert.userPhone,
            alert.puestoNumero
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return { success: true, csv };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
