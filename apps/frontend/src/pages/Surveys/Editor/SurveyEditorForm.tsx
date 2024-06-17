import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AiOutlineSave } from 'react-icons/ai';
import { FiFilePlus, FiFileMinus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SurveyEditorFormData from '@libs/survey/types/survey-editor-form-data';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import {
  getEmptyFormValues,
  getInitialFormValues,
} from '@/pages/Surveys/Editor/components/get-survey-editor-form-data';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import FloatingActionButton from '@/components/shared/FloatingActionButton';

const SurveyEditorForm = () => {
  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys, updateCreatedSurveys } = useSurveyTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    openSaveSurveyDialog,
    closeSaveSurveyDialog,
    commitSurvey,
    isCommiting,
    errorCommiting,
  } = useSurveyEditorFormStore();

  const { t } = useTranslation();

  const initialFormValues: SurveyEditorFormData = useMemo(() => getInitialFormValues(selectedSurvey), [selectedSurvey]);

  const emptyFormValues: SurveyEditorFormData = getEmptyFormValues();

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
    id,
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
    try {
      await commitSurvey(
        id,
        formula,
        participants,
        participated,
        saveNo,
        created,
        expirationDate,
        expirationTime,
        isAnonymous,
        canSubmitMultipleAnswers,
      );

      closeSaveSurveyDialog();
      await updateCreatedSurveys();
      await updateOpenSurveys();
      await updateAnsweredSurveys();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      toast.error(<div>{error.message}</div>);
    }
  };

  // useMemo to not update the SurveyEditor component when changing values in dialog
  const getSurveyEditor = useMemo(
    () => (
      <SurveyEditor
        form={form}
        formula={formula}
        saveNumber={saveNo}
        error={errorCommiting}
      />
    ),
    [formula, saveNo],
  );

  if (isCommiting) return <LoadingIndicator isOpen={isCommiting} />;
  return (
    <>
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ScrollArea className="overflow-y-auto overflow-x-hidden">
          {getSurveyEditor}
          {errorCommiting ? (
            <div className="rounded-xl bg-red-400 py-3 text-center text-black">
              {t('survey.error')}: {errorCommiting.message}
            </div>
          ) : null}
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
        isCommitting={isCommiting}
      />
    </>
  );
};

export default SurveyEditorForm;
