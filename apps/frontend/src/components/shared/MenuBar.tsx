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

import React, { useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@edulution-io/ui-kit';
import { useOnClickOutside } from 'usehooks-ts';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import useMedia from '@/hooks/useMedia';
import useLanguage from '@/hooks/useLanguage';
import useOrganizationType from '@/hooks/useOrganizationType';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import useSubMenuStore from '@/store/useSubMenuStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import PageTitle from '@/components/PageTitle';
import useMenuBarStore from './useMenuBarStore';
import useMenuBarSelection from './useMenuBarSelection';
import MenuBarHeader from './MenuBarHeader';
import MenuBarItemList from './MenuBarItemList';
import MenuBarFooter from './MenuBarFooter';

const MenuBar: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileMenuBarOpen, toggleMobileMenuBar, closeMobileMenuBar, isCollapsed } = useMenuBarStore();
  const { activeSection } = useSubMenuStore();
  const menubarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const menuBarEntries = useMenuBarConfig();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const { appConfigs } = useAppConfigsStore();
  const { language } = useLanguage();
  const { isSchoolEnvironment } = useOrganizationType();
  const { isMobileView, isTabletView } = useMedia();

  const { pathParts, isSelected, expandedItems, toggleExpanded, getActiveColorClass, activeItem } =
    useMenuBarSelection(menuBarEntries);

  const rootPathName = getFromPathName(pathname, 1);
  const currentAppConfig = findAppConfigByName(appConfigs, rootPathName);
  const isDesktopView = !isMobileView && !isTabletView && !isEdulutionApp;
  const shouldCollapse = isDesktopView && isCollapsed;

  const handleClickOutside = useCallback(() => {
    if ((isMobileView || isTabletView || isEdulutionApp) && isMobileMenuBarOpen) {
      closeMobileMenuBar();
    }
  }, [isMobileView, isTabletView, isEdulutionApp, isMobileMenuBarOpen, closeMobileMenuBar]);

  const handleCloseMobileMenu = useCallback(() => {
    if (isMobileView || isTabletView || isEdulutionApp) toggleMobileMenuBar();
  }, [isMobileView, isTabletView, isEdulutionApp, toggleMobileMenuBar]);

  useOnClickOutside(menubarRef, handleClickOutside);

  if (menuBarEntries.disabled) {
    return null;
  }

  const activeColorClass = getActiveColorClass(menuBarEntries.color);

  const pageTitle = currentAppConfig
    ? getDisplayName(currentAppConfig, language, isSchoolEnvironment)
    : t(`${menuBarEntries.appName}.sidebar`);

  const menuBarContent = (
    <div className="flex h-full max-w-[var(--menubar-max-width)] flex-col">
      <MenuBarHeader
        icon={menuBarEntries.icon}
        title={menuBarEntries.title}
        pathParts={pathParts}
        shouldCollapse={shouldCollapse}
        onHeaderClick={menuBarEntries.onHeaderClick}
      />

      <MenuBarItemList
        menuItems={menuBarEntries.menuItems}
        isSelected={isSelected}
        expandedItems={expandedItems}
        shouldCollapse={shouldCollapse}
        activeColorClass={activeColorClass}
        activeSection={activeSection}
        pathParts={pathParts}
        onToggleExpand={toggleExpanded}
        onCloseMobileMenu={handleCloseMobileMenu}
      />

      <MenuBarFooter
        appName={pathParts[0]}
        isCollapsed={shouldCollapse}
      />
    </div>
  );

  return (
    <>
      {activeItem && (
        <PageTitle
          title={pageTitle}
          translationId={activeItem.label}
          disableTranslation={activeItem.disableTranslation}
        />
      )}

      {isDesktopView ? (
        <aside className="relative flex h-dvh">
          <div
            className={cn(
              'bg-glass h-full overflow-hidden rounded-r-xl shadow-lg shadow-slate-400 backdrop-blur-lg transition-all duration-300',
              shouldCollapse ? 'w-16' : 'w-64',
            )}
          >
            {menuBarContent}
          </div>
          {/* <MenuBarCollapseButton */}
          {/*  isCollapsed={isCollapsed} */}
          {/*  onToggle={toggleCollapsed} */}
          {/* /> */}
        </aside>
      ) : (
        <div
          className={cn(
            'fixed left-0 top-0 z-50 h-full w-full transform transition-transform duration-300 ease-in-out',
            isMobileMenuBarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div
            ref={menubarRef}
            className="bg-glass fixed left-0 h-full w-64 overflow-x-hidden border-r-[1px] border-muted backdrop-blur-md"
          >
            {menuBarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuBar;
