/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import CHOOSE_OTHER_ITEM_CHOICE_NAME from '@libs/survey/constants/choose-other-item-choice-name';

interface QuestionsContextMenuStore {
  reset: () => void;

  isOpenQuestionContextMenu: boolean;
  setIsOpenQuestionContextMenu: (state: boolean) => void;

  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;

  onRemoveQuestionId: (questionId: string) => void;

  questionType: string;

  questionTitle: string;
  setQuestionTitle: (newTitle: string) => void;

  questionDescription: string;
  setQuestionDescription: (newDescription: string) => void;

  useBackendLimits: boolean;
  toggleUseBackendLimits: (surveyId?: string) => void;

  currentBackendLimiters: { questionId: string; choices: ChoiceDto[] }[];
  setBackendLimiters: (backendLimiters: { questionId: string; choices: ChoiceDto[] }[]) => void;
  updateLimitersChoices: (choices: ChoiceDto[]) => { questionId: string; choices: ChoiceDto[] }[] | undefined;

  formerChoices: string[];
  currentChoices: ChoiceDto[];

  addChoice: (name: string, title?: string, limit?: number) => void;
  addNewChoice: () => void;
  removeChoice: (choicesName: string) => void;
  setChoiceName: (choiceName: string, newName: string) => void;
  setChoiceTitle: (choiceName: string, newTitle: string) => void;
  setChoiceLimit: (choiceName: string, newLimit: number) => void;

  showOtherItem: boolean;
  toggleShowOtherItem: () => void;
}

const QuestionsContextMenuStoreInitialState = {
  isOpenQuestionContextMenu: false,
  selectedQuestion: undefined,
  questionType: '',
  questionTitle: '',
  questionDescription: '',
  useBackendLimits: false,
  currentBackendLimiters: [],
  formerChoices: [],
  currentChoices: [],
  showOtherItem: false,
};

const useQuestionsContextMenuStore = create<QuestionsContextMenuStore>((set, get) => ({
  ...QuestionsContextMenuStoreInitialState,
  reset: () => set(QuestionsContextMenuStoreInitialState),

  setIsOpenQuestionContextMenu: (state: boolean) => set({ isOpenQuestionContextMenu: state }),

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
      currentChoices: [],
      showOtherItem: question?.showOtherItem || false,
    });
  },

  setQuestionTitle: (newTitle: string) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) return;

    set({ questionTitle: newTitle });
    selectedQuestion.title = newTitle;
  },

  setQuestionDescription: (newDescription: string) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) return;

    set({ questionDescription: newDescription });
    selectedQuestion.description = newDescription;
  },

  setBackendLimiters: (backendLimiters: { questionId: string; choices: ChoiceDto[] }[] = []) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) {
      return;
    }
    set({ currentBackendLimiters: backendLimiters });
  },

  toggleUseBackendLimits: () => {
    const { selectedQuestion, useBackendLimits } = get();
    if (!selectedQuestion) {
      return;
    }
    set({ useBackendLimits: !useBackendLimits });
  },

  onRemoveQuestionId: (questionId: string) => {
    const { currentBackendLimiters } = get();
    const updatedBackendLimiters = currentBackendLimiters.filter((limiter) => limiter.questionId !== questionId);
    set({ currentBackendLimiters: updatedBackendLimiters, currentChoices: [] });
  },

  updateLimitersChoices: (limitedChoices: ChoiceDto[]): { questionId: string; choices: ChoiceDto[] }[] | undefined => {
    const { currentBackendLimiters, selectedQuestion } = get();

    if (!selectedQuestion) {
      return undefined;
    }

    let addedLimiter = false;
    const updatedBackendLimiters = currentBackendLimiters.map((limiter) => {
      if (limiter.questionId === selectedQuestion?.name) {
        addedLimiter = true;
        return { questionId: limiter.questionId, choices: limitedChoices };
      }
      return limiter;
    });
    if (!addedLimiter) {
      updatedBackendLimiters.push({ questionId: selectedQuestion?.name || '', choices: limitedChoices });
    }

    set({ currentBackendLimiters: updatedBackendLimiters });
    return updatedBackendLimiters;
  },

  addChoice: (name: string, title: string = '', limit: number = 0) => {
    const newChoice = { name, title, limit };
    const { currentChoices = [] } = get();
    const updatedChoices: ChoiceDto[] = [...currentChoices, newChoice];
    set({ currentChoices: updatedChoices });
  },

  addNewChoice: () => {
    const { currentChoices, addChoice } = get();
    const newChoiceName = `choice_${currentChoices.length}_id-${uuidv4()}`;
    addChoice(newChoiceName, '', 0);
  },

  removeChoice: (name: string) => {
    const { currentChoices } = get();
    const updatedChoices = currentChoices.filter((choice: ChoiceDto) => choice.name !== name);
    set({ currentChoices: updatedChoices });
  },

  setChoiceName: (choiceName: string, newName: string) => {
    const { currentChoices } = get();
    const updatedChoices = currentChoices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.name = newName;
        return updatedChoice;
      }
      return c;
    });
    set({ currentChoices: updatedChoices });
  },

  setChoiceTitle: (choiceName: string, newTitle: string) => {
    const { currentChoices } = get();
    const updatedChoices = currentChoices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.title = newTitle;
        return updatedChoice;
      }
      return c;
    });
    set({ currentChoices: updatedChoices });
  },

  setChoiceLimit: (choiceName: string, newLimit: number) => {
    const { currentChoices } = get();
    const updatedChoices = currentChoices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.limit = newLimit;
        return updatedChoice;
      }
      return c;
    });
    set({ currentChoices: updatedChoices });
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

export default useQuestionsContextMenuStore;
