import { create } from 'zustand';

type Store = {
  isAuthenticated: boolean;
  user: { name: string } | null;
  login: (username: string, password: string) => void;
  logout: () => void;
};

const useAuthStore = create<Store>()((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (username: string, password: string) => {
    // Perform login logic...
    console.log('Logging in...', password);
    set({ isAuthenticated: true, user: { name: username } });
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}));

export default useAuthStore;
