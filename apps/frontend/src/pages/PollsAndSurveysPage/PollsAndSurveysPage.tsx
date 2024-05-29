import React from 'react';
import useQuestionsAndExercisesStore, { PageView } from "@/pages/PollsAndSurveysPage/PollsAndSurveysPageStore.ts";
import SurveyPage from '@/pages/PollsAndSurveysPage/Surveys/SurveyPage';
import PollPage from '@/pages/PollsAndSurveysPage/Polls/PollPage';

const PollsAndSurveysPage = () => {
  const { selectedPageView } = useQuestionsAndExercisesStore();

  switch (selectedPageView) {
    case PageView.POLL:
      return <PollPage />;
    case PageView.SURVEY:
    default:
      return <SurveyPage />;
  }
};
export default PollsAndSurveysPage;
