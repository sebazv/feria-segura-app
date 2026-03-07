import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, MessageCircle, Newspaper, Vote, User, Eye } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const savedUserData = localStorage.getItem('feria_user_data');
        if (savedUserData) {
            try {
                const data = JSON.parse(savedUserData);
                setUserRole(data.role);
            } catch (e) {}
        }
    }, []);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    // If user is vigilante, show different nav
    if (userRole === 'vigilante') {
        return (
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-blue-500/30 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    <NavLink to="/vigilante" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/vigilante') ? 'text-blue-500' : 'text-slate-400'}`}>
                        <div className={`p-1.5 rounded-xl transition-colors ${isActive('/vigilante') ? 'bg-white/10' : ''}`}>
                            <Eye size={22} strokeWidth={isActive('/vigilante') ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-medium">Panel</span>
                    </NavLink>
                    <NavLink to="/news" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/news') ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <div className={`p-1.5 rounded-xl transition-colors ${isActive('/news') ? 'bg-white/10' : ''}`}>
                            <Newspaper size={22} strokeWidth={isActive('/news') ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-medium">Noticias</span>
                    </NavLink>
                    <NavLink to="/profile" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/profile') ? 'text-purple-500' : 'text-slate-400'}`}>
                        <div className={`p-1.5 rounded-xl transition-colors ${isActive('/profile') ? 'bg-white/10' : ''}`}>
                            <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-medium">Perfil</span>
                    </NavLink>
                </div>
            </nav>
        );
    }

    // Normal feriante nav
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                <NavLink to="/" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/') ? 'text-red-500' : 'text-slate-400'}`}>
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive('/') ? 'bg-white/10' : ''}`}>
                        <Shield size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">SOS</span>
                </NavLink>
                <NavLink to="/chat" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/chat') ? 'text-blue-500' : 'text-slate-400'}`}>
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive('/chat') ? 'bg-white/10' : ''}`}>
                        <MessageCircle size={22} strokeWidth={isActive('/chat') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">Chat</span>
                </NavLink>
                <NavLink to="/news" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/news') ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive('/news') ? 'bg-white/10' : ''}`}>
                        <Newspaper size={22} strokeWidth={isActive('/news') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">Noticias</span>
                </NavLink>
                <NavLink to="/encuestas" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/encuestas') ? 'text-amber-500' : 'text-slate-400'}`}>
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive('/encuestas') ? 'bg-white/10' : ''}`}>
                        <Vote size={22} strokeWidth={isActive('/encuestas') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">Votar</span>
                </NavLink>
                <NavLink to="/profile" className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${isActive('/profile') ? 'text-purple-500' : 'text-slate-400'}`}>
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive('/profile') ? 'bg-white/10' : ''}`}>
                        <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">Perfil</span>
                </NavLink>
            </div>
        </nav>
    );
}
