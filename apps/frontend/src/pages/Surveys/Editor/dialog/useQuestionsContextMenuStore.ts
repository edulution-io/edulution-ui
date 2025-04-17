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
import { Question } from 'survey-core/typings/question';

interface QuestionSettingsDialogStore {
  reset: () => void;

  isOpenQuestionContextMenu: boolean;
  setIsOpenQuestionContextMenu: (state: boolean) => void;

  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;

  questionType: string;

  questionTitle: string;
  setQuestionTitle: (newTitle: string) => void;

  questionDescription: string;
  setQuestionDescription: (newDescription: string) => void;
}

const QuestionSettingsDialogStoreInitialState = {
  isOpenQuestionContextMenu: false,
  selectedQuestion: undefined,
  questionType: '',
  questionTitle: '',
  questionDescription: '',
};

const useQuestionSettingsDialogStore = create<QuestionSettingsDialogStore>((set, get) => ({
  ...QuestionSettingsDialogStoreInitialState,
  reset: () => set(QuestionSettingsDialogStoreInitialState),

  setIsOpenQuestionContextMenu: (state: boolean) => set({ isOpenQuestionContextMenu: state }),

  setSelectedQuestion: (question: Question | undefined) => {
    const type = question?.getType();
    set({
      selectedQuestion: question,
      questionType: type || '',
      questionTitle: question?.title || '',
      questionDescription: question?.description || '',
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
}));

export default useQuestionSettingsDialogStore;
