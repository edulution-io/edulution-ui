import { create } from 'zustand';
import axios from 'axios';
import handleApiError from '@/utils/handleApiError';
import { Survey, SurveysAPIsResponse } from '@/pages/Survey/model';

interface SurveyStore {
  selectedSurvey: string;
  setSelectedSurvey: (selectSurvey: string) => void;
  surveys: Survey[];
  isLoading: boolean;
  error: Error | null;
  getSurveys: () => Promise<void>;
  getSurvey: (surveyName: string) => Promise<void>;
  deleteSurveys: (surveys: Survey[]) => Promise<void>;
  reset: () => void;
}

const useSurveyStore = create<SurveyStore>((set) => ({
  selectedSurvey: '',
  setSelectedSurvey: (selectSurvey: string) => set({ selectedSurvey: selectSurvey }),
  surveys: [],
  isLoading: false,
  error: null,
  getSurveys: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<SurveysAPIsResponse>('http://localhost:3000/api/getSurveys');
      set({ surveys: response.data.surveys, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  getSurvey: async (surveyName: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`http://localhost:3000/api/getSurvey?surveyName=${surveyName}`);
      set({ surveys: [response.data], isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  deleteSurveys: async (surveys: Survey[]) => {
    set({ isLoading: true });
    try {
      const response = await axios.delete(`http://localhost:3000/api/deleteConferences`, {
        data: { surveyName: surveys.map((c) => c.name) },
      });
      set({ surveys: [response.data], isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  reset: () => set({ surveys: [], isLoading: false, error: null }),
}));

export default useSurveyStore;
