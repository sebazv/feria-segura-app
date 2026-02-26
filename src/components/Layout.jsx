import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import TopControls from './TopControls';

export default function Layout({ hideNav = false }) {
    return (
        <div className="flex flex-col min-h-screen relative w-full overflow-hidden bg-white dark:bg-black transition-colors duration-200">
            <TopControls />
            <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-24' : ''}`}>
                <Outlet />
            </main>
            {!hideNav && <BottomNav />}
            
            <footer className="py-4 text-center text-xs text-gray-400 dark:text-gray-600 bg-white dark:bg-black">
                <p>Feria Segura</p>
                <p>Desarrollado por SZV</p>
            </footer>
        </div>
    );
}
