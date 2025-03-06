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
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SharePublicSurveyDialog from '@/pages/Surveys/Editor/dialog/SharePublicSurveyDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const SurveyEditorPage = () => {
  const { updateSelectedSurvey, isFetching, selectedSurvey } = useSurveyTablesPageStore();
  const { isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog, updateOrCreateSurvey, reset } = useSurveyEditorPageStore();

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
    mode: 'onSubmit',
    resolver: zodResolver(getSurveyEditorFormSchema(t)),
    defaultValues: initialFormValues,
  });

  const handleSaveSurvey = async (formula: SurveyFormula, saveNo: number) => {
    const {
      id,
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
        formula,
        saveNo,

        id,
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

  return (
    <>
      {isFetching ? <LoadingIndicator isOpen={isFetching} /> : null}
      <>
        <SurveyEditor
          initialFormula={initialFormValues?.formula || { title: t('survey.newTitle').toString() }}
          initialSaveNo={selectedSurvey?.saveNo || 0}
          saveSurvey={handleSaveSurvey}
          isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
          setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
          invitedAttendees={form.watch('invitedAttendees')}
          setInvitedAttendees={(value: AttendeeDto[]) =>
            form.setValue('invitedAttendees', value, { shouldValidate: true })
          }
          invitedGroups={form.watch('invitedGroups')}
          setInvitedGroups={(value: MultipleSelectorGroup[]) =>
            form.setValue('invitedGroups', value, { shouldValidate: true })
          }
          expires={form.watch('expires')}
          setExpires={(value: Date | undefined) => form.setValue('expires', value)}
          isAnonymous={form.watch('isAnonymous')}
          setIsAnonymous={(value: boolean | undefined) => form.setValue('isAnonymous', value)}
          isPublic={form.watch('isPublic')}
          setIsPublic={(value: boolean | undefined) => form.setValue('isPublic', value)}
          canSubmitMultipleAnswers={form.watch('canSubmitMultipleAnswers')}
          setCanSubmitMultipleAnswers={(value: boolean | undefined) => form.setValue('canSubmitMultipleAnswers', value)}
          canUpdateFormerAnswer={form.watch('canUpdateFormerAnswer')}
          setCanUpdateFormerAnswer={(value: boolean | undefined) => form.setValue('canUpdateFormerAnswer', value)}
        />
        <SharePublicSurveyDialog />
      </>
    </>
  );
};

export default SurveyEditorPage;
