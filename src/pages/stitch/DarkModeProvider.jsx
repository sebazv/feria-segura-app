import { useState, useEffect } from 'react';

export default function DarkModeProvider({ children }) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load dark mode preference from localStorage or user data
        const savedUserData = localStorage.getItem('feria_user_data');
        
        // Always start with dark mode by default
        document.documentElement.classList.add('dark');
        
        if (savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                // Check if user explicitly set light mode
                if (data.modo_oscuro === false) {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {
                // Keep dark mode
            }
        }
        
        setLoaded(true);
    }, []);

    if (!loaded) {
        return null;
    }

    return children;
}
