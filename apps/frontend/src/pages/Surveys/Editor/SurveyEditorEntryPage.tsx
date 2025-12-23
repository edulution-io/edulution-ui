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
import { useTranslation } from 'react-i18next';
import AttendeeDto from '@libs/user/types/attendee.dto';
import getCreatorFromUserDto from '@libs/survey/utils/getCreatorFromUserDto';
import useUserStore from '@/store/UserStore/useUserStore';
import SurveyEditorPage from '@/pages/Surveys/Editor/SurveyEditorPage';
import SurveyEditorTemplateGrid from '@/pages/Surveys/Editor/SurveyEditorTemplateGrid';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import DeleteTemplateDialog from '@/pages/Surveys/Editor/dialog/DeleteTemplateDialog';
import PageLayout from '@/components/structure/layout/PageLayout';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

const SurveyEditorEntryPage = () => {
  const { user } = useUserStore();
  const surveyCreator: AttendeeDto = useMemo(() => getCreatorFromUserDto(user), [user]);

  const {
    reset: resetEditorPage,
    fetchSelectedSurvey,
    initialSurvey,
    resetStoredSurvey,
    isFetching,
  } = useSurveyEditorPageStore();
  const { reset: resetTemplateStore } = useTemplateMenuStore();
  const { reset: resetQuestionsContextMenu } = useQuestionsContextMenuStore();

  const { surveyId } = useParams();

  const { t } = useTranslation();

  useEffect(() => {
    resetEditorPage();
    if (!surveyId) {
      return;
    }
    resetStoredSurvey();
    resetTemplateStore();
    resetQuestionsContextMenu();
    void fetchSelectedSurvey(surveyCreator, surveyId, false);
  }, [surveyCreator, surveyId]);

  if (isFetching) {
    return (
      <PageLayout>
        <div className="flex h-full w-full flex-col items-center justify-center">
          <CircleLoader />
          <p className="mt-4">{t('survey.editor.isLoadingSurvey')}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {initialSurvey ? (
        <SurveyEditorPage initialFormValues={initialSurvey} />
      ) : (
        <SurveyEditorTemplateGrid surveyCreator={surveyCreator} />
      )}
      <DeleteTemplateDialog />
    </PageLayout>
  );
};

export default SurveyEditorEntryPage;
