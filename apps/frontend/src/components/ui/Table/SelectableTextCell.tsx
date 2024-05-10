import React, { ReactElement } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Row } from '@tanstack/react-table';
import { Icon } from '@radix-ui/react-select';

interface SelectableTextCellProps<TData> {
  icon?: ReactElement;
  row?: Row<TData>;
  text: string;
  onClick?: () => void;
}

const SelectableTextCell = <TData,>({ icon, row, text, onClick }: SelectableTextCellProps<TData>) => {
  const isChecked = row?.getIsSelected();
  return (
    <div className="flex items-center justify-between space-x-2 py-2 sm:justify-start">
      {row ? (
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => {
            row.toggleSelected(!!checked);
          }}
          aria-label="Select row"
        />
      ) : null}
      {icon ? <Icon className="mb-3 ml-2 mr-2 mt-3">{icon}</Icon> : null}
      <div onClick={onClick}>
        <p className="text-md truncate font-medium">{text}</p>
      </div>
    </div>
  );
};

export default SelectableTextCell;
