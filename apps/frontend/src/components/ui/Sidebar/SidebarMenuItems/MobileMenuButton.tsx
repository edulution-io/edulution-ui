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

import React, { useMemo, forwardRef } from 'react';
import { MdMenu } from 'react-icons/md';
import { IconContext } from 'react-icons';
import useSidebarStore from '../useSidebarStore';

const MobileMenuButton = forwardRef<HTMLButtonElement>((_props, ref) => {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebarStore();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  return (
    <div
      className={`fixed right-0 top-0 z-[100] h-fit transform pr-4 pt-4 transition-transform ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-[-200px] delay-75 duration-300' : 'translate-x-0 duration-200 '
      }`}
    >
      <button
        type="button"
        onClick={toggleMobileSidebar}
        ref={ref}
        className="rounded-md border-2 border-black border-opacity-10 bg-black bg-opacity-50"
      >
        <IconContext.Provider value={iconContextValue}>
          <MdMenu />
        </IconContext.Provider>
      </button>
    </div>
  );
});

MobileMenuButton.displayName = 'MobileMenuButton';

export default MobileMenuButton;
