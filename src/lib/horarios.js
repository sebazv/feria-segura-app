import { supabase } from './supabase/client';

// ========== HORARIOS DE LA FERIA ==========

// Obtener configuración de horarios
export const getConfiguracion = async () => {
    try {
        const { data, error } = await supabase
            .from('configuracion')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        // Valores por defecto si no hay configuración
        return { 
            success: true, 
            config: data || {
                hora_inicio: '06:00',
                hora_fin: '17:00',
                dias_activos: [true, false, true, true, true, true, true], // Martes-Domingo
                panic_button_activo: true,
                Incentivos_habilitados: false
            }
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            config: {
                hora_inicio: '06:00',
                hora_fin: '17:00',
                dias_activos: [false, false, true, true, true, true, true],
                panic_button_activo: true,
                Incentivos_habilitados: false
            }
        };
    }
};

// Actualizar configuración (solo admin)
export const updateConfiguracion = async (config, adminId) => {
    try {
        // Verificar que es admin
        const { data: usuario } = await supabase
            .from('usuarios')
            .select('role')
            .eq('id', adminId)
            .single();

        if (!usuario || usuario.role !== 'admin') {
            return { success: false, error: 'Solo admins pueden modificar configuración' };
        }

        const { data, error } = await supabase
            .from('configuracion')
            .upsert({ ...config, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return { success: true, config: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Verificar si el botón de pánico está activo ahora
export const isPanicButtonActive = () => {
    const ahora = new Date();
    const diaSemana = ahora.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Por defecto: Martes a Domingo (dias 2,3,4,5,6)
    const diasActivos = [false, false, true, true, true, true, true];
    
    if (!diasActivos[diaSemana]) {
        return { 
            activo: false, 
            razon: 'La feria no opera hoy' 
        };
    }
    
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const horaInicio = 6 * 60; // 6:00 AM
    const horaFin = 17 * 60; // 5:00 PM
    
    if (horaActual < horaInicio) {
        return { 
            activo: false, 
            razon: `El botón se activa a las 06:00` 
        };
    }
    
    if (horaActual > horaFin) {
        return { 
            activo: false, 
            razon: `El botón se desactiva a las 17:00` 
        };
    }
    
    return { activo: true };
};

// ========== INCENTIVOS / PUNTOS ==========

// Obtener puntos del usuario
export const getPuntosUsuario = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('puntos')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        return { 
            success: true, 
            puntos: data || { user_id: userId, puntos: 0, nivel: 1, alertas_enviadas: 0, alertas_resueltas: 0 }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Sumar puntos por acción
export const addPuntos = async (userId, accion, cantidad) => {
    try {
        // Obtener puntos actuales
        const { data: actual } = await supabase
            .from('puntos')
            .select('puntos')
            .eq('user_id', userId)
            .single();

        const nuevosPuntos = (actual?.puntos || 0) + cantidad;
        
        // Determinar nivel
        let nivel = 1;
        if (nuevosPuntos >= 1000) nivel = 5;
        else if (nuevosPuntos >= 500) nivel = 4;
        else if (nuevosPuntos >= 200) nivel = 3;
        else if (nuevosPuntos >= 50) nivel = 2;

        const { data, error } = await supabase
            .from('puntos')
            .upsert({ 
                user_id: userId, 
                puntos: nuevosPuntos,
                nivel,
                [accion]: (actual?.[accion] || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, puntos: nuevosPuntos, nivel };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Obtener ranking de usuarios
export const getRanking = async (limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('puntos')
            .select('*, usuario:usuarios(nombre, puesto_numero)')
            .order('puntos', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { success: true, ranking: data || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Obtener beneficios por nivel
export const getBeneficiosNivel = (nivel) => {
    const beneficios = {
        1: { nombre: 'Bronce', descuento: 0, requisitos: 'Nuevo usuario' },
        2: { nombre: 'Plata', descuento: 5, requisitos: '50 puntos' },
        3: { nombre: 'Oro', descuento: 10, requisitos: '200 puntos' },
        4: { nombre: 'Platino', descuento: 15, requisitos: '500 puntos' },
        5: { nombre: 'Diamante', descuento: 20, requisitos: '1000 puntos' }
    };
    return beneficios[nivel] || beneficios[1];
};
