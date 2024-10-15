import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import QuestionSettingsDialogStore from '@libs/survey/types/editor/questionSettingsDialogStore';
import QuestionSettingsDialogStoreInitialState from '@libs/survey/types/editor/questionSettingsDialogStoreInitialState';
import CHOOSE_OTHER_ITEM_CHOICE_NAME from '@libs/survey/constants/CHOOSE_OTHER_ITEM_CHOICE_NAME';

const useQuestionSettingsDialogStore = create<QuestionSettingsDialogStore>((set, get) => ({
  ...QuestionSettingsDialogStoreInitialState,
  reset: () => set(QuestionSettingsDialogStoreInitialState),

  setIsOpenQuestionSettingsDialog: (state: boolean) => set({ isOpenQuestionSettingsDialog: state }),

  setSelectedQuestion: (question: Question | undefined) => {
    const type = question?.getType();
    set({
      selectedQuestion: question,
      questionType: type || '',
      questionTitle: question?.title || '',
      questionDescription: question?.description || '',
      useBackendLimits: !!question?.choicesByUrl,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      formerChoices: question?.choices || [],
      choices: [],
      showOtherItem: question?.showOtherItem || false,
    });
  },

  setQuestionTitle: (newTitle: string) => set({ questionTitle: newTitle }),

  setQuestionDescription: (newDescription: string) => set({ questionDescription: newDescription }),

  setBackendLimiters: (backendLimiters: { questionName: string; choices: ChoiceDto[] }[] = []) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) {
      return;
    }
    set({ backendLimiters });
  },

  toggleUseBackendLimits: () => {
    const { selectedQuestion, useBackendLimits } = get();
    if (!selectedQuestion) {
      return;
    }
    set({ useBackendLimits: !useBackendLimits });
  },

  onRemoveQuestionName: (questionName: string) => {
    const { backendLimiters } = get();
    const updatedBackendLimiters = backendLimiters.filter((limiter) => limiter.questionName !== questionName);
    set({ backendLimiters: updatedBackendLimiters, choices: [] });
  },

  updateLimitersChoices: (
    limitedChoices: ChoiceDto[],
  ): { questionName: string; choices: ChoiceDto[] }[] | undefined => {
    const { backendLimiters, selectedQuestion } = get();

    if (!selectedQuestion) {
      return undefined;
    }

    let addedLimiter = false;
    const updatedBackendLimiters = backendLimiters.map((limiter) => {
      if (limiter.questionName === selectedQuestion?.name) {
        addedLimiter = true;
        return { questionName: limiter.questionName, choices: limitedChoices };
      }
      return limiter;
    });
    if (!addedLimiter) {
      updatedBackendLimiters.push({ questionName: selectedQuestion?.name || '', choices: limitedChoices });
    }

    set({ backendLimiters: updatedBackendLimiters });
    return updatedBackendLimiters;
  },

  addChoice: (name: string, title: string = '', limit: number = 0) => {
    const newChoice = { name, title, limit };
    const { choices = [] } = get();
    const updatedChoices: ChoiceDto[] = [...choices, newChoice];
    set({ choices: updatedChoices });
  },

  addNewChoice: () => {
    const { choices, addChoice } = get();
    const newChoiceName = `choice_${choices.length}_id-${uuidv4()}`;
    addChoice(newChoiceName, '', 0);
  },

  removeChoice: (name: string) => {
    const { choices } = get();
    const updatedChoices = choices.filter((choice: ChoiceDto) => choice.name !== name);
    set({ choices: updatedChoices });
  },

  setChoiceName: (choiceName: string, newName: string) => {
    const { choices } = get();
    const updatedChoices = choices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.name = newName;
        return updatedChoice;
      }
      return c;
    });
    set({ choices: updatedChoices });
  },

  setChoiceTitle: (choiceName: string, newTitle: string) => {
    const { choices } = get();
    const updatedChoices = choices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.title = newTitle;
        return updatedChoice;
      }
      return c;
    });
    set({ choices: updatedChoices });
  },

  setChoiceLimit: (choiceName: string, newLimit: number) => {
    const { choices } = get();
    const updatedChoices = choices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.limit = newLimit;
        return updatedChoice;
      }
      return c;
    });
    set({ choices: updatedChoices });
  },

  toggleShowOtherItem: () => {
    const { selectedQuestion, showOtherItem, addChoice, removeChoice } = get();
    if (!selectedQuestion) {
      return;
    }
    if (showOtherItem) {
      selectedQuestion.showOtherItem = false;
      set({ showOtherItem: false });
      removeChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME);
      return;
    }
    selectedQuestion.showOtherItem = true;
    set({ showOtherItem: true });
    addChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME);
  },
}));

export default useQuestionSettingsDialogStore;
