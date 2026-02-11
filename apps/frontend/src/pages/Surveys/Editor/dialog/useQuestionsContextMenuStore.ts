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
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import { PUBLIC_SURVEY_CHOICES, SURVEY_CHOICES, SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import getRandomUUID from '@/utils/getRandomUUID';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface QuestionsContextMenuStore {
  reset: () => void;

  isOpenQuestionContextMenu: boolean;
  setIsOpenQuestionContextMenu: (state: boolean) => void;

  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;

  onRemoveQuestionName: (surveyId: string, questionName: string) => Promise<void>;

  questionType: string;

  questionTitle: string;
  setQuestionTitle: (newTitle: string) => void;

  questionDescription: string;
  setQuestionDescription: (newDescription: string) => void;

  useBackendLimits: boolean;
  toggleUseBackendLimits: (isPublic: boolean) => void;

  storedLimiters: Record<string, ChoiceDto[]> | undefined;
  fetchInitialStoredLimiters: (surveyId: string) => Promise<void>;
  updateStoredLimiters: (choices: ChoiceDto[]) => void;
  uploadStoredLimiters: (surveyId: string) => Promise<void>;

  showOtherItem: boolean;
  toggleShowOtherItem: () => void;

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
  storedLimiters: {},
  formerChoices: [],
  currentChoices: [],
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

  setSelectedQuestion: (question: Question | undefined) => {
    const type = question?.getType();
    const width = Number(question?.imageWidth);
    const { url } = (question?.choicesByUrl as ChoicesRestful) || {};
    set({
      selectedQuestion: question,
      questionType: type || '',
      questionTitle: question?.title || '',
      questionDescription: question?.description || '',
      useBackendLimits: !!url,
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

  toggleUseBackendLimits: (isPublic = false) => {
    const { selectedQuestion, useBackendLimits } = get();
    if (!selectedQuestion) {
      return;
    }
    if (!useBackendLimits) {
      const backendLimitAdress = `${EDU_API_URL}/${isPublic ? PUBLIC_SURVEY_CHOICES : SURVEY_CHOICES}/${TEMPORAL_SURVEY_ID_STRING}/${selectedQuestion.name}`;
      selectedQuestion.choicesByUrl = new ChoicesRestful();
      (selectedQuestion.choicesByUrl as ChoicesRestful).url = backendLimitAdress;
      (selectedQuestion.choicesByUrl as ChoicesRestful).valueName = 'title';
      (selectedQuestion.choicesByUrl as ChoicesRestful).titleName = 'title';
      set({ useBackendLimits: true });
    } else {
      (selectedQuestion.choicesByUrl as ChoicesRestful).url = '';
      set({ useBackendLimits: false });
    }
  },

  updateStoredLimiters: (choices: ChoiceDto[] = []) => {
    const { selectedQuestion, storedLimiters = {} } = get();
    if (!selectedQuestion) return;
    storedLimiters[selectedQuestion?.name] = choices;
    set({ storedLimiters, currentChoices: choices });
  },

  onRemoveQuestionName: async (surveyId: string, questionName: string) => {
    if (!surveyId || surveyId === TEMPORAL_SURVEY_ID_STRING) {
      const { storedLimiters = {} } = get();
      delete storedLimiters[questionName];
      set({ storedLimiters, currentChoices: [] });
      return;
    }
    try {
      await eduApi.delete(`${SURVEYS}/${surveyId}/${questionName}`);
    } catch (error) {
      handleApiError(error, set);
    }
  },

  fetchInitialStoredLimiters: async (surveyId: string) => {
    const { selectedQuestion, storedLimiters = {} } = get();
    if (!selectedQuestion) return;
    if (!surveyId || surveyId === TEMPORAL_SURVEY_ID_STRING) {
      const currentChoices = storedLimiters[selectedQuestion.name] || [];
      set({ currentChoices });
    }
    try {
      const result = await eduApi.get<ChoiceDto[]>(`${SURVEYS}/${surveyId}/${selectedQuestion.name}`);
      const currentChoices = result.data;
      storedLimiters[selectedQuestion.name] = currentChoices;
      set({ storedLimiters, currentChoices });
    } catch (error) {
      handleApiError(error, set);
      const currentChoices: ChoiceDto[] = [];
      set({ currentChoices });
    }
  },

  uploadStoredLimiters: async (surveyId: string) => {
    const { storedLimiters } = get();
    if (!storedLimiters) return;

    const promises = Object.keys(storedLimiters).map((questionName) =>
      storedLimiters[questionName].length > 0
        ? eduApi.post<ChoiceDto[]>(`${SURVEYS}/${surveyId}/${questionName}`, storedLimiters[questionName])
        : Promise.resolve(),
    );

    await Promise.all(promises);
  },

  addChoice: (name: string, title: string = '', limit: number = 0) => {
    const { currentChoices, updateStoredLimiters } = get();
    const newChoice = { name, title, limit };
    const updatedChoices: ChoiceDto[] = [...currentChoices, newChoice];
    updateStoredLimiters(updatedChoices);
  },

  addNewChoice: () => {
    const { currentChoices, addChoice } = get();
    const newChoiceTitle = `choice-${currentChoices.length}`;
    const newChoiceName = `${newChoiceTitle}-${getRandomUUID()}`;
    addChoice(newChoiceName, `${newChoiceTitle}`, 1);
  },

  removeChoice: (name: string) => {
    const { currentChoices, updateStoredLimiters } = get();
    const updatedChoices = currentChoices.filter((choice: ChoiceDto) => choice.name !== name);
    updateStoredLimiters(updatedChoices);
  },

  setChoiceName: (choiceName: string, newName: string) => {
    const { currentChoices, updateStoredLimiters } = get();
    const updatedChoices = currentChoices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.name = newName;
        return updatedChoice;
      }
      return c;
    });
    updateStoredLimiters(updatedChoices);
  },

  setChoiceTitle: (choiceName: string, newTitle: string) => {
    const { currentChoices, updateStoredLimiters } = get();
    const updatedChoices = currentChoices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.title = newTitle;
        return updatedChoice;
      }
      return c;
    });
    updateStoredLimiters(updatedChoices);
  },

  setChoiceLimit: (choiceName: string, newLimit: number) => {
    const { currentChoices, updateStoredLimiters } = get();
    const updatedChoices = currentChoices.map((c: ChoiceDto) => {
      if (c.name === choiceName) {
        const updatedChoice = c;
        updatedChoice.limit = newLimit;
        return updatedChoice;
      }
      return c;
    });
    updateStoredLimiters(updatedChoices);
  },

  toggleShowOtherItem: () => {
    const { selectedQuestion, showOtherItem, addChoice, removeChoice } = get();
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
