import React, { FC, ReactElement } from 'react';
import { MdAdd, MdContentCopy, MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '@/components/shared/Button';

interface CardProps {
  icon?: ReactElement;
  title: string;
  isComponentSelected?: boolean;
  participants?: number;
  showActions?: boolean;
  isAddNew?: boolean;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onItemClicked?: () => void;
}

const GroupCard: FC<CardProps> = ({
  icon,
  title,
  participants = 0,
  showActions = true,
  isAddNew = false,
  onEdit,
  onCopy,
  onDelete,
  onAdd,
  onItemClicked,
  isComponentSelected = false,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (onItemClicked) {
        onItemClicked();
        event.preventDefault();
      }
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>, callback?: () => void) => {
    event.stopPropagation();
    if (callback) {
      callback();
    }
  };

  const containerClasses = `flex w-64 flex-col rounded-lg p-4 shadow 
    ${isAddNew ? 'items-center justify-center border border-orange-400' : 'border border-gray-200'} 
    ${isComponentSelected ? 'bg-orange-500' : 'hover:bg-gray-500'}
    ${showActions && !isAddNew ? 'h-28' : ''}`;

  return (
    <div
      className={containerClasses}
      onClick={onItemClicked}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      {isAddNew ? (
        <Button
          onClick={(event) => handleButtonClick(event, onAdd)}
          className="flex items-center justify-center p-4"
        >
          <MdAdd className="mr-2 h-8 w-8 text-white" />
          <span className="text-lg font-bold text-white">{title}</span>
        </Button>
      ) : (
        <>
          <div className="flex flex-row items-center">
            {icon}
            <div className="ml-2 flex-grow">
              <p className="truncate text-lg font-bold">{title}</p>
              <p className="text-sm text-white">{participants} participants</p>
            </div>
          </div>
          {showActions && (
            <div className="flex justify-end">
              <Button
                className="text-white hover:text-blue-500"
                onClick={(event) => handleButtonClick(event, onEdit)}
              >
                <MdEdit className="text-xl" />
              </Button>
              <Button
                className="text-white hover:text-green-500"
                onClick={(event) => handleButtonClick(event, onCopy)}
              >
                <MdContentCopy className="text-xl" />
              </Button>
              <Button
                className="text-white hover:text-red-500"
                onClick={(event) => handleButtonClick(event, onDelete)}
              >
                <MdDelete className="text-xl" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupCard;
