import { create } from 'zustand';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto';
import handleApiError from '@/utils/handleApiError';
import deletePoll from '@/pages/PollsAndSurveysPage/Polls/components/dto/delete-poll.dto.ts';

export interface PollUpdateSelection {
  poll: Poll | undefined;
  pollType: UsersPollsTypes;
}

interface PollPageStore {
  selectedPoll: Poll | undefined;
  setSelectedPoll: (selectPoll: Poll | undefined) => void;

  selectedType: UsersPollsTypes | undefined;
  setSelectedType: (selectType: UsersPollsTypes | undefined) => void;

  updatePollSelection: (selection: PollUpdateSelection) => void;

  deletePoll: () => Promise<void>;

  refreshOpen: boolean;
  shouldRefreshOpen: () => void;
  finishRefreshOpen: () => void;

  refreshCreated: boolean;
  shouldRefreshCreated: () => void;
  finishRefreshCreated: () => void;

  refreshParticipated: boolean;
  shouldRefreshParticipated: () => void;
  finishRefreshParticipated: () => void;

  refreshGlobalList: boolean;
  shouldRefreshGlobalList: () => void;
  finishRefreshGlobalList: () => void;

  isOpenEditPollDialog: boolean;
  openEditPollDialog: () => void;
  openCreatePollDialog: () => void;
  closeEditPollDialog: () => void;

  isOpenParticipatePollDialog: boolean;
  openParticipatePollDialog: () => void;
  closeParticipatePollDialog: () => void;

  isOpenPollResultsDialog: boolean;
  openPollResultsDialog: () => void;
  closePollResultsDialog: () => void;

  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
  error: Error | null;
  reset: () => void;
}

const initialState: Partial<PollPageStore> = {
  selectedPoll: undefined,
  selectedType: undefined,

  refreshOpen: true,
  refreshCreated: true,
  refreshParticipated: true,
  refreshGlobalList: true,

  isOpenEditPollDialog: false,
  isOpenParticipatePollDialog: false,
  isOpenPollResultsDialog: false,

  isPageLoading: false,
};

const usePollPageStore = create<PollPageStore>((set) => ({
  ...(initialState as PollPageStore),
  setSelectedPoll: (selectPoll: Poll | undefined) => set({ selectedPoll: selectPoll }),
  setSelectedType: (type: UsersPollsTypes | undefined) => set({ selectedType: type }),
  updatePollSelection: ({ poll, pollType }: PollUpdateSelection) => set({ selectedPoll: poll, selectedType: pollType }),
  deletePoll: async () => {
    const pollName = usePollPageStore.getState().selectedPoll?.pollName;
    if (!pollName) {
      return;
    }
    try {
      await deletePoll(pollName);
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    }
    set({
      refreshOpen: true,
      refreshCreated: true,
      refreshParticipated: true,
      refreshGlobalList: true,
    });
  },
  shouldRefreshOpen: () => set({ refreshOpen: true }),
  finishRefreshOpen: () => set({ refreshOpen: false }),
  shouldRefreshCreated: () => set({ refreshCreated: true }),
  finishRefreshCreated: () => set({ refreshCreated: false }),
  shouldRefreshParticipated: () => set({ refreshParticipated: true }),
  finishRefreshParticipated: () => set({ refreshParticipated: false }),

  openEditPollDialog: () => set({ isOpenEditPollDialog: true }),
  openCreatePollDialog: () => set({ selectedPoll: undefined, isOpenEditPollDialog: true }),
  closeEditPollDialog: () => set({ isOpenEditPollDialog: false }),
  openParticipatePollDialog: () => set({ isOpenParticipatePollDialog: true }),
  closeParticipatePollDialog: () => set({ isOpenParticipatePollDialog: false }),
  openPollResultsDialog: () => set({ isOpenPollResultsDialog: true }),
  closePollResultsDialog: () => set({ isOpenPollResultsDialog: false }),

  setIsPageLoading: (loading: boolean) => set({ isPageLoading: loading }),
  reset: () => set(initialState),
}));

export default usePollPageStore;
