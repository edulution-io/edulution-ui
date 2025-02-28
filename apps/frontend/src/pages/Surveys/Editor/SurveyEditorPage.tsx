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
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import getInitialSurveyFormValues from '@libs/survey/constants/initial-survey-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import { CREATED_SURVEYS_PAGE } from '@libs/survey/constants/surveys-endpoint';
import getSurveyEditorFormSchema from '@libs/survey/types/editor/surveyEditorForm.schema';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import SharePublicSurveyDialog from '@/pages/Surveys/Editor/dialog/SharePublicSurveyDialog';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

const SurveyEditorPage = () => {
  const { updateSelectedSurvey, isFetching, selectedSurvey, updateUsersSurveys } = useSurveyTablesPageStore();
  const { isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog, updateOrCreateSurvey, isLoading, reset } =
    useSurveyEditorPageStore();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { user } = useUserStore();

  const { surveyId } = useParams();

  useEffect(() => {
    reset();
    void updateSelectedSurvey(surveyId, false);
  }, [surveyId]);

  const initialFormValues: SurveyDto | undefined = useMemo(() => {
    if (!user || !user.username) {
      return undefined;
    }

    const surveyCreator: AttendeeDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      value: user.username,
      label: `${user.firstName} ${user.lastName}`,
    };
    return getInitialSurveyFormValues(surveyCreator, selectedSurvey);
  }, [selectedSurvey]);

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(getSurveyEditorFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    form.reset(initialFormValues);
  }, [initialFormValues]);

  const saveSurvey = async () => {
    const {
      id,
      formula,
      saveNo,
      creator,
      invitedAttendees,
      invitedGroups,
      participatedAttendees,
      answers,
      createdAt,
      expires,
      isAnonymous,
      isPublic,
      canSubmitMultipleAnswers,
      canUpdateFormerAnswer,
    } = form.getValues();

    try {
      await updateOrCreateSurvey({
        id,
        formula,
        saveNo,
        creator,
        invitedAttendees,
        invitedGroups,
        participatedAttendees,
        answers,
        createdAt,
        expires,
        isAnonymous,
        isPublic,
        canSubmitMultipleAnswers,
        canUpdateFormerAnswer,
      });

      void updateUsersSurveys();
      setIsOpenSaveSurveyDialog(false);

      toast.success(t('survey.editor.saveSurveySuccess'));
      navigate(`/${CREATED_SURVEYS_PAGE}`);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.status === 413) {
        toast.error(t('survey.errors.surveyTooBig'));
      } else {
        toast.error(t('survey.errors.updateOrCreateError'));
      }
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [SaveButton(() => setIsOpenSaveSurveyDialog(true))],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <>
      {isLoading ? <LoadingIndicatorDialog isOpen={isLoading} /> : null}
      {isFetching ? (
        <LoadingIndicatorDialog isOpen={isFetching} />
      ) : (
        <>
          <SurveyEditor form={form} />
          <FloatingButtonsBar config={config} />
          <SaveSurveyDialog
            form={form}
            isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
            setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
            submitSurvey={saveSurvey}
            isSubmitting={isLoading}
          />
          <SharePublicSurveyDialog />
        </>
      )}
    </>
  );
};

export default SurveyEditorPage;
