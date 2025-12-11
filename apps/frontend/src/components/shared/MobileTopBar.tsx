/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useMemo } from 'react';
import { MdClose, MdMenu, MdRefresh } from 'react-icons/md';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import useMenuBarStore from '@/components/shared/useMenuBarStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import { MOBILE_TOP_BAR_HEIGHT_PX, SIDEBAR_ICON_WIDTH } from '@libs/ui/constants/sidebar';
import { MobileLogoIcon } from '@/assets/icons';

interface MobileTopBarProps {
  showLeftButton?: boolean;
  showRightButton?: boolean;
  refreshPage: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ showLeftButton = false, showRightButton = true, refreshPage }) => {
  const { toggleMobileSidebar: onRightButtonClick, isMobileSidebarOpen: isRightMenuOpen } = useSidebarStore();
  const { toggleMobileMenuBar: onLeftButtonClick, isMobileMenuBarOpen: isLeftMenuOpen } = useMenuBarStore();
  const { isEdulutionApp } = usePlatformStore();
  const iconClassName = useMemo(() => 'h-8 w-8', []);

  if (!showLeftButton && !showRightButton) {
    return null;
  }

  const isAnyMenuOpen = isLeftMenuOpen || isRightMenuOpen;

  return (
    <>
      <div
        className="relative flex items-center justify-between border-b-[1px] border-muted bg-foreground px-4"
        style={{ height: MOBILE_TOP_BAR_HEIGHT_PX }}
      >
        {!isAnyMenuOpen && showLeftButton ? (
          <button
            type="button"
            onClick={onLeftButtonClick}
          >
            <MdMenu className={iconClassName} />
          </button>
        ) : (
          <div />
        )}

        {!isAnyMenuOpen && isEdulutionApp && (
          <button
            type="button"
            onClick={refreshPage}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <MdRefresh className="h-6 w-6 text-muted hover:text-muted-foreground" />
          </button>
        )}

        {!isAnyMenuOpen && showRightButton ? (
          <button
            type="button"
            onClick={onRightButtonClick}
          >
            <MobileLogoIcon
              className={iconClassName}
              width={SIDEBAR_ICON_WIDTH}
              aria-label="edulution-mobile-logo"
            />
          </button>
        ) : (
          <div />
        )}
      </div>

      {isLeftMenuOpen && (
        <button
          type="button"
          onClick={onLeftButtonClick}
          className="fixed right-4 top-1"
        >
          <MdClose className={iconClassName} />
        </button>
      )}

      {isRightMenuOpen && (
        <button
          type="button"
          onClick={onRightButtonClick}
          className="fixed left-4 top-1"
        >
          <MdClose className={iconClassName} />
        </button>
      )}
    </>
  );
};

export default MobileTopBar;
