import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, MessageCircle, Newspaper, Vote, User, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

export default function BottomNav() {
    const [darkMode, setDarkMode] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                setUser({ id: savedUserId });
                setDarkMode(data.modo_oscuro !== false);
            } catch (e) {}
        }
    }, []);

    const toggleDarkMode = async () => {
        const newMode = !darkMode;
        
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        setDarkMode(newMode);
        
        if (user?.id) {
            await supabase.from('usuarios').update({ modo_oscuro: newMode }).eq('id', user.id);
        }
        
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            const data = JSON.parse(savedUserData);
            data.modo_oscuro = newMode;
            localStorage.setItem('feria_user_data', JSON.stringify(data));
        }
    };

    const navItems = [
        { to: '/', icon: Shield, label: 'SOS', activeColor: 'text-red-500' },
        { to: '/chat', icon: MessageCircle, label: 'Chat', activeColor: 'text-blue-500' },
        { to: '/news', icon: Newspaper, label: 'Noticias', activeColor: 'text-emerald-500' },
        { to: '/encuestas', icon: Vote, label: 'Votar', activeColor: 'text-amber-500' },
        { to: '/profile', icon: User, label: 'Perfil', activeColor: 'text-purple-500' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map(({ to, icon: Icon, label, activeColor }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                                isActive ? activeColor : 'text-slate-400'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-white/10' : ''}`}>
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] font-medium">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
                
                <button
                    onClick={toggleDarkMode}
                    className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-slate-400"
                >
                    <div className="p-1.5 rounded-xl">
                        {darkMode ? <Moon size={22} /> : <Sun size={22} />}
                    </div>
                    <span className="text-[10px] font-medium">{darkMode ? 'Noche' : 'Día'}</span>
                </button>
            </div>
        </nav>
    );
}
