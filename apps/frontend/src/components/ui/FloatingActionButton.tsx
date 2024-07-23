import React, { useMemo } from 'react';
import { Button } from '@/components/shared/Button';
import { IconContext, IconType } from 'react-icons';

interface FloatingActionButtonProps {
  icon: IconType;
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ icon: Icon, text, onClick, type = 'button' }) => {
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <div className="flex flex-col items-center justify-center space-x-2">
      <Button
        type={type}
        variant="btn-hexagon"
        className="bg-opacity-90 p-4"
        onClick={onClick}
      >
        <IconContext.Provider value={iconContextValue}>
          <Icon />
        </IconContext.Provider>
      </Button>
      <p className="justify-center text-center">{text}</p>
    </div>
  );
};

export default FloatingActionButton;
