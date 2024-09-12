import React, { useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EmptySurveyForm from '@libs/survey/constants/empty-survey-form';
import InitialSurveyForm from '@libs/survey/constants/initial-survey-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import SharePublicSurveyDialog from '@/pages/Surveys/Editor/dialog/SharePublicSurveyDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
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
  const emptyFormValues: SurveyDto = new EmptySurveyForm(surveyCreator);

  const initialFormValues: SurveyDto = useMemo(
    () => (editMode && selectedSurvey ? new InitialSurveyForm(surveyCreator, selectedSurvey) : emptyFormValues),
    [selectedSurvey],
  );

  const formSchema = z.object({
    id: z.number(),
    formula: z.any(),
    saveNo: z.number().optional(),
    creator: z.intersection(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        username: z.string(),
      }),
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
    invitedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    invitedGroups: z.array(z.object({})),
    participatedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    answers: z.any(),
    created: z.date().optional(),
    expires: z.date().optional(),
    isAnonymous: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    canSubmitMultipleAnswers: z.boolean().optional(),
  });

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
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

  const formulaWatcher = form.watch('formula');
  const saveNoWatcher = form.watch('saveNo');

  // useMemo to not update the SurveyEditor component when changing values in dialog
  const getSurveyEditor = useMemo(
    () => (
      <SurveyEditor
        form={form}
        formula={formulaWatcher}
        saveNumber={saveNoWatcher}
      />
    ),
    [formulaWatcher, saveNoWatcher],
  );

  const config: FloatingButtonsBarConfig = {
    buttons: [SaveButton(() => setIsOpenSaveSurveyDialog(true))],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ScrollArea className="overflow-y-auto overflow-x-hidden">{getSurveyEditor}</ScrollArea>
      </div>
      <FloatingButtonsBar config={config} />
      <SaveSurveyDialog
        form={form}
        isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
        setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
        commitSurvey={saveSurvey}
        isCommitting={isLoading}
      />
      <SharePublicSurveyDialog />
    </>
  );
};

export default SurveyEditorForm;
