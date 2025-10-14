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
