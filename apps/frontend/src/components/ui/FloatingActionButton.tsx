import React, { useMemo } from 'react';
import { Button } from '@/components/shared/Button';
import {
  DropdownMenuContent as Content,
  DropdownMenuItem as MenuItem,
  DropdownMenuSH as DropdownMenu,
  DropdownMenuTrigger as Trigger,
} from '@/components/ui/DropdownMenuSH';
import { IconContext, IconType } from 'react-icons';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/types/availableFileTypes';
import { FileTypeKey } from '@libs/filesharing/types/fileTypeKey';
import { useTranslation } from 'react-i18next';

interface FloatingActionButtonProps {
  icon: IconType;
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'button' | 'dropdown';
  options?: DropdownOption[];
  onSelectFileSelect?: (fileType: (typeof AVAILABLE_FILE_TYPES)[FileTypeKey]) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  text,
  onClick,
  type = 'button',
  variant = 'button',
  options = [],
  onSelectFileSelect,
}) => {
  const { t } = useTranslation();
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
              hexagonIconAltText={t('common.showOptions')}
            >
              <IconContext.Provider value={iconContextValue}>
                <Icon />
              </IconContext.Provider>
            </Button>
          </Trigger>
          <Content className="z-[100]">
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
        type={type}
        variant="btn-hexagon"
        className="bg-opacity-90 p-4"
        onClick={onClick}
        hexagonIconAltText={text}
      >
        <IconContext.Provider value={iconContextValue}>
          <Icon />
        </IconContext.Provider>
      </Button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {renderContent()}
      <p className="whitespace-prewrap max-w-25 top-0 justify-center overflow-hidden text-center">{text}</p>
    </div>
  );
};

export default FloatingActionButton;
