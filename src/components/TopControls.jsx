import { Sun, Moon, Palette } from 'lucide-react';
import { useStore } from '../store';

export default function TopControls() {
    const { darkMode, toggleDarkMode, useStitchUI, toggleUI } = useStore();

    return (
        <div className="fixed top-2 left-0 right-0 z-[100] px-4 pointer-events-none flex justify-between">
            {/* UI Mode Toggle */}
            <button
                onClick={toggleUI}
                className="pointer-events-auto flex items-center gap-2 bg-black/80 dark:bg-white/90 text-white dark:text-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-95 border border-white/20"
            >
                <Palette size={16} />
                <span className="text-sm font-bold tracking-wide">
                    {useStitchUI ? 'Ver. Stitch' : 'Ver. Original'}
                </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="pointer-events-auto bg-black/80 dark:bg-white/90 text-white dark:text-black p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-95 border border-white/20"
                aria-label="Alternar modo oscuro"
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
}
