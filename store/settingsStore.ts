import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  darkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      
      toggleDarkMode: async () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
      },
      
      loadSettings: async () => {
        // This is handled by the persist middleware
      }
    }),
    {
      name: 'settingsStore',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);