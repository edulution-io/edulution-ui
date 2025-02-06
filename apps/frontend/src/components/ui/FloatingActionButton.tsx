/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useMemo } from 'react';
import { Button } from '@/components/shared/Button';
import { IconContext, IconType } from 'react-icons';
import { DropdownOption } from '@libs/filesharing/types/fileCreationDropDownOptions';
import { useTranslation } from 'react-i18next';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import DropdownMenu from '@/components/shared/DropdownMenu';

interface FloatingActionButtonProps {
  icon: IconType;
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'button' | 'dropdown';
  options?: DropdownOption[];
  onSelectFileSelect?: (fileType: TAvailableFileTypes) => void;
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
        <DropdownMenu
          trigger={
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
          }
          items={options.map((option) => ({
            label: option.title,
            onClick: () => {
              if (onSelectFileSelect) onSelectFileSelect(option.type);
              if (onClick) onClick();
            },
            icon: option.icon as IconType,
            iconColor: option.iconColor,
          }))}
        />
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
