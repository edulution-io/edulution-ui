import React from 'react';
import { useTranslation } from 'react-i18next';
import DropdownMenu, {DropdownOptions} from '@/components/ui/DropdownMenu/DropdownMenu';

interface ChoiceProps {
  index: number;
  name: string;
  assignee?: string;
}

const ItemAssignment = (props: ChoiceProps) => {
  const {
    index,
    name,
    assignee,
  } = props;

  const { t } = useTranslation();

  const [itemName, setItemName] = React.useState<string>(name);
  const [assignedPerson, setAssignedPerson] = React.useState<string | undefined>(assignee);

  const users = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
  const assignableTo: DropdownOptions[] = users.map(
    (str) => ({ id: str, name: str })
  );

  return (
    <div
      key={`choice_${name}_${index}`}
      className="inline-flex justify-between mt2 w-full pl-4 pr-4"
    >
      <input
        className="text-gray-800 flex-grow ml-4 mr-4 pl-4 pr-4 border shadow-sm"
        type="text"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      {/*<input*/}
      {/*  className="text-gray-800 flex-grow ml-4 mr-4 pl-4 pr-4 border shadow-sm"*/}
      {/*  type="text"*/}
      {/*  value={assignedPerson}*/}
      {/*  onChange={(e) => setAssignedPerson(e.target.value)}*/}
      {/*/>*/}
      <DropdownMenu
        options={assignableTo}
        selectedVal={assignedPerson || ''}
        handleChange={setAssignedPerson}
      />
    </div>
  )
};

export default ItemAssignment;
