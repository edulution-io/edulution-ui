import React from 'react';
import mongoose from 'mongoose';
import { CompleteEvent } from 'survey-core';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface ParticipateDialogProps {
  survey?: SurveyDto;
  answer: JSON;
  setAnswer: (answer: JSON) => void;
  pageNo: number;
  setPageNo: (pageNo: number) => void;
  commitAnswer: (
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    options?: CompleteEvent | undefined,
  ) => Promise<void>;
}

const ParticipateDialog = (props: ParticipateDialogProps) => {
  const { survey, answer, setAnswer, pageNo, setPageNo, commitAnswer } = props;

  const { t } = useTranslation();

  if (!survey) {
    return <h4 className="transform(-50%,-50%) absolute right-1/2 top-1/2">{t('survey.notFound')}</h4>;
  }

  return (
    <ScrollArea>
      <ParticipateDialogBody
        surveyId={survey.id}
        saveNo={survey.saveNo}
        formula={survey.formula}
        answer={answer}
        setAnswer={setAnswer}
        pageNo={pageNo}
        setPageNo={setPageNo}
        commitAnswer={commitAnswer}
        updateOpenSurveys={() => {}}
        updateAnsweredSurveys={() => {}}
        className="survey-participation"
      />
    </ScrollArea>
  );
};

export default ParticipateDialog;
