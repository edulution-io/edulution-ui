import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/shared/Button';
import { TableCell } from '@/components/ui/Table';
import { Survey } from '@/pages/Survey/backend-copy/model';
import { EditIcon } from '@/assets/icons';

export const CELL_BUTTON_EDIT_WIDTH = 50;

interface CellButtonEditProps {
  survey: Survey;
}

const CellButtonEdit = (props: CellButtonEditProps) => {
  const { survey } = props;
  return (
    <TableCell className={`max-w-[${CELL_BUTTON_EDIT_WIDTH}]`}>
      <Link
        to="/survey/forms/create/"
        state={survey}
        className="m-2"
      >
        <Button
          type="button"
          variant="btn-outline"
          className="bg-opacity-90"
        >
          <img
            className="m-2"
            src={EditIcon}
            alt="trash"
            width="25px"
          />
        </Button>
      </Link>
    </TableCell>
  );
};

export default CellButtonEdit;
