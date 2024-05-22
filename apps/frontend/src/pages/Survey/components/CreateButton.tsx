import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconContext } from 'react-icons';
import { MdAdd } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import useEditSurveyDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

const CreateButton = () => {
  const { setSurvey, openEditSurveyDialog } = useEditSurveyDialogStore();
  const { t } = useTranslation();

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5', color: 'white' }), []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="btn-hexagon"
            className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
            onClick={() => {
              setSurvey(undefined);
              openEditSurveyDialog();
            }}
          >
            <IconContext.Provider value={iconContextValue}>
              <MdAdd />
            </IconContext.Provider>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="rounded-lg bg-black p-4 text-white">{t('survey.create')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CreateButton;
