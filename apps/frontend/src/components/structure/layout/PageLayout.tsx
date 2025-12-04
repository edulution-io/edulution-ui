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
import cn from '@libs/common/utils/className';
import ThemeToggle from './ThemeToggle';

interface PageLayoutProps {
  nativeAppHeader?: NativeAppHeaderProps;
  children: React.ReactNode;
  isFullScreenAppWithoutFloatingButtons?: boolean;
  hasFullWidthMain?: boolean;
}

const PageLayout = ({
  nativeAppHeader,
  children,
  isFullScreenAppWithoutFloatingButtons,
  hasFullWidthMain,
}: PageLayoutProps) => {
  const { pathname } = useLocation();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const rootPathName = getFromPathName(pathname, 1);
  const barRef = useRef<HTMLDivElement | null>(null);

  useFloatingBarHeight(barRef);
  useUserAccounts(rootPathName);

  if (isFullScreenAppWithoutFloatingButtons) return <main className="flex-1">{children}</main>;

  return (
    <div
      id="page"
      className="relative flex h-full w-full flex-col pt-1 md:pt-1"
    >
      {nativeAppHeader && (
        <NativeAppHeader
          title={nativeAppHeader.title}
          description={nativeAppHeader.description}
          iconSrc={nativeAppHeader.iconSrc}
        />
      )}

      <ThemeToggle />

      <main
        style={{ marginBottom: 'var(--floating-bar-h, 0px)' }}
        className={cn('flex flex-1 flex-col overflow-y-auto overflow-x-hidden pl-4 pr-6 md:pl-6', {
          'px-0 md:px-0': hasFullWidthMain,
        })}
      >
        {children}
      </main>

      <div
        id={FLOATING_BUTTONS_BAR_ID}
        ref={barRef}
        className={cn(
          'pointer-events-none absolute left-1 right-0 overflow-visible text-background md:left-4',
          isEdulutionApp ? 'bottom-1' : 'bottom-[24px]',
        )}
      />

      {!isEdulutionApp && <Footer />}
    </div>
  );
};

export default PageLayout;
