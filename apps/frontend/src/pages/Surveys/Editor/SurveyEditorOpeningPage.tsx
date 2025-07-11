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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import getInitialSurveyFormValues from '@libs/survey/constants/initial-survey-form';
import useUserStore from '@/store/UserStore/useUserStore';
import SurveyEditorPage from '@/pages/Surveys/Editor/SurveyEditorPage';
import SurveyEditorLoadingPage from '@/pages/Surveys/Editor/SurveyEditorLoadingPage';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import PageLayout from '@/components/structure/layout/PageLayout';

const SurveyEditorOpeningPage = () => {
  const { user } = useUserStore();
  const surveyCreator: AttendeeDto | undefined = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      value: user?.username || '',
      label: `${user?.firstName} ${user?.lastName}` || '',
    }),
    [user],
  );

  const { fetchSelectedSurvey, selectedSurvey } = useSurveysTablesPageStore();
  const { reset: resetEditorPage, storedSurvey, resetStoredSurvey } = useSurveyEditorPageStore();
  const { reset: resetTemplateStore } = useTemplateMenuStore();
  const { reset: resetQuestionsContextMenu } = useQuestionsContextMenuStore();

  const { surveyId } = useParams();

  useEffect(() => {
    resetEditorPage();
    resetStoredSurvey();
    resetTemplateStore();
    resetQuestionsContextMenu();
    void fetchSelectedSurvey(surveyId, false);
  }, [surveyId]);

  const [initialValues, setInitialValues] = React.useState<SurveyDto | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!selectedSurvey) {
      return;
    }

    resetStoredSurvey();
    resetTemplateStore();
    resetQuestionsContextMenu();

    if (!surveyCreator) {
      return;
    }
    const initialFormValues = getInitialSurveyFormValues(surveyCreator, selectedSurvey, storedSurvey);
    setInitialValues(initialFormValues);
  }, [selectedSurvey, storedSurvey, user]);

  return (
    <PageLayout>
      {!initialValues ? <SurveyEditorLoadingPage /> : <SurveyEditorPage initialFormValues={initialValues} />}
    </PageLayout>
  );
};

export default SurveyEditorOpeningPage;
