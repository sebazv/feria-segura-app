import { NavLink } from 'react-router-dom';
import { Shield, MessageCircle, Newspaper, Vote, User } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { to: '/', icon: Shield, label: 'SOS' },
        { to: '/chat', icon: MessageCircle, label: 'Chat' },
        { to: '/news', icon: Newspaper, label: 'Noticias' },
        { to: '/encuestas', icon: Vote, label: 'Votar' },
        { to: '/profile', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-1 h-full gap-1 ${
                                isActive 
                                    ? 'text-red-600' 
                                    : 'text-gray-400'
                            }`
                        }
                    >
                        <Icon size={22} />
                        <span className="text-xs font-medium">{label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
