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

import React from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

const DesktopFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { config } = props;
  const { buttons, keyPrefix } = config;

  const floatingButtons = buttons.map((conf) => {
    const { icon, text, onClick, isVisible = true, variant = 'button', dropdownItems = undefined } = conf;
    return isVisible ? (
      <div key={`${keyPrefix}${text}`}>
        <FloatingActionButton
          variant={variant}
          icon={icon}
          text={text}
          onClick={onClick}
          dropdownItems={dropdownItems}
        />
      </div>
    ) : null;
  });
  return (
    <div className="flex flex-grow-0 flex-wrap justify-start overflow-y-auto pt-1 text-background">
      {floatingButtons}
    </div>
  );
};

export default DesktopFloatingButtonsBar;
