import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InitialSurveyForm from '@libs/survey/constants/initial-survey-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useUserStore from '@/store/UserStore/UserStore';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import surveyEditorFormSchema from '@libs/survey/types/editor/surveyEditorForm.schema';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import SharePublicSurveyDialog from '@/pages/Surveys/Editor/dialog/SharePublicSurveyDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

interface SurveyEditorFormProps {
  editMode?: boolean;
}

const SurveyEditorForm = (props: SurveyEditorFormProps) => {
  const { editMode = false } = props;

  const { user } = useUserStore();

  const { selectedSurvey, updateUsersSurveys } = useSurveyTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    setIsOpenSaveSurveyDialog,

    updateOrCreateSurvey,
    isLoading,
  } = useSurveyEditorFormStore();

  if (!user || !user.username) {
    return null;
  }

  const surveyCreator: AttendeeDto = {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    value: user.username,
    label: `${user.firstName} ${user.lastName}`,
  };

  const initialFormValues: SurveyDto = useMemo(
    () => new InitialSurveyForm(surveyCreator, editMode && selectedSurvey ? selectedSurvey : undefined),
    [selectedSurvey],
  );

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(surveyEditorFormSchema),
    defaultValues: initialFormValues,
  });

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
      created,
      expires,
      isAnonymous,
      isPublic,
      canSubmitMultipleAnswers,
    } = form.getValues();

    await updateOrCreateSurvey({
      id,
      formula,
      saveNo,
      creator,
      invitedAttendees,
      invitedGroups,
      participatedAttendees,
      answers,
      created,
      expires,
      isAnonymous,
      isPublic,
      canSubmitMultipleAnswers,
    });

    void updateUsersSurveys();
    setIsOpenSaveSurveyDialog(false);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [SaveButton(() => setIsOpenSaveSurveyDialog(true))],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
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
  );
};

export default SurveyEditorForm;
