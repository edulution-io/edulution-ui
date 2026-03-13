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

import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faBell,
  faClose,
  faEllipsis,
  faGear,
  faIdCard,
  faQrcode,
  faRotateRight,
  faServer,
  faUserPen,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import useSidebarStore from '@/components/ui/Sidebar/useSidebarStore';
import useMenuBarStore from '@/components/shared/useMenuBarStore';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import useNotificationStore from '@/store/useNotificationStore';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';
import NOTIFICATION_COUNTER_VARIANT from '@libs/notification/constants/notificationCounterVariant';
import { MOBILE_TOP_BAR_HEIGHT_PX, SIDEBAR_ICON_WIDTH } from '@libs/ui/constants/sidebar';
import { MobileLogoIcon } from '@/assets/icons';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/Sheet';
import NATIVE_APP_ROUTES from '@libs/common/constants/nativeAppRoutes';
import type NativeAppRoute from '@libs/common/types/nativeAppRoute';
import postNativeAppMessage from '@libs/common/utils/postNativeAppMessage';

interface MobileTopBarProps {
  showLeftButton?: boolean;
  showRightButton?: boolean;
  refreshPage: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ showLeftButton = false, showRightButton = true, refreshPage }) => {
  const { toggleMobileSidebar: onRightButtonClick, isMobileSidebarOpen: isRightMenuOpen } = useSidebarStore();
  const { toggleMobileMenuBar: onLeftButtonClick, isMobileMenuBarOpen: isLeftMenuOpen } = useMenuBarStore();
  const { isEdulutionApp } = usePlatformStore();
  const { unreadCount, setIsSheetOpen } = useNotificationStore();
  const iconClassName = useMemo(() => 'h-6 w-6', []);

  const handleNotificationClick = () => {
    setIsSheetOpen(true);
  };

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const moreActions = useMemo(
    () => [
      { icon: faGear, label: 'Einstellungen', route: NATIVE_APP_ROUTES.SETTINGS },
      { icon: faUserPen, label: 'Profil bearbeiten', route: NATIVE_APP_ROUTES.EDIT_PROFILE },
      { icon: faIdCard, label: 'Ausweis', route: NATIVE_APP_ROUTES.STUDENT_ID },
    ],
    [],
  );

  const handleNativeNavigation = (route: NativeAppRoute) => {
    postNativeAppMessage(route);
    setIsQuickActionsOpen(false);
  };

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
            className="flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faBars}
              className={iconClassName}
            />
          </button>
        ) : (
          <div />
        )}

        {!isAnyMenuOpen && isEdulutionApp && (
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6">
            <button
              type="button"
              onClick={() => handleNativeNavigation(NATIVE_APP_ROUTES.ACCOUNT_SWITCHER)}
              className="flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faUsers}
                className="h-5 w-5 text-background hover:text-muted-foreground"
              />
            </button>
            <button
              type="button"
              onClick={() => handleNativeNavigation(NATIVE_APP_ROUTES.QR_SCANNER)}
              className="flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faQrcode}
                className="h-5 w-5 text-background hover:text-muted-foreground"
              />
            </button>
            <button
              type="button"
              onClick={() => handleNativeNavigation(NATIVE_APP_ROUTES.FILESERVER)}
              className="flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faServer}
                className="h-5 w-5 text-background hover:text-muted-foreground"
              />
            </button>
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(true)}
              className="flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faEllipsis}
                className="h-5 w-5 text-background hover:text-muted-foreground"
              />
            </button>
            <button
              type="button"
              onClick={refreshPage}
              className="flex items-center justify-center"
            >
              <FontAwesomeIcon
                icon={faRotateRight}
                className="h-5 w-5 text-background hover:text-muted-foreground"
              />
            </button>
          </div>
        )}

        {!isAnyMenuOpen ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleNotificationClick}
              className="relative flex items-center justify-center text-background"
            >
              <FontAwesomeIcon
                icon={faBell}
                className="h-5 w-5 hover:text-muted-foreground"
              />
              <NotificationCounter
                count={unreadCount}
                variant={NOTIFICATION_COUNTER_VARIANT.NOTIFICATION_PANEL}
                className="-right-1 -top-1"
              />
            </button>
            {showRightButton && (
              <button
                type="button"
                onClick={onRightButtonClick}
              >
                <MobileLogoIcon
                  className="h-8 w-8"
                  width={SIDEBAR_ICON_WIDTH}
                  aria-label="edulution-mobile-logo"
                />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
      </div>

      {isLeftMenuOpen && (
        <button
          type="button"
          onClick={onLeftButtonClick}
          className="fixed right-4 flex items-center justify-center"
          style={{ top: 0, height: MOBILE_TOP_BAR_HEIGHT_PX }}
        >
          <FontAwesomeIcon
            icon={faClose}
            className={iconClassName}
          />
        </button>
      )}

      {isRightMenuOpen && (
        <button
          type="button"
          onClick={onRightButtonClick}
          className="fixed left-4 flex items-center justify-center"
          style={{ top: 0, height: MOBILE_TOP_BAR_HEIGHT_PX }}
        >
          <FontAwesomeIcon
            icon={faClose}
            className={iconClassName}
          />
        </button>
      )}

      <Sheet
        open={isQuickActionsOpen}
        onOpenChange={setIsQuickActionsOpen}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-8"
        >
          <SheetTitle className="sr-only">Schnellaktionen</SheetTitle>
          <SheetDescription>Schnellaktionen</SheetDescription>
          <div className="grid grid-cols-3 gap-6 pt-4">
            {moreActions.map((action) => (
              <button
                key={action.route}
                type="button"
                onClick={() => handleNativeNavigation(action.route)}
                className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-muted"
              >
                <FontAwesomeIcon
                  icon={action.icon}
                  className="h-6 w-6 text-background"
                />
                <span className="text-xs text-background">{action.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileTopBar;
