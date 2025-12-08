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

import React from 'react';
import { Route } from 'react-router-dom';
import { PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import PublicConferencePage from '@/pages/ConferencePage/PublicConference/PublicConferencePage';
import PageTitle from '@/components/PageTitle';
import PublicShareDownloadPage from '@/pages/FileSharing/publicShare/publicPage/PublicShareDownloadPage';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import getPublicEmbeddedRoutes from './getPublicEmbeddedRoutes';

const getPublicRoutes = () => [
  getPublicEmbeddedRoutes(),
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
    key={FileSharingApiEndpoints.PUBLIC_SHARE}
    path={`${FileSharingApiEndpoints.PUBLIC_SHARE}/:fileId`}
    element={<PublicShareDownloadPage />}
  />,
];

export default getPublicRoutes;
