import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout({ hideNav = false }) {
    return (
        <div className="flex flex-col min-h-screen relative w-full overflow-hidden bg-white dark:bg-black transition-colors duration-200">
            <main className={`flex-1 overflow-y-auto ${!hideNav ? 'pb-24' : ''}`}>
                <Outlet />
            </main>
            {!hideNav && <BottomNav />}
        </div>
    );
}
