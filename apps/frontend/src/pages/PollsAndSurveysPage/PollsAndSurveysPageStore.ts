import { create } from 'zustand';

export enum PageView {
  SURVEY = "Survey",
  POLL = "Poll",
}

interface PollsAndSurveysPageStore {
  selectedPageView: PageView;
  setPageViewSurveyPage: () => void;
  setPageViewPollPage: () => void;
}

const initialState: Partial<PollsAndSurveysPageStore> = {
  selectedPageView: PageView.POLL,
};

const useQuestionsAndExercisesStore = create<PollsAndSurveysPageStore>((set) => ({
  ...(initialState as PollsAndSurveysPageStore),
  setPageViewSurveyPage: () => set({ selectedPageView: PageView.SURVEY }),
  setPageViewPollPage: () => set({ selectedPageView: PageView.POLL }),
}));

export default useQuestionsAndExercisesStore;
