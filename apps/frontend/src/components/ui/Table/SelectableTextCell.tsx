import React, { ReactElement } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Icon } from '@radix-ui/react-select';
import { Row } from '@tanstack/react-table';

interface SelectableTextCellProps<TData> {
  icon?: ReactElement;
  row?: Row<TData>;
  text: string;
  onClick?: () => void;
}

const SelectableTextCell = <TData,>({ icon, row, text, onClick }: SelectableTextCellProps<TData>) => {
  const isChecked = row?.getIsSelected();
  return (
    <div
      onClick={onClick}
      onKeyDown={onClick}
      tabIndex={0}
      role="button"
      className="flex items-center justify-between space-x-2 py-2 sm:justify-start"
    >
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
      <span className="text-md truncate font-medium">{text}</span>
    </div>
  );
};

export default SelectableTextCell;
