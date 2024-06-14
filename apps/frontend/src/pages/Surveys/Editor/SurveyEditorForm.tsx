import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { FiFilePlus, FiFileMinus } from 'react-icons/fi';
import { AiOutlineSave } from 'react-icons/ai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import { Survey } from '@/pages/Surveys/types/survey';
import ISurveyEditorForm from '@/pages/Surveys/Editor/components/survey-editor-form';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import {
  getEmptyFormValues,
  getInitialFormValues,
} from '@/pages/Surveys/Editor/components/get-survey-editor-form-data';

interface SurveyEditorFormProps {
  selectedSurvey?: Survey;
  updateCreatedSurveys: () => void;
  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;
}

const SurveyEditorForm = (props: SurveyEditorFormProps) => {
  const { selectedSurvey, updateCreatedSurveys, updateAnsweredSurveys, updateOpenSurveys } = props;
  const {
    isOpenSaveSurveyDialog,
    openSaveSurveyDialog,
    closeSaveSurveyDialog,
    commitSurvey,
    isCommiting,
    errorCommiting,
  } = useSurveyEditorFormStore();

  const { t } = useTranslation();

  const initialFormValues: ISurveyEditorForm = getInitialFormValues(selectedSurvey);

  const emptyFormValues: ISurveyEditorForm = getEmptyFormValues();

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

  const form = useForm<ISurveyEditorForm>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
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
      updateCreatedSurveys();
      updateOpenSurveys();
      updateAnsweredSurveys();
    } catch (error) {
      toast.error(error);
    }
  };

  // useMemo to not update the SurveyEditor component when changing values in dialog
  const getSurveyEditor = useMemo(() => {
    return (
      <SurveyEditor
        form={form}
        formula={formula}
        saveNumber={saveNo}
        error={errorCommiting}
      />
    );
  }, [formula, saveNo]);

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
            text={t('save')}
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
