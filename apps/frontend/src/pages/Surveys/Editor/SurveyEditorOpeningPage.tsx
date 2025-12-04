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

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AttendeeDto from '@libs/user/types/attendee.dto';
import getCreatorFromUserDto from '@libs/survey/utils/getCreatorFromUserDto';
import useUserStore from '@/store/UserStore/useUserStore';
import SurveyEditorPage from '@/pages/Surveys/Editor/SurveyEditorPage';
import SurveyEditorLoadingPage from '@/pages/Surveys/Editor/SurveyEditorLoadingPage';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import PageLayout from '@/components/structure/layout/PageLayout';

const SurveyEditorOpeningPage = () => {
  const { user } = useUserStore();
  const surveyCreator: AttendeeDto | undefined = useMemo(() => getCreatorFromUserDto(user), [user]);

  const { reset: resetEditorPage, fetchSelectedSurvey, initialSurvey, resetStoredSurvey } = useSurveyEditorPageStore();
  const { reset: resetTemplateStore } = useTemplateMenuStore();
  const { reset: resetQuestionsContextMenu } = useQuestionsContextMenuStore();

  const { surveyId } = useParams();

  useEffect(() => {
    resetEditorPage();
  }, []);

  useEffect(() => {
    if (!surveyId) {
      return;
    }
    resetEditorPage();
    resetStoredSurvey();
    resetTemplateStore();
    resetQuestionsContextMenu();
    void fetchSelectedSurvey(surveyCreator, surveyId, false);
  }, [surveyId]);

  return (
    <PageLayout>
      {!initialSurvey ? <SurveyEditorLoadingPage /> : <SurveyEditorPage initialFormValues={initialSurvey} />}
    </PageLayout>
  );
};

export default SurveyEditorOpeningPage;
