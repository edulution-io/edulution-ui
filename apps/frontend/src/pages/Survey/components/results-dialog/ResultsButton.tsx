import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconContext } from 'react-icons';
import { MdPlaylistAddCheck } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import { Survey } from '@/pages/Survey/backend-copy/model';
import useSurveyResultsDialogStore from '@/pages/Survey/components/results-dialog/SurveyResultsDialogStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

export const CELL_BUTTON_ANSWER_WIDTH = 100;

interface CellButtonAnswerProps {
  survey: Survey;
}

const ResultsButton = (props: CellButtonAnswerProps) => {
  const { survey } = props;
  const { setSurvey, getSurveyAnswer, openSurveyResultsDialog } = useSurveyResultsDialogStore();
  const { t } = useTranslation();

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5', color: 'white' }), []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="btn-outline"
            className="bg-opacity-90"
            onClick={async () => {
              setSurvey(survey);
              await getSurveyAnswer(survey.surveyname);
              openSurveyResultsDialog();
            }}
          >
            <IconContext.Provider value={iconContextValue}>
              <MdPlaylistAddCheck />
            </IconContext.Provider>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="rounded-lg bg-black p-4 text-white">{t('survey.result')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResultsButton;
