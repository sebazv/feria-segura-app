import { create } from 'zustand';

export const useStore = create((set) => ({
    darkMode: false,
    useStitchUI: true,
    toggleDarkMode: () => set((state) => {
        const isDark = !state.darkMode;
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        return { darkMode: isDark };
    }),
    toggleUI: () => set((state) => ({ useStitchUI: !state.useStitchUI })),
}));
