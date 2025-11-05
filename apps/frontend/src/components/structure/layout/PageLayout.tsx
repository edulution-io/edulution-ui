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

import React, { useRef } from 'react';
import NativeAppHeader from '@/components/structure/layout/NativeAppHeader';
import Footer from '@/components/ui/Footer';
import NativeAppHeaderProps from '@libs/ui/types/NativeAppHeaderProps';
import { useLocation } from 'react-router-dom';
import FLOATING_BUTTONS_BAR_ID from '@libs/ui/constants/floatingButtonsBarId';
import useUserAccounts from '@/hooks/useUserAccounts';
import { getFromPathName } from '@libs/common/utils';
import useFloatingBarHeight from '@/hooks/useFloatingBarHeight';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';

interface AppLayoutProps {
  nativeAppHeader?: NativeAppHeaderProps;
  children: React.ReactNode;
  isFullScreen?: boolean;
}

const PageLayout = ({ nativeAppHeader, children, isFullScreen }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const rootPathName = getFromPathName(pathname, 1);
  const barRef = useRef<HTMLDivElement | null>(null);

  useFloatingBarHeight(barRef);
  useUserAccounts(rootPathName);

  if (isFullScreen) return <main className="flex-1">{children}</main>;

  return (
    <div className="relative flex h-full w-full flex-col pl-2 pt-1 md:pl-4 md:pt-1">
      {nativeAppHeader && (
        <NativeAppHeader
          title={nativeAppHeader.title}
          description={nativeAppHeader.description}
          iconSrc={nativeAppHeader.iconSrc}
        />
      )}

      <main
        style={{ marginBottom: 'var(--floating-bar-h, 0px)' }}
        className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pl-2 pr-6 transition-[padding-bottom] duration-200 ease-in-out scrollbar-thin"
      >
        {children}
      </main>

      <div
        id={FLOATING_BUTTONS_BAR_ID}
        ref={barRef}
        className="pointer-events-none absolute bottom-[52px] left-1 right-0 overflow-visible text-background md:bottom-9 md:left-4"
      />

      {!isEdulutionApp && <Footer />}
    </div>
  );
};

export default PageLayout;
