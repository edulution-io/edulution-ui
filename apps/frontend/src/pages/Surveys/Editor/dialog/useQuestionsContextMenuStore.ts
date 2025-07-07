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
import { ChoicesRestful } from 'survey-core';
import TSurveyQuestion from '@libs/survey/types/TSurveyQuestion';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import ChoiceDto from '@libs/survey/types/api/choice.dto';

interface QuestionsContextMenuStore {
  reset: () => void;

  isOpenQuestionContextMenu: boolean;
  setIsOpenQuestionContextMenu: (state: boolean) => void;

  selectedQuestion: TSurveyQuestion | undefined;
  setSelectedQuestion: (question: TSurveyQuestion | undefined) => void;

  onRemoveQuestionName: (questionName: string) => void;

  questionType: string;

  questionTitle: string;
  setQuestionTitle: (newTitle: string) => void;

  questionDescription: string;
  setQuestionDescription: (newDescription: string) => void;

  useBackendLimits: boolean;
  toggleUseBackendLimits: () => void;

  currentBackendLimiters: { questionName: string; choices: ChoiceDto[] }[];
  setBackendLimiters: (backendLimiters: { questionName: string; choices: ChoiceDto[] }[]) => void;
  updateLimitersChoices: (choices: ChoiceDto[]) => { questionName: string; choices: ChoiceDto[] }[] | undefined;

  isUpdatingBackendLimiters: boolean;
  setIsUpdatingBackendLimiters: (state: boolean) => void;

  showOtherItem: boolean;
  toggleShowOtherItem: () => void;
  shouldToggleShowOtherItem: boolean;

  formerChoices: string[];
  currentChoices: ChoiceDto[];

  addChoice: (name: string, title?: string, limit?: number) => void;
  addNewChoice: () => void;
  removeChoice: (choicesName: string) => void;
  setChoiceName: (choiceName: string, newName: string) => void;
  setChoiceTitle: (choiceName: string, newTitle: string) => void;
  setChoiceLimit: (choiceName: string, newLimit: number) => void;

  setMaxFileSize: (newMaxFileSize: number) => void;
  maxFileSize: number;
  toggleAllowMultiple: () => void;
  allowMultiple: boolean;

  setImageWidth: (newWidth: number) => void;
  imageWidth: number;
}

const QuestionsContextMenuStoreInitialState = {
  isOpenQuestionContextMenu: false,
  selectedQuestion: undefined,
  questionType: '',
  questionTitle: '',
  questionDescription: '',
  useBackendLimits: false,
  isUpdatingBackendLimiters: false,
  showOtherItem: false,
  shouldToggleShowOtherItem: false,
  currentBackendLimiters: [],
  formerChoices: [],
  currentChoices: [],

  maxFileSize: 0,
  allowMultiple: false,

  imageWidth: 0,
};

const useQuestionsContextMenuStore = create<QuestionsContextMenuStore>((set, get) => ({
  ...QuestionsContextMenuStoreInitialState,
  reset: () => set(QuestionsContextMenuStoreInitialState),

  setIsOpenQuestionContextMenu: (state: boolean) => {
    const { reset } = get();
    if (state === false) {
      reset();
    }
    set({ isOpenQuestionContextMenu: state });
  },

  setSelectedQuestion: (question: TSurveyQuestion | undefined) => {
    const type = question?.getType();
    set({
      selectedQuestion: question,
      questionType: type || '',
      questionTitle: question?.title || '',
      questionDescription: question?.description || '',
      useBackendLimits: !!(question?.choicesByUrl as ChoicesRestful)?.url,
      formerChoices: (question?.choices as string[]) || [],
      currentChoices: [],
      showOtherItem: !!question?.showOtherItem,

      maxFileSize: question?.maxSize ? Math.max(Number(question.maxSize), 0) / (1024 * 1024) : 0,
      allowMultiple: !!question?.allowMultiple,

      imageWidth: question?.imageWidth || 0,
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

  toggleUseBackendLimits: () => {
    const { selectedQuestion, useBackendLimits } = get();
    if (!selectedQuestion) {
      return;
    }
    set({ useBackendLimits: !useBackendLimits });
  },

  setBackendLimiters: (backendLimiters: { questionName: string; choices: ChoiceDto[] }[] = []) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) {
      return;
    }
    const choices = backendLimiters.find((limiter) => limiter.questionName === selectedQuestion.name)?.choices || [];
    set({ currentBackendLimiters: backendLimiters, currentChoices: choices });
  },

  setIsUpdatingBackendLimiters: (state: boolean) => set({ isUpdatingBackendLimiters: state }),

  onRemoveQuestionName: (questionName: string) => {
    const { currentBackendLimiters } = get();
    const updatedBackendLimiters = currentBackendLimiters.filter((limiter) => limiter.questionName !== questionName);
    set({ currentBackendLimiters: updatedBackendLimiters, currentChoices: [] });
  },

  updateLimitersChoices: (
    limitedChoices: ChoiceDto[],
  ): { questionName: string; choices: ChoiceDto[] }[] | undefined => {
    const { currentBackendLimiters, selectedQuestion } = get();

    if (!selectedQuestion) {
      return undefined;
    }

    let addedLimiter = false;
    const updatedBackendLimiters = currentBackendLimiters.map((limiter) => {
      if (limiter.questionName === selectedQuestion?.name) {
        addedLimiter = true;
        return { questionName: limiter.questionName, choices: limitedChoices };
      }
      return limiter;
    });
    if (!addedLimiter) {
      updatedBackendLimiters.push({ questionName: selectedQuestion?.name || '', choices: limitedChoices });
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
    const newChoiceTitle = `choice-${currentChoices.length}`;
    const newChoiceName = `${newChoiceTitle}-${uuidv4()}`;
    addChoice(newChoiceName, `${newChoiceTitle}`, 1);
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
    const { isUpdatingBackendLimiters, selectedQuestion, showOtherItem, addChoice, removeChoice } = get();
    if (isUpdatingBackendLimiters) {
      set({ shouldToggleShowOtherItem: true });
      return;
    }
    set({ shouldToggleShowOtherItem: false });
    if (!selectedQuestion) {
      return;
    }
    if (!showOtherItem) {
      selectedQuestion.showOtherItem = true;
      set({ showOtherItem: true });
      addChoice(SHOW_OTHER_ITEM);
    } else {
      selectedQuestion.showOtherItem = false;
      set({ showOtherItem: false });
      removeChoice(SHOW_OTHER_ITEM);
    }
  },

  setMaxFileSize: (newMaxFileSize: number) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) return;

    const entry = Math.max(Number(newMaxFileSize), 0);
    const value = entry * (1024 * 1024) || 0;
    set({ maxFileSize: entry });
    selectedQuestion.maxSize = value;
  },

  toggleAllowMultiple: () => {
    const { selectedQuestion, allowMultiple } = get();
    if (!selectedQuestion) {
      return;
    }
    set({ allowMultiple: !allowMultiple });
    selectedQuestion.allowMultiple = !allowMultiple;
  },

  setImageWidth: (newWidth: number) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) return;

    const width = Math.max(newWidth, 0);
    set({ imageWidth: width });
    selectedQuestion.imageWidth = width;
  },
}));

export default useQuestionsContextMenuStore;
