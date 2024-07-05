import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { IconContext } from 'react-icons';
import { useTranslation } from 'react-i18next';
import { AiOutlineSave } from 'react-icons/ai';
import { FiFilePlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EmptySurveyForm from '@libs/survey/types/empty-survey-form-data';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/SurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SurveyDto from '@libs/survey/types/survey.dto';

const SurveyEditorForm = () => {
  const { updateOrCreateSurvey, isLoading, error } = useSurveyEditorFormStore();

  const { t } = useTranslation();

  const emptyFormValues: SurveyDto = new EmptySurveyForm();

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

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: emptyFormValues,
  });

  const saveSurvey = async () => {
    const {
      participants,

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
      participants,

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

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
  return (
    <>
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ScrollArea className="overflow-y-auto overflow-x-hidden">
          {getSurveyEditor}
          {error ? toast.error(error.message) : null}
        </ScrollArea>
      </div>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <div className="flex flex-col items-center justify-center space-x-2">
            <Button
              type="submit"
              variant="btn-hexagon"
              className="bottom-10 space-x-8 bg-opacity-90 p-4"
              onClick={() => saveSurvey()}
            >
              <IconContext.Provider value={iconContextValue}>
                <AiOutlineSave />
              </IconContext.Provider>
            </Button>
            <p className="justify-center text-center text-white">{t('common.save')}</p>
          </div>
          <div className="flex flex-col items-center justify-center space-x-2">
            <Button
              type="button"
              variant="btn-hexagon"
              className="bottom-10 space-x-8 bg-opacity-90 p-4"
              onClick={() => form.reset(emptyFormValues)}
            >
              <IconContext.Provider value={iconContextValue}>
                <FiFilePlus />
              </IconContext.Provider>
            </Button>
            <p className="justify-center text-center text-white">{t('survey.editor.new')}</p>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveyEditorForm;
