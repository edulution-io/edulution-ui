import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconContext } from 'react-icons';
import { MdPlaylistAdd } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import { Survey } from '@/pages/Survey/backend-copy/model';
import useParticipateSurveyDialogStore from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialogStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

export const CELL_BUTTON_PARTICIPATE_WIDTH = 100;

interface CellButtonParticipateProps {
  survey: Survey;
}

const ParticipateButton = (props: CellButtonParticipateProps) => {
  const { survey } = props;
  const { setSurvey, openParticipateSurveyDialog } = useParticipateSurveyDialogStore();
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
            onClick={() => {
              setSurvey(survey);
              openParticipateSurveyDialog();
            }}
          >
            <IconContext.Provider value={iconContextValue}>
              <MdPlaylistAdd />
            </IconContext.Provider>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="rounded-lg bg-black p-4 text-white">{t('survey.participate')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ParticipateButton;
