import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context || { user: null, userData: null, loading: false };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    const { data } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    setUserData(data);
                }
            } catch (e) {
                console.log('Auth load error:', e);
            }
            setLoading(false);
        };
        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setUserData(data);
            } else {
                setUser(null);
                setUserData(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = (userData) => {
        setUser(user);
        setUserData(userData);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserData(null);
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, logout, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
