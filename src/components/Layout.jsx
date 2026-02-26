import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout({ hideNav = false }) {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            <main className={`flex-1 ${!hideNav ? 'pb-20' : ''}`}>
                <Outlet />
            </main>
            {!hideNav && <BottomNav />}
        </div>
    );
}
