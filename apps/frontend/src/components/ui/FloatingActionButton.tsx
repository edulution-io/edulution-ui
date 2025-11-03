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
import { IconContext } from 'react-icons';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '@/components/shared/DropdownMenu';
import type FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';

export const FLOATING_BUTTON_CLASS_NAME =
  'w-24 justify-center overflow-hidden text-ellipsis whitespace-nowrap text-center leading-tight text-background hover:max-w-28 hover:overflow-visible md:leading-[inherit]';

const FloatingActionButton: React.FC<FloatingButtonConfig> = ({
  icon: Icon,
  text,
  onClick,
  type = 'button',
  variant = 'button',
  dropdownItems = [],
}) => {
  const { t } = useTranslation();
  const iconContextValue = useMemo(() => ({ className: 'h-6 w-6 m-4 md:h-8 md:w-8 md:m-5' }), []);

  const renderContent = () => {
    if (variant === 'dropdown' && dropdownItems.length > 0) {
      return (
        <DropdownMenu
          trigger={
            <Button
              type="button"
              variant="btn-hexagon"
              className="bg-opacity-90 p-1"
              hexagonIconAltText={t('common.showOptions')}
            >
              <IconContext.Provider value={iconContextValue}>
                <Icon />
              </IconContext.Provider>
            </Button>
          }
          items={dropdownItems}
        />
      );
    }

    return (
      <Button
        type={type}
        variant="btn-hexagon"
        className="bg-opacity-90 p-1 md:p-4"
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
    <div className="flex flex-col items-center justify-center pr-1 md:pt-1">
      {renderContent()}
      <span className={FLOATING_BUTTON_CLASS_NAME}>{text}</span>
    </div>
  );
};

export default FloatingActionButton;
