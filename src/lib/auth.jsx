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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for saved user
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                setUser({ id: savedUserId });
                setUserData(data);
            } catch (e) {
                localStorage.removeItem('feria_user_id');
                localStorage.removeItem('feria_user_data');
            }
        }
        setLoading(false);
    }, []);

    const login = (userId, userData) => {
        setUser({ id: userId });
        setUserData(userData);
        localStorage.setItem('feria_user_id', userId);
        localStorage.setItem('feria_user_data', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('feria_user_id');
        localStorage.removeItem('feria_user_data');
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, logout, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
