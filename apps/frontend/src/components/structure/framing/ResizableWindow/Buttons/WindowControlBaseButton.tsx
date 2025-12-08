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

import React, { FC, ReactNode, useMemo } from 'react';
import cn from '@libs/common/utils/className';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { useTranslation } from 'react-i18next';

interface WindowControlBaseButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  tooltipTranslationId: string;
}

const WindowControlBaseButton: FC<WindowControlBaseButtonProps> = ({
  onClick,
  children,
  className,
  tooltipTranslationId,
}) => {
  const { t } = useTranslation();

  const trigger = useMemo(
    () => (
      <button
        type="button"
        onClick={onClick}
        className={cn('flex h-10 w-16 items-center justify-center p-5 text-sm hover:bg-gray-600', className)}
      >
        {children}
      </button>
    ),
    [onClick, children, className],
  );

  return (
    <ActionTooltip
      trigger={trigger}
      tooltipText={t(tooltipTranslationId)}
      openOnSide="left"
    />
  );
};

export default WindowControlBaseButton;
