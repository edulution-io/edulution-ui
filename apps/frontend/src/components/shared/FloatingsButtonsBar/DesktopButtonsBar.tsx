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
import cn from '@libs/common/utils/className';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

import { FLOATING_BUTTONS_BAR_ID } from '@libs/common/constants/pageElementIds';

const DesktopButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { config } = props;
  const { buttons, keyPrefix } = config;

  const menuBar = useMenuBarConfig();

  const floatingButtons = buttons.map((conf, index) => {
    const { icon, text, onClick, isVisible = true, variant = 'button', options = undefined } = conf;
    return isVisible ? (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${keyPrefix}${index}`}>
        <FloatingActionButton
          variant={variant}
          icon={icon}
          text={text}
          onClick={onClick}
          options={options}
        />
      </div>
    ) : null;
  });
  return (
    <div
      id={FLOATING_BUTTONS_BAR_ID}
      className={cn(
        'fixed bottom-8 right-[var(--sidebar-width)] px-4',
        { 'left-0': menuBar.disabled },
        { 'left-64': !menuBar.disabled },
      )}
    >
      <div className="flex flex-grow-0 flex-wrap justify-start overflow-y-auto text-background">{floatingButtons}</div>
    </div>
  );
};

export default DesktopButtonsBar;
