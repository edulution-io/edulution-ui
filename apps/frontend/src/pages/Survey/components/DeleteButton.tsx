import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconContext } from 'react-icons';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

export const CELL_BUTTON_DELETE_WIDTH = 50;

interface CellButtonDeleteProps {
  surveyName: string;
}

const DeleteButton = (props: CellButtonDeleteProps) => {
  const { surveyName } = props;
  const { deleteSurvey, getOpenSurveys, getAnsweredSurveys } = useSurveyStore();
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
              deleteSurvey(surveyName);
              await getOpenSurveys();
              await getAnsweredSurveys();
            }}
          >
            <IconContext.Provider value={iconContextValue}>
              <MdOutlineDeleteForever />
            </IconContext.Provider>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="rounded-lg bg-black p-4 text-white">{t('survey.delete')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DeleteButton;
