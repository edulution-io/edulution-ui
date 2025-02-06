import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/api/page-view';
import OpenSurveysPage from '@/pages/Surveys/Tables/OpenSurveysPage';
import AnsweredSurveysPage from '@/pages/Surveys/Tables/AnsweredSurveysPage';
import CreatedSurveysPage from '@/pages/Surveys/Tables/CreatedSurveysPage';
import SurveyEditorPage from '@/pages/Surveys/Editor/SurveyEditorPage';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';

const getSurveyRoutes = () => [
  <Route
    key={SURVEYS}
    path={SURVEYS}
  >
    <Route
      path=""
      element={<Navigate to={SurveysPageView.OPEN} />}
    />
    <Route
      path={SurveysPageView.OPEN}
      element={<OpenSurveysPage />}
    />
    <Route
      path={SurveysPageView.ANSWERED}
      element={<AnsweredSurveysPage />}
    />
    <Route
      path={SurveysPageView.CREATED}
      element={<CreatedSurveysPage />}
    />
    <Route
      path={SurveysPageView.CREATOR}
      element={<SurveyEditorPage />}
    />
    <Route
      path={`${SurveysPageView.EDITOR}/:surveyId`}
      element={<SurveyEditorPage />}
    />
    <Route
      path={`${SurveysPageView.PARTICIPATION}/:surveyId`}
      element={<SurveyParticipationPage isPublic={false} />}
    />
  </Route>,
];

export default getSurveyRoutes;
