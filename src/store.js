import { create } from 'zustand';

export const useStore = create((set) => ({
    darkMode: false,
    toggleDarkMode: () => set((state) => {
        const isDark = !state.darkMode;
        if (isDark) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
        return { darkMode: isDark };
    }),
}));
