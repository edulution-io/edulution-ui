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

import React, { useCallback } from 'react';
import cn from '@libs/common/utils/className';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import { Button } from '@/components/shared/Button';

interface HourButtonProps {
  hour: number;
  currentHour: number;
  onChangeHour: (hour: number) => void;
  variant: DropdownVariant;
}
const HourButton = ({ hour, currentHour, onChangeHour, variant }: HourButtonProps) => {
  const handleClick = useCallback(() => {
    onChangeHour(hour);
  }, [hour, onChangeHour]);

  return (
    <Button
      variant={currentHour === hour ? 'btn-outline' : 'btn-small'}
      className={cn(
        'aspect-square max-h-[25px] max-w-[64px] shrink-0 sm:w-full',
        variant === 'default' && 'bg-background text-foreground',
        variant === 'dialog' && 'bg-muted text-secondary',
      )}
      onClick={handleClick}
    >
      {hour}
    </Button>
  );
};

export default HourButton;
