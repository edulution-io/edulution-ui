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
import { MdClose, MdMenu } from 'react-icons/md';
import { IconContext } from 'react-icons';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import useMenuBarStore from '@/components/shared/useMenuBarStore';
import { MOBILE_TOP_BAR_HEIGHT_PX } from '@libs/ui/constants/sidebar';

interface MobileTopBarProps {
  showLeftButton?: boolean;
  showRightButton?: boolean;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ showLeftButton = false, showRightButton = true }) => {
  const { toggleMobileSidebar: onRightButtonClick, isMobileSidebarOpen: isRightMenuOpen } = useSidebarStore();
  const { toggleMobileMenuBar: onLeftButtonClick, isMobileMenuBarOpen: isLeftMenuOpen } = useMenuBarStore();
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  if (!showLeftButton && !showRightButton) {
    return null;
  }

  const isAnyMenuOpen = isLeftMenuOpen || isRightMenuOpen;

  return (
    <>
      <div
        className="relative z-[2000] flex items-center justify-between px-4"
        style={{ height: MOBILE_TOP_BAR_HEIGHT_PX }}
      >
        {!isAnyMenuOpen && showLeftButton ? (
          <button
            type="button"
            onClick={onLeftButtonClick}
            className="rounded-md border-2 border-black border-opacity-10 bg-black bg-opacity-50"
          >
            <IconContext.Provider value={iconContextValue}>
              <MdMenu />
            </IconContext.Provider>
          </button>
        ) : (
          <div />
        )}

        {!isAnyMenuOpen && showRightButton ? (
          <button
            type="button"
            onClick={onRightButtonClick}
            className="rounded-md border-2 border-black border-opacity-10 bg-black bg-opacity-50"
          >
            <IconContext.Provider value={iconContextValue}>
              <MdMenu />
            </IconContext.Provider>
          </button>
        ) : (
          <div />
        )}
      </div>

      {isLeftMenuOpen && (
        <button
          type="button"
          onClick={onLeftButtonClick}
          className="fixed right-4 top-1 z-[1000] rounded-md border-2 border-black border-opacity-10 bg-black bg-opacity-50"
        >
          <IconContext.Provider value={iconContextValue}>
            <MdClose />
          </IconContext.Provider>
        </button>
      )}

      {isRightMenuOpen && (
        <button
          type="button"
          onClick={onRightButtonClick}
          className="fixed left-4 top-1 z-[1000] rounded-md border-2 border-black border-opacity-10 bg-black bg-opacity-50"
        >
          <IconContext.Provider value={iconContextValue}>
            <MdClose />
          </IconContext.Provider>
        </button>
      )}
    </>
  );
};

export default MobileTopBar;
