import { NavLink } from 'react-router-dom';
import { Shield, MessageSquare, Newspaper, Vote, User } from 'lucide-react';

export default function BottomNav() {
    const tabs = [
        { name: 'SOS', href: '/', icon: Shield },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
        { name: 'Noticias', href: '/news', icon: Newspaper },
        { name: 'Votar', href: '/encuestas', icon: Vote },
        { name: 'Perfil', href: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                                    isActive ? 'text-red-600' : 'text-gray-400'
                                }`
                            }
                        >
                            <Icon size={20} strokeWidth={2} />
                            <span className="text-[10px]">{tab.name}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
