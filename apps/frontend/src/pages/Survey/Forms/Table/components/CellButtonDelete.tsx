import React from 'react';
import { Button } from '@/components/shared/Button';
import { TableCell } from '@/components/ui/Table';
import { TrashIcon } from '@/assets/icons';

export const CELL_BUTTON_DELETE_WIDTH = 50;

interface CellButtonDeleteProps {
  surveyName: string;
  deleteSurvey: (surveyname: string) => void;
}

const CellButtonDelete = (props: CellButtonDeleteProps) => {
  const { surveyName, deleteSurvey } = props;
  return (
    <TableCell className={`max-w-[${CELL_BUTTON_DELETE_WIDTH}]`}>
      <Button
        type="button"
        variant="btn-outline"
        className="bg-opacity-90"
        onClick={() => deleteSurvey(surveyName)}
      >
        <img
          className="m-2"
          src={TrashIcon}
          alt="trash"
          width="25px"
        />
      </Button>
    </TableCell>
  );
};

export default CellButtonDelete;
