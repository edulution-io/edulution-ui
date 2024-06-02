import { create } from 'zustand';
import eduApi from '@/api/eduApi.ts';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery.tsx';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey.ts';
import Attendee from '@/pages/ConferencePage/dto/attendee.ts';
import handleApiError from '@/utils/handleApiError.ts';
import SURVEY_ENDPOINT from '@/pages/Surveys/Subpages/components/survey-endpoint.ts';

interface PropagateSurveyDialogStore {
  isOpenPropagateSurveyDialog: boolean;
  openPropagateSurveyDialog: () => void;
  closePropagateSurveyDialog: () => void;

  reset: () => void;

  searchAttendees: (searchQuery: string) => Promise<Attendee[]>;
  searchAttendeesResult: Attendee[];
  errorSearchAttendees: Error | null;

  propagateSurvey: (
    survey: Survey,
    allowVisualization?: boolean,
    isAnonymous?: boolean,
    canSubmitMultipleAnswers?: boolean,
  ) => Promise<Survey | undefined>;
  isPropagating: boolean;
  errorOnPropagate: Error | null;
}

const initialState: Partial<PropagateSurveyDialogStore> = {
  isOpenPropagateSurveyDialog: false,
  searchAttendeesResult: [],
  isPropagating: false,
  errorOnPropagate: null,
};

const usePropagateSurveyDialogStore = create<PropagateSurveyDialogStore>((set) => ({
  ...(initialState as PropagateSurveyDialogStore),
  openPropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: true }),
  closePropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: false }),
  reset: () => set(initialState),

  propagateSurvey: async (
    survey: Survey,
    allowVisualization = true,
    isAnonymous = false,
    canSubmitMultipleAnswers = false,
  ): Promise<Survey | undefined> => {
    set({ errorOnPropagate: null, isPropagating: true });

    try {
      const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, {
        surveyname: survey.surveyname,
        participants: survey.participants,
        survey: survey.survey,
        saveNo: survey.saveNo,
        created: survey.created,
        expires: survey.expires,

        allowVisualization: allowVisualization,
        isAnonymous: isAnonymous,
        canSubmitMultipleAnswers: canSubmitMultipleAnswers,
      });
      set({ isPropagating: false });
      return response.data;
    } catch (error) {
      set({ errorOnPropagate: error, isPropagating: false });
      return undefined;
    }
  },

  searchAttendees: async (searchParam) => {
    set({ errorSearchAttendees: null });
    try {
      const response = await eduApi.get<Attendee[]>(`${USERS_SEARCH_EDU_API_ENDPOINT}${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      const searchAttendeesResult = response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));

      set({ searchAttendeesResult });
      return searchAttendeesResult;
    } catch (error) {
      handleApiError(error, set);
      set({ errorSearchAttendees: error });
      return [];
    }
  },
}));

export default usePropagateSurveyDialogStore;
