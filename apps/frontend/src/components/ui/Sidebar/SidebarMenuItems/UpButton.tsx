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
import { IconContext } from 'react-icons';
import { MdArrowDropUp } from 'react-icons/md';
import { SidebarArrowButtonProps } from '@libs/ui/types/sidebar/sidebarArrowButtonProps';

const UpButton: React.FC<SidebarArrowButtonProps> = ({ onClick }) => {
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div key="up">
      <button
        type="button"
        className="relative right-0 z-10 w-full cursor-pointer border-b-2 border-muted bg-foreground px-4 py-2 hover:bg-stone-900 md:block md:px-2"
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <IconContext.Provider value={iconContextValue}>
            <MdArrowDropUp />
          </IconContext.Provider>
        </div>
      </button>
    </div>
  );
};

export default UpButton;
