import { supabase } from './supabase/client';

// Generar email desde RUT
export const rutToEmail = (rut) => {
    return `${rut.replace(/[^0-9kK]/g, '').toLowerCase()}@feria-segura.cl`;
};

// Registro de nuevo usuario feriante
export const registerFeriante = async ({ 
    nombre, 
    rut, 
    telefono, 
    puestoNumero,
    password 
}) => {
    try {
        const rutLimpio = rut.replace(/[^0-9kK]/g, '').toLowerCase();
        const email = rutToEmail(rut);
        
        // Crear usuario en Auth de Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre,
                    rut: rutLimpio,
                    telefono,
                    puesto_numero: puestoNumero
                }
            }
        });

        if (error) throw error;

        // Guardar datos adicionales en tabla 'usuarios'
        if (data.user) {
            const { error: profileError } = await supabase
                .from('usuarios')
                .insert({
                    id: data.user.id,
                    nombre,
                    rut: rutLimpio,
                    telefono,
                    puesto_numero: puestoNumero,
                    role: 'feriante',
                    activo: true
                });

            if (profileError) console.error('Error guardando perfil:', profileError);
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: error.message };
    }
};

// Login de feriante
export const loginFeriante = async (rut, password) => {
    try {
        const email = rutToEmail(rut);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Actualizar último acceso
        if (data.user) {
            await supabase
                .from('usuarios')
                .update({ ultimo_acceso: new Date().toISOString() })
                .eq('id', data.user.id);
        }

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message };
    }
};

// Cerrar sesión
export const logoutFeriante = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Obtener datos del usuario
export const getUsuarioDatos = async (uid) => {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) throw error;
        return { success: true, datos: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Observer de autenticación
export const onAuthChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};

// Validar RUT chileno
export const validarRUT = (rut) => {
    rut = rut.replace(/[^0-9kK]/g, '');
    if (rut.length < 8) return false;
    
    const num = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    let sum = 0;
    let mul = 2;
    
    for (let i = num.length - 1; i >= 0; i--) {
        sum += parseInt(num[i]) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }
    
    const rest = sum % 11;
    const expectedDv = rest === 0 ? '0' : rest === 1 ? 'k' : String(11 - rest);
    
    return dv.toLowerCase() === expectedDv;
};
