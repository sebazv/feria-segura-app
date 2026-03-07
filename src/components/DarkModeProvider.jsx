import { useState, useEffect } from 'react';

export default function DarkModeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(true);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load dark mode preference from localStorage or user data
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                const prefersDark = data.modo_oscuro !== false; // Default to true
                setDarkMode(prefersDark);
                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {
                // Default to dark mode
                document.documentElement.classList.add('dark');
            }
        } else {
            // Default to dark mode
            document.documentElement.classList.add('dark');
        }
        
        setLoaded(true);
    }, []);

    if (!loaded) {
        return null; // Or a loading spinner
    }

    return children;
}
