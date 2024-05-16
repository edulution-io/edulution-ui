import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { TableCell } from '@/components/ui/Table';
import { Survey } from '@/pages/Survey/backend-copy/model';

export const CELL_BUTTON_PARTICIPATE_WIDTH = 100;

interface CellButtonParticipateProps {
  survey: Survey;
}

const CellButtonParticipate = (props: CellButtonParticipateProps) => {
  const { survey } = props;
  const { t } = useTranslation();
  return (
    <TableCell className={`max-w-[${CELL_BUTTON_PARTICIPATE_WIDTH}]`}>
      <Link
        to="/survey/forms/participate/"
        state={survey}
        className="m-2"
      >
        <Button
          type="button"
          variant="btn-outline"
          className="bg-opacity-90"
        >
          {t('survey.forms.participate')}
        </Button>
      </Link>
    </TableCell>
  );
};

export default CellButtonParticipate;
