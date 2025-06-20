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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/shared/Card';
import { NavLink, useNavigate } from 'react-router-dom';
import useSidebarStore from '@/components/ui/Sidebar/sidebarStore';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import useLanguage from '@/hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import useSidebarItems from '@/hooks/useSidebarItems';
import Input from '@/components/shared/Input';
import isSubsequence from '@libs/common/utils/string/isSubsequence';
import useMedia from '@/hooks/useMedia';
import cn from '@libs/common/utils/className';
import NotificationCounter from '@/components/ui/Sidebar/SidebarMenuItems/NotificationCounter';
import SEARCH_INPUT_LABEL from '@libs/ui/constants/launcherSearchInputLabel';

const LauncherAppGrid = ({ modKeyLabel }: { modKeyLabel: string }) => {
  const { toggleMobileSidebar } = useSidebarStore();
  const { toggleLauncher } = useLauncherStore();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const sidebarItems = useSidebarItems();
  const navigate = useNavigate();
  const { isMobileView, isTabletView } = useMedia();

  const filteredApps = useMemo(() => {
    const searchString = search.trim().toLowerCase();

    if (!searchString) return sidebarItems;

    return sidebarItems.filter((app) => {
      const name = app.title.toLowerCase();

      return isSubsequence(searchString, name);
    });
  }, [sidebarItems, language, search]);

  const onClose = useCallback(() => {
    toggleMobileSidebar();
    toggleLauncher();
  }, [toggleMobileSidebar, toggleLauncher]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.getAttribute('aria-label') === SEARCH_INPUT_LABEL) {
        event.preventDefault();
        onClose();
        if (filteredApps.length > 0) {
          navigate(filteredApps[0].link);
        }
      }
    },
    [filteredApps, navigate, onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <Input
        placeholder={t(SEARCH_INPUT_LABEL)}
        aria-label={SEARCH_INPUT_LABEL}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        variant="dialog"
        className="mx-auto my-3 block w-[80%] min-w-[250px] rounded-xl border border-ring px-3 py-2 md:mb-2 md:mt-0 md:w-[400px]"
      />

      <div
        className="mx-auto grid max-h-[full] w-full grid-cols-[repeat(auto-fit,minmax(8rem,auto))] justify-center
        gap-x-3 gap-y-2 overflow-auto overflow-y-auto pb-10 scrollbar-thin md:max-h-full
        md:w-[95%] md:grid-cols-[repeat(auto-fit,minmax(12rem,auto))] md:gap-x-6 md:gap-y-5 md:pb-4"
      >
        {filteredApps.length ? (
          filteredApps.map((app, index) => (
            <NavLink
              key={app.link}
              to={app.link}
              onClick={onClose}
            >
              <Card
                className={cn(
                  'h-26 relative flex w-full flex-col items-center overflow-hidden border border-muted-light bg-muted-dialog p-5 hover:bg-primary',
                  {
                    'bg-muted': index === 0,
                  },
                )}
                variant="text"
              >
                <img
                  src={app.icon}
                  alt={app.title}
                  className="h-10 w-10 md:h-14 md:w-14"
                />

                <p>{app.title}</p>

                <NotificationCounter
                  count={app.notificationCounter || 0}
                  className="top-[10px]"
                />
              </Card>
            </NavLink>
          ))
        ) : (
          <div className="py-16">{t('launcher.noSearchResults')}</div>
        )}
      </div>

      {!isMobileView && !isTabletView && (
        <div className="text-center text-sm text-muted-foreground">
          <span>{t('launcher.pressShortKey')} </span>
          <span className="ml-0.5 rounded border-2 border-muted-light bg-muted px-1 py-0.5 text-xs">
            {modKeyLabel}
          </span>{' '}
          +<span className="ml-0.5 rounded border-2 border-muted-light bg-muted px-1 py-0.5 text-xs">K</span>
          <span className="ml-8">{t('launcher.pressEnterToStartApp')} </span>
          <span className="ml-0.5 rounded border-2 border-muted-light bg-muted px-1 py-0.5 text-xs">
            {t('enterKey')}
          </span>
        </div>
      )}
    </>
  );
};

export default LauncherAppGrid;
