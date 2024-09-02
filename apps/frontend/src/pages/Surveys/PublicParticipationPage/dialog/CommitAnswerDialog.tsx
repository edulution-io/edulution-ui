import React from 'react';
import { useTranslation } from 'react-i18next';
import useParticipatePublicSurveyStore from '@/pages/Surveys/PublicParticipationPage/useParticipatePublicSurveyStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button, ButtonVariant } from '@/components/shared/Button';
import { Input } from '@/components/ui/Input';

const CommitAnswerDialog = () => {
  const { isOpenCommitAnswerDialog, username, setUsername, survey, answer, answerPublicSurvey, isSubmitting } =
    useParticipatePublicSurveyStore();

  const { t } = useTranslation();

  if (!survey) return null;

  const getDialogBody = () => (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center">
        <p className="mr-2 font-bold">{t('common.username')}:</p>
        <Input
          type="text"
          disabled={isSubmitting}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border"
        />
      </div>
      <Button
        type="button"
        variant={'btn-collaboration' as ButtonVariant}
        onClick={() => answerPublicSurvey(survey.id, survey.saveNo, answer, username)}
        disabled={!username || isSubmitting}
        className="self-end "
      >
        {t('common.submit')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenCommitAnswerDialog}
      handleOpenChange={() => {}}
      title={t('surveys.participateDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[50%]"
    />
  );
};

export default CommitAnswerDialog;
