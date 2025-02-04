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

import { useCallback, useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import { RowSelectionState } from '@tanstack/react-table';
import FEED_PULL_TIME_INTERVAL from '@libs/dashboard/constants/pull-time-interval';
import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveyDto from '@libs/survey/types/api/survey.dto';

const useSurveysPageHook = (
  previousPageView: SurveysPageView,
  updatedPageView: SurveysPageView,

  updatePageView: (pageView: SurveysPageView) => void,
  updateSurveySelection: (survey: SurveyDto | undefined) => void,
  updateRowSelection: (rowSelection: RowSelectionState) => void,

  fetchingFunction: () => Promise<void>,
  isFetching: boolean,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentValues: any[],
) => {
  const fetch = useCallback(() => {
    if (!currentValues || currentValues.length === 0) {
      if (!isFetching) {
        void fetchingFunction();
      }
    }
  }, []);

  useEffect(() => {
    if (previousPageView !== updatedPageView) {
      updateRowSelection({});
      if (updatedPageView !== SurveysPageView.EDITOR) {
        updateSurveySelection(undefined);
      }
      updatePageView(updatedPageView);
    }

    void fetch();
  }, []);

  useInterval(() => {
    void fetch();
  }, FEED_PULL_TIME_INTERVAL);
};

export default useSurveysPageHook;
