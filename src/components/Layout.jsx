import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import TopControls from './TopControls';

export default function Layout({ hideNav = false }) {
    return (
        <div className="flex flex-col min-h-screen relative w-full overflow-hidden bg-white dark:bg-black transition-colors duration-200">
            <TopControls />
            
            <footer className="py-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800">
                <p>Feria Segura — Desarrollado por SZV</p>
            </footer>
            
            <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-24' : ''}`}>
                <Outlet />
            </main>
            {!hideNav && <BottomNav />}
        </div>
    );
}
