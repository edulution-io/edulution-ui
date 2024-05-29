import { create } from 'zustand';
import { AxiosError } from 'axios';
import { CompleteEvent } from 'survey-core';
import handleApiError from '@/utils/handleApiError';
import pushChoice from '@/pages/PollsAndSurveysPage/Polls/components/dto/push-answer.dto';

interface ParticipatePollDialogStore {
  isAnswering: boolean;
  setIsAnswering: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  commitChoice: (pollName: string, choice: string, userLabel?: string, options?: CompleteEvent) => void;
}

const initialState: Partial<ParticipatePollDialogStore> = {
  isAnswering: false,
  error: null,
};

const useParticipatePollDialogStore = create<ParticipatePollDialogStore>((set) => ({
  ...(initialState as ParticipatePollDialogStore),
  setIsAnswering: (isAnswering) => set({ isAnswering }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  commitChoice: async (
    pollName: string,
    choice: string,
    userLabel?: string,
    options?: CompleteEvent,
  ): Promise<void> => {
    set({ isAnswering: true });
    try {
      await pushChoice(pollName, choice, userLabel, options);
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isAnswering: false });
    }
  },
}));

export default useParticipatePollDialogStore;
