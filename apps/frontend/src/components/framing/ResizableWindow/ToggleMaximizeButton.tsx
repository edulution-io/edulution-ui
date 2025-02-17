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
import cn from '@libs/common/utils/className';
import { BiWindow, BiWindows } from 'react-icons/bi';
import { IconContext } from 'react-icons';

const ToggleMaximizeButton = ({
  handleMaximizeToggle,
  isMinimized,
  isMaximized,
}: {
  handleMaximizeToggle: () => void;
  isMinimized: boolean;
  isMaximized: boolean;
}) => {
  const iconContextValue = useMemo(() => ({ className: 'h-4 w-4' }), []);

  return (
    <button
      type="button"
      onClick={handleMaximizeToggle}
      className={cn('flex h-10 w-16 items-center justify-center p-5 text-sm hover:bg-gray-600', {
        'h-5 w-8 px-0': isMinimized,
      })}
    >
      <IconContext.Provider value={iconContextValue}>{isMaximized ? <BiWindows /> : <BiWindow />}</IconContext.Provider>
    </button>
  );
};

export default ToggleMaximizeButton;
