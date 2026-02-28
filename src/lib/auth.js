import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import { getUsuarioDatos } from './auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return { user: null, userData: null, loading: true };
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                setUser(session.user);
                // Get user data from usuarios table
                const result = await getUsuarioDatos(session.user.id);
                if (result.success) {
                    setUserData(result.datos);
                }
            }
            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
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
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
