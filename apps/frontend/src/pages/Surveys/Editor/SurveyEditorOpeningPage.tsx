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
