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
import { useTranslation } from 'react-i18next';
import DropdownMenu from '@/components/shared/DropdownMenu';
import type FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';

const FloatingActionButton: React.FC<FloatingButtonConfig> = ({
  icon: Icon,
  text,
  onClick,
  type = 'button',
  variant = 'button',
  options = [],
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
            label: option.label,
            onClick: () => {
              if (option.onClick) option.onClick();
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
      <span className="max-w-24 justify-center overflow-hidden text-ellipsis whitespace-nowrap text-center text-background hover:max-w-28 hover:overflow-visible">
        {text}
      </span>
    </div>
  );
};

export default FloatingActionButton;
