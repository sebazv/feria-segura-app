import { NavLink } from 'react-router-dom';
import { Shield, MessageSquare, Newspaper, Vote, User } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { to: '/', icon: Shield, label: 'SOS' },
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
        { to: '/news', icon: Newspaper, label: 'Noticias' },
        { to: '/encuestas', icon: Vote, label: 'Votar' },
        { to: '/profile', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                                isActive 
                                    ? 'text-red-600' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`
                        }
                    >
                        <Icon size={20} />
                        <span className="text-[10px]">{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
