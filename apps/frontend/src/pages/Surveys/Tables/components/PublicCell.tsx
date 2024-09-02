import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useShareUrlDialogStore from '@/components/shared/Dialog/useShareUrlDialogStore';
import { Button } from '@/components/shared/Button';
import { ShareIcon } from '@/assets/icons';

interface PublicCellProps {
  survey: SurveyDto;
}

const PublicCell = (props: PublicCellProps) => {
  const { survey } = props;

  const { t } = useTranslation();
  const { isOpen, setIsOpen } = useShareUrlDialogStore();

  const label = survey && survey.isPublic ? t('common.yes') : t('common.no');

  return (
    <div className="flex items-center">
      {label}
      <Button
        type="button"
        variant="btn-collaboration"
        onClick={() => setIsOpen(!isOpen)}
        className="m-1 ml-2 flex h-8 items-center justify-center overflow-hidden p-0"
      >
        <img
          src={ShareIcon}
          alt="share-icon"
          width="35px"
        />
      </Button>
    </div>
  );
};

export default PublicCell;
