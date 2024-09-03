import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { ShareIcon } from '@/assets/icons';
import { Button } from '@/components/shared/Button';
import useShareUrlDialogStore from '@/components/shared/Dialog/useShareUrlDialogStore';

interface PublicCellProps {
  survey: SurveyDto;
}

const PublicCell = (props: PublicCellProps) => {
  const { survey } = props;

  const { t } = useTranslation();
  const { setIsOpen } = useShareUrlDialogStore();

  const label = survey && survey.isPublic ? t('common.yes') : t('common.no');

  return (
    <div className="flex items-center">
      {label}
      {survey && survey.isPublic ? (
        <Button
          type="button"
          variant="btn-collaboration"
          onClick={() => setIsOpen(true)}
          className="m-1 ml-2 flex h-8 items-center justify-center overflow-hidden p-0"
        >
          <img
            src={ShareIcon}
            alt="share-icon"
            width="35px"
          />
        </Button>
      ) : null}
    </div>
  );
};

export default PublicCell;
