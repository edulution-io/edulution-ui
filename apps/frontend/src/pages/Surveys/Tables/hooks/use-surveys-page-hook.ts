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
