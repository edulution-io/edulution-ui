import React, { useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InitialSurveyForm from '@libs/survey/constants/initial-survey-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyEditorFormStore from '@/pages/Surveys/Editor/useSurveyEditorFormStore';
import SurveyEditor from '@/pages/Surveys/Editor/components/SurveyEditor';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import SharePublicSurveyDialog from '@/pages/Surveys/Editor/dialog/SharePublicSurveyDialog';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import { useTranslation } from 'react-i18next';

interface SurveyEditorFormProps {
  editMode?: boolean;
}

const SurveyEditorForm = (props: SurveyEditorFormProps) => {
  const { editMode = false } = props;

  const { t } = useTranslation();
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

  const formSchema = z.object({
    id: z.number(),
    formula: z.object({
      title: z.string(),
      description: z.string().optional(),
      pages: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          elements: z.array(
            z.object({
              type: z.string(),
              name: z.string(),
              description: z.string().optional(),
              isRequired: z.boolean().optional(),
              choices: z
                .array(
                  z.object({
                    value: z.string(),
                    label: z.string(),
                  }),
                )
                .optional(),
              choicesByUrl: z
                .object({
                  url: z.string(),
                })
                .optional(),
            }),
          ),
        }),
      ),
    }),
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
    expires: z
      .string()
      .nullable()
      .optional()
      .refine((val) => !val || !Number.isNaN(Date.parse(val)), { message: t('common.invalid_date') })
      .transform((val) => (val ? new Date(val).toISOString() : null)),
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
