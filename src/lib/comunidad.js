import { supabase } from './supabase/client';

// ========== NOTICIAS ==========

// Obtener todas las noticias (públicas)
export const getNoticias = async (limitCount = 50) => {
    try {
        const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .eq('activa', true)
            .order('created_at', { ascending: false })
            .limit(limitCount);

        if (error) throw error;
        return { success: true, noticias: data || [] };
    } catch (error) {
        return { success: false, error: error.message, noticias: [] };
    }
};

// Crear noticia (solo admin)
export const createNoticia = async ({ titulo, contenido, autorId }) => {
    try {
        const { data, error } = await supabase
            .from('noticias')
            .insert({
                titulo,
                contenido,
                autor_id: autorId,
                activa: true
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, noticia: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ========== CHAT / MENSAJES ==========

// Obtener mensajes del chat
export const getMensajes = async (limitCount = 100) => {
    try {
        const { data, error } = await supabase
            .from('mensajes')
            .select(`
                *,
                usuario:usuarios(id, nombre, puesto_numero)
            `)
            .order('created_at', { ascending: true })
            .limit(limitCount);

        if (error) throw error;
        return { success: true, mensajes: data || [] };
    } catch (error) {
        return { success: false, error: error.message, mensajes: [] };
    }
};

// Enviar mensaje
export const sendMensaje = async ({ userId, userName, puestoNumero, contenido }) => {
    try {
        const { data, error } = await supabase
            .from('mensajes')
            .insert({
                user_id: userId,
                user_name: userName,
                puesto_numero: puestoNumero,
                contenido
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, mensaje: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Suscribirse a nuevos mensajes (real-time)
export const subscribeToMensajes = (callback) => {
    return supabase
        .channel('mensajes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, callback)
        .subscribe();
};

// ========== ENCUESTAS ==========

// Obtener encuestas
export const getEncuestas = async () => {
    try {
        const { data, error } = await supabase
            .from('encuestas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, encuestas: data || [] };
    } catch (error) {
        return { success: false, error: error.message, encuestas: [] };
    }
};

// Obtener encuesta con votos
export const getEncuestaConVotos = async (encuestaId) => {
    try {
        const { data: encuesta, error: e1 } = await supabase
            .from('encuestas')
            .select('*')
            .eq('id', encuestaId)
            .single();

        if (e1) throw e1;

        const { data: votos, error: e2 } = await supabase
            .from('votos')
            .select('*')
            .eq('encuesta_id', encuestaId);

        if (e2) throw e2;

        return { success: true, encuesta, votos: votos || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Votar en encuesta
export const voteEncuesta = async ({ encuestaId, userId, opcion }) => {
    try {
        // Check if already voted
        const { data: existing } = await supabase
            .from('votos')
            .select('id')
            .eq('encuesta_id', encuestaId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            return { success: false, error: 'Ya has votado en esta encuesta' };
        }

        const { data, error } = await supabase
            .from('votos')
            .insert({
                encuesta_id: encuestaId,
                user_id: userId,
                opcion
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, voto: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Crear encuesta (solo admin)
export const createEncuesta = async ({ pregunta, opciones, autorId }) => {
    try {
        const opcionesJSON = JSON.stringify(opciones);
        
        const { data, error } = await supabase
            .from('encuestas')
            .insert({
                pregunta,
                opciones: opcionesJSON,
                autor_id: autorId,
                activa: true
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, encuesta: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
