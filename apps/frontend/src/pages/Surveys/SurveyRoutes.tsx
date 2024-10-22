import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/api/page-view';
import OpenSurveys from '@/pages/Surveys/Tables/OpenSurveys';
import AnsweredSurveys from '@/pages/Surveys/Tables/AnsweredSurveys';
import CreatedSurveys from '@/pages/Surveys/Tables/CreatedSurveys';
import EditSurvey from '@/pages/Surveys/Editor/EditSurvey';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';
import ParticipateSurvey from '@/pages/Surveys/Participation/ParticipateSurvey';

const getSurveyRoutes = () => [
  <Route
    key={SURVEYS_ENDPOINT}
    path={SURVEYS_ENDPOINT}
  >
    <Route
      path=""
      element={<Navigate to={SurveysPageView.OPEN} />}
    />
    <Route
      path={SurveysPageView.OPEN}
      element={<OpenSurveys />}
    />
    <Route
      path={SurveysPageView.ANSWERED}
      element={<AnsweredSurveys />}
    />
    <Route
      path={SurveysPageView.CREATED}
      element={<CreatedSurveys />}
    />
    <Route
      path={SurveysPageView.CREATOR}
      element={<SurveyEditorForm />}
    />
    <Route
      path={`${SurveysPageView.EDITOR}/:surveyId`}
      element={<EditSurvey />}
    />
    <Route
      path={`${SurveysPageView.PARTICIPATION}/:surveyId`}
      element={<ParticipateSurvey />}
    />
  </Route>,
];

export default getSurveyRoutes;
