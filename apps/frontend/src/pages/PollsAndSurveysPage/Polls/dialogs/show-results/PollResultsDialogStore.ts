import { create } from 'zustand';
import { AxiosError } from 'axios';
import handleApiError from '@/utils/handleApiError';
import getResult from '@/pages/PollsAndSurveysPage/Polls/components/dto/get-result.dto';

interface PollResultDialogStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  choices: string | undefined;
  getPollResults: (pollName: string | undefined) => Promise<string | undefined>;
}

const initialState: Partial<PollResultDialogStore> = {
  choices: undefined,
  isLoading: false,
  error: null,
};

const usePollResultDialogStore = create<PollResultDialogStore>((set) => ({
  ...(initialState as PollResultDialogStore),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  getPollResults: async (pollName: string | undefined): Promise<string | undefined> => {
    if (!pollName) {
      return undefined;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await getResult({ pollName });
      set({ choices: response });
      return response;
    } catch (error) {
      set({ choices: undefined });
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default usePollResultDialogStore;
