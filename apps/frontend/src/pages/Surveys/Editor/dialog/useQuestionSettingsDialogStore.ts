import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import QuestionSettingsDialogStore from '@libs/survey/types/editor/questionSettingsDialogStore';
import QuestionSettingsDialogStoreInitialState from '@libs/survey/types/editor/questionSettingsDialogStoreInitialState';

const useQuestionSettingsDialogStore = create<QuestionSettingsDialogStore>((set, get) => ({
  ...QuestionSettingsDialogStoreInitialState,
  reset: () => set(QuestionSettingsDialogStoreInitialState),

  setIsOpenQuestionSettingsDialog: (state: boolean) => set({ isOpenQuestionSettingsDialog: state }),

  setSelectedQuestion: (question: Question | undefined) => set({ selectedQuestion: question }),
  setBackendLimiters: (backendLimiters: { questionName: string; choices: ChoiceDto[] }[]) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) {
      set({ backendLimiters, choices: [] });
    } else {
      const limiterIndex = backendLimiters?.findIndex((limiter) => limiter.questionName === selectedQuestion.name);
      const choices = limiterIndex !== -1 ? backendLimiters[limiterIndex]?.choices : undefined;
      set({ backendLimiters, choices: choices || [] });
    }
  },

  onRemoveQuestionName: (questionName: string) => {
    const { backendLimiters } = get();
    const limiterIndex = backendLimiters?.findIndex((limiter) => limiter.questionName === questionName);
    if (limiterIndex !== -1) {
      backendLimiters.splice(limiterIndex, 1);
      set({ backendLimiters });
    }
  },

  updateLimitersChoices: (limitedChoices: ChoiceDto[]) => {
    const { selectedQuestion, backendLimiters } = get();
    if (!selectedQuestion) return;

    const limiterIndex = backendLimiters?.findIndex((limiter) => limiter.questionName === selectedQuestion.name);
    if (limiterIndex === -1) {
      backendLimiters.push({ questionName: selectedQuestion.name, choices: limitedChoices });
      set({ backendLimiters, choices: limitedChoices });
    } else {
      backendLimiters[limiterIndex].choices = limitedChoices;
      set({ backendLimiters, choices: limitedChoices });
    }
  },

  addNewChoice: () => {
    const { choices } = get();
    const updateChoices = [...choices];
    const newChoice = { name: `choice_${choices.length}_id-${uuidv4()}`, title: '', limit: 0 };
    updateChoices.push(newChoice);
    set({ choices: updateChoices });
  },

  setName: (choiceIndex: number, name: string) => {
    if (choiceIndex === -1) return;

    const updateChoices = get().choices;
    updateChoices[choiceIndex].name = name;
    set({ choices: updateChoices });
  },

  setTitle: (choiceIndex: number, title: string) => {
    if (choiceIndex === -1) return;

    const updateChoices = get().choices;
    updateChoices[choiceIndex].title = title;
    set({ choices: updateChoices });
  },

  setLimit: (choiceIndex: number, limit: number) => {
    if (choiceIndex === -1) return;

    const updateChoices = get().choices;
    updateChoices[choiceIndex].limit = limit;
    set({ choices: updateChoices });
  },

  removeChoice: (choicesName: string) => {
    const { choices } = get();
    const updatedChoices = choices.filter((choice: ChoiceDto) => choice.name !== choicesName);
    set({ choices: updatedChoices });
  },
}));

export default useQuestionSettingsDialogStore;
