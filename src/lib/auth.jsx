import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';

// ========== AUTH FUNCTIONS ==========

export const registerFeriante = async ({ email, telefono, puestoNumero, password }) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { telefono, puesto_numero: puestoNumero }
            }
        });
        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: error.message };
    }
};

export const loginFeriante = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
            await supabase.from('usuarios').update({ ultimo_acceso: new Date().toISOString() }).eq('id', data.user.id);
        }
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message };
    }
};

export const logoutFeriante = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUsuarioDatos = async (uid) => {
    try {
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', uid).single();
        if (error) throw error;
        return { success: true, datos: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validarTelefono = (telefono) => {
    const limpia = telefono.replace(/\s/g, '');
    return /^(\+?56|0)?9[0-9]{8}$/.test(limpia);
};

// ========== AUTH CONTEXT ==========

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext) || { user: null, userData: null, loading: false };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Skip auth check on first load - show home immediately
        const initAuth = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    const result = await getUsuarioDatos(session.user.id);
                    if (result.success) {
                        setUserData(result.datos);
                    }
                }
            } catch (e) {
                console.log('Auth init error (ignored):', e.message);
            }
            setLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                const result = await getUsuarioDatos(session.user.id);
                if (result.success) {
                    setUserData(result.datos);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
