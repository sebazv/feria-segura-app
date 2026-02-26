import { NavLink } from 'react-router-dom';
import { AlertCircle, MessageSquare, User, Vote, Newspaper } from 'lucide-react';

export default function BottomNav() {
    const tabs = [
        { name: 'SOS', href: '/', icon: AlertCircle },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
        { name: 'Noticias', href: '/news', icon: Newspaper },
        { name: 'Votar', href: '/encuestas', icon: Vote },
        { name: 'Perfil', href: '/profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
            <div className="flex justify-around items-center h-20">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.name}
                            to={tab.href}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                                    isActive
                                        ? 'text-[var(--color-brand-blue)] dark:text-white font-bold'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`
                            }
                        >
                            <Icon size={24} strokeWidth={2.5} />
                            <span className="text-xs leading-none">{tab.name}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
