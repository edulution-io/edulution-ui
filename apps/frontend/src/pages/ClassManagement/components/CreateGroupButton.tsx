import React from 'react';
import { Button } from '@/components/shared/Button';
import { MdAdd } from 'react-icons/md';

interface CreateGroupButtonProps {
  title: string;
  handleButtonClick: () => void;
}

const CreateGroupButton = ({ title, handleButtonClick }: CreateGroupButtonProps) => (
  <Button
    onClick={handleButtonClick}
    className="m-2 flex h-20 items-center justify-center p-2 px-4 py-0 font-normal hover:opacity-75"
  >
    <MdAdd className="h-8 w-8 text-card-foreground" />
    <span className="text-lg text-card-foreground">{title}</span>
  </Button>
);

export default CreateGroupButton;
