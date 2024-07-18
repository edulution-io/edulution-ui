import React, { useMemo } from 'react';
import { Button } from '@/components/shared/Button';
import {
  DropdownMenuContent as Content,
  DropdownMenuItem as MenuItem,
  DropdownMenuSH as DropdownMenu,
  DropdownMenuTrigger as Trigger,
} from '@/components/ui/DropdownMenuSH';
import { IconContext, IconType } from 'react-icons';
import { DropdownOption } from '@libs/ui/types/filesharing/fileCreationDropDownOptions';
import { FileTypeKey } from '@libs/ui/types/filesharing/FileTypeKey';
import AVAILABLE_FILE_TYPES from '@libs/ui/types/filesharing/AvailableFileTypes';

interface FloatingActionButtonProps {
  icon: IconType;
  text: string;
  onClick?: () => void;
  variant?: 'button' | 'dropdown';
  options?: DropdownOption[];
  onSelectFileSelect?: (fileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey]) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  text,
  onClick,
  variant = 'button',
  options = [],
  onSelectFileSelect,
}) => {
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  const renderContent = () => {
    if (variant === 'dropdown' && options.length > 0) {
      return (
        <DropdownMenu>
          <Trigger asChild>
            <Button
              type="button"
              variant="btn-hexagon"
              className="bg-opacity-90 p-4"
            >
              <IconContext.Provider value={iconContextValue}>
                <Icon />
              </IconContext.Provider>
            </Button>
          </Trigger>
          <Content>
            {options.map((option) => (
              <MenuItem
                key={option.title}
                onSelect={() => {
                  if (onSelectFileSelect) {
                    onSelectFileSelect(option.type);
                  }
                  if (onClick) {
                    onClick();
                  }
                }}
              >
                <div className="flex flex-row items-center space-x-2">
                  <option.icon style={{ color: option.iconColor }} />
                  <span>{option.title}</span>
                </div>
              </MenuItem>
            ))}
          </Content>
        </DropdownMenu>
      );
    }
    return (
      <Button
        type="button"
        variant="btn-hexagon"
        className="bg-opacity-90 p-4"
        onClick={onClick}
      >
        <IconContext.Provider value={iconContextValue}>
          <Icon />
        </IconContext.Provider>
      </Button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center space-x-2">
      {renderContent()}
      <p className="justify-center text-center">{text}</p>
    </div>
  );
};

export default FloatingActionButton;
