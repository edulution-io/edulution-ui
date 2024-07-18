import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { AiOutlineSave } from 'react-icons/ai';
import { FiFilePlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EmptySurveyForm from '@libs/survey/types/empty-survey-form-data';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SurveyDto from '@libs/survey/types/survey.dto';

const SurveyEditorForm = () => {
  const { updateOrCreateSurvey, isLoading, error } = useSurveyEditorFormStore();

  const { t } = useTranslation();

  const emptyFormValues: SurveyDto = new EmptySurveyForm();

  const formSchema = z.object({
    // SURVEY
    id: z.number(),
    formula: z.any(),
    saveNo: z.number().optional(),
    created: z.date().optional(),
    expirationDate: z.date().optional(),
    expirationTime: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    canSubmitMultipleAnswers: z.boolean().optional(),

    // ADDITIONAL
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
  });

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormValues,
  });

  const saveSurvey = async () => {
    const {
      invitedAttendees,
      invitedGroups,
      id,
      formula,
      saveNo,
      created,
      expirationDate,
      expirationTime,
      isAnonymous,
      canSubmitMultipleAnswers,
    } = form.getValues();

    await updateOrCreateSurvey({
      invitedAttendees,
      invitedGroups,
      id,
      formula,
      saveNo,
      created,
      expirationDate,
      expirationTime,
      isAnonymous,
      canSubmitMultipleAnswers,
    });
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
        error={error}
      />
    ),
    [formulaWatcher, saveNoWatcher],
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
            onClick={() => saveSurvey()}
          />
          <FloatingActionButton
            icon={FiFilePlus}
            text={t('survey.editor.new')}
            onClick={() => form.reset(emptyFormValues)}
          />
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveyEditorForm;
