import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InitialSurveyForm from '@libs/survey/constants/initial-survey-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import surveyEditorFormSchema from '@libs/survey/types/editor/surveyEditorForm.schema';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import SharePublicSurveyDialog from '@/pages/Surveys/Editor/dialog/SharePublicSurveyDialog';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const SurveyEditorPage = () => {
  const { updateSelectedSurvey, isFetching, selectedSurvey, updateUsersSurveys } = useSurveyTablesPageStore();
  const { isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog, updateOrCreateSurvey, isLoading, reset } =
    useSurveyEditorPageStore();
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
    return new InitialSurveyForm(surveyCreator, selectedSurvey);
  }, [selectedSurvey]);

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(surveyEditorFormSchema),
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
      {isFetching ? (
        <LoadingIndicator isOpen={isFetching} />
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
