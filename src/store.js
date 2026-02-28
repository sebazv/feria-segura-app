import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
        darkMode: false,
        useStitchUI: false,
        toggleDarkMode: () => set((state) => {
            const isDark = !state.darkMode;
            if (typeof document !== 'undefined') {
                if (isDark) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
            return { darkMode: isDark };
        }),
        toggleUI: () => set((state) => ({ useStitchUI: !state.useStitchUI })),
    }),
    {
        name: 'feria-segura-storage',
    }
  )
);
