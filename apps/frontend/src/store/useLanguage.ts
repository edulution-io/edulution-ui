import { create } from 'zustand';

type Store = {
  lang: string;
  changeLang: (lang: string) => void;
};

const useLanguage = create<Store>()((set) => ({
  lang: 'de',
  changeLang: (lang) => set({ lang }),
}));

export default useLanguage;
