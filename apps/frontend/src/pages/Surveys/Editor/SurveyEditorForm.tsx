import React, { useMemo } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AiOutlineSave } from 'react-icons/ai';
import { FiFileMinus, FiFilePlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SurveyDto from '@libs/survey/types/survey.dto';
import EmptySurveyForm from '@libs/survey/types/empty-survey-form';
import InitialSurveyForm from '@libs/survey/types/initial-survey-form';
import useUserStore from '@/store/UserStore/UserStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface SurveyEditorFormProps {
  editMode?: boolean;
}

const SurveyEditorForm = (props: SurveyEditorFormProps) => {
  const { editMode = false } = props;

  const { user } = useUserStore();

  if (!user || !user.username) {
    throw new Error('The user and his username have to be defined');
  }

  const { selectedSurvey, updateUsersSurveys } = useSurveyTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    setIsOpenSaveSurveyDialog,

    updateOrCreateSurvey,
    isLoading,
  } = useSurveyEditorFormStore();

  const { t } = useTranslation();

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
    expirationDate: z.date().optional(),
    expirationTime: z.string().optional(),
    isAnonymous: z.boolean().optional(),
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
      expirationDate,
      expirationTime,
      isAnonymous,
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
      expirationDate,
      expirationTime,
      isAnonymous,
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

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ScrollArea className="overflow-y-auto overflow-x-hidden">{getSurveyEditor}</ScrollArea>
      </div>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <FloatingActionButton
            icon={AiOutlineSave}
            text={t('common.save')}
            onClick={() => setIsOpenSaveSurveyDialog(true)}
          />
          <FloatingActionButton
            icon={FiFilePlus}
            text={t('survey.editor.new')}
            onClick={() => form.reset(emptyFormValues)}
          />
          {editMode ? (
            <FloatingActionButton
              icon={FiFileMinus}
              text={t('survey.editor.abort')}
              onClick={() => form.reset(initialFormValues)}
            />
          ) : null}
        </div>
      </TooltipProvider>
      <SaveSurveyDialog
        form={form}
        isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
        setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
        commitSurvey={saveSurvey}
        isCommitting={isLoading}
      />
    </>
  );
};

export default SurveyEditorForm;
