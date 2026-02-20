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

import React from 'react';
import { Toaster as Sonner } from 'sonner';
import { SHOW_TOASTER_DURATION } from '@libs/ui/constants/showToasterDuration';
import useThemeStore from '@/store/useThemeStore';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      closeButton
      offset={60}
      toastOptions={{
        duration: SHOW_TOASTER_DURATION,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-accent-light group-[.toaster]:border-border group-[.toaster]:shadow-lg [&:has([data-button])]:flex-col [&:has([data-button])]:items-stretch [&_[data-button]]:justify-center [&_[data-action]]:!bg-primary',
          content: 'whitespace-pre-line group-[.toaster]:text-background',
          actionButton: 'w-full',
          cancelButton: 'w-full',
        },
      }}
      richColors
      {...props}
    />
  );
};

export default Toaster;
