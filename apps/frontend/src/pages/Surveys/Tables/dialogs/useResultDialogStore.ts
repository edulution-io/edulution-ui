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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEY_RESULT_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import ResultDialogStoreInitialState from '@libs/survey/types/tables/dialogs/resultDialogStoreInitialState';
import ResultDialogStore from '@libs/survey/types/tables/dialogs/resultDialogStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useResultDialogStore = create<ResultDialogStore>((set) => ({
  ...(ResultDialogStoreInitialState as ResultDialogStore),
  reset: () => set(ResultDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenPublicResultsTableDialog: (state: boolean) => set({ isOpenPublicResultsTableDialog: state }),
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => set({ isOpenPublicResultsVisualisationDialog: state }),

  getSurveyResult: async (surveyId: string): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<JSON[]>(`${SURVEY_RESULT_ENDPOINT}/${surveyId}`);
      const result = response.data;
      set({ result });
    } catch (error) {
      handleApiError(error, set);
      set({ result: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useResultDialogStore;
