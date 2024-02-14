import { create } from "zustand";

type Store = {
  lang: string;
  changeLang: (lang: string) => void;
};

const useLanguage = create<Store>()((set) => ({
  lang: "en",
  changeLang: (lang) => set({ lang }),
}));

export default useLanguage;
