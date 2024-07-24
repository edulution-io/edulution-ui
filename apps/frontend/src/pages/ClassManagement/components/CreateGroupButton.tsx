import React from 'react';
import { Button } from '@/components/shared/Button';
import { MdAdd } from 'react-icons/md';

interface CreateGroupButtonProps {
  title: string;
  handleButtonClick: () => void;
}

const CreateGroupButton = ({ title, handleButtonClick }: CreateGroupButtonProps) => {
  return (
    <Button
      onClick={handleButtonClick}
      className="flex items-center justify-center px-4 py-0 font-normal"
    >
      <MdAdd className="h-8 w-8 text-card-foreground" />
      <span className="text-lg text-card-foreground">{title}</span>
    </Button>
  );
};

export default CreateGroupButton;
