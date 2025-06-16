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

import React from 'react';
import { Route } from 'react-router-dom';
import { PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import PublicConferencePage from '@/pages/ConferencePage/PublicConference/PublicConferencePage';
import PageTitle from '@/components/PageTitle';
import { PUBLIC_FILE_DOWNLOAD } from '@libs/filesharing/constants/apiEndpoints';
import PublicFileDownloadPage from '@/pages/FileSharing/publicShareFiles/publicPage/PublicFileDownloadPage';

const getPublicRoutes = () => [
  <Route
    key={CONFERENCES_PUBLIC_EDU_API_ENDPOINT}
    path={`${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/:meetingId`}
    element={
      <>
        <PageTitle translationId="conferences.publicConference" />
        <PublicConferencePage />
      </>
    }
  />,
  <Route
    key={PUBLIC_SURVEYS}
    path={`${PUBLIC_SURVEYS}/:surveyId`}
    element={
      <>
        <PageTitle translationId="survey.publicSurvey" />
        <SurveyParticipationPage isPublic />
      </>
    }
  />,
  <Route
    key={PUBLIC_FILE_DOWNLOAD}
    path={`${PUBLIC_FILE_DOWNLOAD}/:fileId`}
    element={
      <>
        <PageTitle translationId="filesharing.publicFileSharing.downloadPublicFile" />
        <PublicFileDownloadPage />
      </>
    }
  />,
];

export default getPublicRoutes;
