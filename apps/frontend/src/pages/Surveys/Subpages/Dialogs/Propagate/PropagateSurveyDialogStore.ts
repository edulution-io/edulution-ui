import { create } from 'zustand';

interface PropagateSurveyDialogStore {
  isOpenPropagateSurveyDialog: boolean;
  openPropagateSurveyDialog: () => void;
  closePropagateSurveyDialog: () => void;
  reset: () => void;
}

const initialState: Partial<PropagateSurveyDialogStore> = {
  isOpenPropagateSurveyDialog: false,
};

const usePropagateSurveyDialogStore = create<PropagateSurveyDialogStore>((set) => ({
  ...(initialState as PropagateSurveyDialogStore),
  openPropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: true }),
  closePropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: false }),
  reset: () => set(initialState),
}));

export default usePropagateSurveyDialogStore;
