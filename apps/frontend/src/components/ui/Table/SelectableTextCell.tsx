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

  const handleCheckboxChange = (checked: boolean) => {
    row?.toggleSelected(checked);
  };

  return (
    <div className="flex items-center justify-between space-x-2 py-2 sm:justify-start">
      {row && (
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
          aria-label="Select row"
        />
      )}
      {icon ? <Icon className="mb-3 ml-2 mr-2 mt-3">{icon}</Icon> : null}
      <span
        className="text-md cursor-pointer truncate font-medium"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.();
          }
        }}
        role="button"
        tabIndex={0}
        style={{ userSelect: 'none' }}
      >
        {text}
      </span>
    </div>
  );
};

export default SelectableTextCell;
