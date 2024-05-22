import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconContext } from 'react-icons';
import { MdEdit } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import { Survey } from '@/pages/Survey/backend-copy/model';
import useEditSurveyDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

export const CELL_BUTTON_EDIT_WIDTH = 50;

interface CellButtonEditProps {
  survey: Survey;
}

const EditButton = (props: CellButtonEditProps) => {
  const { survey } = props;
  const { setSurvey, openEditSurveyDialog } = useEditSurveyDialogStore();
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
              openEditSurveyDialog();
            }}
          >
            <IconContext.Provider value={iconContextValue}>
              <MdEdit />
            </IconContext.Provider>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="rounded-lg bg-black p-4 text-white">{t('survey.edit')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EditButton;
