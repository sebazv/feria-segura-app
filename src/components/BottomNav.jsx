import { NavLink } from 'react-router-dom';
import { Shield, MessageSquare, Newspaper, Vote, User } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { to: '/', icon: Shield, label: 'SOS', emoji: '🛡️' },
        { to: '/chat', icon: MessageSquare, label: 'Chat', emoji: '💬' },
        { to: '/news', icon: Newspaper, label: 'Noticias', emoji: '📰' },
        { to: '/encuestas', icon: Vote, label: 'Votar', emoji: '🗳️' },
        { to: '/profile', icon: User, label: 'Perfil', emoji: '👤' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-20">
                {navItems.map(({ to, icon: Icon, label, emoji }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                                isActive 
                                    ? 'text-red-600' 
                                    : 'text-gray-500 hover:text-red-500'
                            }`
                        }
                    >
                        <div className="text-2xl">{emoji}</div>
                        <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
