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
import NativeAppHeader from '@/components/structure/layout/NativeAppHeader';
import Footer from '@/components/ui/Footer';
import NativeAppHeaderProps from '@libs/ui/types/NativeAppHeaderProps';
import cn from '@libs/common/utils/className';
import { useLocation } from 'react-router-dom';
import FLOATING_BUTTONS_BAR_ID from '@libs/ui/constants/floatingButtonsBarId';
import useUserAccounts from '@/hooks/useUserAccounts';
import { getFromPathName } from '@libs/common/utils';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';

interface AppLayoutProps {
  nativeAppHeader?: NativeAppHeaderProps;
  children: React.ReactNode;
  isFullScreen?: boolean;
}

const PageLayout = ({ nativeAppHeader, children, isFullScreen }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const rootPathName = getFromPathName(pathname, 1);

  useUserAccounts(rootPathName);

  if (isFullScreen) return <main className="flex-1">{children}</main>;

  const isMainPage = pathname === DASHBOARD_ROUTE;

  return (
    <div className={cn('flex h-full w-full flex-col pl-4 pt-4', { 'px-4': isMainPage })}>
      {nativeAppHeader && (
        <NativeAppHeader
          title={nativeAppHeader.title}
          description={nativeAppHeader.description}
          iconSrc={nativeAppHeader.iconSrc}
        />
      )}

      <main
        className={cn('flex flex-1 flex-col overflow-y-auto overflow-x-hidden pl-2 pr-6 scrollbar-thin', {
          'px-4': isMainPage,
        })}
      >
        {children}
      </main>

      <div id={FLOATING_BUTTONS_BAR_ID} />

      <Footer />
    </div>
  );
};

export default PageLayout;
