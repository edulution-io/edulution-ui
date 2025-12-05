/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create } from 'zustand';
import { Question, ChoicesRestful } from 'survey-core';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import TSurveyQuestionChoice from '@libs/survey/types/TSurveyQuestionChoice';
import getRandomUUID from '@/utils/getRandomUUID';

interface QuestionsContextMenuStore {
  reset: () => void;

  isOpenQuestionContextMenu: boolean;
  setIsOpenQuestionContextMenu: (state: boolean) => void;

  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;

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

  formerChoices: TSurveyQuestionChoice[];
  setFormerChoices: (choices: TSurveyQuestionChoice[]) => void;
  currentChoices: ChoiceDto[];

  addChoice: (name: string, title?: string, limit?: number) => void;
  addNewChoice: () => void;
  removeChoice: (choicesName: string) => void;
  setChoiceName: (choiceName: string, newName: string) => void;
  setChoiceTitle: (choiceName: string, newTitle: string) => void;
  setChoiceLimit: (choiceName: string, newLimit: number) => void;

  setImageWidth: (newWidth: number | undefined) => void;
  imageWidth: number | undefined;
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
  imageWidth: 0,
};

const useQuestionsContextMenuStore = create<QuestionsContextMenuStore>((set, get) => ({
  ...QuestionsContextMenuStoreInitialState,
  reset: () => set(QuestionsContextMenuStoreInitialState),

  setFormerChoices: (choices: TSurveyQuestionChoice[]) => set({ formerChoices: choices }),

  setIsOpenQuestionContextMenu: (state: boolean) => {
    const { reset } = get();
    if (state === false) {
      reset();
    }
    set({ isOpenQuestionContextMenu: state });
  },

  setSelectedQuestion: (question: Question | undefined) => {
    const type = question?.getType();
    const width = Number(question?.imageWidth);
    set({
      selectedQuestion: question,
      questionType: type || '',
      questionTitle: question?.title || '',
      questionDescription: question?.description || '',
      useBackendLimits: !!(question?.choicesByUrl as ChoicesRestful)?.url,
      formerChoices: (question?.choices as TSurveyQuestionChoice[]) || [],
      currentChoices: [],
      showOtherItem: !!question?.showOtherItem,
      imageWidth: Number.isNaN(width) ? 0 : width,
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
    const newChoiceName = `${newChoiceTitle}-${getRandomUUID()}`;
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
      addChoice(SHOW_OTHER_ITEM, SHOW_OTHER_ITEM);
    } else {
      selectedQuestion.showOtherItem = false;
      set({ showOtherItem: false });
      removeChoice(SHOW_OTHER_ITEM);
    }
  },

  setImageWidth: (newWidth: number | undefined) => {
    const { selectedQuestion } = get();
    if (!selectedQuestion) return;

    set({ imageWidth: newWidth || 0 });
    selectedQuestion.imageWidth = newWidth ? Math.max(100, newWidth) : 0;
  },
}));

export default useQuestionsContextMenuStore;
