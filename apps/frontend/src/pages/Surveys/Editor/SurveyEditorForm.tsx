import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AiOutlineSave } from 'react-icons/ai';
import { FiFilePlus, FiFileMinus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';
import EmptyForm from '@libs/survey/types/empty-survey-form-data';
import InitialForm from '@libs/survey/types/initial-form';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';

const SurveyEditorForm = () => {
  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys, updateCreatedSurveys } = useSurveyTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    openSaveSurveyDialog,
    closeSaveSurveyDialog,

    updateOrCreateSurvey,
    isLoading,
    error,
  } = useSurveyEditorFormStore();

  const { t } = useTranslation();
  const initialFormValues: SurveyEditorFormData = useMemo(() => new InitialForm(selectedSurvey), [selectedSurvey]);

  const emptyFormValues: SurveyEditorFormData = new EmptyForm();

  const formSchema = z.object({
    id: z.number(),
    formula: z.any(),
    participants: z.array(
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
    saveNo: z.number().optional(),
    created: z.date().optional(),
    expirationDate: z.date().optional(),
    expirationTime: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    canSubmitMultipleAnswers: z.boolean().optional(),
    invitedGroups: z.array(z.object({})),
  });

  const form = useForm<SurveyEditorFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: selectedSurvey ? initialFormValues : emptyFormValues,
  });

  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id,
    formula,
    participants,
    participated,
    saveNo,
    created,
    expirationDate,
    expirationTime,
    isAnonymous,
    canSubmitMultipleAnswers,
  } = form.getValues();

  const saveSurvey = async () => {
    await updateOrCreateSurvey({
      _id,
      formula,
      participants,
      participated,
      saveNo,
      created,
      expirationDate,
      expirationTime,
      isAnonymous,
      canSubmitMultipleAnswers,
    });

    closeSaveSurveyDialog();
    await updateCreatedSurveys();
    await updateOpenSurveys();
    await updateAnsweredSurveys();
  };

  // useMemo to not update the SurveyEditor component when changing values in dialog
  const getSurveyEditor = useMemo(
    () => (
      <SurveyEditor
        form={form}
        formula={formula}
        saveNumber={saveNo}
        error={error}
      />
    ),
    [formula, saveNo],
  );

  if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
  return (
    <>
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ScrollArea className="overflow-y-auto overflow-x-hidden">
          {getSurveyEditor}
          {error ? toast.error(t(error.message)) : null}
        </ScrollArea>
      </div>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <FloatingActionButton
            icon={AiOutlineSave}
            text={t('common.save')}
            onClick={openSaveSurveyDialog}
          />
          <FloatingActionButton
            icon={FiFilePlus}
            text={t('survey.editor.new')}
            onClick={() => form.reset(emptyFormValues)}
          />
          <FloatingActionButton
            icon={FiFileMinus}
            text={t('survey.editor.abort')}
            onClick={() => form.reset(initialFormValues)}
          />
        </div>
      </TooltipProvider>
      <SaveSurveyDialog
        form={form}
        isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
        openSaveSurveyDialog={openSaveSurveyDialog}
        closeSaveSurveyDialog={closeSaveSurveyDialog}
        commitSurvey={saveSurvey}
        isCommitting={isLoading}
      />
    </>
  );
};

export default SurveyEditorForm;
